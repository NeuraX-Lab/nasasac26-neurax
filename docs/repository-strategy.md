# NeuraX Repository Strategy

> **Decision date:** 2026-10-26  
> **Decision:** Use a hybrid repository model: separate team/research/decision knowledge from product implementation.

## Target organization structure

```text
NeuraX-Lab/
├── .github/                # organization profile and shared community files
├── neurax-docs/            # team knowledge, research, decisions, competition analysis
├── nasasac26-neurax/       # NASA Space Apps 2026 product/code
└── vaic-2026-template/     # existing repository
```

## Rule of ownership

### `neurax-docs` answers **WHY / WHAT SHOULD WE BUILD?**

Examples:

- team profile and capability matrix;
- all 14 NASA Space Apps challenge dossiers;
- ranking history and reassessments;
- competitor research;
- previous Global/Local winner research;
- challenge-selection rationale;
- decision logs;
- pitch/research notes that are not implementation-specific.

### `nasasac26-neurax` answers **HOW DID WE BUILD IT?**

Examples:

- product source code;
- frontend/backend;
- AI/model implementation;
- geospatial processing;
- data pipelines;
- technical architecture;
- methodology of the selected solution;
- API/deployment documentation;
- demo assets.

### `.github` answers **WHO IS NEURAX AS AN ORGANIZATION?**

Examples:

- public organization profile;
- shared issue/PR templates where appropriate;
- shared contributing/community defaults.

---

## Target `neurax-docs` layout

```text
neurax-docs/
├── README.md
├── team/
│   └── team-profile.md
├── nasa-space-apps-2026/
│   ├── README.md
│   ├── challenges/
│   │   ├── 01-abandoned-but-not-forgotten.md
│   │   ├── 02-earth-system-trend-detective.md
│   │   ├── 03-junior-astronaut-mission-trainer.md
│   │   ├── 04-clps-lunar-mission-browser.md
│   │   ├── 05-astronaut-health-monitoring.md
│   │   ├── 06-dancing-with-the-sars.md
│   │   ├── 07-field-shift.md
│   │   ├── 08-flame-in-freefall.md
│   │   ├── 09-modis-viirs-hot-spots.md
│   │   ├── 10-earth-analogs-moon-mars.md
│   │   ├── 11-martian-map.md
│   │   ├── 12-planet-x-spherex.md
│   │   ├── 13-space-mission-design-game.md
│   │   └── 14-earth-information-jukebox.md
│   ├── rankings/
│   │   ├── v1-pre-release.md
│   │   └── v2-team-reassessment.md
│   ├── competitor-research/
│   ├── past-winners/
│   ├── decision-log.md
│   └── final-selection.md
└── future-competitions/
```

## Target `nasasac26-neurax` layout after challenge selection

```text
nasasac26-neurax/
├── frontend/
├── backend/
├── ai/
│   ├── models/
│   ├── inference/
│   ├── experiments/
│   └── notebooks/
├── data/
│   ├── raw/
│   ├── processed/
│   └── sample/
├── geospatial/
├── scripts/
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   ├── data-pipeline.md
│   ├── api.md
│   └── deployment.md
├── demo/
├── .github/
│   └── workflows/
├── README.md
├── LICENSE
├── .gitignore
└── docker-compose.yml
```

Directories should be created only when needed; this tree is a target, not a requirement to create empty folders.

---

## Migration map from the current repository

The current repo temporarily contains challenge research because it was created before the repository split was finalized.

| Current path | Target path | Action |
| --- | --- | --- |
| `docs/team.md` | `neurax-docs/team/team-profile.md` | Move/copy once `neurax-docs` exists |
| `docs/challenges/README.md` | `neurax-docs/nasa-space-apps-2026/rankings/v1-pre-release.md` + challenge index | Split historical ranking/index cleanly |
| `docs/challenges/01-...14-....md` | `neurax-docs/nasa-space-apps-2026/challenges/` | Move all challenge dossiers |
| `docs/challenges/REASSESSMENT-V2.md` | `neurax-docs/nasa-space-apps-2026/rankings/v2-team-reassessment.md` | Move |
| `docs/challenge-selection.md` | `neurax-docs/nasa-space-apps-2026/final-selection.md` | Keep as final decision template until selected |
| `docs/architecture.md` | `nasasac26-neurax/docs/architecture.md` | Remain in product repo |
| `CONTRIBUTING.md` | product repo | Remain unless organization-wide policy replaces it later |

## Migration policy

1. **Do not delete the current research until the destination repository is created and verified.**
2. Copy/move content into `neurax-docs` with a clear initial migration commit.
3. Verify every target file is readable on GitHub.
4. Replace challenge research in `nasasac26-neurax` with a short pointer to `neurax-docs` where useful.
5. Remove duplicated research from the product repo only after verification.
6. Keep technical docs in the product repo.
7. Avoid maintaining duplicate authoritative copies across both repos.

## Branch strategy

### Product repository

```text
main
└── dev
    ├── feat/frontend-dashboard
    ├── feat/backend-api
    ├── feat/ai-pipeline
    └── feat/geospatial
```

Feature branches merge into `dev`; stable demo-ready work moves from `dev` to `main`.

### Documentation repository

Use lightweight topic branches when changes are substantial, for example:

```text
main
├── research/2026-challenge-audit
├── research/past-winners
└── docs/team-update
```

Small documentation corrections may use direct PRs depending on team preference.

---

## Organization profile draft

For `NeuraX-Lab/.github/profile/README.md`:

```md
# NeuraX

NeuraX is a multidisciplinary student team building AI-powered solutions at the intersection of space, Earth observation, geospatial data, environmental science, software, and open science.

## Current work

- **NASA Space Apps Challenge 2026** — researching and building a data-driven solution using NASA/open data.

## Core disciplines

- Artificial Intelligence & Machine Learning
- Environmental Science & Earth Observation
- Software Engineering
- Geospatial Data
- Hardware & Sensing

## Repositories

- `nasasac26-neurax` — NASA Space Apps 2026 product implementation
- `neurax-docs` — team research, challenge analysis, decisions, and knowledge base
```

This text should be refined after the final challenge/product is selected.

---

## Current limitation

The connected GitHub integration used during this setup can modify existing repositories but does **not** expose repository creation. Therefore `neurax-docs` and `.github` must first be created in the `NeuraX-Lab` organization through GitHub. Until then, migration work should remain staged and no authoritative research file should be deleted from `nasasac26-neurax`.