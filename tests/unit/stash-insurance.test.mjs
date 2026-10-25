import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStashValuation,
  generateInsuranceReportHtml
} from '../../packages/shared/dist/index.js';

describe('DT20: Stash Insurance & Replacement Valuation Unit Tests', () => {
  const sampleStash = [
    {
      id: 'stash-1',
      userId: 'user-val-1',
      kitId: 'kit-1',
      status: 'built',
      pricePaid: 60.0,
      currency: 'USD',
      notes: 'Custom painted with Vallejo acrylics, water decals applied',
      kit: {
        id: 'kit-1',
        name: 'RG 1/144 Hi-Nu Gundam',
        brand: 'Bandai Spirits',
        scale: '1/144',
        grade: 'Real Grade',
        category: 'Gunpla',
        boxArtUrl: 'https://images.unsplash.com/photo-sample'
      }
    },
    {
      id: 'stash-2',
      userId: 'user-val-1',
      kitId: 'kit-2',
      status: 'unbuilt',
      pricePaid: 40.0,
      currency: 'USD',
      notes: 'Sealed mint in box',
      kit: {
        id: 'kit-2',
        name: 'Supermarine Spitfire Mk.IXc',
        brand: 'Tamiya',
        scale: '1/48',
        grade: 'Aircraft',
        category: 'Militar',
        boxArtUrl: ''
      }
    },
    {
      id: 'stash-3',
      userId: 'user-val-1',
      kitId: 'kit-3',
      status: 'in_progress',
      pricePaid: 80.0,
      currency: 'USD',
      notes: 'Inner frame finished, awaiting armor panel lining',
      kit: {
        id: 'kit-3',
        name: 'MG 1/100 Sazabi Ver.Ka',
        brand: 'Bandai Spirits',
        scale: '1/100',
        grade: 'Master Grade',
        category: 'Gunpla',
        boxArtUrl: ''
      }
    },
    {
      id: 'stash-4',
      userId: 'user-val-1',
      kitId: 'kit-4',
      status: 'wishlist',
      pricePaid: 120.0,
      currency: 'USD',
      notes: 'Grail kit planned for holiday season',
      kit: {
        id: 'kit-4',
        name: 'PG Unleashed 1/60 RX-78-2 Gundam',
        brand: 'Bandai Spirits',
        scale: '1/60',
        grade: 'Perfect Grade',
        category: 'Gunpla',
        boxArtUrl: ''
      }
    }
  ];

  test('1. calculateStashValuation applies correct insurance replacement multipliers', () => {
    const summary = calculateStashValuation(sampleStash, 'user-val-1', 'Test Modeler', 'USD');

    assert.equal(summary.userId, 'user-val-1');
    assert.equal(summary.userName, 'Test Modeler');
    assert.equal(summary.currency, 'USD');

    // Built item: 60 * 1.5 = 90
    const builtItem = summary.items.find(i => i.status === 'built');
    assert.ok(builtItem);
    assert.equal(builtItem.declaredPricePaid, 60.0);
    assert.equal(builtItem.estimatedReplacementValue, 90.0);

    // Unbuilt item: 40 * 1.15 = 46
    const unbuiltItem = summary.items.find(i => i.status === 'unbuilt');
    assert.ok(unbuiltItem);
    assert.equal(unbuiltItem.declaredPricePaid, 40.0);
    assert.equal(unbuiltItem.estimatedReplacementValue, 46.0);

    // In progress item: 80 * 1.25 = 100
    const wipItem = summary.items.find(i => i.status === 'in_progress');
    assert.ok(wipItem);
    assert.equal(wipItem.declaredPricePaid, 80.0);
    assert.equal(wipItem.estimatedReplacementValue, 100.0);

    // Active portfolio total should include built (90) + unbuilt (46) + wip (100) = 236
    assert.equal(summary.totalReplacementEstimated, 236.0);
    // Declared acquisition total: 60 + 40 + 80 = 180
    assert.equal(summary.totalAcquisitionDeclared, 180.0);

    // Count checks
    assert.equal(summary.valuationPortfolioTotalKits, 3); // excludes wishlist from active collection
    assert.equal(summary.builtVitrinesCount, 1);
    assert.equal(summary.unbuiltStashCount, 1);
    assert.equal(summary.inProgressCount, 1);
    assert.equal(summary.wishlistCount, 1);
  });

  test('2. calculateStashValuation computes brand and category breakdowns', () => {
    const summary = calculateStashValuation(sampleStash, 'user-val-1', 'Test Modeler', 'USD');

    assert.ok(summary.categoryBreakdown['Gunpla']);
    assert.equal(summary.categoryBreakdown['Gunpla'].count, 2); // 1 built + 1 in_progress (wishlist excluded)
    assert.equal(summary.categoryBreakdown['Gunpla'].totalValue, 190.0); // 90 + 100

    assert.ok(summary.brandBreakdown['Bandai Spirits']);
    assert.equal(summary.brandBreakdown['Bandai Spirits'].count, 2);
    assert.equal(summary.brandBreakdown['Bandai Spirits'].totalValue, 190.0);

    assert.ok(summary.brandBreakdown['Tamiya']);
    assert.equal(summary.brandBreakdown['Tamiya'].count, 1);
    assert.equal(summary.brandBreakdown['Tamiya'].totalValue, 46.0);
  });

  test('3. calculateStashValuation falls back safely when prices are omitted', () => {
    const noPriceStash = [
      {
        id: 'stash-empty',
        userId: 'user-val-2',
        kitId: 'kit-empty',
        status: 'unbuilt',
        kit: {
          id: 'kit-empty',
          name: 'HGUC 1/144 GM',
          brand: 'Bandai Spirits',
          scale: '1/144',
          category: 'Gunpla'
        }
      }
    ];

    const summary = calculateStashValuation(noPriceStash, 'user-val-2', undefined, 'EUR');
    assert.equal(summary.currency, 'EUR');
    assert.equal(summary.valuationPortfolioTotalKits, 1);
    // Fallback baseline price 35.0 * 1.15 = 40.25
    assert.equal(summary.totalAcquisitionDeclared, 35.0);
    assert.equal(summary.totalReplacementEstimated, 40.25);
  });

  test('4. generateInsuranceReportHtml produces formal printable layout with print styling', () => {
    const summary = calculateStashValuation(sampleStash, 'user-val-1', 'Kira Yamato', 'USD');
    const html = generateInsuranceReportHtml(summary, {
      insurancePolicyNumber: 'PLAMO-POL-2026-99',
      tenantName: 'PlamoScale Pro',
      includeBuilt: true,
      includeUnbuilt: true,
      includeInProgress: true,
      includeWishlist: false
    });

    assert.ok(html.includes('TASACION PATRIMONIAL'));
    assert.ok(html.includes('PLAMO-POL-2026-99'));
    assert.ok(html.includes('Kira Yamato'));
    assert.ok(html.includes('@media print'));
    assert.ok(html.includes('RG 1/144 Hi-Nu Gundam'));
    assert.ok(html.includes('Supermarine Spitfire Mk.IXc'));
    // Wishlist should be excluded per config
    assert.ok(!html.includes('PG Unleashed 1/60 RX-78-2 Gundam'));
    assert.ok(html.includes('Firma del Coleccionista / Titular'));
    assert.ok(html.includes('Perito Valuador / Sello de Plataforma'));
  });

  test('5. generateInsuranceReportHtml includes wishlist when requested', () => {
    const summary = calculateStashValuation(sampleStash, 'user-val-1', 'Amuro Ray', 'USD');
    const html = generateInsuranceReportHtml(summary, {
      tenantName: 'GunplaJunkies',
      includeBuilt: true,
      includeUnbuilt: true,
      includeInProgress: true,
      includeWishlist: true
    });

    assert.ok(html.includes('GunplaJunkies'));
    assert.ok(html.includes('Amuro Ray'));
    assert.ok(html.includes('PG Unleashed 1/60 RX-78-2 Gundam'));
  });
});
