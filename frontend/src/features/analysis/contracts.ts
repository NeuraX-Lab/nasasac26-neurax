import { z } from "zod";
import type { Geometry } from "../../core/contracts";
import { GeometrySchema } from "../../core/contracts/geometry";

const CriterionSchema = z
  .object({
    criterion_id: z.string(),
    kind: z.string(),
    status: z.enum(["pass", "fail", "needs_review"]),
    inputs: z.record(z.string(), z.unknown()),
    missing_inputs: z.array(z.string()),
    evidence_ids: z.array(z.string()),
    reason: z.string(),
    limitation: z.string(),
    approval_state: z.string().optional(),
    statement: z.string().optional(),
  })
  .passthrough();
export const RunSchema = z
  .object({
    a1: z
      .object({
        schema_version: z.literal("0.1-proposal"),
        run_id: z.string().regex(/^a1-[a-f0-9]{24}$/),
        status: z.enum(["ok", "partial", "unavailable"]),
        data_mode: z.enum(["observed", "mixed", "synthetic"]),
        generated_at: z.string(),
        data_as_of: z.string().nullable(),
        result_kind: z.enum(["analysis", "forecast", "scenario"]),
        warnings: z.array(z.string()),
        forecast: z.null(),
        results: z.array(
          z
            .object({
              strategy_id: z.string(),
              is_current: z.boolean().nullable(),
              reference_kind: z.string(),
              seasons: z.array(
                z.object({
                  season_index: z.number(),
                  crop_id: z.string(),
                  calendar_window: z.string().nullable(),
                }),
              ),
              eligibility: z.enum(["eligible", "ineligible", "needs_review"]),
              score: z.number().finite().nullable(),
              criteria: z.array(CriterionSchema),
              reasons: z.array(z.string()),
              risks: z.array(z.string()),
              missing_inputs: z.array(z.string()),
              evidence_ids: z.array(z.string()),
            })
            .passthrough(),
        ),
      })
      .passthrough(),
    sidecar: z
      .object({
        schema_version: z.literal("agrotwin-orchestration-1"),
        input_hash: z.string(),
        geometry_hash: z.string(),
        computed_at: z.string(),
        observed_period: z.object({ start: z.string(), end: z.string() }),
        retrieved_at: z.string().nullable(),
        source_sha256: z.string().nullable(),
        K1_version: z.string(),
        scientific_payload_sha256: z.string(),
        execution_mode: z.enum(["computed", "cached", "offline"]),
        cache_hit: z.boolean(),
        source_acquisition: z.string(),
        catalog_supported: z.boolean(),
        acquisition_warnings: z.array(z.string()).optional(),
      })
      .passthrough(),
    q1: z
      .object({
        status: z.enum(["pass", "warn", "fail"]),
        independent_approval: z.boolean(),
        scope: z.string(),
      })
      .passthrough(),
    next_actions: z.array(
      z.object({ input: z.string(), action: z.string(), owner: z.string() }),
    ),
    climate: z.array(
      z
        .object({
          date: z.string(),
          rain: z.number().finite().nullable(),
          temp: z.number().finite().nullable(),
          coverage: z.number(),
          qa: z.enum(["pass", "warn", "fail"]),
        })
        .passthrough(),
    ),
    inputs: z.object({ geometry: GeometrySchema }).passthrough(),
    sources: z.array(
      z
        .object({
          id: z.string(),
          url: z
            .string()
            .url()
            .refine((s) => /^https?:\/\//.test(s))
            .nullable()
            .optional(),
          evidence_class: z.string(),
        })
        .passthrough(),
    ),
    geometry: z
      .object({
        geometry_hash: z.string(),
        area_ha: z.number(),
        scope: z.string(),
      })
      .passthrough(),
  })
  .passthrough();
export type AnalysisRun = z.infer<typeof RunSchema>;
export type FarmDraft = {
  previous_crop: string | null;
  current_crop: string | null;
  season: string | null;
  irrigation_access: "available" | "limited" | "unavailable" | null;
  drainage_condition: "good" | "poor" | null;
  waterlogging_history: string | null;
  management_plan: string | null;
  goal: "water" | "soil" | "income" | "explore";
};
export type Draft = {
  year: number;
  farm: FarmDraft;
  source_mode: "prefer_cache" | "live" | "offline";
};
export const initialDraft: Draft = {
  year: 2025,
  source_mode: "prefer_cache",
  farm: {
    previous_crop: null,
    current_crop: null,
    season: null,
    irrigation_access: null,
    drainage_condition: null,
    waterlogging_history: null,
    management_plan: null,
    goal: "explore",
  },
};
export function materialKey(geometry: Geometry, draft: Draft) {
  return JSON.stringify({
    geometry: geometry.features.map((f) => f.geometry),
    year: draft.year,
    farm: Object.fromEntries(
      Object.entries(draft.farm).sort(([a], [b]) => a.localeCompare(b)),
    ),
  });
}
export function analysisBody(id: string, geometry: Geometry, draft: Draft) {
  return {
    aoi_id: id === "my-thanh" ? "MT-BLOCK-01" : id,
    geometry,
    period: { start: `${draft.year}-01-01`, end: `${draft.year + 1}-01-01` },
    farm: draft.farm,
    source_mode: draft.source_mode,
  };
}
