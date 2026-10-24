# Seed Brief: PlamoScale & GunplaJunkies Multi-Tenant Scale Modeling Platform

## Vision Summary
Build a unified, API-first, multi-tenant scale modeling platform inspired by **Scalemates.com** and modern creator portfolios, powered by **1 single backend API** and serving **multiple specialized frontends** starting with:
1. **`plamoscale.com`**: General scale modeling community hub (military, aviation, automotive, figures, sci-fi, ships, dioramas) in Peru & Latam.
2. **`gunplajunkies.com`**: Specialized portal for Gunpla, Mecha, and Sci-Fi plastic models with dedicated branding and taxonomy filters.
3. **Future B2B / White-Label Clients**: Hobby clubs, modeling associations, trusted hobby shops, and IPMS/Gunpla contests that need their own branded portal on top of the shared API.

## Core Capabilities
1. **Multi-Tenant Identity (SSO) & RBAC**: Single user account across `plamoscale.com`, `gunplajunkies.com`, and partner portals with tenant-aware content filtering and roles (`user`, `moderator`, `admin`, `tenant_admin`).
2. **Scalemates-Inspired Kit & Paint Catalog**: Structured database and importer/connector for scale model kits (brand, scale, kit number, release year, boxart, instruction manuals, scalemates reference URL) and paints/supplies (brand, color code, finish, type).
3. **Personal Workbench (My Stash, Wishlist & Paint Rack)**: Inventory management for unbuilt kits, backlog status, and owned paints/tools.
4. **Step-by-Step Build Logs (WIP to Completed Showcase)**: Rich project diaries documenting assembly, modifications/kitbashing, primer, paint recipes used per step, weathering, and final high-resolution gallery.
5. **Social Showcase & Creator Portfolios**: Evolution of the original `plamoscale.com` gallery, featuring likes, comments, social links (Instagram, TikTok, Facebook), and shareable builder profiles seeded with the 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1` and their ~92 real build photos).
6. **Group Builds, Contests & Club Events**: Tenant-scoped challenges, submission rules, judging rubrics, and virtual exhibition galleries.
7. **Trusted Shops Directory & Marketplace**: Verified hobby store directory (evolves `bio.txt` trusted shops catalog), kit buy/sell/trade listings, and custom painting commission requests.

## Engineering & Delivery Methodology
- **Framework**: Atlas AI (`MRD`, `PRD`, `ESD`, `CGR`, `PS` EVT/DVT/PVT/GA, `devcycle`/`DT`/`retro`).
- **Architecture**: Full-Stack TypeScript Monorepo using **Vertical Slice Architecture** (each feature slice encapsulates its OpenAPI route/controller, domain service, validation schema, data access, and UI components).
- **Development Style**: Augmented Coding & AI Pair Programming with strict automated smoketests and API-first OpenAPI 3.1 contracts.
- **Infrastructure**: PostgreSQL relational database + S3-compatible Object Storage (Cloudflare R2) for images + x-codec VPS/Hosting (Docker / cPanel / Passenger).
