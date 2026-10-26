# 11 — Interplanetary Survival Guide: Martian Map

**Difficulty:** Intermediate  
**Subjects:** Human Exploration · Mars · Planets & Moons · Software · Space Exploration  
**NeuraX preliminary score:** **8.4/10 — Tier A**  
**Status:** Summary available; full 2026 brief/resources expected 2026-10-28.

## Confirmed challenge intent

NASA has mapped and studied Mars through many robotic missions and many different data products. The challenge asks teams to create a **layered, integrated view of a Martian location or route** that combines information from multiple NASA science missions and could help a future human explorer plan and perform a successful Marswalk while conducting science.

The published summary explicitly mentions route/destination details, current-condition updates, safety, and science needs.

Sources:
- https://www.spaceappschallenge.org/2026/challenges/
- https://nasaspaceapps.ae/challenges

## Why this fits NeuraX

This is a strong **geospatial product-integration challenge**. The technical difficulty is not necessarily inventing a new model; it is turning heterogeneous mission datasets into one coherent decision interface.

NeuraX can demonstrate:

- geospatial raster/vector integration;
- terrain analysis;
- route scoring;
- data fusion;
- user-centered software;
- optional AI explanation/planning.

The use case is easy for judges to understand: **“Can an astronaut safely get from A to B and still accomplish science objectives?”**

## NeuraX concept: “MarsWalk Navigator”

A layered map focused on one realistic local Marswalk scenario.

### User flow

`choose start + destination/science target → inspect terrain/environment layers → generate/compare route candidates → show risk/science trade-offs → export mission brief`

### Potential map layers

Depending on official resources:

- elevation/terrain;
- slope;
- high-resolution imagery;
- rock/geology/mineral context;
- thermal/environmental context;
- hazard areas;
- science-interest sites;
- communication/line-of-sight proxy if appropriate;
- rover/mission landmarks.

## Candidate NASA data families — verify on 2026-10-28

Potential Mars resources include:

- **MOLA** topography/elevation;
- **CTX** context imagery;
- **HiRISE** high-resolution imagery;
- **THEMIS** thermal/imaging products;
- **CRISM** mineralogical/spectral products;
- rover/lander observations and meteorological/context data;
- NASA Planetary Data System resources.

The official full brief should determine which missions/products are expected and whether sample route areas are provided.

## Route-planning approach

A hackathon solution does not need a perfect autonomous-navigation algorithm. A transparent cost surface is sufficient if well justified.

### Example route-cost components

- slope/terrain difficulty;
- distance;
- hazard penalty;
- uncertainty/data-quality penalty;
- science-value reward;
- optional communication/visibility factor.

A combined cost could be:

`cost = w1*distance + w2*slopeRisk + w3*hazard + w4*uncertainty - w5*scienceValue`

Then use Dijkstra/A* over a raster/grid or graph.

The key is allowing users to adjust weights: a science-heavy EVA and an emergency return route should not optimize the same objective.

## Technical decomposition

### Data preprocessing
- choose local ROI;
- harmonize CRS/grid/resolution;
- derive slope from DEM;
- convert science/hazard layers into normalized scores;
- cache web-ready tiles.

### Route engine
- start/end selection;
- multi-layer cost calculation;
- candidate route generation;
- route statistics and explanation.

### Backend
- layer metadata;
- route request;
- route profile/time/distance/risk output;
- cached scenario support.

### Frontend
- layered Mars map;
- opacity toggles;
- start/end placement;
- route comparison;
- elevation/slope profile;
- science/hazard stops;
- astronaut “mission brief.”

## AI/ML opportunity

Optional but useful:

- natural-language mission goal → route preference weights;
- ranking science stops;
- summarizing route risks from computed metrics;
- computer vision/terrain classification if official labels/resources make it realistic.

Avoid putting an LLM in charge of path geometry or safety-critical calculations.

## 48-hour MVP

1. Pick **one local Mars region** with good data coverage.
2. Load 3–4 layers only: DEM/slope, imagery, one hazard proxy, one science-value layer.
3. Create a grid cost surface.
4. Generate 2 route modes: safest vs science-rich/shortest.
5. Build map + route profile.
6. Add a transparent explanation for why route choices differ.
7. Prepare one scripted Marswalk scenario.

## Evaluation

- route should avoid synthetic/known high-cost zones;
- unit tests for slope/cost calculations;
- compare shortest path versus risk-aware path;
- sensitivity to weight changes;
- inspect data alignment between layers;
- make missing/low-resolution zones visible rather than silently interpolating everything.

## Team fit

- **Hưng:** multi-objective scoring, route evaluation, optional AI layer, research framing.
- **Việt:** data integration/processing and analytical visualization.
- **Hiếu:** interactive mapping, route service and UI.
- **Tiểu An:** astronaut/user scenario, mission brief, usability and pitch.
- **Conditional GIS specialist:** strong boost for raster alignment, terrain analysis and map quality.

## Risks

- Combining datasets with very different resolution/projection/coverage.
- Using “current conditions” when no suitably current localized data exists.
- Spending too much time on a 3D globe.
- Presenting a route as operationally safe when it is only a prototype heuristic.
- Pulling too many mission layers into a cluttered map.

## Scorecard

| Dimension | Score / 10 | Comment |
|---|---:|---|
| Team fit | 8.0 | Strong software/geospatial fit. |
| AI/data leverage | 7.5 | Good optimization/data-fusion role; ML not mandatory. |
| GIS/EO leverage | 9.0 | Core. |
| 48h feasibility | 8.0 | Good with one local ROI and few layers. |
| Demo/story impact | 9.5 | Route planning on Mars is highly intuitive and visual. |
| NASA-data centrality | 10.0 | Multiple NASA mission datasets are explicitly required. |
| Differentiation ceiling | 8.5 | Strong multi-objective route UX can differentiate. |

## Recommendation

**Top-6 candidate and one of the safest space-exploration choices.** It is less statistically/research-heavy than MODIS/VIIRS or Trend Detective, but it can yield a polished, easy-to-judge product. Its score could rise if NASA's full resource package supplies well-aligned layers or a recommended ROI.
