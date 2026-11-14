import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { summarize, parseCoordinates } from "../src/core/selectors";
import { BundleSchema } from "../src/core/contracts";
import { resources } from "../src/i18n";
const research = JSON.parse(
  readFileSync("public/snapshots/research/my-thanh.json", "utf8"),
);
const sandbox = JSON.parse(
  readFileSync("public/snapshots/sandbox/my-thanh.json", "utf8"),
);
describe("scientific boundary", () => {
  it("validates both environments without fabricated A1", () => {
    for (const x of [research, sandbox]) {
      expect(BundleSchema.parse(x).a1).toBeNull();
      expect(x.months).not.toHaveLength(0);
    }
    expect(research.months).toHaveLength(132);
    expect(research.source.flags[0].value).toBe(488.17);
    expect(sandbox.dataMode).toBe("synthetic");
  });
  it("rejects a malformed monthly value", () => {
    const x = structuredClone(research);
    x.months[0].rain = "unknown";
    expect(() => BundleSchema.parse(x)).toThrow();
  });
  it("does not confuse missing rain and zero", () => {
    const rows = [
      {
        date: "2025-01-01",
        rain: null,
        temp: 28,
        coverage: 0,
        qa: "warn" as const,
      },
      {
        date: "2025-02-01",
        rain: 0,
        temp: 28,
        coverage: 1,
        qa: "pass" as const,
      },
    ];
    const m = summarize(rows, "all");
    expect(m[0].rain).toBeNull();
    expect(m[1].rain).toBe(0);
  });
  it("filters years and computes explicit climatology", () => {
    expect(summarize(research.months, "2025")).toHaveLength(12);
    expect(summarize(research.months, "all")).toHaveLength(12);
    expect(summarize(research.months, "1999")).toHaveLength(0);
  });
});
describe("local boundaries", () => {
  it("closes a valid polygon", () => {
    const g = parseCoordinates("106,10\n106.1,10\n106.1,10.1\n106,10.1");
    expect(g.features[0].geometry.coordinates[0]).toHaveLength(5);
  });
  it.each([
    "106,10\n106,10",
    "106,10\n106.1,10.1\n106,10.1\n106.1,10",
    "181,10\n182,10\n183,11",
    "106,10\n107,10\n108,10",
  ])("rejects invalid polygon %s", (text) =>
    expect(() => parseCoordinates(text)).toThrow(),
  );
});
it("has complete language keys with no empty translations", () => {
  expect(Object.keys(resources.en.translation).sort()).toEqual(
    Object.keys(resources.vi.translation).sort(),
  );
  for (const lng of ["en", "vi"] as const)
    expect(Object.values(resources[lng].translation).every(Boolean)).toBe(true);
});
