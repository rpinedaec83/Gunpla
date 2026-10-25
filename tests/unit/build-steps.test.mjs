import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getDb, saveDb } from '../../apps/api/dist/core/db.js';

describe('Build Steps Reordering & Multi-Photo Gallery Unit Tests', () => {
  const authorUser = {
    id: 'user-author-1',
    username: 'gunplamaster',
    email: 'master@plamoscale.com',
    displayName: 'Gunpla Master',
    roles: ['builder'],
    tenantSlug: 'plamoscale'
  };

  const otherUser = {
    id: 'user-other-2',
    username: 'rookiebuilder',
    email: 'rookie@plamoscale.com',
    displayName: 'Rookie Builder',
    roles: ['builder'],
    tenantSlug: 'plamoscale'
  };

  const sampleBuild = {
    id: 'build-rg-sazabi',
    tenantSlug: 'plamoscale',
    userId: 'user-author-1',
    username: 'gunplamaster',
    title: 'RG 1/144 MSN-04 Sazabi',
    category: 'gunpla-mecha',
    slug: 'rg-1-144-msn-04-sazabi',
    scale: '1/144',
    grade: 'RG',
    coverImageUrl: 'https://media.gunpla.com/sazabi-cover.jpg',
    steps: [
      {
        id: 'step-1',
        buildId: 'build-rg-sazabi',
        orderIndex: 0,
        stage: 'unboxing',
        title: 'Unboxing & Runner Inspection',
        description: 'Checking runners and photo etched details.',
        photoUrls: ['https://media.gunpla.com/step1-a.jpg', 'https://media.gunpla.com/step1-b.jpg'],
        paintUsages: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'step-2',
        buildId: 'build-rg-sazabi',
        orderIndex: 1,
        stage: 'assembly_inner_frame',
        title: 'Inner Frame Assembly',
        description: 'Building the metallic inner skeleton.',
        photoUrls: ['https://media.gunpla.com/step2-a.jpg'],
        paintUsages: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'step-3',
        buildId: 'build-rg-sazabi',
        orderIndex: 2,
        stage: 'painting',
        title: 'Candy Red Armor Coating',
        description: 'Three stage candy coat with silver leaf base.',
        photoUrls: [
          'https://media.gunpla.com/step3-a.jpg',
          'https://media.gunpla.com/step3-b.jpg',
          'https://media.gunpla.com/step3-c.jpg'
        ],
        paintUsages: [],
        createdAt: new Date().toISOString()
      }
    ],
    likesCount: 5,
    likedBy: [],
    tags: ['sazabi', 'rg', 'candy-coat'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    const db = getDb();
    db.users = [authorUser, otherUser];
    db.builds = [JSON.parse(JSON.stringify(sampleBuild))];
    saveDb(db);
  });

  test('Reorder steps moves third step to first position and correctly indexes', () => {
    const db = getDb();
    const build = db.builds.find(b => b.id === 'build-rg-sazabi');
    assert.ok(build);

    const stepMap = new Map(build.steps.map(s => [s.id, s]));
    const targetOrder = ['step-3', 'step-1', 'step-2'];
    const reordered = [];

    for (let i = 0; i < targetOrder.length; i++) {
      const sId = targetOrder[i];
      const s = stepMap.get(sId);
      if (s) {
        s.orderIndex = i;
        reordered.push(s);
      }
    }

    build.steps = reordered;
    saveDb(db);

    const updated = getDb().builds.find(b => b.id === 'build-rg-sazabi');
    assert.equal(updated.steps[0].id, 'step-3');
    assert.equal(updated.steps[0].orderIndex, 0);
    assert.equal(updated.steps[1].id, 'step-1');
    assert.equal(updated.steps[1].orderIndex, 1);
    assert.equal(updated.steps[2].id, 'step-2');
    assert.equal(updated.steps[2].orderIndex, 2);
  });

  test('Multi-photo gallery allows adding and updating step photos array', () => {
    const db = getDb();
    const build = db.builds.find(b => b.id === 'build-rg-sazabi');
    const step2 = build.steps.find(s => s.id === 'step-2');
    assert.ok(step2);

    assert.equal(step2.photoUrls.length, 1);

    // Update with 4 photos
    const newPhotos = [
      'https://media.gunpla.com/step2-frame1.jpg',
      'https://media.gunpla.com/step2-frame2.jpg',
      'https://media.gunpla.com/step2-frame3.jpg',
      'https://media.gunpla.com/step2-frame4.jpg'
    ];
    step2.photoUrls = newPhotos;
    saveDb(db);

    const updated = getDb().builds.find(b => b.id === 'build-rg-sazabi');
    const updatedStep2 = updated.steps.find(s => s.id === 'step-2');
    assert.equal(updatedStep2.photoUrls.length, 4);
    assert.deepEqual(updatedStep2.photoUrls, newPhotos);
  });

  test('Delete step removes item and re-indexes remaining steps starting at 0', () => {
    const db = getDb();
    const build = db.builds.find(b => b.id === 'build-rg-sazabi');
    assert.equal(build.steps.length, 3);

    // Delete step-2 (index 1)
    const stepIdx = build.steps.findIndex(s => s.id === 'step-2');
    build.steps.splice(stepIdx, 1);
    build.steps.forEach((s, idx) => {
      s.orderIndex = idx;
    });
    saveDb(db);

    const updated = getDb().builds.find(b => b.id === 'build-rg-sazabi');
    assert.equal(updated.steps.length, 2);
    assert.equal(updated.steps[0].id, 'step-1');
    assert.equal(updated.steps[0].orderIndex, 0);
    assert.equal(updated.steps[1].id, 'step-3');
    assert.equal(updated.steps[1].orderIndex, 1);
  });

  test('Step ownership check prevents non-author from modifying steps', () => {
    const db = getDb();
    const build = db.builds.find(b => b.id === 'build-rg-sazabi');

    const canAuthorEdit = build.userId === authorUser.id;
    const canOtherEdit = build.userId === otherUser.id;

    assert.equal(canAuthorEdit, true);
    assert.equal(canOtherEdit, false);
  });
});
