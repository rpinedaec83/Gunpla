import {
  UserRecord,
  MediaAsset,
  KitRecord,
  PaintRecord,
  BuildProjectRecord,
  ContestRecord,
  ShopRecord,
  MarketplaceListingRecord,
  CommissionBuilderRecord
} from '../index';
import type { AppShellConfig, AppShellData } from './app-shell';

export interface ViewRenderHelpers {
  escapeHtml: (str: string) => string;
  categoryPills: Array<{ id: string; label: string }>;
  founders: UserRecord[];
}

export function renderViews(
  config: AppShellConfig,
  data: AppShellData,
  helpers: ViewRenderHelpers
): string {
  const { escapeHtml, categoryPills, founders } = helpers;

  return `
    <!-- 1. SHOWCASE TAB -->
    <section id="view-showcase" class="view-section active">
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
            ${
              k.scalematesUrl
                ? `
              <div style="margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
                <a href="${k.scalematesUrl}" target="_blank" rel="noopener" style="font-size: 0.8rem; color: var(--accent); text-decoration: none;">
                  Ver ficha en Scalemates ➔
                </a>
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
              <button class="filter-pill" onclick="openEditProfileModal()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>✏️</span> Editar Perfil
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
        </div>

        <!-- Sub-Tab 1: Stash Grid -->
        <div id="wb-subtab-stash" class="wb-subtab-content">
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
              <button class="filter-pill" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; background: linear-gradient(90deg, rgba(56,189,248,0.15), rgba(168,85,247,0.15)); color: #38bdf8; border-color: rgba(56,189,248,0.4);" onclick="openPaintEquivalencesModal()">
                🧪 Asistente de Equivalencias IA
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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);">
                      <span style="font-size: 0.8rem; color: #fbbf24; font-weight: 600;">
                        ⭐ ${item.voteCount} votos ${item.judgeAverageScore ? '• ⚖️ ' + item.judgeAverageScore + '/40' : ''}
                      </span>
                      <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.25rem 0.65rem; color: #fbbf24; border-color: rgba(251, 191, 36, 0.4);" onclick="viewCertificate('${item.contestId}', '${item.entryId}')">
                        📜 Ver Diploma
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
                    ${c.rules.map((r) => `<li>${r}</li>`).join('')}
                  </ul>
                </div>
                <div style="padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color);">
                  <div style="font-size: 0.85rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                    <span>🎁</span> Premios & Reconocimientos:
                  </div>
                  <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: #94a3b8; line-height: 1.6;">
                    ${c.prizes.map((p) => `<li>${p}</li>`).join('')}
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
    </section>

    <!-- 8. SHOPS TAB -->
    <section id="view-shops" class="view-section">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${data.shops
          .map(
            (s) => `
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">${s.name}</h3>
              ${s.isVerified ? '<span style="font-size: 0.72rem; color: #4ade80; background: rgba(34,197,94,0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">VERIFICADA</span>' : ''}
            </div>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">${s.description}</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1.25rem;">
              ${s.specialties.map((sp) => `<span style="font-size: 0.72rem; background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px; color: #94a3b8;">${sp}</span>`).join('')}
            </div>
            <div style="display: flex; gap: 0.75rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
              ${s.catalogUrl ? `<a href="${s.catalogUrl}" target="_blank" rel="noopener" style="font-size: 0.82rem; color: var(--accent); text-decoration: none; font-weight: 600;">Catálogo PDF / Lista ➔</a>` : ''}
              ${s.whatsappUrl ? `<a href="${s.whatsappUrl}" target="_blank" rel="noopener" style="font-size: 0.82rem; color: #22c55e; text-decoration: none; font-weight: 600;">Grupo WhatsApp ➔</a>` : ''}
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
              ${l.kit ? l.kit.brand + ' • ' + l.kit.scale : l.category} • Estado: <strong>${l.boxCondition.replace('_', ' ')}</strong>
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

`;
}
