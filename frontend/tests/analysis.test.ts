// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { createElement } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { numberOrNull } from "../scripts/measurements.mjs";
import { QAMatrix } from "../src/features/power/QAMatrix";
import { RunSchema, analysisBody, initialDraft, materialKey } from "../src/features/analysis/contracts";
import type { Geometry } from "../src/core/contracts";
afterEach(cleanup);
it("preserves unknown/zero and rejects nonfinite packager values", () => {
  expect(numberOrNull("")).toBeNull(); expect(numberOrNull(null)).toBeNull();
  expect(numberOrNull("0")).toBe(0); expect(() => numberOrNull("NaN")).toThrow();
});
it("shows numeric source QA failure rather than a green pass", () => {
  render(createElement(QAMatrix, { months: [{ date: "2025-01-01", rain: 42, temp: 26, coverage: 1, qa: "fail" }], synthetic: false, onInspect: () => {} }));
  expect(screen.getAllByText("FAIL")).toHaveLength(3);
});
it("loads a real non-null partial A1 with scope, source and missing-input trace", () => {
  const run = RunSchema.parse(JSON.parse(readFileSync("public/analysis/my-thanh.saved.json","utf8")));
  expect(run.a1.results).toHaveLength(3); expect(run.a1.status).toBe("partial");
  expect(run.a1.results.every(r => r.score === null && r.eligibility === "needs_review")).toBe(true);
  expect(run.a1.results[0].criteria.length).toBeGreaterThan(0);
  const geometry = run.inputs.geometry as Geometry;
  expect(materialKey(geometry,initialDraft)).not.toBe(materialKey(geometry,{ ...initialDraft, farm: { ...initialDraft.farm, drainage_condition: "good" } }));
  expect(materialKey(geometry,initialDraft)).toBe(materialKey(geometry,{ ...initialDraft, source_mode: "offline" }));
  expect(analysisBody("my-thanh",geometry,initialDraft).aoi_id).toBe("MT-BLOCK-01");
});
