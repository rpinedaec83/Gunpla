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
