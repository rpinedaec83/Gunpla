# Status

Current live state of the project.

## Summary

- Stage: **EVT (In Progress -- DT1 Completed, DT2 Next)**
- Overall state: Green -- DT1 (Vertical Slice 1) implemented and verified via `npm run smoketest` (`6/6 checks passed`).
- Current branch or release line: `feature/dt1-core-auth-seed` (PR against `main` on `https://github.com/rpinedaec83/Gunpla`)
- Last meaningful update: 2026-10-23

## Live Capabilities

- **Monorepo TypeScript & Central API (`@gunpla/api` + `@gunpla/shared`):**
  - Multi-tenant resolution (`plamoscale` & `gunplajunkies` + custom B2B tenants via `GET /api/v1/tenants/current`).
  - Dual Authentication: Local Username/Email + Password (`POST /api/v1/auth/registrations`, `/sessions`) AND Google SSO (`POST /api/v1/auth/google-sessions`) with automatic email Account Linking and cross-tenant JWT SSO.
  - Resend.com Multi-Domain Email Service (`POST /api/v1/notifications/contact-messages`, `GET /api/v1/notifications/outbox`) using `noreply@plamoscale.com` and `noreply@gunplajunkies.com`.
  - Legacy Seed & Builder Portfolios (`GET /api/v1/builders`, `GET /api/v1/builders/:username`): All 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`) and all 92 build photos migrated and served.
  - OpenAPI 3.1 contract (`/openapi.json`) & interactive Swagger UI (`/doc`) + RFC 7807 Problem Details.

## Current Constraints

- Production deployment targets `x-codec` VPS/Hosting + PostgreSQL + Cloudflare R2/S3 + Resend.com verified domains; local development and CI smoketests run self-contained.

## Next Focus

- Execute **DT2** (`Slice 2: Kit & Paint Master Catalog + On-Demand Scalemates Importer`) in [`docs/agile/devcycle.md`](file:///Users/rpineda/Sources/Gunpla/docs/agile/devcycle.md).
