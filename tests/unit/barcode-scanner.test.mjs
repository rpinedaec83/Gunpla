import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeBarcode,
  detectBarcodeFormat,
  getManufacturerHintFromBarcode
} from '../../packages/shared/dist/index.js';
import { getDb, saveDb } from '../../apps/api/dist/core/db.js';

describe('Barcode Scanner & Instant Stash Registration Unit Tests', () => {
  const testUser = {
    id: 'user-scanner-test',
    username: 'gunpla_scanner',
    email: 'scanner@plamoscale.com',
    displayName: 'Scanner Master',
    roles: ['builder'],
    tenantSlug: 'plamoscale'
  };

  beforeEach(() => {
    const db = getDb();
    // Ensure test user exists
    if (!db.users.some(u => u.id === testUser.id)) {
      db.users.push({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        displayName: testUser.displayName,
        tenantSlug: testUser.tenantSlug,
        roles: testUser.roles,
        createdAt: new Date().toISOString()
      });
    }
    // Clean up test stash items
    db.stashItems = db.stashItems.filter(s => s.userId !== testUser.id);
    // Clean up test kits
    db.kits = db.kits.filter(k => !k.id.startsWith('kit-scan-test-') && k.barcode !== '4934054887766');
    // Ensure sample kits with barcodes are present in memory
    let existingHiNu = db.kits.find(k => k.id === 'kit-rg-hinu');
    if (!existingHiNu) {
      existingHiNu = {
        id: 'kit-rg-hinu',
        name: 'RG 1/144 Hi-Nu Gundam',
        brand: 'Bandai Spirits',
        scale: '1/144',
        grade: 'RG (Real Grade)',
        category: 'gunpla-mecha',
        barcode: '4573102619198'
      };
      db.kits.push(existingHiNu);
    } else {
      existingHiNu.barcode = '4573102619198';
    }

    let existingSpitfire = db.kits.find(k => k.id === 'kit-tamiya-spitfire');
    if (!existingSpitfire) {
      existingSpitfire = {
        id: 'kit-tamiya-spitfire',
        name: 'Supermarine Spitfire Mk.I',
        brand: 'Tamiya',
        scale: '1/48',
        category: 'scale-aviation',
        barcode: '4950344611195'
      };
      db.kits.push(existingSpitfire);
    } else {
      existingSpitfire.barcode = '4950344611195';
    }
    saveDb(db);
  });

  describe('1. Barcode Normalization', () => {
    test('normalizes raw barcode strings with spaces and hyphens', () => {
      assert.equal(normalizeBarcode('  4573-1026-19198  '), '4573102619198');
      assert.equal(normalizeBarcode('4950 3446 11195'), '4950344611195');
      assert.equal(normalizeBarcode('UPC-1234-5678-9012'), 'UPC123456789012');
    });

    test('handles empty or special character inputs gracefully', () => {
      assert.equal(normalizeBarcode(''), '');
      assert.equal(normalizeBarcode('   '), '');
      assert.equal(normalizeBarcode('---***///'), '');
    });
  });

  describe('2. Barcode Format Detection', () => {
    test('identifies JAN-13 for 13-digit codes starting with 45 or 49', () => {
      assert.equal(detectBarcodeFormat('4573102619198'), 'JAN-13');
      assert.equal(detectBarcodeFormat('4950344611195'), 'JAN-13');
    });

    test('identifies EAN-13 for 13-digit codes starting with non-Japanese country codes', () => {
      assert.equal(detectBarcodeFormat('8429551709511'), 'EAN-13'); // Spain/Vallejo
      assert.equal(detectBarcodeFormat('4009803039442'), 'EAN-13'); // Germany/Revell
    });

    test('identifies JAN-8 and UPC-E for 8-digit codes', () => {
      assert.equal(detectBarcodeFormat('49123456'), 'JAN-8');
      assert.equal(detectBarcodeFormat('01234565'), 'UPC-E');
    });

    test('identifies UPC-A for 12-digit codes', () => {
      assert.equal(detectBarcodeFormat('012345678905'), 'UPC-A');
    });

    test('identifies CODE-128 for alphanumeric codes', () => {
      assert.equal(detectBarcodeFormat('BANDAI-EXP-001'), 'CODE-128');
    });
  });

  describe('3. Manufacturer Prefix Heuristics', () => {
    test('resolves Bandai Spirits from 4573102 prefix', () => {
      assert.equal(getManufacturerHintFromBarcode('4573102619198'), 'Bandai Spirits');
    });

    test('resolves Bandai from 4543112, 4549660, 4902425 prefixes', () => {
      assert.equal(getManufacturerHintFromBarcode('4543112967282'), 'Bandai');
      assert.equal(getManufacturerHintFromBarcode('4549660123456'), 'Bandai');
      assert.equal(getManufacturerHintFromBarcode('4902425123456'), 'Bandai');
    });

    test('resolves Tamiya from 4950344 prefix', () => {
      assert.equal(getManufacturerHintFromBarcode('4950344611195'), 'Tamiya');
    });

    test('resolves Kotobukiya from 4934054 prefix', () => {
      assert.equal(getManufacturerHintFromBarcode('4934054109432'), 'Kotobukiya');
    });

    test('resolves Hasegawa from 4967834 prefix', () => {
      assert.equal(getManufacturerHintFromBarcode('4967834401518'), 'Hasegawa');
    });

    test('resolves Aoshima from 4905083 prefix', () => {
      assert.equal(getManufacturerHintFromBarcode('4905083056123'), 'Aoshima');
    });

    test('resolves Revell and Vallejo prefixes', () => {
      assert.equal(getManufacturerHintFromBarcode('4009803039442'), 'Revell');
      assert.equal(getManufacturerHintFromBarcode('8429551709511'), 'Vallejo');
    });

    test('returns undefined for unknown prefixes', () => {
      assert.equal(getManufacturerHintFromBarcode('9999999999999'), undefined);
    });
  });

  describe('4. Catalog Barcode Lookup & Instant Stash Registration Logic', () => {
    test('finds existing kit in catalog by JAN barcode', () => {
      const db = getDb();
      const normalized = normalizeBarcode('4573102619198');
      const kit = db.kits.find(k => k.barcode && normalizeBarcode(k.barcode) === normalized);

      assert.ok(kit, 'Expected RG Hi-Nu kit to be found');
      assert.equal(kit.id, 'kit-rg-hinu');
      assert.equal(kit.brand, 'Bandai Spirits');
    });

    test('creates new catalog kit and registers stash item for unknown scanned box', () => {
      const db = getDb();
      const newBarcode = '4934054887766'; // Kotobukiya prefix
      const normalized = normalizeBarcode(newBarcode);

      let kit = db.kits.find(k => k.barcode && normalizeBarcode(k.barcode) === normalized);
      assert.equal(kit, undefined, 'Kit should not exist before scan');

      const manufacturerHint = getManufacturerHintFromBarcode(normalized);
      assert.equal(manufacturerHint, 'Kotobukiya');

      // Emulate POST /stash/scan creation logic
      const resolvedBrand = manufacturerHint || 'Desconocida';
      const resolvedName = 'Megami Device Buster Doll Gunner';
      const createdKit = {
        id: `kit-scan-test-${Date.now()}`,
        name: resolvedName,
        brand: resolvedBrand,
        scale: '1/1',
        category: 'gunpla-mecha',
        barcode: normalized,
        source: 'user-import',
        createdAt: new Date().toISOString()
      };
      db.kits.push(createdKit);

      const stashItem = {
        id: `stash-test-${Date.now()}`,
        userId: testUser.id,
        kitId: createdKit.id,
        status: 'unbuilt',
        notes: 'Comprado en Akihabara Radio Kaikan',
        pricePaid: 6800,
        currency: 'JPY',
        acquiredAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.stashItems.push(stashItem);
      saveDb(db);

      // Verify persistence
      const reloadedDb = getDb();
      const persistedKit = reloadedDb.kits.find(k => k.barcode === normalized);
      assert.ok(persistedKit);
      assert.equal(persistedKit.brand, 'Kotobukiya');
      assert.equal(persistedKit.source, 'user-import');

      const userStash = reloadedDb.stashItems.filter(s => s.userId === testUser.id);
      assert.equal(userStash.length, 1);
      assert.equal(userStash[0].kitId, createdKit.id);
      assert.equal(userStash[0].currency, 'JPY');
    });
  });
});
