import {
  UserRecord,
  MediaAsset,
  KitRecord,
  PaintRecord,
  BuildProjectRecord,
  ContestRecord,
  ShopRecord,
  MarketplaceListingRecord,
  CommissionBuilderRecord,
  GroupBuildRecord
} from '../index';
import type { AppShellConfig, AppShellData } from './app-shell';

export interface ViewRenderHelpers {
  escapeHtml: (str: string) => string;
  categoryPills: Array<{ id: string; label: string }>;
  founders: UserRecord[];
}

export interface LandingNewsArticle {
  id: string;
  category: string;
  tag: string;
  tagColor: string;
  date: string;
  readTime: string;
  title: string;
  summary: string;
  content: string;
}

export function getLandingNewsArticles(isGunpla: boolean): LandingNewsArticle[] {
  return isGunpla
    ? [
        {
          id: 'news-gunpla-rg2',
          category: 'lanzamientos',
          tag: 'Gunpla Oficial',
          tagColor: 'rgba(239, 68, 68, 0.2); color: #f87171;',
          date: '24 Oct 2026',
          readTime: '4 min',
          title: 'Bandai Spirits anuncia nuevas lineas RG 2.0 y reediciones Ver.Ka para 2026',
          summary: 'La division Hobby de Bandai confirma el lanzamiento de tres nuevos modelos con estructura interna multi-bloque articulada y plastico pre-sombreado de inyeccion multicapa.',
          content: 'Bandai Spirits ha revelado de forma oficial su calendario de lanzamientos para la temporada. Entre las novedades mas destacadas se encuentra la evolucion del estandar Real Grade hacia el formato RG 2.0, que elimina completamente los conectores fragiles de polietileno (poly-caps) en favor de aleaciones de resina termoplastica de alta friccion. Ademas, el maestro Katoki Hajime anuncio una nueva version Ver.Ka con calcas al agua exclusivas y doble sistema de apertura de compuertas para exhibicion de mantenimiento. Disponibles para pre-orden en tiendas autorizadas.'
        },
        {
          id: 'news-gunpla-panel-lining',
          category: 'tecnicas',
          tag: 'Tutorial Armado',
          tagColor: 'rgba(6, 182, 212, 0.2); color: #38bdf8;',
          date: '22 Oct 2026',
          readTime: '5 min',
          title: 'Guia de Panel Lining: Capilares vs Gundam Markers sin quebrar el plastico',
          summary: 'El diluyente de esmalte puede provocar microfracturas en el plastico ABS y poliestireno sin imprimar. Te explicamos como aplicar lavados seguros y sellado brillante previo.',
          content: 'El perfilado de lineas (panel lining) es el paso fundamental para dar profundidad y escala a cualquier modelo Gunpla. Sin embargo, aplicar soluciones a base de solventes de esmalte sobre piezas sin sellar debilita las uniones internas de articulaciones fabricadas en plastico ABS. En esta guia recomendamos aplicar previamente una fina capa de barniz brillante acrilico (Gloss Clear), utilizar la accion capilar del pincel aplicador con toques breves de 0.5 segundos y limpiar los excesos con bastoncillos humedecidos en alcohol isopropilico o disolvente de bajo olor Enamel Odorless Thinner.'
        },
        {
          id: 'news-gunpla-gbwc',
          category: 'eventos',
          tag: 'Certamen Mundial',
          tagColor: 'rgba(245, 158, 11, 0.2); color: #fbbf24;',
          date: '20 Oct 2026',
          readTime: '3 min',
          title: 'Gunpla Builders World Cup (GBWC): Calendario oficial y criterios del jurado',
          summary: 'Apertura de inscripciones para el certamen internacional. Conoce los tres pilares evaluados: tecnica de pintura, concepto artistico y modificaciones estructurales (kitbashing).',
          content: 'El comite organizador de GBWC ha publicado las bases de participacion para la edicion actual. Los participantes podran competir en las categorias Junior, Open y U-21. El jurado calificador valorara con un 40% la armonia del esquema de color y acabado de pintura, un 30% la originalidad de la pose dinamica y diorama de soporte, y un 30% el trabajo artesanal de corte, masillado y detalles en pla-plate (laminas de estireno). Prepara tu bitacora en nuestra plataforma para ensayar tu esquema antes de la entrega final.'
        },
        {
          id: 'news-gunpla-nippers',
          category: 'herramientas',
          tag: 'Taller & Precision',
          tagColor: 'rgba(16, 185, 129, 0.2); color: #34d399;',
          date: '18 Oct 2026',
          readTime: '4 min',
          title: 'Mantenimiento de Alicates Single-Blade y Afilado de Cuchillas de Precision',
          summary: 'Un alicate desafilado produce marcas de tension blanquecina (stress marks) en las piezas. Aprende a calibrar el tornillo de tope y lubricar la articulacion central.',
          content: 'Los alicates de un solo filo (como los clasicos GodHand SPN-120 o Tamiya 74123) cortan el bebedero (runner) como una guillotina microscopica. Para mantener su filo impecable: nunca cortes plastico transparente ni bebederos gruesos de mas de 3mm con la punta fina; ajusta el tornillo de tope para que la hoja afilada no choque contra el yunque; y aplica una gota de aceite mineral cada dos semanas. Utiliza nuestro rastreador de vida util en la seccion de herramientas del taller para controlar el desgaste.'
        }
      ]
    : [
        {
          id: 'news-plamo-releases',
          category: 'lanzamientos',
          tag: 'Escala Militar',
          tagColor: 'rgba(59, 130, 246, 0.2); color: #60a5fa;',
          date: '24 Oct 2026',
          readTime: '4 min',
          title: 'Nuevos Moldes 2026: Tamiya 1/35 Panzer y Eduard 1/48 Spitfire con fotograbados',
          summary: 'Tamiya sorprende con un nuevo blindaje texturizado por electroerosion y orugas de suspension articulada, mientras Eduard incluye mascaras precortadas y cabina en resina 3D.',
          content: 'El mercado del modelismo historico recibe grandes lanzamientos este trimestre. Tamiya renueva su iconica linea militar 1/35 incorporando soldaduras reales modeladas en 3D y piezas transparentes para opticas y periscopios. Por su parte, Eduard presenta su edicion ProfiPACK del Spitfire Mk.IX en escala 1/48, que incluye hoja de fotograbados coloreados de fabrica para el panel de instrumentos y calcas Cartograf de maxima precision.'
        },
        {
          id: 'news-plamo-weathering',
          category: 'tecnicas',
          tag: 'Pintura & Weathering',
          tagColor: 'rgba(249, 115, 22, 0.2); color: #fb923c;',
          date: '22 Oct 2026',
          readTime: '6 min',
          title: 'Masterclass de Envejecido: Oxido, Chorretones de Grasa y Polvo Acumulado',
          summary: 'Secretos para aplicar chipping con esponja, lavados de esmalte para lineas de remaches y fijacion de pigmentos minerales en trenes de rodaje.',
          content: 'El envejecido realista requiere capas sucesivas y paciencia. Comenzamos con la tecnica de desconchones (chipping) en dos tonos: primero un tono base aclarado para marcar el raspado superficial y luego un marron oxido oscuro en el centro del golpe. A continuacion, se aplican trazos verticales de oleo diluido (streaking grime) difuminados hacia abajo con pincel humedo en White Spirit. Finalmente, los pigmentos se fijan con barniz mate o fijador especifico sin inundar la superficie.'
        },
        {
          id: 'news-plamo-primer',
          category: 'herramientas',
          tag: 'Materiales',
          tagColor: 'rgba(139, 92, 246, 0.2); color: #a78bfa;',
          date: '19 Oct 2026',
          readTime: '5 min',
          title: 'Guia de Imprimacion para Resina y Fotograbado: Como evitar que la pintura salte',
          summary: 'Las piezas metalicas carecen de porosidad. Aprende a aplicar decapado suave, Metal Primer acido y selladores de poliuretano para un agarre indestructible.',
          content: 'Uno de los mayores dolores de cabeza en el modelismo a escala es despegar la cinta de enmascarar y descubrir que la pintura se ha venido con ella. Antes de pintar cualquier pieza de laton o fotograbado, es imprescindible lijar suavemente con grano 1000 para crear micro-anclajes y desengrasar con acetona o alcohol. Aplica una capa finisima de imprimacion mordiente para metales (Metal Primer) a presion media (18-20 PSI) antes del color definitivo.'
        },
        {
          id: 'news-plamo-dioramas',
          category: 'tecnicas',
          tag: 'Escenografia',
          tagColor: 'rgba(16, 185, 129, 0.2); color: #34d399;',
          date: '17 Oct 2026',
          readTime: '5 min',
          title: 'Dioramas de Aviacion: Construccion de Pistas de Hormigon y Tierra Natural',
          summary: 'Como utilizar carton pluma de alta densidad, pastas texturizadas y estireno para reproducir losas de aerodromo agrietadas con brea de dilatacion.',
          content: 'Para crear una base creible de aviacion 1/48: corta losas cuadradas en placa de espuma rigida de poliestireno extruido (XPS), marca las juntas de dilatacion con un punzon fino y rellena las juntas con pintura negra brillante espesada con arena fina para simular el alquitran o brea de sellado. Aplica lavados de tonos grises y ocres para reflejar el desgaste climatico y manchas de aceite concentradas en la zona de aparcamiento del motor.'
        }
      ];
}

export function renderViews(
  config: AppShellConfig,
  data: AppShellData,
  helpers: ViewRenderHelpers
): string {
  const { escapeHtml, categoryPills, founders } = helpers;
  const isGunpla = config.tenantSlug === 'gunplajunkies';
  const newsArticles = getLandingNewsArticles(isGunpla);

  const featuredGallery = (data.mediaAssets || []).slice(0, 8);

  return `
    <!-- 0. PORTADA & LANDING PAGE (VISTA ACTIVA POR DEFECTO) -->
    <section id="view-landing" class="view-section active">
      <div class="landing-container">

        <!-- HERO PRINCIPAL -->
        <div class="landing-hero" id="landing-hero">
          <div class="landing-badge">
            <span>[+]</span>
            <span>${isGunpla ? 'Portal Oficial Gunpla & Mecha' : 'Portal Oficial Modelismo a Escala'}</span>
          </div>

          <h1 class="landing-title">
            ${
              isGunpla
                ? 'El Santuario de Gunpla: Noticias, Vitrina y Taller Virtual'
                : 'PlamoScale: Noticias, Vitrina Comunitaria y Taller de Modelismo'
            }
          </h1>

          <p class="landing-desc">
            ${
              isGunpla
                ? 'Explora las novedades y lanzamientos de Bandai Spirits, admira las fotos de los coleccionistas de la comunidad y entra a tu taller digital para gestionar tu Stash, pinturas y bitacoras de armado.'
                : 'Descubre noticias del modelismo militar, aviacion, autos y dioramas. Comparte tus obras terminadas y accede al taller virtual para planificar y controlar tus proyectos a escala.'
            }
          </p>

          <div class="landing-cta-row">
            <button class="btn-landing-primary" onclick="enterWorkshop()">
              <span>Entrar al Taller</span>
              <span>--></span>
            </button>
            <a href="#landing-news-section" class="btn-landing-secondary" onclick="document.getElementById('landing-news-section').scrollIntoView({ behavior: 'smooth' }); return false;">
              <span>Noticias y Novedades</span>
            </a>
            <a href="#landing-gallery-section" class="btn-landing-secondary" onclick="document.getElementById('landing-gallery-section').scrollIntoView({ behavior: 'smooth' }); return false;">
              <span>Galeria de Coleccionistas</span>
            </a>
            <button class="btn-landing-secondary" onclick="openCollectorShareModal()">
              <span>[+] Compartir mis Fotos</span>
            </button>
          </div>

          <!-- Metricas de Plataforma -->
          <div class="landing-stats-grid">
            <div class="landing-stat-box">
              <span class="landing-stat-val">${data.kits.length}</span>
              <span class="landing-stat-lbl">Kits en Catalogo</span>
            </div>
            <div class="landing-stat-box">
              <span class="landing-stat-val">${data.paints.length}</span>
              <span class="landing-stat-lbl">Pinturas & Swatches</span>
            </div>
            <div class="landing-stat-box">
              <span class="landing-stat-val">${data.mediaAssets.length}</span>
              <span class="landing-stat-lbl">Obras en Vitrina</span>
            </div>
            <div class="landing-stat-box">
              <span class="landing-stat-val">${data.builds.length}</span>
              <span class="landing-stat-lbl">Bitacoras de Armado</span>
            </div>
            <div class="landing-stat-box">
              <span class="landing-stat-val">${data.builders.length}</span>
              <span class="landing-stat-lbl">Modelistas Activos</span>
            </div>
          </div>
        </div>

        <!-- SECCION 1: NOTICIAS & COSAS INTERESANTES -->
        <section id="landing-news-section" class="landing-section">
          <div class="landing-section-header">
            <div>
              <h2 class="landing-section-title">Noticias & Cosas Interesantes</h2>
              <p class="landing-section-subtitle">
                Lanzamientos de la industria, guias de armado, tecnicas de pintura y novedades de la comunidad.
              </p>
            </div>
            <div class="filter-pills-bar" style="margin-bottom: 0;">
              <button class="filter-pill landing-news-pill active" onclick="filterLandingNews('all', this)">Todas</button>
              <button class="filter-pill landing-news-pill" onclick="filterLandingNews('lanzamientos', this)">Lanzamientos</button>
              <button class="filter-pill landing-news-pill" onclick="filterLandingNews('tecnicas', this)">Tecnicas</button>
              <button class="filter-pill landing-news-pill" onclick="filterLandingNews('herramientas', this)">Herramientas</button>
              <button class="filter-pill landing-news-pill" onclick="filterLandingNews('eventos', this)">Eventos</button>
            </div>
          </div>

          <div class="landing-news-grid" id="landing-news-grid">
            ${newsArticles
              .map(
                (art) => `
              <article class="landing-news-card" data-category="${art.category}" onclick="openLandingArticle('${art.id}')">
                <div class="landing-news-header">
                  <span class="landing-news-tag" style="background: ${art.tagColor};">${art.tag}</span>
                  <span class="landing-news-meta">${art.date} &bull; ${art.readTime}</span>
                </div>
                <h3 class="landing-news-title">${art.title}</h3>
                <p class="landing-news-summary">${art.summary}</p>
                <div class="landing-news-footer">
                  <span>Leer articulo completo</span>
                  <span>--></span>
                </div>
              </article>
            `
              )
              .join('')}
          </div>
        </section>

        <!-- SECCION 2: GALERIA DE COLECCIONISTAS & FOTOS DE LA COMUNIDAD -->
        <section id="landing-gallery-section" class="landing-section">
          <div class="landing-section-header">
            <div>
              <h2 class="landing-section-title">Galeria de los Coleccionistas</h2>
              <p class="landing-section-subtitle">
                Obras terminadas, vitrinas y proyectos en mesa compartidos por modelistas de la comunidad.
              </p>
            </div>
            <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
              <button class="btn-primary" onclick="openCollectorShareModal()">
                <span>[+] Compartir mi Galeria</span>
              </button>
              <button class="filter-pill" onclick="switchTab('showcase')">
                <span>Ver Vitrina Completa (${data.mediaAssets.length} Fotos)</span>
              </button>
            </div>
          </div>

          <!-- Grid de Fotos de Coleccionistas -->
          <div class="gallery-grid">
            ${featuredGallery
              .map(
                (m) => `
              <div class="landing-gallery-card" onclick="openLightbox('${m.fullUrl}', '${m.title.replace(/'/g, "\\'")}', '@${m.builderUsername}')">
                <div style="overflow: hidden; height: 200px; background: #020617;">
                  <img class="landing-gallery-thumb" src="${m.thumbUrl}" alt="${escapeHtml(m.altText || m.title)}" loading="lazy" />
                </div>
                <div class="landing-gallery-info">
                  <div style="font-size: 0.92rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.25rem;">
                    ${m.title}
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: #94a3b8;">
                    <span>Por <strong>@${m.builderUsername}</strong></span>
                    <span style="font-size: 0.7rem; color: var(--accent); font-weight: 600; text-transform: uppercase;">${m.category}</span>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Banner para Invitar a Compartir Galerias -->
          <div class="landing-share-callout">
            <div>
              <div style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">
                Quieres ver tus maquetas en la portada?
              </div>
              <div style="font-size: 0.88rem; color: #94a3b8; max-width: 650px;">
                Sube las fotos de tus modelos terminados o en proceso, documenta tus recetas de pintura y comparte tu pasion con otros coleccionistas.
              </div>
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
              <button class="btn-landing-primary" onclick="openCollectorShareModal()">
                <span>Subir Fotos a la Galeria</span>
              </button>
              <button class="btn-landing-secondary" onclick="switchTab('showcase')">
                <span>Explorar Showcase</span>
              </button>
            </div>
          </div>
        </section>

        <!-- SECCION 3: HERRAMIENTAS DE TU TALLER DIGITAL -->
        <section id="landing-workshop-section" class="landing-section">
          <div class="landing-section-header">
            <div>
              <h2 class="landing-section-title">Tu Taller Digital de Modelismo</h2>
              <p class="landing-section-subtitle">
                Una suite completa de herramientas para organizar tu stash, registrar tus montajes y calcular tus mezclas de pintura.
              </p>
            </div>
            <button class="btn-primary" onclick="enterWorkshop()">
              <span>Entrar al Taller</span>
            </button>
          </div>

          <div class="landing-feature-grid">
            <div class="landing-feature-card">
              <div class="landing-feature-icon" style="font-family: 'Chakra Petch', sans-serif; font-weight: 700; color: var(--accent);">[STASH]</div>
              <h3 class="landing-feature-title">Banco de Trabajo & Stash</h3>
              <p class="landing-feature-desc">
                Gestiona maquetas sin armar, kits en proceso y vitrina terminada. Seguimiento de horas invertidas, valor de inventario y vida util de cuchillas.
              </p>
              <button class="landing-feature-btn" onclick="enterWorkshop()">Gestionar Stash --></button>
            </div>

            <div class="landing-feature-card">
              <div class="landing-feature-icon" style="font-family: 'Chakra Petch', sans-serif; font-weight: 700; color: var(--accent);">[BITACORAS]</div>
              <h3 class="landing-feature-title">Bitacoras Paso a Paso (WIP)</h3>
              <p class="landing-feature-desc">
                Documenta despiece, imprimacion, tecnicas de sombreado, calcas y barnices con fotografias en alta resolucion y recetas de pintura asociadas.
              </p>
              <button class="landing-feature-btn" onclick="switchTab('builds')">Ver Bitacoras --></button>
            </div>

            <div class="landing-feature-card">
              <div class="landing-feature-icon" style="font-family: 'Chakra Petch', sans-serif; font-weight: 700; color: var(--accent);">[CATALOGO]</div>
              <h3 class="landing-feature-title">Catalogo Central & Scalemates</h3>
              <p class="landing-feature-desc">
                Busqueda de kits oficiales, marcas lideres y escaneo de codigos de barra JAN/EAN con sincronizacion automatica de especificaciones.
              </p>
              <button class="landing-feature-btn" onclick="switchTab('kits')">Explorar Catalogo --></button>
            </div>

            <div class="landing-feature-card">
              <div class="landing-feature-icon" style="font-family: 'Chakra Petch', sans-serif; font-weight: 700; color: var(--accent);">[PINTURAS]</div>
              <h3 class="landing-feature-title">Rack de Pinturas & Calculador PSI</h3>
              <p class="landing-feature-desc">
                Control de existencias de pinturas (Mr. Color, Tamiya, Vallejo), carta de equivalencias entre marcas y calculadora de dilucion para aerografo.
              </p>
              <button class="landing-feature-btn" onclick="switchTab('paints')">Ver Pinturas --></button>
            </div>
          </div>

          <!-- Banner CTA Final de Ingreso -->
          <div class="landing-cta-banner" style="margin-top: 2rem;">
            <h3 style="font-size: 1.5rem; font-weight: 800; color: #fff;">
              Todo listo para comenzar en tu taller?
            </h3>
            <p style="color: #cbd5e1; font-size: 0.95rem; max-width: 650px;">
              Ingresa para tener a mano todas las herramientas que hemos desarrollado: inventario de kits, despiece tecnico, calculadora de aerografo y mas.
            </p>
            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
              <button class="btn-landing-primary" onclick="enterWorkshop()" style="font-size: 1.05rem; padding: 0.85rem 2rem;">
                <span>Entrar al Taller Ahora</span>
              </button>
              <button class="btn-landing-secondary" onclick="openAuthModal()">
                <span>Iniciar Sesion 1-Click</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    </section>

    <!-- 1. SHOWCASE TAB -->
    <section id="view-showcase" class="view-section">
      <!-- Category Filter Pills -->
      <div class="filter-pills-bar">
        ${categoryPills
          .map(
            (p, idx) => `
          <button class="filter-pill ${idx === 0 ? 'active' : ''}" onclick="filterShowcase('${p.id}', this)">
            ${p.label}
          </button>
        `
          )
          .join('')}
      </div>

      <!-- Gallery Grid -->
      <div class="gallery-grid" id="gallery-grid-container">
        ${data.mediaAssets
          .map(
            (m) => `
          <div class="gallery-card" data-category="${m.category}" data-title="${m.title.toLowerCase()}" data-author="${m.builderUsername.toLowerCase()}" onclick="openLightbox('${m.fullUrl}', '${m.title.replace(/'/g, "\\'")}', '@${m.builderUsername}')">
            <img class="gallery-card-thumb" src="${m.thumbUrl}" alt="${m.altText}" loading="lazy" />
            <div class="gallery-card-info">
              <div class="gallery-card-title">${m.title}</div>
              <div class="gallery-card-builder">
                <span>Por <strong>@${m.builderUsername}</strong></span>
                <span style="margin-left: auto; font-size: 0.72rem; color: #64748b; text-transform: uppercase;">${m.category}</span>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>

    <!-- 2. BUILDS TAB -->
    <section id="view-builds" class="view-section">
      <div class="builds-list">
        ${data.builds
          .map(
            (b) => `
          <article class="build-card">
            <div class="build-card-header">
              <div>
                <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--primary); font-weight: 600; margin-bottom: 0.2rem;">
                  ${b.category} ${b.scale ? '• ' + b.scale : ''} ${b.grade ? '• ' + b.grade : ''}
                </div>
                <h2 style="font-size: 1.3rem; font-weight: 700; color: #fff;">${b.title}</h2>
                <div style="font-size: 0.84rem; color: #94a3b8; margin-top: 0.2rem;">
                  Modelista: <strong>@${b.username}</strong> • Estado: <span style="color: #4ade80;">${b.status}</span> • Vistas: ${b.viewCount} • ❤️ ${b.likeCount}
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <button class="filter-pill" style="font-size: 0.78rem; padding: 0.4rem 0.75rem; background: rgba(56,189,248,0.15); color: #38bdf8; border-color: rgba(56,189,248,0.3);" onclick="openSpecCardModal('${b.id}')">🏷️ Ficha de Mesa & QR</button>
                <button class="filter-pill" style="font-size: 0.78rem; padding: 0.4rem 0.75rem; background: rgba(37,211,102,0.15); color: #4ade80; border-color: rgba(37,211,102,0.3);" onclick="openWhatsAppInquiryModal('${b.username}', '${escapeHtml(b.title)}', 'build', '${b.slug}')">💬 Consultar WhatsApp</button>
                <button class="filter-pill" style="font-size: 0.78rem; padding: 0.4rem 0.75rem; background: rgba(168,85,247,0.15); color: #c084fc; border-color: rgba(168,85,247,0.3);" onclick="shareSocialLink('${escapeHtml(b.title)}', '/builds/${b.slug || b.id}', 'Mira la bitácora de ${escapeHtml(b.title)} en ${escapeHtml(config.tenantName)}')">🔗 Compartir</button>
                <button class="btn-primary" onclick="likeBuild('${b.id}')">❤️ Like</button>
              </div>
            </div>

            <div class="build-steps-timeline">
              ${b.steps
                .map(
                  (s, idx) => `
                <div class="step-item">
                  <div class="step-badge">${idx + 1}</div>
                  <div class="step-content">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div class="step-title">${s.title}</div>
                      <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">${s.stage}</span>
                    </div>
                    <p class="step-desc">${s.description}</p>
                    ${
                      s.photoUrls && s.photoUrls.length > 0
                        ? `
                      <div class="step-photo-gallery" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
                        ${s.photoUrls
                          .map(
                            (u) => `
                          <img src="${u}" alt="${escapeHtml(s.title)}" style="width: 75px; height: 75px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.15);" onclick="openLightbox('${u}', '${escapeHtml(s.title)}', '@${b.username}')" />
                        `
                          )
                          .join('')}
                      </div>
                    `
                        : ''
                    }
                    ${
                      s.paintUsages && s.paintUsages.length > 0
                        ? `
                      <div class="paint-recipe-tags">
                        ${s.paintUsages
                          .map(
                            (pu) => `
                          <div class="recipe-tag">
                            <span class="recipe-swatch" style="background-color: ${pu.paint ? pu.paint.hexColor : '#fff'};"></span>
                            <span>${pu.paint ? pu.paint.brand + ' ' + pu.paint.name : pu.paintId}</span>
                            ${pu.role ? '<span style="color: #94a3b8;">(' + pu.role + ')</span>' : ''}
                          </div>
                        `
                          )
                          .join('')}
                      </div>
                    `
                        : ''
                    }
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </article>
        `
          )
          .join('')}
      </div>
    </section>

    <!-- 3. KITS TAB -->
    <section id="view-kits" class="view-section">
      <div class="catalog-grid">
        ${data.kits
          .map(
            (k) => `
          <div class="catalog-card">
            <div class="catalog-card-header">
              <span class="catalog-brand-badge">${k.brand}</span>
              <span style="font-size: 0.75rem; color: #94a3b8;">${k.scale}</span>
            </div>
            <div class="catalog-card-title">${k.name}</div>
            <div class="catalog-specs-row">
              <span>Kit #: ${k.kitNumber || 'N/A'}</span>
              <span>•</span>
              <span>Año: ${k.releaseYear || 'N/A'}</span>
              ${k.grade ? '<span>• ' + k.grade + '</span>' : ''}
            </div>
            <div style="margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="filter-pill" onclick="openKit3dViewerModal('${k.id}')" style="font-size: 0.75rem; padding: 0.25rem 0.55rem; color: #c084fc; border-color: rgba(168, 85, 247, 0.4); display: inline-flex; align-items: center; gap: 0.25rem;">
                <span>📐</span> Visor 3D
              </button>
              ${
                k.scalematesUrl
                  ? `
                <a href="${k.scalematesUrl}" target="_blank" rel="noopener" style="font-size: 0.75rem; color: var(--accent); text-decoration: none;">
                  Scalemates ➔
                </a>
              `
                  : ''
              }
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>

    <!-- 4. PAINTS TAB -->
    <section id="view-paints" class="view-section">
      <!-- Paints Navigation Tabs -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
        <button id="paints-tab-btn-catalog" class="filter-pill active" onclick="switchPaintsSubtab('catalog')">
          🎨 Catálogo Maestro de Pinturas
        </button>
        <button id="paints-tab-btn-ai" class="filter-pill" onclick="switchPaintsSubtab('ai')">
          🤖 Asistente IA de Mezclas & Equivalencias
        </button>
      </div>

      <!-- Tab 1: Catalog Grid -->
      <div id="paints-subtab-catalog">
        <div class="paint-grid">
          ${data.paints
            .map(
              (p) => `
            <div class="paint-card" onclick="prefillAiPaintConversion('${p.brand}', '${p.code}')" style="cursor: pointer;" title="Haz clic para ver equivalencias IA">
              <div class="paint-swatch" style="background-color: ${p.hexColor};"></div>
              <div>
                <div class="paint-name">${p.name}</div>
                <div class="paint-code">${p.brand} • ${p.code}</div>
                <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">${p.line} (${p.finish})</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Tab 2: AI Assistant -->
      <div id="paints-subtab-ai" style="display: none;">
        <!-- 4-Way Paint Medium Selector Header -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">🧪</span>
                <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff;">1. Escoge tu Medio / Tipo de Pintura</h3>
              </div>
              <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">
                Selecciona la química base con la que deseas pintar. Las equivalencias, dilución, boquillas y recetas se adaptarán automáticamente.
              </p>
            </div>
            <span id="selected-medium-badge" class="status-badge" style="background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); font-size: 0.82rem; padding: 0.3rem 0.75rem;">
              🟣 Laca (Mr. Color)
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
            <!-- 1. Laca -->
            <div id="medium-card-lacquer" class="medium-select-card active lacquer" onclick="selectPaintMedium('lacquer')">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 1.2rem;">🟣</span>
                <span style="font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(168,85,247,0.2); color: #c084fc; font-weight: 600;">Mr. Color / Gaia</span>
              </div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Laca (Solvente)</div>
              <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.3;">Pigmento ultrafino, secado en minutos y máxima adherencia. Nivelado espejo.</div>
            </div>

            <!-- 2. Acrílico -->
            <div id="medium-card-acrylic" class="medium-select-card acrylic" onclick="selectPaintMedium('acrylic')">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 1.2rem;">🔵</span>
                <span style="font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 600;">Tamiya X/XF</span>
              </div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Acrílico (Alcohólico)</div>
              <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.3;">Bajo olor, versátil para aerógrafo y pincel, dilución limpia con IPA o X-20A.</div>
            </div>

            <!-- 3. Poliuretano -->
            <div id="medium-card-polyurethane" class="medium-select-card polyurethane" onclick="selectPaintMedium('polyurethane')">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 1.2rem;">🟢</span>
                <span style="font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(34,197,94,0.2); color: #4ade80; font-weight: 600;">Vallejo Mecha</span>
              </div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Poliuretano Acrílico</div>
              <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.3;">Base acuosa de ultra resistencia al roce mecánico (ideal articulaciones Gunpla).</div>
            </div>

            <!-- 4. Montana Colors -->
            <div id="medium-card-montana_colors" class="medium-select-card montana_colors" onclick="selectPaintMedium('montana_colors')">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 1.2rem;">🎨</span>
                <span style="font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(249,115,22,0.2); color: #fb923c; font-weight: 600;">MTN 94 / WB / PRO</span>
              </div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Montana Colors (Spray)</div>
              <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.3;">Aerosoles profesionales de baja presión (MTN 94), base agua sin olor (WB) y caps finos.</div>
            </div>
          </div>

          <!-- Dynamic Chemistry & Safety Guide -->
          <div id="medium-info-panel" style="background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.25); border-radius: 8px; padding: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
              <span style="font-size: 0.9rem;">📌</span>
              <strong id="medium-info-title" style="font-size: 0.85rem; color: #c084fc;">Química & Técnica: Laca (Mr. Color / Gaia Notes)</strong>
            </div>
            <div id="medium-info-body" style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
              • <strong>Solvente / Vehículo:</strong> Ésteres y solventes aromáticos orgánicos.<br>
              • <strong>Dilución Óptima:</strong> 1:1.5 a 1:2 con Mr. Color Leveling Thinner (con retardante antiniebla).<br>
              • <strong>Presión de Trabajo:</strong> 12 - 16 PSI (0.8 - 1.1 bar) con boquilla 0.2mm a 0.3mm.<br>
              • <strong>Seguridad:</strong> Obligatorio uso de respirador para vapores orgánicos y cabina de extracción.<br>
              • <strong>Compatibilidad Plástico:</strong> Aplicar sobre imprimación o en capas finas para no derretir poliestireno (PS).
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <!-- 1. Equivalencias entre Marcas -->
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.3rem;">🔄</span>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Conversor de Equivalencias</h3>
            </div>
            <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
              Cruza códigos entre <strong>Mr. Color (Laca)</strong>, <strong>Tamiya (Acrílico)</strong>, <strong>Vallejo (Poliuretano)</strong> y <strong>Montana Colors (MTN 94 / WB)</strong>.
            </p>

            <form onsubmit="handleAiConvertSubmit(event)" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div class="auth-input-group" style="margin-bottom: 0;">
                <label class="auth-label">Pintura a Convertir</label>
                <select id="ai-convert-code-select" class="auth-input">
                  <optgroup label="Tamiya (Acrílico)">
                    <option value="XF-1">Tamiya XF-1 (Flat Black)</option>
                    <option value="XF-2">Tamiya XF-2 (Flat White)</option>
                    <option value="XF-62">Tamiya XF-62 (Olive Drab)</option>
                    <option value="XF-63">Tamiya XF-63 (German Grey)</option>
                  </optgroup>
                  <optgroup label="Mr. Color (Laca)">
                    <option value="C108">Mr. Color C108 (Character Red)</option>
                    <option value="C110">Mr. Color C110 (Character Blue)</option>
                    <option value="C113">Mr. Color C113 (RLM04 Yellow)</option>
                    <option value="C28">Mr. Color C28 (Steel / Metallic)</option>
                    <option value="C71">Mr. Color C71 (Midnight Blue)</option>
                  </optgroup>
                  <optgroup label="Vallejo (Poliuretano)">
                    <option value="70.950">Vallejo 70.950 (Black Model Color)</option>
                    <option value="69.008">Vallejo Mecha 69.008 (Mecha Red)</option>
                    <option value="69.011">Vallejo Mecha 69.011 (Mecha Dark Blue)</option>
                  </optgroup>
                  <optgroup label="Montana Colors (Sprays MTN 94 & WB)">
                    <option value="RV-242">Montana MTN 94 RV-242 (Matt Black)</option>
                    <option value="RV-01">Montana MTN 94 RV-01 (Blanco Blanco)</option>
                    <option value="RV-3012">Montana MTN 94 RV-3012 (Rojo Madrid)</option>
                    <option value="RV-5005">Montana MTN 94 RV-5005 (Azul Profundo)</option>
                    <option value="RV-6018">Montana MTN 94 RV-6018 (Verde Valle)</option>
                    <option value="WB-9011">Montana MTN Water Based WB-9011 (Carbon Black)</option>
                  </optgroup>
                </select>
              </div>

              <button type="submit" id="btn-convert-submit" class="btn-primary" style="justify-content: center; padding: 0.65rem;">
                🔍 Calcular Equivalencias & Dilución
              </button>
            </form>

            <!-- Results Slot -->
            <div id="ai-convert-result" style="margin-top: 1.25rem; display: none;"></div>
          </div>

          <!-- 2. Generador de Recetas IA -->
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.3rem;">✨</span>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Generador de Recetas & Tonos IA</h3>
            </div>
            <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
              Describe el color o modelo Gunpla y la IA generará la formulación de mezcla o los aerosoles y boquillas recomendadas para tu medio.
            </p>

            <form onsubmit="handleAiRecipeSubmit(event)" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div class="auth-input-group" style="margin-bottom: 0;">
                <label class="auth-label">Tono o Modelo a Pintar</label>
                <input type="text" id="ai-recipe-query-input" class="auth-input" placeholder="ej. Verde Zaku II Militar, Azul Titan, Char Aznable..." required>
              </div>

              <!-- Quick Chips -->
              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: -0.25rem;">
                <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;" onclick="setRecipeQuery('Verde Zaku II Militar')">Verde Zaku II</button>
                <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;" onclick="setRecipeQuery('Rojo Cometa Char Aznable')">Rojo Char</button>
                <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;" onclick="setRecipeQuery('Azul Titán Gundam MK-II')">Azul Titán</button>
                <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;" onclick="setRecipeQuery('Inner Frame Barbatos Metalico')">Frame Barbatos</button>
                <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;" onclick="setRecipeQuery('Blanco RX-78-2 Real Grade')">Blanco RX-78</button>
              </div>

              <button type="submit" id="btn-recipe-submit" class="btn-primary" style="justify-content: center; padding: 0.65rem; background: #0284c7; border-color: #0284c7;">
                ✨ Generar Receta con IA
              </button>
            </form>

            <!-- Recipe Results Slot -->
            <div id="ai-recipe-result" style="margin-top: 1.25rem; display: none;"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. WORKBENCH TAB -->
    <section id="view-workbench" class="view-section">
      <!-- Unauthenticated State -->
      <div id="workbench-unauth-view" style="display: none; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 3rem 2rem; text-align: center; max-width: 720px; margin: 2rem auto;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛠️</div>
        <h2 style="font-size: 1.75rem; color: #fff; font-weight: 700; margin-bottom: 0.75rem;">Tu Banco de Trabajo & Taller Personal</h2>
        <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem;">
          Inicia sesión con tu cuenta de Google o con tus credenciales de modelista para registrar maquetas en tu <strong>Stash</strong>, organizar tu <strong>Rack de pinturas</strong> y publicar tus <strong>Bitácoras de armado</strong> paso a paso.
        </p>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem;">
          <button class="btn-primary" onclick="openAuthModal()" style="padding: 0.75rem 1.5rem; font-size: 0.95rem;">
            🚀 Iniciar Sesión con Google SSO
          </button>
          <button class="filter-pill" onclick="quickLoginFounder('aperich')" style="padding: 0.75rem 1.25rem; font-size: 0.85rem;">
            ⚡ Probar Demo (Aldo Perich)
          </button>
        </div>
      </div>

      <!-- Authenticated State -->
      <div id="workbench-auth-view" style="display: none;">
        <!-- Header Banner with Metrics & Quick Actions -->
        <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.75rem; margin-bottom: 1.75rem;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: flex-start; gap: 1rem; max-width: 600px;">
              <div id="wb-user-avatar-slot"></div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <h2 id="wb-user-title" style="font-size: 1.4rem; font-weight: 700; color: #fff;">Mi Taller</h2>
                  <span id="wb-age-badge" class="status-badge">Verificado</span>
                </div>
                <div id="wb-user-subtitle" style="font-size: 0.82rem; color: #94a3b8;">Inventario personal de modelismo</div>
                <div id="wb-user-bio" style="font-size: 0.82rem; color: #cbd5e1; margin-top: 0.4rem; line-height: 1.4; display: none;"></div>
                <div id="wb-user-specialties" style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.4rem;"></div>
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
              <button id="btn-scan-barcode-header" class="btn-primary" onclick="openBarcodeScannerModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; background: linear-gradient(135deg, #0ea5e9, #6366f1); display: inline-flex; align-items: center; gap: 0.35rem; border: none; box-shadow: 0 4px 12px rgba(14,165,233,0.25);">
                <span>📷</span> Escanear Caja (JAN)
              </button>
              <button id="btn-open-diorama-studio" class="filter-pill" onclick="openKit3dViewerModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(168, 85, 247, 0.4); color: #c084fc; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>📐</span> Diorama Studio 3D
              </button>
              <button id="btn-open-build-costs" class="filter-pill" onclick="openBuildCostsModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(234, 179, 8, 0.4); color: #facc15; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>💰</span> Costos & Presupuesto
              </button>
              <button id="btn-open-decal-studio" class="filter-pill" onclick="openDecalStudioModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(14, 165, 233, 0.4); color: #38bdf8; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>🏷️</span> Decal Studio
              </button>
              <button id="btn-open-ai-assistant" class="filter-pill" onclick="openAiAssistantModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(168, 85, 247, 0.4); color: #c084fc; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>🔍</span> Asistente IA
              </button>
              <button id="btn-open-soundscapes" class="filter-pill" onclick="openSoundscapesModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(20, 184, 166, 0.4); color: #2dd4bf; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>🎵</span> Soundscapes
              </button>
              <button id="btn-open-airbrush-calc" class="filter-pill" onclick="openAirbrushCalculatorModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(249, 115, 22, 0.4); color: #fb923c; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>🎨</span> Ratio Aerógrafo
              </button>
              <button id="btn-open-subassemblies-modal" class="filter-pill" onclick="openSubassembliesModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(99, 102, 241, 0.4); color: #818cf8; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>📋</span> Fichas de Despiece
              </button>
              <button id="btn-open-tools-inventory" class="filter-pill" onclick="openToolsInventoryModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(234, 179, 8, 0.4); color: #facc15; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>✂️</span> Herramientas & Cuchillas
              </button>
              <button class="filter-pill" onclick="openEditProfileModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>✏️</span> Editar Perfil
              </button>
              <button id="btn-import-stash-csv" class="filter-pill" onclick="openBulkImportModal('stash')" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(34, 197, 94, 0.4); color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>📥</span> Importar CSV / Excel
              </button>
              <button class="btn-primary" onclick="openAddStashModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem;">
                + Agregar Kit al Stash
              </button>
              <button class="btn-primary" onclick="openNewBuildModal()" style="background: #0284c7; border-color: #0284c7; font-size: 0.82rem; padding: 0.5rem 0.9rem;">
                + Nueva Bitácora (WIP)
              </button>
              <button class="filter-pill" onclick="openAddPaintModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem;">
                + Registrar Pintura
              </button>
            </div>
          </div>

          <!-- Real-Time Metrics Strip -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Stash Total</div>
              <div id="wb-stat-stash" style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-top: 0.2rem;">0</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.75rem; color: #38bdf8; text-transform: uppercase;">Backlog (Sin armar)</div>
              <div id="wb-stat-unbuilt" style="font-size: 1.4rem; font-weight: 700; color: #38bdf8; margin-top: 0.2rem;">0</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.75rem; color: #f59e0b; text-transform: uppercase;">En Armado (WIP)</div>
              <div id="wb-stat-wip" style="font-size: 1.4rem; font-weight: 700; color: #f59e0b; margin-top: 0.2rem;">0</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.75rem; color: #4ade80; text-transform: uppercase;">Terminados</div>
              <div id="wb-stat-built" style="font-size: 1.4rem; font-weight: 700; color: #4ade80; margin-top: 0.2rem;">0</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.75rem; color: #c084fc; text-transform: uppercase;">Paint Rack</div>
              <div id="wb-stat-paints" style="font-size: 1.4rem; font-weight: 700; color: #c084fc; margin-top: 0.2rem;">0</div>
            </div>
          </div>
        </div>

        <!-- Workbench Sub-Tabs -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; flex-wrap: wrap;">
          <button id="wb-subtab-btn-stash" class="filter-pill active" onclick="switchWorkbenchSubtab('stash')">
            📦 Mi Stash de Maquetas <span id="wb-stash-alerts-badge" class="nav-badge" style="display:none; background: #22c55e; color: #fff; margin-left: 0.35rem; font-size: 0.72rem; padding: 0.1rem 0.45rem;">0</span>
          </button>
          <button id="wb-subtab-btn-builds" class="filter-pill" onclick="switchWorkbenchSubtab('builds')">
            📝 Mis Bitácoras de Armado
          </button>
          <button id="wb-subtab-btn-paints" class="filter-pill" onclick="switchWorkbenchSubtab('paints')">
            🎨 Mi Rack de Pinturas
          </button>
          <button id="wb-subtab-btn-commissions" class="filter-pill" onclick="switchWorkbenchSubtab('commissions')">
            💼 Encargos & Comisiones <span id="wb-commissions-badge" class="nav-badge" style="display:none; margin-left: 0.35rem; font-size: 0.72rem; padding: 0.1rem 0.45rem;">0</span>
          </button>
          <button id="wb-subtab-btn-tools" class="filter-pill" onclick="switchWorkbenchSubtab('tools')">
            ✂️ Herramientas & Cuchillas <span id="wb-tools-wear-badge" class="nav-badge" style="display:none; background: #ef4444; color: #fff; margin-left: 0.35rem; font-size: 0.72rem; padding: 0.1rem 0.45rem;">0</span>
          </button>
        </div>

        <!-- Sub-Tab 1: Stash Grid -->
        <div id="wb-subtab-stash" class="wb-subtab-content">
          <!-- Stash Action & Count Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">📦 Inventario de Cajas</h3>
              <span id="wb-stash-count-badge" style="background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); font-size: 0.75rem; padding: 0.15rem 0.55rem; border-radius: 9999px; font-weight: 600;">0 maquetas</span>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button id="btn-scan-barcode-stash" class="btn-primary" onclick="openBarcodeScannerModal()" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; background: linear-gradient(135deg, #0ea5e9, #6366f1); display: inline-flex; align-items: center; gap: 0.35rem; border: none;">
                📷 Escanear Caja (JAN / EAN)
              </button>
              <button id="btn-diorama-studio-stash" class="filter-pill" onclick="openKit3dViewerModal()" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; border-color: rgba(168, 85, 247, 0.4); color: #c084fc; display: inline-flex; align-items: center; gap: 0.35rem;">
                📐 Diorama Studio 3D
              </button>
              <button id="btn-insurance-report-stash" class="filter-pill" onclick="openInsuranceReportModal()" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; border-color: rgba(234, 179, 8, 0.4); color: #facc15; display: inline-flex; align-items: center; gap: 0.35rem;">
                📄 Ficha de Seguro / Tasación
              </button>
              <button class="filter-pill" onclick="openAddStashModal()" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
                + Agregar Manual
              </button>
            </div>
          </div>

          <!-- Wishlist Stock Alerts Live Banner -->
          <div id="wb-wishlist-alerts-banner" style="display: none; margin-bottom: 1.25rem;"></div>

          <div id="wb-stash-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
            <!-- Dynamically populated via loadWorkbenchData() -->
          </div>
        </div>

        <!-- Sub-Tab 2: Builds Grid -->
        <div id="wb-subtab-builds" class="wb-subtab-content" style="display: none;">
          <div id="wb-builds-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Dynamically populated via loadWorkbenchData() -->
          </div>
        </div>

        <!-- Sub-Tab 3: Paint Rack Grid -->
        <div id="wb-subtab-paints" class="wb-subtab-content" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">🎨 Frascos en Taller</h3>
              <span id="wb-paints-count-badge" style="background: rgba(192,132,252,0.15); color: #c084fc; border: 1px solid rgba(192,132,252,0.3); font-size: 0.75rem; padding: 0.15rem 0.55rem; border-radius: 9999px; font-weight: 600;">0 frascos</span>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button id="btn-import-paints-csv" class="filter-pill" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; border-color: rgba(34, 197, 94, 0.4); color: #4ade80;" onclick="openBulkImportModal('paints')">
                📥 Importar CSV Pinturas
              </button>
              <button class="filter-pill" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; background: linear-gradient(90deg, rgba(56,189,248,0.15), rgba(168,85,247,0.15)); color: #38bdf8; border-color: rgba(56,189,248,0.4);" onclick="openPaintEquivalencesModal()">
                🧪 Asistente de Equivalencias IA
              </button>
              <button id="btn-open-airbrush-from-rack" class="filter-pill" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; border-color: rgba(249, 115, 22, 0.4); color: #fb923c; display: inline-flex; align-items: center; gap: 0.35rem;" onclick="openAirbrushCalculatorModal()">
                💨 Ratio Dilución & PSI
              </button>
              <button class="btn-primary" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;" onclick="openAddPaintModal()">
                + Registrar Pintura
              </button>
            </div>
          </div>

          <div id="wb-paints-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem;">
            <!-- Dynamically populated via loadWorkbenchData() -->
          </div>
        </div>

        <!-- Sub-Tab 4: Commissions Grid -->
        <div id="wb-subtab-commissions" class="wb-subtab-content" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button id="comm-subfilter-received" class="filter-pill active" onclick="filterWbCommissions('received')">
                📥 Solicitudes Recibidas (Como Modelista)
              </button>
              <button id="comm-subfilter-sent" class="filter-pill" onclick="filterWbCommissions('sent')">
                📤 Mis Encargos Solicitados (Como Cliente)
              </button>
            </div>
            <button class="btn-primary" onclick="switchTab('commissions')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
              🔍 Explorar Modelistas
            </button>
          </div>

          <div id="wb-commissions-list" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Dynamically populated via loadWorkbenchData() -->
          </div>
        </div>

        <!-- Sub-Tab 5: Workbench Tools & Blade Wear Tracker -->
        <div id="wb-subtab-tools" class="wb-subtab-content" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 0.25rem 0;">✂️ Inventario de Herramientas & Control de Vida Útil</h3>
              <p style="font-size: 0.82rem; color: #94a3b8; margin: 0;">Supervisa el desgaste de alicates (GodHand/Tamiya), cuchillas de bisturí y cinceles para evitar estrés blanco y daño al plástico.</p>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button id="btn-add-tool-wb" class="btn-primary" onclick="openToolsInventoryModal(true)" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; background: linear-gradient(135deg, #eab308, #ca8a04); border: none; display: inline-flex; align-items: center; gap: 0.35rem; color: #000; font-weight: 600;">
                + Registrar Herramienta
              </button>
            </div>
          </div>

          <!-- Tools KPI Strip -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Herramientas Activas</div>
              <div id="tools-kpi-active-count" style="font-size: 1.35rem; font-weight: 700; color: #38bdf8; margin-top: 0.2rem;">0</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.72rem; color: #facc15; text-transform: uppercase;">Filo Desgastado (>80%)</div>
              <div id="tools-kpi-worn-count" style="font-size: 1.35rem; font-weight: 700; color: #facc15; margin-top: 0.2rem;">0</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.72rem; color: #ef4444; text-transform: uppercase;">Requieren Cambio</div>
              <div id="tools-kpi-replace-count" style="font-size: 1.35rem; font-weight: 700; color: #ef4444; margin-top: 0.2rem;">0</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 0.72rem; color: #4ade80; text-transform: uppercase;">Cuchillas Reemplazadas</div>
              <div id="tools-kpi-blades-consumed" style="font-size: 1.35rem; font-weight: 700; color: #4ade80; margin-top: 0.2rem;">0</div>
            </div>
          </div>

          <!-- Category Filter Pills -->
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
            <button id="tool-filter-all" class="filter-pill active" onclick="filterWorkbenchTools('all')">Todas</button>
            <button id="tool-filter-nippers" class="filter-pill" onclick="filterWorkbenchTools('nippers')">✂️ Alicates</button>
            <button id="tool-filter-knives" class="filter-pill" onclick="filterWorkbenchTools('knives')">🗡️ Bisturís</button>
            <button id="tool-filter-chisels" class="filter-pill" onclick="filterWorkbenchTools('chisels')">📐 Cinceles</button>
            <button id="tool-filter-abrasives" class="filter-pill" onclick="filterWorkbenchTools('abrasives')">🪨 Limas / Abrasivos</button>
            <button id="tool-filter-airbrush" class="filter-pill" onclick="filterWorkbenchTools('airbrush')">🎨 Aerógrafos</button>
          </div>

          <!-- Tools Grid -->
          <div id="wb-tools-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1rem;">
            <!-- Dynamically populated via loadWorkbenchTools() -->
          </div>
        </div>

        <!-- Floating Soundscape Dock Widget -->
        <div id="workshop-soundscape-widget" style="display: none; position: fixed; bottom: 20px; right: 20px; z-index: 999; background: rgba(15, 23, 42, 0.94); border: 1px solid rgba(45, 212, 191, 0.4); backdrop-filter: blur(12px); border-radius: 9999px; padding: 0.45rem 0.9rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.6); align-items: center; gap: 0.75rem;">
          <button id="ws-dock-play-btn" type="button" onclick="toggleSoundscapePlay()" style="background: #14b8a6; border: none; border-radius: 50%; width: 30px; height: 30px; color: #000; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            ▶
          </button>
          <div style="cursor: pointer;" onclick="openSoundscapesModal()">
            <div id="ws-dock-title" style="font-size: 0.76rem; font-weight: 700; color: #fff; line-height: 1.1;">Lluvia en el Taller</div>
            <div id="ws-dock-timer" style="font-size: 0.68rem; color: #2dd4bf; font-family: monospace;">25:00</div>
          </div>
          <input id="ws-dock-volume" type="range" min="0" max="100" value="70" oninput="setSoundscapeMasterVolume(this.value)" style="width: 60px; height: 4px; accent-color: #14b8a6; cursor: pointer;" title="Volumen General" />
          <button type="button" onclick="closeSoundscapeWidget()" style="background: transparent; border: none; color: #64748b; font-size: 1.1rem; cursor: pointer; padding: 0 0.2rem; line-height: 1;">&times;</button>
        </div>
      </div>
    </section>

    <!-- 6. BUILDERS TAB -->
    <section id="view-builders" class="view-section">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        ${founders
          .map(
            (f) => `
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff;">
                ${f.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${f.displayName}</div>
                <div style="font-size: 0.8rem; color: var(--accent);">@${f.username}</div>
              </div>
            </div>
            ${
              f.contestBadges && f.contestBadges.length > 0
                ? `
              <div class="builder-awards-row" style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.75rem;">
                ${f.contestBadges
                  .map(
                    (b) => `
                  <span class="builder-award-badge" title="${escapeHtml(b.contestTitle)}: ${escapeHtml(b.awardTitle)}" style="background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.35); color: #fef08a; font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                    <span>${b.medalIcon}</span>
                    <strong>${escapeHtml(b.awardTitle.split(' - ')[0])}</strong>
                  </span>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              ${f.bio || 'Modelista fundador de PlamoScale & GunplaJunkies.'}
            </p>
            ${
              f.socialLinks && f.socialLinks.length > 0
                ? `
              <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                ${f.socialLinks
                  .map(
                    (link) => `
                  <a href="${link}" target="_blank" rel="noopener" style="font-size: 0.8rem; color: #94a3b8; text-decoration: none;">
                    🔗 ${link.replace('https://www.', '')}
                  </a>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    </section>

    <!-- 7. CONTESTS TAB -->
    <section id="view-contests" class="view-section">
      <!-- Sub-Tabs Bar: Contests & Group Builds -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; flex-wrap: wrap; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button id="contests-subtab-btn-contests" class="filter-pill active" onclick="switchContestsSubtab('contests')">
            🏆 Concursos & Salón de la Fama
          </button>
          <button id="contests-subtab-btn-groupbuilds" class="filter-pill" onclick="switchContestsSubtab('groupbuilds')">
            🤝 Proyectos Grupales (${(data.groupBuilds || []).length})
          </button>
        </div>
        <button class="btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="openCreateGroupBuildModal()">
          + Organizar Proyecto Grupal
        </button>
      </div>

      <!-- PANEL 1: CONTESTS & HALL OF FAME -->
      <div id="contests-panel-contests">
        <!-- Hall of Fame & Badges Showcase -->
        <div id="view-contests-hall-of-fame" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid rgba(234, 179, 8, 0.35); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 25px rgba(0,0,0,0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.4rem;">🏛️</span>
              <h2 style="font-size: 1.35rem; font-weight: 700; color: #fef08a; margin: 0;">Salón de la Fama y Podio de Concursos</h2>
            </div>
            <p style="font-size: 0.85rem; color: #cbd5e1; margin: 0.3rem 0 0 0;">
              Obras laureadas, medallas oficiales y diplomas con verificación criptográfica QR de la comunidad.
            </p>
          </div>
          <span style="background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.3); color: #fef08a; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 20px;">
            ⭐ Reconocimiento Oficial
          </span>
        </div>

        ${(() => {
          const hofItems = data.hallOfFame && data.hallOfFame.length > 0 ? data.hallOfFame : [];
          if (hofItems.length === 0) {
            return `
              <div style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.85rem;">
                Las insignias y podios se registrarán automáticamente al culminar las votaciones y evaluaciones de jurado.
              </div>
            `;
          }

          return `
            <div class="hall-of-fame-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
              ${hofItems
                .map(
                  (item) => `
                <div class="hof-card" style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(234, 179, 8, 0.25); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                  <div style="position: relative; width: 100%; height: 160px;">
                    <img src="${item.coverImageUrl || '/legacy-media/plamoscale/images/aperich/fulls/1.JPG'}" alt="${escapeHtml(item.entryTitle)}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                    <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); border: 1px solid rgba(234, 179, 8, 0.5); color: #fef08a; font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
                      <span>${item.medalIcon}</span>
                      <span>${escapeHtml(item.awardTitle)}</span>
                    </div>
                  </div>
                  <div style="padding: 1rem; display: flex; flex-direction: column; flex: 1;">
                    <div style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; line-height: 1.3;">${escapeHtml(item.entryTitle)}</div>
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem;">
                      Por <strong style="color: #e2e8f0;">@${item.username}</strong> (${escapeHtml(item.userDisplayName)})
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.75rem;">
                      Concurso: <strong style="color: #94a3b8;">${escapeHtml(item.contestTitle)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); gap: 0.35rem; flex-wrap: wrap;">
                      <span style="font-size: 0.8rem; color: #fbbf24; font-weight: 600;">
                        ⭐ ${item.voteCount} votos ${item.judgeAverageScore ? '• ⚖️ ' + item.judgeAverageScore + '/40' : ''}
                      </span>
                      <div style="display: flex; gap: 0.35rem;">
                        <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.25rem 0.65rem; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);" onclick="shareSocialLink('${escapeHtml(item.entryTitle)} - ${escapeHtml(item.awardTitle)}', '/contests/${item.contestId}/podium', 'Mira la obra condecorada ${escapeHtml(item.entryTitle)} en ${escapeHtml(config.tenantName)}')">
                          🔗 Compartir
                        </button>
                        <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.25rem 0.65rem; color: #fbbf24; border-color: rgba(251, 191, 36, 0.4);" onclick="viewCertificate('${item.contestId}', '${item.entryId}')">
                          📜 Ver Diploma
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `;
        })()}
      </div>

      <div style="display: flex; flex-direction: column; gap: 2rem;">
        ${data.contests
          .map(
            (c) => `
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                <span class="status-badge" style="background: rgba(37, 99, 235, 0.2); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.4);">
                  ${c.status.toUpperCase()} • <span id="contest-participants-badge-${c.id}">${c.participantsCount} Inscritos</span>
                </span>
                <span style="font-size: 0.8rem; color: #94a3b8;">📅 Cierre de Votación: <strong>${new Date(c.endDate).toLocaleDateString()}</strong></span>
              </div>
              <h2 style="font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">${c.title}</h2>
              <p style="font-size: 0.92rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1.25rem;">${c.description}</p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <div style="padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color);">
                  <div style="font-size: 0.85rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                    <span>📜</span> Reglas de Participación:
                  </div>
                  <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: #94a3b8; line-height: 1.6;">
                    ${(c.rules || []).map((r) => `<li>${r}</li>`).join('')}
                  </ul>
                </div>
                <div style="padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color);">
                  <div style="font-size: 0.85rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                    <span>🎁</span> Premios & Reconocimientos:
                  </div>
                  <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: #94a3b8; line-height: 1.6;">
                    ${(c.prizes || []).map((p) => `<li>${p}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn-primary" style="padding: 0.7rem 1.25rem; font-size: 0.9rem;" onclick="openContestEntryModal('${c.id}', '${escapeHtml(c.title)}')">
                  🏆 Inscribir mi Bitácora al Concurso
                </button>
              </div>
            </div>

            <!-- Participating Builds Gallery & Voting Leaderboard -->
            <div style="padding: 1.5rem; background: rgba(0,0,0,0.2);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
                  <span>⭐</span> Obras Inscritas & Votación Comunitaria
                </h3>
                <span style="font-size: 0.8rem; color: #94a3b8;">1 voto por modelista por obra • Transparente y auditable</span>
              </div>

              ${(() => {
                if (!c.entries || c.entries.length === 0) return '';
                const sorted = [...c.entries].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
                const top3 = sorted.slice(0, 3);
                const medals = ['🥇 1er Lugar (Líder)', '🥈 2do Lugar', '🥉 3er Lugar'];
                const rankClasses = ['podium-rank-1', 'podium-rank-2', 'podium-rank-3'];
                return `
                <div style="margin-bottom: 1.75rem; background: rgba(0,0,0,0.35); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                    <div style="font-size: 0.95rem; font-weight: 700; color: #fbbf24; display: flex; align-items: center; gap: 0.4rem;">
                      <span>👑</span> Podio de Líderes Provisionales
                    </div>
                    <span style="font-size: 0.75rem; color: #94a3b8;">Clasificación en vivo por votos de la comunidad</span>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem;">
                    ${top3
                      .map(
                        (entry, idx) => `
                      <div class="podium-card ${rankClasses[idx]}">
                        <img src="${entry.coverImageUrl}" alt="${escapeHtml(entry.title)}" style="width: 52px; height: 52px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(255,255,255,0.15);" />
                        <div style="overflow: hidden; flex: 1;">
                          <div style="font-size: 0.72rem; font-weight: 700; color: #fbbf24;">${medals[idx]}</div>
                          <div style="font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(entry.title)}</div>
                          <div style="font-size: 0.72rem; color: #94a3b8; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: 0.2rem;">
                            <span>@${entry.username} • <strong style="color: #fbbf24;">${entry.voteCount} votos</strong></span>
                            <button type="button" class="filter-pill" style="font-size: 0.65rem; padding: 0.15rem 0.5rem; color: #fbbf24; border-color: rgba(251, 191, 36, 0.4);" onclick="viewCertificate('${c.id}', '${entry.id}')">📜 Diploma</button>
                          </div>
                        </div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
                `;
              })()}

              ${
                c.entries && c.entries.length > 0
                  ? `
                <div id="contest-entries-grid-${c.id}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem;">
                  ${c.entries
                    .map(
                      (e) => `
                    <div id="contest-entry-card-${e.id}" style="background: var(--bg-dark); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s;" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform='translateY(0)'">
                      <div style="position: relative; width: 100%; height: 180px; cursor: pointer;" onclick="openLightbox('${e.coverImageUrl}', '${escapeHtml(e.title)}', '${e.username}')">
                        <img src="${e.coverImageUrl}" alt="${escapeHtml(e.title)}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                        <span style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.15); font-weight: 600;">
                          ${(e.category || 'GUNPLA').toUpperCase()}
                        </span>
                      </div>
                      <div style="padding: 0.85rem 1rem; display: flex; flex-direction: column; flex: 1;">
                        <div style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem; line-height: 1.3;">${escapeHtml(e.title)}</div>
                        <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem;">Por <strong>@${e.username}</strong></div>
                        ${e.build ? `
                          <a href="#build-${e.build.slug}" onclick="switchTab('feed'); viewBuildDetail('${e.build.slug}')" style="font-size: 0.75rem; color: #38bdf8; text-decoration: none; margin-bottom: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                            📖 Ver Bitácora & Fórmulas &rarr;
                          </a>
                        ` : ''}

                        ${e.judgeScoreAverage ? `
                          <div style="font-size: 0.75rem; color: #c084fc; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.35rem;">
                            <span>⚖️</span> Rúbrica Jueces: <strong id="judge-score-label-${e.id}">${e.judgeScoreAverage} / 40 pts</strong> (${e.judgeCount || 1} eval.)
                          </div>
                        ` : `
                          <div id="judge-score-label-${e.id}" style="font-size: 0.72rem; color: #64748b; margin-bottom: 0.4rem;">
                            ⚖️ Pendiente de evaluación por jurado
                          </div>
                        `}

                        <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 0.65rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                            <span id="vote-count-${e.id}" style="font-size: 0.85rem; font-weight: 600; color: #fbbf24;">⭐ ${e.voteCount} Votos</span>
                            <button id="btn-vote-${e.id}" class="filter-pill vote-btn" style="padding: 0.3rem 0.85rem; font-size: 0.78rem;" data-contest-id="${c.id}" data-entry-id="${e.id}" data-voters='${JSON.stringify(e.votedByUserIds || [])}' onclick="voteEntry('${c.id}', '${e.id}', event)">
                              Votar ⭐
                            </button>
                          </div>
                          <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
                            <button type="button" class="filter-pill btn-judge-entry" style="font-size: 0.7rem; padding: 0.2rem 0.55rem; color: #c084fc; border-color: rgba(168, 85, 247, 0.4); display: none;" data-contest-id="${c.id}" data-entry-id="${e.id}" data-entry-title="${escapeHtml(e.title)}" onclick="openJudgeModal('${c.id}', '${e.id}', '${escapeHtml(e.title)}')">
                              ⚖️ Calificar
                            </button>
                            <button type="button" class="filter-pill" style="font-size: 0.7rem; padding: 0.2rem 0.55rem; color: #fbbf24; border-color: rgba(251, 191, 36, 0.4);" onclick="viewCertificate('${c.id}', '${e.id}')">
                              📜 Diploma
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
                  : `
                <div id="contest-entries-grid-${c.id}" style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 8px; padding: 2rem; text-align: center;">
                  <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🏁</span>
                  <p style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 0.75rem;">
                    Aún no hay obras inscritas. ¡Sé el primero en participar e inscribe tu proyecto!
                  </p>
                  <button class="btn-primary" style="margin: 0 auto;" onclick="openContestEntryModal('${c.id}', '${escapeHtml(c.title)}')">
                    🏆 Inscribir mi Bitácora
                  </button>
                </div>
              `
              }
            </div>
          </div>
        `
          )
          .join('')}
      </div>
      </div>

      <!-- PANEL 2: GROUP BUILDS -->
      <div id="contests-panel-groupbuilds" style="display: none;">
        <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.5rem;">🤝</span>
                <h2 style="font-size: 1.35rem; font-weight: 700; color: #38bdf8; margin: 0;">Proyectos Grupales Colaborativos</h2>
              </div>
              <p style="font-size: 0.85rem; color: #cbd5e1; margin: 0.35rem 0 0 0;">
                Construcciones temáticas en equipo. Únete con tu propia bitácora, documenta avances y comparte recetas de pintura junto a otros modelistas.
              </p>
            </div>
            <button class="btn-primary" onclick="openCreateGroupBuildModal()">
              + Organizar Proyecto Grupal
            </button>
          </div>
        </div>

        ${(() => {
          const groupBuilds = data.groupBuilds && data.groupBuilds.length > 0 ? data.groupBuilds : [];
          if (groupBuilds.length === 0) {
            return `
              <div style="background: var(--card-bg); border: 1px dashed var(--border-color); border-radius: 10px; padding: 3rem 1.5rem; text-align: center;">
                <span style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem;">🤝</span>
                <h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.4rem;">No hay proyectos grupales activos</h3>
                <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">
                  Sé el primero en proponer un tema de construcción y reunir a la comunidad.
                </p>
                <button class="btn-primary" onclick="openCreateGroupBuildModal()">+ Organizar Proyecto Grupal</button>
              </div>
            `;
          }

          return `
            <div style="display: flex; flex-direction: column; gap: 2rem;">
              ${groupBuilds
                .map(
                  (gb) => `
                <div class="group-build-card" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                  <div style="position: relative; width: 100%; height: 200px; background: #0f172a;">
                    <img src="${gb.bannerImageUrl || '/legacy-media/plamoscale/images/aperich/fulls/01.jpg'}" alt="${escapeHtml(gb.title)}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                    <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(15,23,42,0.95) 100%);"></div>
                    <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 0.5rem; align-items: center;">
                      <span class="filter-pill" style="font-size: 0.75rem; padding: 0.2rem 0.6rem; background: ${gb.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}; color: ${gb.status === 'active' ? '#4ade80' : '#facc15'}; border-color: ${gb.status === 'active' ? 'rgba(34,197,94,0.4)' : 'rgba(234,179,8,0.4)'};">
                        ${gb.status === 'active' ? '🟢 Activo' : gb.status === 'upcoming' ? '🟡 Próximo' : '⚪ Concluido'}
                      </span>
                      ${gb.category ? `<span class="filter-pill" style="font-size: 0.75rem; padding: 0.2rem 0.6rem; text-transform: uppercase;">${escapeHtml(gb.category)}</span>` : ''}
                    </div>
                    <div style="position: absolute; bottom: 14px; left: 16px; right: 16px;">
                      <h3 style="font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0 0 0.25rem 0;">${escapeHtml(gb.title)}</h3>
                      <div style="font-size: 0.8rem; color: #94a3b8; display: flex; gap: 1rem; flex-wrap: wrap;">
                        <span>Organizado por: <strong style="color: #38bdf8;">@${gb.creatorUsername}</strong></span>
                        <span>📅 Hasta: ${new Date(gb.endDate).toLocaleDateString('es-PE')}</span>
                        <span>👥 <strong>${gb.participantsCount || 0}</strong> participantes</span>
                        <span>📦 <strong>${(gb.entries || []).length}</strong> maquetas</span>
                      </div>
                    </div>
                  </div>

                  <div style="padding: 1.5rem;">
                    <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1.25rem;">
                      ${escapeHtml(gb.description)}
                    </p>

                    ${gb.rules && gb.rules.length > 0 ? `
                      <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color);">
                        <div style="font-size: 0.82rem; font-weight: 600; color: #fff; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.35rem;">
                          <span>📋</span> Reglas y Pautas del Proyecto:
                        </div>
                        <ul style="padding-left: 1.25rem; font-size: 0.8rem; color: #94a3b8; margin: 0; line-height: 1.5;">
                          ${gb.rules.map((r: string) => `<li>${escapeHtml(r)}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}

                    <!-- Participating Builds -->
                    <div style="margin-bottom: 1.5rem;">
                      <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
                        <span>🧩</span> Maquetas en el Proyecto (${(gb.entries || []).length})
                      </h4>
                      ${gb.entries && gb.entries.length > 0 ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem;">
                          ${gb.entries.map((e: any) => `
                            <div style="display: flex; gap: 0.75rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.6rem; align-items: center;">
                              <img src="${e.coverImageUrl || '/legacy-media/plamoscale/images/aperich/thumbs/01.jpg'}" alt="${escapeHtml(e.buildTitle)}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);" />
                              <div style="overflow: hidden; flex: 1;">
                                <div style="font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(e.buildTitle)}</div>
                                <div style="font-size: 0.72rem; color: #94a3b8;">Por <strong style="color: #cbd5e1;">@${e.username}</strong></div>
                                <div style="font-size: 0.7rem; color: var(--accent); margin-top: 0.1rem;">Etapa: ${e.stage || 'Armado'}</div>
                              </div>
                            </div>
                          `).join('')}
                        </div>
                      ` : `
                        <p style="font-size: 0.8rem; color: #64748b; font-style: italic;">
                          Aún no hay maquetas inscritas en este grupo. ¡Sé el primero en sumarte!
                        </p>
                      `}
                    </div>

                    <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem;">
                      <button class="filter-pill" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;" onclick="shareSocialLink('${escapeHtml(gb.title)}', '/contests', 'Participa en el proyecto grupal ${escapeHtml(gb.title)}')">
                        🔗 Compartir
                      </button>
                      <button class="btn-primary" style="font-size: 0.85rem; padding: 0.45rem 1rem;" onclick="openJoinGroupBuildModal('${gb.id}', '${escapeHtml(gb.title)}')">
                        🤝 Unirme al Proyecto Grupal
                      </button>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `;
        })()}
      </div>
    </section>

    <!-- 8. SHOPS TAB -->
    <section id="view-shops" class="view-section">
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Tiendas de Confianza & Distribuidores Aliados</h2>
          <p style="color: #94a3b8; font-size: 0.88rem;">Tiendas verificadas asociadas a ${config.tenantName} con acuerdos comerciales, cupones exclusivos y stock prioritario.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${data.shops
          .map(
            (s: any) => `
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">${s.name}</h3>
              <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; justify-content: flex-end;">
                ${s.tenantLink?.badgeLabel ? `<span style="font-size: 0.72rem; color: #38bdf8; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700;">${s.tenantLink.badgeLabel}</span>` : ''}
                ${s.isVerified ? '<span style="font-size: 0.72rem; color: #4ade80; background: rgba(34,197,94,0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">VERIFICADA</span>' : ''}
              </div>
            </div>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem; flex: 1;">${s.description}</p>

            ${s.tenantLink?.discountCode ? `
              <div style="background: rgba(234, 179, 8, 0.1); border: 1px dashed rgba(234, 179, 8, 0.4); border-radius: 6px; padding: 0.65rem 0.85rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 0.72rem; color: #facc15; font-weight: 700; text-transform: uppercase;">Cupón Comunidad</span>
                  <code style="font-size: 0.85rem; font-weight: 800; color: #fef08a; background: rgba(0,0,0,0.35); padding: 0.15rem 0.45rem; border-radius: 4px; cursor: pointer; border: 1px solid rgba(254, 240, 138, 0.3);" title="Copiar código" onclick="navigator.clipboard.writeText('${s.tenantLink.discountCode}'); alert('¡Cupón ${s.tenantLink.discountCode} copiado al portapapeles!');">${s.tenantLink.discountCode}</code>
                </div>
                ${s.tenantLink.discountDescription ? `<p style="font-size: 0.78rem; color: #f1f5f9; margin: 0.35rem 0 0 0; line-height: 1.35;">${s.tenantLink.discountDescription}</p>` : ''}
              </div>
            ` : ''}

            ${s.tenantLink?.customNotes ? `
              <div style="font-size: 0.8rem; color: #94a3b8; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 0.5rem 0.75rem; margin-bottom: 1rem;">
                ℹ️ ${s.tenantLink.customNotes}
              </div>
            ` : ''}

            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1.25rem;">
              ${(s.specialties || []).map((sp: string) => `<span style="font-size: 0.72rem; background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px; color: #94a3b8;">${sp}</span>`).join('')}
            </div>
            <div style="display: flex; gap: 0.75rem; border-top: 1px solid var(--border-color); padding-top: 1rem; flex-wrap: wrap;">
              ${s.catalogUrl ? `<a href="${s.catalogUrl}" target="_blank" rel="noopener" style="font-size: 0.82rem; color: var(--accent); text-decoration: none; font-weight: 600;">Catálogo / Lista ➔</a>` : ''}
              ${s.whatsappUrl ? `<a href="${s.whatsappUrl}" target="_blank" rel="noopener" style="font-size: 0.82rem; color: #22c55e; text-decoration: none; font-weight: 600;">WhatsApp Directo ➔</a>` : ''}
              ${s.websiteUrl ? `<a href="${s.websiteUrl}" target="_blank" rel="noopener" style="font-size: 0.82rem; color: #60a5fa; text-decoration: none; font-weight: 600;">Sitio Web ➔</a>` : ''}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>

    <!-- 9. MARKETPLACE TAB -->
    <section id="view-marketplace" class="view-section">
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <p style="color: #94a3b8; font-size: 0.9rem;">
          Maquetas y kits publicados por la comunidad para venta directa o intercambio seguro entre modelistas.
        </p>
        <button class="btn-primary" onclick="openNewListingModal()">
          + Publicar Maqueta para Venta/Canje
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${(data.listings || [])
          .map(
            (l) => `
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span class="status-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">
                ${l.type === 'both' ? 'VENTA O CANJE' : l.type === 'sale' ? 'VENTA' : 'INTERCAMBIO'}
              </span>
              <span style="font-size: 1.15rem; font-weight: 800; color: #4ade80;">
                ${l.price ? l.currency + ' ' + l.price : 'A convenir'}
              </span>
            </div>
            
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">
              ${l.kit ? l.kit.name : 'Kit a Escala'}
            </h3>
            <div style="font-size: 0.78rem; color: var(--accent); margin-bottom: 0.65rem;">
              ${l.kit ? l.kit.brand + ' • ' + l.kit.scale : l.category} • Estado: <strong>${(l.boxCondition || 'mint_sealed').replace('_', ' ')}</strong>
            </div>

            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem; flex: 1;">
              ${l.notes}
            </p>

            <div style="border-top: 1px solid var(--border-color); padding-top: 0.85rem; font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div>Vendedor: <strong>@${l.username}</strong><br><span style="font-size: 0.75rem; color: #64748b;">📍 ${l.contactLocation}</span></div>
              <div style="display: flex; gap: 0.4rem; align-items: center;">
                <button type="button" class="filter-pill" onclick="openMarketplaceInquiryModal('${l.id}', '${(l.kit ? l.kit.name : 'Kit a Escala').replace(/'/g, "\\'")}', '${l.username}')" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.1); cursor: pointer; font-weight: 600;">
                  ✉️ Consultar
                </button>
                <a href="${l.contactWhatsapp}" target="_blank" rel="noopener" class="filter-pill" style="color: #22c55e; border-color: rgba(34, 197, 94, 0.3); text-decoration: none; font-weight: 600;">
                  WhatsApp 💬
                </a>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>

    <!-- 10. COMMISSIONS TAB -->
    <section id="view-commissions" class="view-section">
      <div style="margin-bottom: 1.5rem;">
        <p style="color: #94a3b8; font-size: 0.9rem;">
          Contrata a modelistas certificados para armar, detallar y pintar tus maquetas con técnicas profesionales de aerografía.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem;">
        ${(data.commissionBuilders || [])
          .map(
            (cb) => `
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">${cb.displayName}</h3>
              <span class="status-badge">DISPONIBLE</span>
            </div>
            
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 0.75rem;">
              ${cb.bio}
            </p>

            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem;">
              ${cb.specialties.map((sp) => `<span style="font-size: 0.72rem; background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px; color: #94a3b8;">${sp}</span>`).join('')}
            </div>

            <div style="font-size: 0.85rem; color: #e2e8f0; margin-bottom: 1rem;">
              Tarifa estimada: <strong style="color: #4ade80;">Desde PEN ${cb.startingPricePEN}</strong>
            </div>

            <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 0.85rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem;">
              ${cb.instagramUrl ? `<a href="${cb.instagramUrl}" target="_blank" rel="noopener" style="font-size: 0.8rem; color: var(--accent); text-decoration: none;">Instagram ➔</a>` : '<span></span>'}
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button type="button" class="btn-primary" onclick="openCommissionModal('${cb.username}', '${cb.displayName.replace(/'/g, "\\'")}', ${cb.startingPricePEN || 150})" style="padding: 0.35rem 0.85rem; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem;">
                  🎨 Solicitar Encargo
                </button>
                <a href="${cb.whatsappUrl}" target="_blank" rel="noopener" class="filter-pill" style="padding: 0.35rem 0.7rem; font-size: 0.8rem; text-decoration: none; border-color: rgba(34, 197, 94, 0.4); color: #4ade80;">
                  WhatsApp 💬
                </a>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>

    <!-- 11. COMMUNITY ADMIN TAB -->
    <section id="view-admin" class="view-section">
      <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 25px rgba(0,0,0,0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
              <span style="background: rgba(239, 68, 68, 0.25); color: #f87171; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(239, 68, 68, 0.4);">
                PANEL DE COMUNIDAD
              </span>
              <span style="font-size: 0.85rem; color: #94a3b8;">${config.tenantName} (${config.tenantSlug})</span>
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0;">Administración & Moderación de Comunidad</h2>
            <p style="color: #cbd5e1; font-size: 0.85rem; margin-top: 0.35rem; max-width: 720px;">
              Gestiona las tiendas de confianza con cupones de descuento exclusivos, publica noticias y novedades locales, cura las fotos de la vitrina y modera las publicaciones del Bazar.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn-primary" onclick="openTenantNewsModal()" style="font-size: 0.82rem; padding: 0.45rem 0.9rem; background: #3b82f6; border-color: #3b82f6;">
              📰 Redactar Noticia
            </button>
            <button type="button" class="btn-primary" onclick="openLinkMasterShopModal()" style="font-size: 0.82rem; padding: 0.45rem 0.9rem; background: #10b981; border-color: #10b981;">
              🏪 Vincular Tienda
            </button>
            <button type="button" class="btn-primary" onclick="openAddFeaturedPhotoModal()" style="font-size: 0.82rem; padding: 0.45rem 0.9rem; background: #8b5cf6; border-color: #8b5cf6;">
              📸 Destacar Foto
            </button>
          </div>
        </div>

        <!-- Sub-tabs navigation -->
        <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; flex-wrap: wrap;">
          <button type="button" id="admin-subtab-btn-shops" class="filter-pill active" onclick="switchAdminSubtab('shops')" style="font-size: 0.82rem; padding: 0.35rem 0.8rem; cursor: pointer;">
            🏪 Tiendas de Confianza (<span id="admin-shops-count">${data.shops.length}</span>)
          </button>
          <button type="button" id="admin-subtab-btn-news" class="filter-pill" onclick="switchAdminSubtab('news')" style="font-size: 0.82rem; padding: 0.35rem 0.8rem; cursor: pointer;">
            📰 Noticias & Artículos (<span id="admin-news-count">...</span>)
          </button>
          <button type="button" id="admin-subtab-btn-photos" class="filter-pill" onclick="switchAdminSubtab('photos')" style="font-size: 0.82rem; padding: 0.35rem 0.8rem; cursor: pointer;">
            📸 Vitrina de Fotos (<span id="admin-photos-count">...</span>)
          </button>
          <button type="button" id="admin-subtab-btn-bazar" class="filter-pill" onclick="switchAdminSubtab('bazar')" style="font-size: 0.82rem; padding: 0.35rem 0.8rem; cursor: pointer;">
            ⚖️ Moderación de Bazar (<span id="admin-bazar-count">${(data.listings || []).length}</span>)
          </button>
          <button type="button" id="admin-subtab-btn-tenants" class="filter-pill" onclick="switchAdminSubtab('tenants')" style="font-size: 0.82rem; padding: 0.35rem 0.8rem; cursor: pointer; display: none;">
            🛡️ Comunidades & Clubes (<span id="admin-tenants-count">...</span>)
          </button>
          <button type="button" id="admin-subtab-btn-mastershops" class="filter-pill" onclick="switchAdminSubtab('mastershops')" style="font-size: 0.82rem; padding: 0.35rem 0.8rem; cursor: pointer; display: none;">
            🌐 Catálogo Maestro Tiendas (<span id="admin-mastershops-count">...</span>)
          </button>
        </div>
      </div>

      <!-- Subtab 1: Tiendas de Confianza -->
      <div id="admin-subtab-shops" class="admin-subtab-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Tiendas de Confianza de ${config.tenantName}</h3>
          <button type="button" class="btn-primary" onclick="openLinkMasterShopModal()" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
            + Vincular Tienda del Catálogo Maestro
          </button>
        </div>
        <div id="admin-trusted-shops-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
          <!-- Dynamically populated or server-rendered items -->
          ${data.shops.map((shop: any) => `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
                  <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #fff;">${shop.name}</h4>
                  <span style="font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(34, 197, 94, 0.2); color: #4ade80;">
                    ${shop.tenantLink?.active !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem;">
                  📍 ${shop.city}, ${shop.country} \u2022 ⭐ ${shop.rating || 5}/5
                </div>
                ${shop.tenantLink?.discountCode ? `
                  <div style="margin-bottom: 0.5rem;">
                    <span style="font-size: 0.75rem; background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px dashed rgba(234, 179, 8, 0.4); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700;">
                      🎟️ Cupón: ${shop.tenantLink.discountCode}
                    </span>
                  </div>
                ` : ''}
                ${shop.tenantLink?.partnerBadge ? `
                  <div style="font-size: 0.75rem; color: #38bdf8; margin-bottom: 0.35rem;">
                    ${shop.tenantLink.partnerBadge}
                  </div>
                ` : ''}
                ${shop.tenantLink?.agreementNotes ? `
                  <div style="font-size: 0.75rem; color: #94a3b8; font-style: italic; margin-bottom: 0.5rem;">
                    ${shop.tenantLink.agreementNotes}
                  </div>
                ` : ''}
              </div>
              <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.75rem;">
                <button type="button" class="filter-pill" onclick="openEditTenantShopModal('${shop.id}', '${(shop.tenantLink?.discountCode || '').replace(/'/g, "\\'")}', '${(shop.tenantLink?.partnerBadge || '').replace(/'/g, "\\'")}', '${(shop.tenantLink?.agreementNotes || '').replace(/'/g, "\\'")}', ${shop.tenantLink?.active !== false})" style="font-size: 0.78rem; padding: 0.3rem 0.6rem; cursor: pointer;">
                  ✏️ Editar Cupon
                </button>
                <button type="button" class="filter-pill" onclick="deleteTenantShopLink('${shop.id}', '${shop.name.replace(/'/g, "\\'")}')" style="font-size: 0.78rem; padding: 0.3rem 0.6rem; color: #f87171; border-color: rgba(239, 68, 68, 0.3); cursor: pointer;">
                  🗑️ Desvincular
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Subtab 2: Noticias & Articulos -->
      <div id="admin-subtab-news" class="admin-subtab-content" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Noticias & Comunicados de la Comunidad</h3>
          <button type="button" class="btn-primary" onclick="openTenantNewsModal()" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
            + Redactar Nueva Noticia
          </button>
        </div>
        <div id="admin-news-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
          <p style="color: #94a3b8; font-size: 0.85rem;">Cargando noticias de la comunidad...</p>
        </div>
      </div>

      <!-- Subtab 3: Vitrina de Fotos Destacadas -->
      <div id="admin-subtab-photos" class="admin-subtab-content" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Fotografías Destacadas en Portada</h3>
          <button type="button" class="btn-primary" onclick="openAddFeaturedPhotoModal()" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
            + Destacar Foto de Coleccionista
          </button>
        </div>
        <div id="admin-photos-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem;">
          <p style="color: #94a3b8; font-size: 0.85rem;">Cargando vitrina de fotos...</p>
        </div>
      </div>

      <!-- Subtab 4: Moderacion del Bazar -->
      <div id="admin-subtab-bazar" class="admin-subtab-content" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Moderación de Publicaciones del Bazar</h3>
            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.2rem 0 0 0;">
              Supervisa avisos de compraventa, suspende avisos o elimina anuncios no conformes con las normas de INDECOPI y la comunidad.
            </p>
          </div>
          <button type="button" class="filter-pill" onclick="loadAdminBazarListings()" style="font-size: 0.82rem; padding: 0.35rem 0.75rem; cursor: pointer;">
            🔄 Refrescar Listado
          </button>
        </div>
        <div id="admin-bazar-list" style="overflow-x: auto;">
          <p style="color: #94a3b8; font-size: 0.85rem;">Cargando avisos del bazar...</p>
        </div>
      </div>

      <!-- Subtab 5: Gobernanza Global de Comunidades (Super Admin) -->
      <div id="admin-subtab-tenants" class="admin-subtab-content" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Gobernanza Global de Comunidades & Clubes (<span id="admin-tenants-count">0</span>)</h3>
            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.2rem 0 0 0;">
              Supervisión de portales registrados, estados de servicio (Activo, Suspendido, Archivado) y auditoría de Resend API Key.
            </p>
          </div>
          <button type="button" class="btn-primary" onclick="openAdminCreateTenantModal()" style="font-size: 0.82rem; padding: 0.45rem 0.9rem; background: #8b5cf6; border-color: #8b5cf6;">
            + Onboarding de Nuevo Club / Comunidad
          </button>
        </div>
        <div id="admin-tenants-list" style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="color: #94a3b8; font-size: 0.85rem;">Cargando comunidades registradas...</p>
        </div>
      </div>

      <!-- Subtab 6: Catálogo Maestro Global de Tiendas (Super Admin) -->
      <div id="admin-subtab-mastershops" class="admin-subtab-content" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Catálogo Maestro Global de Tiendas (<span id="admin-master-shops-count">0</span>)</h3>
            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.2rem 0 0 0;">
              Directorio unificado de tiendas de modelismo disponibles para que los administradores locales vinculen a sus comunidades.
            </p>
          </div>
          <button type="button" class="btn-primary" onclick="openAdminMasterShopModal()" style="font-size: 0.82rem; padding: 0.45rem 0.9rem; background: #10b981; border-color: #10b981;">
            + Agregar Tienda al Catálogo Maestro
          </button>
        </div>
        <div id="admin-master-shops-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
          <p style="color: #94a3b8; font-size: 0.85rem;">Cargando catálogo maestro...</p>
        </div>
      </div>
    </section>

`;
}
