import { HardwarePipeline } from "./Pipeline";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Usb,
  Radio,
  Download,
  Play,
  Square,
  MapPin,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Header } from "../../app/layouts/Header";
import { useApp } from "../../core/state";
import { useHardware } from "./state";
import { freshness, PlacementSchema, type SensorEvent } from "./model";
export function Hardware() {
  const { t, i18n } = useTranslation(),
    h = useHardware(),
    { areas } = useApp();
  const [params] = useSearchParams();
  const [metric, setMetric] = useState(""),
    [baud, setBaud] = useState(115200),
    [selected, setSelected] = useState(params.get("device") || ""),
    [paused, setPaused] = useState<SensorEvent[] | null>(null),
    [now, setNow] = useState(Date.now()),
    [formError, setFormError] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const devices = [
    ...new Set([
      ...h.events.map((e) => e.device_id),
      ...h.placements.map((p) => p.deviceId),
    ]),
  ];
  const active = devices.includes(selected) ? selected : devices[0] || "";
  const rows = h.events.filter((e) => e.device_id === active);
  const metricKey = (e: SensorEvent) =>
    JSON.stringify([e.event_type, e.unit, e.data_mode]);
  const metrics = [...new Set(rows.map(metricKey))];
  const currentMetric = metrics.includes(metric) ? metric : metrics[0];
  const last = rows.filter((e) => metricKey(e) === currentMetric).at(-1),
    series = (paused || rows)
      .filter(
        (e) =>
          e.event_type === last?.event_type &&
          e.unit === last?.unit &&
          e.data_mode === last?.data_mode,
      )
      .slice(-60);
  const number = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 2,
  });
  const time = (s: string) =>
    new Intl.DateTimeFormat(i18n.language, { timeStyle: "medium" }).format(
      new Date(s),
    );
  const placement = h.placements.find((p) => p.deviceId === active);
  return (
    <>
      <Header />
      <main id="main" className="hardware-page">
        <div className="hardware-heading">
          <div>
            <span className="eyebrow">
              <Radio size={16} /> H1 / {t("hardware")}
            </span>
            <h1>{t("hardwareIntro")}</h1>
            <p>{t("hardwareHelp")}</p>
          </div>
          <span className={`connection-status ${h.status}`} role="status">
            ● {t(h.status)}
          </span>
        </div>
        <section className="connection-bar" aria-label={t("connect")}>
          <label>
            {t("baud")}
            <select
              value={baud}
              disabled={h.status === "connected" || h.status === "connecting"}
              onChange={(e) => setBaud(Number(e.target.value))}
            >
              {[9600, 57600, 115200].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <button
            disabled={
              h.recording ||
              h.status === "connecting" ||
              h.status === "connected"
            }
            onClick={() => void h.connect(baud)}
          >
            <Usb size={17} />
            {t("connect")}
          </button>
          <button
            disabled={h.status === "disconnected"}
            onClick={() => void h.disconnect()}
          >
            {t("disconnect")}
          </button>
          <button disabled={h.recording} onClick={() => void h.demo()}>
            <Activity size={17} />
            {t("demoStream")}
          </button>
          <button
            onClick={h.recording ? h.save : h.record}
            disabled={!h.recording && h.status === "disconnected"}
          >
            {h.recording ? <Square size={16} /> : <Radio size={16} />}{" "}
            {t(h.recording ? "saveSession" : "record")}
          </button>
          <span>
            {t("recorded")}: {h.recorded}
          </span>
        </section>
        {h.error && (
          <p role="alert" className="notice amber">
            {t(h.error)}
          </p>
        )}
        <HardwarePipeline events={h.events} />
        <div className="hardware-grid">
          <aside className="device-list" aria-label={t("devices")}>
            <h2>{t("devices")}</h2>
            {!devices.length && <p>{t("noReadings")}</p>}
            {devices.map((id) => (
              <button
                key={id}
                aria-pressed={id === active}
                onClick={() => {
                  setSelected(id);
                  setPaused(null);
                }}
              >
                <Radio size={18} />
                <span>
                  {id}
                  <small>
                    {t("received")}:{" "}
                    {h.events.filter((e) => e.device_id === id).length}
                  </small>
                </span>
              </button>
            ))}
            <p>
              {t("rejected")}: {h.rejected}
            </p>
            <Link className="text-button" to="/">
              {t("fields")}
            </Link>
          </aside>
          <section className="telemetry">
            <div className="telemetry-top">
              <div>
                <span className="eyebrow">{active || "—"}</span>
                <h2>{last?.event_type || t("waiting")}</h2>
                <strong className="sensor-value">
                  {last?.value == null ? "—" : number.format(last.value)}{" "}
                  <small>{last?.unit}</small>
                </strong>
              </div>
              <div>
                <span className="data-mode">
                  {last?.delivery_mode === "replay"
                    ? `replay · ${last.data_mode}`
                    : last?.data_mode || "—"}
                </span>
                <p>
                  {h.status === "replay"
                    ? t("replay")
                    : t(freshness(last, now))}
                </p>
                <p>{last ? time(last.timestamp_utc) : "—"}</p>
              </div>
            </div>
            <label className="metric-select">
              {t("metric")}
              <select
                value={currentMetric || ""}
                onChange={(e) => {
                  setMetric(e.target.value);
                  setPaused(null);
                }}
                disabled={!metrics.length}
              >
                {metrics.map((key) => (
                  <option key={key} value={key}>
                    {JSON.parse(key).join(" · ")}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="sensor-chart"
              role="img"
              aria-label={`${last?.event_type || t("waiting")} ${last?.unit || ""}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series.map((e, i) => ({
                    ...e,
                    index: i,
                    time: time(e.timestamp_utc),
                  }))}
                >
                  <XAxis
                    dataKey="time"
                    minTickGap={60}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    dataKey="value"
                    stroke="#247855"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <button
              disabled={!rows.length}
              onClick={() => setPaused(paused ? null : [...rows])}
            >
              {t(paused ? "resumeChart" : "pauseChart")}
            </button>
            <dl>
              <dt>{t("quality")}</dt>
              <dd>{last?.quality || "—"}</dd>
              <dt>{t("calibration")}</dt>
              <dd>{last?.calibration_id || t("unconfirmed")}</dd>
              <dt>{t("sourceContext")}</dt>
              <dd>{last?.source_context || t("unknown")}</dd>
            </dl>
            <p className="notice">{t("pointLimit")}</p>
          </section>
          <aside className="hardware-details" aria-label={t("placement")}>
            <h2>{t("placement")}</h2>
            <p>{t("placementHelp")}</p>
            <p className="notice">{t("simulatedPlacement")}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const parsed = PlacementSchema.safeParse({
                  deviceId: active,
                  areaId: data.get("area"),
                  longitude: Number(data.get("lon")),
                  latitude: Number(data.get("lat")),
                  context: data.get("context"),
                  physical_location: String(data.get("physical") || "Unverified physical location"),
                  placement_depth_cm: data.get("depth") ? Number(data.get("depth")) : null,
                });
                if (!active || !parsed.success) {
                  setFormError(t("placementInvalid"));
                  return;
                }
                h.place(parsed.data);
                setFormError("");
              }}
            >
              <label>
                {t("fieldSelected")}
                <select name="area" defaultValue={placement?.areaId || ""}>
                  <option value="">{t("noPlacement")}</option>
                  <option value="my-thanh">MT-BLOCK-01</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("longitude")}
                <input
                  name="lon"
                  defaultValue={placement?.longitude}
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  required
                />
              </label>
              <label>
                {t("latitude")}
                <input
                  name="lat"
                  defaultValue={placement?.latitude}
                  type="number"
                  step="any"
                  min="-85"
                  max="85"
                  required
                />
              </label>
              <label>
                {t("context")}
                <select
                  name="context"
                  defaultValue={placement?.context || "lab"}
                >
                  <option value="lab">{t("lab")}</option>
                  <option value="synthetic">{t("synthetic")}</option>
                  <option value="field">{t("field")}</option>
                </select>
              </label>
              <label>{t("declaredPhysicalLocation")}<input name="physical" maxLength={200} defaultValue={placement?.physical_location || ""} /></label>
              <label>{t("depthCm")}<input name="depth" type="number" min="0" max="300" step="any" defaultValue={placement?.placement_depth_cm ?? ""} /></label>
              <button disabled={!active}>
                <MapPin size={16} />
                {t("savePlacement")}
              </button>
              {formError && <p role="alert">{formError}</p>}
            </form>
            {placement && (
              <Link
                className="button secondary"
                to={`/w/${placement.areaId || "my-thanh"}/farmer?device=${encodeURIComponent(active)}`}
              >
                {t("locate")}
              </Link>
            )}
          </aside>
        </div>
        <section className="hardware-bottom">
          <div>
            <h2>{t("stream")}</h2>
            <div className="table-scroll event-table">
              <table>
                <thead>
                  <tr>
                    <th>{t("date")}</th>
                    <th>{t("deviceId")}</th>
                    <th>{t("metric")}</th>
                    <th>{t("value")}</th>
                    <th>{t("quality")}</th>
                    <th>{t("context")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rows]
                    .reverse()
                    .slice(0, 100)
                    .map((e, i) => (
                      <tr key={`${e.timestamp_utc}-${i}`}>
                        <td>{time(e.timestamp_utc)}</td>
                        <td>{e.device_id}</td>
                        <td>{e.event_type}</td>
                        <td>
                          {e.value === null ? "—" : number.format(e.value)}{" "}
                          {e.unit}
                        </td>
                        <td>{e.quality}</td>
                        <td>{e.data_mode}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2>{t("session")}</h2>
            <label className="import-label">
              {t("importSession")}
              <input
                type="file"
                accept="application/json,.json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5_000_000) {
                    h.importSession(null);
                    return;
                  }
                  try {
                    h.importSession(JSON.parse(await file.text()));
                  } catch {
                    h.importSession(null);
                  }
                  e.target.value = "";
                }}
              />
            </label>
            {!h.sessions.length && <p>{t("noSessions")}</p>}
            {h.sessions.map((s, i) => (
              <div className="session-row" key={i}>
                <span>
                  {s.name}
                  <small>
                    {s.events.length} {t("received")}
                  </small>
                </span>
                <button
                  disabled={h.recording}
                  aria-label={`${t("replay")} ${i + 1}`}
                  onClick={() => void h.replay(s)}
                >
                  <Play size={16} />
                </button>
                <button
                  aria-label={`${t("exportSession")} ${i + 1}`}
                  onClick={() => {
                    const url = URL.createObjectURL(
                      new Blob([JSON.stringify(s, null, 2)], {
                        type: "application/json",
                      }),
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `agrotwin-session-${i + 1}.json`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
            <details>
              <summary>{t("protocol")}</summary>
              <p>{t("protocolHelp")}</p>
              <pre>
                {JSON.stringify(
                  {
                    device_id: "ESP32-01",
                    event_type: "air_temperature",
                    timestamp_utc: "2026-11-13T09:00:00Z",
                    value: 28.1,
                    unit: "°C",
                    quality: "unverified",
                    data_mode: "observed",
                    source_context: "HCM lab",
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          </div>
        </section>
      </main>
    </>
  );
}
