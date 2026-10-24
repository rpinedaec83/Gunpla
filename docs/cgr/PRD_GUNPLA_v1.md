# PRD: PlamoScale & GunplaJunkies Multi-Tenant Scale Modeling Platform

## Document Control

- `[MANDATORY]` Project: Gunpla & PlamoScale Multi-Tenant Scale Modeling Platform (`GUNPLA`)
- `[MANDATORY]` Version: v1.0
- `[MANDATORY]` Owner: Roberto Pineda (`x-codec` / `rpineda@x-codec.net`)
- `[MANDATORY]` Status: Approved for EVT
- `[MANDATORY]` Last Updated: 2026-10-23
- `[MANDATORY]` Related MRD: [MRD_GUNPLA_v1.md](file:///Users/rpineda/Sources/Gunpla/docs/cgr/MRD_GUNPLA_v1.md)
- `[OPTIONAL]` Related ESD: [ESD_GUNPLA_v1.md](file:///Users/rpineda/Sources/Gunpla/docs/cgr/ESD_GUNPLA_v1.md)
- `[OPTIONAL]` Related traceability map: [MRD-PRD-ESD-TRACEABILITY.md](file:///Users/rpineda/Sources/Gunpla/docs/cgr/MRD-PRD-ESD-TRACEABILITY.md)

---

## MRD Linkage

- `[MANDATORY]` **Source MRD needs:** Eliminate manual static code edits on `plamoscale.com` (PP1), enrich build photos with structured kit/scale/paint metadata (PP2), provide a modern workbench-friendly UX inspired by Scalemates (PP3), and unify `plamoscale.com`, `gunplajunkies.com`, and future B2B clients under one multi-tenant API with shared SSO identity (PP4).
- `[MANDATORY]` **Target segments:**
  - **S1:** Gunpla, Mecha & Sci-Fi Builders (`gunplajunkies.com`) — P0
  - **S2:** General Scale Modelers in Peru/Latam (`plamoscale.com`) — P0
  - **S3:** Hobby Clubs, Contest Organizers & B2B White-Label Portals — P1
  - **S4:** Trusted Hobby Shops & Custom Commission Painters — P1
- `[MANDATORY]` **Differentiation thesis:** One central API and shared user identity powering multiple specialized portals (`plamoscale.com` for all scale models, `gunplajunkies.com` for Mecha/Gunpla, plus B2B white-label club/event portals), combining Scalemates-grade catalog structure with step-by-step visual build logs and paint recipes.
- `[MANDATORY]` **MRD success metrics:** `SM1` (100% migration of 4 founding builders & ~92 photos), `SM2` (1 API serving >=2 tenant fronts with SSO), `SM3` (<5 min self-service build log creation), `SM4` (4/4 founding builder UAT sign-off), `SM5` (>=100 builders & >=300 projects/stash items within 90 days post-GA).
- `[MANDATORY]` **PRD release objective:** Deliver the multi-tenant API and two production frontends (`plamoscale.com` and `gunplajunkies.com`) using Vertical Slice Development so builders can manage their stash/paints, import kit metadata from Scalemates, publish WIP/Completed build logs, participate in group builds/contests, and connect with trusted shops.

---

## Scope Summary

- `[MANDATORY]` **In-scope summary (Release v1 - Vertical Slices):**
  1. **Slice 1 — Multi-Tenant Core, SSO Auth & Legacy Seed Migration:** Tenant registry (`plamoscale`, `gunplajunkies`, custom B2B tenants), unified JWT SSO authentication, RBAC (`user`, `moderator`, `tenant_admin`, `admin`), and automated migration of the 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`), their ~92 photos, and `bio.txt` community links.
  2. **Slice 2 — Kit & Paint Catalog + Scalemates Bridge:** Searchable master database of model kits (brand, scale, grade/category, kit number, release year, boxart, PDF manual link, Scalemates reference URL) and paints/tools, including an on-demand Scalemates URL/metadata importer.
  3. **Slice 3 — Personal Workbench (My Stash, Wishlist & Paint Rack):** Builder inventory tracker for unbuilt/in-progress/built kits, wishlist items, and owned paints/supplies.
  4. **Slice 4 — Step-by-Step Build Logs (WIP to Completed) & Media Pipeline:** Creation of build projects linked to a catalog kit, chronological WIP steps (assembly, scribing, primer, paint recipe used, decals, weathering), direct image upload to S3/R2 with automatic WebP thumbnail/full generation, and portal-specific visibility (`plamoscale.com` vs `gunplajunkies.com`).
  5. **Slice 5 — Social Showcase, Builder Portfolios & Community Hub:** Public galleries (evolving the HTML5 UP Multiverse lightbox experience within the `UXP-01` app shell), builder profiles with Instagram/TikTok/FB links, likes, comments, and Mailchimp newsletter integration.
  6. **Slice 6 — Group Builds, Contests & Club Events:** Tenant-scoped competitions and group builds where users submit build logs, moderators verify rules, and judges/community vote.
  7. **Slice 7 — Trusted Shops Directory, Marketplace & Commissions:** Evolution of the `bio.txt` trusted shops catalog into a structured directory of verified hobby stores, plus user-to-user kit exchange and custom painting commission listings.
- `[MANDATORY]` **Out-of-scope summary:** Native iOS/Android App Store binaries (v1 uses responsive Web / PWA), automated payment gateway escrow processing (v1 marketplace/commissions connect buyers and sellers directly via verified social/WhatsApp links), and full automated scraping of the entire 1M+ Scalemates database in bulk (v1 imports kits on-demand by URL/search and community curation).
- `[MANDATORY]` **Release boundary:** EVT covers Slices 1–5; DVT Pilot validates Slices 1–5 with the 4 founding builders while completing Slices 6–7 for PVT/GA rollout.
- `[OPTIONAL]` **Future scope (v2):** Automated payment processing for B2B white-label self-service checkout, AI color-matching assistant from workbench photos, and printable QR code spec sheets for physical IPMS/Gunpla contest tables.

---

## Goals

| Goal ID | Goal | MRD Mapping | Success Metric | Priority |
|---|---|---|---|---|
| **G1** | Operate a single multi-tenant API serving both `plamoscale.com` and `gunplajunkies.com` (and future tenants) with shared SSO user accounts. | PP4, SM2 | 1 API deployment serving >=2 tenant domains with <250ms p95 API latency | P0 |
| **G2** | Preserve and migrate 100% of existing `plamoscale.com` builders, ~92 photos, mission/vision, and `bio.txt` community assets into structured records. | PP1, SM1 | 4 builders + 92 photos accessible via API and rendered on `plamoscale.com` | P0 |
| **G3** | Enable self-service kit lookup/import from Scalemates and structured tracking of personal Stash and Paint Rack. | PP2, PP3, SM3 | Builders can import or create a kit and add it to Stash/Build Log in <60 seconds | P0 |
| **G4** | Empower builders to publish rich step-by-step Build Logs (WIP -> Completed) with high-res photos and paint recipes. | PP1, PP2, SM3, SM4 | <5 min end-to-end build publication; 4/4 pilot builders pass UAT | P0 |
| **G5** | Foster community engagement through Tenant Contests/Group Builds and a Trusted Shops & Commissions Directory. | S3, S4, SM5 | >=1 active group build/contest and >=5 trusted shops listed at GA | P1 |

---

## Non-Goals

- `[MANDATORY]` **Non-goal 1:** Building an in-house e-commerce shopping cart, shipping calculator, or credit card escrow system in v1 (shop and marketplace listings use direct contact/external store links).
- `[MANDATORY]` **Non-goal 2:** Maintaining separate backend codebases or separate user credentials for `gunplajunkies.com` and `plamoscale.com`.

---

## Personas And Use Cases

| Use Case ID | Actor | Trigger | Expected Result | Exception Or Error Path | Priority | MRD Mapping |
|---|---|---|---|---|---|---|
| **U1: Multi-Tenant SSO Registration & Sign-In** | Builder / Visitor | Clicks "Sign Up / Sign In" on `plamoscale.com` or `gunplajunkies.com`. | Account is created once; user is authenticated across portals with a tenant-aware JWT session and personal profile URL. | Duplicate username/email returns RFC 7807 `409 Conflict` with clear field validation error. | P0 | PP4, SM2 |
| **U2: Legacy Portfolio Exploration** | Visitor | Opens `plamoscale.com` or `gunplajunkies.com` home showcase. | Sees responsive gallery of builds (seeded with `aperich`, `dcampos`, `cluna`, `fog1labs1` on PlamoScale, and Mecha/Gunpla builds on GunplaJunkies) with lightbox zoom, builder social links, and kit tags. | If a tenant filter has no builds for a selected category, renders a helpful empty state with "Publish the first build in this category" CTA. | P0 | PP1, SM1 |
| **U3: Scalemates Kit Lookup & Import** | Builder | Searches for a kit in the catalog or pastes a Scalemates kit URL when starting a project/stash item. | System returns matching kit from local DB or fetches/parses kit title, brand, scale, kit number, year, and boxart from the Scalemates reference and saves it to the shared catalog. | If external URL is unreachable or invalid, prompts user with a pre-filled manual kit creation form so their workflow is never blocked. | P0 | PP2, PP3, SM3 |
| **U4: Stash & Paint Rack Management** | Builder | Navigates to "My Workbench" -> "My Stash" or "Paint Rack". | Adds kits (status: `Unbuilt`, `In Progress`, `Built`, `Wishlist`) and paints (brand, code, name, finish, status: `Owned`, `Need to Buy`). | Invalid or duplicate entry in user's rack warns user and increments quantity instead of creating duplicate rows. | P0 | PP2, PP3 |
| **U5: Step-by-Step Build Log & Photo Upload** | Builder | Clicks "+ New Build / WIP", selects a kit, adds build steps, tags paints used, and uploads photos. | Images are validated, converted/resized into `thumb` (400px WebP) and `full` (1920px WebP), stored in R2/S3, and published to matching portals (e.g., Gunpla builds appear on both `gunplajunkies.com` and `plamoscale.com`). | Unsupported file type (>15MB or non-image) is rejected client- and server-side with `413`/`415` RFC 7807 error. | P0 | PP1, PP2, SM3, SM4 |
| **U6: Social Interaction (Likes, Comments & Share)** | Builder / Visitor | Views a Build Log or Showcase card and clicks Like, posts a comment, or clicks the builder's IG/TikTok link. | Like counter increments atomically; comment appears under the build step/project; external social links open safely in new tab. | Unauthenticated user clicking Like/Comment is prompted with non-destructive login modal; rate limiter blocks comment spam (`429`). | P1 | EV7, SM5 |
| **U7: Group Build / Contest Submission** | Builder & Tenant Admin | Tenant Admin creates a contest (e.g., "Torneo Gunpla Perú 2026"); Builder submits an eligible Build Log. | Submission is linked to the contest with mandatory verification photos; after deadline, judges/users score entries and winners are badged. | Submissions outside contest dates or wrong scale/category are rejected with clear eligibility explanation. | P1 | S3, SM5 |
| **U8: Trusted Shops & Commission Directory** | Visitor / Shop Owner | Browses "Trusted Shops & Marketplace" or submits a commission/kit listing. | Displays verified hobby stores (including `bio.txt` catalog links), active commission painters, and kit sale/trade posts filtered by country/tenant. | Unverified shop submissions stay in `Pending Moderation` queue until approved by `moderator`/`admin`. | P1 | EV1, S4 |

---

## Functional Requirements

| Requirement ID | Priority | Requirement Statement | Source MRD Item | Rationale | Acceptance Criteria | Verification Method | Status |
|---|---|---|---|---|---|---|---|
| **FR1** | P0 | The API MUST support multi-tenant resolution via request header (`X-Tenant-Slug`) or domain origin (`plamoscale.com`, `gunplajunkies.com`, and future B2B domains) from a single backend deployment. | PP4, SM2 | Enables 1 API to power N specialized frontends without code duplication. | `GET /api/v1/tenants/current` returns tenant branding, allowed categories (`all` for PlamoScale, `mecha-gunpla` for GunplaJunkies), and metadata based on header/host. | Automated API Smoketest & Integration Test | Draft |
| **FR2** | P0 | The platform MUST provide unified SSO authentication (Sign Up, Sign In, Sign Out, Token Refresh) and RBAC (`user`, `moderator`, `tenant_admin`, `admin`). | EV3, PP4, SM2 | Replaces legacy `gunplajunkies.com` `empresaId` lock-in with cross-portal SSO while preserving role governance. | A user registered on `plamoscale.com` can authenticate on `gunplajunkies.com` with the same credentials; protected routes enforce role checks (`401`/`403`). | Automated Auth Smoketest | Draft |
| **FR3** | P0 | The platform MUST provide a master Kit & Paint Catalog with search/filter by brand, scale, grade/category, and an on-demand Scalemates metadata importer/linker. | EV6, PP2, SM3 | Gives builders immediate access to accurate kit taxonomy without manual data entry from scratch. | `POST /api/v1/catalog/kits/import-scalemates` extracts or accepts kit metadata (name, brand, scale, kit#, year, boxart URL, Scalemates URL) and stores deduplicated record; `GET /api/v1/catalog/kits` filters by category/query. | Automated API Test & UAT | Draft |
| **FR4** | P0 | The platform MUST allow authenticated builders to manage their personal Stash (unbuilt/WIP/built/wishlist kits) and Paint Rack (owned/needed paints & tools). | PP2, PP3, SM3 | Core workbench utility that drives repeat builder engagement. | User can CRUD stash items (`POST/GET/PATCH/DELETE /api/v1/workbench/stash`) and paint rack items (`/api/v1/workbench/paints`) linked to catalog IDs. | Automated API Test & UAT | Draft |
| **FR5** | P0 | The platform MUST allow builders to create, edit, and publish Build Logs (`WIP` or `Completed`) containing chronological build steps, techniques, linked paint recipes, and high-resolution photo galleries. | PP1, PP2, SM3, SM4 | Core value proposition replacing static image folders with living project documentation. | Builder can create a build project, attach >=1 step with paint tags and photos, toggle status `WIP`/`Completed`, and view it in the public gallery. | Automated E2E / API Test & Pilot UAT | Draft |
| **FR6** | P0 | The platform MUST include an automated seed & migration script that imports the 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`), their social networks, ~92 build photos (fixing the `script.js` index bug and missing `17–22` images), mission/vision, and `bio.txt` community links. | EV1, EV2, SM1 | Guarantees zero data loss from the existing `plamoscale.com` repository and populates the platform from day one. | Running the seed script populates all 4 builder accounts, social URLs, and 100% of valid image pairs (`thumbs/` and `fulls/`) visible on `plamoscale.com`. | CLI Seed Smoketest & Visual UAT | Draft |
| **FR7** | P0 | The media upload pipeline MUST validate image uploads, generate optimized `thumb` and `full` WebP/JPEG variants, and store them in S3-compatible object storage (Cloudflare R2) with local filesystem fallback for offline dev. | R2, PP1 | Protects VPS storage and ensures fast gallery loading on mobile and desktop. | Uploading an image returns both `thumbUrl` and `fullUrl` served via CDN/storage and renders in <1.5s. | Automated Upload Smoketest | Draft |
| **FR8** | P0 | The two web frontends (`plamoscale.com` and `gunplajunkies.com`) MUST implement the `UXP-01 Modern App Shell Layout` adapted to their brand identity and category filters (`plamoscale.com` = all scale modeling; `gunplajunkies.com` = Mecha/Gunpla/Sci-Fi). | EV4, SM2 | Delivers distinct community identities powered by shared UI components and a single API. | Both frontends render persistent left navigation, top utility bar, breadcrumbs, page header, and responsive mobile drawer, consuming the same API endpoints. | UI Smoketest & Pilot UAT | Draft |
| **FR9** | P1 | The platform MUST support social portfolio interactions including public builder profiles (`/@username`), social network badges (IG, TikTok, FB), project likes, and moderated comments. | EV2, EV7, SM5 | Connects the builder's structured portfolio with their existing social media presence. | Visitors can view `/@aperich`, `/@dcampos`, `/@cluna`, `/@fog1labs1`, click their social links, and authenticated users can like/comment on builds. | API & UI Test | Draft |
| **FR10** | P1 | The platform MUST support Tenant Group Builds and Contests, including contest creation, eligibility rules, builder entry submission, and winner showcases. | S3, SM5 | Enables clubs, events, and future B2B tenants to run modeling competitions directly on the platform. | `tenant_admin` can create a contest; builders can submit a build log; contest page lists entries and results. | API & UAT Test | Draft |
| **FR11** | P1 | The platform MUST provide a Trusted Shops Directory & Community Marketplace (stores, kit buy/sell/trade, and painting commissions) seeded with the `bio.txt` community resources and Mailchimp newsletter opt-in. | EV1, S4, SM5 | Preserves and upgrades the commercial and community directory from `plamoscale.com`. | Users can browse verified shops, filter commission painters, and subscribe via the Mailchimp integration. | API & UI Smoketest | Draft |
| **FR12** | P0 | The API MUST expose live OpenAPI 3.1 documentation (`/doc` and `/openapi.json`) and return standardized RFC 7807 Problem Details for all error responses. | EV3, Atlas API-First | Preserves and upgrades the `/doc` Swagger capability from `gunplajunkies.com` for AI Pair Programming and contract testing. | `GET /doc` renders Swagger UI; `GET /openapi.json` returns valid OpenAPI 3.1 JSON; error responses match `application/problem+json`. | Automated OpenAPI Smoketest | Draft |

---

## Non-Functional Requirements

| Requirement ID | Category | Requirement Statement | Target Or Limit | Verification Method | ESD Input |
|---|---|---|---|---|---|
| **NFR1** | Performance | API read endpoints (gallery, catalog search, profile) MUST respond rapidly under normal load. | p95 latency < 250 ms; p99 < 500 ms | Automated benchmark / smoketest timing | Indexed PostgreSQL queries + pagination |
| **NFR2** | Performance | Frontend gallery pages MUST optimize Largest Contentful Paint (LCP) using lazy-loaded thumbnails (`thumbs/`) and responsive images. | LCP < 2.5s on 4G/Desktop | Lighthouse / Chrome DevTools check | Thumbnail/Full image split + CDN caching |
| **NFR3** | Security | Passwords MUST be hashed with bcrypt (cost >=10) or Argon2; JWT tokens MUST have short expiration with refresh rotation; all inputs validated via strict schema (Zod/TypeBox). | 0 unvalidated inputs; 0 plaintext secrets in git | Automated security test & `atlas validate` | Auth middleware + Zod/TypeBox schemas |
| **NFR4** | Reliability | The API MUST expose a `/health` and `/ready` endpoint verifying database and storage connectivity. | 99.5% uptime target on x-codec VPS | Healthcheck script (`scripts/smoketest.ps1` / `.sh`) | Health slice & process supervisor |
| **NFR5** | Scalability | Media storage MUST be decoupled from the application server via S3-compatible storage (Cloudflare R2) so disk usage on the VPS stays flat. | < 2 GB local VPS disk used by app code | Storage configuration check | S3/R2 storage adapter |
| **NFR6** | Accessibility | Both frontends MUST maintain keyboard navigation, visible focus states, alt text on build images, and WCAG AA contrast ratios. | >= 90 Lighthouse Accessibility score | Automated a11y audit | `UXP-01` semantic HTML shell |
| **NFR7** | Supportability | Codebase MUST be organized in Vertical Slices within a TypeScript monorepo so any feature can be understood, tested, and modified independently by human + AI pair programmers. | 100% of features mapped to self-contained slices | Codebase structure inspection | Monorepo + Vertical Slice layout |
| **NFR8** | Cost | Infrastructure MUST run within existing `x-codec` VPS capacity plus Cloudflare R2 free/low-cost tier during EVT/DVT/GA. | < $15/month incremental cloud cost at launch | FinOps / billing review | R2 zero-egress + single Postgres instance |

---

## UX And Workflow Requirements

- `[MANDATORY]` **Primary workflows:**
  1. **Explore & Discover (`UXP-01` Shell):** Left sidebar with clear text navigation (`Showcase Gallery`, `Kit Catalog`, `Paint & Tools`, `My Stash & Rack`, `Build Logs`, `Contests & Clubs`, `Trusted Shops & Commissions`). Top bar with global Kit/Paint Search, Portal Switcher (`PlamoScale` <-> `GunplaJunkies`), and primary `+ New Build Log` CTA.
  2. **Workbench Quick-Log Flow:** Mobile-friendly modal/drawer allowing a builder at their desk to snap/select 1–5 WIP photos, pick the active build log, tag paints used from their rack, and publish in <60 seconds.
- `[MANDATORY]` **Permissions and role behavior:**
  - `Anonymous Visitor`: Can browse public showcase galleries, kit/paint catalog, builder profiles, contests, and trusted shops.
  - `Authenticated Builder (user)`: Can manage personal Stash/Paint Rack, create/edit own Build Logs, import kits to catalog, like/comment, and enter contests.
  - `Moderator (moderator)`: Can edit catalog metadata, moderate comments/uploads, and verify trusted shop/marketplace listings.
  - `Tenant Admin (tenant_admin)`: Can customize portal branding, manage tenant contests/group builds, and feature builds on that tenant's homepage.
  - `Platform Admin (admin)`: Full system access across all tenants, users, and roles.
- `[MANDATORY]` **Empty states:** Every list (Stash, Paint Rack, Build Logs, Filtered Gallery, Contests) MUST display a clear illustration/icon, explanation, and a direct primary action button (e.g., *"Your Stash is empty — Search the Kit Catalog or import from Scalemates to add your first box"*).
- `[MANDATORY]` **Loading states:** Skeleton placeholders matching card/table dimensions during data fetches; progress bars with percentage during multi-photo uploads.
- `[MANDATORY]` **Error states:** Inline form validation errors and toast/banner notifications powered by RFC 7807 `title` and `detail` fields, with a retry action.
- `[CONDITIONAL]` **Accessibility expectations:** Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`), ARIA labels on lightbox controls, and automatic `alt` text generated from `"{Kit Name} built by {Builder Name} - Step {N}"`.
- `[OPTIONAL]` **User-visible copy constraints:** Bilingual-ready (Spanish default for `plamoscale.com`, English/Spanish toggle for `gunplajunkies.com`).

---

## Data And API Requirements

- `[MANDATORY]` **Key entities:** `Tenant`, `User`, `Role`, `BuilderProfile`, `Brand`, `ScaleKit`, `Paint`, `StashItem`, `UserPaint`, `BuildProject`, `BuildStep`, `BuildStepPaint`, `MediaAsset`, `Like`, `Comment`, `Contest`, `ContestEntry`, `TrustedShop`, `MarketplaceListing`.
- `[MANDATORY]` **Data lifecycle:** User accounts, catalog items, and published build logs are retained indefinitely unless deleted by the owner (GDPR/privacy soft-delete for 30 days, then hard purge of R2 media objects).
- `[CONDITIONAL]` **APIs exposed:** RESTful JSON API under `/api/v1/*` with OpenAPI 3.1 specification at `/openapi.json` and interactive Swagger UI at `/doc`:
  - `GET /api/v1/health`
  - `GET /api/v1/tenants/current` & `GET /api/v1/tenants`
  - `POST /api/v1/auth/signup`, `POST /api/v1/auth/signin`, `POST /api/v1/auth/signout`, `GET /api/v1/auth/me`
  - `GET /api/v1/catalog/kits`, `POST /api/v1/catalog/kits`, `POST /api/v1/catalog/kits/import-scalemates`
  - `GET /api/v1/catalog/paints`, `POST /api/v1/catalog/paints`
  - `GET/POST/PATCH/DELETE /api/v1/workbench/stash` & `/api/v1/workbench/paints`
  - `GET/POST/PATCH/DELETE /api/v1/builds` & `/api/v1/builds/:id/steps`
  - `POST /api/v1/media/upload`
  - `GET /api/v1/builders/:username`
  - `GET/POST /api/v1/contests` & `/api/v1/shops`
- `[CONDITIONAL]` **APIs consumed:**
  - Public Scalemates kit web pages (HTML/meta parser for on-demand kit import by URL/search).
  - S3-compatible API (Cloudflare R2) for object storage.
  - Mailchimp subscribe endpoint (`plamoscale.us14.list-manage.com`).
- `[MANDATORY]` **Auth and authorization expectations:** Bearer JWT + `httpOnly` cookie support for SSO across tenant domains, role-based middleware guards, and resource-ownership checks on mutations.
- `[CONDITIONAL]` **Rate limits, quotas, or throttling needs:**
  - Global API: 120 req/min per IP.
  - Auth & Scalemates import endpoints: 15 req/min per IP/user.
  - Image upload: max 10 images per request, max 15 MB per raw image.
- `[CONDITIONAL]` **Audit, retention, or reporting needs:** Structured JSON logs for auth events, catalog imports, moderation actions, and errors, retained for 30 days on VPS log rotation.
- `[OPTIONAL]` **Data migration or import needs:** Automated seed script reading from `docs/reference/preexisting-root/plamoscale.com/` to import the 4 founding builders and ~92 images.

---

## Instrumentation And Analytics

| Metric Or Event | Purpose | Trigger | Dimensions | Target Or Alert | Maps To |
|---|---|---|---|---|---|
| `auth.user_registered` | Adoption | Successful `POST /api/v1/auth/signup` | `tenant_slug`, `referral` | Track weekly signups toward SM5 (100 users) | SM2, SM5 |
| `catalog.kit_imported` | Usage / Quality | Successful `POST /api/v1/catalog/kits/import-scalemates` | `brand`, `scale`, `source_status` | Alert if import failure rate > 20% | FR3, SM3 |
| `build.published` | Core Value | Build project status set to `WIP` or `Completed` | `tenant_slug`, `category`, `photo_count` | Track toward SM3 (<5 min) & SM5 (300 projects) | FR5, SM3, SM5 |
| `api.http_request_duration_ms` | Reliability / Perf | Every `/api/v1/*` request | `route`, `method`, `status_code`, `tenant_slug` | Alert if p95 > 500 ms or 5xx rate > 1% | NFR1, NFR4 |

---

## Capacity Assumptions

- `[MANDATORY]` **User volume:** Initial pilot: 4–20 builders; Year 1 target: 500–2,000 registered builders and 15,000+ monthly unique visitors across `plamoscale.com` and `gunplajunkies.com`.
- `[MANDATORY]` **Throughput or request volume:** Average 5–20 req/sec; peak 100 req/sec during contest voting or viral social shares.
- `[MANDATORY]` **Data volume:**
  - PostgreSQL relational data: < 5 GB in Year 1 (~50,000 rows across kits, builds, steps, and stash items).
  - Object Storage (Cloudflare R2): ~92 seed images (~50 MB) at launch; projected 25,000 images (~15–25 GB optimized WebP) in Year 1.
- `[MANDATORY]` **Peak usage assumption:** Sunday evenings (regional contest submission deadlines and weekend workbench wrap-ups).
- `[OPTIONAL]` **Constraint notes:** Image resizing (`sharp`) runs with bounded concurrency (max 2 concurrent workers on VPS) or pre-signed direct-to-R2 uploads to prevent CPU spikes on the VPS.

---

## Dependencies And Constraints

| Dependency ID | Dependency Or Constraint | Type | Owner | Impact If Unresolved | Due Date |
|---|---|---|---|---|---|
| **DEP1** | PostgreSQL database instance on `x-codec` VPS (or local Docker for dev) | Technical | Roberto Pineda | Blocks persistent storage beyond in-memory/SQLite dev mode | Before DVT deploy |
| **DEP2** | Cloudflare R2 bucket & API credentials (`secrets.md` / env vars) | Vendor / Technical | Roberto Pineda | Media pipeline falls back to local disk until R2 credentials are set | Before DVT deploy |
| **DEP3** | DNS & Reverse Proxy configuration for `plamoscale.com`, `gunplajunkies.com`, and `api.*` | Rollout / Infra | Roberto Pineda | Blocks public multi-domain routing in production | Before PVT gate |
| **DEP4** | Pilot UAT participation from the 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`) | Organizational | Roberto Pineda | Delays DVT -> PVT gate sign-off | DVT Stage |

---

## Security, Compliance, And Operations Dependencies

- `[MANDATORY]` **Security review dependency:** Internal security review by Roberto Pineda (`x-codec` Security Owner) before DVT -> PVT gate, verifying OWASP Top 10 controls, JWT secret rotation, CORS tenant isolation, and upload MIME/magic-bytes validation.
- `[MANDATORY]` **Credential or privileged access expectation:** Zero secrets committed to git (enforced by `.gitignore` on `secrets.md` and `.env*`). Production VPS and R2 credentials restricted to Roberto Pineda with MFA enabled on GitHub and Cloudflare.
- `[MANDATORY]` **Logging or retention expectation:** Pino/structured JSON application logs with 30-day retention and automatic PII redaction (`password`, `Authorization` headers, cookies).
- `[MANDATORY]` **SOP or support playbook dependency:** Operational runbook documented in ESD covering deployment, database backup/restore, seed execution, and rollback.
- `[MANDATORY]` **Monitoring dependency:** Automated `/api/v1/health` uptime check + structured error logging alert.
- `[CONDITIONAL]` **Vendor support agreement dependency:** Community/Self-managed open-source stack (Node.js, PostgreSQL) hosted on `x-codec` VPS + Cloudflare R2 standard SLA.
- `[CONDITIONAL]` **Customer-hosted responsibility dependency:** Not applicable (`x-codec` hosts the central API and tenant frontends).

---

## Pilot, UAT, And Rollout Plan

- `[MANDATORY]` **Pilot scope:** Complete end-to-end validation of Slices 1–5 on staging/production with real migrated data from `plamoscale.com` and new Gunpla/scale builds.
- `[MANDATORY]` **Pilot audience:** Roberto Pineda (`x-codec`) + the 4 founding builders from `plamoscale.com`:
  1. Aldo Perich (`aperich` / `@gunpla_warrior_peru`)
  2. Daniel Campos (`dcampos` / `@d.de.daniel`)
  3. Cristhian Luna (`cluna` / `@cristhian_ls17`)
  4. Fernando Garaicoa (`fog1labs1` / `@fog1labs`)
- `[MANDATORY]` **Acceptance measures:**
  1. All 4 founding builders confirm their migrated profiles and ~92 legacy photos display accurately.
  2. Each pilot builder successfully logs in via SSO, adds >=1 kit to their Stash (via catalog search or Scalemates import), and publishes >=1 new Build Log with step photos and paint tags.
  3. Zero P0/P1 bugs or cross-tenant visibility errors between `plamoscale.com` and `gunplajunkies.com`.
- `[MANDATORY]` **UAT owner:** Roberto Pineda (`x-codec`).
- `[MANDATORY]` **Rollout phases:**
  - **Phase 1 (EVT):** Local & staging build of Vertical Slices 1–5 + automated smoketests.
  - **Phase 2 (DVT Pilot):** Invite the 4 founding builders and core WhatsApp/FB group moderators (10–20 users) to validate workflows and complete Slices 6–7.
  - **Phase 3 (PVT -> GA):** Cutover DNS for `plamoscale.com` and `gunplajunkies.com` to the new platform and announce to the full Facebook/WhatsApp/Mailchimp community.
- `[MANDATORY]` **Go-live criteria:** All P0 functional requirements verified by automated smoketests, 4/4 pilot builder UAT sign-off, clean CGR score >=85, and verified database backup.
- `[MANDATORY]` **Rollback trigger:** >2% unhandled 5xx error rate over 15 minutes, data corruption in migration, or critical auth vulnerability. Rollback restores static `plamoscale.com` / previous container tag within 5 minutes.
- `[CONDITIONAL]` **Not UAT-eligible rationale:** Internal infrastructure and database migration scripts are validated via CLI smoketests; all user-facing slices undergo human UAT.

---

## Engineering Handoff For ESD

- `[MANDATORY]` **Architecture questions:** Resolved — Full-Stack TypeScript Monorepo (`npm workspaces` / `turbo`) with Vertical Slice Architecture (`apps/api`, `apps/plamoscale-web`, `apps/gunplajunkies-web`, `packages/shared`).
- `[MANDATORY]` **API contract inputs:** OpenAPI 3.1 contract-first routes under `/api/v1/*`, Swagger UI at `/doc`, RFC 7807 error format, and `X-Tenant-Slug` / Host header tenant resolution.
- `[MANDATORY]` **Data model inputs:** Relational PostgreSQL schema supporting multi-tenant portals, SSO users, kits (with Scalemates metadata), paints, stash, build logs, build steps, media assets, contests, and shops.
- `[MANDATORY]` **Environment needs:** Local dev (Node.js + SQLite/Postgres + local media fallback), Staging, and Production (`x-codec` VPS + PostgreSQL + Cloudflare R2).
- `[MANDATORY]` **Monitoring and alerting needs:** `/api/v1/health` endpoint checking DB & storage latency + structured JSON logging.
- `[MANDATORY]` **Rollback and recovery requirements:** Immutable git tag / container release rollback + daily `pg_dump` backup + preserved legacy `plamoscale.com` static fallback.
- `[MANDATORY]` **Pilot validation requirements:** Seed script that deterministically loads the 4 builders and ~92 images from `docs/reference/preexisting-root/plamoscale.com/`.
- `[MANDATORY]` **Operational handoff requirements:** Runbook in ESD covering `npm run build`, `npm run db:migrate`, `npm run db:seed`, and `npm run smoketest`.
- `[MANDATORY]` **Unresolved design decisions:** None blocking EVT.

---

## Ownership And Approvals

- `[MANDATORY]` **Product Owner:** Roberto Pineda (`x-codec`) — Approved 2026-10-23
- `[MANDATORY]` **Business or Commercial Owner:** Roberto Pineda (`x-codec`) — Approved 2026-10-23
- `[MANDATORY]` **Executive Sponsor:** Roberto Pineda (`x-codec`) — Approved 2026-10-23
- `[CONDITIONAL]` **IT or Platform Owner:** Roberto Pineda (`x-codec`) — Approved 2026-10-23
- `[CONDITIONAL]` **Security or Compliance Owner:** Roberto Pineda (`x-codec`) — Approved 2026-10-23

---

## Open Questions

| Question ID | Question | Evidence Grade | Owner | Due Date | Impact If Unresolved |
|---|---|---|---|---|---|
| **Q1** | Confirm exact pricing tiers for post-GA B2B White-Label clubs and Builder Pro subscriptions | Owner Required (Post-Pilot) | Roberto Pineda | Post-DVT Pilot (2026-12-01) | Low — Launch/EVT/GA is 100% free for community adoption; does not block EVT or DVT engineering. |

---

## Pre-Review Checklist -- PRD

- [x] Scope and non-goals are explicit.
- [x] Goals map to MRD outcomes and success metrics.
- [x] Use cases include actors, triggers, expected results, and exception paths.
- [x] Each functional requirement has an ID, priority, MRD source, acceptance criteria, and verification method.
- [x] Non-functional requirements cover performance, reliability, security, privacy, accessibility, observability, scalability, supportability, and cost where applicable.
- [x] UX states, data needs, API needs, instrumentation, dependencies, and constraints are explicit.
- [x] Acceptance criteria are testable in pilot, UAT, tests, logs, analytics, or operational checks.
- [x] Pilot, UAT, rollout, rollback trigger, and go-live criteria are defined.
- [x] Security, supportability, monitoring, SOP, and vendor dependencies are acknowledged.
- [x] Engineering handoff gives ESD enough input to design architecture, APIs, data model, environments, monitoring, rollback, pilot validation, and operations.
- [x] Open questions have owners and due dates, or are resolved.
- [x] PRD is ready for ESD design authoring.
