import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({page}) => { await page.route("**/tile.openstreetmap.org/**", r => r.abort()); });
test("hardware synthetic recording, persistent session, replay and map placement", async ({
  page,
}) => {
  await page.goto("/hardware");
  await page.getByRole("button", { name: "Start synthetic stream" }).click();
  await expect(page.getByText("DEMO-NODE-01").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Record session", exact: true })
    .click();
  await expect(page.getByText("Recorded events: 0")).not.toBeVisible({
    timeout: 5000,
  });
  await page.getByRole("button", { name: "Stop & save session" }).click();
  await expect(
    page.getByRole("button", { name: "Replay 1", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Longitude", { exact: true }).fill("106.021621");
  await page.getByLabel("Latitude", { exact: true }).fill("10.479098");
  await page.locator("select[name=area]").selectOption("my-thanh");
  await page.locator("select[name=context]").selectOption("synthetic");
  await page.getByRole("button", { name: "Save location" }).click();
  await page.getByRole("link", { name: "Locate on map" }).click();
  await expect(
    page.getByRole("button", { name: "Device ID: DEMO-NODE-01 (synthetic)" }),
  ).toBeVisible({ timeout: 30000 });
  await page.goto("/hardware");
  await page.getByRole("button", { name: "Replay 1", exact: true }).click();
  await expect(page.locator(".data-mode")).toHaveText("replay · simulated");
  await page.screenshot({
    path: "artifacts/hardware-replay.png",
    fullPage: true,
  });
});
test("USB transport decodes split frames, rejects bad input and disconnects", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let controller: ReadableStreamDefaultController<Uint8Array>;
    const port = {
      readable: new ReadableStream<Uint8Array>({
        start(c) {
          controller = c;
        },
      }),
      open: async () => {
        const line =
          JSON.stringify({
            device_id: "TEST-USB",
            event_type: "temperature",
            timestamp_utc: new Date().toISOString(),
            value: 0,
            unit: "°C",
            quality: "unverified",
            data_mode: "observed",
            source_context: "Test harness",
          }) + "\n";
        controller.enqueue(new TextEncoder().encode(line.slice(0, 15)));
        controller.enqueue(
          new TextEncoder().encode(line.slice(15) + "broken\n"),
        );
      },
      close: async () => {},
    };
    Object.defineProperty(navigator, "serial", {
      configurable: true,
      value: { requestPort: async () => port },
    });
  });
  await page.goto("/hardware");
  await page.getByRole("button", { name: "Connect USB / serial" }).click();
  await expect(page.locator(".connection-status")).toHaveText("● Connected");
  await expect(page.locator(".sensor-value")).toContainText("0");
  await expect(page.getByText("Rejected: 1")).toBeVisible();
  await page.getByRole("button", { name: "Disconnect", exact: true }).click();
  await expect(page.locator(".connection-status")).toContainText(
    "Disconnected",
  );
});
test("monthly inspector and grounded assistant follow context", async ({
  page,
}) => {
  await page.goto("/w/my-thanh/power");
  await page
    .getByRole("button", { name: "Rainfall 6: Needs inspection" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("2020");
  await expect(page.getByRole("dialog")).toContainText(
    "curated-D1-2026-11-14",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Contextual guide (templates)", exact: true }).click();
  await page.getByRole("button", { name: "Why is there no ranking?" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "No applicable A1 ranking",
  );
  await page.keyboard.press("Escape");
});
test("hardware language, accessibility and mobile layout", async ({ page }) => {
  await page.goto("/hardware");
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "English / Tiếng Việt" }).click();
  await expect(
    page.getByRole("heading", { name: "Kết nối thiết bị. Kiểm từng số đo." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/hardware-mobile-vi.png",
    fullPage: true,
  });
});

test("field groups persist and comparison keeps scores unavailable", async ({
  page,
}) => {
  await page.goto("/setup");
  await page
    .getByLabel("Farm / field group", { exact: true })
    .fill("Family farm");
  await page.getByLabel("Area name", { exact: true }).fill("North plot");
  await page
    .getByLabel("Coordinates (longitude, latitude)", { exact: true })
    .fill("106.02,10.48\n106.021,10.48\n106.021,10.481");
  await page.getByRole("button", { name: "Save & open area" }).click();
  await page.goto("/");
  await expect(
    page.getByRole("option", { name: "Family farm" }),
  ).toBeAttached();
  await page.getByRole("link", { name: "North plot" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your rotation prerequisites" }),
  ).toBeVisible();
  await page.goto("/w/my-thanh/farmer");
  await expect(page.locator(".computed-rotation")).toHaveCount(3);
  for (const card of await page.locator(".computed-rotation").all()) {
    await expect(card).toContainText("Score: unavailable");
    await expect(card).toContainText("Needs review");
  }
});
