import type { AppShellConfig, AppShellData } from './app-shell';

export interface ModalRenderHelpers {
  escapeHtml: (str: string) => string;
  birthYearOptions: string;
  kitOptions: string;
  paintOptions: string;
  isGunpla: boolean;
}

export function renderModals(
  config: AppShellConfig,
  data: AppShellData,
  helpers: ModalRenderHelpers
): string {
  const { escapeHtml, birthYearOptions, kitOptions, paintOptions, isGunpla } = helpers;

  return `
<!-- Lightbox Modal (Poptrox High-Res Showcase) -->
<div id="lightbox-modal" onclick="closeLightbox(event)">
  <span class="lightbox-close" onclick="closeLightbox(event)">&times;</span>
  <div class="lightbox-content">
    <img id="lightbox-image" class="lightbox-img" src="" alt="Obra de Modelismo en Alta Resolución" />
    <div id="lightbox-title" class="lightbox-caption"></div>
    <div id="lightbox-author" class="lightbox-author"></div>
    <div style="margin-top: 1rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
      <button id="lightbox-btn-whatsapp" type="button" class="btn-primary" style="background: #25d366; color: #fff; font-size: 0.85rem; padding: 0.45rem 1.1rem; display: inline-flex; align-items: center; gap: 0.4rem; border: none; border-radius: 6px; cursor: pointer;" onclick="openWhatsAppInquiryFromLightbox()">
        <span>💬</span> Consultar al Modelista (WhatsApp)
      </button>
    </div>
  </div>
</div>

<!-- Auth Modal (Google SSO & Founders Login) -->
<div id="auth-modal" onclick="closeAuthModal(event)">
  <div class="auth-box" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeAuthModal()">&times;</span>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Iniciar Sesión</h3>
    <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Accede a tu Stash personal, participa en concursos y comparte bitácoras paso a paso.
    </p>

    <div class="auth-tabs">
      <button class="auth-tab-btn active" onclick="switchAuthTab('google')">Google SSO</button>
      <button class="auth-tab-btn" onclick="switchAuthTab('credentials')">Modelistas / Clave</button>
      <button class="auth-tab-btn" onclick="switchAuthTab('register')">Nuevo Registro</button>
    </div>

    <!-- Google Tab -->
    <div id="tab-auth-google" class="auth-tab-content">
      <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.75rem 0;">
        <div class="auth-input-group" style="margin-bottom: 0.25rem;">
          <label class="auth-label" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Año de Nacimiento (Filtro Legal Ley N° 29733):</span>
            <span id="google-age-status" style="font-size: 0.75rem; color: #94a3b8;">Verificación requerida</span>
          </label>
          <select id="google-birthyear" class="auth-input" onchange="onGoogleAgeChange(this.value)">
            <option value="">Selecciona tu año de nacimiento...</option>
            ${birthYearOptions}
          </select>
        </div>
        <div id="google-age-alert" style="display: none; font-size: 0.8rem; border-radius: 6px; padding: 0.6rem; line-height: 1.4;"></div>
        
        <div id="google-signin-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; margin-top: 0.5rem;">
          <div id="g_id_signin"></div>
          <p style="font-size: 0.78rem; color: #64748b; text-align: center;">
            Inicia sesión en 1 clic con tu cuenta de Google. Tu perfil se vinculará automáticamente.
          </p>
        </div>
      </div>
    </div>

    <!-- Credentials Tab -->
    <div id="tab-auth-credentials" class="auth-tab-content" style="display: none;">
      <form onsubmit="handleLocalLogin(event)">
        <div class="auth-input-group">
          <label class="auth-label">Usuario o Email</label>
          <input type="text" id="login-username" class="auth-input" placeholder="ej. aperich o email@plamoscale.com" required>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Contraseña</label>
          <input type="password" id="login-password" class="auth-input" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem; padding: 0.65rem;">
          Ingresar al Taller
        </button>
      </form>

      <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block; margin-bottom: 0.5rem;">
          Acceso Rápido Fundadores (Demo):
        </span>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          <button type="button" class="filter-pill" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" onclick="quickLoginFounder('aperich')">Aldo Perich</button>
          <button type="button" class="filter-pill" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" onclick="quickLoginFounder('fog1labs1')">Fog1 Labs</button>
          <button type="button" class="filter-pill" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" onclick="quickLoginFounder('dcampos')">Daniel Campos</button>
          <button type="button" class="filter-pill" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" onclick="quickLoginFounder('cluna')">Cristhian Luna</button>
        </div>
      </div>
    </div>

    <!-- Register Tab -->
    <div id="tab-auth-register" class="auth-tab-content" style="display: none;">
      <form onsubmit="handleRegister(event)">
        <div class="auth-input-group">
          <label class="auth-label">Nombre de Usuario</label>
          <input type="text" id="reg-username" class="auth-input" placeholder="ej. char_custom" required>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Nombre para Mostrar</label>
          <input type="text" id="reg-display" class="auth-input" placeholder="ej. Char Aznable" required>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Correo Electrónico</label>
          <input type="email" id="reg-email" class="auth-input" placeholder="tu@email.com" required>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Contraseña</label>
          <input type="password" id="reg-password" class="auth-input" placeholder="Mínimo 8 caracteres" required>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Año de Nacimiento (Filtro Legal Ley N° 29733)</label>
          <select id="reg-birthyear" class="auth-input" required onchange="onRegAgeChange(this.value)">
            <option value="">Selecciona tu año de nacimiento...</option>
            ${birthYearOptions}
          </select>
        </div>
        <div id="reg-age-alert" style="display: none; font-size: 0.8rem; margin-top: -0.5rem; margin-bottom: 0.75rem; border-radius: 6px; padding: 0.6rem; line-height: 1.4;"></div>
        <button type="submit" id="reg-submit-btn" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem; padding: 0.65rem;">
          Crear Cuenta de Modelista
        </button>
      </form>
    </div>
  </div>
</div>

<!-- Workbench Modal: Add Kit to Stash -->
<div id="modal-add-stash" class="custom-modal" onclick="closeAddStashModal(event)">
  <div class="auth-box" style="max-width: 520px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeAddStashModal()">&times;</span>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">+ Agregar Kit a Mi Stash</h3>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Registra una maqueta en tu inventario personal para llevar su seguimiento de armado.
    </p>
    <form onsubmit="handleAddStashSubmit(event)">
      <div class="auth-input-group">
        <label class="auth-label">Seleccionar Kit del Catálogo Maestro</label>
        <select id="stash-kit-select" class="auth-input" required>
          <option value="">Selecciona una maqueta...</option>
          ${kitOptions}
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">Estado en Taller</label>
          <select id="stash-status-select" class="auth-input">
            <option value="unbuilt">⏳ Sin Armar (Backlog)</option>
            <option value="in_progress">🛠️ En Armado (WIP)</option>
            <option value="built">🏆 Terminado (Exhibición)</option>
            <option value="wishlist">⭐ Lista de Deseos</option>
          </select>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Calificación Inicial</label>
          <select id="stash-rating-select" class="auth-input">
            <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
            <option value="4">⭐⭐⭐⭐ (4/5)</option>
            <option value="3">⭐⭐⭐ (3/5)</option>
            <option value="2">⭐⭐ (2/5)</option>
            <option value="1">⭐ (1/5)</option>
          </select>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">Precio Pagado (Opcional)</label>
          <input type="number" id="stash-price-input" class="auth-input" placeholder="ej. 180" step="any">
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Moneda</label>
          <select id="stash-currency-select" class="auth-input">
            <option value="PEN">PEN (S/)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
      </div>
      <div class="auth-input-group">
        <label class="auth-label">Notas Personales</label>
        <textarea id="stash-notes-input" class="auth-input" style="height: 60px; resize: none;" placeholder="ej. Comprado en tienda local, versión con calcas al agua."></textarea>
      </div>
      <button type="submit" id="stash-submit-btn" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; margin-top: 0.5rem;">
        Guardar en Mi Stash
      </button>
    </form>
  </div>
</div>

<!-- Workbench Modal: New Build Project -->
<div id="modal-new-build" class="custom-modal" onclick="closeNewBuildModal(event)">
  <div class="auth-box" style="max-width: 560px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeNewBuildModal()">&times;</span>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">+ Nueva Bitácora de Armado (Build Log)</h3>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Inicia un proyecto de construcción para documentar tus técnicas, fotos y avances.
    </p>
    <form onsubmit="handleNewBuildSubmit(event)">
      <div class="auth-input-group">
        <label class="auth-label">Vincular a Maqueta</label>
        <select id="build-kit-select" class="auth-input">
          <option value="">(Opcional) Selecciona kit...</option>
          ${kitOptions}
        </select>
      </div>
      <div class="auth-input-group">
        <label class="auth-label">Título del Proyecto</label>
        <input type="text" id="build-title-input" class="auth-input" placeholder="ej. RG Hi-Nu Gundam - Custom Titán & Weathering" required>
      </div>
      <div class="auth-input-group">
        <label class="auth-label">Subtítulo o Resumen de Técnicas</label>
        <input type="text" id="build-subtitle-input" class="auth-input" placeholder="ej. Pre-shading con aerógrafo, calcas al agua y acabado mate">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">Categoría</label>
          <select id="build-category-select" class="auth-input">
            <option value="gunpla-mecha">Gunpla & Mecha</option>
            <option value="military">Militar 1/35</option>
            <option value="aviation">Aviación 1/48</option>
            <option value="automotive">Automotriz 1/24</option>
            <option value="naval">Naval</option>
            <option value="figures">Figuras</option>
            <option value="scifi">Sci-Fi</option>
            <option value="diorama">Diorama</option>
          </select>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Foto de Portada</label>
          <input type="file" id="build-cover-file" class="auth-input" accept="image/*" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;">
        </div>
      </div>
      <button type="submit" id="build-submit-btn" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; margin-top: 0.5rem;">
        Crear Bitácora
      </button>
    </form>
  </div>
</div>

<!-- Workbench Modal: Add Step to Build -->
<div id="modal-add-step" class="custom-modal" onclick="closeAddStepModal(event)">
  <div class="auth-box" style="max-width: 540px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeAddStepModal()">&times;</span>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">+ Agregar Paso a la Bitácora</h3>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Registra una etapa del armado con fotos de tu avance y descripción de técnicas.
    </p>
    <form onsubmit="handleAddStepSubmit(event)">
      <input type="hidden" id="step-build-id">
      <div class="auth-input-group">
        <label class="auth-label">Etapa de Construcción</label>
        <select id="step-stage-select" class="auth-input">
          <option value="unboxing">📦 Desempaquetado (Unboxing)</option>
          <option value="assembly">🧩 Ensamblaje / Prueba en seco</option>
          <option value="assembly_inner_frame">⚙️ Inner Frame (Esqueleto Interno)</option>
          <option value="modification">✂️ Modificación / Plaplate / Scratchbuild</option>
          <option value="priming">🎨 Imprimación (Primer)</option>
          <option value="painting">🖌️ Pintura de Armadura & Camuflaje</option>
          <option value="decals">🏷️ Calcas & Panel Line</option>
          <option value="weathering">🌧️ Weathering, Óxido & Desconchones</option>
          <option value="final_reveal">✨ Revelación Final / Sesión de Fotos</option>
        </select>
      </div>
      <div class="auth-input-group">
        <label class="auth-label">Título del Paso</label>
        <input type="text" id="step-title-input" class="auth-input" placeholder="ej. Detallado del torso y hombros" required>
      </div>
      <div class="auth-input-group">
        <label class="auth-label">Descripción del Avance</label>
        <textarea id="step-desc-input" class="auth-input" style="height: 70px; resize: none;" placeholder="Describe qué herramientas usaste, presiones de aire o dilución de pintura..."></textarea>
      </div>
      <div class="auth-input-group">
        <label class="auth-label">Fotos del Avance (Sube una o varias imágenes)</label>
        <input type="file" id="step-photo-file" class="auth-input" accept="image/*" multiple style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" onchange="previewStepPhotos(this)">
        <div id="step-photo-preview-grid" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;"></div>
      </div>
      <button type="submit" id="step-submit-btn" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; margin-top: 0.5rem;">
        Guardar Paso de Armado
      </button>
    </form>
  </div>
</div>

<!-- Workbench Modal: Add Paint to Rack -->
<div id="modal-add-paint" class="custom-modal" onclick="closeAddPaintModal(event)">
  <div class="auth-box" style="max-width: 480px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeAddPaintModal()">&times;</span>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">+ Registrar Pintura en Rack</h3>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Añade frascos a tu inventario de pintura personal.
    </p>
    <form onsubmit="handleAddPaintSubmit(event)">
      <div class="auth-input-group">
        <label class="auth-label">Seleccionar Pintura del Catálogo</label>
        <select id="paint-id-select" class="auth-input" required>
          <option value="">Selecciona una pintura...</option>
          ${paintOptions}
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">Estado en Taller</label>
          <select id="paint-status-select" class="auth-input">
            <option value="owned">En Posesión (Normal)</option>
            <option value="low_stock">Poco Stock (Por acabarse)</option>
            <option value="wishlist">Lista de Deseos</option>
          </select>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Cantidad de Frascos</label>
          <input type="number" id="paint-qty-input" class="auth-input" value="1" min="1" max="50">
        </div>
      </div>
      <button type="submit" id="paint-submit-btn" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; margin-top: 0.5rem;">
        Guardar en Mi Rack
      </button>
    </form>
  </div>
</div>

<!-- Workbench Modal: AI Paint Equivalences & Recipe Assistant -->
<div id="modal-paint-equivalences" class="custom-modal" onclick="closePaintEquivalencesModal(event)">
  <div class="auth-box" style="max-width: 820px; width: 95%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closePaintEquivalencesModal()">&times;</span>
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.4rem;">🧪</span>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0;">Asistente de Equivalencias en Rack & Mezclador IA</h3>
    </div>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1rem;">
      Encuentra pinturas equivalentes entre Laca (Mr. Color), Acrílico (Tamiya), Poliuretano (Vallejo) y Sprays (Montana Colors), priorizando las que ya tienes en tu taller.
    </p>

    <!-- Sub-tabs in modal -->
    <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
      <button id="btn-equiv-tab-search" class="filter-pill active" onclick="switchEquivTab('search')">
        🔍 Equivalencias por Código
      </button>
      <button id="btn-equiv-tab-recipe" class="filter-pill" onclick="switchEquivTab('recipe')">
        ✨ Mezclador IA por Color / Mecha
      </button>
    </div>

    <!-- Section 1: Equivalences Search -->
    <div id="equiv-tab-search-content">
      <form onsubmit="handleSearchEquivalences(event)" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 0.75rem; align-items: flex-end;">
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Código o Nombre de Pintura</label>
            <input type="text" id="equiv-code-input" class="auth-input" placeholder="ej. XF-1, C108, C110, 70.950, RV-242" required>
          </div>
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Filtrar Medio Químico</label>
            <select id="equiv-medium-select" class="auth-input">
              <option value="">Todas las Químicas</option>
              <option value="lacquer">Laca (Mr. Color / Gaia)</option>
              <option value="acrylic">Acrílico (Tamiya X/XF)</option>
              <option value="polyurethane">Poliuretano (Vallejo)</option>
              <option value="montana_colors">Spray (Montana Colors)</option>
            </select>
          </div>
          <button type="submit" id="equiv-search-btn" class="btn-primary" style="padding: 0.65rem 1.15rem; height: 42px;">
            🔍 Buscar
          </button>
        </div>

        <!-- Quick selection from current rack -->
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span style="font-size: 0.72rem; color: #64748b;">De tu Rack:</span>
          <div id="equiv-quick-rack-chips" style="display: flex; gap: 0.35rem; flex-wrap: wrap;"></div>
        </div>
      </form>

      <!-- Results Container -->
      <div id="equiv-results-container" style="display: none;">
        <!-- Injected via JS -->
      </div>
    </div>

    <!-- Section 2: AI Recipe Mixer -->
    <div id="equiv-tab-recipe-content" style="display: none;">
      <form onsubmit="handleGenerateAiRecipe(event)" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 0.75rem; align-items: flex-end;">
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Tono o Parte a Pintar</label>
            <input type="text" id="recipe-query-input" class="auth-input" placeholder="ej. Verde Zaku II, Azul Titan Gundam, Rojo Cometa Char, Barbatos Inner Frame" required>
          </div>
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Medio Químico Preferido</label>
            <select id="recipe-medium-select" class="auth-input">
              <option value="lacquer">Laca (Mr. Color)</option>
              <option value="acrylic">Acrílico (Tamiya)</option>
              <option value="polyurethane">Poliuretano (Vallejo)</option>
              <option value="montana_colors">Spray (Montana Colors)</option>
            </select>
          </div>
          <button type="submit" id="recipe-generate-btn" class="btn-primary" style="padding: 0.65rem 1.15rem; height: 42px;">
            ✨ Mezclar
          </button>
        </div>
      </form>

      <!-- Recipe Results Container -->
      <div id="recipe-results-container" style="display: none;">
        <!-- Injected via JS -->
      </div>
    </div>
  </div>
</div>

<!-- Contest / Exhibition Spec Card Modal -->
<div id="modal-spec-card" class="custom-modal" onclick="closeSpecCardModal(event)">
  <div class="auth-box" style="max-width: 960px; width: 95%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeSpecCardModal()">&times;</span>
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.4rem;">🏷️</span>
      <h3 style="font-size: 1.3rem; font-weight: 700; color: #fff;">Ficha Técnica & Tarjeta de Mesa Imprimible</h3>
    </div>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Configura el largo y ancho exacto de tu tarjeta para concursos físicos y exhibiciones de modelismo con código QR dinámico hacia tu Bitácora.
    </p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      <!-- Panel de Controles -->
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        <!-- 1. Dimensiones Presets -->
        <div class="auth-input-group" style="margin-bottom: 0;">
          <label class="auth-label">Medidas Rápidas (Presets)</label>
          <div id="spec-card-presets-bar" style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
            <button type="button" class="filter-pill active" onclick="setSpecCardPreset('10x15', this)">10 x 15 cm (Mesa)</button>
            <button type="button" class="filter-pill" onclick="setSpecCardPreset('15x10', this)">15 x 10 cm (Vertical)</button>
            <button type="button" class="filter-pill" onclick="setSpecCardPreset('9x5.5', this)">9 x 5.5 cm (Mini)</button>
            <button type="button" class="filter-pill" onclick="setSpecCardPreset('14.8x21', this)">14.8 x 21 cm (A5)</button>
            <button type="button" class="filter-pill" onclick="setSpecCardPreset('21x29.7', this)">21 x 29.7 cm (A4)</button>
          </div>
        </div>

        <!-- 2. Inputs Numéricos de Ancho y Largo (cm) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Ancho (cm)</label>
            <input type="number" id="spec-card-width-input" class="auth-input" value="15" min="5" max="50" step="0.5" oninput="updateSpecCardPreview()">
          </div>
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Largo / Alto (cm)</label>
            <input type="number" id="spec-card-height-input" class="auth-input" value="10" min="3" max="50" step="0.5" oninput="updateSpecCardPreview()">
          </div>
        </div>

        <!-- 3. Formato & Tema de Tinta -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Formato de Exhibición</label>
            <select id="spec-card-format-select" class="auth-input" onchange="updateSpecCardPreview()">
              <option value="flat">📄 Tarjeta Plana (Atril / Portarretrato)</option>
              <option value="tent">⛺ Caballete Plegable (Table Tent - Doble cara)</option>
            </select>
          </div>
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Estilo / Tinta</label>
            <select id="spec-card-theme-select" class="auth-input" onchange="updateSpecCardPreview()">
              <option value="light_ink_saver">⚪ Blanco / Ahorro Tinta (Impresora)</option>
              <option value="dark_mecha">⚫ Modo Mecha Dark (Cyberpunk)</option>
            </select>
          </div>
        </div>

        <!-- 4. Datos del Concurso -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.75rem;">
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">Nombre del Evento / Concurso</label>
            <input type="text" id="spec-card-contest-input" class="auth-input" value="Gunpla Open Cup Perú 2026" oninput="updateSpecCardPreview()">
          </div>
          <div class="auth-input-group" style="margin-bottom: 0;">
            <label class="auth-label">N° de Entrada / Mesa</label>
            <input type="text" id="spec-card-entry-input" class="auth-input" placeholder="ej. #ENTRY-042" oninput="updateSpecCardPreview()">
          </div>
        </div>

        <!-- 5. Casillas de Contenido -->
        <div style="display: flex; flex-direction: column; gap: 0.45rem; background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color);">
          <label style="font-size: 0.8rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="spec-card-chk-qr" checked onchange="updateSpecCardPreview()">
            <span>Incluir Código QR (Escaneo directo al Build Log)</span>
          </label>
          <label style="font-size: 0.8rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="spec-card-chk-cover" checked onchange="updateSpecCardPreview()">
            <span>Incluir Foto Miniatura de la Maqueta</span>
          </label>
          <label style="font-size: 0.8rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="spec-card-chk-paints" checked onchange="updateSpecCardPreview()">
            <span>Incluir Desglose de Pinturas (Laca, Tamiya, Vallejo, MTN)</span>
          </label>
          <label style="font-size: 0.8rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="spec-card-chk-judges" onchange="updateSpecCardPreview()">
            <span>Incluir Casillero de Puntuación para Jueces</span>
          </label>
        </div>

        <!-- Botones de Acción -->
        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
          <button type="button" class="btn-primary" style="flex: 1; justify-content: center; padding: 0.75rem;" onclick="printSpecCard()">
            🖨️ Imprimir / Guardar como PDF
          </button>
          <button type="button" class="filter-pill" style="padding: 0.75rem 1rem;" onclick="closeSpecCardModal()">
            Cerrar
          </button>
        </div>
      </div>

      <!-- Panel de Previsualización en Vivo -->
      <div style="display: flex; flex-direction: column; align-items: center; overflow: hidden;">
        <div style="font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.5rem; align-self: flex-start;">
          👁️ Vista Previa en Escala (<span id="spec-card-dims-label">15 x 10 cm</span>):
        </div>
        <div id="spec-card-preview-viewport" style="width: 100%; min-height: 280px; max-height: 480px; display: flex; justify-content: center; align-items: flex-start; background: #000; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); overflow: auto;">
          <div id="spec-card-preview-container">
            <p style="color: #94a3b8; font-size: 0.85rem; padding: 2rem;">Cargando vista previa de la tarjeta...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Contest Entry Modal -->
<div id="modal-contest-entry" class="custom-modal" onclick="closeContestEntryModal(event)">
  <div class="auth-box" style="max-width: 520px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeContestEntryModal()">&times;</span>
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.4rem;">🏆</span>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">Inscribir Bitácora al Concurso</h3>
    </div>
    <div id="contest-entry-contest-name" style="font-size: 0.85rem; color: #38bdf8; font-weight: 600; margin-bottom: 1rem;"></div>
    
    <div id="contest-entry-auth-warning" style="display: none; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
      <p style="font-size: 0.85rem; color: #fca5a5; margin-bottom: 0.75rem;">Debes iniciar sesión con tu cuenta para inscribir tus obras.</p>
      <button type="button" class="btn-primary" onclick="closeContestEntryModal(); openAuthModal();">Iniciar Sesión</button>
    </div>

    <div id="contest-entry-form-body">
      <div class="auth-input-group">
        <label class="auth-label">Selecciona tu Bitácora de Armado</label>
        <select id="contest-entry-build-select" class="auth-input" onchange="onContestBuildSelectChange()">
          <option value="">Cargando tus bitácoras...</option>
        </select>
      </div>

      <!-- Preview of selected build -->
      <div id="contest-entry-build-preview" style="display: none; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; margin-bottom: 1rem; align-items: center; gap: 0.85rem;">
        <img id="contest-entry-preview-img" src="" alt="" style="width: 60px; height: 60px; border-radius: 6px; object-fit: cover;" />
        <div style="overflow: hidden; flex: 1;">
          <div id="contest-entry-preview-title" style="font-size: 0.85rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
          <div id="contest-entry-preview-meta" style="font-size: 0.75rem; color: #94a3b8;"></div>
        </div>
      </div>

      <div id="contest-entry-empty-state" style="display: none; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 8px; padding: 1.25rem; text-align: center; margin-bottom: 1rem;">
        <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.75rem;">Aún no tienes bitácoras creadas con tu cuenta. ¡Crea una en Mi Taller para participar!</p>
        <button type="button" class="btn-primary" onclick="closeContestEntryModal(); switchTab('workbench');">🛠️ Ir a Mi Taller / Crear Bitácora</button>
      </div>

      <div style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 6px; padding: 0.75rem; font-size: 0.75rem; color: #93c5fd; margin-bottom: 1.25rem;">
        ℹ️ Tu obra entrará de inmediato a la galería de votación comunitaria. Asegúrate de que las fotos muestren el acabado final.
      </div>

      <div id="contest-entry-error-msg" style="display: none; color: #ef4444; font-size: 0.8rem; margin-bottom: 0.75rem;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="filter-pill" onclick="closeContestEntryModal()">Cancelar</button>
        <button type="button" id="btn-confirm-contest-entry" class="btn-primary" onclick="confirmContestSubmission()">
          🏆 Confirmar Inscripción
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Edit Builder Profile Modal -->
<div id="modal-edit-profile" class="custom-modal" onclick="closeEditProfileModal(event)">
  <div class="auth-box" style="max-width: 560px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeEditProfileModal()">&times;</span>
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.4rem;">👤</span>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">Editar Perfil de Modelista</h3>
    </div>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Personaliza tu nombre público, foto de perfil, biografía y especialidades técnicas para la comunidad.
    </p>

    <form id="profile-edit-form" onsubmit="saveProfileChanges(event)">
      <!-- Avatar Section -->
      <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.25rem; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
        <div id="profile-avatar-preview-slot" style="width: 72px; height: 72px; border-radius: 50%; overflow: hidden; background: #1e293b; border: 2px solid var(--accent-color); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 700; color: #fff; flex-shrink: 0;">
          U
        </div>
        <div style="flex: 1;">
          <label class="auth-label" style="margin-bottom: 0.3rem;">Foto de Perfil / Avatar</label>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.4rem;">
            <input type="url" id="profile-avatar-input" class="auth-input" style="font-size: 0.82rem; padding: 0.45rem 0.65rem;" placeholder="https://ejemplo.com/mi-avatar.jpg" oninput="updateProfileAvatarPreview()">
            <input type="file" id="profile-avatar-file-input" accept="image/*" style="display: none;" onchange="handleProfileAvatarUpload(event)">
            <button type="button" class="filter-pill" style="white-space: nowrap; font-size: 0.78rem;" onclick="document.getElementById('profile-avatar-file-input').click()">
              📷 Subir Foto
            </button>
          </div>
          <div style="font-size: 0.72rem; color: #64748b;">JPG, PNG o WebP. Se almacena permanentemente.</div>
        </div>
      </div>

      <!-- Display Name -->
      <div class="auth-input-group">
        <label class="auth-label">Nombre Público / Alias de Modelista</label>
        <input type="text" id="profile-display-name-input" class="auth-input" required maxlength="80" placeholder="ej. Aldo Perich / Char Custom Works">
      </div>

      <!-- Bio -->
      <div class="auth-input-group">
        <label class="auth-label">Biografía / Acerca de ti</label>
        <textarea id="profile-bio-input" class="auth-input" rows="3" maxlength="500" style="resize: vertical;" placeholder="Cuéntale a la comunidad sobre tu experiencia, marcas de pintura favoritas, técnicas o estilo de armado..."></textarea>
      </div>

      <!-- Specialties with Clickable Quick Tags -->
      <div class="auth-input-group">
        <label class="auth-label">Especialidades de Modelismo (separadas por comas)</label>
        <input type="text" id="profile-specialties-input" class="auth-input" placeholder="ej. Gunpla MG, Custom Paint, Pátinas & Weathering, Aerografía">
        <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem;">
          <span style="font-size: 0.72rem; color: #64748b; align-self: center;">Sugerencias:</span>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="addSpecialtyTag('Gunpla MG')">+ Gunpla MG</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="addSpecialtyTag('Gunpla RG')">+ Gunpla RG</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="addSpecialtyTag('Militar 1/35')">+ Militar 1/35</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="addSpecialtyTag('Aviación 1/48')">+ Aviación 1/48</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="addSpecialtyTag('Custom Paint')">+ Custom Paint</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="addSpecialtyTag('Aerografía Laca')">+ Aerografía Laca</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="addSpecialtyTag('Pátinas & Weathering')">+ Pátinas & Weathering</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="addSpecialtyTag('Dioramas')">+ Dioramas</button>
        </div>
      </div>

      <!-- Contact / Social Links -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">WhatsApp de Contacto (Comisiones)</label>
          <input type="text" id="profile-whatsapp-input" class="auth-input" placeholder="ej. +51 987 654 321">
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Enlace de Red Social / Canal</label>
          <input type="url" id="profile-social-input" class="auth-input" placeholder="https://instagram.com/mi_perfil">
        </div>
      </div>

      <div id="profile-edit-error-msg" style="display: none; color: #ef4444; font-size: 0.8rem; margin-bottom: 0.75rem;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
        <button type="button" class="filter-pill" onclick="closeEditProfileModal()">Cancelar</button>
        <button type="submit" id="btn-save-profile" class="btn-primary" style="padding: 0.65rem 1.25rem;">
          💾 Guardar Cambios
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Custom Theme & Portal Customizer Modal (Admin / Tenant Admin) -->
<div id="modal-tenant-theme" class="custom-modal" onclick="closeTenantThemeModal(event)">
  <div class="auth-box" style="max-width: 620px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeTenantThemeModal()">&times;</span>
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.4rem;">🎨</span>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">Personalizar Tema y Marca del Portal</h3>
    </div>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Ajusta los colores corporativos, logotipo y categorías visibles para este portal. Los cambios aplican de inmediato para toda la comunidad.
    </p>

    <form id="tenant-theme-form" onsubmit="saveTenantTheme(event)">
      <!-- Name & Tagline -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">Nombre del Portal</label>
          <input type="text" id="theme-tenant-name" class="auth-input" required maxlength="80" value="${escapeHtml(config.tenantName)}">
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Texto de Logotipo (Topbar)</label>
          <input type="text" id="theme-tenant-logo-text" class="auth-input" maxlength="40" value="${escapeHtml(config.tenantName.toUpperCase())}">
        </div>
      </div>

      <div class="auth-input-group">
        <label class="auth-label">Lema / Tagline de la Comunidad</label>
        <input type="text" id="theme-tenant-tagline" class="auth-input" maxlength="150" value="${escapeHtml(config.tenantTagline)}">
      </div>

      <!-- Color Palette Customizer -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
        <label class="auth-label" style="margin-bottom: 0.6rem; color: #38bdf8; display: flex; align-items: center; gap: 0.4rem;">
          <span>🎨</span> Paleta de Colores de Marca
        </label>

        <!-- Color Presets -->
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem;">
          <span style="font-size: 0.72rem; color: #64748b; align-self: center;">Presets Rápidos:</span>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyThemePreset('#1e293b', '#3b82f6', '#0f172a')">🔵 Titan Blue</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyThemePreset('#3b1111', '#ef4444', '#180808')">🔴 Char Crimson</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyThemePreset('#1c2818', '#22c55e', '#0d140b')">🟢 Zaku Military</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyThemePreset('#0f172a', '#eab308', '#090d16')">🟡 Gundam Gold</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyThemePreset('#1a0b2e', '#06b6d4', '#0d0517')">🟣 Neon Cyberpunk</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;">
          <!-- Primary Color -->
          <div>
            <label class="auth-label" style="font-size: 0.75rem;">Color Primario (Botones)</label>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <input type="color" id="theme-primary-color" value="${config.theme.primaryColor}" style="width: 36px; height: 36px; border: none; border-radius: 6px; cursor: pointer; background: transparent;" oninput="syncColorInput('theme-primary-hex', this.value); updateThemePreview()">
              <input type="text" id="theme-primary-hex" class="auth-input" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; font-family: monospace;" value="${config.theme.primaryColor}" oninput="syncColorInput('theme-primary-color', this.value); updateThemePreview()">
            </div>
          </div>

          <!-- Accent Color -->
          <div>
            <label class="auth-label" style="font-size: 0.75rem;">Color de Acento (Badges/Links)</label>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <input type="color" id="theme-accent-color" value="${config.theme.accentColor}" style="width: 36px; height: 36px; border: none; border-radius: 6px; cursor: pointer; background: transparent;" oninput="syncColorInput('theme-accent-hex', this.value); updateThemePreview()">
              <input type="text" id="theme-accent-hex" class="auth-input" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; font-family: monospace;" value="${config.theme.accentColor}" oninput="syncColorInput('theme-accent-color', this.value); updateThemePreview()">
            </div>
          </div>

          <!-- Surface / Background Color -->
          <div>
            <label class="auth-label" style="font-size: 0.75rem;">Fondo / Superficie</label>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <input type="color" id="theme-surface-color" value="${config.theme.bgDark}" style="width: 36px; height: 36px; border: none; border-radius: 6px; cursor: pointer; background: transparent;" oninput="syncColorInput('theme-surface-hex', this.value); updateThemePreview()">
              <input type="text" id="theme-surface-hex" class="auth-input" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; font-family: monospace;" value="${config.theme.bgDark}" oninput="syncColorInput('theme-surface-color', this.value); updateThemePreview()">
            </div>
          </div>
        </div>
      </div>

      <!-- Live Theme Preview Card -->
      <div style="margin-bottom: 1.25rem;">
        <label class="auth-label" style="margin-bottom: 0.4rem;">Vista Previa de Marca (Live Preview)</label>
        <div id="theme-preview-box" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; background: ${config.theme.bgDark}; transition: all 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div id="theme-preview-brand" style="font-size: 1rem; font-weight: 700; color: #fff; font-family: 'Chakra Petch', sans-serif;">${escapeHtml(config.tenantName)}</div>
            <span id="theme-preview-badge" style="background: ${config.theme.accentColor}; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px;">ACTIVO</span>
          </div>
          <p id="theme-preview-tagline" style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.85rem;">${escapeHtml(config.tenantTagline)}</p>
          <div style="display: flex; gap: 0.6rem; align-items: center;">
            <button type="button" id="theme-preview-btn-primary" style="background: ${config.theme.primaryColor}; border: none; color: #fff; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.85rem; border-radius: 6px;">Botón Primario</button>
            <button type="button" id="theme-preview-btn-accent" style="background: ${config.theme.accentColor}; border: none; color: #fff; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.85rem; border-radius: 6px;">Botón Acento</button>
            <span style="font-size: 0.75rem; color: #94a3b8;">Estilo visual en vivo</span>
          </div>
        </div>
      </div>

      <!-- Allowed Categories -->
      <div class="auth-input-group">
        <label class="auth-label" style="margin-bottom: 0.4rem;">Categorías Habilitadas en este Portal</label>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.5rem; background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="theme-category" value="gunpla-mecha" checked> Gunpla & Mecha
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="theme-category" value="military" ${!isGunpla ? 'checked' : ''}> Militar 1/35
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="theme-category" value="aviation" ${!isGunpla ? 'checked' : ''}> Aviación 1/48
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="theme-category" value="automotive" ${!isGunpla ? 'checked' : ''}> Automotriz 1/24
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="theme-category" value="naval" ${!isGunpla ? 'checked' : ''}> Naval
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="theme-category" value="figures" ${!isGunpla ? 'checked' : ''}> Figuras
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="theme-category" value="scifi" ${!isGunpla ? 'checked' : ''}> Sci-Fi
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="theme-category" value="diorama" ${!isGunpla ? 'checked' : ''}> Dioramas
          </label>
        </div>
      </div>

      <div id="theme-status-msg" style="display: none; font-size: 0.82rem; margin-bottom: 0.75rem;"></div>

      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; margin-top: 1rem;">
        <button type="button" class="filter-pill" onclick="previewThemeLive()" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
          👁️ Probar en esta Página
        </button>
        <div style="display: flex; gap: 0.6rem;">
          <button type="button" class="filter-pill" onclick="closeTenantThemeModal()">Cancelar</button>
          <button type="submit" id="btn-save-theme" class="btn-primary" style="padding: 0.65rem 1.25rem;">
            💾 Guardar Cambios
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- Self-Service White-Label New Tenant Modal -->
<div id="modal-new-tenant" class="custom-modal" onclick="closeNewTenantModal(event)">
  <div class="auth-box" style="max-width: 620px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeNewTenantModal()">&times;</span>
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.4rem;">🏛️</span>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">Crear Nuevo Club o Portal White-Label</h3>
    </div>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Despliega una comunidad de modelismo personalizada con tu propia marca, colores, categorías especializadas y dominio. Serás configurado como Administrador del Portal automáticamente.
    </p>

    <form id="new-tenant-form" onsubmit="createNewTenant(event)">
      <!-- Name, Slug & Domain -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">Nombre del Club o Portal</label>
          <input type="text" id="new-tenant-name" class="auth-input" required maxlength="80" placeholder="ej. Arequipa Scale Modelers" oninput="autoSuggestSlug(this.value)">
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Slug Único (identificador)</label>
          <input type="text" id="new-tenant-slug" class="auth-input" required maxlength="40" placeholder="ej. arequipa-scale">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">Dominio o Subdominio</label>
          <input type="text" id="new-tenant-domain" class="auth-input" required maxlength="100" placeholder="ej. arequipascale.com">
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Email de Contacto</label>
          <input type="email" id="new-tenant-email" class="auth-input" placeholder="contacto@arequipascale.com">
        </div>
      </div>

      <div class="auth-input-group">
        <label class="auth-label">Lema / Tagline de la Comunidad</label>
        <input type="text" id="new-tenant-tagline" class="auth-input" maxlength="150" placeholder="ej. Comunidad de Maquetismo Militar, Dioramas y Figuras">
      </div>

      <!-- Color Palette Customizer for New Tenant -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
        <label class="auth-label" style="margin-bottom: 0.6rem; color: #38bdf8; display: flex; align-items: center; gap: 0.4rem;">
          <span>🎨</span> Paleta de Colores del Nuevo Portal
        </label>

        <!-- Color Presets -->
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem;">
          <span style="font-size: 0.72rem; color: #64748b; align-self: center;">Presets:</span>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyNewTenantPreset('#1e293b', '#3b82f6', '#0f172a')">🔵 Titan Blue</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyNewTenantPreset('#3b1111', '#ef4444', '#180808')">🔴 Char Crimson</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyNewTenantPreset('#1c2818', '#22c55e', '#0d140b')">🟢 Zaku Military</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyNewTenantPreset('#0f172a', '#eab308', '#090d16')">🟡 Gundam Gold</button>
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;" onclick="applyNewTenantPreset('#1a0b2e', '#06b6d4', '#0d0517')">🟣 Neon Cyberpunk</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;">
          <div>
            <label class="auth-label" style="font-size: 0.75rem;">Color Primario</label>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <input type="color" id="new-tenant-primary-color" value="#1e293b" style="width: 36px; height: 36px; border: none; border-radius: 6px; cursor: pointer; background: transparent;" oninput="syncColorInput('new-tenant-primary-hex', this.value)">
              <input type="text" id="new-tenant-primary-hex" class="auth-input" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; font-family: monospace;" value="#1e293b" oninput="syncColorInput('new-tenant-primary-color', this.value)">
            </div>
          </div>
          <div>
            <label class="auth-label" style="font-size: 0.75rem;">Color de Acento</label>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <input type="color" id="new-tenant-accent-color" value="#3b82f6" style="width: 36px; height: 36px; border: none; border-radius: 6px; cursor: pointer; background: transparent;" oninput="syncColorInput('new-tenant-accent-hex', this.value)">
              <input type="text" id="new-tenant-accent-hex" class="auth-input" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; font-family: monospace;" value="#3b82f6" oninput="syncColorInput('new-tenant-accent-color', this.value)">
            </div>
          </div>
          <div>
            <label class="auth-label" style="font-size: 0.75rem;">Superficie / Fondo</label>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <input type="color" id="new-tenant-surface-color" value="#0f172a" style="width: 36px; height: 36px; border: none; border-radius: 6px; cursor: pointer; background: transparent;" oninput="syncColorInput('new-tenant-surface-hex', this.value)">
              <input type="text" id="new-tenant-surface-hex" class="auth-input" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; font-family: monospace;" value="#0f172a" oninput="syncColorInput('new-tenant-surface-color', this.value)">
            </div>
          </div>
        </div>
      </div>

      <!-- Categories for New Tenant -->
      <div class="auth-input-group">
        <label class="auth-label" style="margin-bottom: 0.4rem;">Especialidades / Categorías del Portal</label>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.5rem; background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="new-tenant-category" value="gunpla-mecha" checked> Gunpla & Mecha
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="new-tenant-category" value="military" checked> Militar 1/35
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="new-tenant-category" value="aviation" checked> Aviación 1/48
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="new-tenant-category" value="automotive" checked> Automotriz 1/24
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="new-tenant-category" value="naval" checked> Naval
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="new-tenant-category" value="figures" checked> Figuras
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="new-tenant-category" value="scifi" checked> Sci-Fi
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
            <input type="checkbox" name="new-tenant-category" value="diorama" checked> Dioramas
          </label>
        </div>
      </div>

      <div id="new-tenant-status-msg" style="display: none; font-size: 0.82rem; margin-bottom: 0.75rem;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
        <button type="button" class="filter-pill" onclick="closeNewTenantModal()">Cancelar</button>
        <button type="submit" id="btn-create-tenant" class="btn-primary" style="padding: 0.65rem 1.25rem;">
          🚀 Crear Portal White-Label
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Judge Rubric Scoring Modal -->
<div id="modal-judge-entry" class="custom-modal" onclick="closeJudgeModal(event)">
  <div class="auth-box" style="max-width: 580px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeJudgeModal()">&times;</span>
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.4rem;">⚖️</span>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">Calificación Oficial de Jurado</h3>
    </div>
    <div id="judge-modal-entry-title" style="font-size: 0.95rem; font-weight: 600; color: #38bdf8; margin-bottom: 0.25rem;"></div>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Rúbrica oficial estándar de 4 criterios (1 a 10 cada uno, máximo 40 puntos). Tu calificación computa en el ranking final de premiación.
    </p>

    <form id="judge-scoring-form" onsubmit="submitJudgeScore(event)">
      <input type="hidden" id="judge-contest-id">
      <input type="hidden" id="judge-entry-id">

      <!-- 1. Assembly -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: #fff;">1. Montaje & Construcción</label>
          <span id="score-val-assembly" style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;">8 / 10</span>
        </div>
        <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.6rem;">Limpieza de rebabas (nubs), líneas de molde eliminadas, alineación y simetría.</p>
        <input type="range" id="judge-score-assembly" min="1" max="10" value="8" style="width: 100%; cursor: pointer;" oninput="updateJudgeTotal()">
      </div>

      <!-- 2. Painting -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: #fff;">2. Pintura & Aerografía</label>
          <span id="score-val-painting" style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;">8 / 10</span>
        </div>
        <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.6rem;">Homogeneidad de capas, ausencia de polvo/piel de naranja, definición de bordes.</p>
        <input type="range" id="judge-score-painting" min="1" max="10" value="8" style="width: 100%; cursor: pointer;" oninput="updateJudgeTotal()">
      </div>

      <!-- 3. Finish -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: #fff;">3. Acabado & Weathering</label>
          <span id="score-val-finish" style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;">8 / 10</span>
        </div>
        <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.6rem;">Calcas/decals sin silvering, panel line consistente, pátinas o barniz uniforme.</p>
        <input type="range" id="judge-score-finish" min="1" max="10" value="8" style="width: 100%; cursor: pointer;" oninput="updateJudgeTotal()">
      </div>

      <!-- 4. Creativity -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: #fff;">4. Creatividad & Presentación</label>
          <span id="score-val-creativity" style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;">8 / 10</span>
        </div>
        <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.6rem;">Dificultad de la técnica, balance de colores, peana/base o pose dinámica.</p>
        <input type="range" id="judge-score-creativity" min="1" max="10" value="8" style="width: 100%; cursor: pointer;" oninput="updateJudgeTotal()">
      </div>

      <!-- Live Total Summary -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 0.85rem 1.25rem; margin-bottom: 1rem;">
        <div>
          <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase;">Puntuación Total Rúbrica</div>
          <div id="judge-total-grade" style="font-size: 0.82rem; font-weight: 600; color: #22c55e;">Excelente</div>
        </div>
        <div id="judge-total-score" style="font-size: 1.8rem; font-weight: 700; color: #fff; font-family: 'Chakra Petch', sans-serif;">
          32 <span style="font-size: 1rem; color: #94a3b8;">/ 40</span>
        </div>
      </div>

      <!-- Technical Feedback -->
      <div class="auth-input-group">
        <label class="auth-label">Comentarios Técnicos / Observaciones del Juez (opcional)</label>
        <textarea id="judge-feedback" class="auth-input" rows="3" maxlength="500" placeholder="Añade sugerencias constructivas para el modelista sobre la tensión de las uniones, barniz o tonalidad..."></textarea>
      </div>

      <div id="judge-status-msg" style="display: none; font-size: 0.82rem; margin-bottom: 0.75rem;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
        <button type="button" class="filter-pill" onclick="closeJudgeModal()">Cancelar</button>
        <button type="submit" id="btn-submit-judge" class="btn-primary" style="padding: 0.65rem 1.25rem;">
          ⚖️ Emitir Calificación Oficial
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Contest Certificate / Diploma Viewer Modal -->
<div id="modal-contest-certificate" class="custom-modal" onclick="closeCertificateModal(event)">
  <div class="auth-box" style="max-width: 760px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeCertificateModal()">&times;</span>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 1.5rem;">📜</span>
        <div>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #fff;">Diploma & Certificado Oficial</h3>
          <p style="font-size: 0.75rem; color: #94a3b8;">Reconocimiento digital verificado con código QR y rúbrica</p>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button type="button" class="btn-primary" style="font-size: 0.82rem; padding: 0.4rem 0.85rem;" onclick="printCertificate()">
          🖨️ Imprimir Diploma
        </button>
      </div>
    </div>

    <!-- Certificate Render Target -->
    <div id="certificate-display-target" style="border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);">
      <div style="padding: 3rem; text-align: center; color: #94a3b8;">Cargando certificado...</div>
    </div>
  </div>
</div>

<!-- Commission Request Modal -->
<div id="modal-commission-request" class="custom-modal" onclick="closeCommissionModal(event)">
  <div class="auth-box" style="max-width: 680px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeCommissionModal()">&times;</span>
    
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.6rem;">🎨</span>
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0;">Solicitar Encargo de Pintura & Armado</h3>
        <p id="comm-target-builder-banner" style="font-size: 0.82rem; color: var(--accent); margin-top: 0.15rem;"></p>
      </div>
    </div>

    <form id="form-commission-request" onsubmit="submitCommissionRequest(event)" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
      <input type="hidden" id="comm-builder-username">
      <input type="hidden" id="comm-builder-display-name">

      <!-- Kit & Escala -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div>
          <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Maqueta / Kit a Trabajar *</label>
          <input type="text" id="comm-kit-title" class="auth-input" placeholder="ej. MG 1/100 Sazabi Ver. Ka" required>
        </div>
        <div>
          <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Categoría & Escala *</label>
          <select id="comm-scale-category" class="auth-input">
            <option value="gunpla-mecha">Gunpla / Mecha (MG, RG, PG, HG)</option>
            <option value="military">Militar / Blindados (1/35, 1/72)</option>
            <option value="aviation">Aviación / Aviones (1/48, 1/72)</option>
            <option value="automotive">Automotriz & Motos (1/24, 1/12)</option>
            <option value="figures">Figuras & Sci-Fi</option>
            <option value="diorama">Diorama Escénico Completo</option>
          </select>
        </div>
      </div>

      <!-- Scope Level Selection (4 Tiers) -->
      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.4rem;">Nivel de Acabado Deseado *</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
          <label class="scope-option" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; cursor: pointer; display: flex; gap: 0.5rem; align-items: flex-start;">
            <input type="radio" name="comm-scope-level" value="level_1_clean_build" style="margin-top: 0.2rem;">
            <div>
              <strong style="color: #fff; font-size: 0.82rem;">Nivel 1: Montaje Limpio</strong>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem;">Lijado de nubs, panel lining prolijo, topcoat mate/satinado.</div>
            </div>
          </label>

          <label class="scope-option" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; cursor: pointer; display: flex; gap: 0.5rem; align-items: flex-start;">
            <input type="radio" name="comm-scope-level" value="level_2_custom_paint" checked style="margin-top: 0.2rem;">
            <div>
              <strong style="color: #38bdf8; font-size: 0.82rem;">Nivel 2: Pintura Custom</strong>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem;">Aerografía completa, paleta personalizada, calcas al agua y barniz.</div>
            </div>
          </label>

          <label class="scope-option" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; cursor: pointer; display: flex; gap: 0.5rem; align-items: flex-start;">
            <input type="radio" name="comm-scope-level" value="level_3_weathering" style="margin-top: 0.2rem;">
            <div>
              <strong style="color: #f59e0b; font-size: 0.82rem;">Nivel 3: Weathering Avanzado</strong>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem;">Chipping, óxidos, sombreado, filtros al óleo y pigmentos.</div>
            </div>
          </label>

          <label class="scope-option" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; cursor: pointer; display: flex; gap: 0.5rem; align-items: flex-start;">
            <input type="radio" name="comm-scope-level" value="level_4_masterpiece" style="margin-top: 0.2rem;">
            <div>
              <strong style="color: #c084fc; font-size: 0.82rem;">Nivel 4: Masterpiece / Diorama</strong>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem;">Modificaciones en pla-plate/resina, LEDs, peana y terreno.</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Kit Supply & Budget -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div>
          <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Suministro del Kit *</label>
          <select id="comm-kit-supply" class="auth-input">
            <option value="client_provides_kit">📦 Yo entrego la maqueta (en caja)</option>
            <option value="builder_sources_kit">🛒 Deseo que el modelista compre el kit</option>
            <option value="undecided">🤝 A convenir / Por definir</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Presupuesto Estimado (PEN)</label>
          <input type="number" id="comm-target-budget" class="auth-input" placeholder="ej. 350" min="0">
        </div>
      </div>

      <!-- Contact Details -->
      <div style="background: rgba(0,0,0,0.2); padding: 0.85rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
        <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.6rem;">Tus Datos de Contacto</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.6rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">Tu Nombre / Alias *</label>
            <input type="text" id="comm-client-name" class="auth-input" placeholder="ej. Carlos Mendoza" required>
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">WhatsApp / Teléfono *</label>
            <input type="text" id="comm-client-whatsapp" class="auth-input" placeholder="+51 987 654 321" required>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">Correo Electrónico *</label>
            <input type="email" id="comm-client-email" class="auth-input" placeholder="tu@correo.com" required>
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">Ciudad / Distrito</label>
            <input type="text" id="comm-client-city" class="auth-input" placeholder="ej. Lima (Miraflores)">
          </div>
        </div>
      </div>

      <!-- Project Notes -->
      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Descripción y Referencias del Encargo *</label>
        <textarea id="comm-project-notes" class="auth-input" rows="3" placeholder="Describe los colores que deseas, si quieres efectos de sombreado, calcas al agua o enlaces a fotos de referencia..." required></textarea>
      </div>

      <div id="comm-form-status" style="font-size: 0.82rem; display: none;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 0.6rem;">
        <button type="button" class="filter-pill" onclick="closeCommissionModal()">Cancelar</button>
        <button type="submit" id="comm-submit-btn" class="btn-primary" style="padding: 0.55rem 1.25rem;">
          🚀 Enviar Solicitud de Encargo
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Quote Commission Modal (For Builders) -->
<div id="modal-quote-commission" class="custom-modal" onclick="closeQuoteModal(event)">
  <div class="auth-box" style="max-width: 520px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeQuoteModal()">&times;</span>
    <h3 style="font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">📝 Cotizar Solicitud de Encargo</h3>
    <p id="quote-modal-kit-banner" style="font-size: 0.82rem; color: var(--accent); margin-bottom: 1rem;"></p>

    <form id="form-quote-commission" onsubmit="submitQuote(event)" style="display: flex; flex-direction: column; gap: 0.85rem;">
      <input type="hidden" id="quote-request-id">

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div>
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">Precio Cotizado (PEN) *</label>
          <input type="number" id="quote-price-input" class="auth-input" placeholder="ej. 420" min="0" required>
        </div>
        <div>
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">Plazo Estimado (Días) *</label>
          <input type="number" id="quote-days-input" class="auth-input" placeholder="ej. 20" min="1" required>
        </div>
      </div>

      <div>
        <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">Estado del Encargo *</label>
        <select id="quote-status-select" class="auth-input">
          <option value="quoted">🔵 Cotizado (Enviar propuesta al cliente)</option>
          <option value="in_progress">🟠 En Mesa de Trabajo (WIP iniciado)</option>
          <option value="completed">🟣 Finalizado (Listo para entrega)</option>
          <option value="declined">⚪ Rechazar / Cancelar Encargo</option>
        </select>
      </div>

      <div>
        <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">Mensaje y Condiciones Técnicas</label>
        <textarea id="quote-notes-input" class="auth-input" rows="3" placeholder="Indica qué pinturas y barnices usarás, condiciones de entrega o anticipo..."></textarea>
      </div>

      <div id="quote-status-msg" style="font-size: 0.82rem; display: none;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem;">
        <button type="button" class="filter-pill" onclick="closeQuoteModal()">Cancelar</button>
        <button type="submit" id="quote-submit-btn" class="btn-primary">
          Guardar & Notificar al Cliente
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Commission Success Modal -->
<div id="modal-commission-success" class="custom-modal" onclick="closeCommissionSuccessModal(event)">
  <div class="auth-box" style="max-width: 480px; text-align: center;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeCommissionSuccessModal()">&times;</span>
    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
    <h3 style="font-size: 1.3rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">¡Solicitud de Encargo Enviada!</h3>
    <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1.25rem;">
      Tu encargo ha sido registrado exitosamente y notificado al modelista.
    </p>

    <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--accent-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
      <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Código de Seguimiento:</div>
      <div id="comm-success-code" style="font-size: 1.4rem; font-weight: 800; color: var(--accent); font-family: monospace; letter-spacing: 1px; margin-top: 0.25rem;">COM-2026-XXXX</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.6rem;">
      <a id="comm-success-whatsapp-btn" href="#" target="_blank" rel="noopener" class="btn-primary" style="background: #22c55e; border-color: #22c55e; justify-content: center; text-decoration: none; padding: 0.65rem;">
        💬 Abrir WhatsApp con el Modelista
      </a>
      <button class="filter-pill" onclick="closeCommissionSuccessModal(); switchTab('workbench'); switchWorkbenchSubtab('commissions');" style="padding: 0.55rem;">
        💼 Ver Mis Encargos en Mi Taller
      </button>
    </div>
  </div>
</div>

<!-- Marketplace Inquiry Modal -->
<div id="modal-marketplace-inquiry" class="custom-modal" onclick="closeMarketplaceInquiryModal(event)">
  <div class="auth-box" style="max-width: 520px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeMarketplaceInquiryModal()">&times;</span>
    
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.6rem;">✉️</span>
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0;">Consultar al Vendedor</h3>
        <p id="inquiry-modal-kit-banner" style="font-size: 0.82rem; color: var(--accent); margin-top: 0.15rem;"></p>
      </div>
    </div>

    <form id="form-marketplace-inquiry" onsubmit="submitMarketplaceInquiry(event)" style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.85rem;">
      <input type="hidden" id="inquiry-listing-id">

      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Tu Nombre / Alias *</label>
        <input type="text" id="inquiry-buyer-name" class="auth-input" placeholder="ej. Carlos Modelista" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div>
          <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Tu Correo Electrónico *</label>
          <input type="email" id="inquiry-buyer-email" class="auth-input" placeholder="tu@correo.com" required>
        </div>
        <div>
          <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">WhatsApp / Teléfono</label>
          <input type="tel" id="inquiry-buyer-phone" class="auth-input" placeholder="+51 999 888 777">
        </div>
      </div>

      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Oferta Propuesta (Opcional, en PEN/USD)</label>
        <input type="number" id="inquiry-offer-price" class="auth-input" placeholder="ej. 350" min="1" step="any">
      </div>

      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Mensaje o Pregunta al Vendedor *</label>
        <textarea id="inquiry-message" class="auth-input" rows="3" placeholder="Hola, ¿sigue disponible el kit? ¿Haces entregas en estación o envíos a provincia?" required></textarea>
      </div>

      <div id="inquiry-form-status" style="display: none; padding: 0.65rem; border-radius: 6px; font-size: 0.85rem;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
        <button type="button" class="filter-pill" onclick="closeMarketplaceInquiryModal()">Cancelar</button>
        <button type="submit" id="inquiry-submit-btn" class="btn-primary" style="padding: 0.5rem 1.25rem;">
          ✉️ Enviar Consulta por Email
        </button>
      </div>
    </form>
  </div>
</div>

<!-- WhatsApp Direct Modeler Inquiry Modal -->
<div id="modal-whatsapp-inquiry" class="modal" onclick="closeWhatsAppInquiryModal(event)" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem;">
  <div class="modal-box" onclick="event.stopPropagation()" style="background: #0f172a; border: 1px solid rgba(37,211,102,0.4); border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); overflow: hidden;">
    <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(37,211,102,0.12) 0%, rgba(15,23,42,0.95) 100%); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.4rem;">💬</span>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Consulta Directa por WhatsApp</h3>
          <p style="font-size: 0.78rem; color: #4ade80; margin: 0.15rem 0 0 0;">Canal directo con el modelista</p>
        </div>
      </div>
      <span style="font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1;" onclick="closeWhatsAppInquiryModal()">&times;</span>
    </div>

    <form id="form-whatsapp-inquiry" onsubmit="handleWhatsAppInquirySubmit(event)" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
      <input type="hidden" id="wa-inquiry-builder-username" value="" />
      <input type="hidden" id="wa-inquiry-item-title" value="" />
      <input type="hidden" id="wa-inquiry-slug-or-id" value="" />
      <input type="hidden" id="wa-inquiry-target-phone" value="" />

      <!-- Modeler & Item Context Banner -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem 1rem;">
        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem;">Destinatario / Modelista:</div>
        <div id="wa-inquiry-dest-label" style="font-size: 0.95rem; font-weight: 700; color: #fff;">@modelista</div>
        <div id="wa-inquiry-item-label" style="font-size: 0.8rem; color: #38bdf8; margin-top: 0.2rem;">Obra: Titulo</div>
      </div>

      <!-- Inquiry Type Pills -->
      <div>
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Motivo de tu consulta:</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <label style="display: flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.45rem 0.65rem; cursor: pointer; font-size: 0.78rem; color: #e2e8f0;">
            <input type="radio" name="wa-inquiry-type" value="paint_recipe" checked onchange="onWhatsAppInquiryTypeChange()" />
            <span>🎨 Receta / Pintura</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.45rem 0.65rem; cursor: pointer; font-size: 0.78rem; color: #e2e8f0;">
            <input type="radio" name="wa-inquiry-type" value="custom_commission" onchange="onWhatsAppInquiryTypeChange()" />
            <span>🖌️ Encargar Obra</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.45rem 0.65rem; cursor: pointer; font-size: 0.78rem; color: #e2e8f0;">
            <input type="radio" name="wa-inquiry-type" value="purchase_build" onchange="onWhatsAppInquiryTypeChange()" />
            <span>🛒 Comprar Obra</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.45rem 0.65rem; cursor: pointer; font-size: 0.78rem; color: #e2e8f0;">
            <input type="radio" name="wa-inquiry-type" value="general" onchange="onWhatsAppInquiryTypeChange()" />
            <span>💬 Consulta General</span>
          </label>
        </div>
      </div>

      <!-- Sender Name -->
      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Tu Nombre (Opcional):</label>
        <input type="text" id="wa-inquiry-client-name" class="auth-input" placeholder="ej. Roberto Pineda" oninput="onWhatsAppInquiryTypeChange()" />
      </div>

      <!-- Live Editable Message Preview -->
      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Mensaje Preconfigurado (Editable):</label>
        <textarea id="wa-inquiry-message-preview" class="auth-input" rows="4" style="font-family: inherit; font-size: 0.82rem; line-height: 1.5;"></textarea>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
        <button type="button" class="filter-pill" onclick="closeWhatsAppInquiryModal()">Cancelar</button>
        <button type="submit" id="wa-inquiry-submit-btn" class="btn-primary" style="background: #25d366; color: #fff; padding: 0.5rem 1.25rem; display: inline-flex; align-items: center; gap: 0.4rem;">
          <span>🚀 Abrir WhatsApp</span>
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Bulk Import Modal (CSV/TSV/Excel for Stash & Paint Rack) -->
<div id="modal-bulk-import" class="custom-modal modal" onclick="closeBulkImportModal(event)" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem;">
  <div class="modal-box" onclick="event.stopPropagation()" style="background: #0f172a; border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 12px; width: 100%; max-width: 650px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.6); overflow: hidden;">
    <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(15,23,42,0.95) 100%); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.4rem;">📥</span>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Importación Masiva (CSV / Excel)</h3>
          <p style="font-size: 0.78rem; color: #4ade80; margin: 0.15rem 0 0 0;">Migra tu Stash o Paint Rack en segundos</p>
        </div>
      </div>
      <span style="font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1;" onclick="closeBulkImportModal()">&times;</span>
    </div>

    <div style="padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;">
      <!-- Import Target Tabs -->
      <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem;">
        <button id="tab-btn-import-stash" type="button" class="filter-pill active" onclick="switchBulkImportTab('stash')" style="flex: 1; justify-content: center; padding: 0.5rem;">
          📦 Maquetas (Stash)
        </button>
        <button id="tab-btn-import-paints" type="button" class="filter-pill" onclick="switchBulkImportTab('paints')" style="flex: 1; justify-content: center; padding: 0.5rem;">
          🎨 Pinturas (Rack)
        </button>
      </div>

      <!-- Format Instructions Banner -->
      <div id="bulk-import-instructions" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem 1rem;">
        <div id="bulk-import-guide-text" style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">
          <strong>Columnas compatibles para Maquetas:</strong> <code>Nombre, Marca, Escala, Grado, Estado, Notas</code>.<br/>
          <em>El sistema emparejará automáticamente con el catálogo oficial o creará maquetas personalizadas.</em>
        </div>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
          <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; color: #38bdf8;" onclick="insertBulkImportSample()">
            📋 Cargar Plantilla de Ejemplo
          </button>
        </div>
      </div>

      <!-- File Picker -->
      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">Subir archivo (.csv, .tsv, .txt):</label>
        <input type="file" id="bulk-import-file-input" accept=".csv,.tsv,.txt" onchange="handleBulkImportFileUpload(event)" style="font-size: 0.82rem; color: #cbd5e1;" />
      </div>

      <!-- Paste Textarea -->
      <div>
        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.25rem;">O pega el contenido separado por comas, tabs o punto y coma:</label>
        <textarea id="bulk-import-textarea" class="auth-input" rows="5" style="font-family: monospace; font-size: 0.78rem; line-height: 1.4;" placeholder="Nombre, Marca, Escala, Grado, Estado&#10;RG Hi-Nu Gundam, Bandai Spirits, 1/144, RG, unbuilt&#10;MG Eclipse Gundam, Bandai Spirits, 1/100, MG, in_progress"></textarea>
      </div>

      <!-- Status / Preview Results Box -->
      <div id="bulk-import-preview-box" style="display: none; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem;">
        <div id="bulk-import-summary-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
          <span id="bulk-import-stat-badge" class="status-badge" style="background: rgba(34,197,94,0.15); color: #4ade80;"></span>
          <span id="bulk-import-matches-badge" style="font-size: 0.78rem; color: #38bdf8;"></span>
        </div>
        <div id="bulk-import-preview-table-container" style="max-height: 160px; overflow-y: auto; font-size: 0.75rem;"></div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
        <button type="button" class="filter-pill" onclick="closeBulkImportModal()">Cerrar</button>
        <button type="button" class="filter-pill" style="border-color: rgba(56,189,248,0.4); color: #38bdf8;" onclick="executeBulkImport(true)">
          👁️ Previsualizar
        </button>
        <button type="button" id="btn-bulk-import-confirm" class="btn-primary" style="background: #16a34a; border-color: #16a34a; padding: 0.5rem 1.25rem;" onclick="executeBulkImport(false)">
          📥 Importar a Mi Taller
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: Create Group Build -->
<div id="modal-create-group-build" class="custom-modal" onclick="closeCreateGroupBuildModal(event)">
  <div class="auth-box" style="max-width: 540px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeCreateGroupBuildModal()">&times;</span>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">+ Organizar Proyecto Grupal</h3>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
      Propón un tema colaborativo para que otros modelistas construyan maquetas y compartan avances en equipo.
    </p>
    <form onsubmit="handleCreateGroupBuildSubmit(event)">
      <div class="auth-input-group">
        <label class="auth-label">Título del Proyecto Grupal</label>
        <input type="text" id="cgb-title" class="auth-input" placeholder="ej. Batalla de A Baoa Qu UC 0079" required />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="auth-input-group">
          <label class="auth-label">Categoría</label>
          <select id="cgb-category" class="auth-input">
            <option value="all">Todas las Categorías</option>
            <option value="gunpla-mecha">Gunpla / Mecha</option>
            <option value="aviation">Aviación Histórica</option>
            <option value="military">Blindados Militares</option>
            <option value="automotive">Automotriz & Carreras</option>
            <option value="naval">Buques & Submarinos</option>
            <option value="scifi">Sci-Fi & Fantasía</option>
            <option value="diorama">Dioramas & Escenografía</option>
          </select>
        </div>
        <div class="auth-input-group">
          <label class="auth-label">Fecha Límite</label>
          <input type="date" id="cgb-end-date" class="auth-input" required />
        </div>
      </div>

      <div class="auth-input-group">
        <label class="auth-label">Descripción & Temática</label>
        <textarea id="cgb-desc" class="auth-input" style="height: 75px; resize: none;" placeholder="Describe la premisa del proyecto, escalas recomendadas, contexto histórico o de ficción..." required></textarea>
      </div>

      <div class="auth-input-group">
        <label class="auth-label">Reglas y Pautas (Una regla por línea)</label>
        <textarea id="cgb-rules" class="auth-input" style="height: 65px; resize: none;" placeholder="ej.&#10;Kits escala 1/144 HG o RG&#10;Pintura personalizada obligatoria&#10;Mínimo 2 pasos documentados"></textarea>
      </div>

      <div class="auth-input-group">
        <label class="auth-label">URL de Banner / Imagen Temática (Opcional)</label>
        <input type="url" id="cgb-banner-url" class="auth-input" placeholder="https://ejemplo.com/banner.jpg" />
      </div>

      <button type="submit" id="btn-submit-cgb" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; margin-top: 0.5rem;">
        Publicar Proyecto Grupal
      </button>
    </form>
  </div>
</div>

<!-- Modal: Join Group Build -->
<div id="modal-join-group-build" class="custom-modal" onclick="closeJoinGroupBuildModal(event)">
  <div class="auth-box" style="max-width: 480px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeJoinGroupBuildModal()">&times;</span>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">🤝 Unirme al Proyecto Grupal</h3>
    <p id="join-gb-title-text" style="font-size: 0.82rem; color: #38bdf8; margin-bottom: 1.25rem;">
      Inscribe tu bitácora de armado para documentar tu avance en equipo.
    </p>
    <form onsubmit="handleJoinGroupBuildSubmit(event)">
      <input type="hidden" id="join-gb-id" />
      <div class="auth-input-group">
        <label class="auth-label">Selecciona una de tus Bitácoras Activas</label>
        <select id="join-gb-build-select" class="auth-input" required>
          <option value="">Cargando tus bitácoras...</option>
        </select>
        <span style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem; display: block;">
          ¿No tienes una bitácora creada? Ve a <strong>Mi Taller</strong> y crea tu proyecto primero.
        </span>
      </div>

      <button type="submit" id="btn-submit-join-gb" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; margin-top: 0.5rem;">
        Confirmar Inscripción
      </button>
    </form>
  </div>
</div>

<!-- Modal: Barcode Scanner & Instant Stash Registration -->
<div id="modal-barcode-scanner" class="custom-modal" onclick="closeBarcodeScannerModal(event)">
  <div class="auth-box" style="max-width: 540px;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeBarcodeScannerModal()">&times;</span>
    
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
      <span style="font-size: 1.6rem;">📷</span>
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0;">Escanear Código de Barras (JAN / EAN)</h3>
        <p style="font-size: 0.82rem; color: #94a3b8; margin: 0.2rem 0 0;">Apunta la cámara a la caja de tu maqueta para registrarla en tu Stash</p>
      </div>
    </div>

    <!-- Scanner Viewport -->
    <div id="barcode-viewport-container" style="position: relative; width: 100%; height: 240px; background: #0f172a; border-radius: 8px; overflow: hidden; margin: 1rem 0 0.75rem; border: 2px solid #334155; display: flex; align-items: center; justify-content: center;">
      <video id="barcode-scanner-video" playsinline autoplay muted style="width: 100%; height: 100%; object-fit: cover;"></video>
      
      <!-- Targeting Reticle Overlay with laser scanline -->
      <div id="barcode-scanner-reticle" style="position: absolute; inset: 25px 40px; border: 2px dashed rgba(56, 189, 248, 0.7); border-radius: 10px; pointer-events: none; box-shadow: inset 0 0 15px rgba(56, 189, 248, 0.2); display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div id="barcode-laser-line" style="width: 100%; height: 2px; background: #ef4444; box-shadow: 0 0 8px #ef4444; position: absolute; top: 50%; transform: translateY(-50%); animation: laserSweep 2s ease-in-out infinite alternate;"></div>
      </div>

      <!-- Live Status Pill -->
      <div id="barcode-scanner-status" style="position: absolute; bottom: 12px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #38bdf8; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(56, 189, 248, 0.3); pointer-events: none;">
        Iniciando cámara...
      </div>
    </div>

    <!-- Camera Control Buttons -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 0.5rem;">
      <div style="font-size: 0.75rem; color: #64748b;">
        Soporta JAN-13, EAN-13, UPC-A, Code-128
      </div>
      <div style="display: flex; gap: 0.4rem;">
        <button type="button" id="btn-restart-scanner" class="filter-pill" onclick="restartBarcodeScannerCamera()" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;">
          🔄 Reiniciar Cámara
        </button>
      </div>
    </div>

    <!-- Manual Barcode Search Fallback -->
    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
      <label class="auth-label" style="margin-bottom: 0.35rem; font-size: 0.78rem;">¿Cámara no disponible? Ingresa el código manualmente:</label>
      <div style="display: flex; gap: 0.5rem;">
        <input type="text" id="barcode-manual-input" class="auth-input" placeholder="ej: 4573102619198 o 4950344611195" onkeydown="if(event.key==='Enter'){event.preventDefault();handleManualBarcodeSearch();}" />
        <button type="button" id="btn-search-barcode-manual" class="btn-primary" onclick="handleManualBarcodeSearch()" style="padding: 0.5rem 0.9rem; font-size: 0.82rem; white-space: nowrap;">
          🔍 Buscar
        </button>
      </div>
    </div>

    <!-- Scan Results & Stash Confirmation Container (Initially Hidden) -->
    <div id="barcode-result-card" style="display: none; background: #1e293b; border: 1px solid #38bdf8; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
      <!-- Populated via renderBarcodeResult() -->
    </div>

  </div>
</div>


`;
}
