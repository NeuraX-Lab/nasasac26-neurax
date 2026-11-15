import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Geometry } from "../../core/contracts";
import {
  analysisBody,
  initialDraft,
  materialKey,
  RunSchema,
  type AnalysisRun,
  type Draft,
} from "./contracts";
import { runMatches } from "../dashboard/model";

type Record = { key: string; run: AnalysisRun };
type State = {
  drafts: { [id: string]: Draft };
  records: { [id: string]: Record };
  history: AnalysisRun[];
  choices: { [id: string]: string };
  choose: (id: string, choice: string) => void;
  restore: (id: string, draft: Draft, run: AnalysisRun) => void;
  running: string | null;
  error: string;
  setDraft: (id: string, draft: Draft) => void;
  execute: (id: string, geometry: Geometry, draft: Draft) => Promise<boolean>;
  cancel: () => void;
};
const Context = createContext<State>(null!);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<State["drafts"]>({});
  const [records, setRecords] = useState<State["records"]>({});
  const [history, setHistory] = useState<AnalysisRun[]>([]);
  const [choices, setChoices] = useState<State["choices"]>({});
  const [running, setRunning] = useState<string | null>(null),
    [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null),
    generation = useRef(0);
  function cancel() {
    generation.current++;
    controller.current?.abort();
    controller.current = null;
    setRunning(null);
  }
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/analysis/my-thanh.saved.json", { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw Error("Saved analysis unavailable");
        return r.json();
      })
      .then((raw) => {
        const run = RunSchema.parse(raw);
        const geometry = run.inputs.geometry as Geometry;
        setRecords((old) =>
          old["my-thanh"]
            ? old
            : {
                ...old,
                "my-thanh": { key: materialKey(geometry, initialDraft), run },
              },
        );
        setHistory((old) =>
          old.some((x) => x.a1.run_id === run.a1.run_id)
            ? old
            : [run, ...old].slice(0, 10),
        );
      })
      .catch(() => {
        /* Analysis button still works; no synthetic substitution. */
      });
    return () => {
      ctrl.abort();
      controller.current?.abort();
    };
  }, []);
  async function execute(id: string, geometry: Geometry, draft: Draft) {
    cancel();
    const token = generation.current,
      ctrl = new AbortController();
    controller.current = ctrl;
    setRunning(id);
    setError("");
    const key = materialKey(geometry, draft),
      timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      const response = await fetch("/api/v1/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisBody(id, geometry, draft)),
        signal: ctrl.signal,
      });
      if (!response.ok)
        throw Error(
          `Analysis HTTP ${response.status}: ${(await response.text()).slice(0, 180)}`,
        );
      const run = RunSchema.parse(await response.json());
      if (token !== generation.current) return false;
      if (!runMatches(run, id, geometry, draft))
        throw Error("Response does not match the requested field and inputs");
      setRecords((old) => ({ ...old, [id]: { key, run } }));
      setHistory((old) =>
        [run, ...old.filter((x) => x.a1.run_id !== run.a1.run_id)].slice(0, 10),
      );
      return true;
    } catch (e) {
      if (token !== generation.current) return false;
      const saved = records[id];
      if (saved?.key === key) {
        const run = structuredClone(saved.run);
        run.sidecar.execution_mode = "offline";
        run.sidecar.cache_hit = true;
        run.sidecar.acquisition_warnings = [
          "API unavailable; displaying the matching saved analysis. No new computation.",
        ];
        setRecords((old) => ({ ...old, [id]: { key, run } }));
      }
      setError(e instanceof Error ? e.message : "Analysis unavailable");
      return false;
    } finally {
      clearTimeout(timer);
      if (token === generation.current) setRunning(null);
    }
  }
  return (
    <Context.Provider
      value={{
        drafts,
        records,
        history,
        running,
        error,
        execute,
        cancel,
        choices,
        choose: (id, choice) => setChoices((old) => ({ ...old, [id]: choice })),
        restore: (id, draft, run) => {
          cancel();
          setError("");
          setDrafts((old) => ({ ...old, [id]: draft }));
          setRecords((old) => ({
            ...old,
            [id]: { key: materialKey(run.inputs.geometry, draft), run },
          }));
        },
        setDraft: (id, draft) => {
          cancel();
          setError("");
          setDrafts((old) => ({ ...old, [id]: draft }));
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAnalysis = () => useContext(Context);
