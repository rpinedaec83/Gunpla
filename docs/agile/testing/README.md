# Regression and UAT Harness

This directory is a home for a repeatable, deployed smoketest and UAT harness, distinct from per-task smokes under `scripts/`, for projects whose UAT surface has outgrown a single inline `UAT:` note.

## What This Is For

Per-task smokes in individual `devcycle.md` entries prove one task's contract. When cross-feature regression coverage becomes worth tracking on its own, a standing harness holds the accumulated surface, encoding recurring failure modes pulled from `retro.md` so it catches regressions, not just happy paths.

## Why This Exists

- Per-task smokes prove individual change contracts. All passing smokes do not guarantee no regressions across feature interaction.
- A green regression/UAT harness run serves as the broad acceptance gate before deployment.
- Per-task smokes remain the focused gates cited in individual retro entries.

## Optional Folder

Delete this folder if your project's UAT fits in the inline `UAT:` field in `devcycle.md`. Create it when cross-feature regression coverage becomes important enough to track separately.

## Coverage Rule

When a devtask (DT) or reset devtask (RDT) changes deployed behavior, update this harness:
- Add or update rows in the harness coverage map.
- If no full-harness row is appropriate for the change, record why in the retrospective log.

This rule is a discipline, not a hard blocker. It documents intent and decisions without becoming a gate that blocks trivial changes.

## Suggested Shape

This directory typically contains:

- An executor script or runner command (e.g., `run-harness.sh`, test suite invocation)
- A coverage map file naming what is covered, how to run each part, and expected pass signal
- A `reports/` folder for run logs and test output (usually gitignored)

Each adopting project fills in the specifics. No templates or example content are provided here; this is a structural placeholder only.
