# Retrospective Log

Completed work belongs here.

## Session -- 2026-10-23 | Goal: Atlas AI Bootstrap, Legacy Data Audit & CGR (MRD, PRD, ESD) Authoring
Start: 20:11 | End: 20:33 | Duration: 0h 22m

### BOOTSTRAP-1 -- Atlas AI Project Setup, Legacy Preservation & CGR Governance Suite | eMOE: 3 CU | aMOE: 3 CU
What was done:
- Audited existing `gunplajunkies.com` (Node/Express/Sequelize/JWT/Swagger multi-tenant prototype) and `plamoscale.com` (HTML5 UP Multiverse gallery with 4 founding builders `aperich`, `dcampos`, `cluna`, `fog1labs1`, ~92 high-res/thumbnail photos, mission/vision, Mailchimp form, and `bio.txt` links).
- Preserved both existing codebases intact under `docs/reference/preexisting-root/` and registered them in `.atlas/setup.json`.
- Installed the complete `Atlas_AI` kit (`core`, `scaffold`, `cgr`, `ps`, and `uxp-01-modern-app-shell-layout`), initialized git on `main`, and created the remote GitHub repository `https://github.com/rpinedaec83/Gunpla`.
- Authored complete `MRD_GUNPLA_v1.md`, `PRD_GUNPLA_v1.md`, `ESD_GUNPLA_v1.md`, `seed-to-docs-mapping.md`, `MRD-PRD-ESD-TRACEABILITY.md`, `CGR-results.md`, `score.md` (`100/100`), and planned Vertical Slices `DT1`–`DT5` in `docs/agile/devcycle.md`.
Issues hit:
- Found a minor bug in legacy `plamoscale.com/assets/js/script.js` where `aperich` had `1, 4` instead of `14` and photos `17–22` in `images/aperich/` were omitted from the JS array. Documented in `FR6` so the new seed script rescues all 21 photos of `aperich` (~92 total across all 4 builders).
Decisions made:
- Single central API with shared SSO identity (`plamo_sso_token` / Bearer JWT) serving `plamoscale.com` (general scale modeling), `gunplajunkies.com` (Gunpla/Mecha/Sci-Fi), and future B2B white-label club/shop portals.
- Full-Stack TypeScript Monorepo with Vertical Slice Architecture, PostgreSQL + S3-compatible Cloudflare R2 storage, and `x-codec` VPS hosting.
Lessons learned:
- Auditing legacy static assets before setup uncovered 6 additional unpublished photos in `images/aperich/` and community catalog links in `bio.txt` that directly enriched the PRD and seed data plan.

### DT1 -- Slice 1: Monorepo Scaffold, Multi-Tenant Core, Dual Auth (User/Pass + Google SSO), Resend Email Adapter & Legacy Seed Migration | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Created the TypeScript monorepo (`package.json` workspaces: `packages/shared`, `apps/api`, `apps/plamoscale-web`, `apps/gunplajunkies-web`) and PostgreSQL schema (`apps/api/sql/001_init_schema.sql`).
- Authored the contract-first OpenAPI 3.1 specification (`docs/reference/openapi-starter.yaml` and `/openapi.json`) with interactive Swagger UI at `/doc` and RFC 7807 `application/problem+json` error handling.
- Implemented Multi-Tenant Context Resolution (`apps/api/src/core/tenant.middleware.ts` & `tenants.slice.ts`) resolving `plamoscale` and `gunplajunkies` via `X-Tenant-Slug` or `Host` header.
- Implemented Dual Authentication (`apps/api/src/slices/auth-sso/auth.slice.ts`): Local Username/Email + Password (`bcrypt`) AND Google SSO (OAuth 2.0 / OIDC) with automatic Account Linking by verified email and unified SSO JWT (`24h`).
- Implemented the Resend.com Multi-Domain Email Service (`apps/api/src/slices/notifications-resend/resend.slice.ts`) dynamically dispatching from `PlamoScale <noreply@plamoscale.com>` or `GunplaJunkies <noreply@gunplajunkies.com>` based on the active tenant.
- Built the automated legacy seed script (`apps/api/src/seed/seed-legacy.ts`) rescuing 100% of the 92 photos across the 4 founding builders (`aperich`: 21, `dcampos`: 21, `cluna`: 6, `fog1labs1`: 44) with exact file casing (`.JPG` vs `.jpg`), plus `rpineda` admin account and `bio.txt` links.
- Added automated CLI smoketest (`scripts/smoketest.mjs`) verifying all 6 vertical slice assertions (`npm run smoketest` passed).
Issues hit:
- `swagger-ui-express` required a local TypeScript declaration file (`apps/api/src/types/swagger-ui-express.d.ts`).
- Legacy `aperich` folder mixed `.JPG` and `.jpg` file extensions on disk; reading actual filesystem filenames in `seed-legacy.ts` prevented case-sensitivity 404s on Linux servers.
Decisions made:
- Supported both RESTful resource-noun paths (`/api/v1/auth/registrations`, `/api/v1/auth/sessions`, `/api/v1/auth/google-sessions`, `/api/v1/notifications/contact-messages`) and convenient aliases (`/signup`, `/signin`, `/google`, `/contact`) so API consumers and legacy tests work seamlessly.
Lessons learned:
- Pairing an auditable sandbox outbox in the Resend adapter and structured test token support in the Google OIDC verifier allows 100% deterministic CLI smoketests without requiring live external network secrets during CI.
### DT2 -- Slice 2: Kit & Paint Master Catalog + On-Demand Scalemates Importer | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed and added the Kit and Paint data models to `@gunpla/shared` (`KitRecord`, `PaintRecord`, `BrandSummary`, `ScalematesImportRequest`, `ScalematesImportResponse`) and PostgreSQL schema (`apps/api/sql/001_init_schema.sql`).
- Built the master catalog slice (`apps/api/src/slices/catalog-scalemates/catalog.slice.ts`):
  - `GET /api/v1/catalog/kits`: Multi-tenant category scoping (`gunplajunkies` receives Gunpla/Mecha/Sci-Fi kits, `plamoscale` receives all kits including military, aviation, automotive, naval), search by keyword, filter by brand/scale.
  - `POST /api/v1/catalog/kits`: Manual kit creation with brand+kitNumber deduplication.
  - `GET /api/v1/catalog/kits/:id`: Kit details lookup.
  - `POST /api/v1/catalog/kits/import-scalemates`: On-demand Scalemates kit importer with deduplication by URL or brand+kitNumber, HTML OpenGraph/JSON-LD parsing, and strict 4-second timeout with transparent fallback (No Masking Policy — Rule 5).
  - `GET /api/v1/catalog/paints`: Paint and supply lookup with hex color swatches, filterable by brand, line, type (lacquer, acrylic, enamel), finish (gloss, flat, metallic, clear).
  - `POST /api/v1/catalog/paints`: Paint creation with deduplication.
  - `GET /api/v1/catalog/brands`: Brands summary with kit counts and supported categories.
- Built starter catalog seed (`apps/api/src/seed/seed-catalog.ts`) with 8 iconic kits (Bandai Spirits, Kotobukiya, Tamiya, Hasegawa) and 23 paints (Mr. Color, Tamiya Acrylic, Vallejo Model/Mecha Color, Gaia Notes, Citadel).
- Updated OpenAPI 3.1 contract (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`).
- Updated CLI smoketest (`scripts/smoketest.mjs`) with Checks 7, 8, and 9 verifying multi-tenant category filtering, paint search, and Scalemates kit import.
Issues hit:
- When importing from Scalemates, URLs that redirect away from the kit to a general landing page were caught and validated against fallback slug keywords to prevent saving mismatched kit titles.
- Brand matching between "Bandai" and "Bandai Spirits" was normalized so kit deduplication recognizes equivalent brand variants.
Decisions made:
- Enforce strict tenant category scoping on kits: when queried with `X-Tenant-Slug: gunplajunkies`, non-mecha kits (military, aviation) are automatically omitted unless explicitly allowed, maintaining brand focus for GunplaJunkies while PlamoScale has full visibility.
Lessons learned:
- Combining slug decomposition with HTML OpenGraph parsing provides a robust two-layer parser that succeeds whether Scalemates is online, offline, rate-limiting, or behind a Cloudflare challenge.
Usage: Moderate -- self-estimated
