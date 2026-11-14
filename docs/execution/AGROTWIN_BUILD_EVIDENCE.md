# AgroTwin V4 — execution evidence

Build date 2026-11-14. This file distinguishes actual execution from proposed acceptance. Native Windows Node 24.22.1 / Python 3.12.14; no package install or paid service used so far.

## Verified milestones

- Phase0: per-file backups and Git baseline outside repos; branch `build/agrotwin-v4-my-thanh-2026-11-14` in all three trees. Baseline: lab 31 tests passed, frontend 17 unit tests and TypeScript passed.
- Added backend tests: six passed for real cached case, immutable/cache behavior, changed meaningful inputs, unsupported geometry, null/zero/nonfinite/negative/duplicate/coverage, synthetic verified predicate exclusion, unreviewed rules, source failure/fallback, geometry and API.
- Frontend: 20 unit tests passed, lint/typecheck/build passed after the first source taxonomy mismatch was detected and corrected. New tests cover non-null A1, numeric packager missingness and numeric `qa=fail` display.
- Real browser smoke: opened cached run, changed drainage/management, POSTed to local evaluator, observed different run/input hash and `needs_review`; no pageerror. This is a software path test, not a crop outcome test.

## Browser acceptance iterations

`tests/e2e/analysis.spec.ts` implements all ten V4 scenarios against the actual local API, with a labeled synthetic QA transport fixture for failure display and mocked/explicit synthetic hardware paths. Automated contexts block public OSM tiles; no basemap prefetch.

First run: 7 passed, 3 failed. Failures retained in `frontend/artifacts-v4-console.log` and `frontend/artifacts/v4/test-results`. Found: offline sample geometry depended on the older chart fetch; Power JSON scroll regions lacked keyboard access; draft-rule assertion selected a closed card. Fixed geometry fallback from saved A1, focusable JSON regions, and scoped the assertion to the expanded card. Full rerun results are recorded below after completion.

Final rerun: **24 passed, 0 skipped, 0 unexpected, 0 flaky**, 129.45s, Edge/msedge. All ten scenarios below passed. No test was deleted to hide failure. Existing selectors were adapted to the real evaluator replacing reference-only/scenario UI.

## Failure/limitation log

- npm unavailable on session PATH: used the installed Node executable and project-local CLIs; not a failed dependency install.
- Initial frontend A1 adapter found an OSM source without evidence_class; corrected registry and regenerated a versioned saved run.
- Recompute/cache assertions allow equal eligibility; new provenance/completeness trace, not forced ranking changes, proves execution.
- Live NASA request, original source re-acquisition, physical device, real field conditions and actual user studies are separate from local software tests.
- One existing Starlette/httpx deprecation warning persists. Source integrity and unit tests are not independent agronomic approval.

## Implementation locations

Lab: `neurax/agrotwin/{inputs,data,engine,service}.py`, resources under `neurax/resources/agrotwin/`, API routes in `neurax/api.py`, CLI `neurax agrotwin`, tests `tests/test_agrotwin.py`.

Product: `frontend/src/features/analysis/{contracts,state,AnalysisPanel}`, shared provider in main, Workspace consumers, QAMatrix and numeric packager fixes, saved analysis from the producer, authored geometry SVG and browser/unit tests. H1 transport/session code is preserved and Home exposes explicitly labeled context.

External scientific claims and licenses: see AGROTWIN_SOURCE_MANIFEST.md and AGROTWIN_SCIENCE_LIMITATIONS.md. Final commands, scenario statuses and commit identifiers will be appended after verification.

## Final verified checks — 14 November 2026

| Command / check | Actual result | Artifact |
|---|---|---|
| Lab `.venv/Scripts/python.exe -m pytest -q` | 41 PASS, one existing Starlette/httpx deprecation | Lab `runs/agrotwin-v4-tests.log` |
| Frontend `node node_modules/typescript/bin/tsc --noEmit` | PASS | No type errors, exit 0 |
| `node node_modules/eslint/bin/eslint.js .` | PASS | Exit 0 after browser-global annotations |
| `node node_modules/vitest/vitest.mjs run --cache=false --fsModuleCache=false` | 21 PASS / 4 files | `frontend/artifacts-v4-units.log` |
| `node node_modules/vite/bin/vite.js build` | PASS | `frontend/artifacts-v4-build.log`; unsafe image absent |
| `PLAYWRIGHT_CHANNEL=msedge; node node_modules/@playwright/test/cli.js test` | 24 PASS | [final JSON](../../frontend/artifacts/v4/final-acceptance.json), [log](../../frontend/artifacts-v4-final-acceptance.log) |
| `node scripts/verify-demo.mjs` against dev and curated production preview | PASS: zero page/console/critical-network errors; four pages zero Axe findings; no mobile overflow | [dev report](../../frontend/artifacts/v4/demo/report.json), [production report](../../frontend/artifacts/v4/production-demo/report.json) |
| Curated checkout via `git checkout-index --all --prefix=...`, regenerate cache/A1/build | PASS: no raw source/Esri dependency, same run and scientific hash | Private reproduction folder below |
| Fresh source `pytest tests/test_agrotwin.py -q` using existing Windows dependencies | 10 PASS | Reproduction `neurax-fieldshift-lab/reproduction-tests.log` |
| `pip wheel --no-deps --wheel-dir ../wheels .` in isolated build environment | PASS; all four JSON resources present | `reproduction-wheel-isolated.log` |
| `./Start-AgroTwin.ps1 -NoBrowser`, proxy registry, AC10, `./Stop-AgroTwin.ps1` | PASS; only launcher-owned processes stopped | `frontend/artifacts-v4-launcher.log`, `artifacts/local-demo/` |

Full fresh npm installation was not run: npm is absent on this session PATH. Fresh-source checks reused the existing same-OS dependency directory through a junction and the existing Python environment. `package-lock.json`, pyproject and the existing pinned runtime requirements are reconstruction inputs. Wheel build downloaded only isolated build tools; it did not change the project environment. Initial `--no-build-isolation` failed because setuptools was absent; ordinary isolated build succeeded.

## Mandatory scenario matrix

All rows run in [analysis.spec.ts](../../frontend/tests/e2e/analysis.spec.ts). Full command is the Playwright command above; backend semantic assertions also run in [test_agrotwin.py](../../../neurax-fieldshift-lab/tests/test_agrotwin.py).

| # | Scenario | Result / boundary |
|---|---|---|
| 1 | Saved preload, no fabricated computation | PASS; saved timestamp, no POST |
| 2 | Meaningful input → real evaluator | PASS; new input/run/criterion trace, unchanged eligibility allowed |
| 3 | Second AOI | PASS; distinct hash, no Mỹ Thành source/catalog borrowing |
| 4 | A→B→A, delayed response, cancel/retry | PASS; old response cannot replace active AOI |
| 5 | Null/zero | PASS; unknown remains null, actual numeric zero preserved; software fixture only |
| 6 | Numeric value with QA fail | PASS; failure stays failure in engine/UI; explicitly synthetic transport fixture |
| 7 | Unknown K1/soil/water | PASS; needs_review, score null, missing source/input trace |
| 8 | Reproducibility/cache/cosmetic changes | PASS; cache sidecar distinct, immutable saved bytes, independent-store identity test |
| 9 | Shared Farmer/Power, comparison/export | PASS; same run and actual criteria; accessibility checked |
| 10 | Hardware/offline honesty | PASS in no-device/synthetic/replay/mock USB cases; missing optional chart module cannot hide analysis. Physical device NOT_TESTED |

## Defects found and corrected

First acceptance run 7/10: fixed offline geometry fallback, focusable Power JSON and an assertion scoped to a collapsed card. Full legacy run 22/24: fixed terrain source configuration depending on the retired image extent. Later full run 23/24 exposed optional lazy chart loading hiding the whole app at the offline transition: introduced local Suspense/error boundaries and deliberately blocked the chart in AC10. Vite now ignores generated trace HTML to avoid test artifacts causing dev-page reloads. All 24 then passed; after the watch-only adjustment AC10 passed again on the one-command launcher.

Independent-store check found the scientific hash accidentally contained computation time; scientific identity now excludes wall-clock/acquisition metadata. Missing rule evidence cannot become eligible solely through complete form inputs. Per-variable coverage preserves a complete zero-rain total when temperature is missing; incomplete rain cannot be labeled a complete monthly total. Hardware Axe reported duplicate unnamed complementary landmarks; named both asides and reran checks, now zero findings.

The first safe-stop attempt refused a valid PID because PowerShell 7 parsed ISO JSON timestamps into DateTime objects; corrected cross-version timestamp handling and verified stop without disabling identity checks. No other service was terminated.

## Artifacts and reproducibility

Private backup: `C:/Users/ghcoo/.codex/project-memory/agrotwin-v4/20261114T072428Z/`. Curated reconstruction: `C:/Users/ghcoo/.codex/project-memory/agrotwin-v4/reproduction-20261114/`. These are not dependencies required on another machine.

Prepared run `a1-69fff89f2af0fcc5fe4870cf`; scientific SHA-256 `3b84e7ab94dfeda5fede34ecc54341ab9555a77b4255c6674d9bb4672896a76c`, reproduced independently. Wheel SHA-256 `7f87b8c98adef19c08ad0c0ac5abbfc72b5ac2ead4cfc8c37eef75fea768cd00`. Curated snapshot hash `619c374f75a21740b523051c4ac96c14313a1ffcad33920e4c3c1f7c57109065`.

Actual NASA acquisition: January 2025 fetched at 08:13:55Z, one month technical QA pass, TLS enabled; see manifest and lab `runs/agrotwin-v4-live-check.json`. This did not replace the pinned multi-year demo source. Raw/network artifacts remain local, not committed as research truth.

Visual inspection: [Farmer desktop](../../frontend/artifacts/v4/demo/farmer-en.png), [Farmer VI/mobile](../../frontend/artifacts/v4/demo/farmer-vi-mobile.png), [Power](../../frontend/artifacts/v4/demo/power-en.png), [Hardware](../../frontend/artifacts/v4/demo/hardware-en.png). Six screenshots per dev/production run include Entry and VI desktop; final dev capture waits for terrain and chart animations to settle. Automated OSM tile requests are intentionally blocked; images do not prove a licensed offline basemap or real field deployment. Logs/traces/screenshots are ignored local artifacts; committed `evidence/verification.json` preserves results and artifact hashes.

Network capture retains expected StrictMode/navigation cancellations separately and requires a successful matching 200 response. An initial overly strict capture counted those canceled duplicate reads as failures; classification was corrected without suppressing unresolved failures. Final capture has zero critical failures and keeps the cancellation count visible.

Implementation commits: lab `b7be1e6`; product `504e1ee` and `0c56b41`; docs bridge `2f99462`. No push, public deploy, physical purchase, cloud spend, external message or scientific approval performed.
