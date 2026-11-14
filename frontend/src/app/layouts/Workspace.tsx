import { Assistant } from "../../features/assistant/Assistant";
import {
  EvidenceInspector,
  type Inspection,
} from "../../features/evidence/EvidenceInspector";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Map,
  Layers,
  BookOpen,
  Mountain,
  ArrowLeft,
  Info,
  ArrowUpRight,
  PanelBottom,
} from "lucide-react";
import { useApp } from "../../core/state";
import { summarize } from "../../core/selectors";
import { emptyGeometry, type Geometry } from "../../core/contracts";
import { useBundle } from "../../data/adapters/useBundle";
import { Header } from "./Header";
import {
  SourceDialog,
  ReferenceDialog,
} from "../../features/evidence/Evidence";
import { AnalysisPanel } from "../../features/analysis/AnalysisPanel";
import { useAnalysis } from "../../features/analysis/state";
import { QAMatrix } from "../../features/power/QAMatrix";
import { SpatialMap } from "../../shared/map";
import { Climate } from "../../shared/charts";
import { OptionalVisual } from "../../shared/OptionalVisual";
export function Workspace() {
  const { id = "my-thanh", mode = "farmer" } = useParams();
  const { t } = useTranslation();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const { prefs, patch, areas } = useApp();
  const analysis = useAnalysis();
  const [params, setParams] = useSearchParams();
  const [source, setSource] = useState(false),
    [evidence, setEvidence] = useState(false),
    [dock, setDock] = useState(true),
    [dockFull, setDockFull] = useState(false);
  const area = areas.find((x) => x.id === id),
    isMain = id === "my-thanh",
    power = mode === "power";
  const { bundle, error, retry } = useBundle(prefs.environment, isMain);
  const rows = useMemo(
    () => (bundle ? summarize(bundle.months, prefs.year) : []),
    [bundle, prefs.year],
  );
  useEffect(() => {
    const env = params.get("data"),
      year = params.get("year");
    if (env === "research" || env === "sandbox") patch({ environment: env });
    if (year && /^(all|201[5-9]|202[0-5])$/.test(year)) patch({ year });
  }, []); // URL hydration once; state is shared across modes
  const geometry = (isMain ? (bundle?.geometry || analysis.records[id]?.run.inputs.geometry) : area?.geometry) as
    Geometry | undefined;
  function changeFilter(v: Partial<typeof prefs>) {
    patch(v);
    const p = new URLSearchParams(params);
    if (v.environment) p.set("data", v.environment);
    if (v.year) p.set("year", v.year);
    setParams(p, { replace: true });
  }
  if ((!isMain && !area) || !["farmer", "power"].includes(mode))
    return (
      <>
        <Header />
        <main id="main" className="center-message">
          <h1>{t("areaUnavailable")}</h1>
          <p>{t("invalidWorkspace")}</p>
          <Link className="button" to="/">
            {t("back")}
          </Link>
        </main>
      </>
    );
  return (
    <>
      <Header />
      <main id="main" className={`workspace ${power ? "power" : ""}`}>
        <nav className="side-rail" aria-label={t("earth")}>
          <Link to="/" aria-label={t("back")}>
            <Map size={23} />
          </Link>
          <button aria-label={t("layers")} onClick={() => setSource(true)}>
            <Layers size={22} />
          </button>
          <button aria-label={t("evidence")} onClick={() => setEvidence(true)}>
            <BookOpen size={22} />
          </button>
          <div className="rail-bottom">
            <Mountain size={21} />
            <span>1×</span>
          </div>
        </nav>
        <div className="workspace-body">
          <div className="workspace-toolbar">
            <div className="workspace-location">
              <Link to="/" aria-label={t("changeArea")}>
                <ArrowLeft size={17} />
              </Link>
              <div>
                <h2>{isMain ? t("mythanh") : area?.name}</h2>
                <span>{isMain ? "MT-BLOCK-01 · ≈2 ha" : t("localOnly")}</span>
              </div>
            </div>
            <div className="toolbar-controls">
              {!isMain && <Link className="text-button" to={`/setup/${id}`}>{t("edit")}</Link>}
              {bundle && (
                <span className="run-label" title={bundle.runId}>
                  {bundle.datasetVersion}
                </span>
              )}
              <div className="segmented mode-switch">
                <Link
                  aria-current={!power ? "page" : undefined}
                  to={`/w/${id}/farmer?${params}`}
                >
                  {t("farmer")}
                </Link>
                <Link
                  aria-current={power ? "page" : undefined}
                  to={`/w/${id}/power?${params}`}
                >
                  {t("power")}
                </Link>
              </div>
              <label className="select-label">
                <span className="sr-only">{t("year")}</span>
                <select
                  aria-label={t("year")}
                  value={prefs.year}
                  onChange={(e) => changeFilter({ year: e.target.value })}
                >
                  {(prefs.environment === "sandbox"
                    ? ["2025"]
                    : [
                        "all",
                        ...Array.from({ length: 11 }, (_, i) =>
                          String(2025 - i),
                        ),
                      ]
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y === "all" ? t("allYears") : y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="select-label">
                <span className="sr-only">{t("dataset")}</span>
                <select
                  aria-label={t("dataset")}
                  value={prefs.environment}
                  onChange={(e) =>
                    changeFilter({
                      environment: e.target.value as "research" | "sandbox",
                      year: e.target.value === "sandbox" ? "2025" : "all",
                    })
                  }
                >
                  <option value="research">{t("research")}</option>
                  <option value="sandbox">{t("sandbox")}</option>
                </select>
              </label>
            </div>
          </div>
          <div className={`workspace-content ${power ? "analytical" : ""}`}>
            <div className="spatial-stage">
              {isMain && !bundle && !error ? (
                <div className="loading-state" role="status">
                  <span className="spinner" />
                  {t("loading")}
                </div>
              ) : error ? (
                <div className="center-message" role="alert">
                  <h2>{t("loadError")}</h2>
                  <p>{t("keepResearch")}</p>
                  <button onClick={retry}>{t("retry")}</button>
                </div>
              ) : (
                <OptionalVisual fallback={t("loading")}><SpatialMap
                  areaId={id}
                  geometry={geometry || emptyGeometry}
                  imageExtent={undefined}
                /></OptionalVisual>
              )}
              <div className="spatial-title">
                <span className="eyebrow">
                  <span className="status-dot" />
                  {t(
                    !isMain
                      ? "noData"
                      : prefs.environment === "sandbox"
                        ? "synthetic"
                        : "observed",
                  )}
                </span>
                <h1>{isMain ? "Mỹ Thành" : area?.name}</h1>
                <p>{isMain ? t("researchNote") : t("noDataText")}</p>
              </div>
              <button
                className="provenance-pill"
                onClick={() => setSource(true)}
              >
                <Info size={14} />
                {t("source")}
                <ArrowUpRight size={14} />
              </button>
              {power && (
                <button className="dock-toggle" onClick={() => setDock(!dock)}>
                  <PanelBottom size={17} />
                  {t(dock ? "closeDock" : "openDock")}
                </button>
              )}
              {bundle && !power && (
                <div className="climate-overlay">
                  <OptionalVisual fallback={t("loading")}><Climate
                    months={rows}
                    average={prefs.year === "all"}
                    synthetic={prefs.environment === "sandbox"}
                  /></OptionalVisual>
                </div>
              )}
            </div>
            {!power && (
              <aside className="decision-panel">
                <AnalysisPanel aoiId={id} geometry={geometry || emptyGeometry} sandbox={prefs.environment === "sandbox"} />
              </aside>
            )}
            {power && dock && (
              <section className={`analysis-dock ${dockFull ? "full" : ""}`}>
                <div className="dock-header">
                  <div className="dock-tabs">
                    <span className="active">{t("qa")}</span>
                    <button onClick={() => setEvidence(true)}>
                      {t("constraints")}
                    </button>
                    <button onClick={() => setSource(true)}>
                      {t("provenance")}
                    </button>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={t("fullTable")}
                    onClick={() => setDockFull(!dockFull)}
                  >
                    <PanelBottom size={18} />
                  </button>
                </div>
                {!bundle ? (
                  <AnalysisPanel aoiId={id} geometry={geometry || emptyGeometry} power sandbox={prefs.environment === "sandbox"} />
                ) : (
                  <>
                    <AnalysisPanel aoiId={id} geometry={geometry || emptyGeometry} power sandbox={prefs.environment === "sandbox"} />
                    <div className="analysis-grid">
                      <QAMatrix
                        onInspect={(kind, month) =>
                          setInspection({ kind, month })
                        }
                        months={
                          prefs.year === "all"
                            ? bundle.months
                            : bundle.months.filter((x) =>
                                x.date.startsWith(prefs.year),
                              )
                        }
                        synthetic={prefs.environment === "sandbox"}
                      />
                      <OptionalVisual fallback={t("loading")}><Climate
                        months={rows}
                        average={prefs.year === "all"}
                        synthetic={prefs.environment === "sandbox"}
                      /></OptionalVisual>
                    </div>

                  </>
                )}
              </section>
            )}
          </div>
          <footer className="workspace-footer">
            <span className="warning-dot" />
            {t(
              !isMain
                ? "noDataText"
                : prefs.environment === "sandbox"
                  ? "sandboxWarn"
                  : "qaWarn",
            )}
            <button onClick={() => setSource(true)}>{t("source")}</button>
          </footer>
        </div>
      </main>
      <Assistant
        bundle={bundle}
        areaName={isMain ? t("mythanh") : area?.name || id}
        year={prefs.year}
      />
      <EvidenceInspector
        bundle={bundle}
        inspection={inspection}
        year={prefs.year}
        onClose={() => setInspection(null)}
      />
      <SourceDialog
        bundle={bundle}
        open={source}
        close={() => setSource(false)}
      />
      <ReferenceDialog
        open={evidence}
        title={`${prefs.selected || "R1"} / ${t("evidence")}`}
        close={() => setEvidence(false)}
      />
    </>
  );
}
