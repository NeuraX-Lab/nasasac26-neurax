import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
} from "recharts";
import { ChartNoAxesCombined, Table2 } from "lucide-react";
import type { Month } from "../../core/contracts";
export default function Climate({
  months,
  average = false,
  synthetic = false,
}: {
  months: Month[];
  average?: boolean;
  synthetic?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [table, setTable] = useState(false);
  const fmt = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 1,
  });
  const data = months.map((x) => ({
    ...x,
    label: new Intl.DateTimeFormat(i18n.language, {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(x.date + "T00:00:00Z")),
  }));
  return (
    <section className="climate-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("climate")}</span>
          <h2>{t(average ? "climatology" : "monthly")}</h2>
        </div>
        <button
          className="icon-button"
          aria-label={t(table ? "chart" : "showData")}
          onClick={() => setTable(!table)}
        >
          {table ? <ChartNoAxesCombined size={19} /> : <Table2 size={19} />}
        </button>
      </div>
      {table ? (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">{t("climate")}</caption>
            <thead>
              <tr>
                <th>{t("month")}</th>
                <th>{t("rain")} (mm)</th>
                <th>{t("temp")} (°C)</th>
                <th>{t("coverage")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((x) => (
                <tr key={x.date}>
                  <th>{x.label}</th>
                  <td>{x.rain === null ? "—" : fmt.format(x.rain)}</td>
                  <td>{x.temp === null ? "—" : fmt.format(x.temp)}</td>
                  <td>{fmt.format(x.coverage * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="climate-chart"
          role="img"
          aria-label={`${t("rain")} mm/month; ${t("temp")} °C; ${t("showData")}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 15, right: 0, bottom: 0, left: -17 }}
            >
              <CartesianGrid vertical={false} stroke="#e5eae6" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#5b6e65" }}
              />
              <YAxis
                tickFormatter={(v) => fmt.format(v)}
                yAxisId="rain"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#5b6e65" }}
              />
              <YAxis
                tickFormatter={(v) => fmt.format(v)}
                yAxisId="temp"
                orientation="right"
                domain={["dataMin - 2", "dataMax + 2"]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#5b6e65" }}
              />
              <Tooltip
                formatter={(v, name) => [
                  typeof v === "number" ? fmt.format(v) : v,
                  name === "rain" ? `${t("rain")} (mm)` : `${t("temp")} (°C)`,
                ]}
              />
              <Bar
                dataKey="rain"
                yAxisId="rain"
                fill="#73a68c"
                radius={[3, 3, 0, 0]}
                maxBarSize={30}
              />
              <Line
                dataKey="temp"
                yAxisId="temp"
                stroke="#b68b42"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="chart-legend">
        <span>
          <i />
          {t("rain")} · mm/{t("month").toLowerCase()}
        </span>
        <span>
          <i className="line" />
          {t("temp")} · °C
        </span>
        <span className={synthetic ? "synthetic-label" : "source-label"}>
          {synthetic ? t("synthetic") : "NASA POWER"}
        </span>
      </div>
    </section>
  );
}
