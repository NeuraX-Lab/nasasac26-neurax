import { test, expect } from "@playwright/test";

// The selected V4 replaces the retired Extra Trees model picker on this Dashboard.
// Preserve the original acceptance: real predict, model provenance, save/reopen,
// mobile, errors and wrong-scope rejection. No snapshot can substitute for inference.
test("current dashboard executes selected V4 and saves its model provenance", async ({
  page,
}) => {
  await page.goto("/w/my-thanh/farmer");
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page.getByLabel("Từ tháng", { exact: true }).fill("2026-12");
  await page.getByLabel("Đến tháng", { exact: true }).fill("2027-02");
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v4/analyze") && r.request().method() === "POST",
  );
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  const run = await (await response).json();
  expect(run.inference.execution_mode).toBe("fresh_model_inference");
  expect(run.inference.models).toHaveLength(6);
  expect(run.domain_approved).toBe(false);
  await expect(page.getByTestId("v4-run")).toContainText(run.run_id);
  await page
    .locator(".rotation-option")
    .nth(1)
    .getByRole("button", { name: "Cân nhắc phương án", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
    .click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("agrotwin-draft-2:my-thanh")!),
  );
  expect(saved.v4.response.run_id).toBe(run.run_id);
  expect(saved.v4.response.inference.dataset_sha256).toBe(
    run.inference.dataset_sha256,
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Mở bản đã lưu", exact: true })
    .click();
  await page.locator(".result-evidence>summary").click();
  await expect(page.locator(".result-evidence")).toContainText(run.run_id);
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await page.locator(".climate-provenance summary").click();
  await expect(page.locator(".snapshot-label")).toContainText(
    "Bản đã lưu từ API V4",
  );
});

test("mobile V4 edits, API outage and wrong region do not substitute snapshots", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/w/my-thanh/farmer");
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page.getByLabel("Từ tháng", { exact: true }).fill("2026-12");
  await page.getByLabel("Đến tháng", { exact: true }).fill("2027-02");
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.getByTestId("v4-run")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page.getByLabel("Thoát nước", { exact: true }).selectOption("poor");
  await expect(page.getByTestId("v4-run")).toHaveCount(0);
  await page.route("**/api/v4/analyze", (r) =>
    r.fulfill({ status: 503, body: "test outage" }),
  );
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.locator(".v4-live-status [role=alert]")).toContainText(
    "V4 HTTP 503",
  );
  await expect(page.getByTestId("v4-run")).toHaveCount(0);
  await page.unroute("**/api/v4/analyze");
  await page.route("**/api/v4/analyze", async (r) => {
    const data = await (await r.fetch()).json();
    data.region_id = "WRONG";
    await r.fulfill({ json: data });
  });
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.locator(".v4-live-status [role=alert]")).toContainText(
    "schema",
  );
  await expect(page.getByTestId("v4-run")).toHaveCount(0);
});
