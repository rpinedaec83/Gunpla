# Backlog

Future work queue. Keep this separate from the active burn-down.

## Next Candidates (Phase 2 — DVT Pilot & Community Expansion)

- **PWA & Offline Mode for Workshop & Conventions:** Web App Manifest, Service Worker, and local cache for offline Stash and Paint Rack lookups in hobby shops and convention floors.
- **Trusted Shops Stock Alerts Linked to Stash Wishlist:** Connect user wishlist to verified partner hobby shops (`Trusted Shops`) to notify of inventory arrivals and deals.
- **Automated Resend Email Notification Triggers:** Automated email delivery for judge scores, build comments, and marketplace/commission inquiries.

## Completed Candidates & Parking Lot Items

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
