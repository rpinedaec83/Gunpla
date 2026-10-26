import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {
  renderAppShell,
  renderViews,
  getLandingNewsArticles
} from '../../packages/shared/dist/index.js';

test('Landing Page & Public Community Portada Unit Tests', async (t) => {
  const gunplaConfig = {
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
    apiUrl: 'http://localhost:8080',
    otherTenantUrl: 'http://localhost:3000',
    otherTenantName: 'PlamoScale',
    googleClientId: ''
  };

  const plamoConfig = {
    tenantSlug: 'plamoscale',
    tenantName: 'PlamoScale',
    tenantTagline: 'Scale Modeling Mastery',
    theme: {
      primaryColor: '#2563eb',
      accentColor: '#38bdf8',
      bgDark: '#0b0f19',
      cardBg: '#111827',
      borderColor: 'rgba(37, 99, 235, 0.15)'
    },
    apiUrl: 'http://localhost:8080',
    otherTenantUrl: 'http://localhost:3001',
    otherTenantName: 'Gunpla Collector',
    googleClientId: ''
  };

  const mockData = {
    builders: [
      { id: 'u1', username: 'aperich', displayName: 'Alonso Perich', isFounder: true, avatarUrl: '/avatars/1.jpg' },
      { id: 'u2', username: 'dcampos', displayName: 'Daniel Campos', isFounder: true, avatarUrl: '/avatars/2.jpg' }
    ],
    mediaAssets: [
      {
        id: 'm1',
        title: 'RG Hi-Nu Gundam Titanium Custom',
        builderUsername: 'aperich',
        thumbUrl: '/media/thumb-hinu.jpg',
        fullUrl: '/media/hinu.jpg',
        category: 'rg',
        altText: 'RG Hi-Nu custom'
      },
      {
        id: 'm2',
        title: 'Tiger I Early Production s.Pz.Abt.502',
        builderUsername: 'dcampos',
        thumbUrl: '/media/thumb-tiger.jpg',
        fullUrl: '/media/tiger.jpg',
        category: 'military',
        altText: 'Tiger I'
      }
    ],
    kits: [
      { id: 'k1', name: 'RG Hi-Nu Gundam', brand: 'Bandai', scale: '1/144', grade: 'RG', category: 'rg' }
    ],
    paints: [
      { id: 'p1', name: 'Titanium White', brand: 'Mr. Color', code: 'C-001', line: 'Lacquer', finish: 'gloss' }
    ],
    builds: [
      {
        id: 'b1',
        slug: 'rg-hinu-custom',
        title: 'RG Hi-Nu Custom',
        username: 'aperich',
        category: 'rg',
        status: 'completed',
        viewCount: 150,
        likeCount: 42,
        steps: []
      }
    ],
    contests: [
      { id: 'c1', title: 'Torneo Nacional Gunpla 2026', status: 'active', bannerUrl: '' }
    ],
    shops: [],
    listings: [],
    commissionBuilders: [],
    hallOfFame: [],
    groupBuilds: []
  };

  await t.test('1. getLandingNewsArticles resolves tenant-specific news curated content', () => {
    const gunplaNews = getLandingNewsArticles(true);
    assert.equal(gunplaNews.length, 4, 'Gunpla should have 4 curated news items');
    assert.ok(gunplaNews.some(n => n.title.includes('Bandai Spirits')), 'Should include Bandai Spirits news');
    assert.ok(gunplaNews.some(n => n.title.includes('Panel Lining')), 'Should include Panel Lining tutorial');
    assert.ok(gunplaNews.some(n => n.title.includes('GBWC')), 'Should include GBWC event news');
    assert.ok(gunplaNews.some(n => n.title.includes('Alicates Single-Blade')), 'Should include Nipper maintenance news');

    const plamoNews = getLandingNewsArticles(false);
    assert.equal(plamoNews.length, 4, 'PlamoScale should have 4 curated news items');
    assert.ok(plamoNews.some(n => n.title.includes('Tamiya 1/35 Panzer')), 'Should include Tamiya/Eduard news');
    assert.ok(plamoNews.some(n => n.title.includes('Masterclass de Envejecido')), 'Should include Weathering tutorial');
    assert.ok(plamoNews.some(n => n.title.includes('Imprimacion para Resina')), 'Should include Primer guide');
    assert.ok(plamoNews.some(n => n.title.includes('Dioramas de Aviacion')), 'Should include Diorama tutorial');
  });

  await t.test('2. renderAppShell renders complete Landing Page structure for Gunpla', () => {
    const html = renderAppShell(gunplaConfig, mockData);

    assert.ok(html.includes('id="view-landing" class="view-section active"'), 'Landing view must be active by default');
    assert.ok(html.includes('id="landing-hero"'), 'Hero section must be present');
    assert.ok(html.includes('El Santuario de Gunpla: Noticias, Vitrina y Taller Virtual'), 'Gunpla hero headline must match');
    assert.ok(html.includes('id="landing-news-section"'), 'News section must be present');
    assert.ok(html.includes('id="landing-gallery-section"'), 'Collector gallery section must be present');
    assert.ok(html.includes('id="landing-workshop-section"'), 'Workshop features section must be present');
    assert.ok(html.includes('btn-topbar-enter-workshop'), 'Enter workshop button in topbar must be present');
    assert.ok(html.includes('id="modal-landing-article"'), 'Article reader modal must be present');
    assert.ok(html.includes('Portada &amp; Noticias') || html.includes('Portada & Noticias'), 'Navigation must contain Portada');
  });

  await t.test('3. renderAppShell renders complete Landing Page structure for PlamoScale', () => {
    const html = renderAppShell(plamoConfig, mockData);

    assert.ok(html.includes('id="view-landing" class="view-section active"'), 'Landing view must be active by default');
    assert.ok(html.includes('PlamoScale: Noticias, Vitrina Comunitaria y Taller de Modelismo'), 'PlamoScale hero headline must match');
    assert.ok(html.includes('Nuevos Moldes 2026: Tamiya 1/35 Panzer'), 'PlamoScale news headline must be rendered');
    assert.ok(html.includes('btn-topbar-enter-workshop'), 'Enter workshop button must be present');
  });

  await t.test('4. Inline client-side JavaScript parses without syntax errors in Node VM', () => {
    const html = renderAppShell(gunplaConfig, mockData);
    const match = html.match(/<script>([\s\S]*?)<\/script>/);
    assert.ok(match, 'HTML must contain inline script');
    const scriptCode = match[1];

    assert.doesNotThrow(() => {
      new vm.Script(scriptCode, { filename: 'test-landing-inline.js' });
    }, 'Inline script must be syntactically valid');
  });

  await t.test('5. JavaScript helper functions for landing page exist in inline script', () => {
    const html = renderAppShell(gunplaConfig, mockData);
    assert.ok(html.includes('function enterWorkshop('), 'enterWorkshop must be defined');
    assert.ok(html.includes('function openCollectorShareModal('), 'openCollectorShareModal must be defined');
    assert.ok(html.includes('function openLandingArticle('), 'openLandingArticle must be defined');
    assert.ok(html.includes('function closeLandingArticleModal('), 'closeLandingArticleModal must be defined');
    assert.ok(html.includes('function filterLandingNews('), 'filterLandingNews must be defined');
  });
});
