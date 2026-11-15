import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { realpathSync } from "node:fs";
export default defineConfig(({ command }) => ({
  // Preserve the original local photograph, but never distribute unlicensed imagery.
  publicDir: command === "build" ? false : "public",
  plugins: [
    react(),
    tailwind(),
    {
      name: "agrotwin-demo-identity",
      configureServer(server) {
        server.middlewares.use("/__agrotwin_demo", (_request, response) => {
          response.setHeader("Content-Type", "application/json");
          response.end(
            JSON.stringify({
              app: "AgroTwin",
              selected_system: "v4",
              root: resolve("."),
            }),
          );
        });
      },
    },
    {
      name: "curated-public-assets",
      apply: "build",
      async closeBundle() {
        for (const asset of [
          "favicon.svg",
          "analysis",
          "research",
          "snapshots",
          "terrain",
          "imagery/my-thanh-research.svg",
          "imagery/context",
        ]) {
          const destination = resolve("dist", asset);
          await mkdir(resolve(destination, ".."), { recursive: true });
          await cp(resolve("public", asset), destination, { recursive: true });
        }
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    // Native Windows worktrees can reuse a trusted dependency junction.
    fs: { allow: [resolve("."), realpathSync("node_modules")] },
    watch: {
      ignored: [
        "**/artifacts/**",
        "**/test-results/**",
        "**/playwright-report/**",
      ],
    },
    proxy: {
      "/api/v4": {
        target: "http://127.0.0.1:8184",
      },
      "/api/v2": {
        target: "http://127.0.0.1:8182",
        headers: { origin: "http://127.0.0.1:8182" },
      },
      "/api": {
        target: "http://127.0.0.1:8000",
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    proxy: {
      "/api/v4": {
        target: "http://127.0.0.1:8184",
      },
      "/api/v2": {
        target: "http://127.0.0.1:8182",
        headers: { origin: "http://127.0.0.1:8182" },
      },
      "/api": {
        target: "http://127.0.0.1:8000",
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: { chunkSizeWarningLimit: 1600 },
}));
