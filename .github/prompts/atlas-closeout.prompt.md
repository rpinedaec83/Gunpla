---
name: "ATLAS Closeout Check"
description: "Use when ending a work session and you want to confirm ATLAS closeout, documentation state, and git or GitHub follow-up status."
argument-hint: "Optional session goal, completed task, or scope"
agent: "agent"
---

Review this repository for end-of-session ATLAS closeout readiness.

Before asking the user for credentials, tokens, keys, or other secret values, check `secrets.md` at the repository root first if it exists. Do not place secrets in any other file by default. If the user explicitly requests an override, warn about commit and leakage risk first, then proceed only after confirmation.

For cloud, hosting, infrastructure, deployment, or provider CLI concerns, check committed `accounts.md` first if it exists. Treat it as non-secret account and destination binding. Do not move account binding details into `secrets.md`.

Use these files as the baseline:
- [Source of truth](../copilot-instructions.md)
- [ATLAS process](../../ATLAS.md)
- Active stack pattern (`patterns/stack-patterns/active-stack-pattern.md`), only if the file exists and the session touched architecture, hosting, deployment, infrastructure, or platform selection
- Active UX pattern (`patterns/ux-patterns/active-ux-pattern.md`), only if the file exists and the session touched layout, navigation, page hierarchy, interaction flow, or UI generation
- [Project accounts](../../accounts.md), only if the session touched cloud, hosting, infrastructure, deployment, or provider account binding
- [Claude pointer](../../CLAUDE.md)
- [Agents pointer](../../AGENTS.md)
- [Current status](../../docs/agile/status.md)
- [Active cycle](../../docs/agile/devcycle.md)
- [Backlog](../../docs/agile/backlog.md)
- [Retrospective log](../../docs/agile/retro.md)

Perform this review in order:

1. Check whether the current work appears to follow ATLAS.
- If the agile docs still contain placeholder scaffold content, treat the repository as a reusable kit or template unless there is clear evidence it is a live project.
- In scaffold or template mode, do not treat placeholder agile docs as closeout failures by themselves.
- If the session touched architecture, hosting, deployment, infrastructure, or platform selection and `patterns/stack-patterns/active-stack-pattern.md` exists, confirm the current repo state still matches it or call out the variance.
- If the session touched layout, navigation, page hierarchy, interaction flow, or UI generation and `patterns/ux-patterns/active-ux-pattern.md` exists, confirm the current repo state still matches it or call out the variance.
- Look for missing CLI or script smoketest confirmation.
- Look for missing required DT or RDT commits when work appears completed.
- Look for missing `UAT:` sections, missing UAT handoff for user-facing work, or missing explicit `Not UAT-eligible` notes for internal work.
- Look for missing required GitHub follow-up when a remote exists.
- If `patterns/stack-patterns/active-stack-pattern.md` says API-first mode is enabled, verify each completed DT or RDT includes an API result when feasible and a smoketest that verifies API endpoints and OpenAPI or Swagger docs when feasible. If it says API-first mode is disabled, do not require API-first outputs unless the task itself calls for API work.
- Look for completed work still left in `devcycle.md`.
- Look for work that should have been recorded in `retro.md`.
- Look for shipped or current-state changes that should be reflected in `status.md`.

2. Check session closeout readiness.
- Confirm whether the repo appears ready to pause or close for the session.
- Call out any unfinished closeout steps clearly and briefly.
- If the docs are placeholders or stale, say so directly.
- In scaffold or template mode, describe closeout readiness in terms of kit integrity and whether the changed template files are internally consistent.

3. Realign if needed.
- Make minimal, unambiguous fixes directly.
- For project-specific, ambiguous, or risky updates, explain the gap and ask before editing.

Respond with this structure:

Closeout Status: Ready or Not Ready

Findings:
- List the most important closeout gaps first.

Required Before Pause:
- List only the items that should be completed before the session ends.

API Result Coverage:
- State one of: Pass, Partial, Not Applicable.
- If Pass or Partial, list which DT or RDT entries had API results and whether smoketests verified endpoints plus OpenAPI or Swagger docs when feasible.
- If Not Applicable, state why no API result was feasible.

GitHub Follow-Up:
- State whether a required push or pull request update is still pending. If no remote exists or no GitHub step is required, say so.

If the user supplied extra scope below, prioritize it while still completing the ATLAS closeout review:

$ARGUMENTS