import test from 'node:test';
import assert from 'node:assert/strict';
import { findPaintEquivalences } from '../../apps/api/dist/slices/paints-ai/paints-ai.slice.js';

test('Paint Equivalences & Rack Matching Unit Tests', async (t) => {
  const sampleDbPaints = [
    {
      id: 'pnt-mc-c1',
      brand: 'Mr. Hobby',
      line: 'Mr. Color',
      code: 'C1',
      name: 'White',
      type: 'lacquer',
      finish: 'gloss',
      hexColor: '#FFFFFF'
    },
    {
      id: 'pnt-tam-xf1',
      brand: 'Tamiya',
      line: 'Acrylic XF',
      code: 'XF-1',
      name: 'Flat Black',
      type: 'acrylic',
      finish: 'flat/matte',
      hexColor: '#1A1A1A'
    },
    {
      id: 'pnt-val-70950',
      brand: 'Vallejo',
      line: 'Model Color',
      code: '70.950',
      name: 'Black',
      type: 'polyurethane',
      finish: 'flat/matte',
      hexColor: '#111111'
    },
    {
      id: 'pnt-mtn-wb9011',
      brand: 'Montana Colors',
      line: 'MTN Water Based (Cero Olor)',
      code: 'WB-9011',
      name: 'Carbon Black (Water Based)',
      type: 'spray_graffiti',
      finish: 'flat/matte',
      hexColor: '#1A1A1A'
    }
  ];

  const sampleUserRack = [
    {
      id: 'rack-item-1',
      userId: 'user-amuro',
      paintId: 'pnt-tam-xf1',
      status: 'owned',
      quantity: 2
    }
  ];

  await t.test('converts paint code across all 4 chemical families (Laca, Acrílico, Poliuretano, Montana Colors)', () => {
    const result = findPaintEquivalences('XF-1', 'Tamiya', undefined, sampleUserRack, sampleDbPaints);
    assert.ok(result, 'Result must not be null');
    assert.equal(result.matches.length, 4, 'Must return 4 chemical family matches');

    const mrColorMatch = result.matches.find(m => m.brand === 'Mr. Hobby');
    assert.ok(mrColorMatch);
    assert.equal(mrColorMatch.code, 'C33');
    assert.equal(mrColorMatch.type, 'lacquer');

    const tamiyaMatch = result.matches.find(m => m.brand === 'Tamiya');
    assert.ok(tamiyaMatch);
    assert.equal(tamiyaMatch.code, 'XF-1');
    assert.equal(tamiyaMatch.type, 'acrylic');

    const vallejoMatch = result.matches.find(m => m.brand === 'Vallejo');
    assert.ok(vallejoMatch);
    assert.equal(vallejoMatch.code, '70.950');
    assert.equal(vallejoMatch.type, 'polyurethane');

    const mtnMatch = result.matches.find(m => m.brand === 'Montana Colors');
    assert.ok(mtnMatch);
    assert.equal(mtnMatch.code, 'WB-9011');
    assert.equal(mtnMatch.type, 'spray_graffiti');
  });

  await t.test('detects when equivalent paint is already owned in builder rack', () => {
    const result = findPaintEquivalences('C33', 'Mr. Hobby', undefined, sampleUserRack, sampleDbPaints);
    assert.ok(result);

    const tamiyaMatch = result.matches.find(m => m.brand === 'Tamiya' && m.code === 'XF-1');
    assert.ok(tamiyaMatch);
    assert.equal(tamiyaMatch.ownedInRack, true, 'XF-1 should be marked as owned in rack');
    assert.equal(tamiyaMatch.rackQuantity, 2, 'Should reflect owned quantity of 2');

    const vallejoMatch = result.matches.find(m => m.brand === 'Vallejo');
    assert.ok(vallejoMatch);
    assert.equal(vallejoMatch.ownedInRack, false, 'Vallejo 70.950 is not in rack');
  });

  await t.test('prioritizes target medium when targetMedium filter is specified', () => {
    const result = findPaintEquivalences('XF-1', 'Tamiya', 'montana_colors', sampleUserRack, sampleDbPaints);
    assert.ok(result);
    assert.equal(result.matches[0].brand, 'Montana Colors', 'Montana Colors should be first match when requested');
    assert.ok(result.airbrushGuide.mediumTitle.includes('Montana Colors'), 'Airbrush guide should tailor to Montana Colors');
  });

  await t.test('returns full application parameters in airbrushGuide', () => {
    const result = findPaintEquivalences('C108', 'Mr. Hobby', 'polyurethane', sampleUserRack, sampleDbPaints);
    assert.ok(result);
    assert.ok(result.airbrushGuide.recommendedThinner, 'Must include recommended thinner');
    assert.ok(result.airbrushGuide.thinningRatio, 'Must include thinning ratio');
    assert.ok(result.airbrushGuide.recommendedPSI, 'Must include PSI recommendation');
    assert.ok(result.airbrushGuide.proTips, 'Must include pro tips for modeling');
  });

  await t.test('returns null for nonexistent paint code', () => {
    const result = findPaintEquivalences('NONEXISTENT-CODE-999', undefined, undefined, [], []);
    assert.equal(result, null, 'Must return null for unknown code');
  });
});
