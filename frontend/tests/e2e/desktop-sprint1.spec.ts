import { test, expect } from "@playwright/test";
for (const size of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`desktop workspace ${size.width}: modes preserve map and probes`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto("/w/my-thanh/farmer");
    const map = page.locator(".dashboard-map-frame");
    await expect(page.locator(".rotation-option")).toHaveCount(3);
    const wide = (await map.boundingBox())!.width;
    expect(wide / size.width).toBeGreaterThan(0.53);
    expect((await map.boundingBox())!.height).toBeGreaterThanOrEqual(450);
    expect((await map.boundingBox())!.height).toBeLessThanOrEqual(550);
    const workspace = (await page.locator(".field-support").boundingBox())!;
    expect(wide / workspace.width).toBeGreaterThan(0.58);
    expect(wide / workspace.width).toBeLessThan(0.62);
    await page
      .getByRole("button", { name: "Kết quả model", exact: true })
      .click();
    await expect(page.locator(".forecast-plots figure")).toHaveCount(3);
    await page
      .getByRole("button", { name: "So luân canh", exact: true })
      .click();
    await expect(page.locator("main")).toHaveClass(/desktop-decision/);
    await expect
      .poll(async () => (await map.boundingBox())!.width)
      .toBeLessThan(wide * 0.4);
    expect((await map.boundingBox())!.height).toBeLessThanOrEqual(160);
    expect(
      (await page.locator(".rotation-comparison").boundingBox())!.y,
    ).toBeLessThan(180);
    await expect(page.locator(".telemetry-heading")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Quan sát", exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".telemetry-heading")).toContainText(
      "Chưa kết nối",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/remake/sprint1-${size.width}-decision.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Quan sát", exact: true }).click();
    await expect
      .poll(async () => (await map.boundingBox())!.width)
      .toBeGreaterThan(wide * 0.95);
    await page.screenshot({
      path: `artifacts/remake/sprint1-${size.width}-explore.png`,
      fullPage: true,
    });
  });
}
