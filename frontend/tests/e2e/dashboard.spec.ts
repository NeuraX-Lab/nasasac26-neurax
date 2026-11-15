import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function open(page: Page) {
  await page.goto("/w/my-thanh/farmer");
  await expect(page.locator(".rotation-option")).toHaveCount(3);
}
async function edit(page: Page) {
  await page
    .getByRole("button", { name: "Sửa điều kiện", exact: true })
    .click();
}
async function conditions(page: Page) {
  await edit(page);
  await page.getByLabel("Từ tháng", { exact: true }).fill("2026-12");
  await page.getByLabel("Đến tháng", { exact: true }).fill("2027-02");
  await page.getByLabel("Cây hiện tại", { exact: true }).selectOption("rice");
  await page.getByLabel("Nguồn tưới", { exact: true }).selectOption("limited");
  await page.getByLabel("Thoát nước", { exact: true }).selectOption("poor");
  await page.getByLabel("Ưu tiên", { exact: true }).selectOption("water");
}
async function execute(page: Page) {
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v1/analysis") && r.request().method() === "POST",
  );
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  const http = await response;
  expect(http.ok()).toBe(true);
  const run = await http.json();
  await expect(page.getByTestId("result-state")).not.toContainText(
    "cần cập nhật",
  );
  return run;
}
test("prepared profile has sourced natural imagery, no fabricated sensors and no automatic inference", async ({
  page,
}) => {
  let calls = 0;
  page.on("request", (r) => {
    if (r.method() === "POST") calls++;
  });
  await open(page);
  await expect(
    page.getByRole("heading", { name: "Ruộng của tôi · Mỹ Thành" }),
  ).toBeVisible();
  await expect(page.locator(".sensor-number")).toHaveText([
    "—°C",
    "—%RH",
    "—ADC",
  ]);
  await expect(
    page.getByRole("button", {
      name: "A · đầu dò đất · vị trí minh họa",
      exact: true,
    }),
  ).toBeVisible();
  const map = await page.evaluate(() => {
    const m = (window as any).__agrotwinMap;
    return {
      pitch: m.getPitch(),
      terrain: m.getTerrain(),
      sources: m.getStyle().sources,
    };
  });
  expect(map.pitch).toBe(0);
  expect(map.terrain).toBeNull();
  expect(JSON.stringify(map.sources)).toContain("World_Imagery");
  expect(calls).toBe(0);
  await page.screenshot({
    path: "artifacts/remake/after-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await expect(page.locator(".forecast-table tbody tr")).toHaveCount(2);
  await expect(page.locator(".climate-context")).toContainText(
    "Bản kết quả đã lưu",
  );
  await expect(page.locator(".forecast-table")).toContainText("2027");
});
test("A + D: real input → API → select → persist → reload → reopen; edits become stale", async ({
  page,
}) => {
  await open(page);
  await conditions(page);
  await expect(page.getByTestId("result-state")).toContainText("cần cập nhật");
  const run = await execute(page);
  expect(run.inputs.farm).toMatchObject({
    season: "2026-12 / 2027-02",
    irrigation_access: "limited",
    drainage_condition: "poor",
    goal: "water",
  });
  expect(
    run.a1.results.every(
      (r: any) => r.score === null && r.eligibility === "needs_review",
    ),
  ).toBe(true);
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
  expect(saved.run.a1.run_id).toBe(run.a1.run_id);
  expect(saved.chosen).toBe("R1");
  expect(saved.climateSnapshot.schema_version).toBe("fieldshift-2");
  await page.reload();
  await page.getByRole("button", { name: "Mở bản đã lưu" }).click();
  await expect(page.getByTestId("result-state")).toContainText(
    "Bản dự kiến đã lưu",
  );
  await expect(page.locator(".next-action")).toContainText(
    "Lúa → Bắp non → Lúa",
  );
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await expect(page.locator(".forecast-table tbody tr")).toHaveCount(2);
  await edit(page);
  await expect(page.getByLabel("Nguồn tưới", { exact: true })).toHaveValue(
    "limited",
  );
  await page.getByLabel("Đến tháng", { exact: true }).fill("2027-04");
  await expect(
    page.getByRole("button", { name: "Lưu bản dự kiến", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".climate-context")).toContainText(
    "Đầu vào đã đổi",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("agrotwin-draft-2:my-thanh")!).draft
          .farm.season,
    ),
  ).toBe("2026-12 / 2027-02");
});
test("B: a distinct polygon sends its geometry and never borrows pilot catalog or model", async ({
  page,
}) => {
  await page.goto("/setup");
  await page
    .getByLabel("Tên vùng", { exact: true })
    .fill("Thửa kiểm thử ranh riêng");
  await page
    .getByLabel("Tọa độ (kinh độ, vĩ độ)", { exact: true })
    .fill("106.03,10.48\n106.031,10.48\n106.031,10.481\n106.03,10.481");
  await page.getByRole("button", { name: "Lưu và mở vùng" }).click();
  await expect(page).toHaveURL(/\/w\/area-.*\/farmer/);
  await conditions(page);
  const run = await execute(page);
  expect(run.inputs.aoi_id).not.toBe("MT-BLOCK-01");
  expect(run.inputs.geometry.features[0].geometry.coordinates[0][0]).toEqual([
    106.03, 10.48,
  ]);
  expect(run.sidecar.catalog_supported).toBe(false);
  expect(run.a1.results).toEqual([]);
  if (run.source) {
    expect(run.source.query_point_lon_lat[0]).toBeGreaterThan(106.029);
    expect(run.source.query_point_lon_lat[0]).toBeLessThan(106.032);
  }
  await expect(page.locator(".rotation-option")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Chưa có catalog luân canh cho thửa này",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quan sát", exact: true }).click();
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await expect(page.locator(".climate-context")).toContainText(
    "chưa hỗ trợ ranh",
  );
  await expect(page.locator(".forecast-table")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "A · đầu dò đất · vị trí minh họa",
      exact: true,
    }),
  ).toHaveCount(0);
});
test("API errors and wrong-scope responses keep edited inputs stale; delayed results cannot overwrite edits", async ({
  page,
}) => {
  await open(page);
  await conditions(page);
  await page.route("**/api/v1/analysis", (r) =>
    r.fulfill({ status: 503, body: "test outage" }),
  );
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Chưa cập nhật");
  await expect(page.getByTestId("result-state")).toContainText("cần cập nhật");
  await page.unroute("**/api/v1/analysis");
  await page.route("**/api/v1/analysis", async (r) => {
    const data = await (await r.fetch()).json();
    data.inputs.aoi_id = "wrong-scope";
    await r.fulfill({ json: data });
  });
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("does not match");
  await page.unroute("**/api/v1/analysis");
  let release: () => void = () => {};
  let requested = false;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/api/v1/analysis", async (r) => {
    const response = await r.fetch();
    requested = true;
    await gate;
    await r.fulfill({ response }).catch(() => {});
  });
  await page
    .locator(".conditions-form")
    .getByRole("button", { name: "Xem so sánh", exact: true })
    .click();
  await expect.poll(() => requested).toBe(true);
  await page
    .getByLabel("Nguồn tưới", { exact: true })
    .selectOption("available");
  release();
  await expect(page.getByTestId("result-state")).toContainText("cần cập nhật");
  await expect(
    page.getByRole("button", { name: "Lưu bản dự kiến", exact: true }),
  ).toBeDisabled();
});
test("v2 malformed payload and unsupported target months do not become a fresh forecast", async ({
  page,
}) => {
  await page.route("**/snapshots/v2/overview.json", (r) =>
    r.fulfill({ json: { schema_version: "0.1-proposal" } }),
  );
  await open(page);
  await page
    .getByRole("button", { name: "Kết quả model", exact: true })
    .click();
  await expect(page.locator(".climate-context")).toContainText(
    "Không tải được bản lưu model",
  );
  await expect(page.locator(".forecast-table")).toHaveCount(0);
  await page.unroute("**/snapshots/v2/overview.json");
  await page.getByRole("button", { name: "Thử tải lại bản lưu" }).click();
  await expect(page.locator(".forecast-table tbody tr")).toHaveCount(2);
  await conditions(page);
  await page.getByLabel("Từ tháng", { exact: true }).fill("2027-05");
  await page.getByLabel("Đến tháng", { exact: true }).fill("2027-08");
  await expect(page.locator(".climate-context")).toContainText(
    "không có tháng nằm trong vụ",
  );
  await expect(page.locator(".forecast-table")).toHaveCount(0);
});
test("C: serial harness supplies three correctly labelled readings; disconnect preserves stale values and A/B links", async ({
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
        const lines =
          [
            ["air_temperature", 0, "°C"],
            ["relative_humidity", 77, "%RH"],
            ["soil_moisture_adc", 1234, "ADC"],
          ]
            .map(([event_type, value, unit]) =>
              JSON.stringify({
                device_id: "TEST-BENCH",
                event_type,
                value,
                unit,
                timestamp_utc: new Date().toISOString(),
                data_mode: "observed",
                quality: "unverified",
                source_context:
                  "Explicit test harness · bench, not a real field sensor",
              }),
            )
            .join("\n") + "\n";
        controller.enqueue(new TextEncoder().encode(lines));
      },
      close: async () => {},
    };
    Object.defineProperty(navigator, "serial", {
      configurable: true,
      value: { requestPort: async () => port },
    });
  });
  await page.goto("/hardware");
  await page
    .getByRole("button", { name: "Kết nối USB / serial", exact: true })
    .click();
  await expect(page.locator(".connection-status")).toContainText("Đã kết nối");
  await page
    .getByRole("link", { name: "So lịch luân canh", exact: true })
    .click();
  await expect(page.locator(".sensor-number")).toHaveText([
    "0°C",
    "77%RH",
    "1.234ADC",
  ]);
  await page
    .getByRole("button", {
      name: "A · đầu dò đất · vị trí minh họa",
      exact: true,
    })
    .click();
  await expect(page.locator(".sensor-reading").nth(2)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".sensor-detail")).toContainText(
    "ADC chưa hiệu chuẩn",
  );
  await page
    .getByRole("button", {
      name: "B · đầu đo không khí · vị trí minh họa",
      exact: true,
    })
    .click();
  await expect(page.locator(".sensor-reading").nth(0)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".sensor-reading").nth(1)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("link", { name: "Thiết bị", exact: true }).click();
  await page.getByRole("button", { name: "Ngắt kết nối", exact: true }).click();
  await page
    .getByRole("link", { name: "So lịch luân canh", exact: true })
    .click();
  await expect(page.locator(".sensor-status").first()).toContainText("đã cũ");
  await expect(page.locator(".sensor-number").first()).toHaveText("0°C");
});
test("mobile keyboard, real API, save and serious accessibility regression", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await conditions(page);
  await execute(page);
  const option = page
    .locator(".rotation-option")
    .nth(2)
    .locator(":scope > button");
  await option.focus();
  await page.keyboard.press("Enter");
  await expect(option).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
    .click();
  await expect(page.locator(".save-notice")).toContainText("Đã lưu");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((x) =>
      ["serious", "critical"].includes(x.impact || ""),
    ),
  ).toEqual([]);
  await page.screenshot({
    path: "artifacts/remake/after-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Xem bản đồ", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "A · đầu dò đất · vị trí minh họa",
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/remake/after-mobile-map.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Thu gọn bản đồ", exact: true })
    .click();
  await page
    .locator(".mobile-option-nav")
    .getByRole("button", { name: "Chuỗi lúa", exact: true })
    .click();
  await expect(page.locator(".rotation-option").first()).toBeInViewport();
});
test("map imagery failure retains a truthful fallback, and legacy planner routes use the dashboard", async ({
  page,
}) => {
  await page.route("**/World_Imagery/**", (r) => r.abort());
  await open(page);
  await expect(page.locator(".imagery-warning")).toBeVisible();
  await expect(page.locator(".rotation-option")).toHaveCount(3);
  await page.goto("/plan");
  await expect(page).toHaveURL(/\/w\/my-thanh\/farmer$/);
  await page.goto("/w/my-thanh/power");
  await expect(page).toHaveURL(/\/w\/my-thanh\/farmer$/);
});
test("storage failure never reports a saved draft", async ({ page }) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("agrotwin-draft-2:"))
        throw new DOMException("Test storage blocked", "QuotaExceededError");
      return set.call(this, key, value);
    };
  });
  await open(page);
  await page
    .locator(".rotation-option")
    .first()
    .getByRole("button", { name: "Cân nhắc phương án", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Lưu bản dự kiến", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Không lưu được");
  await expect(page.locator(".save-notice")).toBeEmpty();
  await expect(page.getByRole("button", { name: "Mở bản đã lưu" })).toHaveCount(
    0,
  );
});
test("draw, undo, confirm, edit and cancel keep the existing boundary workflow", async ({
  page,
}) => {
  await page.goto("/setup");
  const draw = page.getByRole("button", { name: "Vẽ ranh", exact: true });
  await expect(draw).toBeEnabled();
  await draw.click();
  const box = await page.locator(".maplibregl-canvas").boundingBox();
  if (!box) throw Error("Map missing");
  for (const [x, y] of [
    [0.4, 0.4],
    [0.6, 0.4],
    [0.6, 0.6],
    [0.4, 0.4],
  ])
    await page.mouse.click(box.x + box.width * x, box.y + box.height * y);
  const coords = page.getByLabel("Tọa độ (kinh độ, vĩ độ)", { exact: true });
  await expect(coords).not.toHaveValue("");
  await page
    .getByRole("button", { name: "Hoàn tác ranh", exact: true })
    .click();
  await expect(coords).toHaveValue("");
  await coords.fill(
    "106.04,10.48\n106.041,10.48\n106.041,10.481\n106.04,10.481",
  );
  await page.getByLabel("Tên vùng", { exact: true }).fill("Thửa kiểm thử vẽ");
  await page.getByRole("button", { name: "Lưu và mở vùng" }).click();
  const url = page.url();
  await page.getByRole("link", { name: "Sửa ranh", exact: true }).click();
  await coords.fill(
    "106.05,10.48\n106.051,10.48\n106.051,10.481\n106.05,10.481",
  );
  await page.getByRole("link", { name: "Hủy sửa ranh" }).click();
  await expect(page).toHaveURL(url);
  await page.getByRole("link", { name: "Sửa ranh", exact: true }).click();
  await expect(coords).toHaveValue(/106\.04,/);
});
test("map expansion traps keyboard focus and Escape restores the trigger; desktop has no serious axe issues", async ({
  page,
}) => {
  await open(page);
  const trigger = page.getByRole("button", {
    name: "Mở rộng bản đồ",
    exact: true,
  });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest("[role=dialog]"),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((x) =>
      ["serious", "critical"].includes(x.impact || ""),
    ),
  ).toEqual([]);
});
test("unavailable saved A1 still permits a real analysis; no WebGL leaves the outline and decisions usable", async ({
  page,
}) => {
  await page.route("**/analysis/my-thanh.saved.json", (r) =>
    r.fulfill({ json: { invalid: true } }),
  );
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: any[]
    ) {
      if (type.includes("webgl")) return null;
      return (original as any).apply(this, [type, ...args]);
    } as any;
  });
  await page.goto("/w/my-thanh/farmer");
  await expect(
    page.getByRole("button", { name: "Sửa điều kiện", exact: true }),
  ).toBeVisible();
  await conditions(page);
  const run = await execute(page);
  expect(run.a1.results).toHaveLength(3);
  await expect(page.locator(".map-fallback svg[role=img]")).toBeVisible();
  await expect(page.locator(".rotation-option")).toHaveCount(3);
});
