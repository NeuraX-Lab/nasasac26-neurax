import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import type { Draft } from "../analysis/contracts";
import { materialKey } from "../analysis/contracts";
import type { Geometry } from "../../core/contracts";
import { OverviewSchema } from "./climate-contracts";
import { GeometrySchema } from "../../core/contracts/geometry";

export const FarmV2 = z
  .object({
    current_crop: z.enum(["rice", "baby_corn", "mungbean", "other", "unknown"]),
    goal: z.enum(["explore", "water", "soil", "yield"]),
    irrigation: z.enum(["available", "limited", "none", "unknown"]),
    drainage: z.enum(["good", "poor", "unknown"]),
    window_start: z.iso.date().optional(),
    window_end: z.iso.date().optional(),
  })
  .strict();
export function farmV2(draft: Draft) {
  if (draft.farm.goal === "income")
    throw Error(
      "V2 chưa hỗ trợ mục tiêu thu nhập; không đổi ngầm sang năng suất.",
    );
  const [start, end] = draft.farm.season?.split(" / ") || [];
  if ((start && !end) || (!start && end) || (start && end < start))
    throw Error("Khoảng vụ chưa hợp lệ.");
  const endDate = end
    ? new Date(Date.UTC(Number(end.slice(0, 4)), Number(end.slice(5)), 0))
        .toISOString()
        .slice(0, 10)
    : undefined;
  return FarmV2.parse({
    current_crop:
      draft.farm.current_crop === "mung_bean"
        ? "mungbean"
        : draft.farm.current_crop || "unknown",
    goal: draft.farm.goal,
    irrigation:
      draft.farm.irrigation_access === "unavailable"
        ? "none"
        : draft.farm.irrigation_access || "unknown",
    drainage: draft.farm.drainage_condition || "unknown",
    ...(start ? { window_start: start + "-01", window_end: endDate } : {}),
  });
}
export const OptionV2 = z.object({
  id: z.enum(["R0", "R1", "R2"]),
  crop: z.enum(["rice", "baby_corn", "mungbean"]),
  label: z.string(),
  status: z.enum(["blocked", "needs_information", "conditional_reference"]),
  rank: z.null(),
  score: z.null(),
  probability_of_success: z.null(),
  reasons: z.array(z.string()),
  missing_inputs: z.array(z.string()),
  evidence_ids: z.array(z.string()),
  calendar: z.string(),
  tradeoff: z.string(),
  domain_approved: z.literal(false),
});
const Rag = z
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
      }),
    ),
  })
  .passthrough();
export const AnalysisV2 = z.object({
  schema_version: z.literal("fieldshift-2"),
  run_id: z.string().startsWith("v2-"),
  region_id: z.literal("MT-BLOCK-01"),
  status: z.literal("research_only"),
  generated_at_utc: z.iso.datetime({ offset: true }),
  domain_approved: z.literal(false),
  input_origin: z.literal("self_reported_unverified"),
  forecasts: OverviewSchema.shape.forecasts,
  decision: z
    .object({
      farm: z.record(z.string(), z.unknown()),
      options: z.array(OptionV2).length(3),
      goal: z.string(),
      goal_next_action: z.string(),
      ranking_basis: z.string(),
    })
    .passthrough(),
  rag: Rag.nullable(),
});
export const V2Record = z.object({
  provider: z.literal("fieldshift-2-api"),
  key: z.string(),
  request: z
    .object({
      region_id: z.literal("MT-BLOCK-01"),
      farm: FarmV2,
      question: z.string().optional(),
    })
    .strict(),
  response: AnalysisV2,
});
export type V2Result = z.infer<typeof V2Record>;
export function validateV2(
  raw: unknown,
  request: V2Result["request"],
  key: string,
): V2Result {
  const response = AnalysisV2.parse(raw);
  if (
    new Set(response.decision.options.map((o) => o.id)).size !== 3 ||
    Object.entries(request.farm).some(
      ([k, v]) => response.decision.farm[k] !== v,
    ) ||
    response.decision.goal !== request.farm.goal
  )
    throw Error("V2 response không khớp input đã gửi.");
  return V2Record.parse({
    provider: "fieldshift-2-api",
    request,
    response,
    key,
  });
}
export function useV2() {
  const [record, setRecord] = useState<V2Result | null>(null),
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
      const scopeResponse = await fetch("/snapshots/research/my-thanh.json", {
        signal: c.signal,
      });
      if (!scopeResponse.ok)
        throw Error("Pilot geometry verification unavailable");
      const pilot = GeometrySchema.parse((await scopeResponse.json()).geometry);
      if (
        JSON.stringify(pilot.features.map((f) => f.geometry)) !==
        JSON.stringify(geometry.features.map((f) => f.geometry))
      )
        throw Error("Geometry outside FieldShift v2 pilot");
      const request: V2Result["request"] = {
        region_id: "MT-BLOCK-01",
        farm: farmV2(draft),
        ...(question.trim() ? { question: question.trim() } : {}),
      };
      const r = await fetch("/api/v2/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: c.signal,
      });
      if (!r.ok) throw Error(`V2 HTTP ${r.status}`);
      const value = validateV2(
        await r.json(),
        request,
        materialKey(geometry, draft),
      );
      if (token !== generation.current) return false;
      setRecord(value);
      return true;
    } catch (e) {
      if (token === generation.current)
        setError(e instanceof Error ? e.message : "V2 unavailable");
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
    restore: (value: V2Result | null) => {
      cancel();
      setError("");
      setRecord(value);
    },
  };
}
