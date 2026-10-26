# Contributing to NeuraX

This repository is optimized for fast, reviewable hackathon development.

## Branch workflow

1. Pull the latest `dev`.
2. Create a focused branch:
   - `feat/<short-name>` for features
   - `fix/<short-name>` for bug fixes
   - `docs/<short-name>` for documentation
   - `research/<short-name>` for research/data work
3. Keep commits small and descriptive.
4. Open a pull request into `dev`.
5. Merge `dev` into `main` only when the integrated build is demo-ready.

## Pull request expectations

A PR should explain:

- What changed.
- Why the change is needed.
- How it was tested or validated.
- Screenshots or demo evidence for UI changes.
- Dataset/model assumptions for AI or geospatial changes.

## Engineering principles

- Prefer a working end-to-end slice over isolated complexity.
- Keep secrets, credentials, private datasets, and large model artifacts out of Git.
- Document external datasets and their provenance.
- Make demo-critical workflows reproducible.
- Avoid adding dependencies without a clear project need.

## Data and AI notes

For each important dataset, record its source, fields used, preprocessing, limitations, and licensing/access notes. For AI components, document the model/task, inputs/outputs, evaluation approach, and known failure modes.

## Definition of done

A task is done when the implementation works, the relevant documentation is updated, and another team member can reproduce or review it without relying on undocumented local steps.
