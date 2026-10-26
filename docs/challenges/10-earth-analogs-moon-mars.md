# 10 — Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars

**Difficulty:** Advanced · Intermediate · Beginner/Youth  
**Subjects:** Earth Science · Planets & Moons · Software · Space Exploration  
**NeuraX preliminary score:** **8.9/10 — Tier A+**  
**Status:** Summary available; full 2026 brief/resources expected 2026-10-28.

## Confirmed challenge intent

Future landing sites and permanent base locations depend on characteristics such as topography, geology, environment, and available resources. Earth analog sites—examples in the published summary include the Atacama Desert, Haughton Crater, and Death Valley—allow mission teams to test equipment and methods before flight, but terrestrial analogs are not fully characterized.

NASA asks teams to use **open Earth, Moon, and Mars data from NASA and other space agencies** to identify and characterize new terrestrial analog sites across deserts, polar areas, volcanic/arid terrain, caves, and other environments sharing lunar or Martian characteristics.

Sources:
- https://www.spaceappschallenge.org/2026/challenges/
- https://nasaspaceapps.ae/challenges

## Why this is a strong NeuraX fit

This is essentially a **cross-planet geospatial similarity / site-discovery problem**. It combines:

- multimodal spatial data;
- feature engineering;
- similarity/ranking;
- explainability;
- map visualization;
- planetary exploration narrative;
- a natural research extension after the hackathon.

It gives AI/ML a legitimate role without requiring it: the team can start with an interpretable feature-based similarity score, then add representation learning or clustering only if data supports it.

## NeuraX concept: “TerraTwin”

A user selects a target lunar/Martian environment or specifies target characteristics. The system searches a catalog/grid of Earth candidate locations and returns **ranked analog sites with evidence explaining why each site is similar**.

### Example workflow

`target planetary site/profile → target feature vector → Earth candidate search → ranked analogs → side-by-side evidence → field-test suitability notes`

### Explainable output

For every candidate Earth analog, show similarity by dimension rather than only one score:

- elevation / relief;
- slope / roughness;
- temperature regime;
- aridity / precipitation;
- surface material/geology proxy;
- vegetation scarcity;
- radiation/UV/environment proxy if appropriate;
- accessibility/logistics (optional and clearly separate from physical similarity).

The product should let users reweight criteria because a mobility test, drilling test, habitat test, or thermal test may require different analog characteristics.

## Candidate data families — verify 2026-10-28

### Earth candidates
Potential NASA/open data families may include:

- digital elevation / terrain products (e.g., SRTM- or ASTER-derived elevation where appropriate);
- land-surface temperature;
- vegetation indices / land cover;
- precipitation/aridity proxies;
- surface/geology products from other approved open sources;
- polar/cryosphere context where needed.

### Moon candidates
Possible NASA lunar sources include:

- LRO imagery;
- LOLA topography/elevation;
- other surface-composition/illumination products listed by the official challenge.

### Mars candidates
Possible sources include:

- MOLA topography;
- THEMIS thermal/context products;
- CTX / HiRISE imagery;
- mineralogical/geological products such as those available through Mars mission/PDS resources.

These are candidate families only. The full challenge may define target sites and datasets explicitly.

## Scientific design choice: feature similarity before image similarity

A tempting idea is to use computer vision embeddings to find Earth images that “look like Mars.” That can produce aesthetically similar but scientifically meaningless matches because sensors, resolutions, spectral bands and imaging geometry differ.

Recommended progression:

### Baseline — interpretable physical feature vector

For target and candidate locations, compute standardized features. Example:

`[slope, elevation variance, roughness, temperature statistics, aridity, vegetation, albedo/surface proxy, ...]`

Then use:

- weighted normalized distance;
- cosine similarity after meaningful scaling;
- Mahalanobis distance if correlations matter;
- multi-criteria ranking.

### Advanced

- unsupervised clustering of Earth environmental regimes;
- metric learning if valid labeled analog pairs exist;
- multimodal embeddings combining raster + tabular features;
- uncertainty-aware ranking;
- diversity constraint to return geographically distinct candidate sites.

## Technical decomposition

### Planetary target processing
- define target ROI;
- extract target environmental/terrain characteristics;
- normalize feature definitions across datasets.

### Earth candidate database
- global or regional tiling;
- precompute features per tile/site;
- filter obvious non-candidates;
- spatial index.

### Similarity engine
- user weights;
- normalized feature comparison;
- rank candidates;
- contribution/explanation per feature.

### Frontend
- Moon/Mars target map;
- Earth results map;
- linked side-by-side terrain imagery;
- radar/spider or bar comparison of features;
- ranking controls;
- provenance for every layer.

## 48-hour MVP

1. Choose **one target environment**, preferably one Moon or Mars ROI.
2. Choose 4–6 defensible features available for both the target interpretation and Earth candidates.
3. Precompute features for a limited Earth search region or curated candidate set.
4. Implement weighted similarity ranking.
5. Build side-by-side map/feature comparison.
6. Validate that known analog sites score reasonably as a sanity check.
7. Surface 2–3 plausible new candidates and explain why they appear.

## Evaluation

This challenge offers an unusually strong evaluation story if designed carefully:

- **known analog retrieval:** do established analog sites rank highly under relevant profiles?
- ablation: which features drive the ranking?
- sensitivity to user weights;
- expert/manual geographic plausibility review;
- compare interpretable physical-feature similarity vs naive visual/image similarity;
- uncertainty/data-coverage reporting.

If known analog sites are used for validation, avoid tuning the model only to reproduce those examples.

## Team fit

- **Hưng:** similarity methodology, ML/representation experiments, evaluation and research framing.
- **Việt:** spatial feature pipeline, modeling, visualization/data exploration.
- **Hiếu:** interactive dual-planet/Earth map and API.
- **Tiểu An:** use-case framing (what kind of testing needs what kind of analog), user controls and pitch.
- **Conditional GIS/environment specialist:** very large boost for GIS processing, environmental feature selection and interpretation.

## Risks

- Comparing incomparable variables across planets.
- “Looks like Mars” becoming the scientific criterion.
- Global raster preprocessing too large for the weekend.
- Geology/resource similarity being much harder to standardize than terrain/climate variables.
- False precision: a single similarity percentage can hide missing/low-quality dimensions.
- Scope explosion across Moon + Mars + all Earth.

## Scorecard

| Dimension | Score / 10 | Comment |
|---|---:|---|
| Team fit | 9.0 | Strong AI/data/GIS/software blend. |
| AI/data leverage | 8.5 | Natural similarity/ranking/representation problem. |
| GIS/EO leverage | 10.0 | Fundamental to the challenge. |
| 48h feasibility | 8.0 | Strong if limited to one target and precomputed Earth candidates. |
| Demo/story impact | 9.0 | “Find Earth's twin for this Mars/Moon site” is memorable. |
| NASA-data centrality | 9.0 | Planetary and Earth data directly drive ranking. |
| Differentiation ceiling | 9.0 | Strong research and explainability potential. |

## Recommendation

**Top-3 candidate.** This is particularly attractive if NeuraX wants a project that combines AI, GIS and space exploration more visibly than the fire challenges. The key 2026-10-28 question is whether NASA supplies a clean set of target-site variables/datasets that makes cross-planet comparison scientifically defensible within 48 hours.
