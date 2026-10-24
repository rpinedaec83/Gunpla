---
name: "CGR Bootstrap From Seed"
description: "Use when MRD, PRD, and ESD drafts are needed from seed, reference, or project source inputs, then run CGR and optional scoring outputs."
argument-hint: "Optional project name, scope, stage target, or constraints"
agent: "agent"
---

Create or refresh governance drafts from startup inputs, then run CGR review outputs.

This workflow can run in a brand-new project folder that has not installed the full Atlas kit yet. If `docs/cgr/` does not exist, create it in the target project root and write the generated governance artifacts there.

Before asking the user for credentials, tokens, keys, or other secret values, check `secrets.md` at the repository root first if it exists. Do not place secrets in any other file by default. If the user explicitly requests an override, warn about commit and leakage risk first, then proceed only after confirmation.

Use committed `accounts.md` only for non-secret cloud account and destination context. Do not copy credentials, keys, tokens, or other secrets into governance artifacts.

Use these files as the baseline:
- [Source of truth](../copilot-instructions.md)
- [ATLAS process](../../ATLAS.md)
- [Project stages](../../docs/cgr/PS.md), only if formal stages are in use
- [Governance prompt baseline](./cgr.prompt.md)
- [CGR docs guidance](../../docs/cgr/README.md)
- [Seed input](../../seed.md), if it exists
- [Project accounts](../../accounts.md), if it exists
- [Reference docs folder](../../docs/reference/README.md)
- [CGR scorecard template](../../docs/cgr/score.md), if it exists

Perform this workflow in order:

1. Collect source material.
- Read `seed.md` if present. Treat it as freeform input, not a required template. It may be as short as a single plain-language sentence.
- Read all relevant materials under `docs/reference/` if it exists.
- Read relevant source files already in the project root or obvious source-material folders, including marketing copy, website content, product notes, sales notes, pitch decks converted to text or markdown, specifications, discovery notes, customer notes, README files, and other text-readable project context.
- Read existing live docs in `docs/cgr/` if they exist.
- Skip `.git`, dependency folders, build output, binaries that cannot be read usefully, secrets, credentials, keys, tokens, and local environment files.
- Identify missing information explicitly instead of inventing it.

2. Build discovery and evidence set.
- Read project source materials first.
- If network access is available, perform external market and competitor research for the target product category.
- Capture product category, target segments, personas, market size assumptions or demand proxies, competitor and alternative-solution matrix, differentiation, adoption barriers, pricing or monetization signals when public, and source confidence.
- Classify evidence as `Source Fact`, `Project Inference`, `External Best Practice`, or `Owner Required`.
- Mark reasoned project inferences with `[DRAFT INFERENCE]` and a one-line basis note.
- Do not invent approvals, owners, pricing decisions, contracts, customer commitments, vendor support terms, or production readiness claims.

3. Build draft governance docs.
- Create or refresh draft artifacts in `docs/cgr/`:
  - `MRD_<PROJECT>_v0-draft.md`
  - `PRD_<PROJECT>_v0-draft.md`
  - `ESD_<PROJECT>_v0-draft.md`
- Use template structure from `MRD_TEMPLATE.md`, `PRD_TEMPLATE.md`, and `ESD_TEMPLATE.md` when available.
- MRD must include market research, target segments, personas, competitive alternatives, differentiation, market sizing or demand proxy, business value, risks, adoption barriers, and success metrics.
- PRD must include requirement IDs, priorities, MRD links, acceptance criteria, verification methods, non-functional requirements, UX states, instrumentation, data and API needs, dependencies, rollout constraints, supportability, and engineering handoff details needed for ESD.
- Infer what you can from available seed, reference, source files, and public research. Keep unresolved details as `TBD` only for owner-required facts.
- Mark unknowns as `TBD` and list clear open questions.

4. Produce source mapping.
- Update `docs/cgr/seed-to-docs-mapping.md` to show which seed, reference, and project source inputs mapped into each MRD, PRD, and ESD section.
- This mapping is required during Bootstrap mode.
- Call out external research sources, source confidence, missing source evidence, and unresolved assumptions.

5. Produce traceability mapping.
- Create or update `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md` when enough evidence exists to map market evidence to MRD needs, PRD requirement IDs, ESD sections, and validation evidence.
- If there is not enough evidence, record the missing traceability inputs in `CGR-results.md`.

6. Run CGR review.
- Apply the governance evaluation process from `cgr.prompt.md` against the generated drafts.
- Write or refresh `docs/cgr/CGR-results.md` using the required baseline output format.
- Include market research quality, competitive awareness, differentiation clarity, PRD engineering readiness, and traceability completeness findings.

7. Produce score output.
- If scoring is in scope, derive and write `docs/cgr/score.md` from `CGR-results.md`.
- Use the scoring extension in `cgr.prompt.md` and capture gate recommendation.

8. Initialize remediation tracking.
- Create or refresh `docs/cgr/remediation-tracking.md` with rule-level gaps, owner placeholders, target dates, and status.
- Prioritize unresolved Critical and High gaps first.

Respond with this structure:

Bootstrap Status: Complete or Partial

Created or Updated Files:
- List generated or changed files in `docs/cgr/`.

Top Gaps:
- List the highest-priority unresolved governance gaps.

Iteration Plan:
- State the next concrete iteration step using `CGR-results.md` and `score.md`.

Open Questions:
- List only information gaps that require user input.

If the user supplied extra scope below, prioritize it while still completing this workflow:

$ARGUMENTS
