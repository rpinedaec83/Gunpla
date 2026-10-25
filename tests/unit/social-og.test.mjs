import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {
  generateSocialCardSvg,
  renderAppShell
} from '../../packages/shared/dist/index.js';

test('Social Sharing OpenGraph Preview Cards Unit Tests', async (t) => {
  await t.test('generateSocialCardSvg produces valid 1200x630 SVG with tenant branding', () => {
    const svg = generateSocialCardSvg({
      tenantName: 'PlamoScale',
      tenantSlug: 'plamoscale',
      title: 'Panzer IV Ausf.H Kursk 1943',
      subtitle: 'Maqueta militar a escala 1/35 con camuflaje invernal',
      authorDisplayName: 'Fernando Garaicoa',
      authorUsername: 'fog1labs1',
      metadataPills: ['1/35', 'Militar', 'Terminado'],
      stats: [
        { label: 'Pasos', value: '8' },
        { label: 'Likes', value: '24' }
      ]
    });

    assert.ok(svg.includes('viewBox="0 0 1200 630"'), 'Must have 1200x630 viewBox');
    assert.ok(svg.includes('PLAMOSCALE'), 'Must render tenant name in uppercase');
    assert.ok(svg.includes('Panzer IV Ausf.H Kursk 1943'), 'Must render build title');
    assert.ok(svg.includes('Fernando Garaicoa'), 'Must render author display name');
    assert.ok(svg.includes('@fog1labs1'), 'Must render author username');
    assert.ok(svg.includes('1/35'), 'Must render scale pill');
    assert.ok(svg.includes('plamoscale.com'), 'Must render canonical domain');
  });

  await t.test('generateSocialCardSvg splits long titles into two lines without clipping', () => {
    const longTitle = 'RG 1/144 Hi-Nu Gundam Titanium Finish & Custom Decals Masterpiece Edition';
    const svg = generateSocialCardSvg({
      tenantName: 'GunplaJunkies',
      tenantSlug: 'gunplajunkies',
      title: longTitle,
      authorDisplayName: 'Aldo Perich',
      authorUsername: 'aperich'
    });

    assert.ok(svg.includes('GUNPLA JUNKIES'), 'Must have GunplaJunkies branding');
    assert.ok(svg.includes('y="185"'), 'Line 1 y position');
    assert.ok(svg.includes('y="240"'), 'Line 2 y position');
    assert.ok(svg.includes('Aldo Perich'), 'Must render author name');
  });

  await t.test('generateSocialCardSvg renders contest podium mode with medals and scores', () => {
    const svg = generateSocialCardSvg({
      tenantName: 'PlamoScale',
      tenantSlug: 'plamoscale',
      title: 'Gunpla Open Cup Peru 2026',
      subtitle: 'Resultados del Podio Oficial y Voto Popular',
      podium: [
        { rankTitle: '1er Lugar - Medalla de Oro', medal: '🥇', entryTitle: 'Kshatriya Repaint', builderName: 'aperich', score: '38/40' },
        { rankTitle: '2do Lugar - Medalla de Plata', medal: '🥈', entryTitle: 'Tiger I Kursk', builderName: 'fog1labs1', score: '36/40' },
        { rankTitle: '3er Lugar - Medalla de Bronce', medal: '🥉', entryTitle: 'Spitfire Mk.IXc', builderName: 'dcampos', score: '34/40' }
      ]
    });

    assert.ok(svg.includes('Gunpla Open Cup Peru 2026'), 'Must render contest title');
    assert.ok(svg.includes('🥇'), 'Must render gold medal');
    assert.ok(svg.includes('🥈'), 'Must render silver medal');
    assert.ok(svg.includes('🥉'), 'Must render bronze medal');
    assert.ok(svg.includes('Kshatriya Repaint'), 'Must render 1st place entry');
    assert.ok(svg.includes('Tiger I Kursk'), 'Must render 2nd place entry');
    assert.ok(svg.includes('CERTIFICADO'), 'Must render certificate badge');
  });

  await t.test('generateSocialCardSvg safely escapes XML entities in user inputs', () => {
    const svg = generateSocialCardSvg({
      tenantName: 'PlamoScale',
      tenantSlug: 'plamoscale',
      title: 'Gundam "Custom" & <Weathered> Edition',
      subtitle: 'Notes with & and <tags>'
    });

    assert.ok(!svg.includes('<Weathered>'), 'Must escape angle brackets');
    assert.ok(svg.includes('&lt;Weathered&gt;'), 'Must have escaped entities');
    assert.ok(svg.includes('&quot;Custom&quot;'), 'Must have escaped quotes');
  });

  await t.test('sharp successfully converts generated SVG into 1200x630 PNG buffer', async () => {
    const svg = generateSocialCardSvg({
      tenantName: 'GunplaJunkies',
      tenantSlug: 'gunplajunkies',
      title: 'MG Eclipse Gundam Custom Paint',
      authorDisplayName: 'Daniel Campos',
      authorUsername: 'dcampos'
    });

    const pngBuffer = await sharp(Buffer.from(svg))
      .resize(1200, 630)
      .png()
      .toBuffer();

    assert.ok(Buffer.isBuffer(pngBuffer), 'Must produce a valid Buffer');
    assert.ok(pngBuffer.length > 5000, 'PNG buffer must have non-trivial size');

    const metadata = await sharp(pngBuffer).metadata();
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    assert.equal(metadata.format, 'png');
  });

  await t.test('renderAppShell injects OpenGraph and Twitter card meta tags into HTML', () => {
    const config = {
      tenantSlug: 'plamoscale',
      tenantName: 'PlamoScale',
      tenantTagline: 'Comunidad de Modelismo',
      theme: { primaryColor: '#2563eb', accentColor: '#38bdf8', bgDark: '#0b0f19', cardBg: '#111827', borderColor: '#333' },
      apiUrl: 'https://api.plamoscale.com',
      otherTenantUrl: 'https://gunplajunkies.com',
      otherTenantName: 'Gunpla Collector'
    };

    const mockData = {
      builders: [],
      mediaAssets: [],
      kits: [],
      paints: [],
      builds: [],
      contests: [],
      shops: []
    };

    const customOg = {
      title: 'MG Eclipse Gundam por Daniel Campos | PlamoScale',
      description: 'Bitácora detallada de pintado custom y técnicas de aerografía.',
      image: 'https://plamoscale.com/api/v1/og/builds/mg-eclipse-gundam',
      url: 'https://plamoscale.com/builds/mg-eclipse-gundam',
      type: 'article',
      siteName: 'PlamoScale'
    };

    const html = renderAppShell(config, mockData, customOg);

    assert.ok(html.includes('<meta property="og:title" content="MG Eclipse Gundam por Daniel Campos | PlamoScale">'));
    assert.ok(html.includes('<meta property="og:description" content="Bitácora detallada de pintado custom y técnicas de aerografía.">'));
    assert.ok(html.includes('<meta property="og:image" content="https://plamoscale.com/api/v1/og/builds/mg-eclipse-gundam">'));
    assert.ok(html.includes('<meta property="og:image:width" content="1200">'));
    assert.ok(html.includes('<meta property="og:image:height" content="630">'));
    assert.ok(html.includes('<meta property="og:type" content="article">'));
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
    assert.ok(html.includes('<meta name="twitter:title" content="MG Eclipse Gundam por Daniel Campos | PlamoScale">'));
    assert.ok(html.includes('<meta name="twitter:image" content="https://plamoscale.com/api/v1/og/builds/mg-eclipse-gundam">'));
  });

  await t.test('renderAppShell falls back to default tenant OpenGraph metadata when og param omitted', () => {
    const config = {
      tenantSlug: 'gunplajunkies',
      tenantName: 'GunplaJunkies',
      tenantTagline: 'Comunidad de Gunpla y Mecha',
      theme: { primaryColor: '#ef4444', accentColor: '#f97316', bgDark: '#0b0f19', cardBg: '#111827', borderColor: '#333' },
      apiUrl: 'https://api.plamoscale.com',
      otherTenantUrl: 'https://plamoscale.com',
      otherTenantName: 'PlamoScale'
    };

    const mockData = {
      builders: [],
      mediaAssets: [],
      kits: [],
      paints: [],
      builds: [],
      contests: [],
      shops: []
    };

    const html = renderAppShell(config, mockData);

    assert.ok(html.includes('<meta property="og:site_name" content="GunplaJunkies">'));
    assert.ok(html.includes('<meta property="og:title" content="GunplaJunkies — Comunidad de Gunpla y Mecha">'));
    assert.ok(html.includes('<meta property="og:image" content="/api/v1/og/default">'));
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
    assert.ok(html.includes('<meta name="twitter:site" content="@gunplajunkies">'));
  });
});
