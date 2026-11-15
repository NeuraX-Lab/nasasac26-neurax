import { useState } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { h1Event, type SensorEvent } from "./model";
const Schema = z.object({
  features: z.array(
    z.object({
      device_id: z.string(),
      quantity: z.string(),
      unit: z.string().nullable(),
      mean: z.number().nullable(),
      coverage: z.number(),
      flags: z.array(z.string()),
      eligible_for_A1: z.literal(false),
    }),
  ),
  duplicates: z.number(),
});
export function HardwarePipeline({ events }: { events: SensorEvent[] }) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith("vi");
  const [result, setResult] = useState<z.infer<typeof Schema> | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function sync() {
    setBusy(true);
    setError("");
    try {
      const eligible = events.filter(
        (e) => !e.timestamp_basis || e.timestamp_basis === "device",
      );
      if (!eligible.length)
        throw Error(
          vi
            ? "Chưa đồng bộ H1: giờ thiết bị chưa được xác minh. Giờ nhận trên máy chỉ dùng cho freshness, không thay UTC của phép đo."
            : "H1 sync blocked: device clock is unverified. Host receipt time is for freshness, not measurement UTC.",
        );
      if (eligible.length !== events.length)
        throw Error(
          vi
            ? "Có event chưa xác minh giờ thiết bị; không đồng bộ một phần âm thầm."
            : "Unverified device timestamps present; no silent partial sync.",
        );
      const r = await fetch("/api/v1/h1/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: eligible.slice(-100).map(h1Event) }),
      });
      if (!r.ok) throw Error(`H1 HTTP ${r.status}`);
      setResult(Schema.parse(await r.json()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "H1 unavailable");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="notice" aria-label="H1 data pipeline">
      <h2>{vi ? "Pipeline quan sát H1" : "H1 observation pipeline"}</h2>
      <p>
        {vi
          ? "Đồng bộ tối đa 100 event vào lịch sử local; tính cửa sổ/coverage/QA. Không tự xác nhận vị trí ruộng hoặc đưa số đo bench vào A1."
          : "Sync up to 100 events to local history and window/coverage/QA features. No automatic field verification or bench-to-A1 join."}
      </p>
      <button disabled={!events.length || busy} onClick={() => void sync()}>
        {vi ? "Đồng bộ event vào pipeline" : "Sync events to pipeline"}
      </button>
      {error && <p role="alert">{error}</p>}
      {result && (
        <div data-testid="h1-pipeline-result">
          <p>
            {vi ? "Event trùng đã loại" : "Duplicates excluded"}:{" "}
            {result.duplicates}
          </p>
          {result.features.map((f, i) => (
            <p key={i}>
              {f.device_id} · {f.quantity}: {f.mean ?? "—"} {f.unit} · coverage{" "}
              {(f.coverage * 100).toFixed(0)}% · A1: excluded ·{" "}
              {f.flags.join(", ")}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
