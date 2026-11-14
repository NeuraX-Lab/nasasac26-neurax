import { z } from "zod";
import { GeometrySchema } from "./geometry";
import type { Geometry } from "./geometry";
export type { Geometry } from "./geometry";
export const MonthSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rain: z.number().finite().nullable(),
  temp: z.number().finite().nullable(),
  coverage: z.number().min(0).max(1),
  qa: z.enum(["pass", "warn", "fail"]),
});
export const BundleSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  dataMode: z.enum(["observed", "synthetic", "mixed"]),
  datasetVersion: z.string(),
  runId: z.string(),
  months: z.array(MonthSchema),
  source: z.object({
    provider: z.string(),
    url: z.string().nullable(),
    kind: z.string(),
    retrievedAt: z.string(),
    sourceSha256: z.string().nullable(),
    featuresSha256: z.string().nullable(),
    flags: z.array(
      z.object({ date: z.string(), value: z.number(), unit: z.string() }),
    ),
    units: z.object({ rain: z.string(), temp: z.string() }),
    nativeResolution: z.string(),
    validation: z.string(),
  }),
  geometry: GeometrySchema,
  imagery: z.object({
    extent: z.object({
      xmin: z.number(),
      ymin: z.number(),
      xmax: z.number(),
      ymax: z.number(),
    }),
  }),
  a1: z.null(),
  e1: z.null(),
  h1: z.null(),
});
export type Month = z.infer<typeof MonthSchema>;
export type Bundle = z.infer<typeof BundleSchema>;

export type Area = {
  id: string;
  name: string;
  geometry: Geometry;
  createdAt: string;
  group?: string;
};
export type Preferences = {
  environment: "research" | "sandbox";
  year: string;
  selected: string;
  rainDelta: number;
  tempDelta: number;
};
export const emptyGeometry: Geometry = {
  type: "FeatureCollection",
  features: [],
};
