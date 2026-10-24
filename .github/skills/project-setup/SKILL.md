---
name: project-setup
description: 'Set up a new project with atlas_ai. Use when bootstrapping a new repository, running the installer, initializing git, or creating a GitHub repo.'
---

# Project Setup with atlas_ai

## When to Use

- Setting up a new project with the atlas_ai process kit
- Bootstrapping a new repository
- Initializing git or creating a new GitHub repository for a new project

## Procedure

1. Read these kit files for context:
   - [README.md](../../../README.md)
   - [copilot-instructions.md](../../copilot-instructions.md)
   - [ATLAS.md](../../../ATLAS.md)
   - [AGENTS.md](../../../AGENTS.md)
2. Prefer the standalone prompt-first workflow in `atlas_newproject.md` for agent-driven setup
   - Read `.atlas/install-manifest.json` before asking questions or changing target files
   - Treat the manifest as authoritative for install groups, allowed root entries, base skills, optional components, and pattern catalogs
   - Use it to bootstrap the repo without relying on Windows-only or PowerShell-only entry points
   - Ask only the minimum setup questions, then install the selected Atlas_AI files directly
   - Treat setup as incomplete until the required questionnaire answers are captured, or the user explicitly says to use defaults
   - Do not stop after partial file install plus diagnostics; if that state occurs, ask only missing setup questions and continue
   - Generate stack and UX menus from the manifest catalogs, accept number, ID, or label, and do not ask for freeform template filenames
   - Treat `github picostar/Atlas_AI` as source-kit reference only, not a clone destination, unless the user explicitly asks to clone it
   - Do not invoke deprecated legacy bootstrap scripts for prompt-driven newproject setup
3. If Atlas control files are already present at the repo root, stop and use `atlas_update.md` from the kit for a plan-first legacy project update instead
   - Otherwise preserve and merge root entries named by the manifest, and move every other pre-existing root entry into `docs/reference/preexisting-root/`
   - If `.git` already exists, adopt that repository rather than reinitializing it
   - If setup used a local source-kit folder in the target root, such as `atlas_ai` or `Atlas_AI`, remove that temporary folder after install and do not stage or commit it
4. Create committed `accounts.md` for non-secret cloud account and deployment destination binding
5. Write `.atlas/setup.json` with all setup answers, the source revision, git and GitHub outcomes, and relocated root entries
6. Run `pwsh scripts/atlas-validate.ps1 -TargetPath <target>` or apply `atlas_validate.md` when terminal execution is unavailable
7. Do not report successful setup until validation passes
8. Summarize what was installed

## File Placement Rules

Refer to [ATLAS.md](../../../ATLAS.md) for the full doc structure table. Key rules:

- Active tasks in `docs/agile/devcycle.md`
- Completed work in `docs/agile/retro.md`
- Future work in `docs/agile/backlog.md`
- Live state in `docs/agile/status.md`
- Keep reusable instruction files generic -- no project-specific values
- No secrets in committed files
- Use committed `accounts.md` for non-secret cloud account binding such as subscriptions, resource groups, project IDs, account IDs, regions, zones, and deployment target names
- Check `accounts.md` before cloud, hosting, infrastructure, deployment, or provider CLI work
- Before asking the user for credentials, tokens, keys, or other secret values, check `secrets.md` at the repository root first if it exists
- Do not place secrets in any other file by default; if the user requests an override, warn first and proceed only after confirmation
