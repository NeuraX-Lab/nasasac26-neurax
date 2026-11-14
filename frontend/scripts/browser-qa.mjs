/* global window, document, innerWidth, performance */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL,
  args: [
    "--enable-webgl",
    "--enable-unsafe-swiftshader",
    "--use-angle=swiftshader",
  ],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const base = process.env.AGROTWIN_URL || "http://127.0.0.1:5173";
const out = "artifacts";
await mkdir(out, { recursive: true });
const errors = [],
  screens = [],
  accessibility = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
try {
  for (const [name, path] of [
    ["entry-en", "/"],
    ["farmer-en", "/w/my-thanh/farmer"],
    ["power-en", "/w/my-thanh/power"],
  ]) {
    await page.goto(base + path);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    screens.push(name);
    const a = await new AxeBuilder({ page }).analyze();
    accessibility.push({
      screen: name,
      violations: a.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  const spatial = await page.evaluate(async () => {
    const m = window.__agrotwinMap;
    if (!m) throw Error("Use the development server for map instrumentation");
    const center = m.getCenter(),
      elevation = m.queryTerrainElevation(center);
    let frames = 0;
    const count = () => frames++;
    m.on("render", count);
    const begin = performance.now();
    await new Promise((resolve) => {
      m.once("moveend", resolve);
      m.easeTo({ bearing: m.getBearing() + 25, duration: 2000 });
    });
    const seconds = (performance.now() - begin) / 1000;
    m.off("render", count);
    const gl = m.getCanvas().getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return {
      elevation,
      pitch: m.getPitch(),
      exaggeration: m.getTerrain()?.exaggeration,
      renderFrames: frames,
      seconds,
      fps: frames / seconds,
      renderer: ext
        ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
        : "unavailable",
    };
  });
  await page.locator(".map-layer").click();
  await page.getByLabel("Lower render detail").check();
  const reduced = await page.evaluate(async () => {
    const m = window.__agrotwinMap;
    let frames = 0;
    const count = () => frames++;
    m.on("render", count);
    const start = performance.now();
    await new Promise((resolve) => {
      m.once("moveend", resolve);
      m.easeTo({ bearing: m.getBearing() + 25, duration: 2000 });
    });
    m.off("render", count);
    return {
      pixelRatio: m.getPixelRatio(),
      fps: frames / ((performance.now() - start) / 1000),
    };
  });
  spatial.reduced = reduced;
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + "/w/my-thanh/farmer");
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: `${out}/farmer-${width}.png`,
      fullPage: true,
    });
    screens.push(`farmer-${width}`);
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      errors.push(`Horizontal overflow at ${width}`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/w/my-thanh/farmer");
  await page.getByRole("button", { name: "English / Tiếng Việt" }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/farmer-vi.png`, fullPage: true });
  screens.push("farmer-vi");
  await writeFile(
    `${out}/browser-qa.json`,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        screens,
        spatial,
        accessibility,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        screens,
        spatial,
        violations: accessibility.map((a) => ({
          screen: a.screen,
          count: a.violations.length,
        })),
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
