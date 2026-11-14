# AgroTwin — local readiness decision tool

One shared real A1 run powers Farmer and Power views. The current production catalog is unapproved historical evidence: results honestly return needs_review and null scores. It is not a validated crop recommendation.

Start with [the V4 runbook](../docs/execution/AGROTWIN_DEMO_RUNBOOK.md), [execution plan](../docs/execution/AGROTWIN_BUILD_PLAN.md), [test evidence](../docs/execution/AGROTWIN_BUILD_EVIDENCE.md) and [science limits](../docs/execution/AGROTWIN_SCIENCE_LIMITATIONS.md).

Native Windows verified: Node 24.22.1; sibling lab Python 3.12.14 `.venv`. Standard reconstruction: `npm ci`, then `npm run dev -- --port 5174`; run lab API separately on 127.0.0.1:8000. For the current runtime without npm PATH, `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174` uses existing dependencies. Never share node_modules or Python envs across Windows/WSL.

Snapshots are intentional attributed derived demo inputs. `node scripts/package-snapshots.mjs` reads curated lab resources; `node scripts/package-analysis.mjs` actually computes the saved A1. Raw source cache, proprietary imagery, AWS credentials and physical hardware are not required to run the limited prototype.

No production deploy/public submission is performed by these commands. See runbook for unit/build/browser commands, explicit offline/cached/synthetic states and the seven-slide pitch.

After dependencies exist, use `./Start-AgroTwin.ps1` for a one-command local demo (`-NoBrowser` optional). `./Stop-AgroTwin.ps1` stops only recorded launcher-owned processes after checking their identity. The launcher reuses compatible existing services and never terminates them. `node scripts/verify-demo.mjs` captures page errors, source/API responses, Axe findings and desktop/mobile EN/VI screenshots under ignored `artifacts/v4/demo`.

Build assets use an explicit allowlist: preserved local imagery without redistribution permission is not copied to `dist`. The analysis form has its own rendering boundary, so slow/offline optional map/chart chunks cannot hide the saved result or prevent analysis.
