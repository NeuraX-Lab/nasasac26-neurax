import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
export default defineConfig(({ command }) => ({
  // Preserve the original local photograph, but never distribute unlicensed imagery.
  publicDir: command === "build" ? false : "public",
  plugins: [react(), tailwind(), {
    name: "curated-public-assets", apply: "build", async closeBundle() {
      for (const asset of ["favicon.svg", "analysis", "snapshots", "terrain", "imagery/my-thanh-research.svg"]) {
        const destination = resolve("dist",asset);
        await mkdir(resolve(destination,".."),{recursive:true});
        await cp(resolve("public",asset),destination,{recursive:true});
      }
    },
  }],
  server: { host: "127.0.0.1", proxy: { "/api": { target: "http://127.0.0.1:8000", rewrite: (path: string) => path.replace(/^\/api/, "") } } },
  preview: { proxy: { "/api": { target: "http://127.0.0.1:8000", rewrite: (path: string) => path.replace(/^\/api/, "") } } },
  build: { chunkSizeWarningLimit: 1600 },
}));
