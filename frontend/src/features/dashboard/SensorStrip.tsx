import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Droplets, Thermometer, Waves } from "lucide-react";
import { useHardware } from "../hardware/state";
import {
  freshness,
  latestReading,
  quantity,
  type SensorEvent,
} from "../hardware/model";
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
    names: ["raw_adc", "soil_moisture_adc", "soil_moisture", "soil_adc"],
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
    [now, setNow] = useState(Date.now()),
    [baud, setBaud] = useState(0);
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
  const last = latestReading(
    rows.filter(
      (e) => e.data_mode === "observed" && e.value !== null && quantity(e),
    ),
  );
  const status =
    h.status === "connected"
      ? !last
        ? h.rejected
          ? "invalid"
          : "waiting"
        : freshness(last, now) === "fresh"
          ? "live"
          : "stale"
      : h.status === "disconnected" &&
          (h.error === "connectionLost" || h.error === "connectionFailed")
        ? "lost"
        : h.status;
  const labels: Record<string, string> = vi
    ? {
        connected: "Đã kết nối",
        connecting: "Đang kết nối",
        disconnected: "Chưa kết nối",
        waiting: "Đã kết nối · chờ số đo",
        invalid: "Payload chưa hợp lệ",
        live: "Đang nhận USB",
        stale: "Số đo đã cũ",
        lost: "Mất kết nối · cần kết nối lại",
        replay: "Phát lại",
        synthetic: "Mô phỏng",
      }
    : {
        connecting: "Connecting",
        disconnected: "Disconnected",
        waiting: "Connected · waiting for data",
        invalid: "Invalid payload",
        live: "Receiving USB",
        stale: "Stale readings",
        lost: "Connection lost · reconnect required",
        replay: "Replay",
        synthetic: "Synthetic",
      };
  return (
    <section
      className="sensor-strip"
      aria-label={vi ? "Số đo tại điểm" : "Point readings"}
    >
      <div className="telemetry-heading">
        <strong>ESP32-S3</strong>
        <span data-connected={status === "live"} role="status">
          {labels[status]}
        </span>
      </div>
      {metrics.map((metric) => {
        const event = latestReading(
            rows.filter((e) => sensorMetric(e, metric.id)),
          ),
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
              {!event || event.value === null
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
                  }).format(new Date(event.received_at || event.timestamp_utc))}
                </>
              )}
            </span>
          </button>
        );
      })}
      <div className="sensor-connect">
        {h.status === "connected" ? (
          <button onClick={() => void h.disconnect()}>
            {vi ? "Ngắt kết nối" : "Disconnect"}
          </button>
        ) : (
          <details className="usb-connect">
            <summary>{vi ? "Kết nối ESP32-S3" : "Connect ESP32-S3"}</summary>
            <p>
              {vi
                ? "Chọn baud theo firmware, 8N1. Trình duyệt sẽ hỏi quyền chọn cổng. Mở bridge USB-UART có thể khởi động lại board; không gửi lệnh hoặc flash."
                : "Select firmware baud, 8N1. Choose the port in the browser permission dialog. Opening a USB-UART bridge may restart the board; no commands or flashing."}
            </p>
            <label>
              {vi ? "Baud firmware" : "Firmware baud"}
              <select
                value={baud}
                onChange={(e) => setBaud(Number(e.target.value))}
              >
                <option value={0}>
                  {vi ? "Chọn cấu hình đã biết" : "Select known configuration"}
                </option>
                {[9600, 57600, 115200, 230400, 460800, 921600].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={!baud || h.status === "connecting"}
              onClick={() => void h.connect(baud)}
            >
              {vi ? "Chọn cổng USB" : "Choose USB port"}
            </button>
          </details>
        )}
        <small>
          {vi
            ? "Số đo tại điểm, tách khỏi khí hậu vùng."
            : "Point readings, separate from regional climate."}
        </small>
      </div>
      {!!h.rejected && (
        <p className="inline-warning" role="status">
          {vi
            ? "Event không hợp lệ hoặc trùng đã bỏ qua"
            : "Invalid or duplicate events skipped"}
          : {h.rejected}
        </p>
      )}
      {!!h.diagnostics.length && (
        <details className="usb-diagnostics">
          <summary>{vi ? "Thông báo từ board" : "Board diagnostics"}</summary>
          {h.diagnostics.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </details>
      )}
      {h.error && !h.rejected && (
        <p role="alert">
          {vi
            ? "Chưa nhận được kết nối hợp lệ. Kiểm cổng đang bận, quyền USB và firmware; kết nối lại bằng nút trên."
            : "Connection unavailable. Check port ownership, USB permission and firmware; reconnect above."}{" "}
          ({h.error})
        </p>
      )}
      {selected && (
        <div
          className="sensor-detail"
          role="region"
          aria-label={`${vi ? "Chi tiết đầu đo" : "Probe details"} ${selected}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onSelect("");
              document
                .querySelector<HTMLButtonElement>(
                  `.probe-marker[data-probe="${selected}"]`,
                )
                ?.focus();
            }
          }}
        >
          <button
            className="probe-close"
            aria-label={vi ? "Đóng chi tiết đầu đo" : "Close probe details"}
            onClick={() => {
              onSelect("");
              document
                .querySelector<HTMLButtonElement>(
                  `.probe-marker[data-probe="${selected}"]`,
                )
                ?.focus();
            }}
          >
            ×
          </button>
          <strong>
            {vi ? "Đầu đo" : "Probe"} {selected}
          </strong>
          <span>
            {vi
              ? `${id === "my-thanh" ? "Vị trí minh họa trong AOI Mỹ Thành" : "Vị trí minh họa trong ranh đang chọn"}, không phải vị trí cảm biến ngoài ruộng đã được xác minh. A/B là nhóm kênh đo, không chứng minh hai thiết bị độc lập. ADC chưa hiệu chuẩn không là % nước hay chỉ thị tưới.`
              : "A/B positions in the prepared case are illustrative. Bench readings or unverified placements do not establish field conditions. Uncalibrated ADC is not water % or an irrigation instruction."}
          </span>
          {metrics
            .filter((metric) => metric.head === selected)
            .map((metric) => {
              const e = latestReading(
                rows.filter((e) => sensorMetric(e, metric.id)),
              );
              return (
                <div key={metric.id} className="probe-channel">
                  <strong>{vi ? metric.vn : metric.en}</strong>
                  {!e ? (
                    <p>
                      {vi
                        ? "Chưa có event hợp lệ cho kênh này. Không suy từ kênh khác."
                        : "No valid event for this channel. Other channels are not substituted."}
                    </p>
                  ) : (
                    <>
                      <p>
                        {e.value ?? "—"} {e.unit} · {e.device_id} /{" "}
                        {e.event_type}
                      </p>
                      <p>
                        {e.source_transport || "UNVERIFIED"} · QA: {e.quality} ·{" "}
                        {freshness(e, now)}
                        {h.status !== "connected" ? " · disconnected" : ""}
                      </p>
                      <p>
                        {vi ? "Máy nhận" : "Host received"}:{" "}
                        {e.received_at || "—"}
                        <br />
                        {e.timestamp_basis === "host_received"
                          ? vi
                            ? "Thiết bị không cung cấp giờ đo hoặc ID; ID trên do máy gán."
                            : "Device supplies no measurement time or ID; ID above is host-assigned."
                          : `${vi ? "Giờ thiết bị (chưa xác minh)" : "Device time (unverified)"}: ${e.timestamp_utc}`}
                      </p>
                      <p>
                        {vi ? "Hiệu chuẩn" : "Calibration"}:{" "}
                        {e.calibration_id
                          ? `${e.calibration_id} (${vi ? "chưa xác minh" : "unverified"})`
                          : vi
                            ? "Chưa xác minh"
                            : "Unverified"}{" "}
                        · {e.source_context || "Unverified location"}
                      </p>
                      <Link
                        to={`/hardware?device=${encodeURIComponent(e.device_id)}`}
                      >
                        {vi ? "Xem lịch sử thiết bị" : "Device history"}
                      </Link>
                    </>
                  )}
                </div>
              );
            })}
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
