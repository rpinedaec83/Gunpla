import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAirbrushMix,
  AIRBRUSH_MEDIUMS,
  AIRBRUSH_NEEDLE_SIZES
} from '../../packages/shared/dist/index.js';

describe('DT22: Airbrush PSI & Thinner Ratio Calculator Unit Tests', () => {
  test('1. Constants validation: AIRBRUSH_MEDIUMS and AIRBRUSH_NEEDLE_SIZES', () => {
    assert.ok(Array.isArray(AIRBRUSH_MEDIUMS));
    assert.equal(AIRBRUSH_MEDIUMS.length, 5);
    assert.ok(AIRBRUSH_MEDIUMS.includes('lacquer'));
    assert.ok(AIRBRUSH_MEDIUMS.includes('acrylic-alcohol'));
    assert.ok(AIRBRUSH_MEDIUMS.includes('acrylic-water'));
    assert.ok(AIRBRUSH_MEDIUMS.includes('enamel'));
    assert.ok(AIRBRUSH_MEDIUMS.includes('polyurethane-primer'));

    assert.ok(Array.isArray(AIRBRUSH_NEEDLE_SIZES));
    assert.equal(AIRBRUSH_NEEDLE_SIZES.length, 5);
    assert.deepEqual(AIRBRUSH_NEEDLE_SIZES, [0.15, 0.2, 0.3, 0.4, 0.5]);
  });

  test('2. Lacquer calculations for standard base-coat, detail-shading, and gloss-clear', () => {
    // Standard base coat with 0.3mm needle and 10 drops
    const baseRes = calculateAirbrushMix({
      medium: 'lacquer',
      needleSize: 0.3,
      technique: 'base-coat',
      paintDrops: 10
    });

    assert.equal(baseRes.medium, 'lacquer');
    assert.equal(baseRes.needleSize, 0.3);
    assert.equal(baseRes.ratioString, '1 : 1.5');
    assert.equal(baseRes.recommendedThinnerDrops, 15);
    assert.deepEqual(baseRes.recommendedPressurePsi, { min: 16, max: 20 });
    assert.ok(baseRes.recommendedPressureBar.min >= 1.0);
    assert.ok(baseRes.recommendedThinner.includes('Mr. Color Leveling Thinner'));
    assert.ok(baseRes.recipeDescription.includes('10 gotas Pintura'));
    assert.ok(baseRes.recipeDescription.includes('15 gotas Diluyente'));
    assert.ok(Array.isArray(baseRes.troubleshooting));
    assert.ok(baseRes.troubleshooting.length >= 3);

    // Detail shading: thinner paint (1:2.5) and lower pressure (10-15 PSI)
    const detailRes = calculateAirbrushMix({
      medium: 'lacquer',
      needleSize: 0.2,
      technique: 'detail-shading',
      paintDrops: 10
    });

    // 0.2 needle decreases PSI for fine detail (8-12 PSI) and increases ratio multiplier slightly
    assert.equal(detailRes.technique, 'detail-shading');
    assert.ok(detailRes.recommendedThinnerRatio >= 2.5);
    assert.deepEqual(detailRes.recommendedPressurePsi, { min: 8, max: 12 });
    assert.deepEqual(detailRes.sprayingDistanceCm, { min: 2, max: 4 });

    // Gloss clear: wet coat (1:2)
    const glossRes = calculateAirbrushMix({
      medium: 'lacquer',
      needleSize: 0.3,
      technique: 'gloss-clear',
      paintDrops: 10
    });
    assert.equal(glossRes.ratioString, '1 : 2');
    assert.equal(glossRes.recommendedThinnerDrops, 20);
  });

  test('3. Acrylic Water (Vallejo/AK) includes flow improver and retarder additives to prevent tip-dry', () => {
    const acrylicWaterRes = calculateAirbrushMix({
      medium: 'acrylic-water',
      needleSize: 0.3,
      technique: 'base-coat',
      paintDrops: 10
    });

    assert.equal(acrylicWaterRes.medium, 'acrylic-water');
    assert.equal(acrylicWaterRes.ratioString, '1 : 0.8');
    assert.equal(acrylicWaterRes.recommendedThinnerDrops, 8);
    assert.ok(acrylicWaterRes.recommendedAdditives);
    assert.ok(acrylicWaterRes.recommendedAdditives.flowImproverDrops >= 1);
    assert.ok(acrylicWaterRes.recommendedAdditives.retarderDrops >= 1);
    assert.ok(acrylicWaterRes.recipeDescription.includes('Flow Improver'));
    assert.ok(acrylicWaterRes.recipeDescription.includes('Retarder'));
    assert.ok(acrylicWaterRes.recommendedThinner.includes('Vallejo Airbrush Thinner'));
  });

  test('4. Needle size and climate adjustments (high temperature & high humidity)', () => {
    // Polyurethane primer with large 0.5mm needle
    const primerRes = calculateAirbrushMix({
      medium: 'polyurethane-primer',
      needleSize: 0.5,
      technique: 'primer-surfacer',
      paintDrops: 10
    });
    // 0.5mm needle increases pressure by +2/+3 PSI (base 22-28 becomes 24-31)
    assert.deepEqual(primerRes.recommendedPressurePsi, { min: 24, max: 31 });

    // High temperature (>27C)
    const hotRes = calculateAirbrushMix({
      medium: 'lacquer',
      needleSize: 0.3,
      technique: 'base-coat',
      paintDrops: 10,
      ambientTempC: 32,
      ambientHumidityPct: 40
    });
    const hasTempTip = hotRes.tips.some(t => t.includes('Temperatura alta') || t.includes('evaporación'));
    assert.ok(hasTempTip, 'Must include tip for hot workshop climate');

    // High humidity (>70%)
    const humidRes = calculateAirbrushMix({
      medium: 'lacquer',
      needleSize: 0.3,
      technique: 'base-coat',
      paintDrops: 10,
      ambientTempC: 22,
      ambientHumidityPct: 82
    });
    const hasHumidTip = humidRes.tips.some(t => t.includes('Humedad elevada') || t.includes('velado'));
    assert.ok(hasHumidTip, 'Must include tip for humid workshop climate');
  });

  test('5. Input validation throws descriptive errors for invalid values', () => {
    assert.throws(() => {
      calculateAirbrushMix({
        medium: 'invalid-medium',
        needleSize: 0.3,
        technique: 'base-coat',
        paintDrops: 10
      });
    }, /Química de pintura no válida/);

    assert.throws(() => {
      calculateAirbrushMix({
        medium: 'lacquer',
        needleSize: 1.2,
        technique: 'base-coat',
        paintDrops: 10
      });
    }, /Diámetro de boquilla no válido/);
  });
});
