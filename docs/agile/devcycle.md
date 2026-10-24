# Dev Cycle

Active tasks only. This is a burn-down list, not a history log.

## Current Phase

Name: Phase 1 (EVT) — Core Multi-Tenant Platform & Vertical Slices 1–5
Goal: Deliver the TypeScript Monorepo foundation, Central API with OpenAPI 3.1 (`/doc`), Legacy `plamoscale.com` Seed Migration (4 builders + ~92 photos), Kit/Paint Catalog with Scalemates Bridge, Workbench (Stash & Paint Rack), Step-by-Step Build Logs, and the two `UXP-01` Frontends (`plamoscale.com` and `gunplajunkies.com`).

## Active Tasks

### DT5 -- Slice 5: Dual Multi-Tenant Frontends (`plamoscale.com` & `gunplajunkies.com`) with UXP-01 App Shell | eMOE: 5 CU
- Goal: Build and connect the two web frontends (`apps/plamoscale-web` and `apps/gunplajunkies-web`) following `UXP-01 Modern App Shell Layout` (persistent left text-labeled sidebar, top utility bar with global search & SSO switcher, breadcrumbs, clear page headers, responsive mobile drawer, and Poptrox-inspired high-res lightbox showcase), including builder profiles (`/@aperich`, `/@dcampos`, `/@cluna`, `/@fog1labs1`), Contests preview, and Trusted Shops directory (`bio.txt` & Mailchimp).
- API Result: `GET /api/v1/builders`, `GET /api/v1/builders/:username`, `GET /api/v1/contests`, `GET /api/v1/shops` consumed by both frontend applications.
- Smoketest: Run `npm run build` and `npm run smoketest` verifying both frontend builds succeed and serve their respective tenant branding, navigation, and live API data.
- UAT: Open `plamoscale.com` and `gunplajunkies.com` frontends, browse the 92 migrated photos of the 4 founding builders, filter by Gunpla vs General Scale, inspect a step-by-step build log with paint recipes, and test the Workbench UI.

## Reset

Use this section only for unplanned blocker work that interrupts the active phase.

## Notes

- Remove completed tasks from this file.
- Do not add DONE labels, checkboxes, or strikethroughs.
- Record completed work in `retro.md`.
- Use `DT` for planned devtasks in the active cycle.
- Use `RDT` for reset devtasks that interrupt the current cycle.
- Create one git commit per completed `DT` or `RDT` when the repo uses git.
- If the repo has a GitHub remote, push the branch and update or create the related pull request after each completed `DT` or `RDT`.
