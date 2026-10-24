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
  ShopRecord
} from '@gunpla/shared';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const API_URL = process.env.API_URL || 'http://localhost:8080';
const OTHER_TENANT_URL = process.env.PLAMOSCALE_WEB_URL || 'http://localhost:3000';
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || '';

app.use(cors());
app.use(express.json());

const config: AppShellConfig = {
  tenantSlug: 'gunplajunkies',
  tenantName: 'Gunpla Collector',
  tenantTagline: 'Build. Catalog. Showcase. El Santuario de tu Stash & Workbench',
  theme: {
    primaryColor: '#ef4444',
    accentColor: '#06b6d4',
    bgDark: '#080c14',
    cardBg: '#0e131f',
    borderColor: 'rgba(239, 68, 68, 0.15)'
  },
  apiUrl: PUBLIC_API_URL,
  otherTenantUrl: OTHER_TENANT_URL,
  otherTenantName: 'PlamoScale',
  googleClientId: process.env.GOOGLE_CLIENT_ID || ''
};

async function fetchTenantData(): Promise<AppShellData> {
  try {
    const headers = { 'X-Tenant-Slug': 'gunplajunkies' };

    const [buildersRes, buildsRes, kitsRes, paintsRes, contestsRes, shopsRes, listingsRes, commissionsRes] = await Promise.allSettled([
      fetch(`${API_URL}/api/v1/builders`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/api/v1/builds`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/api/v1/catalog/kits`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/api/v1/catalog/paints`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/api/v1/contests`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/api/v1/shops`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/api/v1/marketplace/listings`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/api/v1/commissions/builders`, { headers }).then(r => r.json())
    ]);

    const buildersData: any = buildersRes.status === 'fulfilled' ? buildersRes.value : { items: [] };
    const buildsData: any = buildsRes.status === 'fulfilled' ? buildsRes.value : { items: [] };
    const kitsData: any = kitsRes.status === 'fulfilled' ? kitsRes.value : { items: [] };
    const paintsData: any = paintsRes.status === 'fulfilled' ? paintsRes.value : { items: [] };
    const contestsData: any = contestsRes.status === 'fulfilled' ? contestsRes.value : { items: [] };
    const shopsData: any = shopsRes.status === 'fulfilled' ? shopsRes.value : { items: [] };
    const listingsData: any = listingsRes.status === 'fulfilled' ? listingsRes.value : { items: [] };
    const commissionsData: any = commissionsRes.status === 'fulfilled' ? commissionsRes.value : { items: [] };

    // Flatten mediaAssets from builders that have Gunpla/Mecha photos
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
      commissionBuilders: commissionsData.items || []
    };
  } catch (err) {
    console.error('[GunplaJunkies] Error fetching live API data:', err);
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
    const targetUrl = `${API_URL}${req.originalUrl}`;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key !== 'host' && typeof value === 'string') {
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
    console.error(`[GunplaJunkies Proxy Error] ${req.method} ${req.originalUrl}:`, err);
    res.status(502).json({ error: 'Bad Gateway', message: err.message });
  }
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'gunplajunkies-web',
    tenant: 'gunplajunkies',
    apiUrl: API_URL,
    timestamp: new Date().toISOString()
  });
});

// App Shell Main Entry Point
app.get('*', async (_req: Request, res: Response) => {
  const data = await fetchTenantData();
  const html = renderAppShell(config, data);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[GunplaJunkies Web] running on http://localhost:${PORT} (Connected to API: ${API_URL})`);
  });
}

export { app };
