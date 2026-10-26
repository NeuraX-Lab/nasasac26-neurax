# NASA Space Apps 2026 — NeuraX Challenge Research

> **Research snapshot:** 2026-10-26 (Asia/Ho_Chi_Minh)
>
> NASA has published the **14 challenge summaries**, difficulty levels, and subject tags. The **complete challenge statements and official resource/data lists are scheduled for 2026-10-28**. Therefore, this folder intentionally separates **confirmed challenge facts** from **NeuraX analysis/inference**. Candidate datasets and architectures listed before 2026-10-28 must be re-verified against the full NASA brief.

## Sources and evidence status

Primary references used for this first-pass review:

- NASA Space Apps 2026 challenge hub: https://www.spaceappschallenge.org/2026/challenges/
- 2026 challenge overview (all 14 summaries, difficulty and subjects): https://nasaspaceapps.ae/challenges
- NASA Space Apps local-event pages stating that complete 2026 challenge statements/resources are released on **October 28, 2026**: e.g. https://www.spaceappschallenge.org/2026/local-events/rohnert-park/ and https://www.spaceappschallenge.org/2026/local-events/ramallah/

### Confidence labels used in this folder

- **Confirmed:** stated on an official NASA Space Apps challenge page or the published 2026 challenge overview.
- **Candidate / verify 2026-10-28:** technically plausible dataset, API, method, or interpretation inferred by NeuraX before the full resource list is published.
- **NeuraX proposal:** our own product/architecture idea, not a NASA requirement.

---

## NeuraX team model used for scoring

This ranking is optimized for the **current team**, not for a generic hackathon team.

### Confirmed strengths

- **AI/ML, data science, experimentation, research:** strong.
- **Software engineering and product implementation:** strong enough for a web-first prototype.
- **Data visualization / analytical storytelling:** good fit, especially when paired with a clear scientific question.
- **Product framing, operations, presentation and user perspective:** useful non-coding strength.
- **Research-oriented ambition:** the team prefers a technically serious prototype with potential to become a paper/project after the hackathon.

### Current gaps / risks

- Deep **Earth-science/GIS domain expertise** is not yet a guaranteed core-team strength.
- Deep **astrophysics, orbital mechanics, combustion science, medicine/human physiology, and game design** are domain gaps.
- Hackathon time means a challenge that requires inventing both a difficult scientific method and a polished product is risky.

### Conditional GIS/environment boost

The team has discussed an Environmental Science/GIS candidate with ArcGIS/field-analysis experience. Because membership is not treated as confirmed in this analysis, scores below use the current core team. If a GIS/environment specialist joins, **Dancing with the SARs, Field Shift, MODIS/VIIRS Hot Spots, Earth Analog Locations, and Earth System Trend Detective all improve materially**.

---

## Scoring framework

Each challenge is scored from 1–10 on seven dimensions. The weighted score is a **decision aid, not an objective NASA score**.

| Dimension | Weight | What it means for NeuraX |
|---|---:|---|
| Team fit | 20% | Can the current members execute without a major domain bottleneck? |
| AI/data leverage | 15% | Does the challenge reward NeuraX's AI/ML/data strengths naturally? |
| GIS/EO leverage | 15% | Does geospatial/Earth-observation work create meaningful value? |
| 48h feasibility | 20% | Can we build a credible end-to-end MVP during the hackathon? |
| Demo/story impact | 10% | Can judges understand and remember it quickly? |
| NASA-data centrality | 10% | Is NASA data integral rather than decorative? |
| Differentiation ceiling | 10% | Is there room for a distinctive technical/product angle? |

For challenges where GIS is irrelevant, the low GIS score is not a criticism of the challenge; it reflects that one of NeuraX's intended differentiators cannot be used there.

---

## Preliminary ranking — before full briefs/resources (2026-10-26)

| Rank | Challenge | Preliminary score | Tier | Why it currently fits NeuraX |
|---:|---|---:|---|---|
| **1** | [Harmonization of MODIS and VIIRS Hot Spots](09-modis-viirs-hot-spots.md) | **9.3/10** | S | Clear Earth-observation problem, time-series/geospatial harmonization, strong practical users, excellent map/calendar demo, enough ML/statistics without forcing AI. |
| **2** | [Dancing with the SARs](06-dancing-with-the-sars.md) | **9.0/10** | S- | NISAR + change detection + interactive visualization is highly aligned and visually compelling; main risk is SAR preprocessing/domain knowledge. |
| **3** | [Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars](10-earth-analogs-moon-mars.md) | **8.9/10** | A+ | Multimodal geospatial ranking/clustering, Earth + Moon/Mars story, strong research extension and visual demo. |
| **4** | [Be An Earth System Trend Detective!](02-earth-system-trend-detective.md) | **8.8/10** | A+ | Statistics + NASA time series + geospatial visualization fits AI/data research strengths; scientific significance must be handled correctly. |
| **5** | [Field Shift: Adapting Farms with NASA Data](07-field-shift.md) | **8.6/10** | A+ | Strong real-world impact, EO + decision support + optimization; rises further with an environment/GIS teammate. |
| **6** | [Interplanetary Survival Guide: Martian Map](11-martian-map.md) | **8.4/10** | A | Strong layered map and route-planning demo; domain/data integration is manageable if the full resource list is clean. |
| **7** | [Flame in Freefall](08-flame-in-freefall.md) | **8.0/10** | A- | Best AI-first challenge: retrieval/ranking/summarization dashboard. Combustion-domain grounding and evaluation are the main risks. |
| **8** | [Planet X and SPHEREx](12-planet-x-spherex.md) | **7.8/10** | B+ | Excellent data/AI + public visualization potential, but astronomy domain and large-image/data handling may be costly. |
| **9** | [CLPS Lunar Mission Browser / Lunar Landing Site Navigator](04-clps-lunar-mission-browser.md) | **7.6/10** | B+ | Great visual product with clear mission value; horizon geometry, ephemerides and validation add specialist complexity. |
| **10** | [The Earth Information Jukebox](14-earth-information-jukebox.md) | **7.4/10** | B+ | Memorable multisensory demo and accessibility story; less aligned with team's research/AI strengths unless sonification is made scientifically meaningful. |
| **11** | [Create Health Monitoring Software for Astronauts on Space Missions](05-astronaut-health-monitoring.md) | **7.2/10** | B | Software/AI fit is good, but medical reasoning, safety, validation and data availability create a high domain-risk surface. |
| **12** | [Build a Junior Astronaut Mission Trainer](03-junior-astronaut-mission-trainer.md) | **6.7/10** | B- | Feasible and demo-friendly, but educational game design is not the team's main differentiator. |
| **13** | [Space Mission Design Game](13-space-mission-design-game.md) | **6.5/10** | B- | Attractive systems game, but balancing/orbital constraints and content design can absorb the whole weekend. |
| **14** | [Abandoned but not Forgotten](01-abandoned-but-not-forgotten.md) | **6.0/10** | C+ | Very feasible and story-friendly, but comparatively little leverage for NeuraX's AI/geospatial/research strengths. |

> **Do not lock the final challenge solely from this table.** On 2026-10-28 we need to re-read the official detailed brief, required deliverables, supplied datasets, judging hints, and any technical constraints. A strong official resource package can move a challenge several positions.

---

## Recommended shortlists

### If NeuraX wants the strongest overall technical fit

1. **Harmonization of MODIS and VIIRS Hot Spots**
2. **Dancing with the SARs**
3. **Earth Analog Locations**
4. **Earth System Trend Detective**

These reuse the team's strongest combination: data science + software + geospatial visualization + research framing.

### If NeuraX wants an AI-first project

1. **Flame in Freefall** — retrieval/ranking/summarization/grounded insight.
2. **Earth System Trend Detective** — trend/significance detection with interpretable statistics/ML.
3. **Planet X and SPHEREx** — temporal image/object-change exploration.
4. **Earth Analog Locations** — ranking/representation learning/semantic similarity over spatial features.

### If an Environmental Science / GIS specialist joins

The top group becomes especially attractive:

- **MODIS + VIIRS Hot Spots**
- **Dancing with the SARs**
- **Field Shift**
- **Earth Analog Locations**
- **Earth System Trend Detective**

Field Shift in particular can move into the top 3 because a domain specialist can prevent shallow agronomy assumptions.

### If the priority is the safest polished demo

- **MODIS + VIIRS Hot Spots** — map + calendar + anomaly/history narrative.
- **Martian Map** — layered map + route + safety/science overlays.
- **Earth Jukebox** — instantly understandable interaction.
- **Junior Astronaut Mission Trainer** — straightforward user loop and presentation.

---

## Decision gates for 2026-10-28

For every challenge in the current top 8, re-check these before committing:

1. **Required output:** Is NASA explicitly asking for a web app, analysis, game, dashboard, or something else?
2. **Official resources:** Are datasets actually accessible, documented, and small enough to prototype with?
3. **Temporal/spatial coverage:** Does data cover the area/time needed for our idea?
4. **Ground truth/evaluation:** Can we prove the solution works instead of only showing a visualization?
5. **Domain burden:** Is there a scientific assumption that requires an expert we do not have?
6. **Weekend scope:** Can one thin end-to-end path be working by the first half of day 2?
7. **NASA centrality:** Would the project still exist without the NASA data? If yes, our use of NASA data may be too superficial.
8. **Demo moment:** Can we show one compelling input → analysis → decision/insight sequence in under ~90 seconds?
9. **Post-hackathon value:** Does the topic have enough depth for NeuraX to continue as a research/portfolio project?

---

## Files in this folder

1. `01-abandoned-but-not-forgotten.md`
2. `02-earth-system-trend-detective.md`
3. `03-junior-astronaut-mission-trainer.md`
4. `04-clps-lunar-mission-browser.md`
5. `05-astronaut-health-monitoring.md`
6. `06-dancing-with-the-sars.md`
7. `07-field-shift.md`
8. `08-flame-in-freefall.md`
9. `09-modis-viirs-hot-spots.md`
10. `10-earth-analogs-moon-mars.md`
11. `11-martian-map.md`
12. `12-planet-x-spherex.md`
13. `13-space-mission-design-game.md`
14. `14-earth-information-jukebox.md`

---

## Next update

When NASA publishes the full statements/resources on **2026-10-28**, update each file with:

- exact objectives and required deliverables;
- official dataset/resource links;
- constraints and suggested tools;
- verified data schemas/resolution/coverage;
- changes to feasibility/risk;
- revised score and final NeuraX recommendation.
