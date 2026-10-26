# 07 — Field Shift: Adapting Farms with NASA Data

**Difficulty:** Advanced · Intermediate  
**Subjects:** Arts & Multimedia · Earth Science · Software  
**NeuraX preliminary score:** **8.6/10 — Tier A+**  
**Status:** Summary available; full 2026 brief/resources expected 2026-10-28.

## Confirmed challenge intent

Farmers face changing temperature and rainfall, water shortages, extreme weather, and declining soil health. NASA asks for a **decision-support tool** that combines NASA Earth observations with local soil information, crop characteristics, and farmer priorities to help explore **crop-rotation strategies** that can strengthen soil health and climate resilience.

Sources:
- https://www.spaceappschallenge.org/2026/challenges/
- https://nasaspaceapps.ae/challenges

## Why this fits NeuraX

This is not just an agriculture dashboard. It is a multi-criteria decision problem combining:

- Earth-observation signals;
- local/context data;
- crop knowledge;
- farmer goals;
- temporal planning;
- uncertainty and trade-offs.

That creates a natural role for data science, optimization/recommendation, geospatial analysis, software, and explainable decision support.

It also has a strong real-world impact narrative, especially for climate-vulnerable agricultural regions.

## NeuraX concept: “RotationShift”

A farmer or advisor selects a field/region, current crop history, available crop options, and priorities such as:

- conserve water;
- improve soil health;
- reduce climate risk;
- maintain yield/income proxy;
- diversify rotation;
- avoid high-input sequences.

The tool produces several candidate rotation plans rather than one opaque “best crop,” then explains the trade-offs.

Example output:

| Rotation | Water fit | Heat/rainfall fit | Soil-health fit | Risk | Explanation |
|---|---:|---:|---:|---:|---|
| A → B → C | High | Medium | High | Low | ... |
| A → D → C | Medium | High | Medium | Medium | ... |

## Candidate NASA/environment data — verify 2026-10-28

Depending on official resources, plausible signals include:

- precipitation history/anomalies (e.g., GPM-family products);
- soil moisture (e.g., SMAP-family products);
- temperature/land-surface indicators;
- vegetation/phenology indicators;
- evapotranspiration or drought-related products if supplied;
- extreme-event/climate context;
- local soil datasets and crop characteristics from non-NASA sources specified by the challenge.

These are **candidate inputs only** until NASA releases the full resource list.

## Decision-model approach

A good hackathon system should be interpretable. Possible pipeline:

1. Convert EO data into field/region-level features.
2. Characterize recent climate and water stress.
3. Encode crop/rotation constraints.
4. Score candidate sequences against farmer priorities.
5. Return multiple Pareto-like alternatives with explanations.

### Useful methods

- weighted multi-criteria decision analysis;
- rule-constrained ranking;
- simple optimization over rotation sequences;
- scenario analysis under dry/normal/wet conditions;
- clustering fields/regions by environmental profile;
- uncertainty-aware score ranges.

A black-box recommender trained without credible labels would be weaker than a transparent model grounded in agronomic constraints.

## Technical decomposition

### Geospatial/EO pipeline
- field/AOI selection;
- retrieve historical EO variables;
- temporal aggregation/anomalies;
- regional features.

### Crop/soil knowledge layer
- crop water/climate characteristics;
- soil compatibility;
- rotation constraints/benefits;
- local soil properties.

### Decision engine
- candidate sequence generation;
- hard constraints;
- preference weights;
- score + explanation;
- scenario comparison.

### Frontend
- map/field selection;
- farmer priority controls;
- environmental history summary;
- rotation option cards;
- trade-off visualization;
- “why this plan?” panel.

## 48-hour MVP

Do not try to support every crop globally.

1. Pick **one region and a small crop set** (e.g., 4–6 crops) supported by available data.
2. Build EO features for climate/water context.
3. Define a small, cited crop/rotation knowledge table.
4. Generate 2–3 season rotation sequences.
5. Score sequences under 3–4 user priorities.
6. Build a map + option-comparison dashboard.
7. Demo how changing farmer priorities changes the recommended trade-off.

## Evaluation

- Test scoring logic on handcrafted scenarios where expected preferences are known.
- Sensitivity analysis to priority weights.
- Verify EO-derived features against source data.
- Have a domain reviewer inspect crop constraints if possible.
- Explain clearly what is heuristic versus scientifically validated.

## Team fit

- **Hưng/Việt:** EO feature engineering, optimization/ranking, evaluation, uncertainty.
- **Hiếu:** decision-support application, API and map integration.
- **Tiểu An:** farmer/user workflow, prioritization UX, product framing and stakeholder story.
- **Conditional GIS/environment specialist:** exceptionally valuable; could validate spatial processing, climate interpretation and environmental context.

## Risks

- Agronomy knowledge gap: crop rotation is not reducible to satellite data alone.
- Local soil/crop datasets may be inconsistent across regions.
- Overclaiming yield/soil-health outcomes.
- Too many crops/regions/variables.
- Recommendations that are mathematically neat but impractical for real farmers.

## Scorecard

| Dimension | Score / 10 | Comment |
|---|---:|---|
| Team fit | 8.5 | Strong tech/product fit; agronomy expertise is the main gap. |
| AI/data leverage | 8.5 | Good ranking/optimization and EO feature opportunity. |
| GIS/EO leverage | 9.0 | Core data source and map workflow. |
| 48h feasibility | 8.0 | Strong if limited to one region/crop set. |
| Demo/story impact | 9.0 | Clear decisions and social impact. |
| NASA-data centrality | 9.0 | Earth observations should directly inform recommendations. |
| Differentiation ceiling | 8.5 | Explainable multi-objective planning can stand out. |

## Recommendation

**Top-5 candidate; potentially top-3 with a GIS/environment/agriculture-oriented teammate or mentor.** Reassess after the full brief reveals the supplied soil/crop datasets and expected geographic scope. The official resource package will determine whether the domain burden is manageable in a weekend.
