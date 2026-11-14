# AgroTwin V4 — execution plan

Authorization: user directive V4, read in full on 2026-11-14. Primary case is Mỹ Thành; SOIL-01 is supporting regional evidence. Implementation is local-first; no production deployment, purchases, billable services, external messages or automatic push.

## Phase 0 baseline and protection

- All three repositories now use `build/agrotwin-v4-my-thanh-2026-11-14`.
- Original product HEAD: `e05a30ba0a29254fc07a419ae904ffa6eb880479`; docs: `219ab3396e25b872483283b62af2b2f6d590ced0`; lab: `9d5e1728d522e080bfffa089f947ddfe1afe78db`.
- Pre-existing work backed up outside the repositories in `C:/Users/ghcoo/.codex/project-memory/agrotwin-v4/20261114T072428Z/`, with per-file SHA-256 in baseline.json. Product 83 files, docs 10, lab 8; no reset, clean, deletion or overwrite of backups.
- Native Windows: Node 24.22.1; lab `.venv/Scripts/python.exe`, Python 3.12.14. Preserve current lockfiles and Windows runtime.
- Existing product: React/TS/Vite/MapLibre with local AOI storage, static POWER snapshot, reference cards and serial/replay UI. Existing lab: intake/normalization/forecast/inspection bundle, no crop A1 evaluator.
- Geometry MT-BLOCK-01 is illustrative, ~1.996 ha, not surveyed/legal; actual soil/crop/water/current rotation unknown.
- SOIL-01 eight pages opened in the immediately preceding audit: 2011 paper, revised regional map 2009, 1:250,000, 276 augerings; historical Tiền Giang row does not establish field class/pH/EC. Reuse verified source bytes, not new AOI selection.

## Dependency order

| Phase | Change | Acceptance | State |
|---|---|---|---|
| 0 | Protect work, baseline tests, source/geometry checks | Recorded hashes/env and test logs | Passed: backup, 31 lab / 17 frontend baseline tests and typecheck |
| 1 | Validated request/geometry, curated cache/source registry, deterministic Q1 | Null/zero/QA/coverage/date tests | Passed; real public NASA acquisition also succeeded |
| 2 | Review-gated catalog, real A1 evaluator, immutable run store, local API/CLI | Criterion trace, unknown/violation/cache/repeatability tests | Passed; 10 new backend tests, 41 total |
| 3 | Versioned adapter, farm inputs, manual analysis, stale/race-safe shared run, compare/export | Both modes share run; meaningful edits invalidate | Passed; AC1–9 browser tests |
| 4 | Home summary and registry labels for bench/live/replay/no source | No false field data; disconnect does not block core | Passed in synthetic/mock/replay/no-device cases; physical device NOT_TESTED |
| 5 | Focused Farmer/Power UX, role simulation, defer pH/cloud/spectral expansion | Next action readable, mobile/accessibility | Passed software checks; actual user comprehension NOT_TESTED |
| 6 | Full test/build/browser, ten scenarios, setup/demo/pitch/evidence/handoff | AC-01 through AC-08 and truthful external blockers | Passed technical checks; scientific/physical sign-off remains external |

Expected files: lab `neurax/agrotwin/*`, `neurax/api.py`, CLI and integration tests; product analysis contracts/repository/state/components, null-safe packager, QA display, browser/unit tests, setup/run scripts and execution docs; docs repo supporting science/owner/source note. Preserve existing visual language and H1 controls. Do not rewrite unrelated dirty planning documents.

## Scientific and engineering guards

- Draft rules never become approved; no fabricated thresholds, current rotation, crop winner, forecast quality or farmer interviews.
- Real computation may produce partial/needs_review with null scores. Explicit synthetic fixtures test verified-constraint wiring only.
- Changed AOI never silently receives Mỹ Thành cached features. Unsupported/live fetch failures remain visible.
- Cache includes material inputs, geometry, source/rule/evaluator versions; response race guards use request context/generation.
- Existing A1 enums stay; orchestration/cache/stale/deployment metadata is versioned sidecar.
- Esri redistribution rights are unresolved: preserve original asset locally, use an authored geometry illustration and attributed basemap/fallback for the reproducible package.
- Keep raw data/secrets/environments/generated runs out of commits; deliberately include only curated attributed demo inputs needed for reproduction.

## DoD matrix

AC-01 setup/protection; AC-02 real/cached data path; AC-03 criterion/rule/evidence trace; AC-04 recompute/cache/stale/race; AC-05 shared Farmer/Power run/next action; AC-06 honest hardware; AC-07 tests/browser/offline; AC-08 sources/limitations/runbook/pitch/handoff. Results and artifacts go in AGROTWIN_BUILD_EVIDENCE.md; no item is passed on code inspection alone.

```yaml
checkpoint:
  phase: 6
  status: passed
  verified_commands: ["pytest: 41 passed", "frontend unit: 21 passed", "tsc/lint/build passed", "Playwright Edge: 24 passed", "fresh curated source: 10 backend tests + build", "wheel build with isolated build dependencies", "launcher start/proxy/offline/stop"]
  last_changed_files: ["frontend/", "../neurax-fieldshift-lab/neurax/agrotwin/", "docs/execution/"]
  outstanding_tests: ["physical calibrated hardware/field trial", "independent agronomic/numeric approval", "actual farmer comprehension study"]
  next_exact_action: "Open AGROTWIN_FINAL_HANDOFF.md; ./frontend/Start-AgroTwin.ps1 starts the completed local readiness demo. Reviewers can inspect committed catalog/trace without rebuilding the workflow."
  external_blockers: ["Bich/Luat applicable agronomic and numeric approvals", "Verified field soil/current practice evidence", "Physical sensor inventory/calibration/deployment log"]
```

Phase 1–3 progress: curated real cache and source registry, bounded polygon/request validation, Q1, review-gated evaluator, content-keyed immutable runs, API/CLI, shared frontend run/form/provenance/compare/export, null-safe numeric packager and QA fail display implemented. Six backend integration tests and 20 frontend unit tests pass; typecheck/lint/build passed. First adapter test caught missing OSM evidence classification; fixed registry and rebuilt the saved run. Baseline npm command unavailable in session PATH; direct Node project CLI commands work. API 8000 and Vite 5174 running locally for verification; no production/cloud.

Browser smoke verified: saved run opened, changing drainage and submitting called the real API and returned a different A1 run/input hash with needs_review; no pageerror. Phase 3 integration is functional, acceptance/race/offline tests remain. Backend code changes require restarting the owned API; switching to autoreload for development.

Acceptance rerun: all 10 V4 browser scenarios passed (52.3s), including real API recompute, AOI B isolation, cancel/race, cache, source QA fail, Farmer/Power comparison/export, offline and synthetic Home labels. Source logs: frontend/artifacts/v4/acceptance-results.json. Phase 4: optional event identity/dedup and explicit unverified deployment registry added; 21 frontend unit tests passed. Full existing+V4 browser suite is running; final evidence remains pending.

Final milestone: all 24 E2E passed (129.45s), all 10 backend AgroTwin tests / 41 complete backend tests and 21 frontend tests passed. Independent curated checkout reproduced run `a1-69fff89f2af0fcc5fe4870cf` and scientific SHA `3b84e7ab94dfeda5fede34ecc54341ab9555a77b4255c6674d9bb4672896a76c`; production preview and dev screenshots/console/network/Axe passed. Wheel built using isolated temporary build dependencies; no package/environment shared across operating systems. Launcher start, API proxy, offline scenario and safe stop verified. Own temporary services stopped; existing user service 5173 untouched. Final deliverable is a verified readiness/evidence-gap application; recommendation-capable science and physical deployment are external, not silently approved.
