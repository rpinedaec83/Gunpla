# Status

Current live state of the project.

## Summary

- Stage: **EVT (In Progress -- DT1 & DT2 Completed, DT3 Next)**
- Overall state: Green -- DT1 & DT2 implemented and verified via `npm run smoketest` (`9/9 checks passed`).
- Current branch or release line: `feature/dt2-catalog-scalemates` (PR against `main` on `https://github.com/rpinedaec83/Gunpla`)
- Last meaningful update: 2026-10-23

## Live Capabilities

- **Monorepo TypeScript & Central API (`@gunpla/api` + `@gunpla/shared`):**
  - Multi-tenant resolution (`plamoscale` & `gunplajunkies` + custom B2B tenants via `GET /api/v1/tenants/current`).
  - Dual Authentication: Local Username/Email + Password (`POST /api/v1/auth/registrations`, `/sessions`) AND Google SSO (`POST /api/v1/auth/google-sessions`) with automatic email Account Linking and cross-tenant JWT SSO.
  - Resend.com Multi-Domain Email Service (`POST /api/v1/notifications/contact-messages`, `GET /api/v1/notifications/outbox`) using `noreply@plamoscale.com` and `noreply@gunplajunkies.com`.
  - Legacy Seed & Builder Portfolios (`GET /api/v1/builders`, `GET /api/v1/builders/:username`): All 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`) and all 92 build photos migrated and served.
  - **Master Catalog & Scalemates Importer (`/api/v1/catalog/*`):**
    - Kits catalog with tenant category scoping (`gunplajunkies` gets Gunpla/Mecha, `plamoscale` gets all scale kits), search, brand/scale filters.
    - Scalemates on-demand kit importer (`POST /api/v1/catalog/kits/import-scalemates`) with deduplication, HTML/JSON-LD metadata extraction, and 4s graceful fallback.
    - Paints and supplies catalog (`GET /api/v1/catalog/paints`) with brand, line, type, finish and hex color swatches.
    - Brands summary (`GET /api/v1/catalog/brands`).
  - OpenAPI 3.1 contract (`/openapi.json`) & interactive Swagger UI (`/doc`) + RFC 7807 Problem Details.

## Current Constraints

- Production deployment targets `x-codec` VPS/Homelab + PostgreSQL + Cloudflare R2/S3 + Resend.com verified domains.
- **Cloudflare & Resend Onboarding Status (2026-10-23):**
  - Nameservers for both `plamoscale.com` and `gunplajunkies.com` are delegated to Cloudflare: `cruz.ns.cloudflare.com` and `dylan.ns.cloudflare.com`.
  - Further Cloudflare DNS record adjustments and Resend DKIM/SPF domain verification are temporarily paused by user instruction and will resume during staging/production cutover.
  - Local development and CI smoketests remain 100% self-contained with offline mocks.

## Next Focus

- Execute **DT3** (`Slice 3: Personal Workbench -- My Stash, Wishlist & Paint Rack`) in [`docs/agile/devcycle.md`](file:///Users/rpineda/Sources/Gunpla/docs/agile/devcycle.md).
