import { z } from "zod";
export const EventSchema = z.object({
  event_id: z.string().min(1).max(120).optional(),
  device_id: z.string().min(1).max(64),
  event_type: z.string().min(1).max(64),
  timestamp_utc: z.string().datetime({ offset: true }),
  value: z.number().finite().nullable(),
  unit: z.string().max(40).nullable(),
  quality: z.string().max(30).default("unverified"),
  data_mode: z.enum(["simulated", "observed", "replay"]),
  delivery_mode: z.enum(["live", "replay"]).optional(),
  calibration_id: z.string().nullable().optional(),
  source_context: z.string().max(200).optional(),
  // Assigned by the receiving transport, never trusted from a serial payload.
  source_transport: z.enum(["REAL_USB", "REPLAY", "SYNTHETIC"]).optional(),
  received_at: z.string().datetime({ offset: true }).optional(),
  timestamp_basis: z
    .enum(["device_unverified", "device", "host_received"])
    .optional(),
});
export type SensorEvent = z.infer<typeof EventSchema>;
export const SessionSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1).max(100),
  events: z.array(EventSchema).min(1).max(10000),
});
export type Session = z.infer<typeof SessionSchema>;
export const PlacementSchema = z.object({
  deviceId: z.string(),
  areaId: z.string(),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-85).max(85),
  context: z.enum(["field", "lab", "synthetic"]),
  deployment_id: z.string().max(120).nullable().default(null),
  physical_location: z
    .string()
    .max(200)
    .default("Unverified physical location; map placement is illustrative"),
  placement_depth_cm: z
    .number()
    .finite()
    .min(0)
    .max(300)
    .nullable()
    .default(null),
  verified: z.literal(false).default(false),
  verified_by: z.null().default(null),
  calibration_id: z.string().max(120).nullable().default(null),
});
export type Placement = z.infer<typeof PlacementSchema>;
export function eventIdentity(event: SensorEvent) {
  return (
    (event.event_id
      ? JSON.stringify([event.device_id, event.event_id])
      : null) ||
    JSON.stringify([
      event.device_id,
      event.event_type,
      event.timestamp_utc,
      event.unit,
      event.data_mode,
    ])
  );
}
export function freshness(event: SensorEvent | undefined, now: number) {
  if (!event) return "waiting";
  const age =
    now -
    Date.parse(
      event.timestamp_basis !== "device" && event.received_at
        ? event.received_at
        : event.timestamp_utc,
    );
  return age < -30000 ? "clock" : age > 30000 ? "stale" : "fresh";
}
export function quantity(event: SensorEvent) {
  const aliases: Record<string, [string, string[]]> = {
    air_temperature: ["air_temperature", ["°C", "degC", "C"]],
    temperature: ["air_temperature", ["°C", "degC", "C"]],
    air_humidity: ["air_humidity", ["%RH", "%", "percent"]],
    relative_humidity: ["air_humidity", ["%RH", "%", "percent"]],
    humidity: ["air_humidity", ["%RH", "%", "percent"]],
    air_rh: ["air_humidity", ["%RH", "%", "percent"]],
    raw_adc: ["raw_adc", ["ADC", "adc", "raw", "counts"]],
    soil_adc: ["raw_adc", ["ADC", "adc", "raw", "counts"]],
    soil_moisture_adc: ["raw_adc", ["ADC", "adc", "raw", "counts"]],
    soil_moisture: ["raw_adc", ["ADC", "adc", "raw", "counts"]],
  };
  const match = aliases[event.event_type];
  return match?.[1].includes(event.unit || "") ? match[0] : null;
}
export function validReading(event: SensorEvent) {
  const q = quantity(event),
    v = event.value;
  if (v === null) return true; // A missing reading stays missing.
  if (q === "air_humidity") return v >= 0 && v <= 100;
  if (q === "air_temperature") return v >= -273.15; // Physical bound, not a sensor specification.
  if (q === "raw_adc") return Number.isInteger(v) && v >= 0; // No assumed ADC bit depth.
  return true;
}
export function latestReading(events: SensorEvent[]) {
  return events.reduce<SensorEvent | undefined>(
    (last, e) =>
      !last || Date.parse(e.timestamp_utc) >= Date.parse(last.timestamp_utc)
        ? e
        : last,
    undefined,
  );
}
export function h1Event(e: SensorEvent) {
  const q = quantity(e);
  // Explicit A1/H1 boundary: do not send transport fields or unverified clock as UTC.
  return {
    ...(e.event_id ? { event_id: e.event_id } : {}),
    device_id: e.device_id,
    event_type: q || e.event_type,
    timestamp_utc: e.timestamp_utc,
    value: e.value,
    unit:
      q === "air_temperature"
        ? "°C"
        : q === "air_humidity"
          ? "%RH"
          : q === "raw_adc"
            ? "ADC"
            : e.unit,
    quality: e.quality,
    data_mode: e.data_mode,
    delivery_mode: e.delivery_mode,
    ...(e.calibration_id ? { calibration_id: e.calibration_id } : {}),
    source_context: e.source_context,
  };
}
// Firmware text v1, supplied by the owner. Not a general log-to-number parser.
// The MCU supplies no identity or clock in this format; both are explicit host metadata.
export function benchTextEvents(
  line: string,
  receivedAt: string,
): SensorEvent[] {
  const soil = /^Do am dat: -?\d+(?:\.\d+)?% \(Raw ADC: (\d+)\)$/.exec(
    line.trim(),
  );
  const air =
    /^Nhiet do KK: (-?\d+(?:\.\d+)?) C \| Do am KK: (-?\d+(?:\.\d+)?) %$/.exec(
      line.trim(),
    );
  const base = {
    device_id: "USB-UART-unidentified",
    timestamp_utc: receivedAt,
    received_at: receivedAt,
    timestamp_basis: "host_received" as const,
    quality: "unverified",
    data_mode: "observed" as const,
    source_context:
      "Bench text v1; host-assigned device ID; measurement time and field location unknown",
  };
  if (soil)
    return [
      { ...base, event_type: "raw_adc", value: Number(soil[1]), unit: "ADC" },
    ];
  if (air)
    return [
      {
        ...base,
        event_type: "air_temperature",
        value: Number(air[1]),
        unit: "°C",
      },
      {
        ...base,
        event_type: "air_humidity",
        value: Number(air[2]),
        unit: "%RH",
      },
    ];
  return [];
}
export class LineDecoder {
  private buffer = "";
  constructor(private benchText = false) {}
  push(chunk: string) {
    this.buffer += chunk;
    if (this.buffer.length > 65536) {
      this.buffer = "";
      throw Error("lineTooLong");
    }
    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop() || "";
    return lines
      .filter((x) => x.trim())
      .flatMap(
        (
          line,
        ): { event?: SensorEvent; error?: string; diagnostic?: string }[] => {
          try {
            const parsed = EventSchema.parse(JSON.parse(line));
            const event: SensorEvent = {
              ...parsed,
              source_transport: undefined,
              received_at: undefined,
              timestamp_basis: "device_unverified",
            };
            return [
              validReading(event) ? { event } : { error: "invalidEvent" },
            ];
          } catch {
            if (this.benchText) {
              const events = benchTextEvents(line, new Date().toISOString());
              if (events.length)
                return events.map((event) =>
                  validReading(event) ? { event } : { error: "invalidEvent" },
                );
              if (
                /^(?:ESP-ROM:|Build:|rst:|SPIWP:|mode:|load:|entry |=== KHOI DONG|\[LOI\]|\[OK\]|-{5,}|\/\/)/.test(
                  line.trim(),
                )
              )
                return [{ diagnostic: line.trim().slice(0, 300) }];
            }
            return [{ error: "invalidEvent" }];
          }
        },
      );
  }
}
