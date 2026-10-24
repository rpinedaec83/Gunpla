# Prompt Catalog

This folder stores reusable prompt files for common atlas_ai workflows.

## Included Prompts
- `atlas-realign.prompt.md` -- ATLAS alignment and readiness review
- `atlas-closeout.prompt.md` -- end-of-session closeout readiness review
- `cgr.prompt.md` -- compliance and governance review workflow
- `cgr-seed-to-cgr.prompt.md` -- bootstrap MRD PRD ESD from seed, reference, or project source inputs, then run CGR and score outputs
- `cgr-iterate.prompt.md` -- iterate MRD PRD ESD using CGR-results and score deltas

Standalone root prompts live at the repo root so they are easy to copy into another project and invoke without installing the full prompt catalog:
- `atlas_newproject.md` -- guided new-project bootstrap prompt for cross-platform prompt-first setup
- `atlas_validate.md` -- read-only new-project installation validation and non-terminal fallback
- `atlas_update.md` -- guided legacy Atlas update prompt for plan-first project updates

## Usage
- Use prompts when you want a structured review with fixed output format.
- Prefer prompts for repeatable quality checks and governance checks.
- To run the governance workflow, type `CGR` or say `run CGR` in AI chat. The agent should use `cgr.prompt.md`.

## CGR Prompt Notes

`cgr.prompt.md` is designed to:
- enforce mandatory-field completeness before `Compliant` status,
- evaluate cross-document consistency across MRD, PRD, and ESD,
- support balanced external reference usage when repository sources are incomplete,
- report completeness and traceability findings in `docs/cgr/CGR-results.md`.

For stronger consistency, pair CGR runs with `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md`.

## Frontmatter
Use the schema in `.github/FRONTMATTER-SCHEMA.md`.
