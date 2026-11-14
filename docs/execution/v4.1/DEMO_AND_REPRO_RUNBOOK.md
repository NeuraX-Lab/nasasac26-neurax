# Demo and reproduction — V4.1
Primary runtime remains native Windows, lab .venv Python3.12.14, Node24.22.1. No migration/training GPU/cloud needed. Standard setup uses lab pyproject with `.[test,research]`, existing pinned requirements and frontend package-lock. Same-OS existing dependencies were used in this session; no claim of fresh npm installation.

Start from product/frontend: `./Start-AgroTwin.ps1`; opens http://127.0.0.1:5174. Stop `./Stop-AgroTwin.ps1`. Existing PowerShell5.1 no-Node-PATH compatibility retained. Public source or hardware failures have explicit fallback; core cache works without internet/device.

1. Mỹ Thành saved→input unknown/season/water→Analyze→same A1 in Farmer/Power. Needs_review is an executed result.
2. Farmer shows next actions before references. Power expands criterion/source/compare/export and EDA/ML research-only section.
3. Power E1 reports real24-month holdout; explicitly no crop guarantee or inference consumer.
4. Hardware→Start synthetic stream→Sync events to pipeline→observe coverage/QA and A1 exclusion. Physical serial remains NOT_TESTED.
5. AOI B/offline→no borrowed Mỹ Thành data; cached/computed/stale distinct.

Research reconstruction commands (lab):
```powershell
.venv/Scripts/python.exe -m neurax.agrotwin.inventory
.venv/Scripts/python.exe -m neurax.agrotwin.research --out runs/agrotwin-v41-research
.venv/Scripts/python.exe -m pytest -q
```
Then frontend:
```powershell
node scripts/package-analysis.mjs
node scripts/package-research.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js .
node node_modules/vitest/vitest.mjs run --cache=false --fsModuleCache=false
node node_modules/vite/bin/vite.js build
$env:PLAYWRIGHT_CHANNEL='msedge'
node node_modules/@playwright/test/cli.js test
```
Inventory gracefully records raw source absence on another checkout; raw records are not redistributed. EDA can reproduce from attributed curated monthly source without sibling raw. Never unpickle externally supplied artifacts. Weights stay local; source/hash/config/report committed. No training on Analyze.

Copy-ready pitch: “AgroTwin checks the prerequisites and evidence gaps before changing a rotation at the Mỹ Thành research case. NASA regional data, source QA and review-gated rules support two views of the same auditable analysis. A separate retrospective temperature experiment is reported honestly; unapproved rules and bench readings do not become crop advice.”

Limitations: no optimal-crop/yield/water-saving claim, no field-validated soil/sensor deployment, no actual farmer usability study. Seven-slide V4 outline still applies with EDA/E1 evidence on the scientific-core slide.
