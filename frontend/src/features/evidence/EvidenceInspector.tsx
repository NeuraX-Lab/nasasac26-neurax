import { useTranslation } from "react-i18next";
import { Modal } from "../../shared/ui/Modal";
import type { Bundle } from "../../core/contracts";
export type Inspection = { kind: string; month: number };
export function EvidenceInspector({
  bundle,
  inspection,
  year,
  onClose,
}: {
  bundle: Bundle | null;
  inspection: Inspection | null;
  year: string;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const rows =
    bundle?.months.filter(
      (x) =>
        Number(x.date.slice(5, 7)) === inspection?.month &&
        (year === "all" || x.date.startsWith(year)),
    ) || [];
  const format = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 2,
  });
  return (
    <Modal open={!!inspection} onClose={onClose} title={t("inspectMonth")}>
      <h3>
        {t(inspection?.kind || "climate")} · {t("month")} {inspection?.month}
      </h3>
      <dl>
        <dt>{t("dataset")}</dt>
        <dd>{bundle?.datasetVersion || "—"}</dd>
        <dt>Run</dt>
        <dd>{bundle?.runId || "—"}</dd>
        <dt>{t("scope")}</dt>
        <dd>{t("coarse")}</dd>
        <dt>{t("resolution")}</dt>
        <dd>{bundle?.source.nativeResolution || t("unknown")}</dd>
        <dt>{t("source")}</dt>
        <dd>{bundle?.source.provider || "—"}</dd>
      </dl>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{t("date")}</th>
              <th>{t("rain")} mm/month</th>
              <th>{t("temp")} °C</th>
              <th>{t("coverage")}</th>
              <th>QA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date}>
                <th>
                  {new Intl.DateTimeFormat(i18n.language, {
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(r.date))}
                </th>
                <td>{r.rain === null ? "—" : format.format(r.rain)}</td>
                <td>{r.temp === null ? "—" : format.format(r.temp)}</td>
                <td>{format.format(r.coverage * 100)}%</td>
                <td>{r.qa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{t("qaTechnical")}</p>
      {rows.some((r) => r.date === "2020-06-01") && (
        <p className="notice amber">{t("qaWarn")}</p>
      )}
      <h3>{t("missingInputs")}</h3>
      <p>{t("missingAnswer")}</p>
      {bundle?.source.url && (
        <a
          className="button secondary"
          href={bundle.source.url}
          target="_blank"
          rel="noreferrer"
        >
          {t("sourceLink")}
        </a>
      )}
      <code className="hash">
        {bundle?.source.featuresSha256 || t("synthetic")}
      </code>
    </Modal>
  );
}
