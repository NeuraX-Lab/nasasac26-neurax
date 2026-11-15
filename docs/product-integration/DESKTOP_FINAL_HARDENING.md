# Final desktop UX hardening — 15/11/2026

Scope A/B/C completed for owner review. Product checkout remote-reproduction/nasasac26-neurax, branch research/post-review-inference, HEAD3a78edc. Prior WIP preserved. No reset/switch/commit/push/merge/deploy, dependencies installed, model training, backend/scientific-gate changes or mobile layout redesign. Existing services5174/8000/8182 and their PIDs reused.

## A. Map recovery — verified result

**Recovery succeeded in browser tests using real streamed provider tiles.**

- Warm map → browser network offline → labelled error; AOI and two probes remain. Explicit Retry while offline stays error. Browser online event automatically refreshes raster sources; HTTP-success tile count increases and MapLibre returns ready. Original map object and AOI source identity are unchanged.
- Tile requests deliberately held pending → loading → actual12s watchdog fallback. AOI/probes remain. After releasing the network gate, explicit Retry loads real imagery and returns ready.
- Existing tests also cover failed satellite+OSM, no-WebGL outline, fullscreen/keyboard and probe interactions.

Changed retry from destroying/recreating MapLibre to `RasterTileSource.setTiles` on existing sources. This is the installed library's public API. Geometry/probes/camera are retained during raster retry. The online callback uses the current retry handler; queued readiness callbacks verify navigator.onLine before marking ready. If WebGL is still initializing/unavailable, a labelled boundary diagram and illustrative A/B controls remain; it is not presented as satellite imagery.

No synthetic imagery, tile export, offline asset bundle or custom persistent tile cache added. Normal browser/provider HTTP caching remains. Success screenshots explicitly require data-basemap-state=ready plus two animation frames. Failure images are separately named offline/timeout, never accepted as a successful satellite state.

## B. Compact context

Compare context now fits its content: approximately610px total width, less than220px height in assertions, instead of a full-width empty panel. Mini-map260px with160px viewport, attribution, A/B and fullscreen remain. The adjacent source/action card no longer stretches across the screen. Original60/40 Observe workspace and compare-first R0/R1/R2 ordering remain unchanged. Fullscreen and returning to full map/climate/telemetry were exercised at1440×900 and1920×1080.

## C. Demo and checks actually run

New `frontend/tests/e2e/desktop-hardening.spec.ts`:4 tests (offline/online; timeout/retry; full journey at both sizes). Each journey executes NASA POWER observation → condition inputs → real FieldShiftV2 response → compare → select blocked R1 → local save → reload/reopen → compact context → real map fullscreen → return to Observe. ESP32 remains disconnected/blank. Existing A1/V2 contracts, research-only/null ranking, scope/stale and source traces retained.

Native Windows Node24.22.1, existing package-lock/node_modules. From frontend: direct node CLIs for tsc-b, eslint., vite build and vitest run. Typecheck/full lint/build PASS. Final unit rerun37/37 PASS (`hardening-unit-final.log`); first unit run36/37 hit an existing async research-result timeout, retained in `hardening-unit.log`; no production research-model code changed.

Browser full batch `hardening-final.log`:29/30 PASS. The sole failure was an old raw bounding-box check immediately after tab click, before scheduled scroll; same `<180px` assertion changed to poll until rendered position settles. Final related batch `hardening-confirm.log`:8/8 PASS, including both compare sizes, both full journeys, pending/failing tiles and real recovery. All30 distinct acceptance cases have passing evidence across these runs; do not label the full batch itself30/30. First new-test run2/4 failed: timeout harness attempted abort after MapLibre had already cancelled the tile, and the same premature position check. Harness cleanup now waits for route handlers and tolerates only the known already-handled cancellation; provider errors and application timeouts/assertions were not weakened. Verified new-test rerun4/4 PASS,47.2s (`hardening-verified.log`).

Logs under frontend/artifacts/remake/hardening-*.log. Diff-check PASS. Mechanical detector artifact generated for changed map/CSS; approved prior art direction retained rather than redesigned.

## Screenshot handoff

Folder outside source: C:/Users/ghcoo/.codex/visualizations/agrotwin-desktop-hardening/

- 1440-compare.png /1920-compare.png — exact desktop viewport, compare-first with saved draft.
- 1440-context.png /1920-context.png — compact context; real imagery confirmed ready.
- 1440-observe.png /1920-observe.png — return to full map after demo, imagery ready.
- offline.png /timeout.png — explicitly failed states.
- recovered.png /retry-success.png — successful recovery, not loading placeholders.

Images were captured from the running app with existing Playwright Chromium/WebGL software-rendering configuration, then visually inspected. Browser connector was unavailable in earlier checks; no claim of a successful connector session here.

## Limits and stop

Network loss was browser-level emulation, not physically disconnecting laptop Wi-Fi. This verifies recovery in an already opened app; cold-start offline without the app shell, long-duration field connectivity, provider SLA/rate limiting and real GPU context-loss recovery are not established. External provider outages can still require waiting/retrying; fallback preserves boundary instead of promising offline satellite coverage. No physical ESP32 packets/calibration, field user test or agronomic approval claimed. Shared map retry is improved, but mobile layout was not redesigned.

Current task changed SpatialMap.tsx and scoped desktop.css rules; added desktop-hardening.spec.ts and synchronized the old compare-position assertion. All other Sprint WIP retained. Stop for owner review; no next sprint initiated.
