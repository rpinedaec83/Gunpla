# atlas_ai

This folder is a reusable AI coding agent process kit for software repositories.

An AI coding agent process kit and agentic workflow scaffold built around ATLAS, the AI Task Lifecycle Automation System.

In current developer terminology, atlas_ai is best described as an agentic workflow scaffold or AI agent instruction scaffold: it installs root-level agent instructions, prompt workflows, and lightweight delivery governance so coding agents can operate consistently in a repository.

It gives you:
- root-level AI instruction files for Copilot, Claude Code, ChatGPT, and Codex-style agents
- reusable ATLAS prompt files for realignment and closeout checks
- a default workflow for task execution and delivery tracking, with per-tool model-tier suggestions and qualitative token-usage tracking
- optional release stages and document gates for formal projects
- optional compliance and governance review prompt
- a starter docs scaffold for active work, backlog, status, retro, project docs, reference docs, stack-baseline guidance, and UX-baseline guidance

## AI Agent Fast Path

If you are an AI coding agent using `picostar/Atlas_AI` as a remote source kit, do this before reading the full README:

1. Identify the requested flow from the user's prompt.
2. For `atlas project`, `newproject`, any request to set up an Atlas project, or a setup request that references `github/picostar/Atlas_AI` or this README, read `.atlas/install-manifest.json` and `atlas_newproject.md`, then ask the required setup questions before changing files.
3. For `atlas update`, read `atlas_update.md`, compare the target project to this kit, and produce a plan before changing files.
4. For `CGR` or `run CGR`, read `.github/prompts/cgr.prompt.md`, bootstrap `docs/cgr/` when needed, and write `docs/cgr/CGR-results.md`.
5. Treat `picostar/Atlas_AI` as a source kit reference. Work in the current target folder in place, do not clone Atlas_AI into a subfolder, and remove any temporary `atlas_ai` or `Atlas_AI` source-kit folder after setup.
6. For new-project setup, write `.atlas/setup.json` and run the required validation gate before reporting success.
7. If the requested flow is unclear, read only the `Start Here` and `Short Prompt Cheatsheet` sections below before asking a clarifying question.

## Start Here

The easiest way to use atlas_ai is prompt-first. Open the target project folder in a repo-aware coding agent, then ask it to use this repository as the source kit. This works best in tools that can read and write your project files and inspect `picostar/Atlas_AI`, such as VS Code with Copilot, Claude Code, Cursor, ChatGPT coding workflows, and similar agents.

VS Code is not required. If your agent cannot access GitHub directly, give it a local path to an Atlas_AI checkout or copy the relevant standalone prompt into the target project.

### New Project Setup

Use this when the folder is new or not already Atlas-managed. Existing files are preserved as reference material, and an existing `.git` folder is adopted.

```text
Use github picostar/Atlas_AI, read README first, and run atlas project here.
```

Natural setup requests such as `set this Atlas project up with github/picostar/Atlas_AI readme.md` invoke the same workflow.

Interpretation: use `picostar/Atlas_AI` as a source kit reference and bootstrap the current folder in place. Do not clone Atlas_AI into a `newproject` subfolder.

Equivalent short form:

```text
newproject
```

The agent should use `.atlas/install-manifest.json` and `atlas_newproject.md`, ask explicit setup questions first (scaffold, git init, PS, CGR, stack, UX, API-first when stack is selected, GitHub repo), preserve existing user files under `docs/reference/preexisting-root/`, install the selected Atlas files into the current target folder, write `.atlas/setup.json`, remove any temporary local source-kit folder such as `atlas_ai` or `Atlas_AI`, initialize or adopt git, and pass Atlas validation.

The run is not complete if it only installs prompt files and reports diagnostics. If that partial state occurs, the agent should ask the missing setup questions and continue to completion.

The setup questionnaire generates stack and UX choices from the manifest catalogs instead of maintaining a second hardcoded list. It accepts a number, manifest ID, or label, not a freeform template filename. If a stack pattern is selected, include an API-first yes or no question and state that API-first expects API results when feasible plus endpoint and OpenAPI or Swagger verification in smoketests when feasible.

Setup is complete only after `pwsh scripts/atlas-validate.ps1 -TargetPath <target>` passes, or the equivalent checks in `atlas_validate.md` pass when terminal execution is unavailable.


### CGR From Marketing Or Source Files

Use this when you have a new folder with marketing copy, website text, product notes, sales material, specs, discovery notes, or similar source files and want governance artifacts created from them.

```text
Use github picostar/Atlas_AI, read README first, and run CGR here
```

The agent should use `.github/prompts/cgr.prompt.md`, create `docs/cgr/` if it does not exist, draft MRD, PRD, and ESD artifacts from the available source files, then write `docs/cgr/CGR-results.md`. It does not need to install the full Atlas kit first.

### Older Atlas Project Update

Use this when the project already has older Atlas files and needs to be brought up to date.

```text
Use github picostar/Atlas_AI, read README first, and run atlas update here
```

The agent should use `atlas_update.md`, compare the older project against the current kit, and produce a plan before making changes. It should not move, rewrite, delete, or migrate files until you approve the plan.

### Quick Rule

- New or not Atlas-managed yet: `atlas project` or `newproject`.
- New folder with marketing or product source files and you want governance docs: `CGR`.
- Older Atlas-managed project: `atlas update`.

### Short Prompt Cheatsheet

Use these short prompts when the agent has no prior Atlas context:

```text
Use github picostar/Atlas_AI as source kit, read README first, then run atlas project here in place, no clone.
Use github picostar/Atlas_AI as source kit, read README first, then run atlas update here.
Use github picostar/Atlas_AI as source kit, read README first, then run CGR here.
```

## What atlas_ai Solves

The main problem with reusable instruction folders is that most AI tools do not reliably auto-load nested files. They usually look at the repository root.

atlas_ai is designed for that reality.

You can keep this folder as your source kit, drop a copy into a new repository, and then install the correct files into the repo root.

## AI Ecosystem Fit

atlas_ai sits one layer above individual AI coding agents. It does not replace Copilot, Claude Code, ChatGPT, Codex-style agents, Gemini, Grok, DeepSeek, or future LLM tools. It gives those tools a consistent repository contract: where to read instructions, how to understand the active task, how to preserve project context, and how to validate work before handoff.

In the current AI development ecosystem, most tools provide the model, chat surface, editor integration, or command execution. atlas_ai provides the project-side operating model those tools can share. It standardizes root instruction files, reusable prompt workflows, task lifecycle docs, governance artifacts, and optional stack and UX baselines so different agents can work from the same map.

That makes atlas_ai closer to an agentic workflow scaffold than a runtime harness. A harness usually drives or measures execution. atlas_ai prepares the repository so agents can orient, execute, smoke test, document, and hand off work consistently across tools.

## Split Repo Layouts

Some repositories keep control docs and AI instruction files at the repo root while the runnable application lives one level down, for example in `web/`, `api/`, or another product folder.

In that layout:
- keep the atlas_ai instruction files at the repo root
- keep MRD, PRD, ESD, and `CGR-results.md` in the existing `docs/cgr/` directory at the repo root
- use the nested application folder for runtime code work only
- only treat a child directory as the effective project root if the repo root has no `docs/cgr/` directory and exactly one immediate child directory does

## AI Dev SOP Summary

ATLAS uses `devcycle`, `devtask`, `reset devtask`, and `retro` because AI-assisted development moves at a different cadence than traditional agile delivery. Classic agile terms like sprint, story, and ceremony often imply multi-day or multi-week planning loops, human-only execution speed, and team rituals that are heavier than a coding-agent workflow needs.

The AI Dev SOP is built for short, repeatable execution loops. A human sets direction, constraints, and acceptance expectations. The coding agent reads the repo instructions, executes one bounded task, validates the result, records what changed, and hands off the next decision point. The process favors small verified increments over large opaque batches.

ATLAS keeps AI-assisted development fast without letting it become loose. The standard operating procedure is:

1. Start from `docs/agile/devcycle.md`, the current active burn-down.
2. Work one development task (`DT`) or reset devtask (`RDT`) at a time.
3. Keep each task small enough to validate, usually 5 CU or less.
4. If a task is larger than 5 CU, split it into sub devtasks such as `DT3.1`, `DT3.2`, and `DT3.3` so each piece has a clear outcome, smoketest, and UAT or non-UAT validation path.
5. Smoke test with CLI commands or scripts before treating the task as complete.
6. Record UAT handoff or explicit non-UAT validation.
7. Commit and push the completed task when the repo uses git and a remote is available.
8. Move completed work into `docs/agile/retro.md` with `eMOE`, `aMOE`, results, decisions, and lessons learned.
9. Remove completed items from `devcycle.md` so the active list stays clean.

Each devcycle should have a visible purpose, a small active task set, and a clear stop condition. It can be as short as a single validated change or as broad as a focused build window. Multiple devcycles per day are normal when the work is flowing, especially when the agent can implement and smoke test quickly.

The definition of done is deliberately operational: the code or docs are changed, the smoketest has passed or a blocker is recorded, UAT is handed off or marked not UAT-eligible, `retro.md` captures the result, and `devcycle.md` no longer carries completed work. This keeps the active loop fast while preserving enough evidence for review, governance, and later CU calibration.

## Chat Shortcuts

Use these short chat phrases when you want the agent to run the standard ATLAS flows:

- `atlas` -- run the startup project check-in flow.
- `hi`, `hello`, `good morning`, `goodmorning`, or `ready to start` -- also run the startup project check-in flow.
- `CGR` or `run CGR` -- run the governance workflow from `.github/prompts/cgr.prompt.md`, bootstrapping `docs/cgr/` from seed, reference, or project source files when needed, and write `docs/cgr/CGR-results.md`.
- `newproject` or `atlas project` -- run the standalone new-project bootstrap prompt, preserving pre-existing user material under `docs/reference/` and adopting `.git` when present.
- `atlas validate` -- validate a new-project installation against `.atlas/install-manifest.json` and `.atlas/setup.json` without changing it.
- `atlas refresh models` or `refresh model tiers` -- refresh the model-tier-advisor skill's CU-to-tier mappings by consulting current benchmarks (artificialanalysis.ai, ockbench.github.io) and update the Verified dates. Useful when tier tables are stale or a model is deprecated.
- `good night`, `goodnight`, `goodbye`, `that's all`, or `we are done` -- run the end-of-session closeout check.

The startup check-in reviews current state, active devcycle work, and obvious blockers. The closeout check reviews smoketest, UAT, retro, status, commit, and GitHub follow-up readiness before the session ends. The model-tier refresh updates per-tool tier recommendations based on current market offerings and token-efficiency benchmarks.

## Included Files

### Root instruction files
- `.github/copilot-instructions.md` -- source of truth for Copilot
- `CLAUDE.md` -- thin pointer for Claude Code
- `CHATGPT.md` -- thin pointer for ChatGPT-oriented workflows
- `GEMINI.md` -- optional thin pointer for Gemini-oriented workflows, not installed by default
- `GROK.md` -- optional thin pointer for Grok-oriented workflows, not installed by default
- `DEEPSEEK.md` -- optional thin pointer for DeepSeek-oriented workflows, not installed by default
- `AGENTS.md` -- thin pointer for Codex-style agents and similar tooling
- `ATLAS.md` -- default development process

### AI governance docs
- `.github/tropes.md` -- writing quality standard, common AI writing tells to avoid
- `.github/TOOLING-ASSUMPTIONS.md` -- capability and tooling assumptions
- `.github/TOOL-CAPABILITY-MATRIX.md` -- portability matrix across agent environments
- `.github/FRONTMATTER-SCHEMA.md` -- prompt and skill metadata contract
- `.github/INSTRUCTION-MAINTENANCE.md` -- instruction update and drift rules

### Core workflow prompts (installed by default)
- `.github/prompts/atlas-realign.prompt.md` -- ATLAS health check and realignment prompt
- `.github/prompts/atlas-closeout.prompt.md` -- ATLAS closeout readiness prompt

### CGR workflow prompts (installed only when CGR is selected)
- `.github/prompts/cgr.prompt.md` -- compliance and governance review workflow
- `.github/prompts/cgr-seed-to-cgr.prompt.md` -- generate draft MRD PRD ESD from seed, reference, or project source material, then run CGR outputs
- `.github/prompts/cgr-iterate.prompt.md` -- iterate and improve governance docs using CGR-results and score

### Standalone root prompts
- `atlas_newproject.md` -- standalone root-level guided new-project bootstrap prompt, kept outside the installed prompt catalog so users can copy it into a target project or say `newproject`
- `atlas_update.md` -- standalone root-level guided legacy atlas update planning prompt, kept outside the installed prompt catalog so users can copy it and say `atlas update` in existing projects
- `atlas_validate.md` -- standalone read-only validator prompt, used automatically after new-project setup and manually through `atlas validate`

### Prompt-First Setup Support
- `.gitignore` -- default ignore patterns for installed projects
- `.atlas/install-manifest.json` -- authoritative install groups, root allowlist, questionnaire fields, skills, and pattern catalogs
- `.atlas/setup.json` -- generated setup receipt in installed projects, containing source revision, answers, outcomes, and relocated root entries
- `scripts/atlas-validate.ps1` -- read-only source-kit and installed-project validator
- `.claude/skills/atlas-newproject/SKILL.md` -- thin Claude discovery router to the shared new-project prompt

### Startup seed file
- `seed.md` -- optional lightweight startup note for new project setup runs. A single plain-language sentence is enough, for example: "I want to create a web app that gets the weather where I click on a map."
- `accounts.md` -- committed non-secret cloud account and deployment destination binding. Keep credentials, keys, tokens, and secrets out of this file.
- `secrets.md` -- local-only secrets note file stored at repo root and ignored by git. Keep credentials and keys here, not in committed files.

This `README.md` is for the kit itself. Use it as the first document an agent reads when using `picostar/Atlas_AI` as a remote source kit.

### Scaffold
- `docs/agile/devcycle.md` -- active burn-down list
- `docs/agile/backlog.md` -- future work queue
- `docs/agile/status.md` -- current live state
- `docs/agile/retro.md` -- completed work log
- `docs/agile/testing/` -- optional regression and UAT harness, for projects whose cross-feature coverage has outgrown the inline `UAT:` field
- `docs/cgr/README.md` -- governance document guidance
- `docs/cgr/PS.md` -- optional project stages and document gates (EVT/DVT/PVT/GA)
- `docs/reference/README.md` -- reference docs guidance
- `patterns/README.md` -- pattern catalog root guidance
- `patterns/stack-patterns/README.md` -- stack baseline guidance
- `patterns/stack-patterns/stack-pattern-templates/` -- reusable Azure stack pattern templates
- `patterns/ux-patterns/README.md` -- UX baseline guidance
- `patterns/ux-patterns/ux-pattern-templates/` -- reusable UX pattern templates
- `scripts/README.md` -- scripts guidance
- `archive/README.md` -- archive guidance

### Skills
- `.github/skills/anti-patterns/SKILL.md` -- design, testing, security, and AI agent failure modes to avoid
- `.github/skills/api-design/SKILL.md` -- contract-first REST API design, OpenAPI 3.1, and RFC 7807 problem details
- `.github/skills/azure-deploy/SKILL.md` -- Azure Functions and SWA deployment procedures
- `.github/skills/code-style/SKILL.md` -- multi-language coding conventions for TypeScript, JavaScript, Python, C#, and PowerShell
- `.github/skills/devcycle-management/SKILL.md` -- DT/RDT task lifecycle, retro logging, CU scoring
- `.github/skills/example-skill/SKILL.md` -- template for creating new skills
- `.github/skills/git-workflow/SKILL.md` -- branch strategy, commit format, PR conventions
- `.github/skills/model-tier-advisor/SKILL.md` -- per-tool model tier suggestion (Claude/Codex/Copilot), qualitative token-usage tracking, external benchmark refresh
- `.github/skills/powershell-style/SKILL.md` -- PowerShell scripting conventions
- `.github/skills/project-setup/SKILL.md` -- new project setup and repo bootstrapping
- `.github/skills/requirements-writing/SKILL.md` -- MRD and PRD authoring quality, market research, requirements traceability
- `.github/skills/security-patterns/SKILL.md` -- NIST CSF 2.0 implementation, secret hygiene, and OWASP defenses
- `.github/skills/testing-patterns/SKILL.md` -- smoketest patterns, unit/integration testing, and mock verification

Skills reference existing kit files (ATLAS.md, copilot-instructions.md) rather than duplicating content. Use `-SkillsSource "path"` to copy skills from another location instead of the defaults.

### Stack pattern support

If a repository has an agreed architecture, hosting, deployment, infrastructure, or platform baseline, capture it in `patterns/stack-patterns/active-stack-pattern.md`.

When that file exists, the atlas_ai instruction stack reads it before stack-sensitive work so architecture changes stay consistent with the repo's approved baseline.

Prompt-driven newproject builds stack pattern choices from `.atlas/install-manifest.json`.
If a template is selected, setup creates `patterns/stack-patterns/active-stack-pattern.md` from that template.

### UX pattern support

If a repository has an agreed layout and navigation baseline, capture it in `patterns/ux-patterns/active-ux-pattern.md`.

When that file exists, the atlas_ai instruction stack reads it before UX-sensitive work so generated UI and page structure stay consistent with the repo's approved baseline.

Prompt-driven newproject builds UX pattern choices from `.atlas/install-manifest.json`.
If a template is selected, setup creates `patterns/ux-patterns/active-ux-pattern.md` from that template.

### API-first policy support

Prompt-driven newproject asks for API-first posture only when a stack pattern is selected, and uses Yes as the default.

When a stack pattern is selected, prompt-driven setup records the selected API-first posture in `patterns/stack-patterns/active-stack-pattern.md`.

When API-first mode is enabled in the active stack pattern, each DT or RDT should produce an API result when feasible, and smoketests should verify API endpoints plus OpenAPI or Swagger docs when feasible. When disabled, API work is still allowed when the task calls for it, but ATLAS closeout should not require API-first results by default.

### Project document templates
- `docs/cgr/MRD_TEMPLATE.md` -- market or business requirements template
- `docs/cgr/PRD_TEMPLATE.md` -- product requirements template
- `docs/cgr/ESD_TEMPLATE.md` -- engineering design template

These are bootstrap files only. On the first CGR run, remove `MRD_TEMPLATE.md` and `PRD_TEMPLATE.md` if they are still present. In all cases, once a live MRD, PRD, or ESD artifact exists, remove the matching `*_TEMPLATE.md` file from `docs/cgr/`.

When a governance review runs, save the output as `docs/cgr/CGR-results.md`.

To run CGR, type `CGR` in AI chat. You can also say `run CGR`. The agent should use `.github/prompts/cgr.prompt.md` and write the review to `docs/cgr/CGR-results.md`. In a new project folder with marketing files, product notes, sales material, specifications, or other source material but no Atlas docs yet, the agent should create `docs/cgr/` and bootstrap MRD, PRD, ESD, and CGR artifacts there.

Optional scoring extension: teams that want numeric governance tracking can derive a scorecard from `docs/cgr/CGR-results.md` and save it as `docs/cgr/score.md`.

For seeded projects, teams can bootstrap governance drafts from `seed.md`, `docs/reference/`, or source files already in the project folder using `.github/prompts/cgr-seed-to-cgr.prompt.md`, then iteratively improve with `.github/prompts/cgr-iterate.prompt.md` using `docs/cgr/CGR-results.md` and `docs/cgr/score.md`. Source files can include marketing copy, website text, product notes, sales material, specifications, discovery notes, or other text-readable project context. `seed.md` can be as small as a one-line project idea.

### What CGR Means And Why It Matters

CGR means Compliance and Governance Review.

In atlas_ai, CGR is a structured governance gate that reviews live project documents for completeness, decision quality, risk controls, and readiness to proceed.

Why this matters:
- It detects documentation and governance gaps before downstream delivery risk increases.
- It aligns product, engineering, security, and operations expectations before release progression.
- It produces a durable review artifact (`docs/cgr/CGR-results.md`) that teams can track and close.

## Recommended Use

### Quick Start -- Point a project at atlas_ai

The simplest way to start a new project with atlas_ai is to open the target project folder in a repo-aware coding agent and point it at `picostar/Atlas_AI` as the source kit. The agent should read this README first, use the relevant prompt from the source kit, and modify the current project in place.

For most new projects, use:

```text
Use github picostar/Atlas_AI as source kit, read README first, then run atlas project here in place, no clone.
```

Prompt-driven setup asks before changing files. It should ask whether to include the docs scaffold, initialize git when needed, include PS, include CGR, select a stack pattern, select a UX pattern, enable API-first when a stack pattern is selected, and create a GitHub repo. It should present stack and UX templates from the install manifest as numbered menus.

If the project root already contains user files, setup preserves and merges manifest-approved root entries and moves every other entry into `docs/reference/preexisting-root/`. If `.git` already exists, setup adopts that repository instead of reinitializing it. If a temporary `atlas_ai` or `Atlas_AI` source-kit folder exists in the target project, remove that temporary folder after the selected files are installed. The setup records these actions in `.atlas/setup.json` and must pass Atlas validation before completion.

### CGR From Remote Source Kit

For a new folder that already contains marketing copy, website text, product notes, sales material, specs, discovery notes, or similar source material, run CGR directly from the remote source kit:

```text
Use github picostar/Atlas_AI as source kit, read README first, then run CGR here.
```

The agent should use `.github/prompts/cgr.prompt.md`, create `docs/cgr/` when needed, bootstrap draft MRD, PRD, and ESD artifacts from available source files, and write `docs/cgr/CGR-results.md`. Installing the full Atlas kit is not required before this CGR path.

### Adding PS Or CGR Later

You can start with core setup and add project stages or governance review later by pointing the agent at the source kit and naming the artifact to add:

```text
Use github picostar/Atlas_AI as source kit, read README first, then add docs/cgr/PS.md to this project.
```

```text
Use github picostar/Atlas_AI as source kit, read README first, then add .github/prompts/cgr.prompt.md to this project.
```

### Existing repo updates

Do not use legacy bootstrap mechanisms to update an existing Atlas-managed repository. For legacy Atlas projects, run or copy `atlas_update.md` from the kit and use it as a plan-first prompt. The prompt compares the target against the public `picostar/Atlas_AI` source of truth and stops before making edits until a human approves the plan.

If a legacy account-binding file exists, the update plan should consolidate non-secret provider binding into committed `accounts.md` after approval. Do not keep multiple active account sources.

### One-time layout migration (legacy repos)

If an existing repo still uses legacy paths (`docs/projects/` and `docs/reference/*-patterns`), use the guided update plan first and perform migration only after explicit approval.

### Guided update for older atlas projects

Older atlas projects should be updated with the root prompt `atlas_update.md` as a plan-first review, not with automatic file migration.

Ask the agent to use `picostar/Atlas_AI` as the source kit and run `atlas_update.md` against the open legacy project. If the agent cannot access GitHub directly, copy `atlas_update.md` into the legacy project root or paste its prompt into the agent while the legacy project is open. The prompt is standalone: it sends the agent to `picostar/Atlas_AI` as the source of truth, then asks for update suggestions as a plan. The first pass is plan-only and must stop for human review before any file changes.

Use this flow:
1. Open the legacy project in VS Code.
2. Ask the agent to use `picostar/Atlas_AI` as source kit, read README first, and run `atlas update`.
3. If remote repository access is unavailable, give the agent a local checkout of this repo or paste `atlas_update.md` into the session.
4. Let the agent compare the legacy project against the Atlas_AI source of truth.
5. Review the proposed update plan before files are moved, renamed, deleted, rewritten, or generated.
6. Answer any questions about legacy layout paths, account binding, pattern folders, and local project-specific files.
7. Approve the plan explicitly before execution.
8. Apply the agreed changes deliberately, then review the diff and commit.

The guided update flow is designed to catch project-specific decisions before editing, especially:
- whether `docs/projects` should become `docs/cgr`
- whether `docs/reference/stack-patterns` and `docs/reference/ux-patterns` should become `patterns/stack-patterns` and `patterns/ux-patterns`
- whether legacy account-binding files should be consolidated into committed `accounts.md`
- which local instructions, prompts, skills, docs, and reference files should be preserved

Compatibility-first rule: detect local canonical layout first and preserve it by default. Only migrate naming or path layout after explicit human approval.

For deterministic updates, use these reference docs:
- `docs/reference/update-path-compatibility-map.md`
- `docs/reference/update-validation-checklist.md`
- `docs/reference/update-runbook-legacy-reference-patterns.md`

The planning pass should not modify the legacy project. It should produce file-by-file recommendations, questions, and a proposed validation checklist for human approval.

On Windows or mixed-filesystem repos, if `git status` reports dubious ownership, use safe.directory fallback and rerun status before treating validation as failed:

```powershell
git config --global --add safe.directory <repo>
git -C <repo> status
```

Placement guidance:
- `atlas_newproject.md` is the recommended new-project bootstrap workflow.
- `atlas_update.md` is the recommended legacy update workflow.
- `scripts/atlas-validate.ps1` is required by new-project setup. Other scripts are optional utilities.

If the agent cannot perform setup from the remote source kit, use `.atlas/install-manifest.json` as the manual copy list. Copy every path in its `core` group, generate its `generatedPaths`, then add selected optional groups. Important entries include:
- `.github/copilot-instructions.md` -- always
- `.github/prompts/atlas-realign.prompt.md` -- recommended
- `.github/prompts/atlas-closeout.prompt.md` -- recommended
- `atlas_newproject.md` -- recommended for guided new-project bootstrap
- `atlas_update.md` -- recommended for guided legacy atlas updates
- `atlas_validate.md` -- required validation prompt for new-project completion and later standalone checks
- `.github/prompts/cgr.prompt.md` -- only if the project uses governance review
- `CLAUDE.md` -- always
- `CHATGPT.md` -- always
- `GEMINI.md` -- optional pointer for Gemini-oriented workflows
- `GROK.md` -- optional pointer for Grok-oriented workflows
- `DEEPSEEK.md` -- optional pointer for DeepSeek-oriented workflows
- `AGENTS.md` -- always
- `ATLAS.md` -- always
- `accounts.md` -- recommended for non-secret cloud account and deployment destination binding
- `.atlas/install-manifest.json` -- required installation contract
- `.claude/skills/atlas-newproject/SKILL.md` -- required Claude setup router
- `scripts/atlas-validate.ps1` -- required read-only validation command
- `docs/cgr/PS.md` -- only if the project uses formal project stages
- the `docs/`, `scripts/`, and `archive/` scaffold as needed

## Symlink and Cleanup

Prompt-first setup does not run a bootstrap installer script. It uses the read-only validation script when PowerShell is available and the `atlas_validate.md` fallback otherwise. If you copied this kit into a target project as bootstrap input, keep only the installed project artifacts and remove temporary source-kit folders after install.

## Auto-Loading Notes

### Copilot

Copilot is most likely to honor `.github/copilot-instructions.md` when it exists in the repository root.

### Claude Code

Claude Code commonly checks `CLAUDE.md` in the repository root.

### Codex-style agents

Many Codex-style tools and repo agents check `AGENTS.md` in the repository root.

### ChatGPT

ChatGPT-oriented workflows can use `CHATGPT.md` as a thin pointer to the source of truth and `ATLAS.md`. Prompt-driven setup includes `CHATGPT.md` by default.

### Optional hosted LLMs

Gemini, Grok, DeepSeek, and similar hosted LLM workflows can use `GEMINI.md`, `GROK.md`, or `DEEPSEEK.md` as optional thin pointers when a project wants tool-specific session instructions. If auto-loading is not available in the current tool, load the relevant pointer, `.github/copilot-instructions.md`, and `ATLAS.md` manually at session start.

### Important limitation

If this kit remains nested and you do not copy the files to the repository root, automatic loading may not happen.

## Stack Patterns

If the repository has an agreed stack baseline, create `patterns/stack-patterns/active-stack-pattern.md` and keep it current.

The atlas_ai instruction files and prompts treat that file as the source of truth for stack-sensitive work, such as architecture, hosting, deployment, infrastructure, and platform-selection changes.

Included stack pattern templates:
- `sp-01-functions-tables-swa-keyvault.md` -- Azure Functions + Table Storage + Static Web Apps + Key Vault (Standard Serverless baseline).
- `sp-02-functions-tables-sqlserverless-swa-keyvault.md` -- Azure Functions + Tables + Azure SQL Database Serverless (with 60-min auto-pause) + SWA + Key Vault.
- `sp-03-functions-servicebus-cosmos-swa-keyvault.md` -- Azure Functions + Service Bus messaging + Cosmos DB Serverless + SWA + Key Vault.
- `sp-04-appservice-sql-redis-frontdoor-keyvault.md` -- App Service container/monolith + Azure SQL + Redis Cache + Front Door + Key Vault.
- `sp-05-functions-swa-keyvault-egressproxy.md` -- Azure Functions + Static Web Apps + Key Vault + Egress Proxy for secure external API mediation.

Infrastructure as Code:
- `infra/main.bicep` -- Modular Azure Bicep template automating the provisioning of the full Atlas cloud footprint with built-in FinOps cost-saving controls (60-minute auto-pause for SQL Serverless, Consumption tiers, and mandatory tags).
- `infra/parameters.dev.json` and `infra/parameters.prod.json` -- Environment parameter configurations.

## UX Patterns

If the repository has an agreed UX baseline, create `patterns/ux-patterns/active-ux-pattern.md` and keep it current.

The atlas_ai instruction files and prompts treat that file as the source of truth for UX-sensitive work, such as layout, navigation, page hierarchy, and UI generation changes.

Included UX pattern templates:
- `uxp-01-modern-app-shell-layout.md` -- Modern enterprise web app shell with collapsible navigation drawer and header utilities.
- `uxp-02-b2b-marketing-website-journey.md` -- High-conversion B2B marketing website funnel with clear call-to-action flows.
- `uxp-03-mobile-first-touch-app-flow.md` -- Mobile-responsive progressive web app layout with bottom navigation rail.
- `uxp-04-monitoring-and-incident-response-console.md` -- High-density observability, telemetry, and incident triage dashboard.
- `uxp-05-identity-auth-sso-journey.md` -- Enterprise identity, authentication, session lifecycle, and Single Sign-On (SSO / OIDC via Microsoft Entra ID).
- `staticwebapp.config.json` -- Baseline Azure Static Web Apps configuration template with strict HTTP security headers (CSP, HSTS, X-Frame-Options) and Entra ID route guards.

## Extending atlas_ai

atlas_ai is designed to scale across teams, domains, and evolving technology stacks. You can extend the framework at three distinct levels:

### 1. Authoring Custom Skills (Tier 1, Tier 2, Tier 3)
Skills encapsulate procedural knowledge for coding agents:
- **Tier 1 (Universal Skills):** Kit-wide engineering standards applicable to all projects (`api-design`, `code-style`, `security-patterns`, `testing-patterns`, `anti-patterns`).
- **Tier 2 (Stack Skills):** Technology-specific deployment and integration recipes (`azure-deploy`, `deployment-patterns`, `pipeline-patterns`).
- **Tier 3 (Domain Skills):** Business-specific domain models, entity definitions, and compliance rules (e.g. `fintech-accounting`, `hipaa-data-classification`).

To create a new skill:
1. Create a directory under `.github/skills/<skill-name>/`.
2. Author `SKILL.md` with valid YAML frontmatter (`name`, `description`) conforming to `.github/FRONTMATTER-SCHEMA.md`.
3. Provide concrete "When to Use", step-by-step "Procedure", and explicit "Rules".

### 2. Adding Custom Stack and UX Patterns
- To add a new stack or UX pattern, create a markdown template under `patterns/stack-patterns/stack-pattern-templates/` or `patterns/ux-patterns/ux-pattern-templates/`.
- Register the template in `.atlas/install-manifest.json` under `catalogs.stackPatterns` or `catalogs.uxPatterns` so the setup questionnaire discovers it automatically.

## Existing Repo Updates

Use `atlas_update.md` for existing repositories. The first pass is planning only and should not execute edits, migrations, moves, renames, deletes, or destructive commands until a human reviews and approves the plan.

## AI Development Velocity

ATLAS uses `devcycle`, `devtask`, `reset devtask`, and `retro` because AI-assisted development moves at a different cadence than traditional agile delivery. Classic agile terms like sprint, story, and ceremony often imply multi-day or multi-week planning loops, human-only execution speed, and team rituals that are heavier than a coding-agent workflow needs.

A `devcycle` is the active burn-down for the next focused unit of work. It can represent a morning, an afternoon, a release push, or any short execution window. In AI-assisted delivery, multiple devcycles can happen in a single day because agents can implement, revise, and validate small tasks much faster than a human-only team cadence.

A `devtask` is a concrete planned implementation task inside the current devcycle. It is intentionally smaller and more operational than a traditional user story. A good devtask names the change, expected outcome, smoketest, and UAT or non-UAT validation path. The goal is to give the agent enough context to execute safely without turning every small change into a heavyweight planning artifact.

A `reset devtask`, or `RDT`, is unplanned work discovered during the current devcycle that must interrupt the planned order. This replaces vague mid-cycle churn with a visible reset point: the interruption is named, estimated, validated, recorded, and then removed from the active list when complete.

The `retro` is the completed-work ledger. Completed devtasks and reset devtasks move out of `devcycle.md` and into `retro.md` with outcome notes, smoketest evidence, UAT status, decisions, issues, and effort calibration. This keeps `devcycle.md` clean as a burn-down list while preserving the history needed for learning and governance.

ATLAS uses `CU`, `eMOE`, and `aMOE` for effort because AI velocity makes elapsed human time a poor planning unit. `CU` means Complexity Unit. It measures combined human-plus-agent delivery effort: uncertainty, decision load, dependencies, review depth, test burden, integration risk, and handoff cost. `eMOE` is the estimated Measure of Effort in CU before work starts. `aMOE` is the actual Measure of Effort in CU after the task is complete.

As a rule of thumb, a devtask estimated above 5 CU should be split before execution. For example, `DT3 -- Add customer dashboard` at 8 CU should become smaller sub devtasks such as `DT3.1 -- Add dashboard data contract`, `DT3.2 -- Build dashboard API`, and `DT3.3 -- Build dashboard UI`. Each sub devtask should carry its own `eMOE`, smoketest, and UAT or non-UAT validation path so the agent can close work safely in smaller loops.

This makes effort tracking useful again in AI development. A task may take an agent one minute to draft but still require meaningful review, validation, integration, and release judgment. By comparing `eMOE` to `aMOE`, the team can calibrate future devtasks around real delivery friction instead of pretending that wall-clock generation time equals effort.

## How To Customize For A New Project

Safe to customize:
- `docs/agile/devcycle.md`
- `docs/agile/backlog.md`
- `docs/agile/status.md`
- `docs/agile/retro.md`
- project docs under `docs/cgr/`
- reference docs under `docs/reference/`
- repo config files

Keep generic unless the repo itself needs a different process:
- `.github/copilot-instructions.md`
- `CLAUDE.md`
- `CHATGPT.md`
- `AGENTS.md`
- `ATLAS.md`

Project-specific values belong in:
- `docs/cgr/`
- `docs/reference/`
- non-secret config files
- secret stores and environment variables for credentials

## Suggested New Repo Setup

After prompt-driven setup installs the selected kit files into a new repository:

1. Create or update `.gitignore` to ignore local config overrides, `.env`, secrets, and `archive/` if desired.
2. Run `pwsh scripts/atlas-validate.ps1 -TargetPath <project>` and resolve every error before beginning delivery work.
3. Create the initial `devcycle.md` items for the first build phase.
4. Add CLI or script smoketests and a `UAT:` section to each devtask. For non-user-facing work, use `Not UAT-eligible` and name the internal validation.
5. Add repo-specific setup notes in `docs/reference/`, and if the repo has agreed architecture or UX baselines, capture them in `patterns/stack-patterns/active-stack-pattern.md` and `patterns/ux-patterns/active-ux-pattern.md`.
6. If the repo uses git, create one commit per completed `DT` or `RDT`. If the repo has a GitHub remote, push the branch and update or create the related pull request after each completed task.
7. Optionally, add `docs/cgr/PS.md` later if the project grows into formal release stages.
8. Optionally, add `.github/prompts/cgr.prompt.md` later if the project needs governance review. Update `.atlas/setup.json` when selected components change.

## Design Principles

- Reusable by default
- Project-specific details live outside the AI instruction files
- No secrets in committed instruction files
- Root-level instruction files for tool compatibility
- Active work kept separate from historical logs

## Maintenance

If you improve the process, update these files in this kit folder first, then apply the updated prompt-first flow to target repositories.

## Glossary

- `Phase`: A larger delivery grouping. In practice, treat a phase like an epic-level container for related work.
- `Devcycle`: The active burn-down of current planned work.
- `Devtask`: A discrete unit of planned implementation work inside the current devcycle.
- `DT`: Planned devtask identifier, for example `DT1`, `DT2`, `DT3`.
- `Reset Devtask`: An unplanned task discovered during the current devcycle that must interrupt the planned sequence.
- `RDT`: Reset devtask identifier, for example `RDT1`, `RDT2`, `RDT3`.
- `MOE`: Measure of Effort. The effort model used in this process.
- `CU`: Complexity Unit. The base effort-sizing unit in this process. A `CU` measures combined human-plus-agent delivery effort, including complexity, uncertainty, coordination, validation, and decision load, not just human time.
- `eMOE`: Estimated Measure of Effort. The planned effort score assigned before the work starts, expressed in `CU`.
- `aMOE`: Actual Measure of Effort. The final effort score recorded after the work is complete, expressed in `CU`.
- `CU`, `eMOE`, and `aMOE` relate like this: `CU` is the unit, `eMOE` is the estimated number of `CU`, and `aMOE` is the actual number of `CU`.
- Why this matters: in a human-only workflow, MOE often tracked human time. In an agent workflow, human time alone is misleading. A task that once took a human 1 hour might take an agent 1 minute, but the real effort still includes prompting, review, testing, integration, and ship decisions.
- `UAT`: User Acceptance Testing. Every devtask should include a `UAT:` section. For internal work, use `Not UAT-eligible` and record the required internal validation instead of a human handoff.
- `Smoketest`: The minimum repeatable verification that confirms the task works, executed by CLI commands or a script.
- `MRD`: Market Requirements Document.
- `PRD`: Product Requirements Document.
- `ESD`: Engineering Specification or Engineering Design document.
- `PS`: Project Stages. The optional EVT/DVT/PVT/GA release lifecycle defined in `docs/cgr/PS.md`.
- `CGR`: Compliance and Governance Review.

## Acronym Rules

- Use `DT` for planned devtasks in `devcycle.md`.
- Use `RDT` for reset devtasks that interrupt the current devcycle.
- New `RDT` items are inserted ahead of the remaining unfinished planned `DT` items.
- Record both `eMOE` and `aMOE` in `retro.md` for completed `DT` and `RDT` items.
- Estimate in `CU` before starting, then record the actual `CU` after completion.
