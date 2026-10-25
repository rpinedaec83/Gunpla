# Status

Current live state of the project.

## Summary

- Stage: **PVT (In Progress -- DT8, DT9, DT10, B1-B3, PWA, Tech Debt Hardening, Stock Alerts, AI Paint Equivalences, Contest Hall of Fame, WhatsApp Inquiries, Bulk Import Tool, Social OpenGraph Cards & In-App Activity Bell Verified)**
- Overall state: Green -- DT1 through DT10 + B1-B3 + PWA + Stock Alerts + AI Paint Rack Equivalences + Contest Community Voting Badges & Hall of Fame + Direct WhatsApp Community Inquiries + Herramienta de Importacion Masiva CSV / Excel + Tarjetas Dinamicas de Previsualizacion Social OpenGraph + Notificaciones Web Push & Campana de Actividad + 4 Technical Debt resolutions verified via `npm test` (66 unit tests + full integration suite) and live LXC 190 deployment.
- Current branch or release line: `feature/dt12-push-notifications-activity-bell` (PR against `main` on `https://github.com/rpinedaec83/Gunpla`)
- Last meaningful update: 2026-10-25

## Live Capabilities

- **Notificaciones Web Push y Campana de Actividad en la App (Push Notifications & In-App Activity Bell):**
  - **Campana de Notificaciones Interactiva en Topbar (`#activity-bell-btn`):**
    - Contador numérico flotante (`#activity-unread-badge`) que refleja en tiempo real las notificaciones no leídas.
    - Menú desplegable (`#activity-bell-dropdown`) con vista rápida de las últimas 50 notificaciones recibidas, categorizadas por icono temático (💬 comentario en bitácora, ⚖️ evaluación de jurado, 🏆 galardón de concurso, 🎨 actualización de encargo, 📦 alerta de stock en tienda aliada, ⭐ voto comunitario, 🔔 aviso de plataforma).
    - Formateo de fecha y hora relativo ("Hace unos segundos", "Hace 5m", "Hace 2h", "Ayer").
    - Navegación con un clic (`handleNotificationClick`): marca la notificación como leída en el backend (`PATCH /api/v1/notifications/:id/read`) y redirige automáticamente al recurso objetivo (`#/builds/...`, `#/contests/...`, `#/workbench`).
    - Botón "Marcar todas como leídas" (`#activity-mark-all-read`) con actualización optimista de la interfaz.
  - **Soporte de Web Push en Service Worker (`/sw.js`):**
    - Event listener nativo `push` en el Service Worker de la PWA que despliega notificaciones del sistema operativo con icono y vibración.
    - Event listener `notificationclick` que enfoca la ventana existente de la aplicación y navega al enlace de destino o abre una nueva ventana.
    - Banner de activación de alertas de escritorio (`#activity-push-banner`) con flujo de suscripción (`requestPushSubscription`) invocando `registration.pushManager.subscribe`.
  - **Endpoints Especializados de Notificaciones:**
    - `GET /api/v1/notifications`: Listado de notificaciones para el usuario autenticado con conteo `unreadCount` y filtro opcional `?unreadOnly=true`.
    - `PATCH /api/v1/notifications/:id/read`: Marca una notificación específica como leída validando la propiedad del usuario (403 Forbidden).
    - `POST /api/v1/notifications/mark-all-read`: Marca todas las notificaciones pendientes del usuario como leídas.
    - `POST /api/v1/notifications/push-subscribe`: Registra o actualiza una suscripción de navegador Web Push con deduplicación por usuario y endpoint.
    - `DELETE /api/v1/notifications/push-subscribe`: Cancela una suscripción Web Push.
    - `POST /api/v1/notifications/test`: Genera una notificación de prueba para validación inmediata.
  - **Despacho Automático de Notificaciones Orientado a Eventos (`dispatchNotification`):**
    - Disparado automáticamente al comentar una bitácora (notifica al autor), al calificar una obra de concurso (notifica al participante), al actualizar o cotizar un encargo (notifica al modelista o cliente) y cuando una tienda aliada registra stock para una maqueta en el Wishlist (notifica a todos los modelistas interesados).
  - **Pruebas Automatizadas:**
    - Suite unitaria `tests/unit/notifications-bell.test.mjs` (4 casos de prueba aislados cubriendo creación de notificaciones, conteo no leído, deduplicación de push subscriptions y generación del código del Service Worker). Total unit tests: 66 passed en 230ms.
    - Extensión de `scripts/smoketest.mjs` verificando endpoints de autenticación, marcado como leído, suscripción push, presencia del componente en el HTML de PlamoScale y GunplaJunkies, y listeners en `sw.js`.

- **Tarjetas Dinamicas de Previsualizacion Social OpenGraph & Twitter Cards (Social Sharing OpenGraph Preview Cards):**
  - **Generador Vectorial de Tarjetas Sociales 1200x630 (`generateSocialCardSvg`):**
    - Renderiza plantillas graficas de alta fidelidad 1200x630 con estética oscura de lujo (`#0b0f19`), cuadrícula mecha y gradientes dinámicos del tenant (`#2563eb` PlamoScale / `#ef4444` GunplaJunkies).
    - Adaptación inteligente por tipo de contenido:
      1. Bitácoras de montaje: título, subtítulo, autor (`@username`), píldoras de escala/grado/categoría, contador de pasos y likes.
      2. Podio de concursos y Hall of Fame: medallas oficiales (Oro 🥇, Plata 🥈, Bronce 🥉), puntajes de jurado, nombres de ganadores y sellos de certificación.
      3. Tarjeta general del tenant: highlights del ecosistema de modelismo a escala y comunidades aliadas.
    - Conversión en tiempo real de SVG a PNG mediante `sharp` a 1200x630 con encabezados de caché `Cache-Control: public, max-age=3600`.
  - **Endpoints Especializados de OpenGraph:**
    - `GET /api/v1/og/builds/:slugOrId`: Tarjeta dinámica para bitácoras de armado.
    - `GET /api/v1/og/contests/:id`: Tarjeta dinámica con podio oficial de concurso.
    - `GET /api/v1/og/hall-of-fame`: Tarjeta dinámica para el Salón de la Fama público.
    - `GET /api/v1/og/default`: Tarjeta representativa de la plataforma tenant.
  - **Inyección Dinámica de Metadatos SSR en Frontends Web:**
    - En `plamoscale-web` y `gunplajunkies-web`, resolución contextual según ruta solicitada (`/builds/:slug`, `/contests/:id`, `/hall-of-fame`, `/`) inyectando `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `twitter:card`, `twitter:title`, `twitter:description` y `twitter:image`.
    - Botones interactivos `🔗 Compartir` en cada tarjeta de bitácora y tarjeta del Salón de la Fama utilizando la Web Share API nativa (`navigator.share`) con fallback automático a copia en portapapeles y notificación flotante (`shareSocialLink`).
  - **Pruebas Automatizadas:**
    - Suite unitaria `tests/unit/social-og.test.mjs` (7 casos de prueba aislados cubriendo generación SVG, división de líneas largas, modo podio, escape XML, renderizado PNG con sharp e inyección en `renderAppShell`). Total unit tests: 62 passed in 193ms.
    - Extensión de `scripts/smoketest.mjs` verificando endpoints de imagen PNG/SVG y metaetiquetas SSR en ambos portales.

- **Herramienta de Importacion Masiva CSV / Excel para Stash y Paint Rack (Bulk Import Tool):**
  - **Motor Determinista de Parseo y Normalizacion (`parseDelimitedText`):**
    - Autodeteccion inteligente de delimitadores (comas `,`, tabs `\t`, punto y coma `;` tipicos de Excel en espanol) en base a frecuencias de la primera fila.
    - Soporte completo para valores entrecomillados con comas o delimitadores internos.
    - Mapeo bidireccional multilingue (espanol / ingles): nombres de columnas (`Nombre`/`Name`, `Marca`/`Brand`, `Escala`/`Scale`, `Codigo`/`Code`, `Cantidad`/`Quantity`, `Estado`/`Status`, `Notas`/`Notes`) o fallback posicional (`col_0`, `col_1`, ...).
    - Normalizacion semantica de estados de maquetas (`unbuilt`, `in_progress`, `built`, `wishlist`, `for_trade`) y pinturas (`owned`, `low_stock`, `wishlist`).
    - Clasificacion automatica de categorias de escala (`gunpla-mecha`, `aviation`, `military`, `automotive`, `naval`) segun patrones de texto, marcas y escalas.
  - **Endpoints Especializados de Importacion Masiva:**
    - `POST /api/v1/workbench/import/stash`: Importa maquetas al Stash personal con emparejamiento inteligente contra el catalogo de kits (`db.kits`) o creacion limpia de kits personalizados (`kit-custom-...`) con `source: 'user-import'`, soportando previsualizacion (`dryRun: true`) sin persistir cambios.
    - `POST /api/v1/workbench/import/paints`: Importa frascos al Paint Rack con emparejamiento por codigo/marca contra `db.paints` o creacion de pinturas personalizadas (`paint-custom-...`). Si la pintura ya existe en el rack, incrementa ordenadamente la cantidad existente.
  - **Integracion UI Completa en Workbench (Mi Taller):**
    - Boton `📥 Importar CSV / Excel` en subpestana Maquetas (`#wb-subtab-stash`).
    - Boton `📥 Importar CSV Pinturas` en subpestana Rack de Pinturas (`#wb-subtab-paints`).
    - Modal interactivo `#modal-bulk-import` con tabs de seleccion (Maquetas / Pinturas), selector de archivos (.csv, .tsv, .txt), area de texto pegable, boton de plantilla rapida de ejemplo (`insertBulkImportSample`), caja de resumen con badges de emparejamiento, tabla de previsualizacion en vivo y confirmacion directa con recarga de taller.
  - **Pruebas Automatizadas:**
    - Suite unitaria `tests/unit/bulk-import.test.mjs` (10 casos de prueba cubriendo delimitadores, campos entrecomillados, fallback sin encabezados, clasificacion de categorias, normalizacion y extraccion de filas). Total unit tests: 54 passed in 163ms.
    - Extensión de `scripts/smoketest.mjs` con cobertura end-to-end de `dryRun` y ejecucion real para Stash y Pinturas, junto con verificacion de renderizado HTML en PlamoScale y GunplaJunkies.

- **Canales de Consulta Directa por WhatsApp en Obras del Showcase y Bitácoras (Direct WhatsApp Community Inquiries):**
  - **Generador Determinista de Enlaces y Plantillas (`generateWhatsAppInquiry`):**
    - Construcción de enlaces profundos para WhatsApp (`wa.me`) con números limpios internacionales y mensajes preconfigurados según 4 tipos de intención:
      1. `paint_recipe` (Recetas de Pintura & Técnicas de Aerografía).
      2. `custom_commission` (Cotización de Encargo Personalizado de Pintura/Armado).
      3. `purchase_build` (Consulta de Venta/Adquisición de la Maqueta Terminada).
      4. `general` (Consulta Técnica General de Modelismo).
    - Preservación inteligente de enlaces comunitarios y grupos oficiales (`chat.whatsapp.com`).
  - **Endpoints Especializados de Consulta:**
    - `GET /api/v1/builds/:slugOrId/whatsapp-inquiry`: Genera la plantilla de consulta preconfigurada asociada a una bitácora de montaje específica, vinculando al autor y URL canónica.
    - `POST /api/v1/builds/whatsapp-inquiry`: Genera la plantilla de consulta abierta desde cualquier tarjeta del Showcase o fotografía del visor.
  - **Integración UI Completa en el Frontend:**
    - Botón `💬 Consultar WhatsApp` en cada tarjeta de bitácora en `#view-builds`.
    - Botón `💬 Consultar al Modelista (WhatsApp)` integrado directamente en el visor de alta resolución (`#lightbox-modal`).
    - Modal interactivo `#modal-whatsapp-inquiry` con selector de motivos por radio buttons, campo opcional de nombre del remitente, área de edición en vivo del mensaje preformateado y botón de lanzamiento `🚀 Abrir WhatsApp`.
  - **Pruebas Automatizadas:**
    - Suite unitaria `tests/unit/whatsapp-inquiry.test.mjs` (4 casos de prueba aislados). Total unit tests: 43 passed in 151ms.
    - Extensión de `scripts/smoketest.mjs` con cobertura end-to-end de endpoints, generación de enlaces y renderizado en UI de PlamoScale y GunplaJunkies.

- **Insignias de Votación Comunitaria y Salón de la Fama de Concursos (Contest Badges & Hall of Fame):**
  - **Cálculo de Podio y Voto Popular Determinista (`calculateContestAwards`):**
    - Evaluación compuesta ponderada (70% promedio de jurado IPMS/Gunpla + 30% votos de la comunidad) para determinar Medallas de Oro (🥇, 1er Lugar), Plata (🥈, 2do Lugar) y Bronce (🥉, 3er Lugar).
    - Asignación automática de la distinción de Voto Popular (🏆 *People's Choice*) a la obra con mayor cantidad de votos comunitarios.
    - Generación de insignias oficiales (`ContestAwardBadge`) con icono, título de galardón, posición, conteo de votos, puntaje de jurado y enlace verificable al diploma criptográfico con código QR.
  - **Endpoints Especializados de Concursos:**
    - `GET /api/v1/contests/hall-of-fame`: Listado público cross-contest de ganadores y condecoraciones del Salón de la Fama con soporte para filtrado multitenant (`?tenantSlug=...`).
    - `GET /api/v1/contests/:id/podium`: Clasificación del podio oficial (top 3) y mención de voto popular para un certamen específico.
    - Enriquecimiento automático de perfiles públicos de modelistas (`GET /api/v1/builders` y `GET /api/v1/builders/:username`) con `contestBadges: ContestAwardBadge[]`.
  - **Integración UI Completa en el Frontend:**
    - Sección destacada **🏛️ Salón de la Fama y Podio de Concursos** en `#view-contests` antes de los concursos activos/próximos, con tarjetas de obras laureadas, builder avatar, desglose de votos, puntajes y botón directo para visualizar el diploma oficial emitido (`viewCertificate`).
    - Cintas de reconocimientos y medallas (`.builder-award-badge`) en las tarjetas de perfil de modelistas en `#view-builders`.
  - **Pruebas Automatizadas:**
    - Suite unitaria `tests/unit/contest-hall-of-fame.test.mjs` (6 casos de prueba aislados). Total unit tests: 38 passed in 115ms.
    - Extensión de `scripts/smoketest.mjs` con cobertura end-to-end de consulta, ranking, badges y renderizado en UI de PlamoScale y GunplaJunkies.

- **Asistente de Equivalencias en Rack de Pinturas & Mezclador IA (Paint Rack Equivalences):**
  - **Motor Determinista de 4 Familias Químicas (`findPaintEquivalences`):**
    - Conversión cruzada integral entre **Laca** (Mr. Color / Gaia Notes), **Acrílico** (Tamiya X/XF), **Poliuretano** (Vallejo Mecha/Model Color) y **Sprays de Graffiti / Base Agua** (Montana Colors MTN 94 / Water Based / PRO).
    - Base de datos experta con 20 fórmulas calibradas de tonos modelistas e históricos (negros, blancos, metálicos, primarios anime, camuflajes militares, grises e inner frame).
    - Detección en tiempo real de posesión en el taller (`ownedInRack: true`, cantidad de frascos) cruzando el inventario personal del modelista autenticado.
  - **Endpoints Especializados de Taller:**
    - `GET /api/v1/workbench/paints/:id/equivalences`: Consulta directa de equivalencias para un frasco del Paint Rack del usuario con parámetro opcional `targetMedium`.
    - `POST /api/v1/paints/ai/convert`: Conversión abierta por código o nombre con soporte para usuarios autenticados e invitados.
    - `POST /api/v1/paints/ai/recipe`: Formulación de mezclas y proporciones por porcentaje según el tono/mecha deseado, marcando componentes ya disponibles en el taller.
  - **Integración UI Completa en Workbench:**
    - Toolbar dedicado en `#wb-subtab-paints` con contador dinámico `#wb-paints-count-badge` y botón destacado `🧪 Asistente de Equivalencias IA`.
    - Botón `🔄 Equivalencias` en cada tarjeta de pintura del rack para consulta inmediata.
    - Modal interactivo `#modal-paint-equivalences` con pestañas de búsqueda por código y mezclador por color/mecha, chips de acceso rápido a frascos en posesión, badges `✅ En tu Rack`, botones `+ Añadir a Mi Rack` y guía técnica de aerografía (dilución, PSI, boquillas y consejos pro).
  - **Pruebas Automatizadas:**
    - Suite unitaria `tests/unit/paint-equivalences.test.mjs` (6 casos de prueba aislados).
    - Verificación end-to-end en `scripts/smoketest.mjs` (31 pruebas unitarias + smoketest general 100% verde).

- **Alertas de Stock en Tiendas de Confianza vinculadas a la Wishlist del Stash (Stock Alerts):**
  - **Cruce Automático de Inventario & Wishlist:**
    - Endpoint autenticado `GET /api/v1/workbench/wishlist-alerts` que cruza los kits en lista de deseos (`status: 'wishlist'`) del usuario contra el inventario disponible (`inStock: true`) en tiendas verificadas.
    - Soporte para coincidencia exacta por `kitId` y coincidencia difusa (fuzzy matching) normalizada por tokens de nombre de maqueta (limpiando escalas numéricas como `1/144`, `1/100`).
  - **Gestión de Stock por Tiendas (`/api/v1/shops/:id/stock`):**
    - `GET /api/v1/shops/:id/stock`: Catálogo público de inventario en tienda con precios en PEN, descuentos promocionales y etiquetas (`Llegada Reciente`).
    - `POST /api/v1/shops/:id/stock`: Registro y actualización de existencias en tienda con disparo transaccional de correos de alerta via Resend a todos los modelistas con ese kit en su lista de deseos.
  - **Integración UI en el Taller (Workbench Shell):**
    - Badge numérico en el botón de la pestaña Stash (`#wb-stash-alerts-badge`) destacando la cantidad de kits en stock.
    - Banner visual de alerta (`#wb-wishlist-alerts-banner`) en la sub-pestaña de Stash con acceso directo al catálogo de tiendas.
    - Tarjetas de Wishlist enriquecidas con badge de disponibilidad inmediata, precio en PEN, descuento aplicado, y botón de pedido directo por WhatsApp.
  - **Persistencia Híbrida en PostgreSQL 16:**
    - Tabla relacional `shop_stock` con índices y sincronización bidireccional UPSERT.
  - **Pruebas Automatizadas:**
    - Suite unitaria `tests/unit/wishlist-alerts.test.mjs` (5 casos de prueba aislados).
    - Extensión de `scripts/smoketest.mjs` con cobertura end-to-end de consulta, actualización de stock y verificación en UI.

- **Saneamiento Integral de Deuda Tecnica y Suite de Pruebas Unitarias:**
  - **Base de Datos y Sincronizacion Optimizada:**
    - Estado global `PlatformDatabaseState` incluye colecciones dinamicas de `contests`, `shops` y `commissionBuilders`, eliminando datos estaticos quemados.
    - Sincronizacion a PostgreSQL 16 con mecanismo anti-concurrencia y cola debounceada `pendingStateToSync` para evitar barridos O(N) concurrentes.
  - **Seguridad y Hardening en Produccion:**
    - Restriccion de CORS mediante patron regex que valida dominios oficiales (`plamoscale.com`, `gunplajunkies.com`), subdominios white-label y localhost.
    - Middleware de Rate Limiting con ventana deslizante para `/api/v1/auth` y `/api/v1/media/upload` con cabeceras RFC 7807 (`rate-limit-exceeded`).
    - Guard de advertencia en produccion si `JWT_SECRET` no esta configurado explicitamente.
  - **Modularizacion de Arquitectura Frontend (`packages/shared/src/ui-shell/`):**
    - Reduccion de `app-shell.ts` en 2,000 lineas mediante la extraccion de `views.ts` (842 lineas) y `modals.ts` (1,216 lineas).
  - **Suite de Pruebas Unitarias Aisladas (`tests/unit/*.test.mjs`):**
    - 20 pruebas unitarias con el runner nativo de Node.js (`node --test`) para rate limiting, age gate (Ley N 29733), parser de Scalemates y metricas de rubricas de jurados.
    - Integrado en `npm test` (`npm run test:unit && npm run smoketest`).

- **Notificaciones Automaticas por Email en Tiempo Real (Resend) & Consultas en el Bazar (DT10 / /api/v1/marketplace/listings/:id/inquiries):**
  - **Disparo Automatico Transaccional en Tiempo Real:**
    - Evaluacion de Jurado (POST /api/v1/contests/:id/entries/:entryId/judge): Envio automatico de correo al autor del modelo con puntaje acumulado (ej. 38/40 pts), desglose de los 4 criterios (Montaje, Pintura, Acabado, Creatividad), promedio de jurados y comentarios tecnicos.
    - Comentarios en Bitacoras (POST /api/v1/builds/:id/comments): Envio automatico de correo al creador de la maqueta cuando otro modelista comenta en su bitacora, con prevencion de auto-notificacion cuando comenta el propio autor.
    - Cotizacion y Aceptacion de Encargos (PATCH /api/v1/commissions/requests/:id): Envio de correo formal con precio (PEN/USD) y plazo en dias al cliente al ser cotizado; y aviso inmediato al modelista cuando el cliente acepta la cotizacion para coordinar por WhatsApp.
    - Consultas de Compraventa en el Bazar (POST /api/v1/marketplace/listings/:id/inquiries): Modal interactivo (#modal-marketplace-inquiry) en las tarjetas de publicacion para contactar al vendedor por correo, incluyendo datos del comprador, WhatsApp y contraoferta economica opcional.
  - **Buzon Outbox Auditable (GET /api/v1/notifications/outbox):**
    - Registro de cada mensaje con estado (sent / queued-sandbox), ID de Resend y resolucion de remitente verificado segun el portal activo (noreply@plamoscale.com o noreply@gunplajunkies.com).

- **Progressive Web App (PWA) & Modo Offline para el Taller (/manifest.json, /sw.js, /icons/*):**
  - **Aplicación Web Instalable (PWA):**
    - Soporte nativo para instalación en pantalla de inicio en Android, iOS y Desktop.
    - Manifiestos dinámicos adaptados a cada portal (`/manifest.json`) con colores de marca, splash screen, orientación y categorías.
    - Metadatos PWA completos en `<head>`: `mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, iconos táctiles y `theme-color`.
    - Botón interactivo de instalación en el topbar (`#pwa-install-btn`) conectado al evento `beforeinstallprompt`.
  - **Service Worker & Motor de Caché Inteligente (`/sw.js`):**
    - Estrategia **Network-First con Caché Local** para los endpoints del taller y catálogo (`/api/v1/workbench/stash`, `/api/v1/workbench/paints`, `/api/v1/catalog/*`, `/api/v1/commissions/requests`).
    - Permite a los modelistas consultar su **Stash de maquetas** y su **Rack de pinturas** sin conexión a internet en tiendas de modelismo, sótanos o convenciones.
    - Estrategia **Stale-While-Revalidate** para el cascarón de la aplicación (HTML, CSS, iconos y fuentes), garantizando apertura instantánea.
  - **Indicador de Conectividad en Tiempo Real:**
    - Badge dinámico en el topbar (`#pwa-offline-badge`) que se activa automáticamente al perder conexión: `📴 Modo Offline (Taller en local)`.
  - **Generación Vectorial de Iconos con Sharp (`/icons/:name`):**
    - Generación dinámica de iconos SVG vectoriales y conversión automática a PNG de alta resolución (192x192 y 512x512) mediante `sharp` respetando la paleta cromática de cada tenant.

- **Flujo Interactivo de Comisiones y Encargos de Pintura (`B2` / `/api/v1/commissions/*`):**
  - **Solicitud de Encargo en UI Web (`POST /api/v1/commissions/requests`, `#modal-commission-request`):**
    - Modal interactivo desde el directorio de modelistas (`#view-commissions`) para solicitar trabajos de armado y pintura a modelistas verificados (`aperich`, `fog1labs1`, `dcampos`).
    - Selección de maqueta/kit, escala/categoría, suministro de maqueta (*El cliente envía el kit en caja* vs *El modelista adquiere el kit*), presupuesto tentativo y notas del proyecto.
    - **4 Niveles de Acabado Estandarizados (Scope Level):**
      - *Nivel 1: Montaje Limpio & Panel Lining* (Lijado fino de nubs, encastre, panel accent, topcoat mate/satinado).
      - *Nivel 2: Pintura Custom Completa / Aerografía* (Imprimación, paleta a elección, sombras, calcas al agua, barniz).
      - *Nivel 3: Weathering Avanzado & Detallado* (Desgaste, chipping, óxidos, sombreado, filtros y pigmentos).
      - *Nivel 4: Masterpiece / Modificaciones & Diorama* (Pla-plate, resina, iluminación LED, peana y terreno).
    - Generación automática de código de seguimiento único (`COM-2026-XXXX`) y modal de confirmación (`#modal-commission-success`) con enlace directo para chatear por WhatsApp con el modelista.
  - **Panel de Gestión de Encargos en "Mi Taller" (`#wb-subtab-commissions`):**
    - 4ta subpestaña en el Workbench con badge de avisos pendientes en tiempo real.
    - Selector dual: *📥 Solicitudes Recibidas (Como Modelista)* y *📤 Mis Encargos Solicitados (Como Cliente)*.
    - **Gestión para el Modelista:** Modal `#modal-quote-commission` para cotizar precio formal (PEN/USD), plazo estimado en días, condiciones técnicas y cambiar estados (`quoted`, `in_progress`, `completed`, `declined`). Enlace directo a WhatsApp del cliente.
    - **Gestión para el Cliente:** Visualización de la cotización recibida con botones rápidos para `✅ Aceptar Cotización` o `❌ Rechazar`.
  - **Control de Acceso y Notificaciones:** Control estricto de roles y permisos (403 Forbidden para usuarios no asignados), filtros por modelista/cliente y disparo de correos de notificación automática vía Resend.

- **Rúbricas Oficiales de Jueces y Diplomas/Certificados de Concurso (`B1` / `/api/v1/contests/:id/entries/:entryId/*`):**
  - **Rúbrica Estándar de Jurado (`POST .../judge`, `#modal-judge-entry`):**
    - Evaluación oficial con 4 criterios estandarizados (1 a 10 cada uno, máximo 40 puntos): *1. Montaje & Construcción*, *2. Pintura & Aerografía*, *3. Acabado & Weathering/Detallado*, y *4. Creatividad & Presentación*.
    - Cálculo automático de puntuación total acumulada, nota promedio del jurado (`judgeScoreAverage`), total de jueces participantes (`judgeCount`) y retroalimentación técnica constructiva para el modelista.
    - Control de acceso por rol: Solo jueces oficiales, moderadores o administradores (`judge`, `moderator`, `tenant_admin`, `admin`) pueden calificar (403 Forbidden para usuarios estándar).
  - **Diplomas y Certificados Digitales Verificados (`GET .../certificate`, `#modal-contest-certificate`):**
    - Generación automática de diploma oficial en formato HTML/vectorial de alta resolución para los puestos del podio (🥇 *1er Lugar - Medalla de Oro*, 🥈 *2do Lugar - Medalla de Plata*, 🥉 *3er Lugar - Medalla de Bronce*) o mención de honor.
    - Incorpora código de verificación criptográfico único (`CERT-XXXX-XXXX`), código QR dinámico de auditoría que enlaza a la bitácora verificada, sello orlado y firmas oficiales del jurado.
    - Soporte de impresión física directa (`?format=html` con CSS `@media print` optimizado a tamaño apaisado) o visualización interactiva en modal.
- **White-Label Tenant Self-Service Onboarding & Custom Theme Editor (`B3` / `/api/v1/tenants/*`):**
  - **Self-Service Onboarding (`POST /api/v1/tenants`, `#modal-new-tenant`):** Permite a clubes de modelismo, tiendas o comunidades de maquetismo registrar y desplegar su propio portal independiente, asignando al creador como `tenant_admin` automáticamente con slug único, dominio/subdominio, tagline, y enlaces sociales.
  - **Editor de Marca y Temas en Vivo (`PATCH /api/v1/tenants/:slug`, `#modal-tenant-theme`):**
    - Paleta de colores interactiva con presets rápidos (*Titan Blue, Char Crimson, Zaku Military, Gundam Gold, Cyberpunk Neon*).
    - Color pickers en tiempo real para Color Primario (`--primary`), Color de Acento (`--accent`) y Fondo/Superficie (`--bg-dark` y `--card-bg`).
    - Previsualización en vivo en la pantalla (*live CSS custom property mutation*) sin requerir recargar la página.
    - Selector y filtrado de categorías permitidas en el portal (Mecha, Militar, Aviación, Automotriz, Naval, Figuras, Sci-Fi, Diorama).
  - **Permisos & Seguridad:** Validación estricta con RFC 7807 Problem Details; protección contra slugs duplicados (409 Conflict) y autorización obligatoria (`tenant_admin` o `admin`) para modificar marcas de portales existentes.
- **Cloudflare R2 / S3 Object Storage & Media Engine (`POST /api/v1/media/upload`, `GET /api/v1/media/storage-diagnostics`):**
  - **Dual-Engine Architecture:** High-resolution photo upload pipeline powered by Cloudflare R2 (S3 API via `@aws-sdk/client-s3`) for zero-egress permanent cloud storage; graceful automatic fallback to local disk (`data/uploads/`) for development and smoketests when credentials are absent.
  - **Optimización y Compresión Automática de Imágenes (WebP & Dual-Tier):**
    - Pipeline de procesamiento y compresión automática en servidor mediante `sharp`.
    - Corrección automática de orientación EXIF (`.rotate()`).
    - Conversión a formato moderno **WebP** de alta eficiencia.
    - Generación en dos niveles (*Dual-Tier*): Nivel de visualización full (máx. 1920x1920px, `fit: 'inside'`, calidad 82) y nivel de miniatura ligera (máx. 480x480px, `fit: 'inside'`, calidad 80 con sufijo `-thumb.webp`).
    - Cálculo de métricas de compresión transparentes (`originalSizeBytes`, `optimizedSizeBytes`, `compressionRatio` ej. 70-85% de ahorro de ancho de banda).
    - Subida simultánea a Cloudflare R2 o almacenamiento local de ambos niveles.
  - **Security & Integrity:** 15MB file size cap guardrail, MIME type validation, SHA/UUID clean key generation, immutable HTTP cache headers (`max-age=31536000`), and public CDN URL prefixing.
  - **Diagnostic Endpoint:** `GET /api/v1/media/storage-diagnostics` reporting active storage engine (`cloudflare-r2` vs `local-disk`), bucket name, obfuscated account ID, public CDN base URL, y estado del optimizador (`sharp-webp-pipeline`, 1920px máx full, 480px máx thumb, calidad 82).
- **AI Paint Assistant & Formulation Engine (`/api/v1/paints/ai/*`):**
  - **4-Way Chemical Medium Division:** Interactive medium selector allowing modelers to choose between **Laca** (*Mr. Color, Gaia Notes*), **Acrílico** (*Tamiya X/XF*), **Poliuretano** (*Vallejo Mecha/Model Color*), and **Montana Colors** (*MTN 94, MTN Water Based, MTN PRO* - https://www.montanacolors.com/graffiti/spray/).
  - **Cross-Brand & Spray Conversion:** Instant color matching across all 4 chemical mediums with hex swatches, line details, finish type, user Paint Rack cross-referencing (`ownedInRack`), and prioritization of the user's selected medium.
  - **Airbrush & Aerosol Spray Guide:**
    - *Laca:* Mr. Color Leveling Thinner (1:1.5 - 1:2), 12-16 PSI, organic vapor respirator, mirror finish.
    - *Acrílico:* Tamiya X-20A / IPA 90%+ (1:1), 15-20 PSI, low odor.
    - *Poliuretano:* Vallejo Thinner + Flow Improver (70:30), 18-22 PSI, zero-toxicity, maximum friction resistance for Gunpla joints.
    - *Montana Colors (Aerosoles):* Ready-to-spray canisters, recommended caps (*Pocket Cap* or *Skinny Universal Cap* for fine line misting on Gunpla), 20-25 cm spray distance with rapid sweep passes, and plastic primer precautions (MTN PRO) or MTN Water Based for indoor odorless painting.
  - **AI Recipe Generator:** Formulation engine supporting Gemini API (`gemini-3.8-flash`) and an expert local rules matrix for Gunpla anime & military palettes (*Verde Zaku II, Rojo Cometa Char, Azul Titán MK-II, Inner Frame Barbatos, Blanco RG RX-78*), generating mixing percentages or spray cans, cap recommendations, component swatches, and step-by-step airbrush/spray applications (primer, preshading, base, topcoat).
- **Fichas Técnicas Imprimibles & Códigos QR de Mesa (`POST /api/v1/builds/:idOrSlug/spec-card`):**
  - **Dimensiones 100% Configurables:** Selector de medidas con presets estándar (`10x15 cm`, `15x10 cm`, `9x5.5 cm mini`, `A5`, `A4`) o inputs numéricos libres de ancho y alto en centímetros.
  - **Formato Doble o Plano:** Soporte para tarjeta plana (para atril o portarretrato) o caballete plegable de mesa (*Table Tent*) con línea de doblez central e información visible por el reverso para jueces y público.
  - **Código QR Dinámico Vectorial:** Genera un código QR nítido que apunta directamente a la Bitácora de armado online del modelo (`#build-:slug`), permitiendo a jueces y asistentes escanear con su teléfono para ver fotos del esqueleto interno y fórmulas de pintura.
  - **Estilos & Opciones:** Modo ahorro de tinta (*Light Ink-Saver*) para impresoras de concurso o modo *Mecha Dark*, foto de miniatura, desglose de químicas de pintura usadas y casillero de puntuación para jueces (Montaje / Pintura / Acabado / Creatividad).
- **Interactive Personal Workbench & Workshop (`Mi Taller`):**
  - Integrated personal dashboard with live metric counters: Total Stash, Backlog (unbuilt), WIP (in progress), Built (completed), and Paint Rack inventory.
  - **Editor de Perfil de Modelista (`PATCH /api/v1/auth/me`, `#modal-edit-profile`):**
    - Personalización de nombre público / alias, biografía extendida (hasta 500 caracteres), especialidades técnicas con selector de etiquetas rápidas (*Gunpla MG, RG, Custom Paint, Aerografía Laca, Pátinas & Weathering, Dioramas*), número de WhatsApp para contacto/comisiones y enlaces sociales.
    - Subida directa de foto de perfil / avatar integrada con la pipeline de Cloudflare R2 / S3 con vista previa circular en vivo.
    - Sincronización inmediata con el encabezado del Workbench, badge superior del navbar y directorio público de modelistas.
  - **Stash Management:** Add kits from master catalog, track box status (`unbuilt`, `in_progress`, `built`, `for_trade`, `wishlist`), star ratings, acquisition prices, and notes.
  - **Step-by-Step Build Logs:** Create build projects linked to kits, upload progress photos directly from browser/camera via `/api/v1/media/upload`, and add chronological stages (`unboxing`, `assembly`, `priming`, `painting`, `weathering`, `final_reveal`).
  - **Paint Rack:** Inventory control with hex color swatches and instant quantity adjustment (`+` / `-`).
- **Google OAuth 2.0 SSO & Interactive Identity Modal (`Slice 9 / DT9`):**
  - Integrated Google Identity Services (`gsi/client`) across `plamoscale.com` and `gunplajunkies.com`.
  - Interactive multi-tab Auth Modal (`#auth-modal`): 1-click Google Sign-In, credentials login with quick-login buttons for the 4 founding builders, and new account registration.
  - Client-side session management: Persistent state in `localStorage` (`plamo_sso_token`, `plamo_sso_user`), topbar profile badge with avatar and dropdown (Workbench link + Logout).
- **PostgreSQL 16 Relational Engine (`Slice 8 / DT8`):**
  - Production container `gunpla-db` (PostgreSQL 16) running with 17 relational tables, foreign key constraints, and performance indexes.
  - Dual-mode persistence engine (`apps/api/src/core/postgres.ts`): Live PostgreSQL pooling in production (`mode: 'relational-postgres'`, latency ~6ms); offline JSON fallback for zero-dependency CI smoketests.
  - System diagnostics endpoint `GET /api/v1/system/database` reporting real-time database engine, connection state, table row counts, and latency.
- **Stash Marketplace & Custom Commissions (`Slice 7 / DT7`):**
  - Tenant-scoped kit marketplace (`GET /api/v1/marketplace/listings`, `POST /api/v1/marketplace/listings`).
  - Seamless publishing from personal Stash (`stashItemId`), auto-updating inventory status to `for_trade`.
  - Ownership protection on listing edits/deletes (`403 Forbidden`).
  - Featured commission builders directory (`GET /api/v1/commissions/builders`) highlighting top painters (`aperich`, `fog1labs1`, `dcampos`) with direct WhatsApp consultation buttons and portfolios.
  - Interactive "Bazar & Venta de Kits" (`#view-marketplace`) and "Comisiones de Pintura" (`#view-commissions`) views integrated in both web frontends.
- **Group Builds, Contests & Community Voting (`Slice 6 / DT6`):**
  - **Interactive Contest UI & In-App Submissions:** Dedicated contest view (`#view-contests`) in `plamoscale.com` and `gunplajunkies.com` with active contest cards (*Gunpla Open Cup Peru 2026* and *PlamoScale Masters 2026*), countdown dates, rules, prizes, and dynamic participants count badge.
  - **In-App Project Entry Modal (`#modal-contest-entry`):** 1-click submission flow allowing logged-in modelers to select their personal build projects (`GET /api/v1/builds?username=...`), previewing title, category, and cover photo before confirming registration (`POST /api/v1/contests/:id/entries`).
  - **Live Community Voting & Instant Reaction (`voteEntry`):** 1-click toggle voting (`POST /api/v1/contests/:id/entries/:entryId/vote`) with real-time UI tallying, active vote state (`⭐ ¡Votado!`), and duplicate vote prevention.
  - **Podio de Líderes Provisionales:** Automatic real-time top-3 podium (🥇 1° Lugar, 🥈 2° Lugar, 🥉 3° Lugar) computed from community votes and featured prominently at the top of each contest gallery.
  - **Cross-Section Build Linking:** Direct links from contest entries back to full build logs (`#build-:slug`), displaying work-in-progress internal frames, techniques, and paint formulas.
- **Frontends Web (`apps/plamoscale-web` & `apps/gunplajunkies-web`):**
  - Implement **`UXP-01 Modern App Shell Layout`** with persistent left text-labeled sidebar, top utility bar with search & SSO status, breadcrumbs, and responsive mobile drawer.
  - **PlamoScale (`apps/plamoscale-web` on port 3000):** General scale modeling hub (Military, Aviation, Automotive, Gunpla/Mecha, Figures, Naval, Diorama) with Studio Technical palette.
  - **GunplaJunkies (`apps/gunplajunkies-web` on port 3001):** Gunpla & Mecha hub (HG, RG, MG, PG, SD, 30MM, Kotobukiya) with Cyberpunk dark aesthetic.
  - Poptrox-inspired high-resolution lightbox modal allowing full-screen inspection of the 92 migrated photos from the 4 founding builders.
  - Integrated portal switcher allowing instant one-click switching between `plamoscale.com` and `gunplajunkies.com`.
  - Community sections: Contests (*Gunpla Open Cup Peru 2026* and *PlamoScale Masters 2026*), Founding Builders portfolios, and Trusted Shops directory (`bio.txt` & WhatsApp links).
- **Monorepo TypeScript & Central API (`@gunpla/api` + `@gunpla/shared`):**
  - Multi-tenant resolution (`plamoscale` & `gunplajunkies` + custom B2B tenants via `GET /api/v1/tenants/current`).
  - Dual Authentication: Local Username/Email + Password (`POST /api/v1/auth/registrations`, `/sessions`) AND Google SSO (`POST /api/v1/auth/google-sessions`) with automatic email Account Linking and cross-tenant JWT SSO.
  - Resend.com Multi-Domain Email Service (`POST /api/v1/notifications/contact-messages`, `GET /api/v1/notifications/outbox`) using `noreply@plamoscale.com` and `noreply@gunplajunkies.com`.
  - Legacy Seed & Builder Portfolios (`GET /api/v1/builders`, `GET /api/v1/builders/:username`): All 4 founding builders (`aperich`, `dcampos`, `cluna`, `fog1labs1`) and all 92 build photos migrated and served.
  - **Master Catalog & Scalemates Importer (`/api/v1/catalog/*`):**
    - Kits catalog with tenant category scoping (`gunplajunkies` gets Gunpla/Mecha, `plamoscale` gets all scale kits), search, brand/scale filters.
    - Scalemates on-demand kit importer (`POST /api/v1/catalog/kits/import-scalemates`) with deduplication, HTML/JSON-LD metadata extraction, and 4s graceful fallback.
    - Paints and supplies catalog (`GET /api/v1/catalog/paints`) with brand, line, type, finish and hex color swatches.
    - Brands summary (`GET /api/v1/catalog/brands`).
  - **Personal Workbench — Stash, Wishlist & Paint Rack (`/api/v1/workbench/*`):**
    - Stash tracking with status (`unbuilt`, `in_progress`, `built`, `wishlist`, `for_trade`), rating (1-5), price paid, notes, and populated kit details.
    - Paint Rack management with status (`owned`, `low_stock`, `wishlist`), automatic bottle quantity incrementing, and populated hex swatches.
    - Multi-user isolation and ownership verification (`403 Forbidden` protection).
    - Summary metrics endpoint (`GET /api/v1/workbench/summary`).
  - **Step-by-Step Build Logs, Paint Recipes & Media Upload (`/api/v1/builds/*`, `/api/v1/media/*`):**
    - Feed with tenant category scoping (`gunplajunkies` gets Gunpla/Mecha, `plamoscale` gets all scale models), filterable by category, status, builder, search.
    - Build project lifecycle (creation, updates, slug generation with collision prevention, kit linking).
    - Chronological build steps with stages (`unboxing`, `assembly`, `assembly_inner_frame`, `modification`, `priming`, `painting`, `decals`, `weathering`, `final_reveal`), photo URLs, and paint recipe usages with catalog joins.
    - Social interactions (likes toggle, comments).
    - Media upload pipeline supporting base64 data URIs, local `/uploads/` storage, and 15MB file size limit.
  - OpenAPI 3.1 contract (`/openapi.json`) & interactive Swagger UI (`/doc`) + RFC 7807 Problem Details.

## Current Constraints

- Production deployment targets `x-codec` VPS/Homelab + PostgreSQL + Cloudflare R2/S3 + Resend.com verified domains.
- **Homelab & Cloudflare Tunnel Status (2026-10-24):**
  - Proxmox container `atum-gunpla` (LXC 190, `10.20.30.190` / `192.168.1.190`) running Docker Compose with PostgreSQL 16 (`gunpla-db`), Central API (`gunpla-api`), PlamoScale Web (`plamoscale-web`), and GunplaJunkies Web (`gunplajunkies-web`).
  - Cloudflare Tunnel (`xcodec-lab-tunnel`) routes all endpoints with Full Strict SSL:
    - `https://plamoscale.com` & `https://www.plamoscale.com` -> `10.20.30.190:3000` (HTTP/2 200 OK)
    - `https://gunplajunkies.com` & `https://www.gunplajunkies.com` -> `10.20.30.190:3001` (HTTP/2 200 OK)
    - `https://api.plamoscale.com` & `https://api.gunplajunkies.com` -> `10.20.30.190:8080` (HTTP/2 200 OK)
  - Nameservers for both `plamoscale.com` and `gunplajunkies.com` are delegated to Cloudflare: `cruz.ns.cloudflare.com` and `dylan.ns.cloudflare.com`.
  - Resend.com domain verification for both `plamoscale.com` and `gunplajunkies.com` is **100% VERIFIED** (DKIM + SPF + DMARC).
  - Live transactional email dispatch confirmed from `noreply@plamoscale.com` and `noreply@gunplajunkies.com`.
  - Local development and CI smoketests remain 100% self-contained with offline mocks.

## Next Focus

- Phase 3 (PVT / Production Identity & Media): Configure production Google OAuth Client ID credentials in Google Cloud Console for 1-click SSO on web frontends, and configure Cloudflare R2 bucket for high-res photo uploads.
