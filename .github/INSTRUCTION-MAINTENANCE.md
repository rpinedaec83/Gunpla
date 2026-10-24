# Instruction Maintenance

This file defines how to keep instruction files aligned over time.

## Source Of Truth
- `.github/copilot-instructions.md` is authoritative.
- Thin pointers (`CLAUDE.md`, `AGENTS.md`, `CHATGPT.md`, `GEMINI.md`, `GROK.md`, `DEEPSEEK.md`) must not duplicate full process logic.
- `.claude/skills/atlas-newproject/SKILL.md` is a thin Claude discovery router. It must point to `atlas_newproject.md` instead of copying the setup procedure.

## Update Order
1. Update `.github/copilot-instructions.md` first.
2. Update `ATLAS.md` when process rules change.
3. Update thin pointers to keep path and read-order references aligned.
4. Update prompts and skills that depend on changed paths or lifecycle rules.
5. When new-project install groups, root entries, questionnaire fields, or pattern catalogs change, update `.atlas/install-manifest.json` first and run source-kit validation.
6. When governance behavior changes, update these together:
	- `.github/prompts/cgr.prompt.md`
	- `docs/cgr/PS.md`
	- `docs/cgr/score.md`
	- `docs/cgr/remediation-tracking.md`
	- `docs/cgr/README.md`

## Drift Prevention
- Keep pointer files short and declarative.
- Do not fork process logic across pointer files.
- Prefer links and references over copied rules.

## Conflict Resolution
- If instruction files conflict, `.github/copilot-instructions.md` wins.
- If process files conflict, `ATLAS.md` wins for lifecycle behavior.
- If architecture or UX baseline files exist, active baseline files in `patterns/` win for those domains.

## Change Hygiene
- Run path-reference sweeps after structural changes.
- Validate prompts and skills after path or naming changes.
- Document migration impacts in README when structure changes.
