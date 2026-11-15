import { useState } from "react";
import { Climate } from "../../shared/charts";
import { OptionalVisual } from "../../shared/OptionalVisual";
import type { AnalysisRun } from "../analysis/contracts";
import { seasonMonths, withinSeason } from "./model";
import type { V4Result } from "./v4";
import { ForecastPlot } from "./ForecastPlot";

export function ClimateContext({
  run,
  season,
  vi,
  stale,
  liveV4,
  restoredV4,
  workspaceMode,
}: {
  run: AnalysisRun | null;
  season: string | null;
  vi: boolean;
  stale: boolean;
  liveV4: V4Result | null;
  restoredV4: boolean;
  workspaceMode: "explore" | "conditions" | "decision";
}) {
  const [viewChoice, setViewChoice] = useState<
    Partial<Record<typeof workspaceMode, "history" | "model">>
  >({});
  const view = viewChoice[workspaceMode]
    ? viewChoice[workspaceMode]
    : workspaceMode === "explore"
      ? "history"
      : "model";
  const m = (vn: string, en: string) => (vi ? vn : en);
  const months = seasonMonths(season),
    historical =
      run?.climate.filter(
        (r) => !months.length || months.includes(Number(r.date.slice(5, 7))),
      ) || [];
  const valid = historical.filter(
    (r) =>
      r.qa !== "fail" && r.coverage > 0 && r.rain !== null && r.temp !== null,
  );
  const number = (n: number) =>
    new Intl.NumberFormat(vi ? "vi" : "en", {
      maximumFractionDigits: 1,
    }).format(n);
  const forecasts = (liveV4?.response.forecasts || []).filter(
    (f) => !season || withinSeason(f.target_month, season),
  );
  const targets = [...new Set(forecasts.map((f) => f.target_month))];
  return (
    <section
      className="climate-context"
      aria-labelledby="climate-title"
      tabIndex={0}
    >
      <div className="section-heading">
        <h2 id="climate-title">
          {view === "history"
            ? m(
                "NASA POWER · Lịch sử khí hậu vùng",
                "NASA POWER · Regional climate history",
              )
            : m(
                "FieldShift V4 · Ước tính khí hậu",
                "FieldShift V4 · Climate estimates",
              )}
        </h2>
        <div
          className="segmented"
          aria-label={m("Nguồn khí hậu", "Climate source")}
        >
          {(["history", "model"] as const).map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() =>
                setViewChoice((old) => ({ ...old, [workspaceMode]: v }))
              }
            >
              {v === "history"
                ? m("Lịch sử", "History")
                : m("Kết quả model", "Model results")}
            </button>
          ))}
        </div>
      </div>
      {view === "history" ? (
        <>
          {stale ? (
            <p className="inline-warning" role="status">
              {m(
                "Điều kiện đã đổi. Cập nhật so sánh để xem lịch sử đúng input mới.",
                "Inputs changed. Update the comparison to see matching history.",
              )}
            </p>
          ) : valid.length ? (
            <p className="climate-summary">
              {m("Trong", "Across")} {valid.length}{" "}
              {m("tháng có dữ liệu", "available months")}{" "}
              {run?.sidecar.observed_period.start.slice(0, 4)}
              {months.length
                ? m(
                    " trùng tháng của vụ đã chọn",
                    " matching your season months",
                  )
                : ""}
              : {m("mưa", "rain")}{" "}
              <strong>
                {number(Math.min(...valid.map((r) => r.rain!)))}–
                {number(Math.max(...valid.map((r) => r.rain!)))} mm/
                {m("tháng", "month")}
              </strong>
              , {m("nhiệt độ", "temperature")}{" "}
              <strong>
                {number(Math.min(...valid.map((r) => r.temp!)))}–
                {number(Math.max(...valid.map((r) => r.temp!)))} °C
              </strong>
              .
            </p>
          ) : (
            <p>
              {m(
                "Chưa có lịch sử dùng được cho phạm vi này. Xem so sánh để lấy dữ liệu theo ranh, hoặc thử lại.",
                "No usable history for this scope. Retrieve a comparison for this boundary or retry.",
              )}
            </p>
          )}
          {!stale && valid.length > 0 && (
            <OptionalVisual
              fallback={m(
                "Biểu đồ chưa tải được; mở căn cứ để xem bảng số.",
                "Chart unavailable; open evidence for values.",
              )}
            >
              <Climate
                calendarComparison={months.length > 0}
                months={historical.map((r) => ({
                  ...r,
                  rain: r.qa === "fail" ? null : r.rain,
                  temp: r.qa === "fail" ? null : r.temp,
                }))}
              />
            </OptionalVisual>
          )}
          <p className="context-footnote">
            NASA POWER ·{" "}
            {m(
              "lịch sử lưới vùng, không phải dự báo vụ tới hoặc đo tại ruộng. Mưa tháng giúp chuẩn bị kiểm nguồn tưới, chưa xác định cây phù hợp.",
              "regional historical grid, not next-season weather or field measurements. Monthly rain informs water-supply checks; it does not establish crop suitability.",
            )}
          </p>
        </>
      ) : liveV4 ? (
        <>
          <p className="forecast-scope" role="status">
            {m(
              "Ước tính nghiên cứu cho từng tháng đích, không phải tổng ba tháng hoặc dự báo vận hành đã kiểm chứng.",
              "Research estimates for individual target months, not a three-month total or validated operational forecast.",
            )}
          </p>
          <details className="climate-provenance">
            <summary>
              {m(
                "Nguồn, thời điểm & chế độ kết quả",
                "Source, timing & result mode",
              )}
            </summary>
            <p className="snapshot-label">
              {restoredV4
                ? m("Bản đã lưu từ API V4", "Saved V4 API result")
                : m("API V4 · inference mới", "V4 API · fresh inference")}
              {" · "}
              {m("dữ liệu đến", "data through")}{" "}
              {liveV4.response.forecasts[0].data_through.slice(0, 7)}
              {" · "}
              {liveV4.response.run_id}
            </p>
            <p>
              {liveV4.response.inference.model_version} ·{" "}
              {liveV4.response.generated_at_utc}
            </p>
            <p>
              {m(
                "Dữ liệu NASA đã lưu có checksum; không phải lần tải NASA trực tiếp.",
                "Checksum-pinned NASA data cache; not a new NASA acquisition.",
              )}
            </p>
          </details>
          {targets.length ? (
            <div className="forecast-table-wrap">
              <ForecastPlot forecasts={forecasts} vi={vi} />
              <div className="desktop-forecast-months">
                {targets.map((date) => (
                  <article key={date}>
                    <h3>
                      {date.slice(5, 7)}/{date.slice(0, 4)}
                    </h3>
                    <dl>
                      {forecasts
                        .filter((f) => f.target_month === date)
                        .map((f) => (
                          <div key={f.target}>
                            <dt>
                              {f.target === "precip_sum_mm"
                                ? m("Mưa", "Rain")
                                : f.target === "air_temp_mean_c"
                                  ? m("Nhiệt độ", "Temperature")
                                  : "RH"}
                            </dt>
                            <dd>
                              {number(f.value)}{" "}
                              <small>
                                {f.unit === "degC"
                                  ? "°C"
                                  : f.unit === "percent"
                                    ? "%RH"
                                    : m("mm/tháng", "mm/month")}
                              </small>
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </article>
                ))}
              </div>
              <table className="forecast-table">
                <caption>
                  {m(
                    "Ước tính từng tháng đích · nghiên cứu",
                    "Individual target-month estimates · research",
                  )}
                </caption>
                <thead>
                  <tr>
                    <th>{m("Tháng đích", "Target month")}</th>
                    <th>
                      {m("Mưa", "Rain")} mm/{m("tháng", "month")}
                    </th>
                    <th>{m("Nhiệt độ", "Temperature")} °C</th>
                    <th>RH %</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((date) => (
                    <tr key={date}>
                      <th>
                        {date.slice(5, 7)}/{date.slice(0, 4)}
                      </th>
                      {[
                        "precip_sum_mm",
                        "air_temp_mean_c",
                        "air_rh_mean_pct",
                      ].map((t) => (
                        <td key={t}>
                          {number(
                            forecasts.find(
                              (f) => f.target_month === date && f.target === t,
                            )!.value,
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              {m(
                "Không có tháng đích trong khoảng vụ đã chọn; không nội suy thêm forecast.",
                "No target months within your season; no additional forecast is interpolated.",
              )}
            </p>
          )}
          <details>
            <summary>
              {m("Dải tham khảo & phương pháp", "Reference ranges & methods")}
            </summary>
            <p>
              {m(
                "ML v3 climatology · pooled intervals, mức danh nghĩa 80% không bảo đảm độ phủ. Chưa xác minh vintage vận hành; không dùng để xếp hạng cây hoặc lập lịch tưới.",
                "ML v3 climatology · pooled intervals; nominal 80% does not guarantee coverage. Operational vintage unverified; not for crop ranking or irrigation scheduling.",
              )}
            </p>
            {forecasts.map((f) => (
              <p key={`${f.target}/${f.horizon_months}`}>
                {f.target} · {f.target_month} · h{f.horizon_months} ·{" "}
                {number(f.lower)}–{number(f.upper)} {f.unit} · {f.method} ·
                origin {f.origin_month} · cutoff {f.data_through}
              </p>
            ))}
            <ul>
              {liveV4.response.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </details>
        </>
      ) : (
        <p role="status">
          {m(
            run && !run.sidecar.catalog_supported
              ? "Model V4 chưa hỗ trợ ranh hiện tại. Lịch sử vẫn dùng riêng theo ranh khi nguồn có dữ liệu."
              : "Chọn điều kiện và Xem so sánh để chạy AI V4. Chưa có kết quả V4 khớp; lịch sử vẫn xem độc lập.",
            run && !run.sidecar.catalog_supported
              ? "V4 does not support this boundary. History remains available for its own geometry where supported."
              : "Choose conditions and View comparison to run V4. No matching V4 result; history remains available independently.",
          )}
        </p>
      )}
    </section>
  );
}
