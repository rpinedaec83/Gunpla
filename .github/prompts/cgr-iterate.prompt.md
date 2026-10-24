---
name: "CGR Iterate And Improve"
description: "Use when CGR-results and score artifacts exist and you want to iteratively improve MRD, PRD, and ESD quality."
argument-hint: "Optional focus rules, target score, or stage gate"
agent: "agent"
---

Iterate governance documents using the latest CGR and score outputs.

Before asking the user for credentials, tokens, keys, or other secret values, check `secrets.md` at the repository root first if it exists. Do not place secrets in any other file by default. If the user explicitly requests an override, warn about commit and leakage risk first, then proceed only after confirmation.

Use committed `accounts.md` only for non-secret cloud account and destination context. Do not copy credentials, keys, tokens, or other secrets into governance artifacts.

Use these files as the baseline:
- [Source of truth](../copilot-instructions.md)
- [ATLAS process](../../ATLAS.md)
- [Project stages](../../docs/cgr/PS.md), only if formal stages are in use
- [Governance prompt baseline](./cgr.prompt.md)
- [CGR docs guidance](../../docs/cgr/README.md)
- Current CGR review output (`docs/cgr/CGR-results.md`), if it exists
- [Current score output](../../docs/cgr/score.md), if it exists
- [Remediation tracker](../../docs/cgr/remediation-tracking.md), if it exists
- [Seed and reference sources](../../seed.md), [Reference docs folder](../../docs/reference/README.md)
- [Project accounts](../../accounts.md), if it exists

Perform this workflow in order:

1. Assess current state.
- Read live MRD, PRD, and ESD artifacts in `docs/cgr/`.
- Read `CGR-results.md` and `score.md` if present.
- Identify unresolved gaps and prioritize Critical and High items.

2. Refresh discovery and evidence.
- Read project source materials first.
- If network access is available, perform external market and competitor research for the target product category.
- Capture new or changed market facts, competitor alternatives, differentiation signals, adoption barriers, public pricing or monetization signals, and source confidence.
- Classify evidence as `Source Fact`, `Project Inference`, `External Best Practice`, or `Owner Required`.
- Mark reasoned project inferences with `[DRAFT INFERENCE]` and a one-line basis note.
- Do not invent approvals, owners, pricing decisions, contracts, customer commitments, vendor support terms, or production readiness claims.

3. Apply targeted improvements.
- Update MRD, PRD, and ESD content to close the highest-priority gaps first.
- Keep edits specific and traceable to rule-level findings.
- Improve MRD market research, competitive awareness, differentiation, market sizing or demand proxy, adoption barriers, and success metrics when those sections are weak.
- Improve PRD engineering readiness by adding requirement IDs, priorities, MRD links, acceptance criteria, verification methods, non-functional requirements, UX states, instrumentation, data and API needs, rollout constraints, supportability, and ESD handoff details.
- Do not invent missing approvals or decisions. Mark unknowns clearly.

4. Refresh traceability.
- Update `docs/cgr/seed-to-docs-mapping.md` when new sources were used.
- Create or update `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md` when enough evidence exists to map market evidence to MRD needs, PRD requirement IDs, ESD sections, and validation evidence.

5. Refresh governance outputs.
- Re-run CGR evaluation logic from `cgr.prompt.md`.
- Update `docs/cgr/CGR-results.md` with new compliance status.
- Update `docs/cgr/score.md` with score delta and updated gate recommendation.
- Include market research quality, competitive awareness, differentiation clarity, PRD engineering readiness, and traceability completeness findings.

6. Update remediation tracker.
- Refresh `docs/cgr/remediation-tracking.md` with status changes, owners, and target dates.
- Record exceptions only when justified and include expiry dates.

7. Prepare next iteration.
- State remaining blockers to the target stage gate.
- Recommend the next focused iteration scope.

Respond with this structure:

Iteration Status: Improved or No Significant Change

Score Delta:
- Previous score, current score, and delta.

Closed Gaps:
- List the most important gaps closed in this iteration.

Remaining Priority Gaps:
- List unresolved Critical and High gaps.

Next Iteration Scope:
- State the next concrete remediation focus.

If the user supplied extra scope below, prioritize it while still completing this workflow:

$ARGUMENTS
