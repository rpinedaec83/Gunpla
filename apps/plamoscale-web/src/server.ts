import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  renderAppShell,
  AppShellConfig,
  AppShellData,
  UserRecord,
  MediaAsset,
  KitRecord,
  PaintRecord,
  BuildProjectRecord,
  ContestRecord,
  ShopRecord,
  renderPrivacyPolicy,
  renderTermsOfService,
  renderInstitutionalSuspensionPage,
  generateManifest,
  generateServiceWorker,
  generateAppIconSvg,
  generateRobotsTxt,
  generateSitemapXml,
  OpenGraphMetadata
} from '@gunpla/shared';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const getApiUrl = () => process.env.API_URL || 'http://localhost:8080';
const OTHER_TENANT_URL = process.env.GUNPLAJUNKIES_WEB_URL || 'http://localhost:3001';
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || '';
const CANONICAL_DOMAIN = process.env.CANONICAL_DOMAIN || 'plamoscale.com';

app.use(cors());
app.use(express.json());

const config: AppShellConfig = {
  tenantSlug: 'plamoscale',
  tenantName: 'PlamoScale',
  tenantTagline: 'Comunidad & Ecosistema de Modelismo a Escala',
  theme: {
    primaryColor: '#2563eb',
    accentColor: '#38bdf8',
    bgDark: '#0b0f19',
    cardBg: '#111827',
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  apiUrl: PUBLIC_API_URL,
  otherTenantUrl: OTHER_TENANT_URL,
  otherTenantName: 'Gunpla Collector',
  googleClientId: process.env.GOOGLE_CLIENT_ID || ''
};

async function fetchTenantData(): Promise<AppShellData> {
  try {
    const headers = { 'X-Tenant-Slug': 'plamoscale' };
    const api = getApiUrl();

    const [buildersRes, buildsRes, kitsRes, paintsRes, contestsRes, shopsRes, listingsRes, commissionsRes, hofRes, groupBuildsRes] = await Promise.allSettled([
      fetch(`${api}/api/v1/builders`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/builds`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/catalog/kits`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/catalog/paints`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/contests`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/shops`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/marketplace/listings`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/commissions/builders`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/contests/hall-of-fame`, { headers }).then(r => r.json()),
      fetch(`${api}/api/v1/group-builds`, { headers }).then(r => r.json())
    ]);

    const buildersData: any = buildersRes.status === 'fulfilled' ? buildersRes.value : { items: [] };
    const buildsData: any = buildsRes.status === 'fulfilled' ? buildsRes.value : { items: [] };
    const kitsData: any = kitsRes.status === 'fulfilled' ? kitsRes.value : { items: [] };
    const paintsData: any = paintsRes.status === 'fulfilled' ? paintsRes.value : { items: [] };
    const contestsData: any = contestsRes.status === 'fulfilled' ? contestsRes.value : { items: [] };
    const shopsData: any = shopsRes.status === 'fulfilled' ? shopsRes.value : { items: [] };
    const listingsData: any = listingsRes.status === 'fulfilled' ? listingsRes.value : { items: [] };
    const commissionsData: any = commissionsRes.status === 'fulfilled' ? commissionsRes.value : { items: [] };
    const hofData: any = hofRes.status === 'fulfilled' ? hofRes.value : { items: [] };
    const groupBuildsData: any = groupBuildsRes.status === 'fulfilled' ? groupBuildsRes.value : { items: [] };

    // Flatten mediaAssets from all builders for the showcase gallery
    const builders: UserRecord[] = buildersData.items || [];
    const mediaAssets: MediaAsset[] = builders.flatMap((b: any) => (b.recentMedia || []).map((m: any) => ({
      ...m,
      builderUsername: b.username,
      thumbUrl: m.thumbUrl,
      fullUrl: m.fullUrl
    })));

    return {
      builders,
      mediaAssets,
      kits: kitsData.items || [],
      paints: paintsData.items || [],
      builds: buildsData.items || [],
      contests: contestsData.items || [],
      shops: shopsData.items || [],
      listings: listingsData.items || [],
      commissionBuilders: commissionsData.items || [],
      hallOfFame: hofData.items || [],
      groupBuilds: groupBuildsData.items || []
    };
  } catch (err) {
    console.error('[PlamoScale] Error fetching live API data:', err);
    return {
      builders: [],
      mediaAssets: [],
      kits: [],
      paints: [],
      builds: [],
      contests: [],
      shops: []
    };
  }
}

// Transparent Reverse Proxy for API & Media Assets
app.all(['/api/*', '/legacy-media/*', '/uploads/*'], async (req: Request, res: Response) => {
  try {
    const targetUrl = `${getApiUrl()}${req.originalUrl}`;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key !== 'host' && key.toLowerCase() !== 'content-length' && typeof value === 'string') {
        headers[key] = value;
      }
    }
    if (!headers['x-tenant-slug']) {
      headers['x-tenant-slug'] = config.tenantSlug;
    }

    const init: RequestInit = {
      method: req.method,
      headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
      init.body = JSON.stringify(req.body);
      if (!headers['content-type']) {
        headers['content-type'] = 'application/json';
      }
    }

    const upstreamRes = await fetch(targetUrl, init);
    res.status(upstreamRes.status);

    upstreamRes.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (!['transfer-encoding', 'content-encoding', 'content-length'].includes(lower)) {
        res.setHeader(key, val);
      }
    });

    if (upstreamRes.body) {
      const buffer = Buffer.from(await upstreamRes.arrayBuffer());
      res.setHeader('Content-Length', buffer.length.toString());
      res.send(buffer);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error(`[PlamoScale Proxy Error] ${req.method} ${req.originalUrl}:`, err);
    res.status(502).json({ error: 'Bad Gateway', message: err.message });
  }
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'plamoscale-web',
    tenant: 'plamoscale',
    apiUrl: getApiUrl(),
    timestamp: new Date().toISOString()
  });
});

// Legal Pages for Google OAuth Compliance
app.get('/privacy', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderPrivacyPolicy('PlamoScale', 'plamoscale.com', 'legal@plamoscale.com'));
});

app.get('/terms', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderTermsOfService('PlamoScale', 'plamoscale.com', 'legal@plamoscale.com'));
});

// ---------------------------------------------------------------------------
// SEO: Robots.txt and Sitemap.xml
// ---------------------------------------------------------------------------
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(generateRobotsTxt(CANONICAL_DOMAIN));
});

app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const data = await fetchTenantData();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateSitemapXml(CANONICAL_DOMAIN, data));
  } catch (err: any) {
    console.error('[PlamoScale Web] Error generating sitemap.xml:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(generateSitemapXml(CANONICAL_DOMAIN));
  }
});

// ---------------------------------------------------------------------------
// PWA & Offline Support: Manifest, Service Worker, and App Icons
// ---------------------------------------------------------------------------
app.get('/manifest.json', (_req: Request, res: Response) => {
  const currentConfig: AppShellConfig = { ...config, apiUrl: PUBLIC_API_URL };
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.json(generateManifest(currentConfig));
});

app.get('/sw.js', (_req: Request, res: Response) => {
  const currentConfig: AppShellConfig = { ...config, apiUrl: PUBLIC_API_URL };
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(generateServiceWorker(currentConfig));
});

app.get('/icons/:name', async (req: Request, res: Response) => {
  const currentConfig: AppShellConfig = { ...config, apiUrl: PUBLIC_API_URL };
  const { name } = req.params;
  const svg = generateAppIconSvg(currentConfig, 512);

  if (name.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(svg);
  }

  const size = name.includes('512') ? 512 : 192;

  let sharp: any = null;
  try {
    sharp = require('sharp');
  } catch {}

  if (sharp) {
    try {
      const pngBuffer = await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toBuffer();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(pngBuffer);
    } catch {}
  }

  // Fallback: send SVG
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(svg);
});

function resolveOpenGraphMetadata(req: Request, data: AppShellData, currentConfig: AppShellConfig): OpenGraphMetadata {
  const isGunpla = currentConfig.tenantSlug === 'gunplajunkies';
  const defaultDomain = isGunpla ? 'gunplajunkies.com' : 'plamoscale.com';
  const canonicalDomain = CANONICAL_DOMAIN || defaultDomain;
  const canonicalBase = `https://${canonicalDomain}`;

  const host = req.get('host') || defaultDomain;
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  const path = req.path;

  // 1. Private / Authenticated user routes (Marked with noindex and canonical to root)
  if (
    path.startsWith('/workbench') ||
    path.startsWith('/stash') ||
    path.startsWith('/admin') ||
    path.startsWith('/profile')
  ) {
    return {
      title: `${currentConfig.tenantName} — Banco de Trabajo`,
      description: currentConfig.tenantTagline,
      image: `${origin}/api/v1/og/default`,
      url: `${canonicalBase}/`,
      canonicalUrl: `${canonicalBase}/`,
      noIndex: true,
      type: 'website',
      siteName: currentConfig.tenantName
    };
  }

  // 2. Build log detail: /builds/:slug or /b/:slug
  if (path.startsWith('/builds/') || path.startsWith('/b/')) {
    const slug = path.replace(/^\/(builds|b)\//, '').split('/')[0].split('?')[0];
    const build = (data.builds || []).find((b: any) => b.slug === slug || b.id === slug);
    if (build) {
      const statusText = build.status === 'completed' ? 'Terminado' : 'En Progreso';
      const author = build.userDisplayName || build.username;
      const canonicalUrl = `${canonicalBase}/builds/${encodeURIComponent(slug)}`;
      return {
        title: `${build.title} por ${author} | ${currentConfig.tenantName}`,
        description: `${build.subtitle || 'Bitácora de montaje y pintura'}. Escala: ${build.scale || '-'} · Grado: ${build.grade || '-'} · Estado: ${statusText}.`,
        image: `${origin}/api/v1/og/builds/${encodeURIComponent(slug)}`,
        url: canonicalUrl,
        canonicalUrl,
        noIndex: false,
        type: 'article',
        siteName: currentConfig.tenantName
      };
    }
  }

  // 3. Contest podium or contest detail: /contests/:id/podium or /contests/:id
  if (path.startsWith('/contests/')) {
    const parts = path.split('/').filter(Boolean);
    const contestId = parts[1];
    const isPodium = parts[2] === 'podium';
    const contest = (data.contests || []).find((c: any) => c.id === contestId || c.slug === contestId);
    if (contest) {
      const canonicalUrl = isPodium
        ? `${canonicalBase}/contests/${encodeURIComponent(contest.id)}/podium`
        : `${canonicalBase}/contests/${encodeURIComponent(contest.id)}`;
      return {
        title: isPodium
          ? `Podio y Ganadores: ${contest.title} | ${currentConfig.tenantName}`
          : `${contest.title} | Concursos | ${currentConfig.tenantName}`,
        description: `Conoce las obras galardonadas con Oro, Plata y Bronce del certamen ${contest.title} en ${currentConfig.tenantName}.`,
        image: `${origin}/api/v1/og/contests/${encodeURIComponent(contest.id)}`,
        url: canonicalUrl,
        canonicalUrl,
        noIndex: false,
        type: 'website',
        siteName: currentConfig.tenantName
      };
    }
  }

  // 4. Hall of fame: /hall-of-fame
  if (path === '/hall-of-fame') {
    const canonicalUrl = `${canonicalBase}/hall-of-fame`;
    return {
      title: `Salón de la Fama y Galería de Honor | ${currentConfig.tenantName}`,
      description: 'Los mejores modelistas, obras maestras y medallas condecoradas con evaluación oficial de jurados y voto popular.',
      image: `${origin}/api/v1/og/hall-of-fame`,
      url: canonicalUrl,
      canonicalUrl,
      noIndex: false,
      type: 'website',
      siteName: currentConfig.tenantName
    };
  }

  // 5. Standard public sections (canonicalize cleanly without trailing slash)
  const publicSections = ['/builds', '/kits', '/paints', '/showcase', '/marketplace', '/contests', '/shops', '/builders', '/group-builds', '/commissions'];
  const matchedSection = publicSections.find(s => path === s || path === `${s}/`);
  if (matchedSection) {
    const canonicalUrl = `${canonicalBase}${matchedSection}`;
    return {
      title: `${currentConfig.tenantName} — ${currentConfig.tenantTagline}`,
      description: 'Comunidad y plataforma de modelismo a escala. Bitácoras de armado, catálogo de kits, muestrario de pinturas y banco de trabajo personal.',
      image: `${origin}/api/v1/og/default`,
      url: canonicalUrl,
      canonicalUrl,
      noIndex: false,
      type: 'website',
      siteName: currentConfig.tenantName
    };
  }

  // 6. Default homepage / fallback
  const isRoot = path === '/' || path === '';
  const canonicalUrl = `${canonicalBase}/`;
  return {
    title: `${currentConfig.tenantName} — ${currentConfig.tenantTagline}`,
    description: 'Comunidad y plataforma de modelismo a escala. Bitácoras de armado, catálogo de kits, muestrario de pinturas y banco de trabajo personal.',
    image: `${origin}/api/v1/og/default`,
    url: canonicalUrl,
    canonicalUrl,
    noIndex: false,
    type: 'website',
    siteName: currentConfig.tenantName
  };
}

async function fetchTenantProfile(): Promise<any> {
  try {
    const api = getApiUrl();
    const res = await fetch(`${api}/api/v1/tenants/plamoscale`, {
      headers: { 'X-Tenant-Slug': 'plamoscale' }
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[PlamoScale Web] Could not fetch tenant profile:', err);
  }
  return null;
}

// App Shell Main Entry Point
app.get('*', async (req: Request, res: Response) => {
  const tenantProfile = await fetchTenantProfile();
  if (tenantProfile && tenantProfile.status && tenantProfile.status !== 'active') {
    const saToken = req.query.sa_token || req.headers['x-super-admin-bypass'] || (req.headers.cookie && req.headers.cookie.includes('gunpla_sa_bypass=true'));
    if (!saToken) {
      const html = renderInstitutionalSuspensionPage(
        tenantProfile.name || config.tenantName,
        tenantProfile.primaryDomain || tenantProfile.domain || 'plamoscale.com',
        tenantProfile.status,
        tenantProfile.suspensionReason || 'Mantenimiento programado y actualización de la plataforma.',
        tenantProfile.contactEmail || 'contacto@plamoscale.com',
        OTHER_TENANT_URL,
        'Gunpla Collector'
      );
      res.status(503);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }
  }

  const data = await fetchTenantData();
  const currentConfig: AppShellConfig = {
    ...config,
    apiUrl: PUBLIC_API_URL
  };
  const og = resolveOpenGraphMetadata(req, data, currentConfig);
  const html = renderAppShell(currentConfig, data, og);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[PlamoScale Web] running on http://localhost:${PORT} (Connected to API: ${getApiUrl()})`);
  });
}

export { app };
