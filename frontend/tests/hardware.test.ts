import { describe, it, expect } from "vitest";
import {
  EventSchema,
  SessionSchema,
  LineDecoder,
  freshness,
  PlacementSchema,
  eventIdentity,
} from "../src/features/hardware/model";
const event = {
  device_id: "ESP32-01",
  event_type: "temperature",
  timestamp_utc: "2026-11-13T10:00:00Z",
  value: 0,
  unit: "°C",
  quality: "unverified",
  data_mode: "observed" as const,
};
describe("H1 reception", () => {
  it("keeps placement unverified and gives duplicate events stable identities", () => {
    const placement = { deviceId: "SYNTHETIC", areaId: "my-thanh", longitude: 106, latitude: 10, context: "lab" };
    expect(PlacementSchema.parse(placement).verified).toBe(false);
    expect(PlacementSchema.safeParse({ ...placement, verified: true }).success).toBe(false);
    expect(eventIdentity(event)).toBe(eventIdentity({ ...event }));
    expect(eventIdentity(event)).not.toBe(eventIdentity({ ...event, event_type: "other_quantity" }));
  });
  it("retains zero and null without inventing calibration", () => {
    expect(EventSchema.parse(event).value).toBe(0);
    expect(EventSchema.parse({ ...event, value: null }).value).toBeNull();
    expect(EventSchema.parse(event).calibration_id).toBeUndefined();
  });
  it("rejects ambiguous mode, invalid timestamp and nonfinite data", () => {
    for (const change of [
      { data_mode: "live" },
      { timestamp_utc: "today" },
      { value: Infinity },
    ])
      expect(EventSchema.safeParse({ ...event, ...change }).success).toBe(
        false,
      );
  });
  it("reassembles chunked NDJSON and rejects only malformed lines", () => {
    const d = new LineDecoder(),
      text = JSON.stringify(event);
    expect(d.push(text.slice(0, 12))).toEqual([]);
    const rows = d.push(text.slice(12) + "\nnot-json\n");
    expect(rows[0].event?.device_id).toBe("ESP32-01");
    expect(rows[1].error).toBe("invalidEvent");
  });
  it("bounds unterminated frames", () =>
    expect(() => new LineDecoder().push("x".repeat(65537))).toThrow());
  it("distinguishes fresh stale and clock errors", () => {
    const time = Date.parse(event.timestamp_utc);
    expect(freshness(event, time + 1000)).toBe("fresh");
    expect(freshness(event, time + 31000)).toBe("stale");
    expect(freshness(event, time - 60000)).toBe("clock");
    expect(freshness(undefined, time)).toBe("waiting");
  });
  it("validates replay envelopes without changing original data mode", () => {
    const s = SessionSchema.parse({ version: 1, name: "lab", events: [event] });
    expect(s.events[0].data_mode).toBe("observed");
    expect(
      SessionSchema.safeParse({ version: 1, name: "bad", events: [] }).success,
    ).toBe(false);
  });
});
