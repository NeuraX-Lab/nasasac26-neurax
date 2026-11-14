# Full system verification — V4.1
Baseline rerun:41backend +21frontend PASS. Current backend47PASS(one existing Starlette/httpx deprecation), frontend21PASS, TypeScript/lint/build PASS. Full V4 + V4.1 browser suite26PASS; final receipt captures the last run metadata. Initial UI-toggle regression failed1/24; fixed native details handling and reran. No acceptance scenario removed.

| Cross-layer check | Status | Evidence |
|---|---|---|
| Raw acquisition/cache identity→D1 | PASS | inventory raw SHA matches source;132monthly reconstructed within rounding |
| D1/Q1 missing/zero/negative/nonfinite/duplicate/QA | PASS | original test_agrotwin + tests/contracts and packager tests |
| EDA reproducibility | PASS | repeated original report identical; fresh-source normalization hash identical |
| Training/validation/final E1 | PASS research protocol |132source,120lagrows,96pre-finaltrain,24final; no final selection |
| Artifact/inference gate | PASS | perturb final labels: unchanged selection/model SHA; production inference rejected |
| K1 draft/provisional/unknown | PASS gate; BLOCKED real approval | test fixtures verify mechanics only; production all draft |
| A1 material input/cache/scope/race | PASS | ten original V4 acceptance scenarios re-executed |
| API/UI shared run, compare/export | PASS | original Power/Farmer scenarios, new research evidence test |
| H1→history/features/QA→monitoring | PASS synthetic/mock | test_v41 + new browser H1 sync |
| Bench/synthetic/invalid deployment join | PASS exclusion | client cannot self-approve; trusted registry fixture is TEST_ONLY |
| Offline/errors/cosmetic edits | PASS | V4 scenarios, missing optional module, no invented fallback |
| Desktop/mobile/accessibility | PASS software | verify-demo before/after; actual user study NOT_TESTED |
| Curated reconstruction/build | PASS |15backend integration tests + EDA/E1 + frontend build; weights/unsafe image excluded |
| Physical calibrated board/field trial | NOT_TESTED | No real device/log evidence |
| Agronomic external sign-off | BLOCKED_EXTERNAL | No genuine applicable approval record |

Artifacts: frontend/artifacts/v41-verified-e2e.json and artifacts-v41-verified-e2e.log; lab/runs/v41-full-tests.log; frontend/artifacts-v41-units.log; artifacts-v41-build.log; artifacts/v41-after/report.json. Generated outputs/logs remain accessible locally; committed evidence/verification.json records summary and hashes. Raw input/weights are not Git deliverables. Current existing same-OS dependencies were reused; no clean npm ci installation claim. Fresh staged source reconstruction under C:/Users/ghcoo/.codex/project-memory/agrotwin-v41/reconstruction-20261114; no dependency on sibling raw files for basic demo or curated EDA.

Commands and exact dependency setup are in DEMO_AND_REPRO_RUNBOOK.md. Full system verification distinguishes software, data quality, ML/E1, agronomic science and physical/user evidence. SOFTWARE_TESTED never silently becomes FIELD_VALIDATED or DOMAIN_APPROVED.

Final adversarial check found the legacy HTTP forecast route could otherwise serve an older research artifact. V4.1 now returns409 for such artifacts (404 if none); actual TestClient request verifies the block. Offline legacy CLI remains available for research. No production inference route is approved. This route-only guard does not alter the A1 or dashboard paths validated in the26-browser suite.
