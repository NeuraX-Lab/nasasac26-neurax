import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Info, ArrowUpRight } from "lucide-react";
import type { Bundle } from "../../core/contracts";
import { checkLab } from "../../data/repositories";
import { Modal } from "../../shared/ui/Modal";
export function ReferenceDialog({
  open,
  title,
  close,
}: {
  open: boolean;
  title: string;
  close: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal open={open} title={title || t("evidence")} onClose={close}>
      <div className="notice">
        <Info size={18} />
        {t("referenceLimit")}
      </div>
      <h3>{t("checks")}</h3>
      <p>{t("checksText")}</p>
      <div className="source-record">
        <span className="eyebrow">LONG KHÁNH / S4</span>
        <h3>CTU 2009 · 11:194–199</h3>
        <p>{t("sourceLanguage")}</p>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/download/605/3214/3214"
        >
          {t("sourceLink")}
          <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="source-record">
        <span className="eyebrow">CAI LẬY / S5</span>
        <h3>CTU 2009 · 11:262–269</h3>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/download/597/3222/3222"
        >
          {t("sourceLink")}
          <ArrowUpRight size={16} />
        </a>
      </div>
      <dl>
        <dt>{t("reviewer")}</dt>
        <dd>{t("unconfirmed")}</dd>
        <dt>{t("score")}</dt>
        <dd>null</dd>
      </dl>
      <p>{t("noA1Text")}</p>
    </Modal>
  );
}

export function SourceDialog({
  bundle,
  open,
  close,
}: {
  bundle: Bundle | null;
  open: boolean;
  close: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [apiState, setApi] = useState("");
  const [checking, setChecking] = useState(false);
  return (
    <Modal title={t("sourceInfo")} open={open} onClose={close}>
      {bundle && (
        <>
          <div
            className={`notice ${bundle.dataMode === "synthetic" ? "amber" : ""}`}
          >
            <Info size={18} />
            {t(bundle.dataMode === "synthetic" ? "sandboxWarn" : "coarse")}
          </div>
          <dl>
            <dt>{t("source")}</dt>
            <dd>{bundle.source.provider}</dd>
            <dt>{t("dataset")}</dt>
            <dd>{bundle.datasetVersion}</dd>
            <dt>Run ID</dt>
            <dd>{bundle.runId}</dd>
            <dt>{t("scope")}</dt>
            <dd>{t("coarse")}</dd>
            <dt>{t("resolution")}</dt>
            <dd>{t("resolutionText")}</dd>
            <dt>{t("rain")}</dt>
            <dd>{bundle.source.units.rain}</dd>
            <dt>{t("temp")}</dt>
            <dd>{bundle.source.units.temp}</dd>
            <dt>{t("retrieved")}</dt>
            <dd>
              {new Intl.DateTimeFormat(i18n.language, {
                dateStyle: "medium",
              }).format(new Date(bundle.source.retrievedAt))}
            </dd>
          </dl>
          {bundle.source.url && (
            <a
              className="button secondary"
              target="_blank"
              rel="noreferrer"
              href={bundle.source.url}
            >
              {t("sourceLink")}
              <ArrowUpRight size={16} />
            </a>
          )}
          {bundle.dataMode !== "synthetic" && (
            <>
              <h3>SHA-256</h3>
              <code className="hash">{bundle.source.sourceSha256}</code>
              <div className="notice amber">{t("qaWarn")}</div>
            </>
          )}
        </>
      )}
      <h3>{t("terrainSource")}</h3>
      <p>{t("terrainMetadata")}</p>
      <a
        href="https://registry.opendata.aws/terrain-tiles/"
        target="_blank"
        rel="noreferrer"
      >
        AWS Open Data <ArrowUpRight size={15} />
      </a>
      <p className="small">
        Mapzen; SRTM, GMTED2010, 3DEP: USGS · ETOPO1: NOAA
      </p>
      <h3>{t("api")}</h3>
      <p>{t("apiMissing")}</p>
      <button
        disabled={checking}
        onClick={async () => {
          setChecking(true);
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 5000);
          try {
            const r = await checkLab(ctrl.signal);
            setApi(t(r.available ? "status" : "apiMissing"));
          } catch {
            setApi(t("loadError"));
          } finally {
            clearTimeout(timer);
            setChecking(false);
          }
        }}
      >
        {t(checking ? "loading" : "checkApi")}
      </button>
      <p role="status">{apiState}</p>
      <p>{t("forecast")}</p>
      <p>{t("device")}</p>
    </Modal>
  );
}
