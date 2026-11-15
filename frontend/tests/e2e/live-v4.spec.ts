import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

const out = "artifacts/local-demo-v4";
test.beforeAll(async () => {
  await mkdir(out, { recursive: true });
});
async function open(page: Page) {
  await page.goto("/w/my-thanh/farmer");
  await expect(page.locator(".rotation-option")).toHaveCount(3);
}
async function conditions(page: Page) {
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page.getByLabel("Từ tháng", { exact: true }).fill("2026-12");
  await page.getByLabel("Đến tháng", { exact: true }).fill("2027-02");
  await page.getByLabel("Cây hiện tại", { exact: true }).selectOption("rice");
  await page.getByLabel("Nguồn tưới", { exact: true }).selectOption("limited");
  await page.getByLabel("Thoát nước", { exact: true }).selectOption("poor");
  await page.getByLabel("Ưu tiên", { exact: true }).selectOption("water");
}
async function analyze(page: Page) {
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v4/analyze") && r.request().method() === "POST",
  );
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  const r = await response;
  expect(r.status()).toBe(200);
  const body = await r.json();
  await expect(page.getByTestId("v4-run")).toContainText(body.run_id);
  return body;
}
test("real NASA → fresh V4 → intervals → gated RAG → rotations → save/reopen original run", async ({
  page,
}, info) => {
  const errors: string[] = [],
    consoleErrors: string[] = [],
    posts: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  await open(page);
  expect(posts).toEqual([]);
  await expect(page.locator(".sensor-number")).toHaveText([
    "—°C",
    "—%RH",
    "—ADC",
  ]);
  await expect(page.locator(".climate-summary")).toContainText("2025");
  await expect(page.locator("[data-basemap-state=ready]")).toHaveCount(1, {
    timeout: 30000,
  });
  const map = await page.evaluate(() => {
    const m = (window as any).__agrotwinMap;
    return {
      sources: m.getStyle().sources,
      pitch: m.getPitch(),
      terrain: m.getTerrain(),
    };
  });
  expect(JSON.stringify(map.sources)).toContain("World_Imagery");
  expect(map.pitch).toBe(0);
  expect(map.terrain).toBeNull();
  await page.screenshot({
    path: `${out}/after-desktop-observe.png`,
    fullPage: true,
  });
  await conditions(page);
  const first = await analyze(page);
  expect(first.selected_system).toBe("v4");
  expect(first.inference).toMatchObject({
    prediction_count: 6,
    cached: false,
    execution_mode: "fresh_model_inference",
    model_version: "v3-climatology-rag-v4-pooled",
  });
  expect(first.decision.farm.window_end).toBe("2027-02-28");
  expect(first.forecasts).toHaveLength(6);
  for (const f of first.forecasts) {
    expect(f.lower).toBeLessThanOrEqual(f.value);
    expect(f.upper).toBeGreaterThanOrEqual(f.value);
    expect(f.coverage_guaranteed).toBe(false);
  }
  await expect(page.getByTestId("v4-R1")).toContainText("Đang vướng");
  await expect(page.getByTestId("v4-R2")).toContainText("Đang vướng");
  await page.getByLabel("Hỏi tài liệu liên quan").fill("T2M là gì?");
  const ragHttp = page.waitForResponse((r) =>
    r.url().endsWith("/api/v4/analyze"),
  );
  await page.getByRole("button", { name: "Tra tài liệu", exact: true }).click();
  const rag = await (await ragHttp).json();
  expect(rag.run_id).not.toBe(first.run_id);
  expect(rag.rag.source_bytes_verified).toBe(true);
  await expect(
    page.getByTestId("v4-rag-answer").locator("a").first(),
  ).toHaveAttribute("href", /power.larc.nasa.gov/);
  await page.getByRole("button", { name: "Quan sát", exact: true }).click();
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await expect(page.locator(".forecast-table tbody tr")).toHaveCount(2);
  await page.locator(".climate-provenance summary").click();
  await expect(page.locator(".snapshot-label")).toContainText(
    "API V4 · inference mới",
  );
  await page
    .locator(".rotation-option")
    .nth(1)
    .getByRole("button", { name: "Cân nhắc phương án", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
    .click();
  await expect(page.locator(".save-notice")).toContainText("Đã lưu");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("agrotwin-draft-2:my-thanh")!),
  );
  expect(saved.v4.response.run_id).toBe(rag.run_id);
  expect(saved.v4.response.inference.models).toHaveLength(6);
  expect(saved.v2).toBeNull();
  await info.attach("actual-v4-saved-result", {
    body: JSON.stringify(saved, null, 2),
    contentType: "application/json",
  });
  const callsBeforeReload = posts.length;
  await page.reload();
  await page
    .getByRole("button", { name: "Mở bản đã lưu", exact: true })
    .click();
  await expect(page.getByTestId("v4-run")).toContainText(rag.run_id);
  await expect(page.getByTestId("v4-run")).toContainText("bản đã lưu");
  expect(posts.length).toBe(callsBeforeReload);
  await expect(page.getByLabel("Hỏi tài liệu liên quan")).toHaveValue(
    "T2M là gì?",
  );
  await page.screenshot({
    path: `${out}/after-desktop-reopened.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
  await info.attach("console-errors", {
    body: JSON.stringify(consoleErrors),
    contentType: "application/json",
  });
  expect(consoleErrors).toEqual([]);
  expect(posts.some((p) => p.includes("/api/v2/"))).toBe(false);
});
test("V4 outage and wrong echoed farm are explicit, block saving and never fall back to V2", async ({
  page,
}) => {
  await open(page);
  await conditions(page);
  await page.route("**/api/v4/analyze", (r) =>
    r.fulfill({ status: 503, body: "test artifact unavailable" }),
  );
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.locator(".v4-live-status [role=alert]")).toContainText(
    "V4 HTTP 503",
  );
  await expect(page.getByTestId("v4-run")).toHaveCount(0);
  await page
    .locator(".rotation-option")
    .first()
    .getByRole("button", { name: "Cân nhắc phương án", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Lưu bản dự kiến", exact: true }),
  ).toBeDisabled();
  await page.unroute("**/api/v4/analyze");
  await page.route("**/api/v4/analyze", async (r) => {
    const body = await (await r.fetch()).json();
    body.decision.farm.drainage = "good";
    await r.fulfill({ json: body });
  });
  await conditions(page);
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.locator(".v4-live-status [role=alert]")).toContainText(
    "không khớp input",
  );
  await expect(
    page.getByRole("button", { name: "Lưu bản dự kiến", exact: true }),
  ).toBeDisabled();
});
test("evidence gate abstains without fabricated citations and income is not remapped", async ({
  page,
}) => {
  await open(page);
  await conditions(page);
  await analyze(page);
  await page
    .getByLabel("Hỏi tài liệu liên quan")
    .fill("What is field EC at this plot?");
  await page.getByRole("button", { name: "Tra tài liệu", exact: true }).click();
  await expect(page.getByTestId("v4-rag-answer")).toContainText(
    "Chưa đủ bằng chứng",
  );
  await expect(page.getByTestId("v4-rag-answer").locator("a")).toHaveCount(0);
  let v4Calls = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/v4/analyze")) v4Calls++;
  });
  await conditions(page);
  await page.getByLabel("Ưu tiên", { exact: true }).selectOption("income");
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.locator(".v4-live-status")).toContainText(
    "chưa hỗ trợ thu nhập",
  );
  expect(v4Calls).toBe(0);
});
test("input edits discard delayed V4 responses and keep the form open", async ({
  page,
}) => {
  await open(page);
  await conditions(page);
  let release: () => void = () => {};
  let received = false;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/v4/analyze", async (route) => {
    const response = await route.fetch();
    received = true;
    await gate;
    await route.fulfill({ response }).catch(() => {});
  });
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect.poll(() => received).toBe(true);
  await page.getByLabel("Thoát nước", { exact: true }).selectOption("good");
  release();
  await expect(page.getByTestId("v4-R1")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Lưu bản dự kiến", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".edit-conditions")).toHaveAttribute("open", "");
  await page.unroute("**/api/v4/analyze");
  await analyze(page);
  await expect(page.getByTestId("v4-R1")).toContainText("Cần bổ sung");
});
test("mobile and English/Power entry preserve shared V4 dashboard and accessibility", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/w/my-thanh/power");
  await expect(page).toHaveURL(/\/farmer$/); // Hưng's existing unified workspace contract.
  await conditions(page);
  await analyze(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({ path: `${out}/after-mobile-vi.png`, fullPage: true });
  await page
    .getByRole("button", { name: "English / Tiếng Việt", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My field · Mỹ Thành", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".v4-live-status")).toContainText(
    "Six fresh predictions",
  );
  await expect(page.getByTestId("v4-R1")).toContainText(
    "Blocked by declared conditions",
  );
  const axe = await new AxeBuilder({ page }).analyze();
  await info.attach("axe-mobile-en", {
    body: JSON.stringify(axe.violations),
    contentType: "application/json",
  });
  expect(
    axe.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact || ""),
    ),
  ).toEqual([]);
  await page.screenshot({ path: `${out}/after-mobile-en.png`, fullPage: true });
  expect(
    await page.evaluate(() => window.isSecureContext && "serial" in navigator),
  ).toBe(true);
});
