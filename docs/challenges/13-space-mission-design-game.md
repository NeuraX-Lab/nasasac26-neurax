# 13 — Space Mission Design Game

**Difficulty:** Intermediate · Beginner/Youth  
**Subjects:** Games  
**NeuraX preliminary score:** **6.5/10 — Tier B-**  
**Status:** Summary available; full 2026 brief/resources expected 2026-10-28.

## Confirmed challenge intent

Space missions require trade-offs across mission objectives, spacecraft design, instruments, launch vehicles, budgets, power, mass, communications, and orbital constraints. NASA asks teams to build an **interactive game** in which players design, manage, and simulate a complete mission while making engineering decisions and observing how those decisions affect mission success.

Sources:
- https://www.spaceappschallenge.org/2026/challenges/
- https://nasaspaceapps.ae/challenges

## Core product problem

The challenge is fundamentally about **systems thinking**. A strong game needs interconnected constraints so that there is no single obvious “max everything” strategy.

The design loop should look like:

`mission objective → choose architecture/components → consume budget/mass/power → check constraints → simulate operations/events → score science/mission success → explain trade-offs`

The difficult part is not coding menus. It is making the simplified mission model **coherent, balanced, educational, and traceable to real space-engineering concepts**.

## NeuraX concept: “Mission Architect”

A browser-based mission design game where the player receives a mission brief—e.g., lunar orbiter, Mars science orbiter, asteroid flyby—and assembles a mission under limited resources.

### Player choices

- mission destination/objective;
- spacecraft bus class;
- payload/instruments;
- launch vehicle;
- power system;
- communication system;
- propellant/maneuver margin;
- optional redundancy/reliability upgrades.

### Constraint dashboard

Show live budgets:

- total cost;
- launch mass;
- power generation/consumption;
- data generation/downlink capacity;
- mission duration;
- risk/reliability proxy;
- science score.

A good UX shows **why** a choice causes downstream consequences instead of merely turning a meter red.

## Candidate NASA resources — verify 2026-10-28

The full brief may provide component data, simplified formulas, mission examples, launch-vehicle information, or learning resources. Those should drive the game model.

Potential content categories:

- mission architecture references;
- instrument examples and power/mass requirements;
- launch vehicle constraints;
- communication/data-rate concepts;
- orbital/trajectory simplifications;
- mission cost/risk abstractions.

Do not invent “realistic” technical numbers without a source when official simplified values are available.

## Simulation design

### Recommended: constraint model, not full physics simulator

Use transparent equations/rules such as:

- `total_mass <= launch_capacity`
- `peak_power_demand <= available_power`
- `daily_data_generation <= storage + downlink_capacity`
- mission-specific instrument requirements;
- simple delta-v/trajectory budget if the full brief expects it;
- random/branching events whose probabilities depend on design choices.

### Scoring

A multi-objective score is more educational than one “money” meter:

- science return;
- mission reliability;
- budget efficiency;
- schedule/complexity;
- constraint violations.

A post-mission debrief should explain the largest contributors to success/failure.

## AI/ML opportunity

Low for the core system. Useful optional ideas:

- mission-control tutor explaining trade-offs;
- adaptive scenarios;
- natural-language mission brief converted to game objectives;
- automated debrief generated from simulation logs.

Do not substitute LLM improvisation for the deterministic engineering rules.

## Technical decomposition

### Game/simulation engine
- component catalog;
- mission scenario schema;
- constraints and equations;
- event engine;
- scoring/debrief.

### Frontend
- drag/drop or card-based component selection;
- budget/resource meters;
- mission timeline/simulation;
- event decisions;
- outcome report.

### Content/data
- component facts and values;
- educational explanations;
- mission scenarios;
- sources/provenance.

## 48-hour MVP

1. Support **one mission type** rather than “any mission.”
2. Create 12–20 component cards across 4–5 categories.
3. Implement mass, power, budget and data/communication constraints.
4. Add a short mission simulation with 3–5 events.
5. Provide success/failure debrief explaining design trade-offs.
6. Test at least three viable strategies so the game is not solved by one obvious build.

## Evaluation

- scripted tests for every hard constraint;
- verify component values against official resources;
- play-test balance;
- check whether users can predict consequences after learning the rules;
- ensure multiple configurations can succeed;
- measure whether the educational debrief matches actual simulation causes.

## Team fit

- **Hiếu:** game engine/web implementation.
- **Hưng/Việt:** constraint modeling, optimization/balance analysis and testing.
- **Tiểu An:** game/user flow, onboarding, scenario writing and play testing.

### Main gaps

- no dedicated game designer;
- no confirmed spacecraft systems/orbital-mechanics specialist;
- mission balancing/content design can consume far more time than expected.

## Risks

- Scope explosion across entire mission lifecycle.
- Arbitrary component values and game rules.
- Building a configuration form rather than a game.
- Trajectory/orbital mechanics becoming too sophisticated for the weekend.
- Graphics/polish competing with simulation correctness.
- Similarity to common “build a spacecraft under budget” educational games.

## Scorecard

| Dimension | Score / 10 | Comment |
|---|---:|---|
| Team fit | 7.0 | Implementable, but game/systems-domain expertise is limited. |
| AI/data leverage | 5.0 | AI is secondary. |
| GIS/EO leverage | 2.0 | Not relevant. |
| 48h feasibility | 7.0 | Feasible only with one narrow mission scenario. |
| Demo/story impact | 9.0 | Game is naturally engaging. |
| NASA-data centrality | 7.0 | Depends on how much official mission/component data is used. |
| Differentiation ceiling | 7.0 | Requires exceptional game design or simulation depth to stand out. |

## Recommendation

**Viable fallback, not a preferred NeuraX challenge.** It is attractive if the team wants a fun, highly interactive educational product. For a research-oriented AI/data team, the Earth-observation and analysis challenges provide stronger differentiation and better post-hackathon continuation potential.
