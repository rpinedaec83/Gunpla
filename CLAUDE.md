# Project Instructions

Read `.github/copilot-instructions.md` first. That file is the source of truth.

If the user asks to set up or bootstrap an Atlas project, including a request that references `github/picostar/Atlas_AI` or its `README.md`, read the source-kit `README.md`, `.atlas/install-manifest.json`, and `atlas_newproject.md` before changing target files. Use the `atlas-newproject` Claude skill when available. Do not report completion until Atlas validation passes.

For local secrets, use `secrets.md` at repo root only. Do not place secrets in any other file by default, and only use an alternate location after explicit user override plus warning.

For non-secret cloud account and deployment destination binding, use committed `accounts.md` at repo root. Check it before cloud, hosting, infrastructure, deployment, or provider CLI work, and do not put credentials or keys in it.

If `docs/agile/` files still contain placeholder scaffold content, treat the repository as a template or kit unless there is clear evidence it has been activated as a live project. In that case, assess template integrity and adoption readiness instead of treating placeholder agile docs as workflow failures.

If the user opens with a greeting or start-of-session phrase, such as `hi`, `hello`, `good morning`, `goodmorning`, or `ready to start`, treat it as a request for a quick project check-in. Review project state using `ATLAS.md`, then prioritize `docs/agile/status.md`, `docs/agile/devcycle.md`, and `docs/agile/backlog.md` as needed. Confirm whether the project appears ready to start and suggest the next ATLAS-based step.

If the user opens with `atlas`, treat it as the same startup check-in request. If `.github/prompts/cgr.prompt.md` is present and governance is enabled, check whether live MRD, PRD, and ESD artifacts exist in `docs/cgr/`. If they are missing, ask whether to run CGR bootstrap to generate draft governance docs from `seed.md` and `docs/reference/`.

If the user uses a short launch phrase, such as `do it`, `lets go`, `let's go`, `go ahead`, `start`, `proceed`, `make it so`, `engage`, `hit it`, `punch it`, or `newproject`, treat it as authorization to begin work. Perform a brief ATLAS readiness check, confirm the next task is clear, then execute immediately unless a blocker requires a minimal clarification.

If the user says `CGR`, `run CGR`, `atlas cgr`, or `do CGR from github picostar/Atlas_AI on folder "<localpath>"`, treat it as a CGR run against the named target folder. Use the source kit at `picostar/Atlas_AI` (local checkout if available, otherwise fetch the CGR prompt and templates from the GitHub default branch) and write all output under `<localpath>/docs/cgr/`. Do not modify the source kit folder during a remote-sourced run.

If the user closes with a sign-off phrase, such as `good night`, `goodnight`, `goodbye`, `that's all`, or `we are done`, treat it as a request for a quick end-of-session check. Confirm whether the current state appears to follow ATLAS, call out obvious closeout gaps such as missing smoketest confirmation, missing UAT handoff or explicit non-UAT note, missing task-level commit, missing GitHub follow-up, or missing doc updates, and confirm whether any required git or GitHub follow-up step is still pending.

Then read `ATLAS.md` for the default development process.

If `patterns/stack-patterns/active-stack-pattern.md` exists and the task affects architecture, hosting, deployment, infrastructure, or platform selection, read it after `ATLAS.md` and treat it as the current stack baseline.

If `patterns/ux-patterns/active-ux-pattern.md` exists and the task affects layout, navigation, page hierarchy, interaction flow, or UI generation, read it after `ATLAS.md` and treat it as the current UX baseline.

Read `docs/cgr/PS.md` only when the project uses formal release stages (EVT, DVT, PVT, GA) and document gates (MRD, PRD, ESD). It is optional.

Read `.github/prompts/cgr.prompt.md` only when the user asks for a governance review, stage-gate review, or document-compliance review.

This kit is intended to live at the repository root. If it is copied into a nested folder, automatic loading may not work.

Use `atlas_ai` as the recommended session phrase when you want an agent to adopt this process in an existing repository.

Response guidelines are defined in `.github/copilot-instructions.md`. Do not duplicate them here.
