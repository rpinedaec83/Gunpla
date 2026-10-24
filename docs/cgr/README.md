# CGR Docs

Use this folder for governance-facing project planning and design documents.

## What CGR Means

CGR means Compliance and Governance Review.

A CGR is a structured review of live project artifacts such as MRD, PRD, and ESD documents to verify governance readiness, delivery controls, and release decision quality.

To run CGR, type `CGR` in AI chat. You can also say `run CGR`. The agent should use `.github/prompts/cgr.prompt.md` and write the review to `docs/cgr/CGR-results.md`.

## Why CGR Matters

- It creates a repeatable quality gate before major release movement.
- It exposes gaps in scope, ownership, security, operations, and rollback readiness early.
- It reduces avoidable rework by forcing document and decision alignment before execution risk grows.
- It provides an auditable review output (`CGR-results.md`) that records findings and remediation.

Recommended files:
- `MRD_<PROJECT>_v1.md`
- `PRD_<PROJECT>_v1.md`
- `ESD_<PROJECT>_v1.md`
- `CGR-results.md`
- `score.md` (optional, derived from `CGR-results.md` scoring extension)
- `seed-to-docs-mapping.md` (required during bootstrap, maps seed, reference, project source files, and external research to MRD PRD ESD sections)
- `remediation-tracking.md` (optional, tracks rule-level remediation across iterations)
- `MRD-PRD-ESD-TRACEABILITY.md` (strongly recommended, maps market evidence and MRD needs to PRD requirement IDs, ESD design inputs, and validation evidence)
- ADRs, roadmaps, decision logs, or governance records as needed

Starter docs are included in this folder to help bootstrap a new project. On the first CGR run, remove `MRD_TEMPLATE.md` and `PRD_TEMPLATE.md` if they are still present. In all cases, once a live MRD, PRD, or ESD artifact exists, remove the matching `*_TEMPLATE.md` file so this folder contains live project artifacts only.

Keep `CGR-results.md` in this folder alongside the live MRD, PRD, and ESD artifacts for the project being reviewed.

When external references are needed to fill quality gaps, prefer a balanced source policy:
- standards and requirement language clarity references,
- systems security and engineering rigor references,
- well-architected non-functional design references,
- product artifact structure references.

Always prioritize project source materials over external assumptions.

CGR bootstrap and improvement runs should use external market and competitor research when network access is available. Public research can support market awareness, competitor comparison, differentiation, requirement quality, and acceptance criteria. It must not replace project facts or be used to invent approvals, owners, pricing decisions, contracts, customer commitments, vendor support terms, or production readiness claims.

Use these evidence grades in generated docs and findings:
- `Source Fact` -- directly supported by project files.
- `Project Inference` -- reasoned from project files, marked with `[DRAFT INFERENCE]` and a basis note.
- `External Best Practice` -- supported by public references, with source and access date.
- `Owner Required` -- facts only the project owner can confirm.

MRDs should be market-aware and include market research, target segments, personas, alternatives, competitive analysis, differentiation, market sizing or demand proxy, business value, adoption barriers, and measurable success metrics.

PRDs should be engineering-ready and include requirement IDs, priorities, source MRD links, acceptance criteria, verification methods, non-functional requirements, UX states, instrumentation, data and API needs, dependencies, rollout constraints, supportability, and an engineering handoff for ESD.

If your team uses numeric governance scoring, keep `score.md` in this folder as a derived artifact that references the latest `CGR-results.md`.

## Bootstrap Workflow From Seed, Reference, And Source Inputs

Use this when live MRD, PRD, and ESD docs do not exist yet.

1. Use prompt `.github/prompts/cgr-seed-to-cgr.prompt.md`.
2. Read `seed.md`, relevant files under `docs/reference/`, and relevant project source files such as marketing copy, website text, product notes, sales material, specifications, discovery notes, or other text-readable context.
3. Perform external market and competitor research when network access is available.
4. Generate draft docs in `docs/cgr/`.
5. Update `seed-to-docs-mapping.md` to show evidence sources, source confidence, external research, and missing inputs.
6. Create or update `MRD-PRD-ESD-TRACEABILITY.md` when enough evidence exists.
7. Run CGR and produce `CGR-results.md`, including research quality, competitive awareness, PRD engineering readiness, and traceability findings.
8. If scoring is enabled, refresh `score.md`.

## Iteration Workflow Using CGR Results And Score

Use this after the first CGR output exists.

1. Use prompt `.github/prompts/cgr-iterate.prompt.md`.
2. Read current MRD, PRD, ESD plus `CGR-results.md` and `score.md`.
3. Prioritize unresolved Critical and High gaps.
4. Refresh market and competitor research when network access is available.
5. Update docs and rerun CGR.
6. Refresh `seed-to-docs-mapping.md`, `MRD-PRD-ESD-TRACEABILITY.md`, `score.md`, and `remediation-tracking.md` as applicable.
7. Repeat until gate targets are met for the intended stage.

## Cross-Document Traceability Workflow

Use `MRD-PRD-ESD-TRACEABILITY.md` to verify that each market problem is linked to:
- market evidence and source confidence,
- PRD goals, requirement IDs, acceptance criteria, and verification methods,
- ESD implementation controls and design sections,
- validation evidence.

This file is especially useful before DVT and PVT gate recommendations.
