import { test, expect } from "@playwright/test";
test("pending satellite tiles are labelled loading even after AOI and probes mount", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/World_Imagery/**", async (route) => {
    await gate;
    await route.abort();
  });
  try {
    await page.goto("/w/my-thanh/farmer");
    await expect(page.locator(".probe-marker")).toHaveCount(2);
    await expect(page.locator(".spatial-map")).toHaveAttribute(
      "data-basemap-state",
      "loading",
    );
    await expect(page.locator(".basemap-loading")).toBeVisible();
    expect(
      await page.evaluate(
        () => !!(window as any).__agrotwinMap?.getSource("aoi"),
      ),
    ).toBe(true);
    await page.screenshot({
      path: "artifacts/v4-integration/regression/sprint21-tiles-pending.png",
    });
  } finally {
    release();
  }
  await expect(page.locator(".spatial-map")).toHaveAttribute(
    "data-basemap-state",
    "error",
    { timeout: 20000 }, // Tile loading has an explicit 12-second deadline.
  );
  await expect(page.locator(".imagery-warning")).toBeVisible();
});
for (const size of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`compare-first ${size.width}: blocked draft, save state and mini-map`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize(size);
    await page.goto("/w/my-thanh/farmer");
    const map = page.locator(".spatial-map");
    await expect(map).toHaveAttribute("data-basemap-state", /ready|error/, {
      timeout: 20000,
    });
    await page.getByRole("button", { name: "Điều kiện", exact: true }).click();
    await page.getByLabel("Từ tháng", { exact: true }).fill("2026-12");
    await page.getByLabel("Đến tháng", { exact: true }).fill("2027-02");
    await page.getByLabel("Thoát nước", { exact: true }).selectOption("poor");
    await page
      .locator(".conditions-form")
      .getByRole("button", { name: "Xem so sánh", exact: true })
      .click();
    await expect(page.getByTestId("v4-R1")).toContainText("Đang vướng");
    await page
      .getByRole("button", { name: "So luân canh", exact: true })
      .click();
    await expect(page.locator(".climate-context")).toBeHidden();
    await expect(page.locator(".sensor-strip")).toBeHidden();
    await expect
      .poll(
        async () =>
          (await page.locator(".rotation-comparison").boundingBox())!.y,
      )
      .toBeLessThan(180);
    expect(
      (await page.locator(".dashboard-map-frame").boundingBox())!.height,
    ).toBeLessThanOrEqual(160);
    await page
      .locator("#option-R1")
      .getByRole("button", { name: "Cân nhắc phương án", exact: true })
      .click();
    await expect(page.locator(".blocked-draft-warning")).toContainText(
      "không phải phương án được khuyến nghị",
    );
    await page
      .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
      .click();
    await expect(page.locator(".save-notice")).toContainText("Đã lưu");
    await expect(page.locator(".draft-selection-state")).toContainText(
      "Đã có bản lưu khớp",
    );
    await page
      .locator("#option-R0")
      .getByRole("button", { name: "Cân nhắc phương án", exact: true })
      .click();
    await expect(page.locator(".draft-selection-state")).toContainText(
      "Chưa lưu lựa chọn này",
    );
    await page
      .getByRole("button", { name: "Mở bản đã lưu", exact: true })
      .click();
    await expect(page.locator("#option-R1>button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page
      .getByRole("button", { name: "So luân canh", exact: true })
      .click();
    await page.screenshot({
      path: `artifacts/v4-integration/regression/sprint21-${size.width}-compare.png`,
    });
    await page.locator(".field-support").scrollIntoViewIfNeeded();
    await expect(map).toHaveAttribute("data-basemap-state", /ready|error/, {
      timeout: 20000,
    });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await page.screenshot({
      path: `artifacts/v4-integration/regression/sprint21-${size.width}-context.png`,
    });
    await page
      .getByRole("button", { name: "Mở rộng bản đồ", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}
test("tile failure retains AOI, probes and source instead of an unlabelled blank map", async ({
  page,
}) => {
  await page.route("https://services.arcgisonline.com/**", (route) =>
    route.abort(),
  );
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
  await page.goto("/w/my-thanh/farmer");
  await expect(page.locator(".spatial-map")).toHaveAttribute(
    "data-basemap-state",
    "error",
    { timeout: 20000 }, // Tile loading has an explicit 12-second deadline.
  );
  await expect(page.locator(".imagery-warning")).toBeVisible();
  await expect(page.locator(".probe-marker")).toHaveCount(2);
  await expect(page.locator(".basemap-source")).toContainText("OSM");
  expect(
    await page.evaluate(
      () => !!(window as any).__agrotwinMap?.getSource("aoi"),
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/v4-integration/regression/sprint21-tile-fallback.png",
  });
});
