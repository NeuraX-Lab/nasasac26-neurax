# AgroTwin V4 — scientific limitations

Primary case is Mỹ Thành, Đồng Tháp. MT-BLOCK-01 is an analyst-digitised research geometry (~1.996 ha), not a surveyed/legal field, not a verified homogeneous soil unit. Changing geometry does not move the cached NASA query point. New geometries get their own public request or explicit unavailable state; the original references are not silently reused.

## Evidence boundaries

| Source | Supported | Not established |
|---|---|---|
| NASA POWER | Regional gridded historical meteorology, units/period/coverage | Field temperature, irrigation supply, crop suitability |
| SoilGrids | Modeled centroid/depth estimates and prediction quantiles, DERIVED_MODEL | Measured pH/EC, verified WRB class, local drainage/compaction |
| SOIL-01, CTU 2011 | REGIONAL_HISTORICAL, revised 2009 map 1:250,000, 276 augerings, 10 groups/60 types | Current field soil class/pH/EC or evaluated rotation AI |
| S4/S5 CTU 2009 | Historical rice/upland rotation experiments and their reported site-specific outcomes | Current Mỹ Thành practice or guaranteed yield/water benefit |
| ESA Sentinel-2 | REMOTE_SENSING samples and coverage research | Crop identity/calendar from three NDVI samples |
| Sensor bench/replay | Event transport and readings at the stated physical context | Evidence at the AOI represented by a simulated marker |

SOIL-01 PDF has eight pages; journal p11 methods, p12 Table1, p16 Table2/map, p17 conclusions were opened in the preceding source audit. SHA-256 `4a436d9560106f74f2a1ae233f5ced45992de5ac38223d9c38855bfda17c1b0a`. Table2 historical Tiền Giang: Alisols 76,266.3 ha; Fluvisols 58,588.7; Gleysols 53,014.4; Luvisols 21,622.8; Arenosols 7,312.3; Solonchaks 3,451.7. Mỹ Thành combines Phú Nhuận/Mỹ Thành Bắc/Mỹ Thành Nam of historical Tiền Giang under 2025 boundaries; do not select the old Đồng Tháp row by current province name.

## What this engine computes

The deterministic evaluator checks supplied inputs, missing requirements, source QA, regional catalog scope and rule approval. Each criterion includes input values, missing inputs, rule/evidence IDs, scope, reviewer state and limitations. Completeness is an implementation policy, not scientific evidence of suitability.

Production catalog rules remain draft, without domain/numeric sign-off. R0/R1/R2 are historical ordered sequences, `is_current=null`, `score=null`. The engine does not execute draft thresholds or promote a model soil mean into a measurement. No reviewed scoring method/weights are available. A `needs_review` result is intended behavior, not a failed hidden recommendation.

Synthetic verified predicates exist only in automated tests and are labeled SYNTHETIC; no API accepts client-supplied rules or approval. No crop recommendations, yield/water savings, fertilizer/pesticide instructions, field trial or actual farmer usability study are claimed.

## Review required before a recommendation-capable release

Bích: crop/variety/season/water/soil applicability, evidence locators and rationale. Luật: independent numeric/unit/calendar/QA checks. Hưng/Việt: agreed response/scoring method and sufficient field inputs. No automatic approval through a file edit without named reviewer records and tests. Numeric duration claims from different studies are not pooled; unreviewed 24–48-hour waterlogging claims remain unknown.

pH purchase is DEFER. Consider borrowing/lab only when an applicable criterion needs it and depth/date/method/calibration/reference are available. Plant death alone does not prove nutrient or soil benefit: species, cause, residue return/removal, nutrient balance and pest management require evidence. Three sequences/three years do not establish temporal generalization; climate months are not crop outcome labels.

Forecast toolkit is separate from crop A1. Synthetic forecast tests are software checks; one holdout used for model selection is not an untouched independent final test. LLM inference, new spectral layers, AWS, nationwide K1 and persistent sensor databases are outside P0.
