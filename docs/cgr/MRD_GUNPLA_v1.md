# MRD: PlamoScale & GunplaJunkies Multi-Tenant Scale Modeling Platform

## Document Control

- `[MANDATORY]` Project: Gunpla & PlamoScale Multi-Tenant Scale Modeling Platform (`GUNPLA`)
- `[MANDATORY]` Version: v1.0
- `[MANDATORY]` Owner: Roberto Pineda (`x-codec` / `rpineda@x-codec.net`)
- `[MANDATORY]` Status: Approved for EVT
- `[MANDATORY]` Last Updated: 2026-10-23
- `[OPTIONAL]` Related PRD: [PRD_GUNPLA_v1.md](file:///Users/rpineda/Sources/Gunpla/docs/cgr/PRD_GUNPLA_v1.md)
- `[OPTIONAL]` Related traceability map: [MRD-PRD-ESD-TRACEABILITY.md](file:///Users/rpineda/Sources/Gunpla/docs/cgr/MRD-PRD-ESD-TRACEABILITY.md)

---

## Research Evidence

| Evidence ID | Evidence Grade | Source | Access Date | Claim Or Input Used | Confidence | Notes |
|---|---|---|---|---|---|---|
| EV1 | Source Fact | `docs/reference/preexisting-root/plamoscale.com/index.html` & `bio.txt` | 2026-10-23 | PlamoScale mission/vision in Peru & Latam, active Facebook group (`1397980650669863`), WhatsApp community, Mailchimp list (`830f22cd5a`), and trusted shops directory (`bit.ly/45m7bII`). | High | Directly extracted from existing live static site. |
| EV2 | Source Fact | `docs/reference/preexisting-root/plamoscale.com/assets/js/script.js` & `images/` | 2026-10-23 | 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`) with ~92 high-resolution & thumbnail photos hardcoded in JS arrays. Updating the site requires manual code edits and image uploads to git. | High | Demonstrates current operational bottleneck and provides real seed data. |
| EV3 | Source Fact | `docs/reference/preexisting-root/gunplajunkies.com/` | 2026-10-23 | Initial backend prototype built with Node.js, Express, Sequelize, JWT, Swagger (`/doc`), and multi-tenant `empresa` + `user` + `role` (`user`, `moderator`, `admin`) schema. | High | Validates architectural intent for a multi-tenant API serving multiple portals. |
| EV4 | Owner Required | Stakeholder Interview (Roberto Pineda, 2026-10-23) | 2026-10-23 | Single central API must serve `plamoscale.com` (general scale modeling), `gunplajunkies.com` (Gunpla/Mecha/Sci-Fi), and future B2B white-label clients with shared SSO identity. | High | Confirmed directly by Product & Executive Owner. |
| EV5 | Owner Required | Stakeholder Interview (Roberto Pineda, 2026-10-23) | 2026-10-23 | Business model starts as a free community hub, evolving to Freemium/Pro builder tiers and B2B White-Label subscriptions for clubs, contests, and hobby shops. | High | Confirmed directly by Business Owner. |
| EV6 | External Best Practice | Scalemates.com public platform analysis | 2026-10-23 | Scalemates is the global reference for kit genealogy, stash management, and aftermarket parts, but suffers from a legacy 2010s desktop UI, weak mobile workbench photo workflows, and no white-label community portals for local clubs/contests. | High | Primary functional benchmark and differentiation target. |
| EV7 | External Best Practice | Social Media Workarounds (Instagram, Facebook Groups, TikTok) | 2026-10-23 | Builders share photos on Instagram/FB/TikTok (as seen in `script.js` social links), but posts lack structured kit metadata (scale, brand, paint recipes, build steps) and are lost in algorithmic feeds. | High | Explains why builders need a structured portfolio linked to their social profiles. |

---

## Market Category And Opportunity

- `[MANDATORY]` **Market category:** Vertical Social Network, Portfolio Management & Catalog SaaS for Scale Modeling and Gunpla/Mecha Builders (B2C2B Community & White-Label Hobby Platform).
- `[MANDATORY]` **Target market summary:** Scale modelers (military, aviation, automotive, naval, figures, dioramas) and Gunpla/Mecha builders across Latin America (starting with Peru/Ecuador) and globally, alongside hobby clubs, IPMS chapters, competition organizers, and specialty hobby shops.
- `[MANDATORY]` **Opportunity summary:** Modelers currently split their workflow across disconnected tools: **Scalemates** for kit catalog lookups and stash tracking (with a dated interface), **Instagram/TikTok/Facebook** for showcasing photos (without structured build steps, kit genealogy, or paint recipes), and **Google Drive/WhatsApp** for community contests and shop catalogs (as evidenced in `bio.txt`). Unifying structured Scalemates-style kit/paint metadata with a modern, mobile-friendly step-by-step Build Log and a Multi-Tenant White-Label engine allows `x-codec` to power `plamoscale.com`, `gunplajunkies.com`, and third-party hobby communities from a single API.
- `[MANDATORY]` **Market timing or trigger:** Rapid global growth of Gunpla/Bandai Spirits and scale modeling communities in Latin America, combined with the operational bottleneck of maintaining static HTML/JS galleries (`plamoscale.com`) and an unfinished API (`gunplajunkies.com`).
- `[OPTIONAL]` **Category trends:** Increasing demand for structured "Work in Progress" (WIP) documentation, custom paint mix tracking, 3D-printed aftermarket integration, and virtual/hybrid modeling competitions.

---

## Target Segments

| Segment | Buyer Or User | Problem Intensity | Ability To Adopt | Value Potential | Priority | Evidence ID |
|---|---|---|---|---|---|---|
| **S1: Gunpla, Mecha & Sci-Fi Builders (`gunplajunkies.com`)** | User (Free / Pro) | High | High | High | P0 | EV2, EV4, EV7 |
| **S2: General Scale Modelers in Latam (`plamoscale.com`)** | User (Free / Pro) | High | High | High | P0 | EV1, EV2, EV4 |
| **S3: Hobby Clubs, Contest Organizers & Communities** | Buyer & User (B2B White-Label) | High | Medium | High | P1 | EV1, EV4, EV5 |
| **S4: Specialty Hobby Shops & Custom Commission Painters** | Buyer & User (Directory / Marketplace) | Medium | High | Medium | P1 | EV1, EV5 |

---

## Personas And Stakeholders

- `[MANDATORY]` **Primary user personas:**
  - **The Active Builder / Painter (e.g., Aldo, Daniel, Cristhian, Fernando):** Builds and customizes plastic models (Gunpla, military, vehicles). Wants to track their kit stash, document WIP steps from workbench mobile photos, record exact paint recipes (Mr. Hobby, Tamiya, Vallejo, Gaia), and share a professional portfolio linked to their Instagram/TikTok.
  - **The Community Explorer / Collector:** Browses completed builds for inspiration, searches how a specific kit looks built, checks paint schemes, and looks for trusted local stores or commission painters.
- `[MANDATORY]` **Buyer or decision personas:**
  - **Club President / Contest Organizer (B2B Tenant Buyer):** Runs local or regional modeling clubs and competitions. Needs a branded portal (`myclub.com` or subdomain) to host Group Builds, receive structured contest entries, and judge models without building custom software.
  - **Hobby Shop Owner:** Wants verified placement in the Trusted Shops Directory and direct connection to builders whose wishlists match their inventory.
- `[MANDATORY]` **Internal stakeholders:**
  - **Roberto Pineda (`x-codec`):** Product Owner, Executive Sponsor, Lead Architect, and Platform Operator.
- `[CONDITIONAL]` **External stakeholders:**
  - **Founding Community Builders (Pilot / UAT Group):** Aldo Perich (`aperich`), Daniel Campos (`dcampos`), Cristhian Luna (`cluna`), and Fernando Garaicoa (`fog1labs1`).
- `[OPTIONAL]` **Administrator or support personas:**
  - **Global Moderator / Catalog Curator:** Reviews imported kit/paint metadata, merges duplicates, and moderates community uploads.
  - **Tenant Admin:** Manages branding, categories, contests, and featured builds for a specific portal (`plamoscale.com`, `gunplajunkies.com`, or B2B client).

---

## Problem Statement

- `[MANDATORY]` **Problem summary:** Scale modelers and Gunpla builders lack a modern, mobile-ready platform that combines structured kit/paint databases (like Scalemates) with visual step-by-step build logs, social portfolios, and localized community hubs. Meanwhile, `x-codec` currently maintains a static HTML/JS site (`plamoscale.com`) where adding a single builder's photos requires manual file resizing, git commits, and editing `assets/js/script.js`, alongside a separate unfinished API (`gunplajunkies.com`).
- `[MANDATORY]` **Evidence sources:** EV1, EV2, EV3, EV6, EV7.
- `[MANDATORY]` **Impact statement:**
  1. **Zero self-service for builders:** New community members cannot sign up or upload their builds on `plamoscale.com`; they must send files via Google Drive/WhatsApp (`bio.txt`) for manual developer intervention.
  2. **Lost domain knowledge:** The ~92 existing photos on `plamoscale.com` display only the builder's name and social links—there is no searchable record of which kit, scale, grade (HG/MG/RG/PG, 1/35, 1/48), or paint recipe was used.
  3. **Fragmented multi-brand maintenance:** Running separate codebases for `plamoscale.com`, `gunplajunkies.com`, and future clients multiplies maintenance cost instead of leveraging a single multi-tenant API.
- `[MANDATORY]` **Current failure mode:** Community activity leaks back to unstructured WhatsApp chats, Google Drive folders, and ephemeral Facebook/Instagram posts where build logs and catalog linkages are impossible to search or preserve.
- `[MANDATORY]` **Urgency:** High — both domain names (`plamoscale.com` and `gunplajunkies.com`) and the initial community base are active now, and consolidating onto a single API with Vertical Slice architecture is required before onboarding more builders and clubs.

---

## Current Alternatives And Workarounds

| Alternative | Type | User Benefit | Gaps Or Pain | Switching Cost | Evidence ID |
|---|---|---|---|---|---|
| **Static `plamoscale.com` + Google Drive (`bio.txt`)** | Status Quo / Manual | Fast static photo grid (HTML5 UP Multiverse); zero database cost. | No user login, no self-service upload, no kit/paint data, manual developer bottleneck for every photo. | Low (we own the migration and seed data) | EV1, EV2 |
| **Scalemates.com** | Direct Competitor / Reference | Massive global kit database, boxart, instruction PDFs, stash tracker. | Outdated 2010s UI, clunky mobile photo upload, poor portfolio aesthetics, no localized club/tenant white-labeling. | Low (we support importing/linking Scalemates kit references) | EV4, EV6 |
| **Instagram / TikTok / Facebook Groups** | Adjacent Social | High reach, mobile-first video/photo sharing. | No kit taxonomy, no stash/paint rack, no structured step-by-step build logs, chronological history gets buried. | Low (platform links directly to builder IG/TikTok profiles) | EV1, EV2, EV7 |
| **MyFigureCollection / Gunpla Builders World Cup (GBWC) portals** | Adjacent Niche | Dedicated to anime figures or once-a-year official Bandai contests. | Excludes military/vehicle scale models or non-Bandai kits; no continuous WIP build logs or paint recipes. | Low | EV6 |

---

## Competitive Analysis

| Competitor Or Alternative | Target Customer | Key Strengths | Key Weaknesses | Pricing Or Monetization Signal | Integration Or Platform Posture | Source Confidence | Evidence ID |
|---|---|---|---|---|---|---|---|
| **Scalemates.com** | Global scale modelers | Deepest historical kit & aftermarket database (>1M items); established SEO. | Legacy UX; not mobile-workbench friendly; single monolithic site (no white-label portals). | Free with display ads & affiliate links | Closed web app; URLs/metadata can be referenced/linked | High | EV6 |
| **Instagram / Facebook Groups** | General creators & hobbyists | Ubiquitous social graph; instant mobile uploads. | Zero modeling domain structure (no scale, brand, kit ID, paint rack, or stash). | Ad-supported | Public profile links & OAuth/Share integration | High | EV1, EV7 |
| **PlamoScale & GunplaJunkies (Our Solution)** | Gunpla & Scale Modelers + Hobby Clubs/Shops | **1 API -> N Portals**; SSO identity; modern UX (`UXP-01`); Scalemates metadata bridge; structured Paint Recipes & Build Logs; B2B white-label ready. | Starting with smaller localized catalog (mitigated by Scalemates import/sync and community curation). | Free Community + Freemium Pro + B2B White-Label SaaS | OpenAPI 3.1 API-First, multi-tenant by design | High | EV3, EV4, EV5 |

---

## Differentiation And Positioning

- `[MANDATORY]` **Positioning statement:** For scale modelers, Gunpla builders, and hobby communities who outgrow unstructured social media feeds and dated catalog sites, the **PlamoScale & GunplaJunkies Platform** is a modern, multi-tenant portfolio and workbench ecosystem that connects structured kit & paint databases with step-by-step build logs across specialized community portals.
- `[MANDATORY]` **Primary differentiation:** **Multi-Tenant Single-API Architecture with Shared SSO Identity**—a builder signs up once, manages one unified Stash and Paint Rack, and publishes projects seamlessly to `gunplajunkies.com` (Mecha/Gunpla vertical), `plamoscale.com` (General Scale Modeling hub), or any partner club/contest portal.
- `[MANDATORY]` **Secondary differentiation:**
  1. **Scalemates Bridge + Rich Visual Build Logs:** Combines technical accuracy (kit scale, brand, boxart, paint mix recipes per step) with a high-aesthetic photography showcase inspired by `plamoscale.com`.
  2. **Community & Commerce Ecosystem:** Built-in Group Builds, contest judging, trusted shops directory, and commission/kit marketplace.
- `[MANDATORY]` **Non-differentiators:** We are not attempting to manually re-enter 50 years of obscure vintage kit history from scratch on day one; instead, we provide a fast on-demand importer/linker for Scalemates kit references plus community-curated catalog entries.
- `[MANDATORY]` **Proof points or assumptions:** Existing active community on `plamoscale.com` (4 founding builders with 92 curated photos, active FB/WhatsApp groups, and Mailchimp subscriber base).
- `[OPTIONAL]` **Messaging risks:** Positioning `gunplajunkies.com` and `plamoscale.com` clearly so users understand their single account works across both without confusion.

---

## Market Sizing Or Demand Proxy

| Measure | Estimate | Method Or Assumption | Evidence ID | Confidence |
|---|---|---|---|---|
| **TAM (Global Scale Modeling & Gunpla Digital Enthusiasts)** | ~2,500,000+ active online builders globally | Active user/visitor proxy across Scalemates, r/Gunpla (~400k+ members), and global modeling forums `[DRAFT INFERENCE]`. | EV6 | Medium |
| **SAM (Spanish & English-speaking Gunpla + Scale Modelers in Americas)** | ~150,000 active builders & ~500 clubs/shops | Regional hobby groups, IPMS chapters, Gunpla communities in Latam & North America `[DRAFT INFERENCE]`. | EV1, EV6 | Medium |
| **SOM (Near-Term 12-Month Target across `plamoscale.com` & `gunplajunkies.com`)** | 500–2,000 registered builders; 2,500+ published builds; 5–10 partner clubs/shops | Direct conversion from existing PlamoScale FB/WhatsApp community + organic SEO from public build logs. | EV1, EV2, EV5 | High |
| **Demand Proxy (Immediate Seed Baseline)** | 4 founding builders, ~92 high-res build photos, 2 active domains (`plamoscale.com`, `gunplajunkies.com`), 1 trusted shops catalog | Verified assets already in repository (`docs/reference/preexisting-root/`). | EV1, EV2, EV3 | High |

---

## Business Model Or Value Hypothesis

- `[MANDATORY]` **Business value hypothesis:** Launching a unified multi-tenant platform with free core portfolio/stash tools will rapidly onboard the existing Peru/Latam and Gunpla communities, creating high-intent catalog and showcase traffic that monetizes via B2B white-label portals (clubs, events, shops), Freemium Pro builder tools, and marketplace/affiliate partnerships.
- `[MANDATORY]` **Value driver:** Community network effects + zero marginal cost to launch new niche or club portals on top of the shared API.
- `[CONDITIONAL]` **Pricing or monetization assumption:**
  - **Phase 1 (Launch / EVT–GA):** 100% free for builders to maximize adoption and catalog growth.
  - **Phase 2 (Post-GA Expansion):**
    - *Builder Pro Tier:* Advanced storage/4K RAW galleries, custom portfolio domain/theme, PDF build book export.
    - *B2B White-Label Tenant Tier:* Monthly/annual subscription or event fee for clubs, contests, and hobby stores to run their own branded frontend connected to the central API.
    - *Marketplace / Trusted Shops:* Featured shop placements and optional transaction/commission fees.
- `[CONDITIONAL]` **Cost reduction assumption:** Consolidating `plamoscale.com`, `gunplajunkies.com`, and future portals into a single TypeScript monorepo and single API + PostgreSQL + Cloudflare R2 bucket reduces hosting and engineering maintenance overhead by >60% compared to isolated stacks.
- `[CONDITIONAL]` **Risk reduction assumption:** Decoupling media assets to S3-compatible object storage (Cloudflare R2) prevents VPS disk exhaustion as users upload thousands of high-resolution build photos.
- `[MANDATORY]` **Outcome timeframe:** MVP & Pilot (DVT) within 4–6 weeks via Vertical Slice delivery; Production GA within 8–10 weeks.
- `[OPTIONAL]` **Strategic alignment reference:** Positions `x-codec` (`https://x-codec.net`) as a premier builder of multi-tenant vertical SaaS platforms.

---

## Current Pain Points

| Pain Point | Affected Segment Or Persona | Current Workaround | Consequence | Evidence ID |
|---|---|---|---|---|
| **PP1: Manual code edits required to publish photos** | Founding Builders & Platform Owner (`x-codec`) | Builders send photos via Google Drive (`bio.txt`); developer manually edits `script.js` and commits JPGs to git. | Severe bottleneck; community cannot grow organically; git repository bloats with binary images. | EV1, EV2 |
| **PP2: Photos lack kit, scale, and paint recipe metadata** | Builders & Community Explorers | Posting flat images on `plamoscale.com` or Instagram without structured fields. | Viewers cannot search by kit (e.g., "RG Sazabi" or "1/48 Spitfire"), scale, or paint brand used. | EV2, EV7 |
| **PP3: Outdated UX on legacy catalog sites** | Gunpla & Scale Modelers | Using Scalemates on desktop only, or tracking stashes/paints in spreadsheets. | Friction when uploading WIP photos from a smartphone at the workbench. | EV6 |
| **PP4: Fragmented identity across niche sites** | Multi-discipline Modelers & Club Members | Creating separate accounts on forums, Facebook groups, and contest forms. | High drop-off; builders don't want to re-upload their portfolio for every club or niche site. | EV3, EV4 |

---

## Success Criteria

| Success Measure | Metric | Target | Timeframe | Evidence ID | PRD Mapping |
|---|---|---|---|---|---|
| **SM1: Legacy Data Migration & Zero Data Loss** | % of existing `plamoscale.com` builders (4) and valid build photos (~92) migrated into structured profiles & projects | 100% migrated and browsable via API & Fronts | Before DVT Pilot entry | EV2 | FR1, FR5, FR6 |
| **SM2: Multi-Tenant Single API Operations** | Number of distinct frontends (`plamoscale.com`, `gunplajunkies.com`) served from 1 single API instance with shared SSO | >= 2 active tenant frontends + 1 shared API | EVT -> DVT Gate | EV3, EV4 | FR1, FR2, NFR7 |
| **SM3: Self-Service Build Log Creation Time** | Time for a builder to register, link/import a kit, and publish a WIP/Completed build log with photos & paints | < 5 minutes without developer intervention | DVT Pilot | EV2, EV6 | FR3, FR5, FR6 |
| **SM4: Pilot UAT Satisfaction (Founding Builders)** | UAT sign-off rate from the 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`) | 4 / 4 builders approve profile & upload flow | DVT -> PVT Gate | EV2, EV4 | FR5, FR6, UAT Plan |
| **SM5: Community & Catalog Growth** | Registered builders and cataloged kits/projects across both portals | >= 100 registered builders & >= 300 projects/stash items | 90 days post-GA | EV1, EV5 | FR3, FR4, FR7, FR8 |

---

## Risks And Adoption Barriers

| Risk Or Barrier | Type | Likelihood | Impact | Mitigation Direction | Evidence ID |
|---|---|---|---|---|---|
| **R1: Cold-start catalog emptiness** | Data / Workflow | Medium | High | Provide instant on-demand import/lookup from Scalemates URLs/metadata plus pre-seeded popular Gunpla & scale kits and paint lines (Mr. Hobby, Tamiya, Vallejo, Citadel). | EV6 |
| **R2: High storage & bandwidth costs from high-res model photos** | Cost / Platform | High | Medium | Store all images in S3-compatible Cloudflare R2 (zero egress fees) and automatically generate optimized WebP thumbnails (`thumbs/` and `fulls/`). | EV2, EV4 |
| **R3: External scraping/import rate-limiting from Scalemates** | Integration | Medium | Medium | Use respectful caching, canonical kit deduplication in local PostgreSQL, and allow manual/AI-assisted kit metadata entry as a fallback. | EV6 |
| **R4: Multi-tenant data leakage or cross-site auth friction** | Security / Trust | Low | High | Enforce strict tenant resolution middleware, JWT SSO token validation, and RBAC (`user`, `moderator`, `tenant_admin`, `admin`). | EV3, EV4 |

---

## Constraints

- `[MANDATORY]` **Platform or vendor constraints:** Must run on `x-codec` VPS/Hosting infrastructure (Docker / cPanel / Phusion Passenger compatible Node.js runtime) with PostgreSQL and S3-compatible object storage (Cloudflare R2/S3).
- `[MANDATORY]` **Data or integration constraints:** All existing `plamoscale.com` assets (~92 images, 4 builder profiles, social links, mission/vision, Mailchimp form, `bio.txt` links) and `gunplajunkies.com` multi-tenant concepts must be preserved.
- `[MANDATORY]` **Security, compliance, or privacy constraints:** Passwords hashed with bcrypt/Argon2; JWT/session tokens secured with `httpOnly` / strict CORS allowlists per registered tenant domain; user email/phone privacy compliance; secrets isolated in `secrets.md` / environment variables.
- `[MANDATORY]` **Capacity or scale assumptions:** Initial design must comfortably support 1,000+ concurrent readers, 10,000+ cataloged kits, and 50,000+ high-res photos without degrading VPS memory or database connections.
- `[CONDITIONAL]` **Customer-hosted infrastructure constraints:** Not applicable — SaaS / platform-hosted by `x-codec` (`Customer-hosted: No`).

---

## Ownership

- `[MANDATORY]` **Product Owner:** Roberto Pineda (`x-codec` / `rpineda@x-codec.net`)
- `[MANDATORY]` **Executive Sponsor:** Roberto Pineda (`x-codec`)
- `[MANDATORY]` **Business or Commercial Owner:** Roberto Pineda (`x-codec`)

---

## Dependencies

- `[MANDATORY]` **Dependency 1:** Access to `x-codec` VPS/Hosting environment, PostgreSQL database provisioning, and DNS management for `plamoscale.com` and `gunplajunkies.com`.
- `[MANDATORY]` **Dependency 2:** Provisioning of S3-compatible object storage bucket (Cloudflare R2 or AWS S3) for media uploads and migration of the ~92 existing images.
- `[OPTIONAL]` **External dependency notes:** Mailchimp list (`830f22cd5a`) for newsletter subscriptions; public web access for Scalemates metadata lookup/import.

---

## Approval Notes

- `[CONDITIONAL]` **EVT entry approval record:** Approved by Roberto Pineda (`x-codec`) on 2026-10-23 via interactive discovery questionnaire.
- `[OPTIONAL]` **Open assumptions:** Pro tier and B2B white-label exact pricing tiers will be finalized after DVT pilot feedback; initial EVT/GA release is 100% free for community members.
- `[MANDATORY]` **Owner-required facts:** All owner-required facts for EVT entry (Ownership, Multi-Tenant SSO model, Feature scope, Tech Stack, Hosting Target, and Pilot UAT group) have been confirmed by Roberto Pineda.

---

## Pre-Review Checklist -- MRD

- [x] Research evidence table includes project sources and external market or competitor research when available.
- [x] Market category, target segments, and personas are explicit.
- [x] Problem statement includes evidence and measurable impact.
- [x] Current alternatives and competitive analysis are documented.
- [x] Differentiation and positioning are clear and defensible.
- [x] Market sizing or demand proxy includes assumptions and confidence.
- [x] Success criteria are measurable, time-bound, and mapped to PRD needs.
- [x] Risks, adoption barriers, and constraints are explicit.
- [x] Ownership block is complete or owner-required gaps are clearly marked.
- [x] MRD is ready to hand off for PRD authoring.
