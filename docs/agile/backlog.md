# Backlog

Future work queue. Keep this separate from the active burn-down.

## Next Candidates (Phase 2 -- DVT Pilot & Community Expansion)

- **Contest Community Voting Badges & Public Hall of Fame:** Public showcase and permanent trophy showcase for contest winners across community tenants.
- **Direct WhatsApp Community Feed & Build Inquiries:** Direct contact channels between builders and collectors on showcased models.

## Completed Candidates & Parking Lot Items

### PAINT-EQUIVALENCES -- AI Paint Rack Equivalences Assistant & Mixer (COMPLETED)
- Goal: Intelligent cross-brand paint matching assistant across 4 chemical families (Mr. Color Lacquer, Tamiya Acrylic, Vallejo Polyurethane, Montana Colors Spray) highlighting paints already owned in the builder's rack.
- Delivered: Endpoints `GET /api/v1/workbench/paints/:id/equivalences`, `POST /api/v1/paints/ai/convert`, and `POST /api/v1/paints/ai/recipe`; 20 calibrated cross-medium formulas; user rack detection (`ownedInRack: true`, rack quantity); modal `#modal-paint-equivalences` with code search and mecha recipe mixer; `🔄 Equivalencias` button on every rack card; toolbar with `#wb-paints-count-badge`; comprehensive aerography guides; unit tests (`tests/unit/paint-equivalences.test.mjs`); and verified live deployment on LXC 190.

### STOCK-ALERTS -- Trusted Shops Stock Alerts Linked to Stash Wishlist (COMPLETED)
- Goal: Connect user wishlist in personal stash with verified partner hobby shops (`Trusted Shops`) to notify of inventory arrivals and deals in real-time.
- Delivered: Endpoints `GET /api/v1/workbench/wishlist-alerts`, `GET /api/v1/shops/:id/stock`, and `POST /api/v1/shops/:id/stock`; exact and fuzzy name token matching; transactional email fan-out via Resend; UI alert badges (`#wb-stash-alerts-badge`) and banners (`#wb-wishlist-alerts-banner`); direct WhatsApp ordering buttons on wishlist cards; unit tests (`tests/unit/wishlist-alerts.test.mjs`); and PostgreSQL 16 `shop_stock` relational table.

### DT10 -- Automated Resend Email Notification Triggers & Marketplace Inquiries (COMPLETED)
- Goal: Automated transactional email delivery across community interactions (contest judge rubrics, build log comments, commission quotes/acceptance, and marketplace inquiries) with multi-domain sender verification and auditable outbox.
- Delivered: Real-time transactional emails via `sendTenantEmailViaResend()` for:
  1. Contest judge scores (POST /api/v1/contests/:id/entries/:entryId/judge) to entry authors with 4-criteria rubric breakdown and feedback.
  2. Build log comments (POST /api/v1/builds/:id/comments) to build authors with self-notification prevention.
  3. Commission quotes and acceptance (PATCH /api/v1/commissions/requests/:id) to clients and builders.
  4. Marketplace inquiries (POST /api/v1/marketplace/listings/:id/inquiries) from prospective buyers to sellers with offer price, WhatsApp, and message.
  5. UI modal `#modal-marketplace-inquiry` with `✉️ Consultar` button on listing cards and auditable outbox (`GET /api/v1/notifications/outbox`).

### PWA -- Progressive Web App & Offline Workshop Mode (COMPLETED)
- Goal: Installable mobile and desktop application with offline caching capabilities, allowing modelers to inspect their Stash, Build Logs, and Paint Rack inside hobby shops or convention basements with zero network connectivity.
- Delivered: Dynamic multi-tenant Web App Manifests (`/manifest.json`), Service Worker (`/sw.js`) with Network-First caching for Workbench data and Stale-While-Revalidate for app shell, dynamic vector SVG/PNG app icons (`/icons/*` via `sharp`), offline status indicator (`#pwa-offline-badge`), and native installation prompt CTA (`#pwa-install-btn`).

### B2 -- Slice 7: Custom Painting Commissions & Interactive Ordering Workflow (COMPLETED)
- Goal: End-to-end custom painting and building commission request flow linking clients with verified builders, including finish tier specification (Clean Build, Custom Paint, Weathering, Masterpiece), kit supply selection, budget tracking, quotation negotiation, and a dedicated management panel in "Mi Taller".
- Delivered: Endpoints `POST /api/v1/commissions/requests`, `GET /api/v1/commissions/requests`, `GET .../:idOrCode`, and `PATCH .../:id`; unique tracking codes (`COM-2026-XXXX`), 4 finish tiers, kit supply options, modal `#modal-commission-request`, quotation modal `#modal-quote-commission`, success modal `#modal-commission-success` with direct WhatsApp deep-links, and 4th sub-tab in Workbench (`#wb-subtab-commissions`) for managing incoming orders (builders) and outgoing requests (clients).

### B1 -- Slice 6: Interactive Group Builds, Contests & Judging Rubrics (COMPLETED)
- Goal: Full contest lifecycle management for tenant admins (creating categories, submission verification codes, judge scoring rubrics, community voting, and digital winner badges/certificates).
- Delivered: Endpoints `POST .../judge`, `GET .../judge-scores`, and `GET .../certificate`; 4-criteria rubric (Montaje, Pintura, Acabado, Creatividad, max 40 pts), role-based judge authorization, `#modal-judge-entry`, live ranking podium, `#modal-contest-certificate` with digital diplomas, unique cryptographic verification code, QR code audit link, and print-ready layout.

### B3 -- White-Label Tenant Self-Service Onboarding & Custom Theme Editor (COMPLETED)
- Goal: Allow a new club or store (`tenant_admin`) to configure custom colors, logo, CNAME domain, and allowed model categories via UI.
- Delivered: Endpoints `POST /api/v1/tenants`, `PATCH /api/v1/tenants/:slug`, and `GET /api/v1/tenants/:slug`; `#modal-new-tenant` for onboarding with auto-slug, `#modal-tenant-theme` with live CSS variable mutation, 5 color presets, category filtering, and role-based authorization.

### P1 -- Printable QR Spec Cards for Physical IPMS / Gunpla Contests (COMPLETED)
- Goal: Generate printable table tent cards with QR codes linking a physical contest model on a table to its online Build Log and Paint Recipe with configurable width and height dimensions.
- Delivered: Endpoints `POST /api/v1/builds/:idOrSlug/spec-card`, modal with live preview, preset/custom cm dimensions, table-tent fold, vector QR code, and print stylesheet.

## Parking Lot (Post-GA v2 Ideas)

### P2 -- AI Workbench Paint Equivalent & Mix Assistant
- Goal: Suggest equivalent paint codes across brands (e.g., Mr. Color <-> Tamiya <-> Vallejo) based on what the builder already owns in their Paint Rack.
- Why not now: Requires core Paint Rack (`DT2`/`DT3`) adoption first.
