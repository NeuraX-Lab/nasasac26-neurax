import type { Overview } from "./climate-contracts";

/** Independent scales: each row is a target month, not a continuous season. */
export function ForecastPlot({
  forecasts,
  vi,
}: {
  forecasts: Overview["forecasts"];
  vi: boolean;
}) {
  const format = (n: number) =>
    new Intl.NumberFormat(vi ? "vi" : "en", {
      maximumFractionDigits: 1,
    }).format(n);
  return (
    <div className="forecast-plots">
      {(["precip_sum_mm", "air_temp_mean_c", "air_rh_mean_pct"] as const).map(
        (target) => {
          const rows = forecasts
            .filter((f) => f.target === target)
            .sort((a, b) => a.target_month.localeCompare(b.target_month));
          if (!rows.length) return null;
          const low = Math.min(0, ...rows.map((f) => f.lower));
          const high = Math.max(...rows.map((f) => f.upper), 1);
          const x = (v: number) => 45 + ((v - low) / (high - low)) * 150;
          const unit =
            target === "precip_sum_mm"
              ? vi
                ? "mm/tháng"
                : "mm/month"
              : target === "air_temp_mean_c"
                ? "°C"
                : "%RH";
          const label =
            target === "precip_sum_mm"
              ? vi
                ? "Mưa"
                : "Rain"
              : target === "air_temp_mean_c"
                ? vi
                  ? "Nhiệt độ"
                  : "Temperature"
                : "RH";
          return (
            <figure key={target}>
              <figcaption>
                {label} <small>{unit}</small>
              </figcaption>
              <svg
                viewBox="0 0 240 108"
                role="img"
                aria-label={`${label}: ${rows.map((f) => `${f.target_month}: ${format(f.value)} ${unit}, ${format(f.lower)}–${format(f.upper)}`).join("; ")}`}
              >
                <line x1="45" x2="195" y1="86" y2="86" stroke="#c5cdb7" />
                <text x="45" y="103" fontSize="12" fill="#52644f">
                  {format(low)}
                </text>
                <text
                  x="195"
                  y="103"
                  fontSize="12"
                  textAnchor="end"
                  fill="#52644f"
                >
                  {format(high)}
                </text>
                {rows.map((f, i) => {
                  const y = 25 + i * 38;
                  return (
                    <g key={f.target_month}>
                      <title>
                        {f.target_month}: {format(f.value)} {unit};{" "}
                        {format(f.lower)}–{format(f.upper)}; coverage{" "}
                        {format(f.backtest_coverage * 100)}%
                      </title>
                      <text x="2" y={y + 3} fontSize="13" fill="#314d3d">
                        {f.target_month.slice(5, 7)}/
                        {f.target_month.slice(2, 4)}
                      </text>
                      <line
                        x1={x(f.lower)}
                        x2={x(f.upper)}
                        y1={y}
                        y2={y}
                        stroke="#a5b97d"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <circle
                        cx={x(f.value)}
                        cy={y}
                        r="5"
                        fill={i === 0 ? "#1d674a" : "#b16920"}
                      />
                      <text
                        x="236"
                        y={y + 4}
                        textAnchor="end"
                        fontSize="12"
                        fontWeight="600"
                        fill="#183f2e"
                      >
                        {format(f.value)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="plot-readings">
                {rows.map((f) => (
                  <div key={f.target_month}>
                    <span>
                      {f.target_month.slice(5, 7)}/{f.target_month.slice(0, 4)}
                    </span>
                    <strong>
                      {format(f.value)} <small>{unit}</small>
                    </strong>
                  </div>
                ))}
              </div>
            </figure>
          );
        },
      )}
      <p>
        {vi
          ? "Hai tháng đích riêng biệt, không có dữ liệu 01/2027 ở đây. Mỗi biến có thang riêng; mốc 0 không phải nền khí hậu. Chấm: ước tính · đoạn: dải tham khảo, chưa bảo đảm độ phủ."
          : "Separate target months; no Jan 2027 data here. Independent scales; zero is not a climate baseline. Dot: estimate · line: reference range, coverage not guaranteed."}
      </p>
    </div>
  );
}
