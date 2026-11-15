import { describe, it, expect } from "vitest";
import {
  benchTextEvents,
  LineDecoder,
  freshness,
  latestReading,
  h1Event,
  quantity,
  validReading,
  eventIdentity,
} from "../src/features/hardware/model";
const time = "2026-11-15T03:00:00Z";
describe("Sprint 3A software contract (not physical hardware evidence)", () => {
  it("maps owner-supplied bench text without using uncalibrated soil percentage", () => {
    const [soil] = benchTextEvents("Do am dat: 38.0% (Raw ADC: 3086)", time);
    expect(soil.value).toBe(3086);
    expect(quantity(soil)).toBe("raw_adc");
    expect(soil.timestamp_basis).toBe("host_received");
    const air = benchTextEvents(
      "Nhiet do KK: 24.63 C | Do am KK: 47.39 %",
      time,
    );
    expect(air.map((e) => [e.event_type, e.value, e.unit])).toEqual([
      ["air_temperature", 24.63, "°C"],
      ["air_humidity", 47.39, "%RH"],
    ]);
    expect(air.every((e) => e.device_id === soil.device_id)).toBe(true);
    expect(eventIdentity({ ...soil, event_id: "1" })).not.toBe(
      eventIdentity({ ...soil, event_id: "1", device_id: "another-device" }),
    );
    expect(benchTextEvents("temperature 88", time)).toEqual([]);
  });
  it("separates boot diagnostics, partial UTF-8 lines and invalid packets", () => {
    const d = new LineDecoder(true);
    expect(
      d.push("[LOI] Khong tim thay cam bien GY-21!\r\n")[0].diagnostic,
    ).toContain("GY-21");
    expect(d.push("Nhiet do KK: 24.63 C |")).toEqual([]);
    const result = d.push(" Do am KK: 101 %\r\n");
    expect(result[0].event?.value).toBe(24.63);
    expect(result[1].error).toBe("invalidEvent");
    expect(d.push("garbage\n")[0].error).toBe("invalidEvent");
  });
  it("preserves clocks, null and zero; does not let older arrivals replace newer measurements", () => {
    const [e] = benchTextEvents("Do am dat: 0.0% (Raw ADC: 0)", time);
    expect(validReading(e)).toBe(true);
    expect(validReading({ ...e, value: -1 })).toBe(false);
    expect(validReading({ ...e, value: null })).toBe(true);
    expect(
      freshness(
        { ...e, timestamp_utc: "2000-01-01T00:00:00Z" },
        Date.parse(time) + 1000,
      ),
    ).toBe("fresh");
    expect(freshness(e, Date.parse(time) + 31000)).toBe("stale");
    expect(
      latestReading([e, { ...e, timestamp_utc: "2000-01-01T00:00:00Z" }]),
    ).toEqual(e);
  });
  it("maps H1 aliases explicitly and retains replay policy without transport extras", () => {
    const [e] = benchTextEvents("Do am dat: 0.0% (Raw ADC: 3086)", time);
    const result = h1Event({
      ...e,
      event_type: "soil_adc",
      delivery_mode: "replay",
      source_transport: "REPLAY",
    });
    expect(result.event_type).toBe("raw_adc");
    expect(result.delivery_mode).toBe("replay");
    expect(result).not.toHaveProperty("source_transport");
    expect(
      quantity({ ...e, event_type: "soil_moisture", unit: "%" }),
    ).toBeNull();
  });
});
