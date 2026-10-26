# NeuraX — NASA Space Apps Challenge 2026

NeuraX's product and implementation repository for the NASA Space Apps Challenge 2026.

We are building an open, data-driven solution at the intersection of AI, geospatial analysis, Earth observation, environmental science, software engineering, hardware, and open science.

> Project direction is intentionally kept flexible until the team locks the final 2026 challenge and problem statement.

## Project status

- Organization: `NeuraX-Lab`
- Event: NASA Space Apps Challenge 2026
- Stage: Challenge selection & problem framing
- Primary development branch: `dev`
- Research / decision knowledge base: [`NeuraX-Lab/neurax-docs`](https://github.com/NeuraX-Lab/neurax-docs)

## Repository responsibility

This repository answers **how we build the selected product**: source code, architecture, data/AI/geospatial pipelines, APIs, deployment and demo assets.

Challenge research and selection rationale live in [`neurax-docs`](https://github.com/NeuraX-Lab/neurax-docs/tree/main/nasa-space-apps-2026). See [`docs/research.md`](docs/research.md).

## Planned architecture

```text
frontend/      User-facing web experience and visualization
backend/       APIs, services, and application logic
ai/            ML/AI experiments, inference, and evaluation
data/          Dataset schemas and small reproducible samples
geospatial/    GIS and Earth-observation processing
scripts/       Preprocessing and automation
docs/          Implementation-specific technical documentation
demo/          Demo assets and presentation-ready materials
.github/       GitHub workflows and repository templates
```

## Working model

1. Lock the final NASA challenge using the research repository.
2. Define the target user, problem, and measurable outcome.
3. Validate NASA/open datasets and access constraints.
4. Build a thin end-to-end prototype first.
5. Add AI/geospatial/simulation capability only where it improves the user outcome.
6. Keep the demo reproducible, scientifically defensible, and easy to understand.

## Branching

- `main` — stable, demo-ready state.
- `dev` — integration branch.
- `feat/<name>` — feature work branched from `dev`.
- `fix/<name>` — fixes branched from `dev`.

Avoid committing feature work directly to `main`.

## Team

- **Le Nguyen Gia Hung** — AI / Team Owner
- **Huynh Quoc Viet** — AI
- **Vo Thi Ngoc Bich** — Environmental Science
- **Ho Minh Hieu** — Software Engineering
- **Nguyen Thanh Hang (Tiểu An)** — Hardware

Full team capability baseline: [`neurax-docs/team/team-profile.md`](https://github.com/NeuraX-Lab/neurax-docs/blob/main/team/team-profile.md).

## Getting started

The implementation stack is not locked yet. Once the challenge is selected, this section will contain the exact local setup and run instructions.

For contribution conventions, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

License decision pending challenge and dataset review.
