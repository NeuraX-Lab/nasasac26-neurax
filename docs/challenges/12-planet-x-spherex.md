# 12 — Planet X and SPHEREx

**Difficulty:** Advanced  
**Subjects:** Astrophysics · Planets & Moons · Software  
**NeuraX preliminary score:** **7.8/10 — Tier B+**  
**Status:** Summary available; full 2026 brief/resources expected 2026-10-28.

## Confirmed challenge intent

NASA's SPHEREx mission has been mapping the whole sky every six months in **102 near-infrared bands**, producing imagery/data for more than a billion objects. Objects such as comets, asteroids, stars, brown dwarfs and potentially new planets can reveal themselves through change or apparent motion between observations. NASA asks for a **public-facing web tool** that displays SPHEREx sky imagery and makes temporal changes easy for anyone to inspect.

Sources:
- https://www.spaceappschallenge.org/2026/challenges/
- https://nasaspaceapps.ae/challenges

## Important interpretation

The title says “Planet X,” but the published summary does **not** require a team to discover a new planet. The confirmed deliverable is a public-facing temporal exploration tool for SPHEREx imagery. Any automated candidate-detection feature should therefore be framed as helping users inspect change, not as claiming discovery without scientific validation.

## Why it fits NeuraX

This challenge offers:

- time-domain image/data analysis;
- large-scale data engineering;
- computer vision/change detection;
- astronomy visualization;
- public-science/citizen-science UX.

It strongly matches AI/data skills, but astronomy-specific coordinate systems, image formats, scale, and false-positive interpretation introduce significant risk.

## NeuraX concept: “SPHEREx Blink”

A web sky viewer designed around the classic astronomy “blink comparator” idea, modernized for multi-epoch/multi-band SPHEREx data.

### Core interaction

`navigate/search sky → choose two epochs → blink/swipe/difference → inspect candidate moving/changing sources → view multi-band evidence → save/share candidate`

### Optional AI assistance

Rather than “AI discovers Planet X,” use AI to **rank interesting candidate changes** for human inspection.

Candidate ranking factors could include:

- positional shift between epochs;
- brightness change;
- consistency across nearby bands;
- source morphology/quality flags;
- cross-match status with known objects if official resources permit.

## Candidate data/resources — verify after 2026-10-28

The full resource package should clarify:

- which SPHEREx image/data products are expected;
- access APIs/archives;
- file formats and coordinate metadata;
- sample sky regions;
- expected handling of 102 bands;
- whether catalog data or only images are in scope.

Potential implementation technologies may involve FITS/image tiles, WCS/sky coordinates, catalog cross-matching, and web-suitable image pyramids—but these are contingent on the supplied products.

## Analytical possibilities

### Baseline: temporal visual comparison

- align images to a common sky coordinate frame;
- normalize display/brightness appropriately;
- enable blink/swipe/difference views;
- show timestamps/bands/source metadata.

### Candidate change detection

- image differencing after registration;
- source detection per epoch;
- nearest-neighbor/cross-epoch matching;
- motion vectors;
- variability score;
- quality/artifact rejection.

### Multi-band layer

A useful differentiator could be spectral context: users inspect whether a candidate appears consistently or differently across bands. Do not reduce 102 bands to arbitrary RGB without explaining the mapping.

## Technical decomposition

### Data preprocessing
- select manageable sky tiles;
- convert/cache images into web-friendly representation;
- preserve WCS/coordinate metadata;
- epoch/band indexing.

### Analysis
- registration/cross-match;
- differencing or source-motion calculation;
- candidate score;
- known-object filtering if resources allow.

### Backend
- sky/coordinate query;
- epoch/band metadata;
- image tile access;
- candidate list/details.

### Frontend
- pan/zoom sky viewer;
- epoch switch/blink;
- band selector;
- candidate markers;
- motion/brightness chart;
- source provenance and quality flags.

## 48-hour MVP

1. Use **one or a few small sky regions**, not the whole billion-object archive.
2. Load two epochs with a manageable subset of bands.
3. Implement correct coordinate-aligned blink/difference.
4. Add a basic candidate-change detector or precomputed candidate list.
5. Build candidate inspection cards with temporal/multi-band plots.
6. Validate against known moving/variable objects if examples are provided.

## Evaluation

- image registration residual/error;
- recovery of known moving/variable examples;
- false positives from artifacts/noise;
- candidate ranking precision on a manually labeled small set;
- timing/performance for sky navigation;
- verify coordinate transforms with trusted catalog points.

## Team fit

- **Hưng:** change detection/CV, candidate ranking, evaluation and experiment design.
- **Việt:** image/data pipeline, modeling and astronomy-data exploration.
- **Hiếu:** high-performance web viewer/API integration.
- **Tiểu An:** public-facing UX and citizen-science story.

## Domain gaps

- astronomy data formats and World Coordinate System concepts;
- interpreting motion/variability scientifically;
- artifact rejection;
- potentially very large data volume.

A mentor with astronomy/astrophysics experience would materially reduce risk.

## Risks

- Data volume overwhelms hackathon infrastructure.
- Image alignment/coordinate handling consumes most of the event.
- Difference images dominated by artifacts.
- Claiming “Planet X candidates” without evidence.
- Building a beautiful sky viewer but little meaningful temporal analysis.
- Trying to use all 102 bands and whole-sky coverage in the MVP.

## Scorecard

| Dimension | Score / 10 | Comment |
|---|---:|---|
| Team fit | 8.5 | Strong AI/software skills, but astronomy is a gap. |
| AI/data leverage | 9.5 | Excellent CV/change-detection opportunity. |
| GIS/EO leverage | 4.0 | Spatial visualization helps, but planetary sky coordinates are a different specialty. |
| 48h feasibility | 6.5 | Data engineering/astronomy formats may be heavy. |
| Demo/story impact | 9.0 | Blinking moving sky objects is very compelling. |
| NASA-data centrality | 10.0 | SPHEREx is explicitly the core. |
| Differentiation ceiling | 9.0 | Strong citizen-science + AI potential. |

## Recommendation

**High-upside but data/domain-risky.** Keep as a second-tier candidate, especially if the full brief provides prepared image cutouts, a sample region, catalog helpers, or example moving objects. If teams must engineer large SPHEREx data products from scratch, Earth-science options are safer for NeuraX in 48 hours.
