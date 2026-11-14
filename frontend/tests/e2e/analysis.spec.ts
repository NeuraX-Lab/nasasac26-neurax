import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  // Do not use automated pan/draw tests to prefetch public OSM tiles.
  await page.route("**/tile.openstreetmap.org/**", r => r.abort());
});
async function sample(page: any) {
  await page.goto("/w/my-thanh/farmer"); await expect(page.getByTestId("run-id")).toBeVisible();
}
async function form(page: any) {
  if (!(await page.getByLabel("drainage_condition", { exact: true }).isVisible()))
    await page.locator(".farm-inputs summary").click();
}

test("AC-1 saved preload does not issue a scientific computation", async ({ page }) => {
  let requests = 0; page.on("request", r => { if (r.method() === "POST" && r.url().includes("/v1/analysis")) requests++; });
  await sample(page); await expect(page.getByTestId("execution-state")).toContainText("Saved / cached");
  expect(requests).toBe(0); await expect(page.getByText("2025-12-31").first()).toBeVisible();
  await page.screenshot({ path: "artifacts/v4/saved-farmer.png", fullPage: false });
});

test("AC-2 meaningful input runs API, marks stale and records new trace", async ({ page }) => {
  await sample(page); const before = await page.getByTestId("run-id").innerText(); await form(page);
  await page.getByLabel("drainage_condition", { exact: true }).selectOption("good");
  await page.getByLabel("management_plan", { exact: true }).fill("E2E actual computation " + Date.now());
  await expect(page.getByTestId("execution-state")).toContainText("STALE");
  const response = page.waitForResponse(r => r.request().method() === "POST" && r.url().endsWith("/v1/analysis"));
  await page.getByTestId("analyze").click(); const run = await (await response).json();
  await expect(page.getByTestId("run-id")).toHaveText(run.a1.run_id); expect(run.a1.run_id).not.toBe(before);
  expect(run.inputs.farm.drainage_condition).toBe("good");
  expect(run.a1.results.every((x: any) => x.score === null && x.eligibility === "needs_review")).toBe(true);
});

test("AC-3 a second AOI never borrows the My Thanh cache/catalog", async ({ page }) => {
  await page.goto("/setup"); await page.getByLabel("Area name", { exact: true }).fill("V4 AOI B");
  await page.getByLabel("Coordinates (longitude, latitude)", { exact: true }).fill("106.03,10.48\n106.031,10.48\n106.031,10.481\n106.03,10.481");
  await page.getByRole("button", { name: "Save & open area" }).click();
  await page.getByLabel("source_mode", { exact: true }).selectOption("offline");
  const response = page.waitForResponse(r => r.request().method() === "POST" && r.url().endsWith("/v1/analysis"));
  await page.getByTestId("analyze").click(); const run = await (await response).json();
  expect(run.sidecar.catalog_supported).toBe(false); expect(run.a1.results).toEqual([]); expect(run.source).toBeNull();
  await expect(page.getByText("Mỹ Thành results were not reused.", { exact: false })).toBeVisible();
});

test("AC-4 delayed B response cannot overwrite A; cancel/retry remains usable", async ({ page }) => {
  await sample(page); const first = await page.getByTestId("run-id").innerText();
  await page.goto("/setup"); await page.getByLabel("Area name", { exact: true }).fill("Race B");
  await page.getByLabel("Coordinates (longitude, latitude)", { exact: true }).fill("106.04,10.48\n106.041,10.48\n106.041,10.481\n106.04,10.481");
  await page.getByRole("button", { name: "Save & open area" }).click(); await page.getByLabel("source_mode").selectOption("offline");
  let requested = false;
  await page.route("**/api/v1/analysis", async route => {
    const response = await route.fetch(); requested = true;
    await new Promise(resolve => setTimeout(resolve, 1300));
    try { await route.fulfill({ response }); } catch { /* explicit cancellation */ }
  });
  await page.getByTestId("analyze").click(); await expect.poll(() => requested).toBe(true);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.locator('a[href="/"]').first().click(); await page.locator("a.sample-card.ready").click();
  await expect(page.getByTestId("run-id")).toHaveText(first);
  await page.waitForTimeout(1600); await expect(page.getByTestId("run-id")).toHaveText(first);
  await page.unroute("**/api/v1/analysis"); await page.getByTestId("analyze-again").click();
  await expect(page.getByTestId("run-id")).toHaveText(first);
});

test("AC-5 unknown form inputs remain null and measured zero survives validation", async ({ page, request }) => {
  await sample(page); await form(page);
  const response = page.waitForResponse(r => r.request().method() === "POST" && r.url().endsWith("/v1/analysis"));
  await page.getByTestId("analyze").click(); const run = await (await response).json();
  expect(run.inputs.farm.current_crop).toBeNull(); expect(run.inputs.farm.drainage_condition).toBeNull();
  const h = await request.post("/api/v1/hardware/validate", { data: { device_id: "SYNTHETIC-TEST", event_type: "raw_adc", timestamp_utc: "2026-11-14T00:00:00Z", value: 0, unit: "ADC", data_mode: "simulated" } });
  expect((await h.json()).event.value).toBe(0);
});

test("AC-6 SYNTHETIC numeric QA failure never renders as green pass", async ({ page }) => {
  await page.route("**/snapshots/research/my-thanh.json", async route => {
    const raw = await (await route.fetch()).json(); raw.dataMode = "mixed"; raw.datasetVersion = "SYNTHETIC-QA-FAIL-TEST";
    raw.source.provider = "SYNTHETIC transport fixture"; raw.months[0] = { ...raw.months[0], rain: 42, qa: "fail" };
    await route.fulfill({ json: raw });
  });
  await page.goto("/w/my-thanh/power"); await expect(page.locator(".qa-cell.fail").first()).toHaveText("FAIL");
});

test("AC-7 unknown K1 remains needs_review with no score and source trace", async ({ page }) => {
  await sample(page); await expect(page.locator(".computed-rotation")).toHaveCount(3);
  for (const card of await page.locator(".computed-rotation").all()) {
    await expect(card).toContainText("Needs review"); await expect(card).toContainText("Score: unavailable");
  }
  await page.locator(".computed-rotation").nth(1).locator("summary").click();
  await expect(page.getByText("K1-DRAFT-DRAINAGE", { exact: false }).first()).toBeVisible();
  await expect(page.locator(".computed-rotation").nth(1).getByText("Rule applicability is not approved", { exact: false }).first()).toBeVisible();
});

test("AC-8 repeated identical inputs reuse scientific payload and cosmetic edits do not compute", async ({ page, request }) => {
  await sample(page);
  const saved = await (await request.get("/analysis/my-thanh.saved.json")).json();
  const a = await (await request.post("/api/v1/analysis", { data: saved.inputs })).json();
  const b = await (await request.post("/api/v1/analysis", { data: saved.inputs })).json();
  expect(a.a1).toEqual(b.a1); expect(a.sidecar.scientific_payload_sha256).toBe(b.sidecar.scientific_payload_sha256);
  expect(b.sidecar.cache_hit).toBe(true);
  let count = 0; page.on("request", r => { if (r.method() === "POST" && r.url().includes("/v1/analysis")) count++; });
  await page.getByRole("button", { name: "English / Tiếng Việt" }).click();
  await expect(page.getByTestId("execution-state")).not.toContainText("KẾT QUẢ CŨ"); expect(count).toBe(0);
});

test("AC-9 Farmer and Power share run, trace, comparison and export", async ({ page }) => {
  await sample(page); const old = await page.getByTestId("run-id").innerText(); await form(page);
  await page.getByLabel("current_crop", { exact: true }).selectOption("rice");
  await page.getByTestId("analyze").click(); await expect(page.getByTestId("run-id")).not.toHaveText(old);
  const current = await page.getByTestId("run-id").innerText();
  await page.getByRole("link", { name: "Power user", exact: true }).click();
  await expect(page.getByTestId("run-id")).toHaveText(current);
  await page.getByLabel("Compare runs", { exact: true }).selectOption(old);
  await expect(page.getByTestId("run-comparison")).toContainText(old);
  const download = page.waitForEvent("download"); await page.getByRole("button", { name: "Export reproducible run JSON" }).click();
  expect((await download).suggestedFilename()).toBe(current + ".json");
  const axe = await new AxeBuilder({ page }).analyze(); expect(axe.violations.filter(v => ["serious","critical"].includes(v.impact || ""))).toEqual([]);
  await page.screenshot({ path: "artifacts/v4/power-run.png", fullPage: false });
});

test("AC-10 offline saved fallback and bench/synthetic honesty do not block analysis", async ({ page, context }) => {
  // A missing optional chart chunk must not hide the evaluator during navigation.
  await page.route("**/shared/charts/Climate.tsx*", route => route.abort());
  await page.goto("/hardware"); await expect(page.getByText("No readings received.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Start synthetic stream" }).click();
  await page.locator('a[href="/"]').first().click(); await page.locator("a.sample-card.ready").click();
  await expect(page.getByLabel("Home sensor summary")).toContainText("SYNTHETIC");
  await expect(page.getByLabel("Home sensor summary")).toContainText("Excluded from crop evaluation");
  await expect(page.getByTestId("analyze-again")).toBeVisible();
  await context.setOffline(true); await page.getByTestId("analyze-again").click();
  await expect(page.getByTestId("execution-state")).toContainText("OFFLINE");
  await context.setOffline(false);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/v4/mobile-offline.png", fullPage: true });
});
