import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRobotsTxt,
  generateSitemapXml,
  renderAppShell,
  renderPrivacyPolicy,
  renderTermsOfService,
  renderInstitutionalSuspensionPage
} from '../../packages/shared/dist/index.js';

test('SEO Canonical Tags, Robots.txt & Sitemap.xml Unit Tests', async (t) => {
  const dummyConfig = {
    tenantSlug: 'plamoscale',
    tenantName: 'PlamoScale',
    tenantTagline: 'Comunidad & Ecosistema de Modelismo a Escala',
    theme: {
      primaryColor: '#0ea5e9',
      accentColor: '#f59e0b',
      bgDark: '#0f172a',
      cardBg: '#1e293b',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    apiUrl: 'http://localhost:8080',
    otherTenantUrl: 'http://localhost:3001',
    otherTenantName: 'Gunpla Collector'
  };

  const dummyData = {
    builders: [],
    mediaAssets: [],
    kits: [],
    paints: [],
    builds: [
      {
        id: 'build-1',
        slug: 'panzer-iv-kursk-1943',
        title: 'Panzer IV Ausf.H Kursk 1943',
        updatedAt: '2026-10-25T14:30:00.000Z',
        steps: []
      },
      {
        id: 'build-2',
        slug: 'rx-78-2-beyond-global',
        title: 'RX-78-2 Gundam Beyond Global',
        createdAt: '2026-10-24T10:00:00.000Z',
        steps: []
      }
    ],
    contests: [
      {
        id: 'gbwc-2026',
        title: 'Gunpla Builders World Cup 2026',
        description: 'Certamen mundial',
        status: 'open',
        participantsCount: 12,
        endDate: '2026-11-30T00:00:00.000Z',
        updatedAt: '2026-10-20T08:00:00.000Z'
      }
    ],
    shops: []
  };

  await t.test('generateRobotsTxt outputs valid directives and sitemap reference', () => {
    const robots = generateRobotsTxt('plamoscale.com');
    assert.ok(robots.includes('User-agent: *'), 'Must target all user agents');
    assert.ok(robots.includes('Allow: /'), 'Must allow root');
    assert.ok(robots.includes('Allow: /builds'), 'Must allow builds');
    assert.ok(robots.includes('Allow: /showcase'), 'Must allow showcase');
    assert.ok(robots.includes('Allow: /privacy'), 'Must allow privacy');
    assert.ok(robots.includes('Allow: /terms'), 'Must allow terms');
    assert.ok(robots.includes('Disallow: /api/'), 'Must disallow api');
    assert.ok(robots.includes('Disallow: /workbench'), 'Must disallow workbench SPA view');
    assert.ok(robots.includes('Disallow: /stash'), 'Must disallow stash SPA view');
    assert.ok(robots.includes('Disallow: /admin'), 'Must disallow admin SPA view');
    assert.ok(robots.includes('Disallow: /profile'), 'Must disallow profile SPA view');
    assert.ok(robots.includes('Sitemap: https://plamoscale.com/sitemap.xml'), 'Must reference sitemap');

    const gunplaRobots = generateRobotsTxt('https://gunplajunkies.com/');
    assert.ok(gunplaRobots.includes('Sitemap: https://gunplajunkies.com/sitemap.xml'), 'Must clean domain protocol and trailing slash');
  });

  await t.test('generateSitemapXml builds valid XML with static and dynamic entries', () => {
    const sitemap = generateSitemapXml('plamoscale.com', dummyData);
    assert.ok(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Must have XML declaration');
    assert.ok(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Must have urlset namespace');

    // Static URLs
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/</loc>'), 'Must include root homepage');
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/showcase</loc>'), 'Must include showcase');
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/builds</loc>'), 'Must include builds');
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/privacy</loc>'), 'Must include privacy');
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/terms</loc>'), 'Must include terms');

    // Dynamic Build URLs
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/builds/panzer-iv-kursk-1943</loc>'), 'Must include slugified build 1');
    assert.ok(sitemap.includes('<lastmod>2026-10-25</lastmod>'), 'Must extract date from updatedAt');
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/builds/rx-78-2-beyond-global</loc>'), 'Must include slugified build 2');

    // Dynamic Contest URLs
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/contests/gbwc-2026</loc>'), 'Must include contest detail');
    assert.ok(sitemap.includes('<loc>https://plamoscale.com/contests/gbwc-2026/podium</loc>'), 'Must include contest podium');
  });

  await t.test('renderAppShell includes canonical tag and index robots directive by default', () => {
    const html = renderAppShell(dummyConfig, dummyData);
    assert.ok(html.includes('<link rel="canonical" href="https://plamoscale.com/">'), 'Must have default canonical');
    assert.ok(html.includes('<meta name="robots" content="index, follow, max-image-preview:large">'), 'Must have default index directive');
  });

  await t.test('renderAppShell respects custom canonicalUrl and noIndex directive for private routes', () => {
    const ogPrivate = {
      title: 'PlamoScale — Workbench',
      description: 'Banco de trabajo',
      url: 'https://plamoscale.com/',
      canonicalUrl: 'https://plamoscale.com/',
      noIndex: true
    };
    const html = renderAppShell(dummyConfig, dummyData, ogPrivate);
    assert.ok(html.includes('<link rel="canonical" href="https://plamoscale.com/">'), 'Canonical points to root');
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), 'Must enforce noindex, nofollow on private routes');
  });

  await t.test('renderAppShell outputs exact canonical URL for build detail log', () => {
    const ogBuild = {
      title: 'Panzer IV Ausf.H Kursk 1943 | PlamoScale',
      description: 'Bitácora militar',
      url: 'https://plamoscale.com/builds/panzer-iv-kursk-1943',
      canonicalUrl: 'https://plamoscale.com/builds/panzer-iv-kursk-1943',
      noIndex: false
    };
    const html = renderAppShell(dummyConfig, dummyData, ogBuild);
    assert.ok(html.includes('<link rel="canonical" href="https://plamoscale.com/builds/panzer-iv-kursk-1943">'), 'Canonical points to build slug');
    assert.ok(html.includes('<meta name="robots" content="index, follow, max-image-preview:large">'), 'Build is indexable');
  });

  await t.test('renderPrivacyPolicy and renderTermsOfService include canonical and robots tags', () => {
    const privacy = renderPrivacyPolicy('PlamoScale', 'plamoscale.com', 'legal@plamoscale.com');
    assert.ok(privacy.includes('<link rel="canonical" href="https://plamoscale.com/privacy">'), 'Privacy must have canonical');
    assert.ok(privacy.includes('<meta name="robots" content="index, follow">'), 'Privacy must be indexable');

    const terms = renderTermsOfService('PlamoScale', 'plamoscale.com', 'legal@plamoscale.com');
    assert.ok(terms.includes('<link rel="canonical" href="https://plamoscale.com/terms">'), 'Terms must have canonical');
    assert.ok(terms.includes('<meta name="robots" content="index, follow">'), 'Terms must be indexable');
  });

  await t.test('renderInstitutionalSuspensionPage includes noindex robots tag', () => {
    const suspended = renderInstitutionalSuspensionPage(
      'PlamoScale',
      'plamoscale.com',
      'suspended',
      'Mantenimiento',
      'contacto@plamoscale.com',
      'http://localhost:3001',
      'Gunpla Collector'
    );
    assert.ok(suspended.includes('<meta name="robots" content="noindex, nofollow">'), 'Suspended page must not be indexed');
  });
});
