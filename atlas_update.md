---
name: "Atlas Guided Update"
description: "Use when updating a legacy atlas project to the current Atlas_AI kit with a plan-first human review. Trigger phrase: atlas update."
argument-hint: "Optional legacy project path, scope, or update constraints"
agent: "agent"
---

# Atlas Update

Use this standalone prompt when updating a legacy atlas project to the current Atlas_AI process kit.

Copy this file into the legacy project root, paste it into the agent, or say `atlas update` while the legacy project is open in VS Code.

Do not run a hard updater script. Treat this as a guided repository update: inspect, compare, ask targeted questions, then produce an update plan for human review. Do not modify, move, rename, or delete files until a human approves the plan.

This file must stand alone in the legacy project. Do not assume the legacy project already has any Atlas_AI prompts, skills, scripts, or current instruction files. Use any Atlas_AI kit files you can inspect as source material only, not as required prompt dependencies.

Access model: this prompt does not itself grant repository or network access. The agent must establish access to the current Atlas_AI source kit by using an open local checkout, inspecting `picostar/Atlas_AI`, or asking the user for a local path or permission. Once Atlas_AI source access is available, the agent can compare, plan, and then execute approved changes in the legacy project with user interaction.

## Prompt

You are preparing to update this legacy atlas project to align with the current public Atlas_AI kit.

Planning phase only: do not edit files, run migration scripts, move folders, rename files, delete files, or run destructive commands. Your first deliverable is an update plan for human review.

1. Read the local repository instructions first, especially `.github/copilot-instructions.md`, `ATLAS.md` or `atlas.md`, and any existing `AGENTS.md`, `CLAUDE.md`, `CHATGPT.md`, `GEMINI.md`, `GROK.md`, or `DEEPSEEK.md` files.
2. Establish source-kit access. Use `picostar/Atlas_AI` on its default branch as the source of truth for the current kit. If the Atlas_AI repository is open locally, inspect that repo. Otherwise fetch or inspect the public repository. If the source kit cannot be reached, stop and ask for a local Atlas_AI path, permission to access GitHub, or permission to proceed with only this copied prompt.
3. Run compatibility-first discovery and detect the local canonical layout before proposing any migration:
   - naming variant: `ATLAS.md` versus `atlas.md`
   - stack pattern root: `patterns/stack-patterns/` versus `docs/reference/stack-patterns/`
   - UX pattern root: `patterns/ux-patterns/` versus `docs/reference/ux-patterns/`
   - CGR and stages paths: `docs/cgr/` and `docs/cgr/PS.md` versus legacy `docs/projects/` and `CGR.md`
4. Build and present a path compatibility matrix for this repository. Use `docs/reference/update-path-compatibility-map.md` when available. Show local path, SOT equivalent, and action (`keep`, `copy alongside`, `migrate later`).
5. Apply default compatibility rule: keep local canonical paths as-is unless the user explicitly approves a migration. Never force in-place path migration by default.
6. Compare the local project against Atlas_AI source of truth using the compatibility map. Focus on:
   - root instruction files
   - new-project install contract files from `.atlas/` and the standalone `atlas_validate.md` workflow
   - prompt files from `.github/prompts/` in the source kit, if present
   - skill files from `.github/skills/` in the source kit, if present
   - `ATLAS.md`, `docs/cgr/PS.md`, and CGR workflow files from the source kit, if present
   - `docs/agile/`, `docs/cgr/`, and `docs/reference/`
   - `patterns/stack-patterns/` and `patterns/ux-patterns/`
   - `scripts/`
   - account and secret handling files
7. Enforce pattern sync requirements in the plan:
   - include both stack and UX pattern template catalogs from SOT
   - include guidance to create or update active pattern files for project baselines
   - if one pattern family is missing in local repo, handle gracefully by importing only what exists in SOT and recording the gap plus follow-up
8. Detect legacy API-first policy files, including `docs/reference/api-first-policy.md`. Recommend moving API-first posture into `patterns/stack-patterns/active-stack-pattern.md` when a stack pattern is selected. Do not create a standalone API-first policy artifact when no stack pattern is active.
9. Add explicit account and secret migration classification to the plan:
   - inspect legacy files such as `accounts.txt`, `account.txt`, `cloud.txt`, and `notes.md` for binding versus secret content
   - build committed `accounts.md` from non-secret bindings only
   - build local-only `secrets.md` from secret material only and keep it gitignored
   - redact and classify in the plan, never copy secret values into committed files
10. Add archive safety rules to the plan:
   - prefer tracked retirement path `docs/reference/retired-docs/` for historical artifacts
   - warn before moving files into ignored directories such as `archive/`
   - require post-move reference checks before closeout
11. Present a concise plan-first update package that includes:
   - file-by-file copy and merge actions from SOT
   - file-by-file preserve and no-touch list. When the source kit contains a skill folder not present locally (for example a newly introduced `model-tier-advisor`), the plan must explicitly propose adding it as a `copy` action. New skill folders are not to be silently omitted from the compatibility matrix as "not applicable."
   - explicit migration candidates marked `needs approval`
   - compatibility matrix and known limits
   - rollback path proposal to use before execution
   - deterministic validation checklist with pass criteria
   - if `model-tier-advisor` is being added or updated by this run, optionally include a follow-up note that refreshing its benchmark tables (via `atlas refresh models`) is recommended once the update is approved and applied. If the target project's `devcycle.md` already has active DT/RDT entries, also explicitly propose backfilling `Suggested Model` onto those existing entries as part of the approved changes, not just note a future benchmark refresh.
12. Ask only the minimum targeted questions needed to avoid losing project-specific content.
13. Stop after presenting the plan and questions. Wait for explicit human approval before making changes.
14. After approval and before edits, create a rollback path and confirm it is usable:
   - if git exists, create a pre-update rollback branch or tag at current HEAD and record its name in the summary
   - if git does not exist, create a timestamped filesystem backup path and record restore steps
   - do not proceed with edits until rollback path creation is confirmed or the user explicitly waives it
15. After rollback confirmation, execute only approved changes in the legacy project with user interaction as needed. Apply minimal edits. Prefer merging and preserving local facts over overwriting project-specific files.
16. Validate with strict checks and clear pass signals. Use `docs/reference/update-validation-checklist.md` when available:
   - pre-update discovery checks
   - pre-update rollback checks
   - post-update file-presence checks
   - reference integrity checks
   - secret leak checks
   - stack and UX pattern availability checks
   - Windows and mixed-filesystem git check with safe.directory fallback when needed
17. Windows safe.directory fallback guidance for validation and troubleshooting:
   - check: `git -C <repo> status`
   - if dubious ownership appears, run one of:
      - `git config --global --add safe.directory <repo>`
      - `git config --system --add safe.directory <repo>` when policy requires system scope
   - rerun `git -C <repo> status` and record pass or blocker.

## Default Decisions

- Keep `secrets.md` ignored and local-only.
- Commit `accounts.md` as the non-secret cloud account binding source of truth.
- Preserve local canonical layout paths by default. Migrate path layout only with explicit human approval.
- Keep reusable stack and UX patterns under `patterns/`.
- Import both stack and UX pattern template catalogs from source kit when available.
- Keep API-first posture in `patterns/stack-patterns/active-stack-pattern.md` when a stack pattern is selected.
- Keep governance artifacts under `docs/cgr/`.
- Keep user-supplied project source material under `docs/reference/`, such as old MRDs, PRDs, specifications, marketing materials, website notes, setup notes, and context for planning, devcycles, and CGR.
- Prefer tracked retired-document storage under `docs/reference/retired-docs/` for legacy artifacts that should remain visible in version control.
- Create and record a rollback path before update edits. If rollback setup fails, stop and ask before proceeding.
- Use manual review before any legacy layout migration.
- Treat `.github/prompts/` files as optional workflow files to copy or merge from the source kit. This prompt does not require them to exist before the update.
- Treat `.atlas/install-manifest.json`, `atlas_validate.md`, and `scripts/atlas-validate.ps1` as recommended bootstrap-maintenance files. Installing them during an approved update does not make new-project validation a gate for the update itself.
- The first run of this prompt is plan-only. Execution requires explicit human approval.
