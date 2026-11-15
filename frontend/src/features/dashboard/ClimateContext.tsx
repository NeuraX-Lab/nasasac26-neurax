import { useState } from "react";
import { Climate } from "../../shared/charts";
import { OptionalVisual } from "../../shared/OptionalVisual";
import type { AnalysisRun } from "../analysis/contracts";
import { seasonMonths, withinSeason, type Overview } from "./model";
import {
  ResearchInference,
  type ResearchInferenceSchema,
} from "../analysis/ResearchInference";
import type { z } from "zod";
import type { V2Result } from "./v2";

export function ClimateContext({
  run,
  snapshot,
  season,
  vi,
  stale,
  snapshotError,
  retry,
  onResearchResult,
  liveV2,
  restoredV2,
}: {
  run: AnalysisRun | null;
  liveV2: V2Result | null;
  restoredV2: boolean;
  snapshot: Overview | null;
  season: string | null;
  vi: boolean;
  stale: boolean;
  snapshotError: string;
  retry: () => void;
  onResearchResult: (
    result: z.infer<typeof ResearchInferenceSchema> | null,
  ) => void;
}) {
  const [view, setView] = useState<"history" | "model">("history");
  const [provider, setProvider] = useState<"v2-saved" | "research">("v2-saved");
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
  const forecasts =
    (liveV2?.response.forecasts || snapshot?.forecasts)?.filter(
      (f) => !season || withinSeason(f.target_month, season),
    ) || [];
  const targets = [...new Set(forecasts.map((f) => f.target_month))];
  return (
    <section className="climate-context" aria-labelledby="climate-title">
      <div className="section-heading">
        <h2 id="climate-title">
          {m(
            "Điều kiện cho vụ đang cân nhắc",
            "Conditions for your next season",
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
              onClick={() => setView(v)}
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
      ) : (
        <>
          {run?.sidecar.catalog_supported && (
            <div
              className="model-provider-choice"
              aria-label={m("Chế độ model", "Model mode")}
            >
              <button
                aria-pressed={provider === "v2-saved"}
                onClick={() => setProvider("v2-saved")}
              >
                {liveV2 ? m("API v2", "V2 API") : m("Bản lưu v2", "Saved v2")}
              </button>
              <button
                aria-pressed={provider === "research"}
                onClick={() => setProvider("research")}
              >
                {m("Chạy model trên máy", "Run local model")}
              </button>
            </div>
          )}
          {provider === "research" && run?.sidecar.catalog_supported ? (
            <>
              <p className="context-footnote">
                {m(
                  "Model nghiên cứu cũ, tách biệt Engine v2. Dùng tháng bắt đầu và cửa sổ 1/3 tháng; chưa chuyển khí hậu thành đánh giá cây. Đổi khai báo ruộng không tự thay forecast.",
                  "Earlier research model, separate from Engine v2. Uses a start month and a 1/3-month window; it does not infer crop suitability. Farm declarations do not automatically change the forecast.",
                )}
              </p>
              {stale ? (
                <p role="status">
                  {m(
                    "Cập nhật so sánh để xác nhận phạm vi trước khi chạy model.",
                    "Update the comparison to confirm scope before running the model.",
                  )}
                </p>
              ) : (
                <ResearchInference
                  key={run.a1.run_id}
                  aoiId="my-thanh"
                  geometry={run.inputs.geometry}
                  geometryHash={run.sidecar.geometry_hash}
                  supported
                  onResult={onResearchResult}
                />
              )}
            </>
          ) : snapshot || liveV2 ? (
            <>
              <p className="snapshot-label">
                {liveV2 && restoredV2
                  ? m("Bản đã lưu từ API v2", "Saved v2 API result")
                  : liveV2
                    ? m(
                        "API v2 · forecast tính sẵn",
                        "V2 API · precomputed forecasts",
                      )
                    : m("Bản kết quả đã lưu", "Saved result")}{" "}
                · {m("dữ liệu đến", "data through")}{" "}
                {(
                  liveV2?.response.forecasts[0].data_through ||
                  snapshot?.data_through ||
                  "—"
                ).slice(0, 7)}{" "}
                · {m("Mỹ Thành, khí hậu vùng", "Mỹ Thành regional climate")}
              </p>
              {stale && (
                <p className="inline-warning">
                  {m(
                    "Đầu vào đã đổi; bản lưu khí hậu này chưa được tính lại theo thay đổi.",
                    "Inputs changed; this saved climate result has not been recalculated.",
                  )}
                </p>
              )}
              {targets.length ? (
                <div className="forecast-table-wrap">
                  <table className="forecast-table">
                    <caption>
                      {m(
                        "Ước tính từng tháng đích · nghiên cứu",
                        "Estimates for individual target months · research",
                      )}
                    </caption>
                    <thead>
                      <tr>
                        <th>{m("Tháng đích", "Target month")}</th>
                        <th>
                          {m("Mưa", "Rain")}
                          <small>mm/{m("tháng", "month")}</small>
                        </th>
                        <th>
                          {m("Nhiệt độ", "Temperature")}
                          <small>°C</small>
                        </th>
                        <th>
                          RH<small>%</small>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {targets.map((date) => (
                        <tr key={date}>
                          <th>
                            {new Intl.DateTimeFormat(vi ? "vi" : "en", {
                              month: "2-digit",
                              year: "numeric",
                              timeZone: "UTC",
                            }).format(new Date(date))}
                          </th>
                          {[
                            "precip_sum_mm",
                            "air_temp_mean_c",
                            "air_rh_mean_pct",
                          ].map((target) => (
                            <td key={target}>
                              {number(
                                forecasts.find(
                                  (f) =>
                                    f.target_month === date &&
                                    f.target === target,
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
                    "Bản lưu chỉ có tháng đích 12/2026 và 02/2027; không có tháng nằm trong vụ bạn chọn. Hãy dùng lịch sử để chuẩn bị trao đổi hoặc chờ kết quả model đúng thời gian.",
                    "The saved targets are Dec 2026 and Feb 2027; none falls within your selected season. Use history for discussion or obtain model output for the right period.",
                  )}
                </p>
              )}
              <p className="context-footnote">
                {m(
                  "Mỗi hàng là một tháng, không phải tổng ba tháng. RH kém baseline; mưa 12/2026 và nhiệt 02/2027 dùng nền khí hậu. Chưa dùng để chọn ngày gieo hoặc tưới.",
                  "Each row is one month, not a three-month total. RH underperforms baseline; Dec rain and Feb temperature use climatology. Not for sowing dates or daily irrigation.",
                )}
              </p>
              <details>
                <summary>
                  {m(
                    "Dải tham khảo & phương pháp",
                    "Reference ranges & methods",
                  )}
                </summary>
                <p>
                  {m(
                    "Dải chưa hiệu chuẩn đủ: độ phủ kiểm thử khoảng 63,9–72,2%, thấp hơn mức danh nghĩa 80%. Chưa xác minh theo vintage vận hành.",
                    "Ranges are undercalibrated: test coverage is about 63.9–72.2%, below nominal 80%. Operational vintage has not been verified.",
                  )}
                </p>
                {forecasts.map((f) => (
                  <p key={`${f.target}/${f.horizon_months}`}>
                    {f.target} · {f.target_month.slice(0, 7)}: {number(f.lower)}
                    –{number(f.upper)} {f.unit} · {f.method} · cutoff{" "}
                    {f.feature_data_cutoff.slice(0, 7)}
                  </p>
                ))}
              </details>
            </>
          ) : (
            <p role="status">
              {snapshotError ||
                m(
                  "Model này chưa hỗ trợ ranh hiện tại. Lịch sử vẫn dùng được khi nguồn có dữ liệu.",
                  "This model does not support this boundary. History remains available where the source supports it.",
                )}
              {snapshotError && (
                <button onClick={retry}>
                  {m("Thử tải lại bản lưu", "Retry saved result")}
                </button>
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}
