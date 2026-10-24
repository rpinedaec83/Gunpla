# UX Patterns

This folder contains reusable user experience baselines for web applications.

## What a UX pattern is
A UX pattern is a repeatable interaction and layout reference that defines:
- navigation structure and orientation cues
- page context, status visibility, and action clarity
- responsive behavior expectations
- fit and non-fit boundaries for application types

A UX pattern is not a visual brand guide, not a component library, and not a one-off page mockup.

## Why this folder exists
This folder creates a shared language for UX decisions so teams can:
- start from proven layouts for operational web apps
- keep generated UI outputs consistent across features
- reduce orientation and navigation confusion for users
- review UX tradeoffs explicitly before implementation

## Folder structure
- `active-ux-pattern.md`: the current approved baseline for layout and navigation behavior
- `staticwebapp.config.json`: baseline Azure Static Web Apps enterprise routing, security headers, and Entra ID authentication configuration template
- `ux-pattern-templates/`: editable candidate patterns used for review and adaptation

## How patterns are used
1. Select the closest candidate from `ux-pattern-templates/`.
2. Adapt it for user workflows, data density, and accessibility needs.
3. Review and record decisions and tradeoffs.
4. Promote approved decisions into `active-ux-pattern.md`.
5. Keep `active-ux-pattern.md` current as UX direction changes.

## How active-ux-pattern.md is consumed
When `active-ux-pattern.md` exists, the instruction stack can treat it as the baseline for UX-sensitive work, such as layout generation, navigation structure, dashboard composition, and page-level action placement.

## Review triggers
Update or re-review UX patterns when one or more of these occur:
- major workflow or information architecture changes
- mobile and tablet usage patterns change
- accessibility requirements or standards change
- user feedback shows orientation or navigation confusion
- product scope adds significantly different task modes

## Guardrails
- Keep project credentials, tenant values, and environment-specific secrets out of these files.
- Keep guidance at pattern level, not one-off screen details.
- Record rationale and constraints, not only preferred structure.
- Keep primary navigation, context, status, and action hierarchy explicit.
