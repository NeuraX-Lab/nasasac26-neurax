import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import type { Draft } from "../analysis/contracts";
import { materialKey } from "../analysis/contracts";
import type { Geometry } from "../../core/contracts";
import { GeometrySchema } from "../../core/contracts/geometry";
import { FarmV2, farmV2, OptionV2 } from "./v2";

// Farm/rotation fields are unchanged; the V4 forecast and provenance are not V2.
export const farmV4 = (draft: Draft) => {
  if (draft.farm.goal === "income")
    throw Error("V4 chưa hỗ trợ mục tiêu thu nhập / Income is unsupported.");
  return farmV2(draft);
};
const sha = z.string().regex(/^[a-f0-9]{64}$/);
export const ForecastV4 = z
  .object({
    target: z.enum(["precip_sum_mm", "air_temp_mean_c", "air_rh_mean_pct"]),
    unit: z.enum(["mm/month", "degC", "percent"]),
    horizon_months: z.union([z.literal(1), z.literal(3)]),
    region_id: z.literal("MT-BLOCK-01"),
    target_month: z.iso.date(),
    origin_month: z.iso.date(),
    data_through: z.iso.date(),
    value: z.number().finite(),
    lower: z.number().finite(),
    upper: z.number().finite(),
    method: z.string().min(1),
    nominal_coverage: z.literal(0.8),
    coverage_guaranteed: z.literal(false),
    historical_vintage_verified: z.literal(false),
    uncertainty_method: z.literal("v3 pooled empirical bands"),
  })
  .superRefine((f, ctx) => {
    const units = {
      precip_sum_mm: "mm/month",
      air_temp_mean_c: "degC",
      air_rh_mean_pct: "percent",
    };
    const monthIndex = (s: string) =>
      Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7));
    if (
      f.unit !== units[f.target] ||
      f.lower > f.value ||
      f.value > f.upper ||
      [f.target_month, f.origin_month, f.data_through].some(
        (s) => !s.endsWith("-01"),
      ) ||
      monthIndex(f.target_month) - monthIndex(f.origin_month) !==
        f.horizon_months ||
      monthIndex(f.data_through) >= monthIndex(f.origin_month) ||
      (f.target !== "air_temp_mean_c" && f.lower < 0) ||
      (f.target === "air_rh_mean_pct" && f.upper > 100)
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid V4 forecast unit, bounds, origin or horizon",
      });
  });
export const AnalysisV4 = z
  .object({
    api_schema_version: z.literal("fieldshift-dashboard-1"),
    selected_system: z.literal("v4"),
    schema_version: z.literal("fieldshift-2"),
    research_schema_version: z.literal("fieldshift-research-1"),
    run_id: z.string().regex(/^v4-[a-f0-9]{32}$/),
    region_id: z.literal("MT-BLOCK-01"),
    status: z.literal("research_only"),
    generated_at_utc: z.iso.datetime({ offset: true }),
    domain_approved: z.literal(false),
    input_origin: z.literal("self_reported_unverified"),
    blocks: z.object({
      ML: z.literal("v3 frozen climatology"),
      RAG: z.literal("v4 refined evidence gate"),
      uncertainty: z.literal("pooled"),
    }),
    inference: z.object({
      execution_mode: z.literal("fresh_model_inference"),
      cached: z.literal(false),
      prediction_count: z.literal(6),
      model_version: z.literal("v3-climatology-rag-v4-pooled"),
      selection_id: z.string().startsWith("research-"),
      request_sha256: sha,
      dataset_sha256: sha,
      corpus_sha256: sha,
      ml_selection_sha256: sha,
      rag_selection_sha256: sha,
      models: z.array(z.object({ task: z.string(), sha256: sha })).length(6),
    }),
    forecasts: z.array(ForecastV4).length(6),
    warnings: z.array(z.string()),
    // Optional for the earliest saved V4 records; required for new HTTP responses.
    question: z.string().nullable().optional(),
    decision: z
      .object({
        farm: z.record(z.string(), z.unknown()),
        options: z.array(OptionV2).length(3),
        goal: z.string(),
        goal_next_action: z.string(),
        ranking_basis: z.string(),
      })
      .passthrough(),
    rag: z
      .object({
        status: z.enum(["reference_only", "insufficient_evidence"]),
        answer: z.string(),
        answer_en: z.string(),
        citations: z.array(
          z.object({
            card_id: z.string(),
            source_id: z.string(),
            locator: z.string(),
            url: z.url().refine((s) => /^https?:/.test(s)),
            sha256: sha,
            scope: z.string(),
          }),
        ),
        source_bytes_verified: z.boolean(),
        query_support_fraction: z.number().min(0).max(1),
        abstention_reason: z.string().nullable(),
        generation: z.string(),
      })
      .passthrough()
      .nullable(),
  })
  .superRefine((v, ctx) => {
    if (
      new Set(v.forecasts.map((f) => `${f.target}/${f.horizon_months}`))
        .size !== 6 ||
      new Set(v.forecasts.map((f) => f.data_through)).size !== 1 ||
      new Set(v.forecasts.map((f) => f.origin_month)).size !== 1 ||
      new Set(v.inference.models.map((m) => m.task)).size !== 6 ||
      new Set(v.decision.options.map((o) => o.id)).size !== 3
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate tasks/options or mixed V4 cutoff",
      });
    if (
      v.rag &&
      (v.rag.status === "insufficient_evidence"
        ? v.rag.citations.length > 0 || v.rag.source_bytes_verified
        : !v.rag.citations.length || !v.rag.source_bytes_verified)
    )
      ctx.addIssue({ code: "custom", message: "Invalid V4 evidence gate" });
  });
export const V4Record = z.object({
  provider: z.literal("fieldshift-v4-api"),
  key: z.string(),
  request: z
    .object({
      region_id: z.literal("MT-BLOCK-01"),
      farm: FarmV2,
      question: z.string().min(1).max(800).optional(),
    })
    .strict(),
  response: AnalysisV4,
});
export type V4Result = z.infer<typeof V4Record>;
export function validateV4(
  raw: unknown,
  request: V4Result["request"],
  key: string,
): V4Result {
  const response = AnalysisV4.parse(raw);
  if (
    Object.entries(request.farm).some(
      ([k, v]) => response.decision.farm[k] !== v,
    ) ||
    response.decision.goal !== request.farm.goal ||
    !!response.rag !== !!request.question ||
    (response.question !== undefined &&
      response.question !== (request.question || null))
  )
    throw Error("V4 response không khớp input / does not match input.");
  return V4Record.parse({
    provider: "fieldshift-v4-api",
    key,
    request,
    response,
  });
}
export function useV4() {
  const [record, setRecord] = useState<V4Result | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const generation = useRef(0),
    controller = useRef<AbortController | null>(null);
  function cancel() {
    generation.current++;
    controller.current?.abort();
    setBusy(false);
  }
  useEffect(
    () => () => {
      generation.current++;
      controller.current?.abort();
    },
    [],
  );
  async function execute(geometry: Geometry, draft: Draft, question = "") {
    cancel();
    const token = generation.current,
      c = new AbortController();
    controller.current = c;
    setBusy(true);
    setError("");
    const timer = setTimeout(() => c.abort("timeout"), 25000);
    try {
      const scope = await fetch("/snapshots/research/my-thanh.json", {
        signal: c.signal,
      });
      if (!scope.ok) throw Error("Pilot geometry verification unavailable");
      const pilot = GeometrySchema.parse((await scope.json()).geometry);
      if (
        JSON.stringify(pilot.features.map((f) => f.geometry)) !==
        JSON.stringify(geometry.features.map((f) => f.geometry))
      )
        throw Error("Geometry outside FieldShift V4 pilot");
      const request: V4Result["request"] = {
        region_id: "MT-BLOCK-01",
        farm: farmV4(draft),
        ...(question.trim() ? { question: question.trim() } : {}),
      };
      const r = await fetch("/api/v4/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: c.signal,
      });
      if (!r.ok)
        throw Error(`V4 HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const raw = await r.json();
      const value = validateV4(raw, request, materialKey(geometry, draft));
      if (raw.question === undefined)
        throw Error("V4 response lacks question echo");
      if (token !== generation.current) return false;
      setRecord(value);
      return true;
    } catch (e) {
      if (token === generation.current)
        setError(
          e instanceof z.ZodError
            ? "V4 output failed schema validation; retry / Kết quả V4 sai schema."
            : e instanceof Error
              ? e.message
              : "V4 unavailable",
        );
      return false;
    } finally {
      clearTimeout(timer);
      if (token === generation.current) setBusy(false);
    }
  }
  return {
    record,
    busy,
    error,
    execute,
    cancel,
    restore: (v: V4Result | null) => {
      cancel();
      setError("");
      setRecord(v);
    },
  };
}
