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
  physical_location: z.string().max(200).default("Unverified physical location; map placement is illustrative"),
  placement_depth_cm: z.number().finite().min(0).max(300).nullable().default(null),
  verified: z.literal(false).default(false),
  verified_by: z.null().default(null),
  calibration_id: z.string().max(120).nullable().default(null),
});
export type Placement = z.infer<typeof PlacementSchema>;
export function eventIdentity(event: SensorEvent) {
  return event.event_id || JSON.stringify([event.device_id,event.event_type,event.timestamp_utc,event.unit,event.data_mode]);
}
export function freshness(event: SensorEvent | undefined, now: number) {
  if (!event) return "waiting";
  const age = now - Date.parse(event.timestamp_utc);
  return age < -30000 ? "clock" : age > 30000 ? "stale" : "fresh";
}
export class LineDecoder {
  private buffer = "";
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
      .map((line) => {
        try {
          return { event: EventSchema.parse(JSON.parse(line)) };
        } catch {
          return { error: "invalidEvent" };
        }
      });
  }
}
