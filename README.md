# NeuraX — NASA Space Apps Challenge 2026

NeuraX's workspace for the NASA Space Apps Challenge 2026.

We are building an open, data-driven solution at the intersection of AI, geospatial analysis, Earth observation, and open science.

> Project direction is intentionally kept flexible until the team locks the final 2026 challenge and problem statement.

## Project status

- Organization: `NeuraX-Lab`
- Event: NASA Space Apps Challenge 2026
- Stage: Challenge selection & problem framing
- Primary development branch: `dev`

## Planned architecture

```text
frontend/      User-facing web experience and visualization
backend/       APIs, services, and application logic
ai/            ML/AI experiments, inference, and evaluation
data/          Dataset notes, schemas, and small samples
geospatial/    GIS and Earth-observation processing
docs/          Architecture, methodology, and project documentation
demo/          Demo assets and presentation-ready materials
.github/       GitHub workflows, issue templates, and PR templates
```

## Working model

1. Pick and document the NASA challenge.
2. Define the target user, problem, and measurable outcome.
3. Identify NASA/open datasets and validate licensing/access.
4. Build a thin end-to-end prototype first.
5. Iterate on AI/geospatial capability only where it improves the user outcome.
6. Keep the demo reproducible and understandable to judges.

## Branching

- `main` — stable, demo-ready state.
- `dev` — integration branch.
- `feat/<name>` — feature work branched from `dev`.
- `fix/<name>` — fixes branched from `dev`.

Avoid committing feature work directly to `main`.

## Team

NeuraX is a multidisciplinary student team working across AI, software engineering, geospatial analysis, and domain research.

Team ownership and contributor details will be finalized after the challenge is selected.

## Getting started

The implementation stack is not locked yet. Once the challenge is selected, this section will contain the exact local setup and run instructions.

For contribution conventions, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

License decision pending challenge and dataset review.
