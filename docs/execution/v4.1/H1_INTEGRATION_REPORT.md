# H1 integration
SOFTWARE_TESTED on synthetic/bench fixtures; PHYSICAL_DEVICE_NOT_TESTED. No calibrated real serial log or deployment evidence was supplied. No pH inventory inferred.

Implemented `neurax/agrotwin/h1.py`: typed timezone-aware events, ingested_at/source SHA, immutable content-keyed batches, dedup/sorted windows, null/zero, units/quality/calibration, mean/min/max/window/coverage/stale/future-clock flags. API `POST /v1/h1/ingest` uses same localhost Origin/body limits; unknown client approval fields rejected. Browser Hardware syncs last100events explicitly, displays monitoring features/flags; browser recording/replay/serial remains.

History retained on disk `runs/agrotwin/h1/`; latest features read newest100batches (bounded monitoring, no destructive expiry).5s cadence,300s window,30s stale,80% coverage are engineering policies. No claim of agronomic thresholds or automatically learned anomaly model. Mean is descriptive even when quality needs_review.

Verified field gate requires trusted server registry with named verification, AOI, calibration and matching K1; client map placement cannot populate it. No verified registry exists in production; all actual features are excluded from A1. TEST_ONLY fixture demonstrates gate mechanics, then changes events to simulated and asserts exclusion. A1 has no sensor feature consumer until a genuinely reviewed matching criterion exists.

IMPLEMENTER finding: event→features→monitoring works without hardware purchase.
SKEPTICAL REVIEW objection: a venue probe, or client-provided field flag, cannot establish field relevance.
EVIDENCE-BASED RESOLUTION: reject client approval, preserve bench/synthetic/replay source and gate actual crop join.

Device checklist: model/BOM/baud; UTC clock; quantity/unit/raw scale; source_context; calibration reference/date/method; physical location/depth; real log with zero/missing/duplicates/out-of-order/unplug/reconnect; explicit field deployment evidence if desired. Hưng can collect this or delegate; Codex validates files when supplied. Unsent message: “Cho mình model/baud và log UTC thật kèm calibration, vị trí/độ sâu, rút–cắm lại USB. Demo tại venue sẽ ghi bench, không thành phép đo Mỹ Thành; pH chưa xác nhận thì để unavailable.” No message sent.
