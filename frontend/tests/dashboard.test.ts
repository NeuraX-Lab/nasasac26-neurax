import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  OverviewSchema,
  PlanSchema,
  PIN,
  readPlan,
  runMatches,
  seasonMonths,
  withinSeason,
  pointInside,
} from "../src/features/dashboard/model";
import {
  initialDraft,
  materialKey,
  RunSchema,
} from "../src/features/analysis/contracts";
const run = RunSchema.parse(
  JSON.parse(readFileSync("public/analysis/my-thanh.saved.json", "utf8")),
);
const snapshot = JSON.parse(
  readFileSync("public/snapshots/v2/overview.json", "utf8"),
);
describe("versioned sources and honest draft persistence", () => {
  it("validates the real v2 snapshot separately from A1 and rejects mixed units/cutoff/duplicates", () => {
    const parsed = OverviewSchema.parse(snapshot);
    expect(parsed.forecasts).toHaveLength(6);
    expect(RunSchema.safeParse(snapshot).success).toBe(false);
    const bad = structuredClone(snapshot);
    bad.forecasts[0].unit = "mm/month";
    expect(OverviewSchema.safeParse(bad).success).toBe(false);
    const dup = structuredClone(snapshot);
    dup.forecasts[0] = dup.forecasts[1];
    expect(OverviewSchema.safeParse(dup).success).toBe(false);
  });
  it("keeps h3 as a single target month and filters an explicit season across years", () => {
    expect(seasonMonths("2026-12 / 2027-02")).toEqual([12, 1, 2]);
    expect(withinSeason("2027-02-01", "2026-12 / 2027-02")).toBe(true);
    expect(withinSeason("2026-12-01", "2027-03 / 2027-06")).toBe(false);
    expect(seasonMonths("2027-03 / 2027-01")).toEqual([]);
  });
  const plan = () =>
    PlanSchema.parse({
      version: "agrotwin-draft-2",
      id: "my-thanh",
      name: "Mỹ Thành",
      savedAt: new Date().toISOString(),
      geometry: run.inputs.geometry,
      draft: initialDraft,
      key: materialKey(run.inputs.geometry, initialDraft),
      chosen: "R1",
      run,
      climateSnapshot: snapshot,
      climateSourcePin: PIN,
      tasks: ["Check local cultivar"],
    });
  it("round trips real source/mode/input/run/selection and refuses a modified input or geometry", () => {
    const p = plan();
    expect(readPlan(JSON.stringify(p))?.run.a1.run_id).toBe(run.a1.run_id);
    p.draft.farm.goal = "income";
    p.key = materialKey(p.geometry, p.draft);
    expect(readPlan(JSON.stringify(p))).toBeNull();
    const foreign = plan();
    foreign.geometry.features[0].geometry.coordinates[0][0][0] += 0.001;
    expect(readPlan(JSON.stringify(foreign))).toBeNull();
  });
  it("rejects forged selections and prevents pilot outputs from being applied to another field", () => {
    const p = plan();
    p.chosen = "not-a-real-option";
    expect(readPlan(JSON.stringify(p))).toBeNull();
    expect(
      runMatches(run, "area-other", run.inputs.geometry, initialDraft),
    ).toBe(false);
    expect(pointInside([0, 0], run.inputs.geometry)).toBe(false);
  });
});
