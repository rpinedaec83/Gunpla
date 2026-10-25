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

    // Test Builder Profile Editor (PATCH /api/v1/auth/me)
    const updateProfileRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        displayName: 'Amuro Ray - White Devil Custom',
        bio: 'Modelista experto en la Federación Terrestre. Armado Gunpla RG/MG y pintura personalizada.',
        avatarUrl: 'https://media.gunplajunkies.com/uploads/general/avatar-amuro.jpg',
        specialties: ['Gunpla RG', 'Master Grade', 'Aerografía Laca'],
        whatsapp: '+51 987 654 321',
        socialLinks: ['https://instagram.com/amuro_gunpla']
      })
    });
    assert.equal(updateProfileRes.status, 200);
    const updatedProfileData = await updateProfileRes.json();
    assert.equal(updatedProfileData.user.displayName, 'Amuro Ray - White Devil Custom');
    assert.equal(updatedProfileData.user.bio, 'Modelista experto en la Federación Terrestre. Armado Gunpla RG/MG y pintura personalizada.');
    assert.equal(updatedProfileData.user.avatarUrl, 'https://media.gunplajunkies.com/uploads/general/avatar-amuro.jpg');
    assert.deepEqual(updatedProfileData.user.specialties, ['Gunpla RG', 'Master Grade', 'Aerografía Laca']);
    assert.equal(updatedProfileData.user.whatsapp, '+51 987 654 321');

    // Verify GET /api/v1/builders/amuroray reflects the updated profile
    const builderGetRes = await fetch(`${baseUrl}/api/v1/builders/amuroray`, {
      headers: { 'X-Tenant-Slug': 'gunplajunkies' }
    });
    assert.equal(builderGetRes.status, 200);
    const builderGetData = await builderGetRes.json();
    assert.equal(builderGetData.displayName, 'Amuro Ray - White Devil Custom');
    assert.equal(builderGetData.avatarUrl, 'https://media.gunplajunkies.com/uploads/general/avatar-amuro.jpg');
    assert.deepEqual(builderGetData.specialties, ['Gunpla RG', 'Master Grade', 'Aerografía Laca']);

    // Validation: empty display name should return 400
    const invalidProfileRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({ displayName: '' })
    });
    assert.equal(invalidProfileRes.status, 400);
    console.log('[PASS] Dual Auth & Builder Profile Editor (PATCH /api/v1/auth/me & Validation) verified.');

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

    // 16. DT4 - Media Upload Pipeline (Sharp WebP Optimization, Cloudflare R2 / Local Disk & 15MB Size Guardrail)
    console.log('\n--- Checking DT4: Media Upload Pipeline & Storage Diagnostics ---');
    // Storage diagnostics endpoint check
    const diagRes = await fetch(`${baseUrl}/api/v1/media/storage-diagnostics`);
    assert.equal(diagRes.status, 200, 'GET /api/v1/media/storage-diagnostics must return 200');
    const diagData = await diagRes.json();
    assert.ok(['local-disk', 'cloudflare-r2'].includes(diagData.provider), 'Storage provider must be local-disk or cloudflare-r2');
    assert.equal(diagData.optimizer, 'sharp-webp-pipeline', 'Storage optimizer must be sharp-webp-pipeline');
    assert.equal(diagData.maxFullDimension, 1920);
    assert.equal(diagData.maxThumbDimension, 480);
    console.log(`[PASS] Storage Diagnostics verified (Current engine: ${diagData.provider}, Bucket: ${diagData.bucket}, Optimizer: ${diagData.optimizer}).`);

    // Valid small 1x1 transparent PNG upload (converted to WebP)
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
    assert.ok(uploadData.thumbUrl);
    assert.ok(uploadData.fullUrl);
    assert.ok(uploadData.fullUrl.endsWith('.webp'), 'Full image must have .webp extension');
    assert.ok(uploadData.thumbUrl.includes('-thumb.webp'), 'Thumb image must include -thumb.webp');
    assert.equal(uploadData.format, 'webp', 'Image format should be webp');
    assert.ok(typeof uploadData.compressionRatio === 'string', 'Should include compressionRatio string');
    assert.ok(uploadData.originalSizeBytes > 0, 'Should include originalSizeBytes');
    assert.ok(uploadData.optimizedSizeBytes > 0, 'Should include optimizedSizeBytes');
    assert.ok(['local-disk', 'cloudflare-r2'].includes(uploadData.storageProvider));
    console.log(`[PASS] Sharp WebP Compression verified (Original: ${uploadData.originalSizeBytes}B, Optimized: ${uploadData.optimizedSizeBytes}B, Ratio: ${uploadData.compressionRatio}).`);

    // Verify static serving of uploaded image if on local-disk
    if (uploadData.storageProvider === 'local-disk') {
      const staticServeRes = await fetch(`${baseUrl}${uploadData.fullUrl}`);
      assert.equal(staticServeRes.status, 200);
      assert.equal(staticServeRes.headers.get('content-type'), 'image/webp');
    }

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
    assert.ok(gunplaHtml.includes('modal-contest-entry'), 'Should contain Contest Entry Modal');
    assert.ok(gunplaHtml.includes('openContestEntryModal'), 'Should contain openContestEntryModal handler');
    assert.ok(gunplaHtml.includes('voteEntry'), 'Should contain voteEntry handler');
    assert.ok(gunplaHtml.includes('modal-edit-profile'), 'Should contain Profile Editor Modal');
    assert.ok(gunplaHtml.includes('openEditProfileModal'), 'Should contain openEditProfileModal handler');
    console.log('[PASS] GunplaJunkies Web Frontend (UXP-01 Shell, Contest UI & Profile Editor) verified successfully.');

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

    // Verify Web UI renders live podium after entries and votes are present
    const updatedGunplaRes = await fetch(`${gunplaUrl}/`);
    assert.equal(updatedGunplaRes.status, 200);
    const updatedHtml = await updatedGunplaRes.text();
    assert.ok(updatedHtml.includes('Podio de Líderes Provisionales'), 'Should render podium in web UI when contest has voted entries');
    console.log(`[PASS] Community voting & Web UI Podium verified (Contest: ${detailedContest.title}, Entries: ${detailedContest.entries.length}).`);

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

    // 25. DT9/Legal - Age Gate & Minor Protection (Ley N° 29733 / INDECOPI)
    console.log('\n--- Checking Legal Age Gate & Underage Protection (Ley N° 29733 / INDECOPI) ---');
    
    // Check A: Registration with age < 14 (Birth year 2015) must be rejected with 403
    const underageRegRes = await fetch(`${baseUrl}/api/v1/auth/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'gunplajunkies' },
      body: JSON.stringify({
        username: 'kid_builder_12',
        displayName: 'Kid Builder',
        email: 'kid.builder@test.com',
        password: 'Password123!',
        birthYear: 2015
      })
    });
    assert.equal(underageRegRes.status, 403, 'Under 14 registration must return 403 Forbidden');
    const underageRegData = await underageRegRes.json();
    assert.ok(underageRegData.type.includes('underage-restriction'));

    // Check B: Registration for adolescent 14-17 (Birth year 2010, age 16) must succeed with isAdult: false
    const teenRegRes = await fetch(`${baseUrl}/api/v1/auth/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'gunplajunkies' },
      body: JSON.stringify({
        username: 'teen_builder_16',
        displayName: 'Teen Builder',
        email: 'teen.builder@test.com',
        password: 'Password123!',
        birthYear: 2010
      })
    });
    assert.equal(teenRegRes.status, 201, 'Teen 14-17 registration must succeed with 201');
    const teenRegData = await teenRegRes.json();
    assert.equal(teenRegData.user.isAdult, false, 'Teen must have isAdult: false');
    assert.equal(teenRegData.user.ageBracket, 'minor_14_17');

    // Check C: Teen builder (isAdult: false) must be blocked from posting in Bazar / Marketplace
    const teenMarketRes = await fetch(`${baseUrl}/api/v1/marketplace/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'gunplajunkies',
        'Authorization': `Bearer ${teenRegData.token}`
      },
      body: JSON.stringify({
        kitId: 'kit-rg-rx78-2',
        type: 'sale',
        price: 150,
        currency: 'PEN',
        boxCondition: 'sealed'
      })
    });
    assert.equal(teenMarketRes.status, 403, 'Teen must be forbidden from marketplace listings (403)');
    const teenMarketData = await teenMarketRes.json();
    assert.ok(teenMarketData.type.includes('adult-required'));

    // Check D: Google SSO with age < 14 (Birth year 2014) must be rejected with 403
    const googleUnderagePayload = {
      sub: 'google-kid-999',
      email: 'kid.google@plamoscale.com',
      name: 'Kid Google',
      email_verified: true
    };
    const googleUnderageToken = 'google-test-token:' + Buffer.from(JSON.stringify(googleUnderagePayload)).toString('base64');
    const googleUnderageRes = await fetch(`${baseUrl}/api/v1/auth/google-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'plamoscale' },
      body: JSON.stringify({
        idToken: googleUnderageToken,
        birthYear: 2014
      })
    });
    assert.equal(googleUnderageRes.status, 403, 'Google SSO with age < 14 must return 403 Forbidden');
    const googleUnderageData = await googleUnderageRes.json();
    assert.ok(googleUnderageData.type.includes('underage-restriction'));

    // Check E: Google SSO with adult age 25 (Birth year 2001) succeeds with isAdult: true
    const googleAdultPayload = {
      sub: 'google-adult-888',
      email: 'adult.google@plamoscale.com',
      name: 'Adult Google Builder',
      email_verified: true
    };
    const googleAdultToken = 'google-test-token:' + Buffer.from(JSON.stringify(googleAdultPayload)).toString('base64');
    const googleAdultRes = await fetch(`${baseUrl}/api/v1/auth/google-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'plamoscale' },
      body: JSON.stringify({
        idToken: googleAdultToken,
        birthYear: 2001
      })
    });
    assert.equal(googleAdultRes.status, 200, 'Adult Google SSO must return 200 OK');
    const googleAdultData = await googleAdultRes.json();
    assert.equal(googleAdultData.user.isAdult, true, 'Adult must have isAdult: true');

    console.log('[PASS] Legal Age Gate (Ley 29733 / INDECOPI) verified: <14 blocked (403), 14-17 allowed with Bazar restricted, 18+ full access.');
    console.log('[PASS] Google OAuth 2.0 / OIDC Identity Services, Auth Modal & Transparent API/Media Reverse Proxy verified.');

    // --- Checking AI Paint Assistant & 4-Way Chemical Medium Division ---
    console.log('\n--- Checking AI Paint Assistant & 4-Way Chemical Medium Division ---');
    // 1. Paint Conversion across 4 mediums (Laca, Acrílico, Poliuretano, Montana Colors)
    const convertRes = await fetch(`${baseUrl}/api/v1/paints/ai/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'plamoscale' },
      body: JSON.stringify({ sourceCode: 'XF-1', targetMedium: 'montana_colors' })
    });
    assert.equal(convertRes.status, 200, 'Paint conversion endpoint must return 200 OK');
    const convertData = await convertRes.json();
    assert.ok(convertData.matches.length >= 4, 'Must match across Mr. Color, Tamiya, Vallejo, and Montana Colors');
    const mtnMatch = convertData.matches.find(m => m.brand === 'Montana Colors');
    assert.ok(mtnMatch, 'Must include Montana Colors match (MTN 94 or Water Based)');
    assert.equal(convertData.matches[0].brand, 'Montana Colors', 'Target medium Montana Colors must be prioritized first');
    assert.ok(convertData.airbrushGuide.mediumTitle.includes('Montana Colors'), 'Airbrush guide must reflect Montana Colors spray specifications');

    // 2. AI Color Recipe Generation with Montana Colors Sprays
    const recipeMtnRes = await fetch(`${baseUrl}/api/v1/paints/ai/recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'gunplajunkies' },
      body: JSON.stringify({ query: 'Verde Zaku II Militar', preferredMedium: 'montana_colors' })
    });
    assert.equal(recipeMtnRes.status, 200, 'AI Recipe generation for Montana Colors must return 200 OK');
    const recipeMtnData = await recipeMtnRes.json();
    assert.ok(recipeMtnData.recipeName.includes('Montana Colors') || recipeMtnData.description.includes('MTN'), 'Must generate Montana Colors-tailored recipe');
    assert.ok(recipeMtnData.components.some(c => c.brand === 'Montana Colors'), 'Must include Montana Colors components');
    assert.ok(recipeMtnData.airbrushApplication.baseCoat.includes('sweep') || recipeMtnData.airbrushApplication.baseCoat.includes('20-25 cm') || recipeMtnData.airbrushApplication.psi.includes('Pocket Cap') || recipeMtnData.airbrushApplication.psi.includes('MTN 94'), 'Must include spray application technique');

    // 3. AI Color Recipe Generation with Polyurethane (Vallejo)
    const recipePolyRes = await fetch(`${baseUrl}/api/v1/paints/ai/recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'plamoscale' },
      body: JSON.stringify({ query: 'Rojo Carmesí Mecha', preferredMedium: 'polyurethane' })
    });
    assert.equal(recipePolyRes.status, 200, 'AI Recipe generation for Polyurethane must return 200 OK');
    const recipePolyData = await recipePolyRes.json();
    assert.ok(recipePolyData.components.some(c => c.brand === 'Vallejo'), 'Must include Vallejo Polyurethane components');

    console.log('[PASS] AI Paint Assistant verified: 4-Way Chemical Division (Laca, Acrílico, Poliuretano, Montana Colors) & Spray/Airbrush recommendations.');

    // --- Checking Printable Contest Spec Cards with Configurable Dimensions & QR ---
    console.log('\n--- Checking Printable Contest Spec Cards & Dynamic QR ---');
    const specCardRes = await fetch(`${baseUrl}/api/v1/builds/mg-eclipse-gundam-custom-paint/spec-card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'gunplajunkies' },
      body: JSON.stringify({
        widthMm: 150,
        heightMm: 100,
        format: 'tent',
        theme: 'light_ink_saver',
        contestName: 'Gunpla Open Cup Perú 2026',
        entryCode: '#ENTRY-042',
        includeQr: true,
        includeCoverImage: true,
        includePaints: true,
        includeJudgeScoreBox: true
      })
    });
    assert.equal(specCardRes.status, 200, 'Spec Card endpoint must return 200 OK');
    const specCardData = await specCardRes.json();
    assert.equal(specCardData.widthMm, 150, 'Must honor configured width in mm');
    assert.equal(specCardData.heightMm, 100, 'Must honor configured height in mm');
    assert.equal(specCardData.format, 'tent', 'Must honor foldable tent format');
    assert.ok(specCardData.qrDataUrl.startsWith('data:image/png;base64,'), 'Must return valid QR base64 image');
    assert.ok(specCardData.targetUrl.includes('mg-eclipse-gundam-custom-paint'), 'Target URL must point to build');
    assert.ok(specCardData.build.title, 'Must return populated build title');

    console.log('[PASS] Printable Contest Spec Cards verified: Configurable WxH dimensions, table-tent folding & vector QR code.');

    // --- Checking White-Label Tenant Onboarding & Theme Customizer (B3) ---
    console.log('\n--- Checking White-Label Tenant Onboarding & Theme Customizer (B3) ---');
    // 1. Fetch current tenant and specific tenant details
    const currTenantRes = await fetch(`${baseUrl}/api/v1/tenants/current`, {
      headers: { 'X-Tenant-Slug': 'gunplajunkies' }
    });
    assert.equal(currTenantRes.status, 200);
    const currTenant = await currTenantRes.json();
    assert.equal(currTenant.slug, 'gunplajunkies');
    assert.ok(currTenant.themeConfig.primaryColor);

    const getTenantRes = await fetch(`${baseUrl}/api/v1/tenants/plamoscale`);
    assert.equal(getTenantRes.status, 200);
    const plamoTenant = await getTenantRes.json();
    assert.equal(plamoTenant.slug, 'plamoscale');

    // 2. Self-service Onboarding: Create a new White-Label Club / Portal
    const newTenantRes = await fetch(`${baseUrl}/api/v1/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        name: 'Arequipa Scale Modelers',
        slug: 'arequipa-scale',
        domain: 'arequipascale.com',
        tagline: 'Comunidad de Maquetismo Militar, Dioramas y Figuras del Sur',
        allowedCategories: ['military', 'aviation', 'diorama'],
        themeConfig: {
          primaryColor: '#1c2818',
          accentColor: '#22c55e',
          surfaceColor: '#0d140b',
          logoText: 'AREQUIPA SCALE'
        }
      })
    });
    assert.equal(newTenantRes.status, 201, 'Should create new white-label tenant');
    const createdTenant = await newTenantRes.json();
    assert.equal(createdTenant.slug, 'arequipa-scale');
    assert.equal(createdTenant.name, 'Arequipa Scale Modelers');
    assert.equal(createdTenant.themeConfig.primaryColor, '#1c2818');
    assert.equal(createdTenant.themeConfig.accentColor, '#22c55e');
    assert.deepEqual(createdTenant.allowedCategories, ['military', 'aviation', 'diorama']);
    assert.equal(createdTenant.createdBy, 'amuroray');

    // 3. Duplicate protection
    const dupRes = await fetch(`${baseUrl}/api/v1/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Arequipa',
        slug: 'arequipa-scale',
        domain: 'arequipascale.com'
      })
    });
    assert.equal(dupRes.status, 409, 'Should reject duplicate slug with 409 Conflict');

    // 4. Update Theme & Branding via PATCH
    const patchThemeRes = await fetch(`${baseUrl}/api/v1/tenants/arequipa-scale`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        tagline: 'Club Oficial de Modelismo Estático de Arequipa y el Sur',
        themeConfig: {
          primaryColor: '#0f172a',
          accentColor: '#eab308',
          surfaceColor: '#090d16',
          logoText: 'AREQUIPA STATIC GUILD'
        },
        allowedCategories: ['military', 'aviation', 'diorama', 'figures']
      })
    });
    assert.equal(patchThemeRes.status, 200, 'Should update tenant theme via PATCH');
    const patchedTenant = await patchThemeRes.json();
    assert.equal(patchedTenant.themeConfig.accentColor, '#eab308');
    assert.equal(patchedTenant.themeConfig.logoText, 'AREQUIPA STATIC GUILD');
    assert.ok(patchedTenant.allowedCategories.includes('figures'));

    // 5. Unauthorized PATCH attempt (no token)
    const anonPatchRes = await fetch(`${baseUrl}/api/v1/tenants/arequipa-scale`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked Name' })
    });
    assert.equal(anonPatchRes.status, 401, 'Anonymous PATCH must return 401 Unauthorized');

    // 6. Verify Web Shell includes White-Label modals & controls
    const webShellRes = await fetch(`${baseUrl}/api/v1/tenants`);
    assert.equal(webShellRes.status, 200);
    const allTenants = await webShellRes.json();
    assert.ok(allTenants.items.some(t => t.slug === 'arequipa-scale'));

    const plamoPageCheck = await fetch(`${plamoUrl}/`);
    assert.equal(plamoPageCheck.status, 200);
    const plamoWebHtml = await plamoPageCheck.text();
    assert.ok(plamoWebHtml.includes('id="modal-tenant-theme"'), 'Must render theme customizer modal');
    assert.ok(plamoWebHtml.includes('id="modal-new-tenant"'), 'Must render new white-label tenant modal');
    assert.ok(plamoWebHtml.includes('openTenantThemeModal'), 'Must include openTenantThemeModal function');
    assert.ok(plamoWebHtml.includes('openNewTenantModal'), 'Must include openNewTenantModal function');

    console.log('[PASS] White-Label Tenant Self-Service Onboarding & Custom Theme Editor verified.');

    // --- Checking Official Judge Rubrics & Contest Diplomas (B1) ---
    console.log('\n--- Checking Official Judge Rubrics & Contest Diplomas (B1) ---');
    // Obtain updated session for amuroray with tenant_admin role
    const judgeSessionRes = await fetch(`${baseUrl}/api/v1/auth/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': 'plamoscale' },
      body: JSON.stringify({ identifier: 'amuroray', password: 'Rx78-2-Password!' })
    });
    assert.equal(judgeSessionRes.status, 200);
    const judgeSessionData = await judgeSessionRes.json();
    assert.ok(judgeSessionData.user.roles.includes('tenant_admin'), 'Amuro must have tenant_admin role after creating tenant');
    const judgeToken = judgeSessionData.token;

    // 1. Unauthorized judge scoring attempt by regular user (quattro) -> 403 Forbidden
    const unauthJudgeRes = await fetch(`${baseUrl}/api/v1/contests/gunpla-open-cup-2026/entries/entry-aperich-hinu-cup/judge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${quattroData.token}`
      },
      body: JSON.stringify({
        scores: { assembly: 8, painting: 8, finish: 8, creativity: 8 }
      })
    });
    assert.equal(unauthJudgeRes.status, 403, 'Regular non-judge user must be rejected with 403 Forbidden');

    // 2. Validation error on out-of-range score
    const invalidJudgeRes = await fetch(`${baseUrl}/api/v1/contests/gunpla-open-cup-2026/entries/entry-aperich-hinu-cup/judge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${judgeToken}`
      },
      body: JSON.stringify({
        scores: { assembly: 15, painting: 9, finish: 8, creativity: 10 }
      })
    });
    assert.equal(invalidJudgeRes.status, 400, 'Score > 10 must return 400 Validation Error');

    // 3. Valid official judge evaluation (amuroray as tenant_admin)
    const validJudgeRes = await fetch(`${baseUrl}/api/v1/contests/gunpla-open-cup-2026/entries/entry-aperich-hinu-cup/judge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${judgeToken}`
      },
      body: JSON.stringify({
        scores: { assembly: 10, painting: 9, finish: 9, creativity: 10 },
        feedback: 'Excelente remoción de rebabas y acabado de barniz semimate en el Hi-Nu.'
      })
    });
    assert.equal(validJudgeRes.status, 200, 'Authorized judge must score entry with 200 OK');
    const judgeData = await validJudgeRes.json();
    assert.equal(judgeData.judgeScore.totalScore, 38, 'Must calculate sum of criteria (10+9+9+10 = 38)');
    assert.equal(judgeData.entry.judgeScoreAverage, 38);
    assert.equal(judgeData.entry.judgeCount, 1);
    assert.ok(judgeData.judgeScore.feedback.includes('Hi-Nu'));

    // 4. Retrieve judge scoring breakdown
    const getJudgeScoresRes = await fetch(`${baseUrl}/api/v1/contests/gunpla-open-cup-2026/entries/entry-aperich-hinu-cup/judge-scores`);
    assert.equal(getJudgeScoresRes.status, 200);
    const scoresList = await getJudgeScoresRes.json();
    assert.equal(scoresList.judgeCount, 1);
    assert.equal(scoresList.judgeScores[0].totalScore, 38);

    // 5. Generate Official Certificate / Diploma with QR code
    const certRes = await fetch(`${baseUrl}/api/v1/contests/gunpla-open-cup-2026/entries/entry-aperich-hinu-cup/certificate`);
    assert.equal(certRes.status, 200, 'Certificate endpoint must return 200 OK');
    const certData = await certRes.json();
    assert.equal(certData.rank, 1, 'Top entry must be rank 1');
    assert.equal(certData.rankTitle, '1er Lugar - Medalla de Oro');
    assert.ok(certData.verificationCode.startsWith('CERT-'));
    assert.ok(certData.qrCodeDataUrl.startsWith('data:image/png;base64,'));
    assert.equal(certData.builderName, 'Aldo Perich');
    assert.ok(certData.htmlTemplate.includes('Diploma Oficial de Honor'));

    // 6. Direct HTML Diploma generation
    const certHtmlRes = await fetch(`${baseUrl}/api/v1/contests/gunpla-open-cup-2026/entries/entry-aperich-hinu-cup/certificate?format=html`);
    assert.equal(certHtmlRes.status, 200);
    assert.ok(certHtmlRes.headers.get('content-type').includes('text/html'));
    const certHtml = await certHtmlRes.text();
    assert.ok(certHtml.includes('Diploma Oficial de Honor'));
    assert.ok(certHtml.includes(certData.verificationCode));

    // 7. Verify Web Shell renders Judge & Diploma controls on GunplaJunkies
    const gunplaPageCheck = await fetch(`${gunplaUrl}/`);
    assert.equal(gunplaPageCheck.status, 200);
    const gunplaWebHtml = await gunplaPageCheck.text();
    assert.ok(gunplaWebHtml.includes('id="modal-judge-entry"'), 'Must render judge scoring modal');
    assert.ok(gunplaWebHtml.includes('id="modal-contest-certificate"'), 'Must render contest certificate modal');
    assert.ok(gunplaWebHtml.includes('openJudgeModal'), 'Must include openJudgeModal JS function');
    assert.ok(gunplaWebHtml.includes('viewCertificate'), 'Must include viewCertificate JS function');

    console.log('[PASS] Official Judge Rubrics & Contest Diplomas (B1) verified.');

    // 29. B2 -- Custom Painting Commissions & Interactive Ordering Workflow
    console.log('\n--- Checking Custom Commissions & Painting Orders Workflow (B2) ---');

    // 1. Validation: Missing kitTitle must return 400
    const invalidCommRes1 = await fetch(`${baseUrl}/api/v1/commissions/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        builderUsername: 'aperich',
        clientName: 'Roberto Pineda',
        clientEmail: 'roberto@example.com',
        clientWhatsapp: '+51 999 888 777',
        scopeLevel: 'level_2_custom_paint',
        projectNotes: 'Aerografía personalizada'
      })
    });
    assert.equal(invalidCommRes1.status, 400, 'Missing kitTitle must return 400 Problem Details');

    // 2. Validation: Unknown builder must return 404
    const invalidCommRes2 = await fetch(`${baseUrl}/api/v1/commissions/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        builderUsername: 'non_existent_builder_xyz',
        kitTitle: 'MG RX-78-2',
        clientName: 'Roberto Pineda',
        clientEmail: 'roberto@example.com',
        clientWhatsapp: '+51 999 888 777',
        scopeLevel: 'level_2_custom_paint',
        projectNotes: 'Aerografía personalizada'
      })
    });
    assert.equal(invalidCommRes2.status, 404, 'Non-existent builder must return 404 Problem Details');

    // 3. Validation: Invalid scope level must return 400
    const invalidCommRes3 = await fetch(`${baseUrl}/api/v1/commissions/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        builderUsername: 'aperich',
        kitTitle: 'MG Sazabi',
        clientName: 'Roberto Pineda',
        clientEmail: 'roberto@example.com',
        clientWhatsapp: '+51 999 888 777',
        scopeLevel: 'level_invalid_unknown',
        projectNotes: 'Aerografía personalizada'
      })
    });
    assert.equal(invalidCommRes3.status, 400, 'Invalid scopeLevel must return 400 Problem Details');

    // 4. Valid commission request creation (Client: amuroray, Target Builder: aperich)
    const validCommRes = await fetch(`${baseUrl}/api/v1/commissions/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${judgeToken}`
      },
      body: JSON.stringify({
        builderUsername: 'aperich',
        kitTitle: 'PG 1/60 Unleashed RX-78-2 Gundam',
        scaleCategory: 'gunpla-mecha',
        scopeLevel: 'level_2_custom_paint',
        kitSupply: 'client_provides_kit',
        targetBudget: 650,
        currency: 'PEN',
        targetDeadline: '2026-12-20',
        clientName: 'Amuro Ray',
        clientEmail: 'amuro.ray@gunplajunkies.com',
        clientWhatsapp: '+51 999 777 666',
        clientCity: 'Lima (Miraflores)',
        projectNotes: 'Pintura completa con sombreado pre-shading sutil, inner frame metálico y calcas doradas.'
      })
    });
    assert.equal(validCommRes.status, 201, 'Valid commission request must return 201 Created');
    const createdCommData = await validCommRes.json();
    assert.equal(createdCommData.status, 'created');
    assert.ok(createdCommData.request.id.startsWith('req-com-'));
    assert.ok(createdCommData.request.code.startsWith('COM-2026-'));
    assert.equal(createdCommData.request.builderUsername, 'aperich');
    assert.equal(createdCommData.request.status, 'pending');
    assert.equal(createdCommData.request.scopeLevel, 'level_2_custom_paint');
    const commId = createdCommData.request.id;
    const commCode = createdCommData.request.code;

    // 5. Query commission requests by builder and code
    const getCommsRes = await fetch(`${baseUrl}/api/v1/commissions/requests?builderUsername=aperich`);
    assert.equal(getCommsRes.status, 200);
    const commsList = await getCommsRes.json();
    assert.ok(commsList.items.length >= 2, 'Must include initial seeded commission and the newly created one');
    assert.ok(commsList.items.some(c => c.code === commCode));

    const getSingleCommRes = await fetch(`${baseUrl}/api/v1/commissions/requests/${commCode}`);
    assert.equal(getSingleCommRes.status, 200);
    const singleCommData = await getSingleCommRes.json();
    assert.equal(singleCommData.request.id, commId);

    // 6. Unauthorized update attempt by unrelated user (quattro) -> 403 Forbidden
    const unauthUpdateRes = await fetch(`${baseUrl}/api/v1/commissions/requests/${commId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${quattroData.token}`
      },
      body: JSON.stringify({ quotePrice: 999, status: 'quoted' })
    });
    assert.equal(unauthUpdateRes.status, 403, 'Unrelated user must be rejected with 403 Forbidden');

    // 7. Builder quote: Login as aperich and respond with quote price and estimated days
    const aperichLoginRes = await fetch(`${baseUrl}/api/v1/auth/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'aperich', password: 'PlamoScaleDev2026!' })
    });
    assert.equal(aperichLoginRes.status, 200, 'aperich login must succeed');
    const aperichSession = await aperichLoginRes.json();
    const aperichToken = aperichSession.token;

    const builderQuoteRes = await fetch(`${baseUrl}/api/v1/commissions/requests/${commId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aperichToken}`
      },
      body: JSON.stringify({
        quotePrice: 620,
        estimatedDays: 28,
        status: 'quoted',
        builderResponseNotes: 'Excelente kit PG. Cuento con las pinturas Mr. Color y barniz mate GX113. Plazo de 28 días.'
      })
    });
    assert.equal(builderQuoteRes.status, 200, 'Builder must be able to submit quote with 200 OK');
    const quotedCommData = await builderQuoteRes.json();
    assert.equal(quotedCommData.request.status, 'quoted');
    assert.equal(quotedCommData.request.quotePrice, 620);
    assert.equal(quotedCommData.request.estimatedDays, 28);
    assert.ok(quotedCommData.request.builderResponseNotes.includes('GX113'));

    // 8. Client acceptance: Amuro Ray (client) accepts the quotation
    const clientAcceptRes = await fetch(`${baseUrl}/api/v1/commissions/requests/${commId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${judgeToken}` // amuroray
      },
      body: JSON.stringify({
        status: 'accepted'
      })
    });
    assert.equal(clientAcceptRes.status, 200, 'Client must be able to accept quote with 200 OK');
    const acceptedCommData = await clientAcceptRes.json();
    assert.equal(acceptedCommData.request.status, 'accepted');

    // 9. Verify Web Frontends render Commission Request modals & Workbench sub-tab
    const plamoCommCheck = await fetch(`${plamoUrl}/`);
    assert.equal(plamoCommCheck.status, 200);
    const plamoCommHtml = await plamoCommCheck.text();
    assert.ok(plamoCommHtml.includes('id="modal-commission-request"'), 'Must render commission request modal');
    assert.ok(plamoCommHtml.includes('id="modal-quote-commission"'), 'Must render quote commission modal');
    assert.ok(plamoCommHtml.includes('id="modal-commission-success"'), 'Must render commission success modal');
    assert.ok(plamoCommHtml.includes('id="wb-subtab-commissions"'), 'Must render workbench commissions sub-tab');
    assert.ok(plamoCommHtml.includes('openCommissionModal'), 'Must include openCommissionModal JS function');
    assert.ok(plamoCommHtml.includes('submitCommissionRequest'), 'Must include submitCommissionRequest JS function');
    assert.ok(plamoCommHtml.includes('submitQuote'), 'Must include submitQuote JS function');

    console.log('[PASS] Custom Commissions & Painting Orders Workflow (B2) verified.');

    // 30. PWA & Offline Workshop Mode
    console.log('\n--- Checking Progressive Web App (PWA) & Offline Mode ---');

    // 1. Web App Manifests
    const plamoManifestRes = await fetch(`${plamoUrl}/manifest.json`);
    assert.equal(plamoManifestRes.status, 200);
    assert.ok(plamoManifestRes.headers.get('content-type').includes('manifest+json'));
    const plamoManifest = await plamoManifestRes.json();
    assert.equal(plamoManifest.short_name, 'PlamoScale');
    assert.equal(plamoManifest.display, 'standalone');
    assert.ok(plamoManifest.icons.length >= 2);

    const gunplaManifestRes = await fetch(`${gunplaUrl}/manifest.json`);
    assert.equal(gunplaManifestRes.status, 200);
    const gunplaManifest = await gunplaManifestRes.json();
    assert.equal(gunplaManifest.short_name, 'GunplaJunkies');
    assert.equal(gunplaManifest.display, 'standalone');

    // 2. Service Workers
    const plamoSwRes = await fetch(`${plamoUrl}/sw.js`);
    assert.equal(plamoSwRes.status, 200);
    assert.ok(plamoSwRes.headers.get('content-type').includes('javascript'));
    assert.equal(plamoSwRes.headers.get('service-worker-allowed'), '/');
    const plamoSwScript = await plamoSwRes.text();
    assert.ok(plamoSwScript.includes('gunpla-pwa-plamoscale'));
    assert.ok(plamoSwScript.includes('/api/v1/workbench'));
    assert.ok(plamoSwScript.includes('caches.match'));

    const gunplaSwRes = await fetch(`${gunplaUrl}/sw.js`);
    assert.equal(gunplaSwRes.status, 200);
    const gunplaSwScript = await gunplaSwRes.text();
    assert.ok(gunplaSwScript.includes('gunpla-pwa-gunplajunkies'));

    // 3. Dynamic App Icons
    const plamoSvgRes = await fetch(`${plamoUrl}/icons/icon.svg`);
    assert.equal(plamoSvgRes.status, 200);
    assert.ok(plamoSvgRes.headers.get('content-type').includes('svg'));

    const plamoPngRes = await fetch(`${plamoUrl}/icons/icon-192.png`);
    assert.equal(plamoPngRes.status, 200);
    assert.ok(plamoPngRes.headers.get('content-type').includes('image/png'));
    const pngBuffer = await plamoPngRes.arrayBuffer();
    assert.ok(pngBuffer.byteLength > 100, 'Rendered PNG icon must not be empty');

    // 4. Frontend PWA HTML & Offline status badge
    assert.ok(plamoCommHtml.includes('rel="manifest" href="/manifest.json"'));
    assert.ok(plamoCommHtml.includes('id="pwa-offline-badge"'));
    assert.ok(plamoCommHtml.includes('id="pwa-install-btn"'));
    assert.ok(plamoCommHtml.includes("navigator.serviceWorker.register('/sw.js')"));
    assert.ok(plamoCommHtml.includes('updateOnlineStatus'));
    assert.ok(plamoCommHtml.includes('promptPwaInstall'));

    console.log('[PASS] Progressive Web App (PWA) & Offline Workshop Mode verified.');

    // 32. DT10: Real-Time Transactional Email Notifications & Marketplace Inquiries (Resend Outbox)
    console.log('\n--- Checking DT10: Real-Time Transactional Email Notifications & Marketplace Inquiries (Resend Outbox) ---');

    // 1. Post a comment by another modeler (Quattro Bajeena) on Amuro's build to trigger owner notification
    const otherUserCommentRes = await fetch(`${baseUrl}/api/v1/builds/${newBuild.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${quattroData.token}`
      },
      body: JSON.stringify({
        comment: '¡Impresionante sombreado con aerógrafo en las alas del Eclipse, Amuro!'
      })
    });
    assert.equal(otherUserCommentRes.status, 201, 'Comment from another user must succeed with 201');

    // 2. Submit Marketplace Listing Inquiry via Resend
    const inquiryRes = await fetch(`${baseUrl}/api/v1/marketplace/listings/listing-sazabi-verka/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'gunplajunkies'
      },
      body: JSON.stringify({
        buyerName: 'Renato Modelista',
        buyerEmail: 'renato@example.com',
        buyerPhone: '+51 987 654 321',
        offerPrice: 350,
        message: 'Hola Daniel, ¿haces entrega personal en el Ovalo de Miraflores?'
      })
    });
    assert.equal(inquiryRes.status, 201, 'Marketplace inquiry must return 201 Created');
    const inquiryData = await inquiryRes.json();
    assert.equal(inquiryData.status, 'sent');
    assert.equal(inquiryData.inquiry.buyerName, 'Renato Modelista');
    assert.equal(inquiryData.inquiry.offerPrice, 350);
    assert.equal(inquiryData.inquiry.sellerUsername, 'dcampos');
    assert.ok(inquiryData.emailRecord, 'Must return email dispatch record');

    // 3. Query Resend Email Outbox
    const outboxRes = await fetch(`${baseUrl}/api/v1/notifications/outbox`);
    assert.equal(outboxRes.status, 200, 'Outbox endpoint must return 200 OK');
    const outboxData = await outboxRes.json();
    assert.ok(Array.isArray(outboxData.items), 'Outbox must contain items array');
    assert.ok(outboxData.totalCount >= 5, 'Outbox must record all transactional community emails');

    // Verify contest judge evaluation notification
    const contestJudgeEmail = outboxData.items.find(e => e.subject.includes('Evaluacion oficial de Jurado'));
    assert.ok(contestJudgeEmail, 'Outbox must contain contest judge evaluation notification');
    assert.ok(contestJudgeEmail.subject.includes('38/40 pts'), 'Email subject must reflect 38/40 pts score');
    assert.ok(contestJudgeEmail.to.some(addr => addr.includes('aperich')), 'Email must be sent to entry author aperich');

    // Verify build log comment notification
    const buildCommentEmail = outboxData.items.find(e => e.subject.includes('Nuevo comentario en tu bitacora'));
    assert.ok(buildCommentEmail, 'Outbox must contain build log comment notification');
    assert.ok(buildCommentEmail.html.includes('Impresionante sombreado con aerógrafo'), 'Email must contain comment content');

    // Verify commission quote notification
    const commQuoteEmail = outboxData.items.find(e => e.subject.includes('Cotización formal recibida'));
    assert.ok(commQuoteEmail, 'Outbox must contain commission quote notification');
    assert.ok(commQuoteEmail.html.includes('620'), 'Email must include quoted price of 620');

    // Verify commission acceptance notification
    const commAcceptEmail = outboxData.items.find(e => e.subject.includes('Cotización Aceptada'));
    assert.ok(commAcceptEmail, 'Outbox must contain commission accept notification');
    assert.ok(commAcceptEmail.to.some(addr => addr.includes('aperich')), 'Acceptance email must be sent to builder');

    // Verify marketplace listing inquiry email
    const listingInquiryEmail = outboxData.items.find(e => e.subject.includes('Consulta para tu publicación en el Bazar'));
    assert.ok(listingInquiryEmail, 'Outbox must contain marketplace listing inquiry email');
    assert.ok(listingInquiryEmail.html.includes('Renato Modelista'), 'Email must contain buyer name');
    assert.ok(listingInquiryEmail.html.includes('350'), 'Email must contain counter-offer price');

    // 3. Verify Frontend UI includes Marketplace Inquiry Modal and Controls
    assert.ok(plamoCommHtml.includes('id="modal-marketplace-inquiry"'), 'HTML must include marketplace inquiry modal');
    assert.ok(plamoCommHtml.includes('openMarketplaceInquiryModal'), 'HTML must include openMarketplaceInquiryModal JS function');
    assert.ok(plamoCommHtml.includes('submitMarketplaceInquiry'), 'HTML must include submitMarketplaceInquiry JS function');
    assert.ok(plamoCommHtml.includes('✉️ Consultar'), 'HTML must render Consultar button on marketplace cards');

    console.log('[PASS] Real-Time Transactional Email Notifications & Marketplace Inquiries (DT10) verified.');

    // -------------------------------------------------------------
    // 25. Verify Trusted Shops Wishlist Stock Alerts & Inventory Management
    // -------------------------------------------------------------
    console.log('--- Verifying Trusted Shops Wishlist Stock Alerts ---');

    // 1. Amuro adds a kit to his wishlist
    const wishRes = await fetch(`${baseUrl}/api/v1/workbench/stash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        kitId: 'kit-rg-hinu',
        status: 'wishlist'
      })
    });
    assert.equal(wishRes.status, 201, 'POST /api/v1/workbench/stash with wishlist status must return 201 Created');
    const wishItem = await wishRes.json();
    assert.equal(wishItem.status, 'wishlist');

    // 2. Fetch Wishlist Stock Alerts for Amuro
    const alertsRes = await fetch(`${baseUrl}/api/v1/workbench/wishlist-alerts`, {
      headers: {
        Authorization: `Bearer ${googleSsoData.token}`
      }
    });
    assert.equal(alertsRes.status, 200, 'GET /api/v1/workbench/wishlist-alerts must return 200 OK');
    const alertsData = await alertsRes.json();
    assert.ok(Array.isArray(alertsData.items), 'Wishlist alerts must return items array');
    assert.ok(alertsData.items.length >= 1, 'Must find at least 1 in-stock match for RG Hi-Nu Gundam');
    const hinuAlert = alertsData.items.find(a => a.kitId === 'kit-rg-hinu');
    assert.ok(hinuAlert, 'Must find stock alert for RG Hi-Nu Gundam');
    assert.equal(hinuAlert.shopName, 'Hobby & Gunpla Perú Store');
    assert.equal(hinuAlert.pricePEN, 239.9);
    assert.ok(hinuAlert.shopWhatsappUrl && (hinuAlert.shopWhatsappUrl.includes('whatsapp.com') || hinuAlert.shopWhatsappUrl.includes('wa.me')), 'Alert must include WhatsApp direct link');

    // 3. Shop Stock API: GET and POST stock items
    const shopStockGetRes = await fetch(`${baseUrl}/api/v1/shops/shop-gunpla-peru-store/stock`);
    assert.equal(shopStockGetRes.status, 200, 'GET /api/v1/shops/:id/stock must return 200 OK');
    const shopStockData = await shopStockGetRes.json();
    assert.ok(Array.isArray(shopStockData.items), 'Shop stock must be an array');
    assert.ok(shopStockData.items.some(s => s.kitId === 'kit-rg-hinu'));

    // Register new stock item for MG Barbatos
    const shopStockPostRes = await fetch(`${baseUrl}/api/v1/shops/shop-scale-hobby-art/stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleSsoData.token}`
      },
      body: JSON.stringify({
        kitId: 'kit-mg-barbatos',
        kitName: 'MG 1/100 Gundam Barbatos',
        brand: 'Bandai Spirits',
        scale: '1/100',
        pricePEN: 219.00,
        inStock: true,
        stockCount: 5,
        discountPercentage: 10,
        promoLabel: '10% OFF'
      })
    });
    assert.equal(shopStockPostRes.status, 201, 'POST /api/v1/shops/:id/stock must return 201 Created');
    const postedStock = await shopStockPostRes.json();
    assert.ok(postedStock.stockItem, 'POST /api/v1/shops/:id/stock must return stockItem object');
    assert.equal(postedStock.stockItem.kitId, 'kit-mg-barbatos');
    assert.equal(postedStock.stockItem.pricePEN, 219.00);

    // 4. Verify Frontend UI includes Wishlist Alert UI Slots & Badges
    assert.ok(plamoCommHtml.includes('id="wb-stash-alerts-badge"'), 'HTML must include wishlist alerts badge on stash tab');
    assert.ok(plamoCommHtml.includes('id="wb-wishlist-alerts-banner"'), 'HTML must include wishlist alerts banner slot');
    assert.ok(plamoCommHtml.includes('/api/v1/workbench/wishlist-alerts'), 'HTML must fetch wishlist alerts in loadWorkbenchData');

    console.log('[PASS] Trusted Shops Wishlist Stock Alerts & Fan-Out Notifications verified.');

    // -------------------------------------------------------------
    // 26. Verify AI Paint Rack Equivalences Assistant & UI Modal
    // -------------------------------------------------------------
    console.log('--- Verifying AI Paint Rack Equivalences Assistant ---');

    // 1. Query equivalences for rack item (Mr. Color C1 White)
    const equivRes = await fetch(`${baseUrl}/api/v1/workbench/paints/${rackItem.id}/equivalences`, {
      headers: {
        Authorization: `Bearer ${googleSsoData.token}`
      }
    });
    assert.equal(equivRes.status, 200, 'GET /api/v1/workbench/paints/:id/equivalences must return 200 OK');
    const equivData = await equivRes.json();
    assert.ok(equivData.matches.length >= 4, 'Must return cross-brand matches for C1 White');
    const mrColorMatch = equivData.matches.find(m => m.brand === 'Mr. Hobby' && m.code === 'C1');
    assert.ok(mrColorMatch, 'Must find Mr. Hobby C1 in matches');
    assert.equal(mrColorMatch.ownedInRack, true, 'Mr. Color C1 must be marked as owned in rack');
    assert.equal(mrColorMatch.rackQuantity, 3, 'Must report rack quantity of 3');

    // Check application guide
    assert.ok(equivData.airbrushGuide, 'Must return airbrushing application guide');
    assert.ok(equivData.airbrushGuide.thinningRatio, 'Must include thinning ratio');

    // 2. Query equivalences with medium filter
    const equivMtnRes = await fetch(`${baseUrl}/api/v1/workbench/paints/${rackItem.id}/equivalences?targetMedium=montana_colors`, {
      headers: {
        Authorization: `Bearer ${googleSsoData.token}`
      }
    });
    assert.equal(equivMtnRes.status, 200);
    const equivMtnData = await equivMtnRes.json();
    assert.equal(equivMtnData.matches[0].brand, 'Montana Colors', 'Montana Colors match must be prioritized first');

    // 3. UI checks in web frontend HTML
    assert.ok(plamoCommHtml.includes('id="modal-paint-equivalences"'), 'HTML must include AI paint equivalences modal');
    assert.ok(plamoCommHtml.includes('openPaintEquivalencesModal'), 'HTML must include openPaintEquivalencesModal JS function');
    assert.ok(plamoCommHtml.includes('id="wb-paints-count-badge"'), 'HTML must include paints count badge in Paint Rack header');
    assert.ok(plamoCommHtml.includes('🔄 Equivalencias'), 'HTML must include Equivalencias button on rack cards');

    console.log('[PASS] AI Paint Rack Equivalences Assistant & UI Modal verified.');

    // --- Verifying Contest Community Voting Badges & Public Hall of Fame ---
    console.log('\n--- Verifying Contest Community Badges & Public Hall of Fame ---');

    // 1. Cross-contest Hall of Fame endpoint
    const hofRes = await fetch(`${baseUrl}/api/v1/contests/hall-of-fame`);
    assert.equal(hofRes.status, 200, 'GET /api/v1/contests/hall-of-fame must return 200 OK');
    const hofData = await hofRes.json();
    assert.ok(Array.isArray(hofData.items), 'Must return items array');
    assert.ok(hofData.items.length > 0, 'Hall of Fame must have at least one awarded item');
    const goldItem = hofData.items.find(i => i.awardType === 'gold');
    assert.ok(goldItem, 'Hall of Fame must contain a gold medalist');
    assert.equal(goldItem.rank, 1, 'Gold medalist must be rank 1');
    assert.equal(goldItem.medalIcon, '🥇', 'Gold medalist icon must be 🥇');
    assert.ok(goldItem.certificateUrl.includes('/certificate'), 'Must include certificate URL');

    // 2. Specific Contest Podium endpoint
    const podiumRes = await fetch(`${baseUrl}/api/v1/contests/contest-gunpla-cup-2026/podium`);
    assert.equal(podiumRes.status, 200, 'GET /api/v1/contests/:id/podium must return 200 OK');
    const podiumData = await podiumRes.json();
    assert.equal(podiumData.contestId, 'contest-gunpla-cup-2026');
    assert.ok(Array.isArray(podiumData.podium));
    assert.ok(podiumData.podium.length > 0);
    assert.equal(podiumData.podium[0].awardType, 'gold');
    assert.ok(podiumData.peoplesChoice, 'Must resolve people choice for contest');

    // 3. Builder profile enrichment with contestBadges
    const aperichProfileRes = await fetch(`${baseUrl}/api/v1/builders/aperich`, {
      headers: { 'X-Tenant-Slug': 'gunplajunkies' }
    });
    assert.equal(aperichProfileRes.status, 200, 'GET /api/v1/builders/aperich must return 200 OK');
    const aperichProfile = await aperichProfileRes.json();
    assert.ok(Array.isArray(aperichProfile.contestBadges), 'Builder profile must have contestBadges array');
    assert.ok(aperichProfile.contestBadges.length > 0, 'aperich must have awarded contest badges');
    const aperichGoldBadge = aperichProfile.contestBadges.find(b => b.awardType === 'gold');
    assert.ok(aperichGoldBadge, 'aperich must have gold badge');
    assert.equal(aperichGoldBadge.medalIcon, '🥇');

    // 4. Verify web frontend UI renders Hall of Fame and builder badges
    const plamoWebCheck = await fetch(`${plamoUrl}/`);
    assert.equal(plamoWebCheck.status, 200);
    const plamoHofHtml = await plamoWebCheck.text();
    assert.ok(plamoHofHtml.includes('id="view-contests-hall-of-fame"'), 'PlamoScale must render #view-contests-hall-of-fame');
    assert.ok(plamoHofHtml.includes('Salón de la Fama y Podio de Concursos'), 'PlamoScale must include Hall of Fame title');
    assert.ok(plamoHofHtml.includes('builder-award-badge'), 'PlamoScale must render builder award badge');

    const gunplaWebCheck = await fetch(`${gunplaUrl}/`);
    assert.equal(gunplaWebCheck.status, 200);
    const gunplaHofHtml = await gunplaWebCheck.text();
    assert.ok(gunplaHofHtml.includes('id="view-contests-hall-of-fame"'), 'GunplaJunkies must render #view-contests-hall-of-fame');
    assert.ok(gunplaHofHtml.includes('builder-award-badge'), 'GunplaJunkies must render builder award badge');

    console.log('[PASS] Contest Community Badges & Public Hall of Fame verified.');

    // --- Verifying Direct WhatsApp Community Inquiries ---
    console.log('\n--- Verifying Direct WhatsApp Community Inquiries ---');

    // 1. Build log WhatsApp inquiry endpoint
    const waBuildRes = await fetch(`${baseUrl}/api/v1/builds/mg-eclipse-gundam-custom-paint/whatsapp-inquiry?inquiryType=paint_recipe&clientName=Roberto`);
    assert.equal(waBuildRes.status, 200, 'GET /api/v1/builds/:slugOrId/whatsapp-inquiry must return 200 OK');
    const waBuildData = await waBuildRes.json();
    assert.equal(waBuildData.inquiryType, 'paint_recipe');
    assert.ok(waBuildData.prefilledMessage.includes('Roberto'), 'Must include client name');
    assert.ok(waBuildData.prefilledMessage.includes('recetas de pintura'), 'Must include paint recipe inquiry text');
    assert.ok(waBuildData.whatsappUrl.startsWith('https://wa.me/'), 'Must generate valid wa.me URL');

    // 2. Showcase / Gallery arbitrary WhatsApp inquiry endpoint
    const waShowcaseRes = await fetch(`${baseUrl}/api/v1/builds/whatsapp-inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        builderUsername: 'aperich',
        itemTitle: 'RG 1/144 Hi-Nu Gundam Titanium Finish',
        inquiryType: 'custom_commission',
        clientName: 'Daniel'
      })
    });
    assert.equal(waShowcaseRes.status, 200, 'POST /api/v1/builds/whatsapp-inquiry must return 200 OK');
    const waShowcaseData = await waShowcaseRes.json();
    assert.equal(waShowcaseData.builderUsername, 'aperich');
    assert.ok(waShowcaseData.prefilledMessage.includes('cotizar un encargo'));
    assert.ok(waShowcaseData.whatsappUrl.includes('whatsapp.com') || waShowcaseData.whatsappUrl.includes('wa.me'), 'Must generate valid WhatsApp URL');

    // 3. UI checks on both web frontends
    assert.ok(plamoHofHtml.includes('id="modal-whatsapp-inquiry"'), 'PlamoScale must render #modal-whatsapp-inquiry');
    assert.ok(plamoHofHtml.includes('openWhatsAppInquiryModal'), 'PlamoScale must include openWhatsAppInquiryModal');
    assert.ok(plamoHofHtml.includes('openWhatsAppInquiryFromLightbox'), 'PlamoScale must include openWhatsAppInquiryFromLightbox');
    assert.ok(plamoHofHtml.includes('id="lightbox-btn-whatsapp"'), 'PlamoScale must render WhatsApp button in Lightbox');

    assert.ok(gunplaHofHtml.includes('id="modal-whatsapp-inquiry"'), 'GunplaJunkies must render #modal-whatsapp-inquiry');
    assert.ok(gunplaHofHtml.includes('openWhatsAppInquiryModal'), 'GunplaJunkies must include openWhatsAppInquiryModal');
    assert.ok(gunplaHofHtml.includes('💬 Consultar WhatsApp'), 'GunplaJunkies must render WhatsApp button on build cards');

    console.log('[PASS] Direct WhatsApp Community Inquiries verified.');

    console.log('=== ALL DT1 + DT2 + DT3 + DT4 + DT5 + DT6 + DT7 + DT8 + DT9 + DT10 + PAINTS-AI + SPEC-CARDS + WHITE-LABEL + JUDGE-RUBRICS + COMMISSIONS + PWA + STOCK-ALERTS + PAINT-EQUIVALENCES + HALL-OF-FAME + WHATSAPP-INQUIRIES CHECKS PASSED ===');
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
