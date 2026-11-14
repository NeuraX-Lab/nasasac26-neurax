# UX decision review
Current V4 rendered desktop/mobile EN/VI was captured before edits using scripts/verify-demo.mjs; log `frontend/artifacts-v41-before.log` PASS. Captures were inspected. Actual issue: three tall reference cards preceded actionable gaps; open inputs could show duplicate Analyze actions. Farmer scientific provenance was already available through disclosure.

Implemented: next actions moved before reference cards; Analyze confirmed-input action hidden while input form is open, preserving one primary action; native details state is tracked without controlling each toggle. A regression test caught the first controlled-details implementation hiding inputs; fixed with ref/effect tied to changed run/stale state, reran the task. Sensor context kept; no cosmetic redesign. Power alone adds actual EDA/E1 research-only disclosure, valid schema/fallback/download. Farmer and Power continue same A1.

IMPLEMENTER finding: action needs fewer scrolls and redundant submission controls can be avoided.
SKEPTICAL REVIEW objection: moving evidence cannot prove farmer understanding and may hide important uncertainties.
EVIDENCE-BASED RESOLUTION: retain needs_review wording/sources/limitations and all evidence gaps; real-browser tasks and accessibility verify software only. USER_STUDY_NOT_DONE.

Before capture retained in V4 artifacts; final captures written separately to artifacts/v41-after. Real test cases include meaningful farm input, scope change, same run across views, E1 disclosure, H1 sync, offline and mobile. Numeric debug state stays primarily in Power; model metrics do not become farmer suitability scores.
