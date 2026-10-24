---
name: "Atlas Guided New Project Setup"
description: "Use when bootstrapping a new project with the current Atlas_AI kit through a prompt-first workflow. Trigger phrases include newproject, atlas project, set up this Atlas project, and setup requests that reference github/picostar/Atlas_AI or its README.md."
argument-hint: "Optional project setup scope, stack pattern, UX pattern, or bootstrap constraints"
agent: "agent"
---

# Atlas New Project

Use this standalone prompt when bootstrapping a new project with the current Atlas_AI process kit.

Copy this file into the target project root, paste it into the agent, or say `newproject` or `atlas project` while the target project is open in VS Code and the Atlas_AI source kit is available.

Do not use legacy bootstrap scripts for this workflow. Newproject is prompt-only and should bootstrap directly through agent file operations across Windows, Linux, and macOS.

This file must stand alone in the target project. Do not assume the project already has Atlas_AI prompts, skills, scripts, or root instruction files. Use any Atlas_AI kit files you can inspect as source material only, not as required prompt dependencies.

Access model: this prompt does not itself grant repository or network access. The agent must establish access to the current Atlas_AI source kit by using an open local checkout, inspecting `picostar/Atlas_AI`, or asking the user for a local path or permission. Treat that source as read-only template input. Do not clone `picostar/Atlas_AI` into the target folder or a subfolder unless the user explicitly asks to clone the kit repository. Once Atlas_AI source access is available, bootstrap the current target project in place.

## Prompt

You are preparing to bootstrap this repository with the current public Atlas_AI kit.

Do not run deprecated bootstrap scripts. Use a prompt-driven workflow, ask only the minimum setup questions needed, then execute the approved bootstrap directly in the repository using available file tools. The read-only validator is required after installation.

1. Read local repository instructions first if they already exist, especially `.github/copilot-instructions.md`, `ATLAS.md`, and any root `AGENTS.md`, `CLAUDE.md`, `CHATGPT.md`, `GEMINI.md`, `GROK.md`, or `DEEPSEEK.md` files.
2. Establish source-kit access. Use `picostar/Atlas_AI` on its default branch as the source of truth for the current kit. If the Atlas_AI repository is open locally, inspect that repo. Otherwise fetch or inspect the public repository. If the source kit cannot be reached, stop and ask for a local Atlas_AI path or permission to access GitHub. Treat `picostar/Atlas_AI` as source-only input for file comparison and copy decisions, not as a clone target.
3. Read `.atlas/install-manifest.json` from the source kit. It is authoritative for install groups, allowed root entries, questionnaire keys, skills, and pattern catalogs. If it is missing or invalid, stop. Do not invent an Atlas-style layout.
4. Detect whether this target is already Atlas-managed. If the repo root already contains Atlas control files and this is not an interrupted bootstrap with a setup receipt, stop and tell the user to use `atlas_update.md` from the kit. If `.atlas/setup.json` shows an interrupted bootstrap, ask only the missing questions and resume this workflow.
5. Inventory the target root without changing it. Preserve and merge entries named in `preserveAndMergeRootEntries`. Treat names in `temporarySourceKitNames` as temporary bootstrap input. Plan to move every other pre-existing root entry into `docs/reference/preexisting-root/`, retaining its root-relative name. If `.git` exists, adopt it rather than reinitializing it.
6. Run the required setup questionnaire before changing files. Do not silently apply defaults when answers are missing. Only skip questions already answered in the current conversation. Ask in the manifest order:
    - include scaffold docs? yes or no (default yes)
    - initialize git when `.git` is absent? yes or no (default yes)
    - include PS governance artifacts? yes or no (default no)
    - include CGR governance workflow? yes or no (default no)
    - select an active stack pattern baseline now? yes or no (default no)
    - if stack pattern is yes, generate the numbered menu from `catalogs.stackPatterns` and accept a number, ID, or label. Do not use a hardcoded menu and do not ask for a filename or path
    - if stack pattern is selected, ask: enable API-first posture? yes or no (default yes). Explain meaning: API-first expects API results when feasible, and smoketests should verify API endpoints plus OpenAPI or Swagger docs when feasible.
    - select an active UX pattern baseline now? yes or no (default no)
    - if UX pattern is yes, generate the numbered menu from `catalogs.uxPatterns` and accept a number, ID, or label. Do not use a hardcoded menu and do not ask for a filename or path
    - create GitHub repo now? yes or no (default no)
   - If `.git` already exists, do not ask whether to initialize it. Record `initializeGit: false` and `outcomes.git: adopted`.
7. If the user replies with "use defaults" or equivalent, apply the manifest defaults and continue. Otherwise summarize captured answers and ask for a quick confirmation before execution.
   - Completion gate: do not output a final validation summary or next-step options until setup questionnaire answers are captured and applied, unless blocked.
   - Recovery mode: if a prior run already copied some files, for example only prompt files, without collecting setup answers, ask only the missing questions and continue execution to completion in this same run.
8. After confirmation, create `docs/reference/preexisting-root/` and perform the planned root cleanup. Merge approved `.github` and `.claude` content without overwriting unrelated user-authored files. Move every other unexpected root entry to the preservation folder and record each moved root-relative name. Do not move the target's `.git` directory or git metadata. If a preservation destination already exists, stop and resolve the collision with the user instead of overwriting or inventing a renamed path.
9. Install every path in the manifest `core` group, then install the selected `scaffold`, `cgr`, `ps`, and catalog-linked groups. The six base-process skills in the core group are unconditional. Do not install CGR prompts or documents unless `includeCGR` is true, except `docs/cgr/README.md` may also be installed when PS is selected. Merge compatible content at approved root entries. If an existing file conflicts with a required Atlas path, stop for a preservation decision instead of overwriting it. Execute in the current target folder, not a cloned subfolder.
10. Create `.atlas/setup.json` with this contract:
    - `schemaVersion`: `1`
    - `manifestVersion`: the manifest `manifestVersion`
    - `source.repository`: `picostar/Atlas_AI`
    - `source.revision`: the inspected commit SHA, tag, or explicit branch identifier
    - `answers`: every key from the manifest questionnaire, using the selected catalog IDs or `null`
    - `relocatedRootEntries`: the root-relative names moved in step 8
    - `outcomes.git`: `adopted`, `initialized`, or `skipped`
    - `outcomes.github`: `created`, `existing`, `skipped`, or `blocked`
    - outcome values must describe what actually happened, not only what was requested
11. If a stack pattern is selected, copy its manifest `sourcePath` to its `destinationPath`. Add `Atlas Pattern ID: <id>` and `API-First: Enabled` or `API-First: Disabled` directly below the title.
12. If a UX pattern is selected, copy its manifest `sourcePath` to its `destinationPath` and add `Atlas Pattern ID: <id>` directly below the title.
13. Remove any temporary source-kit folder named by the manifest after installation. Do not stage or commit it.
14. Ensure `accounts.md` exists as the committed non-secret binding file. Generate `secrets.md` as a local-only note and verify that `.gitignore` contains an exact `secrets.md` entry.
15. After base-process skills are installed, if web-fetch tools are available, attempt the on-demand `model-tier-advisor` benchmark refresh. If unavailable or unsuccessful, recommend `atlas refresh models` in the setup summary.
16. If git is absent and `initializeGit` is true, initialize it. If git exists, adopt it. Run validation before creating the initial commit, and stage only approved Atlas artifacts after validation passes.
17. If GitHub repository creation is selected, require the owner or organization and report missing CLI or authentication prerequisites instead of inventing values.
18. Run the mandatory validation gate:
    - when PowerShell is available: `pwsh scripts/atlas-validate.ps1 -TargetPath <target>`
    - otherwise: read and execute `atlas_validate.md` with repository file tools
    - fix validation errors and rerun; do not report successful setup while validation fails or remains unverified
19. Summarize:
   - setup questionnaire answers captured, and whether defaults were explicitly used
   - files installed, including all base-process skills
   - manifest and setup receipt written
   - pre-existing user material preserved under `docs/reference/preexisting-root/`
   - whether temporary source-kit folder cleanup was completed
   - whether git was adopted or initialized
   - optional components included
   - whether `model-tier-advisor` benchmark tables were refreshed, or if deferred, a note that `atlas refresh models` is recommended when network access is available
   - validation command and pass result
   - unresolved manual follow-up

## Default Decisions

- Keep `secrets.md` ignored and local-only.
- Commit `accounts.md` as the non-secret cloud account binding source of truth.
- Keep reusable stack and UX patterns under `patterns/`.
- Keep API-first posture in `patterns/stack-patterns/active-stack-pattern.md` when a stack pattern is selected.
- Keep governance artifacts under `docs/cgr/`.
- Do not create a root `GOVERNANCE.md`; it is not part of the Atlas install manifest.
- Keep user-supplied project source material under `docs/reference/`, such as old MRDs, PRDs, specifications, marketing materials, website notes, setup notes, and context for planning, devcycles, and CGR.
- Treat legacy bootstrap scripts as deprecated paths for newproject. Do not invoke them during prompt-driven bootstrap.
- Remove temporary source-kit folders from the target root after installation when they were used as local bootstrap inputs.
- Treat GitHub source references for Atlas_AI as read-only source-kit input, not as clone destinations, unless the user explicitly requests a clone operation.
- Stop and route to `atlas_update.md` instead of reinstalling when Atlas control files already exist at the repo root.
- Treat `.atlas/install-manifest.json` and `.atlas/setup.json` as the installation contract. Do not substitute an agent-generated layout.
