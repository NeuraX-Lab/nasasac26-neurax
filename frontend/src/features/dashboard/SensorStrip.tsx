import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Droplets, Thermometer, Waves } from "lucide-react";
import { useHardware } from "../hardware/state";
import { freshness, type SensorEvent } from "../hardware/model";
import type { Geometry } from "../../core/contracts";
import { pointInside } from "./model";

const metrics = [
  {
    id: "temperature",
    head: "B",
    Icon: Thermometer,
    names: ["air_temperature", "temperature"],
    units: ["°C", "degC", "C"],
    vn: "Nhiệt độ không khí",
    en: "Air temperature",
  },
  {
    id: "humidity",
    head: "B",
    Icon: Waves,
    names: ["air_humidity", "relative_humidity", "humidity", "air_rh"],
    units: ["%RH", "%", "percent"],
    vn: "Độ ẩm không khí",
    en: "Air humidity",
  },
  {
    id: "soil",
    head: "A",
    Icon: Droplets,
    names: ["soil_moisture_adc", "soil_moisture", "soil_adc"],
    units: ["ADC", "adc", "raw", "counts"],
    vn: "Đầu dò đất · ADC",
    en: "Soil probe · ADC",
  },
];
export function sensorMetric(event: SensorEvent, id: string) {
  const metric = metrics.find((m) => m.id === id);
  return (
    !!metric &&
    metric.names.includes(event.event_type) &&
    metric.units.includes(event.unit || "") &&
    event.data_mode === "observed"
  );
}
export function SensorStrip({
  id,
  geometry,
  selected,
  onSelect,
  vi,
}: {
  id: string;
  geometry: Geometry;
  selected: string;
  onSelect: (s: string) => void;
  vi: boolean;
}) {
  const h = useHardware(),
    [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const allowed = h.placements.filter(
    (p) => p.areaId === id && pointInside([p.longitude, p.latitude], geometry),
  );
  const rows = h.events.filter(
    (e) =>
      allowed.some((p) => p.deviceId === e.device_id) ||
      (id === "my-thanh" &&
        !h.placements.some((p) => p.deviceId === e.device_id)),
  );
  return (
    <section
      className="sensor-strip"
      aria-label={vi ? "Số đo tại điểm" : "Point readings"}
    >
      {metrics.map((metric) => {
        const event = rows.filter((e) => sensorMetric(e, metric.id)).at(-1),
          fresh = freshness(event, now),
          old =
            event &&
            (fresh !== "fresh" ||
              h.status !== "connected" ||
              event.delivery_mode === "replay");
        return (
          <button
            key={metric.id}
            className={`sensor-reading ${selected === metric.head ? "is-linked" : ""}`}
            aria-pressed={selected === metric.head}
            onClick={() => onSelect(metric.head)}
          >
            <span className="sensor-label">
              <metric.Icon size={17} aria-hidden="true" />
              {vi ? metric.vn : metric.en}
              <span className="head-label">{metric.head}</span>
            </span>
            <span className="sensor-number">
              {event?.value === null || !event
                ? "—"
                : new Intl.NumberFormat(vi ? "vi" : "en", {
                    maximumFractionDigits: 1,
                  }).format(event.value)}
              <small>
                {metric.id === "soil"
                  ? "ADC"
                  : metric.id === "humidity"
                    ? "%RH"
                    : "°C"}
              </small>
            </span>
            <span className="sensor-status">
              {!event
                ? vi
                  ? "Chưa có số đo"
                  : "No readings yet"
                : fresh === "clock"
                  ? vi
                    ? "Kiểm đồng hồ thiết bị"
                    : "Check device clock"
                  : old
                    ? vi
                      ? "Số cuối · đã cũ"
                      : "Last reading · stale"
                    : vi
                      ? "Số đo tại điểm"
                      : "Point reading"}
              {event && (
                <>
                  {" "}
                  ·{" "}
                  {new Intl.DateTimeFormat(vi ? "vi" : "en", {
                    timeStyle: "medium",
                  }).format(new Date(event.timestamp_utc))}
                </>
              )}
            </span>
          </button>
        );
      })}
      <div className="sensor-connect">
        <Link to="/hardware">
          {vi ? "Kết nối thiết bị" : "Connect a device"}
        </Link>
        <small>
          {vi
            ? "Số đo tại điểm, tách khỏi khí hậu vùng."
            : "Point readings, separate from regional climate."}
        </small>
      </div>
      {selected && (
        <div className="sensor-detail" role="status">
          <strong>
            {vi ? "Đầu đo" : "Probe"} {selected}
          </strong>
          <span>
            {vi
              ? "Vị trí A/B trên hồ sơ mẫu là minh họa. Số đo tại bàn hoặc chưa xác minh vị trí không chứng minh điều kiện ngoài ruộng. ADC chưa hiệu chuẩn không là % nước hay chỉ thị tưới."
              : "A/B positions in the prepared case are illustrative. Bench readings or unverified placements do not establish field conditions. Uncalibrated ADC is not water % or an irrigation instruction."}
          </span>
          {rows
            .filter((e) => e.data_mode === "observed")
            .slice(-3)
            .map((e, i) => (
              <small key={i}>
                {e.device_id} · {e.event_type} · {e.quality} ·{" "}
                {e.source_context ||
                  (vi ? "Chưa xác minh vị trí" : "Location unverified")}
              </small>
            ))}
          <Link to="/hardware">
            {vi
              ? "Xem số đo & nguồn thiết bị"
              : "Inspect readings & device source"}
          </Link>
        </div>
      )}
    </section>
  );
}
