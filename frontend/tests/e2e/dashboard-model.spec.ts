import { test, expect } from "@playwright/test";
test("current dashboard actually executes the installed research model and saves its separate provenance", async ({
  page,
}) => {
  await page.goto("/w/my-thanh/farmer");
  await expect(page.locator(".rotation-option")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Chạy model trên máy", exact: true })
    .click();
  const panel = page.getByTestId("research-inference");
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/v1/research/inference") &&
      r.request().method() === "POST",
  );
  await panel
    .getByRole("button", { name: "Chạy suy luận nghiên cứu", exact: true })
    .click();
  const run = await (await response).json();
  expect(run.execution).toBe("model.predict executed for this request");
  expect(run.model.method).toBe("extra_trees");
  expect(run.agronomic_integration_eligible).toBe(false);
  await expect(panel.getByTestId("research-inference-result")).toContainText(
    run.prediction.toFixed(2),
  );
  await page.screenshot({path:'artifacts/remake/after-desktop-live-research.png',fullPage:false});
  await page
    .locator(".rotation-option")
    .nth(1)
    .getByRole("button", { name: "Cân nhắc phương án", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
    .click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("agrotwin-draft-2:my-thanh")!)
          .researchResult.run_id,
    ),
  ).toBe(run.run_id);
  await page.reload();
  await page
    .getByRole("button", { name: "Mở bản đã lưu", exact: true })
    .click();
  await page.locator(".result-evidence>summary").click();
  await expect(page.getByTestId("research-source-trace")).toContainText(
    run.run_id,
  );
  await page.locator(".result-evidence>summary").click();
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await expect(page.locator(".snapshot-label")).toContainText(
    "Bản kết quả đã lưu",
  );
});
test("mobile model execution, stale/error clearing and schema scope validation do not substitute v2 snapshots", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/w/my-thanh/farmer");
  await expect(page.locator(".rotation-option")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Chạy model trên máy", exact: true })
    .click();
  const panel = page.getByTestId("research-inference");
  await panel
    .getByRole("button", { name: "Chạy suy luận nghiên cứu", exact: true })
    .click();
  await expect(panel.getByTestId("research-inference-result")).toBeVisible();
  await page.screenshot({
    path: "artifacts/remake/after-mobile-live-research.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await panel.getByLabel("Research task").selectOption("rain-3");
  await expect(panel.getByTestId("research-inference-result")).toHaveCount(0);
  await page.route("**/api/v1/research/inference", (r) =>
    r.fulfill({ status: 503, body: "test outage" }),
  );
  await panel
    .getByRole("button", { name: "Chạy suy luận nghiên cứu", exact: true })
    .click();
  await expect(panel.getByRole("alert")).toContainText("Không hiển thị dự báo");
  await expect(panel.getByTestId("research-inference-result")).toHaveCount(0);
  await page.unroute("**/api/v1/research/inference");
  await page.route("**/api/v1/research/inference", async (r) => {
    const data = await (await r.fetch()).json();
    data.geometry_hash = "0".repeat(64);
    await r.fulfill({ json: data });
  });
  await panel
    .getByRole("button", { name: "Chạy suy luận nghiên cứu", exact: true })
    .click();
  await expect(panel.getByRole("alert")).toContainText("Không hiển thị dự báo");
  await expect(panel.getByTestId("research-inference-result")).toHaveCount(0);
});
