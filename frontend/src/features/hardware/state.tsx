import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  EventSchema,
  SessionSchema,
  PlacementSchema,
  eventIdentity,
  LineDecoder,
  type SensorEvent,
  type Session,
  type Placement,
} from "./model";
type Port = {
  readable: ReadableStream<Uint8Array> | null;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
};
type Serial = { requestPort: () => Promise<Port> };
type State = {
  events: SensorEvent[];
  status: "disconnected" | "connecting" | "connected" | "replay" | "synthetic";
  error: string;
  rejected: number;
  recording: boolean;
  recorded: number;
  sessions: Session[];
  placements: Placement[];
  connect: (baud: number) => Promise<void>;
  disconnect: () => Promise<void>;
  demo: () => Promise<void>;
  replay: (s: Session) => Promise<void>;
  record: () => void;
  save: () => void;
  importSession: (v: unknown) => void;
  place: (p: Placement) => void;
  clear: () => void;
};
const Context = createContext<State>(null!);
export function HardwareProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<SensorEvent[]>([]),
    [status, setStatus] = useState<State["status"]>("disconnected"),
    [error, setError] = useState(""),
    [rejected, setRejected] = useState(0),
    [recording, setRecording] = useState(false),
    [recorded, setRecorded] = useState(0),
    [sessions, setSessions] = useState<Session[]>(() => {
      try {
        return SessionSchema.array().parse(
          JSON.parse(localStorage.getItem("agrotwin-sessions") || "[]"),
        );
      } catch {
        return [];
      }
    }),
    [placements, setPlacements] = useState<Placement[]>(() => {
      try {
        return PlacementSchema.array().parse(
          JSON.parse(localStorage.getItem("agrotwin-placements") || "[]"),
        );
      } catch {
        return [];
      }
    });
  const port = useRef<Port | null>(null),
    reader = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null),
    timer = useRef<ReturnType<typeof setInterval> | null>(null),
    generation = useRef(0),
    recordingRef = useRef(false),
    buffer = useRef<SensorEvent[]>([]),
    closing = useRef<Promise<void> | null>(null),
    seen = useRef(new Set<string>());
  function accept(e: SensorEvent) {
    const identity = eventIdentity(e);
    if (seen.current.has(identity)) { setRejected(n => n + 1); return; }
    seen.current.add(identity);
    if (seen.current.size > 10000) seen.current.delete(seen.current.values().next().value!);
    setEvents((old) => [...old, e].slice(-600));
    if (recordingRef.current) {
      if (buffer.current.length >= 10000) {
        recordingRef.current = false;
        setError("recordLimit");
        return;
      }
      buffer.current.push(e);
      setRecorded(buffer.current.length);
    }
  }
  async function disconnect() {
    seen.current.clear();
    generation.current++;
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (closing.current) await closing.current;
    const r = reader.current;
    reader.current = null;
    const p = port.current;
    port.current = null;
    closing.current = (async () => {
      try {
        await r?.cancel();
      } catch {
        /* already detached */
      }
      try {
        await p?.close();
      } catch {
        /* reader finally releases below */
      }
    })();
    await closing.current;
    closing.current = null;
    setStatus("disconnected");
  }
  async function connect(baud: number) {
    await disconnect();
    setError("");
    const api = (navigator as Navigator & { serial?: Serial }).serial;
    if (!api) {
      setError("serialUnsupported");
      return;
    }
    setStatus("connecting");
    const token = ++generation.current;
    let p: Port | undefined;
    try {
      p = await api.requestPort();
      if (token !== generation.current) return;
      await p.open({ baudRate: baud });
      if (token !== generation.current) {
        await p.close();
        return;
      }
      port.current = p;
      setEvents([]);
      setStatus("connected");
      if (!p.readable) throw Error("No stream");
      const r = p.readable.getReader();
      reader.current = r;
      const decoder = new TextDecoder(),
        lines = new LineDecoder();
      try {
        while (token === generation.current) {
          const { done, value } = await r.read();
          if (done) break;
          try {
            for (const item of lines.push(
              decoder.decode(value, { stream: true }),
            )) {
              if (item.event) accept(item.event);
              else setRejected((n) => n + 1);
            }
          } catch {
            setRejected((n) => n + 1);
            setError("lineTooLong");
          }
        }
      } finally {
        r.releaseLock();
        if (reader.current === r) reader.current = null;
        try {
          await p.close();
        } catch {
          /* removed */
        }
      }
      if (token === generation.current) setStatus("disconnected");
    } catch {
      if (token === generation.current) {
        setError("connectionFailed");
        setStatus("disconnected");
      }
      try {
        await p?.close();
      } catch {
        /* closed */
      }
    }
  }
  async function demo() {
    await disconnect();
    setEvents([]);
    setError("");
    setStatus("synthetic");
    let n = 0;
    const tick = () => {
      accept({
        device_id: "DEMO-NODE-01",
        event_type: "air_temperature",
        timestamp_utc: new Date().toISOString(),
        value: Math.round((28 + Math.sin(n++ / 5)) * 10) / 10,
        unit: "°C",
        quality: "synthetic",
        data_mode: "simulated",
        source_context: "Synthetic UI demonstration; not a field measurement",
      });
    };
    tick();
    timer.current = setInterval(tick, 1000);
  }
  async function replay(s: Session) {
    await disconnect();
    setEvents([]);
    setError("");
    setStatus("replay");
    let n = 0;
    timer.current = setInterval(() => {
      if (n >= s.events.length) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setStatus("disconnected");
        return;
      }
      accept({ ...s.events[n++], delivery_mode: "replay" });
    }, 500);
  }
  function persist(next: Session[]) {
    try {
      localStorage.setItem("agrotwin-sessions", JSON.stringify(next));
      setSessions(next);
    } catch {
      setError("storageError");
    }
  }
  function save() {
    recordingRef.current = false;
    setRecording(false);
    if (buffer.current.length)
      persist(
        [
          ...sessions,
          {
            version: 1 as const,
            name: new Date().toISOString(),
            events: [...buffer.current],
          },
        ].slice(-10),
      );
  }
  useEffect(
    () => () => {
      generation.current++;
      if (timer.current) clearInterval(timer.current);
      void reader.current?.cancel().catch(() => {});
      void port.current?.close().catch(() => {});
    },
    [],
  );
  return (
    <Context.Provider
      value={{
        events,
        status,
        error,
        rejected,
        recording,
        recorded,
        sessions,
        placements,
        connect,
        disconnect,
        demo,
        replay,
        record: () => {
          buffer.current = [];
          setRecorded(0);
          recordingRef.current = true;
          setRecording(true);
        },
        save,
        importSession: (v) => {
          try {
            const s = SessionSchema.parse(v);
            persist([...sessions, s].slice(-10));
            setError("");
          } catch {
            setError("invalidSession");
          }
        },
        place: (p) => {
          const checked = PlacementSchema.parse(p);
          const next = [
            ...placements.filter((x) => x.deviceId !== p.deviceId),
            checked,
          ];
          try {
            localStorage.setItem("agrotwin-placements", JSON.stringify(next));
            setPlacements(next);
          } catch {
            setError("storageError");
          }
        },
        clear: () => {
          seen.current.clear();
          setEvents([]);
          setRejected(0);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useHardware = () => useContext(Context);
export { EventSchema };
