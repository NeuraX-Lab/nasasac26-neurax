import { useState } from "react";
import { Modal } from "../../shared/ui/Modal";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "../../core/state";
import { Scenario } from "../scenarios/Scenario";
export function Rotations({ openEvidence }: { openEvidence: () => void }) {
  const { t } = useTranslation();
  const [compare, setCompare] = useState(false);
  const { prefs, patch } = useApp();
  return (
    <>
      <div className="panel-heading">
        <span className="eyebrow">{t("reference")}</span>
        <h1>{t("options")}</h1>
        <p>{t("optionsIntro")}</p>
      </div>
      <div className="current-status">
        <span className="hollow-dot" />
        {t("currentUnknown")}
      </div>
      <button className="compare-trigger" onClick={() => setCompare(true)}>
        {t("compare")}
      </button>
      <Modal
        open={compare}
        onClose={() => setCompare(false)}
        title={t("compare")}
      >
        <p className="notice">{t("inspecting")}</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("reference")}</th>
                {["R0", "R1", "R2"].map((id) => (
                  <th key={id}>{id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{t("options")}</th>
                {["rice", "babycorn", "mungbean"].map((c) => (
                  <td key={c}>
                    {t("rice")} → {t(c)} → {t("rice")}
                  </td>
                ))}
              </tr>
              <tr>
                <th>{t("score")}</th>
                {[0, 1, 2].map((i) => (
                  <td key={i}>{t("unavailable")}</td>
                ))}
              </tr>
              <tr>
                <th>{t("checks")}</th>
                {[0, 1, 2].map((i) => (
                  <td key={i}>{t("checksText")}</td>
                ))}
              </tr>
              <tr>
                <th>{t("evidence")}</th>
                {["R0", "R1", "R2"].map((id) => (
                  <td key={id}>
                    <button
                      onClick={() => {
                        patch({ selected: id });
                        setCompare(false);
                        openEvidence();
                      }}
                    >
                      {t("inspectEvidence")}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p>{t("noA1Text")}</p>
      </Modal>
      <div className="rotations">
        {["R0", "R1", "R2"].map((id, i) => {
          const open = prefs.selected === id;
          return (
            <article key={id} className={`rotation ${open ? "selected" : ""}`}>
              <button
                className="rotation-toggle"
                onClick={() => patch({ selected: open ? "" : id })}
                aria-expanded={open}
              >
                <span className="rotation-id">{id}</span>
                <span>
                  {t("rice")}
                  <span className="crop-arrow">→</span>
                  {t(i === 0 ? "rice" : i === 1 ? "babycorn" : "mungbean")}
                  <span className="crop-arrow">→</span>
                  {t("rice")}
                </span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {open && (
                <div className="rotation-details">
                  <span className="inspecting">
                    <Check size={13} />
                    {t("inspecting")}
                  </span>
                  <h2>{t("why")}</h2>
                  <p>{i === 0 ? t("referenceLimit") : t("whyText")}</p>
                  <h2>{t("checks")}</h2>
                  <p>{t("checksText")}</p>
                  <button className="text-button" onClick={openEvidence}>
                    {t("inspectEvidence")}
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <div className="notice amber">
        <AlertTriangle size={17} />
        <span>{t("needsReview")}</span>
      </div>
      <div className="capability-note">
        <span className="small-label">A1</span>
        <div>
          <strong>{t("noA1")}</strong>
          <p>{t("noA1Text")}</p>
        </div>
      </div>
      <Scenario />
    </>
  );
}
