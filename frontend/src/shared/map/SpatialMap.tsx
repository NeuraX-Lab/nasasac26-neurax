import { useApp } from "../../core/state";
import { useHardware } from "../../features/hardware/state";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as GLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { useTranslation } from "react-i18next";
import {
  Mountain,
  RotateCcw,
  Expand,
  Minimize,
  Layers,
  Plus,
  Minus,
  PenLine,
  MousePointer2,
  Trash2,
} from "lucide-react";
import type { Geometry } from "../../core/contracts";
import { center } from "../../core/selectors";
import { pointInside } from "../../features/dashboard/model";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

maplibregl.setWorkerUrl(workerUrl);
maplibregl.setWorkerCount(2);

type Props = {
  areaId?: string;
  geometry: Geometry;
  drawing?: boolean;
  onDraw?: (g: Geometry) => void;
  imageExtent?: { xmin: number; ymin: number; xmax: number; ymax: number };
  sensorNavigation?: { selected: string; onSelect: (head: string) => void };
};

export default function SpatialMap({
  geometry,
  areaId,
  drawing = false,
  onDraw,
  imageExtent,
  sensorNavigation,
}: Props) {
  const { t } = useTranslation();
  const { placements, events } = useHardware();
  const { areas } = useApp();
  const navigate = useNavigate();
  const [mapParams] = useSearchParams();
  const [device, setDevice] = useState(""),
    [fieldInfo, setFieldInfo] = useState(false);
  const host = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLDivElement>(null),
    map = useRef<GLMap | null>(null),
    draw = useRef<TerraDraw | null>(null);
  const latest = useRef({ geometry, onDraw });
  latest.current = { geometry, onDraw };
  const sensorNav = useRef(sensorNavigation);
  sensorNav.current = sensorNavigation;
  const [imageryFailed, setImageryFailed] = useState(false);
  const [failed, setFailed] = useState(false),
    [attempt, setAttempt] = useState(0),
    [loaded, setLoaded] = useState(false),
    [terrain, setTerrain] = useState(false),
    [terrainState, setTerrainState] = useState<"loading" | "ready" | "error">(
      "loading",
    ),
    [expanded, setExpanded] = useState(false),
    [layers, setLayers] = useState(false),
    [lowDetail, setLowDetail] = useState(false),
    [image, setImage] = useState(true),
    [boundary, setBoundary] = useState(true),
    [restoreTerrain, setRestoreTerrain] = useState(false),
    [drawMode, setDrawMode] = useState(false);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!canvas.current) return;
    let disposed = false;
    setFailed(false);
    setLoaded(false);
    setTerrainState("loading");
    let m: GLMap;
    try {
      m = new maplibregl.Map({
        container: canvas.current,
        center: center(latest.current.geometry),
        zoom: 17.2,
        pitch: 0,
        bearing: 0,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: "background",
              type: "background",
              paint: { "background-color": "#c7d0bd" },
            },
          ],
        },
        maxPitch: 65,
        attributionControl: {
          compact: true,
          customAttribution: imageExtent
            ? "Esri, Vantor, Earthstar Geographics, GIS User Community · 07 Aug 2025"
            : undefined,
        },
        canvasContextAttributes: {
          preserveDrawingBuffer: true,
          antialias: false,
        },
      });
      map.current = m;
      m.setPixelRatio(Math.min(devicePixelRatio, 1));
      if (import.meta.env.DEV) (window as any).__agrotwinMap = m;
    } catch {
      setFailed(true);
      return;
    }

    m.on("webglcontextlost", () => {
      setFailed(true);
      setTerrain(false);
    });
    m.on("error", (e) => {
      if ("sourceId" in e && e.sourceId === "satellite") {
        setImageryFailed(true);
        if (m.getLayer("satellite"))
          m.setLayoutProperty("satellite", "visibility", "none");
      }
      if (e.error?.message?.includes("WebGL")) setFailed(true);
      if ("sourceId" in e && e.sourceId === "terrain") {
        setTerrainState("error");
        setTerrain(false);
        try {
          m.setTerrain(null);
          m.jumpTo({ pitch: 0 });
        } catch {
          /* context lost */
        }
      }
    });

    m.once("load", async () => {
      if (disposed) return;
      if (!imageExtent) {
        m.addSource("osm", {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        });
        m.addLayer({ id: "basemap", type: "raster", source: "osm" });
        m.addSource("satellite", {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution:
            '<a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" target="_blank" rel="noreferrer">Esri, Vantor, Earthstar Geographics, GIS User Community</a>',
        });
        m.addLayer({ id: "satellite", type: "raster", source: "satellite" });
      }
      m.addSource("aoi", { type: "geojson", data: latest.current.geometry });
      m.addLayer({
        id: "aoi-fill",
        type: "fill",
        source: "aoi",
        paint: { "fill-color": "#eed367", "fill-opacity": 0.04 },
      });
      m.addLayer({
        id: "aoi-line",
        type: "line",
        source: "aoi",
        paint: { "line-color": "#ffe282", "line-width": 3 },
      });

      if (drawing) {
        const tool = new TerraDraw({
          adapter: new TerraDrawMapLibreGLAdapter({ map: m }),
          modes: [
            new TerraDrawPolygonMode(),
            new TerraDrawSelectMode({
              flags: {
                polygon: {
                  feature: {
                    draggable: true,
                    coordinates: {
                      midpoints: true,
                      draggable: true,
                      deletable: true,
                    },
                  },
                },
              },
            }),
          ],
        });
        draw.current = tool;
        tool.start();
        if (latest.current.geometry.features.length)
          tool.addFeatures(
            latest.current.geometry.features.map((f) => ({
              ...f,
              properties: { ...f.properties, mode: "polygon" },
            })),
          );
        tool.on("finish", () => {
          const features = tool
            .getSnapshot()
            .filter((f) => f.geometry.type === "Polygon");
          latest.current.onDraw?.({
            type: "FeatureCollection",
            features: features.slice(-1) as Geometry["features"],
          });
          tool.setMode("select");
          setDrawMode(false);
        });
        tool.on("change", (_ids, type) => {
          if (type !== "update" || tool.getMode() !== "select") return;
          latest.current.onDraw?.({
            type: "FeatureCollection",
            features: tool
              .getSnapshot()
              .filter((f) => f.geometry.type === "Polygon")
              .slice(-1) as Geometry["features"],
          });
        });
      }

      setLoaded(true);
      try {
        const r = await fetch("/terrain/manifest.json");
        if (!r.ok) throw Error("DEM manifest");
        const meta = await r.json();
        if (disposed) return;
        const [lon, lat] = center(latest.current.geometry);
        const z = 14,
          x = Math.floor(((lon + 180) / 360) * 2 ** z),
          y = Math.floor(
            ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) *
              2 ** z,
          );
        const useLocalTerrain =
          latest.current.geometry.features[0]?.geometry.coordinates[0].every(
            (p) =>
              p[0] >= meta.bounds[0] &&
              p[0] <= meta.bounds[2] &&
              p[1] >= meta.bounds[1] &&
              p[1] <= meta.bounds[3],
          );
        const probe = await fetch(
          useLocalTerrain
            ? `/terrain/${z}/${x}/${y}.png`
            : `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
        );
        if (!probe.ok) throw Error("DEM tile");
        const decoded = await createImageBitmap(await probe.blob());
        decoded.close();
        if (disposed) return;
        m.addSource("terrain", {
          type: "raster-dem",
          tiles: [
            useLocalTerrain
              ? `${location.origin}/terrain/{z}/{x}/{y}.png`
              : "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          minzoom: 10,
          maxzoom: 14,
          encoding: "terrarium",
          ...(useLocalTerrain ? { bounds: meta.bounds } : {}),
          attribution: "Mapzen terrain · USGS / NOAA",
        });
        setTerrainState("ready");
      } catch (error) {
        console.warn(
          "Terrain unavailable; retaining the 2D analysis view.",
          error,
        );
        if (!disposed) {
          setTerrainState("error");
          setTerrain(false);
          m.jumpTo({ pitch: 0 });
        }
      }
    });

    const resize = new ResizeObserver(() => m.resize());
    resize.observe(canvas.current);
    return () => {
      disposed = true;
      resize.disconnect();
      draw.current?.stop();
      draw.current = null;
      m.remove();
      map.current = null;
    };
  }, [attempt, drawing]);

  useEffect(() => {
    const m = map.current;
    if (!loaded || !m) return;
    (m.getSource("aoi") as maplibregl.GeoJSONSource)?.setData(geometry);
    const ring = geometry.features[0]?.geometry.coordinates[0];
    if (ring?.length) {
      const bounds = new maplibregl.LngLatBounds();
      ring.forEach((p) => bounds.extend(p as [number, number]));
      m.fitBounds(bounds, { padding: 48, maxZoom: 17.2, duration: 0 });
    }
  }, [geometry, loaded]);

  useEffect(() => {
    const m = map.current;
    if (!loaded || !m) return;
    if (m.getLayer("imagery")) m.removeLayer("imagery");
    if (m.getSource("imagery")) m.removeSource("imagery");
    if (imageExtent) {
      const e = imageExtent;
      m.addSource("imagery", {
        type: "image",
        url: "/imagery/my-thanh.png",
        coordinates: [
          [e.xmin, e.ymax],
          [e.xmax, e.ymax],
          [e.xmax, e.ymin],
          [e.xmin, e.ymin],
        ],
      });
      m.addLayer(
        {
          id: "imagery",
          type: "raster",
          source: "imagery",
          paint: { "raster-opacity": 1, "raster-saturation": -0.12 },
        },
        "aoi-fill",
      );
    }
  }, [loaded, imageExtent]);

  useEffect(() => {
    const m = map.current;
    if (!loaded || !m) return;
    if (m.getLayer("imagery"))
      m.setLayoutProperty("imagery", "visibility", image ? "visible" : "none");
    if (m.getLayer("satellite"))
      m.setLayoutProperty(
        "satellite",
        "visibility",
        image && !imageryFailed ? "visible" : "none",
      );
    for (const id of ["aoi-fill", "aoi-line"])
      if (m.getLayer(id))
        m.setLayoutProperty(id, "visibility", boundary ? "visible" : "none");
  }, [loaded, image, boundary, imageExtent, imageryFailed]);

  useEffect(() => {
    const m = map.current;
    if (!m || !loaded) return;
    m.getCanvas().setAttribute("aria-label", t("mapCanvas"));
    const attribution = m
      .getContainer()
      .querySelector(".maplibregl-ctrl-attrib-button");
    attribution?.setAttribute("aria-label", t("attribution"));
    attribution?.setAttribute("title", t("attribution"));
  }, [loaded, t]);

  useEffect(() => {
    map.current?.resize();
    const previous = document.activeElement as HTMLElement | null;
    if (expanded)
      host.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
      if (expanded && e.key === "Tab") {
        const elements = [
          ...host.current!.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],canvas[tabindex="0"],select,input',
          ),
        ].filter((el) => el.getClientRects().length);
        const first = elements[0],
          last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
      if (expanded) previous?.focus();
    };
  }, [expanded]);

  function set3D(value: boolean) {
    const m = map.current;
    if (!m || !loaded) return;
    if (value && terrainState !== "ready") return;
    m.setTerrain(value ? { source: "terrain", exaggeration: 1 } : null);
    m.easeTo({ pitch: value ? 45 : 0, duration: reduced() ? 0 : 600 });
    setTerrain(value);
  }

  useEffect(() => {
    const m = map.current;
    if (!loaded || !m) return;
    const markers = placements
      .filter(
        (p) =>
          p.areaId === areaId &&
          pointInside([p.longitude, p.latitude], geometry),
      )
      .map((p) => {
        const el = document.createElement("button");
        el.className = "sensor-marker";
        el.textContent = "●";
        el.setAttribute(
          "aria-label",
          `${t("deviceId")}: ${p.deviceId} (${p.context})`,
        );
        el.onclick = () => setDevice(p.deviceId);
        return new maplibregl.Marker({ element: el })
          .setLngLat([p.longitude, p.latitude])
          .addTo(m);
      });
    const requested = mapParams.get("device");
    const target = placements.find(
      (p) =>
        p.areaId === areaId &&
        p.deviceId === requested &&
        pointInside([p.longitude, p.latitude], geometry),
    );
    if (target) {
      m.flyTo({
        center: [target.longitude, target.latitude],
        zoom: 17,
        duration: reduced() ? 0 : 900,
      });
      setDevice(target.deviceId);
    }
    const onClick = () => setFieldInfo(true);
    m.on("click", "aoi-fill", onClick);
    return () => {
      markers.forEach((marker) => marker.remove());
      m.off("click", "aoi-fill", onClick);
    };
  }, [placements, areaId, loaded, t, mapParams, geometry]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m || !sensorNavigation) return;
    const ring = geometry.features[0]?.geometry.coordinates[0] || [];
    if (!ring.length) return;
    const xs = ring.map((p) => p[0]),
      ys = ring.map((p) => p[1]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs),
      minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const markers = ["A", "B"].flatMap((head, i) => {
      const point = [
        minX + (maxX - minX) * (i === 0 ? 0.28 : 0.72),
        minY + (maxY - minY) * 0.5,
      ];
      if (!pointInside(point, geometry)) return [];
      const el = document.createElement("button");
      el.className = "probe-marker";
      el.textContent = head;
      el.setAttribute(
        "aria-label",
        head === "A" ? t("probeSoil") : t("probeAir"),
      );
      el.setAttribute(
        "aria-pressed",
        String(sensorNavigation.selected === head),
      );
      el.onclick = () => sensorNav.current?.onSelect(head);
      return [
        new maplibregl.Marker({ element: el })
          .setLngLat(point as [number, number])
          .addTo(m),
      ];
    });
    return () => markers.forEach((marker) => marker.remove());
  }, [loaded, geometry, sensorNavigation?.selected, t]);
  useEffect(() => {
    const m = map.current;
    if (!loaded || !m || drawing) return;
    const data: Geometry = {
      type: "FeatureCollection",
      features: areas
        .filter((a) => a.id !== areaId)
        .flatMap((a) =>
          a.geometry.features.map((f) => ({
            ...f,
            properties: { ...f.properties, areaId: a.id, name: a.name },
          })),
        ),
    };
    if (m.getSource("other-fields"))
      (m.getSource("other-fields") as maplibregl.GeoJSONSource).setData(data);
    else {
      m.addSource("other-fields", { type: "geojson", data });
      m.addLayer(
        {
          id: "other-fields-fill",
          type: "fill",
          source: "other-fields",
          paint: { "fill-color": "#94b7dc", "fill-opacity": 0.35 },
        },
        "aoi-fill",
      );
      m.addLayer(
        {
          id: "other-fields-line",
          type: "line",
          source: "other-fields",
          paint: { "line-color": "#376aa5", "line-width": 2 },
        },
        "aoi-fill",
      );
    }
    const select = (e: maplibregl.MapLayerMouseEvent) => {
      const id = e.features?.[0]?.properties?.areaId;
      if (typeof id === "string") navigate(`/w/${id}/farmer`);
    };
    m.on("click", "other-fields-fill", select);
    return () => {
      m.off("click", "other-fields-fill", select);
    };
  }, [areas, areaId, loaded, drawing, navigate]);
  const rings = geometry.features[0]?.geometry.coordinates[0] || [];
  const bounds = rings.length
    ? [
        Math.min(...rings.map((p) => p[0])),
        Math.min(...rings.map((p) => p[1])),
        Math.max(...rings.map((p) => p[0])),
        Math.max(...rings.map((p) => p[1])),
      ]
    : [0, 0, 1, 1];
  const points = rings
    .map(
      (p) =>
        `${20 + ((p[0] - bounds[0]) / (bounds[2] - bounds[0] || 1)) * 260},${230 - ((p[1] - bounds[1]) / (bounds[3] - bounds[1] || 1)) * 210}`,
    )
    .join(" ");

  return (
    <section
      ref={host}
      className={`spatial-map ${expanded ? "expanded" : ""}`}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded ? true : undefined}
      aria-label={t("earth")}
      data-terrain-state={terrainState}
    >
      <div ref={canvas} className="map-canvas" />
      {imageryFailed && (
        <div className="imagery-warning" role="status">
          {t("satelliteFailed")}{" "}
          <button
            onClick={() => {
              setImageryFailed(false);
              setAttempt((n) => n + 1);
            }}
          >
            {t("retry")}
          </button>
        </div>
      )}
      {areaId && (
        <label className="map-field-select">
          <span className="sr-only">{t("changeArea")}</span>
          <select
            aria-label={t("changeArea")}
            value={areaId}
            onChange={(e) => navigate(`/w/${e.target.value}/farmer`)}
          >
            <option value="my-thanh">MT-BLOCK-01</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {areaId && (
        <button
          className="field-inspect"
          onClick={() => setFieldInfo(!fieldInfo)}
        >
          {t("fieldSelected")}
        </button>
      )}
      {fieldInfo && (
        <div className="map-inspector">
          <button onClick={() => setFieldInfo(false)} aria-label={t("close")}>
            ×
          </button>
          <h3>
            {areaId === "my-thanh"
              ? "MT-BLOCK-01"
              : areas.find((a) => a.id === areaId)?.name || areaId}
          </h3>
          <p>{t("digitized")}</p>
          <p>
            {center(geometry)
              .map((x) => x.toFixed(6))
              .join(", ")}
          </p>
          <Link to="/">{t("changeArea")} →</Link>
        </div>
      )}
      {device && (
        <div className="map-inspector">
          <button onClick={() => setDevice("")} aria-label={t("close")}>
            ×
          </button>
          <h3>{device}</h3>
          <p>
            {placements.find((p) => p.deviceId === device)?.context} ·{" "}
            {events.filter((e) => e.device_id === device).at(-1)?.data_mode ||
              t("unknown")}
          </p>
          <p>{t("pointLimit")}</p>
          <p>{t("simulatedPlacement")}</p>
          <Link to={`/hardware?device=${encodeURIComponent(device)}`}>
            {t("hardware")} →
          </Link>
        </div>
      )}
      {failed && (
        <div className="map-fallback" role="status">
          <Mountain size={30} />
          <h2>{t("mapFailed")}</h2>
          <p>{t("mapFallback")}</p>
          <svg viewBox="0 0 300 260" role="img" aria-label={t("boundary")}>
            <polygon
              points={points}
              fill="#e5d7a9"
              stroke="#806824"
              strokeWidth="2"
            />
          </svg>
          <code>
            {center(geometry)
              .map((x) => x.toFixed(6))
              .join(", ")}
          </code>
          <button onClick={() => setAttempt((x) => x + 1)}>{t("retry")}</button>
        </div>
      )}

      <div className="map-top">
        {layers && (
          <div className="segmented map-segment">
            <button aria-pressed={!terrain} onClick={() => set3D(false)}>
              {t("flat")}
            </button>
            <button
              aria-pressed={terrain}
              disabled={terrainState !== "ready"}
              onClick={() => set3D(true)}
            >
              <Mountain size={15} />
              {t("terrain")}
            </button>
          </div>
        )}
        <button
          className="map-layer"
          onClick={() => setLayers(!layers)}
          aria-expanded={layers}
        >
          <Layers size={16} />
          {t("layers")}
        </button>
      </div>

      {layers && (
        <div className="layer-popover">
          <label>
            <input
              type="checkbox"
              checked={image}
              onChange={(e) => setImage(e.target.checked)}
            />
            {t(imageExtent ? "imagery" : "naturalSatellite")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={boundary}
              onChange={(e) => setBoundary(e.target.checked)}
            />
            {t("boundary")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={lowDetail}
              onChange={(e) => {
                setLowDetail(e.target.checked);
                map.current?.setPixelRatio(
                  e.target.checked ? 0.65 : Math.min(devicePixelRatio, 1),
                );
              }}
            />
            {t("lowDetail")}
          </label>
          <p>{t("terrainMetadata")}</p>
          {imageExtent && <p>{t("photoscope")}</p>}
        </div>
      )}

      <div className="map-tools">
        <button aria-label={t("zoomIn")} onClick={() => map.current?.zoomIn()}>
          <Plus size={18} />
        </button>
        <button
          aria-label={t("zoomOut")}
          onClick={() => map.current?.zoomOut()}
        >
          <Minus size={18} />
        </button>
        <button
          aria-label={t("resetCamera")}
          onClick={() =>
            map.current?.flyTo({
              center: center(geometry),
              zoom: 17.2,
              bearing: 160,
              pitch: terrain ? 45 : 0,
              duration: reduced() ? 0 : 900,
            })
          }
        >
          <RotateCcw size={17} />
        </button>
        <button
          aria-label={t(expanded ? "exitFullscreen" : "fullscreen")}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <Minimize size={18} /> : <Expand size={18} />}
        </button>
      </div>

      {drawing && (
        <div className="drawing-tools">
          <button
            disabled={!loaded}
            aria-pressed={drawMode}
            onClick={() => {
              setRestoreTerrain(terrain);
              set3D(false);
              draw.current?.setMode("polygon");
              setDrawMode(true);
            }}
          >
            <PenLine size={16} />
            {t("draw")}
          </button>
          <button
            onClick={() => {
              draw.current?.setMode("select");
              setDrawMode(false);
            }}
          >
            <MousePointer2 size={16} />
            {t("edit")}
          </button>
          <button
            onClick={() => {
              draw.current?.clear();
              latest.current.onDraw?.({
                type: "FeatureCollection",
                features: [],
              });
            }}
          >
            <Trash2 size={16} />
            {t("clear")}
          </button>
          {restoreTerrain && !drawMode && (
            <button
              onClick={() => {
                set3D(true);
                setRestoreTerrain(false);
              }}
            >
              <Mountain size={16} />
              {t("restoreTerrain")}
            </button>
          )}
        </div>
      )}

      <div className="map-caption">
        <span className="legend-line" />
        {t("boundary")}
        <span className="terrain-status" role="status">
          {terrainState === "loading"
            ? t("terrainLoading")
            : terrainState === "error"
              ? t("terrainFailed")
              : t("terrainLimit")}
        </span>
      </div>
    </section>
  );
}
