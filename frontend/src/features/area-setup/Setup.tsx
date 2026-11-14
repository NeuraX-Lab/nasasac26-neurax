import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info, ArrowRight } from "lucide-react";
import { useApp } from "../../core/state";
import { parseCoordinates } from "../../core/selectors";
import { emptyGeometry, type Geometry } from "../../core/contracts";
import { Header } from "../../app/layouts/Header";
import { SpatialMap } from "../../shared/map";
import { OptionalVisual } from "../../shared/OptionalVisual";
export function Setup() {
  const { t } = useTranslation();
  const { saveArea, areas } = useApp();
  const { id: editingId } = useParams();
  const existing = areas.find((a) => a.id === editingId);
  const navigate = useNavigate();
  const [group, setGroup] = useState(existing?.group || "");
  const [name, setName] = useState(existing?.name || ""),
    [coords, setCoords] = useState(
      existing?.geometry.features[0].geometry.coordinates[0]
        .slice(0, -1)
        .map((p) => p.join(", "))
        .join("\n") || "",
    ),
    [geometry, setGeometry] = useState<Geometry>(
      existing?.geometry || emptyGeometry,
    ),
    [error, setError] = useState("");

  function onDraw(g: Geometry) {
    setGeometry(g);
    setCoords(
      g.features[0]?.geometry.coordinates[0]
        .slice(0, -1)
        .map((p) => p.join(", "))
        .join("\n") || "",
    );
  }
  return (
    <>
      <Header />
      <main id="main" className="setup">
        <div className="setup-heading">
          <Link to="/" className="text-button">
            <ArrowLeft size={16} />
            {t("back")}
          </Link>
          <h1>{t(existing ? "edit" : "createArea")}</h1>
          <p>{t("drawingHelp")}</p>
        </div>
        <div className="setup-grid">
          <OptionalVisual fallback={t("loading")}><SpatialMap
            geometry={geometry}
            drawing
            onDraw={onDraw}
            imageExtent={undefined}
          /></OptionalVisual>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const g = parseCoordinates(coords);
                if (!name.trim()) throw Error("name");
                const id = existing?.id || "area-" + crypto.randomUUID();
                if (
                  !saveArea({
                    id,
                    name: name.trim(),
                    group: group.trim(),
                    geometry: g,
                    createdAt: existing?.createdAt || new Date().toISOString(),
                  })
                ) {
                  setError(t("saveProblem"));
                  return;
                }
                navigate(`/w/${id}/farmer`);
              } catch {
                setError(t("invalidGeometry"));
                (
                  e.currentTarget.elements.namedItem(
                    "coordinates",
                  ) as HTMLTextAreaElement
                )?.focus();
              }
            }}
          >
            <label>
              {t("fieldGroup")}
              <input
                value={group}
                maxLength={80}
                onChange={(e) => setGroup(e.target.value)}
              />
            </label>
            <label>
              {t("areaName")}
              <input
                name="areaName"
                autoComplete="off"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              {t("coordinates")}
              <textarea
                name="coordinates"
                aria-label={t("coordinates")}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!error}
                aria-describedby="coordinate-help area-error"
                rows={8}
                value={coords}
                onChange={(e) => {
                  setCoords(e.target.value);
                  try {
                    setGeometry(parseCoordinates(e.target.value));
                  } catch {
                    /* keep last valid boundary */
                  }
                }}
              />
            </label>
            <p id="coordinate-help">{t("coordinateHelp")}</p>
            {error && (
              <p id="area-error" className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="notice">
              <Info size={17} />
              {t("noDataText")}
            </div>
            <button className="button primary" type="submit">
              {t("saveArea")}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
