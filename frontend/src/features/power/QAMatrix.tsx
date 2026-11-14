import { useTranslation } from "react-i18next";
import type { Bundle } from "../../core/contracts";
export function QAMatrix({
  months,
  synthetic,
  onInspect,
}: {
  months: Bundle["months"];
  synthetic: boolean;
  onInspect: (kind: string, month: number) => void;
}) {
  const { t } = useTranslation();
  const groups = Array.from({ length: 12 }, (_, i) =>
    months.filter((x) => Number(x.date.slice(5, 7)) === i + 1),
  );
  return (
    <section className="qa-matrix">
      <div className="section-heading">
        <h2>{t("qa")}</h2>
        <span className="small-label">
          {synthetic ? "UI FIXTURE" : "D1 / Q1"}
        </span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{t("month")}</th>
              {groups.map((_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["rain", "temp", "coverage"].map((kind) => (
              <tr key={kind}>
                <th>{t(kind)}</th>
                {groups.map((g, i) => {
                  const fail = g.some(x => x.qa === "fail");
                  const warn = g.some(x => x.qa === "warn");
                  const missing =
                    !g.length ||
                    g.some((x) =>
                      kind === "coverage"
                        ? x.coverage < 1
                        : x[kind as "rain" | "temp"] === null,
                    );
                  return (
                    <td key={i}>
                      <button
                        onClick={() => onInspect(kind, i + 1)}
                        aria-label={`${t(kind)} ${i + 1}: ${t(fail || warn || missing ? "needsCheck" : "coverage")}`}
                        className={`qa-cell ${fail ? "fail" : warn || missing ? "warn" : "ok"}`}
                        title={t(fail || warn || missing ? "needsCheck" : "coverage")}
                      >
                        {fail ? "FAIL" : warn || missing ? "!" : "✓"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{t("qaTechnical")}</p>
    </section>
  );
}
