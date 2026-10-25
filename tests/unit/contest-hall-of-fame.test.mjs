import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateContestAwards,
  getHallOfFame,
  getBuilderContestBadges,
  getContestAwards
} from '../../apps/api/dist/slices/community/community.slice.js';

test('Contest Community Badges & Hall of Fame Unit Tests', async (t) => {
  const mockContest = {
    id: 'contest-test-2026',
    slug: 'contest-test-2026',
    title: 'Torneo Nacional de Escala 2026',
    description: 'Concurso de prueba',
    tenantSlug: 'plamoscale',
    category: 'all',
    bannerUrl: '/banner.jpg',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    status: 'active',
    rules: ['Regla 1'],
    prizes: ['Premio 1'],
    participantsCount: 3
  };

  const mockEntries = [
    {
      id: 'entry-alpha',
      contestId: 'contest-test-2026',
      buildId: 'build-alpha',
      userId: 'user-alpha',
      username: 'alpha_builder',
      userDisplayName: 'Alpha Builder',
      title: 'Zaku II Custom Weathered',
      category: 'gunpla-mecha',
      coverImageUrl: '/cover-alpha.jpg',
      voteCount: 10,
      judgeScoreAverage: 39, // Composite: 39 * 0.7 + 10 * 0.3 = 27.3 + 3 = 30.3
      status: 'approved',
      createdAt: '2026-01-10T00:00:00Z'
    },
    {
      id: 'entry-beta',
      contestId: 'contest-test-2026',
      buildId: 'build-beta',
      userId: 'user-beta',
      username: 'beta_builder',
      userDisplayName: 'Beta Builder',
      title: 'Spitfire Mk.IX Normandy',
      category: 'aviation',
      coverImageUrl: '/cover-beta.jpg',
      voteCount: 30, // Most votes! Composite: 30 * 0.7 + 30 * 0.3 = 21 + 9 = 30.0
      judgeScoreAverage: 30,
      status: 'approved',
      createdAt: '2026-01-11T00:00:00Z'
    },
    {
      id: 'entry-gamma',
      contestId: 'contest-test-2026',
      buildId: 'build-gamma',
      userId: 'user-gamma',
      username: 'gamma_builder',
      userDisplayName: 'Gamma Builder',
      title: 'Panzer IV Ausf. H',
      category: 'military',
      coverImageUrl: '/cover-gamma.jpg',
      voteCount: 5,
      judgeScoreAverage: 25, // Composite: 25 * 0.7 + 5 * 0.3 = 17.5 + 1.5 = 19.0
      status: 'approved',
      createdAt: '2026-01-12T00:00:00Z'
    },
    {
      id: 'entry-disqualified',
      contestId: 'contest-test-2026',
      buildId: 'build-disq',
      userId: 'user-disq',
      username: 'disq_user',
      title: 'Disqualified Entry',
      category: 'sci-fi',
      voteCount: 100,
      status: 'disqualified',
      createdAt: '2026-01-13T00:00:00Z'
    }
  ];

  await t.test('calculates podium ranking (Gold, Silver, Bronze) based on composite scores', () => {
    const { podium, badges } = calculateContestAwards(mockContest, mockEntries);

    assert.equal(podium.length, 3);
    assert.equal(podium[0].awardType, 'gold');
    assert.equal(podium[0].medalIcon, '🥇');
    assert.equal(podium[0].entryId, 'entry-alpha');
    assert.equal(podium[0].rank, 1);
    assert.ok(podium[0].certificateUrl.includes('/entries/entry-alpha/certificate'));

    assert.equal(podium[1].awardType, 'silver');
    assert.equal(podium[1].medalIcon, '🥈');
    assert.equal(podium[1].entryId, 'entry-beta');
    assert.equal(podium[1].rank, 2);

    assert.equal(podium[2].awardType, 'bronze');
    assert.equal(podium[2].medalIcon, '🥉');
    assert.equal(podium[2].entryId, 'entry-gamma');
    assert.equal(podium[2].rank, 3);

    // Disqualified entry is ignored
    assert.ok(!podium.some(p => p.entryId === 'entry-disqualified'));
  });

  await t.test('awards community_choice badge (People Choice) to entry with highest community votes', () => {
    const { peoplesChoice, badges } = calculateContestAwards(mockContest, mockEntries);

    assert.ok(peoplesChoice);
    assert.equal(peoplesChoice.entryId, 'entry-beta');
    assert.equal(peoplesChoice.awardType, 'community_choice');
    assert.equal(peoplesChoice.medalIcon, '🏆');
    assert.equal(peoplesChoice.voteCount, 30);

    // Badges array should include the community_choice badge
    const choiceBadge = badges.find(b => b.awardType === 'community_choice');
    assert.ok(choiceBadge);
    assert.equal(choiceBadge.entryId, 'entry-beta');
    assert.equal(choiceBadge.medalIcon, '🏆');
  });

  await t.test('returns empty podium when contest has no approved entries', () => {
    const { podium, badges, peoplesChoice } = calculateContestAwards(mockContest, []);
    assert.equal(podium.length, 0);
    assert.equal(badges.length, 0);
    assert.equal(peoplesChoice, undefined);
  });

  await t.test('resolves Hall of Fame entries across contests and respects tenant filtering', () => {
    const allHof = getHallOfFame('all');
    assert.ok(Array.isArray(allHof));
    assert.ok(allHof.length > 0);

    const gunplaHof = getHallOfFame('gunplajunkies');
    assert.ok(gunplaHof.every(item => item.tenantSlug === 'all' || item.tenantSlug === 'gunplajunkies'));

    const plamoHof = getHallOfFame('plamoscale');
    assert.ok(plamoHof.every(item => item.tenantSlug === 'all' || item.tenantSlug === 'plamoscale'));
  });

  await t.test('resolves builder contest badges for active builders', () => {
    // aperich has entry-aperich-hinu-cup in contest-gunpla-cup-2026
    const aperichBadges = getBuilderContestBadges('aperich');
    assert.ok(Array.isArray(aperichBadges));
    assert.ok(aperichBadges.length > 0);
    assert.ok(aperichBadges.some(b => b.entryId === 'entry-aperich-hinu-cup'));
    assert.ok(aperichBadges.some(b => b.medalIcon === '🥇' || b.medalIcon === '🏆'));

    // Unknown builder returns empty array
    const unknownBadges = getBuilderContestBadges('non_existent_builder_xyz');
    assert.deepEqual(unknownBadges, []);
  });

  await t.test('retrieves contest podium result by contest id', () => {
    const podiumResult = getContestAwards('contest-gunpla-cup-2026');
    assert.ok(podiumResult);
    assert.equal(podiumResult.contestId, 'contest-gunpla-cup-2026');
    assert.ok(Array.isArray(podiumResult.podium));
    assert.ok(podiumResult.podium.length > 0);
    assert.equal(podiumResult.podium[0].entryId, 'entry-aperich-hinu-cup');
  });
});
