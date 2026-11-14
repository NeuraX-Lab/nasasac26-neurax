# Model experiment / E1
Status: ML_EXPERIMENT_VALIDATED for the internal temporal software protocol; model decision **RESEARCH_ONLY**. No external independent reviewer or field validation is asserted.

Target: monthly regional T2M mean(°C), one month ahead using observed prior months. Reuses V4 `train._features` and HistGradientBoosting family; older `train_forecast` single-selection-holdout tool is preserved but is not used as final E1 here.

Predeclared protocol `v41-temperature-1`: lag1/12, previous3mean, calendar sin/cos; HGB leaves3/7,100iterations, learning_rate.06, min_leaf6, l2=1,seed42, early_stopping=False, CPU1thread. Expanding validation2021/2022/2023 trained on strictly earlier targets. Choose candidate only if validation MAE improves seasonal-naive by5%. Threshold is an internal engineering comparison policy, not agronomic science.

Selection: `hgb_7`; validation candidate MAE0.620264 vs baseline0.813278°C. Selection artifact is written before final evaluation.96 training targets2016–2023, final24targets2024–2025 untouched by selection. Rolling one-step uses earlier observed final months for later lag features; this is not a24-month-ahead forecast.

| Final24months | MAE °C | RMSE °C | Bias °C |
|---|---|---|---|
| HGB7 | 0.492859 | 0.621293 | -0.264277 |
| Seasonal naive | 0.831786 | 1.089273 | 0.086329 |

Season and high-temperature slices/counts in [report](evidence/report.json);5high-temperature final months use training-only90th percentile, not a crop heat threshold. No post-holdout reselection. Final performance is retrospective and limited; not a confidence interval, prospective deployment result or farm suitability metric.

Artifact SHA `c3f661ad7c7f5159d45a263bb20a7d10def3f58d4b843ea5e541f1fdb2a4b6c1`; local `candidate.joblib` is not committed. Report records source, normalized and implementation hashes/config. Tests perturb only final labels and require unchanged selection; lag test checks no target/future read. Production inference gate rejects this artifact. **Consumer:** Power displays static, labeled EDA/E1 evidence; no production point-prediction endpoint and no A1 forecast join. Training is offline only, never on Analyze.

Commands: lab `.venv/Scripts/python.exe -m neurax.agrotwin.research`; product frontend `node scripts/package-research.mjs`. [Temporal split primary documentation](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit), checked14Nov2026.

IMPLEMENTER finding: selected candidate beats baseline on held-out dates.
SKEPTICAL REVIEW objection: same source grid and small retrospective sample; no reviewed K1 consumes the forecast.
EVIDENCE-BASED RESOLUTION: RESEARCH_ONLY, not PROMOTED. The system serves deterministic readiness when no production forecast exists.

Legacy GET /v1/forecast/next is also gated at the actual HTTP boundary:409 when a research artifact exists. No external client can bypass the new experiment gate through that older route. Offline CLI research forecasts are explicitly separate.
