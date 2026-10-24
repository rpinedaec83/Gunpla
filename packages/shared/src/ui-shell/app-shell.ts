import {
  ScaleCategory,
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

export interface AppShellConfig {
  tenantSlug: 'plamoscale' | 'gunplajunkies';
  tenantName: string;
  tenantTagline: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    bgDark: string;
    cardBg: string;
    borderColor: string;
  };
  apiUrl: string;
  otherTenantUrl: string;
  otherTenantName: string;
  googleClientId?: string;
}

export interface AppShellData {
  builders: UserRecord[];
  mediaAssets: MediaAsset[];
  kits: KitRecord[];
  paints: PaintRecord[];
  builds: BuildProjectRecord[];
  contests: ContestRecord[];
  shops: ShopRecord[];
  listings?: MarketplaceListingRecord[];
  commissionBuilders?: CommissionBuilderRecord[];
}

export function renderAppShell(config: AppShellConfig, data: AppShellData): string {
  const isGunpla = config.tenantSlug === 'gunplajunkies';
  const birthYearOptions = Array.from({ length: 87 }, (_, i) => 2026 - i)
    .map(y => `<option value="${y}">${y}</option>`)
    .join('');

  const categoryPills = isGunpla
    ? [
        { id: 'all', label: 'Todos los Grados' },
        { id: 'hg', label: 'High Grade (HG)' },
        { id: 'rg', label: 'Real Grade (RG)' },
        { id: 'mg', label: 'Master Grade (MG)' },
        { id: 'pg', label: 'Perfect Grade (PG)' },
        { id: 'sd', label: 'Super Deformed (SD)' },
        { id: '30mm', label: '30 Minutes Missions' },
        { id: 'kotobukiya', label: 'Kotobukiya & Otros' }
      ]
    : [
        { id: 'all', label: 'Todas las Escalas' },
        { id: 'gunpla-mecha', label: 'Gunpla & Mecha' },
        { id: 'military', label: 'Militar 1/35' },
        { id: 'aviation', label: 'Aviación 1/48' },
        { id: 'automotive', label: 'Automotriz 1/24' },
        { id: 'figures', label: 'Figuras' },
        { id: 'naval', label: 'Naval' },
        { id: 'diorama', label: 'Dioramas' }
      ];

  const founders = data.builders.filter((b) => b.isFounder && b.username !== 'rpineda');
  const kitOptions = (data.kits || []).map(k => `<option value="${k.id}">[${k.brand} ${k.scale || ''}] ${k.name} (${k.grade || k.category})</option>`).join('');
  const paintOptions = (data.paints || []).map(p => `<option value="${p.id}">[${p.brand}] ${p.code} - ${p.name} (${p.line})</option>`).join('');

  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.tenantName} — ${config.tenantTagline}</title>
  <meta name="description" content="Comunidad y plataforma de modelismo a escala. Bitácoras de armado, catálogo de kits, muestrario de pinturas y banco de trabajo personal.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <style>
    :root {
      --primary: ${config.theme.primaryColor};
      --accent: ${config.theme.accentColor};
      --bg-dark: ${config.theme.bgDark};
      --card-bg: ${config.theme.cardBg};
      --border-color: ${config.theme.borderColor};
      --sidebar-width: 270px;
      --topbar-height: 64px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-dark);
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
    }

    h1, h2, h3, h4, .brand-font {
      font-family: 'Chakra Petch', sans-serif;
      letter-spacing: -0.02em;
    }

    .mono-font { font-family: 'JetBrains Mono', monospace; }

    /* --- UXP-01 App Shell Layout --- */
    #app-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
    }

    /* Left Persistent Sidebar (Evidence-Informed Rules) */
    #sidebar {
      width: var(--sidebar-width);
      background: #0d121d;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 40;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      height: var(--topbar-height);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-size: 1rem;
    }

    .brand-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .nav-group-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 0.75rem 0.75rem 0.25rem;
      font-weight: 600;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.15s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .nav-item.active {
      background: rgba(${isGunpla ? '239, 68, 68' : '37, 99, 235'}, 0.15);
      color: #fff;
      border-left: 3px solid var(--primary);
    }

    .nav-badge {
      margin-left: auto;
      font-size: 0.72rem;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
    }

    /* Top Utility Bar */
    #topbar {
      position: fixed;
      top: 0;
      right: 0;
      left: var(--sidebar-width);
      height: var(--topbar-height);
      background: rgba(13, 18, 29, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      z-index: 30;
    }

    .topbar-search-wrapper {
      position: relative;
      width: 380px;
    }

    .topbar-search-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.5rem 1rem 0.5rem 2.25rem;
      color: #fff;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .topbar-search-input:focus {
      border-color: var(--primary);
    }

    .topbar-search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
      font-size: 0.9rem;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .portal-switcher {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.85rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: #cbd5e1;
      font-size: 0.82rem;
      text-decoration: none;
      transition: all 0.2s;
    }

    .portal-switcher:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .btn-primary {
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0.45rem 1rem;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: opacity 0.2s;
    }

    .btn-primary:hover { opacity: 0.9; }

    /* Auth & User Profile */
    .btn-auth {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-color);
      color: #fff;
      padding: 0.42rem 0.9rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-auth:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: var(--primary);
    }
    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.35rem 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      cursor: pointer;
      position: relative;
    }
    .user-avatar-img {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      object-fit: cover;
    }
    .user-dropdown-menu {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: #111827;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.5rem;
      min-width: 190px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 100;
    }
    .user-dropdown-menu.show { display: block; }
    .user-dropdown-item {
      padding: 0.5rem 0.75rem;
      font-size: 0.82rem;
      color: #cbd5e1;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      text-decoration: none;
    }
    .user-dropdown-item:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    /* Auth & Custom Modals */
    #auth-modal, .custom-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      overflow-y: auto;
    }
    #auth-modal.active, .custom-modal.active { display: flex; animation: fadeIn 0.2s ease; }
    .auth-box {
      background: #111827;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      width: 100%;
      max-width: 440px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      position: relative;
    }
    .auth-close {
      position: absolute;
      top: 1rem;
      right: 1.25rem;
      font-size: 1.5rem;
      color: #94a3b8;
      cursor: pointer;
    }
    .auth-close:hover { color: #fff; }
    .auth-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 1.5rem;
    }
    .auth-tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    .auth-tab-btn.active {
      color: #fff;
      border-bottom-color: var(--primary);
    }
    .auth-input-group {
      margin-bottom: 1rem;
    }
    .auth-label {
      display: block;
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 0.35rem;
    }
    .auth-input {
      width: 100%;
      padding: 0.6rem 0.85rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: #fff;
      font-size: 0.9rem;
    }
    .auth-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    /* Main Content Area */
    #main-content {
      margin-left: var(--sidebar-width);
      margin-top: var(--topbar-height);
      flex: 1;
      padding: 2rem;
      min-height: calc(100vh - var(--topbar-height));
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: #64748b;
      margin-bottom: 0.75rem;
    }

    .breadcrumbs a { color: #94a3b8; text-decoration: none; }
    .breadcrumbs a:hover { color: #fff; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.85rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    /* Category Filter Pills */
    .filter-pills-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.75rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .filter-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: #94a3b8;
      border-radius: 9999px;
      padding: 0.35rem 0.95rem;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .filter-pill:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
    .filter-pill.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }

    /* Section Views */
    .view-section { display: none; }
    .view-section.active { display: block; animation: fadeIn 0.2s ease; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Showcase Grid (Multiverse / Poptrox Lightbox) */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .gallery-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      transition: transform 0.2s, border-color 0.2s;
    }

    .gallery-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
    }

    .gallery-card-thumb {
      width: 100%;
      height: 220px;
      object-fit: cover;
      display: block;
      background: #020617;
    }

    .gallery-card-info {
      padding: 0.85rem 1rem;
    }

    .gallery-card-title {
      font-size: 0.92rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gallery-card-builder {
      font-size: 0.78rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* Kit Catalog Cards */
    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .catalog-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .catalog-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .catalog-brand-badge {
      font-size: 0.72rem;
      background: rgba(255, 255, 255, 0.08);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      color: #cbd5e1;
    }

    .catalog-card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
    }

    .catalog-specs-row {
      display: flex;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    /* Paint Rack Swatches */
    .paint-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }

    .paint-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .paint-swatch {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .paint-name { font-size: 0.9rem; font-weight: 600; color: #fff; }
    .paint-code { font-size: 0.75rem; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }

    /* Build Logs Timeline */
    .builds-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .build-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .build-card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .build-steps-timeline {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .step-item {
      display: flex;
      gap: 1rem;
      position: relative;
    }

    .step-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .step-content {
      flex: 1;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
    }

    .step-title { font-size: 0.98rem; font-weight: 600; color: #fff; margin-bottom: 0.4rem; }
    .step-desc { font-size: 0.86rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 0.6rem; }
    
    .paint-recipe-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.5rem;
    }

    .recipe-tag {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      color: #e2e8f0;
    }

    .recipe-swatch {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    /* Lightbox Modal (Poptrox replacement) */
    #lightbox-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.92);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    #lightbox-modal.active { display: flex; }

    .lightbox-content {
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .lightbox-img {
      max-width: 100%;
      max-height: 78vh;
      border-radius: 6px;
      object-fit: contain;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
    }

    .lightbox-caption {
      margin-top: 1rem;
      color: #fff;
      font-size: 1.05rem;
      font-weight: 600;
      text-align: center;
    }

    .lightbox-author {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 0.25rem;
    }

    .lightbox-close {
      position: absolute;
      top: 1.5rem;
      right: 2rem;
      font-size: 2rem;
      color: #fff;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .lightbox-close:hover { opacity: 1; }

    /* Mobile drawer trigger */
    .mobile-menu-btn {
      display: none;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }

    @media (max-width: 960px) {
      #sidebar { transform: translateX(-100%); }
      #sidebar.open { transform: translateX(0); }
      #topbar { left: 0; padding: 0 1rem; }
      #main-content { margin-left: 0; padding: 1.25rem; }
      .mobile-menu-btn { display: block; }
      .topbar-search-wrapper { display: none; }
    }
  </style>
</head>
<body>

<div id="app-container">
  <!-- Left Persistent Text-Labeled Sidebar (UXP-01 Rule) -->
  <aside id="sidebar">
    <div class="sidebar-header">
      <div class="brand-logo" style="background: ${isGunpla ? '#080c14' : '#0b0f19'}; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; padding: 2px;">
        ${isGunpla ? `
        <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="6" width="88" height="88" rx="14" stroke="#ef4444" stroke-width="6" fill="#080c14" />
          <path d="M6 26H22M6 74H22M94 26H78M94 74H78" stroke="#06b6d4" stroke-width="6" stroke-linecap="round"/>
          <polygon points="50,16 62,44 50,39 38,44" fill="#ef4444" />
          <polygon points="50,18 78,42 62,42 50,32" fill="#f87171" />
          <polygon points="50,18 22,42 38,42 50,32" fill="#dc2626" />
          <polygon points="50,44 68,54 50,84 32,54" fill="#0e131f" stroke="#06b6d4" stroke-width="4"/>
          <polygon points="50,50 60,56 50,74 40,56" fill="#06b6d4" opacity="0.8"/>
          <circle cx="50" cy="58" r="3" fill="#ffffff" />
        </svg>` : `
        <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="6" width="88" height="88" rx="14" stroke="#2563eb" stroke-width="6" fill="#0b0f19" />
          <path d="M25 50H75M50 25V75" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
          <circle cx="50" cy="50" r="14" stroke="#ffffff" stroke-width="4" fill="#2563eb"/>
        </svg>`}
      </div>
      <div>
        <div class="brand-title">${config.tenantName}</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-group-title">Exploración</div>
      <a class="nav-item active" onclick="switchTab('showcase')">
        <span>Galería Showcase</span>
        <span class="nav-badge">${data.mediaAssets.length}</span>
      </a>
      <a class="nav-item" onclick="switchTab('builds')">
        <span>Bitácoras de Armado</span>
        <span class="nav-badge">${data.builds.length}</span>
      </a>
      <a class="nav-item" onclick="switchTab('kits')">
        <span>Catálogo de Kits</span>
        <span class="nav-badge">${data.kits.length}</span>
      </a>
      <a class="nav-item" onclick="switchTab('paints')">
        <span>Pinturas & Suministros</span>
        <span class="nav-badge">${data.paints.length}</span>
      </a>

      <div class="nav-group-title">Mi Taller</div>
      <a class="nav-item" onclick="switchTab('workbench')">
        <span>Banco de Trabajo & Stash</span>
      </a>
      <a class="nav-item" onclick="switchTab('marketplace')">
        <span>Bazar & Venta de Kits</span>
        <span class="nav-badge">${(data.listings || []).length}</span>
      </a>

      <div class="nav-group-title">Comunidad & Eventos</div>
      <a class="nav-item" onclick="switchTab('builders')">
        <span>Modelistas Fundadores</span>
        <span class="nav-badge">${founders.length}</span>
      </a>
      <a class="nav-item" onclick="switchTab('contests')">
        <span>Concursos & Group Builds</span>
        <span class="nav-badge">${data.contests.length}</span>
      </a>
      <a class="nav-item" onclick="switchTab('commissions')">
        <span>Comisiones de Pintura</span>
        <span class="nav-badge">${(data.commissionBuilders || []).length}</span>
      </a>
      <a class="nav-item" onclick="switchTab('shops')">
        <span>Tiendas de Confianza</span>
        <span class="nav-badge">${data.shops.length}</span>
      </a>
    </nav>
  </aside>

  <!-- Top Utility Bar -->
  <header id="topbar">
    <div style="display: flex; align-items: center; gap: 1rem;">
      <button class="mobile-menu-btn" onclick="toggleSidebar()">☰</button>
      <div class="topbar-search-wrapper">
        <span class="topbar-search-icon">🔍</span>
        <input type="text" id="global-search" class="topbar-search-input" placeholder="Buscar kits, fotos o pinturas..." oninput="handleGlobalSearch(this.value)">
      </div>
    </div>

    <div class="topbar-actions">
      <!-- Portal Switcher -->
      <a href="${config.otherTenantUrl}" class="portal-switcher">
        <span>Ir a <strong>${config.otherTenantName}</strong> ➔</span>
      </a>

      <!-- Primary Action CTA -->
      <button class="btn-primary" onclick="openNewBuildModal()">
        <span>+ Nueva Bitácora</span>
      </button>

      <!-- Authentication Section -->
      <div id="auth-user-container" style="position: relative;">
        <button id="btn-open-login" class="btn-auth" onclick="openAuthModal()">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/><path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17C3.7 20.7 7.5 23.5 12 23.5z"/></svg>
          <span>Iniciar Sesión</span>
        </button>
      </div>

      <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #94a3b8; padding-left: 0.5rem; border-left: 1px solid var(--border-color);">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
        <span>Live</span>
      </div>
    </div>
  </header>

  <!-- Main Work Area -->
  <main id="main-content">
    <!-- Breadcrumbs Context -->
    <div class="breadcrumbs">
      <a href="/">Inicio</a>
      <span>/</span>
      <span id="breadcrumb-current">Galería Showcase</span>
    </div>

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title" id="page-header-title">
          Galería Showcase
          <span class="status-badge">92 Obras Migradas</span>
        </h1>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.4rem;">
          ${config.tenantTagline} — Obras maestras de los modelistas fundadores y la comunidad.
        </p>
      </div>
    </div>

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
              <button class="btn-primary" onclick="likeBuild('${b.id}')">❤️ Like</button>
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
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <!-- 1. Equivalencias entre Marcas -->
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.3rem;">🔄</span>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Conversor de Equivalencias</h3>
            </div>
            <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.25rem;">
              Cruza códigos entre <strong>Mr. Color (Laca)</strong>, <strong>Tamiya (Acrílico)</strong> y <strong>Vallejo (Mecha/Model)</strong>, calcula la dilución y verifica stock en tu Rack.
            </p>

            <form onsubmit="handleAiConvertSubmit(event)" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div class="auth-input-group" style="margin-bottom: 0;">
                <label class="auth-label">Pintura a Convertir</label>
                <select id="ai-convert-code-select" class="auth-input">
                  <option value="XF-1">Tamiya XF-1 (Flat Black)</option>
                  <option value="XF-2">Tamiya XF-2 (Flat White)</option>
                  <option value="C108">Mr. Color C108 (Character Red)</option>
                  <option value="C110">Mr. Color C110 (Character Blue)</option>
                  <option value="C113">Mr. Color C113 (RLM04 Yellow)</option>
                  <option value="C28">Mr. Color C28 (Steel / Metallic)</option>
                  <option value="C71">Mr. Color C71 (Midnight Blue)</option>
                  <option value="XF-62">Tamiya XF-62 (Olive Drab)</option>
                  <option value="XF-63">Tamiya XF-63 (German Grey)</option>
                  <option value="70.950">Vallejo 70.950 (Black)</option>
                  <option value="69.008">Vallejo Mecha 69.008 (Mecha Red)</option>
                  <option value="69.011">Vallejo Mecha 69.011 (Mecha Dark Blue)</option>
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
              Describe el color o Mobile Suit que deseas pintar y la IA generará las proporciones exactas de mezcla y técnicas de aerógrafo.
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
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div id="wb-user-avatar-slot"></div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <h2 id="wb-user-title" style="font-size: 1.4rem; font-weight: 700; color: #fff;">Mi Taller</h2>
                  <span id="wb-age-badge" class="status-badge">Verificado</span>
                </div>
                <div id="wb-user-subtitle" style="font-size: 0.82rem; color: #94a3b8;">Inventario personal de modelismo</div>
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
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
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          <button id="wb-subtab-btn-stash" class="filter-pill active" onclick="switchWorkbenchSubtab('stash')">
            📦 Mi Stash de Maquetas
          </button>
          <button id="wb-subtab-btn-builds" class="filter-pill" onclick="switchWorkbenchSubtab('builds')">
            📝 Mis Bitácoras de Armado
          </button>
          <button id="wb-subtab-btn-paints" class="filter-pill" onclick="switchWorkbenchSubtab('paints')">
            🎨 Mi Rack de Pinturas
          </button>
        </div>

        <!-- Sub-Tab 1: Stash Grid -->
        <div id="wb-subtab-stash" class="wb-subtab-content">
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
          <div id="wb-paints-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
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
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        ${data.contests
          .map(
            (c) => `
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden;">
            <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="status-badge" style="background: rgba(37, 99, 235, 0.2); color: #60a5fa; border-color: rgba(37, 99, 235, 0.4);">
                  ${c.status.toUpperCase()} • ${c.participantsCount} Inscritos
                </span>
                <span style="font-size: 0.8rem; color: #94a3b8;">Finaliza: ${new Date(c.endDate).toLocaleDateString()}</span>
              </div>
              <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">${c.title}</h2>
              <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">${c.description}</p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <div style="padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid var(--border-color);">
                  <div style="font-size: 0.85rem; font-weight: 600; color: #fff; margin-bottom: 0.4rem;">Reglas de Participación:</div>
                  <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: #94a3b8;">
                    ${c.rules.map((r) => `<li>${r}</li>`).join('')}
                  </ul>
                </div>
                <div style="padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid var(--border-color);">
                  <div style="font-size: 0.85rem; font-weight: 600; color: #fff; margin-bottom: 0.4rem;">Premios:</div>
                  <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: #94a3b8;">
                    ${c.prizes.map((p) => `<li>${p}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end;">
                <button class="btn-primary" onclick="submitToContest('${c.id}')">
                  🏆 Inscribir mi Bitácora al Concurso
                </button>
              </div>
            </div>

            <!-- Participating Builds Gallery & Voting Leaderboard -->
            <div style="padding: 1.5rem; background: rgba(0,0,0,0.15);">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1rem;">
                Obras Inscritas & Votación Comunitaria
              </h3>
              ${
                c.entries && c.entries.length > 0
                  ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem;">
                  ${c.entries
                    .map(
                      (e) => `
                    <div style="background: var(--bg-dark); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
                      <img src="${e.coverImageUrl}" alt="${e.title}" style="width: 100%; height: 180px; object-fit: cover;" loading="lazy" />
                      <div style="padding: 0.85rem 1rem; display: flex; flex-direction: column; flex: 1;">
                        <div style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">${e.title}</div>
                        <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem;">Por <strong>@${e.username}</strong></div>
                        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.65rem;">
                          <span style="font-size: 0.85rem; font-weight: 600; color: #fbbf24;">⭐ ${e.voteCount} Votos</span>
                          <button class="filter-pill" style="padding: 0.25rem 0.75rem; font-size: 0.78rem;" onclick="voteEntry('${c.id}', '${e.id}')">
                            Votar ⭐
                          </button>
                        </div>
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
                  : `
                <p style="font-size: 0.85rem; color: #64748b; font-style: italic;">
                  Aún no hay obras inscritas. ¡Sé el primero en participar con tu bitácora!
                </p>
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

            <div style="border-top: 1px solid var(--border-color); padding-top: 0.85rem; font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
              <div>Vendedor: <strong>@${l.username}</strong><br><span style="font-size: 0.75rem; color: #64748b;">📍 ${l.contactLocation}</span></div>
              <a href="${l.contactWhatsapp}" target="_blank" rel="noopener" class="filter-pill" style="color: #22c55e; border-color: rgba(34, 197, 94, 0.3); text-decoration: none; font-weight: 600;">
                Contactar 💬
              </a>
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

            <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              ${cb.instagramUrl ? `<a href="${cb.instagramUrl}" target="_blank" rel="noopener" style="font-size: 0.8rem; color: var(--accent); text-decoration: none;">Instagram ➔</a>` : '<span></span>'}
              <a href="${cb.whatsappUrl}" target="_blank" rel="noopener" class="btn-primary" style="padding: 0.35rem 0.85rem; font-size: 0.82rem; text-decoration: none;">
                Cotizar Proyecto 💬
              </a>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>
  </main>
</div>

<!-- Lightbox Modal (Poptrox High-Res Showcase) -->
<div id="lightbox-modal" onclick="closeLightbox(event)">
  <span class="lightbox-close" onclick="closeLightbox(event)">&times;</span>
  <div class="lightbox-content">
    <img id="lightbox-image" class="lightbox-img" src="" alt="Obra de Modelismo en Alta Resolución" />
    <div id="lightbox-title" class="lightbox-caption"></div>
    <div id="lightbox-author" class="lightbox-author"></div>
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
        <label class="auth-label">Foto del Avance (Sube una imagen)</label>
        <input type="file" id="step-photo-file" class="auth-input" accept="image/*" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;">
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

<script>
  function switchTab(tabId, el) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));

    const targetSection = document.getElementById('view-' + tabId);
    if (targetSection) targetSection.classList.add('active');

    // Update breadcrumb and title
    const titles = {
      showcase: 'Galería Showcase',
      builds: 'Bitácoras de Armado (Build Logs)',
      kits: 'Catálogo de Kits',
      paints: 'Pinturas & Suministros',
      workbench: 'Banco de Trabajo & Stash',
      marketplace: 'Bazar & Venta de Kits',
      builders: 'Modelistas Fundadores',
      contests: 'Concursos & Group Builds',
      commissions: 'Comisiones de Armado & Pintura',
      shops: 'Tiendas de Confianza'
    };

    if (titles[tabId]) {
      document.getElementById('breadcrumb-current').textContent = titles[tabId];
      document.getElementById('page-header-title').firstChild.textContent = titles[tabId] + ' ';
    }

    // Set active sidebar item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      const clickAttr = item.getAttribute('onclick') || '';
      if (clickAttr.indexOf(tabId) !== -1) {
        item.classList.add('active');
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    if (tabId === 'workbench') {
      loadWorkbenchData();
    }
  }

  function filterShowcase(categoryId, btn) {
    document.querySelectorAll('.filter-pill').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.gallery-card');
    cards.forEach(card => {
      const cat = card.getAttribute('data-category');
      if (categoryId === 'all' || cat === categoryId) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function handleGlobalSearch(query) {
    const q = query.toLowerCase().trim();
    const cards = document.querySelectorAll('.gallery-card');
    cards.forEach(card => {
      const title = card.getAttribute('data-title') || '';
      const author = card.getAttribute('data-author') || '';
      if (!q || title.includes(q) || author.includes(q)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function openLightbox(url, title, author) {
    document.getElementById('lightbox-image').src = url;
    document.getElementById('lightbox-title').textContent = title;
    document.getElementById('lightbox-author').textContent = 'Construido y fotografiado por ' + author;
    document.getElementById('lightbox-modal').classList.add('active');
  }

  function closeLightbox(e) {
    if (e.target.id === 'lightbox-modal' || e.target.classList.contains('lightbox-close')) {
      document.getElementById('lightbox-modal').classList.remove('active');
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('lightbox-modal').classList.remove('active');
    }
  });

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  function openNewBuildModal() {
    alert('Para crear una bitácora o subir fotos WIP paso a paso, utiliza el endpoint POST /api/v1/builds o inicia sesión.');
  }

  function likeBuild(buildId) {
    alert('Like registrado para la bitácora ' + buildId + '. (POST /api/v1/builds/' + buildId + '/like)');
  }

  function submitToContest(contestId) {
    alert('Para inscribir tu proyecto en el concurso ' + contestId + ', ingresa el buildId de tu bitácora mediante POST /api/v1/contests/' + contestId + '/entries');
  }

  function voteEntry(contestId, entryId) {
    alert('Voto registrado para la obra participante ' + entryId + ' en ' + contestId + '. (POST /api/v1/contests/' + contestId + '/entries/' + entryId + '/vote)');
  }

  function openNewListingModal() {
    alert('Para publicar un kit de tu Stash en el Bazar/Marketplace, utiliza el endpoint POST /api/v1/marketplace/listings con tu token de sesión.');
  }

  // --- Client-Side Authentication & Session Management ---
  let currentUser = null;
  let currentToken = null;

  function checkAuth() {
    const storedUser = localStorage.getItem('plamo_sso_user');
    const storedToken = localStorage.getItem('plamo_sso_token');
    if (storedUser && storedToken) {
      try {
        currentUser = JSON.parse(storedUser);
        currentToken = storedToken;
        renderAuthUI();
      } catch (e) {
        logout();
      }
    } else {
      renderAuthUI();
    }
  }

  function renderAuthUI() {
    const container = document.getElementById('auth-user-container');
    if (!container) return;
    if (currentUser) {
      const initials = (currentUser.displayName || currentUser.username || 'U').slice(0, 2).toUpperCase();
      const avatarHtml = currentUser.avatarUrl 
        ? '<img class="user-avatar-img" src="' + currentUser.avatarUrl + '" alt="' + currentUser.displayName + '">'
        : '<div class="user-avatar-img">' + initials + '</div>';

      container.innerHTML = 
        '<div class="user-profile-badge" onclick="toggleUserDropdown(event)">' +
          avatarHtml +
          '<span style="font-size: 0.82rem; font-weight: 600; color: #fff;">' + (currentUser.displayName || currentUser.username) + '</span>' +
          '<span style="font-size: 0.65rem; color: #94a3b8;">▼</span>' +
          '<div id="user-dropdown" class="user-dropdown-menu">' +
            '<div style="padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border-color); margin-bottom: 0.25rem;">' +
              '<div style="font-size: 0.8rem; font-weight: 700; color: #fff;">' + (currentUser.displayName || currentUser.username) + '</div>' +
              '<div style="font-size: 0.72rem; color: #94a3b8;">' + (currentUser.email || '') + '</div>' +
            '</div>' +
            '<a class="user-dropdown-item" onclick="goToWorkbench()">🛠️ Mi Workbench & Stash</a>' +
            '<a class="user-dropdown-item" style="color: #ef4444;" onclick="logout()">🚪 Cerrar Sesión</a>' +
          '</div>' +
        '</div>';
    } else {
      container.innerHTML =
        '<button id="btn-open-login" class="btn-auth" onclick="openAuthModal()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/><path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17C3.7 20.7 7.5 23.5 12 23.5z"/></svg>' +
          '<span>Iniciar Sesión</span>' +
        '</button>';
    }
  }

  function goToWorkbench() {
    switchTab('workbench');
  }

  function toggleUserDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById('user-dropdown');
    if (menu) menu.classList.toggle('show');
  }

  window.addEventListener('click', () => {
    const menu = document.getElementById('user-dropdown');
    if (menu) menu.classList.remove('show');
  });

  function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
    initGoogleAuth();
  }

  function closeAuthModal(e) {
    if (!e || e.target.id === 'auth-modal' || e.target.classList.contains('auth-close')) {
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.remove('active');
    }
  }

  function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-tab-content').forEach(c => c.style.display = 'none');
    
    event.currentTarget.classList.add('active');
    const target = document.getElementById('tab-auth-' + tab);
    if (target) target.style.display = 'block';

    if (tab === 'google') initGoogleAuth();
  }

  function initGoogleAuth() {
    const clientId = '${config.googleClientId || ''}';
    if (window.google && clientId) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse
        });
        const container = document.getElementById('g_id_signin');
        if (container) {
          google.accounts.id.renderButton(container, {
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 280
          });
        }
      } catch (err) {
        console.warn('[Google Identity]:', err);
      }
    } else {
      const container = document.getElementById('g_id_signin');
      if (container && !clientId) {
        container.innerHTML = 
          '<div style="background: rgba(255,255,255,0.05); border: 1px dashed var(--border-color); padding: 1rem; border-radius: 8px; text-align: center; max-width: 320px;">' +
            '<p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">Google Client ID pendiente de configuración en Google Console.</p>' +
            '<button type="button" class="btn-primary" style="font-size: 0.82rem; margin: 0 auto;" onclick="demoGoogleLogin()">' +
              '⚡ Simular Acceso Google Demo' +
            '</button>' +
          '</div>';
      }
    }
  }

  function onGoogleAgeChange(yearStr) {
    const alertBox = document.getElementById('google-age-alert');
    const wrapper = document.getElementById('google-signin-wrapper');
    const status = document.getElementById('google-age-status');
    if (!yearStr) {
      alertBox.style.display = 'none';
      wrapper.style.opacity = '1';
      wrapper.style.pointerEvents = 'auto';
      status.innerText = 'Verificación requerida';
      status.style.color = '#94a3b8';
      return;
    }
    const age = 2026 - Number(yearStr);
    if (age < 14) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
      alertBox.style.border = '1px solid #ef4444';
      alertBox.style.color = '#fca5a5';
      alertBox.innerHTML = '<strong>⛔ Acceso Denegado:</strong> De conformidad con el Art. 27 del Reglamento de la Ley N° 29733 (Protección de Datos Personales de Perú), los menores de 14 años no pueden acceder a esta plataforma.';
      wrapper.style.opacity = '0.2';
      wrapper.style.pointerEvents = 'none';
      status.innerText = 'Menor de 14 años (Bloqueado)';
      status.style.color = '#ef4444';
    } else if (age < 18) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(6, 182, 212, 0.12)';
      alertBox.style.border = '1px solid #06b6d4';
      alertBox.style.color = '#67e8f9';
      alertBox.innerHTML = '<strong>ℹ️ Menor de Edad (14-17 años):</strong> Acceso permitido a Workbench y Stash bajo supervisión parental. Conforme a la Ley 29571 / INDECOPI, las funciones de compraventa en el Bazar quedan restringidas.';
      wrapper.style.opacity = '1';
      wrapper.style.pointerEvents = 'auto';
      status.innerText = '14-17 años (Acceso Parcial)';
      status.style.color = '#06b6d4';
    } else {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(34, 197, 94, 0.12)';
      alertBox.style.border = '1px solid #22c55e';
      alertBox.style.color = '#86efac';
      alertBox.innerHTML = '<strong>✅ Mayor de Edad (18+ años):</strong> Verificado con capacidad plena para todas las funciones (Workbench, Stash, Concursos y Bazar de compraventa).';
      wrapper.style.opacity = '1';
      wrapper.style.pointerEvents = 'auto';
      status.innerText = 'Mayor de Edad (18+)';
      status.style.color = '#22c55e';
    }
  }

  function onRegAgeChange(yearStr) {
    const alertBox = document.getElementById('reg-age-alert');
    const submitBtn = document.getElementById('reg-submit-btn');
    if (!yearStr) {
      alertBox.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      return;
    }
    const age = 2026 - Number(yearStr);
    if (age < 14) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
      alertBox.style.border = '1px solid #ef4444';
      alertBox.style.color = '#fca5a5';
      alertBox.innerHTML = '<strong>⛔ Acceso Denegado:</strong> Según la Ley N° 29733 de Protección de Datos Personales, los menores de 14 años no pueden registrarse ni utilizar la plataforma.';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.4';
      submitBtn.style.cursor = 'not-allowed';
    } else if (age < 18) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(6, 182, 212, 0.12)';
      alertBox.style.border = '1px solid #06b6d4';
      alertBox.style.color = '#67e8f9';
      alertBox.innerHTML = '<strong>ℹ️ Menor de Edad (14-17 años):</strong> Registro autorizado para gestión de Stash y Bitácoras. Acceso comercial al Bazar restringido.';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    } else {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(34, 197, 94, 0.12)';
      alertBox.style.border = '1px solid #22c55e';
      alertBox.style.color = '#86efac';
      alertBox.innerHTML = '<strong>✅ Mayor de Edad (18+ años):</strong> Capacidad plena autorizada.';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    }
  }

  async function handleGoogleCredentialResponse(response) {
    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const birthYearInput = document.getElementById('google-birthyear');
    const birthYear = birthYearInput ? birthYearInput.value : '';

    if (birthYear) {
      const age = 2026 - Number(birthYear);
      if (age < 14) {
        alert('⛔ Acceso Denegado: La edad mínima legal para acceder a Gunpla Collector es de 14 años (Ley N° 29733).');
        return;
      }
    }

    try {
      const idToken = response.credential;
      const res = await fetch(apiBase + '/api/v1/auth/google-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': '${config.tenantSlug}' },
        body: JSON.stringify({ idToken, birthYear })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al autenticar con Google');
      }
      const data = await res.json();
      localStorage.setItem('plamo_sso_token', data.token);
      localStorage.setItem('plamo_sso_user', JSON.stringify(data.user));
      currentUser = data.user;
      currentToken = data.token;
      renderAuthUI();
      closeAuthModal();
      const ageMsg = data.user.isAdult ? ' (Capacidad Plena 18+)' : ' (Acceso Comunitario 14-17)';
      alert('¡Bienvenido a Gunpla Collector, ' + data.user.displayName + ageMsg + '!');
    } catch (err) {
      alert('Error en Google Sign-In: ' + err.message);
    }
  }

  async function demoGoogleLogin() {
    const birthYearInput = document.getElementById('google-birthyear');
    const birthYear = birthYearInput && birthYearInput.value ? birthYearInput.value : '1995';
    const demoPayload = {
      sub: 'google-pilot-user-123',
      email: 'builder.pilot@plamoscale.com',
      name: 'Modelista Piloto',
      email_verified: true
    };
    const demoToken = 'google-test-token:' + btoa(JSON.stringify(demoPayload));
    await handleGoogleCredentialResponse({ credential: demoToken });
  }

  async function handleLocalLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/auth/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': '${config.tenantSlug}' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Credenciales incorrectas');
      }
      const data = await res.json();
      localStorage.setItem('plamo_sso_token', data.token);
      localStorage.setItem('plamo_sso_user', JSON.stringify(data.user));
      currentUser = data.user;
      currentToken = data.token;
      renderAuthUI();
      closeAuthModal();
      alert('Sesión iniciada como ' + data.user.displayName);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function quickLoginFounder(username) {
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = 'PlamoScale-Founder-2026!';
    const form = document.querySelector('#tab-auth-credentials form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const displayName = document.getElementById('reg-display').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const birthYearInput = document.getElementById('reg-birthyear');
    const birthYear = birthYearInput ? birthYearInput.value : '';

    if (birthYear) {
      const age = 2026 - Number(birthYear);
      if (age < 14) {
        alert('⛔ Acceso Denegado: La edad mínima legal para registrarse es de 14 años (Ley N° 29733).');
        return;
      }
    }

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/auth/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': '${config.tenantSlug}' },
        body: JSON.stringify({ username, displayName, email, password, birthYear })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al registrar cuenta');
      }
      const data = await res.json();
      localStorage.setItem('plamo_sso_token', data.token);
      localStorage.setItem('plamo_sso_user', JSON.stringify(data.user));
      currentUser = data.user;
      currentToken = data.token;
      renderAuthUI();
      closeAuthModal();
      const ageMsg = data.user.isAdult ? ' (Capacidad Plena 18+)' : ' (Acceso Comunitario 14-17)';
      alert('¡Cuenta creada con éxito para @' + data.user.username + ageMsg + '!');
    } catch (err) {
      alert('Error al registrar: ' + err.message);
    }
  }

  // Workbench sub-tab switching
  function switchWorkbenchSubtab(subtab) {
    document.querySelectorAll('#workbench-auth-view .wb-subtab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#workbench-auth-view .filter-pill').forEach(el => el.classList.remove('active'));
    
    const targetContent = document.getElementById('wb-subtab-' + subtab);
    if (targetContent) targetContent.style.display = 'block';

    const targetBtn = document.getElementById('wb-subtab-btn-' + subtab);
    if (targetBtn) targetBtn.classList.add('active');
  }

  // Modal open/close handlers
  function openAddStashModal() {
    const m = document.getElementById('modal-add-stash');
    if (m) m.classList.add('active');
  }
  function closeAddStashModal(e) {
    if (!e || e.target.id === 'modal-add-stash' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-add-stash');
      if (m) m.classList.remove('active');
    }
  }

  function openNewBuildModal(preselectedKitId) {
    const m = document.getElementById('modal-new-build');
    if (preselectedKitId) {
      const select = document.getElementById('build-kit-select');
      if (select) select.value = preselectedKitId;
    }
    if (m) m.classList.add('active');
  }
  function closeNewBuildModal(e) {
    if (!e || e.target.id === 'modal-new-build' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-new-build');
      if (m) m.classList.remove('active');
    }
  }

  function openAddStepModal(buildId) {
    const m = document.getElementById('modal-add-step');
    const input = document.getElementById('step-build-id');
    if (input) input.value = buildId;
    if (m) m.classList.add('active');
  }
  function closeAddStepModal(e) {
    if (!e || e.target.id === 'modal-add-step' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-add-step');
      if (m) m.classList.remove('active');
    }
  }

  function openAddPaintModal() {
    const m = document.getElementById('modal-add-paint');
    if (m) m.classList.add('active');
  }
  function closeAddPaintModal(e) {
    if (!e || e.target.id === 'modal-add-paint' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-add-paint');
      if (m) m.classList.remove('active');
    }
  }

  // File to Base64 helper
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Load and Render Workbench Data
  async function loadWorkbenchData() {
    const unauthView = document.getElementById('workbench-unauth-view');
    const authView = document.getElementById('workbench-auth-view');
    if (!unauthView || !authView) return;

    if (!currentUser || !currentToken) {
      unauthView.style.display = 'block';
      authView.style.display = 'none';
      return;
    }

    unauthView.style.display = 'none';
    authView.style.display = 'block';

    // Update User Header Info
    const avatarSlot = document.getElementById('wb-user-avatar-slot');
    if (avatarSlot) {
      const initials = (currentUser.displayName || currentUser.username || 'U').slice(0, 2).toUpperCase();
      avatarSlot.innerHTML = currentUser.avatarUrl 
        ? '<img src="' + currentUser.avatarUrl + '" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">'
        : '<div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 1.1rem;">' + initials + '</div>';
    }
    const titleSlot = document.getElementById('wb-user-title');
    if (titleSlot) titleSlot.textContent = 'Taller de ' + (currentUser.displayName || '@' + currentUser.username);
    const ageBadge = document.getElementById('wb-age-badge');
    if (ageBadge) {
      ageBadge.textContent = currentUser.isAdult ? 'Mayor de Edad (18+)' : 'Adolescente (14-17)';
      ageBadge.style.color = currentUser.isAdult ? '#4ade80' : '#38bdf8';
    }

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Authorization': 'Bearer ' + currentToken,
      'X-Tenant-Slug': '${config.tenantSlug}'
    };

    try {
      // 1. Fetch Stash Items
      const stashRes = await fetch(apiBase + '/api/v1/workbench/stash', { headers: authHeaders });
      const stashData = stashRes.ok ? await stashRes.json() : { items: [] };
      const stashItems = stashData.items || [];

      // 2. Fetch Paint Rack Items
      const paintsRes = await fetch(apiBase + '/api/v1/workbench/paints', { headers: authHeaders });
      const paintsData = paintsRes.ok ? await paintsRes.json() : { items: [] };
      const paintItems = paintsData.items || [];

      // 3. Fetch User Build Projects
      const buildsRes = await fetch(apiBase + '/api/v1/builds?username=' + encodeURIComponent(currentUser.username), { headers: authHeaders });
      const buildsData = buildsRes.ok ? await buildsRes.json() : { items: [] };
      const buildItems = buildsData.items || [];

      // Update Metrics
      const totalKits = stashItems.length;
      const unbuiltKits = stashItems.filter(s => s.status === 'unbuilt').length;
      const wipKits = stashItems.filter(s => s.status === 'in_progress').length;
      const builtKits = stashItems.filter(s => s.status === 'built').length;
      const totalPaints = paintItems.reduce((acc, p) => acc + (p.quantity || 1), 0);

      const sTotal = document.getElementById('wb-stat-stash');
      if (sTotal) sTotal.textContent = totalKits;
      const sUnbuilt = document.getElementById('wb-stat-unbuilt');
      if (sUnbuilt) sUnbuilt.textContent = unbuiltKits;
      const sWip = document.getElementById('wb-stat-wip');
      if (sWip) sWip.textContent = wipKits;
      const sBuilt = document.getElementById('wb-stat-built');
      if (sBuilt) sBuilt.textContent = builtKits;
      const sPaints = document.getElementById('wb-stat-paints');
      if (sPaints) sPaints.textContent = totalPaints;

      // Render Stash Grid
      const stashContainer = document.getElementById('wb-stash-grid');
      if (stashContainer) {
        if (stashItems.length === 0) {
          stashContainer.innerHTML = 
            '<div style="grid-column: 1 / -1; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 10px; padding: 3rem 1.5rem; text-align: center;">' +
              '<div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📦</div>' +
              '<h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.4rem;">¡Tu Stash está vacío!</h3>' +
              '<p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">Agrega tu primera maqueta para empezar a registrar tu colección y avances.</p>' +
              '<button class="btn-primary" onclick="openAddStashModal()">+ Agregar Mi Primer Kit</button>' +
            '</div>';
        } else {
          stashContainer.innerHTML = stashItems.map(item => {
            const kit = item.kit || {};
            const kitName = kit.name || 'Maqueta Desconocida';
            const brand = kit.brand || 'Bandai';
            const scale = kit.scale ? kit.scale + ' • ' : '';
            const grade = kit.grade || kit.category || '';
            const boxArt = kit.boxartUrl || '/legacy-media/plamoscale/images/aperich/thumbs/01.jpg';
            const stars = '⭐'.repeat(item.rating || 5);

            return '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">' +
              '<img src="' + boxArt + '" alt="' + kitName + '" style="width: 100%; height: 160px; object-fit: cover; background: #020617;">' +
              '<div style="padding: 1rem; flex: 1; display: flex; flex-direction: column;">' +
                '<div style="font-size: 0.72rem; color: var(--primary); font-weight: 600; text-transform: uppercase; margin-bottom: 0.2rem;">' + brand + ' • ' + scale + grade + '</div>' +
                '<h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; line-height: 1.3;">' + kitName + '</h4>' +
                '<div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.75rem;">' + stars + (item.pricePaid ? ' • ' + (item.currency || 'PEN') + ' ' + item.pricePaid : '') + '</div>' +
                (item.notes ? '<p style="font-size: 0.75rem; color: #94a3b8; font-style: italic; margin-bottom: 0.75rem;">"' + item.notes + '"</p>' : '') +
                '<div style="margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">' +
                  '<label style="display: block; font-size: 0.7rem; color: #64748b; margin-bottom: 0.25rem;">Estado:</label>' +
                  '<select class="auth-input" style="padding: 0.35rem 0.5rem; font-size: 0.78rem; margin-bottom: 0.6rem;" onchange="updateStashStatus(&quot;' + item.id + '&quot;, this.value)">' +
                    '<option value="unbuilt"' + (item.status === 'unbuilt' ? ' selected' : '') + '>⏳ Sin Armar (Backlog)</option>' +
                    '<option value="in_progress"' + (item.status === 'in_progress' ? ' selected' : '') + '>🛠️ En Armado (WIP)</option>' +
                    '<option value="built"' + (item.status === 'built' ? ' selected' : '') + '>🏆 Terminado (Exhibición)</option>' +
                    '<option value="for_trade"' + (item.status === 'for_trade' ? ' selected' : '') + '>🏷️ En Venta (Bazar)</option>' +
                    '<option value="wishlist"' + (item.status === 'wishlist' ? ' selected' : '') + '>⭐ Lista de Deseos</option>' +
                  '</select>' +
                  '<div style="display: flex; gap: 0.4rem;">' +
                    '<button class="btn-primary" style="font-size: 0.72rem; padding: 0.3rem 0.6rem; flex: 1; justify-content: center;" onclick="openNewBuildModal(&quot;' + (kit.id || '') + '&quot;)">🛠️ Bitácora</button>' +
                    '<button class="filter-pill" style="font-size: 0.72rem; padding: 0.3rem 0.6rem; color: #ef4444;" onclick="deleteStashItem(&quot;' + item.id + '&quot;)">🗑️</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      }

      // Render Builds List
      const buildsContainer = document.getElementById('wb-builds-list');
      if (buildsContainer) {
        if (buildItems.length === 0) {
          buildsContainer.innerHTML = 
            '<div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 10px; padding: 3rem 1.5rem; text-align: center;">' +
              '<div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📝</div>' +
              '<h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.4rem;">Aún no has creado bitácoras de armado</h3>' +
              '<p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">Documenta tus proyectos paso a paso con fotos de avance y pinturas usadas.</p>' +
              '<button class="btn-primary" onclick="openNewBuildModal()">+ Crear Primera Bitácora</button>' +
            '</div>';
        } else {
          buildsContainer.innerHTML = buildItems.map(b => {
            const steps = b.steps || [];
            const cover = b.coverImageUrl || (steps.length > 0 && steps[0].photoUrls && steps[0].photoUrls[0]) || '/legacy-media/plamoscale/images/aperich/thumbs/01.jpg';
            const stepsHtml = steps.length > 0
              ? steps.map((s, idx) => 
                  '<div style="display: flex; gap: 0.75rem; margin-bottom: 0.75rem; padding: 0.6rem; background: rgba(255,255,255,0.02); border-radius: 6px;">' +
                    '<div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0;">' + (idx + 1) + '</div>' +
                    '<div style="flex: 1;">' +
                      '<div style="font-size: 0.82rem; font-weight: 600; color: #fff;">' + s.title + ' <span style="font-size: 0.7rem; color: var(--accent);">(' + s.stage + ')</span></div>' +
                      (s.description ? '<p style="font-size: 0.78rem; color: #94a3b8; margin-top: 0.2rem;">' + s.description + '</p>' : '') +
                      (s.photoUrls && s.photoUrls.length > 0 ? '<div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">' + s.photoUrls.map(u => '<img src="' + u + '" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; cursor: pointer;" onclick="openLightbox(&quot;' + u + '&quot;, &quot;' + s.title.replace(/"/g, '') + '&quot;, &quot;@' + b.username + '&quot;)">').join('') + '</div>' : '') +
                    '</div>' +
                  '</div>'
                ).join('')
              : '<p style="font-size: 0.8rem; color: #64748b; font-style: italic;">Sin pasos registrados todavía.</p>';

            return '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.25rem;">' +
              '<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">' +
                '<div style="display: flex; gap: 1rem; align-items: center;">' +
                  '<img src="' + cover + '" style="width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">' +
                  '<div>' +
                    '<div style="font-size: 0.75rem; color: var(--primary); font-weight: 600; text-transform: uppercase;">' + b.category + (b.scale ? ' • ' + b.scale : '') + '</div>' +
                    '<h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">' + b.title + '</h3>' +
                    (b.subtitle ? '<div style="font-size: 0.82rem; color: #94a3b8;">' + b.subtitle + '</div>' : '') +
                  '</div>' +
                '</div>' +
                '<button class="btn-primary" style="font-size: 0.78rem; padding: 0.45rem 0.8rem;" onclick="openAddStepModal(&quot;' + b.id + '&quot;)">+ Agregar Paso / Foto</button>' +
              '</div>' +
              '<div style="padding-top: 0.75rem; border-top: 1px solid var(--border-color);">' +
                '<div style="font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.5rem;">Pasos de Construcción (' + steps.length + '):</div>' +
                stepsHtml +
              '</div>' +
            '</div>';
          }).join('');
        }
      }

      // Render Paint Rack Grid
      const paintsContainer = document.getElementById('wb-paints-grid');
      if (paintsContainer) {
        if (paintItems.length === 0) {
          paintsContainer.innerHTML = 
            '<div style="grid-column: 1 / -1; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 10px; padding: 3rem 1.5rem; text-align: center;">' +
              '<div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🎨</div>' +
              '<h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.4rem;">Tu Rack de Pinturas está vacío</h3>' +
              '<p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">Registra los frascos que tienes en tu taller para usarlos en tus recetas.</p>' +
              '<button class="btn-primary" onclick="openAddPaintModal()">+ Registrar Primera Pintura</button>' +
            '</div>';
        } else {
          paintsContainer.innerHTML = paintItems.map(item => {
            const p = item.paint || {};
            const hex = p.colorHex || '#94a3b8';
            return '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; display: flex; align-items: center; gap: 0.75rem;">' +
              '<div style="width: 32px; height: 32px; border-radius: 50%; background: ' + hex + '; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0;"></div>' +
              '<div style="flex: 1; overflow: hidden;">' +
                '<div style="font-size: 0.82rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (p.code || 'Pintura') + ' ' + (p.name || '') + '</div>' +
                '<div style="font-size: 0.72rem; color: #94a3b8;">' + (p.brand || 'Mr. Color') + ' • Cantidad: ' + (item.quantity || 1) + '</div>' +
              '</div>' +
              '<div style="display: flex; gap: 0.25rem;">' +
                '<button class="filter-pill" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;" onclick="updatePaintQty(&quot;' + item.id + '&quot;, ' + ((item.quantity || 1) + 1) + ')">+</button>' +
                '<button class="filter-pill" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;" onclick="updatePaintQty(&quot;' + item.id + '&quot;, ' + Math.max(0, (item.quantity || 1) - 1) + ')">-</button>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      }
    } catch (err) {
      console.error('[Workbench load error]:', err);
    }
  }

  // Mutation Handlers
  async function handleAddStashSubmit(e) {
    e.preventDefault();
    const kitId = document.getElementById('stash-kit-select').value;
    const status = document.getElementById('stash-status-select').value;
    const rating = Number(document.getElementById('stash-rating-select').value);
    const priceVal = document.getElementById('stash-price-input').value;
    const pricePaid = priceVal ? Number(priceVal) : undefined;
    const currency = document.getElementById('stash-currency-select').value;
    const notes = document.getElementById('stash-notes-input').value.trim();

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/workbench/stash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({ kitId, status, rating, pricePaid, currency, notes })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al agregar kit al stash');
      }
      closeAddStashModal();
      loadWorkbenchData();
      alert('¡Maqueta agregada con éxito a tu Stash personal!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function updateStashStatus(itemId, newStatus) {
    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/workbench/stash/' + itemId, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadWorkbenchData();
      }
    } catch (err) {
      console.warn('Stash status update error:', err);
    }
  }

  async function deleteStashItem(itemId) {
    if (!confirm('¿Seguro que deseas eliminar esta maqueta de tu Stash?')) return;
    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/workbench/stash/' + itemId, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        }
      });
      if (res.ok) {
        loadWorkbenchData();
      }
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  }

  async function handleNewBuildSubmit(e) {
    e.preventDefault();
    const kitId = document.getElementById('build-kit-select').value || undefined;
    const title = document.getElementById('build-title-input').value.trim();
    const subtitle = document.getElementById('build-subtitle-input').value.trim();
    const category = document.getElementById('build-category-select').value;
    const fileInput = document.getElementById('build-cover-file');
    const submitBtn = document.getElementById('build-submit-btn');

    let coverImageUrl = undefined;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subiendo portada...';

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + currentToken,
      'X-Tenant-Slug': '${config.tenantSlug}'
    };

    try {
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const base64 = await fileToBase64(file);
        const uploadRes = await fetch(apiBase + '/api/v1/media/upload', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            dataBase64: base64,
            fileName: file.name,
            title: title + ' - Portada',
            category
          })
        });
        if (uploadRes.ok) {
          const upData = await uploadRes.json();
          coverImageUrl = upData.fullUrl;
        }
      }

      submitBtn.textContent = 'Creando bitácora...';
      const res = await fetch(apiBase + '/api/v1/builds', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ kitId, title, subtitle, category, coverImageUrl, status: 'in_progress' })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al crear bitácora');
      }
      closeNewBuildModal();
      loadWorkbenchData();
      switchWorkbenchSubtab('builds');
      alert('¡Bitácora creada con éxito! Ahora puedes agregar pasos de armado y fotos.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publicar Proyecto de Armado';
    }
  }

  async function handleAddStepSubmit(e) {
    e.preventDefault();
    const buildId = document.getElementById('step-build-id').value;
    const stage = document.getElementById('step-stage-select').value;
    const title = document.getElementById('step-title-input').value.trim();
    const description = document.getElementById('step-desc-input').value.trim();
    const fileInput = document.getElementById('step-photo-file');
    const submitBtn = document.getElementById('step-submit-btn');

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + currentToken,
      'X-Tenant-Slug': '${config.tenantSlug}'
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando paso...';

    try {
      const photoUrls = [];
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const base64 = await fileToBase64(file);
        const uploadRes = await fetch(apiBase + '/api/v1/media/upload', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            dataBase64: base64,
            fileName: file.name,
            title: title,
            category: 'gunpla-mecha'
          })
        });
        if (uploadRes.ok) {
          const upData = await uploadRes.json();
          photoUrls.push(upData.fullUrl);
        }
      }

      const res = await fetch(apiBase + '/api/v1/builds/' + buildId + '/steps', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ stage, title, description, photoUrls, paintUsages: [] })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al agregar paso a la bitácora');
      }
      closeAddStepModal();
      loadWorkbenchData();
      alert('¡Paso de armado agregado con éxito!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Paso de Armado';
    }
  }

  async function handleAddPaintSubmit(e) {
    e.preventDefault();
    const paintId = document.getElementById('paint-id-select').value;
    const status = document.getElementById('paint-status-select').value;
    const quantity = Number(document.getElementById('paint-qty-input').value) || 1;

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/workbench/paints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({ paintId, status, quantity })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al registrar pintura');
      }
      closeAddPaintModal();
      loadWorkbenchData();
      alert('¡Pintura registrada en tu Rack!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function updatePaintQty(itemId, newQty) {
    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      if (newQty <= 0) {
        await fetch(apiBase + '/api/v1/workbench/paints/' + itemId, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + currentToken, 'X-Tenant-Slug': '${config.tenantSlug}' }
        });
      } else {
        await fetch(apiBase + '/api/v1/workbench/paints/' + itemId, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentToken,
            'X-Tenant-Slug': '${config.tenantSlug}'
          },
          body: JSON.stringify({ quantity: newQty })
        });
      }
      loadWorkbenchData();
    } catch (err) {
      console.warn('Paint qty update error:', err);
    }
  }

  // AI Paint Assistant Sub-Tab Switching
  function switchPaintsSubtab(tab) {
    const cat = document.getElementById('paints-subtab-catalog');
    const ai = document.getElementById('paints-subtab-ai');
    const btnCat = document.getElementById('paints-tab-btn-catalog');
    const btnAi = document.getElementById('paints-tab-btn-ai');

    if (tab === 'catalog') {
      if (cat) cat.style.display = 'block';
      if (ai) ai.style.display = 'none';
      if (btnCat) btnCat.classList.add('active');
      if (btnAi) btnAi.classList.remove('active');
    } else {
      if (cat) cat.style.display = 'none';
      if (ai) ai.style.display = 'block';
      if (btnCat) btnCat.classList.remove('active');
      if (btnAi) btnAi.classList.add('active');
    }
  }

  function prefillAiPaintConversion(brand, code) {
    switchPaintsSubtab('ai');
    const select = document.getElementById('ai-convert-code-select');
    if (select) {
      let found = false;
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === code) {
          select.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = brand + ' ' + code;
        opt.selected = true;
        select.appendChild(opt);
      }
    }
    const form = document.querySelector('#paints-subtab-ai form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  function setRecipeQuery(text) {
    const input = document.getElementById('ai-recipe-query-input');
    if (input) {
      input.value = text;
      const form = document.querySelectorAll('#paints-subtab-ai form')[1];
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }

  async function handleAiConvertSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('ai-convert-code-select').value;
    const btn = document.getElementById('btn-convert-submit');
    const resultBox = document.getElementById('ai-convert-result');
    if (!resultBox) return;

    btn.disabled = true;
    btn.textContent = 'Calculando equivalencias...';
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<p style="font-size: 0.85rem; color: #94a3b8;">Buscando matriz de conversión...</p>';

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Content-Type': 'application/json',
      'X-Tenant-Slug': '${config.tenantSlug}'
    };
    if (currentToken) {
      authHeaders['Authorization'] = 'Bearer ' + currentToken;
    }

    try {
      const res = await fetch(apiBase + '/api/v1/paints/ai/convert', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ sourceCode: code })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'No se encontró equivalencia');
      }

      const data = await res.json();
      const matchesHtml = (data.matches || []).map(m => {
        const rackBadge = m.ownedInRack 
          ? '<span style="font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.3);">✓ En tu Rack (' + (m.rackQuantity || 1) + ')</span>'
          : '<span style="font-size: 0.72rem; color: #64748b;">No registrado en rack</span>';

        return '<div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">' +
          '<div style="width: 32px; height: 32px; border-radius: 50%; background: ' + m.hexColor + '; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0;"></div>' +
          '<div style="flex: 1;">' +
            '<div style="font-size: 0.85rem; font-weight: 700; color: #fff;">' + m.brand + ' • ' + m.code + ' (' + m.name + ')</div>' +
            '<div style="font-size: 0.75rem; color: #94a3b8;">' + m.line + ' • ' + m.type.toUpperCase() + ' (' + m.finish + ')</div>' +
          '</div>' +
          '<div>' + rackBadge + '</div>' +
        '</div>';
      }).join('');

      const guide = data.airbrushGuide || {};

      resultBox.innerHTML = 
        '<div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 0.5rem;">' +
          '<div style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 0.6rem;">Equivalencias Exactas:</div>' +
          matchesHtml +
          '<div style="background: rgba(2,132,199,0.08); border: 1px solid rgba(2,132,199,0.25); border-radius: 8px; padding: 0.85rem; margin-top: 0.75rem;">' +
            '<div style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">🎯 Guía de Dilución & Aerógrafo:</div>' +
            '<div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">' +
              '• <strong>Thinner Recomendado:</strong> ' + guide.recommendedThinner + '<br>' +
              '• <strong>Ratio de Mezcla:</strong> ' + guide.thinningRatio + '<br>' +
              '• <strong>Presión Óptima:</strong> ' + guide.recommendedPSI + '<br>' +
              '• <strong>Secado:</strong> ' + guide.dryingTime + '<br>' +
              '• <em>Pro Tip:</em> ' + guide.proTips +
            '</div>' +
          '</div>' +
        '</div>';
    } catch (err) {
      resultBox.innerHTML = '<div style="color: #ef4444; font-size: 0.82rem; padding: 0.75rem; background: rgba(239,68,68,0.1); border-radius: 6px;">' + err.message + '</div>';
    } finally {
      btn.disabled = false;
      btn.textContent = '🔍 Calcular Equivalencias & Dilución';
    }
  }

  async function handleAiRecipeSubmit(e) {
    e.preventDefault();
    const query = document.getElementById('ai-recipe-query-input').value.trim();
    const btn = document.getElementById('btn-recipe-submit');
    const resultBox = document.getElementById('ai-recipe-result');
    if (!resultBox || !query) return;

    btn.disabled = true;
    btn.textContent = 'Consultando IA...';
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<p style="font-size: 0.85rem; color: #94a3b8;">Generando paleta y formulación con IA...</p>';

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Content-Type': 'application/json',
      'X-Tenant-Slug': '${config.tenantSlug}'
    };
    if (currentToken) {
      authHeaders['Authorization'] = 'Bearer ' + currentToken;
    }

    try {
      const res = await fetch(apiBase + '/api/v1/paints/ai/recipe', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ query })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al generar receta');
      }

      const data = await res.json();
      const paletteHtml = (data.colorPaletteHex || []).map(hex => 
        '<div style="width: 28px; height: 28px; border-radius: 6px; background: ' + hex + '; border: 1px solid rgba(255,255,255,0.2);" title="' + hex + '"></div>'
      ).join('');

      const componentsHtml = (data.components || []).map(c => {
        const inRackBadge = c.inUserRack 
          ? '<span style="font-size: 0.7rem; color: #4ade80;">✓ En tu Rack</span>' 
          : '<span style="font-size: 0.7rem; color: #94a3b8;">Frasco sugerido</span>';

        return '<div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.5rem 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.4rem;">' +
          '<div style="display: flex; align-items: center; gap: 0.6rem;">' +
            '<div style="width: 18px; height: 18px; border-radius: 50%; background: ' + c.hexColor + '; flex-shrink: 0;"></div>' +
            '<div>' +
              '<div style="font-size: 0.8rem; font-weight: 600; color: #fff;">' + c.partOrTonalStep + ': ' + c.brand + ' ' + c.code + '</div>' +
              '<div style="font-size: 0.72rem; color: #cbd5e1;">' + c.recommendedPaint + ' ' + inRackBadge + '</div>' +
            '</div>' +
          '</div>' +
          (c.percentage ? '<div style="font-size: 0.85rem; font-weight: 700; color: var(--accent);">' + c.percentage + '%</div>' : '') +
        '</div>';
      }).join('');

      const air = data.airbrushApplication || {};
      const engineBadge = data.aiEngine === 'gemini-3.8-flash'
        ? '<span style="font-size: 0.7rem; color: #38bdf8; background: rgba(56,189,248,0.15); padding: 0.15rem 0.4rem; border-radius: 4px;">⚡ Gemini 3.8 Flash AI</span>'
        : '<span style="font-size: 0.7rem; color: #a855f7; background: rgba(168,85,247,0.15); padding: 0.15rem 0.4rem; border-radius: 4px;">🧠 Base Experta de Modelistas</span>';

      resultBox.innerHTML = 
        '<div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 0.5rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">' +
            '<h4 style="font-size: 1rem; font-weight: 700; color: #fff;">' + data.recipeName + '</h4>' +
            engineBadge +
          '</div>' +
          '<p style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.75rem; line-height: 1.4;">' + data.description + '</p>' +
          '<div style="display: flex; gap: 0.35rem; margin-bottom: 0.75rem;">' + paletteHtml + '</div>' +
          '<div style="margin-bottom: 0.75rem;">' + componentsHtml + '</div>' +
          '<div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem;">' +
            '<div style="font-size: 0.78rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">⚖️ Mezcla y Proporciones:</div>' +
            '<p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.4;">' + data.mixingInstructions + '</p>' +
          '</div>' +
          '<div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); border-radius: 8px; padding: 0.75rem;">' +
            '<div style="font-size: 0.78rem; font-weight: 700; color: #4ade80; margin-bottom: 0.25rem;">💨 Aplicación con Aerógrafo:</div>' +
            '<div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.5;">' +
              '• <strong>Imprimación:</strong> ' + air.primer + '<br>' +
              '• <strong>Capa Base:</strong> ' + air.baseCoat + '<br>' +
              '• <strong>Sombra / Realce:</strong> ' + air.shadingOrHighlight + '<br>' +
              '• <strong>Barniz Final:</strong> ' + air.topCoat + '<br>' +
              '• <strong>Dilución:</strong> ' + air.thinnerRatio + ' a ' + air.psi +
            '</div>' +
          '</div>' +
        '</div>';
    } catch (err) {
      resultBox.innerHTML = '<div style="color: #ef4444; font-size: 0.82rem; padding: 0.75rem; background: rgba(239,68,68,0.1); border-radius: 6px;">' + err.message + '</div>';
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ Generar Receta con IA';
    }
  }

  function logout() {
    localStorage.removeItem('plamo_sso_token');
    localStorage.removeItem('plamo_sso_user');
    currentUser = null;
    currentToken = null;
    renderAuthUI();
    loadWorkbenchData();
  }

  // Initialize auth state and Google One-Tap on page load
  window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
  });
</script>

</body>
</html>`;
}
