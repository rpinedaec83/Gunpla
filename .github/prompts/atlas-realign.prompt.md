---
name: "ATLAS Realignment Check"
description: "Use when the repo may have drifted from ATLAS and you want a health check, readiness review, and minimal realignment plan."
argument-hint: "Optional focus area, question, or repo concern"
agent: "agent"
---

Review this repository for ATLAS alignment and drift.

Before asking the user for credentials, tokens, keys, or other secret values, check `secrets.md` at the repository root first if it exists. Do not place secrets in any other file by default. If the user explicitly requests an override, warn about commit and leakage risk first, then proceed only after confirmation.

For cloud, hosting, infrastructure, deployment, or provider CLI concerns, check committed `accounts.md` first if it exists. Treat it as non-secret account and destination binding. Do not move account binding details into `secrets.md`.

Use these files as the baseline:
- [Source of truth](../copilot-instructions.md)
- [ATLAS process](../../ATLAS.md)
- Active stack pattern (`patterns/stack-patterns/active-stack-pattern.md`), only if the file exists and the review touches architecture, hosting, deployment, infrastructure, or platform selection
- Active UX pattern (`patterns/ux-patterns/active-ux-pattern.md`), only if the file exists and the review touches layout, navigation, page hierarchy, interaction flow, or UI generation
- [Project accounts](../../accounts.md), only if the review touches cloud, hosting, infrastructure, deployment, or provider account binding
- [Claude pointer](../../CLAUDE.md)
- [Agents pointer](../../AGENTS.md)
- [Current status](../../docs/agile/status.md)
- [Active cycle](../../docs/agile/devcycle.md)
- [Backlog](../../docs/agile/backlog.md)
- [Retrospective log](../../docs/agile/retro.md)
- [Project stages](../../docs/cgr/PS.md), only if formal stages are in use
- [Governance review](./cgr.prompt.md), only if governance review is in scope

Perform this review in order:

1. Confirm the ATLAS instruction stack is coherent.
- Verify `.github/copilot-instructions.md` is the source of truth.
- Verify `CLAUDE.md` and `AGENTS.md` still point back to the source of truth and have not drifted materially.
- Verify startup, launch, and sign-off behaviors are present and still match the intended workflow.
- If the review touches architecture, hosting, deployment, infrastructure, or platform selection and `patterns/stack-patterns/active-stack-pattern.md` exists, treat it as the current stack baseline and call out drift from it.
- If the review touches layout, navigation, page hierarchy, interaction flow, or UI generation and `patterns/ux-patterns/active-ux-pattern.md` exists, treat it as the current UX baseline and call out drift from it.

2. Confirm the repository structure still matches the intended ATLAS layout.
- Check for the expected root files.
- Check `docs/agile/`, `docs/cgr/`, `docs/reference/`, `patterns/`, `scripts/`, and `archive/`.
- Check `.github/skills/<name>/SKILL.md` if workspace skills are in use.
- Call out stale `*_TEMPLATE.md` files left in `docs/cgr/` after live project artifacts exist.
- Call out anything missing, duplicated, misplaced, or stale.

3. Confirm the active delivery documents are healthy.
- If the agile docs still contain placeholder scaffold content, treat the repository as a reusable kit or template unless there is clear evidence it is a live project.
- In scaffold or template mode, evaluate whether the example docs are coherent and adoption-ready instead of requiring live project state.
- `status.md` should reflect the current live state.
- `devcycle.md` should contain active work only.
- Completed work should be captured in `retro.md`, not left in the active burn-down.
- `backlog.md` should hold future work, not current execution detail.
- Smoketest expectations should use CLI commands or scripts.
- Every task should have a `UAT:` section. If user validation is not needed, it should explicitly say `Not UAT-eligible` and name the internal validation.
- If `patterns/stack-patterns/active-stack-pattern.md` says API-first mode is enabled, every DT or RDT should include an API result when feasible and a smoketest that verifies API endpoints plus OpenAPI or Swagger docs when feasible. If it says API-first mode is disabled, do not require API-first outputs unless the task itself calls for API work.

4. Check current readiness against ATLAS.
- Are we ready to begin the next task?
- Are we ready to pause or close the session cleanly?
- Are there obvious blockers, stale docs, missing CLI or script smoketests, missing `UAT:` sections or non-UAT notes, missing task-level commits, missing required GitHub follow-up when a remote exists, or unfinished closeout steps?
- In scaffold or template mode, answer readiness in terms of template integrity, installer readiness, and adoption readiness.

5. Realign if needed.
- Make minimal, unambiguous fixes directly.
- For opinionated, project-specific, or risky changes, explain the issue and ask before editing.
- Prefer the smallest set of changes that restores alignment.

Respond with this structure:

ATLAS Health: Green, Yellow, or Red

Findings:
- List the most important drift, readiness, or documentation issues first.

Recommended Fixes:
- List the minimal changes needed to restore alignment.

API Result Coverage:
- State one of: Pass, Partial, Not Applicable.
- If Pass or Partial, list which DT or RDT entries had API results and whether smoketests verified endpoints plus OpenAPI or Swagger docs when feasible.
- If Not Applicable, state why no API result was feasible.

Next Step:
- State the single best next action using the ATLAS dev cycle.

GitHub Follow-Up:
- State whether a required push or pull request update is still pending for the current completed task. If no remote exists or no GitHub step is required, say so.

If the user supplied extra scope below, prioritize it while still completing the ATLAS review:

$ARGUMENTS