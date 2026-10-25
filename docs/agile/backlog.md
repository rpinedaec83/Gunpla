# Backlog

Future work queue. Keep this separate from the active burn-down.

## Next Candidates (Phase 2 -- DVT Pilot & Community Expansion)

- **AI Workbench Smart Builder Assistant:** Computer vision inspection of runner parts and sprue cleanup quality.

## Completed Candidates & Parking Lot Items

### BUILD-COSTS -- Control de Costos, Consumibles y Presupuesto de Proyectos en "Mi Taller" (COMPLETED)
- Goal: Granular project cost accounting and consumables estimator for scale model builds, tracking kit acquisition, consumed paint fractions, thinners/glues, aftermarket sets (resin, photo-etch), custom decals, and workshop labor hours for commission quotations or insurance valuation.
- Delivered: Endpoints `GET /api/v1/builds/:id/costs`, `POST /api/v1/builds/:id/costs`, and `DELETE /api/v1/builds/:id/costs/:expenseId`; data models in `@gunpla/shared` (`BuildExpenseItem`, `BuildExpenseCategory`, `BuildCostSummary`, `AddExpenseRequest`, `ExpenseCurrency`); calculation logic `calculateBuildCostSummary` computing category subtotals, labor hours, and suggested commission prices with materials markup; Web UI modal `#modal-build-costs` with KPI metric cards, category breakdown badges, scrollable expense table with delete action, and reactive expense addition form; quick action buttons in Workbench header and build cards; 9 isolated unit tests (`tests/unit/build-costs.test.mjs`, total 103 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### 3D-AR-VIEWER -- Visor 3D / AR Interactivo de Maquetas y Diorama Studio (COMPLETED)
- Goal: Interactive 3D WebGL / AR Model Viewer and Diorama Studio in "Mi Taller" for inspecting scale dimensions, testing poses, lighting presets, scale comparisons with 1:1 human silhouettes, and planning dioramas.
- Delivered: Endpoints `GET /api/v1/catalog/kits/:id/model-3d` and `GET /api/v1/catalog/models-3d`; scale metadata resolution logic (`resolveKitModel3d`) computing real vs physical height in mm, 1:1 human pilot scale silhouette, mesh classification (`mecha`, `tank`, `aircraft`, `car`, `warship`, `humanoid`), diorama ground size, lighting presets, and AR support flag; vanilla WebGL 1.0 rendering canvas (`#diorama-3d-canvas`) with Blinn-Phong shading, depth testing, orbit controls (rotate, pan, zoom, touch support), and real-time procedural geometries for all model categories; scale comparison silhouette (`#diorama-toggle-human`); 5 lighting presets (Studio White, Neon Cyberpunk, Sunset Golden Hour, Military Hangar, Clay Gray Primer); 4 view modes (Shaded, Clay Primer, Wireframe, Matcap Metallic); camera angle presets (Hero Boxart, Frontal, Isometric, Top-Down); turntable auto-spin; HD snapshot PNG capture (`📸 Captura HD`); mobile WebXR AR trigger (`📱 AR Móvil`); UI quick actions `📐 Diorama Studio 3D` in Workbench and Stash, and `📐 3D` on stash and catalog cards; 6 isolated unit tests (`tests/unit/3d-viewer.test.mjs`, total 97 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### BARCODE-SCANNER -- Escáner de Código de Barras (JAN / EAN / UPC) y Registro al Stash (COMPLETED)
- Goal: Camera-based barcode (JAN/EAN/UPC/Code-128) scanning in Mi Taller Workbench for instant kit box registration to personal stash with manufacturer prefix heuristics.
- Delivered: Endpoints `GET /api/v1/catalog/barcode/:barcode` and `POST /api/v1/workbench/stash/scan`; normalization and format detection (`JAN-13`, `JAN-8`, `EAN-13`, `UPC-A`, `UPC-E`, `CODE-128`); manufacturer prefix recognition (Bandai Spirits, Bandai, Tamiya, Kotobukiya, Hasegawa, Aoshima, Revell, Vallejo); starter seed kits updated with barcodes; Web UI `#modal-barcode-scanner` with camera feed (`getUserMedia`), targeting reticle with laser sweep animation, live `BarcodeDetector` API frame loop, manual barcode input fallback, preview card with boxart, stash status selection, and one-click stash addition; 17 isolated unit tests (`tests/unit/barcode-scanner.test.mjs`, total 91 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### GROUP-BUILDS -- Community Group Builds & Collaborative Build Logs (COMPLETED)
- Goal: Collaborative multi-author build projects where multiple builders contribute progress logs, steps, and paint recipes to a shared team project.
- Delivered: Endpoints `GET /api/v1/group-builds`, `POST /api/v1/group-builds`, `GET /api/v1/group-builds/{idOrSlug}`, `POST /api/v1/group-builds/{idOrSlug}/join`, and `DELETE /api/v1/group-builds/{idOrSlug}/leave`; dedicated slice `group-builds.slice.ts`; database tables `group_builds` and `group_build_entries`; starter seed projects for PlamoScale and GunplaJunkies; in-app notification dispatch on participant join; UI subtabs `🏆 Concursos & Salón de la Fama` and `🤝 Proyectos Grupales`, modals `#modal-create-group-build` and `#modal-join-group-build`; 4 isolated unit tests (`tests/unit/group-builds.test.mjs`, total 74 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### BUILD-STEPS-GALLERY -- Advanced Build Step Media Reordering & Multi-Photo Gallery (COMPLETED)
- Goal: Multi-photo upload and gallery viewing per build step milestone, with intuitive step reordering and deletion controls for builders.
- Delivered: Endpoints `PATCH /api/v1/builds/:id/steps/reorder`, `PATCH /api/v1/builds/:id/steps/:stepId`, and `DELETE /api/v1/builds/:id/steps/:stepId`; multi-photo upload preview and storage (`photoUrls: string[]`); step ordering controls (`⬆️`, `⬇️`) and removal (`🗑️`) in Workbench; multi-photo thumbnail grid in public timeline cards linking directly to high-res Lightbox modal; 4 isolated unit tests (`tests/unit/build-steps.test.mjs`, total 70 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### NOTIFICATIONS-BELL -- Push Notifications & In-App Activity Bell (COMPLETED)
- Goal: Real-time notification center (Activity Bell with unread counter, dropdown drawer, relative timestamps, direct routing to builds/contests/commissions/wishlist) and Web Push Notification Service Worker integration (`/sw.js`, push event listener, registration, and subscription endpoints).
- Delivered: Endpoints `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`, `POST /api/v1/notifications/mark-all-read`, `POST /api/v1/notifications/push-subscribe`, `DELETE /api/v1/notifications/push-subscribe`, and `POST /api/v1/notifications/test`; central event dispatcher `dispatchNotification` across comments, contest judge scores, commission requests/updates, and shop stock arrivals; UI topbar `#activity-bell-btn`, unread badge `#activity-unread-badge`, dropdown drawer `#activity-bell-dropdown`, push banner `#activity-push-banner`; service worker `push` and `notificationclick` listeners; PostgreSQL tables `notifications` and `push_subscriptions`; 4 isolated unit tests (`tests/unit/notifications-bell.test.mjs`, total 66 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### SOCIAL-OG -- Social Sharing OpenGraph Preview Cards & Meta Tags (COMPLETED)
- Goal: Auto-generated dynamic preview images (1200x630) for contest podiums, build logs, and Hall of Fame when shared on Facebook, WhatsApp, X/Twitter, Discord, and Telegram.
- Delivered: Endpoints `GET /api/v1/og/builds/:slugOrId`, `GET /api/v1/og/contests/:id`, `GET /api/v1/og/hall-of-fame`, and `GET /api/v1/og/default`; real-time SVG-to-PNG conversion via sharp at 1200x630; dynamic OpenGraph and Twitter card meta tag injection in SSR HTML; interactive `🔗 Compartir` buttons with Web Share API and clipboard copy fallback; 7 isolated unit tests (`tests/unit/social-og.test.mjs`, total 62 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### BULK-IMPORT -- Herramienta de Importacion Masiva CSV / Excel para Stash & Paint Rack (COMPLETED)
- Goal: Allow modelers to migrate their existing personal inventories of kits and paint racks from CSV, TSV, or Excel spreadsheets directly into Mi Taller with auto-matching against the kit and paint catalogs or automatic custom creation.
- Delivered: Endpoints `POST /api/v1/workbench/import/stash` and `POST /api/v1/workbench/import/paints`; delimiter autodetection (`,`, `\t`, `;`); quoted field handling; multilingual column mapping (ES/EN) and positional fallback; category classification (`gunpla-mecha`, `aviation`, `military`, `automotive`, `naval`); `dryRun` simulation mode; modal `#modal-bulk-import` with tabs, sample loader, file picker, textarea, and preview table; action buttons in `#wb-subtab-stash` and `#wb-subtab-paints`; 10 unit tests (`tests/unit/bulk-import.test.mjs`, total 54 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### WHATSAPP-INQUIRIES -- Direct WhatsApp Community Inquiries on Builds & Showcase (COMPLETED)
- Goal: Direct contact channels between builders and collectors on showcased models and work-in-progress logs for paint recipes, custom commissions, and build purchase inquiries.
- Delivered: Endpoints `GET /api/v1/builds/:slugOrId/whatsapp-inquiry` and `POST /api/v1/builds/whatsapp-inquiry`; 4 intent templates (`paint_recipe`, `custom_commission`, `purchase_build`, `general`); `wa.me` clean number generator with group invite link preservation; `💬 Consultar WhatsApp` action buttons on build cards in `#view-builds`; `💬 Consultar al Modelista (WhatsApp)` in `#lightbox-modal`; modal `#modal-whatsapp-inquiry` with live preview; 4 isolated unit tests (`tests/unit/whatsapp-inquiry.test.mjs`); and verified live deployment on LXC 190.

### CONTEST-HALL-OF-FAME -- Contest Community Voting Badges & Public Hall of Fame (COMPLETED)
- Goal: Public showcase and permanent trophy showcase for contest winners across community tenants with digital winner badges.
- Delivered: Endpoints `GET /api/v1/contests/hall-of-fame` (with multitenant scoping) and `GET /api/v1/contests/:id/podium`; deterministic composite evaluation (70% judge average + 30% community votes); automatic Gold, Silver, Bronze, and People's Choice badge generation (`ContestAwardBadge`); builder profile badge enrichment on `GET /api/v1/builders`; UI Hall of Fame showcase (`#view-contests-hall-of-fame`) in `#view-contests`; builder card award ribbons (`.builder-award-badge`); digital diploma viewing links (`viewCertificate`); 6 isolated unit tests (`tests/unit/contest-hall-of-fame.test.mjs`); and verified live deployment on LXC 190.

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
