#!/usr/bin/env node
/**
 * Automated CLI Smoketest for DT1 (Vertical Slice 1):
 * Verifies:
 * 1. OpenAPI 3.1 contract (/openapi.json) and Swagger UI (/doc)
 * 2. Health endpoint (/api/v1/health) with 2 active tenants, 4 founding builders, and 92 seeded photos
 * 3. Multi-tenant resolution (X-Tenant-Slug: plamoscale vs gunplajunkies) and RFC 7807 Problem Details on unknown tenant
 * 4. Founding builders portfolio migration (aperich: 21 photos including #14 & #17-22, dcampos: 21, cluna: 6, fog1labs1: 44 = 92 photos)
 * 5. Dual Authentication:
 *    - Local Registration & Sign-In (Username/Email + Password)
 *    - Google SSO (OAuth 2.0 / OIDC) Sign-In & Automatic Account Linking by verified email
 *    - Cross-tenant SSO token usage across plamoscale.com and gunplajunkies.com
 * 6. Resend.com Multi-Domain Email Adapter:
 *    - Dispatches from PlamoScale <noreply@plamoscale.com> on plamoscale tenant
 *    - Dispatches from GunplaJunkies <noreply@gunplajunkies.com> on gunplajunkies tenant
 */

import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createApp } = require('../apps/api/dist/server.js');
const { seedPlatformDatabase } = require('../apps/api/dist/seed/seed-legacy.js');

async function runSmoketest() {
  console.log('--- Running DT1 Vertical Slice Smoketest ---');

  // Reset seed state for deterministic verification
  seedPlatformDatabase(true);

  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Verify OpenAPI 3.1 & Swagger UI (/doc)
    const oaRes = await fetch(`${baseUrl}/openapi.json`);
    assert.equal(oaRes.status, 200, 'GET /openapi.json must return 200');
    const oaJson = await oaRes.json();
    assert.equal(oaJson.openapi, '3.1.0', 'OpenAPI version must be 3.1.0');
    assert.ok(oaJson.paths['/api/v1/auth/google-sessions'], 'OpenAPI must document Google SSO endpoint');

    const docRes = await fetch(`${baseUrl}/doc/`);
    assert.equal(docRes.status, 200, 'GET /doc/ Swagger UI must return 200');
    console.log('[PASS] OpenAPI 3.1 (/openapi.json) & Swagger UI (/doc) verified.');

    // 2. Verify Health & Seed Counts
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.status, 'ok');
    assert.equal(health.tenantsCount, 2, 'Must have 2 active tenants (plamoscale & gunplajunkies)');
    assert.equal(health.foundingBuildersCount, 4, 'Must have 4 founding builders migrated');
    assert.equal(health.seededPhotosCount, 92, 'Must have all 92 founding builder photos migrated');
    console.log('[PASS] Health & Legacy Seed verified (2 tenants, 4 founding builders, 92 photos).');

    // 3. Verify Multi-Tenant Resolution & RFC 7807 Problem Details
    const psTenantRes = await fetch(`${baseUrl}/api/v1/tenants/current`, {
      headers: { 'X-Tenant-Slug': 'plamoscale' }
    });
    assert.equal(psTenantRes.status, 200);
    const psTenant = await psTenantRes.json();
    assert.equal(psTenant.domain, 'plamoscale.com');
    assert.equal(psTenant.emailFrom, 'PlamoScale <noreply@plamoscale.com>');

    const gjTenantRes = await fetch(`${baseUrl}/api/v1/tenants/current`, {
      headers: { 'X-Tenant-Slug': 'gunplajunkies' }
    });
    assert.equal(gjTenantRes.status, 200);
    const gjTenant = await gjTenantRes.json();
    assert.equal(gjTenant.domain, 'gunplajunkies.com');
    assert.equal(gjTenant.emailFrom, 'GunplaJunkies <noreply@gunplajunkies.com>');

    const badTenantRes = await fetch(`${baseUrl}/api/v1/tenants/current`, {
      headers: { 'X-Tenant-Slug': 'nonexistent-tenant' }
    });
    assert.equal(badTenantRes.status, 404);
    assert.match(badTenantRes.headers.get('content-type') || '', /application\/problem\+json/);
    console.log('[PASS] Multi-Tenant resolution & RFC 7807 Problem Details verified.');

    // 4. Verify Founding Builder Portfolios & Static Image Serving
    const aperichRes = await fetch(`${baseUrl}/api/v1/builders/aperich`, {
      headers: { 'X-Tenant-Slug': 'plamoscale' }
    });
    assert.equal(aperichRes.status, 200);
    const aperich = await aperichRes.json();
    assert.equal(aperich.photoCount, 21, 'Aldo Perich must have all 21 photos rescued');

    const imgCheckRes = await fetch(`${baseUrl}${aperich.photos[0].thumbUrl}`);
    assert.equal(imgCheckRes.status, 200, 'Migrated static image must be served with 200 OK');
    console.log('[PASS] Founding builders & static image serving verified (aperich=21, total=92).');

    // 5. Verify Dual Authentication: Local Username/Password + Google SSO + Automatic Account Linking
    const testEmail = 'amuro.ray@gunplajunkies.com';
    const signupRes = await fetch(`${baseUrl}/api/v1/auth/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'gunplajunkies'
      },
      body: JSON.stringify({
        username: 'amuroray',
        displayName: 'Amuro Ray',
        email: testEmail,
        password: 'Rx78-2-Password!'
      })
    });
    assert.equal(signupRes.status, 201, 'Local signup must return 201 Created');
    const signupData = await signupRes.json();
    assert.equal(signupData.authMethod, 'local');
    assert.ok(signupData.token);

    // Sign in with Username + Password on plamoscale tenant (Cross-Tenant SSO)
    const signinRes = await fetch(`${baseUrl}/api/v1/auth/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'plamoscale'
      },
      body: JSON.stringify({
        identifier: 'amuroray',
        password: 'Rx78-2-Password!'
      })
    });
    assert.equal(signinRes.status, 200, 'Local signin must return 200 OK');

    // Sign in with Google SSO using the SAME email -> Must automatically link Google account!
    const googleTokenPayload = JSON.stringify({
      sub: 'google-oauth2-1092837465',
      email: testEmail,
      email_verified: true,
      name: 'Amuro Ray (EFSF)'
    });
    const googleSsoRes = await fetch(`${baseUrl}/api/v1/auth/google-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'plamoscale'
      },
      body: JSON.stringify({
        idToken: `google-test-token:${googleTokenPayload}`
      })
    });
    assert.equal(googleSsoRes.status, 200, 'Google SSO login must return 200 OK');
    const googleSsoData = await googleSsoRes.json();
    assert.equal(googleSsoData.authMethod, 'google');
    assert.equal(googleSsoData.accountLinked, true, 'Google SSO must link to existing local account');
    assert.deepEqual(googleSsoData.user.authProviders, ['local', 'google']);

    // Verify /api/v1/auth/me with SSO token across tenants
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${googleSsoData.token}`,
        'X-Tenant-Slug': 'gunplajunkies'
      }
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.activeTenant, 'gunplajunkies');
    assert.equal(meData.user.username, 'amuroray');
    console.log('[PASS] Dual Auth (Username/Password + Google SSO + Automatic Account Linking) verified.');

    // 6. Verify Resend.com Multi-Domain Email Dispatch (plamoscale.com vs gunplajunkies.com)
    const contactPsRes = await fetch(`${baseUrl}/api/v1/notifications/contact-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'plamoscale'
      },
      body: JSON.stringify({
        name: 'Char Aznable',
        email: 'char@zeon.org',
        phone: '+51999888777',
        message: 'Quiero unir mi club al portal PlamoScale.'
      })
    });
    assert.equal(contactPsRes.status, 201);
    const contactPsData = await contactPsRes.json();
    assert.equal(contactPsData.emailRecord.from, 'PlamoScale <noreply@plamoscale.com>');

    const contactGjRes = await fetch(`${baseUrl}/api/v1/notifications/contact-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'gunplajunkies'
      },
      body: JSON.stringify({
        name: 'Setsuna F. Seiei',
        email: 'setsuna@celestialbeing.org',
        message: 'Subiendo mi Gunpla Exia MG.'
      })
    });
    assert.equal(contactGjRes.status, 201);
    const contactGjData = await contactGjRes.json();
    assert.equal(contactGjData.emailRecord.from, 'GunplaJunkies <noreply@gunplajunkies.com>');
    console.log('[PASS] Resend.com Multi-Domain Email Adapter verified for both plamoscale.com and gunplajunkies.com.');

    // 7. Verify DT2 Kit Master Catalog & Multi-Tenant Category Scoping
    // gunplajunkies: allowedCategories = ['gunpla-mecha', 'scifi', 'figures']
    const gjKitsRes = await fetch(`${baseUrl}/api/v1/catalog/kits`, {
      headers: { 'X-Tenant-Slug': 'gunplajunkies' }
    });
    assert.equal(gjKitsRes.status, 200);
    const gjKits = await gjKitsRes.json();
    assert.ok(gjKits.items.length >= 4, 'GunplaJunkies should list Gunpla/Mecha kits');
    assert.ok(
      gjKits.items.every((k) => ['gunpla-mecha', 'scifi', 'figures'].includes(k.category)),
      'GunplaJunkies must only return gunpla-mecha, scifi, or figures kits'
    );

    // plamoscale: allowedCategories = all scale modeling (military, aviation, automotive, naval, etc.)
    const psKitsRes = await fetch(`${baseUrl}/api/v1/catalog/kits`, {
      headers: { 'X-Tenant-Slug': 'plamoscale' }
    });
    assert.equal(psKitsRes.status, 200);
    const psKits = await psKitsRes.json();
    assert.ok(psKits.items.length >= 8, 'PlamoScale should list all kits including military, aviation, etc.');
    const categoriesFound = new Set(psKits.items.map((k) => k.category));
    assert.ok(categoriesFound.has('gunpla-mecha'));
    assert.ok(categoriesFound.has('military'));
    assert.ok(categoriesFound.has('aviation'));
    console.log(`[PASS] Kit Catalog & Multi-Tenant Category Filtering verified (${gjKits.items.length} kits on GunplaJunkies, ${psKits.items.length} kits on PlamoScale).`);

    // 8. Verify DT2 Paint & Supply Catalog Search
    const paintsRes = await fetch(`${baseUrl}/api/v1/catalog/paints?search=mr.+color`);
    assert.equal(paintsRes.status, 200);
    const mrColorPaints = await paintsRes.json();
    assert.ok(mrColorPaints.items.length >= 5, 'Should find Mr. Color lacquer paints');

    const tamiyaPaintsRes = await fetch(`${baseUrl}/api/v1/catalog/paints?brand=Tamiya`);
    assert.equal(tamiyaPaintsRes.status, 200);
    const tamiyaPaints = await tamiyaPaintsRes.json();
    assert.ok(tamiyaPaints.items.length >= 4, 'Should find Tamiya acrylic paints');
    assert.ok(tamiyaPaints.items.every((p) => p.brand === 'Tamiya'));
    console.log(`[PASS] Paint Catalog & Color Swatch Search verified (${mrColorPaints.items.length} Mr. Color, ${tamiyaPaints.items.length} Tamiya paints).`);

    // 9. Verify DT2 Scalemates Kit Importer with Deduplication & 4s Graceful Fallback
    const scalematesUrl = 'https://www.scalemates.com/kits/bandai-spirits-5061919-rg-1-144-hi-nu-gundam--1359732';
    const importDupRes = await fetch(`${baseUrl}/api/v1/catalog/kits/import-scalemates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scalematesUrl })
    });
    assert.equal(importDupRes.status, 200, 'Existing kit in catalog should return 200 OK (deduplicated)');
    const dupData = await importDupRes.json();
    assert.equal(dupData.isExisting, true);
    assert.equal(dupData.kit.name, 'RG 1/144 Hi-Nu Gundam');

    // Test importing a new kit from Scalemates URL (fallback or live parse within 4s)
    const newScalematesUrl = 'https://www.scalemates.com/kits/bandai-0185135-mg-1-100-sazabi-ver-ka--196884';
    const importNewRes = await fetch(`${baseUrl}/api/v1/catalog/kits/import-scalemates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scalematesUrl: newScalematesUrl })
    });
    assert.equal(importNewRes.status, 201, 'New kit from Scalemates URL should return 201 Created');
    const newData = await importNewRes.json();
    assert.equal(newData.imported, true);
    assert.equal(newData.isExisting, false);
    assert.equal(newData.kit.brand, 'Bandai');
    assert.equal(newData.kit.scale, '1/100');
    assert.ok(newData.kit.name.toLowerCase().includes('sazabi'));
    console.log(`[PASS] Scalemates Importer verified (Deduplication + Parsing for "${newData.kit.name}").`);

    // 10. Verify DT3 Workbench Personal Stash CRUD
    const addStashRes = await fetch(`${baseUrl}/api/v1/workbench/stash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        kitId: 'kit-rg-hinu',
        status: 'unbuilt',
        pricePaid: 55.0,
        currency: 'USD',
        notes: 'Comprado en Akihabara. Incluye calcas de agua.'
      })
    });
    assert.equal(addStashRes.status, 201, 'Should add kit to personal stash');
    const stashItem = await addStashRes.json();
    assert.equal(stashItem.kitId, 'kit-rg-hinu');
    assert.equal(stashItem.status, 'unbuilt');
    assert.equal(stashItem.kit.name, 'RG 1/144 Hi-Nu Gundam');

    // Update stash status to 'in_progress', then 'built'
    const updateStashRes = await fetch(`${baseUrl}/api/v1/workbench/stash/${stashItem.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        status: 'built',
        rating: 5,
        notes: 'Armado completado con panel line y acabado mate.'
      })
    });
    assert.equal(updateStashRes.status, 200);
    const updatedStash = await updateStashRes.json();
    assert.equal(updatedStash.status, 'built');
    assert.equal(updatedStash.rating, 5);
    assert.ok(updatedStash.completedAt);
    console.log('[PASS] Workbench Personal Stash CRUD (add, populate, update status to built) verified.');

    // 11. Verify DT3 Workbench Paint Rack CRUD
    const addPaintRes = await fetch(`${baseUrl}/api/v1/workbench/paints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        paintId: 'pnt-mc-c1',
        status: 'owned',
        quantity: 2,
        notes: 'Mr. Color White para armadura principal'
      })
    });
    assert.equal(addPaintRes.status, 201);
    const rackItem = await addPaintRes.json();
    assert.equal(rackItem.paintId, 'pnt-mc-c1');
    assert.equal(rackItem.quantity, 2);
    assert.equal(rackItem.paint.hexColor, '#FFFFFF');

    // Increment paint quantity (deduplication / rack aggregation)
    const incPaintRes = await fetch(`${baseUrl}/api/v1/workbench/paints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        paintId: 'pnt-mc-c1',
        quantity: 1
      })
    });
    assert.equal(incPaintRes.status, 200);
    const updatedRack = await incPaintRes.json();
    assert.equal(updatedRack.quantity, 3);
    console.log('[PASS] Workbench Paint Rack CRUD (add, swatch join, increment quantity) verified.');

    // 12. Verify Ownership Authorization (403 Forbidden for another user)
    // Register second builder 'quattro_bajeena'
    const regQuattroRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'gunplajunkies'
      },
      body: JSON.stringify({
        username: 'quattro',
        displayName: 'Quattro Bajeena',
        email: 'quattro@aeug.org',
        password: 'Hyaku-Shiki-Password!'
      })
    });
    assert.equal(regQuattroRes.status, 201);
    const quattroData = await regQuattroRes.json();

    // Quattro attempts to modify Amuro's stash item -> MUST return 403 Forbidden
    const forbiddenPatchRes = await fetch(`${baseUrl}/api/v1/workbench/stash/${stashItem.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${quattroData.token}`
      },
      body: JSON.stringify({ notes: 'Intento de modificar stash ajeno' })
    });
    assert.equal(forbiddenPatchRes.status, 403, 'Modifying another user stash must return 403 Forbidden');
    const forbiddenData = await forbiddenPatchRes.json();
    assert.equal(forbiddenData.status, 403);
    console.log('[PASS] Ownership Authorization verified (403 Forbidden for other users).');

    // 13. Verify Workbench Summary Metrics
    const summaryRes = await fetch(`${baseUrl}/api/v1/workbench/summary`, {
      headers: { Authorization: `Bearer ${googleSsoData.token}` }
    });
    assert.equal(summaryRes.status, 200);
    const summary = await summaryRes.json();
    assert.equal(summary.totalStash, 1);
    assert.equal(summary.builtCount, 1);
    assert.equal(summary.totalPaints, 1);
    assert.equal(summary.ownedPaintsCount, 1);
    console.log(`[PASS] Workbench Summary Metrics verified (Stash: ${summary.totalStash}, Paints: ${summary.totalPaints}).`);

    console.log('=== ALL DT1 + DT2 + DT3 SMOKETEST CHECKS PASSED ===');
  } finally {
    server.close();
  }
}

runSmoketest().catch((err) => {
  console.error('SMOKETEST FAILED:', err);
  process.exit(1);
});
