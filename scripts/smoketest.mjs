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
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createApp } = require('../apps/api/dist/server.js');
const { seedPlatformDatabase } = require('../apps/api/dist/seed/seed-legacy.js');
const { app: plamoWebApp } = require('../apps/plamoscale-web/dist/server.js');
const { app: gunplaWebApp } = require('../apps/gunplajunkies-web/dist/server.js');

async function runSmoketest() {
  console.log('--- Running DT1 Vertical Slice Smoketest ---');

  // Reset seed state for deterministic verification
  seedPlatformDatabase(true);

  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  let plamoServer;
  let gunplaServer;

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

    // 14. DT4 - Multi-Tenant Build Feed Scoping (GunplaJunkies vs PlamoScale)
    console.log('\n--- Checking DT4: Multi-Tenant Build Feed Scoping ---');
    const gjBuildsRes = await fetch(`${baseUrl}/api/v1/builds`, {
      headers: { 'X-Tenant-Slug': 'gunplajunkies' }
    });
    assert.equal(gjBuildsRes.status, 200);
    const gjBuilds = await gjBuildsRes.json();
    assert.ok(gjBuilds.items.length > 0, 'GunplaJunkies should have seeded builds');
    assert.ok(
      gjBuilds.items.every((b) => ['gunpla-mecha', 'scifi', 'figures'].includes(b.category)),
      'GunplaJunkies builds must only contain Gunpla/Mecha, SciFi, or Figures'
    );

    const plamoBuildsRes = await fetch(`${baseUrl}/api/v1/builds`, {
      headers: { 'X-Tenant-Slug': 'plamoscale' }
    });
    assert.equal(plamoBuildsRes.status, 200);
    const plamoBuilds = await plamoBuildsRes.json();
    assert.ok(plamoBuilds.items.length >= gjBuilds.items.length, 'PlamoScale includes all scale modeling categories');
    const hasMilitary = plamoBuilds.items.some((b) => b.category === 'military');
    assert.ok(hasMilitary, 'PlamoScale feed should include military builds');
    console.log(`[PASS] Tenant build scoping verified (GunplaJunkies: ${gjBuilds.items.length}, PlamoScale: ${plamoBuilds.items.length}).`);

    // 15. DT4 - Create Build Project, Step with Paint Recipes, Like & Comment
    console.log('\n--- Checking DT4: Build Project Lifecycle, Steps & Paint Recipes ---');
    const createBuildRes = await fetch(`${baseUrl}/api/v1/builds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`,
        'X-Tenant-Slug': 'gunplajunkies'
      },
      body: JSON.stringify({
        title: 'MG Eclipse Gundam Custom Paint',
        category: 'gunpla-mecha',
        scale: '1/100',
        grade: 'Master Grade (MG)',
        status: 'in_progress',
        tags: ['custom', 'airbrush', 'metallics']
      })
    });
    assert.equal(createBuildRes.status, 201);
    const newBuild = await createBuildRes.json();
    assert.ok(newBuild.id);
    assert.equal(newBuild.slug, 'mg-eclipse-gundam-custom-paint');

    // Add Step with Paint Recipe
    const addStepRes = await fetch(`${baseUrl}/api/v1/builds/${newBuild.id}/steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        stage: 'assembly_inner_frame',
        title: 'Inner Frame Priming and Metallic Shading',
        description: 'Applied Mr. Surfacer 1500 black followed by Steel and Gun Metal.',
        paintUsages: [
          { paintId: 'paint-mrhobby-c28', role: 'inner-frame' },
          { paintId: 'paint-tamiya-x10', role: 'hydraulics' }
        ]
      })
    });
    assert.equal(addStepRes.status, 201);
    const stepData = await addStepRes.json();
    assert.equal(stepData.stage, 'assembly_inner_frame');
    assert.equal(stepData.paintUsages.length, 2);

    // Toggle Like
    const likeRes = await fetch(`${baseUrl}/api/v1/builds/${newBuild.id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${googleSsoData.token}` }
    });
    assert.equal(likeRes.status, 200);
    const likeData = await likeRes.json();
    assert.equal(likeData.liked, true);
    assert.equal(likeData.likeCount, 1);

    // Add Comment
    const commentRes = await fetch(`${baseUrl}/api/v1/builds/${newBuild.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        comment: 'Excelente combinación de colores en el inner frame!'
      })
    });
    assert.equal(commentRes.status, 201);
    const commentData = await commentRes.json();
    assert.ok(commentData.id);
    assert.equal(commentData.comment, 'Excelente combinación de colores en el inner frame!');

    // Fetch Details
    const detailRes = await fetch(`${baseUrl}/api/v1/builds/${newBuild.slug}`);
    assert.equal(detailRes.status, 200);
    const detailedBuild = await detailRes.json();
    assert.equal(detailedBuild.steps.length, 1);
    assert.equal(detailedBuild.likeCount, 1);
    assert.equal(detailedBuild.comments.length, 1);
    console.log(`[PASS] Build project lifecycle verified (Slug: ${detailedBuild.slug}, Steps: 1, Likes: 1, Comments: 1).`);

    // 16. DT4 - Media Upload Pipeline & 15MB Size Guardrail
    console.log('\n--- Checking DT4: Media Upload Pipeline & 15MB File Size Cap ---');
    // Valid small 1x1 transparent PNG upload
    const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await fetch(`${baseUrl}/api/v1/media/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        fileName: 'inner-frame-wip.png',
        dataBase64: samplePngBase64,
        category: 'gunpla-mecha',
        title: 'WIP Inner Frame Foto',
        buildId: newBuild.id
      })
    });
    assert.equal(uploadRes.status, 201);
    const uploadData = await uploadRes.json();
    assert.ok(uploadData.thumbUrl.startsWith('/uploads/'));
    assert.ok(uploadData.fullUrl.startsWith('/uploads/'));

    // Verify static serving of uploaded image
    const staticServeRes = await fetch(`${baseUrl}${uploadData.fullUrl}`);
    assert.equal(staticServeRes.status, 200);
    assert.equal(staticServeRes.headers.get('content-type'), 'image/png');

    // Test rejection of payload exceeding 15MB
    const oversizedBase64 = 'data:image/png;base64,' + 'A'.repeat(21 * 1024 * 1024);
    const oversizedRes = await fetch(`${baseUrl}/api/v1/media/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        fileName: 'huge.png',
        dataBase64: oversizedBase64
      })
    });
    assert.equal(oversizedRes.status, 413);
    const oversizedErr = await oversizedRes.json();
    assert.equal(oversizedErr.status, 413);
    console.log('[PASS] Media Upload Pipeline & 15MB Size Cap verified.');

    // 17. DT5 - Community Endpoints (Contests & Trusted Shops Directory)
    console.log('\n--- Checking DT5: Community Endpoints (Contests & Trusted Shops) ---');
    const contestsRes = await fetch(`${baseUrl}/api/v1/contests`, {
      headers: { 'X-Tenant-Slug': 'gunplajunkies' }
    });
    assert.equal(contestsRes.status, 200);
    const contestsData = await contestsRes.json();
    assert.ok(contestsData.items.length > 0, 'GunplaJunkies should have active contests');
    assert.ok(contestsData.items.some((c) => c.slug === 'gunpla-open-cup-2026'));

    const shopsRes = await fetch(`${baseUrl}/api/v1/shops`);
    assert.equal(shopsRes.status, 200);
    const shopsData = await shopsRes.json();
    assert.ok(shopsData.items.length >= 3, 'Should have verified shops from bio.txt');
    assert.ok(shopsData.items.some((s) => s.isVerified && s.catalogUrl));
    console.log(`[PASS] Community endpoints verified (Contests: ${contestsData.items.length}, Shops: ${shopsData.items.length}).`);

    // 18. DT5 - PlamoScale Web Frontend (UXP-01 Modern App Shell)
    console.log('\n--- Checking DT5: PlamoScale Web Frontend (UXP-01 Shell) ---');
    process.env.API_URL = baseUrl;
    plamoServer = http.createServer(plamoWebApp);
    await new Promise((resolve) => plamoServer.listen(0, '127.0.0.1', resolve));
    const plamoPort = plamoServer.address().port;
    const plamoUrl = `http://127.0.0.1:${plamoPort}`;

    const plamoHealthRes = await fetch(`${plamoUrl}/health`);
    assert.equal(plamoHealthRes.status, 200);
    const plamoHealth = await plamoHealthRes.json();
    assert.equal(plamoHealth.tenant, 'plamoscale');

    const plamoPageRes = await fetch(`${plamoUrl}/`);
    assert.equal(plamoPageRes.status, 200);
    const plamoHtml = await plamoPageRes.text();
    assert.ok(plamoHtml.includes('PlamoScale'), 'Should contain PlamoScale brand');
    assert.ok(plamoHtml.includes('Galería Showcase'), 'Should contain persistent sidebar Showcase');
    assert.ok(plamoHtml.includes('Catálogo de Kits'), 'Should contain persistent sidebar Kit Catalog');
    assert.ok(plamoHtml.includes('Pinturas & Suministros'), 'Should contain persistent sidebar Paint Rack');
    assert.ok(plamoHtml.includes('Banco de Trabajo & Stash'), 'Should contain Workbench section');
    assert.ok(plamoHtml.includes('Modelistas Fundadores'), 'Should contain Founders section');
    assert.ok(plamoHtml.includes('Tiendas de Confianza'), 'Should contain Trusted Shops directory');
    assert.ok(plamoHtml.includes('Ir a <strong>Gunpla Collector</strong>'), 'Should contain Portal Switcher to Gunpla Collector');
    console.log('[PASS] PlamoScale Web Frontend (UXP-01 Shell) verified successfully.');

    // 19. DT5 - GunplaJunkies Web Frontend (UXP-01 Shell)
    console.log('\n--- Checking DT5: GunplaJunkies Web Frontend (UXP-01 Shell) ---');
    gunplaServer = http.createServer(gunplaWebApp);
    await new Promise((resolve) => gunplaServer.listen(0, '127.0.0.1', resolve));
    const gunplaPort = gunplaServer.address().port;
    const gunplaUrl = `http://127.0.0.1:${gunplaPort}`;

    const gunplaHealthRes = await fetch(`${gunplaUrl}/health`);
    assert.equal(gunplaHealthRes.status, 200);
    const gunplaHealth = await gunplaHealthRes.json();
    assert.equal(gunplaHealth.tenant, 'gunplajunkies');

    const gunplaPageRes = await fetch(`${gunplaUrl}/`);
    assert.equal(gunplaPageRes.status, 200);
    const gunplaHtml = await gunplaPageRes.text();
    assert.ok(gunplaHtml.includes('Gunpla Collector'), 'Should contain Gunpla Collector brand');
    assert.ok(gunplaHtml.includes('Todos los Grados'), 'Should contain Gunpla grade taxonomy');
    assert.ok(gunplaHtml.includes('High Grade (HG)'), 'Should contain HG pill');
    assert.ok(gunplaHtml.includes('Master Grade (MG)'), 'Should contain MG pill');
    assert.ok(gunplaHtml.includes('Ir a <strong>PlamoScale</strong>'), 'Should contain Portal Switcher to PlamoScale');
    console.log('[PASS] GunplaJunkies Web Frontend (UXP-01 Shell) verified successfully.');

    // 20. DT6 - Contest Entry Submission & Duplicate Prevention
    console.log('\n--- Checking DT6: Contest Entry Submission ---');
    const submitEntryRes = await fetch(`${baseUrl}/api/v1/contests/contest-gunpla-cup-2026/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        buildId: newBuild.id
      })
    });
    assert.equal(submitEntryRes.status, 201);
    const entryData = await submitEntryRes.json();
    assert.ok(entryData.id);
    assert.equal(entryData.buildId, newBuild.id);
    assert.equal(entryData.title, newBuild.title);

    // Verify duplicate submission prevention (409 Conflict)
    const duplicateRes = await fetch(`${baseUrl}/api/v1/contests/contest-gunpla-cup-2026/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        buildId: newBuild.id
      })
    });
    assert.equal(duplicateRes.status, 409);
    console.log('[PASS] Contest entry submission & duplicate protection (409 Conflict) verified.');

    // 21. DT6 - Community Voting on Contest Entries
    console.log('\n--- Checking DT6: Community Voting System ---');
    const voteRes = await fetch(`${baseUrl}/api/v1/contests/contest-gunpla-cup-2026/entries/${entryData.id}/vote`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${googleSsoData.token}`
      }
    });
    assert.equal(voteRes.status, 200);
    const voteData = await voteRes.json();
    assert.equal(voteData.voted, true);
    assert.equal(voteData.voteCount, 1);

    // Toggle vote off
    const unvoteRes = await fetch(`${baseUrl}/api/v1/contests/contest-gunpla-cup-2026/entries/${entryData.id}/vote`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${googleSsoData.token}`
      }
    });
    assert.equal(unvoteRes.status, 200);
    const unvoteData = await unvoteRes.json();
    assert.equal(unvoteData.voted, false);
    assert.equal(unvoteData.voteCount, 0);

    // Vote back on to keep entry active on leaderboard
    await fetch(`${baseUrl}/api/v1/contests/contest-gunpla-cup-2026/entries/${entryData.id}/vote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${googleSsoData.token}` }
    });

    // Verify contest detail leaderboard
    const contestDetailRes = await fetch(`${baseUrl}/api/v1/contests/gunpla-open-cup-2026`);
    assert.equal(contestDetailRes.status, 200);
    const detailedContest = await contestDetailRes.json();
    assert.ok(detailedContest.entries.some((e) => e.id === entryData.id));
    console.log(`[PASS] Community voting verified (Contest: ${detailedContest.title}, Entries: ${detailedContest.entries.length}).`);

    // 22. DT7 - Stash Marketplace (Publish from Stash, Scoping, Ownership Protection)
    console.log('\n--- Checking DT7: Stash Marketplace Listings & Stash Integration ---');
    const createListingRes = await fetch(`${baseUrl}/api/v1/marketplace/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        stashItemId: stashItem.id,
        kitId: stashItem.kitId,
        type: 'both',
        price: 280,
        currency: 'PEN',
        boxCondition: 'mint_sealed',
        notes: 'Kit en caja sellada sin abrir, disponible para venta o intercambio.',
        contactWhatsapp: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
        contactLocation: 'Lima (Miraflores)'
      })
    });
    assert.equal(createListingRes.status, 201);
    const listingData = await createListingRes.json();
    assert.ok(listingData.id);
    assert.equal(listingData.stashItemId, stashItem.id);
    assert.equal(listingData.price, 280);
    assert.equal(listingData.type, 'both');
    assert.equal(listingData.boxCondition, 'mint_sealed');

    // Verify stash item status was automatically updated to 'for_trade'
    const verifyStashRes = await fetch(`${baseUrl}/api/v1/workbench/stash`, {
      headers: { Authorization: `Bearer ${googleSsoData.token}` }
    });
    assert.equal(verifyStashRes.status, 200);
    const userStashList = await verifyStashRes.json();
    const updatedStashItem = userStashList.items.find((s) => s.id === stashItem.id);
    assert.ok(updatedStashItem);
    assert.equal(updatedStashItem.status, 'for_trade', 'Stash item status must transition to for_trade');

    // Verify unauthorized deletion attempt by quattro returns 403 Forbidden
    const unauthDelRes = await fetch(`${baseUrl}/api/v1/marketplace/listings/${listingData.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${quattroData.token}` }
    });
    assert.equal(unauthDelRes.status, 403, 'Deleting another user listing must return 403 Forbidden');

    // Verify tenant-scoped marketplace listing retrieval
    const gjListingsRes = await fetch(`${baseUrl}/api/v1/marketplace/listings`, {
      headers: { 'X-Tenant-Slug': 'gunplajunkies' }
    });
    assert.equal(gjListingsRes.status, 200);
    const gjListings = await gjListingsRes.json();
    assert.ok(
      gjListings.items.every((l) => ['gunpla-mecha', 'scifi', 'figures'].includes(l.category)),
      'GunplaJunkies marketplace must only show mecha/scifi/figures kits'
    );

    const plamoListingsRes = await fetch(`${baseUrl}/api/v1/marketplace/listings`, {
      headers: { 'X-Tenant-Slug': 'plamoscale' }
    });
    assert.equal(plamoListingsRes.status, 200);
    const plamoListings = await plamoListingsRes.json();
    assert.ok(plamoListings.items.some((l) => l.category === 'military'), 'PlamoScale marketplace must include military kits');
    console.log(`[PASS] Marketplace listing created from stash, auto-status update, 403 ownership & tenant scoping verified.`);

    // 23. DT7 - Custom Commissions Directory & Web UI Sections
    console.log('\n--- Checking DT7: Custom Commissions Directory & Web Shell Sections ---');
    const buildersRes = await fetch(`${baseUrl}/api/v1/commissions/builders`);
    assert.equal(buildersRes.status, 200);
    const buildersData = await buildersRes.json();
    assert.ok(buildersData.items.length >= 3, 'Must have at least 3 featured commission builders');
    const builderUsernames = buildersData.items.map((b) => b.username);
    assert.ok(builderUsernames.includes('aperich'), 'aperich must be in commission builders');
    assert.ok(builderUsernames.includes('fog1labs1'), 'fog1labs1 must be in commission builders');
    assert.ok(builderUsernames.includes('dcampos'), 'dcampos must be in commission builders');

    // Verify Web Frontends contain the new sections in their rendered HTML
    const plamoMarketRes = await fetch(`${plamoUrl}/`);
    const plamoMarketHtml = await plamoMarketRes.text();
    assert.ok(plamoMarketHtml.includes('Bazar & Venta de Kits'), 'PlamoScale frontend must contain Bazar in navigation');
    assert.ok(plamoMarketHtml.includes('Comisiones de Pintura'), 'PlamoScale frontend must contain Commissions in navigation');
    assert.ok(plamoMarketHtml.includes('view-marketplace'), 'PlamoScale frontend must render marketplace section');
    assert.ok(plamoMarketHtml.includes('view-commissions'), 'PlamoScale frontend must render commissions section');

    const gunplaMarketRes = await fetch(`${gunplaUrl}/`);
    const gunplaMarketHtml = await gunplaMarketRes.text();
    assert.ok(gunplaMarketHtml.includes('Bazar & Venta de Kits'), 'GunplaJunkies frontend must contain Bazar in navigation');
    assert.ok(gunplaMarketHtml.includes('Comisiones de Pintura'), 'GunplaJunkies frontend must contain Commissions in navigation');
    assert.ok(gunplaMarketHtml.includes('view-marketplace'), 'GunplaJunkies frontend must render marketplace section');
    assert.ok(gunplaMarketHtml.includes('view-commissions'), 'GunplaJunkies frontend must render commissions section');
    console.log(`[PASS] Commission builders directory (${buildersData.items.length} builders) and Web Frontends UI integration verified.`);

    // 24. DT8 - PostgreSQL 16 Hybrid Persistence & Relational Diagnostics
    console.log('\n--- Checking DT8: PostgreSQL 16 Persistence & Diagnostic Endpoint ---');
    const dbStatsRes = await fetch(`${baseUrl}/api/v1/system/database`);
    assert.equal(dbStatsRes.status, 200);
    const dbStats = await dbStatsRes.json();
    assert.equal(dbStats.engine, 'PostgreSQL 16');
    assert.ok(
      ['standalone-memory-json', 'relational-postgres', 'postgres-offline-fallback'].includes(dbStats.mode),
      `Invalid DB mode: ${dbStats.mode}`
    );
    console.log(`[PASS] PostgreSQL persistence status endpoint verified (Engine: ${dbStats.engine}, Mode: ${dbStats.mode}).`);

    // 25. DT9 - Google OAuth SSO & Interactive Auth Modal on Web Frontends
    console.log('\n--- Checking DT9: Google OAuth SSO Integration & Web Auth Modals ---');
    const plamoAuthHtml = await (await fetch(`${plamoUrl}/`)).text();
    assert.ok(plamoAuthHtml.includes('accounts.google.com/gsi/client'), 'PlamoScale must include Google Identity Services script');
    assert.ok(plamoAuthHtml.includes('auth-user-container'), 'PlamoScale must render auth user container');
    assert.ok(plamoAuthHtml.includes('auth-modal'), 'PlamoScale must render auth modal');
    assert.ok(plamoAuthHtml.includes('g_id_signin'), 'PlamoScale must render Google sign-in container');
    assert.ok(plamoAuthHtml.includes('quickLoginFounder'), 'PlamoScale must support 1-click founder test login');

    const gunplaAuthHtml = await (await fetch(`${gunplaUrl}/`)).text();
    assert.ok(gunplaAuthHtml.includes('accounts.google.com/gsi/client'), 'GunplaJunkies must include Google Identity Services script');
    assert.ok(gunplaAuthHtml.includes('auth-user-container'), 'GunplaJunkies must render auth user container');
    assert.ok(gunplaAuthHtml.includes('auth-modal'), 'GunplaJunkies must render auth modal');
    assert.ok(gunplaAuthHtml.includes('g_id_signin'), 'GunplaJunkies must render Google sign-in container');

    // Verify inline scripts parse without syntax errors
    const plamoScript = plamoAuthHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
    new vm.Script(plamoScript, { filename: 'plamo-inline.js' });
    const gunplaScript = gunplaAuthHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
    new vm.Script(gunplaScript, { filename: 'gunpla-inline.js' });

    // Verify transparent proxy: POST /api/v1/auth/google-sessions via plamoUrl
    const demoPayload = {
      sub: 'google-pilot-user-proxy-test',
      email: 'pilot.proxy@plamoscale.com',
      name: 'Pilot Proxy Builder',
      email_verified: true
    };
    const demoToken = 'google-test-token:' + Buffer.from(JSON.stringify(demoPayload)).toString('base64');
    const proxyAuthRes = await fetch(`${plamoUrl}/api/v1/auth/google-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: demoToken })
    });
    assert.equal(proxyAuthRes.status, 200, 'Frontend proxy must forward /api/v1/auth/google-sessions to central API');
    const proxyAuthData = await proxyAuthRes.json();
    assert.ok(proxyAuthData.token, 'Proxy response must contain token');
    assert.equal(proxyAuthData.user.email, 'pilot.proxy@plamoscale.com');

    // Verify media asset proxy returns 200
    const mediaProxyRes = await fetch(`${plamoUrl}/legacy-media/plamoscale/images/aperich/fulls/1.JPG`);
    assert.equal(mediaProxyRes.status, 200, 'Frontend proxy must stream /legacy-media/* without redirecting');
    assert.equal(mediaProxyRes.headers.get('content-type'), 'image/jpeg');

    console.log('[PASS] Google OAuth 2.0 / OIDC Identity Services, Auth Modal & Transparent API/Media Reverse Proxy verified.');

    console.log('=== ALL DT1 + DT2 + DT3 + DT4 + DT5 + DT6 + DT7 + DT8 + DT9 SMOKETEST CHECKS PASSED ===');
  } finally {
    if (plamoServer) plamoServer.close();
    if (gunplaServer) gunplaServer.close();
    server.close();
  }
}

runSmoketest().catch((err) => {
  console.error('SMOKETEST FAILED:', err);
  process.exit(1);
});
