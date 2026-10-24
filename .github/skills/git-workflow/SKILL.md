---
name: git-workflow
description: 'Git workflow conventions. Use when creating branches, writing commit messages, managing PRs, or working with git in a project. Covers feature branches, commit format, and merge strategy.'
---

# Git Workflow

## When to Use

- Creating feature branches for new work
- Writing commit messages
- Managing pull requests
- Setting up git in a new project

## Branch Strategy

- Work on short-lived branches, not directly on `main`
- Branch naming: `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`, `rdt/<short-description>`
- Use `main` as the normal pull request base branch unless the repo defines another base branch
- Use the active feature, fix, chore, or reset branch as the pull request head branch
- Keep branches short-lived -- merge the pull request and delete the branch after the dev cycle, phase, or reviewable task bundle closes

## Commit Messages

Format: `<type>: <short summary>`

When working from `devcycle.md`, start the summary with the DT or RDT identifier, for example `feat: DT3 add user authentication endpoint`.

Types:
- `feat` -- new feature or capability
- `fix` -- bug fix
- `docs` -- documentation only
- `refactor` -- code change that does not add a feature or fix a bug
- `test` -- adding or updating tests
- `chore` -- maintenance, dependencies, tooling

Examples:
- `feat: add user authentication endpoint`
- `fix: correct date parsing in report generator`
- `docs: update deployment instructions`
- `chore: update atlas_ai kit to latest`

## Rules

- Create at least one small, descriptive commit per DT or RDT instead of batching completed tasks together
- Commit after the smoketest passes and the `UAT:` section is completed so the handoff or explicit non-UAT note is based on committed work
- If a GitHub remote exists, push the active branch after each completed DT or RDT
- If the repository uses GitHub for review, create or update the related pull request after each completed DT or RDT
- Do not merge to `main` after every DT by default. Merge the pull request when the dev cycle, phase, or reviewable task bundle is ready to close
- A single-DT dev cycle may merge after that DT is complete, reviewed, and required status checks pass
- If no GitHub remote exists, record that blocker instead of silently skipping the follow-up
- Do not use `--force` push without explicit user approval
- Do not use `--no-verify` to skip hooks
- Do not amend published commits without user approval
- Include the DT or RDT identifier in the commit message when working from a devcycle task
- Stage and review changes before committing -- no blind `git add -A` on large repos
- Before asking the user for credentials, tokens, keys, or other secret values, check `secrets.md` at the repository root first if it exists
- Do not place secrets in any other file by default; if the user requests an override, warn first and proceed only after confirmation

## Common Commands

```powershell
# Create and switch to a feature branch
git checkout -b feature/my-feature

# Stage specific files
git add <file>

# Commit with message
git commit -m "feat: add new feature"

# Push branch
git push -u origin feature/my-feature

# Merge the pull request after review and required status checks pass
gh pr merge --merge --delete-branch
```
