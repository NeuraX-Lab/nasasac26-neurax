import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({page}) => { await page.route("**/tile.openstreetmap.org/**", r => r.abort()); });
test("entry, EN/VI and source drawer are functional", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Explore your land. Understand your options.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Second study area" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "English / Tiếng Việt" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page.getByRole("button", { name: "Xem nghiên cứu vùng" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("terrain, research/sandbox parity, mode switch and drafts", async ({
  page,
}) => {
  await page.goto("/w/my-thanh/farmer");
  await expect(page.getByText("Regional research data").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "3D terrain", exact: true }),
  ).toBeEnabled({ timeout: 30000 });
  await expect(
    page.getByRole("button", { name: "3D terrain", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "2D", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "3D terrain", exact: true }).click();
  await page.locator(".farm-inputs summary").click();
  await page.getByLabel("management_plan", {exact: true}).fill("Draft field management");
  await page
    .getByLabel("Dataset version", { exact: true })
    .selectOption("sandbox");
  await expect(page.getByText("Synthetic UI data").first()).toBeVisible();
  await page.getByRole("link", { name: "Power user", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Data & QA", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("fixture-ui-01").first()).toBeVisible();
  await page.getByRole("link", { name: "Farmer", exact: true }).click();
  await page.getByLabel("Dataset version", {exact: true}).selectOption("research");
  await page.locator(".farm-inputs summary").click();
  await expect(page.getByLabel("management_plan", {exact: true})).toHaveValue("Draft field management");
  await page.getByRole("button", { name: "English / Tiếng Việt" }).click();
  await expect(page.getByLabel("management_plan", {exact: true})).toHaveValue("Draft field management");
  await page.screenshot({ path: "test-results/farmer-vi.png", fullPage: true });
});
test("custom AOI via keyboard saves without borrowing research data", async ({
  page,
}) => {
  await page.goto("/setup");
  await page
    .getByLabel("Area name", { exact: true })
    .fill("Keyboard test area");
  await page
    .getByLabel("Coordinates (longitude, latitude)", { exact: true })
    .fill("106.03,10.48\n106.031,10.48\n106.031,10.481\n106.03,10.481");
  await page.getByRole("button", { name: "Save & open area" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your rotation prerequisites" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Check your rotation prerequisites" }),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Keyboard test area" }),
  ).toBeVisible();
});
test("malformed snapshot is not silently replaced with sandbox", async ({
  page,
}) => {
  await page.route("**/snapshots/research/my-thanh.json", (route) =>
    route.fulfill({ json: { version: 99 } }),
  );
  await page.goto("/w/my-thanh/farmer");
  await expect(page.getByText("Unable to load the dataset")).toBeVisible();
  await expect(
    page.getByText("Research has not been replaced with sandbox data."),
  ).toBeVisible();
});
test("entry has no serious accessibility findings and no mobile overflow", async ({
  page,
}) => {
  await page.goto("/");
  const report = await new AxeBuilder({ page }).analyze();
  expect(
    report.violations.filter((x) =>
      ["serious", "critical"].includes(x.impact || ""),
    ),
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/w/my-thanh/farmer");
  await expect(
    page.getByRole("heading", { name: "Check your rotation prerequisites" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/farmer-mobile-en.png",
    fullPage: true,
  });
});
test("WebGL unavailable keeps outline and analysis available", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: any[]
    ) {
      if (type.includes("webgl")) return null;
      return (original as any).apply(this, [type, ...args]);
    } as any;
  });
  await page.goto("/w/my-thanh/farmer");
  await expect(
    page.getByRole("heading", { name: "Map unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Check your rotation prerequisites" }),
  ).toBeVisible();
});
test("DEM failure preserves 2D and decisions", async ({ page }) => {
  await page.route("**/terrain/**/*.png", (r) => r.abort());
  await page.goto("/w/my-thanh/farmer");
  await expect(
    page.getByText("Terrain unavailable. 2D remains usable."),
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByRole("button", { name: "2D", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Check your rotation prerequisites" }),
  ).toBeVisible();
});
test("drawing creates a polygon and saved areas can be edited", async ({
  page,
}) => {
  await page.goto("/setup");
  const draw = page.getByRole("button", { name: "Draw boundary", exact: true });
  await expect(draw).toBeEnabled();
  await draw.click();
  const canvas = page.locator(".maplibregl-canvas");
  const box = await canvas.boundingBox();
  if (!box) throw Error("Missing map");
  for (const [x, y] of [
    [0.4, 0.4],
    [0.6, 0.4],
    [0.6, 0.6],
    [0.4, 0.4],
  ])
    await page.mouse.click(box.x + box.width * x, box.y + box.height * y);
  await expect(
    page.getByLabel("Coordinates (longitude, latitude)", { exact: true }),
  ).not.toHaveValue("");
  await page.getByLabel("Area name", { exact: true }).fill("Drawn area");
  await page.getByRole("button", { name: "Save & open area" }).click();
  await page.getByRole("link", { name: "Edit boundary", exact: true }).click();
  await page.getByLabel("Area name", { exact: true }).fill("Edited area");
  await page.getByRole("button", { name: "Save & open area" }).click();
  await expect(
    page.getByRole("heading", { name: "Edited area", exact: true }).first(),
  ).toBeVisible();
});
test("reduced motion and language preserve camera; context loss keeps analysis", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/w/my-thanh/farmer");
  await expect(
    page.getByRole("button", { name: "3D terrain", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await page.getByRole("button", { name: "English / Tiếng Việt" }).click();
  await expect(
    page.getByRole("button", { name: "2D", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".maplibregl-canvas").dispatchEvent("webglcontextlost");
  await expect(
    page.getByRole("heading", { name: "Không tải được bản đồ" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Kiểm tra điều kiện trước khi đổi vụ" }),
  ).toBeVisible();
});
