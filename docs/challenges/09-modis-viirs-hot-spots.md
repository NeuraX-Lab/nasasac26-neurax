# 09 — Harmonization of MODIS and VIIRS Hot Spots

**Difficulty:** Advanced · Intermediate  
**Subjects:** Earth Science · Software  
**NeuraX preliminary score:** **9.3/10 — Tier S (current #1)**  
**Status:** Summary available; full 2026 brief/resources expected 2026-10-28.

## Confirmed challenge intent

Satellite sensors have recorded active-fire hotspots for more than two decades, but the historical record is split across sensors whose detections cannot simply be compared one-to-one. NASA asks teams to create a **web application that harmonizes MODIS and VIIRS hotspot records into a burning-activity calendar**, so emergency responders, scientists, fire managers, and land managers can examine historical patterns, unusual conditions, and critical periods for a selected area of interest.

Sources:
- https://www.spaceappschallenge.org/2026/challenges/
- https://nasaspaceapps.ae/challenges

## Why this is NeuraX's strongest preliminary fit

This challenge has unusually good balance:

- NASA data is unquestionably central.
- The scientific problem is concrete: **cross-sensor harmonization**, not vague “use AI for wildfire.”
- It uses geospatial processing, time-series/statistics, software, and visualization.
- The output has identifiable users and decisions.
- A useful MVP can be narrowed to one region while retaining a path to global scale.
- The demo can be immediately understood: select an area → see a consistent fire calendar/history → detect unusual activity.

Unlike some advanced challenges, the core value does not depend on a risky black-box ML model.

## NeuraX concept: “FireChronicle”

A harmonized historical fire-activity explorer centered on an **Area of Interest (AOI)**.

### Core user flow

`draw/select AOI → choose historical period → harmonize MODIS + VIIRS detections → view seasonal burning calendar → compare current/recent period with historical baseline → inspect anomalies/critical windows`

### Main views

1. **Map:** hotspot density/events within AOI.
2. **Burning calendar:** day/week/month intensity across years.
3. **Climatology:** typical seasonal pattern.
4. **Anomaly view:** periods unusually active relative to history.
5. **Sensor provenance:** which observations came from MODIS, VIIRS, or harmonized representation.
6. **Data-quality explanation:** known comparability limits and coverage.

## The real technical problem: harmonization

MODIS and VIIRS differ in sensor characteristics, spatial resolution, detection behavior, overpass timing, and record periods. A credible solution must avoid concatenating two CSVs and calling the result harmonized.

The full NASA brief should reveal the intended harmonization expectation. Candidate issues to handle include:

- different spatial footprints/resolution;
- differing detection confidence/attributes;
- duplicate or near-duplicate detections;
- changing observation opportunity through time;
- sensor overlap period that can be used for calibration/comparison;
- temporal aggregation choice;
- AOI area normalization;
- missing/unequal coverage.

## Candidate data — strongly suggested by the challenge title, but verify exact resources

The official challenge clearly centers on:

- **MODIS active-fire/hotspot observations**;
- **VIIRS active-fire/hotspot observations**.

NASA FIRMS (Fire Information for Resource Management System) is a likely access ecosystem, but the exact products/files/APIs and required attributes must be taken from the 2026-10-28 official resource list rather than assumed.

## Candidate harmonization strategy

### Phase 1 — common schema

Normalize both sensor records into fields such as:

- timestamp/date;
- latitude/longitude;
- sensor/platform;
- confidence/quality;
- thermal/fire-related measurements supplied in both or comparable form;
- day/night;
- AOI membership.

### Phase 2 — common spatial representation

For historical comparison, aggregate to a grid or AOI statistic that does not pretend the sensors have identical native resolution.

Examples:

- equal-area grid counts/density;
- detections per AOI area;
- cluster/event representation;
- coarse spatial bins appropriate to both sensors.

### Phase 3 — overlap-period calibration

Where both sensor families overlap in time, compare their aggregate behavior and estimate a mapping/normalization if the official brief supports this.

Possible approaches:

- empirical ratio by region/season;
- regression/calibration model;
- quantile mapping;
- stratification by land-cover or fire regime;
- uncertainty interval rather than a single corrected count.

Avoid overengineering before seeing the official expected method.

### Phase 4 — burning calendar

Aggregate harmonized activity into an interpretable temporal representation:

- day-of-year × year heatmap;
- monthly/weekly climatology;
- median/percentile baseline;
- anomaly score for selected periods;
- “critical period” indicator.

## AI/ML opportunity

AI should be supportive, not decorative.

Useful options:

- anomaly detection against historical fire climatology;
- clustering AOIs by fire-season behavior;
- event segmentation from dense hotspot points;
- forecast-like risk context only if allowed and supported by data (do not claim fire prediction from hotspot history alone);
- natural-language summary generated from computed statistics.

A transparent statistical harmonization baseline will likely be stronger than deep learning for the core challenge.

## Technical decomposition

### Data pipeline
- retrieve MODIS/VIIRS records;
- normalize schema;
- filter AOI/time;
- spatial aggregation;
- harmonization/calibration;
- precompute calendar/anomaly statistics.

### Backend
- AOI geometry input;
- historical query;
- harmonized time-series;
- calendar matrices;
- anomaly/summary endpoint;
- caching.

### Frontend
- AOI draw/search;
- hotspot map;
- year × day/week calendar heatmap;
- seasonal profile chart;
- sensor toggle/provenance;
- anomaly explanation;
- downloadable summary/data slice if feasible.

## 48-hour MVP

1. Pick **one fire-prone region** with a long record.
2. Ingest manageable MODIS + VIIRS hotspot subsets.
3. Normalize them into one common schema.
4. Use overlap years to quantify cross-sensor differences.
5. Implement one defensible harmonization method.
6. Generate a multi-year burning calendar and seasonal baseline.
7. Build an AOI dashboard with map + calendar + anomaly comparison.
8. Prepare one case study where the harmonized view reveals something the raw split records obscure.

## Evaluation

This challenge gives NeuraX unusually good opportunities for measurable validation:

- compare sensor behavior during overlap period before/after harmonization;
- measure residual discrepancy between aggregate records;
- evaluate stability across regions/seasons;
- sensitivity to grid size and temporal aggregation;
- compare simple concatenation baseline vs harmonized result;
- sanity-check known large fire seasons/events;
- show uncertainty rather than hiding disagreement.

A powerful demo line would be: **“Here is the discontinuity if we naively switch sensors; here is how our method reduces it.”**

## Team fit

- **Hưng:** harmonization/statistics, experimental design, anomaly method, validation and research framing.
- **Việt:** data engineering/analysis, modeling and visual analytics.
- **Hiếu:** AOI web app, API, mapping and deployment.
- **Tiểu An:** emergency/land-manager user workflow, product prioritization, pitch and usability.
- **Conditional GIS/environment specialist:** large boost for AOI analysis, fire/environment interpretation and GIS validation.

## Why it may be better than Dancing with the SARs for 48 hours

Both are excellent Earth-observation challenges. MODIS/VIIRS is preliminarily safer because active-fire point products are often conceptually simpler to visualize/process than SAR imagery, and the challenge's desired output—historical burning calendar—is unusually concrete.

That advantage could disappear if the full brief imposes a sophisticated harmonization methodology or difficult data access, so the decision stays provisional until 2026-10-28.

## Risks

- Treating hotspot count as burned area or fire severity without justification.
- Sensor differences not fully addressed.
- Duplicate detections/observation opportunities biasing counts.
- AOI size and land-cover differences making comparisons misleading.
- Calling an anomaly an “early warning” without a defensible operational meaning.
- Overloading the interface with map points rather than delivering the burning-calendar insight.

## Scorecard

| Dimension | Score / 10 | Comment |
|---|---:|---|
| Team fit | 9.5 | Excellent blend of data, software, geospatial and research. |
| AI/data leverage | 9.0 | Strong statistics/ML opportunity without AI dependence. |
| GIS/EO leverage | 10.0 | Central. |
| 48h feasibility | 8.5 | Very good if data access is straightforward. |
| Demo/story impact | 9.0 | Calendar + map + anomaly story is strong and clear. |
| NASA-data centrality | 10.0 | MODIS/VIIRS are the challenge itself. |
| Differentiation ceiling | 9.0 | Scientific harmonization + polished decision UX can stand out. |

## Recommendation

**Current #1 recommendation for NeuraX.** It best balances scientific depth, AI/data opportunity, GIS, product clarity, measurable evaluation, NASA-data centrality, and 48-hour feasibility. On 2026-10-28, the first things to inspect are the exact MODIS/VIIRS products, required definition of “harmonization,” provided sample code/resources, and expected burning-calendar semantics.
