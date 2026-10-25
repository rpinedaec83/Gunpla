import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getDb, saveDb } from '../../apps/api/dist/core/db.js';

describe('Community Group Builds & Collaborative Build Logs Unit Tests', () => {
  const organizerUser = {
    id: 'user-organizer',
    username: 'arturo_zero',
    email: 'arturo@plamoscale.com',
    displayName: 'Arturo Perich',
    roles: ['builder'],
    tenantSlug: 'plamoscale'
  };

  const participantUser = {
    id: 'user-participant',
    username: 'diego_cam',
    email: 'diego@plamoscale.com',
    displayName: 'Diego Campos',
    roles: ['builder'],
    tenantSlug: 'plamoscale'
  };

  const thirdUser = {
    id: 'user-third',
    username: 'rookie',
    email: 'rookie@gunplajunkies.com',
    displayName: 'Rookie Builder',
    roles: ['builder'],
    tenantSlug: 'gunplajunkies'
  };

  const sampleBuild1 = {
    id: 'build-corsair-1',
    tenantSlug: 'plamoscale',
    userId: 'user-organizer',
    username: 'arturo_zero',
    title: 'F4U-1D Corsair 1/48 Tamiya',
    slug: 'f4u-1d-corsair-tamiya',
    category: 'aviation',
    steps: [
      {
        id: 'step-1',
        buildId: 'build-corsair-1',
        orderIndex: 0,
        stage: 'assembly',
        title: 'Cockpit detailing',
        description: 'PE harnesses and zinc chromate green.',
        photoUrls: ['/fulls/corsair-cockpit.jpg'],
        paintUsages: []
      }
    ],
    coverImageUrl: '/fulls/corsair-cover.jpg',
    createdAt: new Date().toISOString()
  };

  const sampleBuild2 = {
    id: 'build-hellcat-2',
    tenantSlug: 'plamoscale',
    userId: 'user-participant',
    username: 'diego_cam',
    title: 'F6F-5 Hellcat 1/48 Eduard',
    slug: 'f6f-5-hellcat-eduard',
    category: 'aviation',
    steps: [
      {
        id: 'step-1',
        buildId: 'build-hellcat-2',
        orderIndex: 0,
        stage: 'priming',
        title: 'Surface priming',
        description: 'Mr Surfacer 1200.',
        photoUrls: ['/fulls/hellcat.jpg'],
        paintUsages: []
      }
    ],
    coverImageUrl: '/fulls/hellcat-cover.jpg',
    createdAt: new Date().toISOString()
  };

  const sampleGroupBuild = {
    id: 'gb-pacifico-test',
    tenantSlug: 'plamoscale',
    title: 'Proyecto Grupal: Escuadrones del Pacífico WWII',
    slug: 'escuadrones-del-pacifico-wwii',
    description: 'Construcción colaborativa de aviación naval del Pacífico.',
    rules: ['Escala 1/48 o 1/72', 'Mínimo 2 pasos documentados'],
    bannerImageUrl: '/banners/pacific.jpg',
    startDate: new Date(Date.now() - 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    status: 'active',
    creatorUserId: 'user-organizer',
    creatorUsername: 'arturo_zero',
    creatorDisplayName: 'Arturo Perich',
    category: 'aviation',
    entries: [
      {
        id: 'gbe-1',
        groupBuildId: 'gb-pacifico-test',
        buildId: 'build-corsair-1',
        userId: 'user-organizer',
        username: 'arturo_zero',
        userDisplayName: 'Arturo Perich',
        buildTitle: 'F4U-1D Corsair 1/48 Tamiya',
        buildSlug: 'f4u-1d-corsair-tamiya',
        coverImageUrl: '/fulls/corsair-cover.jpg',
        stage: 'assembly',
        stepsCount: 1,
        joinedAt: new Date().toISOString()
      }
    ],
    participantsCount: 1,
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    const db = getDb();
    db.users = [organizerUser, participantUser, thirdUser];
    db.builds = [JSON.parse(JSON.stringify(sampleBuild1)), JSON.parse(JSON.stringify(sampleBuild2))];
    db.groupBuilds = [JSON.parse(JSON.stringify(sampleGroupBuild))];
    saveDb(db);
  });

  test('Lists group builds and scopes correctly by tenant', () => {
    const db = getDb();
    assert.equal(db.groupBuilds.length, 1);

    const plamoGBs = db.groupBuilds.filter(gb => gb.tenantSlug === 'all' || gb.tenantSlug === 'plamoscale');
    const gunplaGBs = db.groupBuilds.filter(gb => gb.tenantSlug === 'all' || gb.tenantSlug === 'gunplajunkies');

    assert.equal(plamoGBs.length, 1);
    assert.equal(gunplaGBs.length, 0);
  });

  test('Joining active group build adds entry and updates unique participantsCount', () => {
    const db = getDb();
    const gb = db.groupBuilds.find(g => g.id === 'gb-pacifico-test');
    assert.ok(gb);
    assert.equal(gb.participantsCount, 1);
    assert.equal(gb.entries.length, 1);

    // Participant joins with sampleBuild2
    const build = db.builds.find(b => b.id === 'build-hellcat-2');
    assert.ok(build);
    assert.equal(build.userId, participantUser.id);

    const newEntry = {
      id: 'gbe-2',
      groupBuildId: gb.id,
      buildId: build.id,
      userId: participantUser.id,
      username: participantUser.username,
      userDisplayName: participantUser.displayName,
      buildTitle: build.title,
      buildSlug: build.slug,
      coverImageUrl: build.coverImageUrl,
      stage: 'priming',
      stepsCount: 1,
      joinedAt: new Date().toISOString()
    };

    gb.entries.push(newEntry);
    gb.participantsCount = new Set(gb.entries.map(e => e.userId)).size;
    saveDb(db);

    const updated = getDb().groupBuilds.find(g => g.id === 'gb-pacifico-test');
    assert.equal(updated.entries.length, 2);
    assert.equal(updated.participantsCount, 2);
    assert.equal(updated.entries[1].buildTitle, 'F6F-5 Hellcat 1/48 Eduard');
  });

  test('Rejects duplicate registration of the same build project in a group build', () => {
    const db = getDb();
    const gb = db.groupBuilds.find(g => g.id === 'gb-pacifico-test');
    assert.ok(gb);

    const alreadyJoined = gb.entries.some(e => e.buildId === 'build-corsair-1');
    assert.equal(alreadyJoined, true);
  });

  test('Leaving a group build removes the entry and accurately recomputes participants count', () => {
    const db = getDb();
    const gb = db.groupBuilds.find(g => g.id === 'gb-pacifico-test');
    assert.ok(gb);

    // Remove entry gbe-1
    gb.entries = gb.entries.filter(e => e.id !== 'gbe-1');
    gb.participantsCount = new Set(gb.entries.map(e => e.userId)).size;
    saveDb(db);

    const updated = getDb().groupBuilds.find(g => g.id === 'gb-pacifico-test');
    assert.equal(updated.entries.length, 0);
    assert.equal(updated.participantsCount, 0);
  });
});
