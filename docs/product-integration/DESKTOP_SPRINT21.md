# Sprint 2.1 — final desktop UX corrections

15/11/2026. Product root remote-reproduction/nasasac26-neurax, branch research/post-review-inference, baseline3a78edc. Preserved all prior Sprint WIP/untracked artifacts. No push/merge/deploy, service restart, new dependencies, backend/model/NASA-data/scientific-gate changes. Native Windows Node24.22.1, existing package-lock/node_modules and localhost5174/8000/8182.

## Map reliability finding and correction

The old `loaded` flag was set after the empty initial style/AOI initialized. Satellite raster sources are added in the load callback, so AOI/probe presence did not prove raster tiles were ready. Previous screenshot scripts often waited for markers or a fixed short delay. A blank background with AOI/probes therefore could be captured while tiles were still pending; no evidence establishes a1440-only provider defect.

New `data-basemap-state=loading|ready|error` tracks satellite source loading separately from AOI initialization. Source completion/render and idle events mark readiness; errors or an unresolved loading period over12seconds enter a labelled fallback, leaving AOI and probes mounted. Timeout is rearmed by raster loading activity. Retry recreates the map from retained geometry. Existing WebGL outline fallback remains separate. A source label names Esri/OSM, not NASA; legal MapLibre attribution stays. Fallback wording no longer claims OSM successfully loaded when both providers may have failed.

Meaningful timing test gates World_Imagery requests: AOI/probes mount while map is explicitly loading, then aborted tiles produce a labelled error. Another test aborts satellite and OSM together and verifies AOI source, probes, warning and source label. No fabricated imagery. QA waits for ready/error and two animation frames before context capture; map-ready does not mean sensor/model readiness.

## Compare-first and action semantics

Explore/Conditions retain the approved60/40 workspace. Decision prioritizes result and R0/R1/R2 at the top viewport, with sticky mode navigation. It does not repeat NASA/model/ESP panels. The same mounted map is retained below the draft/source section as a260px context map,160px map height; it can expand to the real full MapLibre view or return to Observe with full climate/telemetry. Mini probes shrink only visually; A/B meanings and callbacks remain. Fullscreen restores the normal controls, Escape returns focus.

Rows use shorter visible blocked explanations; backend reasons, missing inputs and sources remain in disclosures. Shared missing information appears once. Selected highlighting means “Bạn đang cân nhắc”; it is separate from blocked/needs-information status. Draft area distinguishes the current selection from matching persisted selection. Choosing another option clears the save notice and marks the selection unsaved; reopen restores the actual saved option. A blocked selection has an explicit warning beside Save: discussion draft, not planting recommendation. Existing versioned persistence and A1/V2 validation remain unchanged.

Redundant fresh-result analyze action is hidden in Decision; Conditions uses its form submit rather than a second banner submit. Month inputs have lang and readable month/year helper labels; accessible input names remain stable after population. Native month-picker language can still follow the OS/browser; helpers provide consistent Vietnamese text without replacing the input/parser.

## Checks and logs

Typecheck (`node node_modules/typescript/bin/tsc -b`), full ESLint, Vite build and37unit tests PASS. Logs frontend/artifacts/remake/sprint21-{lint,build,unit-final}.log. Diff-check PASS. Mechanical detector reported an existing accent-border style warning; retained approved art direction, not treated as functional test success.

Full browser batch sprint21-final.log:25/26 PASS. The remaining old non-pilot test tried to click a model panel intentionally hidden in compare mode; updated it to go through Observe, keeping all geometry/scope assertions. sprint21-confirm.log:5/5 PASS (that scope test, pending tile lifecycle, both compare sizes/blocked draft/save/reopen/mini fullscreen, both-tile-provider failure). Mini visual polish was then rechecked: sprint21-mini-final.log2/2 PASS at1440/1920 including fullscreen/Escape. Thus all26 distinct acceptance cases have passing evidence across runs; do not describe the full batch itself as26/26. Earlier month-helper accessible-name regression was caught and corrected; old failed/interrupted logs preserved.

Coverage includes existing separate research inference, V2 output/provenance/RAG, API outage/wrong scope/stale races, no ESP packet, serial bench/disconnect, save failure/reload/reopen, draw/edit boundary and fullscreen keyboard/a11y regressions. No physical ESP32/calibration or field user study. Source/provider contracts and research-only/null-rank gates unchanged.

## Review artifacts

Outside repo: C:/Users/ghcoo/.codex/visualizations/agrotwin-sprint21/

- 1440-compare.png and1920-compare.png: actual first viewport, saved blocked R1 selected, statuses separate.
- 1440-context.png and1920-context.png: draft warning/save state, mini-map and full-source access.
- tiles-pending.png: real AOI with deliberately pending raster requests and loading label.
- tile-fallback.png: deliberately failed satellite/OSM; no unlabelled synthetic background.

Browser evidence uses existing Playwright Chromium against running localhost, not mockup renders. Screenshots from final targeted tests were viewed. The owner still reviews visual acceptance; test passes do not establish farmer usability. Expanding reasons/source detail can require scrolling. External tile availability remains outside application control; fallback intentionally preserves geographic outline rather than promising offline satellite imagery.

Sprint2.1 changes: SpatialMap.tsx tile lifecycle/source labels, Dashboard.tsx compare context/save-state/CTA semantics, RotationComparison.tsx compact reason disclosure, ConditionsForm.tsx localized helper/stable accessible names, scoped desktop.css additions, updated navigation regressions and new farmer-sprint21.spec.ts. No Sprint3 started. Stop for owner review.
