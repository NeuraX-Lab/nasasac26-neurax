import { useState } from "react";
import type { Draft, FarmDraft } from "../analysis/contracts";
export function ConditionsForm({
  draft,
  change,
  onSubmit,
  busy,
  vi,
}: {
  draft: Draft;
  change: (d: Draft) => void;
  onSubmit: () => void;
  busy: boolean;
  vi: boolean;
}) {
  const m = (vn: string, en: string) => (vi ? vn : en);
  const [error, setError] = useState("");
  const [start = "", end = ""] = draft.farm.season?.split(" / ") || [];
  function farm(key: keyof FarmDraft, value: string) {
    change({ ...draft, farm: { ...draft.farm, [key]: value || null } });
  }
  function windowValue(a: string, b: string) {
    change({
      ...draft,
      farm: { ...draft.farm, season: a || b ? `${a} / ${b}` : null },
    });
    setError("");
  }
  const crops = (
    <>
      <option value="">{m("Chưa xác nhận", "Not confirmed")}</option>
      <option value="rice">{m("Lúa", "Rice")}</option>
      <option value="baby_corn">{m("Bắp non", "Baby corn")}</option>
      <option value="mung_bean">{m("Đậu xanh", "Mung bean")}</option>
      <option value="other">{m("Cây khác", "Other crop")}</option>
    </>
  );
  return (
    <form
      className="conditions-form"
      onSubmit={(e) => {
        e.preventDefault();
        if ((start && !end) || (!start && end) || end < start) {
          setError(
            m(
              "Chọn đủ hai tháng; tháng kết thúc phải bằng hoặc sau tháng bắt đầu.",
              "Choose both months; the end must be on or after the start.",
            ),
          );
          e.currentTarget
            .querySelector<HTMLInputElement>("[name=seasonEnd]")
            ?.focus();
          return;
        }
        setError("");
        onSubmit();
      }}
    >
      <p>
        {m(
          "Điền điều bạn biết. Thông tin này là khai báo của bạn; có thể để chưa rõ.",
          "Enter what you know. These are your declarations; unknown is allowed.",
        )}
      </p>
      <div className="conditions-grid">
        <label>
          {m("Từ tháng", "From month")}
          <input
            name="seasonStart"
            aria-label={m("Từ tháng", "From month")}
            type="month"
            lang={vi ? "vi" : "en"}
            value={start}
            onChange={(e) => windowValue(e.target.value, end)}
            aria-describedby={error ? "window-error" : undefined}
          />
          {start && (
            <small className="month-preview">
              {m("Tháng ", "Month ")}
              {start.slice(5, 7)}/{start.slice(0, 4)}
            </small>
          )}
        </label>
        <label>
          {m("Đến tháng", "Through month")}
          <input
            name="seasonEnd"
            aria-label={m("Đến tháng", "Through month")}
            type="month"
            lang={vi ? "vi" : "en"}
            value={end}
            onChange={(e) => windowValue(start, e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "window-error" : undefined}
          />
          {end && (
            <small className="month-preview">
              {m("Tháng ", "Month ")}
              {end.slice(5, 7)}/{end.slice(0, 4)}
            </small>
          )}
        </label>
        <label>
          {m("Cây hiện tại", "Current crop")}
          <select
            name="current_crop"
            aria-label={m("Cây hiện tại", "Current crop")}
            value={draft.farm.current_crop || ""}
            onChange={(e) => farm("current_crop", e.target.value)}
          >
            {crops}
          </select>
        </label>
        <label>
          {m("Nguồn tưới", "Irrigation supply")}
          <select
            name="irrigation_access"
            aria-label={m("Nguồn tưới", "Irrigation supply")}
            value={draft.farm.irrigation_access || ""}
            onChange={(e) => farm("irrigation_access", e.target.value)}
          >
            <option value="">{m("Chưa rõ", "Unknown")}</option>
            <option value="available">{m("Có nguồn", "Available")}</option>
            <option value="limited">{m("Hạn chế", "Limited")}</option>
            <option value="unavailable">{m("Không có", "Unavailable")}</option>
          </select>
        </label>
        <label>
          {m("Thoát nước", "Drainage")}
          <select
            name="drainage_condition"
            aria-label={m("Thoát nước", "Drainage")}
            value={draft.farm.drainage_condition || ""}
            onChange={(e) => farm("drainage_condition", e.target.value)}
          >
            <option value="">{m("Chưa rõ", "Unknown")}</option>
            <option value="good">
              {m("Tốt (tự khai báo)", "Good (self-reported)")}
            </option>
            <option value="poor">
              {m("Kém (tự khai báo)", "Poor (self-reported)")}
            </option>
          </select>
        </label>
        <label>
          {m("Ưu tiên", "Priority")}
          <select
            name="goal"
            aria-label={m("Ưu tiên", "Priority")}
            value={draft.farm.goal}
            onChange={(e) => farm("goal", e.target.value)}
          >
            <option value="explore">
              {m("Khám phá lựa chọn", "Explore alternatives")}
            </option>
            <option value="water">
              {m("Nguồn nước", "Water availability")}
            </option>
            <option value="soil">{m("Điều kiện đất", "Soil condition")}</option>
            <option value="income">
              {m("Đầu ra & thu nhập", "Market & income")}
            </option>
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" id="window-error">
          {error}
        </p>
      )}
      <details>
        <summary>
          {m(
            "Thông tin bổ sung & nguồn lịch sử",
            "Additional information & history source",
          )}
        </summary>
        <div className="conditions-grid">
          <label>
            {m("Cây vụ trước", "Previous crop")}
            <select
              name="previous_crop"
              aria-label={m("Cây vụ trước", "Previous crop")}
              value={draft.farm.previous_crop || ""}
              onChange={(e) => farm("previous_crop", e.target.value)}
            >
              {crops}
            </select>
          </label>
          <label>
            {m("Năm lịch sử đối chiếu", "Historical year to compare")}
            <select
              name="year"
              aria-label={m(
                "Năm lịch sử đối chiếu",
                "Historical year to compare",
              )}
              value={draft.year}
              onChange={(e) =>
                change({ ...draft, year: Number(e.target.value) })
              }
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <label>
            {m("Lịch sử ngập (nếu biết)", "Waterlogging history (if known)")}
            <input
              name="waterlogging_history"
              autoComplete="off"
              maxLength={200}
              value={draft.farm.waterlogging_history || ""}
              onChange={(e) => farm("waterlogging_history", e.target.value)}
            />
          </label>
          <label>
            {m("Ghi chú quản lý", "Management notes")}
            <input
              name="management_plan"
              autoComplete="off"
              maxLength={300}
              value={draft.farm.management_plan || ""}
              onChange={(e) => farm("management_plan", e.target.value)}
            />
          </label>
          <label>
            {m("Lấy dữ liệu lịch sử", "Retrieve historical data")}
            <select
              name="source_mode"
              aria-label={m("Lấy dữ liệu lịch sử", "Retrieve historical data")}
              value={draft.source_mode}
              onChange={(e) =>
                change({
                  ...draft,
                  source_mode: e.target.value as Draft["source_mode"],
                })
              }
            >
              <option value="prefer_cache">
                {m(
                  "Cache có nguồn / tải khi cần",
                  "Sourced cache / fetch when needed",
                )}
              </option>
              <option value="live">
                {m(
                  "Yêu cầu NASA; ghi rõ nếu dùng cache",
                  "Request NASA; label any cache fallback",
                )}
              </option>
              <option value="offline">
                {m("Chỉ cache offline", "Offline cache only")}
              </option>
            </select>
          </label>
        </div>
      </details>
      <div className="form-submit">
        <small>
          {m(
            "Ưu tiên đổi trọng tâm trao đổi; chưa xếp hạng cây.",
            "Priority changes the discussion focus; crops are not ranked.",
          )}
        </small>
        <button className="primary-action" type="submit" disabled={busy}>
          {busy
            ? m("Đang lấy kết quả…", "Retrieving results…")
            : m("Xem so sánh", "View comparison")}
        </button>
      </div>
    </form>
  );
}
