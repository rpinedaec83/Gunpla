# ATLAS -- Development Process

ATLAS, the AI Task Lifecycle Automation System, is the default development process for atlas_ai. It provides a structured, repeatable operating model for AI-assisted software delivery by defining how work moves from selection through implementation, validation, handoff, documentation, and closeout. The process is intended to improve consistency, accountability, and delivery quality across human-and-agent collaboration.

This document defines the day-to-day working process teams follow, including the task lifecycle, effort model, documentation expectations, and delivery rules. It is not a broad strategic framework. It is the operational standard intended to be copied into repository roots and adapted only where a repository has a clearly different operating model.

## atlas_ai Intent

This file defines the reusable default development process for atlas_ai. It is meant to be copied into a repository root and adapted only where the repository has a clearly different operating model.

Keep the process stable. Customize project names, paths, tools, and integration commands in repo-specific docs, not in the base kit.

## Table of Contents

- [Dev Cycle Loop](#dev-cycle-loop)
- [Quality and Delivery Gates](#quality-and-delivery-gates)
- [Smoketest Rules](#smoketest-rules)
- [UAT Rules](#uat-rules)
- [Recommended Doc Structure](#recommended-doc-structure)
- [Project Stages and Required Documents (Optional)](#project-stages-and-required-documents-optional)
- [Rules](#rules)

---

## Dev Cycle Loop

1. Pick the next DT from the active task list, typically `devcycle.md`.
2. Implement the task.
3. Smoke test the change with CLI commands or a script.
4. Complete the task's `UAT:` section, either by handing off clear validation instructions or by explicitly recording that the task is not UAT-eligible.
5. Record the outcome in the retrospective log, typically `retro.md`.
6. If the repo uses git, create a small task-level commit for the DT or RDT.
7. If the repository has a GitHub remote, push the branch and complete the task's GitHub follow-up step, typically creating or updating a pull request.
8. Remove the completed task from the active task list and update current-state docs if the repo tracks them.
9. Repeat.

When the active cycle is burned down, close the cycle by confirming validation, review, and documentation are complete. If the repository uses GitHub pull requests, merge the pull request into the base branch, typically `main`, when the dev cycle, phase, or other reviewable task bundle is ready to close. Then pull the next priority from the backlog into a new cycle.

---

## Quality and Delivery Gates

To maintain engineering consistency, architectural integrity, and compliance across human-agent workflows, ATLAS enforces three distinct quality gates throughout the lifecycle:

1. **Requirements Gate (Before Implementation):**
   - Work items must have clear problem statements, target personas, and verifiable acceptance criteria.
   - For formal stages (EVT/DVT), requirements must trace to active MRD or PRD artifacts using `.github/skills/requirements-writing/SKILL.md`.
   - Never implement ambiguous or contradictory requirements without prior clarification.

2. **API-First Contract Gate (Before Coding Endpoints):**
   - When the active stack pattern specifies `API-First: Enabled` or when defining new REST endpoints, author or update the OpenAPI contract in `docs/reference/openapi-starter.yaml` before writing backend logic.
   - All error responses must comply with RFC 7807 Problem Details (`application/problem+json`).
   - Refer to `.github/skills/api-design/SKILL.md` for URI naming, status code, and pagination standards.

3. **Security and Governance Gate (Before Staging / Release):**
   - Verify alignment with NIST CSF 2.0 and CGR Rule 9 (Threat Modeling & Security Review).
   - Ensure zero credentials, keys, or tokens exist in source code or git history.
   - Enforce Managed Identities and Azure Key Vault for cloud secrets, reserving `secrets.md` for local notes.
   - Refer to `.github/skills/security-patterns/SKILL.md` and `docs/reference/secret-handover-ceremony.md`.

---

## Smoketest Rules

Every dev task needs a repeatable smoketest before it can be treated as complete.

- What: a direct verification that the output works against the real target system or a faithful test environment
- How: each task must include a `Smoketest:` section with exact CLI commands or script paths, plus the expected pass signal
- CLI or script only: manual-only validation does not count as a smoketest
- Script preferred: when practical, add a reusable script under `scripts/`
- Separation of concerns: manual user validation belongs in `UAT:`, not `Smoketest:`
- When the active stack pattern says API-first mode is enabled, include API endpoint verification and OpenAPI or Swagger documentation verification when feasible
- Pass/fail: the smoketest must have a clear outcome that can be recorded in the retrospective log
- No skip: if the smoketest fails, the task is still open unless the failure is captured as an explicit blocker
- Every DT and RDT entry must include a `Smoketest:` section
- Full harness coverage (optional): when a repo maintains a standing regression/UAT harness and a DT or RDT changes deployed behavior, add or update rows in that harness and its coverage map before closeout. If no full-harness row is appropriate, record why in the retrospective log.

---

## UAT Rules

Every dev task must include a `UAT:` section in the active task list.

- Use UAT for: user-facing functionality, workflows, UI changes, reports, integrations, and outputs the user must inspect directly
- Use `Not UAT-eligible` for: internal refactors, low-level infrastructure work, maintenance tasks with no user-visible change, or tasks fully closed by the smoketest
- For non-UAT work, the `UAT:` section must explicitly state `Not UAT-eligible` and describe the required internal validation or review
- Process:
  1. Complete the smoketest.
  2. If the task is UAT-eligible, hand off what the user should test, where to look, and expected behavior.
  3. If the task is not UAT-eligible, record the internal validation expectation in the `UAT:` section.
  4. Record pass/fail feedback when UAT is performed.
  5. If issues are found, keep the task open and re-test.

---

## Recommended Doc Structure

These are the default paths this workflow expects. If a repository uses different paths, update the repo-specific instructions to map them clearly.

atlas_ai includes a starter scaffold for these locations. Use it as a bootstrap, then replace placeholder content with project-specific material.

| Doc | Recommended Location | Purpose | When to Update |
|---|---|---|---|
| `devcycle.md` | `docs/agile/` | Active tasks only. Burn-down list. | Remove tasks when done |
| `status.md` | `docs/agile/` | Current live state | After each shipped task |
| `backlog.md` | `docs/agile/` | Future work queue | When scope changes |
| `retro.md` | `docs/agile/` | Detailed record of completed work | After each task |
| `ATLAS.md` | repo root | Development process rules | When process changes |
| `docs/cgr/PS.md` | `docs/cgr/` | Optional project stages and document gates | When the project adopts formal release gates |
| `project-config.json` | repo root | Non-secret project configuration | When infrastructure changes |
| `accounts.md` | repo root | Non-secret cloud account and deployment destination binding | At setup and when cloud destinations change |
| `.atlas/install-manifest.json` | `.atlas/` | New-project installation contract and component catalog | When bootstrap files or options change |
| `.atlas/setup.json` | `.atlas/` | Generated record of new-project setup answers and outcomes | After setup or an intentional component change |
| `MRD_*.md` | `docs/cgr/` | Market or business requirements (optional, see `docs/cgr/PS.md`) | Before PRD, when context changes |
| `PRD_*.md` | `docs/cgr/` | Product requirements and acceptance criteria (optional, see `docs/cgr/PS.md`) | Before EVT, when scope changes |
| `ESD_*.md` | `docs/cgr/` | Engineering design and operations model (optional, see `docs/cgr/PS.md`) | Draft in EVT, complete before DVT |
| `CGR-results.md` | `docs/cgr/` | Governance review output and tracked remediation gaps | After each CGR run |

`devcycle.md` must stay clean. Completed items belong in `retro.md`, not in the active list.

### Directories

| Directory | Purpose |
|---|---|
| `docs/agile/` | Active planning and delivery tracking |
| `docs/reference/` | User-supplied project source material, such as old MRDs, PRDs, specifications, marketing materials, website notes, setup notes, and other context for planning, devcycles, and CGR |
| `docs/cgr/` | MRDs, PRDs, ESDs, ADRs, governance records |
| `patterns/` | Reusable stack and UX baselines, active patterns, template catalogs |
| `scripts/` | Reusable operational and verification scripts |
| `archive/` | Superseded artifacts and one-off outputs, usually gitignored |

---

## Project Stages and Required Documents (Optional)

For projects with formal release gates, signers, and governance reviews, see `docs/cgr/PS.md`. That file defines the four-stage release model (EVT, DVT, PVT, GA) and the required document gates (MRD, PRD, ESD, CGR).

POC work, internal tools, and exploratory development do not need `docs/cgr/PS.md`. The core workflow above is sufficient on its own.

---

## Rules

### Measure of Effort -- MOE

Use Complexity Units, or CU, to estimate decision complexity, unknowns, and dependency risk.

| CU | Meaning | Expected Usage |
|---|---|---|
| 1 | Single known step with little decision risk | Light |
| 2 | Multi-step work with a known path | Light |
| 3 | Multi-step work with minor unknowns or dependencies | Moderate |
| 5 | Research plus implementation with real decision risk | Moderate |
| 8 | High uncertainty, multiple dependencies, likely reshaping during execution | Heavy |

Expected Usage is a rough correlation based on typical CU-to-effort patterns, not a forecast or token estimate. The actual bucket is confirmed qualitatively at task completion using the model-tier-advisor skill's Usage Self-Estimation Method, based on observed signals (tool calls, files touched, turns).

- `CU` means Complexity Unit. It is the scoring unit for effort in this process.
- `CU` replaces the old idea of MOE as mostly human time.
- In an AI-assisted workflow, human time alone is no longer a stable estimate. Work that once took a human an hour may take an agent one minute, while the real effort still depends on prompt quality, review, validation, integration risk, and decision-making.
- `CU` is therefore a combined human-plus-agent delivery measure. It captures complexity, uncertainty, coordination, validation, and decision load across both the human and the agent.
- `eMOE` means estimated Measure of Effort. It is the planned score, expressed in `CU`, when the work is added.
- `aMOE` means actual Measure of Effort. It is the final score, expressed in `CU`, recorded after the work is complete.
- Think of the relationship as: `eMOE` = estimated `CU`, `aMOE` = actual `CU`.
- Example: writing a simple set of functions might have been estimated by human time at 1 hour in a pre-agent workflow, but with an agent it could be generated in 1 minute. The true effort still includes prompting, checking correctness, testing, integration, and deciding whether the result is safe to ship. `CU` is meant to measure that full delivery effort, not just keyboard time.
- If `aMOE` exceeds `eMOE` by 2 or more, capture why.
- Break down 8-CU tasks when practical.

### Model Tier Fit (Advisory)

For AI-assisted workflows, the `eMOE` CU score assigned when a DT or RDT starts can suggest a starting model tier (e.g. Haiku, Sonnet, Opus for Claude; Luna, Terra, Sol for GPT-5.6; mini, base, strong for GitHub Copilot), and the `aMOE` CU score recorded at completion can confirm whether that tier held up. This is advisory only, it never overrides a user's explicit model choice, and it only applies when the active agent is a Claude model, OpenAI Codex/ChatGPT, or GitHub Copilot. When this advisory capability first becomes available for a project that already has active DT/RDT entries in `devcycle.md`, apply the suggestion to every active entry missing it in the same pass, not only the task currently being discussed.

- See the `model-tier-advisor` skill for the per-provider CU-to-tier mapping tables, tier suggestion procedure, and how to consult external benchmarks on-demand.
- Coding agents cannot query their own live token count mid-session. Do not report an exact token figure as if read from an API. Use a qualitative usage estimate instead (e.g. Light, Moderate, Heavy) based on observable signals such as tool-call count, files touched, and turns, and point users to the host tool's own usage feature (e.g. Claude Code's `/cost` command or status line) for precise numbers.
- Recording `Usage:` and `Model Fit:` in a retro entry is optional. See the Retro Entry Format below.

### Task Lifecycle

- Keep only active work in `devcycle.md`.
- Record completed work in `retro.md`.
- Smoke test with CLI commands or a script before moving on.
- Every DT and RDT must include both `Smoketest:` and `UAT:` sections.
- When the active stack pattern says API-first mode is enabled, every DT and RDT should include an API result when feasible.
- If the repository maintains a full regression/UAT harness (see `docs/agile/testing/`), update its coverage when the task changes deployed behavior, or record in the retrospective log why no update applies.
- Create one small, descriptive commit per completed DT or RDT when the repo uses git.
- If the repository has a GitHub remote, push the branch and complete the corresponding GitHub follow-up after each completed DT or RDT.
- Do not merge to `main` after every DT by default. Merge the pull request when the dev cycle, phase, or other reviewable task bundle is ready to close.

### Definition of Done

By default, a task is done only when:
1. Implementation is complete.
2. The smoketest passes via CLI commands or a script.
3. The `UAT:` section is completed, either with handoff instructions or an explicit non-UAT note.
4. A task-level git commit exists when the repo uses git.
5. If the repository has a GitHub remote, the branch is pushed and the task's GitHub follow-up step is completed or updated.
6. The retrospective log is updated.
7. Current-state documentation is updated if the repo tracks it.
8. The task is removed from the active list.
9. If the repository maintains a full regression/UAT harness, its coverage is added or updated for deployed behavior changes, or the retrospective log records why no full-harness row applies.

Optional repo-specific additions may include tagging, docs sync, deployment notes, or team notifications.

### Reset Tasks

When unplanned work interrupts the current cycle:
1. Add it under a `Reset` section in the active task list.
2. Prefix it as a reset devtask using `RDT`, for example `RDT1`, `RDT2`, and so on.
3. Insert the new `RDT` item ahead of the remaining unfinished planned devtasks.
4. Complete it first.
5. Record it in the retrospective log.
6. Remove it from the active list.
7. Resume the interrupted phase.

Reset devtasks are short, unplanned tasks that unblock or redirect the current devcycle.

### Config-Driven Development

- Store non-secret configuration in a repo config file such as `project-config.json`.
- Store non-secret cloud account binding in `accounts.md`, including subscriptions, resource groups, project IDs, account IDs, regions, zones, and deployment target names.
- Store secrets in environment variables or a secrets manager, never in committed files.
- If local secret notes are needed, use `secrets.md` at repo root and keep it gitignored.
- Scripts should read from config at runtime instead of hardcoding environments, URLs, repo names, or tenant values.
- Before cloud, hosting, deployment, infrastructure, or provider CLI work, check `accounts.md` and adhere to its selected account, subscription, resource group, project, zone, and target values.
- If `accounts.md` is missing or incomplete for cloud work, ask for the missing non-secret destination binding before proceeding.

### CI/CD Toolchain

- Document the repo-specific delivery toolchain in `docs/reference/`.
- Prefer repeatable CLI or pipeline-based operations over manual portal work.
- If a project depends on platform-specific CLIs or APIs, record exact setup and authentication steps in the reference docs.

### Git And GitHub

- Prefer feature branches such as `feature/<topic>`.
- Create at least one small, descriptive commit per completed DT or RDT.
- Include the DT or RDT identifier in the commit message when working from `devcycle.md`.
- If the repository has a GitHub remote, push the active branch after each completed DT or RDT.
- If the repository uses GitHub for review, create or update the related pull request after each completed DT or RDT.
- If no GitHub remote exists, record that blocker in the closeout or retrospective notes rather than silently skipping the step.
- Use `main` as the normal pull request base branch unless the repo defines another base branch.
- Use the active feature, fix, chore, or reset branch as the pull request head branch.
- Merge the pull request to `main` when the relevant dev cycle, phase, or task bundle is ready to close, after required status checks and review are complete.
- Never force-push protected branches.

### Repo Hygiene

- Archive superseded artifacts instead of leaving them mixed with active work.
- Keep the top level clean.
- Put long-lived references in `docs/reference/`.
- Keep one concern per folder where practical.
- For prompt-driven new-project setup, enforce the root allowlist in `.atlas/install-manifest.json`, preserve pre-existing root material under `docs/reference/preexisting-root/`, and require Atlas validation before setup completion.

### Retro Entry Format

Each completed task entry in `retro.md` can follow this structure:

```
## Session -- YYYY-MM-DD | Goal: <one-line goal>
Start: HH:MM | End: HH:MM | Duration: Xh Ym

### <DT or RDT ID> -- <Task Name> | eMOE: X CU | aMOE: Y CU
What was done: ...
Issues hit: ...
Decisions made: ...
Lessons learned: ...
Usage: <Light|Moderate|Heavy> -- self-estimated (optional, see model-tier-advisor skill)
Model Fit: <tier suggested at start> vs <tier actually used>; <matched|escalated|downgraded> (optional, see model-tier-advisor skill)
```

`Usage:` and `Model Fit:` are optional additions from the `model-tier-advisor` skill. They apply only when working with a Claude, Codex/ChatGPT, or Copilot model and never block Definition of Done.

### Time Tracking For aMOE Analysis

- Record session start and end times.
- Use commit timestamps as a secondary signal if helpful.
- Review CU-to-hours ratio at the end of a phase to calibrate future estimates.

### Repo Secrets And `.gitignore`

- Ignore `.env`, local overrides, generated secrets, and `archive/`.
- Ignore `secrets.md` for local-only secret notes and keep it out of commits.
- Commit `accounts.md` for non-secret cloud destination binding.
- Keep local override patterns explicit, such as `project-config.local.json`.
- Store CI/CD secrets in the platform secret store, not in committed files.

### Incidents And Outages

- Record resolved incidents in `retro.md`.
- Remove resolved incident tasks from the active list.
- Store supporting evidence in `docs/reference/` if needed.

### AI Instruction Files

- `.github/copilot-instructions.md` is the source of truth.
- `.atlas/install-manifest.json` is the source of truth for new-project install groups, setup questions, allowed root entries, and pattern catalogs.
- `CLAUDE.md` is a thin pointer plus duplicated response rules.
- `CHATGPT.md` is a default thin pointer for ChatGPT-oriented coding workflows.
- `AGENTS.md` is the equivalent thin pointer for Codex-style agents and related tooling.
- `GEMINI.md`, `GROK.md`, and `DEEPSEEK.md` are optional hosted-LLM pointers.
- Keep the pointers thin so they do not drift from the source of truth.

### Credential Security

- Never commit credentials, tokens, or client secrets.
- Verify ignored local config patterns before pushing.
- Prefer scoped permissions over broad ones.
- Document approval steps for privileged access requests in the retrospective log or runbook.
