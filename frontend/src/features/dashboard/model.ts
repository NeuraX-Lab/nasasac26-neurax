import { z } from "zod";
import { GeometrySchema } from "../../core/contracts/geometry";
import {
  RunSchema,
  materialKey,
  type Draft,
  type AnalysisRun,
} from "../analysis/contracts";
import type { Geometry } from "../../core/contracts";
import { ResearchInferenceSchema } from "../analysis/ResearchInference";

export const PIN = "02e3de3f0ac2883f29e19183524c4c767de7c5b8";
export { OverviewSchema, type Overview } from "./climate-contracts";
import { OverviewSchema } from "./climate-contracts";
import { V2Record, farmV2, validateV2 } from "./v2";
import { V4Record, farmV4, validateV4 } from "./v4";
export const DraftSchema = z.object({
  year: z.number().int().min(1981).max(2100),
  source_mode: z.enum(["prefer_cache", "live", "offline"]),
  farm: z.object({
    current_crop: z.string().nullable(),
    previous_crop: z.string().nullable(),
    season: z.string().nullable(),
    irrigation_access: z
      .enum(["available", "limited", "unavailable"])
      .nullable(),
    drainage_condition: z.enum(["good", "poor"]).nullable(),
    goal: z.enum(["water", "soil", "income", "explore"]),
    waterlogging_history: z.string().nullable(),
    management_plan: z.string().nullable(),
  }),
});
export const PlanSchema = z.object({
  v4: V4Record.nullable().optional(),
  v2: V2Record.nullable().optional(),
  researchResult: ResearchInferenceSchema.nullable().optional(),
  version: z.literal("agrotwin-draft-2"),
  id: z.string(),
  name: z.string(),
  savedAt: z.iso.datetime(),
  geometry: GeometrySchema,
  draft: DraftSchema,
  key: z.string(),
  chosen: z.string(),
  run: RunSchema,
  climateSnapshot: OverviewSchema.nullable(),
  climateSourcePin: z.literal(PIN),
  tasks: z.array(z.string()),
});
export type Plan = z.infer<typeof PlanSchema>;
export function runMatches(
  run: AnalysisRun,
  id: string,
  geometry: Geometry,
  draft: Draft,
) {
  const expectedId = id === "my-thanh" ? "MT-BLOCK-01" : id;
  const period = run.inputs.period as
    { start?: string; end?: string } | undefined;
  const farm = run.inputs.farm as Record<string, unknown> | undefined;
  return (
    run.inputs.aoi_id === expectedId &&
    run.a1.data_mode !== "synthetic" &&
    JSON.stringify(run.inputs.geometry.features.map((f) => f.geometry)) ===
      JSON.stringify(geometry.features.map((f) => f.geometry)) &&
    period?.start === `${draft.year}-01-01` &&
    period?.end === `${draft.year + 1}-01-01` &&
    !!farm &&
    Object.entries(draft.farm).every(([k, v]) => farm[k] === v)
  );
}
export function readPlan(raw: string | null): Plan | null {
  try {
    const p = PlanSchema.parse(JSON.parse(raw || "null"));
    if (
      p.key !== materialKey(p.geometry, p.draft) ||
      !runMatches(p.run, p.id, p.geometry, p.draft) ||
      !p.run.sidecar.catalog_supported ||
      !p.run.a1.results.some((r) => r.strategy_id === p.chosen)
    )
      return null;
    if (p.climateSnapshot && p.id !== "my-thanh") return null;
    if (
      p.v2 &&
      (p.id !== "my-thanh" ||
        p.v2.key !== p.key ||
        JSON.stringify(p.v2.request.farm) !== JSON.stringify(farmV2(p.draft)))
    )
      return null;
    if (p.v2) validateV2(p.v2.response, p.v2.request, p.key);
    if (p.v4) {
      if (
        p.id !== "my-thanh" ||
        p.v4.key !== p.key ||
        JSON.stringify(p.v4.request.farm) !== JSON.stringify(farmV4(p.draft))
      )
        return null;
      validateV4(p.v4.response, p.v4.request, p.key);
    }
    if (
      p.researchResult &&
      (p.id !== "my-thanh" ||
        p.researchResult.geometry_hash !== p.run.sidecar.geometry_hash)
    )
      return null;
    return p;
  } catch {
    return null;
  }
}
export function seasonMonths(season: string | null): number[] {
  if (!season) return [];
  const [start, end] = season.split(" / ");
  if (!/^\d{4}-\d{2}$/.test(start) || !/^\d{4}-\d{2}$/.test(end) || end < start)
    return [];
  const a = Number(start.slice(0, 4)) * 12 + Number(start.slice(5)) - 1,
    b = Number(end.slice(0, 4)) * 12 + Number(end.slice(5)) - 1;
  return [
    ...new Set(
      Array.from(
        { length: Math.min(b - a + 1, 12) },
        (_, i) => ((a + i) % 12) + 1,
      ),
    ),
  ];
}
export function withinSeason(date: string, season: string | null) {
  const [start, end] = season?.split(" / ") || [];
  return (
    !!start && !!end && date.slice(0, 7) >= start && date.slice(0, 7) <= end
  );
}
export function pointInside(point: number[], geometry: Geometry) {
  const ring = geometry.features[0]?.geometry.coordinates[0] || [];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i],
      b = ring[j];
    if (
      a[1] > point[1] !== b[1] > point[1] &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
