import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const channel =
  process.env.PLAYWRIGHT_CHANNEL ||
  (existsSync("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe")
    ? "msedge"
    : undefined);
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: process.env.AGROTWIN_BASE_URL || "http://127.0.0.1:5174",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    launchOptions: {
      channel,
      args: [
        "--enable-webgl",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174",
    url: process.env.AGROTWIN_BASE_URL || "http://127.0.0.1:5174",
    reuseExistingServer: true,
    timeout: 30000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
