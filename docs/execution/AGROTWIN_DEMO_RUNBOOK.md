# AgroTwin V4 — local demo and pitch

Runtime: native Windows, Python 3.12 project `.venv`, Node 24.22.1 verified. No cloud credentials, paid services, LLM or physical sensor are required for P0. Run source folders remain private/local; this is not a production deployment.

## Fresh setup

Keep `nasasac26-neurax` and `neurax-fieldshift-lab` as sibling checkouts. The docs repository is the evidence/planning companion; runtime no longer depends on its raw caches.

```powershell
# In neurax-fieldshift-lab, using an installed native Python 3.12:
py -3.12 -m venv .venv
.venv/Scripts/python.exe -m pip install -e '.[test]'
# In nasasac26-neurax/frontend, Node/npm installed:
npm ci
```

The current Codex runtime exposes Node but not npm on PATH. Existing installed dependencies were reused; direct Node equivalents below are verified. A normal Node installation with npm can use the package scripts/lockfile. No global runtime changes were made.

## Startup

One command from `nasasac26-neurax/frontend`: `./Start-AgroTwin.ps1` (add `-NoBrowser` for shell-only). It verifies/reuses compatible ports, otherwise starts hidden local processes, and writes only launcher-owned PIDs/logs under `artifacts/local-demo`. It never kills another service. Stop launcher-owned services with `./Stop-AgroTwin.ps1`.

```powershell
# Terminal 1, lab root; keep local-only:
.venv/Scripts/python.exe -m uvicorn neurax.api:app --host 127.0.0.1 --port 8000
# Terminal 2, product frontend:
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174
```

Open http://127.0.0.1:5174. Vite/preview proxy `/api` to the local API on 8000. No secrets are needed. General toolkit endpoints remain available; crop readiness endpoint is `POST /v1/analysis`, immutable results `GET /v1/analysis/runs/{run_id}` and sources `GET /v1/analysis/sources`. Run storage defaults to lab `runs/agrotwin`; override with `NEURAX_AGROTWIN_RUN_DIR` only for a deliberate separate store.

Regenerate the prepared sample after evaluator/catalog/source changes:

```powershell
# In frontend, sibling lab .venv must exist:
node scripts/package-snapshots.mjs
node scripts/package-analysis.mjs
```

The first script uses curated resources, preserves missingness/source QA and does not require raw daily files or Esri images. The second actually invokes the Python evaluator before writing the saved-analysis artifact. Opening that artifact later is cache playback, not a new computation.

## Five-minute demo

1. Entry → prepared Mỹ Thành sample. Explain research geometry, saved-analysis label, period and computed timestamp. Do not say the app just observed the field.
2. Expand field inputs. Current/previous crop, season, irrigation/drainage and management can remain unknown. Change drainage and one context input, press Analyze. Inspect POST `/api/v1/analysis`, changed input hash/run ID and actual criterion trace.
3. Show `needs_review`, null scores and next actions. Supplied drainage improves completeness; it does not approve a draft crop rule.
4. Switch Farmer → Power. Confirm the same run ID. Inspect source/QA/rule provenance, compare a prior run and export JSON.
5. Create AOI B by drawing or coordinates. Choose offline for a deterministic demonstration. Analyze: different geometry/scope, no borrowed Mỹ Thành catalog/cache. Live mode is optional and may report a blocked public request.
6. Disconnect API/internet in a controlled test: matching saved result is labeled OFFLINE; changed inputs remain stale/unavailable until a successful evaluation. Geometry fallback remains usable. Do not promise offline OSM tiles.
7. Hardware: disconnected means no measurements. Start explicit synthetic stream or replay a labeled recorded log; return by SPA navigation to show Home summary. Explain bench/simulated placement is excluded from crop A1. Actual Web Serial requires user selection and a real device; automated USB tests use mock transport.

Research and Sandbox remain separate. Synthetic climate fixtures are not passed to the research evaluator. Scenario-response modeling, forecast, LLM, nationwide K1 and AWS are deferred. No artificial best crop or savings claim is needed to demonstrate the implemented readiness decision.

## Verification commands

```powershell
# Lab:
.venv/Scripts/python.exe -m pytest -q
# Frontend:
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js .
node node_modules/vitest/vitest.mjs run --cache=false --fsModuleCache=false
node node_modules/vite/bin/vite.js build
$env:PLAYWRIGHT_CHANNEL='msedge'
node node_modules/@playwright/test/cli.js test
```

API and frontend must be running for integration/browser scenarios. Edge was used because the prior environment blocked the downloaded Chromium executable; do not change Windows security policy. Test traces/screenshots/logs are retained in frontend `artifacts/v4` and the evidence document records final outcomes.

## Seven-slide pitch outline

1. **Decision:** before replacing one rice season, what conditions/evidence must be checked? No guaranteed crop prescription.
2. **Context:** Mỹ Thành research geometry and regional NASA climate; distinguish field truth, models and historical papers.
3. **Inputs:** farmer crop/season/water/goals, with unknown allowed; SOIL-01 informs questions rather than classifying this field.
4. **Working core:** real D1/Q1 → gated K1 → deterministic A1; demonstrate input edit, request/run/hash and trace.
5. **Two experiences:** Farmer next action; Power provenance/comparison/export on the same result.
6. **Trust/demo resilience:** cache/offline/stale, no fabricated ranking, bench/replay separation, tests and limitations.
7. **Next evidence:** domain/numeric review, verified local measurements and real farmer task validation. No yield/water benefit, market superiority or usability result claimed yet.
