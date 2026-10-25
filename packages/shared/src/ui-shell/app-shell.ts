import { renderViews } from './views';
import { renderModals } from './modals';
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
  CommissionBuilderRecord,
  HallOfFameItem,
  OpenGraphMetadata
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
  hallOfFame?: HallOfFameItem[];
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderAppShell(config: AppShellConfig, data: AppShellData, og?: OpenGraphMetadata): string {
  const isGunpla = config.tenantSlug === 'gunplajunkies';
  const defaultDomain = isGunpla ? 'gunplajunkies.com' : 'plamoscale.com';
  const ogTitle = og?.title || `${config.tenantName} — ${config.tenantTagline}`;
  const ogDesc = og?.description || 'Comunidad y plataforma de modelismo a escala. Bitácoras de armado, catálogo de kits, muestrario de pinturas y banco de trabajo personal.';
  const ogImage = og?.image || `/api/v1/og/default`;
  const ogUrl = og?.url || `https://${defaultDomain}/`;
  const ogType = og?.type || 'website';
  const ogSiteName = og?.siteName || config.tenantName;

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
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(ogDesc)}">

  <!-- OpenGraph / Social Sharing (Facebook, WhatsApp, Telegram, Discord, LinkedIn) -->
  <meta property="og:site_name" content="${escapeHtml(ogSiteName)}">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDesc)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(ogUrl)}">
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:locale" content="es_ES">

  <!-- Twitter / X Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@${isGunpla ? 'gunplajunkies' : 'plamoscale'}">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDesc)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">

  <link rel="manifest" href="/manifest.json">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="${config.tenantName}">
  <meta name="theme-color" content="${config.theme.primaryColor || '#1e293b'}">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
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

    /* Activity Bell & Dropdown Styles */
    .activity-bell-btn {
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: #cbd5e1;
      border-radius: 8px;
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1.05rem;
    }
    .activity-bell-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--primary);
      color: #fff;
    }
    .activity-unread-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      border-radius: 9999px;
      min-width: 16px;
      text-align: center;
      border: 2px solid #0b0f19;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
    }
    .activity-dropdown {
      position: absolute;
      right: 0;
      top: 46px;
      width: 360px;
      background: #0f172a;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
      z-index: 120;
      overflow: hidden;
      backdrop-filter: blur(16px);
      display: none;
    }
    .activity-dropdown.active {
      display: block;
      animation: fadeIn 0.15s ease;
    }
    .activity-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: background 0.15s;
    }
    .activity-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    .activity-item.unread {
      background: rgba(56, 189, 248, 0.07);
      border-left: 3px solid #38bdf8;
    }
    .activity-icon-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
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

    /* Community Contests & Voting Styles */
    .vote-btn {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .vote-btn.voted {
      background: rgba(251, 191, 36, 0.2) !important;
      color: #fbbf24 !important;
      border-color: #f59e0b !important;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.35);
      font-weight: 700;
    }
    .podium-card {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .podium-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent-color);
    }
    .podium-rank-1 { border-color: rgba(234, 179, 8, 0.5); background: linear-gradient(180deg, rgba(234, 179, 8, 0.12) 0%, transparent 100%); }
    .podium-rank-2 { border-color: rgba(148, 163, 184, 0.5); background: linear-gradient(180deg, rgba(148, 163, 184, 0.12) 0%, transparent 100%); }
    .podium-rank-3 { border-color: rgba(217, 119, 6, 0.5); background: linear-gradient(180deg, rgba(217, 119, 6, 0.12) 0%, transparent 100%); }

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

    /* 4-Way Paint Medium Selector Cards */
    .medium-select-card {
      background: var(--card-bg);
      border: 2px solid var(--border-color);
      border-radius: 10px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      user-select: none;
    }
    .medium-select-card:hover {
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
    .medium-select-card.active {
      border-color: var(--accent);
      background: rgba(2, 132, 199, 0.12);
      box-shadow: 0 0 15px rgba(2, 132, 199, 0.25);
    }
    .medium-select-card.active.lacquer {
      border-color: #a855f7;
      background: rgba(168, 85, 247, 0.12);
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.25);
    }
    .medium-select-card.active.acrylic {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.12);
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.25);
    }
    .medium-select-card.active.polyurethane {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.12);
      box-shadow: 0 0 15px rgba(34, 197, 94, 0.25);
    }
    .medium-select-card.active.montana_colors {
      border-color: #f97316;
      background: rgba(249, 115, 22, 0.12);
      box-shadow: 0 0 15px rgba(249, 115, 22, 0.25);
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

      <div class="nav-group-title">White-Label & Portales</div>
      <a class="nav-item" onclick="openNewTenantModal()">
        <span>🏛️ Crear Club / Portal</span>
        <span class="nav-badge" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8;">Nuevo</span>
      </a>
      <a id="nav-customize-theme" class="nav-item" onclick="openTenantThemeModal()" style="display: none;">
        <span>🎨 Personalizar Portal</span>
        <span class="nav-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">Admin</span>
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
      <!-- PWA Offline Status Badge -->
      <div id="pwa-offline-badge" style="display: none; background: rgba(234, 88, 12, 0.2); border: 1px solid #ea580c; color: #fb923c; font-size: 0.78rem; font-weight: 600; padding: 0.35rem 0.75rem; border-radius: 6px; align-items: center; gap: 0.35rem;">
        <span>📴</span>
        <span>Modo Offline</span>
      </div>

      <!-- PWA Install Prompt Button -->
      <button id="pwa-install-btn" class="filter-pill" style="display: none; border-color: rgba(34, 197, 94, 0.4); color: #4ade80; font-size: 0.8rem; padding: 0.38rem 0.75rem; align-items: center; gap: 0.35rem;" onclick="promptPwaInstall()">
        <span>📲</span>
        <span>Instalar App</span>
      </button>

      <!-- Portal Switcher -->
      <a href="${config.otherTenantUrl}" class="portal-switcher">
        <span>Ir a <strong>${config.otherTenantName}</strong> ➔</span>
      </a>

      <!-- White-Label Portal CTA -->
      <button class="filter-pill" onclick="openNewTenantModal()" style="font-size: 0.8rem; padding: 0.38rem 0.75rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; display: inline-flex; align-items: center; gap: 0.35rem;" title="Crear Nuevo Club o Portal White-Label">
        <span>🏛️</span>
        <span>Crear Portal</span>
      </button>

      <!-- Primary Action CTA -->
      <button class="btn-primary" onclick="openNewBuildModal()">
        <span>+ Nueva Bitácora</span>
      </button>

      <!-- In-App Activity Bell & Notifications Dropdown -->
      <div id="activity-bell-container" style="position: relative;">
        <button id="activity-bell-btn" class="activity-bell-btn" onclick="toggleActivityDropdown(event)" title="Notificaciones de actividad">
          <span>🔔</span>
          <span id="activity-unread-badge" class="activity-unread-badge" style="display: none;">0</span>
        </button>

        <!-- Activity Dropdown Menu -->
        <div id="activity-bell-dropdown" class="activity-dropdown">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 700; font-size: 0.9rem; color: #fff;">Actividad</span>
              <span id="activity-dropdown-count" style="font-size: 0.72rem; color: #94a3b8; background: rgba(255,255,255,0.08); padding: 0.1rem 0.4rem; border-radius: 9999px;">0 nuevas</span>
            </div>
            <button onclick="markAllNotificationsAsRead()" style="background: transparent; border: none; color: #38bdf8; font-size: 0.75rem; cursor: pointer; padding: 0.2rem 0.4rem; border-radius: 4px; font-weight: 600;">Marcar leídas</button>
          </div>

          <!-- Web Push Permission Banner inside dropdown -->
          <div id="activity-push-banner" style="display: none; padding: 0.6rem 1rem; background: rgba(56, 189, 248, 0.1); border-bottom: 1px solid rgba(56, 189, 248, 0.2); font-size: 0.78rem; justify-content: space-between; align-items: center;">
            <span style="color: #cbd5e1;">¿Activar alertas Web Push?</span>
            <button onclick="requestPushSubscription()" style="background: #0284c7; color: #fff; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; cursor: pointer;">Activar</button>
          </div>

          <!-- Notification List container -->
          <div id="activity-list-container" style="max-height: 360px; overflow-y: auto;">
            <div style="padding: 2rem 1rem; text-align: center; color: #64748b; font-size: 0.85rem;">
              <span>🔔 No hay notificaciones recientes</span>
            </div>
          </div>
        </div>
      </div>

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

${renderViews(config, data, { escapeHtml, categoryPills, founders })}

  </main>
</div>

${renderModals(config, data, { escapeHtml, birthYearOptions, kitOptions, paintOptions, isGunpla })}


<script>
  window.__COMM_BUILDERS = ${JSON.stringify(data.commissionBuilders || [])};

  // -------------------------------------------------------------------------
  // PWA & Service Worker Registration / Offline Cache Engine
  // -------------------------------------------------------------------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker activo en scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Error registrando Service Worker:', err);
        });
    });
  }

  // Real-time Online / Offline status monitoring
  function updateOnlineStatus() {
    const badge = document.getElementById('pwa-offline-badge');
    if (!badge) return;
    if (!navigator.onLine) {
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  window.addEventListener('DOMContentLoaded', updateOnlineStatus);

  // PWA Install Prompt handling
  let deferredPwaPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'inline-flex';
  });

  function promptPwaInstall() {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult && choiceResult.outcome === 'accepted') {
        console.log('[PWA] Aplicación instalada por el usuario');
      }
      deferredPwaPrompt = null;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.style.display = 'none';
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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

  window.__LIGHTBOX_CURRENT = { url: '', title: '', author: '' };

  function openLightbox(url, title, author) {
    window.__LIGHTBOX_CURRENT = { url: url, title: title, author: author };
    document.getElementById('lightbox-image').src = url;
    document.getElementById('lightbox-title').textContent = title;
    document.getElementById('lightbox-author').textContent = 'Construido y fotografiado por ' + author;
    document.getElementById('lightbox-modal').classList.add('active');
  }

  function openWhatsAppInquiryFromLightbox() {
    const cur = window.__LIGHTBOX_CURRENT || {};
    const authorUname = (cur.author || '').replace(/^@/, '');
    openWhatsAppInquiryModal(authorUname, cur.title || 'Obra del Showcase', 'showcase', null, cur.url);
  }

  let currentWhatsAppInquiryUrl = '';

  function openWhatsAppInquiryModal(builderUsername, itemTitle, itemType, slugOrId, itemUrl) {
    const modal = document.getElementById('modal-whatsapp-inquiry');
    if (!modal) return;

    document.getElementById('wa-inquiry-builder-username').value = builderUsername;
    document.getElementById('wa-inquiry-item-title').value = itemTitle;
    document.getElementById('wa-inquiry-slug-or-id').value = slugOrId || '';

    // Set default client name from logged in session if any
    const userJson = localStorage.getItem('plamo_sso_user');
    let defaultClientName = '';
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        defaultClientName = u.displayName || u.username || '';
      } catch (e) {}
    }
    const nameInput = document.getElementById('wa-inquiry-client-name');
    if (nameInput && !nameInput.value) {
      nameInput.value = defaultClientName;
    }

    document.getElementById('wa-inquiry-dest-label').textContent = '@' + builderUsername.replace(/^@/, '');
    document.getElementById('wa-inquiry-item-label').textContent = 'Obra / Proyecto: ' + itemTitle;

    // Reset radio to paint_recipe
    const radios = document.getElementsByName('wa-inquiry-type');
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].value === 'paint_recipe') radios[i].checked = true;
    }

    modal.style.display = 'flex';
    onWhatsAppInquiryTypeChange(itemUrl);
  }

  function closeWhatsAppInquiryModal(e) {
    if (!e || e.target.id === 'modal-whatsapp-inquiry' || !e.target) {
      const modal = document.getElementById('modal-whatsapp-inquiry');
      if (modal) modal.style.display = 'none';
    }
  }

  async function onWhatsAppInquiryTypeChange(providedUrl) {
    const builderUsername = document.getElementById('wa-inquiry-builder-username').value;
    const itemTitle = document.getElementById('wa-inquiry-item-title').value;
    const slugOrId = document.getElementById('wa-inquiry-slug-or-id').value;
    const clientName = document.getElementById('wa-inquiry-client-name').value;

    let selectedType = 'general';
    const radios = document.getElementsByName('wa-inquiry-type');
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        selectedType = radios[i].value;
        break;
      }
    }

    const previewArea = document.getElementById('wa-inquiry-message-preview');
    const apiBase = (typeof config !== 'undefined' && config.apiUrl) ? config.apiUrl : '';

    try {
      let endpoint = '';
      let fetchOpts = {};
      if (slugOrId) {
        endpoint = apiBase + '/api/v1/builds/' + encodeURIComponent(slugOrId) + '/whatsapp-inquiry?inquiryType=' + encodeURIComponent(selectedType) + '&clientName=' + encodeURIComponent(clientName);
        fetchOpts = { method: 'GET' };
      } else {
        endpoint = apiBase + '/api/v1/builds/whatsapp-inquiry';
        fetchOpts = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            builderUsername: builderUsername,
            itemTitle: itemTitle,
            inquiryType: selectedType,
            clientName: clientName,
            itemUrl: providedUrl || window.location.href
          })
        };
      }

      const res = await fetch(endpoint, fetchOpts);
      if (res.ok) {
        const data = await res.json();
        if (previewArea) previewArea.value = data.prefilledMessage;
        currentWhatsAppInquiryUrl = data.whatsappUrl;
        document.getElementById('wa-inquiry-target-phone').value = data.targetWhatsapp;
      }
    } catch (err) {
      console.warn('Error fetching WhatsApp inquiry template:', err);
    }
  }

  function handleWhatsAppInquirySubmit(e) {
    if (e) e.preventDefault();
    const previewArea = document.getElementById('wa-inquiry-message-preview');
    const customMessage = previewArea ? previewArea.value : '';
    const targetPhone = document.getElementById('wa-inquiry-target-phone').value || '+51 987 654 321';

    let launchUrl = '';
    if (targetPhone.startsWith('https://chat.whatsapp.com/')) {
      launchUrl = targetPhone;
    } else {
      const cleanDigits = targetPhone.replace(/[^0-9]/g, '');
      launchUrl = 'https://wa.me/' + cleanDigits + '?text=' + encodeURIComponent(customMessage);
    }

    window.open(launchUrl, '_blank');
    closeWhatsAppInquiryModal();
  }

  // --- Social Sharing & OpenGraph Link Engine ---
  async function shareSocialLink(title, url, text) {
    const fullUrl = url || window.location.href;
    const shareTitle = title || document.title;
    const shareText = text || ('Mira esta obra en ' + (window.__TENANT_SLUG === 'gunplajunkies' ? 'GunplaJunkies' : 'PlamoScale'));

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: fullUrl
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[Share] navigator.share error:', err);
        } else {
          return;
        }
      }
    }

    // Fallback: Copy to clipboard and alert / toast
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        showShareToast('¡Enlace copiado al portapapeles!');
      } else {
        prompt('Copia este enlace para compartir:', fullUrl);
      }
    } catch {
      prompt('Copia este enlace para compartir:', fullUrl);
    }
  }

  function showShareToast(message) {
    let toast = document.getElementById('share-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'share-toast-notification';
      toast.style.cssText = 'position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #16a34a; color: #fff; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 100000; transition: opacity 0.3s ease; opacity: 0; pointer-events: none;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => {
      if (toast) toast.style.opacity = '0';
    }, 2500);
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

  // --- Contests & Community Voting Engine ---
  let activeContestId = null;
  let userContestBuilds = [];

  function submitToContest(contestId) {
    openContestEntryModal(contestId, 'Concurso');
  }

  async function openContestEntryModal(contestId, contestTitle) {
    if (!currentUser || !currentToken) {
      alert('Debes iniciar sesión con tu cuenta de modelista para inscribir tus bitácoras en los concursos.');
      openAuthModal();
      return;
    }

    activeContestId = contestId;
    const modal = document.getElementById('modal-contest-entry');
    const contestNameEl = document.getElementById('contest-entry-contest-name');
    const select = document.getElementById('contest-entry-build-select');
    const preview = document.getElementById('contest-entry-build-preview');
    const emptyState = document.getElementById('contest-entry-empty-state');
    const errorMsg = document.getElementById('contest-entry-error-msg');
    const btn = document.getElementById('btn-confirm-contest-entry');

    if (contestNameEl) contestNameEl.textContent = 'Concurso: ' + contestTitle;
    if (errorMsg) errorMsg.style.display = 'none';

    if (modal) modal.classList.add('active');

    // Fetch user builds from API
    if (select) {
      select.innerHTML = '<option value="">Cargando tus proyectos...</option>';
      select.disabled = true;
    }
    if (preview) preview.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';

    try {
      const res = await fetch('/api/v1/builds?username=' + encodeURIComponent(currentUser.username));
      if (!res.ok) throw new Error('No se pudieron cargar las bitácoras');
      const data = await res.json();
      const builds = data.items || [];
      userContestBuilds = builds;

      if (builds.length === 0) {
        if (select) {
          select.innerHTML = '<option value="">Sin proyectos registrados</option>';
          select.disabled = true;
        }
        if (emptyState) emptyState.style.display = 'block';
        if (btn) btn.disabled = true;
      } else {
        if (select) {
          select.disabled = false;
          select.innerHTML = builds.map(b => 
            '<option value="' + b.id + '">' + escapeHtml(b.title) + ' (' + (b.category || 'Gunpla') + ')</option>'
          ).join('');
        }
        if (btn) btn.disabled = false;
        onContestBuildSelectChange();
      }
    } catch (err) {
      if (select) select.innerHTML = '<option value="">Error al cargar proyectos</option>';
      if (errorMsg) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = 'block';
      }
    }
  }

  function closeContestEntryModal(e) {
    if (!e || e.target.id === 'modal-contest-entry' || e.target.classList.contains('auth-close')) {
      const modal = document.getElementById('modal-contest-entry');
      if (modal) modal.classList.remove('active');
    }
  }

  function onContestBuildSelectChange() {
    const select = document.getElementById('contest-entry-build-select');
    const preview = document.getElementById('contest-entry-build-preview');
    const img = document.getElementById('contest-entry-preview-img');
    const title = document.getElementById('contest-entry-preview-title');
    const meta = document.getElementById('contest-entry-preview-meta');

    if (!select || !select.value) {
      if (preview) preview.style.display = 'none';
      return;
    }

    const selected = userContestBuilds.find(b => b.id === select.value);
    if (selected && preview) {
      preview.style.display = 'flex';
      if (img) img.src = selected.coverImageUrl || (selected.steps && selected.steps[0]?.photoUrls[0]) || '/uploads/sample.jpg';
      if (title) title.textContent = selected.title;
      if (meta) meta.textContent = (selected.category || 'Gunpla').toUpperCase() + ' • ' + (selected.steps ? selected.steps.length : 0) + ' etapas documentadas';
    }
  }

  async function confirmContestSubmission() {
    if (!activeContestId || !currentToken) return;
    const select = document.getElementById('contest-entry-build-select');
    const buildId = select ? select.value : null;
    const btn = document.getElementById('btn-confirm-contest-entry');
    const errorMsg = document.getElementById('contest-entry-error-msg');

    if (!buildId) {
      alert('Por favor selecciona una bitácora para inscribir.');
      return;
    }

    if (errorMsg) errorMsg.style.display = 'none';
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Inscribiendo...';
    }

    try {
      const res = await fetch('/api/v1/contests/' + activeContestId + '/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify({ buildId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al inscribir el proyecto en el concurso');
      }

      alert('🎉 ¡Felicitaciones! Tu obra "' + data.title + '" ha sido inscrita exitosamente en el concurso.');
      closeContestEntryModal();

      // Update participants count badge if present
      const countBadge = document.getElementById('contest-participants-badge-' + activeContestId);
      if (countBadge) {
        const currentCount = parseInt(countBadge.textContent) || 0;
        countBadge.textContent = (currentCount + 1) + ' Inscritos';
      }

      // Dynamically add card to the contest entries grid
      const grid = document.getElementById('contest-entries-grid-' + activeContestId);
      if (grid) {
        const cardHtml = 
          '<div id="contest-entry-card-' + data.id + '" style="background: var(--bg-dark); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; animation: fadeIn 0.4s ease;">' +
            '<div style="position: relative; width: 100%; height: 180px; cursor: pointer;" onclick="openLightbox(&quot;' + data.coverImageUrl + '&quot;, &quot;' + escapeHtml(data.title) + '&quot;, &quot;' + data.username + '&quot;)">' +
              '<img src="' + data.coverImageUrl + '" alt="' + escapeHtml(data.title) + '" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />' +
              '<span style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.15); font-weight: 600;">' +
                (data.category || 'GUNPLA').toUpperCase() +
              '</span>' +
            '</div>' +
            '<div style="padding: 0.85rem 1rem; display: flex; flex-direction: column; flex: 1;">' +
              '<div style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">' + escapeHtml(data.title) + '</div>' +
              '<div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.65rem;">Por <strong>@' + data.username + '</strong> (¡Tu inscripción!)</div>' +
              '<div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.65rem;">' +
                '<span id="vote-count-' + data.id + '" style="font-size: 0.85rem; font-weight: 600; color: #fbbf24;">⭐ 0 Votos</span>' +
                '<button id="btn-vote-' + data.id + '" class="filter-pill vote-btn" style="padding: 0.3rem 0.85rem; font-size: 0.78rem;" data-contest-id="' + activeContestId + '" data-entry-id="' + data.id + '" data-voters="[]" onclick="voteEntry(&quot;' + activeContestId + '&quot;, &quot;' + data.id + '&quot;, event)">' +
                  'Votar ⭐' +
                '</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        grid.insertAdjacentHTML('afterbegin', cardHtml);
      }
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = 'block';
      } else {
        alert(err.message);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🏆 Confirmar Inscripción';
      }
    }
  }

  async function voteEntry(contestId, entryId, event) {
    if (event) event.stopPropagation();
    if (!currentUser || !currentToken) {
      alert('Debes iniciar sesión con Google o tu cuenta de modelista para votar en los concursos comunitarios.');
      openAuthModal();
      return;
    }

    const btn = document.getElementById('btn-vote-' + entryId);
    const countEl = document.getElementById('vote-count-' + entryId);
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('/api/v1/contests/' + contestId + '/entries/' + entryId + '/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al emitir el voto');
      }

      if (countEl) {
        countEl.textContent = '⭐ ' + data.voteCount + ' Votos';
      }

      if (btn) {
        if (data.voted) {
          btn.classList.add('voted');
          btn.innerHTML = '⭐ ¡Votado!';
        } else {
          btn.classList.remove('voted');
          btn.innerHTML = 'Votar ⭐';
        }
      }
    } catch (err) {
      alert('Error en la votación: ' + err.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function updateContestVotesForCurrentUser() {
    if (!currentUser) return;
    document.querySelectorAll('.vote-btn').forEach(btn => {
      const votersRaw = btn.getAttribute('data-voters');
      if (votersRaw) {
        try {
          const voters = JSON.parse(votersRaw);
          if (Array.isArray(voters) && voters.includes(currentUser.id)) {
            btn.classList.add('voted');
            btn.innerHTML = '⭐ ¡Votado!';
          }
        } catch (e) {}
      }
    });
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

      const isTenantAdminOrAdmin = currentUser.roles && (
        currentUser.roles.includes('admin') ||
        currentUser.roles.includes('tenant_admin') ||
        currentUser.username === 'rpineda'
      );

      const isJudge = currentUser.roles && (
        currentUser.roles.includes('admin') ||
        currentUser.roles.includes('tenant_admin') ||
        currentUser.roles.includes('moderator') ||
        currentUser.username === 'rpineda'
      );

      document.querySelectorAll('.btn-judge-entry').forEach(btn => {
        btn.style.display = isJudge ? 'inline-flex' : 'none';
      });

      const navThemeBtn = document.getElementById('nav-customize-theme');
      if (navThemeBtn) navThemeBtn.style.display = isTenantAdminOrAdmin ? 'flex' : 'none';

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
            (isTenantAdminOrAdmin ? '<a class="user-dropdown-item" onclick="openTenantThemeModal()">🎨 Personalizar Tema del Portal</a>' : '') +
            '<a class="user-dropdown-item" onclick="openNewTenantModal()">🏛️ Crear Nuevo Club / Portal</a>' +
            '<a class="user-dropdown-item" onclick="goToWorkbench()">🛠️ Mi Workbench & Stash</a>' +
            '<a class="user-dropdown-item" style="color: #ef4444;" onclick="logout()">🚪 Cerrar Sesión</a>' +
          '</div>' +
        '</div>';
      updateContestVotesForCurrentUser();
      loadUserNotifications();
    } else {
      const navThemeBtn = document.getElementById('nav-customize-theme');
      if (navThemeBtn) navThemeBtn.style.display = 'none';

      document.querySelectorAll('.btn-judge-entry').forEach(btn => {
        btn.style.display = 'none';
      });

      container.innerHTML =
        '<button id="btn-open-login" class="btn-auth" onclick="openAuthModal()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/><path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17C3.7 20.7 7.5 23.5 12 23.5z"/></svg>' +
          '<span>Iniciar Sesión</span>' +
        '</button>';
      loadUserNotifications();
    }
  }

  // -------------------------------------------------------------------------
  // Official Judge Rubric Scoring & Certificate Functions
  // -------------------------------------------------------------------------
  function openJudgeModal(contestId, entryId, title) {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const modal = document.getElementById('modal-judge-entry');
    const contestIdInput = document.getElementById('judge-contest-id');
    const entryIdInput = document.getElementById('judge-entry-id');
    const titleEl = document.getElementById('judge-modal-entry-title');
    const statusMsg = document.getElementById('judge-status-msg');

    if (contestIdInput) contestIdInput.value = contestId;
    if (entryIdInput) entryIdInput.value = entryId;
    if (titleEl) titleEl.textContent = 'Obra: ' + title;
    if (statusMsg) statusMsg.style.display = 'none';

    updateJudgeTotal();
    if (modal) modal.classList.add('active');
  }

  function closeJudgeModal(e) {
    if (!e || e.target.id === 'modal-judge-entry' || e.target.classList.contains('auth-close')) {
      const modal = document.getElementById('modal-judge-entry');
      if (modal) modal.classList.remove('active');
    }
  }

  function updateJudgeTotal() {
    const assembly = Number(document.getElementById('judge-score-assembly')?.value || 8);
    const painting = Number(document.getElementById('judge-score-painting')?.value || 8);
    const finish = Number(document.getElementById('judge-score-finish')?.value || 8);
    const creativity = Number(document.getElementById('judge-score-creativity')?.value || 8);

    const valAssembly = document.getElementById('score-val-assembly');
    const valPainting = document.getElementById('score-val-painting');
    const valFinish = document.getElementById('score-val-finish');
    const valCreativity = document.getElementById('score-val-creativity');

    if (valAssembly) valAssembly.textContent = assembly + ' / 10';
    if (valPainting) valPainting.textContent = painting + ' / 10';
    if (valFinish) valFinish.textContent = finish + ' / 10';
    if (valCreativity) valCreativity.textContent = creativity + ' / 10';

    const total = assembly + painting + finish + creativity;
    const totalEl = document.getElementById('judge-total-score');
    const gradeEl = document.getElementById('judge-total-grade');

    if (totalEl) {
      totalEl.innerHTML = total + ' <span style="font-size: 1rem; color: #94a3b8;">/ 40</span>';
    }

    if (gradeEl) {
      if (total >= 36) {
        gradeEl.textContent = '🌟 Sobresaliente (Medalla de Oro)';
        gradeEl.style.color = '#eab308';
      } else if (total >= 30) {
        gradeEl.textContent = '✨ Excelente (Plata / Bronce)';
        gradeEl.style.color = '#38bdf8';
      } else if (total >= 24) {
        gradeEl.textContent = '👍 Muy Bueno (Diploma de Honor)';
        gradeEl.style.color = '#22c55e';
      } else {
        gradeEl.textContent = 'Mención de Participación';
        gradeEl.style.color = '#94a3b8';
      }
    }
  }

  async function submitJudgeScore(e) {
    e.preventDefault();
    if (!currentToken) {
      alert('Debes iniciar sesión con tu cuenta de juez o administrador.');
      return;
    }

    const contestId = document.getElementById('judge-contest-id')?.value;
    const entryId = document.getElementById('judge-entry-id')?.value;
    const assembly = Number(document.getElementById('judge-score-assembly')?.value || 8);
    const painting = Number(document.getElementById('judge-score-painting')?.value || 8);
    const finish = Number(document.getElementById('judge-score-finish')?.value || 8);
    const creativity = Number(document.getElementById('judge-score-creativity')?.value || 8);
    const feedback = document.getElementById('judge-feedback')?.value;

    const btn = document.getElementById('btn-submit-judge');
    const statusMsg = document.getElementById('judge-status-msg');
    if (btn) btn.disabled = true;

    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const res = await fetch(apiBase + '/api/v1/contests/' + contestId + '/entries/' + entryId + '/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify({
          scores: { assembly, painting, finish, creativity },
          feedback
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al emitir calificación');
      }

      const scoreLabel = document.getElementById('judge-score-label-' + entryId);
      if (scoreLabel) {
        scoreLabel.innerHTML = '⚖️ Rúbrica Jueces: <strong>' + data.entry.judgeScoreAverage + ' / 40 pts</strong> (' + (data.entry.judgeCount || 1) + ' eval.)';
        scoreLabel.style.color = '#c084fc';
      }

      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#22c55e';
        statusMsg.textContent = '✓ ¡Calificación oficial de ' + data.judgeScore.totalScore + '/40 pts emitida con éxito!';
      }

      setTimeout(() => {
        closeJudgeModal();
      }, 1400);
    } catch (err) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#ef4444';
        statusMsg.textContent = err.message || 'Error inesperado';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function viewCertificate(contestId, entryId) {
    const modal = document.getElementById('modal-contest-certificate');
    const target = document.getElementById('certificate-display-target');
    if (modal) modal.classList.add('active');
    if (target) target.innerHTML = '<div style="padding: 3rem; text-align: center; color: #94a3b8;">Generando diploma oficial con firma y código QR...</div>';

    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const res = await fetch(apiBase + '/api/v1/contests/' + contestId + '/entries/' + entryId + '/certificate');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al obtener certificado');
      }

      if (target && data.htmlTemplate) {
        target.innerHTML = '<iframe id="cert-iframe" srcdoc="' + escapeHtml(data.htmlTemplate) + '" style="width: 100%; height: 580px; border: none; background: #fff;"></iframe>';
      }
    } catch (err) {
      if (target) {
        target.innerHTML = '<div style="padding: 2rem; color: #ef4444; text-align: center;">Error al cargar diploma: ' + escapeHtml(err.message) + '</div>';
      }
    }
  }

  function closeCertificateModal(e) {
    if (!e || e.target.id === 'modal-contest-certificate' || e.target.classList.contains('auth-close')) {
      const modal = document.getElementById('modal-contest-certificate');
      if (modal) modal.classList.remove('active');
    }
  }

  function printCertificate() {
    const iframe = document.getElementById('cert-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    } else {
      window.print();
    }
  }

  // -------------------------------------------------------------------------
  // White-Label Tenant & Theme Editor Logic
  // -------------------------------------------------------------------------
  function syncColorInput(targetId, value) {
    const el = document.getElementById(targetId);
    if (el) el.value = value;
  }

  function applyThemePreset(primary, accent, surface) {
    syncColorInput('theme-primary-color', primary);
    syncColorInput('theme-primary-hex', primary);
    syncColorInput('theme-accent-color', accent);
    syncColorInput('theme-accent-hex', accent);
    syncColorInput('theme-surface-color', surface);
    syncColorInput('theme-surface-hex', surface);
    updateThemePreview();
  }

  function updateThemePreview() {
    const primary = document.getElementById('theme-primary-hex')?.value || '#1e293b';
    const accent = document.getElementById('theme-accent-hex')?.value || '#3b82f6';
    const surface = document.getElementById('theme-surface-hex')?.value || '#0f172a';
    const name = document.getElementById('theme-tenant-name')?.value || '${escapeHtml(config.tenantName)}';
    const tagline = document.getElementById('theme-tenant-tagline')?.value || '${escapeHtml(config.tenantTagline)}';

    const box = document.getElementById('theme-preview-box');
    const brand = document.getElementById('theme-preview-brand');
    const badge = document.getElementById('theme-preview-badge');
    const taglineEl = document.getElementById('theme-preview-tagline');
    const btnPrimary = document.getElementById('theme-preview-btn-primary');
    const btnAccent = document.getElementById('theme-preview-btn-accent');

    if (box) box.style.background = surface;
    if (brand) brand.textContent = name;
    if (taglineEl) taglineEl.textContent = tagline;
    if (badge) badge.style.background = accent;
    if (btnPrimary) btnPrimary.style.background = primary;
    if (btnAccent) btnAccent.style.background = accent;
  }

  function previewThemeLive() {
    const primary = document.getElementById('theme-primary-hex')?.value;
    const accent = document.getElementById('theme-accent-hex')?.value;
    const surface = document.getElementById('theme-surface-hex')?.value;
    if (primary) document.documentElement.style.setProperty('--primary', primary);
    if (accent) document.documentElement.style.setProperty('--accent', accent);
    if (surface) {
      document.documentElement.style.setProperty('--bg-dark', surface);
      document.documentElement.style.setProperty('--card-bg', surface);
    }
    const statusMsg = document.getElementById('theme-status-msg');
    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#38bdf8';
      statusMsg.textContent = '✓ Tema previsualizado en vivo en la pantalla. Haz clic en "Guardar Cambios" para fijarlo.';
    }
  }

  function openTenantThemeModal() {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const modal = document.getElementById('modal-tenant-theme');
    if (modal) modal.classList.add('active');
    updateThemePreview();
  }

  function closeTenantThemeModal(e) {
    if (!e || e.target.id === 'modal-tenant-theme' || e.target.classList.contains('auth-close')) {
      const modal = document.getElementById('modal-tenant-theme');
      if (modal) modal.classList.remove('active');
    }
  }

  async function saveTenantTheme(e) {
    e.preventDefault();
    if (!currentToken) {
      alert('Debes iniciar sesión como administrador para guardar cambios de marca.');
      return;
    }

    const btn = document.getElementById('btn-save-theme');
    const statusMsg = document.getElementById('theme-status-msg');
    if (btn) btn.disabled = true;

    const name = document.getElementById('theme-tenant-name')?.value;
    const tagline = document.getElementById('theme-tenant-tagline')?.value;
    const logoText = document.getElementById('theme-tenant-logo-text')?.value;
    const primaryColor = document.getElementById('theme-primary-hex')?.value;
    const accentColor = document.getElementById('theme-accent-hex')?.value;
    const surfaceColor = document.getElementById('theme-surface-hex')?.value;

    const selectedCategories = Array.from(
      document.querySelectorAll('input[name="theme-category"]:checked')
    ).map(el => el.value);

    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const tenantSlug = '${config.tenantSlug}';
      const res = await fetch(apiBase + '/api/v1/tenants/' + tenantSlug, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify({
          name,
          tagline,
          allowedCategories: selectedCategories,
          themeConfig: {
            primaryColor,
            accentColor,
            surfaceColor,
            logoText
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al guardar configuración del portal');
      }

      previewThemeLive();
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#22c55e';
        statusMsg.textContent = '✓ ¡Cambios de marca y tema guardados exitosamente!';
      }
      setTimeout(() => {
        closeTenantThemeModal();
        window.location.reload();
      }, 1200);
    } catch (err) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#ef4444';
        statusMsg.textContent = err.message || 'Error inesperado';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // -------------------------------------------------------------------------
  // New Tenant Onboarding Modal Logic
  // -------------------------------------------------------------------------
  function openNewTenantModal() {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const modal = document.getElementById('modal-new-tenant');
    if (modal) modal.classList.add('active');
  }

  function closeNewTenantModal(e) {
    if (!e || e.target.id === 'modal-new-tenant' || e.target.classList.contains('auth-close')) {
      const modal = document.getElementById('modal-new-tenant');
      if (modal) modal.classList.remove('active');
    }
  }

  function autoSuggestSlug(name) {
    const slugInput = document.getElementById('new-tenant-slug');
    const domainInput = document.getElementById('new-tenant-domain');
    if (!slugInput || !name) return;
    const cleanSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    slugInput.value = cleanSlug;
    if (domainInput && !domainInput.value) {
      domainInput.value = cleanSlug + '.plamoscale.com';
    }
  }

  function applyNewTenantPreset(primary, accent, surface) {
    syncColorInput('new-tenant-primary-color', primary);
    syncColorInput('new-tenant-primary-hex', primary);
    syncColorInput('new-tenant-accent-color', accent);
    syncColorInput('new-tenant-accent-hex', accent);
    syncColorInput('new-tenant-surface-color', surface);
    syncColorInput('new-tenant-surface-hex', surface);
  }

  async function createNewTenant(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-create-tenant');
    const statusMsg = document.getElementById('new-tenant-status-msg');
    if (btn) btn.disabled = true;

    const name = document.getElementById('new-tenant-name')?.value;
    const slug = document.getElementById('new-tenant-slug')?.value;
    const domain = document.getElementById('new-tenant-domain')?.value;
    const tagline = document.getElementById('new-tenant-tagline')?.value;
    const contactEmail = document.getElementById('new-tenant-email')?.value;
    const primaryColor = document.getElementById('new-tenant-primary-hex')?.value;
    const accentColor = document.getElementById('new-tenant-accent-hex')?.value;
    const surfaceColor = document.getElementById('new-tenant-surface-hex')?.value;

    const selectedCategories = Array.from(
      document.querySelectorAll('input[name="new-tenant-category"]:checked')
    ).map(el => el.value);

    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const headers = { 'Content-Type': 'application/json' };
      if (currentToken) {
        headers['Authorization'] = 'Bearer ' + currentToken;
      }

      const res = await fetch(apiBase + '/api/v1/tenants', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slug,
          name,
          domain,
          tagline,
          contactEmail,
          allowedCategories: selectedCategories,
          themeConfig: {
            primaryColor,
            accentColor,
            surfaceColor,
            logoText: name.toUpperCase()
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al crear portal');
      }

      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#22c55e';
        statusMsg.innerHTML = '🎉 ¡Portal creado con éxito! Slug: <strong>' + data.slug + '</strong>. Eres administrador del nuevo portal.';
      }

      // If current user is logged in, grant role locally too
      if (currentUser && currentUser.roles && !currentUser.roles.includes('tenant_admin')) {
        currentUser.roles.push('tenant_admin');
        localStorage.setItem('plamo_sso_user', JSON.stringify(currentUser));
        renderAuthUI();
      }

      setTimeout(() => {
        closeNewTenantModal();
        alert('Portal "' + data.name + '" desplegado correctamente.\\nPuedes acceder usando subdominio o enviando cabecera X-Tenant-Slug: ' + data.slug);
      }, 1500);
    } catch (err) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#ef4444';
        statusMsg.textContent = err.message || 'Error inesperado';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // -------------------------------------------------------------------------
  // Interactive Custom Commissions & Painting Orders Logic (B2)
  // -------------------------------------------------------------------------
  function openCommissionModal(builderUsername, builderDisplayName, startingPrice) {
    const modal = document.getElementById('modal-commission-request');
    const uInput = document.getElementById('comm-builder-username');
    const dInput = document.getElementById('comm-builder-display-name');
    const banner = document.getElementById('comm-target-builder-banner');
    const statusMsg = document.getElementById('comm-form-status');

    if (uInput) uInput.value = builderUsername;
    if (dInput) dInput.value = builderDisplayName;
    if (banner) {
      banner.textContent = 'Destinatario: ' + builderDisplayName + ' (@' + builderUsername + ') • Tarifa estimada desde PEN ' + (startingPrice || 150);
    }
    if (statusMsg) statusMsg.style.display = 'none';

    // Autofill client info if logged in
    if (currentUser) {
      const nameInput = document.getElementById('comm-client-name');
      const emailInput = document.getElementById('comm-client-email');
      const waInput = document.getElementById('comm-client-whatsapp');

      if (nameInput && !nameInput.value) nameInput.value = currentUser.displayName || currentUser.username;
      if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
      if (waInput && !waInput.value && currentUser.whatsapp) waInput.value = currentUser.whatsapp;
    }

    if (modal) modal.classList.add('active');
  }

  function closeCommissionModal(e) {
    if (!e || e.target.id === 'modal-commission-request' || e.target.classList.contains('auth-close') || e.target.textContent === 'Cancelar') {
      const modal = document.getElementById('modal-commission-request');
      if (modal) modal.classList.remove('active');
    }
  }

  async function submitCommissionRequest(e) {
    e.preventDefault();
    const btn = document.getElementById('comm-submit-btn');
    const statusMsg = document.getElementById('comm-form-status');

    const builderUsername = document.getElementById('comm-builder-username')?.value;
    const kitTitle = document.getElementById('comm-kit-title')?.value;
    const scaleCategory = document.getElementById('comm-scale-category')?.value;
    const scopeLevel = document.querySelector('input[name="comm-scope-level"]:checked')?.value || 'level_2_custom_paint';
    const kitSupply = document.getElementById('comm-kit-supply')?.value;
    const targetBudgetVal = document.getElementById('comm-target-budget')?.value;
    const targetBudget = targetBudgetVal ? parseFloat(targetBudgetVal) : undefined;
    const clientName = document.getElementById('comm-client-name')?.value;
    const clientWhatsapp = document.getElementById('comm-client-whatsapp')?.value;
    const clientEmail = document.getElementById('comm-client-email')?.value;
    const clientCity = document.getElementById('comm-client-city')?.value;
    const projectNotes = document.getElementById('comm-project-notes')?.value;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Enviando solicitud...';
    }

    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const headers = {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': '${config.tenantSlug}'
      };
      if (currentToken) {
        headers['Authorization'] = 'Bearer ' + currentToken;
      }

      const res = await fetch(apiBase + '/api/v1/commissions/requests', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          builderUsername,
          kitTitle,
          scaleCategory,
          scopeLevel,
          kitSupply,
          targetBudget,
          currency: 'PEN',
          clientName,
          clientWhatsapp,
          clientEmail,
          clientCity,
          projectNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al enviar solicitud de encargo');
      }

      closeCommissionModal();

      // Show success modal with tracking code & WhatsApp quick-action
      const successModal = document.getElementById('modal-commission-success');
      const codeSlot = document.getElementById('comm-success-code');
      const waBtn = document.getElementById('comm-success-whatsapp-btn');

      if (codeSlot) codeSlot.textContent = data.request.code;

      if (waBtn) {
        const targetB = (window.__COMM_BUILDERS || []).find(b => b.username === builderUsername);
        const waUrl = targetB?.whatsappUrl || 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx';
        const msg = 'Hola @' + builderUsername + ', te acabo de enviar una solicitud de encargo en PlamoScale con código ' + data.request.code + ' para mi maqueta "' + kitTitle + '". ¿Podemos coordinar los detalles?';
        waBtn.href = waUrl.startsWith('https://chat.whatsapp.com') 
          ? waUrl 
          : 'https://wa.me/' + waUrl.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg);
      }

      if (successModal) successModal.classList.add('active');

      if (currentUser && currentToken) {
        loadWorkbenchData();
      }
    } catch (err) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#ef4444';
        statusMsg.textContent = err.message || 'Error inesperado al enviar el encargo';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🚀 Enviar Solicitud de Encargo';
      }
    }
  }

  function closeCommissionSuccessModal(e) {
    if (!e || e.target.id === 'modal-commission-success' || e.target.classList.contains('auth-close')) {
      const modal = document.getElementById('modal-commission-success');
      if (modal) modal.classList.remove('active');
    }
  }

  function openMarketplaceInquiryModal(listingId, kitTitle, sellerUsername) {
    const modal = document.getElementById('modal-marketplace-inquiry');
    const idInput = document.getElementById('inquiry-listing-id');
    const banner = document.getElementById('inquiry-modal-kit-banner');
    const statusMsg = document.getElementById('inquiry-form-status');

    if (idInput) idInput.value = listingId;
    if (banner) {
      banner.textContent = 'Kit: ' + kitTitle + ' • Vendedor: @' + sellerUsername;
    }
    if (statusMsg) statusMsg.style.display = 'none';

    // Autofill buyer info if logged in
    if (currentUser) {
      const nameInput = document.getElementById('inquiry-buyer-name');
      const emailInput = document.getElementById('inquiry-buyer-email');
      const phoneInput = document.getElementById('inquiry-buyer-phone');

      if (nameInput && !nameInput.value) nameInput.value = currentUser.displayName || currentUser.username;
      if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
      if (phoneInput && !phoneInput.value && currentUser.whatsapp) phoneInput.value = currentUser.whatsapp;
    }

    if (modal) modal.classList.add('active');
  }

  function closeMarketplaceInquiryModal(e) {
    if (!e || e.target.id === 'modal-marketplace-inquiry' || e.target.classList.contains('auth-close') || e.target.textContent === 'Cancelar') {
      const modal = document.getElementById('modal-marketplace-inquiry');
      if (modal) modal.classList.remove('active');
    }
  }

  async function submitMarketplaceInquiry(e) {
    e.preventDefault();
    const btn = document.getElementById('inquiry-submit-btn');
    const statusMsg = document.getElementById('inquiry-form-status');

    const listingId = document.getElementById('inquiry-listing-id')?.value;
    const buyerName = document.getElementById('inquiry-buyer-name')?.value;
    const buyerEmail = document.getElementById('inquiry-buyer-email')?.value;
    const buyerPhone = document.getElementById('inquiry-buyer-phone')?.value;
    const offerPriceVal = document.getElementById('inquiry-offer-price')?.value;
    const offerPrice = offerPriceVal ? parseFloat(offerPriceVal) : undefined;
    const message = document.getElementById('inquiry-message')?.value;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Enviando consulta...';
    }

    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const headers = {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': '${config.tenantSlug}'
      };
      if (currentToken) {
        headers['Authorization'] = 'Bearer ' + currentToken;
      }

      const res = await fetch(apiBase + '/api/v1/marketplace/listings/' + listingId + '/inquiries', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          buyerName,
          buyerEmail,
          buyerPhone,
          offerPrice,
          message
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al enviar consulta');
      }

      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(34, 197, 94, 0.2)';
        statusMsg.style.color = '#4ade80';
        statusMsg.style.border = '1px solid rgba(34, 197, 94, 0.4)';
        statusMsg.textContent = '¡Consulta enviada al vendedor con éxito por correo!';
      }

      setTimeout(() => {
        closeMarketplaceInquiryModal();
        const form = document.getElementById('form-marketplace-inquiry');
        if (form) form.reset();
        if (statusMsg) statusMsg.style.display = 'none';
      }, 1800);

    } catch (err) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(239, 68, 68, 0.2)';
        statusMsg.style.color = '#f87171';
        statusMsg.style.border = '1px solid rgba(239, 68, 68, 0.4)';
        statusMsg.textContent = err.message;
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✉️ Enviar Consulta por Email';
      }
    }
  }

  function filterWbCommissions(subfilter) {
    window.__COMM_SUBFILTER = subfilter;
    const btnReceived = document.getElementById('comm-subfilter-received');
    const btnSent = document.getElementById('comm-subfilter-sent');

    if (btnReceived) btnReceived.classList.toggle('active', subfilter === 'received');
    if (btnSent) btnSent.classList.toggle('active', subfilter === 'sent');

    renderWbCommissions();
  }

  function renderWbCommissions() {
    const container = document.getElementById('wb-commissions-list');
    if (!container) return;
    const filter = window.__COMM_SUBFILTER || 'received';
    const allComms = window.__WB_COMMISSIONS || [];

    const items = allComms.filter(c => {
      if (filter === 'received') {
        return c.builderUsername && c.builderUsername.toLowerCase() === (currentUser?.username || '').toLowerCase();
      } else {
        return (c.clientUserId && c.clientUserId === currentUser?.id) ||
               (c.clientEmail && c.clientEmail.toLowerCase() === (currentUser?.email || '').toLowerCase());
      }
    });

    const scopeLabels = {
      level_1_clean_build: 'Nivel 1: Montaje Limpio & Panel Lining',
      level_2_custom_paint: 'Nivel 2: Pintura Custom & Aerografía',
      level_3_weathering: 'Nivel 3: Weathering & Desgaste Avanzado',
      level_4_masterpiece: 'Nivel 4: Masterpiece & Diorama'
    };

    const statusBadges = {
      pending: '<span class="status-badge" style="background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4);">🟡 Pendiente de Cotización</span>',
      quoted: '<span class="status-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">🔵 Cotizado por Modelista</span>',
      accepted: '<span class="status-badge" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4);">🟢 Aceptado</span>',
      in_progress: '<span class="status-badge" style="background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4);">🟠 En Mesa de Trabajo (WIP)</span>',
      completed: '<span class="status-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);">🟣 Finalizado</span>',
      declined: '<span class="status-badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);">⚪ Cancelado / Rechazado</span>'
    };

    if (items.length === 0) {
      container.innerHTML = 
        '<div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 10px; padding: 3rem 1.5rem; text-align: center;">' +
          '<div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💼</div>' +
          '<h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.4rem;">' +
            (filter === 'received' ? 'No tienes solicitudes de encargo recibidas' : 'No has enviado ninguna solicitud de encargo') +
          '</h3>' +
          '<p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">' +
            (filter === 'received' ? 'Cuando otros modelistas o clientes soliciten tus servicios de armado y pintura, aparecerán aquí para que envíes tu cotización.' : 'Explora el directorio de modelistas para solicitar el armado y pintura profesional de tu maqueta favorita.') +
          '</p>' +
          '<button class="btn-primary" onclick="switchTab(&quot;commissions&quot;)">🎨 Explorar Directorio de Modelistas</button>' +
        '</div>';
      return;
    }

    container.innerHTML = items.map(c => {
      const isBuilder = c.builderUsername && c.builderUsername.toLowerCase() === (currentUser?.username || '').toLowerCase();
      const isClient = (c.clientUserId && c.clientUserId === currentUser?.id) ||
                       (c.clientEmail && c.clientEmail.toLowerCase() === (currentUser?.email || '').toLowerCase());
      const scopeName = scopeLabels[c.scopeLevel] || c.scopeLevel;
      const statusHtml = statusBadges[c.status] || '<span class="status-badge">' + escapeHtml(c.status) + '</span>';

      const cleanWhatsapp = (c.clientWhatsapp || '').replace(/[^0-9]/g, '');
      const clientWaLink = cleanWhatsapp ? 'https://wa.me/' + cleanWhatsapp + '?text=' + encodeURIComponent('Hola ' + c.clientName + ', te escribo respecto a tu encargo (' + c.code + ') para la maqueta "' + c.kitTitle + '".') : '#';

      return '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">' +
        '<div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">' +
          '<div>' +
            '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">' +
              '<span style="font-size: 0.75rem; font-family: monospace; background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px; color: var(--accent); font-weight: 700;">' + escapeHtml(c.code) + '</span>' +
              '<span style="font-size: 0.78rem; color: #94a3b8;">' + new Date(c.createdAt).toLocaleDateString() + '</span>' +
            '</div>' +
            '<h4 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">' + escapeHtml(c.kitTitle) + '</h4>' +
            '<div style="font-size: 0.82rem; color: #38bdf8; margin-top: 0.2rem;">' +
              '🏷️ ' + escapeHtml(c.scaleCategory || 'gunpla-mecha') + ' • 🛠️ ' + escapeHtml(scopeName) +
            '</div>' +
          '</div>' +
          '<div style="text-align: right;">' +
            statusHtml +
          '</div>' +
        '</div>' +

        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; background: rgba(0,0,0,0.2); padding: 0.85rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); font-size: 0.82rem;">' +
          '<div>' +
            '<span style="color: #64748b;">' + (isBuilder ? 'Cliente Solicitante:' : 'Modelista Asignado:') + '</span><br>' +
            '<strong style="color: #f1f5f9;">' + escapeHtml(isBuilder ? c.clientName : (c.builderDisplayName || '@' + c.builderUsername)) + '</strong>' +
            (isBuilder && c.clientCity ? '<span style="font-size: 0.75rem; color: #94a3b8;"> (📍 ' + escapeHtml(c.clientCity) + ')</span>' : '') +
          '</div>' +
          '<div>' +
            '<span style="color: #64748b;">Suministro del Kit:</span><br>' +
            '<strong style="color: #f1f5f9;">' + (c.kitSupply === 'client_provides_kit' ? '📦 Cliente provee kit' : (c.kitSupply === 'builder_sources_kit' ? '🛒 Modelista adquiere kit' : '🤝 A convenir')) + '</strong>' +
          '</div>' +
          '<div>' +
            '<span style="color: #64748b;">Presupuesto Cliente:</span><br>' +
            '<strong style="color: #4ade80;">' + (c.targetBudget ? escapeHtml(c.currency || 'PEN') + ' ' + c.targetBudget : 'A convenir') + '</strong>' +
          '</div>' +
          '<div>' +
            '<span style="color: #64748b;">Cotización Oficial:</span><br>' +
            '<strong style="color: ' + (c.quotePrice ? '#38bdf8' : '#94a3b8') + ';">' +
              (c.quotePrice ? escapeHtml(c.currency || 'PEN') + ' ' + c.quotePrice + ' (' + (c.estimatedDays || 15) + ' días)' : 'Pendiente de cotizar') +
            '</strong>' +
          '</div>' +
        '</div>' +

        '<div style="font-size: 0.85rem; color: #cbd5e1; background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 6px; border-left: 3px solid var(--accent-color);">' +
          '<div style="font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">Notas del Proyecto:</div>' +
          '<div style="line-height: 1.4;">' + escapeHtml(c.projectNotes) + '</div>' +
          (c.builderResponseNotes ? 
            '<div style="margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px dashed rgba(255,255,255,0.1);">' +
              '<div style="font-size: 0.75rem; color: #38bdf8; font-weight: 600; text-transform: uppercase; margin-bottom: 0.2rem;">Respuesta del Modelista:</div>' +
              '<div style="color: #e2e8f0; font-style: italic;">"' + escapeHtml(c.builderResponseNotes) + '"</div>' +
            '</div>' : '') +
        '</div>' +

        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.6rem; border-top: 1px solid var(--border-color); padding-top: 0.85rem; margin-top: 0.25rem;">' +
          '<div style="display: flex; gap: 0.5rem; align-items: center;">' +
            (isBuilder ? 
              '<a href="' + clientWaLink + '" target="_blank" rel="noopener" class="filter-pill" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; color: #4ade80; border-color: rgba(34, 197, 94, 0.4); text-decoration: none;">💬 WhatsApp Cliente</a>' +
              '<span style="font-size: 0.75rem; color: #94a3b8;">📧 ' + escapeHtml(c.clientEmail) + '</span>'
              : '<span style="font-size: 0.8rem; color: #94a3b8;">Modelista: <strong>@' + escapeHtml(c.builderUsername) + '</strong></span>'
            ) +
          '</div>' +

          '<div style="display: flex; gap: 0.5rem; align-items: center;">' +
            (isBuilder ? 
              '<button class="btn-primary" onclick="openQuoteModal(&quot;' + c.id + '&quot;)" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">📝 Cotizar / Responder</button>' 
              : '') +
            (isClient && c.status === 'quoted' ? 
              '<button class="btn-primary" onclick="acceptCommissionQuote(&quot;' + c.id + '&quot;)" style="background: #22c55e; border-color: #22c55e; font-size: 0.82rem; padding: 0.4rem 0.9rem;">✅ Aceptar Cotización</button>' +
              '<button class="filter-pill" onclick="declineCommissionQuote(&quot;' + c.id + '&quot;)" style="font-size: 0.82rem; padding: 0.4rem 0.75rem; color: #f87171; border-color: rgba(239, 68, 68, 0.4);">❌ Rechazar</button>'
              : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function openQuoteModal(requestId) {
    const target = (window.__WB_COMMISSIONS || []).find(c => c.id === requestId);
    if (!target) return;

    const modal = document.getElementById('modal-quote-commission');
    const idInput = document.getElementById('quote-request-id');
    const banner = document.getElementById('quote-modal-kit-banner');
    const priceInput = document.getElementById('quote-price-input');
    const daysInput = document.getElementById('quote-days-input');
    const statusSelect = document.getElementById('quote-status-select');
    const notesInput = document.getElementById('quote-notes-input');
    const statusMsg = document.getElementById('quote-status-msg');

    if (idInput) idInput.value = target.id;
    if (banner) banner.textContent = 'Obra: ' + target.kitTitle + ' (' + target.code + ') • Solicitante: ' + target.clientName;
    if (priceInput) priceInput.value = target.quotePrice || target.targetBudget || '';
    if (daysInput) daysInput.value = target.estimatedDays || 20;
    if (statusSelect) statusSelect.value = target.status === 'pending' ? 'quoted' : target.status;
    if (notesInput) notesInput.value = target.builderResponseNotes || '';
    if (statusMsg) statusMsg.style.display = 'none';

    if (modal) modal.classList.add('active');
  }

  function closeQuoteModal(e) {
    if (!e || e.target.id === 'modal-quote-commission' || e.target.classList.contains('auth-close') || e.target.textContent === 'Cancelar') {
      const modal = document.getElementById('modal-quote-commission');
      if (modal) modal.classList.remove('active');
    }
  }

  async function submitQuote(e) {
    e.preventDefault();
    const btn = document.getElementById('quote-submit-btn');
    const statusMsg = document.getElementById('quote-status-msg');
    const requestId = document.getElementById('quote-request-id')?.value;
    const quotePrice = parseFloat(document.getElementById('quote-price-input')?.value || '0');
    const estimatedDays = parseInt(document.getElementById('quote-days-input')?.value || '1', 10);
    const status = document.getElementById('quote-status-select')?.value;
    const builderResponseNotes = document.getElementById('quote-notes-input')?.value;

    if (!requestId || !currentToken) return;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Guardando...';
    }

    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const res = await fetch(apiBase + '/api/v1/commissions/requests/' + encodeURIComponent(requestId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({
          quotePrice,
          estimatedDays,
          status,
          builderResponseNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al actualizar cotización');
      }

      closeQuoteModal();
      loadWorkbenchData();
      alert('¡Cotización guardada y actualizada con éxito!');
    } catch (err) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#ef4444';
        statusMsg.textContent = err.message || 'Error inesperado';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Guardar & Notificar al Cliente';
      }
    }
  }

  async function acceptCommissionQuote(requestId) {
    if (!confirm('¿Deseas aceptar formalmente la cotización para este encargo? El modelista comenzará el trabajo según los términos acordados.')) {
      return;
    }
    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const res = await fetch(apiBase + '/api/v1/commissions/requests/' + encodeURIComponent(requestId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al aceptar cotización');
      }
      loadWorkbenchData();
      alert('¡Cotización aceptada! Comunícate con el modelista por WhatsApp para coordinar el pago inicial y entrega del kit.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function declineCommissionQuote(requestId) {
    if (!confirm('¿Estás seguro de que deseas rechazar o cancelar esta solicitud de encargo?')) {
      return;
    }
    try {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      const res = await fetch(apiBase + '/api/v1/commissions/requests/' + encodeURIComponent(requestId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({ status: 'declined' })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al rechazar cotización');
      }
      loadWorkbenchData();
    } catch (err) {
      alert('Error: ' + err.message);
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
    const fileInput = document.getElementById('step-photo-file');
    if (fileInput) fileInput.value = '';
    const previewGrid = document.getElementById('step-photo-preview-grid');
    if (previewGrid) previewGrid.innerHTML = '';
    if (m) m.classList.add('active');
  }
  function closeAddStepModal(e) {
    if (!e || e.target.id === 'modal-add-step' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-add-step');
      if (m) m.classList.remove('active');
    }
  }

  function previewStepPhotos(input) {
    const grid = document.getElementById('step-photo-preview-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!input.files || input.files.length === 0) return;
    Array.from(input.files).forEach(file => {
      const url = URL.createObjectURL(file);
      const thumb = document.createElement('img');
      thumb.src = url;
      thumb.style.width = '55px';
      thumb.style.height = '55px';
      thumb.style.objectFit = 'cover';
      thumb.style.borderRadius = '4px';
      thumb.style.border = '1px solid var(--border-color)';
      grid.appendChild(thumb);
    });
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

  // --- Bulk Import Tool Engine (CSV / TSV / Excel for Stash & Paint Rack) ---
  let currentBulkImportTab = 'stash';

  function openBulkImportModal(tab) {
    const m = document.getElementById('modal-bulk-import');
    if (!m) return;
    currentBulkImportTab = (tab === 'paints') ? 'paints' : 'stash';
    switchBulkImportTab(currentBulkImportTab);

    // Clear previous inputs & preview
    const textarea = document.getElementById('bulk-import-textarea');
    if (textarea) textarea.value = '';
    const fileInput = document.getElementById('bulk-import-file-input');
    if (fileInput) fileInput.value = '';
    const previewBox = document.getElementById('bulk-import-preview-box');
    if (previewBox) previewBox.style.display = 'none';

    m.style.display = 'flex';
    m.classList.add('active');
  }

  function closeBulkImportModal(e) {
    if (!e || e.target.id === 'modal-bulk-import' || e.target.classList.contains('auth-close') || !e.target) {
      const m = document.getElementById('modal-bulk-import');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    }
  }

  function switchBulkImportTab(tab) {
    currentBulkImportTab = (tab === 'paints') ? 'paints' : 'stash';
    const btnStash = document.getElementById('tab-btn-import-stash');
    const btnPaints = document.getElementById('tab-btn-import-paints');
    const guideText = document.getElementById('bulk-import-guide-text');
    const textarea = document.getElementById('bulk-import-textarea');
    const previewBox = document.getElementById('bulk-import-preview-box');
    if (previewBox) previewBox.style.display = 'none';

    if (currentBulkImportTab === 'stash') {
      if (btnStash) {
        btnStash.classList.add('active');
        btnStash.style.background = '#2563eb';
        btnStash.style.color = '#fff';
      }
      if (btnPaints) {
        btnPaints.classList.remove('active');
        btnPaints.style.background = '';
        btnPaints.style.color = '';
      }
      if (guideText) {
        guideText.innerHTML = '<strong>Columnas compatibles para Maquetas:</strong> <code>Nombre, Marca, Escala, Grado, Estado, Notas</code>.<br/><em>El sistema emparejar\u00e1 autom\u00e1ticamente con el cat\u00e1logo oficial o crear\u00e1 maquetas personalizadas.</em>';
      }
      if (textarea) {
        textarea.placeholder = 'Nombre, Marca, Escala, Grado, Estado\\nRG Hi-Nu Gundam, Bandai Spirits, 1/144, RG, unbuilt\\nMG Eclipse Gundam, Bandai Spirits, 1/100, MG, in_progress\\nHG Aerial Rebuild, Bandai Spirits, 1/144, HG, completed';
      }
    } else {
      if (btnPaints) {
        btnPaints.classList.add('active');
        btnPaints.style.background = '#2563eb';
        btnPaints.style.color = '#fff';
      }
      if (btnStash) {
        btnStash.classList.remove('active');
        btnStash.style.background = '';
        btnStash.style.color = '';
      }
      if (guideText) {
        guideText.innerHTML = '<strong>Columnas compatibles para Pinturas:</strong> <code>Codigo, Marca, Nombre, Tipo, Color, Cantidad, Estado</code>.<br/><em>C\u00f3digos como XF-1, LP-11, C1 o AV-70950 se emparejan autom\u00e1ticamente.</em>';
      }
      if (textarea) {
        textarea.placeholder = 'Codigo, Marca, Nombre, Tipo, Color, Cantidad, Estado\\nXF-1, Tamiya, Flat Black, Enamel, #000000, 2, full\\nLP-11, Tamiya, Silver, Lacquer, #c0c0c0, 1, half\\nC1, Mr. Color, White, Lacquer, #ffffff, 1, full\\nAV-70950, Vallejo, Black, Acrylic, #111111, 3, unopened';
      }
    }
  }

  function insertBulkImportSample() {
    const textarea = document.getElementById('bulk-import-textarea');
    if (!textarea) return;
    if (currentBulkImportTab === 'stash') {
      textarea.value = 'Nombre, Marca, Escala, Grado, Estado, Notas\\n' +
        'RG Hi-Nu Gundam, Bandai Spirits, 1/144, RG, unbuilt, Comprado en Akihabara\\n' +
        'MG Eclipse Gundam, Bandai Spirits, 1/100, MG, in_progress, Frame ensamblado\\n' +
        'HG Aerial Rebuild, Bandai Spirits, 1/144, HG, completed, Pintado a mano\\n' +
        'PG Unleashed RX-78-2, Bandai Spirits, 1/60, PG, backlog, Edici\u00f3n de aniversario\\n' +
        'Custom Resin Kshatriya, The 51, 1/100, Resin, unbuilt, Kit garage resina';
    } else {
      textarea.value = 'Codigo, Marca, Nombre, Tipo, Color, Cantidad, Estado\\n' +
        'XF-1, Tamiya, Flat Black, Enamel, #000000, 2, full\\n' +
        'LP-11, Tamiya, Silver, Lacquer, #c0c0c0, 1, half\\n' +
        'C1, Mr. Color, White, Lacquer, #ffffff, 2, full\\n' +
        'AV-70950, Vallejo, Black, Acrylic, #111111, 3, unopened\\n' +
        'MECHA-01, Mecha Color, Steel, Acrylic, #4b5563, 1, full';
    }
  }

  function handleBulkImportFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const textarea = document.getElementById('bulk-import-textarea');
      if (textarea && e.target && e.target.result) {
        textarea.value = e.target.result;
      }
    };
    reader.readAsText(file);
  }

  async function executeBulkImport(dryRun) {
    const token = localStorage.getItem('plamo_sso_token');
    if (!token) {
      alert('Debes iniciar sesi\u00f3n para importar elementos a tu taller.');
      openAuthModal();
      return;
    }

    const textarea = document.getElementById('bulk-import-textarea');
    const csvContent = textarea ? textarea.value.trim() : '';
    if (!csvContent) {
      alert('Por favor pega contenido en formato CSV/Excel o selecciona un archivo antes de continuar.');
      return;
    }

    const btnConfirm = document.getElementById('btn-bulk-import-confirm');
    const originalBtnText = btnConfirm ? btnConfirm.textContent : '';
    if (btnConfirm) {
      btnConfirm.disabled = true;
      btnConfirm.textContent = dryRun ? '\u23f3 Analizando...' : '\u23f3 Importando...';
    }

    try {
      const endpoint = apiBase + '/api/v1/workbench/import/' + currentBulkImportTab;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ csvContent, dryRun: !!dryRun })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la importaci\u00f3n masiva');
      }

      const previewBox = document.getElementById('bulk-import-preview-box');
      const statBadge = document.getElementById('bulk-import-stat-badge');
      const matchesBadge = document.getElementById('bulk-import-matches-badge');
      const tableContainer = document.getElementById('bulk-import-preview-table-container');

      if (previewBox) previewBox.style.display = 'block';
      if (statBadge) {
        if (dryRun) {
          statBadge.style.background = 'rgba(56, 189, 248, 0.15)';
          statBadge.style.color = '#38bdf8';
          statBadge.textContent = '\ud83d\udd0d Previsualizaci\u00f3n: ' + (data.importedCount || 0) + ' fila(s) detectadas';
        } else {
          statBadge.style.background = 'rgba(34, 197, 94, 0.15)';
          statBadge.style.color = '#4ade80';
          statBadge.textContent = '\u2705 \u00a1Importaci\u00f3n Exitosa! ' + (data.importedCount || 0) + ' elemento(s) procesados';
        }
      }
      if (matchesBadge) {
        matchesBadge.textContent = (data.matchedCount || 0) + ' con cat\u00e1logo \u00b7 ' + (data.customCreatedCount || 0) + ' personalizados';
      }

      if (tableContainer) {
        const previewItems = data.items || [];
        if (previewItems.length === 0) {
          tableContainer.innerHTML = '<p style="color: #94a3b8; font-style: italic; margin: 0.5rem 0;">No se detectaron registros v\u00e1lidos en el texto provisto.</p>';
        } else {
          let rowsHtml = '';
          if (currentBulkImportTab === 'stash') {
            rowsHtml = '<table style="width: 100%; border-collapse: collapse; text-align: left;">' +
              '<thead><tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">' +
              '<th style="padding: 0.35rem 0.5rem;">Maqueta</th>' +
              '<th style="padding: 0.35rem 0.5rem;">Escala / Grado</th>' +
              '<th style="padding: 0.35rem 0.5rem;">Estado</th>' +
              '<th style="padding: 0.35rem 0.5rem;">Tipo</th>' +
              '</tr></thead><tbody>' +
              previewItems.map(item => {
                const k = item.kit || {};
                const name = k.name || item.name || 'Sin nombre';
                const scale = k.scale || item.scale || '-';
                const grade = k.grade || item.grade || '-';
                const status = item.status || 'unbuilt';
                const isCatalog = !item.isCustom;
                return '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">' +
                  '<td style="padding: 0.35rem 0.5rem; color: #fff; font-weight: 500;">' + name + '</td>' +
                  '<td style="padding: 0.35rem 0.5rem; color: #94a3b8;">' + scale + ' \u00b7 ' + grade + '</td>' +
                  '<td style="padding: 0.35rem 0.5rem;"><span class="status-badge" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">' + status + '</span></td>' +
                  '<td style="padding: 0.35rem 0.5rem;">' + (isCatalog ? '<span style="color: #4ade80;">Cat\u00e1logo</span>' : '<span style="color: #38bdf8;">Personalizado</span>') + '</td>' +
                  '</tr>';
              }).join('') + '</tbody></table>';
          } else {
            rowsHtml = '<table style="width: 100%; border-collapse: collapse; text-align: left;">' +
              '<thead><tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">' +
              '<th style="padding: 0.35rem 0.5rem;">C\u00f3digo</th>' +
              '<th style="padding: 0.35rem 0.5rem;">Nombre / Marca</th>' +
              '<th style="padding: 0.35rem 0.5rem;">Cant.</th>' +
              '<th style="padding: 0.35rem 0.5rem;">Estado</th>' +
              '<th style="padding: 0.35rem 0.5rem;">Tipo</th>' +
              '</tr></thead><tbody>' +
              previewItems.map(item => {
                const p = item.paint || {};
                const code = p.code || item.code || '-';
                const name = p.name || item.name || '-';
                const brand = p.brand || item.brand || '-';
                const qty = item.quantity || 1;
                const status = item.status || 'full';
                const isCatalog = !item.isCustom;
                return '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">' +
                  '<td style="padding: 0.35rem 0.5rem; color: #38bdf8; font-weight: 600;">' + code + '</td>' +
                  '<td style="padding: 0.35rem 0.5rem; color: #fff;">' + name + ' <small style="color: #94a3b8;">(' + brand + ')</small></td>' +
                  '<td style="padding: 0.35rem 0.5rem; color: #cbd5e1;">x' + qty + '</td>' +
                  '<td style="padding: 0.35rem 0.5rem;"><span class="status-badge" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">' + status + '</span></td>' +
                  '<td style="padding: 0.35rem 0.5rem;">' + (isCatalog ? '<span style="color: #4ade80;">Cat\u00e1logo</span>' : '<span style="color: #38bdf8;">Personalizada</span>') + '</td>' +
                  '</tr>';
              }).join('') + '</tbody></table>';
          }
          tableContainer.innerHTML = rowsHtml;
        }
      }

      if (!dryRun) {
        loadWorkbenchData();
        setTimeout(() => {
          closeBulkImportModal();
        }, 1800);
      }
    } catch (err) {
      alert('Error en importaci\u00f3n: ' + (err.message || 'Ocurri\u00f3 un error inesperado'));
    } finally {
      if (btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.textContent = originalBtnText;
      }
    }
  }

  // --- AI Paint Equivalences & Recipe Assistant Engine ---
  function openPaintEquivalencesModal(sourceCode, sourceBrand) {
    const m = document.getElementById('modal-paint-equivalences');
    if (!m) return;
    m.classList.add('active');

    // Populate quick rack chips from window.__WB_PAINTS
    const chipsContainer = document.getElementById('equiv-quick-rack-chips');
    if (chipsContainer) {
      const paints = window.__WB_PAINTS || [];
      if (paints.length === 0) {
        chipsContainer.innerHTML = '<span style="font-size: 0.72rem; color: #94a3b8; font-style: italic;">No tienes pinturas en tu rack aún</span>';
      } else {
        chipsContainer.innerHTML = paints.slice(0, 8).map(item => {
          const p = item.paint || {};
          const code = p.code || '';
          const brand = p.brand || '';
          return '<button type="button" class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;" onclick="setEquivCode(&quot;' + code + '&quot;, &quot;' + brand + '&quot;)">' + (brand ? brand + ' ' : '') + code + '</button>';
        }).join('');
      }
    }

    if (sourceCode) {
      const codeInput = document.getElementById('equiv-code-input');
      if (codeInput) codeInput.value = sourceCode;
      executePaintEquivalenceSearch(sourceCode, sourceBrand);
    }
  }

  function setEquivCode(code, brand) {
    const codeInput = document.getElementById('equiv-code-input');
    if (codeInput) codeInput.value = code;
    executePaintEquivalenceSearch(code, brand);
  }

  function closePaintEquivalencesModal(e) {
    if (!e || e.target.id === 'modal-paint-equivalences' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-paint-equivalences');
      if (m) m.classList.remove('active');
    }
  }

  function switchEquivTab(tab) {
    const btnSearch = document.getElementById('btn-equiv-tab-search');
    const btnRecipe = document.getElementById('btn-equiv-tab-recipe');
    const contentSearch = document.getElementById('equiv-tab-search-content');
    const contentRecipe = document.getElementById('equiv-tab-recipe-content');

    if (tab === 'search') {
      if (btnSearch) btnSearch.classList.add('active');
      if (btnRecipe) btnRecipe.classList.remove('active');
      if (contentSearch) contentSearch.style.display = 'block';
      if (contentRecipe) contentRecipe.style.display = 'none';
    } else {
      if (btnRecipe) btnRecipe.classList.add('active');
      if (btnSearch) btnSearch.classList.remove('active');
      if (contentRecipe) contentRecipe.style.display = 'block';
      if (contentSearch) contentSearch.style.display = 'none';
    }
  }

  async function handleSearchEquivalences(e) {
    if (e && e.preventDefault) e.preventDefault();
    const code = document.getElementById('equiv-code-input').value.trim();
    const medium = document.getElementById('equiv-medium-select').value;
    if (!code) return;
    executePaintEquivalenceSearch(code, undefined, medium);
  }

  async function executePaintEquivalenceSearch(sourceCode, sourceBrand, targetMedium) {
    const resultsContainer = document.getElementById('equiv-results-container');
    const searchBtn = document.getElementById('equiv-search-btn');
    if (!resultsContainer) return;

    if (searchBtn) {
      searchBtn.disabled = true;
      searchBtn.textContent = '⏳ Buscando...';
    }

    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: #94a3b8;">Consultando motor de equivalencias químicas...</div>';

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/paints/ai/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentToken ? 'Bearer ' + currentToken : '',
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({
          sourceCode,
          sourceBrand,
          targetMedium: targetMedium || undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        resultsContainer.innerHTML = 
          '<div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 1.25rem; color: #f87171; font-size: 0.85rem;">' +
            '<strong>⚠️ ' + (err.title || 'Equivalencia no encontrada') + '</strong>' +
            '<p style="margin: 0.4rem 0 0 0; color: #cbd5e1;">' + (err.detail || 'Prueba buscando con códigos estándar como XF-1, C108, 70.950 o RV-242.') + '</p>' +
          '</div>';
        return;
      }

      const data = await res.json();
      renderEquivalencesResults(data);
    } catch (err) {
      resultsContainer.innerHTML = '<div style="color: #f87171; padding: 1rem;">Error de conexión con el servidor.</div>';
    } finally {
      if (searchBtn) {
        searchBtn.disabled = false;
        searchBtn.textContent = '🔍 Buscar';
      }
    }
  }

  function renderEquivalencesResults(data) {
    const resultsContainer = document.getElementById('equiv-results-container');
    if (!resultsContainer) return;

    const source = data.source || {};
    const matches = data.matches || [];
    const guide = data.airbrushGuide || {};

    let matchesHtml = matches.map(m => {
      const hex = m.hexColor || '#94a3b8';
      const isOwned = m.ownedInRack;
      const rackQty = m.rackQuantity || 0;

      let rackBadge = '';
      let actionBtn = '';

      if (isOwned) {
        rackBadge = '<span style="background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.35); font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 700;">✅ En tu Rack (' + rackQty + ' frascos)</span>';
      } else {
        rackBadge = '<span style="background: rgba(148,163,184,0.1); color: #94a3b8; font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 9999px;">No está en tu Rack</span>';
        actionBtn = 
          '<button class="filter-pill" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; background: rgba(56,189,248,0.15); color: #38bdf8; border-color: rgba(56,189,248,0.3);" onclick="addPaintCodeToRack(&quot;' + m.code + '&quot;, &quot;' + m.brand + '&quot;)">+ Añadir a Mi Rack</button>';
      }

      let typeLabel = 'Pintura';
      if (m.type === 'lacquer') typeLabel = '🧪 Laca (Mr. Color)';
      else if (m.type === 'acrylic') typeLabel = '💧 Acrílico (Tamiya)';
      else if (m.type === 'polyurethane') typeLabel = '🛡️ Poliuretano (Vallejo)';
      else if (m.type === 'spray_graffiti') typeLabel = '🎨 Spray (Montana Colors)';

      return '<div style="background: rgba(255,255,255,0.03); border: 1px solid ' + (isOwned ? 'rgba(34,197,94,0.4)' : 'var(--border-color)') + '; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">' +
        '<div>' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">' +
            '<span style="font-size: 0.72rem; color: #38bdf8; font-weight: 600; text-transform: uppercase;">' + typeLabel + '</span>' +
            rackBadge +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
            '<div style="width: 36px; height: 36px; border-radius: 50%; background: ' + hex + '; border: 2px solid rgba(255,255,255,0.25); flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>' +
            '<div style="overflow: hidden;">' +
              '<div style="font-size: 0.95rem; font-weight: 700; color: #fff;">' + m.brand + ' ' + m.code + '</div>' +
              '<div style="font-size: 0.8rem; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + m.name + '</div>' +
              (m.line ? '<div style="font-size: 0.72rem; color: #94a3b8;">Línea: ' + m.line + ' (' + m.finish + ')</div>' : '') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.6rem; margin-top: 0.25rem;">' +
          '<span style="font-size: 0.72rem; color: #64748b;">HEX: ' + hex + '</span>' +
          actionBtn +
        '</div>' +
      '</div>';
    }).join('');

    let guideHtml = '';
    if (guide && guide.mediumTitle) {
      guideHtml = 
        '<div style="background: rgba(56,189,248,0.05); border: 1px solid rgba(56,189,248,0.2); border-radius: 8px; padding: 1.15rem; margin-top: 1.25rem;">' +
          '<div style="font-size: 0.88rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.5rem;">📖 Guía de Aplicación & Aerografía: ' + guide.mediumTitle + '</div>' +
          '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.8rem; margin-bottom: 0.75rem;">' +
            '<div><strong style="color: #cbd5e1;">Diluyente (Thinner):</strong><div style="color: #94a3b8;">' + (guide.recommendedThinner || 'Estándar') + '</div></div>' +
            '<div><strong style="color: #cbd5e1;">Proporción (Ratio):</strong><div style="color: #94a3b8;">' + (guide.thinningRatio || 'Directo') + '</div></div>' +
            '<div><strong style="color: #cbd5e1;">Presión / Boquilla:</strong><div style="color: #94a3b8;">' + (guide.recommendedPSI || '15-20 PSI') + '</div></div>' +
            '<div><strong style="color: #cbd5e1;">Secado & Curado:</strong><div style="color: #94a3b8;">' + (guide.dryingTime || '20 min') + '</div></div>' +
          '</div>' +
          (guide.proTips ? '<div style="font-size: 0.78rem; color: #cbd5e1; border-top: 1px dashed rgba(56,189,248,0.2); padding-top: 0.5rem;">💡 <strong>Consejo Pro:</strong> ' + guide.proTips + '</div>' : '') +
        '</div>';
    }

    resultsContainer.innerHTML = 
      '<div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">' +
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">' +
          '<div style="display: flex; align-items: center; gap: 0.6rem;">' +
            '<span style="font-size: 0.85rem; color: #94a3b8;">Origen buscado:</span>' +
            '<span style="background: rgba(255,255,255,0.06); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; color: #fff;">' + (source.brand || '') + ' ' + (source.code || '') + ' (' + (source.name || '') + ')</span>' +
          '</div>' +
          '<span style="font-size: 0.78rem; color: #4ade80;">' + matches.length + ' fórmulas encontradas</span>' +
        '</div>' +
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.85rem;">' +
          matchesHtml +
        '</div>' +
        guideHtml +
      '</div>';
  }

  async function addPaintCodeToRack(code, brand) {
    if (!currentToken) {
      alert('Debes iniciar sesión para agregar pinturas a tu Rack.');
      return;
    }

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const catRes = await fetch(apiBase + '/api/v1/catalog/paints?search=' + encodeURIComponent(code));
      if (!catRes.ok) throw new Error('Error al consultar catálogo');
      const catData = await catRes.json();
      const match = (catData.items || []).find(p => p.code.toUpperCase() === code.toUpperCase() && (!brand || p.brand.toLowerCase().includes(brand.toLowerCase().split(' ')[0])));
      
      if (!match) {
        alert('La pintura ' + brand + ' ' + code + ' no está en el catálogo maestro aún. Puedes registrarla desde "+ Registrar Pintura".');
        return;
      }

      const addRes = await fetch(apiBase + '/api/v1/workbench/paints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({
          paintId: match.id,
          status: 'owned',
          quantity: 1
        })
      });

      if (addRes.ok) {
        alert('✅ ¡Pintura ' + match.brand + ' ' + match.code + ' agregada a tu Rack!');
        loadWorkbenchData();
        const codeInput = document.getElementById('equiv-code-input');
        if (codeInput && codeInput.value) {
          executePaintEquivalenceSearch(codeInput.value);
        }
      }
    } catch (err) {
      alert('Error al agregar pintura: ' + (err.message || err));
    }
  }

  async function handleGenerateAiRecipe(e) {
    if (e && e.preventDefault) e.preventDefault();
    const query = document.getElementById('recipe-query-input').value.trim();
    const preferredMedium = document.getElementById('recipe-medium-select').value;
    const resultsContainer = document.getElementById('recipe-results-container');
    const generateBtn = document.getElementById('recipe-generate-btn');
    if (!query || !resultsContainer) return;

    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.textContent = '✨ Generando...';
    }

    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: #94a3b8;">Formulando receta de pintura y verificando disponibilidad en tu Rack...</div>';

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/paints/ai/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentToken ? 'Bearer ' + currentToken : '',
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({ query, preferredMedium })
      });

      if (!res.ok) {
        const err = await res.json();
        resultsContainer.innerHTML = '<div style="color: #f87171; padding: 1rem;">' + (err.detail || 'Error al generar receta') + '</div>';
        return;
      }

      const recipe = await res.json();
      renderAiRecipeResults(recipe);
    } catch (err) {
      resultsContainer.innerHTML = '<div style="color: #f87171; padding: 1rem;">Error de conexión con el servidor.</div>';
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ Mezclar';
      }
    }
  }

  function renderAiRecipeResults(recipe) {
    const resultsContainer = document.getElementById('recipe-results-container');
    if (!resultsContainer) return;

    const components = recipe.components || [];
    const airbrush = recipe.airbrushApplication || {};

    let componentsHtml = components.map(c => {
      const isOwned = c.inUserRack;
      return '<div style="background: rgba(255,255,255,0.02); border: 1px solid ' + (isOwned ? 'rgba(34,197,94,0.4)' : 'var(--border-color)') + '; border-radius: 8px; padding: 0.85rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">' +
        '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
          '<div style="width: 28px; height: 28px; border-radius: 50%; background: ' + (c.hexColor || '#94a3b8') + '; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0;"></div>' +
          '<div>' +
            '<div style="font-size: 0.88rem; font-weight: 700; color: #fff;">' + (c.recommendedPaint || c.code) + ' (' + c.brand + ' ' + c.code + ')</div>' +
            '<div style="font-size: 0.75rem; color: #94a3b8;">' + c.partOrTonalStep + ' • ' + (c.percentage || 0) + '% de la mezcla</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          (isOwned 
            ? '<span style="background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.35); font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 700;">✅ En tu Rack</span>'
            : '<button class="filter-pill" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;" onclick="addPaintCodeToRack(&quot;' + c.code + '&quot;, &quot;' + c.brand + '&quot;)">+ Al Rack</button>') +
        '</div>' +
      '</div>';
    }).join('');

    resultsContainer.innerHTML = 
      '<div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">' +
        '<div style="margin-bottom: 1rem;">' +
          '<h4 style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; margin: 0 0 0.35rem 0;">' + recipe.recipeName + '</h4>' +
          '<p style="font-size: 0.82rem; color: #cbd5e1; margin: 0;">' + recipe.description + '</p>' +
        '</div>' +
        '<div style="font-size: 0.82rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.5rem;">Fórmula de Componentes:</div>' +
        '<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">' +
          componentsHtml +
        '</div>' +
        (recipe.mixingInstructions ? '<div style="background: rgba(255,255,255,0.02); border-left: 3px solid #38bdf8; padding: 0.85rem; border-radius: 4px; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 1rem;">🥣 <strong>Instrucciones de Mezcla:</strong> ' + recipe.mixingInstructions + '</div>' : '') +
        (airbrush.baseCoat ? '<div style="background: rgba(56,189,248,0.05); border: 1px solid rgba(56,189,248,0.2); border-radius: 8px; padding: 0.85rem; font-size: 0.8rem; color: #94a3b8;">' +
          '<div style="color: #38bdf8; font-weight: 700; margin-bottom: 0.35rem;">🖌️ Aplicación recomendada:</div>' +
          '<div>• Imprimación: ' + (airbrush.primer || 'Gris 1200') + '</div>' +
          '<div>• Capa base: ' + (airbrush.baseCoat || '') + '</div>' +
          '<div>• Dilución & PSI: ' + (airbrush.thinnerRatio || '1:1.5') + ' | ' + (airbrush.psi || '15 PSI') + '</div>' +
        '</div>' : '') +
      '</div>';
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

  // --- Builder Profile Editor Engine ---
  function openEditProfileModal() {
    if (!currentUser || !currentToken) {
      alert('Debes iniciar sesión para editar tu perfil de modelista.');
      openAuthModal();
      return;
    }

    const modal = document.getElementById('modal-edit-profile');
    const nameInput = document.getElementById('profile-display-name-input');
    const bioInput = document.getElementById('profile-bio-input');
    const avatarInput = document.getElementById('profile-avatar-input');
    const specialtiesInput = document.getElementById('profile-specialties-input');
    const whatsappInput = document.getElementById('profile-whatsapp-input');
    const socialInput = document.getElementById('profile-social-input');
    const errorMsg = document.getElementById('profile-edit-error-msg');

    if (errorMsg) errorMsg.style.display = 'none';

    if (nameInput) nameInput.value = currentUser.displayName || currentUser.username || '';
    if (bioInput) bioInput.value = currentUser.bio || '';
    if (avatarInput) avatarInput.value = currentUser.avatarUrl || '';
    if (specialtiesInput) {
      const specs = Array.isArray(currentUser.specialties) ? currentUser.specialties.join(', ') : '';
      specialtiesInput.value = specs;
    }
    if (whatsappInput) whatsappInput.value = currentUser.whatsapp || '';
    if (socialInput) {
      const links = Array.isArray(currentUser.socialLinks) ? currentUser.socialLinks[0] || '' : '';
      socialInput.value = links;
    }

    updateProfileAvatarPreview();
    if (modal) modal.classList.add('active');
  }

  function closeEditProfileModal(e) {
    if (!e || e.target.id === 'modal-edit-profile' || e.target.classList.contains('auth-close')) {
      const modal = document.getElementById('modal-edit-profile');
      if (modal) modal.classList.remove('active');
    }
  }

  function updateProfileAvatarPreview() {
    const input = document.getElementById('profile-avatar-input');
    const slot = document.getElementById('profile-avatar-preview-slot');
    if (!slot) return;

    const url = input ? input.value.trim() : '';
    if (url) {
      slot.innerHTML = '<img src="' + url + '" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML=&quot;👤&quot;">';
    } else {
      const initials = (currentUser?.displayName || currentUser?.username || 'U').slice(0, 2).toUpperCase();
      slot.innerHTML = initials;
    }
  }

  async function handleProfileAvatarUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('La imagen seleccionada supera el límite de 15 MB.');
      return;
    }

    const slot = document.getElementById('profile-avatar-preview-slot');
    if (slot) slot.innerHTML = '⏳';

    const reader = new FileReader();
    reader.onload = async function() {
      const base64Data = reader.result;

      try {
        const res = await fetch('/api/v1/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentToken
          },
          body: JSON.stringify({
            fileName: 'avatar-' + (currentUser.username || 'user') + '.jpg',
            dataBase64: base64Data,
            category: 'general',
            title: 'Avatar de ' + (currentUser.displayName || currentUser.username)
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Error al subir la imagen');
        }

        const data = await res.json();
        const avatarUrl = data.thumbUrl || data.fullUrl;
        const input = document.getElementById('profile-avatar-input');
        if (input) input.value = avatarUrl;
        updateProfileAvatarPreview();
      } catch (err) {
        alert('Error al subir el avatar: ' + err.message);
        updateProfileAvatarPreview();
      }
    };
    reader.readAsDataURL(file);
  }

  function addSpecialtyTag(tag) {
    const input = document.getElementById('profile-specialties-input');
    if (!input) return;
    const current = input.value.split(',').map(s => s.trim()).filter(Boolean);
    if (!current.includes(tag)) {
      current.push(tag);
      input.value = current.join(', ');
    }
  }

  async function saveProfileChanges(e) {
    if (e) e.preventDefault();
    if (!currentToken) return;

    const btn = document.getElementById('btn-save-profile');
    const errorMsg = document.getElementById('profile-edit-error-msg');
    const displayName = document.getElementById('profile-display-name-input')?.value.trim();
    const bio = document.getElementById('profile-bio-input')?.value.trim();
    const avatarUrl = document.getElementById('profile-avatar-input')?.value.trim();
    const specialtiesRaw = document.getElementById('profile-specialties-input')?.value;
    const whatsapp = document.getElementById('profile-whatsapp-input')?.value.trim();
    const socialUrl = document.getElementById('profile-social-input')?.value.trim();

    const specialties = specialtiesRaw ? specialtiesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const socialLinks = socialUrl ? [socialUrl] : [];

    if (errorMsg) errorMsg.style.display = 'none';
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Guardando...';
    }

    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl: avatarUrl || undefined,
          specialties,
          whatsapp: whatsapp || undefined,
          socialLinks
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Error al actualizar el perfil');
      }

      // Update local storage with updated user
      currentUser = { ...currentUser, ...data.user };
      localStorage.setItem('plamo_sso_user', JSON.stringify(currentUser));

      renderAuthUI();
      loadWorkbenchData();
      closeEditProfileModal();
      alert('✨ ¡Perfil de modelista actualizado exitosamente!');
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = 'block';
      } else {
        alert(err.message);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '💾 Guardar Cambios';
      }
    }
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
        ? '<img src="' + currentUser.avatarUrl + '" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color);">'
        : '<div style="width: 52px; height: 52px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 1.15rem;">' + initials + '</div>';
    }
    const titleSlot = document.getElementById('wb-user-title');
    if (titleSlot) titleSlot.textContent = 'Taller de ' + (currentUser.displayName || '@' + currentUser.username);
    const ageBadge = document.getElementById('wb-age-badge');
    if (ageBadge) {
      ageBadge.textContent = currentUser.isAdult ? 'Mayor de Edad (18+)' : 'Adolescente (14-17)';
      ageBadge.style.color = currentUser.isAdult ? '#4ade80' : '#38bdf8';
    }

    const bioSlot = document.getElementById('wb-user-bio');
    if (bioSlot) {
      if (currentUser.bio && currentUser.bio.trim().length > 0) {
        bioSlot.textContent = currentUser.bio;
        bioSlot.style.display = 'block';
      } else {
        bioSlot.style.display = 'none';
      }
    }

    const specsSlot = document.getElementById('wb-user-specialties');
    if (specsSlot) {
      const specs = Array.isArray(currentUser.specialties) ? currentUser.specialties : [];
      if (specs.length > 0) {
        specsSlot.innerHTML = specs.map(s => 
          '<span class="filter-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem; background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3); color: #38bdf8;">' + escapeHtml(s) + '</span>'
        ).join('');
        specsSlot.style.display = 'flex';
      } else {
        specsSlot.style.display = 'none';
      }
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
      window.__WB_BUILDS = buildItems;

      // 4. Fetch Commission Requests
      const commsRes = await fetch(apiBase + '/api/v1/commissions/requests', { headers: authHeaders });
      const commsData = commsRes.ok ? await commsRes.json() : { items: [] };
      window.__WB_COMMISSIONS = commsData.items || [];
      renderWbCommissions();

      // 5. Fetch Wishlist Stock Alerts
      const alertsRes = await fetch(apiBase + '/api/v1/workbench/wishlist-alerts', { headers: authHeaders });
      const alertsData = alertsRes.ok ? await alertsRes.json() : { alerts: [] };
      window.__WISHLIST_ALERTS = alertsData.alerts || [];

      const stashAlertsBadge = document.getElementById('wb-stash-alerts-badge');
      if (stashAlertsBadge) {
        if (window.__WISHLIST_ALERTS.length > 0) {
          stashAlertsBadge.textContent = '🔔 ' + window.__WISHLIST_ALERTS.length;
          stashAlertsBadge.style.display = 'inline-block';
        } else {
          stashAlertsBadge.style.display = 'none';
        }
      }

      const bannerContainer = document.getElementById('wb-wishlist-alerts-banner');
      if (bannerContainer) {
        if (window.__WISHLIST_ALERTS.length > 0) {
          bannerContainer.style.display = 'block';
          bannerContainer.innerHTML =
            '<div style="background: linear-gradient(90deg, rgba(34, 197, 94, 0.12), rgba(56, 189, 248, 0.12)); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 8px; padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">' +
              '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
                '<span style="font-size: 1.5rem;">🔔</span>' +
                '<div>' +
                  '<strong style="color: #4ade80; font-size: 0.9rem;">¡Tienes ' + window.__WISHLIST_ALERTS.length + ' maqueta(s) de tu Wishlist en stock en tiendas verificadas!</strong>' +
                  '<div style="color: #cbd5e1; font-size: 0.78rem;">Revisa las ofertas disponibles y contacta directamente a las tiendas por WhatsApp.</div>' +
                '</div>' +
              '</div>' +
            '</div>';
        } else {
          bannerContainer.style.display = 'none';
        }
      }

      const pendingReceived = (window.__WB_COMMISSIONS || []).filter(c => 
        c.builderUsername && c.builderUsername.toLowerCase() === currentUser.username.toLowerCase() && c.status === 'pending'
      ).length;
      const commBadge = document.getElementById('wb-commissions-badge');
      if (commBadge) {
        if (pendingReceived > 0) {
          commBadge.textContent = pendingReceived;
          commBadge.style.display = 'inline-block';
        } else {
          commBadge.style.display = 'none';
        }
      }

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

            const matchingAlert = (window.__WISHLIST_ALERTS || []).find(a => a.stashItemId === item.id || (item.kitId && a.kitId === item.kitId));
            const alertCardHtml = (item.status === 'wishlist' && matchingAlert)
              ? '<div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 6px; padding: 0.5rem; margin-bottom: 0.6rem;">' +
                  '<div style="font-size: 0.72rem; color: #4ade80; font-weight: 700; display: flex; align-items: center; gap: 0.3rem;">' +
                    '<span>🔔</span> ¡En Stock en ' + matchingAlert.shopName + '!' +
                  '</div>' +
                  '<div style="font-size: 0.78rem; color: #fff; margin: 0.2rem 0;">' +
                    '<strong>PEN ' + Number(matchingAlert.pricePEN).toFixed(2) + '</strong>' +
                    (matchingAlert.discountPercentage ? ' <span style="color: #facc15; font-size: 0.72rem;">(' + matchingAlert.discountPercentage + '% OFF)</span>' : '') +
                  '</div>' +
                  '<div style="display: flex; gap: 0.35rem; margin-top: 0.35rem;">' +
                    (matchingAlert.shopWhatsappUrl ? '<a href="' + matchingAlert.shopWhatsappUrl + '" target="_blank" rel="noopener" class="btn-primary" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; background: #22c55e; border-color: #22c55e; text-decoration: none;">💬 WhatsApp</a>' : '') +
                    (matchingAlert.shopCatalogUrl ? '<a href="' + matchingAlert.shopCatalogUrl + '" target="_blank" rel="noopener" class="filter-pill" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; text-decoration: none;">Catálogo</a>' : '') +
                  '</div>' +
                '</div>'
              : '';

            return '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">' +
              '<img src="' + boxArt + '" alt="' + kitName + '" style="width: 100%; height: 160px; object-fit: cover; background: #020617;">' +
              '<div style="padding: 1rem; flex: 1; display: flex; flex-direction: column;">' +
                '<div style="font-size: 0.72rem; color: var(--primary); font-weight: 600; text-transform: uppercase; margin-bottom: 0.2rem;">' + brand + ' • ' + scale + grade + '</div>' +
                '<h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; line-height: 1.3;">' + kitName + '</h4>' +
                '<div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.75rem;">' + stars + (item.pricePaid ? ' • ' + (item.currency || 'PEN') + ' ' + item.pricePaid : '') + '</div>' +
                (item.notes ? '<p style="font-size: 0.75rem; color: #94a3b8; font-style: italic; margin-bottom: 0.75rem;">"' + item.notes + '"</p>' : '') +
                alertCardHtml +
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
                  '<div style="display: flex; gap: 0.75rem; margin-bottom: 0.75rem; padding: 0.6rem; background: rgba(255,255,255,0.02); border-radius: 6px; align-items: flex-start;">' +
                    '<div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0;">' + (idx + 1) + '</div>' +
                    '<div style="flex: 1;">' +
                      '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem;">' +
                        '<div style="font-size: 0.82rem; font-weight: 600; color: #fff;">' + s.title + ' <span style="font-size: 0.7rem; color: var(--accent);">(' + s.stage + ')</span></div>' +
                        '<div style="display: flex; gap: 0.25rem;">' +
                          (idx > 0 ? '<button type="button" class="filter-pill" style="padding: 0.15rem 0.45rem; font-size: 0.7rem;" title="Subir paso" onclick="moveBuildStep(&quot;' + b.id + '&quot;, &quot;' + s.id + '&quot;, -1)">⬆️</button>' : '') +
                          (idx < steps.length - 1 ? '<button type="button" class="filter-pill" style="padding: 0.15rem 0.45rem; font-size: 0.7rem;" title="Bajar paso" onclick="moveBuildStep(&quot;' + b.id + '&quot;, &quot;' + s.id + '&quot;, 1)">⬇️</button>' : '') +
                          '<button type="button" class="filter-pill" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; color: #ef4444; border-color: rgba(239,68,68,0.3);" title="Eliminar paso" onclick="deleteBuildStep(&quot;' + b.id + '&quot;, &quot;' + s.id + '&quot;)">🗑️</button>' +
                        '</div>' +
                      '</div>' +
                      (s.description ? '<p style="font-size: 0.78rem; color: #94a3b8; margin-top: 0.2rem;">' + s.description + '</p>' : '') +
                      (s.photoUrls && s.photoUrls.length > 0 ? '<div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">' + s.photoUrls.map(u => '<img src="' + u + '" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 1px solid var(--border-color);" onclick="openLightbox(&quot;' + u + '&quot;, &quot;' + s.title.replace(/"/g, '') + '&quot;, &quot;@' + b.username + '&quot;)">').join('') + '</div>' : '') +
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
                '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">' +
                  '<button class="filter-pill" style="font-size: 0.78rem; padding: 0.45rem 0.8rem; background: rgba(56,189,248,0.15); color: #38bdf8; border-color: rgba(56,189,248,0.3);" onclick="openSpecCardModal(&quot;' + b.id + '&quot;)">🏷️ Ficha de Mesa & QR</button>' +
                  '<button class="btn-primary" style="font-size: 0.78rem; padding: 0.45rem 0.8rem;" onclick="openAddStepModal(&quot;' + b.id + '&quot;)">+ Agregar Paso</button>' +
                '</div>' +
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
      window.__WB_PAINTS = paintItems;
      const paintsBadge = document.getElementById('wb-paints-count-badge');
      if (paintsBadge) {
        paintsBadge.textContent = paintItems.length + (paintItems.length === 1 ? ' frasco' : ' frascos');
      }

      const paintsContainer = document.getElementById('wb-paints-grid');
      if (paintsContainer) {
        if (paintItems.length === 0) {
          paintsContainer.innerHTML = 
            '<div style="grid-column: 1 / -1; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 10px; padding: 3rem 1.5rem; text-align: center;">' +
              '<div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🎨</div>' +
              '<h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.4rem;">Tu Rack de Pinturas está vacío</h3>' +
              '<p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">Registra los frascos que tienes en tu taller para usarlos en tus recetas.</p>' +
              '<div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">' +
                '<button class="btn-primary" onclick="openAddPaintModal()">+ Registrar Primera Pintura</button>' +
                '<button class="filter-pill" style="background: rgba(56,189,248,0.15); color: #38bdf8; border-color: rgba(56,189,248,0.3);" onclick="openPaintEquivalencesModal()">🧪 Probar Asistente de Equivalencias</button>' +
              '</div>' +
            '</div>';
        } else {
          paintsContainer.innerHTML = paintItems.map(item => {
            const p = item.paint || {};
            const hex = p.colorHex || '#94a3b8';
            return '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">' +
              '<div style="width: 32px; height: 32px; border-radius: 50%; background: ' + hex + '; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0;"></div>' +
              '<div style="flex: 1; min-width: 110px; overflow: hidden;">' +
                '<div style="font-size: 0.82rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (p.code || 'Pintura') + ' ' + (p.name || '') + '</div>' +
                '<div style="font-size: 0.72rem; color: #94a3b8;">' + (p.brand || 'Mr. Color') + ' • Cantidad: ' + (item.quantity || 1) + '</div>' +
              '</div>' +
              '<div style="display: flex; gap: 0.3rem; align-items: center;">' +
                '<button class="filter-pill" style="font-size: 0.7rem; padding: 0.2rem 0.45rem; background: rgba(56,189,248,0.12); color: #38bdf8; border-color: rgba(56,189,248,0.3);" onclick="openPaintEquivalencesModal(&quot;' + (p.code || '') + '&quot;, &quot;' + (p.brand || '') + '&quot;)" title="Buscar equivalencias químicas">🔄 Equivalencias</button>' +
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
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          const file = fileInput.files[i];
          const base64 = await fileToBase64(file);
          const uploadRes = await fetch(apiBase + '/api/v1/media/upload', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              dataBase64: base64,
              fileName: file.name,
              title: title + (fileInput.files.length > 1 ? ' (' + (i + 1) + ')' : ''),
              category: 'gunpla-mecha'
            })
          });
          if (uploadRes.ok) {
            const upData = await uploadRes.json();
            photoUrls.push(upData.fullUrl);
          }
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
      await loadWorkbenchData();
      alert('¡Paso de armado agregado con éxito!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Paso de Armado';
    }
  }

  async function moveBuildStep(buildId, stepId, delta) {
    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + currentToken,
      'X-Tenant-Slug': '${config.tenantSlug}'
    };

    try {
      let build = (window.__WB_BUILDS || []).find(b => b.id === buildId);
      if (!build) {
        const res = await fetch(apiBase + '/api/v1/builds/' + buildId);
        if (res.ok) build = await res.json();
      }
      if (!build || !build.steps) return;

      const steps = [...build.steps].sort((a, b) => a.orderIndex - b.orderIndex);
      const currIdx = steps.findIndex(s => s.id === stepId);
      if (currIdx === -1) return;
      const targetIdx = currIdx + delta;
      if (targetIdx < 0 || targetIdx >= steps.length) return;

      const [moved] = steps.splice(currIdx, 1);
      steps.splice(targetIdx, 0, moved);

      const stepIds = steps.map(s => s.id);
      const reorderRes = await fetch(apiBase + '/api/v1/builds/' + buildId + '/steps/reorder', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ stepIds })
      });
      if (!reorderRes.ok) {
        const err = await reorderRes.json();
        throw new Error(err.detail || 'Error al reordenar pasos');
      }
      await loadWorkbenchData();
    } catch (err) {
      alert('Error al reordenar pasos: ' + err.message);
    }
  }

  async function deleteBuildStep(buildId, stepId) {
    if (!confirm('¿Seguro que deseas eliminar este paso de la bitácora?')) return;
    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Authorization': 'Bearer ' + currentToken,
      'X-Tenant-Slug': '${config.tenantSlug}'
    };

    try {
      const res = await fetch(apiBase + '/api/v1/builds/' + buildId + '/steps/' + stepId, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al eliminar paso');
      }
      await loadWorkbenchData();
      alert('¡Paso eliminado con éxito!');
    } catch (err) {
      alert('Error: ' + err.message);
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

  // ---------------------------------------------------------------------------
  // Contest & Exhibition Spec Card Engine (Printable Table Tents with Custom Dimensions)
  // ---------------------------------------------------------------------------
  let currentSpecCardBuild = null;
  let currentSpecCardData = null;

  function openSpecCardModal(buildId) {
    const allBuilds = [...(window.__ALL_BUILDS || []), ...(window.__WB_BUILDS || [])];
    let found = allBuilds.find(b => b.id === buildId || b.slug === buildId);
    
    if (!found) {
      const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
      fetch(apiBase + '/api/v1/builds/' + buildId)
        .then(r => r.json())
        .then(b => {
          currentSpecCardBuild = b;
          showSpecCardModalUI();
        })
        .catch(err => alert('No se pudo cargar la maqueta: ' + err.message));
      return;
    }

    currentSpecCardBuild = found;
    showSpecCardModalUI();
  }

  function showSpecCardModalUI() {
    const modal = document.getElementById('modal-spec-card');
    if (modal) modal.classList.add('active');
    
    const entryInput = document.getElementById('spec-card-entry-input');
    if (entryInput && !entryInput.value) {
      entryInput.value = '#ENTRY-' + (currentSpecCardBuild?.slug?.slice(0, 6) || '2026').toUpperCase();
    }
    
    updateSpecCardPreview();
  }

  function closeSpecCardModal(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('auth-close')) return;
    const modal = document.getElementById('modal-spec-card');
    if (modal) modal.classList.remove('active');
  }

  function setSpecCardPreset(preset, btn) {
    if (btn) {
      document.querySelectorAll('#spec-card-presets-bar .filter-pill').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
    }
    const widthInput = document.getElementById('spec-card-width-input');
    const heightInput = document.getElementById('spec-card-height-input');

    if (preset === '10x15') {
      widthInput.value = '15';
      heightInput.value = '10';
    } else if (preset === '15x10') {
      widthInput.value = '10';
      heightInput.value = '15';
    } else if (preset === '9x5.5') {
      widthInput.value = '9';
      heightInput.value = '5.5';
    } else if (preset === '14.8x21') {
      widthInput.value = '21';
      heightInput.value = '14.8';
    } else if (preset === '21x29.7') {
      widthInput.value = '29.7';
      heightInput.value = '21';
    }

    updateSpecCardPreview();
  }

  async function updateSpecCardPreview() {
    if (!currentSpecCardBuild) return;

    const widthCm = parseFloat(document.getElementById('spec-card-width-input').value) || 15;
    const heightCm = parseFloat(document.getElementById('spec-card-height-input').value) || 10;
    const widthMm = Math.round(widthCm * 10);
    const heightMm = Math.round(heightCm * 10);
    const format = document.getElementById('spec-card-format-select').value;
    const theme = document.getElementById('spec-card-theme-select').value;
    const contestName = document.getElementById('spec-card-contest-input').value.trim() || 'Gunpla & Scale Model Open Cup 2026';
    const entryCode = document.getElementById('spec-card-entry-input').value.trim() || ('#ENTRY-' + (currentSpecCardBuild.slug?.slice(0, 6) || '2026').toUpperCase());
    const includeQr = document.getElementById('spec-card-chk-qr').checked;
    const includeCover = document.getElementById('spec-card-chk-cover').checked;
    const includePaints = document.getElementById('spec-card-chk-paints').checked;
    const includeJudges = document.getElementById('spec-card-chk-judges').checked;

    const dimsLabel = document.getElementById('spec-card-dims-label');
    if (dimsLabel) {
      dimsLabel.textContent = widthCm + ' x ' + heightCm + ' cm' + (format === 'tent' ? ' (Plegable: ' + (heightCm * 2) + ' cm)' : '');
    }

    const container = document.getElementById('spec-card-preview-container');
    if (!container) return;

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      const res = await fetch(apiBase + '/api/v1/builds/' + currentSpecCardBuild.id + '/spec-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': '${config.tenantSlug}' },
        body: JSON.stringify({
          widthMm,
          heightMm,
          format,
          theme,
          contestName,
          entryCode,
          includeQr,
          includeCoverImage: includeCover,
          includePaints,
          includeJudgeScoreBox: includeJudges
        })
      });

      if (!res.ok) throw new Error('Error al generar la ficha');
      const data = await res.json();
      currentSpecCardData = data;

      const isLight = theme === 'light_ink_saver';
      const bgColor = isLight ? '#FFFFFF' : '#0B0F17';
      const textColor = isLight ? '#0F172A' : '#FFFFFF';
      const subColor = isLight ? '#475569' : '#94A3B8';
      const borderColor = isLight ? '#000000' : '#0284C7';
      const badgeBg = isLight ? '#F1F5F9' : 'rgba(2,132,199,0.15)';
      const badgeBorder = isLight ? '#000000' : 'rgba(2,132,199,0.4)';
      const badgeColor = isLight ? '#0F172A' : '#38BDF8';

      const b = data.build;
      const steps = b.steps || [];
      const coverUrl = b.coverImageUrl || (steps[0] && steps[0].photoUrls && steps[0].photoUrls[0]) || '/legacy-media/plamoscale/images/aperich/thumbs/01.jpg';

      // Paints text & summary
      const paintList = (steps.flatMap(s => s.paintUsages || []).map(u => u.paint ? (u.paint.code + ' ' + u.paint.name) : '').filter(Boolean));
      const uniquePaintNames = Array.from(new Set(paintList)).slice(0, 5).join(', ');

      const judgesHtml = includeJudges
        ? '<div style="margin-top: 6px; padding: 4px; border: 1px dashed ' + borderColor + '; border-radius: 4px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; text-align: center; font-size: 8px;">' +
            '<div><strong>Montaje</strong><br>___/25</div>' +
            '<div><strong>Pintura</strong><br>___/35</div>' +
            '<div><strong>Acabado</strong><br>___/20</div>' +
            '<div><strong>Creatividad</strong><br>___/20</div>' +
            '<div style="font-weight: 700; color: ' + (isLight ? '#000' : '#38bdf8') + ';"><strong>TOTAL</strong><br>___/100</div>' +
          '</div>'
        : '';

      const frontFaceHtml = 
        '<div style="width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 12px; background: ' + bgColor + '; color: ' + textColor + ';">' +
          '<!-- Top Header: Contest & Entry Code -->' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; border-bottom: 2px solid ' + borderColor + '; padding-bottom: 6px; margin-bottom: 6px;">' +
            '<div>' +
              '<div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: ' + (isLight ? '#dc2626' : 'var(--primary)') + ';">' + escapeHtml(contestName) + '</div>' +
              '<div style="font-size: 8px; color: ' + subColor + ';">Plataforma Oficial GunplaJunkies & PlamoScale</div>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<span style="font-size: 11px; font-weight: 900; font-family: monospace; padding: 2px 6px; border: 1.5px solid ' + badgeBorder + '; border-radius: 4px; background: ' + badgeBg + '; color: ' + badgeColor + ';">' + escapeHtml(entryCode) + '</span>' +
              '<div style="font-size: 8px; color: ' + subColor + '; margin-top: 2px;">' + escapeHtml(b.category?.toUpperCase() || 'MECHA') + '</div>' +
            '</div>' +
          '</div>' +

          '<!-- Main Body -->' +
          '<div style="display: flex; gap: 10px; flex: 1; align-items: center; justify-content: space-between;">' +
            '<div style="flex: 1; min-width: 0;">' +
              '<div style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: ' + subColor + ';">' + escapeHtml((b.scale || '') + ' ' + (b.grade || '')) + '</div>' +
              '<h2 style="font-size: 14px; font-weight: 800; line-height: 1.2; margin: 2px 0 4px 0; color: ' + textColor + '; white-space: normal; overflow: hidden;">' + escapeHtml(b.title) + '</h2>' +
              '<div style="font-size: 9px; color: ' + subColor + ';">Modelista: <strong style="color: ' + textColor + ';">@' + escapeHtml(b.username) + '</strong></div>' +
              (includePaints ? '<div style="font-size: 8px; color: ' + subColor + '; margin-top: 4px; line-height: 1.3;">🎨 <strong>Medios & Pinturas:</strong> ' + (uniquePaintNames || 'Laca / Acrílico / Poliuretano / MTN 94') + '</div>' : '') +
              '<div style="font-size: 7.5px; color: ' + subColor + '; margin-top: 2px;">⚡ <em>Técnicas:</em> Aerografía • Preshading • Calcas al agua • Barniz sellado</div>' +
            '</div>' +

            '<!-- Media & QR Side -->' +
            '<div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">' +
              (includeCover ? '<img src="' + coverUrl + '" style="width: 58px; height: 58px; object-fit: cover; border-radius: 4px; border: 1px solid ' + borderColor + ';">' : '') +
              (includeQr && data.qrDataUrl ? 
                '<div style="text-align: center;">' +
                  '<img src="' + data.qrDataUrl + '" style="width: 68px; height: 68px; border: 1px solid ' + borderColor + '; border-radius: 4px; display: block; background: #fff;">' +
                  '<div style="font-size: 6.5px; color: ' + subColor + '; margin-top: 2px; max-width: 70px; line-height: 1.1;">Escanea para ver Bitácora & WIP</div>' +
                '</div>' : '') +
            '</div>' +
          '</div>' +

          judgesHtml +
        '</div>';

      if (format === 'tent') {
        const backFlapHtml = 
          '<div style="width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px; background: ' + (isLight ? '#F8FAFC' : '#111827') + '; color: ' + textColor + '; border-bottom: 2px dashed #94a3b8; text-align: center;">' +
            '<div style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: ' + subColor + '; margin-bottom: 2px;">' + escapeHtml(contestName) + '</div>' +
            '<div style="font-size: 20px; font-weight: 900; font-family: monospace; color: ' + (isLight ? '#000' : 'var(--primary)') + '; letter-spacing: 0.05em;">' + escapeHtml(entryCode) + '</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: ' + textColor + '; margin-top: 2px;">' + escapeHtml(b.title) + '</div>' +
            '<div style="font-size: 8px; color: ' + subColor + '; margin-top: 4px;">✂️ LÍNEA DE DOBLEZ / FOLD HERE PARA CABALLETE DE MESA ✂️</div>' +
          '</div>';

        container.innerHTML = 
          '<div id="spec-card-print-target" style="width: ' + widthMm + 'mm; max-width: 100%; display: flex; flex-direction: column; border: 2px solid ' + borderColor + '; border-radius: 6px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">' +
            '<div style="height: ' + heightMm + 'mm; max-height: 240px;">' + backFlapHtml + '</div>' +
            '<div style="height: ' + heightMm + 'mm; max-height: 240px;">' + frontFaceHtml + '</div>' +
          '</div>';
      } else {
        container.innerHTML = 
          '<div id="spec-card-print-target" style="width: ' + widthMm + 'mm; height: ' + heightMm + 'mm; max-width: 100%; max-height: 380px; border: 2px solid ' + borderColor + '; border-radius: 6px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">' +
            frontFaceHtml +
          '</div>';
      }
    } catch (err) {
      container.innerHTML = '<div style="color: #ef4444; font-size: 0.85rem; padding: 1.5rem;">' + err.message + '</div>';
    }
  }

  function printSpecCard() {
    const target = document.getElementById('spec-card-print-target');
    if (!target) return;

    const widthCm = parseFloat(document.getElementById('spec-card-width-input').value) || 15;
    const heightCm = parseFloat(document.getElementById('spec-card-height-input').value) || 10;
    const widthMm = Math.round(widthCm * 10);
    const heightMm = Math.round(heightCm * 10);
    const format = document.getElementById('spec-card-format-select').value;
    const totalHeightMm = format === 'tent' ? heightMm * 2 : heightMm;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor autoriza ventanas emergentes en tu navegador para imprimir la ficha.');
      return;
    }

    const title = currentSpecCardBuild ? currentSpecCardBuild.title : 'Ficha de Concurso';

    printWindow.document.write(
      '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
        '<meta charset="utf-8">' +
        '<title>Ficha de Concurso - ' + escapeHtml(title) + '</title>' +
        '<style>' +
          '@page { size: ' + widthMm + 'mm ' + totalHeightMm + 'mm; margin: 0; }' +
          '@media print {' +
            'html, body { width: ' + widthMm + 'mm; height: ' + totalHeightMm + 'mm; margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
            '#spec-card-print-target { box-shadow: none !important; width: ' + widthMm + 'mm !important; height: ' + totalHeightMm + 'mm !important; max-height: none !important; max-width: none !important; border: 2px solid #000 !important; }' +
          '}' +
          '* { box-sizing: border-box; margin: 0; padding: 0; }' +
          'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; background: #eee; min-height: 100vh; }' +
        '</style>' +
      '</head>' +
      '<body>' +
        target.outerHTML +
        '<' + 'script>' +
          'window.addEventListener("load", () => { setTimeout(() => { window.print(); }, 250); });' +
        '<' + '/script>' +
      '</body>' +
      '</html>'
    );
    printWindow.document.close();
  }

  // AI Paint Assistant Sub-Tab Switching & 4-Way Medium Selector
  let currentSelectedPaintMedium = 'lacquer';

  const MEDIUM_INFO_MAP = {
    lacquer: {
      title: 'Química & Técnica: Laca (Mr. Color / Gaia Notes)',
      badge: '🟣 Laca (Mr. Color)',
      badgeColor: '#c084fc',
      badgeBg: 'rgba(168,85,247,0.2)',
      badgeBorder: 'rgba(168,85,247,0.3)',
      panelBorder: 'rgba(168,85,247,0.25)',
      panelBg: 'rgba(168,85,247,0.06)',
      titleColor: '#c084fc',
      body: '• <strong>Solvente / Vehículo:</strong> Ésteres y solventes aromáticos orgánicos.<br>' +
            '• <strong>Dilución Óptima:</strong> 1:1.5 a 1:2 con Mr. Color Leveling Thinner (con retardante antiniebla).<br>' +
            '• <strong>Presión de Trabajo:</strong> 12 - 16 PSI (0.8 - 1.1 bar) con boquilla 0.2mm a 0.3mm.<br>' +
            '• <strong>Seguridad:</strong> Obligatorio uso de respirador para vapores orgánicos y cabina de extracción.<br>' +
            '• <strong>Compatibilidad Plástico:</strong> Aplicar sobre imprimación o en capas finas para no derretir poliestireno (PS).'
    },
    acrylic: {
      title: 'Química & Técnica: Acrílico (Tamiya X / XF)',
      badge: '🔵 Acrílico (Tamiya)',
      badgeColor: '#60a5fa',
      badgeBg: 'rgba(59,130,246,0.2)',
      badgeBorder: 'rgba(59,130,246,0.3)',
      panelBorder: 'rgba(59,130,246,0.25)',
      panelBg: 'rgba(59,130,246,0.06)',
      titleColor: '#60a5fa',
      body: '• <strong>Solvente / Vehículo:</strong> Resina acrílica con vehículo hidroalcohólico.<br>' +
            '• <strong>Dilución Óptima:</strong> 1:1 con Tamiya X-20A o Alcohol Isopropílico (IPA 90%+). Para acabado nivelado se puede usar Mr. Leveling Thinner.<br>' +
            '• <strong>Presión de Trabajo:</strong> 15 - 20 PSI con boquilla 0.3mm.<br>' +
            '• <strong>Seguridad:</strong> Mascarilla para partículas de pintura. Olor moderado tolerable en interiores ventilados.<br>' +
            '• <strong>Compatibilidad Plástico:</strong> 100% seguro con poliestireno, ABS y resina.'
    },
    polyurethane: {
      title: 'Química & Técnica: Poliuretano Acrílico (Vallejo Mecha / Model Color)',
      badge: '🟢 Poliuretano (Vallejo)',
      badgeColor: '#4ade80',
      badgeBg: 'rgba(34,197,94,0.2)',
      badgeBorder: 'rgba(34,197,94,0.3)',
      panelBorder: 'rgba(34,197,94,0.25)',
      panelBg: 'rgba(34,197,94,0.06)',
      titleColor: '#4ade80',
      body: '• <strong>Solvente / Vehículo:</strong> Dispersión de resina de poliuretano en agua desionizada.<br>' +
            '• <strong>Dilución Óptima:</strong> 70% pintura : 30% Vallejo Thinner (71.161) + 1 gota de Flow Improver. ¡NUNCA USAR ALCOHOL NI THINNER LACA!<br>' +
            '• <strong>Presión de Trabajo:</strong> 18 - 22 PSI con boquilla 0.3mm a 0.4mm.<br>' +
            '• <strong>Seguridad:</strong> Cero toxicidad por vapores, no inflamable, seguro para pintar en dormitorios.<br>' +
            '• <strong>Resistencia Mecánica:</strong> La resina de poliuretano vulcaniza tras 48h ofreciendo la mayor resistencia al desgaste en articulaciones Gunpla.'
    },
    montana_colors: {
      title: 'Química & Técnica: Montana Colors (Sprays de Graffiti & Water Based - https://www.montanacolors.com)',
      badge: '🎨 Montana Colors (Aerosoles)',
      badgeColor: '#fb923c',
      badgeBg: 'rgba(249,115,22,0.2)',
      badgeBorder: 'rgba(249,115,22,0.3)',
      panelBorder: 'rgba(249,115,22,0.25)',
      panelBg: 'rgba(249,115,22,0.06)',
      titleColor: '#fb923c',
      body: '• <strong>Gamas Recomendadas:</strong> MTN 94 (baja presión y acabado mate sintético), MTN Water Based (base agua libre de olor y seguro para poliestireno) y MTN PRO (imprimación plástica y barnices).<br>' +
            '• <strong>Boquillas / Caps:</strong> Cambia la boquilla de fábrica por <em>Pocket Cap</em> o <em>Skinny Universal Cap</em> para trazos finos y control de flujo en piezas de Gunpla.<br>' +
            '• <strong>Técnica de Aplicación:</strong> Pulverizar a 20-25 cm de distancia en pasadas rápidas ("sweep passes"), comenzando y terminando fuera de la pieza. Nunca concentrar el spray.<br>' +
            '• <strong>Protección del Plástico:</strong> Aplicar primero imprimación plástica para evitar que los solventes sintéticos del MTN 94 ablanden el poliestireno (PS). Si usas MTN Water Based, es directamente inocuo.'
    }
  };

  function selectPaintMedium(medium) {
    currentSelectedPaintMedium = medium;
    const info = MEDIUM_INFO_MAP[medium] || MEDIUM_INFO_MAP.lacquer;

    ['lacquer', 'acrylic', 'polyurethane', 'montana_colors'].forEach(m => {
      const card = document.getElementById('medium-card-' + m);
      if (card) {
        if (m === medium) {
          card.className = 'medium-select-card active ' + m;
        } else {
          card.className = 'medium-select-card ' + m;
        }
      }
    });

    const badge = document.getElementById('selected-medium-badge');
    if (badge) {
      badge.textContent = info.badge;
      badge.style.color = info.badgeColor;
      badge.style.background = info.badgeBg;
      badge.style.borderColor = info.badgeBorder;
    }

    const panel = document.getElementById('medium-info-panel');
    const titleEl = document.getElementById('medium-info-title');
    const bodyEl = document.getElementById('medium-info-body');
    if (panel && titleEl && bodyEl) {
      panel.style.background = info.panelBg;
      panel.style.borderColor = info.panelBorder;
      titleEl.textContent = info.title;
      titleEl.style.color = info.titleColor;
      bodyEl.innerHTML = info.body;
    }
  }

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
    resultBox.innerHTML = '<p style="font-size: 0.85rem; color: #94a3b8;">Buscando matriz de conversión para ' + currentSelectedPaintMedium.toUpperCase() + '...</p>';

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
        body: JSON.stringify({ sourceCode: code, targetMedium: currentSelectedPaintMedium })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'No se encontró equivalencia');
      }

      const data = await res.json();
      const matchesHtml = (data.matches || []).map(m => {
        const isSelectedMedium = 
          (currentSelectedPaintMedium === 'montana_colors' && m.brand === 'Montana Colors') ||
          (currentSelectedPaintMedium === 'polyurethane' && m.type === 'polyurethane') ||
          (currentSelectedPaintMedium === 'lacquer' && m.type === 'lacquer') ||
          (currentSelectedPaintMedium === 'acrylic' && m.type === 'acrylic');

        const mediumBadge = isSelectedMedium
          ? '<span style="font-size: 0.7rem; padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(2,132,199,0.25); color: #38bdf8; border: 1px solid rgba(2,132,199,0.4); font-weight: 700; margin-right: 0.4rem;">★ MEDIO SELECCIONADO</span>'
          : '';

        const rackBadge = m.ownedInRack 
          ? '<span style="font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.3);">✓ En tu Rack (' + (m.rackQuantity || 1) + ')</span>'
          : '<span style="font-size: 0.72rem; color: #64748b;">No registrado en rack</span>';

        const cardBorder = isSelectedMedium ? 'border: 2px solid var(--accent); background: rgba(2,132,199,0.06);' : 'border: 1px solid var(--border-color); background: rgba(255,255,255,0.03);';

        return '<div style="' + cardBorder + ' border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">' +
          '<div style="width: 32px; height: 32px; border-radius: 50%; background: ' + m.hexColor + '; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0;"></div>' +
          '<div style="flex: 1;">' +
            '<div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">' +
              mediumBadge +
              '<span style="font-size: 0.85rem; font-weight: 700; color: #fff;">' + m.brand + ' • ' + m.code + ' (' + m.name + ')</span>' +
            '</div>' +
            '<div style="font-size: 0.75rem; color: #94a3b8;">' + m.line + ' • ' + m.type.toUpperCase() + ' (' + m.finish + ')</div>' +
          '</div>' +
          '<div>' + rackBadge + '</div>' +
        '</div>';
      }).join('');

      const guide = data.airbrushGuide || {};

      resultBox.innerHTML = 
        '<div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 0.5rem;">' +
          '<div style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 0.6rem;">Equivalencias Exactas por Medio Químico:</div>' +
          matchesHtml +
          '<div style="background: rgba(2,132,199,0.08); border: 1px solid rgba(2,132,199,0.25); border-radius: 8px; padding: 0.85rem; margin-top: 0.75rem;">' +
            '<div style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">🎯 Guía Técnica (' + (guide.mediumTitle || currentSelectedPaintMedium.toUpperCase()) + '):</div>' +
            '<div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">' +
              '• <strong>Dilución / Formato:</strong> ' + guide.recommendedThinner + '<br>' +
              '• <strong>Ratio / Preparación:</strong> ' + guide.thinningRatio + '<br>' +
              '• <strong>Presión / Boquilla:</strong> ' + guide.recommendedPSI + '<br>' +
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
    resultBox.innerHTML = '<p style="font-size: 0.85rem; color: #94a3b8;">Generando fórmula y tonos para ' + currentSelectedPaintMedium.toUpperCase() + '...</p>';

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
        body: JSON.stringify({ query, preferredMedium: currentSelectedPaintMedium })
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
          : '<span style="font-size: 0.7rem; color: #94a3b8;">Sugerido</span>';

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

      const mediumTitleTag = currentSelectedPaintMedium === 'montana_colors'
        ? '<span style="font-size: 0.72rem; color: #fb923c; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); padding: 0.15rem 0.45rem; border-radius: 4px;">🎨 Montana Colors (Aerosoles MTN 94 / WB)</span>'
        : (currentSelectedPaintMedium === 'polyurethane'
          ? '<span style="font-size: 0.72rem; color: #4ade80; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); padding: 0.15rem 0.45rem; border-radius: 4px;">🟢 Poliuretano Acrílico (Vallejo)</span>'
          : (currentSelectedPaintMedium === 'acrylic'
            ? '<span style="font-size: 0.72rem; color: #60a5fa; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); padding: 0.15rem 0.45rem; border-radius: 4px;">🔵 Acrílico (Tamiya)</span>'
            : '<span style="font-size: 0.72rem; color: #c084fc; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); padding: 0.15rem 0.45rem; border-radius: 4px;">🟣 Laca (Mr. Color)</span>'));

      resultBox.innerHTML = 
        '<div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 0.5rem;">' +
          '<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">' +
            '<h4 style="font-size: 1rem; font-weight: 700; color: #fff;">' + data.recipeName + '</h4>' +
            '<div style="display: flex; gap: 0.4rem; align-items: center;">' + mediumTitleTag + engineBadge + '</div>' +
          '</div>' +
          '<p style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.75rem; line-height: 1.4;">' + data.description + '</p>' +
          '<div style="display: flex; gap: 0.35rem; margin-bottom: 0.75rem;">' + paletteHtml + '</div>' +
          '<div style="margin-bottom: 0.75rem;">' + componentsHtml + '</div>' +
          '<div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem;">' +
            '<div style="font-size: 0.78rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">⚖️ Mezcla y Proporciones:</div>' +
            '<p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.4;">' + data.mixingInstructions + '</p>' +
          '</div>' +
          '<div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); border-radius: 8px; padding: 0.75rem;">' +
            '<div style="font-size: 0.78rem; font-weight: 700; color: #4ade80; margin-bottom: 0.25rem;">💨 Aplicación / Aerógrafo / Spray:</div>' +
            '<div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.5;">' +
              '• <strong>Imprimación:</strong> ' + air.primer + '<br>' +
              '• <strong>Capa Base:</strong> ' + air.baseCoat + '<br>' +
              '• <strong>Sombra / Realce:</strong> ' + air.shadingOrHighlight + '<br>' +
              '• <strong>Barniz Final:</strong> ' + air.topCoat + '<br>' +
              '• <strong>Dilución / Formato:</strong> ' + air.thinnerRatio + '<br>' +
              '• <strong>Presión / Boquilla (Cap):</strong> ' + air.psi +
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

  // -------------------------------------------------------------------------
  // Activity Bell & Web Push Notifications Engine
  // -------------------------------------------------------------------------
  let userNotifications = [];

  function formatRelativeTime(isoString) {
    if (!isoString) return '';
    const now = Date.now();
    const date = new Date(isoString).getTime();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Hace unos segundos';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return 'Hace ' + diffMin + 'm';
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return 'Hace ' + diffHours + 'h';
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return 'Hace ' + diffDays + 'd';
    return new Date(isoString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'build_comment': return '💬';
      case 'contest_judged': return '⚖️';
      case 'contest_award': return '🏆';
      case 'commission_update': return '🎨';
      case 'wishlist_stock': return '📦';
      case 'community_vote': return '⭐';
      default: return '🔔';
    }
  }

  async function loadUserNotifications() {
    const badge = document.getElementById('activity-unread-badge');
    const countLabel = document.getElementById('activity-dropdown-count');
    const container = document.getElementById('activity-list-container');
    const pushBanner = document.getElementById('activity-push-banner');

    if (!currentToken || !currentUser) {
      if (badge) badge.style.display = 'none';
      if (countLabel) countLabel.textContent = '0 nuevas';
      if (container) {
        container.innerHTML = '<div style="padding: 2rem 1rem; text-align: center; color: #64748b; font-size: 0.85rem;"><span>🔒 Inicia sesión para ver tu actividad</span></div>';
      }
      return;
    }

    if ('Notification' in window && Notification.permission === 'default' && pushBanner) {
      pushBanner.style.display = 'flex';
    } else if (pushBanner) {
      pushBanner.style.display = 'none';
    }

    try {
      const res = await fetch('/api/v1/notifications', {
        headers: { 'Authorization': 'Bearer ' + currentToken }
      });
      if (!res.ok) return;
      const data = await res.json();
      userNotifications = data.items || [];
      const unreadCount = data.unreadCount || 0;

      if (badge) {
        if (unreadCount > 0) {
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          badge.style.display = 'block';
        } else {
          badge.style.display = 'none';
        }
      }

      if (countLabel) {
        countLabel.textContent = unreadCount + ' nuevas';
      }

      if (container) {
        if (userNotifications.length === 0) {
          container.innerHTML = '<div style="padding: 2rem 1rem; text-align: center; color: #64748b; font-size: 0.85rem;"><span>🔔 No hay notificaciones recientes</span></div>';
        } else {
          container.innerHTML = userNotifications.map(n => {
            const icon = getNotificationIcon(n.type);
            const timeAgo = formatRelativeTime(n.createdAt);
            const unreadClass = !n.read ? 'unread' : '';
            return '<div class="activity-item ' + unreadClass + '" data-notif-id="' + n.id + '" data-notif-link="' + (n.link || '') + '" onclick="handleNotificationClick(this.dataset.notifId, this.dataset.notifLink)">' +
              '<div class="activity-icon-badge">' + icon + '</div>' +
              '<div style="flex: 1; min-width: 0;">' +
                '<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; margin-bottom: 0.2rem;">' +
                  '<div style="font-size: 0.82rem; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escapeHtml(n.title) + '</div>' +
                  '<div style="font-size: 0.68rem; color: #64748b; flex-shrink: 0;">' + timeAgo + '</div>' +
                '</div>' +
                '<div style="font-size: 0.76rem; color: #94a3b8; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">' + escapeHtml(n.message) + '</div>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      }
    } catch (err) {
      console.warn('Error loading notifications:', err);
    }
  }

  function toggleActivityDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('activity-bell-dropdown');
    if (!dropdown) return;
    const isShowing = dropdown.classList.contains('active');

    const userMenu = document.getElementById('user-dropdown');
    if (userMenu) userMenu.classList.remove('active');

    if (isShowing) {
      dropdown.classList.remove('active');
    } else {
      dropdown.classList.add('active');
      loadUserNotifications();
    }
  }

  document.addEventListener('click', (e) => {
    const bellContainer = document.getElementById('activity-bell-container');
    const dropdown = document.getElementById('activity-bell-dropdown');
    if (dropdown && bellContainer && !bellContainer.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });

  async function handleNotificationClick(id, link) {
    const item = userNotifications.find(n => n.id === id);
    if (item) item.read = true;

    if (currentToken) {
      fetch('/api/v1/notifications/' + id + '/read', {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + currentToken }
      }).catch(() => {});
    }

    const dropdown = document.getElementById('activity-bell-dropdown');
    if (dropdown) dropdown.classList.remove('active');

    loadUserNotifications();

    if (link) {
      if (link.startsWith('#/workbench')) {
        goToWorkbench();
      } else if (link.startsWith('#/contests/')) {
        switchTab('contests');
      } else if (link.startsWith('#/builds/')) {
        switchTab('builds');
      } else if (link.startsWith('#/marketplace')) {
        switchTab('marketplace');
      } else {
        window.location.hash = link.replace('#', '');
      }
    }
  }

  async function markAllNotificationsAsRead() {
    if (!currentToken) return;
    try {
      const res = await fetch('/api/v1/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + currentToken }
      });
      if (res.ok) {
        userNotifications.forEach(n => { n.read = true; });
        loadUserNotifications();
      }
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    }
  }

  async function requestPushSubscription() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Tu navegador no soporta notificaciones Web Push.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Se rechazó el permiso de notificaciones.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBKr3qBUYIHBQFLXYp5Nksh8U'
        });
      }

      const rawKey = sub.getKey ? sub.getKey('p256dh') : null;
      const rawAuth = sub.getKey ? sub.getKey('auth') : null;
      const p256dh = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : 'mock-p256dh';
      const auth = rawAuth ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuth))) : 'mock-auth';

      if (currentToken) {
        await fetch('/api/v1/notifications/push-subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentToken
          },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: { p256dh, auth },
            userAgent: navigator.userAgent
          })
        });
      }

      const pushBanner = document.getElementById('activity-push-banner');
      if (pushBanner) pushBanner.style.display = 'none';

      showShareToast('🔔 Alertas Web Push activadas correctamente');
    } catch (err) {
      console.warn('Push registration fallback:', err);
      if (currentToken) {
        await fetch('/api/v1/notifications/push-subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentToken
          },
          body: JSON.stringify({
            endpoint: 'https://push.plamoscale.com/mock-endpoint/' + (currentUser ? currentUser.id : 'anon'),
            keys: { p256dh: 'mock-p256dh-key', auth: 'mock-auth-secret' },
            userAgent: navigator.userAgent
          })
        }).catch(() => {});
      }
      const pushBanner = document.getElementById('activity-push-banner');
      if (pushBanner) pushBanner.style.display = 'none';
      showShareToast('🔔 Alertas Web Push activadas');
    }
  }

  function logout() {
    localStorage.removeItem('plamo_sso_token');
    localStorage.removeItem('plamo_sso_user');
    currentUser = null;
    currentToken = null;
    userNotifications = [];
    renderAuthUI();
    loadWorkbenchData();
  }

  // Initialize auth state and Google One-Tap on page load
  window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setInterval(loadUserNotifications, 30000);
  });
</script>

</body>
</html>`;
}
