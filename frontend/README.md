# AgroTwin — local readiness decision tool

## Selected AI V4 + physical USB demo — 15 November 2026

Current integration branch: `feat/v4-dashboard-esp32-integration`, based on Hưng's `research/post-review-inference` at `208055e`. One existing Dashboard, with ML v3 climatology + RAG v4 refined evidence gate + pooled intervals through `/api/v4` on8184. No V5/V6 promotion or V2 fallback. A1/H1 remains separate on8000, pinned by the launcher; legacy8182 is not needed.

From this folder run `./Start-AgroTwin.ps1` (`-NoBrowser` optional), then open **http://127.0.0.1:5174/w/my-thanh/farmer**. Start resolves the selected lab checkout or accepts `AGROTWIN_LAB_ROOT`, prepares the pinned A1 worktree and reuses only compatible services. `./Test-AgroTwinV4.ps1` checks real inference and browser workflow; `./Stop-AgroTwin.ps1` stops only owned identities. After code changes, stop/restart owned services if preflight reports a loaded-code hash mismatch.

The [8-minute presenter script](../docs/demo/AGROTWIN_V4_LIVE_DEMO_SCRIPT.md), [checklist](../docs/demo/AGROTWIN_V4_DEMO_CHECKLIST.md), [troubleshooting](../docs/demo/AGROTWIN_V4_TROUBLESHOOTING.md), [integration report](../docs/integration/V4_ESP32_INTEGRATION_REPORT.md) and [fresh verification](../docs/integration/V4_ESP32_VERIFICATION.md) are the current handoff. The V4 runtime installer/manifest and core dependency pins live in the backend repo; no training is needed.

USB was physically observed through user-granted Web Serial on this machine at115200, CH343 **COM3**. Detect the actual port on each machine. Keep °C/%RH/raw ADC, host receipt time and unverified calibration/location labels; do not infer soil-water percentage or use sensors to alter V4 results. New V4 drafts save their original run/input/model/citations; reopening does not run inference. User must choose the serial port again after reload.

## Historical runtime notes

The V2/Extra Trees and prior V4.1 UI notes below record earlier releases. Their old test counts, service assumptions and model claims are not acceptance evidence for the integration above.

Current dashboard and v2 integration: [15 November handoff](../docs/product-integration/UI_REMAKE_HANDOFF.md). Open `http://127.0.0.1:5174/w/my-thanh/farmer`. From this directory, `./Start-AgroTwin.ps1 -NoBrowser` reuses compatible UI/A1 services and starts/reuses the isolated FieldShift v2 API at8182. V2 runtime lives in sibling `fieldshift-v2-runtime-cc674716`, with its own Python3.12.14 environment and pinned dependencies; use `-X utf8`. `./Stop-FieldShiftV2.ps1 -WhatIf` previews stopping only launcher-owned v2 processes.

V2 analyzes rules/RAG for supported pilot inputs and serves precomputed model forecasts. It does not rerun climate prediction per farm edit or provide approved crop rankings. Drafts persist in this browser's localStorage. Current checks (native Windows, Node24.22.1, existing package-lock): `node node_modules/typescript/bin/tsc -b`, `node node_modules/eslint/bin/eslint.js .`, `node node_modules/vitest/vitest.mjs run`, `node node_modules/vite/bin/vite.js build`, and `node node_modules/@playwright/test/cli.js test tests/e2e/dashboard.spec.ts tests/e2e/dashboard-model.spec.ts tests/e2e/live-v2.spec.ts`.

One shared real A1 run powers Farmer and Power views. The current production catalog is unapproved historical evidence: results honestly return needs_review and null scores. It is not a validated crop recommendation.

Start with [the V4 runbook](../docs/execution/AGROTWIN_DEMO_RUNBOOK.md), [execution plan](../docs/execution/AGROTWIN_BUILD_PLAN.md), [test evidence](../docs/execution/AGROTWIN_BUILD_EVIDENCE.md) and [science limits](../docs/execution/AGROTWIN_SCIENCE_LIMITATIONS.md).

Native Windows verified: Node 24.22.1; sibling lab Python 3.12.14 `.venv`. Standard reconstruction: `npm ci`, then `npm run dev -- --port 5174`; run lab API separately on 127.0.0.1:8000. For the current runtime without npm PATH, `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174` uses existing dependencies. Never share node_modules or Python envs across Windows/WSL.

Snapshots are intentional attributed derived demo inputs. `node scripts/package-snapshots.mjs` reads curated lab resources; `node scripts/package-analysis.mjs` actually computes the saved A1. Raw source cache, proprietary imagery, AWS credentials and physical hardware are not required to run the limited prototype.

No production deploy/public submission is performed by these commands. See runbook for unit/build/browser commands, explicit offline/cached/synthetic states and the seven-slide pitch.

After dependencies exist, use `./Start-AgroTwin.ps1` for a one-command local demo (`-NoBrowser` optional). `./Stop-AgroTwin.ps1` stops only recorded launcher-owned processes after checking their identity. The launcher reuses compatible existing services and never terminates them. `node scripts/verify-demo.mjs` captures page errors, source/API responses, Axe findings and desktop/mobile EN/VI screenshots under ignored `artifacts/v4/demo`.

Build assets use an explicit allowlist: preserved local imagery without redistribution permission is not copied to `dist`. The analysis form has its own rendering boundary, so slow/offline optional map/chart chunks cannot hide the saved result or prevent analysis.

Launcher compatibility fix: verified Windows PowerShell 5.1 with Node removed from PATH. Start discovers installed Node or the existing Codex runtime without changing system PATH; AGROTWIN_NODE can specify an explicit executable. Stop handles JSON process arrays in both PowerShell versions.
