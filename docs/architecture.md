# System Architecture

This document is a living architecture note. Update it when the challenge and technical stack are locked.

## Goals

- Keep the demo path short and reliable.
- Separate UI, application logic, AI, and geospatial/data processing cleanly enough for parallel work.
- Make external data dependencies explicit.
- Avoid infrastructure complexity that does not improve the demo or judging criteria.

## Proposed high-level flow

```text
User
  ↓
Frontend / Visualization
  ↓
Backend API / Orchestration
  ├── AI inference / reasoning
  ├── Geospatial processing
  └── External NASA / open-data sources
  ↓
Result / map / recommendation / insight
```

## Components

### Frontend

Responsibilities:
- User input and workflow.
- Maps, charts, imagery, or result visualization.
- Clear loading/error states for demo reliability.

### Backend

Responsibilities:
- API contracts.
- Data orchestration and caching.
- Calling AI/geospatial services.
- Keeping secrets and external credentials server-side.

### AI

Responsibilities will depend on the selected challenge. Document:
- Task definition.
- Model/service used.
- Input/output contract.
- Evaluation criteria.
- Known failure modes.

### Geospatial

Potential responsibilities:
- Coordinate/reference-system handling.
- Spatial joins, clipping, raster/vector processing.
- Satellite/Earth-observation preprocessing.
- Map-ready output generation.

### Data

For every important source, document provenance, schema, access method, preprocessing, caching policy, and limitations.

## Deployment

Deployment target is intentionally undecided until the stack is chosen. Prefer the simplest architecture that allows the team to reproduce and demo the product reliably.

## Decisions log

| Date | Decision | Rationale |
| --- | --- | --- |
| TBD | TBD | TBD |
