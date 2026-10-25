import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolveKitModel3d } from '../../packages/shared/dist/index.js';
import { INITIAL_KITS } from '../../apps/api/dist/seed/seed-catalog.js';

describe('Interactive 3D / AR Viewer & Diorama Studio Unit Tests', () => {
  describe('1. Scale Modeling 3D Metadata & Dimension Resolution', () => {
    test('resolves Gunpla 1/144 scale dimensions and human pilot reference', () => {
      const kit = {
        id: 'kit-rg-hinu',
        name: 'RG 1/144 Hi-Nu Gundam',
        brand: 'Bandai Spirits',
        scale: '1/144',
        grade: 'RG (Real Grade)',
        category: 'gunpla-mecha',
        source: 'scalemates',
        createdAt: new Date().toISOString()
      };

      const meta = resolveKitModel3d(kit);
      assert.equal(meta.meshType, 'mecha');
      assert.equal(meta.realHeightMeters, 18.0);
      assert.equal(meta.physicalHeightMm, 125.0);
      assert.equal(meta.humanFigureScaleMm, 12.5);
      assert.equal(meta.defaultLighting, 'studio');
      assert.equal(meta.arSupported, true);
      assert.equal(meta.modelFormat, 'procedural');
    });

    test('resolves Military Armor 1/35 scale dimensions and crew reference', () => {
      const kit = {
        id: 'kit-tamiya-tiger1',
        name: 'Tiger I Early Production',
        brand: 'Tamiya',
        scale: '1/35',
        category: 'military',
        source: 'scalemates',
        createdAt: new Date().toISOString()
      };

      const meta = resolveKitModel3d(kit);
      assert.equal(meta.meshType, 'tank');
      assert.equal(meta.realHeightMeters, 3.0);
      assert.equal(meta.physicalHeightMm, 85.0);
      assert.equal(meta.humanFigureScaleMm, 51.4);
      assert.equal(meta.defaultLighting, 'military-hangar');
    });

    test('resolves Aviation 1/48 scale dimensions', () => {
      const kit = {
        id: 'kit-tamiya-spitfire',
        name: 'Supermarine Spitfire Mk.I',
        brand: 'Tamiya',
        scale: '1/48',
        category: 'aviation',
        source: 'scalemates',
        createdAt: new Date().toISOString()
      };

      const meta = resolveKitModel3d(kit);
      assert.equal(meta.meshType, 'aircraft');
      assert.equal(meta.physicalHeightMm, 79.0);
      assert.equal(meta.humanFigureScaleMm, 37.5);
    });

    test('resolves Automotive 1/24 scale dimensions', () => {
      const kit = {
        id: 'kit-tamiya-skyline',
        name: 'Nissan Skyline GT-R',
        brand: 'Tamiya',
        scale: '1/24',
        category: 'automotive',
        source: 'scalemates',
        createdAt: new Date().toISOString()
      };

      const meta = resolveKitModel3d(kit);
      assert.equal(meta.meshType, 'car');
      assert.equal(meta.physicalHeightMm, 56.0);
      assert.equal(meta.humanFigureScaleMm, 75.0);
      assert.equal(meta.defaultLighting, 'sunset');
    });

    test('resolves 1/1 Megami Device and Warship 1/450 scale dimensions', () => {
      const megamiKit = {
        id: 'kit-koto-megami',
        name: 'Megami Device Asra Archer',
        brand: 'Kotobukiya',
        scale: '1/1',
        category: 'gunpla-mecha',
        source: 'scalemates',
        createdAt: new Date().toISOString()
      };
      const megamiMeta = resolveKitModel3d(megamiKit);
      assert.equal(megamiMeta.physicalHeightMm, 140.0);
      assert.equal(megamiMeta.humanFigureScaleMm, 140.0);

      const yamatoKit = {
        id: 'kit-hasegawa-yamato',
        name: 'Battleship Yamato',
        brand: 'Hasegawa',
        scale: '1/450',
        category: 'naval',
        source: 'scalemates',
        createdAt: new Date().toISOString()
      };
      const yamatoMeta = resolveKitModel3d(yamatoKit);
      assert.equal(yamatoMeta.meshType, 'warship');
      assert.equal(yamatoMeta.physicalHeightMm, 111.0);
      assert.equal(yamatoMeta.humanFigureScaleMm, 4.0);
    });
  });

  describe('2. Master Catalog 3D Database Consistency', () => {
    test('all starter seed kits resolve valid 3D diorama metadata', () => {
      assert.ok(INITIAL_KITS.length >= 8, 'Expected at least 8 starter kits in INITIAL_KITS');

      for (const kit of INITIAL_KITS) {
        const meta = resolveKitModel3d(kit);
        assert.ok(meta.kitId, 'Metadata must contain kitId');
        assert.ok(meta.kitName, 'Metadata must contain kitName');
        assert.ok(meta.meshType, 'Metadata must contain meshType');
        assert.ok(meta.physicalHeightMm > 0, 'Physical height must be positive');
        assert.ok(meta.humanFigureScaleMm > 0, 'Human figure scale reference must be positive');
        assert.ok(meta.dioramaGroundSizeMeters > 0, 'Diorama ground size must be positive');
        assert.equal(meta.arSupported, true);
      }
    });
  });
});
