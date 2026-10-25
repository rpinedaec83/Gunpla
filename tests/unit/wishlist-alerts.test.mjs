import test from 'node:test';
import assert from 'node:assert/strict';
import { matchWishlistWithShopStock } from '../../apps/api/dist/slices/community/community.slice.js';

test('Wishlist Stock Alerts Unit Tests', async (t) => {
  const sampleShops = [
    {
      id: 'shop-test-1',
      name: 'Hobby & Gunpla Perú Store',
      description: 'Tienda de modelismo',
      country: 'Perú',
      city: 'Lima',
      whatsappUrl: 'https://wa.me/51999999999',
      catalogUrl: 'https://plamoscale.com/catalogo',
      specialties: ['Gunpla'],
      isVerified: true
    },
    {
      id: 'shop-test-2',
      name: 'Scale Hobby Art',
      description: 'Militar y Aviacion',
      country: 'Perú',
      city: 'Arequipa',
      whatsappUrl: 'https://wa.me/51888888888',
      specialties: ['Military'],
      isVerified: true
    }
  ];

  const sampleStock = [
    {
      id: 'stock-1',
      shopId: 'shop-test-1',
      kitId: 'kit-rg-hinu',
      kitName: 'RG 1/144 Hi-Nu Gundam',
      brand: 'Bandai Spirits',
      scale: '1/144',
      pricePEN: 240,
      inStock: true,
      stockCount: 3,
      discountPercentage: 5,
      promoLabel: '5% OFF',
      lastUpdated: '2026-10-25T00:00:00Z'
    },
    {
      id: 'stock-2',
      shopId: 'shop-test-2',
      kitId: 'kit-tamiya-tiger1',
      kitName: 'Tiger I Early Production',
      brand: 'Tamiya',
      scale: '1/35',
      pricePEN: 170,
      inStock: false, // Out of stock
      stockCount: 0,
      lastUpdated: '2026-10-25T00:00:00Z'
    }
  ];

  await t.test('matches wishlist items with available in-stock kits by exact kitId', () => {
    const stashItems = [
      {
        id: 'stash-item-1',
        userId: 'user-amuro',
        kitId: 'kit-rg-hinu',
        status: 'wishlist'
      }
    ];

    const alerts = matchWishlistWithShopStock(stashItems, sampleStock, sampleShops);
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].kitId, 'kit-rg-hinu');
    assert.equal(alerts[0].shopName, 'Hobby & Gunpla Perú Store');
    assert.equal(alerts[0].shopCity, 'Lima');
    assert.equal(alerts[0].pricePEN, 240);
    assert.equal(alerts[0].discountPercentage, 5);
    assert.equal(alerts[0].shopWhatsappUrl, 'https://wa.me/51999999999');
    assert.equal(alerts[0].inStock, true);
  });

  await t.test('ignores stash items with status other than wishlist', () => {
    const stashItems = [
      {
        id: 'stash-item-2',
        userId: 'user-amuro',
        kitId: 'kit-rg-hinu',
        status: 'unbuilt' // in stash backlog, not wishlist
      },
      {
        id: 'stash-item-3',
        userId: 'user-amuro',
        kitId: 'kit-rg-hinu',
        status: 'built' // completed
      }
    ];

    const alerts = matchWishlistWithShopStock(stashItems, sampleStock, sampleShops);
    assert.equal(alerts.length, 0, 'Non-wishlist items should not generate stock alerts');
  });

  await t.test('ignores stock items where inStock is false', () => {
    const stashItems = [
      {
        id: 'stash-item-4',
        userId: 'user-amuro',
        kitId: 'kit-tamiya-tiger1',
        status: 'wishlist'
      }
    ];

    const alerts = matchWishlistWithShopStock(stashItems, sampleStock, sampleShops);
    assert.equal(alerts.length, 0, 'Out-of-stock items should not generate stock alerts');
  });

  await t.test('fuzzy matches wishlist items by kit name when kitId is missing', () => {
    const stashItems = [
      {
        id: 'stash-item-5',
        userId: 'user-amuro',
        kitId: 'custom-unindexed-id',
        status: 'wishlist',
        kit: {
          id: 'custom-unindexed-id',
          name: 'RG Hi Nu Gundam',
          brand: 'Bandai'
        }
      }
    ];

    const alerts = matchWishlistWithShopStock(stashItems, sampleStock, sampleShops);
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].shopName, 'Hobby & Gunpla Perú Store');
    assert.equal(alerts[0].pricePEN, 240);
  });
});
