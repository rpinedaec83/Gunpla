# Dev Cycle

Active tasks only. This is a burn-down list, not a history log.

## Current Phase

Name: Phase 1 (EVT) — Core Multi-Tenant Platform & Vertical Slices 1–5
Goal: Deliver the TypeScript Monorepo foundation, Central API with OpenAPI 3.1 (`/doc`), Legacy `plamoscale.com` Seed Migration (4 builders + ~92 photos), Kit/Paint Catalog with Scalemates Bridge, Workbench (Stash & Paint Rack), Step-by-Step Build Logs, and the two `UXP-01` Frontends (`plamoscale.com` and `gunplajunkies.com`).

## Active Tasks

### DT2 -- Slice 2: Kit & Paint Master Catalog + On-Demand Scalemates Importer | eMOE: 4 CU
- Goal: Implement the master catalog slice (`src/slices/catalog-scalemates`) for Scale Model Kits (brand, scale, grade/category, kit number, release year, boxart, PDF manual link, Scalemates reference URL) and Paints/Supplies (Mr. Hobby, Tamiya, Vallejo, Gaia, Citadel with hex color, code, type, finish), plus an on-demand Scalemates URL/metadata importer with graceful manual fallback.
- API Result: `GET /api/v1/catalog/kits`, `POST /api/v1/catalog/kits`, `POST /api/v1/catalog/kits/import-scalemates`, `GET /api/v1/catalog/paints`, `POST /api/v1/catalog/paints`, `GET /api/v1/catalog/brands`.
- Smoketest: Run `npm run smoketest` verifying kit filtering by tenant category (`gunpla-mecha` vs `all`), paint search by code/brand, and Scalemates kit import endpoint returning `201 Created` (or deduplicated `200 OK`) and documented in `/openapi.json`.
- UAT: Search for Gunpla (HG/MG/RG) and military/aviation kits, import a kit from a Scalemates URL, and browse the paint color swatches.

### DT3 -- Slice 3: Personal Workbench (My Stash, Wishlist & Paint Rack) | eMOE: 3 CU
- Goal: Implement the builder's personal inventory slice (`src/slices/workbench-stash`) allowing authenticated users to track their Stash (`unbuilt`, `in_progress`, `built`, `wishlist`, `for_trade`) and Paint Rack (`owned`, `low_stock`, `wishlist`) with summary statistics.
- API Result: `GET /api/v1/workbench/stash`, `POST /api/v1/workbench/stash`, `PATCH /api/v1/workbench/stash/:id`, `DELETE /api/v1/workbench/stash/:id`, `GET /api/v1/workbench/paints`, `POST /api/v1/workbench/paints`.
- Smoketest: Run `npm run smoketest` verifying authenticated CRUD on Stash and Paint Rack items, ownership authorization checks (`403` for other users), and OpenAPI schema coverage.
- UAT: Add a kit to "My Stash" and 3 paints to "My Paint Rack", then toggle kit status from `unbuilt` to `in_progress`.

### DT4 -- Slice 4: Step-by-Step Build Logs, Paint Recipes & Media Upload Pipeline | eMOE: 5 CU
- Goal: Implement the Build Logs slice (`src/slices/build-logs` and `src/slices/media-storage`) enabling builders to create WIP/Completed projects linked to a catalog kit, add chronological steps (`unboxing`, `assembly`, `modification`, `priming`, `painting`, `decals`, `weathering`, `final_reveal`), attach paint recipes from the catalog/rack, and upload photos to S3/Cloudflare R2 (with local dev fallback and thumbnail generation).
- API Result: `GET /api/v1/builds`, `GET /api/v1/builds/:slugOrId`, `POST /api/v1/builds`, `PATCH /api/v1/builds/:id`, `POST /api/v1/builds/:id/steps`, `POST /api/v1/media/upload`, `POST /api/v1/builds/:id/like`, `POST /api/v1/builds/:id/comments`.
- Smoketest: Run `npm run smoketest` verifying build log creation, step addition with paint recipe tags, photo upload generating `thumbUrl` and `fullUrl`, tenant-scoped feed filtering, and OpenAPI verification.
- UAT: Create a multi-step Gunpla build log with photos and paint recipe, and verify it appears on both `gunplajunkies.com` and `plamoscale.com`, while a military tank build log appears only on `plamoscale.com`.

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
