# Stack Patterns

This folder contains reusable architecture baselines for Azure-first projects.

## What a stack pattern is
A stack pattern is a repeatable architecture reference that defines:
- which Azure services are used for frontend, compute, data, integration, and secrets
- how those services are expected to interact
- whether API-first delivery posture is enabled for the selected architecture
- baseline security and operational expectations
- fit and non-fit boundaries, including cost and scale considerations

A stack pattern is not a deployment runbook, not a coding standard, and not an environment-specific setup sheet.

## Why this folder exists
This folder creates a shared language for architecture choices so teams can:
- start faster from proven patterns
- review tradeoffs explicitly before implementation
- avoid one-off stack drift between teams and features
- keep architecture decisions transparent and easy to revisit

## Folder structure
- `active-stack-pattern.md`: the current approved baseline for architecture, hosting, deployment, infrastructure, and platform choices
- `stack-pattern-templates/`: editable candidate patterns used for review and adaptation

## How patterns are used
1. Select the closest candidate from `stack-pattern-templates/`.
2. Adapt it for project constraints, scale, compliance, and non-functional requirements.
3. Review and record decisions and tradeoffs.
4. Promote approved decisions into `active-stack-pattern.md`.
5. Keep `active-stack-pattern.md` current as architecture changes.

## How active-stack-pattern.md is consumed
When `active-stack-pattern.md` exists, the instruction stack can treat it as the baseline for stack-sensitive work, such as architecture changes, hosting changes, deployment model updates, and platform decisions.

## Review triggers
Update or re-review stack patterns when one or more of these occur:
- major scale, latency, or throughput shifts
- security or compliance requirements change
- cost profile becomes unacceptable
- a new product capability introduces new data or integration needs
- Azure service lifecycle or platform constraints change

## Guardrails
- Keep secrets, credentials, tenant identifiers, and environment-specific tokens out of these files.
- Keep API-first posture and implementation details in the active stack pattern.
- Keep decisions at architectural level, not one-off implementation details.
- Record rationale and constraints, not just chosen services.
- For function-based patterns, document timeout boundaries by hosting plan and long-request behavior.
