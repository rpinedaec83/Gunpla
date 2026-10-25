import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAgeGate } from '../../apps/api/dist/slices/auth-sso/auth.slice.js';

test('Legal Age Gate (Ley N° 29733 / INDECOPI) Unit Tests', async (t) => {
  const CURRENT_YEAR = 2026;

  await t.test('allows adult users (age >= 18) with full platform access', () => {
    // Born in 1990 -> age 36
    const res1 = evaluateAgeGate(1990, CURRENT_YEAR);
    assert.equal(res1.allowed, true);
    assert.equal(res1.isAdult, true);
    assert.equal(res1.ageBracket, 'adult_18_plus');
    assert.equal(res1.age, 36);

    // Born in 2008 -> age 18 (exact adult boundary)
    const res2 = evaluateAgeGate(2008, CURRENT_YEAR);
    assert.equal(res2.allowed, true);
    assert.equal(res2.isAdult, true);
    assert.equal(res2.ageBracket, 'adult_18_plus');
    assert.equal(res2.age, 18);
  });

  await t.test('allows adolescent minors (14 <= age < 18) marked as non-adult', () => {
    // Born in 2010 -> age 16
    const res1 = evaluateAgeGate(2010, CURRENT_YEAR);
    assert.equal(res1.allowed, true);
    assert.equal(res1.isAdult, false);
    assert.equal(res1.ageBracket, 'minor_14_17');
    assert.equal(res1.age, 16);

    // Born in 2012 -> age 14 (exact legal minor boundary)
    const res2 = evaluateAgeGate(2012, CURRENT_YEAR);
    assert.equal(res2.allowed, true);
    assert.equal(res2.isAdult, false);
    assert.equal(res2.ageBracket, 'minor_14_17');
    assert.equal(res2.age, 14);
  });

  await t.test('rejects children under 14 (age < 14) in accordance with Ley 29733 Art. 27', () => {
    // Born in 2013 -> age 13
    const res1 = evaluateAgeGate(2013, CURRENT_YEAR);
    assert.equal(res1.allowed, false);
    assert.equal(res1.isAdult, false);
    assert.equal(res1.ageBracket, 'under_14');
    assert.equal(res1.age, 13);

    // Born in 2018 -> age 8
    const res2 = evaluateAgeGate(2018, CURRENT_YEAR);
    assert.equal(res2.allowed, false);
    assert.equal(res2.isAdult, false);
    assert.equal(res2.ageBracket, 'under_14');
    assert.equal(res2.age, 8);
  });

  await t.test('handles missing or unprovided birthYear by defaulting to adult access', () => {
    const resUndefined = evaluateAgeGate(undefined, CURRENT_YEAR);
    assert.equal(resUndefined.allowed, true);
    assert.equal(resUndefined.isAdult, true);
    assert.equal(resUndefined.ageBracket, 'adult_18_plus');

    const resNull = evaluateAgeGate(null, CURRENT_YEAR);
    assert.equal(resNull.allowed, true);
    assert.equal(resNull.isAdult, true);

    const resEmpty = evaluateAgeGate('', CURRENT_YEAR);
    assert.equal(resEmpty.allowed, true);
    assert.equal(resEmpty.isAdult, true);
  });

  await t.test('rejects invalid non-numeric birthYear', () => {
    const resInvalid = evaluateAgeGate('not-a-year', CURRENT_YEAR);
    assert.equal(resInvalid.allowed, false);
    assert.equal(resInvalid.ageBracket, 'under_14');
  });
});
