# Status

Current live state of the project.

## Summary

- Stage: **PVT (In Progress -- DT8 & DT9 Verified)**
- Overall state: Green -- DT1 through DT9 implemented and verified via `npm run smoketest` (`25/25 checks passed`).
- Current branch or release line: `feature/dt9-google-oauth-sso` (PR against `main` on `https://github.com/rpinedaec83/Gunpla`)
- Last meaningful update: 2026-10-24

## Live Capabilities

- **AI Paint Assistant & Formulation Engine (`/api/v1/paints/ai/*`):**
  - **4-Way Chemical Medium Division:** Interactive medium selector allowing modelers to choose between **Laca** (*Mr. Color, Gaia Notes*), **Acrílico** (*Tamiya X/XF*), **Poliuretano** (*Vallejo Mecha/Model Color*), and **Montana Colors** (*MTN 94, MTN Water Based, MTN PRO* - https://www.montanacolors.com/graffiti/spray/).
  - **Cross-Brand & Spray Conversion:** Instant color matching across all 4 chemical mediums with hex swatches, line details, finish type, user Paint Rack cross-referencing (`ownedInRack`), and prioritization of the user's selected medium.
  - **Airbrush & Aerosol Spray Guide:**
    - *Laca:* Mr. Color Leveling Thinner (1:1.5 - 1:2), 12-16 PSI, organic vapor respirator, mirror finish.
    - *Acrílico:* Tamiya X-20A / IPA 90%+ (1:1), 15-20 PSI, low odor.
    - *Poliuretano:* Vallejo Thinner + Flow Improver (70:30), 18-22 PSI, zero-toxicity, maximum friction resistance for Gunpla joints.
    - *Montana Colors (Aerosoles):* Ready-to-spray canisters, recommended caps (*Pocket Cap* or *Skinny Universal Cap* for fine line misting on Gunpla), 20-25 cm spray distance with rapid sweep passes, and plastic primer precautions (MTN PRO) or MTN Water Based for indoor odorless painting.
  - **AI Recipe Generator:** Formulation engine supporting Gemini API (`gemini-3.8-flash`) and an expert local rules matrix for Gunpla anime & military palettes (*Verde Zaku II, Rojo Cometa Char, Azul Titán MK-II, Inner Frame Barbatos, Blanco RG RX-78*), generating mixing percentages or spray cans, cap recommendations, component swatches, and step-by-step airbrush/spray applications (primer, preshading, base, topcoat).
- **Interactive Personal Workbench & Workshop (`Mi Taller`):**
  - Integrated personal dashboard with live metric counters: Total Stash, Backlog (unbuilt), WIP (in progress), Built (completed), and Paint Rack inventory.
  - **Stash Management:** Add kits from master catalog, track box status (`unbuilt`, `in_progress`, `built`, `for_trade`, `wishlist`), star ratings, acquisition prices, and notes.
  - **Step-by-Step Build Logs:** Create build projects linked to kits, upload progress photos directly from browser/camera via `/api/v1/media/upload`, and add chronological stages (`unboxing`, `assembly`, `priming`, `painting`, `weathering`, `final_reveal`).
  - **Paint Rack:** Inventory control with hex color swatches and instant quantity adjustment (`+` / `-`).
- **Google OAuth 2.0 SSO & Interactive Identity Modal (`Slice 9 / DT9`):**
  - Integrated Google Identity Services (`gsi/client`) across `plamoscale.com` and `gunplajunkies.com`.
  - Interactive multi-tab Auth Modal (`#auth-modal`): 1-click Google Sign-In, credentials login with quick-login buttons for the 4 founding builders, and new account registration.
  - Client-side session management: Persistent state in `localStorage` (`plamo_sso_token`, `plamo_sso_user`), topbar profile badge with avatar and dropdown (Workbench link + Logout).
- **PostgreSQL 16 Relational Engine (`Slice 8 / DT8`):**
  - Production container `gunpla-db` (PostgreSQL 16) running with 17 relational tables, foreign key constraints, and performance indexes.
  - Dual-mode persistence engine (`apps/api/src/core/postgres.ts`): Live PostgreSQL pooling in production (`mode: 'relational-postgres'`, latency ~6ms); offline JSON fallback for zero-dependency CI smoketests.
  - System diagnostics endpoint `GET /api/v1/system/database` reporting real-time database engine, connection state, table row counts, and latency.
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
- **Homelab & Cloudflare Tunnel Status (2026-10-24):**
  - Proxmox container `atum-gunpla` (LXC 190, `10.20.30.190` / `192.168.1.190`) running Docker Compose with PostgreSQL 16 (`gunpla-db`), Central API (`gunpla-api`), PlamoScale Web (`plamoscale-web`), and GunplaJunkies Web (`gunplajunkies-web`).
  - Cloudflare Tunnel (`xcodec-lab-tunnel`) routes all endpoints with Full Strict SSL:
    - `https://plamoscale.com` & `https://www.plamoscale.com` -> `10.20.30.190:3000` (HTTP/2 200 OK)
    - `https://gunplajunkies.com` & `https://www.gunplajunkies.com` -> `10.20.30.190:3001` (HTTP/2 200 OK)
    - `https://api.plamoscale.com` & `https://api.gunplajunkies.com` -> `10.20.30.190:8080` (HTTP/2 200 OK)
  - Nameservers for both `plamoscale.com` and `gunplajunkies.com` are delegated to Cloudflare: `cruz.ns.cloudflare.com` and `dylan.ns.cloudflare.com`.
  - Resend.com domain verification for both `plamoscale.com` and `gunplajunkies.com` is **100% VERIFIED** (DKIM + SPF + DMARC).
  - Live transactional email dispatch confirmed from `noreply@plamoscale.com` and `noreply@gunplajunkies.com`.
  - Local development and CI smoketests remain 100% self-contained with offline mocks.

## Next Focus

- Phase 3 (PVT / Production Identity & Media): Configure production Google OAuth Client ID credentials in Google Cloud Console for 1-click SSO on web frontends, and configure Cloudflare R2 bucket for high-res photo uploads.
