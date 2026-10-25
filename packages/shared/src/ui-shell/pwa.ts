import { AppShellConfig } from './app-shell';

export interface WebAppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'portrait' | 'landscape';
  background_color: string;
  theme_color: string;
  categories: string[];
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
}

export function generateManifest(config: AppShellConfig): WebAppManifest {
  const isGunpla = config.tenantSlug === 'gunplajunkies';
  const shortName = isGunpla ? 'GunplaJunkies' : 'PlamoScale';
  const bgColor = config.theme.bgDark || (isGunpla ? '#090d16' : '#0b0f19');
  const themeColor = config.theme.primaryColor || (isGunpla ? '#ef4444' : '#2563eb');

  return {
    name: `${config.tenantName} — Taller & Comunidad de Modelismo`,
    short_name: shortName,
    description: config.tenantTagline,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: bgColor,
    theme_color: themeColor,
    categories: ['hobbies', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  };
}

export function generateAppIconSvg(config: AppShellConfig, size = 512): string {
  const isGunpla = config.tenantSlug === 'gunplajunkies';
  const primary = config.theme.primaryColor || (isGunpla ? '#ef4444' : '#2563eb');
  const accent = config.theme.accentColor || (isGunpla ? '#f97316' : '#38bdf8');
  const bg = config.theme.bgDark || (isGunpla ? '#090d16' : '#0b0f19');
  const initial = isGunpla ? 'G' : 'P';
  const subLabel = isGunpla ? 'GUNPLA' : 'PLAMO';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background rounded squircle -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" stroke="${primary}" stroke-width="8" stroke-opacity="0.3"/>

  <!-- Subtle grid pattern -->
  <path d="M64 128h384M64 256h384M64 384h384M128 64v384M256 64v384M384 64v384" stroke="rgba(255,255,255,0.04)" stroke-width="2"/>

  <!-- Central Crest Symbol -->
  <circle cx="256" cy="236" r="148" fill="url(#brandGrad)" opacity="0.12" filter="url(#glow)"/>
  <circle cx="256" cy="236" r="140" fill="none" stroke="url(#brandGrad)" stroke-width="6" stroke-dasharray="16 8"/>

  <!-- Main Monogram Letter -->
  <text x="256" y="280" font-family="'Chakra Petch', 'Arial Black', sans-serif" font-size="160" font-weight="900" fill="#ffffff" text-anchor="middle" filter="url(#glow)">${initial}</text>

  <!-- Tech Accent Details -->
  <polygon points="256,76 270,96 242,96" fill="${accent}"/>
  <polygon points="256,396 270,376 242,376" fill="${accent}"/>

  <!-- Bottom Brand Ribbon -->
  <rect x="126" y="420" width="260" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="${accent}" stroke-width="2" stroke-opacity="0.4"/>
  <text x="256" y="444" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="4" fill="${accent}" text-anchor="middle">${subLabel}</text>
</svg>`;
}

export function generateServiceWorker(config: AppShellConfig): string {
  const tenantSlug = config.tenantSlug;
  const version = 'v1';

  return `/**
 * PlamoScale / GunplaJunkies Service Worker
 * Tenant: ${tenantSlug}
 * Version: ${version}
 */

const CACHE_NAME = 'gunpla-pwa-${tenantSlug}-${version}';
const DATA_CACHE_NAME = 'gunpla-pwa-data-${tenantSlug}-${version}';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static shell assets for ${tenantSlug}');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache partial error (ignored):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 1. WORKBENCH & CATALOG API DATA: Network-First with Cache Fallback
  // Allows modelers in hobby shops/conventions to check their Stash & Paint Rack offline
  if (
    url.pathname.startsWith('/api/v1/workbench') ||
    url.pathname.startsWith('/api/v1/catalog') ||
    url.pathname.startsWith('/api/v1/builders') ||
    url.pathname.startsWith('/api/v1/builds') ||
    url.pathname.startsWith('/api/v1/commissions/requests')
  ) {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // Offline fallback from local cache
          return caches.match(request).then((cachedRes) => {
            if (cachedRes) {
              return cachedRes;
            }
            return new Response(JSON.stringify({ items: [], offlineFallback: true }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // 2. STATIC ASSETS & HTML APP SHELL: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedRes) => {
      const fetchPromise = fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkRes;
        })
        .catch(() => cachedRes);

      return cachedRes || fetchPromise;
    })
  );
});
`;
}
