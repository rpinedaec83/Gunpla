# Status

Current live state of the project.

## Summary

- Stage: **DVT (Complete -- DT6 & DT7 Verified)**
- Overall state: Green -- DT1 through DT7 implemented and verified via `npm run smoketest` (`23/23 checks passed`).
- Current branch or release line: `feature/dt7-marketplace-commissions` (PR against `main` on `https://github.com/rpinedaec83/Gunpla`)
- Last meaningful update: 2026-10-24

## Live Capabilities

- **Stash Marketplace & Custom Commissions (`Slice 7 / DT7`):**
  - Tenant-scoped kit marketplace (`GET /api/v1/marketplace/listings`, `POST /api/v1/marketplace/listings`).
  - Seamless publishing from personal Stash (`stashItemId`), auto-updating inventory status to `for_trade`.
  - Ownership protection on listing edits/deletes (`403 Forbidden`).
  - Featured commission builders directory (`GET /api/v1/commissions/builders`) highlighting top painters (`aperich`, `fog1labs1`, `dcampos`) with direct WhatsApp consultation buttons and portfolios.
  - Interactive "Bazar & Venta de Kits" (`#view-marketplace`) and "Comisiones de Pintura" (`#view-commissions`) views integrated in both web frontends.
- **Group Builds, Contests & Community Voting (`Slice 6 / DT6`):**
  - Interactive contest system (`GET /api/v1/contests`, `GET /api/v1/contests/:slugOrId`).
  - Personal build project submission (`POST /api/v1/contests/:id/entries`) with ownership check (`403`) and duplicate protection (`409`).
  - Community voting leaderboard (`POST /api/v1/contests/:id/entries/:entryId/vote`) with toggle vote behavior and live tallying.
  - Interactive contest cards with rules, prizes, participating build galleries, and voting buttons in both frontends.
- **Frontends Web (`apps/plamoscale-web` & `apps/gunplajunkies-web`):**
  - Implement **`UXP-01 Modern App Shell Layout`** with persistent left text-labeled sidebar, top utility bar with search & SSO status, breadcrumbs, and responsive mobile drawer.
  - **PlamoScale (`apps/plamoscale-web` on port 3000):** General scale modeling hub (Military, Aviation, Automotive, Gunpla/Mecha, Figures, Naval, Diorama) with Studio Technical palette.
  - **GunplaJunkies (`apps/gunplajunkies-web` on port 3001):** Gunpla & Mecha hub (HG, RG, MG, PG, SD, 30MM, Kotobukiya) with Cyberpunk dark aesthetic.
  - Poptrox-inspired high-resolution lightbox modal allowing full-screen inspection of the 92 migrated photos from the 4 founding builders.
  - Integrated portal switcher allowing instant one-click switching between `plamoscale.com` and `gunplajunkies.com`.
  - Community sections: Contests (*Gunpla Open Cup Peru 2026* and *PlamoScale Masters 2026*), Founding Builders portfolios, and Trusted Shops directory (`bio.txt` & WhatsApp links).
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
  - **Personal Workbench — Stash, Wishlist & Paint Rack (`/api/v1/workbench/*`):**
    - Stash tracking with status (`unbuilt`, `in_progress`, `built`, `wishlist`, `for_trade`), rating (1-5), price paid, notes, and populated kit details.
    - Paint Rack management with status (`owned`, `low_stock`, `wishlist`), automatic bottle quantity incrementing, and populated hex swatches.
    - Multi-user isolation and ownership verification (`403 Forbidden` protection).
    - Summary metrics endpoint (`GET /api/v1/workbench/summary`).
  - **Step-by-Step Build Logs, Paint Recipes & Media Upload (`/api/v1/builds/*`, `/api/v1/media/*`):**
    - Feed with tenant category scoping (`gunplajunkies` gets Gunpla/Mecha, `plamoscale` gets all scale models), filterable by category, status, builder, search.
    - Build project lifecycle (creation, updates, slug generation with collision prevention, kit linking).
    - Chronological build steps with stages (`unboxing`, `assembly`, `assembly_inner_frame`, `modification`, `priming`, `painting`, `decals`, `weathering`, `final_reveal`), photo URLs, and paint recipe usages with catalog joins.
    - Social interactions (likes toggle, comments).
    - Media upload pipeline supporting base64 data URIs, local `/uploads/` storage, and 15MB file size limit.
  - OpenAPI 3.1 contract (`/openapi.json`) & interactive Swagger UI (`/doc`) + RFC 7807 Problem Details.

## Current Constraints

- Production deployment targets `x-codec` VPS/Homelab + PostgreSQL + Cloudflare R2/S3 + Resend.com verified domains.
- **Homelab & Cloudflare Tunnel Status (2026-10-23):**
  - Proxmox container `atum-gunpla` (LXC 190, `10.20.30.190` / `192.168.1.190`) running Docker Compose with PostgreSQL 16 (`gunpla-db`) and Central API (`gunpla-api`).
  - Cloudflare Tunnel routes `api.plamoscale.com` and `api.gunplajunkies.com` directly to `10.20.30.190:8080` with Full Strict SSL.
  - Nameservers for both `plamoscale.com` and `gunplajunkies.com` are delegated to Cloudflare: `cruz.ns.cloudflare.com` and `dylan.ns.cloudflare.com`.
  - Resend.com domain verification for both `plamoscale.com` and `gunplajunkies.com` is **100% VERIFIED** (DKIM + SPF + DMARC).
  - Live transactional email dispatch confirmed from `noreply@plamoscale.com` and `noreply@gunplajunkies.com`.
  - Local development and CI smoketests remain 100% self-contained with offline mocks.

## Next Focus

- Phase 3 (PVT / Release Hardening): Root domain Cloudflare DNS CNAME routing (`@` record), production Google OAuth credentials, and automated backup schedules.
