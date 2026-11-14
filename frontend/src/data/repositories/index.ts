import { BundleSchema } from "../../core/contracts";
export async function loadBundle(
  environment: "research" | "sandbox",
  signal: AbortSignal,
) {
  const r = await fetch(`/snapshots/${environment}/my-thanh.json`, { signal });
  if (!r.ok) throw Error(`Snapshot HTTP ${r.status}`);
  const parsed = BundleSchema.parse(await r.json());
  if ((environment === "sandbox") !== (parsed.dataMode === "synthetic"))
    throw Error("Data environment mismatch");
  return parsed;
}
export async function checkLab(signal: AbortSignal) {
  const base = import.meta.env.VITE_LAB_API_URL;
  if (!base) return { available: false };
  const r = await fetch(`${base.replace(/\/$/, "")}/v1/status`, { signal });
  if (!r.ok) throw Error(`HTTP ${r.status}`);
  await r.json();
  return { available: true };
}
