# EDA findings — executed, regional data
[Machine report](evidence/report.json) · [seasonality](evidence/seasonality.csv) · [plot](evidence/eda.png).

132 monthly records2015–2025; missing rain/temp0, duplicate month0, QA131pass/1warn. Rain min0, max966.72mm/month. Temperature min24.831613, max32.678°C. Do not equate132 correlated monthly records with132 independent farms. Seasonal summaries mean/std/min/max per calendar month were computed; the plot is descriptive and does not establish climate-change causation.

The retained14Jun2020 rainfall488.17mm/day is not corrected or treated as independently verified. Rain modeling is deferred while its extreme-event interpretation lacks independent QA. Temperature experiment is separate from this precipitation flag; no imputation, random split, optical-derived labels or synthetic labels used.

Normalized CSV SHA `ff79f609ff0e7236487520576a78149d3ad984e2f55259844b8d638099d36c38`; full source payload and implementation SHA in report. Run lab `.venv/Scripts/python.exe -m neurax.agrotwin.research`; outputs under `runs/agrotwin-v41-research`. Then inventory command verifies raw numerical reconstruction. Synthetic perturbation appears only in tests of leakage mechanics.

| Target | Decision | Reason / next proof |
|---|---|---|
| Next-month regional T2M | RESEARCH_ONLY experiment feasible |132 targets/120 lag rows, one grid; temporal validation available |
| Crop suitability/rotation benefit | NOT_TRAINABLE_WITH_AVAILABLE_LABELS | No verified crop/outcome/management table; K1 text is not supervised labels |
| Sensor anomaly detection | NOT_TRAINABLE_WITH_AVAILABLE_LABELS | No labeled real events/anomalies; implement deterministic monitoring QA |

IMPLEMENTER finding: climate time series supports a limited retrospective forecast.
SKEPTICAL REVIEW objection:11years and one grid do not validate long-term resilience, extreme crop damage or field transfer.
EVIDENCE-BASED RESOLUTION: report seasonal/high-temperature error slices with sample counts, retain research-only state, no suitability join or outcome claim.
