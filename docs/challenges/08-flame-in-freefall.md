# 08 — Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data

**Difficulty:** Advanced · Intermediate  
**Subjects:** Space Exploration  
**NeuraX preliminary score:** **8.0/10 — Tier A-**  
**Status:** Summary available; full 2026 brief/resources expected 2026-10-28.

## Confirmed challenge intent

NASA has accumulated decades of microgravity combustion experiments. The challenge asks for an **interactive AI-powered dashboard** that helps users find, summarize, rank, interpret, and turn these results into fire-safety insights for human space exploration.

The currently available NASA challenge page explicitly frames the problem as making a large body of experimental results easier to compare and understand.

Official page:
- https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/

## Why this is attractive for NeuraX

Among all 14 challenges, this is probably the most explicit **AI knowledge-system** challenge. It naturally supports:

- document/data ingestion;
- structured extraction;
- semantic search;
- ranking;
- retrieval-augmented generation;
- evidence-grounded summarization;
- dashboard visualization.

This directly matches Hưng and Việt's AI/data strengths while Hiếu can build the application layer.

However, a generic “upload PDFs → chatbot” submission would be weak. The challenge specifically asks for **fire-safety insight**, so the system needs domain-aware structure and trustworthy provenance.

## NeuraX concept: “MicroFlame Insight Engine”

An evidence-grounded research dashboard that transforms experiment records into comparable “evidence cards.”

### User flow

`ask a fire-safety question → retrieve relevant experiments → rank evidence → compare conditions/results → synthesize insight → show sources and uncertainty`

Example queries:

- Which experiments investigated flame extinction under reduced oxygen?
- How did fuel geometry affect flame behavior in microgravity?
- Which findings are most relevant to spacecraft fire detection/suppression?

The answer should contain **source-linked experimental evidence**, not only prose.

## Candidate data/resources — verify on 2026-10-28

The full resource package is crucial. The current challenge image references a BASS combustion test, and NASA has multiple microgravity combustion research programs/experiment archives, but the exact challenge corpus is not yet confirmed.

Potential resource types may include:

- experiment descriptions and metadata;
- technical reports/publications;
- tabular experimental measurements;
- images/video;
- mission/experiment identifiers;
- NASA fire-safety or combustion knowledge resources.

Do not build an ingestion pipeline around assumed sources until the official corpus is known.

## Recommended AI architecture

### 1. Ingestion and normalization

Convert supplied resources into a common schema:

- experiment ID/name;
- research question;
- fuel/material;
- atmosphere/oxygen/pressure;
- gravity/environment;
- ignition/extinction conditions;
- measured outputs;
- key finding;
- limitations;
- source citation.

### 2. Retrieval

Use hybrid retrieval if feasible:

- keyword/BM25-style search for exact technical terms;
- embedding retrieval for semantic similarity;
- metadata filters for experiment conditions.

### 3. Ranking

Rank experiments by query relevance, evidence quality/metadata match, and possibly recency or directness—**with transparent ranking criteria**.

### 4. Grounded synthesis

LLM output should be generated from retrieved evidence and include citations/experiment IDs. The model should explicitly say when evidence is insufficient or conflicting.

### 5. Comparison view

A side-by-side table of experiment conditions and outcomes may be more valuable than another chatbot pane.

## Technical decomposition

### Data/AI
- parser/ETL;
- metadata extraction;
- document chunking;
- embedding/index;
- retrieval + reranking;
- structured synthesis;
- evaluation dataset.

### Backend
- search/query endpoint;
- experiment detail endpoint;
- comparison endpoint;
- source/citation payload.

### Frontend
- query/search interface;
- ranked evidence list;
- filters;
- experiment comparison;
- “safety insight” summary with source traceability;
- visual charts when numerical data is available.

## 48-hour MVP

1. Ingest a **small, high-quality subset** of the official corpus.
2. Define the experiment schema manually before automating extraction.
3. Build hybrid or semantic retrieval.
4. Create 15–30 benchmark questions with known relevant sources.
5. Add evidence-grounded synthesis with citations.
6. Build a comparison screen for 2–4 experiments.
7. Demo one safety question from query → evidence → synthesis.

## Evaluation — critical for differentiation

A serious AI submission should measure more than “the chatbot looks good.”

Suggested checks:

- retrieval recall@k / hit rate on benchmark questions;
- citation correctness;
- faithfulness of generated claims to retrieved sources;
- metadata extraction accuracy on a sampled set;
- qualitative expert/manual review of ranking;
- explicit abstention when sources do not support an answer.

## Team fit

- **Hưng:** RAG/retrieval design, evaluation, structured extraction, research methodology.
- **Việt:** AI pipeline, ranking, data processing and technical demo.
- **Hiếu:** dashboard/search application and deployment.
- **Tiểu An:** information architecture, user journey, prioritizing what a non-combustion specialist needs to understand.

## Domain gap

Combustion/fire science is a meaningful gap. The team can build the information system, but deciding which experimental variables and findings are important requires careful reading of official material or a mentor.

## Risks

- Building a generic RAG chatbot with little domain structure.
- Hallucinated safety claims.
- Poorly parsed tables/figures/PDFs.
- No objective retrieval/evaluation benchmark.
- Attempting to ingest the entire corpus instead of curating a demonstrable slice.
- “Ranking” evidence using an opaque LLM score with no defensible meaning.

## Scorecard

| Dimension | Score / 10 | Comment |
|---|---:|---|
| Team fit | 9.0 | Excellent AI/software match. |
| AI/data leverage | 10.0 | AI is explicitly central to the challenge. |
| GIS/EO leverage | 2.0 | Not applicable. |
| 48h feasibility | 8.0 | Very feasible if corpus scope is limited. |
| Demo/story impact | 9.0 | Query → evidence → safety insight is easy to demonstrate. |
| NASA-data centrality | 9.0 | NASA experiment corpus is fundamental. |
| Differentiation ceiling | 9.0 | Strong if evaluated and domain-structured; weak if generic RAG. |

## Recommendation

**Best AI-first option for NeuraX.** Keep it in the top shortlist if the team wants to lead with AI rather than geospatial Earth science. The final decision depends heavily on whether NASA's 2026-10-28 resource set provides a coherent, accessible combustion corpus and enough metadata to support credible evaluation.
