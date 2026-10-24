---
name: model-tier-advisor
description: 'Suggest which model tier (Haiku, Sonnet, Opus for Claude; Luna, Terra, Sol for GPT-5.6; mini/base/strong for Copilot) fits a dev task based on eMOE complexity, and produce a self-estimated usage summary for completed tasks. Use when starting or completing DT/RDT, when the user asks about model choice or token usage, or when an atlas refresh models command runs. Supports Claude Code, OpenAI Codex/ChatGPT, and GitHub Copilot model selection.'
argument-hint: 'Optional DT/RDT ID, eMOE CU value, or "refresh" for a benchmark update'
---

# Model Tier Advisor

## When to Use

- Starting a DT or RDT and `eMOE` (CU) has just been assigned or confirmed
- Completing a DT or RDT and `aMOE` (CU) is being recorded in retro.md
- This skill becomes newly available or newly noticed in a project that already has active DT/RDT entries in `devcycle.md` missing a `Suggested Model` field (backfill scenario -- see below)
- The user asks which model to use, about context size, token cost, or usage for a task
- The user says `atlas refresh models` or `refresh model tiers` to refresh the benchmark tables
- A new-project bootstrap (`newproject`/`atlas project`) installs this skill into a target repo
- An `atlas update` run touches this skill in an existing project
- Reviewing whether a devcycle's tasks are appropriately sized for the active model tier

## Scope And Limits

- This skill applies to the AI tool actually active in the session (identified by which pointer file is in play: `CLAUDE.md` -> Claude Code, `AGENTS.md`/`CHATGPT.md` -> Codex/ChatGPT, `.github/copilot-instructions.md` -> GitHub Copilot). Each tool has its own CU-to-tier mapping table.
- Suggestions are advisory only. Never assume authority to switch models; state the recommendation and let the user or host tool act on it.
- Coding agents, including Claude Code, do not expose a tool call that reads the live token count for the current session. This skill never reports an exact token number. It reports a qualitative usage estimate (Light, Moderate, Heavy) and points to the host tool's own usage feature for exact figures.
- External benchmark sources (artificialanalysis.ai, ockbench.github.io) are consulted on-demand only, not on every task start. See the refresh trigger conditions below.

## Procedure

### At Task Start (Suggesting a Tier)

1. Read the task's `eMOE: X CU` value from `docs/agile/devcycle.md`.
2. Identify which AI tool is active by checking which pointer file (`CLAUDE.md`, `AGENTS.md`/`CHATGPT.md`, `.github/copilot-instructions.md`) is in play.
3. Look up `X` CU in the appropriate CU-to-Model-Tier table below.
4. State the suggested tier and a one-line reason. Example: "eMOE is 3 CU (multi-step, minor unknowns) -- suggested tier: Claude Sonnet 5." The CU value's Expected Usage column (see ATLAS.md's Measure of Effort table) gives a rough usage ballpark for the task; mention it only if useful context, not as a required addition to every task entry.
5. If the task mixes traits of two CU bands (e.g. mostly mechanical but touching security-sensitive code), say so and suggest the higher tier.
6. Check the table's `Verified` date. If it is more than ~60 days old, or if you believe a named model is deprecated in the host tool's picker, note that and optionally consult the external benchmark sources (see below).
7. Treat the suggestion as advisory. If the model is already fixed for the session, note it for the record instead of repeating it as a requirement.

### Backfilling Pre-Existing Active Tasks

When this skill is applied for the first time in a session and `docs/agile/devcycle.md` has other active DT/RDT entries besides the one currently being discussed that lack a `Suggested Model` field:

1. Apply the same suggestion procedure (read eMOE, look up CU-to-tier table for the active tool, state the suggestion) to every active entry missing the field in the same pass, not only the task named by the user.
2. State each suggestion briefly: task ID, eMOE value, suggested tier, and one-line reason. Example: "DT51 -- 3 CU, suggested tier: GPT-5.6 Terra (minor ambiguity in cross-feature routing)."
3. Note that all suggestions are advisory and can be edited before task start.
4. This backfill only needs to happen once per project (or once per newly-detected gap); once every active entry has a `Suggested Model` field, treat new and future entries the normal single-task way.

### At Task Completion (Usage Report And Model Fit)

1. Estimate usage qualitatively using the Light/Moderate/Heavy buckets below. Do not fabricate a precise token count.
2. State the bucket plus the observable signals behind it. Example: "Usage: Moderate -- approx. 14 tool calls, 5 files touched, 6 conversation turns."
3. Compare the tier suggested at task start against how the task actually played out (aMOE), and note one of: matched, escalated (needed a stronger tier than suggested), or downgraded (a lighter tier would likely have sufficed).
4. Point the user to the host tool's own precise usage feature when one exists (e.g. Claude Code's `/cost` command or its status line), rather than reproducing an exact token figure here.
5. If the repo's retro entry format includes them, add the `Usage:` and `Model Fit:` lines shown in ATLAS.md's Retro Entry Format. These are optional and never block task closeout.

## CU-to-Model-Tier Mapping

### Claude (verified 2026-08-06)

| CU | Meaning | Suggested Tier | Rationale |
|---|---|---|---|
| 1 | Single known step, little decision risk | Haiku 4.5 | Fast, low-cost tier is sufficient for mechanical, low-risk steps |
| 2 | Multi-step, known path | Haiku 4.5 | Still a known path; escalate to Sonnet 5 if touching shared or sensitive code |
| 3 | Multi-step, minor unknowns or dependencies | Sonnet 5 | Enough ambiguity and cross-file reasoning to warrant a stronger default |
| 5 | Research plus implementation, real decision risk | Sonnet 5 | Real decision risk; escalate to Opus 5 if research spans multiple subsystems or the decision is architectural |
| 8 | High uncertainty, multiple dependencies, likely reshaping | Opus 5 | Highest uncertainty and dependency load benefits from the strongest reasoning tier |

### OpenAI Codex/ChatGPT (verified 2026-08-06 | GPT-5.4 retiring 2026-08-31)

| CU | Meaning | Suggested Tier | Rationale |
|---|---|---|---|
| 1 | Single known step, little decision risk | GPT-5.6 Luna | Lightweight volume tier for mechanical steps; fallback: GPT-5.4 mini while available |
| 2 | Multi-step, known path | GPT-5.6 Luna | Known path still fits the volume tier; escalate to Terra if touching shared or sensitive code |
| 3 | Multi-step, minor unknowns or dependencies | GPT-5.6 Terra | Minor ambiguity warrants the balanced mid tier; fallback: GPT-5.4 |
| 5 | Research plus implementation, real decision risk | GPT-5.6 Terra | Real decision risk; escalate to Sol if research spans multiple subsystems or the decision is architectural |
| 8 | High uncertainty, multiple dependencies, likely reshaping | GPT-5.6 Sol | Highest uncertainty and dependency load benefits from the flagship reasoning tier |

### GitHub Copilot (verified 2026-08-06 | Multi-vendor roster changes monthly)

| CU | Meaning | Suggested Tier | Rationale |
|---|---|---|---|
| 1 | Single known step, little decision risk | mini/fast tier | Examples: GPT-5 mini, Claude Haiku 4.5. Use whichever "mini" or fast model is currently in the picker. Fallback to the base model if no fast variant is available. |
| 2 | Multi-step, known path | mini/fast tier | Still a known path; escalate to the base tier if touching shared or sensitive code |
| 3 | Multi-step, minor unknowns or dependencies | base/default tier | Minor ambiguity warrants the designated base model. Examples: GPT-5.3-Codex, Claude Sonnet 4.6. Use whichever model Copilot marks as the default or baseline. |
| 5 | Research plus implementation, real decision risk | base/default tier | Real decision risk; escalate to the strongest tier if research spans multiple subsystems or the decision is architectural |
| 8 | High uncertainty, multiple dependencies, likely reshaping | strongest available tier | Use the strongest model currently available in Copilot's picker (typically Claude Opus, GPT-5.4 or later, or the latest model for the strongest vendor) |

## Staleness Guard

Before stating a specific model name from one of the tables above:
- Note the table's `Verified` date.
- If the host tool's own model picker/docs show that the named model is no longer offered, say so and fall back to describing the tier generically (lightweight/balanced/strongest) rather than asserting a name known to be stale.
- If the table's `Verified` date is more than ~60 days old, consider consulting the external benchmark sources (see below) to refresh the table.

## Usage Self-Estimation Method (No Live Token Meter)

Coding agents cannot call a tool to read their own token usage for the current session. Treat any "usage" reported here as a rough, self-observed estimate, not a metered figure.

| Bucket | Typical signals |
|---|---|
| Light | Roughly 1-10 tool calls, 1-2 files touched, a handful of turns |
| Moderate | Roughly 10-30 tool calls, 3-8 files touched, sustained back-and-forth |
| Heavy | 30+ tool calls, broad file or codebase exploration, long multi-turn troubleshooting, or large files/search results read into context |

When reporting usage:
- State the bucket plus the raw signals that produced it, not a token number.
- If the host tool has its own usage or cost feature (e.g. Claude Code's `/cost` command or status line), say so and point the user there for precise figures.
- Never present an estimated bucket as if it were an exact token count read from an API.

## External Benchmark Sources (On-Demand Refresh)

Two external sources can help keep these tier tables current:

- **[artificialanalysis.ai](https://artificialanalysis.ai/leaderboards/models)** publishes a cross-provider leaderboard with Intelligence Index scores, price per million tokens, output speed, and context window across 250+ models from OpenAI, Anthropic, Google, and others. Use this to cross-check a tier assignment or find the closest available replacement when a named model is deprecated.
- **[ockbench.github.io](https://ockbench.github.io/)** measures token-efficiency (accuracy achieved per decoding token) for reasoning and coding tasks. Use this when the choice within a tier is cost- or context-sensitive rather than purely capability-sensitive.

Consult these sources only on the following triggers:
- The table's `Verified` date is more than ~60 days old.
- A named model is confirmed unavailable in the host tool's picker (staleness guard has activated).
- The user explicitly asks for a current/justified recommendation, e.g. "why this model?" or "what's the latest?"
- This skill is being freshly installed by a new-project bootstrap (`newproject`/`atlas project`).
- This skill is being touched or updated by an `atlas update` run.
- The user says `atlas refresh models` or `refresh model tiers`.

Do NOT consult these sources automatically on every task start. If web-fetch tools are unavailable in the host environment (e.g. an offline bootstrap), skip the live refresh, keep the shipped table values, and note in the install/update summary that a refresh is recommended once network access is available.

## Rules

- Suggestions are advisory only, never a blocking gate on starting or completing a task.
- Never report an exact token count; always self-estimate qualitatively.
- Always check the `Verified` date before stating a specific model name, and prefer the host tool's live picker (or the external benchmark sources, on the trigger conditions above) over a stale table entry.
- Keep the CU meanings in each table identical to ATLAS.md and devcycle-management; if they drift, treat ATLAS.md as authoritative and fix this file.
- The CU-linked Expected Usage bucket is a rough correlation defined once on the CU scale table, not a per-task estimate to restate in devcycle.md; never present it as a token forecast.
- `Usage:` and `Model Fit:` retro lines are optional; omitting them does not block Definition of Done in ATLAS.md.
- When the active agent is not Claude, Codex/ChatGPT, or Copilot (e.g. Gemini, Grok, DeepSeek), say "tier mapping not yet verified for this tool" rather than inventing model names.
- Before asking the user for credentials, tokens, keys, or other secret values, check `secrets.md` at the repository root first if it exists.
- Do not place secrets in any other file by default; if the user requests an override, warn first and proceed only after confirmation.
