# Desktop Sprint 1.1 — visual fidelity correction

Baseline branch research/post-review-inference, HEAD3a78edc; Sprint1 WIP preserved. No new concept, backend/train/dependency changes, commit/push/deploy. Mobile-specific CSS unchanged. Native Windows Node24.22.1/existing package-lock/node_modules; services5174/8000/8182 reused.

## Before → after

Sprint1: three independent columns, Explore map56–58%, Decision32%, map360/265px high and variable blank area below it. Header/context reached workspace aroundy240. AI and sensor competed horizontally. Forecast was two numeric panels.

Sprint1.1: two columns60/40 at both desktop sizes and both modes. Right column stacks V2 then telemetry. Workspace begins aroundy186; map viewport around480px at1440 and500px at1920, checked against450–550px requirement. Same real MapLibre map, geometry and probes; no concept image as map. Header44px, context reduced. Mode changes preserve map size per new requirement; Decision highlights comparison rather than shrinking AOI. Model advanced/research views stay accessible within keyboard-focusable climate panel. Selecting probes can expand sensor details and workspace to preserve that information.

Three independent quantitative plots replace desktop number panels: mưa mm/tháng, nhiệt°C, RH% with separate axes. Each has discrete rows for actual target months. Dots use value, whiskers use response lower/upper; axis covers the real range and zero, negative lower limits retained if present. No interpolation or fabricated uncertainty. Titles/accessibility text include exact value/range and backtest coverage. Cutoff/mode and RH/baseline limitation remain in existing context. Advanced details retain methods/coverage. Values read from existing validated V2 forecast list; A1 and V2 schemas unchanged. Historical chart, old research inference, local drafts/RAG and sources remain available.

ForecastPlot.tsx is new; ClimateContext imports it; desktop.css adds scoped two-column correction and sensor typography; desktop-sprint1.spec updates former shrinking-map expectation to60% and450–550px height, plus three plot presence. Existing Sprint1 changes are not overwritten/reset. ESP32 blank/disconnected uses HardwareProvider, no fabricated packets. Probe positions illustrative, ADC remains ADC.

## Verification and evidence

Typecheck, full lint, build PASS.37unit PASS on rerun (first run36/37 had existing research result async timing timeout; retained sprint11-unit.log, passing sprint11-unit-final.log). Initial desktop run exposed map exceeding550px because right panel stretched grid; corrected explicit rows and final rerun. Browser logs sprint11-browser-final.log authoritative; old failed logs retained. Mechanical detector[]. All tooling existing, real browser Chromium via Playwright because connector unavailable in preceding attempts; no simulated UI screenshots.

Screenshots outside repository: C:/Users/ghcoo/.codex/visualizations/agrotwin-sprint11/final-{1440,1920}-{explore,decision}.png (exact viewport); current-{width}-{model,comparison,saved}.png from actual API/input flow. Before images remain agrotwin-sprint1. Scripts capture.cjs/viewport.cjs reuse localhost in isolated browser contexts. Actual API responses retained actual-v2-{width}.json, never hardcoded into UI.

Compared against selected target and Sprint1 screenshots: map now dominates and has adequate height, right panels align vertically, header reduced, model chart conveys ranges rather than only values, comparison immediately follows primary analysis/status. Still not pixel-exact: no decorative spacecraft/rice artwork, top brand/navigation remains different, charts show scientifically honest discrete ranges instead of continuous seasonal trend.1440×900 still needs scroll to see all three rotation rows;1920 opens comparison with first row visible. Advanced climate panel scrolls. These are review limitations, not a claim of visual acceptance. Imagery can take time to load from provider. No field usability testing or physical ESP32 validation/calibration performed. Harness results do not prove field measurements.

Stop after Sprint1.1 for Hưng review; no other pages redesigned.

Final browser acceptance:20/20 PASS (1.6m) in sprint11-browser-final.log, including desktop dimensions, map/probe/keyboard, API error/stale/scope, actual V2/RAG/save/reopen and separate research inference. This does not establish visual approval.
