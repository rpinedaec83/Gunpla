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

<!-- Modal: Interactive 3D / AR Viewer & Diorama Studio -->
<div id="modal-3d-viewer" class="custom-modal" onclick="closeKit3dViewerModal(event)">
  <div class="auth-box" style="max-width: 940px; width: 95%; max-height: 92vh; display: flex; flex-direction: column; padding: 1.25rem;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeKit3dViewerModal()">&times;</span>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 1.6rem;">📐</span>
        <div>
          <h3 id="diorama-modal-title" style="font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0;">Visor 3D & Diorama Studio</h3>
          <p id="diorama-modal-subtitle" style="font-size: 0.78rem; color: #38bdf8; margin: 0.15rem 0 0;">Cargando modelo a escala...</p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <select id="diorama-kit-select" class="auth-input" style="padding: 0.35rem 0.6rem; font-size: 0.78rem; max-width: 240px;" onchange="switchDioramaKit(this.value)">
          <option value="">Selecciona Maqueta...</option>
        </select>
        <button type="button" class="btn-primary" style="font-size: 0.75rem; padding: 0.35rem 0.7rem; background: linear-gradient(135deg, #0ea5e9, #6366f1); border: none;" onclick="triggerARViewer()">
          📱 AR Móvil
        </button>
      </div>
    </div>

    <!-- WebGL 3D Canvas Viewport -->
    <div id="diorama-canvas-container" style="position: relative; width: 100%; height: 420px; background: radial-gradient(circle at 50% 35%, #1e293b 0%, #030712 100%); border-radius: 8px; overflow: hidden; border: 1px solid #334155; user-select: none;">
      <canvas id="diorama-3d-canvas" style="width: 100%; height: 100%; display: block; cursor: grab;"></canvas>

      <!-- Viewport HUD Overlay: Top Left -->
      <div style="position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column; gap: 0.3rem; pointer-events: none;">
        <span id="diorama-scale-badge" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 4px; font-weight: 600;">
          Escala: 1/144 • 125mm
        </span>
        <span id="diorama-human-ref-badge" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 4px; font-weight: 600;">
          👤 Silueta Humana: 12.5mm
        </span>
      </div>

      <!-- Viewport HUD Overlay: Top Right -->
      <div style="position: absolute; top: 12px; right: 12px; display: flex; gap: 0.35rem;">
        <button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px);" onclick="resetDioramaCamera()">
          🎯 Centrar
        </button>
        <button type="button" id="diorama-turntable-btn" class="filter-pill" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px);" onclick="toggleDioramaTurntable()">
          🔄 360° Off
        </button>
        <button type="button" class="btn-primary" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;" onclick="captureDioramaRender()">
          📸 Captura HD
        </button>
      </div>

      <!-- Viewport HUD Overlay: Bottom Left Controls Hint -->
      <div style="position: absolute; bottom: 10px; left: 12px; font-size: 0.7rem; color: #64748b; background: rgba(15, 23, 42, 0.7); padding: 0.2rem 0.5rem; border-radius: 4px; pointer-events: none;">
        Arrastra para rotar • Rueda o pellizca para zoom • Clic derecho para mover
      </div>
    </div>

    <!-- Studio Controls Toolbar -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-top: 0.85rem; background: rgba(15, 23, 42, 0.6); padding: 0.75rem; border-radius: 8px; border: 1px solid #334155;">
      <!-- Control 1: Lighting Preset -->
      <div>
        <label class="auth-label" style="font-size: 0.72rem; margin-bottom: 0.25rem;">💡 Iluminación de Estudio</label>
        <select id="diorama-lighting-select" class="auth-input" style="padding: 0.35rem; font-size: 0.75rem;" onchange="setDioramaLighting(this.value)">
          <option value="studio" selected>Estudio Fotográfico (Neutro)</option>
          <option value="neon-scifi">Neón Sci-Fi Cyberpunk (Cyan/Magenta)</option>
          <option value="sunset">Atardecer Dorado (Golden Hour)</option>
          <option value="military-hangar">Hangar Militar (Luz Fría Cenital)</option>
          <option value="clay-primer">Gris Neutro (Inspección de Superficie)</option>
        </select>
      </div>

      <!-- Control 2: View / Render Mode -->
      <div>
        <label class="auth-label" style="font-size: 0.72rem; margin-bottom: 0.25rem;">🎨 Modo de Visualización</label>
        <select id="diorama-viewmode-select" class="auth-input" style="padding: 0.35rem; font-size: 0.75rem;" onchange="setDioramaViewMode(this.value)">
          <option value="shaded" selected>Sombreado Completo (Color & Brillo)</option>
          <option value="clay">Imprimación Gris Mate (Clay Primer)</option>
          <option value="wireframe">Malla Poligonal Wireframe (Holográfico)</option>
          <option value="matcap">Capa Metálica / Esmalte Brillante</option>
        </select>
      </div>

      <!-- Control 3: Camera Angles -->
      <div>
        <label class="auth-label" style="font-size: 0.72rem; margin-bottom: 0.25rem;">📐 Ángulo de Cámara</label>
        <div style="display: flex; gap: 0.3rem;">
          <button type="button" class="filter-pill" style="font-size: 0.7rem; padding: 0.35rem 0.5rem; flex: 1;" onclick="setDioramaCameraAngle('hero')">Hero (Boxart)</button>
          <button type="button" class="filter-pill" style="font-size: 0.7rem; padding: 0.35rem 0.5rem; flex: 1;" onclick="setDioramaCameraAngle('front')">Frontal</button>
          <button type="button" class="filter-pill" style="font-size: 0.7rem; padding: 0.35rem 0.5rem; flex: 1;" onclick="setDioramaCameraAngle('isometric')">Isométrico</button>
          <button type="button" class="filter-pill" style="font-size: 0.7rem; padding: 0.35rem 0.5rem; flex: 1;" onclick="setDioramaCameraAngle('top')">Cenital</button>
        </div>
      </div>

      <!-- Control 4: Staging Overlays -->
      <div>
        <label class="auth-label" style="font-size: 0.72rem; margin-bottom: 0.25rem;">📏 Elementos de Diorama</label>
        <div style="display: flex; gap: 0.75rem; align-items: center; padding-top: 0.2rem;">
          <label style="font-size: 0.75rem; color: #cbd5e1; display: inline-flex; align-items: center; gap: 0.3rem; cursor: pointer;">
            <input type="checkbox" id="diorama-toggle-grid" checked onchange="toggleDioramaGrid(this.checked)" /> Rejilla
          </label>
          <label style="font-size: 0.75rem; color: #cbd5e1; display: inline-flex; align-items: center; gap: 0.3rem; cursor: pointer;">
            <input type="checkbox" id="diorama-toggle-human" checked onchange="toggleDioramaHuman(this.checked)" /> Piloto (1:1)
          </label>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- Modal: Project Cost Accounting & Consumables Estimator (DT17) -->
<div id="modal-build-costs" class="custom-modal" onclick="closeBuildCostsModal(event)">
  <div class="custom-modal-content" onclick="event.stopPropagation()" style="max-width: 780px; width: 95%; max-height: 90vh; overflow-y: auto; background: #0f172a; border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 12px; padding: 1.5rem; box-shadow: 0 10px 40px rgba(0,0,0,0.7);">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.4rem;">💰</span>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0;">Control de Costos & Presupuesto</h3>
          <span id="costs-currency-badge" style="background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.35); font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">USD</span>
        </div>
        <p id="costs-build-title" style="font-size: 0.85rem; color: #38bdf8; margin: 0.25rem 0 0; font-weight: 600;">Cargando bitácora...</p>
      </div>
      <button type="button" class="filter-pill" onclick="closeBuildCostsModal()" style="font-size: 0.85rem; padding: 0.3rem 0.6rem;">✕</button>
    </div>

    <!-- Financial KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center;">
        <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Inversión Total</div>
        <div id="cost-kpi-total" style="font-size: 1.35rem; font-weight: 800; color: #facc15; margin-top: 0.2rem;">$0.00</div>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center;">
        <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Materiales & Insumos</div>
        <div id="cost-kpi-materials" style="font-size: 1.35rem; font-weight: 800; color: #38bdf8; margin-top: 0.2rem;">$0.00</div>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center;">
        <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Horas de Taller</div>
        <div id="cost-kpi-labor" style="font-size: 1.35rem; font-weight: 800; color: #c084fc; margin-top: 0.2rem;">0 hrs</div>
      </div>
      <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 0.75rem; text-align: center;">
        <div style="font-size: 0.72rem; color: #4ade80; text-transform: uppercase; font-weight: 700;">Cotización Encargo Sugerida</div>
        <div id="cost-kpi-commission" style="font-size: 1.35rem; font-weight: 800; color: #22c55e; margin-top: 0.2rem;">$0.00</div>
      </div>
    </div>

    <!-- Category Breakdown Pills -->
    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; margin-bottom: 1.25rem;">
      <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.5rem;">Desglose por Categoría:</div>
      <div id="cost-categories-pills" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <!-- Dynamically rendered -->
      </div>
    </div>

    <!-- Expenses Table -->
    <div style="margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
        <span>📋 Lista de Gastos Registrados</span>
        <span id="cost-expense-count-badge" style="font-size: 0.75rem; color: #94a3b8; font-weight: normal;">0 items</span>
      </h4>
      <div id="cost-expenses-table-container" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; max-height: 220px; overflow-y: auto;">
        <!-- Dynamically rendered table -->
      </div>
    </div>

    <!-- Add Expense Form -->
    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">
      <h4 style="font-size: 0.9rem; font-weight: 700; color: #facc15; margin-bottom: 0.75rem;">➕ Agregar Nuevo Gasto / Consumible</h4>
      <form id="form-add-build-expense" onsubmit="submitBuildExpense(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
        <input type="hidden" id="expense-build-id" value="">
        <div>
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">Categoría *</label>
          <select id="expense-category-select" required onchange="handleExpenseCategoryChange()" style="width: 100%; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.45rem; border-radius: 6px; font-size: 0.82rem;">
            <option value="kit">📦 Maqueta Base (Kit)</option>
            <option value="paint">🎨 Pintura / Imprimación / Barniz</option>
            <option value="consumable">🧪 Consumible (Thinner, Masilla, Lijas)</option>
            <option value="aftermarket">⚙️ Aftermarket / Photo-Etch / Resina</option>
            <option value="decal">🏷️ Calcas al Agua / Stencils</option>
            <option value="labor">⏱️ Mano de Obra / Horas de Taller</option>
            <option value="other">📦 Otro Insumo / Base Diorama</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">Concepto / Descripción *</label>
          <input type="text" id="expense-name-input" required placeholder="Ej: Tamiya XF-1 Flat Black o Photo-Etch" style="width: 100%; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.45rem; border-radius: 6px; font-size: 0.82rem;">
        </div>
        <div>
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">Monto *</label>
          <div style="display: flex; gap: 0.35rem;">
            <input type="number" id="expense-amount-input" step="0.01" min="0" required placeholder="0.00" style="flex: 1; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.45rem; border-radius: 6px; font-size: 0.82rem;">
            <select id="expense-currency-select" style="background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.45rem; border-radius: 6px; font-size: 0.82rem;">
              <option value="USD">USD ($)</option>
              <option value="PEN">PEN (S/)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
        <div id="expense-paint-fraction-group" style="display: none;">
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">Fracción de Frasco Consumida</label>
          <select id="expense-paint-fraction-select" style="width: 100%; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.45rem; border-radius: 6px; font-size: 0.82rem;">
            <option value="1.0">1.0 (Frasco Completo)</option>
            <option value="0.5">1/2 Frasco (~50%)</option>
            <option value="0.33">1/3 Frasco (~33%)</option>
            <option value="0.25">1/4 Frasco (~25%)</option>
            <option value="0.1">Gotas / Toque (~10%)</option>
          </select>
        </div>
        <div id="expense-labor-hours-group" style="display: none;">
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">Horas Dedicadas</label>
          <input type="number" id="expense-labor-hours-input" step="0.5" min="0" placeholder="Ej: 5.0" style="width: 100%; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.45rem; border-radius: 6px; font-size: 0.82rem;">
        </div>
        <div style="grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem;">
          <button type="submit" class="btn-primary" style="background: linear-gradient(135deg, #eab308, #ca8a04); border: none; font-size: 0.82rem; padding: 0.5rem 1rem; font-weight: 700; color: #000;">
            ➕ Registrar Gasto
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal: Custom Decals & Masking Stencils Studio (DT18) -->
<div id="modal-decal-studio" class="custom-modal" onclick="closeDecalStudioModal(event)">
  <div class="custom-modal-content" onclick="event.stopPropagation()" style="max-width: 960px; width: 95%; max-height: 92vh; overflow-y: auto; background: #0b1120; border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 12px; padding: 1.5rem; box-shadow: 0 10px 45px rgba(0,0,0,0.8);">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.4rem;">🏷️</span>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0;">Estudio de Calcas al Agua & Enmascarado (Decal Studio)</h3>
          <span style="background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.35); font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">Vectorial 100% Escala Real</span>
        </div>
        <p style="font-size: 0.8rem; color: #94a3b8; margin: 0.25rem 0 0;">Generación e impresión milimétrica para papel de calca transparente, film blanco y plantillas de corte.</p>
      </div>
      <button type="button" class="filter-pill" onclick="closeDecalStudioModal()" style="font-size: 0.85rem; padding: 0.3rem 0.6rem;">✕</button>
    </div>

    <!-- Toolbar / Settings Controls -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.65rem; background: rgba(15, 23, 42, 0.7); padding: 0.85rem; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 1rem;">
      <div>
        <label style="display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600;">📑 Plantilla Preset</label>
        <select id="decal-preset-select" onchange="handleDecalPresetChange(this.value)" style="width: 100%; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.4rem; border-radius: 6px; font-size: 0.78rem;">
          <option value="gunpla-efsf-caution" selected>E.F.S.F. Caution & Stencils (1/144)</option>
          <option value="gunpla-zeon-markings">Zeon Principality Markings (1/144)</option>
          <option value="military-tank-stencil">WWII Armor Turret Numbers (1/35)</option>
          <option value="aviation-jet-lowvis">Fighter Jet Low-Vis Warnings (1/48)</option>
          <option value="racing-motorsport-numbers">Motorsport Racing Roundels (1/24)</option>
        </select>
      </div>
      <div>
        <label style="display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600;">📏 Escala de Maqueta</label>
        <select id="decal-scale-select" onchange="handleDecalConfigChange()" style="width: 100%; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.4rem; border-radius: 6px; font-size: 0.78rem;">
          <option value="1/144" selected>1/144 (Gunpla HG/RG)</option>
          <option value="1/100">1/100 (Gunpla MG / Mecha)</option>
          <option value="1/60">1/60 (Perfect Grade)</option>
          <option value="1/35">1/35 (Militar / Tanques)</option>
          <option value="1/48">1/48 (Aviación / Cazas)</option>
          <option value="1/24">1/24 (Automotriz / Autos)</option>
        </select>
      </div>
      <div>
        <label style="display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600;">📄 Tamaño de Pliego</label>
        <select id="decal-size-select" onchange="handleDecalConfigChange()" style="width: 100%; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.4rem; border-radius: 6px; font-size: 0.78rem;">
          <option value="A5" selected>A5 (148 × 210 mm) - Estándar</option>
          <option value="A4">A4 (210 × 297 mm) - Pliego Completo</option>
          <option value="A6">A6 (105 × 148 mm) - Compacto</option>
        </select>
      </div>
      <div>
        <label style="display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600;">💧 Tipo de Papel Calca</label>
        <select id="decal-paper-select" onchange="handleDecalConfigChange()" style="width: 100%; background: #1e293b; border: 1px solid var(--border-color); color: #fff; padding: 0.4rem; border-radius: 6px; font-size: 0.78rem;">
          <option value="transparent" selected>Transparente (Para carrocería clara)</option>
          <option value="white_film">Film Blanco (Para carrocería oscura)</option>
        </select>
      </div>
    </div>

    <!-- Quick Add Elements Bar -->
    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center;">
      <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">Añadir al Pliego:</span>
      <button type="button" class="filter-pill" onclick="addDecalElementToStudio('warning_stencil')" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; border-color: rgba(239,68,68,0.4); color: #ef4444;">
        ⚠️ Advertencia Técnica
      </button>
      <button type="button" class="filter-pill" onclick="addDecalElementToStudio('unit_number')" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; border-color: rgba(250,204,21,0.4); color: #facc15;">
        🔢 Numeral Militar
      </button>
      <button type="button" class="filter-pill" onclick="addDecalElementToStudio('faction_emblem')" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; border-color: rgba(14,165,233,0.4); color: #38bdf8;">
        🛡️ Insignia / Escudo
      </button>
      <button type="button" class="filter-pill" onclick="addDecalElementToStudio('pilot_name')" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; border-color: rgba(192,132,252,0.4); color: #c084fc;">
        👤 Piloto / Rótulo
      </button>
      <button type="button" class="filter-pill" onclick="addDecalElementToStudio('kill_marks')" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; border-color: rgba(34,197,94,0.4); color: #4ade80;">
        ⭐ Marcas de Derribo
      </button>
    </div>

    <!-- Main Workspace Split: Preview & Item List -->
    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 1rem; align-items: start; margin-bottom: 1rem;">
      <!-- SVG Canvas Preview Container -->
      <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 420px; overflow: auto; position: relative;">
        <div style="position: absolute; top: 8px; left: 10px; font-size: 0.7rem; color: #64748b; background: rgba(15,23,42,0.8); padding: 0.15rem 0.45rem; border-radius: 4px;">
          Vista Previa Milimétrica (SVG Vectorial)
        </div>
        <div id="decal-sheet-svg-viewport" style="max-width: 100%; max-height: 460px; overflow: auto; display: flex; justify-content: center; align-items: center;">
          <!-- SVG rendered dynamically -->
        </div>
      </div>

      <!-- Elements List & Settings Drawer -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; max-height: 460px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: #fff; margin: 0;">Elementos en Pliego</h4>
          <span id="decal-elements-count-badge" style="font-size: 0.72rem; color: #38bdf8; font-weight: 600;">0 items</span>
        </div>
        <div id="decal-elements-editor-list" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; padding-right: 0.25rem;">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </div>

    <!-- Export & Print Action Footer -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.85rem; flex-wrap: wrap; gap: 0.75rem;">
      <div style="font-size: 0.78rem; color: #94a3b8;">
        💡 <strong>Recomendación de Impresión:</strong> Usa papel de calca al agua para impresora Inkjet/Láser y selecciona <em>"Escala 100%"</em> o <em>"Tamaño Real"</em> en el cuadro de diálogo.
      </div>
      <div style="display: flex; gap: 0.6rem;">
        <button type="button" id="btn-download-decal-svg" class="btn-primary" onclick="downloadDecalSvgFile()" style="font-size: 0.8rem; padding: 0.45rem 0.9rem; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none;">
          💾 Descargar SVG
        </button>
        <button type="button" id="btn-print-decal-sheet" class="btn-primary" onclick="printDecalSheetDirect()" style="font-size: 0.8rem; padding: 0.45rem 0.9rem; background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: 700;">
          🖨️ Imprimir Hoja (100%)
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: AI Workbench Smart Builder Assistant (DT19) -->
<div id="modal-ai-builder-assistant" class="custom-modal modal" style="display: none;">
  <div class="modal-content" style="max-width: 820px; width: 95%; max-height: 90vh; display: flex; flex-direction: column;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
      <div>
        <h2 style="font-size: 1.25rem; margin: 0; display: flex; align-items: center; gap: 0.5rem; color: #c084fc;">
          <span>🔍</span> Asistente Inteligente de Taller (Vision AI)
        </h2>
        <p style="font-size: 0.8rem; color: #94a3b8; margin: 0.2rem 0 0 0;">
          Inspección automatizada de grapas y control de calidad de corte (nub marks) con Google Gemini Vision.
        </p>
      </div>
      <button class="modal-close" onclick="closeAiAssistantModal()" style="background: none; border: none; font-size: 1.3rem; color: #94a3b8; cursor: pointer;">&times;</button>
    </div>

    <!-- Navigation Tabs: Runner vs Nub -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">
      <button type="button" id="tab-btn-ai-runner" class="filter-pill active" onclick="switchAiAssistantTab('runner')" style="font-size: 0.82rem; padding: 0.4rem 0.85rem;">
        📷 Inspección de Grapas (Runners)
      </button>
      <button type="button" id="tab-btn-ai-nub" class="filter-pill" onclick="switchAiAssistantTab('nub')" style="font-size: 0.82rem; padding: 0.4rem 0.85rem;">
        🔎 Calidad de Corte (Nub Inspector)
      </button>
    </div>

    <!-- Scrollable Body -->
    <div style="flex: 1; overflow-y: auto; padding-right: 0.25rem;">
      <!-- Tab 1: Runner Inspector -->
      <div id="ai-tab-runner-content">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <!-- Upload Box -->
          <div style="background: rgba(15, 23, 42, 0.6); border: 2px dashed rgba(168, 85, 247, 0.35); border-radius: 8px; padding: 1rem; text-align: center; position: relative;">
            <input type="file" id="ai-runner-file-input" accept="image/*" onchange="handleAiRunnerImageUpload(event)" style="display: none;" />
            <div id="ai-runner-upload-prompt" onclick="document.getElementById('ai-runner-file-input').click()" style="cursor: pointer; padding: 1.5rem 0.5rem;">
              <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📸</div>
              <div style="font-weight: 600; font-size: 0.88rem; color: #e2e8f0; margin-bottom: 0.25rem;">Haz clic para subir o capturar foto de la grapa</div>
              <div style="font-size: 0.75rem; color: #94a3b8;">Formatos JPG, PNG, WebP (Máx. 10MB)</div>
            </div>
            <img id="ai-runner-preview-img" src="" alt="Vista previa de grapa" style="display: none; max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 4px; margin: 0 auto;" />
          </div>

          <!-- Parameters -->
          <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem;">
            <div>
              <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 0.25rem;">Letra de Grapa (Opcional):</label>
              <input type="text" id="ai-runner-letter-input" placeholder="Ej. A, B, C, D1" maxlength="4" style="width: 100%; background: #0f172a; border: 1px solid var(--border-color); color: #fff; padding: 0.4rem; border-radius: 4px; font-size: 0.85rem;" />
            </div>
            <div>
              <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 0.25rem;">Maqueta / Kit (Opcional):</label>
              <input type="text" id="ai-runner-kit-input" placeholder="Ej. RG 1/144 Hi-Nu Gundam" style="width: 100%; background: #0f172a; border: 1px solid var(--border-color); color: #fff; padding: 0.4rem; border-radius: 4px; font-size: 0.85rem;" />
            </div>
            <button type="button" id="btn-run-ai-runner-analysis" class="btn-primary" onclick="submitRunnerInspection()" style="margin-top: auto; padding: 0.55rem; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; font-weight: 700;">
              ⚡ Analizar Grapa con Visión IA
            </button>
          </div>
        </div>

        <!-- Runner Results Viewport -->
        <div id="ai-runner-results" style="display: none; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span id="ai-runner-badge-letter" style="background: #7c3aed; color: #fff; font-weight: 900; font-size: 1.1rem; padding: 0.2rem 0.6rem; border-radius: 6px;">A</span>
              <span style="font-size: 0.9rem; font-weight: 700; color: #f8fafc;">Resultado de Conteo de Piezas</span>
            </div>
            <span id="ai-runner-engine-tag" style="font-size: 0.72rem; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">gemini-3.5-flash-lite</span>
          </div>

          <!-- KPIs -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.85rem;">
            <div style="background: rgba(30, 41, 59, 0.6); padding: 0.5rem; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Total Piezas</div>
              <div id="ai-runner-kpi-total" style="font-size: 1.25rem; font-weight: 800; color: #f8fafc;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 0.5rem; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.7rem; color: #eab308;">Restantes</div>
              <div id="ai-runner-kpi-remaining" style="font-size: 1.25rem; font-weight: 800; color: #facc15;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 0.5rem; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.7rem; color: #10b981;">Retiradas</div>
              <div id="ai-runner-kpi-removed" style="font-size: 1.25rem; font-weight: 800; color: #34d399;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 0.5rem; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.7rem; color: #38bdf8;">Avance</div>
              <div id="ai-runner-kpi-completion" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">0%</div>
            </div>
          </div>

          <!-- Parts List pills -->
          <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.35rem;">Piezas Detectadas:</div>
          <div id="ai-runner-parts-container" style="display: flex; flex-wrap: wrap; gap: 0.35rem; max-height: 120px; overflow-y: auto; margin-bottom: 0.85rem;"></div>

          <!-- Recommendations -->
          <div id="ai-runner-recommendations-box" style="background: rgba(30, 41, 59, 0.4); border-left: 3px solid #7c3aed; padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #cbd5e1;"></div>
        </div>
      </div>

      <!-- Tab 2: Nub Inspector -->
      <div id="ai-tab-nub-content" style="display: none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <!-- Upload Box -->
          <div style="background: rgba(15, 23, 42, 0.6); border: 2px dashed rgba(234, 179, 8, 0.35); border-radius: 8px; padding: 1rem; text-align: center; position: relative;">
            <input type="file" id="ai-nub-file-input" accept="image/*" onchange="handleAiNubImageUpload(event)" style="display: none;" />
            <div id="ai-nub-upload-prompt" onclick="document.getElementById('ai-nub-file-input').click()" style="cursor: pointer; padding: 1.5rem 0.5rem;">
              <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔬</div>
              <div style="font-weight: 600; font-size: 0.88rem; color: #e2e8f0; margin-bottom: 0.25rem;">Foto Macro o Acercamiento del Corte</div>
              <div style="font-size: 0.75rem; color: #94a3b8;">Enfoca de cerca la compuerta o saliente (Nub)</div>
            </div>
            <img id="ai-nub-preview-img" src="" alt="Vista previa de corte" style="display: none; max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 4px; margin: 0 auto;" />
          </div>

          <!-- Parameters -->
          <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem;">
            <div>
              <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 0.25rem;">Nombre / Número de Pieza:</label>
              <input type="text" id="ai-nub-part-input" placeholder="Ej. A12 - Armadura de Hombro" style="width: 100%; background: #0f172a; border: 1px solid var(--border-color); color: #fff; padding: 0.4rem; border-radius: 4px; font-size: 0.85rem;" />
            </div>
            <div>
              <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 0.25rem;">Tipo de Plástico:</label>
              <select id="ai-nub-plastic-select" style="width: 100%; background: #0f172a; border: 1px solid var(--border-color); color: #fff; padding: 0.4rem; border-radius: 4px; font-size: 0.85rem;">
                <option value="PS" selected>PS (Poliestireno Estándar)</option>
                <option value="KPS">KPS (Poliestireno de Alta Tenacidad / Frames)</option>
                <option value="ABS">ABS (Plástico Resistente)</option>
                <option value="PE">PE (Polietileno / Polycaps)</option>
                <option value="resin">Resina / Aftermarket</option>
              </select>
            </div>
            <button type="button" id="btn-run-ai-nub-analysis" class="btn-primary" onclick="submitNubInspection()" style="margin-top: auto; padding: 0.55rem; background: linear-gradient(135deg, #eab308, #ca8a04); border: none; font-weight: 700; color: #000;">
              🔬 Evaluar Calidad de Corte
            </button>
          </div>
        </div>

        <!-- Nub Results Viewport -->
        <div id="ai-nub-results" style="display: none; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div id="ai-nub-score-dial" style="font-size: 1.4rem; font-weight: 900; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #10b981; color: #0f172a;">85</div>
              <div>
                <div id="ai-nub-headline" style="font-size: 0.9rem; font-weight: 700; color: #f8fafc;">Diagnóstico de Corte</div>
                <div id="ai-nub-diagnosis-badges" style="display: flex; gap: 0.35rem; margin-top: 0.2rem;"></div>
              </div>
            </div>
            <span id="ai-nub-engine-tag" style="font-size: 0.72rem; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">gemini-3.5-flash-lite</span>
          </div>

          <!-- Detailed Analysis -->
          <p id="ai-nub-analysis-text" style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.4; margin: 0 0 0.85rem 0;"></p>

          <!-- Sanding Grit Sequence -->
          <div style="margin-bottom: 0.85rem; background: rgba(30, 41, 59, 0.5); padding: 0.6rem 0.8rem; border-radius: 6px;">
            <div style="font-size: 0.75rem; color: #facc15; font-weight: 600; margin-bottom: 0.35rem;">Secuencia de Lijas Recomendada:</div>
            <div id="ai-nub-grit-sequence" style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;"></div>
          </div>

          <!-- Step by step instructions -->
          <div style="font-size: 0.78rem; font-weight: 700; color: #94a3b8; margin-bottom: 0.35rem;">Pasos de Corrección Técnica:</div>
          <div id="ai-nub-steps-container" style="display: flex; flex-direction: column; gap: 0.45rem;"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal: DT20 Stash Insurance & Appraisal Report -->
<div id="modal-stash-insurance-report" class="custom-modal auth-modal-overlay" onclick="closeInsuranceReportModal(event)">
  <div class="auth-modal" style="max-width: 820px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; background: #0f172a; border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);" onclick="event.stopPropagation()">
    <!-- Header -->
    <div style="padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(15,23,42,0.95) 100%); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <span style="font-size: 1.5rem;">📋</span>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Ficha de Seguro y Tasación de Inventario</h3>
          <p style="font-size: 0.78rem; color: #facc15; margin: 0.15rem 0 0 0;">Valoración pericial de maquetas, vitrinas y piezas raras para cobertura de pólizas</p>
        </div>
      </div>
      <span style="font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1;" onclick="closeInsuranceReportModal()">&times;</span>
    </div>

    <!-- Body -->
    <div style="padding: 1.25rem 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.2rem;">
      <!-- KPI Stats Banner -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.85rem;">
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Inventario Valorable</div>
          <div id="ins-stat-total-kits" style="font-size: 1.4rem; font-weight: 800; color: #f8fafc; margin-top: 0.2rem;">0</div>
          <div id="ins-stat-counts-breakdown" style="font-size: 0.7rem; color: #64748b; margin-top: 0.1rem;">0 vitrina · 0 en caja</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Costo Adquisición Total</div>
          <div id="ins-stat-acquisition-cost" style="font-size: 1.4rem; font-weight: 800; color: #38bdf8; margin-top: 0.2rem;">$0.00</div>
          <div style="font-size: 0.7rem; color: #64748b; margin-top: 0.1rem;">Gasto histórico declarado</div>
        </div>
        <div style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 8px; padding: 0.85rem; text-align: center;">
          <div style="font-size: 0.72rem; color: #facc15; text-transform: uppercase; font-weight: 700;">Valor Tasado / Reposición</div>
          <div id="ins-stat-replacement-val" style="font-size: 1.45rem; font-weight: 900; color: #eab308; margin-top: 0.2rem;">$0.00</div>
          <div id="ins-stat-delta-ratio" style="font-size: 0.7rem; color: #4ade80; font-weight: 600; margin-top: 0.1rem;">+0.0% plusvalía / mano de obra</div>
        </div>
      </div>

      <!-- Config & Controls -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
          <div style="flex: 1; min-width: 220px;">
            <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.3rem;">Nro de Póliza / Aseguradora (Opcional)</label>
            <input id="ins-policy-input" type="text" placeholder="Ej: MAPFRE-COL-892144" style="width: 100%; padding: 0.45rem 0.75rem; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 0.82rem;" />
          </div>
          <div style="width: 120px;">
            <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.3rem;">Moneda</label>
            <select id="ins-currency-select" onchange="loadInsuranceValuationData()" style="width: 100%; padding: 0.45rem 0.75rem; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 0.82rem;">
              <option value="USD" selected>USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="MXN">MXN ($)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.6rem;">
          <label style="font-size: 0.75rem; color: #cbd5e1; display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
            <input id="ins-chk-built" type="checkbox" checked onchange="filterInsurancePreview()" />
            🏆 Vitrinas / Terminados (1.5x)
          </label>
          <label style="font-size: 0.75rem; color: #cbd5e1; display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
            <input id="ins-chk-unbuilt" type="checkbox" checked onchange="filterInsurancePreview()" />
            📦 En Caja / Stash (1.15x)
          </label>
          <label style="font-size: 0.75rem; color: #cbd5e1; display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
            <input id="ins-chk-wip" type="checkbox" checked onchange="filterInsurancePreview()" />
            🔧 En Proceso (1.25x)
          </label>
          <label style="font-size: 0.75rem; color: #cbd5e1; display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;">
            <input id="ins-chk-wishlist" type="checkbox" onchange="filterInsurancePreview()" />
            ⭐ Wishlist (Referencia)
          </label>
        </div>
      </div>

      <!-- Itemized Table Preview -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #f1f5f9;">Desglose Individual de Piezas</div>
          <span id="ins-preview-count-label" style="font-size: 0.72rem; color: #94a3b8;">0 elementos</span>
        </div>
        <div id="ins-table-container" style="max-height: 240px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; background: rgba(15, 23, 42, 0.4);">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left;">
            <thead>
              <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-weight: 600;">
                <th style="padding: 0.5rem 0.75rem;">Modelo</th>
                <th style="padding: 0.5rem 0.75rem;">Estado</th>
                <th style="padding: 0.5rem 0.75rem;">Escala</th>
                <th style="padding: 0.5rem 0.75rem; text-align: right;">Costo Compra</th>
                <th style="padding: 0.5rem 0.75rem; text-align: right;">Valor Tasado</th>
              </tr>
            </thead>
            <tbody id="ins-table-body">
              <tr>
                <td colspan="5" style="padding: 1.5rem; text-align: center; color: #64748b;">Cargando inventario...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.95); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <div style="display: flex; gap: 0.5rem;">
        <button id="btn-export-insurance-csv" type="button" class="filter-pill" onclick="downloadInsuranceCsv()" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; border-color: rgba(34, 197, 94, 0.4); color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;">
          📥 Descargar CSV / Excel
        </button>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button type="button" class="filter-pill" onclick="closeInsuranceReportModal()" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
          Cerrar
        </button>
        <button id="btn-print-insurance-pdf" type="button" class="btn-primary" onclick="openPrintableInsuranceReport()" style="font-size: 0.8rem; padding: 0.45rem 1rem; background: linear-gradient(135deg, #eab308, #ca8a04); border: none; font-weight: 700; color: #000; display: inline-flex; align-items: center; gap: 0.4rem;">
          🖨️ Generar Ficha Oficial / Imprimir PDF
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: DT21 Workshop Soundscapes & Procedural Audio Generator -->
<div id="modal-soundscapes" class="custom-modal auth-modal-overlay" onclick="closeSoundscapesModal(event)">
  <div class="auth-modal" style="max-width: 860px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; background: #0f172a; border: 1px solid rgba(45, 212, 191, 0.35); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);" onclick="event.stopPropagation()">
    <!-- Header -->
    <div style="padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(20, 184, 166, 0.18) 0%, rgba(15,23,42,0.95) 100%); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <span style="font-size: 1.6rem;">🎵</span>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Pistas de Sonido & Generador Ambiental de Taller</h3>
          <p style="font-size: 0.78rem; color: #2dd4bf; margin: 0.15rem 0 0 0;">Audio procedural sintetizado en navegador para concentración, aerografía y montaje (100% offline)</p>
        </div>
      </div>
      <span style="font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1;" onclick="closeSoundscapesModal()">&times;</span>
    </div>

    <!-- Body -->
    <div style="padding: 1.25rem 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem;">
      <!-- Presets Selection Cards -->
      <div>
        <div style="font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px;">Ambientes de Taller Disponibles</div>
        <div id="ws-presets-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
          <!-- Dynamically populated or rendered with presets -->
          <div class="ws-preset-card active" onclick="selectSoundscapePreset('lluvia-taller')" style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid #38bdf8; border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <span style="font-size: 1.4rem;">🌧️</span>
              <span style="font-size: 0.68rem; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600;">Calma & Aislamiento</span>
            </div>
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.88rem;">Lluvia en el Taller</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem; line-height: 1.3;">Chubasco suave sobre tejado y ventanas, ideal para corte de compuertas y lijado.</div>
          </div>

          <div class="ws-preset-card" onclick="selectSoundscapePreset('compresor-aerografo')" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <span style="font-size: 1.4rem;">💨</span>
              <span style="font-size: 0.68rem; color: #c084fc; background: rgba(192, 132, 252, 0.15); padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600;">Foco de Pintura</span>
            </div>
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.88rem;">Estudio de Aerografía</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem; line-height: 1.3;">Zumbido constante de compresor de diafragma y siseo de flujo de aire en cabina.</div>
          </div>

          <div class="ws-preset-card" onclick="selectSoundscapePreset('hangar-mecha')" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <span style="font-size: 1.4rem;">🤖</span>
              <span style="font-size: 0.68rem; color: #34d399; background: rgba(52, 211, 153, 0.15); padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600;">Inmersión Sci-Fi</span>
            </div>
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.88rem;">Hangar Sci-Fi Mecha</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem; line-height: 1.3;">Ambiente industrial futurista: resonancia de bahía, sistemas hidráulicos y ecos lejanos.</div>
          </div>

          <div class="ws-preset-card" onclick="selectSoundscapePreset('lo-fi-beats')" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <span style="font-size: 1.4rem;">🎧</span>
              <span style="font-size: 0.68rem; color: #fbbf24; background: rgba(251, 191, 36, 0.15); padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600;">Ritmo Relajante</span>
            </div>
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.88rem;">Lo-Fi Chillhop Taller</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem; line-height: 1.3;">Acordes cálidos Rhodes, crujido sutil de vinilo y pulsación suave de 72 BPM.</div>
          </div>

          <div class="ws-preset-card" onclick="selectSoundscapePreset('jardin-zen')" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <span style="font-size: 1.4rem;">🎋</span>
              <span style="font-size: 0.68rem; color: #2dd4bf; background: rgba(45, 212, 191, 0.15); padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600;">Concentración Pura</span>
            </div>
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.88rem;">Jardín Zen & Pincel</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem; line-height: 1.3;">Susurro de bambú, agua corriente y resonancias de cuenco para detalles finos.</div>
          </div>
        </div>
      </div>

      <!-- Live Layer Mixer -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px;">Mezclador de Capas Acústicas</div>
          <span id="ws-mixer-preset-tag" style="font-size: 0.72rem; color: #2dd4bf; font-weight: 600;">Lluvia en el Taller</span>
        </div>
        <div id="ws-layers-mixer-container" style="display: flex; flex-direction: column; gap: 0.85rem;">
          <!-- Dynamically populated per active preset -->
        </div>
      </div>

      <!-- Pomodoro & Session Timer Block -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px;">Temporizador de Sesión / Pomodoro</div>
          <div id="ws-modal-timer-digits" style="font-size: 1.5rem; font-weight: 900; color: #2dd4bf; font-family: monospace; letter-spacing: 1px;">25:00</div>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button id="ws-timer-mode-none" type="button" class="filter-pill" onclick="setSoundscapeTimerMode('none')" style="font-size: 0.75rem; padding: 0.35rem 0.7rem;">Sin Límite</button>
          <button id="ws-timer-mode-pomodoro-25" type="button" class="filter-pill active" onclick="setSoundscapeTimerMode('pomodoro-25')" style="font-size: 0.75rem; padding: 0.35rem 0.7rem; background: #0d9488; color: #fff;">Pomodoro (25m)</button>
          <button id="ws-timer-mode-deep-work-45" type="button" class="filter-pill" onclick="setSoundscapeTimerMode('deep-work-45')" style="font-size: 0.75rem; padding: 0.35rem 0.7rem;">Foco Pintura (45m)</button>
          <button id="ws-timer-mode-session-60" type="button" class="filter-pill" onclick="setSoundscapeTimerMode('session-60')" style="font-size: 0.75rem; padding: 0.35rem 0.7rem;">Sesión Maestra (60m)</button>
          <button type="button" class="filter-pill" onclick="resetSoundscapeTimer()" style="font-size: 0.75rem; padding: 0.35rem 0.6rem; color: #94a3b8; margin-left: auto;">↺ Reiniciar</button>
        </div>
      </div>
    </div>

    <!-- Footer Controls -->
    <div style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.95); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 0.78rem; color: #94a3b8;">Volumen Maestro:</span>
        <input id="ws-modal-master-volume" type="range" min="0" max="100" value="70" oninput="setSoundscapeMasterVolume(this.value)" style="width: 110px; accent-color: #14b8a6; cursor: pointer;" />
        <span id="ws-modal-volume-val" style="font-size: 0.78rem; color: #f1f5f9; font-family: monospace; min-width: 32px;">70%</span>
      </div>

      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button type="button" class="filter-pill" onclick="closeSoundscapesModal()" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
          Cerrar
        </button>
        <button id="btn-soundscape-modal-toggle" type="button" class="btn-primary" onclick="toggleSoundscapePlay()" style="font-size: 0.82rem; padding: 0.5rem 1.15rem; background: linear-gradient(135deg, #14b8a6, #0d9488); border: none; font-weight: 700; color: #000; display: inline-flex; align-items: center; gap: 0.4rem;">
          <span id="ws-modal-toggle-icon">▶</span>
          <span id="ws-modal-toggle-text">Reproducir Ambiente</span>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: DT22 Airbrush PSI & Thinner Ratio Calculator -->
<div id="modal-airbrush-calculator" class="custom-modal auth-modal-overlay" onclick="closeAirbrushCalculatorModal(event)">
  <div class="auth-modal" style="max-width: 880px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; background: #0f172a; border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);" onclick="event.stopPropagation()">
    <!-- Header -->
    <div style="padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(249, 115, 22, 0.18) 0%, rgba(15,23,42,0.95) 100%); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <span style="font-size: 1.6rem;">🎨</span>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Calculadora de Dilución & Presión de Aerógrafo</h3>
          <p style="font-size: 0.78rem; color: #fb923c; margin: 0.15rem 0 0 0;">Relaciones exactas pintura:diluyente, aditivos y PSI/Bar según química y técnica</p>
        </div>
      </div>
      <span style="font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1;" onclick="closeAirbrushCalculatorModal()">&times;</span>
    </div>

    <!-- Body (Two Columns) -->
    <div style="padding: 1.25rem 1.5rem; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
      <!-- Left Column: Input Form -->
      <div style="display: flex; flex-direction: column; gap: 1.1rem;">
        <!-- 1. Paint Medium -->
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.45rem; text-transform: uppercase;">
            1. Química de la Pintura
          </label>
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; cursor: pointer; font-size: 0.8rem; color: #f1f5f9;">
              <input type="radio" name="airbrush-medium" value="lacquer" checked onchange="runAirbrushCalculation()" />
              <span><strong>Laca Acrílica</strong> (Mr. Color, Gaia Notes, SMS, Tamiya LP)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; cursor: pointer; font-size: 0.8rem; color: #f1f5f9;">
              <input type="radio" name="airbrush-medium" value="acrylic-alcohol" onchange="runAirbrushCalculation()" />
              <span><strong>Acrílico Alcohol</strong> (Tamiya X/XF, Aqueous Hobby Color)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; cursor: pointer; font-size: 0.8rem; color: #f1f5f9;">
              <input type="radio" name="airbrush-medium" value="acrylic-water" onchange="runAirbrushCalculation()" />
              <span><strong>Acrílico Vinílico Agua</strong> (Vallejo, AK 3Gen, Ammo Mig)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; cursor: pointer; font-size: 0.8rem; color: #f1f5f9;">
              <input type="radio" name="airbrush-medium" value="enamel" onchange="runAirbrushCalculation()" />
              <span><strong>Esmalte / Enamel</strong> (Tamiya Enamel, Humbrol)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; cursor: pointer; font-size: 0.8rem; color: #f1f5f9;">
              <input type="radio" name="airbrush-medium" value="polyurethane-primer" onchange="runAirbrushCalculation()" />
              <span><strong>Imprimante PU / 2K Surfacer</strong> (Vallejo Primer, Stynylrez)</span>
            </label>
          </div>
        </div>

        <!-- 2. Needle Size -->
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.45rem; text-transform: uppercase;">
            2. Diámetro de Boquilla / Aguja
          </label>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <button id="btn-needle-015" type="button" class="filter-pill" onclick="setAirbrushNeedle(0.15)" style="font-size: 0.78rem; padding: 0.35rem 0.7rem;">0.15 mm</button>
            <button id="btn-needle-02" type="button" class="filter-pill" onclick="setAirbrushNeedle(0.2)" style="font-size: 0.78rem; padding: 0.35rem 0.7rem;">0.2 mm</button>
            <button id="btn-needle-03" type="button" class="filter-pill active" onclick="setAirbrushNeedle(0.3)" style="font-size: 0.78rem; padding: 0.35rem 0.7rem; background: #ea580c; color: #fff;">0.3 mm (Estándar)</button>
            <button id="btn-needle-04" type="button" class="filter-pill" onclick="setAirbrushNeedle(0.4)" style="font-size: 0.78rem; padding: 0.35rem 0.7rem;">0.4 mm</button>
            <button id="btn-needle-05" type="button" class="filter-pill" onclick="setAirbrushNeedle(0.5)" style="font-size: 0.78rem; padding: 0.35rem 0.7rem;">0.5 mm</button>
          </div>
        </div>

        <!-- 3. Application Technique -->
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem; text-transform: uppercase;">
            3. Técnica de Aplicación
          </label>
          <select id="airbrush-technique-select" onchange="runAirbrushCalculation()" style="width: 100%; padding: 0.5rem 0.75rem; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 0.82rem;">
            <option value="base-coat" selected>Capa Base Uniforme & Opaca</option>
            <option value="detail-shading">Post-sombreado Fino & Trazos de Detalle</option>
            <option value="primer-surfacer">Imprimación & Surfacer de Nivelación</option>
            <option value="gloss-clear">Barniz Brillante / Capa Húmeda Espejo</option>
            <option value="candy-metallic">Efecto Candy & Metálicos Pulidos</option>
          </select>
        </div>

        <!-- 4. Paint Volume -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <label style="font-size: 0.78rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">
              4. Cantidad en Copa
            </label>
            <span id="airbrush-paint-drops-val" style="font-size: 0.8rem; color: #fb923c; font-family: monospace; font-weight: 700;">10 gotas (~0.5 ml)</span>
          </div>
          <input id="airbrush-paint-drops-slider" type="range" min="2" max="30" value="10" oninput="updateAirbrushPaintVolume(this.value)" style="width: 100%; height: 5px; accent-color: #ea580c; cursor: pointer;" />
        </div>

        <!-- 5. Climate Conditions (Collapsible/Optional) -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.75rem;">
          <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin-bottom: 0.4rem;">Condiciones de Taller (Opcional):</div>
          <div style="display: flex; gap: 0.85rem;">
            <div style="flex: 1;">
              <span style="font-size: 0.7rem; color: #64748b;">Temp:</span>
              <input id="airbrush-temp-input" type="number" value="22" min="10" max="42" onchange="runAirbrushCalculation()" style="width: 100%; padding: 0.3rem 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.78rem;" />
            </div>
            <div style="flex: 1;">
              <span style="font-size: 0.7rem; color: #64748b;">Humedad %:</span>
              <input id="airbrush-humidity-input" type="number" value="55" min="20" max="95" onchange="runAirbrushCalculation()" style="width: 100%; padding: 0.3rem 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.78rem;" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Results & Diagnostic Output -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <!-- Ratio & Pressure Hero Card -->
        <div style="background: linear-gradient(135deg, rgba(234, 88, 12, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%); border: 1.5px solid rgba(249, 115, 22, 0.4); border-radius: 10px; padding: 1.2rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <div>
              <div style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Relación Óptima Pintura : Diluyente</div>
              <div id="airbrush-ratio-badge" style="font-size: 2rem; font-weight: 900; color: #fb923c; line-height: 1.1; margin-top: 0.2rem;">1 : 1.5</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Presión de Compresor</div>
              <div id="airbrush-pressure-badge" style="font-size: 1.35rem; font-weight: 800; color: #f1f5f9; line-height: 1.1; margin-top: 0.2rem;">16 - 20 PSI</div>
              <div id="airbrush-bar-badge" style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">(1.1 - 1.4 Bar)</div>
            </div>
          </div>

          <!-- Recipe Drops -->
          <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.65rem;">
            <div style="font-size: 0.72rem; color: #fb923c; font-weight: 700; margin-bottom: 0.35rem; text-transform: uppercase;">Receta en la Copa del Aerógrafo:</div>
            <div id="airbrush-recipe-drops" style="font-size: 0.84rem; color: #f8fafc; font-weight: 600; line-height: 1.4;">
              10 gotas Pintura + 15 gotas Diluyente
            </div>
            <div id="airbrush-thinner-name" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.25rem;">
              Diluyente: Mr. Color Leveling Thinner
            </div>
          </div>

          <!-- Viscosity Analogy -->
          <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.35; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.5rem;">
            <strong>Consistencia Visual:</strong> <span id="airbrush-viscosity-text">Consistencia fluida como leche descremada; forma una película continua sin acumulación.</span>
          </div>
        </div>

        <!-- Tips & Distance -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">Distancia Recomendada:</span>
            <span id="airbrush-distance-text" style="font-size: 0.8rem; color: #38bdf8; font-weight: 700;">6 - 10 cm</span>
          </div>
          <div id="airbrush-tips-container" style="display: flex; flex-direction: column; gap: 0.35rem;">
            <!-- Injected tips -->
          </div>
        </div>

        <!-- Troubleshooting Accordion -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem;">
          <div style="font-size: 0.75rem; color: #facc15; font-weight: 700; margin-bottom: 0.45rem; text-transform: uppercase;">
            ⚠️ Diagnóstico Rápido de Errores de Aplicación:
          </div>
          <div id="airbrush-troubleshooting-list" style="max-height: 140px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.75rem;">
            <!-- Injected troubleshooting items -->
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.95); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <button id="btn-copy-airbrush-recipe" type="button" class="filter-pill" onclick="copyAirbrushRecipeToClipboard()" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; border-color: rgba(249, 115, 22, 0.4); color: #fb923c; display: inline-flex; align-items: center; gap: 0.35rem;">
        📋 Copiar Receta de Mezcla
      </button>
      <button type="button" class="btn-primary" onclick="closeAirbrushCalculatorModal()" style="font-size: 0.8rem; padding: 0.45rem 1rem;">
        Entendido / Listo
      </button>
    </div>
  </div>
</div>

<!-- Modal: DT23 Parts Breakdown & Assembly Subassembly Cards -->
<div id="modal-subassemblies-breakdown" class="custom-modal auth-modal-overlay" onclick="closeSubassembliesModal(event)">
  <div class="auth-modal" style="max-width: 960px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; background: #0f172a; border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);" onclick="event.stopPropagation()">
    <!-- Header -->
    <div style="padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(15,23,42,0.95) 100%); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <span style="font-size: 1.6rem;">📋</span>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Fichas de Despiece & Subensambles</h3>
          <p style="font-size: 0.78rem; color: #a5b4fc; margin: 0.15rem 0 0 0;">Control anatómico por bloques de armado, seguimiento de fases y fichas de bandeja imprimibles</p>
        </div>
      </div>
      <span style="font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1;" onclick="closeSubassembliesModal()">&times;</span>
    </div>

    <!-- Toolbar: Project Selector & Actions -->
    <div style="padding: 0.85rem 1.5rem; background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 280px;">
        <label for="subassembly-build-select" style="font-size: 0.75rem; color: #cbd5e1; font-weight: 700; text-transform: uppercase;">Proyecto:</label>
        <select id="subassembly-build-select" onchange="onSubassemblyBuildSelectChange()" style="flex: 1; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 0.8rem;">
          <option value="">Cargando bitácoras...</option>
        </select>
      </div>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button id="btn-toggle-add-subassembly" type="button" class="filter-pill" onclick="toggleAddSubassemblyDrawer()" style="font-size: 0.78rem; padding: 0.4rem 0.75rem; border-color: rgba(99, 102, 241, 0.4); color: #818cf8;">
          + Nuevo Bloque
        </button>
        <button id="btn-regenerate-subassemblies" type="button" class="filter-pill" onclick="regenerateDefaultSubassemblies()" style="font-size: 0.78rem; padding: 0.4rem 0.75rem; border-color: rgba(148, 163, 184, 0.3); color: #cbd5e1;">
          🔄 Plantilla Automática
        </button>
        <button id="btn-print-subassemblies" type="button" class="btn-primary" onclick="printSubassemblyWorksheet()" style="font-size: 0.78rem; padding: 0.4rem 0.85rem; background: #4f46e5; border-color: #4f46e5;">
          🖨️ Fichas A4 Bandeja
        </button>
      </div>
    </div>

    <!-- KPI Summary Bar -->
    <div style="padding: 0.75rem 1.5rem; background: rgba(99, 102, 241, 0.08); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <div style="text-align: center;">
        <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Subensambles</div>
        <div id="sub-stat-total-cards" style="font-size: 1.25rem; font-weight: 800; color: #f1f5f9;">0</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Piezas Totales Est.</div>
        <div id="sub-stat-total-parts" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">~0</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Progreso General</div>
        <div id="sub-stat-overall-pct" style="font-size: 1.25rem; font-weight: 800; color: #4ade80;">0%</div>
      </div>
      <!-- Phase Progress Pills -->
      <div style="display: flex; gap: 0.35rem; align-items: center;">
        <span id="sub-pill-cut" class="filter-pill" style="font-size: 0.68rem; padding: 0.2rem 0.5rem;">Cortado: 0%</span>
        <span id="sub-pill-cleaned" class="filter-pill" style="font-size: 0.68rem; padding: 0.2rem 0.5rem;">Lijado: 0%</span>
        <span id="sub-pill-primed" class="filter-pill" style="font-size: 0.68rem; padding: 0.2rem 0.5rem;">Imprimado: 0%</span>
        <span id="sub-pill-painted" class="filter-pill" style="font-size: 0.68rem; padding: 0.2rem 0.5rem;">Pintado: 0%</span>
        <span id="sub-pill-topcoated" class="filter-pill" style="font-size: 0.68rem; padding: 0.2rem 0.5rem;">Barniz: 0%</span>
      </div>
    </div>

    <!-- Drawer: Add Subassembly Form (collapsible) -->
    <div id="sub-add-form-drawer" style="display: none; padding: 1rem 1.5rem; background: #131d36; border-bottom: 1px solid rgba(99, 102, 241, 0.3);">
      <div style="font-size: 0.8rem; font-weight: 700; color: #818cf8; margin-bottom: 0.6rem; text-transform: uppercase;">
        + Agregar Nuevo Bloque / Subensamble
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem; margin-bottom: 0.6rem;">
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8;">Nombre del Subensamble:</label>
          <input id="sub-input-name" type="text" placeholder="Ej: Hombreras & Escudos" style="width: 100%; padding: 0.35rem 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.78rem;" />
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8;">Tipo / Anatomía:</label>
          <select id="sub-input-type" style="width: 100%; padding: 0.35rem 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.78rem;">
            <option value="head">Cabeza (Head Unit)</option>
            <option value="torso">Torso / Pecho</option>
            <option value="arms">Brazos / Extremidades Sup.</option>
            <option value="waist">Cintura / Faldones</option>
            <option value="legs">Piernas / Pies</option>
            <option value="backpack">Mochila / Propulsores</option>
            <option value="weapons">Armamento & Escudo</option>
            <option value="cockpit">Cabina / Interior</option>
            <option value="chassis">Chasis / Casco / Orugas</option>
            <option value="engine">Motor / Transmisión</option>
            <option value="wings">Alas / Superficies</option>
            <option value="accessories">Accesorios / Herramientas</option>
            <option value="custom" selected>Personalizado</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8;">Grapas / Runners (separados por coma):</label>
          <input id="sub-input-runners" type="text" placeholder="A, B, C1, PC" style="width: 100%; padding: 0.35rem 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.78rem;" />
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8;">Piezas Estimadas:</label>
          <input id="sub-input-parts" type="number" min="1" max="500" value="15" style="width: 100%; padding: 0.35rem 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.78rem;" />
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.6rem;">
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8;">Notas de Modificación (Scribing, masilla, fotograbado):</label>
          <input id="sub-input-notes" type="text" placeholder="Ej: Panel lines 0.15mm en hombreras" style="width: 100%; padding: 0.35rem 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.78rem;" />
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8;">Receta de Color / Pinturas:</label>
          <input id="sub-input-colors" type="text" placeholder="Ej: Mr. Color C65 Azul + C1 Blanco" style="width: 100%; padding: 0.35rem 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.78rem;" />
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
        <button type="button" class="filter-pill" onclick="toggleAddSubassemblyDrawer()" style="font-size: 0.75rem;">Cancelar</button>
        <button id="btn-save-subassembly" type="button" class="btn-primary" onclick="submitNewSubassembly()" style="font-size: 0.75rem; padding: 0.35rem 0.85rem; background: #4f46e5;">Guardar Subensamble</button>
      </div>
    </div>

    <!-- Cards Body Container -->
    <div id="subassemblies-cards-container" style="padding: 1.25rem 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.85rem; min-height: 250px;">
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 2rem;">Selecciona una bitácora para gestionar sus fichas de despiece...</p>
    </div>

    <!-- Footer Actions -->
    <div style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.95); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <div style="font-size: 0.75rem; color: #94a3b8;">
        💡 Consejo de modelista: Las fichas se sincronizan con las bandejas físicas para mantener organizadas las piezas por fase de pintura.
      </div>
      <button type="button" class="btn-primary" onclick="closeSubassembliesModal()" style="font-size: 0.8rem; padding: 0.45rem 1rem;">
        Cerrar
      </button>
    </div>
  </div>
</div>

<!-- Modal: Workbench Tools & Blade Wear Tracker (DT24) -->
<div id="modal-workbench-tools" class="custom-modal" onclick="closeToolsInventoryModal(event)" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center; padding: 1rem;">
  <div onclick="event.stopPropagation()" style="background: #0b1329; border: 1px solid #1e293b; border-radius: 12px; width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
    <!-- Header -->
    <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.95);">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 1.4rem;">✂️</span>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Gestión de Herramientas & Cuchillas</h3>
          <p style="font-size: 0.75rem; color: #94a3b8; margin: 0;">Control de cortes y alerta de cambio de filo para evitar estrés en el plástico</p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button id="btn-toggle-tool-drawer" type="button" class="btn-primary" onclick="toggleAddToolDrawer()" style="font-size: 0.78rem; padding: 0.4rem 0.85rem; background: #eab308; color: #000; font-weight: 600; border: none;">
          + Nueva Herramienta
        </button>
        <span class="auth-close" onclick="closeToolsInventoryModal()" style="font-size: 1.5rem; cursor: pointer; color: #94a3b8; line-height: 1;">&times;</span>
      </div>
    </div>

    <!-- Add Tool Form Drawer (Collapsible) -->
    <div id="tool-add-form-drawer" style="display: none; background: #0f172a; padding: 1rem 1.5rem; border-bottom: 1px solid #334155;">
      <h4 style="font-size: 0.88rem; font-weight: 600; color: #facc15; margin: 0 0 0.75rem 0;">Registrar Herramienta en Taller</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">Nombre de Herramienta *</label>
          <input id="tool-input-name" type="text" placeholder="Ej: GodHand Ultimate Nipper SPN-120" style="width: 100%; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.8rem;" />
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">Marca</label>
          <input id="tool-input-brand" type="text" placeholder="Ej: GodHand, Olfa, Tamiya, BMC" style="width: 100%; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.8rem;" />
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">Categoría *</label>
          <select id="tool-input-category" style="width: 100%; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.8rem;">
            <option value="nippers">✂️ Alicates de Corte (Nippers)</option>
            <option value="knives">🗡️ Cuchilla de Precisión / Bisturí</option>
            <option value="chisels">📐 Cincel de Paneles (Scribing Chisel)</option>
            <option value="abrasives">🪨 Abrasivos / Limas Nanoglass</option>
            <option value="airbrush">🎨 Aerógrafo</option>
            <option value="rotary-drill">⚙️ Mototool / Taladro Manual</option>
            <option value="general">🛠️ Otra Herramienta</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">Modelo / Especificación</label>
          <input id="tool-input-model" type="text" placeholder="Ej: Filo único 0.15mm / AK-4" style="width: 100%; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.8rem;" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1.2rem;">
          <input id="tool-input-track-wear" type="checkbox" checked style="accent-color: #eab308; cursor: pointer; width: 16px; height: 16px;" />
          <label for="tool-input-track-wear" style="font-size: 0.75rem; color: #cbd5e1; cursor: pointer;">Monitorear Desgaste de Filo</label>
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">Cortes Máx. Recomendados</label>
          <input id="tool-input-max-cuts" type="number" min="50" max="5000" value="500" style="width: 100%; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.8rem;" />
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">SKU Cuchilla / Repuesto</label>
          <input id="tool-input-blade-sku" type="text" placeholder="Ej: Olfa KB-4/30 / Sab 0.2mm" style="width: 100%; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.8rem;" />
        </div>
        <div>
          <label style="display: block; font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">Cuchillas en Stock de Repuesto</label>
          <input id="tool-input-spare-blades" type="number" min="0" max="200" value="5" style="width: 100%; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.8rem;" />
        </div>
      </div>

      <div style="margin-bottom: 0.75rem;">
        <label style="display: block; font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">Notas de Uso y Mantenimiento</label>
        <input id="tool-input-notes" type="text" placeholder="Ej: Aceitar articulación periódicamente con aceite mineral. Solo cortar PS suave." style="width: 100%; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 0.8rem;" />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
        <button type="button" class="filter-pill" onclick="toggleAddToolDrawer()" style="font-size: 0.75rem;">Cancelar</button>
        <button id="btn-save-workbench-tool" type="button" class="btn-primary" onclick="submitNewWorkbenchTool()" style="font-size: 0.75rem; padding: 0.35rem 0.85rem; background: #eab308; color: #000; font-weight: 600; border: none;">Guardar Herramienta</button>
      </div>
    </div>

    <!-- Tools Modal Content Body -->
    <div id="tool-modal-cards-container" style="padding: 1.25rem 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.85rem; min-height: 250px;">
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 2rem;">Cargando inventario de herramientas...</p>
    </div>

    <!-- Footer Actions -->
    <div style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.95); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <div style="font-size: 0.75rem; color: #94a3b8;">
        Regla de oro del modelista: Nunca fuerces un alicate ni uses una cuchilla desafilada en plasticos transparentes.
      </div>
      <button type="button" class="btn-primary" onclick="closeToolsInventoryModal()" style="font-size: 0.8rem; padding: 0.45rem 1rem;">
        Cerrar
      </button>
    </div>
  </div>
</div>

<!-- Modal Lector de Articulo de Noticias (Landing Page) -->
<div id="modal-landing-article" class="custom-modal" onclick="closeLandingArticleModal(event)">
  <div class="auth-box" style="max-width: 680px; width: 90%; background: #0f172a; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeLandingArticleModal()" style="position: absolute; top: 1rem; right: 1.25rem; font-size: 1.5rem; color: #94a3b8; cursor: pointer;">&times;</span>
    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.85rem;">
      <span id="article-modal-tag" class="landing-news-tag" style="background: rgba(239, 68, 68, 0.2); color: #f87171; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 4px; text-transform: uppercase;">Noticia</span>
      <span id="article-modal-meta" style="font-size: 0.75rem; color: #64748b;">24 Oct 2026</span>
    </div>
    <h2 id="article-modal-title" style="font-size: 1.35rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; line-height: 1.35; font-family: 'Chakra Petch', sans-serif;">
      Titulo del Articulo
    </h2>
    <div id="article-modal-content" style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.7; margin-bottom: 1.75rem; max-height: 380px; overflow-y: auto; padding-right: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem;">
      Cargando contenido...
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.2rem; flex-wrap: wrap; gap: 0.75rem;">
      <button type="button" class="filter-pill" onclick="closeLandingArticleModal()" style="font-size: 0.82rem; padding: 0.45rem 1rem;">
        Cerrar
      </button>
      <button type="button" class="btn-primary" onclick="closeLandingArticleModal(); enterWorkshop();" style="font-size: 0.85rem; padding: 0.5rem 1.2rem; background: linear-gradient(135deg, var(--primary), var(--accent));">
        <span>Ir a mi Taller</span>
        <span>--></span>
      </button>
    </div>
  </div>
</div>

<!-- Modal Administracion: Vincular / Editar Tienda de Confianza -->
<div id="modal-admin-link-shop" class="custom-modal" onclick="closeAdminShopModal(event)">
  <div class="auth-box" style="max-width: 520px; width: 90%; background: #0f172a; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeAdminShopModal()" style="position: absolute; top: 1rem; right: 1.25rem; font-size: 1.5rem; color: #94a3b8; cursor: pointer;">&times;</span>
    <h2 id="admin-shop-modal-title" style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem;">
      🏪 Vincular Tienda de Confianza
    </h2>
    <form onsubmit="submitTenantShopLink(event)">
      <input type="hidden" id="admin-shop-edit-mode" value="create">
      <div id="admin-shop-select-container" style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Seleccionar Tienda del Catálogo Maestro *
        </label>
        <select id="admin-shop-id-select" class="auth-input" style="width: 100%;" required>
          <option value="">Cargando catálogo maestro...</option>
        </select>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Cupón de Descuento Exclusivo (Opcional)
        </label>
        <input type="text" id="admin-shop-discount-code" class="auth-input" style="width: 100%; text-transform: uppercase;" placeholder="Ej. GUNPLA10 o PLAMO7">
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Insignia / Distintivo de la Comunidad (Opcional)
        </label>
        <input type="text" id="admin-shop-partner-badge" class="auth-input" style="width: 100%;" placeholder="Ej. ⭐ Tienda Oficial de Confianza">
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Notas del Convenio Comercial / Beneficios
        </label>
        <textarea id="admin-shop-notes" class="auth-input" style="width: 100%; min-height: 60px;" placeholder="Detalles de acuerdos, contacto directo o regalos para miembros..."></textarea>
      </div>
      <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <input type="checkbox" id="admin-shop-active" checked style="accent-color: var(--accent);">
        <label for="admin-shop-active" style="font-size: 0.85rem; color: #cbd5e1; cursor: pointer;">
          Habilitar como Tienda Activa en la Comunidad
        </label>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="filter-pill" onclick="closeAdminShopModal()" style="font-size: 0.82rem; padding: 0.45rem 1rem;">
          Cancelar
        </button>
        <button type="submit" id="btn-submit-admin-shop" class="btn-primary" style="font-size: 0.85rem; padding: 0.5rem 1.25rem;">
          Guardar Tienda
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Modal Administracion: Redactar / Editar Noticia de Comunidad -->
<div id="modal-admin-news" class="custom-modal" onclick="closeAdminNewsModal(event)">
  <div class="auth-box" style="max-width: 620px; width: 90%; background: #0f172a; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeAdminNewsModal()" style="position: absolute; top: 1rem; right: 1.25rem; font-size: 1.5rem; color: #94a3b8; cursor: pointer;">&times;</span>
    <h2 id="admin-news-modal-title" style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem;">
      📰 Redactar Noticia de Comunidad
    </h2>
    <form onsubmit="submitTenantNews(event)">
      <input type="hidden" id="admin-news-id" value="">
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Título de la Noticia / Artículo *
        </label>
        <input type="text" id="admin-news-title" class="auth-input" style="width: 100%;" placeholder="Ej. Lanzamiento Bandai Spirits RG 2.0" required>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
            Categoría *
          </label>
          <select id="admin-news-category" class="auth-input" style="width: 100%;" required>
            <option value="releases">Lanzamientos</option>
            <option value="techniques">Técnicas de Pintura/Armado</option>
            <option value="tools">Herramientas & Suministros</option>
            <option value="events">Eventos & Concursos</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
            Tiempo de Lectura
          </label>
          <input type="text" id="admin-news-read-time" class="auth-input" style="width: 100%;" placeholder="Ej. 4 min">
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Resumen Breve (Para tarjeta de portada) *
        </label>
        <textarea id="admin-news-summary" class="auth-input" style="width: 100%; min-height: 50px;" placeholder="Breve extracto de 1 o 2 oraciones..." required></textarea>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Contenido Completo del Artículo *
        </label>
        <textarea id="admin-news-content" class="auth-input" style="width: 100%; min-height: 120px;" placeholder="Desarrollo completo de la noticia, recomendaciones tecnicas, bases o detalles..." required></textarea>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          URL de Imagen de Portada (Opcional)
        </label>
        <input type="url" id="admin-news-image" class="auth-input" style="width: 100%;" placeholder="https://ejemplo.com/foto.jpg">
      </div>
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Etiquetas (separadas por coma)
        </label>
        <input type="text" id="admin-news-tags" class="auth-input" style="width: 100%;" placeholder="Gunpla, RG, Bandai, Novedades">
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="filter-pill" onclick="closeAdminNewsModal()" style="font-size: 0.82rem; padding: 0.45rem 1rem;">
          Cancelar
        </button>
        <button type="submit" id="btn-submit-admin-news" class="btn-primary" style="font-size: 0.85rem; padding: 0.5rem 1.25rem; background: #3b82f6;">
          Publicar Noticia
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Modal Administracion: Destacar Foto de Coleccionista -->
<div id="modal-admin-featured-photo" class="custom-modal" onclick="closeAdminFeaturedPhotoModal(event)">
  <div class="auth-box" style="max-width: 520px; width: 90%; background: #0f172a; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem;" onclick="event.stopPropagation()">
    <span class="auth-close" onclick="closeAdminFeaturedPhotoModal()" style="position: absolute; top: 1rem; right: 1.25rem; font-size: 1.5rem; color: #94a3b8; cursor: pointer;">&times;</span>
    <h2 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem;">
      📸 Destacar Fotografía en Vitrina de Portada
    </h2>
    <form onsubmit="submitFeaturedPhoto(event)">
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          URL de la Imagen *
        </label>
        <input type="url" id="admin-photo-url" class="auth-input" style="width: 100%;" placeholder="https://ejemplo.com/gunpla-rx78.jpg" required>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
          Título de la Maqueta / Proyecto *
        </label>
        <input type="text" id="admin-photo-title" class="auth-input" style="width: 100%;" placeholder="Ej. MG RX-93-v2 Hi-Nu Ver.Ka Custom" required>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
            Nombre del Modelista
          </label>
          <input type="text" id="admin-photo-builder" class="auth-input" style="width: 100%;" placeholder="Ej. Aldo Perich">
        </div>
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.35rem;">
            Escala / Grado
          </label>
          <input type="text" id="admin-photo-scale" class="auth-input" style="width: 100%;" placeholder="Ej. 1/100 MG">
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="filter-pill" onclick="closeAdminFeaturedPhotoModal()" style="font-size: 0.82rem; padding: 0.45rem 1rem;">
          Cancelar
        </button>
        <button type="submit" id="btn-submit-admin-photo" class="btn-primary" style="font-size: 0.85rem; padding: 0.5rem 1.25rem; background: #8b5cf6;">
          Destacar en Vitrina
        </button>
      </div>
    </form>
  </div>
</div>

`;
}
