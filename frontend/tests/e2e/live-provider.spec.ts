import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function setup(page: Page) {
  await page.goto("/w/my-thanh/farmer");
  await expect(page.locator(".rotation-option")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page.getByLabel("Từ tháng", { exact: true }).fill("2026-12");
  await page.getByLabel("Đến tháng", { exact: true }).fill("2027-02");
  await page.getByLabel("Cây hiện tại", { exact: true }).selectOption("rice");
  await page.getByLabel("Thoát nước", { exact: true }).selectOption("poor");
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
  await expect(page.getByTestId("v4-R1")).toBeVisible();
  return r.json();
}
test("actual V4 request → changed decisions → RAG → save → reload/reopen preserves both versioned providers", async ({
  page,
}) => {
  await setup(page);
  const response = await analyze(page);
  expect(response.selected_system).toBe("v4");
  expect(response.decision.farm.window_end).toBe("2027-02-28");
  expect(response.decision.options.find((o: any) => o.id === "R2").status).toBe(
    "blocked",
  );
  await page.getByLabel("Hỏi tài liệu liên quan").fill("T2M là gì?");
  await page.getByRole("button", { name: "Tra tài liệu", exact: true }).click();
  await expect(
    page.getByTestId("v4-rag-answer").locator("a").first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quan sát", exact: true }).click();
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await expect(page.locator(".snapshot-label")).toContainText("API V4");
  await page
    .locator(".rotation-option")
    .first()
    .getByRole("button", { name: "Cân nhắc phương án", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
    .click();
  await expect(page.locator(".save-notice")).toContainText("Đã lưu");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("agrotwin-draft-2:my-thanh")!),
  );
  expect(saved.v4.request.farm.drainage).toBe("poor");
  expect(saved.run.a1.schema_version).toBe("0.1-proposal");
  expect(saved.v4.response.selected_system).toBe("v4");
  await page.reload();
  await page
    .getByRole("button", { name: "Mở bản đã lưu", exact: true })
    .click();
  await expect(page.getByTestId("v4-R1")).toContainText("Đang vướng");
  await page.screenshot({
    path: "artifacts/v4-integration/regression/live-v2-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page.getByLabel("Thoát nước", { exact: true }).selectOption("good");
  await expect(
    page.getByRole("button", { name: "Lưu bản dự kiến", exact: true }),
  ).toBeDisabled();
  await analyze(page);
  await expect(page.getByTestId("v4-R1")).toContainText("Cần bổ sung");
});
test("V4 outage or wrong echoed farm cannot be saved as fresh; income is not sent", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/v4/analyze", (r) =>
    r.fulfill({ status: 503, body: "test unavailable" }),
  );
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.locator(".v4-live-status [role=alert]")).toContainText(
    "Chưa cập nhật",
  );
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
    const result = await (await r.fetch()).json();
    result.decision.farm.drainage = "good";
    await r.fulfill({ json: result });
  });
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.locator(".v4-live-status [role=alert]")).toContainText(
    "không khớp",
  );
  let calls = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/v4/analyze")) calls++;
  });
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page.getByLabel("Ưu tiên", { exact: true }).selectOption("income");
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.locator(".v4-live-status")).toContainText(
    "chưa hỗ trợ thu nhập",
  );
  expect(calls).toBe(0);
});
test("mobile V4 decisions, focus and accessibility", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await analyze(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    ),
  ).toEqual([]);
  await page.screenshot({
    path: "artifacts/v4-integration/regression/live-v2-mobile.png",
    fullPage: true,
  });
});
test("editing inputs while V4 is pending discards the old response", async ({
  page,
}) => {
  await setup(page);
  let release: () => void = () => {};
  let received = false;
  const gate = new Promise<void>((resolve) => (release = resolve));
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
  await expect(page.getByTestId("result-state")).toContainText("cần cập nhật");
  await expect(page.getByTestId("v4-R1")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Lưu bản dự kiến", exact: true }),
  ).toBeDisabled();
  await page.unroute("**/api/v4/analyze");
  await analyze(page);
  await expect(page.getByTestId("v4-R1")).toContainText("Cần bổ sung");
});
