import { expect, it } from "vitest";
import { farmV2 } from "../src/features/dashboard/v2";
import { initialDraft } from "../src/features/analysis/contracts";
it("v2 maps only supported fields, inclusive month end and unknowns; income never becomes yield", () => {
  const draft = {
    ...initialDraft,
    farm: {
      ...initialDraft.farm,
      current_crop: "mung_bean",
      previous_crop: "rice",
      irrigation_access: "unavailable" as const,
      season: "2026-12 / 2027-02",
    },
  };
  const mapped = farmV2(draft);
  expect(mapped).toMatchObject({
    current_crop: "mungbean",
    irrigation: "none",
    drainage: "unknown",
    window_start: "2026-12-01",
    window_end: "2027-02-28",
  });
  expect(mapped).not.toHaveProperty("previous_crop");
  expect(mapped).not.toHaveProperty("placement_depth_cm");
  expect(() =>
    farmV2({ ...draft, farm: { ...draft.farm, goal: "income" } }),
  ).toThrow();
});
