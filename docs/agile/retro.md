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

### DT3 -- Slice 3: Personal Workbench (My Stash, Wishlist & Paint Rack) | eMOE: 3 CU | aMOE: 3 CU
What was done:
- Designed Workbench data models in `@gunpla/shared` (`StashItemRecord`, `PaintRackItemRecord`, `WorkbenchSummary`, `StashStatus`, `PaintRackStatus`, request interfaces) and PostgreSQL schema (`apps/api/sql/001_init_schema.sql`).
- Implemented Workbench slice (`apps/api/src/slices/workbench-stash/workbench.slice.ts`):
  - `GET /api/v1/workbench/summary`: Aggregated metrics for authenticated user (stash counts: unbuilt, in_progress, built, wishlist, for_trade; paint rack counts: owned, low_stock, wishlist).
  - `GET /api/v1/workbench/stash`: List builder's personal stash with populated catalog kit metadata, filterable by status.
  - `POST /api/v1/workbench/stash`: Add catalog kit to personal stash with status, price paid, notes. Validates kit existence in catalog.
  - `PATCH /api/v1/workbench/stash/:id`: Update status, rating (1-5 stars), completion date, notes. Strict ownership check (`403 Forbidden` if not owner).
  - `DELETE /api/v1/workbench/stash/:id`: Remove kit from personal stash with ownership check.
  - `GET /api/v1/workbench/paints`: List builder's paint rack with populated catalog paint details (brand, line, hex colors).
  - `POST /api/v1/workbench/paints`: Add paint to rack with quantity, notes, status (or aggregate/increment existing paint quantity).
  - `PATCH /api/v1/workbench/paints/:id`: Update rack quantity, status, notes with ownership check.
  - `DELETE /api/v1/workbench/paints/:id`: Remove paint from rack with ownership check.
- Added aliases in `auth.slice.ts` (`/register`, `/login`) to support both RESTful resources and frontend conveniences.
- Expanded automated CLI smoketest (`scripts/smoketest.mjs`) with Checks 10, 11, 12, and 13 covering full CRUD on Stash, Paint Rack, 403 Forbidden ownership protection between builders, and Workbench summary metrics.
Issues hit:
- When testing authorization isolation between builders, verified that Attempting to patch another builder's stash item strictly triggers RFC 7807 `403 Forbidden`.
Decisions made:
- When adding an already owned paint to the Paint Rack, the endpoint automatically aggregates and increments quantity (`HTTP 200 OK`) instead of creating duplicate records for the same paint bottle.
Lessons learned:
- Joining catalog metadata (`kit`, `paint`) in workbench list and detail responses eliminates N+1 roundtrips for frontend clients and mobile apps.
Usage: Moderate -- self-estimated

### DT4 -- Slice 4: Step-by-Step Build Logs, Paint Recipes & Media Upload Pipeline | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed Step-by-Step Build Log data models in `@gunpla/shared` (`BuildProjectRecord`, `BuildStep`, `BuildStepStage`, `PaintRecipeUsage`, `BuildComment`, `UploadMediaResponse`, request interfaces) and PostgreSQL schema (`apps/api/sql/001_init_schema.sql` with tables `build_projects`, `build_steps`, `build_likes`, `build_comments`).
- Implemented Build Logs and Media Storage slices (`apps/api/src/slices/build-logs/builds.slice.ts`):
  - `GET /api/v1/builds`: Multi-tenant build log feed scoped by tenant allowed categories (`gunplajunkies` receives Gunpla/Mecha/Sci-Fi builds, `plamoscale` receives both Gunpla and Military/Aviation/Automotive builds), filterable by category, status (`wip`, `completed`, `paused`, `in_progress`), builder username, and keyword search.
  - `POST /api/v1/builds`: Create build project with optional catalog kit association, slug generation with collision handling, and tenant category verification.
  - `GET /api/v1/builds/:slugOrId`: Retrieve full build project with view count increment, joined kit, chronological steps, paint recipes, likes, and comments.
  - `PATCH /api/v1/builds/:id`: Update build metadata with strict builder ownership check (`403 Forbidden`).
  - `DELETE /api/v1/builds/:id`: Delete build project with ownership check.
  - `POST /api/v1/builds/:id/steps`: Add chronological build step with stage (`unboxing`, `assembly`, `assembly_inner_frame`, `modification`, `priming`, `painting`, `decals`, `weathering`, `final_reveal`), photo URLs, and paint recipe usages with catalog paint joins.
  - `POST /api/v1/builds/:id/like`: Toggle like for authenticated user.
  - `POST /api/v1/builds/:id/comments`: Add comment to build project.
  - `POST /api/v1/media/upload`: Photo upload pipeline supporting base64 image data, storing files locally under `/uploads/` (with Cloudflare R2 / S3 adapter support) and enforcing a 15MB file size limit (Rule 5).
- Added seeded build projects (`apps/api/src/seed/seed-builds.ts`):
  - `build-rg-hi-nu-titanium`: RG Hi-Nu Gundam Titanium Finish by `aperich` with inner frame and armor painting steps.
  - `build-tiger-i-kursk-1943`: Tiger I Early Production (Battle of Kursk 1943) by `fog1labs1` with weathering and chipping steps.
- Configured static uploads serving (`/uploads/`) and RFC 7807 error middleware in `server.ts` for payload size violations (`413 Payload Too Large`).
- Updated OpenAPI 3.1 contract (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`).
- Updated automated CLI smoketest (`scripts/smoketest.mjs`) with Checks 14, 15, and 16, verifying all 16 assertions pass.
Issues hit:
- Express default body-parser returned HTML for oversized payloads; added an RFC 7807 global error handler converting `entity.too.large` into RFC 7807 `application/problem+json` `413`.
- Builder projects without pre-catalogued kits (scratch-builds, dioramas) required `kitId` to be optional, resolving category from `categoryOverride` or defaulting to `gunpla-mecha`.
Decisions made:
- Paint recipe usages automatically join catalog paint details (`brand`, `line`, `hexColor`, `code`) in the step response so frontend clients render color swatches without extra API calls.
Lessons learned:
- Enforcing tenant category boundaries on the build feed ensures `gunplajunkies.com` maintains a dedicated Mecha/Sci-Fi atmosphere, while `plamoscale.com` serves as the umbrella platform celebrating all scale modeling disciplines.
Usage: Moderate -- self-estimated

### DT5 -- Slice 5: Dual Multi-Tenant Frontends (`plamoscale.com` & `gunplajunkies.com`) with UXP-01 App Shell | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed and implemented the shared UI Shell engine in `@gunpla/shared` (`packages/shared/src/ui-shell/app-shell.ts`) strictly following `UXP-01 Modern App Shell Layout`:
  - Persistent left-side text-labeled navigation on desktop (Exploration: Showcase, Build Logs, Kit Catalog, Paints & Supplies; Workbench: Stash & Rack; Community: Founding Builders, Contests, Trusted Shops).
  - Top utility bar with global search input, portal switcher (`PlamoScale` <-> `GunplaJunkies`), primary CTA button (`+ Nueva Bitácora`), and live API status badge.
  - Breadcrumbs above clear page header with metadata and count badges.
  - Poptrox-inspired high-resolution Lightbox modal allowing builders to click any of the 92 migrated photos or build step images to view them in full resolution with titles and builder credits.
  - Responsive mobile drawer navigation with hamburger toggle for touch devices.
- Created `apps/plamoscale-web` (`PORT 3000`):
  - General scale modeling taxonomy (`All`, `Gunpla & Mecha`, `Militar 1/35`, `Aviación 1/48`, `Automotriz 1/24`, `Figuras`, `Naval`, `Dioramas`).
  - Studio Technical palette: Royal Blue accent (`#2563eb`), dark slate background (`#0b0f19`), clean typography.
  - Live API integration with graceful fallback, `/health` endpoint, and media asset proxy.
- Created `apps/gunplajunkies-web` (`PORT 3001`):
  - Gunpla grade taxonomy (`All`, `High Grade (HG)`, `Real Grade (RG)`, `Master Grade (MG)`, `Perfect Grade (PG)`, `Super Deformed (SD)`, `30MM`, `Kotobukiya`).
  - Cyberpunk Mecha palette: Crimson Red (`#ef4444`) and Neon Cyan (`#06b6d4`), void dark background (`#080c14`).
  - Direct live API integration with Gunpla-scoped build feed and kit catalog.
- Created community slice (`apps/api/src/slices/community/community.slice.ts`) exposing:
  - `GET /api/v1/contests`: Tenant-scoped group builds and competitions (*Gunpla Open Cup Peru 2026* and *PlamoScale Masters 2026*).
  - `GET /api/v1/shops`: Trusted shops directory migrated from `bio.txt` with WhatsApp links, PDF product catalogs, and verified badges.
- Authored production multi-stage Dockerfiles (`infra/Dockerfile.plamoscale-web` and `infra/Dockerfile.gunplajunkies-web`) and updated `infra/docker-compose.yml`.
- Expanded automated CLI smoketest (`scripts/smoketest.mjs`) with Checks 17, 18, and 19 verifying community endpoints, PlamoScale frontend rendering, and GunplaJunkies frontend rendering. All 19/19 checks passed.
Issues hit:
- Promise.allSettled array results required typing assertion to prevent `unknown` type conflicts when compiling `server.ts`.
Decisions made:
- Rendering the App Shell via server-side generation with embedded modern CSS and lightweight vanilla JS provides sub-50ms First Contentful Paint without client bundle overhead, perfect for the Proxmox homelab LXC container environment.
Lessons learned:
- Unifying the UXP-01 App Shell template in `@gunpla/shared` while parametrizing branding, colors, taxonomies, and portal links allowed both frontends to launch in record time with 100% design fidelity.
Usage: Moderate -- self-estimated

### DT6 -- Slice 6: Group Builds, Contest Submissions & Community Voting System | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Added `ContestEntryRecord`, `CreateContestEntryRequest`, and `VoteContestEntryResponse` to `@gunpla/shared` (`packages/shared/src/index.ts`) and updated `PlatformDatabaseState` (`apps/api/src/core/db.ts`).
- Implemented Contest and Voting slice in `apps/api/src/slices/community/community.slice.ts`:
  - `GET /api/v1/contests`: Populates each contest with approved entries and participant counts.
  - `GET /api/v1/contests/:slugOrId`: Returns contest details with joined participating build entries and kit data.
  - `POST /api/v1/contests/:id/entries`: Authenticated builder submits a personal build project to an active contest with build ownership verification (`403 Forbidden` if not owner) and duplicate submission prevention (`409 Conflict`).
  - `POST /api/v1/contests/:id/entries/:entryId/vote`: Authenticated community voting with toggle behavior (upvote / unvote) and instant tallying.
- Seeded initial contest submissions:
  - `entry-aperich-hinu-cup`: RG Hi-Nu Gundam Titanium Custom by `aperich` participating in *Gunpla Open Cup Peru 2026* with 14 community votes.
  - `entry-fog1labs1-tiger1-masters`: Tiger I Kursk 1943 by `fog1labs1` participating in *PlamoScale Masters 2026* with 18 community votes.
- Updated UXP-01 App Shell template (`packages/shared/src/ui-shell/app-shell.ts`) to render:
  - Active rules and prizes cards for each competition.
  - "🏆 Inscribir mi Bitácora al Concurso" submission CTA.
  - Participating entries gallery with cover images, builder tags, live vote count badges (`⭐ X Votos`), and interactive "Votar ⭐" buttons.
- Documented OpenAPI 3.1 endpoints in `apps/api/src/openapi/openapi-spec.ts`.
- Expanded automated CLI smoketest (`scripts/smoketest.mjs`) with Checks 20 and 21 verifying contest lookup, build entry submission, 409 Conflict duplicate protection, and community vote toggling. All 21/21 checks passed.
Issues hit:
- Contests can be referenced by either canonical ID (`contest-gunpla-cup-2026`) or URL slug (`gunpla-open-cup-2026`); normalized lookup in all route handlers to resolve both transparently.
Decisions made:
- Votes are bound to verified user IDs (`votedByUserIds`) preventing sybil voting while allowing builders to change or toggle their vote.
Lessons learned:
- Displaying participating builds directly inside each contest card creates an immediate competitive leaderboard experience that drives community engagement and inspires other builders to submit their own WIPs.
Usage: Moderate -- self-estimated

### DT7 -- Slice 7: Stash Marketplace (Bazar) & Custom Commissions Directory | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed Marketplace & Commissions data contracts in `@gunpla/shared` (`packages/shared/src/index.ts`):
  - `MarketplaceListingRecord`, `CreateMarketplaceListingRequest`, `UpdateMarketplaceListingRequest`, `BoxCondition`, `MarketplaceType`, `MarketplaceStatus`, `CommissionBuilderRecord`.
- Implemented Marketplace & Commissions slice (`apps/api/src/slices/marketplace/marketplace.slice.ts`):
  - `GET /api/v1/marketplace/listings`: Tenant-scoped kit listings (GunplaJunkies filters to mecha/scifi/figures; PlamoScale displays all disciplines), filterable by status (`active`), type (`sale`, `trade`, `both`), and keyword search. Automatically joins kit master details.
  - `POST /api/v1/marketplace/listings`: Authenticated builders publish kits. When linked to `stashItemId`, verifies ownership and automatically updates the builder's personal stash item status to `for_trade`.
  - `PATCH /api/v1/marketplace/listings/:id` & `DELETE /api/v1/marketplace/listings/:id`: Listing modifications and removals with strict ownership verification (`403 Forbidden` if not owner).
  - `GET /api/v1/commissions/builders`: Featured commission directory highlighting specialized builders (`aperich` for Master/Perfect Grade custom airbrushing, `fog1labs1` for military weathering/dioramas, `dcampos` for resin conversions/scribing) with direct WhatsApp consultation links and portfolios.
- Seeded starter marketplace listings and commission builder profiles in `seed-legacy.ts` and `apps/api/src/core/db.ts`.
- Updated UXP-01 App Shell template (`packages/shared/src/ui-shell/app-shell.ts`):
  - Added "Bazar & Venta de Kits" (`#view-marketplace`) and "Comisiones de Pintura" (`#view-commissions`) navigation items and interactive views to both `plamoscale-web` and `gunplajunkies-web`.
  - Embedded direct WhatsApp chat buttons (`contactWhatsapp`), price tags (`S/. 380 PEN`), box condition badges (`Mint / Sealed`), and commission status indicators (`Disponible para Proyectos`).
- Updated `apps/plamoscale-web/src/server.ts` and `apps/gunplajunkies-web/src/server.ts` to fetch listings and builders in parallel (`Promise.allSettled`).
- Documented OpenAPI 3.1 endpoints in `apps/api/src/openapi/openapi-spec.ts`.
- Expanded CLI smoketest (`scripts/smoketest.mjs`) with Checks 22 and 23. Verified end-to-end listing creation from stash, auto-status update to `for_trade`, 403 Forbidden protection, tenant category isolation, commission directory lookup, and frontend HTML rendering. All 23/23 checks passed.
Issues hit:
- When running forced seed (`npm run db:seed`), listings defaulted to empty array unless explicitly populated with `INITIAL_LISTINGS`; wired `INITIAL_LISTINGS` and `INITIAL_CONTEST_ENTRIES` directly into `seed-legacy.ts`.
Decisions made:
- Publishing from a user's Stash seamlessly links the physical kit in their inventory with the marketplace, removing manual duplicate entry and keeping workbench metrics synchronized.
Lessons learned:
- Direct WhatsApp community link integration significantly lowers transaction friction for regional hobbyists compared to closed in-app messaging.
Usage: Moderate -- self-estimated

### DT8 -- Slice 8: PostgreSQL 16 Relational Persistence, Schema Migration & Diagnostic Monitoring | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Expanded `apps/api/sql/001_init_schema.sql` to author all 17 production tables (`tenants`, `users`, `media_assets`, `email_outbox`, `kits`, `paints`, `stash_items`, `paint_rack_items`, `build_projects`, `build_steps`, `build_likes`, `build_comments`, `contests`, `contest_entries`, `marketplace_listings`, `commission_builders`, `shops`) and their foreign keys, constraints, and performance indexes.
- Installed `pg` and `@types/pg` in `@gunpla/api`.
- Implemented PostgreSQL persistence engine (`apps/api/src/core/postgres.ts`):
  - Connection pooling with `pg.Pool` (`max: 10`, `idleTimeout: 30s`).
  - Automated schema executor (`initPostgres`) parsing and running `001_init_schema.sql` on startup.
  - Relational synchronizer (`syncStateToPostgres`) ensuring transactional consistency across all 17 tables on database state transitions.
  - Dual-mode resilience: Connects to PostgreSQL 16 (`mode: 'relational-postgres'`) when `DATABASE_URL` is set; falls back gracefully to JSON storage (`mode: 'standalone-memory-json'`) for offline CI test environments.
- Added system diagnostic endpoint `GET /api/v1/system/database` reporting engine, mode, connection status, table row counts, and query latency (averaging 6-11ms).
- Applied schema and executed synchronization directly against `gunpla-db` (Postgres 16) in homelab LXC 190 (`atum-gunpla`). Verified 100% of rows (2 tenants, 5 users, 92 media assets, 8 kits, 23 paints, 2 builds, 5 build steps, 2 contests, 2 contest entries, 2 listings, 3 commission builders, 3 shops) populated in PostgreSQL.
- Expanded CLI smoketest (`scripts/smoketest.mjs`) with Check 24 verifying PostgreSQL diagnostic status and mode. All 24/24 checks passed.
Issues hit:
- In `marketplace_listings`, foreign key `kit_id` required kits to be seeded before listings; resolved by adjusting insertion dependency sequence and kit identifier references.
Decisions made:
- Maintaining dual-mode runtime allows CI workflows and local development to run with zero external database dependencies while production runs on PostgreSQL 16 with ACID relational guarantees.
Lessons learned:
- Logging schema synchronization events and diagnostic latencies at `/api/v1/system/database` provides immediate visibility into homelab database health without needing separate monitoring agents.
Usage: Moderate -- self-estimated

### DT9 -- Slice 9: Google OAuth 2.0 / OIDC Identity Services & Interactive SSO Modal | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Integrated Google Identity Services (`https://accounts.google.com/gsi/client`) into the UXP-01 App Shell (`packages/shared/src/ui-shell/app-shell.ts`).
- Authored the interactive multi-tab Auth Modal (`#auth-modal`):
  - Tab 1: **Google SSO** with 1-click Google Sign-In button container (`#g_id_signin`) and demo fallback.
  - Tab 2: **Credenciales de Modelistas** with email/password authentication and 1-click quick-login buttons for founding builders (`aperich`, `fog1labs1`, `dcampos`, `cluna`).
  - Tab 3: **Nuevo Registro** allowing prospective community builders to register with automatic tenant binding.
- Implemented client-side session management:
  - Persistent state in `localStorage` (`plamo_sso_token`, `plamo_sso_user`).
  - Dynamic topbar header: switches between "Iniciar Sesión" and authenticated builder profile badge (avatar image / initials, display name, dropdown with Workbench & Logout actions).
  - Configurable `googleClientId` parameter passed through `AppShellConfig` in both `plamoscale-web` and `gunplajunkies-web`.
- Expanded CLI smoketest (`scripts/smoketest.mjs`) with Check 25 verifying Google Identity script inclusion, auth container rendering, and modal tabs on both web frontends. All 25/25 checks passed.
Issues hit:
- Handled empty Google Client ID gracefully in local/development mode with an interactive demo login trigger so UI flows can be demonstrated before obtaining production OAuth consent screen verification.
Decisions made:
- Providing both Google SSO and quick-login buttons for the 4 founders in the same modal ensures frictionless access for existing community builders while onboarding new users via Google with 1 click.
Lessons learned:
- Combining Google One-Tap prompt on DOM load with an explicit modal button maximizes login conversion without intruding on casual visitors browsing the photo gallery.
Usage: Moderate -- self-estimated

### DT10 -- Slice 10: Real-Time Transactional Email Notifications via Resend & Marketplace Inquiries | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Connected real-time transactional email triggers via Resend (`sendTenantEmailViaResend`) across 4 community touchpoints:
  1. Contest Judge Scoring (`POST /api/v1/contests/:id/entries/:entryId/judge`): automatically notifies entry author with total score (e.g. 38/40 pts), 4-criteria rubric breakdown, average score, and judge feedback.
  2. Build Log Comments (`POST /api/v1/builds/:id/comments`): automatically notifies project owner when another user posts a comment on their build log, with self-notification prevention.
  3. Commission Quotation and Acceptance (`PATCH /api/v1/commissions/requests/:id`): notifies client when builder formalizes quotation (price, days, notes); notifies builder when client accepts quotation to coordinate build kickoff.
  4. Marketplace Listing Inquiries (`POST /api/v1/marketplace/listings/:id/inquiries`): endpoint allowing prospective buyers to contact sellers with questions and counter-offers via verified email.
- Authored the frontend marketplace inquiry modal (`#modal-marketplace-inquiry`) with buyer name, email, WhatsApp, offer price, and inquiry message. Added `✉️ Consultar` trigger button on marketplace cards.
- Documented new marketplace inquiry endpoint in OpenAPI 3.1 specification (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`).
- Added comprehensive automated verification in `scripts/smoketest.mjs` verifying outbox records (`GET /api/v1/notifications/outbox`) for all 4 notification types.
- Deployed and verified on homelab LXC 190 (`192.168.1.190`), with live verified email dispatch confirmation (`provider: 'resend-live'`).
Issues hit:
- Initially in smoketest, Amuro Ray was commenting on Amuro Ray's own build log, which correctly triggered self-notification suppression; updated test flow so another authenticated user (Quattro Bajeena) comments, confirming owner notification dispatch.
Decisions made:
- Preserved dual-mode email delivery: sends via live Resend API when RESEND_API_KEY is present and verified; queues into sandbox outbox during offline CI smoketests.
Lessons learned:
- Verifying the outbox endpoint directly in the regression harness provides guaranteed end-to-end proof that business triggers fire without requiring external inbox polling in test runners.
Usage: Moderate -- self-estimated

### TECH-DEBT -- Comprehensive Technical Debt Remediation & Production Hardening | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Audited and completely resolved the 4 core technical debt items across database, security, frontend architecture, and automated testing:
  1. Base de Datos y Sync Optimizada:
     - Integrated `contests`, `shops`, and `commissionBuilders` into `PlatformDatabaseState`, removing static fallback dependencies from application routers.
     - Implemented `triggerPostgresSync()` with concurrency mutex lock (`isSyncing`) and queued state (`pendingStateToSync`) to prevent parallel O(N) database lockups during concurrent write bursts.
  2. Seguridad y Hardening en Produccion:
     - Implemented production guard warning when `NODE_ENV === 'production'` and `JWT_SECRET` is unset or matches default developer secret.
     - Implemented zero-dependency sliding window rate limiter middleware (`createRateLimiter`) returning RFC 7807 429 Problem Details (`rate-limit-exceeded`) with standard `X-RateLimit-*` headers. Mounted on `/api/v1/auth` (200 req/15min) and `/api/v1/media/upload` (100 req/10min).
     - Hardened CORS origins using dynamic regular expression matching official domains (`plamoscale.com`, `gunplajunkies.com`), white-label subdomains, and development localhost.
  3. Arquitectura Frontend (Modularizacion de UI Shell):
     - Extracted `packages/shared/src/ui-shell/views.ts` (842 lines) and `packages/shared/src/ui-shell/modals.ts` (1,216 lines) from `app-shell.ts`.
     - Reduced `app-shell.ts` by 2,000 lines (from 6,217 to 4,217 lines), improving maintainability and readability.
  4. Suite de Pruebas Unitarias Aisladas (Node.js Native Test Runner):
     - Created 4 dedicated unit test suites under `tests/unit/` using `node:test` and `node:assert/strict` covering:
       - `rate-limiter.test.mjs`: sliding window tracking, remaining headers, RFC 7807 429 rejection, bypass flags.
       - `scalemates-parser.test.mjs`: URL parsing across Bandai RG, Tamiya military and aviation, fallback category scaling, error cases.
       - `age-gate.test.mjs`: Ley N 29733 age verification for adults, adolescent minors, and underage children.
       - `judge-rubric.test.mjs`: 4-criteria score validation, bounds checking, and average metric calculation.
     - Updated `package.json` with `"test:unit": "node --test tests/unit/**/*.test.mjs"` and configured `"test": "npm run test:unit && npm run smoketest"`.
- Verified all 20 unit tests and 100% of the E2E smoketest assertions pass with zero regressions.
- Synchronized code to Proxmox LXC 190 (`192.168.1.190`), rebuilt containers (`gunpla-api`, `plamoscale-web`, `gunplajunkies-web`), and verified live 200 responses.
- Pushed all atomic commits to remote branch `feature/dt9-google-oauth-sso`.
Issues hit:
- Multi-word brands in Scalemates parser required sorting `KNOWN_BRANDS` by descending key length to prevent `bandai` from matching before `bandai-spirits`.
- Extraction of views and modals into TypeScript template literal modules required strict scope typing without runtime template expression escaping.
Decisions made:
- Used Node.js native test runner (`node:test`) instead of adding Jest/Vitest dependencies to keep the monorepo lightweight, fast (111ms for all unit tests), and zero-dependency.
Lessons learned:
- Modularizing the frontend HTML templates into separate `views` and `modals` modules drastically improves IDE performance and eliminates cognitive load when modifying specific user flows.
Usage: Moderate -- self-estimated

### STOCK-ALERTS -- Trusted Shops Stock Alerts Linked to Stash Wishlist | eMOE: 3 CU | aMOE: 3 CU
What was done:
- Designed and added `ShopStockItem` and `WishlistStockAlert` models to `@gunpla/shared`, updating `ShopRecord` and `PlatformDatabaseState`.
- Implemented `GET /api/v1/workbench/wishlist-alerts` to match user stash items in wishlist status (`status: 'wishlist'`) against live shop stock (`inStock: true`).
- Supported exact `kitId` matching and fuzzy normalized token matching ignoring scale notations (e.g. `1/144`, `1/100`).
- Implemented `GET /api/v1/shops/:id/stock` and `POST /api/v1/shops/:id/stock` for inventory registration and updates with automated transactional email fanout via Resend to users having that kit in their wishlist.
- Created `shop_stock` table in PostgreSQL 16 (`apps/api/sql/001_init_schema.sql` and `apps/api/src/core/postgres.ts`) with UPSERT synchronization and runtime stats.
- Integrated UI in Workbench: `#wb-stash-alerts-badge` on Stash tab, `#wb-wishlist-alerts-banner` slot in Stash sub-tab, and wishlist cards decorated with stock status, price in PEN, discount tags, and WhatsApp direct ordering links.
- Created unit test suite `tests/unit/wishlist-alerts.test.mjs` (5 test cases) and added full end-to-end assertions in `scripts/smoketest.mjs`.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190`) with PostgreSQL 16 and live web containers.
Issues hit:
- Initial fuzzy matching strictly compared concatenated alphanumeric strings (`rghinugundam` vs `rg1144hinugundam`), which failed because of scale numbers embedded in kit names. Resolved by tokenizing and filtering out scale fractions (`\b1\/\d+\b`) and numeric scale tokens, achieving 100% test pass rate.
- Field name discrepancy between `whatsappUrl` vs `shopWhatsappUrl` in smoketest assertion; aligned to interface definition.
Decisions made:
- When a shop updates or registers new inventory (`POST /api/v1/shops/:id/stock`), an automated email fan-out runs asynchronously over all users whose wishlist includes that kit, linking directly to WhatsApp and shop catalog.
- Retained both `alerts` and `items` in `/api/v1/workbench/wishlist-alerts` JSON response for complete backwards and forwards compatibility.
Lessons learned:
- Normalizing kit titles by stripping common scale tokens (`1/144`, `1/100`, `1/72`, `1/35`) enables robust fuzzy matching even when users register kits manually without an official catalog reference.
Usage: Moderate -- self-estimated

### PAINT-EQUIVALENCES -- AI Paint Rack Equivalences Assistant & Mixer | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Expanded the expert 4-way chemical conversion matrix (`CONVERSION_DATABASE`) from 12 to 20 calibrated paint mappings across Mr. Color (Lacquer), Tamiya (Acrylic), Vallejo (Polyurethane), and Montana Colors (Spray Graffiti & Water Based).
- Implemented `findPaintEquivalences()` with real-time detection of rack ownership (`ownedInRack: true` and `rackQuantity`) by intersecting against the authenticated user's inventory.
- Added endpoint `GET /api/v1/workbench/paints/:id/equivalences` in `workbench.slice.ts` with optional `targetMedium` priority filter.
- Documented endpoint in OpenAPI 3.1 specification (`apps/api/src/openapi/openapi-spec.ts`).
- Created UI components:
  - Paint Rack toolbar with `#wb-paints-count-badge` and action button `🧪 Asistente de Equivalencias IA`.
  - Added `🔄 Equivalencias` action button directly on every paint card in the user's rack.
  - Interactive modal `#modal-paint-equivalences` featuring:
    - Code search and rack chips for 1-click equivalence lookup.
    - 4-way chemical family grid showing color swatches, finishes, ownership badges, and direct `+ Añadir a Mi Rack` buttons.
    - Tailored aerography guides with recommended dilution ratios, PSI, drying times, and pro modeling tips.
    - Dedicated AI recipe mixer tab for formulating custom colors and inspecting component availability in the builder's rack.
- Authored isolated unit test suite `tests/unit/paint-equivalences.test.mjs` (6 test cases).
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` with full coverage.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190`) with live curl assertions on API and web frontends.
Issues hit:
- None; the modularization of `views.ts` and `modals.ts` made adding the new toolbar and modal seamless without frontend regression.
Decisions made:
- Supported both direct rack item lookup (`/api/v1/workbench/paints/:id/equivalences`) and open cross-medium conversion (`/api/v1/paints/ai/convert`), both identifying the authenticated user's rack contents.
Lessons learned:
- Providing quick-select chips populated with the builder's actual inventory eliminates manual code typing and boosts adoption of equivalent formulas.
Usage: Moderate -- self-estimated

### CONTEST-HALL-OF-FAME -- Contest Community Voting Badges & Public Hall of Fame | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed and authored shared data models in `packages/shared/src/index.ts`: `ContestAwardType`, `ContestAwardBadge`, `HallOfFameItem`, and `ContestPodiumResult`.
- Added `contestBadges?: ContestAwardBadge[]` to `UserRecord` and `PublicBuilderProfile`.
- Added `hallOfFame?: HallOfFameItem[]` to `AppShellData`.
- Implemented core business logic in `apps/api/src/slices/community/community.slice.ts`:
  - `calculateContestAwards`: Calculates podium ranking (Gold 🥇, Silver 🥈, Bronze 🥉) using deterministic composite scoring (70% judge average + 30% community votes) and awards People's Choice (🏆) to the entry with highest votes.
  - `getContestAwards`: Resolves specific contest podium and people's choice.
  - `getHallOfFame`: Aggregates cross-contest podium winners with optional tenant filtering.
  - `getBuilderContestBadges`: Maps all won badges to builder usernames.
- Added API endpoints:
  - `GET /api/v1/contests/hall-of-fame`: Cross-contest Hall of Fame listing.
  - `GET /api/v1/contests/:id/podium`: Specific contest podium breakdown.
- Enriched builder profiles (`GET /api/v1/builders` and `GET /api/v1/builders/:username`) in `builders.slice.ts` with `contestBadges`.
- Documented new endpoints in OpenAPI 3.1 specification (`apps/api/src/openapi/openapi-spec.ts`).
- Updated web servers (`plamoscale-web` and `gunplajunkies-web`) to fetch `hallOfFame` during SSR initial render.
- Implemented UI components in `packages/shared/src/ui-shell/views.ts`:
  - Section `#view-contests-hall-of-fame` prominently displayed at top of `#view-contests` with cards, cover photos, awards, votes, scores, and digital diploma links (`viewCertificate`).
  - Award ribbons (`.builder-award-badge`) rendered on builder cards in `#view-builders`.
- Authored isolated unit test suite `tests/unit/contest-hall-of-fame.test.mjs` (6 test cases). Total unit test suite: 38 passed in 115ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` with full API and HTML assertions.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190`) with live curl assertions on API and both web applications.
Issues hit:
- In Express sequential routing, placed `/contests/hall-of-fame` before `/contests/:slugOrId` to prevent Express from treating `hall-of-fame` as a contest slug parameter.
Decisions made:
- Combined 70% judge rubric evaluation with 30% community votes for podium ranking, ensuring balanced representation of technical modeling mastery and popular acclaim, while also creating a distinct "People's Choice" badge for the single most voted model.
Lessons learned:
- Attaching contest badges directly to the builder's public profile gives community members permanent prestige and motivation to enter future group builds and contests.
Usage: Moderate -- self-estimated

### WHATSAPP-INQUIRIES -- Direct WhatsApp Community Inquiries on Builds & Showcase | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed and authored shared data models in `packages/shared/src/index.ts`: `WhatsAppInquiryType`, `WhatsAppInquiryRequest`, and `WhatsAppInquiryResponse`.
- Implemented core business logic in `apps/api/src/slices/build-logs/builds.slice.ts`:
  - `generateWhatsAppInquiry`: Generates structured WhatsApp deep-links with sanitized numeric phone numbers (`wa.me`) or official community group links (`chat.whatsapp.com`), tailoring the prefilled message according to 4 user intents (`paint_recipe`, `custom_commission`, `purchase_build`, `general`) and linking the canonical build URL.
  - Endpoint `GET /api/v1/builds/:slugOrId/whatsapp-inquiry` for direct inquiries from build log projects.
  - Endpoint `POST /api/v1/builds/whatsapp-inquiry` for inquiries originating from arbitrary Showcase gallery photos.
- Documented new endpoints in OpenAPI 3.1 specification (`apps/api/src/openapi/openapi-spec.ts`).
- Created UI components:
  - Added `💬 Consultar WhatsApp` button to every build project card in `#view-builds`.
  - Added `💬 Consultar al Modelista (WhatsApp)` button directly inside the high-resolution Lightbox viewer (`#lightbox-modal`).
  - Implemented interactive modal `#modal-whatsapp-inquiry` in `modals.ts` featuring topic selection, sender name, live editable message preview, and one-click WhatsApp launcher.
  - Implemented client handlers `openWhatsAppInquiryModal`, `openWhatsAppInquiryFromLightbox`, `onWhatsAppInquiryTypeChange`, and `handleWhatsAppInquirySubmit` in `app-shell.ts`.
- Authored isolated unit test suite `tests/unit/whatsapp-inquiry.test.mjs` (4 test cases). Total unit test suite: 43 passed in 151ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` with full coverage.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190`) with live curl assertions on API and both web applications.
Issues hit:
- Handled dual destination formats: individual phone numbers format cleanly to `https://wa.me/{digits}?text=...` while existing community group invite links (`chat.whatsapp.com`) are preserved directly without breaking regex sanitization.
Decisions made:
- Providing radio buttons for 4 common inquiry intents with live message preview drastically lowers friction for casual fans to contact expert builders while letting them customize their message before launching WhatsApp.
Lessons learned:
- Storing the current Lightbox context (`window.__LIGHTBOX_CURRENT`) allows seamless transition from browsing full-resolution photos directly to contacting the modeler who created them.
Usage: Moderate -- self-estimated

### BULK-IMPORT -- Herramienta de Importacion Masiva CSV / Excel para Stash & Paint Rack | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed and authored shared data models in `packages/shared/src/index.ts`: `BulkStashImportItem`, `BulkPaintImportItem`, `BulkImportRequest`, `BulkStashImportResponse`, and `BulkPaintImportResponse`.
- Implemented core business logic in `apps/api/src/slices/workbench-stash/workbench.slice.ts`:
  - `parseDelimitedText`: Robust parser supporting comma, tab, and semicolon delimiters (common in Spanish Excel exports), quoted fields, and headerless positional fallbacks (`col_0`, `col_1`, ...).
  - Normalization helpers: `inferScaleCategory` (classifying `gunpla-mecha`, `aviation`, `military`, `automotive`, `naval`), `normalizeStashStatus`, `normalizePaintStatus`, `extractStashRow`, and `extractPaintRow`.
  - Endpoint `POST /api/v1/workbench/import/stash`: Batch imports model kits to user Stash with exact/fuzzy catalog matching against `db.kits`, clean creation of custom kits (`kit-custom-...`) with `source: 'user-import'` ensuring zero dropped records, and `dryRun` preview mode.
  - Endpoint `POST /api/v1/workbench/import/paints`: Batch imports paint bottles to personal Paint Rack with code/brand catalog matching, quantity incrementing for existing bottles, custom paint fallback (`paint-custom-...`), and `dryRun` preview mode.
- Documented new endpoints in OpenAPI 3.1 specification (`apps/api/src/openapi/openapi-spec.ts`).
- Created UI components:
  - Added action buttons `📥 Importar CSV / Excel` in `#wb-subtab-stash` and `📥 Importar CSV Pinturas` in `#wb-subtab-paints`.
  - Implemented interactive modal `#modal-bulk-import` with target tabs, format instructions banner, sample loader button (`insertBulkImportSample`), file upload picker, textarea, status/stat badges, live preview table container, and confirm action.
  - Implemented client handlers in `app-shell.ts`: `openBulkImportModal`, `closeBulkImportModal`, `switchBulkImportTab`, `insertBulkImportSample`, `handleBulkImportFileUpload`, and `executeBulkImport`.
- Authored isolated unit test suite `tests/unit/bulk-import.test.mjs` (10 test cases). Total unit test suite: 54 passed in 163ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` with full coverage for dryRun, live import, and UI verification.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190`) with live curl assertions on API and both web applications.
Issues hit:
- In `dryRun` mode, ensured `items` array is still populated with simulated parsed rows so the client-side preview table renders properly before committing to database.
Decisions made:
- Autodetecting delimiters (`,`, `\t`, `;`) dynamically by analyzing first-line character frequencies guarantees seamless parsing whether a user pastes from Google Sheets, Microsoft Excel (ES/EN), or a raw CSV file.
Lessons learned:
- Incrementing bottle quantities when importing existing paints avoids rack clutter and faithfully mirrors the builder's physical restocks.
Usage: Moderate -- self-estimated

### SOCIAL-OG -- Social Sharing OpenGraph Preview Cards & Meta Tags | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed and authored shared data models in `packages/shared/src/index.ts`: `OpenGraphMetadata` and `SocialCardOptions`.
- Created vector social card generator `generateSocialCardSvg` in `packages/shared/src/ui-shell/og-card.ts`:
  - 1200x630 layout adhering to OpenGraph specifications for Facebook, WhatsApp, Telegram, Discord, and Twitter/X.
  - Multi-mode support: build project detail mode (title, subtitle, author `@username`, scale/grade pills, steps/likes counters), contest podium mode (gold/silver/bronze medalists, scores, certificates), and default tenant hub mode.
  - XML entity escaping for safe rendering of titles with quotes, ampersands, and brackets.
- Implemented `og.slice.ts` in `apps/api/src/slices/social-og/og.slice.ts` mounted at `/api/v1/og`:
  - `GET /api/v1/og/builds/:slugOrId`: Dynamic preview card for build projects.
  - `GET /api/v1/og/contests/:id`: Dynamic preview card for contest podiums.
  - `GET /api/v1/og/hall-of-fame`: Dynamic preview card for Hall of Fame gallery.
  - `GET /api/v1/og/default`: Default tenant branded preview card.
  - Real-time SVG-to-PNG rasterization using `sharp` with `Cache-Control: public, max-age=3600` and `?format=svg` fallback.
- Documented new endpoints in OpenAPI 3.1 specification (`apps/api/src/openapi/openapi-spec.ts`).
- Updated `plamoscale-web` and `gunplajunkies-web` servers with `resolveOpenGraphMetadata` for route-aware SSR meta tag injection.
- Added OpenGraph and Twitter card meta tags in `renderAppShell` (`og:site_name`, `og:title`, `og:description`, `og:image`, `og:width`, `og:height`, `og:url`, `og:type`, `twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`, `twitter:image`).
- Added interactive `🔗 Compartir` buttons across build cards and Hall of Fame with Web Share API and clipboard copy fallback (`shareSocialLink`).
- Authored isolated unit test suite `tests/unit/social-og.test.mjs` (7 test cases). Total unit test suite: 62 passed in 193ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` with full API and HTML assertions.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190`) with live curl assertions on API and both web applications.
Issues hit:
- In local smoketests, `plamoServer` and `gunplaServer` run on ephemeral random ports; ensured smoketest queries dynamic server ports instead of hardcoded 3000/3001.
Decisions made:
- Generating dynamic vector SVGs on the fly and piping them through Sharp into 1200x630 PNGs guarantees razor-sharp branding, fast generation (<10ms), and 100% compatibility with crawlers like Facebook OpenGraph scraper and WhatsApp preview bot.
Lessons learned:
- Providing route-aware meta tags directly from the server during initial SSR ensures that social crawlers (which do not execute client-side JavaScript) always extract the correct title, description, and preview image.
Usage: Moderate -- self-estimated

### DT12 -- Push Notifications & In-App Activity Bell | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed and authored shared data models in `packages/shared/src/index.ts`: `NotificationItem`, `NotificationType`, `PushSubscriptionKeys`, `PushSubscriptionRecord`, and `NotificationsListResponse`.
- Implemented backend notification slice `apps/api/src/slices/notifications-bell/notifications.slice.ts`:
  - `dispatchNotification`: Central dispatcher supporting in-app notifications and Web Push payload simulation for registered subscriptions.
  - `GET /api/v1/notifications`: List authenticated user notifications with unread count and `unreadOnly` query filtering.
  - `PATCH /api/v1/notifications/:id/read`: Mark single notification as read with ownership verification (403 for unauthorized users).
  - `POST /api/v1/notifications/mark-all-read`: Mark all notifications for authenticated user as read.
  - `POST /api/v1/notifications/push-subscribe`: Register or update Web Push subscription.
  - `DELETE /api/v1/notifications/push-subscribe`: Unregister push subscription.
  - `POST /api/v1/notifications/test`: Test notification endpoint.
- Integrated event-driven notification dispatching across key platform interactions:
  - `builds.slice.ts`: When another builder comments on a project, dispatches `build_comment` to the project author.
  - `community.slice.ts`: When a judge evaluates an entry, dispatches `contest_judged` with total rubric score to the entry owner.
  - `community.slice.ts`: When a hobby shop receives stock for a model, dispatches `wishlist_stock` to all builders with that kit in their wishlist.
  - `marketplace.slice.ts`: When a buyer sends an inquiry, dispatches `system` notification to the seller; when commissions are requested or updated, dispatches `commission_update` to builder or client.
- Added PostgreSQL schema tables in `apps/api/sql/001_init_schema.sql` (`notifications`, `push_subscriptions`).
- Updated OpenAPI 3.1 contract (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`).
- Created frontend UI components in `packages/shared/src/ui-shell/app-shell.ts`:
  - Topbar Activity Bell button (`#activity-bell-btn`) with dynamic unread counter badge (`#activity-unread-badge`).
  - Activity Dropdown drawer (`#activity-bell-dropdown`) with type-specific badges (💬, ⚖️, 🏆, 🎨, 📦, 🔔), relative time formatting ("Hace 5m", "Hace 2h", "Ayer"), and mark all as read action.
  - Interactive click handling (`handleNotificationClick`) navigating directly to the target view/modal and marking the notification as read.
  - Web Push permission banner (`#activity-push-banner`) and subscription workflow (`requestPushSubscription`).
- Added Web Push background engine in `packages/shared/src/ui-shell/pwa.ts`:
  - Service worker `push` event listener with `registration.showNotification`.
  - Service worker `notificationclick` listener with window matching, focusing, and route navigation.
- Authored isolated unit test suite `tests/unit/notifications-bell.test.mjs` (4 test cases). Total unit test suite: 66 passed in 230ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` with full notification lifecycle and HTML assertions.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190`) with live curl assertions on API and both web applications.
Issues hit:
- In `app-shell.ts`, using string quotes inside inline template literals caused an escaping issue in the rendered JS; resolved by using standard HTML5 `data-notif-id` and `data-notif-link` attributes with `this.dataset`.
Decisions made:
- Integrating notifications directly into the core user events (comments, contest scoring, wishlist stock, and commissions) guarantees immediate value for builders without requiring third-party SaaS notification dependencies.
Lessons learned:
- Combining in-app activity bell with native Web Push in the service worker gives mobile PWA users a native-like notification experience even when the browser tab is closed.
Usage: Moderate -- self-estimated

### DT13 -- Advanced Build Step Media Reordering & Multi-Photo Gallery | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed and authored shared data models in `packages/shared/src/index.ts`: `ReorderBuildStepsRequest` and `UpdateBuildStepRequest`.
- Updated OpenAPI 3.1 contract (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`) specifying `PATCH /api/v1/builds/{id}/steps/reorder`, `PATCH /api/v1/builds/{id}/steps/{stepId}`, and `DELETE /api/v1/builds/{id}/steps/{stepId}`.
- Implemented backend build log management endpoints in `apps/api/src/slices/build-logs/builds.slice.ts`:
  - `PATCH /:id/steps/reorder`: Reorders build steps based on provided `stepIds` array, recalculates sequential `orderIndex` (0, 1, 2...), preserves unmentioned steps, and enforces author ownership (403 Forbidden).
  - `PATCH /:id/steps/:stepId`: Updates step title, description, stage, and multi-photo array (`photoUrls: string[]`) with validation and timestamp tracking.
  - `DELETE /:id/steps/:stepId`: Deletes step from the build log and re-indexes remaining steps starting at 0 to guarantee continuity.
- Updated frontend UI components:
  - In `packages/shared/src/ui-shell/views.ts`: Rendered `.step-photo-gallery` thumbnails in the public builds timeline view with click-to-open lightbox support.
  - In `packages/shared/src/ui-shell/modals.ts`: Added `multiple` attribute and `#step-photo-preview-grid` to `#modal-add-step` for intuitive multi-file selection.
  - In `packages/shared/src/ui-shell/app-shell.ts`:
    - Updated `handleAddStepSubmit` to upload multiple images in sequence and associate their URLs with the new step.
    - Added `previewStepPhotos` thumbnail preview before form submission.
    - Added step order controls (`⬆️`, `⬇️`) and step deletion button (`🗑️`) with confirmation modal in user's Workbench.
    - Implemented `moveBuildStep(buildId, stepId, delta)` and `deleteBuildStep(buildId, stepId)` interacting with the new endpoints and updating Workbench view reactively.
- Authored isolated unit test suite `tests/unit/build-steps.test.mjs` (4 test cases covering reordering, multi-photo array updates, step deletion with auto-reindexing, and author authorization checks). Total unit tests: 70 passed in 230ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` with step creation, reordering, multi-photo updating, and deletion verification.
- Deployed and verified live on Proxmox LXC 190 (`192.168.1.190:8080`, `3000`, `3001`).
Issues hit:
- In `scripts/smoketest.mjs`, static Web Push token collision from previous runs was fixed by using dynamic tokens, ensuring consistent 200/201 checks.
Decisions made:
- Allowing deterministic reordering through an ordered array of IDs (`stepIds: string[]`) provides immediate drag-and-drop or button-driven reordering support without concurrency locking issues.
Lessons learned:
- Rendering multi-photo thumbnails with direct Lightbox integration significantly improves the presentation of in-progress custom Gunpla techniques like candy-coating and weathering.
Usage: Moderate -- self-estimated

### DT14 -- Community Group Builds & Collaborative Build Logs | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed and authored shared data models in `packages/shared/src/index.ts`: `GroupBuildRecord`, `GroupBuildEntry`, `GroupBuildStatus`, `CreateGroupBuildRequest`, and `JoinGroupBuildRequest`.
- Authored contract-first OpenAPI 3.1 specification (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`) for:
  - `GET /api/v1/group-builds`: List group builds with tenant and status filtering.
  - `POST /api/v1/group-builds`: Create group build with slug generation and validation.
  - `GET /api/v1/group-builds/{idOrSlug}`: Lookup details and participant entries.
  - `POST /api/v1/group-builds/{idOrSlug}/join`: Join active project with an existing build and notify the organizer.
  - `DELETE /api/v1/group-builds/{idOrSlug}/leave`: Leave group build and recalculate participants.
- Implemented dedicated slice `apps/api/src/slices/community/group-builds.slice.ts` mounted at `/api/v1/group-builds`:
  - Added starter seed projects for PlamoScale (Escuadrones del Pacifico WWII) and GunplaJunkies (Asalto a la Fortaleza Espacial A Baoa Qu).
  - Integrated `dispatchNotification` to inform group build creators when a builder joins their project.
- Added PostgreSQL schema tables in `apps/api/sql/001_init_schema.sql` (`group_builds`, `group_build_entries`).
- Updated frontend UI components:
  - In `packages/shared/src/ui-shell/views.ts`: Added subtab selector (`🏆 Concursos & Salón de la Fama` / `🤝 Proyectos Grupales`), project showcase cards, participant thumbnails, and action buttons.
  - In `packages/shared/src/ui-shell/modals.ts`: Added `#modal-create-group-build` (for organizing) and `#modal-join-group-build` (for registering active builds).
  - In `packages/shared/src/ui-shell/app-shell.ts`: Added `switchContestsSubtab`, modal management, form submissions, and dynamic build options population.
  - In web applications (`apps/plamoscale-web` and `apps/gunplajunkies-web`): Fetched and passed `groupBuilds` in server SSR.
- Authored isolated unit test suite `tests/unit/group-builds.test.mjs` (4 test cases covering listing, tenant scoping, joining, duplicate rejection, and leaving). Total unit test suite: 74 passed in 290ms.
- Extended regression smoketest in `scripts/smoketest.mjs` with full group build lifecycle and HTML element validation.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- In `app-shell.ts`, multiline template literals unescaped `\n` causing a JS syntax error during smoketest evaluation; resolved reliably using `String.fromCharCode(10)`.
Decisions made:
- Embedding Group Builds directly alongside Contests provides a cohesive community hub where competitive challenges and collaborative group builds are discovered side-by-side.
Lessons learned:
- Dynamically linking a builder's existing projects from "Mi Taller" into a group build eliminates duplicate data entry and keeps build progress in sync across personal and collective views.
Usage: Moderate -- self-estimated

### DT15 -- Barcode Scanner (JAN / EAN / UPC) & Instant Stash Registration | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed and authored shared data models and barcode utilities in `packages/shared/src/index.ts`:
  - `BarcodeFormat` (`JAN-13`, `JAN-8`, `EAN-13`, `UPC-A`, `UPC-E`, `CODE-128`, `OTHER`), `BarcodeLookupResponse`, `ScanStashRequest`, `ScanStashResponse`.
  - Pure functions: `normalizeBarcode`, `detectBarcodeFormat`, `getManufacturerHintFromBarcode` with industrial prefix heuristics (Bandai Spirits `4573102`, Bandai `4543112`/`4549660`/`4902425`, Tamiya `4950344`, Kotobukiya `4934054`, Hasegawa `4967834`, Aoshima `4905083`, Revell `4009803`, Vallejo `8429551`).
- Updated initial seed catalog kits in `apps/api/src/seed/seed-catalog.ts` with authentic JAN/EAN barcodes.
- Authored contract-first OpenAPI 3.1 specification (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`):
  - `GET /api/v1/catalog/barcode/{barcode}`: Lookup kit by barcode with format detection and manufacturer hint.
  - `POST /api/v1/workbench/stash/scan`: Instant stash registration with catalog auto-matching and on-the-fly kit auto-creation (`source: 'user-import'`).
- Implemented backend slice endpoints:
  - In `apps/api/src/slices/catalog-scalemates/catalog.slice.ts`: `GET /barcode/:barcode` with input normalization and fallback matching.
  - In `apps/api/src/slices/workbench-stash/workbench.slice.ts`: `POST /stash/scan` validating barcodes and creating stash items and catalog kits.
- Updated frontend UI in `packages/shared/src/ui-shell/`:
  - In `views.ts`: Added `📷 Escanear Caja (JAN)` button to workbench header quick actions, and an inventory action bar to `#wb-subtab-stash` with `#wb-stash-count-badge` and `#btn-scan-barcode-stash`.
  - In `modals.ts`: Authored `#modal-barcode-scanner` with video viewport, sci-fi laser scanline animation (`@keyframes laserSweep`), live status badge, camera controls, manual barcode input fallback (`#barcode-manual-input`), and dynamic result container (`#barcode-result-card`).
  - In `app-shell.ts`: Implemented camera lifecycle (`startBarcodeScannerCamera`, `stopBarcodeScannerCamera`), live continuous detection loop via `BarcodeDetector` API, manual barcode search fallback, preview card rendering with boxart, stash status selection, and one-click stash confirmation.
  - Displayed barcode tags (`🏷️ #barcode`) on stash item cards in Workbench.
- Authored isolated unit test suite `tests/unit/barcode-scanner.test.mjs` (17 test cases covering normalization, format detection, manufacturer prefix resolution, catalog matching, and instant stash auto-creation). Total unit tests: 91 passed in 370ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` verifying lookup, short barcode rejection (400 validation error), known kit scan registration, uncataloged box auto-creation, and HTML element presence.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- In `tests/unit/barcode-scanner.test.mjs`, repeated test runs previously accumulated a test kit in `db.kits`; resolved by cleaning up test barcodes in `beforeEach`.
Decisions made:
- Exporting pure barcode utilities (`normalizeBarcode`, `detectBarcodeFormat`, `getManufacturerHintFromBarcode`) in `@gunpla/shared` enabled zero-latency client-side format identification and manufacturer detection before network roundtrips.
Lessons learned:
- Combining live camera stream detection (`BarcodeDetector`) with an immediate manual input fallback ensures full accessibility across desktop webcams, mobile Safari, and devices with restricted camera permissions.
Usage: Moderate -- self-estimated

### DT16 -- Interactive 3D / AR Viewer & Diorama Studio | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed shared 3D diorama data models and helper logic in `packages/shared/src/index.ts`:
  - `DioramaLightingPreset` (`studio`, `neon`, `sunset`, `military-hangar`, `clay`), `DioramaViewMode` (`shaded`, `clay`, `wireframe`, `matcap`), `DioramaCameraAngle` (`hero`, `front`, `isometric`, `topdown`), `KitModel3dMetadata`, `KitModel3dResponse`.
  - Added `model3dUrl` and `model3dFormat` properties to `KitRecord`.
  - Pure function `resolveKitModel3d(kit)` resolving real height in meters, physical height in mm, 1:1 scale human silhouette reference in mm, mesh classification (`mecha`, `tank`, `aircraft`, `car`, `warship`, `humanoid`), diorama ground size in meters, default lighting preset, and AR support flag across all modeling scales.
- Updated initial seed catalog kits in `apps/api/src/seed/seed-catalog.ts` with `model3dFormat: 'procedural'`.
- Authored contract-first OpenAPI 3.1 specification (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`):
  - `GET /api/v1/catalog/kits/{id}/model-3d`: Lookup 3D diorama metadata for a kit.
  - `GET /api/v1/catalog/models-3d`: List all kits with 3D model support scoped to active tenant.
- Implemented backend slice endpoints in `apps/api/src/slices/catalog-scalemates/catalog.slice.ts`:
  - `GET /kits/:id/model-3d` with 404 RFC 7807 problem details when kit is not found.
  - `GET /models-3d` with multi-tenant filtering.
- Implemented WebGL 3D Diorama Studio and Web Shell UI in `packages/shared/src/ui-shell/`:
  - In `views.ts`: Added `📐 Diorama Studio 3D` quick action button in Workbench header and Stash inventory bar, and `📐 Visor 3D` on catalog cards.
  - In `modals.ts`: Authored `#modal-3d-viewer` featuring WebGL canvas viewport (`#diorama-3d-canvas`), HUD specifications badges (scale, physical mm, human reference mm, diorama base size), lighting selector (`#diorama-lighting-select`), view mode selector (`#diorama-viewmode-select`), camera angle presets, human pilot silhouette toggle (`#diorama-toggle-human`), turntable toggle (`#diorama-toggle-turntable`), HD snapshot button (`📸 Captura HD`), and mobile AR launch trigger (`📱 AR Móvil`).
  - In `app-shell.ts`: Added `📐 3D` button on stash cards, and authored the complete WebGL 1.0 Diorama Engine with Blinn-Phong vertex/fragment shaders, perspective and normal matrix mathematics, orbit controls (rotate, pan, zoom, touch support), cutting mat grid, and procedural 3D geometries for all categories (Mecha with chest vents, cockpit, V-fin, shoulders, arms, beam rifle, shield, thrusters; Tank with tracks, hull, turret, cannon; Aircraft with fuselage, canopy, wings, propeller; Car with chassis, greenhouse, spoiler, wheels; Warship with hull and triple gun turrets; Human silhouette). Added HD snapshot PNG exporter and mobile WebXR AR trigger.
- Authored isolated unit test suite `tests/unit/3d-viewer.test.mjs` (6 test cases covering dimension resolution across scales and master catalog database consistency). Total unit test suite: 97 passed in 380ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` validating 3D endpoints, 404 handling, and presence of 3D modal controls in SSR HTML.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- Shader multiline template strings in `app-shell.ts` contained literal `\n` that evaluated as unescaped newlines in client scripts during smoketest VM execution; resolved using `String.fromCharCode(10)`.
- Alert message in `triggerARViewer()` contained unescaped `\n\n`; escaped properly as `\\n\\n`.
- Initial unit test check expected 8 starter kits in an unseeded memory DB instance; updated to assert on `INITIAL_KITS` from seed definition.
Decisions made:
- Utilizing pure vanilla WebGL 1.0 with procedural geometry generation eliminated megabytes of heavy third-party 3D dependencies (like Three.js or Babylon.js), ensuring near-instant load times (<20ms initialization) while giving builders interactive 3D pose and diorama staging capabilities.
Lessons learned:
- Providing an instant 1:1 human figure silhouette standing beside the model gives scale modelers immediate intuitive comprehension of physical scale across vastly different genres (e.g. 1/144 giant robots vs 1/35 military armor vs 1/450 battleships).
Usage: Moderate -- self-estimated

### DT17 -- Build Cost Accounting & Consumables Estimator | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed project cost data models and accounting logic in `packages/shared/src/index.ts`:
  - `BuildExpenseCategory` (`kit`, `paint`, `consumable`, `aftermarket`, `decal`, `labor`, `other`), `ExpenseCurrency` (`USD`, `PEN`, `EUR`), `BuildExpenseItem`, `BuildCostSummary`, `AddExpenseRequest`, `BuildCostResponse`.
  - Added `expenses?: BuildExpenseItem[]` property on `BuildProjectRecord`.
  - Authored pure calculation helper `calculateBuildCostSummary` that computes category subtotals, labor hours, and commission pricing using a weighted formula: `(costoMateriales * 1.25) + (horasTaller * tarifaHoraria)`.
- Updated seed builds in `apps/api/src/seed/seed-builds.ts` with authentic expenses for RG Hi-Nu (kit acquisition, Mr. Color paints, Delpi Decal, and airbrushing labor hours).
- Authored contract-first OpenAPI 3.1 specification (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`):
  - `GET /api/v1/builds/{id}/costs`: Retrieve detailed expenses and summary.
  - `POST /api/v1/builds/{id}/costs`: Add an expense item with ownership validation.
  - `DELETE /api/v1/builds/{id}/costs/{expenseId}`: Remove an expense item with recomputation.
- Implemented backend slice endpoints in `apps/api/src/slices/build-logs/builds.slice.ts`:
  - `GET /:idOrSlug/costs` with hourlyRate and currency query parameters.
  - `POST /:id/costs` with requireAuth, strict user ownership check (`403 Forbidden`), and RFC 7807 input validation.
  - `DELETE /:id/costs/:expenseId` with ownership check and automatic summary recalculation.
- Implemented frontend UI components in `packages/shared/src/ui-shell/`:
  - In `modals.ts`: Authored `#modal-build-costs` featuring financial KPI cards (Total Invertido, Materiales, Horas de Taller, Cotización de Encargo Sugerida), category breakdown pills, scrollable expense list table with delete action (`🗑️`), and reactive expense registration form with contextual fields (paint bottle fractions and labor hours).
  - In `views.ts`: Added `💰 Costos & Presupuesto` quick action in Workbench header.
  - In `app-shell.ts`: Added `💰 Costos` button on each build card in `wb-builds-list`, modal open/close handlers, category toggle logic, dynamic data fetch and renderers (`loadBuildCostsData`, `renderBuildCostsUI`), expense submission, and deletion handlers.
- Authored isolated unit test suite `tests/unit/build-costs.test.mjs` (9 test cases covering empty expenses, category aggregation, commission markup calculation, hourly rates, seed database consistency, and item modification). Total unit test suite: 103 passed in 390ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` validating cost retrieval, expense addition, 403 unauthorized rejection, expense deletion, and presence of modal elements.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- In `builds.slice.ts`, `user.role` was checked instead of array property `user.roles.includes('admin')`; resolved cleanly to match `TenantUser` interface.
- In `scripts/smoketest.mjs`, unauthorized signin previously attempted a raw endpoint call without valid credentials; resolved by reusing existing `quattroData.token` for 403 assertion.
Decisions made:
- Embedding `expenses` directly on `BuildProjectRecord` allows the cost log to naturally travel with the project in both memory and PostgreSQL persistence without requiring extra relational joins on simple build queries.
Lessons learned:
- Providing an instant suggested commission formula (`materials * 1.25 + laborHours * rate`) gives scale modelers and commission builders immediate clarity when quoting custom build jobs without spreadsheets.
Usage: Moderate -- self-estimated

### DT18 -- Custom Decals & Masking Stencils Studio | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Designed decal data models and pure SVG generation engine in `packages/shared/src/index.ts`:
  - `DecalSheetSize` (`A4`, `A5`, `A6`), `DecalScale` (`1/144`, `1/100`, `1/60`, `1/35`, `1/48`, `1/24`, `custom`), `DecalPaperType` (`transparent`, `white_film`), `DecalColor` (`white`, `red`, `black`, `yellow`, `gold_metallic`, `silver_metallic`, `cyan`), `DecalElement`, `DecalSheetConfig`, `DecalSheetPreset`, `GenerateDecalSvgRequest`, `GenerateDecalSvgResponse`.
  - Defined physical millimeter dimensions in `PAPER_DIMENSIONS_MM` (A4: 210x297mm, A5: 148x210mm, A6: 105x148mm) and `DECAL_COLOR_HEX`.
  - Authored pure vector generator `generateDecalSheetSvg` with millimeter precision (`width="...mm"`, `height="...mm"`, `viewBox="0 0 W H"`), 4-corner registration crosshairs, peripheral cut guides, hazard stripes, unit numbers, pilot nameplates, kill marks, and faction emblems (Star, Zeon crest, Shield).
  - Included 5 curated decal presets: `gunpla-efsf-caution`, `gunpla-zeon-markings`, `military-tank-stencil`, `aviation-jet-lowvis`, and `racing-motorsport-numbers`.
- Authored contract-first OpenAPI 3.1 specification (`docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`):
  - `GET /api/v1/decals/presets`: List presets with category and scale filters.
  - `GET /api/v1/decals/presets/{id}`: Preset details by ID with RFC 7807 404.
  - `POST /api/v1/decals/render-svg`: Render decal sheet to structured JSON or direct raw SVG download via `Accept: image/svg+xml`.
- Implemented backend slice `apps/api/src/slices/decals/decals.slice.ts` and mounted in `apps/api/src/server.ts` at `/api/v1/decals`.
- Implemented Web UI shell in `packages/shared/src/ui-shell/`:
  - In `modals.ts`: Authored `#modal-decal-studio` featuring sheet preset selector, paper size/type/scale controls, SVG preview viewport `#decal-sheet-svg-viewport`, quick-add buttons (`+ Advertencia`, `+ Numeral`, `+ Piloto`, `+ Estrella`, `+ Zeon`, `+ Franja`), element drawer, download SVG button (`#btn-download-decal-svg`), and direct 100% scale print button (`#btn-print-decal-sheet`).
  - In `views.ts`: Added `🏷️ Decal Studio` quick action in Workbench header.
  - In `app-shell.ts`: Added `openDecalStudioModal`, `closeDecalStudioModal`, preset selection handler, config modification handler, UI renderers, element add/delete/update functions, SVG file downloader, and direct printing function.
- Authored isolated unit test suite `tests/unit/decal-studio.test.mjs` (13 test cases covering paper dimensions, presets data integrity, color mapping, SVG millimeter viewBox, registration marks, cut lines, previewMode dark backdrop contrast, and all element types). Total unit tests: 116 passed in 410ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` validating presets listing, filtering, single preset lookup, 404 RFC 7807 problem details, POST render-svg JSON, POST render-svg raw SVG download, and web shell UI controls.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- In `decals.slice.ts`, `PAPER_DIMENSIONS_MM[config.paperSize]` required an explicit type cast `config.paperSize as DecalSheetSize`.
- In `generateDecalSheetSvg`, white decals on transparent paper were invisible on standard light preview viewports; implemented `previewMode: true` displaying a `#0f172a` slate contrast backdrop while preserving `#ffffff` or clean transparent background in print mode.
Decisions made:
- Generating SVG with true CSS/SVG millimeter units (`mm`) guarantees 1:1 physical printing scale regardless of monitor DPI, preventing the classic problem where printed scale decals are accidentally shrunk or stretched by printer drivers.
Lessons learned:
- Providing pre-calculated scale stencils for Gunpla (1/144, 1/100), military armor (1/35), aircraft (1/48), and racing cars (1/24) gives scale modelers instant utility out-of-the-box without requiring complex desktop vector illustration software.
Usage: Moderate -- self-estimated

### DT19 -- AI Workbench Smart Builder Assistant (Vision AI) | eMOE: 5 CU | aMOE: 5 CU
What was done:
- Configured and validated Google AI Studio Gemini API with model `gemini-3.5-flash-lite` for multimodal text and image reasoning.
- Designed shared data models and offline heuristic analysis in `packages/shared/src/index.ts`:
  - `RunnerInspectionRequest`, `RunnerInspectionResponse`, `DetectedRunnerPart`, `RunnerPartStatus`.
  - `NubInspectionRequest`, `NubInspectionResponse`, `NubDiagnosisType`, `NubSeverity`, `NubCorrectionStep`.
  - Authored pure deterministic fallback engines `analyzeRunnerPhotoOffline` and `analyzeNubPhotoOffline`.
- Implemented backend slice `apps/api/src/slices/builder-ai/builder-ai.slice.ts` and mounted in `apps/api/src/server.ts` at `/api/v1/workbench/ai`:
  - `POST /api/v1/workbench/ai/inspect-runner`: Analyzes runner photos, identifies letter, counts remaining vs removed parts, estimates assembly completion %, and provides safety/cut recommendations.
  - `POST /api/v1/workbench/ai/inspect-nub`: Macro gate inspection scoring quality (0-100), detecting stress marks, diagnosing flaws, and generating step-by-step sanding grit sequences.
- Updated OpenAPI 3.1 specification in `docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`.
- Implemented Web UI shell components in `packages/shared/src/ui-shell/`:
  - In `modals.ts`: Authored `#modal-ai-builder-assistant` with camera/file upload, tabbed navigation (Runner vs Nub Inspector), KPI cards, parts pills, quality score dial (0-100), diagnostic badges, and step-by-step sanding sequence guide.
  - In `views.ts`: Added `🔍 Asistente IA` quick action in Workbench header.
  - In `app-shell.ts`: Added modal controls, tab switcher, camera upload handlers (`handleAiRunnerImageUpload`, `handleAiNubImageUpload`), and submit/render handlers.
- Authored isolated unit test suite `tests/unit/builder-ai.test.mjs` (10 test cases covering runner letter normalization, part status tally, completion math, nub scores, ABS/KPS plastic types, and monotonic sanding grit sequences). Total unit tests: 126 passed in 430ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` validating endpoints, RFC 7807 400 validation, and UI controls.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- When mounting `/api/v1/workbench/ai` in `server.ts`, placing it after `/api/v1/workbench` caused requests to be intercepted by `requireAuth` returning 401; mounting `/api/v1/workbench/ai` before `/api/v1/workbench` resolved the routing cleanly.
- `gemini-2.5-flash` endpoint returned a deprecation redirect to `gemini-3.5-flash-lite` / `gemini-3.8-flash`; updated API slices to use `gemini-3.5-flash-lite`, achieving sub-2s inference speeds.
Decisions made:
- Employing a hybrid architecture (Gemini 3.5 Flash multimodal vision when online with transparent offline local heuristics) guarantees 100% test suite determinism and offline PWA capability while unlocking AI vision for builders with camera feeds.
Lessons learned:
- Combining runner part remaining counts with visual completion percentages gives scale modelers a clear, motivational progress tracker during long multi-day builds.
Usage: Moderate -- self-estimated

### DT20 -- Stash Inventory & Insurance Valuation Report (Ficha de Tasacion de Inventario y Seguro Patrimonial) | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed shared data models and valuation calculation logic in `packages/shared/src/index.ts`:
  - `StashInsuranceItem`, `StashInsuranceValuationSummary`, `StashInsuranceReportConfig`.
  - Authored pure deterministic calculation logic `calculateStashValuation(items, userId, userName, preferredCurrency)` applying scale modeling valuation multipliers:
    - Built vitrines: `1.5x` (150%) acquisition price (reflects paint, primers, topcoats, aftermarket resin/photo-etch, and skilled modeling labor).
    - Unbuilt boxed stash: `1.15x` (115%) acquisition price (reflects out-of-print scarcity, P-Bandai market appreciation, and replacement inflation).
    - In progress WIP: `1.25x` (125%).
    - For trade: `1.10x` (110%).
    - Wishlist: `1.0x` (recorded for reference, excluded from active portfolio balance).
    - Brand and category aggregated breakdowns.
  - Authored pure HTML appraisal report generator `generateInsuranceReportHtml(summary, config)` producing tenant-branded A4 sheets formatted with `@page` and `@media print` CSS rules, policy reference, appraisal disclaimer, and collector/appraiser signature blocks.
- Implemented backend endpoints in `apps/api/src/slices/workbench-stash/workbench.slice.ts`:
  - `GET /api/v1/workbench/stash/export/insurance-summary`: Returns structured JSON valuation summary.
  - `GET /api/v1/workbench/stash/export/insurance-report`: Generates printable HTML appraisal sheet (`format=html`), structured JSON (`format=json`), or CSV spreadsheet download (`format=csv`).
- Updated OpenAPI 3.1 specification in `docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`.
- Implemented Web UI shell in `packages/shared/src/ui-shell/`:
  - In `views.ts`: Added toolbar button `📄 Ficha de Seguro / Tasacion` (`#btn-insurance-report-stash`) in Stash tab in Mi Taller.
  - In `modals.ts`: Authored modal `#modal-stash-insurance-report` featuring KPI valuation cards, currency selector (USD, EUR, MXN, JPY), policy number field, status filter checkboxes, itemized table preview, CSV export (`#btn-export-insurance-csv`), and printable PDF trigger (`#btn-print-insurance-pdf`).
  - In `app-shell.ts`: Added `openInsuranceReportModal`, `closeInsuranceReportModal`, `loadInsuranceValuationData`, `filterInsurancePreview`, `downloadInsuranceCsv`, and `openPrintableInsuranceReport`.
- Authored isolated unit test suite `tests/unit/stash-insurance.test.mjs` (5 test cases covering multiplier accuracy, brand/category breakdowns, price fallbacks, printable layout rendering, and wishlist filtering). Total unit tests: 131 passed in 440ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` verifying authentication protection (401), JSON summary, HTML print view, CSV export, and Web Shell UI elements.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- In `app-shell.ts`, unescaped backtick template literals inside the outer TypeScript template string caused compiler parse errors; converted all inner client string building to strict string concatenation with single quotes.
- In `workbench.slice.ts`, the edit tool initially matched two occurrences of `return res.json({ items: populated, totalCount: populated.length });` (stash and paints); promptly cleaned up the duplicated block before compilation.
Decisions made:
- Providing both a direct printable A4 HTML view (which leverages native browser PDF export with exact `@page` formatting and high-res vector CSS) and an accounting CSV download gives modelers both a legal document for insurance agents and a data file for personal spreadsheets.
Lessons learned:
- Differentiating between built showcase models (+50% for artisan labor and materials) and mint boxed stash (+15% for scarcity/inflation) accurately mirrors real-world collectibles insurance underwriting practices.
Usage: Moderate -- self-estimated

### DT23 -- Parts Breakdown & Assembly Step Cards (Generador de Fichas Técnicas & Manuales de Despiece) | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed shared data models and template generation logic in `packages/shared/src/index.ts`:
  - `SubassemblyStage` ('cut', 'cleaned', 'primed', 'painted', 'topcoated'), `SubassemblyType`, `SubassemblyCard`, `CreateSubassemblyDto`, `UpdateSubassemblyDto`, `SubassemblyOverallProgress`.
  - Implemented `generateDefaultSubassemblies`: Anatomical breakdown generator tailored to scale model genres:
    - Gunpla/Sci-Fi: 7 blocks (Cabeza, Torso, Brazos, Cintura, Piernas, Mochila, Armamento) with grade multiplier scaling parts count for RG, MG, and PG.
    - Military Armor: 5 blocks (Casco Inferior, Orugas/Tracks, Casco Superior, Torreta, Herramientas OVM).
    - Aviation: 5 blocks (Cabina, Fuselaje, Alas/Flaps, Tren de Aterrizaje, Armamento).
    - Automotive: 4 blocks (Motor/Transmisión, Chasis/Suspensión, Habitáculo, Carrocería).
  - Implemented `calculateSubassemblyOverallProgress`: Pure function computing total parts, stage progress counters, overall completion percentage, and granular phase breakdown.
  - Implemented `generateSubassemblyWorksheetHtml`: High-contrast printable A4 worksheet generating physical organizer tray cards (2x2 grid with dotted cut guides `✂️ Cortar ficha para bandeja`, kit metadata, runner tags, part counts, 5-stage checkbox matrix, and modification checklist notes).
- Extended backend API in `apps/api/src/slices/build-logs/builds.slice.ts`:
  - `GET /api/v1/builds/:id/subassemblies`: Returns subassemblies and computed progress (auto-initializes defaults if none exist).
  - `POST /api/v1/builds/:id/subassemblies`: Creates custom subassembly or bulk-generates defaults with `{ autoGenerate: true }`.
  - `PATCH /api/v1/builds/:id/subassemblies/:subId`: Updates stages, runners, parts, and notes with ownership verification.
  - `DELETE /api/v1/builds/:id/subassemblies/:subId`: Removes subassembly card.
  - `GET /api/v1/builds/:id/subassemblies/export`: Printable A4 tray cards sheet (`format=html` and `format=json`).
- Updated OpenAPI 3.1 specifications in `docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`.
- Integrated Web UI shell (UXP-01):
  - Toolbar button `📋 Fichas de Despiece` (`#btn-open-subassemblies-modal`) in Workbench header.
  - Modal `#modal-subassemblies-breakdown` with project selector, KPI summary cards (Total Subensambles, Piezas Est., Progreso General, 5-phase percentage pills), collapsible Add Subassembly drawer, dynamic interactive cards with 5-stage toggle buttons, and direct print trigger (`#btn-print-subassemblies`).
- Authored isolated unit test suite in `tests/unit/subassemblies.test.mjs` (4 tests covering category templates, grade multipliers, progress math, and HTML print generation). Total unit tests: 147 passing.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` verifying subassemblies retrieval, custom subassembly creation, stage patching, A4 HTML export, deletion, and Web Shell elements.
- Deployed and verified on Proxmox LXC 190.
Issues hit:
- In `tests/unit/barcode-scanner.test.mjs`, concurrent test execution occasionally reloaded memory DB without sample kit `kit-rg-hinu`; resolved by ensuring upsert presence in `before()` hook.
Decisions made:
- Providing physical printable tray cards directly links the digital build log to the physical workshop bench, allowing modelers to keep cut parts organized in plastic trays with tangible checklists.
Lessons learned:
- Modularizing kit building into anatomical subassemblies significantly reduces builder overwhelm on high-part-count kits (MG, PG, resin conversions) and enables systematic batch painting.
Usage: Moderate -- self-estimated

### DT22 -- Airbrush PSI & Thinner Ratio Calculator (Calculadora de Dilución y Presión de Aerógrafo) | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed shared data models and calculation engine in `packages/shared/src/index.ts`:
  - `AirbrushMedium`, `AirbrushNeedleSize`, `AirbrushTechnique`, `AirbrushMixRequest`, `AirbrushMixResult`, `AirbrushTroubleshootingItem`.
  - Implemented `calculateAirbrushMix`: Pure calculation function determining base dilution ratios, drop recipes, pressure envelopes (PSI and Bar), spraying distances, viscosity analogies, and diagnostic matrix.
  - Added chemistry rules for Lacquer (1:1.5 standard, 1:2.5 fine detail shading, 10-18 PSI), Alcohol Acrylics (1:1.2, 16-20 PSI), Vinyl Water Acrylics (1:0.8, mandatory 1-2 drops Flow Improver + Retarder per 10 drops paint to eliminate tip-dry), Enamels (1:1.0), and Polyurethane Primers (1:0.25 minimal dilution, 22-28 PSI with >=0.3mm nozzle).
  - Added dynamic climate adjustments: temperature >27°C automatically increments retarder to prevent dry spray; humidity >70% warns against blushing and mandates leveling thinner with anti-blushing agents.
- Implemented backend API slice `apps/api/src/slices/airbrush/airbrush.slice.ts` and mounted in `apps/api/src/server.ts` at `/api/v1/workbench/airbrush`:
  - `GET /api/v1/workbench/airbrush/mediums`: Returns supported paint mediums, techniques, and needle sizes.
  - `POST /api/v1/workbench/airbrush/calculate`: Calculates exact mix and returns complete parameters with RFC 7807 400 Problem Details on invalid requests.
- Updated OpenAPI 3.1 specifications in `docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`.
- Integrated Web UI components in `packages/shared/src/ui-shell/`:
  - Quick access buttons: `#btn-open-airbrush-calc` in Workbench header and `#btn-open-airbrush-from-rack` in `#wb-subtab-paints`.
  - Interactive modal `#modal-airbrush-calculator` with medium selector, needle size pills (0.15mm to 0.5mm), technique select, cup paint drops slider, workshop climate inputs, real-time ratio/pressure card, and diagnostic troubleshooting accordion.
  - Clipboard export: One-click copying of technical mix recipe with toast confirmation.
- Authored isolated unit test suite in `tests/unit/airbrush-calculator.test.mjs` (5 test cases covering constant validation, lacquer recipes, acrylic water additives, needle & climate adjustments, and input validation). Total unit tests: 143 passing.
- Extended end-to-end integration smoketest in `scripts/smoketest.mjs` asserting API responses, 400 Problem Details, and Web Shell UI elements.
- Deployed to Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- In `app-shell.ts`, multiline recipe string in clipboard function used unescaped `\n` which evaluated at TS compile time to literal newlines, causing `SyntaxError: Invalid or unexpected token` in client VM; resolved by escaping as `\\n`.
Decisions made:
- Embedding troubleshooting diagnostics (orange peel, tip-dry, spider webbing, splattering, dry spray) directly inside the calculation card gives modelers actionable instant guidance without having to browse external forums while painting at their booth.
Lessons learned:
- Flow improver and drying retarder are critical for water-based acrylics in scale modeling; calculating them proportionally to paint drops ensures smooth spraying and prevents clogged needles.
Usage: Moderate -- self-estimated

### DT21 -- Workshop Soundscapes & Procedural Audio Generator (Pistas de Sonido y Soundscapes de Taller) | eMOE: 4 CU | aMOE: 4 CU
What was done:
- Designed shared data models and soundscape presets in `packages/shared/src/index.ts`:
  - `SoundscapePresetId`, `SoundscapeCategory`, `SoundscapeLayer`, `SoundscapePreset`, `SoundscapeTimerMode`, `SoundscapeSessionState`.
  - Defined 5 presets: `lluvia-taller`, `compresor-aerografo`, `hangar-mecha`, `lo-fi-beats`, `jardin-zen`.
  - Authored lookup and timer helpers `getAllSoundscapePresets`, `getSoundscapePreset`, and `calculateTimerSeconds`.
- Implemented backend API slice `apps/api/src/slices/soundscapes/soundscapes.slice.ts` and mounted in `apps/api/src/server.ts` at `/api/v1/workbench/soundscapes`:
  - `GET /api/v1/workbench/soundscapes/presets`: Lists presets with category filtering.
  - `GET /api/v1/workbench/soundscapes/presets/:id`: Single preset details with RFC 7807 404 Problem Details.
  - `GET /api/v1/workbench/soundscapes/timer-modes`: Lists supported Pomodoro and focus session intervals.
- Updated OpenAPI 3.1 specification in `docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`.
- Implemented client-side Web Audio API synthesis engine and UI components in `packages/shared/src/ui-shell/`:
  - Procedural sound generation without audio files: Brownian noise (rain), resonant filtered pink noise (airbrush air hiss & compressor hum), sub-bass drone oscillators (mecha hangar), vinyl crackle + Rhodes chords (lo-fi beats), swept bandpass + singing bowl sine (zen garden).
  - Multichannel audio mixing: Independent gain nodes per layer with reactive volume sliders.
  - Pomodoro timer: 25m, 45m, 60m focus sessions with dual chime harmonic notification (D5 + A5).
  - Web UI modal `#modal-soundscapes` with preset selector cards, layer volume mixer, and Pomodoro controls.
  - Floating persistent dock `#workshop-soundscape-widget` in Mi Taller with play/pause, title, timer countdown, and master volume slider.
  - Quick action button `🎵 Soundscapes` (`#btn-open-soundscapes`) in Workbench toolbar.
- Authored isolated unit test suite `tests/unit/soundscapes.test.mjs` (4 test cases covering presets data integrity, individual lookup, Pomodoro intervals math, and acoustic category coverage). Total unit tests: 138 passed in 380ms.
- Extended end-to-end regression smoketest in `scripts/smoketest.mjs` verifying preset listing, category filtering, single preset retrieval, 404 RFC 7807 response, timer modes, and Web Shell UI elements.
- Deployed and verified on Proxmox LXC 190 (`192.168.1.190:8080`, `:3000`, `:3001`).
Issues hit:
- In `app-shell.ts`, inline `oninput="setSoundscapeLayerVolume('...'"` had nested quote escaping issues in generated HTML; resolved cleanly by using HTML5 data attribute `data-layer-id` with `setSoundscapeLayerVolume(this.dataset.layerId, this.value)`.
Decisions made:
- Utilizing 100% procedural Web Audio API synthesis avoids heavy MP3 downloads, copyright/licensing pitfalls, and network latency, enabling instant offline soundscapes within the Progressive Web App (PWA).
Lessons learned:
- Combining ambient workshop soundscapes directly with a Pomodoro session countdown encourages healthy building habits (e.g. taking breaks to stretch, avoiding eyestrain and cleaning airbrush nozzles).
Usage: Moderate -- self-estimated
