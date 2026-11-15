import { test, expect, type Page } from "@playwright/test";

async function mapReady(page: Page) {
  await expect(page.locator(".spatial-map")).toHaveAttribute(
    "data-basemap-state",
    "ready",
    { timeout: 30000 },
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

test("live tiles: browser offline → explicit retry offline → online recovery preserves map/AOI/probes", async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  let responses = 0;
  page.on("response", (r) => {
    if (r.url().includes("/World_Imagery/") && r.ok()) responses++;
  });
  await page.goto("/w/my-thanh/farmer");
  await mapReady(page);
  expect(responses).toBeGreaterThan(0);
  await page.evaluate(() => {
    (window as any).__hardeningOriginalMap = (window as any).__agrotwinMap;
    (window as any).__hardeningOriginalAOI = (
      window as any
    ).__agrotwinMap.getSource("aoi");
  });
  try {
    await context.setOffline(true);
    await expect(page.locator(".spatial-map")).toHaveAttribute(
      "data-basemap-state",
      "error",
    );
    await expect(page.locator(".probe-marker")).toHaveCount(2);
    await page
      .locator(".imagery-warning")
      .getByRole("button", { name: "Thử lại", exact: true })
      .click();
    await expect(page.locator(".spatial-map")).toHaveAttribute(
      "data-basemap-state",
      "error",
    );
    await page.screenshot({ path: "artifacts/v4-integration/regression/hardening-offline.png" });
    const before = responses;
    await context.setOffline(false);
    await mapReady(page);
    await expect.poll(() => responses).toBeGreaterThan(before);
    expect(
      await page.evaluate(
        () =>
          (window as any).__hardeningOriginalMap ===
            (window as any).__agrotwinMap &&
          (window as any).__hardeningOriginalAOI ===
            (window as any).__agrotwinMap.getSource("aoi"),
      ),
    ).toBe(true);
    await expect(page.locator(".probe-marker")).toHaveCount(2);
    await expect(page.locator(".imagery-warning")).toHaveCount(0);
    await page.screenshot({ path: "artifacts/v4-integration/regression/hardening-recovered.png" });
  } finally {
    await context.setOffline(false);
  }
});

test("pending tile timeout keeps geometry and explicit retry streams real tiles successfully", async ({
  page,
}) => {
  test.setTimeout(120000);
  let release!: () => void;
  let pause = true;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/World_Imagery/**", async (route) => {
    if (pause) {
      await gate;
      // MapLibre may already have cancelled a tile when the layer timed out.
      await route.abort().catch((error) => {
        if (!String(error).includes("already handled")) throw error;
      });
    } else await route.continue();
  });
  try {
    await page.goto("/w/my-thanh/farmer");
    await expect(page.locator(".probe-marker")).toHaveCount(2);
    await expect(page.locator(".spatial-map")).toHaveAttribute(
      "data-basemap-state",
      "loading",
    );
    await expect(page.locator(".spatial-map")).toHaveAttribute(
      "data-basemap-state",
      "error",
      { timeout: 20000 },
    );
    await expect(page.locator(".imagery-warning")).toBeVisible();
    await expect(page.locator(".probe-marker")).toHaveCount(2);
    expect(
      await page.evaluate(
        () => !!(window as any).__agrotwinMap?.getSource("aoi"),
      ),
    ).toBe(true);
    await page.screenshot({ path: "artifacts/v4-integration/regression/hardening-timeout.png" });
    pause = false;
    release();
    await page.unrouteAll({ behavior: "wait" });
    await page
      .locator(".imagery-warning")
      .getByRole("button", { name: "Thử lại", exact: true })
      .click();
    await mapReady(page);
    await page.screenshot({
      path: "artifacts/v4-integration/regression/hardening-retry-success.png",
    });
  } finally {
    release();
  }
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`demo regression ${viewport.width}: NASA → V4 → compare → save/reopen → compact map`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize(viewport);
    await page.goto("/w/my-thanh/farmer");
    await mapReady(page);
    await expect(page.locator("#climate-title")).toContainText("NASA POWER");
    await expect(page.locator(".telemetry-heading")).toContainText(
      "Chưa kết nối",
    );
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
    await expect
      .poll(
        async () =>
          (await page.locator(".rotation-comparison").boundingBox())!.y,
      )
      .toBeLessThan(180);
    await page
      .locator("#option-R1")
      .getByRole("button", { name: "Cân nhắc phương án", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
      .click();
    await expect(page.locator(".save-notice")).toContainText("Đã lưu");
    await page.reload();
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
      path: `artifacts/v4-integration/regression/hardening-${viewport.width}-compare.png`,
    });
    const panel = page.locator(".field-support");
    expect((await panel.boundingBox())!.width).toBeLessThanOrEqual(660);
    expect((await panel.boundingBox())!.height).toBeLessThanOrEqual(220);
    await panel.scrollIntoViewIfNeeded();
    await mapReady(page);
    await page.screenshot({
      path: `artifacts/v4-integration/regression/hardening-${viewport.width}-context.png`,
    });
    await page
      .getByRole("button", { name: "Mở rộng bản đồ", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await mapReady(page);
    expect(
      (await page.getByRole("dialog").boundingBox())!.height,
    ).toBeGreaterThan(viewport.height * 0.8);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Mở map, khí hậu & số đo", exact: true })
      .click();
    await expect(page.locator(".climate-context")).toBeVisible();
    await expect(page.locator(".telemetry-heading")).toContainText(
      "Chưa kết nối",
    );
    await mapReady(page);
    await page.screenshot({
      path: `artifacts/v4-integration/regression/hardening-${viewport.width}-observe.png`,
    });
  });
}
