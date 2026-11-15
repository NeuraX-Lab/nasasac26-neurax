import { test, expect } from "@playwright/test";

// Explicit software harness. Never constitutes real USB permission/hardware verification.
test("SIMULATED_ONLY: dashboard USB wait, text channels, QA, stale, loss and reconnect", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let stream: ReadableStreamDefaultController<Uint8Array>;
    (window as any).__emitUSB = (line: string) =>
      stream.enqueue(new TextEncoder().encode(line + "\r\n"));
    (window as any).__loseUSB = () =>
      stream.error(new Error("Unplugged test harness"));
    Object.defineProperty(navigator, "serial", {
      configurable: true,
      value: {
        requestPort: async () => ({
          readable: new ReadableStream<Uint8Array>({
            start(c) {
              stream = c;
            },
          }),
          open: async () => {},
          close: async () => {},
        }),
      },
    });
  });
  await page.goto("/w/my-thanh/farmer");
  await page.locator(".usb-connect summary").click();
  await page.getByLabel("Baud firmware").selectOption("115200");
  await page
    .getByRole("button", { name: "Chọn cổng USB", exact: true })
    .click();
  await expect(page.locator(".telemetry-heading")).toContainText("chờ số đo");
  await page.evaluate(() =>
    (window as any).__emitUSB("[LOI] Khong tim thay cam bien GY-21!"),
  );
  await page.locator(".usb-diagnostics summary").click();
  await expect(page.locator(".usb-diagnostics")).toContainText("GY-21");
  await page.evaluate(() =>
    (window as any).__emitUSB("Do am dat: 38.0% (Raw ADC: 3086)"),
  );
  await expect(page.locator(".sensor-number").nth(2)).toContainText("3.086");
  await expect(page.locator(".sensor-number").first()).toContainText("—");
  await page.locator(".sensor-reading").nth(2).click();
  await expect(page.locator(".sensor-detail")).toContainText(
    "USB-UART-unidentified / raw_adc",
  );
  await expect(page.locator(".sensor-detail")).toContainText("REAL_USB");
  await expect(page.locator(".sensor-detail")).toContainText(
    "không cung cấp giờ đo hoặc ID",
  );
  await page.getByRole("button", { name: "Đóng chi tiết đầu đo" }).click();
  await page.evaluate(() =>
    (window as any).__emitUSB("Nhiet do KK: 24.63 C | Do am KK: 47.39 %"),
  );
  await expect(page.locator(".sensor-number").first()).toContainText("24,6");
  await expect(page.locator(".sensor-number").nth(1)).toContainText("47,4");
  await page.evaluate(() => (window as any).__emitUSB("bad-packet"));
  await expect(page.locator(".sensor-strip .inline-warning")).toContainText(
    "1",
  );
  await page.clock.install();
  await page.clock.fastForward(31000);
  await expect(page.locator(".telemetry-heading")).toContainText("đã cũ");
  await page.evaluate(() => (window as any).__loseUSB());
  await expect(page.locator(".telemetry-heading")).toContainText("Mất kết nối");
  await expect(page.locator(".sensor-number").nth(2)).toContainText("3.086");
  await page.locator(".usb-connect summary").click();
  await page
    .getByRole("button", { name: "Chọn cổng USB", exact: true })
    .click();
  await expect(page.locator(".telemetry-heading")).toContainText("chờ số đo");
  await expect(page.locator(".sensor-number").nth(2)).toContainText("—");
  await page.evaluate(() => (window as any).__emitUSB("Do am dat: 38.0% (Raw ADC: 3086)"));
  await expect(page.locator(".sensor-number").nth(2)).toContainText("3.086");
  await page.getByRole("link", { name: "Thiết bị", exact: true }).click();
  const pipeline=page.getByRole("region",{name:"H1 data pipeline"});
  await pipeline.getByRole("button",{name:"Đồng bộ event vào pipeline",exact:true}).click();
  await expect(pipeline.getByRole("alert")).toContainText("giờ thiết bị chưa được xác minh");
});

for (const width of [1440, 1920])
  test(`actual UI ${width}: real map, empty probe provenance, historical comparison`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 1080 });
    await page.goto("/w/my-thanh/farmer");
    await expect(page.locator(".spatial-map")).toHaveAttribute(
      "data-basemap-state",
      "ready",
      { timeout: 30000 },
    );
    await page.evaluate(
      () =>
        new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        ),
    );
    await expect(page.locator(".telemetry-heading")).toContainText(
      "Chưa kết nối",
    );
    await page.screenshot({ path: `artifacts/sprint3a/observe-${width}.png` });
    const mapHeight = (await page.locator(".spatial-map").boundingBox())!
      .height;
    await page.locator(".probe-marker").filter({ hasText: "A" }).click();
    await expect(page.locator(".sensor-detail")).toContainText(
      "Chưa có event hợp lệ",
    );
    await expect(page.locator(".sensor-detail")).toContainText(
      "Vị trí minh họa trong AOI Mỹ Thành",
    );
    await page.locator(".sensor-detail").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/sprint3a/probe-A-${width}.png` });
    await page.locator(".probe-marker").filter({ hasText: "B" }).click();
    await expect(page.locator(".sensor-detail .probe-channel")).toHaveCount(2);
    await expect
      .poll(
        async () => (await page.locator(".spatial-map").boundingBox())!.height,
      )
      .toBeLessThanOrEqual(mapHeight + 2);
    await page.locator(".sensor-detail").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/sprint3a/probe-B-${width}.png` });
    await page.getByRole("button", { name: "Đóng chi tiết đầu đo" }).click();
    await expect(page.locator('.probe-marker[data-probe="B"]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator('.probe-marker[data-probe="B"]')).toBeFocused();
    await expect(page.locator(".sensor-detail")).toBeVisible();
    await page.getByRole("button", { name: "Đóng chi tiết đầu đo" }).focus();
    await page.keyboard.press("Escape");
    await expect(page.locator(".sensor-detail")).toHaveCount(0);
    await page.getByRole("button", { name: "Điều kiện", exact: true }).click();
    await page.getByLabel("Từ tháng", { exact: true }).fill("2026-12");
    await page.getByLabel("Đến tháng", { exact: true }).fill("2027-02");
    await page
      .locator(".conditions-form")
      .getByRole("button", { name: "Xem so sánh", exact: true })
      .click();
    await expect(page.getByTestId("v2-R1")).toBeVisible();
    await page.getByRole("button", { name: "Quan sát", exact: true }).click();
    await expect(page.locator(".climate-card h2")).toContainText(
      "không phải timeline vụ",
    );
    await expect(page.locator(".climate-card .recharts-line")).toHaveCount(0);
    await page
      .locator(".climate-context")
      .screenshot({ path: `artifacts/sprint3a/calendar-history-${width}.png` });
  });

test("SIMULATED_ONLY: port-open failure and reload require an explicit new chooser", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).__chooserCalls = 0;
    Object.defineProperty(navigator, "serial", {
      configurable: true,
      value: {
        requestPort: async () => {
          (window as any).__chooserCalls++;
          return {
            readable: null,
            open: async () => {
              throw new DOMException("Busy or unavailable", "NetworkError");
            },
            close: async () => {},
          };
        },
      },
    });
  });
  await page.goto("/w/my-thanh/farmer");
  expect(await page.evaluate(() => window.isSecureContext)).toBe(true);
  await page.locator(".usb-connect summary").click();
  await page.getByLabel("Baud firmware").selectOption("115200");
  await page
    .getByRole("button", { name: "Chọn cổng USB", exact: true })
    .click();
  await expect(page.locator(".sensor-strip [role=alert]")).toContainText(
    "connectionFailed",
  );
  expect(await page.evaluate(() => (window as any).__chooserCalls)).toBe(1);
  await page.reload();
  await expect(page.locator(".telemetry-heading")).toContainText(
    "Chưa kết nối",
  );
  expect(await page.evaluate(() => (window as any).__chooserCalls)).toBe(0);
});
