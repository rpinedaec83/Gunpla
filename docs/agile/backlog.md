# Backlog

Future work queue. Keep this separate from the active burn-down.

## Next Candidates (Phase 2 -- DVT Pilot & Community Expansion)

- All 3 Workbench Feature Requests have been promoted, implemented, and verified in PVT:
  - `[COMPLETED]` **Calculadora de Dilucion y Presion de Aerografo (DT22):** Asistente tecnico interactivo con 5 quimicas, diametros de aguja 0.15mm a 0.5mm, compensacion climatica y alertas.
  - `[COMPLETED]` **Generador de Fichas Tecnicas & Manuales de Despiece (DT23):** Plantillas anatomicas de subensambles por genero, matriz de 5 fases, y exportador imprimible A4 de tarjetas de bandeja con guias de corte.
  - `[COMPLETED]` **Control de Inventario de Herramientas & Vida Util de Cuchillas (DT24):** Inventario de herramientas por categoria, dial de vida util, contador de cortes, alertas de filo desgastado y renovacion de cuchillas.

## Android Mobile Application Backlog (apps/mobile-android)

Target: Native Android application built with Kotlin and Jetpack Compose, consuming the existing central REST API (OpenAPI 3.1) in apps/api. Supports offline-first workbench caching, hardware camera integration with ML Kit, push notifications via Firebase Cloud Messaging (FCM), and multi-tenant branding (GunplaJunkies and PlamoScale).

### EPIC-AND-01: Arquitectura Base, Shell Multi-Tenant y Autenticacion
- **AND-01: Scaffolding del Proyecto Android y Setup Gradle Monorepo:** Configuracion de apps/mobile-android con Gradle Kotlin DSL, Jetpack Compose BOM, Material 3, Navigation Compose, inyeccion de dependencias con Koin o Hilt, y script de verificacion en CI.
- **AND-02: Motor de Temas Dinamicos Multi-Tenant:** Implementacion del sistema de diseno con cambio reactivo de tema segun tenant (GunplaJunkies Dark Cyber vs PlamoScale Slate Industrial), paleta dinamica Material You y tipografia escalable.
- **AND-03: Autenticacion JWT SSO y Almacenamiento Seguro:** Cliente de autenticacion consumiendo /api/v1/auth/login y /register, persistencia segura de tokens JWT en EncryptedSharedPreferences, auto-refresh de sesion y soporte biometrico (huella / facial).
- **AND-04: Base de Datos Local Room y Sincronizacion Offline:** Cache local Room (SQLite) para Stash, catalogo y pinturas, con cola de sincronizacion bidireccional en segundo plano usando Android WorkManager.

### EPIC-AND-02: Gestion de Taller y Stash Personal
- **AND-05: Modulo de Stash con Filtros y Busqueda Instantanea:** Vista de lista y cuadricula de maquetas personales filtradas por estado (unbuilt, in_progress, built, for_trade, wishlist), marcas y escalas, con edicion rapida offline.
- **AND-06: Escaner Nativo de Codigo de Barras con Google ML Kit:** Integracion de camara con ML Kit Barcode Scanning para deteccion en tiempo real de codigos JAN, EAN, UPC y Code-128 en cajas de maquetas, con busqueda automatica en catalogo.
- **AND-07: Resumen Pericial de Tasacion y Ficha de Seguro:** Pantalla de evaluacion de inventario con calculo reactivo de multiplicadores (1.5x en vitrina, 1.15x cajas selladas), graficos de distribucion y exportacion de informe.

### EPIC-AND-03: Bitacora de Construccion y Captura con CameraX
- **AND-08: Captura Rapida de Taller con CameraX (Quick-Log):** Visor de camara personalizado para mesa de trabajo con bloqueo de foco macro, control de exposicion, balance de blancos y previsualizacion de fotos de avance.
- **AND-09: Gestor de Pasos de Avance y Reordenamiento Tactil:** Creacion de hitos de montaje, reordenamiento interactivo de pasos mediante drag-and-drop, etiquetado de pinturas y tecnicas aplicadas.
- **AND-10: Pipeline de Compresion WebP y Carga Asincrona:** Procesamiento en background para redimensionar y comprimir fotos a formato WebP optimizado antes de enviarlas al storage S3 / R2 mediante WorkManager.

### EPIC-AND-04: Herramientas Tecnicas y Modulo Acustico
- **AND-11: Estante de Pinturas (Paint Rack) y Buscador de Equivalencias:** Inventario digital de frascos y aerosoles por quimica, niveles de stock, y recomendador de equivalencias entre marcas con resaltado de pinturas en stock.
- **AND-12: Calculadora de Dilucion y Presion de Aerografo:** Asistente interactivo con selectores de diametro de boquilla (0.15mm a 0.5mm), quimica de pintura y tecnica, calculando ratios exactos de thinner, PSI / Bar y diagnosticos.
- **AND-13: Reproductor de Soundscapes y Temporizador Pomodoro:** Servicio en primer plano (Foreground Service) con Android Media3 para reproduccion de ambientes acusticos procedimentales de taller, control de volumen por capa y temporizador Pomodoro de montaje.
- **AND-14: Registro de Costos y Presupuesto por Proyecto:** Formulario de gastos asociados a cada maqueta (costo del kit, fotograbados, calcas, insumos) con conversion de divisas y desglose de inversion.

### EPIC-AND-05: Asistente con Vision IA y Visualizador 3D / AR
- **AND-15: Asistente Smart Builder con Camara y Vision IA:** Captura de fotos de sprues / grapas para conteo de piezas restantes y fotos macro de marcas de corte (nubs) para evaluacion automatica de calidad y guia de lijado.
- **AND-16: Visor 3D y Realidad Aumentada (ARCore):** Renderizado de modelos 3D con orbit controls e insercion AR en mesa de trabajo a escala real 1:1 comparada con silueta humana.

### EPIC-AND-06: Comunidad, Notificaciones Push y Tiendas
- **AND-17: Feed de Comunidad y Galeria Lightbox:** Explorador de proyectos publicos, busqueda por etiquetas, visor de fotos a pantalla completa con zoom y gestos, likes y comentarios.
- **AND-18: Notificaciones Push con Firebase Cloud Messaging (FCM):** Recepcion de alertas en tiempo real sobre comentarios, resultados de concursos, avisos de stock en tiendas y deep linking a pantallas especificas.
- **AND-19: Proyectos Grupales y Participacion en Concursos:** Vista de proyectos colaborativos comunitarios, inscripcion en concursos activos, seguimiento de podio y credenciales digitales de ganador.
- **AND-20: Directorio de Tiendas y Contacto Directo WhatsApp:** Mapa y listado de tiendas de modelismo asociadas con filtro por pais y boton de apertura directa de chat wa.me.

### Plan de Desarrollo por Fases (ATLAS Lifecycle)

- **Fase M1 -- Cimientos, Autenticacion y Shell Multi-Tenant:**
  - Tareas: AND-01, AND-02, AND-03, AND-04.
  - Objetivo: Aplicacion ejecutable en emulador y dispositivo fisico con login SSO, navegacion Material 3, cambio de tenant y cache Room operativo.
- **Fase M2 -- Modulo de Stash y Escaner de Codigos de Barras:**
  - Tareas: AND-05, AND-06, AND-07.
  - Objetivo: Gestion completa de inventario personal, lectura instantanea de codigos de barras con ML Kit y tasacion de inventario.
- **Fase M3 -- Bitacoras de Montaje, Camara y Pipeline de Medios:**
  - Tareas: AND-08, AND-09, AND-10.
  - Objetivo: Flujo rapido de registro de avances con camara en mesa de trabajo y sincronizacion resiliente en segundo plano.
- **Fase M4 -- Herramientas de Taller, Pinturas y Modulo Acustico:**
  - Tareas: AND-11, AND-12, AND-13, AND-14.
  - Objetivo: Calculadora de aerografo, inventario de pinturas, reproductor de audio continuo en segundo plano y control de costos.
- **Fase M5 -- Comunidad, Notificaciones Push y Tiendas:**
  - Tareas: AND-17, AND-18, AND-19, AND-20.
  - Objetivo: Interaccion social completa, recepcion de notificaciones FCM y directorio de comercios con enlace a WhatsApp.
- **Fase M6 -- Vision IA, Realidad Aumentada y Publicacion:**
  - Tareas: AND-15, AND-16, optimizacion de rendimiento (ProGuard / R8), tests de regresion y generacion de bundle AAB para Google Play.


## Completed Candidates & Parking Lot Items

### SUBASSEMBLY-CARDS -- Generador de Fichas Técnicas & Manuales de Despiece (DT23) (COMPLETED)
- Goal: Technical subassembly planner and printable parts breakdown cards for scale modelers. Organizes projects into anatomically structured subassemblies (Head, Torso, Arms, Legs, Waist, Backpack, Weapons, Cockpit, Chassis, Engine) with runner cross-references (A, B, C, PC), estimated parts count, 5-stage completion tracking (Cut, Cleaned, Primed, Painted, Topcoated), custom workbench modification checklists (scribing, pla-plate, seam line removal, LEDs), and printable A4 workshop organizer cards for workbench trays.
- Delivered: Endpoints `GET /api/v1/builds/:id/subassemblies`, `POST /api/v1/builds/:id/subassemblies` (custom creation and `{ autoGenerate: true }` bulk reset), `PATCH /api/v1/builds/:id/subassemblies/:subId`, `DELETE /api/v1/builds/:id/subassemblies/:subId`, and `GET /api/v1/builds/:id/subassemblies/export` (supporting `format=html` and `format=json`); shared data models in `@gunpla/shared` (`SubassemblyCard`, `SubassemblyStage`, `SubassemblyType`, `CreateSubassemblyDto`, `UpdateSubassemblyDto`, `SubassemblyOverallProgress`); pure anatomical generator `generateDefaultSubassemblies` tailored to Gunpla/Mecha, Military Armor, Aviation, and Automotive with grade multipliers; progress engine `calculateSubassemblyOverallProgress`; high-contrast printable A4 worksheet generator `generateSubassemblyWorksheetHtml` with dotted cut guides `✂️ Cortar ficha para bandeja`; Web UI modal `#modal-subassemblies-breakdown` with project selector, KPI summary bar, drawer for adding blocks, dynamic interactive cards with 5-stage toggles, and direct A4 print trigger; quick-access button `📋 Fichas de Despiece` (`#btn-open-subassemblies-modal`) in Workbench header; 4 isolated unit tests (`tests/unit/subassemblies.test.mjs`, total 147 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### AIRBRUSH-CALCULATOR -- Calculadora de Dilución y Presión de Aerógrafo (DT22) (COMPLETED)
- Goal: Technical assistant and mixing calculator for scale model airbrushing. Computes exact paint-to-thinner ratios, drops, additives (flow improver, retarder), compressor pressure ranges in PSI and Bar, spray distances, and diagnostic troubleshooting (orange peel, tip-dry, spider webbing, dry spray) based on paint chemistry medium (lacquer, alcohol acrylic, water acrylic, enamel, polyurethane primer), needle size (0.15mm to 0.5mm), and application technique.
- Delivered: Endpoints `GET /api/v1/workbench/airbrush/mediums` and `POST /api/v1/workbench/airbrush/calculate` (with RFC 7807 400 Problem Details on invalid input); shared data models in `@gunpla/shared` (`AirbrushMedium`, `AirbrushNeedleSize`, `AirbrushTechnique`, `AirbrushMixRequest`, `AirbrushMixResult`, `AirbrushTroubleshootingItem`); pure calculation logic `calculateAirbrushMix` covering 5 paint chemistries, 5 needle sizes, 5 application techniques, and dynamic ambient climate adjustments (>27°C hot weather retarder boost, >70% humidity anti-blushing guidance); Web UI modal `#modal-airbrush-calculator` with medium selector, needle size pills, technique selector, cup drops slider, climate inputs, real-time ratio/PSI hero card, and diagnostic troubleshooting accordion; quick-access buttons in Workbench header (`#btn-open-airbrush-calc`) and Paint Rack (`#btn-open-airbrush-from-rack`); 5 isolated unit tests (`tests/unit/airbrush-calculator.test.mjs`, total 143 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### WORKSHOP-SOUNDSCAPES -- Pistas de Sonido y Soundscapes de Taller (DT21) (COMPLETED)
- Goal: In-browser procedural soundscape generator and ambient audio player embedded in "Mi Taller" to enhance focus and relaxation during scale model building, masking, and airbrushing sessions. Uses Web Audio API procedural synthesis with zero external audio download dependencies, supporting offline PWA playback, curated modeling presets (Lluvia en Taller, Compresor & Aerografo, Hangar Sci-Fi Mecha, Lo-Fi Chillhop, Jardin Zen & Pincel), Pomodoro session timers (25m build / 5m cleanup), and customizable volume mixing.
- Delivered: Endpoints `GET /api/v1/workbench/soundscapes/presets`, `GET /api/v1/workbench/soundscapes/presets/:id` (with RFC 7807 404), and `GET /api/v1/workbench/soundscapes/timer-modes`; shared data types in `@gunpla/shared` (`SoundscapePreset`, `SoundscapeLayer`, `SoundscapeTimerMode`, `SoundscapeSessionState`); 5 curated presets catalog; pure Web Audio API procedural synthesis (Brown/Pink/White noise buffers, lowpass/bandpass filters, sawtooth/sine drones, Rhodes chords); Pomodoro focus timer with soft chime notification; Web UI modal `#modal-soundscapes` with preset cards, per-layer volume mixer, timer controls; persistent floating mini-dock `#workshop-soundscape-widget` in Mi Taller; toolbar action `🎵 Soundscapes` (`#btn-open-soundscapes`); 4 isolated unit tests (`tests/unit/soundscapes.test.mjs`, total 138 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### STASH-INSURANCE -- Ficha de Tasacion de Inventario y Seguro Patrimonial (DT20) (COMPLETED)
- Goal: Itemized inventory and collectibles insurance valuation report exporter for scale modelers. Aggregates stash and showcase kits with boxart/thumbnails, brands, scales, grades, acquisition cost, estimated market replacement value, category breakdown, and generates print-ready PDF/HTML report with appraiser signature blocks and accounting CSV export.
- Delivered: Endpoints `GET /api/v1/workbench/stash/export/insurance-summary` and `GET /api/v1/workbench/stash/export/insurance-report` (supporting `format=html`, `format=json`, and `format=csv`); data models in `@gunpla/shared` (`StashInsuranceItem`, `StashInsuranceValuationSummary`, `StashInsuranceReportConfig`); pure calculation logic `calculateStashValuation` applying 1.5x on built vitrines, 1.15x on unbuilt boxed stash, 1.25x on WIP, and computing brand/category breakdowns; pure HTML appraisal sheet generator `generateInsuranceReportHtml` with `@page` and `@media print` rules, official disclaimer, and signature lines; Web UI modal `#modal-stash-insurance-report` with real-time KPI cards, currency selector (USD, EUR, MXN, JPY), policy number field, status filters, table preview, and one-click print/CSV triggers; toolbar button `📄 Ficha de Seguro / Tasacion` in `#wb-subtab-stash`; 5 isolated unit tests (`tests/unit/stash-insurance.test.mjs`, total 131 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### SMART-BUILDER-AI -- Asistente Inteligente de Taller con Vision AI (COMPLETED)
- Goal: Multimodal AI-powered workbench assistant for scale modelers. Inspects photos of plastic runners/sprues to identify remaining parts, track assembly progress, and evaluates close-up photos of gate connections/nub marks to score cut quality (0-100), diagnose stress marks or gouges, and provide professional sanding/cleanup corrective actions. Supports Google Gemini 3.5 Flash multimodal vision with transparent deterministic local fallback.
- Delivered: Endpoints `POST /api/v1/workbench/ai/inspect-runner` and `POST /api/v1/workbench/ai/inspect-nub`; shared types in `@gunpla/shared` (`RunnerInspectionRequest`, `RunnerInspectionResponse`, `DetectedRunnerPart`, `NubInspectionRequest`, `NubInspectionResponse`, `NubDiagnosisType`, `NubSeverity`); pure offline analysis functions `analyzeRunnerPhotoOffline` and `analyzeNubPhotoOffline`; multimodal Google Gemini 3.5 Flash (`gemini-3.5-flash-lite`) integration via Google AI Studio API with transparent offline fallback; Web UI modal `#modal-ai-builder-assistant` with camera/file upload, runner parts tally and completion gauge, quality score dial (0-100), diagnostic classification badges, and step-by-step sanding sequence guide; quick action button `🔍 Asistente IA` in Workbench header; 10 isolated unit tests (`tests/unit/builder-ai.test.mjs`, total 126 passing); end-to-end smoketest; and verified live deployment on LXC 190.

### DECAL-STUDIO -- Estudio y Generador de Calcas al Agua y Pistas de Enmascarado (COMPLETED)
- Goal: In-browser vector water-slide decal and masking stencil designer and exporter for scale modelers, generating millimeter-precise vector SVGs for print sheets (A4, A5, A6) at 100% scale without distortion on transparent or white-film decal paper across model scales (1/144, 1/100, 1/60, 1/35, 1/48, 1/24, custom).
- Delivered: Endpoints `GET /api/v1/decals/presets` (with category and scale filters), `GET /api/v1/decals/presets/:id` (with RFC 7807 404), and `POST /api/v1/decals/render-svg` (supporting both structured JSON and direct file download via `Accept: image/svg+xml`); data models in `@gunpla/shared` (`DecalSheetSize`, `DecalScale`, `DecalItemType`, `DecalColor`, `DecalPaperType`, `DecalElement`, `DecalSheetConfig`, `DecalSheetPreset`, `GenerateDecalSvgRequest`, `GenerateDecalSvgResponse`); pure vector SVG generator `generateDecalSheetSvg` with millimeter precision, 4-corner registration crosshairs, peripheral cut guides, hazard stripes, unit numbers, pilot nameplates, kill marks, and faction emblems (Star, Zeon, Shield); 5 curated presets (`gunpla-efsf-caution`, `gunpla-zeon-markings`, `military-tank-stencil`, `aviation-jet-lowvis`, `racing-motorsport-numbers`); Web UI modal `#modal-decal-studio` with dynamic SVG preview viewport `#decal-sheet-svg-viewport`, paper and scale controls, quick-add element buttons, element editor drawer, one-click SVG download (`#btn-download-decal-svg`), direct 100% scale print trigger (`#btn-print-decal-sheet`), and quick action `🏷️ Decal Studio` in Workbench header; 13 isolated unit tests (`tests/unit/decal-studio.test.mjs`, total 116 passing); end-to-end smoketest; and verified live deployment on LXC 190.

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
