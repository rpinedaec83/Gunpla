# Seed and Reference to Governance Docs Mapping

This file records how `seed.md`, preserved repository files under `docs/reference/preexisting-root/`, stakeholder questionnaire responses, and external benchmarks were mapped into the live MRD, PRD, and ESD artifacts.

## Source Inventory

| Source ID | Path or Origin | Description | Evidence Grade |
|---|---|---|---|
| **SRC-1** | `seed.md` | Project vision, multi-tenant scope, Scalemates inspiration, and Vertical Slice methodology | Source Fact |
| **SRC-2** | `docs/reference/preexisting-root/plamoscale.com/index.html` | Original PlamoScale static gallery (HTML5 UP Multiverse), Mission, Vision, Facebook link, and Mailchimp form | Source Fact |
| **SRC-3** | `docs/reference/preexisting-root/plamoscale.com/bio.txt` | Roberto Pineda social links, WhatsApp group, Facebook group, Google Drive, Gundam Hobby Life link, and Trusted Shops catalog (`bit.ly/45m7bII`) | Source Fact |
| **SRC-4** | `docs/reference/preexisting-root/plamoscale.com/assets/js/script.js` & `images/` | 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`), their social network URLs, and ~92 high-res (`fulls/`) and thumbnail (`thumbs/`) photos | Source Fact |
| **SRC-5** | `docs/reference/preexisting-root/gunplajunkies.com/` | Initial Node.js + Express + Sequelize + JWT + Swagger (`/doc`) backend with `empresa`, `user`, and `role` (`user`, `moderator`, `admin`) models | Source Fact |
| **SRC-6** | Owner Discovery Interview (Roberto Pineda, 2026-10-23) | Confirmed SSO Multi-Tenant architecture, all 6 functional areas, Freemium + B2B White-Label business model, TypeScript Monorepo + PostgreSQL + Cloudflare R2/S3 + `x-codec` VPS hosting, Ownership roles, and `UXP-01` UX baseline | Owner Required (Confirmed) |
| **SRC-7** | External Benchmark: `https://www.scalemates.com` | Reference kit catalog taxonomy (brand, scale, kit number, release year, boxart, manuals), stash management, and UX modernization opportunity | External Best Practice |

---

## Section Coverage Mapping

| Target Document & Section | Primary Sources Used | Coverage Status |
|---|---|---|
| **MRD — Market Category, Opportunity & Target Segments** | SRC-1, SRC-2, SRC-3, SRC-6, SRC-7 | Complete |
| **MRD — Personas, Stakeholders & Ownership** | SRC-3, SRC-4, SRC-6 | Complete |
| **MRD — Problem Statement & Current Alternatives** | SRC-2, SRC-3, SRC-4, SRC-5, SRC-7 | Complete |
| **MRD — Competitive Analysis & Differentiation** | SRC-1, SRC-6, SRC-7 | Complete |
| **MRD — Business Model, Market Sizing & Success Criteria (`SM1`–`SM5`)** | SRC-4, SRC-6, SRC-7 | Complete |
| **PRD — Scope Summary, Goals (`G1`–`G5`) & Non-Goals** | SRC-1, SRC-6 | Complete |
| **PRD — Personas, Use Cases (`U1`–`U8`) & Functional Requirements (`FR1`–`FR12`)** | SRC-1, SRC-2, SRC-3, SRC-4, SRC-5, SRC-6, SRC-7 | Complete |
| **PRD — Non-Functional Requirements (`NFR1`–`NFR8`) & UX (`UXP-01`)** | SRC-5, SRC-6, `patterns/ux-patterns/active-ux-pattern.md` | Complete |
| **PRD — Pilot, UAT & Rollout Plan (4 Founding Builders)** | SRC-4, SRC-6 | Complete |
| **ESD — Architecture Overview (Monorepo + Vertical Slices) & Data Model** | SRC-1, SRC-4, SRC-5, SRC-6 | Complete |
| **ESD — API Contracts (OpenAPI 3.1, `/doc`, RFC 7807, SSO JWT)** | SRC-5, SRC-6, `.github/skills/api-design/SKILL.md` | Complete |
| **ESD — Infrastructure, Vendor Rationale, Monitoring, Security, Rollback & SOP** | SRC-5, SRC-6, `accounts.md`, `.github/skills/security-patterns/SKILL.md` | Complete |
