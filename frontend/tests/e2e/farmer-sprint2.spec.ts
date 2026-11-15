import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`farmer journey ${viewport.width} retains inputs and saved plan across modes`, async ({
    page,
  }) => {
    // Complete journey includes three desktop captures, two analyses and reload.
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    await page.goto("/w/my-thanh/farmer");
    await expect(page.locator(".rotation-option")).toHaveCount(3);
    await expect(page.locator("#climate-title")).toContainText("NASA POWER");
    await expect(page.locator(".telemetry-heading")).toContainText(
      "Chưa kết nối",
    );
    await page.screenshot({
      path: `artifacts/v4-integration/regression/sprint2-${viewport.width}-observe.png`,
    });
    await page
      .getByRole("button", { name: "Xác nhận điều kiện →", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Điều kiện", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".climate-context")).toContainText(
      "Chưa có kết quả V4 khớp",
    );
    await page.getByLabel("Từ tháng", { exact: true }).fill("2026-12");
    await page.getByLabel("Đến tháng", { exact: true }).fill("2027-02");
    await page.getByLabel("Thoát nước", { exact: true }).selectOption("poor");
    await page.screenshot({
      path: `artifacts/v4-integration/regression/sprint2-${viewport.width}-conditions.png`,
    });
    let calls = 0;
    page.on("request", (r) => {
      if (r.url().endsWith("/api/v4/analyze")) calls++;
    });
    await page.getByRole("button", { name: "Quan sát", exact: true }).click();
    await page.getByRole("button", { name: "Điều kiện", exact: true }).click();
    await expect(page.getByLabel("Từ tháng", { exact: true })).toHaveValue(
      "2026-12",
    );
    expect(calls).toBe(0);
    await page
      .locator(".conditions-form")
      .getByRole("button", { name: "Xem so sánh", exact: true })
      .click();
    await expect(page.getByTestId("v4-R1")).toContainText("Đang vướng");
    await page
      .getByRole("button", { name: "So luân canh", exact: true })
      .click();
    await page.screenshot({
      path: `artifacts/v4-integration/regression/sprint2-${viewport.width}-compare.png`,
    });
    await page
      .locator(".rotation-option")
      .first()
      .getByRole("button", { name: "Cân nhắc phương án", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
      .click();
    await expect(page.locator(".save-notice")).toContainText("Đã lưu");
    const count = calls;
    await page.getByRole("button", { name: "Quan sát", exact: true }).click();
    await page
      .getByRole("button", { name: "So luân canh", exact: true })
      .click();
    await expect(
      page
        .locator(".rotation-option")
        .first()
        .getByRole("button", { name: "Bạn đang cân nhắc", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(calls).toBe(count);
    await page.reload();
    await page
      .getByRole("button", { name: "Mở bản đã lưu", exact: true })
      .click();
    await expect(page.getByTestId("v4-R1")).toContainText("Đang vướng");
  });
}
