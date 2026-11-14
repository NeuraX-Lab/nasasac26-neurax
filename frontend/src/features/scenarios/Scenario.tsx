import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import { useApp } from "../../core/state";
export function Scenario() {
  const { t, i18n } = useTranslation();
  const { prefs, patch } = useApp();
  return (
    <section className="scenario">
      <div className="section-heading">
        <h2>{t("scenario")}</h2>
        <button
          className="icon-button"
          aria-label={t("reset")}
          onClick={() => patch({ rainDelta: 0, tempDelta: 0 })}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>
      <label>
        {t("rainChange")}
        <span>
          {new Intl.NumberFormat(i18n.language, {
            signDisplay: "always",
          }).format(prefs.rainDelta)}
          %
        </span>
        <input
          aria-label={t("rainChange")}
          type="range"
          min="-50"
          max="50"
          step="5"
          value={prefs.rainDelta}
          onChange={(e) => patch({ rainDelta: Number(e.target.value) })}
        />
        <input
          aria-label={`${t("rainChange")} (%)`}
          type="number"
          min="-50"
          max="50"
          value={prefs.rainDelta}
          onChange={(e) =>
            patch({
              rainDelta: Math.max(-50, Math.min(50, Number(e.target.value))),
            })
          }
        />
      </label>
      <label>
        {t("tempChange")} (°C)
        <input
          aria-label={t("tempChange")}
          type="number"
          min="-5"
          max="5"
          step="0.5"
          value={prefs.tempDelta}
          onChange={(e) =>
            patch({
              tempDelta: Math.max(-5, Math.min(5, Number(e.target.value))),
            })
          }
        />
      </label>
      <p>{t("scenarioHelp")}</p>
      <span className="draft-status">{t("notCalculated")}</span>
    </section>
  );
}
