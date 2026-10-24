# Backlog

Future work queue. Keep this separate from the active burn-down.

## Next Candidates (Phase 2 — DVT Pilot & Community Expansion)

### B1 -- Slice 6: Interactive Group Builds, Contests & Judging Rubrics
- Goal: Full contest lifecycle management for tenant admins (creating categories, submission verification codes, judge scoring rubrics, community voting, and digital winner badges/certificates).
- Why: Core driver for B2B White-Label adoption by modeling clubs and regional tournaments (`FR10`).
- eMOE: 4 CU
- Dependencies: `DT1`–`DT5`

### B2 -- Slice 7: Trusted Shops Marketplace & Custom Painting Commission Workflow
- Goal: Allow verified hobby shops to publish stock highlights matching user wishlists, and enable builders to request/offer custom painting commissions (`FR11`).
- Why: Connects community demand with trusted local businesses (`bio.txt` evolution).
- eMOE: 4 CU
- Dependencies: `DT1`–`DT5`

## Completed Candidates & Parking Lot Items

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
