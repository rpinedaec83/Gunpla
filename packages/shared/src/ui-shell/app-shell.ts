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
  GroupBuildRecord,
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
  groupBuilds?: GroupBuildRecord[];
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

  // --- Sub-Tabs Engine: Contests & Group Builds ---
  let activeContestsSubtab = 'contests';
  function switchContestsSubtab(subtab) {
    activeContestsSubtab = subtab;
    const btnContests = document.getElementById('contests-subtab-btn-contests');
    const btnGroupBuilds = document.getElementById('contests-subtab-btn-groupbuilds');
    const panelContests = document.getElementById('contests-panel-contests');
    const panelGroupBuilds = document.getElementById('contests-panel-groupbuilds');

    if (btnContests) btnContests.classList.toggle('active', subtab === 'contests');
    if (btnGroupBuilds) btnGroupBuilds.classList.toggle('active', subtab === 'groupbuilds');
    if (panelContests) panelContests.style.display = (subtab === 'contests') ? 'block' : 'none';
    if (panelGroupBuilds) panelGroupBuilds.style.display = (subtab === 'groupbuilds') ? 'block' : 'none';
  }

  // --- Group Builds (Collaborative Multi-Author Projects) ---
  function openCreateGroupBuildModal() {
    if (!currentUser || !currentToken) {
      alert('Debes iniciar sesión con tu cuenta de modelista para organizar un proyecto grupal.');
      openAuthModal();
      return;
    }
    const m = document.getElementById('modal-create-group-build');
    const endDateInput = document.getElementById('cgb-end-date');
    if (endDateInput && !endDateInput.value) {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      endDateInput.value = d.toISOString().split('T')[0];
    }
    if (m) m.classList.add('active');
  }

  function closeCreateGroupBuildModal(e) {
    if (!e || e.target.id === 'modal-create-group-build' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-create-group-build');
      if (m) m.classList.remove('active');
    }
  }

  async function handleCreateGroupBuildSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('cgb-title').value.trim();
    const category = document.getElementById('cgb-category').value;
    const endDate = document.getElementById('cgb-end-date').value;
    const description = document.getElementById('cgb-desc').value.trim();
    const rulesRaw = document.getElementById('cgb-rules').value.trim();
    const bannerImageUrl = document.getElementById('cgb-banner-url').value.trim();
    const btn = document.getElementById('btn-submit-cgb');

    const rules = rulesRaw ? rulesRaw.split(String.fromCharCode(10)).map(r => r.trim()).filter(Boolean) : [];
    const startDate = new Date().toISOString();

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + currentToken,
      'X-Tenant-Slug': '${config.tenantSlug}'
    };

    btn.disabled = true;
    btn.textContent = 'Creando proyecto...';

    try {
      const res = await fetch(apiBase + '/api/v1/group-builds', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title,
          category,
          startDate,
          endDate: new Date(endDate).toISOString(),
          description,
          rules,
          bannerImageUrl: bannerImageUrl || undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al crear proyecto grupal');
      }

      closeCreateGroupBuildModal();
      alert('¡Proyecto Grupal creado con éxito! Ya puedes invitar a otros modelistas a unirse.');
      window.location.reload();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Publicar Proyecto Grupal';
    }
  }

  let activeJoinGroupBuildId = null;

  async function openJoinGroupBuildModal(groupBuildId, title) {
    if (!currentUser || !currentToken) {
      alert('Debes iniciar sesión con tu cuenta de modelista para unirte al proyecto grupal.');
      openAuthModal();
      return;
    }

    activeJoinGroupBuildId = groupBuildId;
    const m = document.getElementById('modal-join-group-build');
    const idInput = document.getElementById('join-gb-id');
    const titleText = document.getElementById('join-gb-title-text');
    const select = document.getElementById('join-gb-build-select');
    const btn = document.getElementById('btn-submit-join-gb');

    if (idInput) idInput.value = groupBuildId;
    if (titleText) titleText.textContent = 'Inscribir bitácora a: ' + title;

    if (select) {
      select.innerHTML = '<option value="">Cargando tus proyectos...</option>';
      select.disabled = true;
    }
    if (btn) btn.disabled = true;

    if (m) m.classList.add('active');

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    try {
      let builds = window.__WB_BUILDS;
      if (!builds || builds.length === 0) {
        const res = await fetch(apiBase + '/api/v1/builds?username=' + encodeURIComponent(currentUser.username));
        if (res.ok) {
          const d = await res.json();
          builds = d.items || [];
        }
      }

      if (!builds || builds.length === 0) {
        if (select) {
          select.innerHTML = '<option value="">No tienes bitácoras registradas</option>';
        }
      } else {
        if (select) {
          select.innerHTML = builds.map(b => 
            '<option value="' + b.id + '">' + escapeHtml(b.title) + ' (' + (b.category || 'Gunpla') + ')</option>'
          ).join('');
          select.disabled = false;
        }
        if (btn) btn.disabled = false;
      }
    } catch (err) {
      if (select) select.innerHTML = '<option value="">Error al cargar bitácoras</option>';
    }
  }

  function closeJoinGroupBuildModal(e) {
    if (!e || e.target.id === 'modal-join-group-build' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-join-group-build');
      if (m) m.classList.remove('active');
    }
  }

  async function handleJoinGroupBuildSubmit(e) {
    e.preventDefault();
    const groupBuildId = document.getElementById('join-gb-id').value;
    const buildId = document.getElementById('join-gb-build-select').value;
    const btn = document.getElementById('btn-submit-join-gb');

    if (!buildId) {
      alert('Debes seleccionar una bitácora para inscribirte.');
      return;
    }

    const apiBase = '${(config.apiUrl || '').replace(/\/$/, '')}';
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + currentToken,
      'X-Tenant-Slug': '${config.tenantSlug}'
    };

    btn.disabled = true;
    btn.textContent = 'Inscribiendo...';

    try {
      const res = await fetch(apiBase + '/api/v1/group-builds/' + groupBuildId + '/join', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ buildId })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al unirte al proyecto grupal');
      }

      closeJoinGroupBuildModal();
      alert('¡Te has unido con éxito al Proyecto Grupal! Tu avance se compartirá con la comunidad.');
      window.location.reload();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirmar Inscripción';
    }
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

    if (subtab === 'tools') {
      loadWorkbenchTools();
    }
  }

  // --- Barcode Scanner & Instant Stash Registration Engine ---
  let barcodeMediaStream = null;
  let barcodeScanInterval = null;
  let barcodeScannerRunning = false;
  let lastScannedBarcodeValue = null;
  let lastScannedBarcodeTime = 0;
  let currentBarcodeLookup = null;

  function openBarcodeScannerModal() {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const m = document.getElementById('modal-barcode-scanner');
    if (!m) return;

    // Reset inputs and results
    const manualInput = document.getElementById('barcode-manual-input');
    if (manualInput) manualInput.value = '';
    const resultCard = document.getElementById('barcode-result-card');
    if (resultCard) {
      resultCard.style.display = 'none';
      resultCard.innerHTML = '';
    }
    currentBarcodeLookup = null;

    m.classList.add('active');
    startBarcodeScannerCamera();
  }

  function closeBarcodeScannerModal(e) {
    if (!e || e.target.id === 'modal-barcode-scanner' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-barcode-scanner');
      if (m) m.classList.remove('active');
      stopBarcodeScannerCamera();
    }
  }

  async function startBarcodeScannerCamera() {
    const video = document.getElementById('barcode-scanner-video');
    const statusEl = document.getElementById('barcode-scanner-status');
    const laser = document.getElementById('barcode-laser-line');

    if (laser) laser.style.display = 'block';
    if (statusEl) {
      statusEl.textContent = 'Iniciando cámara...';
      statusEl.style.color = '#38bdf8';
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusEl) {
        statusEl.textContent = 'Cámara no soportada en este navegador. Usa la búsqueda manual.';
        statusEl.style.color = '#f59e0b';
      }
      return;
    }

    try {
      stopBarcodeScannerCamera();
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      barcodeMediaStream = stream;
      if (video) {
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play().catch(() => {});
      }

      barcodeScannerRunning = true;
      if (statusEl) {
        statusEl.textContent = 'Apunta al código de barras en la caja...';
        statusEl.style.color = '#38bdf8';
      }

      // Live BarcodeDetector API Integration
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
          });

          barcodeScanInterval = setInterval(async () => {
            if (!barcodeScannerRunning || !video || video.readyState < 2) return;
            try {
              const detected = await barcodeDetector.detect(video);
              if (detected && detected.length > 0 && detected[0].rawValue) {
                const code = detected[0].rawValue;
                const now = Date.now();
                if (code !== lastScannedBarcodeValue || (now - lastScannedBarcodeTime) > 3000) {
                  lastScannedBarcodeValue = code;
                  lastScannedBarcodeTime = now;
                  onBarcodeDetected(code);
                }
              }
            } catch (err) {
              // Ignore single frame detect errors
            }
          }, 350);
        } catch (detectorErr) {
          console.warn('BarcodeDetector format init fallback:', detectorErr);
        }
      } else {
        if (statusEl) {
          statusEl.textContent = 'Cámara activa. Si no detecta automáticamente, usa el campo manual.';
        }
      }
    } catch (err) {
      console.warn('getUserMedia error:', err);
      if (statusEl) {
        statusEl.textContent = 'Permiso de cámara denegado o no disponible. Ingresa el código abajo.';
        statusEl.style.color = '#f87171';
      }
      if (laser) laser.style.display = 'none';
    }
  }

  function stopBarcodeScannerCamera() {
    barcodeScannerRunning = false;
    if (barcodeScanInterval) {
      clearInterval(barcodeScanInterval);
      barcodeScanInterval = null;
    }
    if (barcodeMediaStream) {
      barcodeMediaStream.getTracks().forEach(t => t.stop());
      barcodeMediaStream = null;
    }
    const video = document.getElementById('barcode-scanner-video');
    if (video) {
      video.srcObject = null;
    }
  }

  function restartBarcodeScannerCamera() {
    startBarcodeScannerCamera();
  }

  function onBarcodeDetected(code) {
    const statusEl = document.getElementById('barcode-scanner-status');
    if (statusEl) {
      statusEl.textContent = '✓ Código detectado: ' + code;
      statusEl.style.color = '#4ade80';
    }
    const manualInput = document.getElementById('barcode-manual-input');
    if (manualInput) manualInput.value = code;

    lookupBarcode(code);
  }

  function handleManualBarcodeSearch() {
    const input = document.getElementById('barcode-manual-input');
    if (!input || !input.value.trim()) {
      alert('Por favor ingresa un código de barras (ej: 4573102619198).');
      return;
    }
    lookupBarcode(input.value.trim());
  }

  async function lookupBarcode(rawBarcode) {
    const card = document.getElementById('barcode-result-card');
    if (!card) return;

    card.style.display = 'block';
    card.innerHTML = 
      '<div style="text-align: center; color: #38bdf8; padding: 1.5rem 0;">' +
        '<div style="font-size: 1.75rem; margin-bottom: 0.5rem;">🔍</div>' +
        '<strong>Consultando catálogo maestro para ' + escapeHtml(rawBarcode) + '...</strong>' +
      '</div>';

    try {
      const res = await fetch('/api/v1/catalog/barcode/' + encodeURIComponent(rawBarcode));
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        card.innerHTML = 
          '<div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); padding: 0.85rem; border-radius: 6px; color: #fca5a5; font-size: 0.82rem;">' +
            '<strong>Error en consulta:</strong> ' + escapeHtml(errData.detail || 'Código de barras no válido') +
          '</div>';
        return;
      }

      const data = await res.json();
      currentBarcodeLookup = data;
      renderBarcodeResult(data);
    } catch (err) {
      console.error('Barcode lookup failed:', err);
      card.innerHTML = 
        '<div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); padding: 0.85rem; border-radius: 6px; color: #fca5a5; font-size: 0.82rem;">' +
          'No se pudo conectar con el catálogo. Verifica tu conexión.' +
        '</div>';
    }
  }

  function renderBarcodeResult(data) {
    const card = document.getElementById('barcode-result-card');
    if (!card) return;

    const formatBadge = '<span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600;">' + escapeHtml(data.format || 'JAN-13') + '</span>';
    const hintBadge = data.manufacturerHint
      ? '<span style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600;">🏭 ' + escapeHtml(data.manufacturerHint) + '</span>'
      : '';

    if (data.found && data.kit) {
      const kit = data.kit;
      const boxart = kit.boxartUrl || '/legacy-media/plamoscale/images/aperich/thumbs/01.jpg';

      card.innerHTML = 
        '<div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap;">' +
          '<img src="' + boxart + '" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #334155; flex-shrink: 0;" />' +
          '<div style="flex: 1; min-width: 200px;">' +
            '<div style="display: flex; gap: 0.4rem; margin-bottom: 0.35rem; flex-wrap: wrap;">' +
              formatBadge +
              hintBadge +
              '<span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600;">✓ En Catálogo</span>' +
            '</div>' +
            '<h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 0.25rem;">' + escapeHtml(kit.name) + '</h4>' +
            '<div style="font-size: 0.8rem; color: #94a3b8;">' +
              escapeHtml(kit.brand) + ' • ' + escapeHtml(kit.scale) + (kit.grade ? ' • ' + escapeHtml(kit.grade) : '') +
            '</div>' +
            '<div style="font-size: 0.75rem; color: #64748b; margin-top: 0.2rem; font-family: monospace;">' +
              'Código: ' + escapeHtml(data.normalizedBarcode) + (kit.kitNumber ? ' | Ref: #' + escapeHtml(kit.kitNumber) : '') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<form onsubmit="handleConfirmBarcodeStash(event)" style="border-top: 1px solid #334155; padding-top: 0.85rem;">' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">' +
            '<div>' +
              '<label class="auth-label" style="font-size: 0.75rem;">Estado en Stash</label>' +
              '<select id="scan-stash-status" class="auth-input" style="padding: 0.45rem;">' +
                '<option value="unbuilt" selected>⏳ Sin Armar (Backlog)</option>' +
                '<option value="in_progress">🛠️ En Armado (WIP)</option>' +
                '<option value="built">🏆 Armado (Terminado)</option>' +
                '<option value="wishlist">⭐ Lista de Deseos</option>' +
                '<option value="for_trade">🏷️ En Venta / Trade</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="auth-label" style="font-size: 0.75rem;">Precio Pagado (Opcional)</label>' +
              '<div style="display: flex; gap: 0.3rem;">' +
                '<input type="number" step="0.01" id="scan-stash-price" class="auth-input" placeholder="0.00" style="padding: 0.45rem;" />' +
                '<select id="scan-stash-currency" class="auth-input" style="width: 85px; padding: 0.45rem;">' +
                  '<option value="USD">USD</option>' +
                  '<option value="JPY">JPY</option>' +
                  '<option value="EUR">EUR</option>' +
                  '<option value="MXN">MXN</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom: 0.85rem;">' +
            '<label class="auth-label" style="font-size: 0.75rem;">Notas de adquisición (Opcional)</label>' +
            '<input type="text" id="scan-stash-notes" class="auth-input" placeholder="ej. Comprada en Mandarake / Regalo de cumpleaños" style="padding: 0.45rem;" />' +
          '</div>' +
          '<button type="submit" id="btn-submit-scan-stash" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; font-weight: 700; background: linear-gradient(135deg, #0ea5e9, #6366f1); border: none;">' +
            '📦 Agregar Maqueta a Mi Stash' +
          '</button>' +
        '</form>';
    } else {
      // Kit not yet in catalog: Allow instant creation + stash addition
      const defaultBrand = data.manufacturerHint || 'Bandai Spirits';
      card.innerHTML = 
        '<div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.85rem;">' +
          '<div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.25rem;">' +
            formatBadge +
            hintBadge +
          '</div>' +
          '<div style="color: #fbbf24; font-size: 0.82rem; font-weight: 600;">' +
            'Código no encontrado en el catálogo maestro, ¡pero puedes registrar la maqueta al instante!' +
          '</div>' +
        '</div>' +

        '<form onsubmit="handleConfirmBarcodeStash(event)">' +
          '<div style="margin-bottom: 0.65rem;">' +
            '<label class="auth-label" style="font-size: 0.75rem;">Nombre del Kit / Maqueta *</label>' +
            '<input type="text" id="scan-new-kit-name" class="auth-input" placeholder="ej. MG 1/100 Zeta Gundam Ver.Ka" required style="padding: 0.45rem;" />' +
          '</div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.65rem;">' +
            '<div>' +
              '<label class="auth-label" style="font-size: 0.75rem;">Marca *</label>' +
              '<input type="text" id="scan-new-kit-brand" class="auth-input" value="' + escapeHtml(defaultBrand) + '" required style="padding: 0.45rem;" />' +
            '</div>' +
            '<div>' +
              '<label class="auth-label" style="font-size: 0.75rem;">Escala *</label>' +
              '<input type="text" id="scan-new-kit-scale" class="auth-input" value="1/144" required style="padding: 0.45rem;" />' +
            '</div>' +
          '</div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.65rem;">' +
            '<div>' +
              '<label class="auth-label" style="font-size: 0.75rem;">Categoría</label>' +
              '<select id="scan-new-kit-category" class="auth-input" style="padding: 0.45rem;">' +
                '<option value="gunpla-mecha" selected>Gunpla & Mecha</option>' +
                '<option value="military">Militar & Blindados</option>' +
                '<option value="aviation">Aviación</option>' +
                '<option value="automotive">Automotriz</option>' +
                '<option value="naval">Naval</option>' +
                '<option value="scifi">Ciencia Ficción</option>' +
                '<option value="figures">Figuras & Anime</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="auth-label" style="font-size: 0.75rem;">Estado en Stash</label>' +
              '<select id="scan-stash-status" class="auth-input" style="padding: 0.45rem;">' +
                '<option value="unbuilt" selected>⏳ Sin Armar (Backlog)</option>' +
                '<option value="in_progress">🛠️ En Armado (WIP)</option>' +
                '<option value="built">🏆 Armado (Terminado)</option>' +
                '<option value="wishlist">⭐ Lista de Deseos</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom: 0.85rem;">' +
            '<label class="auth-label" style="font-size: 0.75rem;">Notas de adquisición (Opcional)</label>' +
            '<input type="text" id="scan-stash-notes" class="auth-input" placeholder="ej. Edición limitada de evento" style="padding: 0.45rem;" />' +
          '</div>' +
          '<button type="submit" id="btn-submit-scan-stash" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; font-weight: 700; background: linear-gradient(135deg, #0ea5e9, #6366f1); border: none;">' +
            '✨ Registrar en Catálogo y Agregar al Stash' +
          '</button>' +
        '</form>';
    }
  }

  async function handleConfirmBarcodeStash(e) {
    if (e) e.preventDefault();
    if (!currentBarcodeLookup || !currentToken) return;

    const btn = document.getElementById('btn-submit-scan-stash');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Guardando en Stash...';
    }

    const statusSelect = document.getElementById('scan-stash-status');
    const notesInput = document.getElementById('scan-stash-notes');
    const priceInput = document.getElementById('scan-stash-price');
    const currSelect = document.getElementById('scan-stash-currency');

    const nameInput = document.getElementById('scan-new-kit-name');
    const brandInput = document.getElementById('scan-new-kit-brand');
    const scaleInput = document.getElementById('scan-new-kit-scale');
    const catSelect = document.getElementById('scan-new-kit-category');

    const payload = {
      barcode: currentBarcodeLookup.normalizedBarcode,
      status: statusSelect ? statusSelect.value : 'unbuilt',
      notes: notesInput && notesInput.value.trim() ? notesInput.value.trim() : undefined,
      pricePaid: priceInput && priceInput.value ? parseFloat(priceInput.value) : undefined,
      currency: currSelect ? currSelect.value : 'USD',
      kitName: nameInput && nameInput.value.trim() ? nameInput.value.trim() : undefined,
      brand: brandInput && brandInput.value.trim() ? brandInput.value.trim() : undefined,
      scale: scaleInput && scaleInput.value.trim() ? scaleInput.value.trim() : undefined,
      category: catSelect ? catSelect.value : undefined
    };

    try {
      const res = await fetch('/api/v1/workbench/stash/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Error: ' + (err.detail || 'No se pudo registrar la maqueta en el Stash'));
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Reintentar';
        }
        return;
      }

      const resData = await res.json();
      showShareToast('📦 ' + (resData.message || '¡Maqueta agregada con éxito a tu Stash!'));
      
      closeBarcodeScannerModal();
      loadWorkbenchData();
      switchTab('workbench');
      switchWorkbenchSubtab('stash');
    } catch (err) {
      console.error('Scan stash error:', err);
      alert('Error de conexión al agregar al Stash.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Reintentar';
      }
    }
  }

  // --- Interactive 3D / AR Viewer & Diorama Studio Engine ---
  let dioramaGl = null;
  let dioramaProgram = null;
  let dioramaAnimFrame = null;
  let dioramaCurrentKitId = null;
  let dioramaCurrentMetadata = null;
  let dioramaAvailableKits = [];

  let dioramaRotX = 18;
  let dioramaRotY = -35;
  let dioramaZoom = 1.0;
  let dioramaPanX = 0;
  let dioramaPanY = 0;
  let dioramaTurntable = false;
  let dioramaLighting = 'studio';
  let dioramaViewMode = 0; // 0: shaded, 1: clay, 2: wireframe, 3: matcap
  let dioramaShowGrid = true;
  let dioramaShowHuman = true;

  let dioramaIsDragging = false;
  let dioramaIsPanning = false;
  let dioramaMouseX = 0;
  let dioramaMouseY = 0;

  let dioramaModelBuffers = null;
  let dioramaGridBuffers = null;
  let dioramaHumanBuffers = null;

  async function openKit3dViewerModal(preselectedKitId) {
    const m = document.getElementById('modal-3d-viewer');
    if (!m) return;
    m.classList.add('active');

    // Fetch available 3D kits if dropdown is empty
    const kitSelect = document.getElementById('diorama-kit-select');
    if (kitSelect && kitSelect.options.length <= 1) {
      try {
        const res = await fetch('/api/v1/catalog/models-3d');
        if (res.ok) {
          const data = await res.json();
          dioramaAvailableKits = data.items || [];
          kitSelect.innerHTML = '<option value="">-- Seleccionar Maqueta --</option>' +
            dioramaAvailableKits.map(function(item) {
              const k = item.kit;
              return '<option value="' + k.id + '">' + escapeHtml(k.name) + ' (' + escapeHtml(k.scale) + ')</option>';
            }).join('');
        }
      } catch (err) {
        console.warn('Could not list 3D catalog:', err);
      }
    }

    const targetKitId = preselectedKitId || (dioramaAvailableKits[0] && dioramaAvailableKits[0].kit.id) || 'kit-rg-hinu';
    if (kitSelect) kitSelect.value = targetKitId;
    loadKit3dData(targetKitId);
  }

  function closeKit3dViewerModal(e) {
    if (!e || e.target.id === 'modal-3d-viewer' || e.target.classList.contains('auth-close')) {
      const m = document.getElementById('modal-3d-viewer');
      if (m) m.classList.remove('active');
      if (dioramaAnimFrame) {
        cancelAnimationFrame(dioramaAnimFrame);
        dioramaAnimFrame = null;
      }
      dioramaTurntable = false;
      const tBtn = document.getElementById('diorama-turntable-btn');
      if (tBtn) tBtn.textContent = '🔄 360° Off';
    }
  }

  async function switchDioramaKit(kitId) {
    if (!kitId) return;
    loadKit3dData(kitId);
  }

  async function loadKit3dData(kitId) {
    dioramaCurrentKitId = kitId;
    const titleEl = document.getElementById('diorama-modal-title');
    const subtitleEl = document.getElementById('diorama-modal-subtitle');
    const scaleBadge = document.getElementById('diorama-scale-badge');
    const humanBadge = document.getElementById('diorama-human-ref-badge');

    if (subtitleEl) subtitleEl.textContent = 'Cargando malla tridimensional...';

    try {
      const res = await fetch('/api/v1/catalog/kits/' + encodeURIComponent(kitId) + '/model-3d');
      if (!res.ok) throw new Error('Error al cargar metadata 3D');
      const data = await res.json();
      dioramaCurrentMetadata = data.model3d;

      if (titleEl) titleEl.textContent = '📐 ' + (data.kit.name || 'Visor 3D & Diorama');
      if (subtitleEl) subtitleEl.textContent = data.kit.brand + ' • ' + data.kit.scale + ' • Altura Real: ~' + data.model3d.realHeightMeters + 'm';
      if (scaleBadge) scaleBadge.textContent = 'Escala: ' + data.kit.scale + ' • Altura Maqueta: ' + data.model3d.physicalHeightMm + 'mm';
      if (humanBadge) humanBadge.textContent = '👤 Piloto Escala (1:1): ' + data.model3d.humanFigureScaleMm + 'mm';

      // Set default studio lighting from kit category
      const lightSelect = document.getElementById('diorama-lighting-select');
      if (lightSelect && data.model3d.defaultLighting) {
        lightSelect.value = data.model3d.defaultLighting;
        dioramaLighting = data.model3d.defaultLighting;
      }

      initDioramaWebGL();
      buildDioramaGeometry(data.model3d);
    } catch (err) {
      console.error('Failed to load 3d kit:', err);
      if (subtitleEl) subtitleEl.textContent = 'Error al cargar el modelo 3D.';
    }
  }

  // --- WebGL 3D Engine & Matrix Mathematics ---
  function initDioramaWebGL() {
    const canvas = document.getElementById('diorama-3d-canvas');
    if (!canvas) return;

    // Resize canvas
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;

    if (!dioramaGl) {
      const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: true }) || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('WebGL is not supported in this browser.');
        return;
      }
      dioramaGl = gl;

      // Compile Shaders
      const vsSource = [
        'attribute vec3 aPosition;',
        'attribute vec3 aNormal;',
        'attribute vec4 aColor;',
        'uniform mat4 uMatrix;',
        'uniform mat4 uNormMatrix;',
        'varying vec3 vNormal;',
        'varying vec4 vColor;',
        'varying vec3 vPosition;',
        'void main() {',
        '  vNormal = normalize((uNormMatrix * vec4(aNormal, 0.0)).xyz);',
        '  vColor = aColor;',
        '  vPosition = aPosition;',
        '  gl_Position = uMatrix * vec4(aPosition, 1.0);',
        '}'
      ].join(String.fromCharCode(10));

      const fsSource = [
        'precision mediump float;',
        'varying vec3 vNormal;',
        'varying vec4 vColor;',
        'varying vec3 vPosition;',
        'uniform int uViewMode;',
        'uniform vec3 uLightDir1;',
        'uniform vec3 uLightColor1;',
        'uniform vec3 uLightDir2;',
        'uniform vec3 uLightColor2;',
        'uniform vec3 uAmbientColor;',
        'void main() {',
        '  if (uViewMode == 1) {', // Clay primer
        '    vec3 n = normalize(vNormal);',
        '    float diff = max(dot(n, normalize(vec3(0.5, 1.0, 0.7))), 0.0);',
        '    vec3 col = vec3(0.58, 0.62, 0.67) * (0.35 + 0.65 * diff);',
        '    gl_FragColor = vec4(col, 1.0);',
        '    return;',
        '  }',
        '  if (uViewMode == 2) {', // Wireframe
        '    gl_FragColor = vec4(0.06, 0.78, 0.95, 1.0);',
        '    return;',
        '  }',
        '  if (uViewMode == 3) {', // Matcap metallic
        '    vec3 n = normalize(vNormal);',
        '    float spec = pow(max(dot(n, normalize(vec3(0.0, 0.8, 0.6))), 0.0), 16.0);',
        '    float rim = 1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0);',
        '    vec3 col = vec3(0.72, 0.78, 0.88) * 0.45 + vec3(spec) * 0.6 + vec3(0.2, 0.6, 1.0) * pow(rim, 2.5);',
        '    gl_FragColor = vec4(col, 1.0);',
        '    return;',
        '  }',
        '  // Mode 0: Shaded Blinn-Phong',
        '  vec3 n = normalize(vNormal);',
        '  float diff1 = max(dot(n, normalize(uLightDir1)), 0.0);',
        '  float diff2 = max(dot(n, normalize(uLightDir2)), 0.0);',
        '  vec3 light = uAmbientColor + uLightColor1 * diff1 + uLightColor2 * diff2;',
        '  gl_FragColor = vec4(vColor.rgb * light, vColor.a);',
        '}'
      ].join(String.fromCharCode(10));

      const vs = compileDioramaShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = compileDioramaShader(gl, gl.FRAGMENT_SHADER, fsSource);
      dioramaProgram = gl.createProgram();
      gl.attachShader(dioramaProgram, vs);
      gl.attachShader(dioramaProgram, fs);
      gl.linkProgram(dioramaProgram);

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);

      setupDioramaCanvasEvents(canvas);
    }

    if (!dioramaAnimFrame) {
      startDioramaRenderLoop();
    }
  }

  function compileDioramaShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function setupDioramaCanvasEvents(canvas) {
    canvas.addEventListener('mousedown', function(e) {
      if (e.button === 2) {
        dioramaIsPanning = true;
      } else {
        dioramaIsDragging = true;
      }
      dioramaMouseX = e.clientX;
      dioramaMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function(e) {
      if (!dioramaIsDragging && !dioramaIsPanning) return;
      const dx = e.clientX - dioramaMouseX;
      const dy = e.clientY - dioramaMouseY;
      dioramaMouseX = e.clientX;
      dioramaMouseY = e.clientY;

      if (dioramaIsDragging) {
        dioramaRotY += dx * 0.6;
        dioramaRotX += dy * 0.6;
        dioramaRotX = Math.max(-85, Math.min(85, dioramaRotX));
      } else if (dioramaIsPanning) {
        dioramaPanX += dx * 0.005;
        dioramaPanY -= dy * 0.005;
      }
    });

    window.addEventListener('mouseup', function() {
      dioramaIsDragging = false;
      dioramaIsPanning = false;
      canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); });

    canvas.addEventListener('wheel', function(e) {
      e.preventDefault();
      dioramaZoom *= (e.deltaY > 0 ? 1.08 : 0.92);
      dioramaZoom = Math.max(0.35, Math.min(3.5, dioramaZoom));
    }, { passive: false });

    // Touch Support for mobile/tablets
    let lastTouchDist = 0;
    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        dioramaIsDragging = true;
        dioramaMouseX = e.touches[0].clientX;
        dioramaMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        dioramaIsDragging = false;
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', function(e) {
      if (e.touches.length === 1 && dioramaIsDragging) {
        const dx = e.touches[0].clientX - dioramaMouseX;
        const dy = e.touches[0].clientY - dioramaMouseY;
        dioramaMouseX = e.touches[0].clientX;
        dioramaMouseY = e.touches[0].clientY;
        dioramaRotY += dx * 0.7;
        dioramaRotX += dy * 0.7;
        dioramaRotX = Math.max(-85, Math.min(85, dioramaRotX));
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (lastTouchDist > 0) {
          const factor = lastTouchDist / dist;
          dioramaZoom *= factor;
          dioramaZoom = Math.max(0.35, Math.min(3.5, dioramaZoom));
        }
        lastTouchDist = dist;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', function() {
      dioramaIsDragging = false;
      lastTouchDist = 0;
    });
  }

  // --- Procedural 3D Geometric Mesh Builders ---
  function buildDioramaGeometry(meta) {
    if (!dioramaGl) return;
    const gl = dioramaGl;

    // 1. Build Model Geometry according to meshType
    const modelV = [];
    const modelN = [];
    const modelC = [];

    const meshType = meta.meshType || 'mecha';
    if (meshType === 'mecha') {
      buildMechaModel(modelV, modelN, modelC);
    } else if (meshType === 'tank') {
      buildTankModel(modelV, modelN, modelC);
    } else if (meshType === 'aircraft') {
      buildAircraftModel(modelV, modelN, modelC);
    } else if (meshType === 'car') {
      buildCarModel(modelV, modelN, modelC);
    } else if (meshType === 'warship') {
      buildWarshipModel(modelV, modelN, modelC);
    } else {
      buildHumanoidModel(modelV, modelN, modelC);
    }

    dioramaModelBuffers = createGLBuffers(gl, modelV, modelN, modelC);

    // 2. Build Diorama Measurement Ground Grid
    const gridV = [];
    const gridN = [];
    const gridC = [];
    buildGridFloor(gridV, gridN, gridC, 4.0, 0.4);
    dioramaGridBuffers = createGLBuffers(gl, gridV, gridN, gridC);

    // 3. Build 1:1 Scale Human Pilot Silhouette
    const humanV = [];
    const humanN = [];
    const humanC = [];
    const humanHeight = (meta.humanFigureScaleMm || 12.5) / 100.0; // scale factor
    buildHumanSilhouette(humanV, humanN, humanC, 0.85, 0.35, Math.max(0.12, Math.min(0.35, humanHeight)));
    dioramaHumanBuffers = createGLBuffers(gl, humanV, humanN, humanC);
  }

  function createGLBuffers(gl, v, n, c) {
    const vBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

    const nBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(n), gl.STATIC_DRAW);

    const cBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(c), gl.STATIC_DRAW);

    return {
      vBuf: vBuf,
      nBuf: nBuf,
      cBuf: cBuf,
      count: v.length / 3
    };
  }

  // --- Geometric Solid Helpers ---
  function addBoxFace(v, n, c, p1, p2, p3, p4, normal, color) {
    v.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]);
    v.push(p1[0], p1[1], p1[2], p3[0], p3[1], p3[2], p4[0], p4[1], p4[2]);
    for (let i = 0; i < 6; i++) {
      n.push(normal[0], normal[1], normal[2]);
      c.push(color[0], color[1], color[2], 1.0);
    }
  }

  function addBox(v, n, c, cx, cy, cz, sx, sy, sz, r, g, b) {
    const x0 = cx - sx / 2, x1 = cx + sx / 2;
    const y0 = cy - sy / 2, y1 = cy + sy / 2;
    const z0 = cz - sz / 2, z1 = cz + sz / 2;
    const col = [r, g, b];

    // Front, Back, Top, Bottom, Right, Left
    addBoxFace(v, n, c, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], col);
    addBoxFace(v, n, c, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], col);
    addBoxFace(v, n, c, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], col);
    addBoxFace(v, n, c, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], col);
    addBoxFace(v, n, c, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], col);
    addBoxFace(v, n, c, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], col);
  }

  function buildMechaModel(v, n, c) {
    // Torso / Chest (Blue)
    addBox(v, n, c, 0, 0.55, 0, 0.42, 0.38, 0.32, 0.12, 0.28, 0.65);
    // Cockpit hatch (Red)
    addBox(v, n, c, 0, 0.48, 0.17, 0.16, 0.18, 0.12, 0.88, 0.15, 0.15);
    // Yellow Vents
    addBox(v, n, c, -0.12, 0.62, 0.17, 0.08, 0.06, 0.04, 0.95, 0.82, 0.1);
    addBox(v, n, c, 0.12, 0.62, 0.17, 0.08, 0.06, 0.04, 0.95, 0.82, 0.1);
    // Collar & Neck (White)
    addBox(v, n, c, 0, 0.77, 0, 0.22, 0.08, 0.2, 0.92, 0.92, 0.95);
    // Head unit (White)
    addBox(v, n, c, 0, 0.88, 0.02, 0.2, 0.18, 0.22, 0.96, 0.96, 0.98);
    // Faceplate / Chin (Red)
    addBox(v, n, c, 0, 0.82, 0.13, 0.06, 0.08, 0.06, 0.88, 0.15, 0.15);
    // Eyes / Sensor (Green)
    addBox(v, n, c, 0, 0.88, 0.13, 0.12, 0.04, 0.04, 0.1, 0.92, 0.4);
    // V-Fin Crest (Yellow)
    addBox(v, n, c, -0.16, 0.98, 0.08, 0.24, 0.04, 0.04, 0.95, 0.82, 0.1);
    addBox(v, n, c, 0.16, 0.98, 0.08, 0.24, 0.04, 0.04, 0.95, 0.82, 0.1);
    addBox(v, n, c, 0, 0.94, 0.12, 0.06, 0.06, 0.04, 0.88, 0.15, 0.15);
    // Backpack (Dark Gray) + Thrusters
    addBox(v, n, c, 0, 0.58, -0.22, 0.32, 0.34, 0.18, 0.2, 0.22, 0.28);
    addBox(v, n, c, -0.1, 0.44, -0.25, 0.09, 0.14, 0.09, 0.7, 0.72, 0.78);
    addBox(v, n, c, 0.1, 0.44, -0.25, 0.09, 0.14, 0.09, 0.7, 0.72, 0.78);
    // Shoulders (White)
    addBox(v, n, c, -0.34, 0.62, 0, 0.24, 0.22, 0.28, 0.92, 0.92, 0.95);
    addBox(v, n, c, 0.34, 0.62, 0, 0.24, 0.22, 0.28, 0.92, 0.92, 0.95);
    // Arms
    addBox(v, n, c, -0.34, 0.42, 0, 0.14, 0.22, 0.14, 0.88, 0.88, 0.9);
    addBox(v, n, c, -0.34, 0.22, 0.04, 0.16, 0.22, 0.16, 0.92, 0.92, 0.95);
    addBox(v, n, c, 0.34, 0.42, 0, 0.14, 0.22, 0.14, 0.88, 0.88, 0.9);
    addBox(v, n, c, 0.34, 0.22, 0.04, 0.16, 0.22, 0.16, 0.92, 0.92, 0.95);
    // Weapon (Beam Rifle in Right Hand)
    addBox(v, n, c, 0.34, 0.18, 0.3, 0.08, 0.1, 0.55, 0.25, 0.27, 0.32);
    addBox(v, n, c, 0.34, 0.24, 0.22, 0.06, 0.1, 0.14, 0.1, 0.85, 0.4);
    // Shield (on Left Arm)
    addBox(v, n, c, -0.48, 0.28, 0.05, 0.06, 0.62, 0.28, 0.88, 0.15, 0.15);
    addBox(v, n, c, -0.5, 0.42, 0.05, 0.04, 0.18, 0.22, 0.95, 0.95, 0.98);
    // Waist & Skirts (White)
    addBox(v, n, c, 0, 0.32, 0, 0.34, 0.14, 0.26, 0.88, 0.15, 0.15);
    addBox(v, n, c, -0.1, 0.22, 0.13, 0.12, 0.16, 0.04, 0.92, 0.92, 0.95);
    addBox(v, n, c, 0.1, 0.22, 0.13, 0.12, 0.16, 0.04, 0.92, 0.92, 0.95);
    // Legs
    addBox(v, n, c, -0.14, 0.06, 0, 0.16, 0.28, 0.18, 0.92, 0.92, 0.95);
    addBox(v, n, c, 0.14, 0.06, 0, 0.16, 0.28, 0.18, 0.92, 0.92, 0.95);
    // Knees
    addBox(v, n, c, -0.14, -0.1, 0.09, 0.14, 0.12, 0.08, 0.88, 0.15, 0.15);
    addBox(v, n, c, 0.14, -0.1, 0.09, 0.14, 0.12, 0.08, 0.88, 0.15, 0.15);
    // Calves
    addBox(v, n, c, -0.14, -0.3, 0, 0.2, 0.34, 0.24, 0.92, 0.92, 0.95);
    addBox(v, n, c, 0.14, -0.3, 0, 0.2, 0.34, 0.24, 0.92, 0.92, 0.95);
    // Feet (Red)
    addBox(v, n, c, -0.14, -0.52, 0.06, 0.22, 0.12, 0.36, 0.88, 0.15, 0.15);
    addBox(v, n, c, 0.14, -0.52, 0.06, 0.22, 0.12, 0.36, 0.88, 0.15, 0.15);
  }

  function buildTankModel(v, n, c) {
    // Chassis Hull (German Panzer Gray / Olive)
    addBox(v, n, c, 0, -0.15, 0, 0.95, 0.32, 1.45, 0.38, 0.42, 0.35);
    // Glacis Plate
    addBox(v, n, c, 0, -0.05, 0.65, 0.9, 0.18, 0.3, 0.35, 0.4, 0.32);
    // Left Track (Dark Metal)
    addBox(v, n, c, -0.58, -0.22, 0, 0.26, 0.34, 1.6, 0.18, 0.2, 0.22);
    // Right Track
    addBox(v, n, c, 0.58, -0.22, 0, 0.26, 0.34, 1.6, 0.18, 0.2, 0.22);
    // Turret Dome
    addBox(v, n, c, 0, 0.18, -0.05, 0.75, 0.35, 0.85, 0.4, 0.45, 0.37);
    // Commander Cupola
    addBox(v, n, c, -0.2, 0.4, -0.15, 0.25, 0.15, 0.25, 0.32, 0.35, 0.3);
    // Main Gun Mantlet & Barrel (88mm KwK 36)
    addBox(v, n, c, 0, 0.18, 0.45, 0.3, 0.22, 0.2, 0.32, 0.35, 0.3);
    addBox(v, n, c, 0, 0.18, 1.25, 0.08, 0.08, 1.45, 0.22, 0.24, 0.25);
    addBox(v, n, c, 0, 0.18, 2.0, 0.14, 0.14, 0.18, 0.15, 0.18, 0.2); // Muzzle brake
  }

  function buildAircraftModel(v, n, c) {
    // Main Fuselage (Spitfire Camouflage / Sky)
    addBox(v, n, c, 0, 0, 0, 0.32, 0.34, 1.95, 0.35, 0.42, 0.38);
    // Glass Cockpit Canopy (Tinted Blue)
    addBox(v, n, c, 0, 0.24, -0.05, 0.22, 0.18, 0.55, 0.3, 0.65, 0.85);
    // Elliptical Wings
    addBox(v, n, c, 0, -0.05, 0.15, 2.7, 0.06, 0.65, 0.38, 0.45, 0.4);
    // Horizontal Tail Stabilizers
    addBox(v, n, c, 0, 0.05, -0.85, 0.95, 0.04, 0.3, 0.38, 0.45, 0.4);
    // Vertical Tail Fin & Rudder
    addBox(v, n, c, 0, 0.32, -0.85, 0.04, 0.48, 0.35, 0.42, 0.48, 0.42);
    // Propeller Nose Cone (Yellow spinner)
    addBox(v, n, c, 0, 0, 1.05, 0.2, 0.2, 0.25, 0.95, 0.8, 0.1);
    // 3 Propeller Blades
    addBox(v, n, c, 0, 0.42, 1.02, 0.06, 0.65, 0.04, 0.15, 0.15, 0.15);
    addBox(v, n, c, -0.36, -0.22, 1.02, 0.55, 0.06, 0.04, 0.15, 0.15, 0.15);
    addBox(v, n, c, 0.36, -0.22, 1.02, 0.55, 0.06, 0.04, 0.15, 0.15, 0.15);
  }

  function buildCarModel(v, n, c) {
    // Lower Chassis (Skyline Metallic Blue/Black)
    addBox(v, n, c, 0, -0.15, 0, 0.85, 0.22, 1.8, 0.12, 0.35, 0.75);
    // Cabin Greenhouse & Windshield (Tinted glass)
    addBox(v, n, c, 0, 0.08, -0.1, 0.68, 0.26, 0.95, 0.2, 0.25, 0.35);
    // Hood & Trunk
    addBox(v, n, c, 0, -0.06, 0.55, 0.82, 0.12, 0.65, 0.12, 0.35, 0.75);
    addBox(v, n, c, 0, -0.06, -0.65, 0.82, 0.12, 0.5, 0.12, 0.35, 0.75);
    // Rear Wing / Spoiler
    addBox(v, n, c, 0, 0.15, -0.85, 0.82, 0.04, 0.18, 0.1, 0.1, 0.1);
    // 4 Wheels
    addBox(v, n, c, -0.46, -0.22, 0.55, 0.16, 0.3, 0.3, 0.15, 0.15, 0.15);
    addBox(v, n, c, 0.46, -0.22, 0.55, 0.16, 0.3, 0.3, 0.15, 0.15, 0.15);
    addBox(v, n, c, -0.46, -0.22, -0.55, 0.16, 0.3, 0.3, 0.15, 0.15, 0.15);
    addBox(v, n, c, 0.46, -0.22, -0.55, 0.16, 0.3, 0.3, 0.15, 0.15, 0.15);
  }

  function buildWarshipModel(v, n, c) {
    // Battleship Yamato Hull (Battleship Gray & Waterline Red)
    addBox(v, n, c, 0, -0.25, 0, 0.55, 0.25, 2.6, 0.6, 0.18, 0.18); // Red bottom
    addBox(v, n, c, 0, 0, 0, 0.62, 0.25, 2.7, 0.52, 0.55, 0.58); // Gray upper hull
    // Main Pagoda Superstructure (Bridge)
    addBox(v, n, c, 0, 0.32, 0, 0.32, 0.4, 0.9, 0.48, 0.5, 0.54);
    addBox(v, n, c, 0, 0.65, 0.05, 0.18, 0.3, 0.35, 0.45, 0.48, 0.5);
    // Triple 46cm Main Gun Turrets (2 Front, 1 Aft)
    addBox(v, n, c, 0, 0.2, 0.75, 0.36, 0.16, 0.4, 0.5, 0.53, 0.55);
    addBox(v, n, c, 0, 0.2, 1.25, 0.06, 0.06, 0.7, 0.3, 0.32, 0.35); // Barrels
    addBox(v, n, c, 0, 0.28, 0.5, 0.36, 0.16, 0.4, 0.5, 0.53, 0.55);
    addBox(v, n, c, 0, 0.28, 1.0, 0.06, 0.06, 0.7, 0.3, 0.32, 0.35);
    addBox(v, n, c, 0, 0.2, -0.75, 0.36, 0.16, 0.4, 0.5, 0.53, 0.55);
    addBox(v, n, c, 0, 0.2, -1.25, 0.06, 0.06, 0.7, 0.3, 0.32, 0.35);
  }

  function buildHumanoidModel(v, n, c) {
    // Megami Device / Anime Figure (Mecha Girl)
    addBox(v, n, c, 0, 0.45, 0, 0.22, 0.35, 0.16, 0.95, 0.88, 0.85); // Bodice
    addBox(v, n, c, 0, 0.75, 0, 0.18, 0.2, 0.18, 0.98, 0.9, 0.86); // Head
    addBox(v, n, c, 0, 0.82, -0.06, 0.24, 0.3, 0.22, 0.95, 0.45, 0.15); // Hair (Orange)
    addBox(v, n, c, -0.22, 0.4, 0, 0.09, 0.45, 0.09, 0.95, 0.88, 0.85); // Arms
    addBox(v, n, c, 0.22, 0.4, 0, 0.09, 0.45, 0.09, 0.95, 0.88, 0.85);
    addBox(v, n, c, -0.1, -0.1, 0, 0.12, 0.75, 0.12, 0.2, 0.2, 0.25); // Mecha Leg armor
    addBox(v, n, c, 0.1, -0.1, 0, 0.12, 0.75, 0.12, 0.2, 0.2, 0.25);
    // Archer Great Bow (Mecha Accessory)
    addBox(v, n, c, 0.35, 0.3, 0.2, 0.06, 1.2, 0.08, 0.85, 0.15, 0.15);
  }

  function buildGridFloor(v, n, c, size, step) {
    const half = size / 2;
    for (let x = -half; x <= half; x += step) {
      addBox(v, n, c, x, -0.6, 0, 0.015, 0.01, size, 0.2, 0.35, 0.45);
    }
    for (let z = -half; z <= half; z += step) {
      addBox(v, n, c, 0, -0.6, z, size, 0.01, 0.015, 0.2, 0.35, 0.45);
    }
    // Outer Base Rim (Cutting Mat dark green)
    addBox(v, n, c, 0, -0.62, 0, size + 0.1, 0.02, size + 0.1, 0.06, 0.18, 0.12);
  }

  function buildHumanSilhouette(v, n, c, cx, cz, height) {
    // 1:1 Scale human pilot silhouette (Technician / Pilot)
    const y0 = -0.6;
    const bodyH = height * 0.45;
    const headH = height * 0.18;
    const legH = height * 0.37;
    const w = height * 0.25;

    // Legs
    addBox(v, n, c, cx, y0 + legH / 2, cz, w * 0.8, legH, w * 0.4, 0.1, 0.85, 0.45);
    // Torso
    addBox(v, n, c, cx, y0 + legH + bodyH / 2, cz, w, bodyH, w * 0.5, 0.1, 0.85, 0.45);
    // Head
    addBox(v, n, c, cx, y0 + legH + bodyH + headH / 2, cz, w * 0.5, headH, w * 0.5, 0.1, 0.85, 0.45);
  }

  // --- Render Loop & Animation Frame ---
  function startDioramaRenderLoop() {
    function frame() {
      if (!dioramaGl || !dioramaProgram) return;

      if (dioramaTurntable) {
        dioramaRotY += 0.5;
      }

      renderDioramaScene();
      dioramaAnimFrame = requestAnimationFrame(frame);
    }
    dioramaAnimFrame = requestAnimationFrame(frame);
  }

  function renderDioramaScene() {
    const gl = dioramaGl;
    const canvas = gl.canvas;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.04, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(dioramaProgram);

    // Compute View Projection Matrix
    const aspect = canvas.width / canvas.height;
    const proj = mat4Perspective(45 * Math.PI / 180, aspect, 0.1, 100.0);

    const view = mat4Identity();
    mat4Translate(view, [dioramaPanX, dioramaPanY, -3.2 * dioramaZoom]);
    mat4RotateX(view, dioramaRotX * Math.PI / 180);
    mat4RotateY(view, dioramaRotY * Math.PI / 180);

    const mvp = mat4Mul(proj, view);
    const normMat = mat4Identity();
    mat4RotateX(normMat, dioramaRotX * Math.PI / 180);
    mat4RotateY(normMat, dioramaRotY * Math.PI / 180);

    const uMatrixLoc = gl.getUniformLocation(dioramaProgram, 'uMatrix');
    const uNormLoc = gl.getUniformLocation(dioramaProgram, 'uNormMatrix');
    const uViewModeLoc = gl.getUniformLocation(dioramaProgram, 'uViewMode');

    gl.uniformMatrix4fv(uMatrixLoc, false, new Float32Array(mvp));
    gl.uniformMatrix4fv(uNormLoc, false, new Float32Array(normMat));
    gl.uniform1i(uViewModeLoc, dioramaViewMode);

    // Setup Lighting Preset Uniforms
    setupLightingUniforms(gl);

    // 1. Draw 3D Model
    if (dioramaModelBuffers) {
      drawBufferObject(gl, dioramaModelBuffers, dioramaViewMode === 2 ? gl.LINES : gl.TRIANGLES);
    }

    // 2. Draw Ground Grid (Always shaded / wire)
    if (dioramaShowGrid && dioramaGridBuffers) {
      gl.uniform1i(uViewModeLoc, 0); // shaded for grid
      drawBufferObject(gl, dioramaGridBuffers, gl.TRIANGLES);
      gl.uniform1i(uViewModeLoc, dioramaViewMode); // restore
    }

    // 3. Draw Human Scale Silhouette (Green marker)
    if (dioramaShowHuman && dioramaHumanBuffers) {
      gl.uniform1i(uViewModeLoc, 0);
      drawBufferObject(gl, dioramaHumanBuffers, gl.TRIANGLES);
      gl.uniform1i(uViewModeLoc, dioramaViewMode);
    }
  }

  function setupLightingUniforms(gl) {
    const l1DirLoc = gl.getUniformLocation(dioramaProgram, 'uLightDir1');
    const l1ColLoc = gl.getUniformLocation(dioramaProgram, 'uLightColor1');
    const l2DirLoc = gl.getUniformLocation(dioramaProgram, 'uLightDir2');
    const l2ColLoc = gl.getUniformLocation(dioramaProgram, 'uLightColor2');
    const ambLoc = gl.getUniformLocation(dioramaProgram, 'uAmbientColor');

    if (dioramaLighting === 'neon-scifi') {
      gl.uniform3f(l1DirLoc, 0.6, 0.8, 0.8);
      gl.uniform3f(l1ColLoc, 0.05, 0.85, 0.95); // Cyan key light
      gl.uniform3f(l2DirLoc, -0.8, -0.3, -0.6);
      gl.uniform3f(l2ColLoc, 0.95, 0.15, 0.65); // Magenta rim light
      gl.uniform3f(ambLoc, 0.15, 0.15, 0.25);
    } else if (dioramaLighting === 'sunset') {
      gl.uniform3f(l1DirLoc, 0.8, 0.4, 0.5);
      gl.uniform3f(l1ColLoc, 1.0, 0.65, 0.25); // Golden amber
      gl.uniform3f(l2DirLoc, -0.6, 0.6, -0.5);
      gl.uniform3f(l2ColLoc, 0.35, 0.4, 0.7); // Twilight blue
      gl.uniform3f(ambLoc, 0.25, 0.2, 0.22);
    } else if (dioramaLighting === 'military-hangar') {
      gl.uniform3f(l1DirLoc, 0.1, 1.0, 0.2); // Cool overhead fluorescent
      gl.uniform3f(l1ColLoc, 0.85, 0.92, 0.98);
      gl.uniform3f(l2DirLoc, -0.5, -0.2, 0.5);
      gl.uniform3f(l2ColLoc, 0.4, 0.45, 0.5);
      gl.uniform3f(ambLoc, 0.28, 0.3, 0.35);
    } else if (dioramaLighting === 'clay-primer') {
      gl.uniform3f(l1DirLoc, 0.4, 0.9, 0.6);
      gl.uniform3f(l1ColLoc, 0.9, 0.9, 0.9);
      gl.uniform3f(l2DirLoc, -0.4, 0.3, -0.6);
      gl.uniform3f(l2ColLoc, 0.4, 0.4, 0.4);
      gl.uniform3f(ambLoc, 0.4, 0.4, 0.4);
    } else {
      // Default: Studio White
      gl.uniform3f(l1DirLoc, 0.5, 0.8, 0.7);
      gl.uniform3f(l1ColLoc, 0.95, 0.95, 0.95);
      gl.uniform3f(l2DirLoc, -0.6, 0.3, -0.4);
      gl.uniform3f(l2ColLoc, 0.4, 0.45, 0.5);
      gl.uniform3f(ambLoc, 0.35, 0.35, 0.38);
    }
  }

  function drawBufferObject(gl, buffers, drawMode) {
    const posLoc = gl.getAttribLocation(dioramaProgram, 'aPosition');
    const normLoc = gl.getAttribLocation(dioramaProgram, 'aNormal');
    const colLoc = gl.getAttribLocation(dioramaProgram, 'aColor');

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuf);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.nBuf);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuf);
    gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colLoc);

    gl.drawArrays(drawMode, 0, buffers.count);
  }

  // --- Matrix 4x4 Mathematics ---
  function mat4Identity() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  function mat4Perspective(fovRad, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fovRad);
    const rangeInv = 1.0 / (near - far);
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  }

  function mat4Mul(a, b) {
    const out = new Array(16);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        out[r * 4 + c] =
          a[r * 4 + 0] * b[0 * 4 + c] +
          a[r * 4 + 1] * b[1 * 4 + c] +
          a[r * 4 + 2] * b[2 * 4 + c] +
          a[r * 4 + 3] * b[3 * 4 + c];
      }
    }
    return out;
  }

  function mat4Translate(m, v) {
    const x = v[0], y = v[1], z = v[2];
    m[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
    m[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
    m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
    m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
  }

  function mat4RotateX(m, rad) {
    const s = Math.sin(rad), c = Math.cos(rad);
    const m1 = m[1], m2 = m[2];
    const m5 = m[5], m6 = m[6];
    const m9 = m[9], m10 = m[10];
    const m13 = m[13], m14 = m[14];

    m[1] = m1 * c + m2 * s;
    m[2] = m1 * -s + m2 * c;
    m[5] = m5 * c + m6 * s;
    m[6] = m5 * -s + m6 * c;
    m[9] = m9 * c + m10 * s;
    m[10] = m9 * -s + m10 * c;
    m[13] = m13 * c + m14 * s;
    m[14] = m13 * -s + m14 * c;
  }

  function mat4RotateY(m, rad) {
    const s = Math.sin(rad), c = Math.cos(rad);
    const m0 = m[0], m2 = m[2];
    const m4 = m[4], m6 = m[6];
    const m8 = m[8], m10 = m[10];
    const m12 = m[12], m14 = m[14];

    m[0] = m0 * c - m2 * s;
    m[2] = m0 * s + m2 * c;
    m[4] = m4 * c - m6 * s;
    m[6] = m4 * s + m6 * c;
    m[8] = m8 * c - m10 * s;
    m[10] = m8 * s + m10 * c;
    m[12] = m12 * c - m14 * s;
    m[14] = m12 * s + m14 * c;
  }

  // --- Studio Controls Handlers ---
  function setDioramaLighting(preset) {
    dioramaLighting = preset;
  }

  function setDioramaViewMode(mode) {
    if (mode === 'clay') dioramaViewMode = 1;
    else if (mode === 'wireframe') dioramaViewMode = 2;
    else if (mode === 'matcap') dioramaViewMode = 3;
    else dioramaViewMode = 0; // shaded
  }

  function setDioramaCameraAngle(angle) {
    if (angle === 'hero') {
      dioramaRotX = 14;
      dioramaRotY = -28;
      dioramaZoom = 1.25;
      dioramaPanX = 0;
      dioramaPanY = -0.15;
    } else if (angle === 'front') {
      dioramaRotX = 0;
      dioramaRotY = 0;
      dioramaZoom = 1.0;
      dioramaPanX = 0;
      dioramaPanY = 0;
    } else if (angle === 'isometric') {
      dioramaRotX = 32;
      dioramaRotY = -45;
      dioramaZoom = 1.1;
      dioramaPanX = 0;
      dioramaPanY = 0;
    } else if (angle === 'top') {
      dioramaRotX = 86;
      dioramaRotY = 0;
      dioramaZoom = 1.3;
      dioramaPanX = 0;
      dioramaPanY = 0;
    }
  }

  function resetDioramaCamera() {
    dioramaRotX = 18;
    dioramaRotY = -35;
    dioramaZoom = 1.0;
    dioramaPanX = 0;
    dioramaPanY = 0;
  }

  function toggleDioramaTurntable() {
    dioramaTurntable = !dioramaTurntable;
    const btn = document.getElementById('diorama-turntable-btn');
    if (btn) {
      btn.textContent = dioramaTurntable ? '⏸️ Pausar 360°' : '🔄 360° Off';
      btn.classList.toggle('active', dioramaTurntable);
    }
  }

  function toggleDioramaGrid(checked) {
    dioramaShowGrid = checked;
  }

  function toggleDioramaHuman(checked) {
    dioramaShowHuman = checked;
  }

  function captureDioramaRender() {
    const canvas = document.getElementById('diorama-3d-canvas');
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const kitName = (dioramaCurrentMetadata && dioramaCurrentMetadata.kitName) ? dioramaCurrentMetadata.kitName.replace(/[^a-zA-Z0-9]/g, '_') : 'diorama';
      a.download = 'diorama_' + kitName + '.png';
      a.click();
      showShareToast('📸 Captura 3D HD descargada');
    } catch (err) {
      console.warn('Canvas export error:', err);
      alert('No se pudo capturar la imagen del render.');
    }
  }

  function triggerARViewer() {
    const kitName = dioramaCurrentMetadata ? dioramaCurrentMetadata.kitName : 'Maqueta';
    const scale = dioramaCurrentMetadata ? dioramaCurrentMetadata.scale : '1/144';
    alert('📱 Realidad Aumentada (AR):\\n\\nPara proyectar ' + kitName + ' a escala ' + scale + ' sobre tu mesa de corte o taller real, abre esta página desde tu smartphone (Safari iOS con QuickLook o Chrome Android con WebXR/SceneViewer).');
  }

  // ---------------------------------------------------------------------------
  // Project Cost Accounting & Consumables Estimator (DT17)
  // ---------------------------------------------------------------------------
  let currentCostsBuildId = null;

  async function openBuildCostsModal(buildIdOrSlug) {
    const modal = document.getElementById('modal-build-costs');
    if (!modal) return;
    modal.classList.add('active');

    let targetId = buildIdOrSlug;
    if (!targetId) {
      const hiddenInput = document.getElementById('expense-build-id');
      targetId = (hiddenInput && hiddenInput.value) || 'build-aperich-hinu';
    }
    currentCostsBuildId = targetId;
    const hiddenInput = document.getElementById('expense-build-id');
    if (hiddenInput) hiddenInput.value = targetId;

    await loadBuildCostsData(targetId);
  }

  function closeBuildCostsModal(e) {
    if (!e || e.target.id === 'modal-build-costs' || (e.target.classList && e.target.classList.contains('filter-pill'))) {
      const modal = document.getElementById('modal-build-costs');
      if (modal) modal.classList.remove('active');
    }
  }

  function handleExpenseCategoryChange() {
    const select = document.getElementById('expense-category-select');
    if (!select) return;
    const cat = select.value;
    const paintGroup = document.getElementById('expense-paint-fraction-group');
    const laborGroup = document.getElementById('expense-labor-hours-group');

    if (paintGroup) {
      paintGroup.style.display = (cat === 'paint' || cat === 'consumable') ? 'block' : 'none';
    }
    if (laborGroup) {
      laborGroup.style.display = (cat === 'labor') ? 'block' : 'none';
    }
  }

  async function loadBuildCostsData(buildId) {
    try {
      const res = await fetch('/api/v1/builds/' + encodeURIComponent(buildId) + '/costs');
      if (!res.ok) {
        throw new Error('No se pudieron obtener los costos');
      }
      const data = await res.json();
      renderBuildCostsUI(data);
    } catch (err) {
      console.error('Error fetching build costs:', err);
    }
  }

  function renderBuildCostsUI(data) {
    const summary = data.summary || {};
    const currency = summary.currency || 'USD';
    const currSym = currency === 'PEN' ? 'S/ ' : (currency === 'EUR' ? '€ ' : '$ ');

    const titleEl = document.getElementById('costs-build-title');
    if (titleEl) {
      titleEl.textContent = data.buildTitle || ('Bitácora ' + (data.buildId || ''));
    }
    const currBadge = document.getElementById('costs-currency-badge');
    if (currBadge) {
      currBadge.textContent = currency;
    }

    const totalEl = document.getElementById('cost-kpi-total');
    if (totalEl) {
      totalEl.textContent = currSym + (Number(summary.totalCost) || 0).toFixed(2);
    }

    const breakdown = summary.breakdownByCategory || {};
    const materialsCost = (Number(breakdown.kit) || 0) + (Number(breakdown.paint) || 0) + (Number(breakdown.consumable) || 0) + (Number(breakdown.aftermarket) || 0) + (Number(breakdown.decal) || 0) + (Number(breakdown.other) || 0);
    const materialsEl = document.getElementById('cost-kpi-materials');
    if (materialsEl) {
      materialsEl.textContent = currSym + materialsCost.toFixed(2);
    }

    const laborEl = document.getElementById('cost-kpi-labor');
    if (laborEl) {
      laborEl.textContent = (Number(summary.totalLaborHours) || 0) + ' hrs';
    }

    const commEl = document.getElementById('cost-kpi-commission');
    if (commEl) {
      commEl.textContent = currSym + (Number(summary.suggestedCommissionPrice) || 0).toFixed(2);
    }

    const pillsContainer = document.getElementById('cost-categories-pills');
    if (pillsContainer) {
      const catConfig = [
        { key: 'kit', icon: '📦', label: 'Kit Base', val: Number(breakdown.kit) || 0, color: '#38bdf8' },
        { key: 'paint', icon: '🎨', label: 'Pinturas', val: Number(breakdown.paint) || 0, color: '#c084fc' },
        { key: 'consumable', icon: '🧪', label: 'Consumibles', val: Number(breakdown.consumable) || 0, color: '#f472b6' },
        { key: 'aftermarket', icon: '⚙️', label: 'Aftermarket', val: Number(breakdown.aftermarket) || 0, color: '#fb923c' },
        { key: 'decal', icon: '🏷️', label: 'Calcas', val: Number(breakdown.decal) || 0, color: '#a3e635' },
        { key: 'labor', icon: '⏱️', label: 'Mano de Obra', val: Number(breakdown.labor) || 0, color: '#4ade80' },
        { key: 'other', icon: '📦', label: 'Otros', val: Number(breakdown.other) || 0, color: '#94a3b8' }
      ];

      pillsContainer.innerHTML = catConfig.map(function(c) {
        return '<div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.35rem 0.65rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">' +
          '<span>' + c.icon + '</span>' +
          '<span style="color: #cbd5e1;">' + c.label + ':</span>' +
          '<strong style="color: ' + c.color + ';">' + currSym + c.val.toFixed(2) + '</strong>' +
        '</div>';
      }).join('');
    }

    const countBadge = document.getElementById('cost-expense-count-badge');
    const tableContainer = document.getElementById('cost-expenses-table-container');
    const expenses = summary.expenses || [];

    if (countBadge) {
      countBadge.textContent = expenses.length + ' items';
    }

    if (tableContainer) {
      if (expenses.length === 0) {
        tableContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.82rem;">No hay gastos registrados todavía en esta bitácora.</div>';
      } else {
        const catIcons = {
          kit: '📦',
          paint: '🎨',
          consumable: '🧪',
          aftermarket: '⚙️',
          decal: '🏷️',
          labor: '⏱️',
          other: '📦'
        };

        const rows = expenses.map(function(exp) {
          const icon = catIcons[exp.category] || '📦';
          const fractionText = exp.paintBottleFraction ? (' <span style="color: #c084fc; font-size: 0.72rem;">(' + exp.paintBottleFraction + ' frasco)</span>') : '';
          const laborText = exp.laborHours ? (' <span style="color: #4ade80; font-size: 0.72rem;">(' + exp.laborHours + ' hrs)</span>') : '';

          return '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">' +
            '<td style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #fff;">' +
              '<span>' + icon + '</span> ' + escapeHtml(exp.name) + fractionText + laborText +
            '</td>' +
            '<td style="padding: 0.5rem 0.75rem; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">' + escapeHtml(exp.category) + '</td>' +
            '<td style="padding: 0.5rem 0.75rem; font-size: 0.82rem; font-weight: 700; color: #facc15; text-align: right;">' +
              currSym + Number(exp.amount).toFixed(2) +
            '</td>' +
            '<td style="padding: 0.5rem 0.75rem; text-align: center;">' +
              '<button type="button" class="filter-pill" style="font-size: 0.7rem; padding: 0.15rem 0.4rem; color: #ef4444; border-color: rgba(239,68,68,0.3);" title="Eliminar gasto" onclick="removeBuildExpense(&quot;' + (exp.buildId || currentCostsBuildId) + '&quot;, &quot;' + exp.id + '&quot;)">🗑️</button>' +
            '</td>' +
          '</tr>';
        }).join('');

        tableContainer.innerHTML = '<table style="width: 100%; border-collapse: collapse; text-align: left;">' +
          '<thead>' +
            '<tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">' +
              '<th style="padding: 0.5rem 0.75rem;">Concepto</th>' +
              '<th style="padding: 0.5rem 0.75rem;">Categoría</th>' +
              '<th style="padding: 0.5rem 0.75rem; text-align: right;">Monto</th>' +
              '<th style="padding: 0.5rem 0.75rem; text-align: center; width: 45px;">Acción</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';
      }
    }
  }

  async function submitBuildExpense(event) {
    if (event) event.preventDefault();
    const buildIdInput = document.getElementById('expense-build-id');
    const categoryInput = document.getElementById('expense-category-select');
    const nameInput = document.getElementById('expense-name-input');
    const amountInput = document.getElementById('expense-amount-input');
    const currencyInput = document.getElementById('expense-currency-select');
    const fractionInput = document.getElementById('expense-paint-fraction-select');
    const laborInput = document.getElementById('expense-labor-hours-input');

    const buildId = buildIdInput ? buildIdInput.value : currentCostsBuildId;
    if (!buildId) {
      alert('Error: No se ha identificado la bitácora de armado.');
      return;
    }

    const payload = {
      category: categoryInput ? categoryInput.value : 'other',
      name: nameInput ? nameInput.value.trim() : '',
      amount: amountInput ? parseFloat(amountInput.value) : 0,
      currency: currencyInput ? currencyInput.value : 'USD',
      paintBottleFraction: (categoryInput && (categoryInput.value === 'paint' || categoryInput.value === 'consumable')) && fractionInput ? parseFloat(fractionInput.value) : undefined,
      laborHours: (categoryInput && categoryInput.value === 'labor') && laborInput && laborInput.value ? parseFloat(laborInput.value) : undefined
    };

    try {
      const res = await fetch('/api/v1/builds/' + encodeURIComponent(buildId) + '/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(function() { return {}; });
        alert(errJson.detail || 'Error al registrar el gasto.');
        return;
      }

      if (nameInput) nameInput.value = '';
      if (amountInput) amountInput.value = '';
      if (laborInput) laborInput.value = '';

      await loadBuildCostsData(buildId);
    } catch (err) {
      console.error('Error submitting expense:', err);
      alert('Error de conexión al guardar el gasto.');
    }
  }

  async function removeBuildExpense(buildId, expenseId) {
    if (!confirm('¿Deseas eliminar este registro de gasto?')) {
      return;
    }

    try {
      const res = await fetch('/api/v1/builds/' + encodeURIComponent(buildId) + '/costs/' + encodeURIComponent(expenseId), {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(function() { return {}; });
        alert(errJson.detail || 'Error al eliminar el gasto.');
        return;
      }

      await loadBuildCostsData(buildId);
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Error de conexión al eliminar el gasto.');
    }
  }

  // ---------------------------------------------------------------------------
  // Custom Decals & Masking Stencils Studio (DT18)
  // ---------------------------------------------------------------------------
  let decalCurrentConfig = null;
  let decalAvailablePresets = [];

  async function openDecalStudioModal(presetId) {
    const modal = document.getElementById('modal-decal-studio');
    if (!modal) return;
    modal.classList.add('active');

    if (decalAvailablePresets.length === 0) {
      try {
        const res = await fetch('/api/v1/decals/presets');
        if (res.ok) {
          const data = await res.json();
          decalAvailablePresets = data.items || [];
          const select = document.getElementById('decal-preset-select');
          if (select) {
            select.innerHTML = decalAvailablePresets.map(function(p) {
              return '<option value="' + p.id + '">' + escapeHtml(p.name) + ' (' + p.scale + ')</option>';
            }).join('');
          }
        }
      } catch (err) {
        console.warn('Error loading decal presets:', err);
      }
    }

    const targetPresetId = presetId || (decalAvailablePresets[0] && decalAvailablePresets[0].id) || 'gunpla-efsf-caution';
    await handleDecalPresetChange(targetPresetId);
  }

  function closeDecalStudioModal(e) {
    if (!e || e.target.id === 'modal-decal-studio' || (e.target.classList && e.target.classList.contains('filter-pill'))) {
      const modal = document.getElementById('modal-decal-studio');
      if (modal) modal.classList.remove('active');
    }
  }

  async function handleDecalPresetChange(presetId) {
    let preset = decalAvailablePresets.find(function(p) { return p.id === presetId; });
    if (!preset) {
      try {
        const res = await fetch('/api/v1/decals/presets/' + encodeURIComponent(presetId));
        if (res.ok) {
          preset = await res.json();
        }
      } catch (err) {
        console.warn('Could not fetch preset details:', err);
      }
    }

    if (preset) {
      decalCurrentConfig = {
        title: preset.name,
        scale: preset.scale,
        paperSize: preset.paperSize,
        paperType: preset.paperType,
        marginMm: 5,
        includeCutLines: true,
        includeRegistrationMarks: true,
        elements: JSON.parse(JSON.stringify(preset.elements || []))
      };

      const scaleSelect = document.getElementById('decal-scale-select');
      if (scaleSelect) scaleSelect.value = preset.scale;
      const sizeSelect = document.getElementById('decal-size-select');
      if (sizeSelect) sizeSelect.value = preset.paperSize;
      const paperSelect = document.getElementById('decal-paper-select');
      if (paperSelect) paperSelect.value = preset.paperType;
      const presetSelect = document.getElementById('decal-preset-select');
      if (presetSelect) presetSelect.value = preset.id;
    }

    await renderDecalStudioUI();
  }

  async function handleDecalConfigChange() {
    if (!decalCurrentConfig) return;
    const scaleSelect = document.getElementById('decal-scale-select');
    const sizeSelect = document.getElementById('decal-size-select');
    const paperSelect = document.getElementById('decal-paper-select');

    if (scaleSelect) decalCurrentConfig.scale = scaleSelect.value;
    if (sizeSelect) decalCurrentConfig.paperSize = sizeSelect.value;
    if (paperSelect) decalCurrentConfig.paperType = paperSelect.value;

    await renderDecalStudioUI();
  }

  async function renderDecalStudioUI() {
    if (!decalCurrentConfig) return;

    try {
      const res = await fetch('/api/v1/decals/render-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: decalCurrentConfig,
          previewMode: true
        })
      });

      if (!res.ok) throw new Error('Error al renderizar calcas');
      const data = await res.json();

      const viewport = document.getElementById('decal-sheet-svg-viewport');
      if (viewport) {
        viewport.innerHTML = data.svg;
        const svgEl = viewport.querySelector('svg');
        if (svgEl) {
          svgEl.style.maxWidth = '100%';
          svgEl.style.height = 'auto';
          svgEl.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';
        }
      }

      // Render Elements Editor Drawer
      const elementsList = document.getElementById('decal-elements-editor-list');
      const countBadge = document.getElementById('decal-elements-count-badge');
      const elements = decalCurrentConfig.elements || [];

      if (countBadge) countBadge.textContent = elements.length + ' items';

      if (elementsList) {
        if (elements.length === 0) {
          elementsList.innerHTML = '<div style="color: #64748b; font-size: 0.78rem; padding: 1rem; text-align: center;">Pliego vacío. Añade advertencias o rótulos con los botones superiores.</div>';
        } else {
          elementsList.innerHTML = elements.map(function(el, idx) {
            return '<div style="background: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 6px; padding: 0.45rem 0.6rem; font-size: 0.75rem;">' +
              '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">' +
                '<strong style="color: #38bdf8;">#' + (idx + 1) + ' ' + escapeHtml(el.type) + '</strong>' +
                '<button type="button" class="filter-pill" style="font-size: 0.65rem; padding: 0.1rem 0.35rem; color: #ef4444; border-color: rgba(239,68,68,0.3);" onclick="deleteDecalElementFromStudio(&quot;' + el.id + '&quot;)">🗑️</button>' +
              '</div>' +
              '<input type="text" value="' + escapeHtml(el.label) + '" onchange="updateDecalElementProperty(&quot;' + el.id + '&quot;, &quot;label&quot;, this.value)" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; font-size: 0.72rem; padding: 0.2rem 0.4rem; border-radius: 4px; margin-bottom: 0.25rem;">' +
              '<div style="display: flex; gap: 0.3rem; align-items: center;">' +
                '<select onchange="updateDecalElementProperty(&quot;' + el.id + '&quot;, &quot;color&quot;, this.value)" style="background: #0f172a; border: 1px solid #334155; color: #fff; font-size: 0.7rem; padding: 0.2rem; border-radius: 4px; flex: 1;">' +
                  '<option value="white"' + (el.color === 'white' ? ' selected' : '') + '>Blanco</option>' +
                  '<option value="red"' + (el.color === 'red' ? ' selected' : '') + '>Rojo</option>' +
                  '<option value="yellow"' + (el.color === 'yellow' ? ' selected' : '') + '>Amarillo</option>' +
                  '<option value="black"' + (el.color === 'black' ? ' selected' : '') + '>Negro</option>' +
                  '<option value="gold_metallic"' + (el.color === 'gold_metallic' ? ' selected' : '') + '>Dorado</option>' +
                  '<option value="silver_metallic"' + (el.color === 'silver_metallic' ? ' selected' : '') + '>Plata</option>' +
                '</select>' +
                '<span style="font-size: 0.68rem; color: #94a3b8;">X:' + el.xMm + 'mm Y:' + el.yMm + 'mm</span>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      }
    } catch (err) {
      console.error('Error rendering decal SVG:', err);
    }
  }

  function addDecalElementToStudio(type) {
    if (!decalCurrentConfig) return;
    const elements = decalCurrentConfig.elements || [];
    const count = elements.length + 1;
    const newY = 15 + ((count * 9) % 160);
    const newX = 12 + (Math.floor(count / 18) * 35);

    let newEl = {
      id: 'el-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
      type: type,
      label: 'CAUTION ' + count,
      color: 'white',
      xMm: newX,
      yMm: newY,
      widthMm: 24,
      heightMm: 7,
      fontSizeMm: 1.8
    };

    if (type === 'unit_number') {
      newEl.label = count < 10 ? '0' + count : '' + count;
      newEl.fontSizeMm = 6.5;
      newEl.widthMm = 14;
      newEl.heightMm = 10;
    } else if (type === 'faction_emblem') {
      newEl.label = 'Insignia Escuadrón';
      newEl.codeText = 'US-STAR';
      newEl.widthMm = 14;
      newEl.heightMm = 14;
    } else if (type === 'pilot_name') {
      newEl.label = 'PILOT NAME';
      newEl.subtext = 'SQUADRON CODE';
      newEl.fontSizeMm = 2.0;
      newEl.widthMm = 28;
      newEl.heightMm = 7;
    } else if (type === 'kill_marks') {
      newEl.label = 'Kill Marks';
      newEl.count = 5;
      newEl.color = 'yellow';
      newEl.widthMm = 20;
      newEl.heightMm = 6;
    }

    elements.push(newEl);
    decalCurrentConfig.elements = elements;
    renderDecalStudioUI();
  }

  function deleteDecalElementFromStudio(elId) {
    if (!decalCurrentConfig) return;
    decalCurrentConfig.elements = (decalCurrentConfig.elements || []).filter(function(e) {
      return e.id !== elId;
    });
    renderDecalStudioUI();
  }

  function updateDecalElementProperty(elId, prop, value) {
    if (!decalCurrentConfig) return;
    const el = (decalCurrentConfig.elements || []).find(function(e) { return e.id === elId; });
    if (el) {
      el[prop] = value;
      renderDecalStudioUI();
    }
  }

  async function downloadDecalSvgFile() {
    if (!decalCurrentConfig) return;
    try {
      const res = await fetch('/api/v1/decals/render-svg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/svg+xml'
        },
        body: JSON.stringify({
          config: decalCurrentConfig,
          previewMode: false
        })
      });

      if (!res.ok) throw new Error('Error al descargar SVG');
      const svgText = await res.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decal-sheet-' + (decalCurrentConfig.scale || '1-144').replace('/', '-') + '.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading SVG:', err);
      alert('No se pudo descargar el archivo SVG.');
    }
  }

  async function printDecalSheetDirect() {
    if (!decalCurrentConfig) return;
    try {
      const res = await fetch('/api/v1/decals/render-svg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/svg+xml'
        },
        body: JSON.stringify({
          config: decalCurrentConfig,
          previewMode: false
        })
      });

      if (!res.ok) throw new Error('Error al preparar impresión');
      const svgText = await res.text();
      const printWin = window.open('', '_blank');
      if (!printWin) {
        alert('Por favor habilita las ventanas emergentes (popups) para imprimir.');
        return;
      }

      printWin.document.write('<!DOCTYPE html><html><head><title>Impresión de Calcas 100%</title><style>@page { size: auto; margin: 0; } body { margin: 0; padding: 0; display: flex; justify-content: center; } svg { width: 100%; height: auto; }</style></head><body>' + svgText + '</body></html>');
      printWin.document.close();
      printWin.focus();
      setTimeout(function() {
        printWin.print();
      }, 500);
    } catch (err) {
      console.error('Error printing decals:', err);
      alert('Error al enviar calcas a la impresora.');
    }
  }

  // ---------------------------------------------------------------------------
  // AI Workbench Smart Builder Assistant (DT19)
  // ---------------------------------------------------------------------------
  let aiCurrentRunnerImageBase64 = null;
  let aiCurrentNubImageBase64 = null;

  function openAiAssistantModal(tab) {
    const modal = document.getElementById('modal-ai-builder-assistant');
    if (!modal) return;
    modal.classList.add('active');
    modal.style.display = 'flex';
    if (tab) {
      switchAiAssistantTab(tab);
    }
  }

  function closeAiAssistantModal() {
    const modal = document.getElementById('modal-ai-builder-assistant');
    if (!modal) return;
    modal.classList.remove('active');
    modal.style.display = 'none';
  }

  function switchAiAssistantTab(tabName) {
    const runnerContent = document.getElementById('ai-tab-runner-content');
    const nubContent = document.getElementById('ai-tab-nub-content');
    const runnerTabBtn = document.getElementById('tab-btn-ai-runner');
    const nubTabBtn = document.getElementById('tab-btn-ai-nub');

    if (tabName === 'nub') {
      if (runnerContent) runnerContent.style.display = 'none';
      if (nubContent) nubContent.style.display = 'block';
      if (runnerTabBtn) runnerTabBtn.classList.remove('active');
      if (nubTabBtn) nubTabBtn.classList.add('active');
    } else {
      if (runnerContent) runnerContent.style.display = 'block';
      if (nubContent) nubContent.style.display = 'none';
      if (runnerTabBtn) runnerTabBtn.classList.add('active');
      if (nubTabBtn) nubTabBtn.classList.remove('active');
    }
  }

  function handleAiRunnerImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      aiCurrentRunnerImageBase64 = evt.target.result;
      const previewImg = document.getElementById('ai-runner-preview-img');
      const uploadPrompt = document.getElementById('ai-runner-upload-prompt');
      if (previewImg) {
        previewImg.src = aiCurrentRunnerImageBase64;
        previewImg.style.display = 'block';
      }
      if (uploadPrompt) {
        uploadPrompt.style.display = 'none';
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAiNubImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      aiCurrentNubImageBase64 = evt.target.result;
      const previewImg = document.getElementById('ai-nub-preview-img');
      const uploadPrompt = document.getElementById('ai-nub-upload-prompt');
      if (previewImg) {
        previewImg.src = aiCurrentNubImageBase64;
        previewImg.style.display = 'block';
      }
      if (uploadPrompt) {
        uploadPrompt.style.display = 'none';
      }
    };
    reader.readAsDataURL(file);
  }

  async function submitRunnerInspection() {
    const btn = document.getElementById('btn-run-ai-runner-analysis');
    const letterInput = document.getElementById('ai-runner-letter-input');
    const kitInput = document.getElementById('ai-runner-kit-input');

    const runnerLetter = letterInput ? letterInput.value.trim() : 'A';
    const kitName = kitInput ? kitInput.value.trim() : '';

    const sampleImage = aiCurrentRunnerImageBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Analizando con Gemini Vision...';
    }

    try {
      const res = await fetch('/api/v1/workbench/ai/inspect-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: sampleImage,
          runnerLetter,
          kitName
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || errData.title || 'Error al analizar la grapa');
      }

      const data = await res.json();
      renderAiRunnerResults(data);
    } catch (err) {
      console.error('Runner analysis error:', err);
      alert('Error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '⚡ Analizar Grapa con Visión IA';
      }
    }
  }

  function renderAiRunnerResults(data) {
    const resultsBox = document.getElementById('ai-runner-results');
    if (!resultsBox) return;
    resultsBox.style.display = 'block';

    const badgeLetter = document.getElementById('ai-runner-badge-letter');
    if (badgeLetter) badgeLetter.textContent = data.runnerLetter || 'A';

    const engineTag = document.getElementById('ai-runner-engine-tag');
    if (engineTag) engineTag.textContent = data.aiEngine || 'Vision AI';

    const totalEl = document.getElementById('ai-runner-kpi-total');
    if (totalEl) totalEl.textContent = data.totalPartsDetected || 0;

    const remainingEl = document.getElementById('ai-runner-kpi-remaining');
    if (remainingEl) remainingEl.textContent = data.remainingPartsCount || 0;

    const removedEl = document.getElementById('ai-runner-kpi-removed');
    if (removedEl) removedEl.textContent = data.removedPartsCount || 0;

    const completionEl = document.getElementById('ai-runner-kpi-completion');
    if (completionEl) completionEl.textContent = (data.completionPercentage || 0) + '%';

    const partsContainer = document.getElementById('ai-runner-parts-container');
    if (partsContainer) {
      partsContainer.innerHTML = (data.parts || []).map(function(p) {
        const isRemoved = p.status === 'removed';
        const bg = isRemoved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.15)';
        const color = isRemoved ? '#34d399' : '#facc15';
        const border = isRemoved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(234, 179, 8, 0.35)';
        return '<span style="background: ' + bg + '; color: ' + color + '; border: ' + border + '; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px;" title="' + (p.notes || '') + '">' + p.partNumber + ' ' + (isRemoved ? '✓' : '•') + '</span>';
      }).join('');
    }

    const recBox = document.getElementById('ai-runner-recommendations-box');
    if (recBox) {
      recBox.innerHTML = '<strong>💡 Recomendaciones del Taller:</strong><ul style="margin: 0.3rem 0 0 1.2rem; padding: 0;">' + (data.recommendations || []).map(function(r) { return '<li>' + r + '</li>'; }).join('') + '</ul>';
    }
  }

  async function submitNubInspection() {
    const btn = document.getElementById('btn-run-ai-nub-analysis');
    const partInput = document.getElementById('ai-nub-part-input');
    const plasticSelect = document.getElementById('ai-nub-plastic-select');

    const partName = partInput ? partInput.value.trim() : '';
    const plasticType = plasticSelect ? plasticSelect.value : 'PS';

    const sampleImage = aiCurrentNubImageBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Evaluando Calidad...';
    }

    try {
      const res = await fetch('/api/v1/workbench/ai/inspect-nub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: sampleImage,
          partName,
          plasticType
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || errData.title || 'Error al inspeccionar corte');
      }

      const data = await res.json();
      renderAiNubResults(data);
    } catch (err) {
      console.error('Nub inspection error:', err);
      alert('Error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🔬 Evaluar Calidad de Corte';
      }
    }
  }

  function renderAiNubResults(data) {
    const resultsBox = document.getElementById('ai-nub-results');
    if (!resultsBox) return;
    resultsBox.style.display = 'block';

    const scoreDial = document.getElementById('ai-nub-score-dial');
    if (scoreDial) {
      const s = data.qualityScore || 0;
      scoreDial.textContent = s;
      if (s >= 90) {
        scoreDial.style.background = '#10b981';
        scoreDial.style.color = '#0f172a';
      } else if (s >= 70) {
        scoreDial.style.background = '#eab308';
        scoreDial.style.color = '#0f172a';
      } else {
        scoreDial.style.background = '#ef4444';
        scoreDial.style.color = '#ffffff';
      }
    }

    const headline = document.getElementById('ai-nub-headline');
    if (headline) headline.textContent = data.headline || 'Diagnóstico de Calidad';

    const engineTag = document.getElementById('ai-nub-engine-tag');
    if (engineTag) engineTag.textContent = data.aiEngine || 'Vision AI';

    const badgesContainer = document.getElementById('ai-nub-diagnosis-badges');
    if (badgesContainer) {
      const diagLabels = {
        clean_cut: 'Corte Limpio (Flush)',
        protruding_nub: 'Saliente de Compuerta',
        stress_mark: 'Marca de Estrés',
        gouge: 'Mordedura en Pieza',
        under_sanded: 'Falta de Pulido'
      };
      const label = diagLabels[data.diagnosis] || data.diagnosis;
      badgesContainer.innerHTML = '<span style="font-size: 0.72rem; background: rgba(255,255,255,0.1); padding: 0.15rem 0.4rem; border-radius: 4px; color: #f8fafc;">' + label + '</span>' +
        '<span style="font-size: 0.72rem; background: rgba(239, 68, 68, 0.2); padding: 0.15rem 0.4rem; border-radius: 4px; color: #fca5a5;">Severidad: ' + (data.severity || 'normal') + '</span>';
    }

    const analysisText = document.getElementById('ai-nub-analysis-text');
    if (analysisText) analysisText.textContent = data.detailedAnalysis || '';

    const gritSequenceContainer = document.getElementById('ai-nub-grit-sequence');
    if (gritSequenceContainer) {
      gritSequenceContainer.innerHTML = (data.sandingGritSequence || []).map(function(g, idx, arr) {
        const isLast = idx === arr.length - 1;
        return '<span style="background: rgba(234, 179, 8, 0.2); color: #facc15; font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px;">#' + g + '</span>' + (!isLast ? '<span style="color: #94a3b8; font-size: 0.8rem;">→</span>' : '');
      }).join(' ');
    }

    const stepsContainer = document.getElementById('ai-nub-steps-container');
    if (stepsContainer) {
      stepsContainer.innerHTML = (data.correctionSteps || []).map(function(step) {
        return '<div style="background: rgba(30, 41, 59, 0.5); border-left: 3px solid #38bdf8; padding: 0.45rem 0.7rem; border-radius: 4px;">' +
          '<div style="font-size: 0.78rem; font-weight: 700; color: #38bdf8;">Paso ' + step.stepOrder + ': ' + step.tool + '</div>' +
          '<div style="font-size: 0.76rem; color: #cbd5e1; margin-top: 0.15rem;">' + step.instruction + '</div>' +
        '</div>';
      }).join('');
    }
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

  // --- DT20: Stash Insurance & Valuation Appraisal Report ---
  let currentInsuranceSummary = null;

  function openInsuranceReportModal() {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const m = document.getElementById('modal-stash-insurance-report');
    if (!m) return;
    m.classList.add('active');
    loadInsuranceValuationData();
  }

  function closeInsuranceReportModal(e) {
    if (!e || e.target.id === 'modal-stash-insurance-report' || e.target.classList.contains('auth-close') || !e.target) {
      const m = document.getElementById('modal-stash-insurance-report');
      if (m) m.classList.remove('active');
    }
  }

  async function loadInsuranceValuationData() {
    const curSelect = document.getElementById('ins-currency-select');
    const currency = curSelect ? curSelect.value : 'USD';
    const tbody = document.getElementById('ins-table-body');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: #64748b;">Calculando tasacion pericial...</td></tr>';
    }

    try {
      const res = await fetch('/api/v1/workbench/stash/export/insurance-summary?currency=' + encodeURIComponent(currency), {
        headers: {
          'Authorization': 'Bearer ' + currentToken
        }
      });
      if (!res.ok) throw new Error('Error al calcular valoracion de seguro');
      const data = await res.json();
      currentInsuranceSummary = data;

      // Update KPI banners
      const statTotal = document.getElementById('ins-stat-total-kits');
      const statBreakdown = document.getElementById('ins-stat-counts-breakdown');
      const statAcquisition = document.getElementById('ins-stat-acquisition-cost');
      const statReplacement = document.getElementById('ins-stat-replacement-val');
      const statDelta = document.getElementById('ins-stat-delta-ratio');

      const symbol = currency === 'EUR' ? 'EUR ' : currency === 'JPY' ? 'JPY ' : '$';

      if (statTotal) statTotal.textContent = data.valuationPortfolioTotalKits;
      if (statBreakdown) {
        statBreakdown.textContent = data.builtVitrinesCount + ' vitrina · ' + data.unbuiltStashCount + ' en caja · ' + data.inProgressCount + ' WIP';
      }
      if (statAcquisition) {
        statAcquisition.textContent = symbol + data.totalAcquisitionDeclared.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      if (statReplacement) {
        statReplacement.textContent = symbol + data.totalReplacementEstimated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      if (statDelta) {
        const deltaPct = data.totalAcquisitionDeclared > 0
          ? (((data.totalReplacementEstimated - data.totalAcquisitionDeclared) / data.totalAcquisitionDeclared) * 100).toFixed(1)
          : '0.0';
        statDelta.textContent = '+' + deltaPct + '% plusvalia / mano de obra';
      }

      filterInsurancePreview();
    } catch (err) {
      console.error('Error loading insurance summary:', err);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: #ef4444;">No se pudo cargar la valoracion. Intenta de nuevo.</td></tr>';
      }
    }
  }

  function filterInsurancePreview() {
    if (!currentInsuranceSummary || !currentInsuranceSummary.items) return;

    const chkBuiltEl = document.getElementById('ins-chk-built');
    const chkUnbuiltEl = document.getElementById('ins-chk-unbuilt');
    const chkWipEl = document.getElementById('ins-chk-wip');
    const chkWishlistEl = document.getElementById('ins-chk-wishlist');

    const chkBuilt = chkBuiltEl ? chkBuiltEl.checked : true;
    const chkUnbuilt = chkUnbuiltEl ? chkUnbuiltEl.checked : true;
    const chkWip = chkWipEl ? chkWipEl.checked : true;
    const chkWishlist = chkWishlistEl ? chkWishlistEl.checked : false;

    const filtered = currentInsuranceSummary.items.filter(item => {
      if (item.status === 'built' && !chkBuilt) return false;
      if (item.status === 'unbuilt' && !chkUnbuilt) return false;
      if (item.status === 'in_progress' && !chkWip) return false;
      if (item.status === 'wishlist' && !chkWishlist) return false;
      return true;
    });

    const countLabel = document.getElementById('ins-preview-count-label');
    if (countLabel) countLabel.textContent = filtered.length + ' de ' + currentInsuranceSummary.items.length + ' maquetas';

    const tbody = document.getElementById('ins-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: #64748b;">No hay maquetas para los filtros seleccionados.</td></tr>';
      return;
    }

    const cur = currentInsuranceSummary.currency || 'USD';
    const sym = cur === 'EUR' ? 'EUR ' : cur === 'JPY' ? 'JPY ' : '$';

    tbody.innerHTML = filtered.map(it => {
      let statusColor = '#94a3b8';
      let statusBg = 'rgba(148, 163, 184, 0.15)';
      let statusLabel = it.status;
      if (it.status === 'built') {
        statusColor = '#4ade80';
        statusBg = 'rgba(74, 222, 128, 0.15)';
        statusLabel = 'Vitrina (1.5x)';
      } else if (it.status === 'unbuilt') {
        statusColor = '#38bdf8';
        statusBg = 'rgba(56, 189, 248, 0.15)';
        statusLabel = 'En Caja (1.15x)';
      } else if (it.status === 'in_progress') {
        statusColor = '#facc15';
        statusBg = 'rgba(250, 204, 21, 0.15)';
        statusLabel = 'En Proceso';
      } else if (it.status === 'wishlist') {
        statusColor = '#c084fc';
        statusBg = 'rgba(192, 132, 252, 0.15)';
        statusLabel = 'Wishlist';
      }

      return '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">' +
        '<td style="padding: 0.5rem 0.75rem;">' +
          '<div style="font-weight: 600; color: #f1f5f9;">' + (it.kitName || '') + '</div>' +
          '<div style="font-size: 0.7rem; color: #64748b;">' + (it.brand || '') + ' · ' + (it.category || '') + '</div>' +
        '</td>' +
        '<td style="padding: 0.5rem 0.75rem;">' +
          '<span style="background: ' + statusBg + '; color: ' + statusColor + '; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">' +
            statusLabel +
          '</span>' +
        '</td>' +
        '<td style="padding: 0.5rem 0.75rem; color: #94a3b8;">' + (it.scale || '') + '</td>' +
        '<td style="padding: 0.5rem 0.75rem; text-align: right; color: #cbd5e1; font-family: monospace;">' +
          sym + it.declaredPricePaid.toFixed(2) +
        '</td>' +
        '<td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 700; color: #eab308; font-family: monospace;">' +
          sym + it.estimatedReplacementValue.toFixed(2) +
        '</td>' +
      '</tr>';
    }).join('');
  }

  async function downloadInsuranceCsv() {
    if (!currentUser) return;
    const curSelect = document.getElementById('ins-currency-select');
    const currency = curSelect ? curSelect.value : 'USD';
    try {
      const res = await fetch('/api/v1/workbench/stash/export/insurance-report?format=csv&currency=' + encodeURIComponent(currency), {
        headers: {
          'Authorization': 'Bearer ' + currentToken
        }
      });
      if (!res.ok) throw new Error('Error al descargar CSV de tasacion');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventario-tasacion-seguro-' + currency + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      alert('Error al descargar el archivo CSV');
    }
  }

  async function openPrintableInsuranceReport() {
    if (!currentUser) return;
    const curSelect = document.getElementById('ins-currency-select');
    const currency = curSelect ? curSelect.value : 'USD';
    const policyInput = document.getElementById('ins-policy-input');
    const policyNumber = policyInput ? policyInput.value.trim() : '';

    const chkBuiltEl = document.getElementById('ins-chk-built');
    const chkUnbuiltEl = document.getElementById('ins-chk-unbuilt');
    const chkWipEl = document.getElementById('ins-chk-wip');
    const chkWishlistEl = document.getElementById('ins-chk-wishlist');

    const chkBuilt = chkBuiltEl ? chkBuiltEl.checked : true;
    const chkUnbuilt = chkUnbuiltEl ? chkUnbuiltEl.checked : true;
    const chkWip = chkWipEl ? chkWipEl.checked : true;
    const chkWishlist = chkWishlistEl ? chkWishlistEl.checked : false;

    const query = new URLSearchParams({
      format: 'html',
      currency: currency,
      policyNumber: policyNumber,
      includeBuilt: String(chkBuilt),
      includeUnbuilt: String(chkUnbuilt),
      includeInProgress: String(chkWip),
      includeWishlist: String(chkWishlist)
    });

    try {
      const res = await fetch('/api/v1/workbench/stash/export/insurance-report?' + query.toString(), {
        headers: {
          'Authorization': 'Bearer ' + currentToken
        }
      });
      if (!res.ok) throw new Error('Error al generar ficha de tasacion');
      const htmlText = await res.text();

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlText);
        printWindow.document.close();
      } else {
        alert('Por favor permite ventanas emergentes para ver e imprimir la ficha oficial');
      }
    } catch (err) {
      console.error('Error printing appraisal report:', err);
      alert('Error al generar la ficha pericial para impresion');
    }
  }

  // --- DT21: Workshop Soundscapes & Procedural Audio Generator ---
  let soundscapeAudioCtx = null;
  let currentSoundscapePresetId = 'lluvia-taller';
  let isSoundscapePlaying = false;
  let soundscapeMasterVolume = 0.70;
  let soundscapeTimerMode = 'pomodoro-25';
  let soundscapeSecondsRemaining = 25 * 60;
  let soundscapeTimerInterval = null;
  let soundscapeMasterGain = null;
  let activeSoundscapeNodes = [];
  let soundscapeLayerVolumes = {};

  const SOUNDSCAPE_PRESETS_DATA = [
    {
      id: 'lluvia-taller',
      name: 'Lluvia en el Taller',
      tag: 'Calma & Aislamiento',
      icon: '🌧️',
      color: '#38bdf8',
      layers: [
        { id: 'rain-heavy', name: 'Lluvia de fondo', defaultVolume: 0.65, desc: 'Ruido browniano de baja frecuencia' },
        { id: 'rain-patter', name: 'Gotas en vidrio', defaultVolume: 0.40, desc: 'Chispas de ruido rosa filtrado' },
        { id: 'distant-thunder', name: 'Truenos lejanos', defaultVolume: 0.25, desc: 'Resonador sub-grave a 60Hz' }
      ]
    },
    {
      id: 'compresor-aerografo',
      name: 'Estudio de Aerografia',
      tag: 'Foco de Pintura',
      icon: '💨',
      color: '#a855f7',
      layers: [
        { id: 'compressor-hum', name: 'Motor de compresor', defaultVolume: 0.45, desc: 'Armonicos sutiles a 60Hz y 120Hz' },
        { id: 'airflow-hiss', name: 'Flujo de aire continuo', defaultVolume: 0.50, desc: 'Banda filtrada a 1.2kHz' },
        { id: 'booth-fan', name: 'Extractor de cabina', defaultVolume: 0.35, desc: 'Viento continuo de ventilador' }
      ]
    },
    {
      id: 'hangar-mecha',
      name: 'Hangar Sci-Fi Mecha',
      tag: 'Inmersion Sci-Fi',
      icon: '🤖',
      color: '#10b981',
      layers: [
        { id: 'hangar-drone', name: 'Resonancia de bahia', defaultVolume: 0.60, desc: 'Drone armonico a 55Hz' },
        { id: 'hydraulics', name: 'Presurizacion hidraulica', defaultVolume: 0.35, desc: 'Barrido oscilante paso-banda' },
        { id: 'reactor-pulse', name: 'Pulso de reactor', defaultVolume: 0.20, desc: 'Modulacion de pulso lenta' }
      ]
    },
    {
      id: 'lo-fi-beats',
      name: 'Lo-Fi Chillhop Taller',
      tag: 'Ritmo Relajante',
      icon: '🎧',
      color: '#f59e0b',
      layers: [
        { id: 'vinyl-crackle', name: 'Crujido de vinilo', defaultVolume: 0.35, desc: 'Micro-impulsos analogicos' },
        { id: 'rhodes-chords', name: 'Acordes calidos', defaultVolume: 0.55, desc: 'Triadas menores sintetizadas' },
        { id: 'tape-flutter', name: 'Calor de cinta', defaultVolume: 0.30, desc: 'LFO de tono vibrato sutil' }
      ]
    },
    {
      id: 'jardin-zen',
      name: 'Jardin Zen & Pincel',
      tag: 'Concentracion Pura',
      icon: '🎋',
      color: '#14b8a6',
      layers: [
        { id: 'bamboo-wind', name: 'Brisa en bambu', defaultVolume: 0.50, desc: 'Filtro paso-banda dinamico' },
        { id: 'water-stream', name: 'Arroyo continuo', defaultVolume: 0.45, desc: 'Gorgoteo acuatico' },
        { id: 'singing-bowl', name: 'Cuenco tibetano', defaultVolume: 0.30, desc: 'Onda senoidal pura a 432Hz' }
      ]
    }
  ];

  function openSoundscapesModal() {
    const m = document.getElementById('modal-soundscapes');
    if (!m) return;
    renderSoundscapeLayersMixer();
    m.classList.add('active');
  }

  function closeSoundscapesModal(e) {
    if (!e || e.target.id === 'modal-soundscapes' || e.target.classList.contains('auth-close') || !e.target) {
      const m = document.getElementById('modal-soundscapes');
      if (m) m.classList.remove('active');
    }
  }

  function selectSoundscapePreset(presetId) {
    currentSoundscapePresetId = presetId;

    const cards = document.querySelectorAll('.ws-preset-card');
    cards.forEach(c => {
      c.classList.remove('active');
      c.style.borderColor = 'rgba(255,255,255,0.08)';
    });

    const activePreset = SOUNDSCAPE_PRESETS_DATA.find(p => p.id === presetId);
    if (activePreset) {
      const targetCard = Array.from(cards).find(c => (c.getAttribute('onclick') || '').includes(presetId));
      if (targetCard) {
        targetCard.classList.add('active');
        targetCard.style.borderColor = activePreset.color;
      }
      const tagEl = document.getElementById('ws-mixer-preset-tag');
      if (tagEl) {
        tagEl.textContent = activePreset.name;
        tagEl.style.color = activePreset.color;
      }
      const dockTitle = document.getElementById('ws-dock-title');
      if (dockTitle) dockTitle.textContent = activePreset.name;
    }

    renderSoundscapeLayersMixer();

    if (isSoundscapePlaying) {
      stopProceduralSoundscape();
      startProceduralSoundscape();
    }
  }

  function renderSoundscapeLayersMixer() {
    const preset = SOUNDSCAPE_PRESETS_DATA.find(p => p.id === currentSoundscapePresetId);
    if (!preset) return;

    const container = document.getElementById('ws-layers-mixer-container');
    if (!container) return;

    container.innerHTML = preset.layers.map(layer => {
      const currentVol = soundscapeLayerVolumes[layer.id] !== undefined
        ? soundscapeLayerVolumes[layer.id]
        : layer.defaultVolume;
      const pct = Math.round(currentVol * 100);

      return '<div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">' +
        '<div style="min-width: 170px;">' +
          '<div style="font-size: 0.8rem; font-weight: 600; color: #f1f5f9;">' + layer.name + '</div>' +
          '<div style="font-size: 0.68rem; color: #64748b;">' + layer.desc + '</div>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; max-width: 260px;">' +
          '<input type="range" min="0" max="100" value="' + pct + '" ' +
            'data-layer-id="' + layer.id + '" oninput="setSoundscapeLayerVolume(this.dataset.layerId, this.value)" ' +
            'style="flex: 1; height: 5px; accent-color: ' + preset.color + '; cursor: pointer;" />' +
          '<span id="ws-layer-val-' + layer.id + '" style="font-size: 0.75rem; color: #94a3b8; font-family: monospace; min-width: 32px; text-align: right;">' +
            pct + '%' +
          '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function setSoundscapeLayerVolume(layerId, val) {
    const num = Number(val) / 100;
    soundscapeLayerVolumes[layerId] = num;
    const label = document.getElementById('ws-layer-val-' + layerId);
    if (label) label.textContent = Math.round(num * 100) + '%';

    const nodeObj = activeSoundscapeNodes.find(n => n.id === layerId);
    if (nodeObj && nodeObj.gainNode && soundscapeAudioCtx) {
      nodeObj.gainNode.gain.setTargetAtTime(num, soundscapeAudioCtx.currentTime, 0.05);
    }
  }

  function setSoundscapeMasterVolume(val) {
    soundscapeMasterVolume = Number(val) / 100;

    const valEl = document.getElementById('ws-modal-volume-val');
    if (valEl) valEl.textContent = Math.round(soundscapeMasterVolume * 100) + '%';

    const dockSlider = document.getElementById('ws-dock-volume');
    if (dockSlider) dockSlider.value = val;

    const modalSlider = document.getElementById('ws-modal-master-volume');
    if (modalSlider) modalSlider.value = val;

    if (soundscapeMasterGain && soundscapeAudioCtx) {
      soundscapeMasterGain.gain.setTargetAtTime(soundscapeMasterVolume, soundscapeAudioCtx.currentTime, 0.05);
    }
  }

  function setSoundscapeTimerMode(mode) {
    soundscapeTimerMode = mode;
    const modes = ['none', 'pomodoro-25', 'deep-work-45', 'session-60'];
    modes.forEach(m => {
      const btn = document.getElementById('ws-timer-mode-' + m);
      if (btn) {
        if (m === mode) {
          btn.classList.add('active');
          btn.style.background = '#0d9488';
          btn.style.color = '#fff';
        } else {
          btn.classList.remove('active');
          btn.style.background = 'transparent';
          btn.style.color = '#cbd5e1';
        }
      }
    });

    resetSoundscapeTimer();
  }

  function resetSoundscapeTimer() {
    if (soundscapeTimerMode === 'pomodoro-25') soundscapeSecondsRemaining = 25 * 60;
    else if (soundscapeTimerMode === 'deep-work-45') soundscapeSecondsRemaining = 45 * 60;
    else if (soundscapeTimerMode === 'session-60') soundscapeSecondsRemaining = 60 * 60;
    else soundscapeSecondsRemaining = 0;

    updateSoundscapeTimerDisplay();
  }

  function updateSoundscapeTimerDisplay() {
    let str = '--:--';
    if (soundscapeTimerMode !== 'none') {
      const mins = Math.floor(soundscapeSecondsRemaining / 60);
      const secs = soundscapeSecondsRemaining % 60;
      str = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    const digits = document.getElementById('ws-modal-timer-digits');
    if (digits) digits.textContent = str;

    const dockTimer = document.getElementById('ws-dock-timer');
    if (dockTimer) dockTimer.textContent = str;
  }

  function toggleSoundscapePlay() {
    if (isSoundscapePlaying) {
      stopProceduralSoundscape();
    } else {
      startProceduralSoundscape();
    }
  }

  function startProceduralSoundscape() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        alert('Web Audio API no soportado en este navegador');
        return;
      }
      if (!soundscapeAudioCtx) {
        soundscapeAudioCtx = new AudioContextClass();
      }
      if (soundscapeAudioCtx.state === 'suspended') {
        soundscapeAudioCtx.resume();
      }

      soundscapeMasterGain = soundscapeAudioCtx.createGain();
      soundscapeMasterGain.gain.setValueAtTime(soundscapeMasterVolume, soundscapeAudioCtx.currentTime);
      soundscapeMasterGain.connect(soundscapeAudioCtx.destination);

      activeSoundscapeNodes = [];
      const preset = SOUNDSCAPE_PRESETS_DATA.find(p => p.id === currentSoundscapePresetId);
      if (!preset) return;

      buildSynthesizedPreset(preset);

      isSoundscapePlaying = true;
      updateSoundscapeUIPlayingState(true);

      if (soundscapeTimerMode !== 'none') {
        clearInterval(soundscapeTimerInterval);
        soundscapeTimerInterval = setInterval(() => {
          if (soundscapeSecondsRemaining > 0) {
            soundscapeSecondsRemaining--;
            updateSoundscapeTimerDisplay();
            if (soundscapeSecondsRemaining === 0) {
              playTimerCompletionChime();
              stopProceduralSoundscape();
              alert('⏰ ¡Tiempo de Sesion de Taller completado! Descansa unos minutos.');
            }
          }
        }, 1000);
      }

      const dock = document.getElementById('workshop-soundscape-widget');
      if (dock) dock.style.display = 'flex';
    } catch (err) {
      console.error('Error starting soundscape audio synthesis:', err);
    }
  }

  function stopProceduralSoundscape() {
    if (!isSoundscapePlaying) return;

    if (soundscapeMasterGain && soundscapeAudioCtx) {
      soundscapeMasterGain.gain.setTargetAtTime(0.001, soundscapeAudioCtx.currentTime, 0.1);
    }

    setTimeout(() => {
      activeSoundscapeNodes.forEach(nodeObj => {
        try {
          if (nodeObj.source && nodeObj.source.stop) nodeObj.source.stop();
          if (nodeObj.source && nodeObj.source.disconnect) nodeObj.source.disconnect();
          if (nodeObj.gainNode && nodeObj.gainNode.disconnect) nodeObj.gainNode.disconnect();
        } catch (e) {}
      });
      activeSoundscapeNodes = [];
    }, 150);

    clearInterval(soundscapeTimerInterval);
    isSoundscapePlaying = false;
    updateSoundscapeUIPlayingState(false);
  }

  function updateSoundscapeUIPlayingState(playing) {
    const toggleIcon = document.getElementById('ws-modal-toggle-icon');
    const toggleText = document.getElementById('ws-modal-toggle-text');
    const dockPlayBtn = document.getElementById('ws-dock-play-btn');

    if (playing) {
      if (toggleIcon) toggleIcon.textContent = '⏹';
      if (toggleText) toggleText.textContent = 'Detener Ambiente';
      if (dockPlayBtn) {
        dockPlayBtn.textContent = '⏸';
        dockPlayBtn.style.background = '#ef4444';
        dockPlayBtn.style.color = '#fff';
      }
    } else {
      if (toggleIcon) toggleIcon.textContent = '▶';
      if (toggleText) toggleText.textContent = 'Reproducir Ambiente';
      if (dockPlayBtn) {
        dockPlayBtn.textContent = '▶';
        dockPlayBtn.style.background = '#14b8a6';
        dockPlayBtn.style.color = '#000';
      }
    }
  }

  function closeSoundscapeWidget() {
    stopProceduralSoundscape();
    const dock = document.getElementById('workshop-soundscape-widget');
    if (dock) dock.style.display = 'none';
  }

  function createNoiseBuffer(type, durationSeconds) {
    if (!soundscapeAudioCtx) return null;
    const sampleRate = soundscapeAudioCtx.sampleRate;
    const bufferSize = sampleRate * (durationSeconds || 5);
    const buffer = soundscapeAudioCtx.createBuffer(1, bufferSize, sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        output[i] = white * 0.3;
      }
    }
    return buffer;
  }

  function buildSynthesizedPreset(preset) {
    const ctx = soundscapeAudioCtx;
    if (!ctx) return;

    preset.layers.forEach(layer => {
      const vol = soundscapeLayerVolumes[layer.id] !== undefined
        ? soundscapeLayerVolumes[layer.id]
        : layer.defaultVolume;

      const layerGain = ctx.createGain();
      layerGain.gain.setValueAtTime(vol, ctx.currentTime);
      layerGain.connect(soundscapeMasterGain);

      if (preset.id === 'lluvia-taller') {
        if (layer.id === 'rain-heavy') {
          const buf = createNoiseBuffer('brown', 6);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);
          src.connect(filter);
          filter.connect(layerGain);
          src.start();
          activeSoundscapeNodes.push({ id: layer.id, source: src, gainNode: layerGain });
        } else if (layer.id === 'rain-patter') {
          const buf = createNoiseBuffer('pink', 4);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2200, ctx.currentTime);
          filter.Q.setValueAtTime(1.8, ctx.currentTime);
          src.connect(filter);
          filter.connect(layerGain);
          src.start();
          activeSoundscapeNodes.push({ id: layer.id, source: src, gainNode: layerGain });
        } else if (layer.id === 'distant-thunder') {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(60, ctx.currentTime);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(80, ctx.currentTime);
          osc.connect(filter);
          filter.connect(layerGain);
          osc.start();
          activeSoundscapeNodes.push({ id: layer.id, source: osc, gainNode: layerGain });
        }
      } else if (preset.id === 'compresor-aerografo') {
        if (layer.id === 'compressor-hum') {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(60, ctx.currentTime);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(110, ctx.currentTime);
          osc.connect(filter);
          filter.connect(layerGain);
          osc.start();
          activeSoundscapeNodes.push({ id: layer.id, source: osc, gainNode: layerGain });
        } else if (layer.id === 'airflow-hiss') {
          const buf = createNoiseBuffer('white', 4);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400, ctx.currentTime);
          filter.Q.setValueAtTime(1.5, ctx.currentTime);
          src.connect(filter);
          filter.connect(layerGain);
          src.start();
          activeSoundscapeNodes.push({ id: layer.id, source: src, gainNode: layerGain });
        } else if (layer.id === 'booth-fan') {
          const buf = createNoiseBuffer('pink', 5);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(220, ctx.currentTime);
          src.connect(filter);
          filter.connect(layerGain);
          src.start();
          activeSoundscapeNodes.push({ id: layer.id, source: src, gainNode: layerGain });
        }
      } else if (preset.id === 'hangar-mecha') {
        if (layer.id === 'hangar-drone') {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(55, ctx.currentTime);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(160, ctx.currentTime);
          osc.connect(filter);
          filter.connect(layerGain);
          osc.start();
          activeSoundscapeNodes.push({ id: layer.id, source: osc, gainNode: layerGain });
        } else if (layer.id === 'hydraulics') {
          const buf = createNoiseBuffer('pink', 4);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(650, ctx.currentTime);
          filter.Q.setValueAtTime(3.0, ctx.currentTime);
          src.connect(filter);
          filter.connect(layerGain);
          src.start();
          activeSoundscapeNodes.push({ id: layer.id, source: src, gainNode: layerGain });
        } else if (layer.id === 'reactor-pulse') {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, ctx.currentTime);
          osc.connect(layerGain);
          osc.start();
          activeSoundscapeNodes.push({ id: layer.id, source: osc, gainNode: layerGain });
        }
      } else if (preset.id === 'lo-fi-beats') {
        if (layer.id === 'vinyl-crackle') {
          const buf = createNoiseBuffer('pink', 3);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(3000, ctx.currentTime);
          src.connect(filter);
          filter.connect(layerGain);
          src.start();
          activeSoundscapeNodes.push({ id: layer.id, source: src, gainNode: layerGain });
        } else if (layer.id === 'rhodes-chords') {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(174.61, ctx.currentTime);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, ctx.currentTime);
          osc.connect(filter);
          filter.connect(layerGain);
          osc.start();
          activeSoundscapeNodes.push({ id: layer.id, source: osc, gainNode: layerGain });
        } else if (layer.id === 'tape-flutter') {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(87.31, ctx.currentTime);
          osc.connect(layerGain);
          osc.start();
          activeSoundscapeNodes.push({ id: layer.id, source: osc, gainNode: layerGain });
        }
      } else if (preset.id === 'jardin-zen') {
        if (layer.id === 'bamboo-wind') {
          const buf = createNoiseBuffer('pink', 5);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);
          filter.Q.setValueAtTime(1.0, ctx.currentTime);
          src.connect(filter);
          filter.connect(layerGain);
          src.start();
          activeSoundscapeNodes.push({ id: layer.id, source: src, gainNode: layerGain });
        } else if (layer.id === 'water-stream') {
          const buf = createNoiseBuffer('brown', 4);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(750, ctx.currentTime);
          src.connect(filter);
          filter.connect(layerGain);
          src.start();
          activeSoundscapeNodes.push({ id: layer.id, source: src, gainNode: layerGain });
        } else if (layer.id === 'singing-bowl') {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(432, ctx.currentTime);
          osc.connect(layerGain);
          osc.start();
          activeSoundscapeNodes.push({ id: layer.id, source: osc, gainNode: layerGain });
        }
      }
    });
  }

  function playTimerCompletionChime() {
    try {
      if (!soundscapeAudioCtx) return;
      const ctx = soundscapeAudioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch (e) {}
  }

  // --- DT22: Airbrush PSI & Thinner Ratio Calculator ---
  let selectedAirbrushNeedle = 0.3;
  let selectedAirbrushPaintDrops = 10;
  let lastAirbrushMixResult = null;

  function openAirbrushCalculatorModal() {
    const m = document.getElementById('modal-airbrush-calculator');
    if (!m) return;
    m.style.display = 'flex';
    m.classList.add('active');
    runAirbrushCalculation();
  }

  function closeAirbrushCalculatorModal(e) {
    if (!e || e.target.id === 'modal-airbrush-calculator' || (e.target.tagName === 'SPAN' && e.target.textContent === '×') || !e.target) {
      const m = document.getElementById('modal-airbrush-calculator');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    }
  }

  function setAirbrushNeedle(size) {
    selectedAirbrushNeedle = Number(size);
    const needleButtons = [
      { id: 'btn-needle-015', size: 0.15 },
      { id: 'btn-needle-02', size: 0.2 },
      { id: 'btn-needle-03', size: 0.3 },
      { id: 'btn-needle-04', size: 0.4 },
      { id: 'btn-needle-05', size: 0.5 }
    ];
    needleButtons.forEach(btnObj => {
      const btn = document.getElementById(btnObj.id);
      if (btn) {
        if (Math.abs(btnObj.size - selectedAirbrushNeedle) < 0.01) {
          btn.classList.add('active');
          btn.style.background = '#ea580c';
          btn.style.color = '#fff';
        } else {
          btn.classList.remove('active');
          btn.style.background = '';
          btn.style.color = '';
        }
      }
    });
    runAirbrushCalculation();
  }

  function updateAirbrushPaintVolume(val) {
    const drops = parseInt(val, 10) || 10;
    selectedAirbrushPaintDrops = drops;
    const label = document.getElementById('airbrush-paint-drops-val');
    if (label) {
      const ml = (drops * 0.05).toFixed(2);
      label.textContent = drops + ' gotas (~' + ml + ' ml)';
    }
    runAirbrushCalculation();
  }

  async function runAirbrushCalculation() {
    const mediumInput = document.querySelector('input[name="airbrush-medium"]:checked');
    const medium = mediumInput ? mediumInput.value : 'lacquer';
    const techSelect = document.getElementById('airbrush-technique-select');
    const technique = techSelect ? techSelect.value : 'base-coat';
    const tempInput = document.getElementById('airbrush-temp-input');
    const humidityInput = document.getElementById('airbrush-humidity-input');
    const ambientTempC = tempInput && tempInput.value ? parseFloat(tempInput.value) : undefined;
    const ambientHumidityPct = humidityInput && humidityInput.value ? parseFloat(humidityInput.value) : undefined;

    const payload = {
      medium: medium,
      needleSize: selectedAirbrushNeedle,
      technique: technique,
      paintDrops: selectedAirbrushPaintDrops,
      ambientTempC: ambientTempC,
      ambientHumidityPct: ambientHumidityPct
    };

    try {
      const res = await fetch('/api/v1/workbench/airbrush/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Calculo fallido');
      const data = await res.json();
      lastAirbrushMixResult = data;
      renderAirbrushCalculationUI(data);
    } catch (err) {
      console.warn('Fallback airbrush calculation error:', err);
    }
  }

  function renderAirbrushCalculationUI(data) {
    if (!data) return;
    const ratioBadge = document.getElementById('airbrush-ratio-badge');
    if (ratioBadge) ratioBadge.textContent = data.ratioString;

    const pressBadge = document.getElementById('airbrush-pressure-badge');
    if (pressBadge) pressBadge.textContent = data.recommendedPressurePsi.min + ' - ' + data.recommendedPressurePsi.max + ' PSI';

    const barBadge = document.getElementById('airbrush-bar-badge');
    if (barBadge) barBadge.textContent = '(' + data.recommendedPressureBar.min + ' - ' + data.recommendedPressureBar.max + ' Bar)';

    const recipeDrops = document.getElementById('airbrush-recipe-drops');
    if (recipeDrops) recipeDrops.textContent = data.recipeDescription;

    const thinnerName = document.getElementById('airbrush-thinner-name');
    if (thinnerName) thinnerName.textContent = 'Diluyente: ' + data.recommendedThinner;

    const viscText = document.getElementById('airbrush-viscosity-text');
    if (viscText) viscText.textContent = data.viscosityAnalogy;

    const distText = document.getElementById('airbrush-distance-text');
    if (distText) distText.textContent = data.sprayingDistanceCm.min + ' - ' + data.sprayingDistanceCm.max + ' cm';

    const tipsContainer = document.getElementById('airbrush-tips-container');
    if (tipsContainer && Array.isArray(data.tips)) {
      tipsContainer.innerHTML = data.tips.map(t => '<div style="font-size: 0.75rem; color: #cbd5e1; display: flex; align-items: flex-start; gap: 0.4rem;"><span>•</span><span>' + t + '</span></div>').join('');
    }

    const tbList = document.getElementById('airbrush-troubleshooting-list');
    if (tbList && Array.isArray(data.troubleshooting)) {
      tbList.innerHTML = data.troubleshooting.map(item => '<div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.35rem;"><strong style="color: #f87171;">' + item.issue + ':</strong> <span style="color: #cbd5e1;">' + item.cause + '</span> <span style="color: #4ade80;">➔ ' + item.solution + '</span></div>').join('');
    }
  }

  function copyAirbrushRecipeToClipboard() {
    if (!lastAirbrushMixResult) return;
    const r = lastAirbrushMixResult;
    const text = '--- Receta de Aerografo (Gunpla Workbench) ---\\n' +
      'Quimica: ' + r.medium + '\\n' +
      'Boquilla: ' + r.needleSize + ' mm | Tecnica: ' + r.technique + '\\n' +
      'Relacion Optima: ' + r.ratioString + '\\n' +
      'Mezcla: ' + r.recipeDescription + '\\n' +
      'Presion: ' + r.recommendedPressurePsi.min + ' - ' + r.recommendedPressurePsi.max + ' PSI (' + r.recommendedPressureBar.min + ' - ' + r.recommendedPressureBar.max + ' Bar)\\n' +
      'Diluyente: ' + r.recommendedThinner + '\\n' +
      'Distancia: ' + r.sprayingDistanceCm.min + ' - ' + r.sprayingDistanceCm.max + ' cm';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert('📋 ¡Receta de dilucion copiada al portapapeles!');
      }).catch(() => {
        alert(text);
      });
    } else {
      alert(text);
    }
  }

  // --- DT23: Parts Breakdown & Assembly Subassembly Cards ---
  let currentSubassemblyBuildId = null;
  let currentSubassembliesData = null;

  async function openSubassembliesModal(specificBuildId) {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const m = document.getElementById('modal-subassemblies-breakdown');
    if (!m) return;
    m.style.display = 'flex';
    m.classList.add('active');

    const select = document.getElementById('subassembly-build-select');
    if (select) {
      select.innerHTML = '<option value="">Cargando bitacoras...</option>';
      try {
        const res = await fetch('/api/v1/builds?author=' + encodeURIComponent(currentUser.username));
        const data = await res.json();
        const builds = data.items || [];
        if (builds.length === 0) {
          select.innerHTML = '<option value="">No tienes bitacoras creadas aun</option>';
        } else {
          select.innerHTML = builds.map(function(b) {
            const title = b.title || (b.kit ? b.kit.name : '') || b.id;
            return '<option value="' + b.id + '">' + title + '</option>';
          }).join('');
          if (specificBuildId) {
            select.value = specificBuildId;
          }
          currentSubassemblyBuildId = select.value;
          loadSubassembliesForCurrentBuild();
        }
      } catch (e) {
        console.error('Error loading builds for subassemblies:', e);
      }
    }
  }

  function closeSubassembliesModal(e) {
    if (!e || e.target.id === 'modal-subassemblies-breakdown' || (e.target.tagName === 'SPAN' && e.target.textContent === '×') || !e.target) {
      const m = document.getElementById('modal-subassemblies-breakdown');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    }
  }

  function onSubassemblyBuildSelectChange() {
    const select = document.getElementById('subassembly-build-select');
    if (select && select.value) {
      currentSubassemblyBuildId = select.value;
      loadSubassembliesForCurrentBuild();
    }
  }

  async function loadSubassembliesForCurrentBuild() {
    if (!currentSubassemblyBuildId) return;
    const container = document.getElementById('subassemblies-cards-container');
    if (container) {
      container.innerHTML = '<p style="color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 2rem;">Cargando fichas de despiece...</p>';
    }

    try {
      const res = await fetch('/api/v1/builds/' + encodeURIComponent(currentSubassemblyBuildId) + '/subassemblies');
      if (!res.ok) throw new Error('Error al cargar subensambles');
      const data = await res.json();
      currentSubassembliesData = data;
      renderSubassembliesUI(data);
    } catch (err) {
      console.error('Error loading subassemblies:', err);
      if (container) {
        container.innerHTML = '<p style="color: #ef4444; font-size: 0.85rem; text-align: center; padding: 2rem;">No se pudieron cargar los subensambles. Reintenta.</p>';
      }
    }
  }

  function renderSubassembliesUI(data) {
    const container = document.getElementById('subassemblies-cards-container');
    if (!container || !data) return;

    const p = data.progress || {};
    const statCards = document.getElementById('sub-stat-total-cards');
    const statParts = document.getElementById('sub-stat-total-parts');
    const statPct = document.getElementById('sub-stat-overall-pct');

    if (statCards) statCards.textContent = p.totalCards || 0;
    if (statParts) statParts.textContent = '~' + (p.totalPartsEstimated || 0);
    if (statPct) statPct.textContent = (p.completionPercentage || 0) + '%';

    const sb = p.stageBreakdown || {};
    const pillCut = document.getElementById('sub-pill-cut');
    const pillCleaned = document.getElementById('sub-pill-cleaned');
    const pillPrimed = document.getElementById('sub-pill-primed');
    const pillPainted = document.getElementById('sub-pill-painted');
    const pillTop = document.getElementById('sub-pill-topcoated');

    if (pillCut) pillCut.textContent = 'Cortado: ' + (sb.cut ? sb.cut.pct : 0) + '%';
    if (pillCleaned) pillCleaned.textContent = 'Lijado: ' + (sb.cleaned ? sb.cleaned.pct : 0) + '%';
    if (pillPrimed) pillPrimed.textContent = 'Imprimado: ' + (sb.primed ? sb.primed.pct : 0) + '%';
    if (pillPainted) pillPainted.textContent = 'Pintado: ' + (sb.painted ? sb.painted.pct : 0) + '%';
    if (pillTop) pillTop.textContent = 'Barniz: ' + (sb.topcoated ? sb.topcoated.pct : 0) + '%';

    const items = data.items || [];
    if (items.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #94a3b8;"><p style="margin-bottom: 0.75rem;">Aun no hay fichas de despiece registradas para este modelo.</p><button type="button" class="btn-primary" onclick="regenerateDefaultSubassemblies()" style="font-size: 0.8rem;">Plantilla Automatica</button></div>';
      return;
    }

    container.innerHTML = items.map(function(card) {
      const runnersHtml = (card.runners && card.runners.length > 0)
        ? card.runners.map(function(r) { return '<span style="display: inline-block; background: #312e81; color: #c7d2fe; font-size: 0.72rem; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">[' + r + ']</span>'; }).join('')
        : '<span style="color: #64748b; font-size: 0.72rem; font-style: italic;">Sin grapas asignadas</span>';

      function stageBtn(key, label) {
        const checked = card.stages && card.stages[key];
        const bg = checked ? '#059669' : 'rgba(255,255,255,0.05)';
        const col = checked ? '#fff' : '#94a3b8';
        const border = checked ? '#10b981' : '#334155';
        return '<button type="button" data-sub-id="' + card.id + '" data-stage-key="' + key + '" onclick="toggleSubassemblyStage(this.dataset.subId, this.dataset.stageKey)" style="padding: 0.35rem 0.6rem; border-radius: 6px; border: 1px solid ' + border + '; background: ' + bg + '; color: ' + col + '; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">' + (checked ? '✓ ' : '') + label + '</button>';
      }

      return '<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.65rem;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem;">' +
          '<div style="display: flex; align-items: center; gap: 0.5rem;">' +
            '<span style="font-size: 1.35rem;">' + (card.icon || '🧩') + '</span>' +
            '<strong style="font-size: 0.95rem; color: #f1f5f9;">' + card.name + '</strong>' +
            '<span style="font-size: 0.72rem; color: #a5b4fc; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 2px 8px; font-weight: 600;">~' + (card.partCountEstimated || 0) + ' piezas</span>' +
          '</div>' +
          '<button type="button" data-sub-id="' + card.id + '" onclick="deleteSubassembly(this.dataset.subId)" style="background: transparent; border: none; color: #ef4444; font-size: 0.9rem; cursor: pointer; padding: 2px 6px;" title="Eliminar subensamble">🗑️</button>' +
        '</div>' +

        '<div style="font-size: 0.75rem; color: #cbd5e1;">' +
          '<strong>Grapas / Runners:</strong> ' + runnersHtml +
        '</div>' +

        '<div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">' +
          stageBtn('cut', '1. Cortado') +
          stageBtn('cleaned', '2. Lijado') +
          stageBtn('primed', '3. Imprimado') +
          stageBtn('painted', '4. Pintado') +
          stageBtn('topcoated', '5. Barniz') +
        '</div>' +

        (card.customNotes ? '<div style="background: rgba(236, 72, 153, 0.08); border-left: 3px solid #ec4899; padding: 0.4rem 0.65rem; border-radius: 4px; font-size: 0.73rem; color: #fbcfe8;"><strong>Checklist / Mods:</strong> ' + card.customNotes + '</div>' : '') +
        (card.colorPaletteNotes ? '<div style="background: rgba(14, 165, 233, 0.08); border-left: 3px solid #0284c7; padding: 0.35rem 0.65rem; border-radius: 4px; font-size: 0.72rem; color: #bae6fd;"><strong>Pinturas:</strong> ' + card.colorPaletteNotes + '</div>' : '') +
      '</div>';
    }).join('');
  }

  async function toggleSubassemblyStage(subId, stageKey) {
    if (!currentSubassemblyBuildId || !currentSubassembliesData) return;
    const item = (currentSubassembliesData.items || []).find(c => c.id === subId);
    if (!item) return;

    const newStageVal = !(item.stages && item.stages[stageKey]);
    const payload = {
      stages: {}
    };
    payload.stages[stageKey] = newStageVal;

    try {
      const res = await fetch('/api/v1/builds/' + encodeURIComponent(currentSubassemblyBuildId) + '/subassemblies/' + encodeURIComponent(subId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al actualizar fase');
      loadSubassembliesForCurrentBuild();
    } catch (err) {
      console.error('Error toggling stage:', err);
    }
  }

  function toggleAddSubassemblyDrawer() {
    const d = document.getElementById('sub-add-form-drawer');
    if (!d) return;
    d.style.display = (d.style.display === 'none' || !d.style.display) ? 'block' : 'none';
  }

  async function submitNewSubassembly() {
    if (!currentSubassemblyBuildId) return;
    const nameInput = document.getElementById('sub-input-name');
    const typeSelect = document.getElementById('sub-input-type');
    const runnersInput = document.getElementById('sub-input-runners');
    const partsInput = document.getElementById('sub-input-parts');
    const notesInput = document.getElementById('sub-input-notes');
    const colorsInput = document.getElementById('sub-input-colors');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      alert('Por favor escribe un nombre para el bloque de subensamble');
      return;
    }

    const runners = runnersInput && runnersInput.value ? runnersInput.value.split(',').map(r => r.trim()).filter(Boolean) : [];
    const parts = partsInput ? parseInt(partsInput.value, 10) || 0 : 0;
    const type = typeSelect ? typeSelect.value : 'custom';
    const customNotes = notesInput ? notesInput.value.trim() : '';
    const colorPaletteNotes = colorsInput ? colorsInput.value.trim() : '';

    const iconMap = {
      head: '🤖', torso: '🥋', arms: '💪', waist: '🩳', legs: '🦵',
      backpack: '🚀', weapons: '⚔️', cockpit: '💺', chassis: '🚜',
      engine: '🏎️', wings: '🛩️', accessories: '🔧', custom: '🧩'
    };

    const payload = {
      name: name,
      type: type,
      icon: iconMap[type] || '🧩',
      runners: runners,
      partCountEstimated: parts,
      customNotes: customNotes,
      colorPaletteNotes: colorPaletteNotes
    };

    try {
      const res = await fetch('/api/v1/builds/' + encodeURIComponent(currentSubassemblyBuildId) + '/subassemblies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al guardar subensamble');
      if (nameInput) nameInput.value = '';
      if (runnersInput) runnersInput.value = '';
      if (notesInput) notesInput.value = '';
      if (colorsInput) colorsInput.value = '';
      toggleAddSubassemblyDrawer();
      loadSubassembliesForCurrentBuild();
    } catch (err) {
      console.error('Error submitting subassembly:', err);
      alert('Error al agregar subensamble. Intenta nuevamente.');
    }
  }

  async function deleteSubassembly(subId) {
    if (!currentSubassemblyBuildId) return;
    if (!confirm('¿Eliminar este bloque de subensamble?')) return;

    try {
      const res = await fetch('/api/v1/builds/' + encodeURIComponent(currentSubassemblyBuildId) + '/subassemblies/' + encodeURIComponent(subId), {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + currentToken
        }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      loadSubassembliesForCurrentBuild();
    } catch (err) {
      console.error('Error deleting subassembly:', err);
    }
  }

  async function regenerateDefaultSubassemblies() {
    if (!currentSubassemblyBuildId) return;
    if (!confirm('¿Reemplazar los bloques actuales con la plantilla anatomica recomendada segun la categoria y grado del modelo?')) return;

    try {
      const res = await fetch('/api/v1/builds/' + encodeURIComponent(currentSubassemblyBuildId) + '/subassemblies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify({ autoGenerate: true })
      });
      if (!res.ok) throw new Error('Error al regenerar');
      loadSubassembliesForCurrentBuild();
    } catch (err) {
      console.error('Error regenerating subassemblies:', err);
    }
  }

  function printSubassemblyWorksheet() {
    if (!currentSubassemblyBuildId) {
      alert('Selecciona una bitacora primero');
      return;
    }
    window.open('/api/v1/builds/' + encodeURIComponent(currentSubassemblyBuildId) + '/subassemblies/export', '_blank');
  }

  // --- DT24: Workbench Tool Inventory & Blade Wear Tracker ---
  let workbenchToolsData = [];
  let workbenchToolsSummary = null;
  let currentToolFilter = 'all';

  async function openToolsInventoryModal(openDrawer) {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const m = document.getElementById('modal-workbench-tools');
    if (!m) return;
    m.style.display = 'flex';
    m.classList.add('active');

    const drawer = document.getElementById('tool-add-form-drawer');
    if (drawer) {
      drawer.style.display = openDrawer ? 'block' : 'none';
    }

    await loadWorkbenchTools();
  }

  function closeToolsInventoryModal(e) {
    if (!e || e.target.id === 'modal-workbench-tools' || (e.target.tagName === 'SPAN' && e.target.textContent === '×') || !e.target) {
      const m = document.getElementById('modal-workbench-tools');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    }
  }

  function toggleAddToolDrawer() {
    const drawer = document.getElementById('tool-add-form-drawer');
    if (drawer) {
      drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
    }
  }

  function filterWorkbenchTools(category) {
    currentToolFilter = category;
    const filterIds = ['all', 'nippers', 'knives', 'chisels', 'abrasives', 'airbrush'];
    filterIds.forEach(f => {
      const btn = document.getElementById('tool-filter-' + f);
      if (btn) {
        if (f === category) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
    renderWorkbenchToolsGrid();
  }

  async function loadWorkbenchTools() {
    if (!currentUser) return;
    const authHeaders = {
      'Authorization': 'Bearer ' + currentToken,
      'X-Tenant-Slug': '${config.tenantSlug}'
    };

    try {
      const res = await fetch('/api/v1/workbench/tools', { headers: authHeaders });
      if (!res.ok) throw new Error('Error al cargar herramientas');
      const data = await res.json();
      workbenchToolsData = data.items || [];
      workbenchToolsSummary = data.summary || {};
      window.__WB_TOOLS = workbenchToolsData;
      window.__WB_TOOLS_SUMMARY = workbenchToolsSummary;

      // Update KPI counters
      const kpiActive = document.getElementById('tools-kpi-active-count');
      const kpiWorn = document.getElementById('tools-kpi-worn-count');
      const kpiReplace = document.getElementById('tools-kpi-replace-count');
      const kpiBlades = document.getElementById('tools-kpi-blades-consumed');

      if (kpiActive) kpiActive.textContent = workbenchToolsSummary.activeToolsCount || 0;
      if (kpiWorn) kpiWorn.textContent = workbenchToolsSummary.wornToolsCount || 0;
      if (kpiReplace) kpiReplace.textContent = workbenchToolsSummary.needsReplacementCount || 0;
      if (kpiBlades) kpiBlades.textContent = workbenchToolsSummary.totalBladesConsumedAllTime || 0;

      // Update wear badge on workbench tab
      const wearBadge = document.getElementById('wb-tools-wear-badge');
      if (wearBadge) {
        const warningCount = (workbenchToolsSummary.wornToolsCount || 0) + (workbenchToolsSummary.needsReplacementCount || 0);
        if (warningCount > 0) {
          wearBadge.textContent = warningCount;
          wearBadge.style.display = 'inline-block';
        } else {
          wearBadge.style.display = 'none';
        }
      }

      renderWorkbenchToolsGrid();
    } catch (err) {
      console.error('Error fetching workbench tools:', err);
    }
  }

  function renderWorkbenchToolsGrid() {
    const mainGrid = document.getElementById('wb-tools-grid');
    const modalContainer = document.getElementById('tool-modal-cards-container');

    const filtered = (currentToolFilter === 'all')
      ? workbenchToolsData
      : workbenchToolsData.filter(t => t.category === currentToolFilter);

    const conditionColors = {
      new: '#22c55e',
      excellent: '#10b981',
      good: '#38bdf8',
      fair: '#f59e0b',
      worn: '#f97316',
      needs_replacement: '#ef4444'
    };

    const conditionLabels = {
      new: 'Nuevo',
      excellent: 'Excelente',
      good: 'Bueno',
      fair: 'Aceptable',
      worn: 'Desgastado',
      needs_replacement: 'Reemplazo Urgente'
    };

    const categoryIcons = {
      'nippers': '✂️',
      'knives': '🗡️',
      'chisels': '📐',
      'abrasives': '🪨',
      'airbrush': '🎨',
      'rotary-drill': '⚙️',
      'general': '🛠️'
    };

    const emptyHtml = '<div style="grid-column: 1 / -1; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 10px; padding: 2.5rem 1.5rem; text-align: center;">' +
      '<div style="font-size: 2rem; margin-bottom: 0.5rem;">✂️</div>' +
      '<h4 style="font-size: 1rem; color: #fff; margin-bottom: 0.3rem;">No hay herramientas en esta categoría</h4>' +
      '<p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 1rem;">Registra tus alicates, bisturís y cinceles para monitorear su filo.</p>' +
      '<button class="btn-primary" onclick="openToolsInventoryModal(true)" style="background: #eab308; color: #000; font-weight: 600; border: none; font-size: 0.8rem; padding: 0.4rem 0.8rem;">+ Registrar Herramienta</button>' +
      '</div>';

    const cardsHtml = filtered.length === 0 ? emptyHtml : filtered.map(function(tool) {
      const wear = tool.wearResult || {};
      const wearPct = typeof wear.wearPercentage === 'number' ? wear.wearPercentage : 0;
      const cond = wear.conditionSuggestion || tool.condition || 'good';
      const condColor = conditionColors[cond] || '#38bdf8';
      const condLabel = conditionLabels[cond] || cond;
      const catIcon = categoryIcons[tool.category] || '🛠️';
      const isDull = !!wear.isDullWarning;
      const toolWear = tool.wear || {};
      const isWearTracked = !!toolWear.enabled;
      const cutsCount = toolWear.currentCutsCount || 0;
      const maxCuts = toolWear.maxRecommendedCuts || 0;
      const remainingCuts = Math.max(0, maxCuts - cutsCount);

      let barColor = '#22c55e';
      if (wearPct >= 80) barColor = '#ef4444';
      else if (wearPct >= 60) barColor = '#f97316';
      else if (wearPct >= 40) barColor = '#f59e0b';

      const dullAlertBanner = isDull
        ? '<div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 6px; padding: 0.45rem 0.65rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: #fca5a5;">' +
            '<span>⚠️</span> <strong>¡Filo gastado!</strong> ' + (wear.alertMessage || 'Riesgo de marcas de estrés o pellizcos en el plástico.') +
          '</div>'
        : '';

      const bladeTypeBadge = toolWear.bladeType
        ? '<span style="font-size: 0.68rem; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 0.1rem 0.4rem; border-radius: 4px;">Cuchilla: ' + escapeHtml(toolWear.bladeType) + '</span>'
        : '';

      return '<div style="background: var(--card-bg); border: 1px solid ' + (isDull ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-color)') + '; border-radius: 10px; padding: 1.1rem; display: flex; flex-direction: column; justify-content: space-between; position: relative;">' +
        '<div>' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">' +
            '<div style="display: flex; align-items: center; gap: 0.45rem;">' +
              '<span style="font-size: 1.3rem;">' + catIcon + '</span>' +
              '<div>' +
                '<h4 style="font-size: 0.92rem; font-weight: 700; color: #fff; margin: 0; line-height: 1.2;">' + escapeHtml(tool.name) + '</h4>' +
                '<div style="font-size: 0.72rem; color: #94a3b8;">' + (tool.brand ? escapeHtml(tool.brand) + ' • ' : '') + (tool.modelNumber ? escapeHtml(tool.modelNumber) : '') + '</div>' +
              '</div>' +
            '</div>' +
            '<span style="font-size: 0.68rem; font-weight: 700; color: ' + condColor + '; background: ' + condColor + '18; border: 1px solid ' + condColor + '40; padding: 0.15rem 0.45rem; border-radius: 4px; white-space: nowrap;">' + condLabel + '</span>' +
          '</div>' +

          dullAlertBanner +

          (isWearTracked ? (
            '<div style="margin: 0.75rem 0;">' +
              '<div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.25rem;">' +
                '<span>Uso: <strong>' + cutsCount + '</strong> / ' + (maxCuts || '∞') + ' cortes</span>' +
                '<span style="color: ' + barColor + '; font-weight: 700;">' + wearPct + '% desgaste</span>' +
              '</div>' +
              '<div style="background: rgba(255,255,255,0.08); height: 7px; border-radius: 9999px; overflow: hidden;">' +
                '<div style="background: ' + barColor + '; width: ' + Math.min(100, wearPct) + '%; height: 100%; transition: width 0.3s ease;"></div>' +
              '</div>' +
              '<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.3rem;">' +
                '<span style="font-size: 0.68rem; color: #64748b;">Restantes: ~' + remainingCuts + ' cortes</span>' +
                bladeTypeBadge +
              '</div>' +
            '</div>'
          ) : '<div style="font-size: 0.72rem; color: #64748b; margin: 0.5rem 0;">Herramienta fija (sin conteo de cuchilla)</div>') +

          (tool.notes ? '<div style="font-size: 0.72rem; color: #94a3b8; font-style: italic; margin-bottom: 0.75rem; background: rgba(0,0,0,0.2); padding: 0.35rem 0.5rem; border-radius: 4px;">💬 ' + escapeHtml(tool.notes) + '</div>' : '') +
        '</div>' +

        '<div style="padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; flex-wrap: wrap;">' +
          (isWearTracked ? (
            '<div style="display: flex; gap: 0.3rem;">' +
              '<button type="button" class="filter-pill" data-tool-id="' + tool.id + '" onclick="logToolCuts(this.dataset.toolId, 25)" style="font-size: 0.68rem; padding: 0.2rem 0.45rem;" title="Registrar 25 cortes">+25 Cortes</button>' +
              '<button type="button" class="filter-pill" data-tool-id="' + tool.id + '" onclick="logToolCuts(this.dataset.toolId, 100)" style="font-size: 0.68rem; padding: 0.2rem 0.45rem;" title="Registrar 100 cortes">+100</button>' +
            '</div>'
          ) : '<div></div>') +
          '<div style="display: flex; gap: 0.35rem;">' +
            '<button type="button" class="btn-primary" data-tool-id="' + tool.id + '" onclick="replaceToolBlade(this.dataset.toolId)" style="font-size: 0.68rem; padding: 0.25rem 0.55rem; background: #0284c7; border: none;" title="Renovar cuchilla o reafilar filo">🔄 Cambiar Cuchilla</button>' +
            '<button type="button" class="filter-pill" data-tool-id="' + tool.id + '" onclick="deleteTool(this.dataset.toolId)" style="font-size: 0.68rem; padding: 0.25rem 0.45rem; color: #ef4444; border-color: rgba(239,68,68,0.3);" title="Eliminar herramienta">🗑️</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    if (mainGrid) mainGrid.innerHTML = cardsHtml;
    if (modalContainer) modalContainer.innerHTML = cardsHtml;
  }

  async function logToolCuts(toolId, cutsIncrement) {
    if (!toolId) return;
    try {
      const res = await fetch('/api/v1/workbench/tools/' + encodeURIComponent(toolId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({ cutsIncrement: cutsIncrement, sessionsIncrement: 1 })
      });
      if (!res.ok) throw new Error('Error al actualizar cortes');
      await loadWorkbenchTools();
    } catch (err) {
      console.error('Error logging tool cuts:', err);
      alert('No se pudo registrar el uso de la herramienta.');
    }
  }

  async function replaceToolBlade(toolId) {
    if (!toolId) return;
    const notes = prompt('¿Deseas registrar alguna nota sobre el cambio de cuchilla? (opcional)', 'Cuchilla nueva instalada');
    if (notes === null) return;

    try {
      const res = await fetch('/api/v1/workbench/tools/' + encodeURIComponent(toolId) + '/replace-blade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify({ notes: notes || undefined })
      });
      if (!res.ok) throw new Error('Error al registrar reemplazo');
      alert('✂️ ¡Cuchilla renovada con éxito! El contador de desgaste ha sido reiniciado.');
      await loadWorkbenchTools();
    } catch (err) {
      console.error('Error replacing tool blade:', err);
      alert('Error al registrar reemplazo de cuchilla.');
    }
  }

  async function deleteTool(toolId) {
    if (!toolId) return;
    if (!confirm('¿Eliminar esta herramienta de tu taller?')) return;

    try {
      const res = await fetch('/api/v1/workbench/tools/' + encodeURIComponent(toolId), {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        }
      });
      if (!res.ok) throw new Error('Error al eliminar herramienta');
      await loadWorkbenchTools();
    } catch (err) {
      console.error('Error deleting tool:', err);
      alert('Error al eliminar la herramienta.');
    }
  }

  async function submitNewWorkbenchTool() {
    const nameInput = document.getElementById('tool-input-name');
    const brandInput = document.getElementById('tool-input-brand');
    const catInput = document.getElementById('tool-input-category');
    const modelInput = document.getElementById('tool-input-model');
    const wearInput = document.getElementById('tool-input-track-wear');
    const maxCutsInput = document.getElementById('tool-input-max-cuts');
    const skuInput = document.getElementById('tool-input-blade-sku');
    const spareInput = document.getElementById('tool-input-spare-blades');
    const notesInput = document.getElementById('tool-input-notes');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      alert('Por favor ingresa el nombre de la herramienta');
      return;
    }

    const payload = {
      name: name,
      brand: brandInput && brandInput.value.trim() ? brandInput.value.trim() : 'Genérico',
      category: catInput ? catInput.value : 'general',
      modelNumber: modelInput ? modelInput.value.trim() || undefined : undefined,
      wearEnabled: wearInput ? wearInput.checked : true,
      maxRecommendedCuts: maxCutsInput ? parseInt(maxCutsInput.value, 10) || 300 : 300,
      bladeType: skuInput ? skuInput.value.trim() || undefined : undefined,
      notes: notesInput ? notesInput.value.trim() || undefined : undefined
    };

    try {
      const res = await fetch('/api/v1/workbench/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken,
          'X-Tenant-Slug': '${config.tenantSlug}'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al registrar herramienta');
      
      if (nameInput) nameInput.value = '';
      if (brandInput) brandInput.value = '';
      if (modelInput) modelInput.value = '';
      if (skuInput) skuInput.value = '';
      if (notesInput) notesInput.value = '';

      toggleAddToolDrawer();
      await loadWorkbenchTools();
    } catch (err) {
      console.error('Error creating tool:', err);
      alert('Error al registrar la herramienta.');
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

      // 6. Fetch Tools Summary for Wear Badge
      try {
        const toolsRes = await fetch(apiBase + '/api/v1/workbench/tools', { headers: authHeaders });
        if (toolsRes.ok) {
          const toolsData = await toolsRes.json();
          window.__WB_TOOLS = toolsData.items || [];
          window.__WB_TOOLS_SUMMARY = toolsData.summary || {};
          const wornOrReplace = (toolsData.summary ? ((toolsData.summary.wornCount || 0) + (toolsData.summary.needsReplacementCount || 0)) : 0);
          const wearBadge = document.getElementById('wb-tools-wear-badge');
          if (wearBadge) {
            if (wornOrReplace > 0) {
              wearBadge.textContent = wornOrReplace;
              wearBadge.style.display = 'inline-block';
            } else {
              wearBadge.style.display = 'none';
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching workbench tools summary:', err);
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

      const sBadge = document.getElementById('wb-stash-count-badge');
      if (sBadge) sBadge.textContent = totalKits + (totalKits === 1 ? ' maqueta' : ' maquetas');

      // Render Stash Grid
      const stashContainer = document.getElementById('wb-stash-grid');
      if (stashContainer) {
        if (stashItems.length === 0) {
          stashContainer.innerHTML = 
            '<div style="grid-column: 1 / -1; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: 10px; padding: 3rem 1.5rem; text-align: center;">' +
              '<div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📦</div>' +
              '<h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.4rem;">¡Tu Stash está vacío!</h3>' +
              '<p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">Agrega tu primera maqueta para empezar a registrar tu colección y avances.</p>' +
              '<div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">' +
                '<button class="btn-primary" onclick="openBarcodeScannerModal()" style="background: linear-gradient(135deg, #0ea5e9, #6366f1); border: none;">📷 Escanear Caja (JAN)</button>' +
                '<button class="filter-pill" onclick="openAddStashModal()">+ Agregar Manual</button>' +
              '</div>' +
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
                '<div style="font-size: 0.72rem; color: var(--primary); font-weight: 600; text-transform: uppercase; margin-bottom: 0.2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.25rem;">' +
                  '<span>' + brand + ' • ' + scale + grade + '</span>' +
                  (kit.barcode ? '<span style="font-family: monospace; font-size: 0.68rem; color: #94a3b8; background: rgba(255,255,255,0.06); padding: 0.1rem 0.35rem; border-radius: 3px;">🏷️ ' + escapeHtml(kit.barcode) + '</span>' : '') +
                '</div>' +
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
                    '<button class="filter-pill" style="font-size: 0.72rem; padding: 0.3rem 0.6rem; color: #c084fc; border-color: rgba(168, 85, 247, 0.4);" onclick="openKit3dViewerModal(&quot;' + (kit.id || '') + '&quot;)">📐 3D</button>' +
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
                  '<button class="filter-pill" style="font-size: 0.78rem; padding: 0.45rem 0.8rem; background: rgba(234,179,8,0.15); color: #facc15; border-color: rgba(234,179,8,0.3);" onclick="openBuildCostsModal(&quot;' + b.id + '&quot;)">💰 Costos</button>' +
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
