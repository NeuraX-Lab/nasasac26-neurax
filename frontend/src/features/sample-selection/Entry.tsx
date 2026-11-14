import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  ArrowUpRight,
  LocateFixed,
  BookOpen,
  FolderOpen,
  X,
} from "lucide-react";
import { useApp } from "../../core/state";
import { Header } from "../../app/layouts/Header";
import { ReferenceDialog } from "../evidence/Evidence";
export function Entry() {
  const { t } = useTranslation();
  const [groupFilter, setGroupFilter] = useState("");
  const { areas, removeArea } = useApp();
  const [ref, setRef] = useState("");
  return (
    <>
      <Header />
      <main id="main" className="entry">
        <div className="entry-heading">
          <div>
            <p className="eyebrow">
              <span className="tiny-line" /> NASA FIELD SHIFT / NEURAX
            </p>
            <h1>{t("intro")}</h1>
            <p>{t("entryIntro")}</p>
          </div>
          <Link to="/setup" className="button secondary">
            <Plus size={17} />
            {t("myArea")}
          </Link>
        </div>
        <div className="sample-grid">
          <Link to="/w/my-thanh/farmer" className="sample-card ready">
            <div className="sample-photo">
              <img
                src="/imagery/my-thanh-research.svg"
                alt={t("geometryIllustration")}
                width="1500"
                height="1120"
              />
              <span className="photo-tag">
                <span className="status-dot" />
                {t("mainSample")}
              </span>
              <div className="photo-coordinate">
                10.479098° N / 106.021621° E
              </div>
              <span className="sample-number">01</span>
            </div>
            <div className="sample-info">
              <div className="sample-title">
                <h2>{t("mythanh")}</h2>
                <span>≈2 ha</span>
              </div>
              <p className="sample-code">MT-BLOCK-01</p>
              <p>{t("digitized")}</p>
              <div className="sample-open">
                {t("openSample")}
                <ArrowRight size={20} />
              </div>
            </div>
          </Link>
          <article className="sample-card pending">
            <div className="pending-photo">
              <div className="contour-art" />
              <LocateFixed size={36} />
              <span className="photo-tag muted">{t("preparing")}</span>
              <span className="sample-number">02</span>
            </div>
            <div className="sample-info">
              <div className="sample-title">
                <h2>{t("sampleTwo")}</h2>
                <span>— ha</span>
              </div>
              <p className="sample-code">{t("pendingAOI")}</p>
              <p>{t("bichPending")}</p>
              <div className="sample-open disabled">
                <span>{t("preparing")}</span>
                <span className="waiting-dot" />
              </div>
            </div>
          </article>
        </div>
        <div className="entry-footer">
          <div className="reference-block">
            <BookOpen size={22} />
            <div>
              <h3>{t("references")}</h3>
              <p>{t("referenceIntro")}</p>
              <button
                className="text-button"
                onClick={() => setRef("Cai Lậy / Long Khánh")}
              >
                {t("sourceReview")}
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
          <div className="saved-block">
            <FolderOpen size={22} />
            <div>
              <h3>{t("saved")}</h3>
              {areas.length > 0 && (
                <label className="field-group-filter">
                  {t("fieldGroup")}
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                  >
                    <option value="">{t("allFields")}</option>
                    {[
                      ...new Set(areas.map((a) => a.group || t("ungrouped"))),
                    ].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </label>
              )}
              {!areas.length ? (
                <p>{t("noSaved")}</p>
              ) : (
                areas
                  .filter(
                    (a) =>
                      !groupFilter ||
                      (a.group || t("ungrouped")) === groupFilter,
                  )
                  .map((a) => (
                    <div className="saved-row" key={a.id}>
                      <Link to={`/w/${a.id}/farmer`}>
                        {a.name}
                        <ArrowRight size={15} />
                      </Link>
                      <button
                        className="icon-button"
                        aria-label={t("deleteArea")}
                        onClick={() => {
                          if (confirm(t("deleteConfirm"))) removeArea(a.id);
                        }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
        <p className="entry-source">
          {t("geometryIllustration")} · {t("researchNote")}
        </p>
      </main>
      <ReferenceDialog open={!!ref} title={ref} close={() => setRef("")} />
    </>
  );
}
