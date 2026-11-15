import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AnalysisV4, farmV4, validateV4 } from "../src/features/dashboard/v4";
import {
  initialDraft,
  materialKey,
  RunSchema,
} from "../src/features/analysis/contracts";
import { PIN, readPlan } from "../src/features/dashboard/model";

// A real HTTP result from this integration session, used only as a contract fixture.
const fixture = JSON.parse(
  readFileSync("tests/fixtures/v4-analysis.json", "utf8"),
);
const run = RunSchema.parse(
  JSON.parse(readFileSync("public/analysis/my-thanh.saved.json", "utf8")),
);
const key = materialKey(run.inputs.geometry, initialDraft);
const request = {
  region_id: "MT-BLOCK-01" as const,
  farm: farmV4(initialDraft),
};
describe("selected V4 contract, scientific gates and persistence", () => {
  it("accepts actual V4 but refuses V2 and unsupported income", () => {
    expect(
      validateV4(fixture, request, key).response.inference.prediction_count,
    ).toBe(6);
    expect(
      AnalysisV4.safeParse(
        JSON.parse(readFileSync("public/snapshots/v2/overview.json", "utf8")),
      ).success,
    ).toBe(false);
    expect(() =>
      farmV4({
        ...initialDraft,
        farm: { ...initialDraft.farm, goal: "income" },
      }),
    ).toThrow();
  });
  it.each([
    "unit",
    "horizon",
    "duplicate",
    "score",
    "system",
    "cached",
    "cutoff",
  ])("rejects corrupted %s", (field) => {
    const a = structuredClone(fixture);
    if (field === "unit") a.forecasts[0].unit = "degC";
    if (field === "horizon") a.forecasts[0].origin_month = "2026-09-01";
    if (field === "duplicate") a.forecasts[0] = a.forecasts[1];
    if (field === "score") a.decision.options[0].score = 9;
    if (field === "system") a.selected_system = "v2";
    if (field === "cached") a.inference.cached = true;
    if (field === "cutoff") a.forecasts[0].data_through = "2026-09-01";
    expect(AnalysisV4.safeParse(a).success).toBe(false);
  });
  it("rejects a response for another farm or an unrequested answer", () => {
    const a = structuredClone(fixture);
    a.decision.farm.drainage = "poor";
    expect(() => validateV4(a, request, key)).toThrow(/input/);
    const wrongQuestion = { ...fixture, question: "An unrelated question" };
    expect(() => validateV4(wrongQuestion, request, key)).toThrow(/input/);
    expect(() =>
      validateV4(fixture, { ...request, question: "T2M" }, key),
    ).toThrow(/input/);
  });
  it("retains original V4 run, model hashes and inputs; rejects forged saved input", () => {
    const record = validateV4(fixture, request, key);
    const plan = {
      version: "agrotwin-draft-2",
      id: "my-thanh",
      name: "Mỹ Thành",
      savedAt: new Date().toISOString(),
      geometry: run.inputs.geometry,
      draft: initialDraft,
      key,
      chosen: "R1",
      run,
      climateSnapshot: null,
      climateSourcePin: PIN,
      tasks: [],
      v4: record,
    };
    expect(readPlan(JSON.stringify(plan))?.v4?.response).toEqual(
      record.response,
    );
    plan.v4.request.farm.drainage = "poor";
    expect(readPlan(JSON.stringify(plan))).toBeNull();
  });
});
