# Scripts

Use this folder for reusable scripts that support development, validation, deployment, or reporting.

Guidelines:
- prefer repeatable scripts over manual portal steps
- keep scripts parameterized
- read config at runtime instead of hardcoding environments or credentials
- document required inputs and expected outputs

Included scripts:
- `atlas-validate.ps1` -- read-only validation for the Atlas source manifest or an installed project receipt. Run `pwsh scripts/atlas-validate.ps1 -TargetPath <path> -SourceKit` for kit maintenance or omit `-SourceKit` for an installed project.
- `dev-local.ps1` -- local offline development and emulation launcher. Checks prerequisites (Node, SWA CLI, Func, Azurite) and starts local SWA proxy with mock Entra ID login. Run `pwsh scripts/dev-local.ps1 -CheckOnly`.
- `get-azure-prices.ps1` -- live price query tool using public Azure Retail Prices API to estimate current hourly/monthly costs for Atlas stack resources and generate markdown reports. Run `pwsh scripts/get-azure-prices.ps1 -Region eastus -OutputFormat Markdown`.
- `migrate-layout-v2.ps1` -- optional manual migration from legacy layout (`docs/projects`, `docs/reference/*-patterns`) to v2 layout (`docs/cgr`, `patterns/*-patterns`). Preview with `-WhatIf`, plan with `atlas_update.md`, then run with `-Approved` only after human approval.
- `smoketest.ps1` -- automated post-task and post-deployment validation runner. Probes `/api/v1/health`, verifies 401 unauthenticated boundary, and asserts SLA response times. Run `pwsh scripts/smoketest.ps1 -BaseUrl http://localhost:4280`.

Related root prompt:
- `atlas_update.md` -- standalone guided legacy atlas update prompt. Run it from the kit, copy it into the legacy project, or paste it into an agent, use `picostar/Atlas_AI` as source of truth, and produce a human-reviewed plan before any edits.
- `atlas_validate.md` -- standalone validation workflow and non-terminal fallback for `atlas validate`.
