import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getShopsFromDb,
  getTenantShopsFromDb,
  getTenantNewsFromDb,
  getFeaturedPhotosFromDb
} from '../../apps/api/dist/slices/community/community.slice.js';

test('DT29: Master Shops Catalog, Tenant Trusted Shops & Discount Codes Unit Tests', async (t) => {
  await t.test('1. Master Shops Catalog contains verified global stores', () => {
    const shops = getShopsFromDb();
    assert.ok(shops.length >= 3, 'Must have at least 3 starter shops in master catalog');
    
    const gunplaPeru = shops.find(s => s.id === 'shop-gunpla-peru-store');
    assert.ok(gunplaPeru, 'Must find Hobby & Gunpla Peru Store in master catalog');
    assert.equal(gunplaPeru.isVerified, true);
    assert.ok(gunplaPeru.specialties.includes('Real Grade (RG)'));

    const scaleArt = shops.find(s => s.id === 'shop-scale-hobby-art');
    assert.ok(scaleArt, 'Must find Scale Hobby Art in master catalog');
    assert.equal(scaleArt.city, 'Arequipa / Lima');
  });

  await t.test('2. Tenant Shops Relation defines community-specific trusted shops and discounts', () => {
    const allLinks = getTenantShopsFromDb();
    assert.ok(allLinks.length >= 4, 'Must have initial tenant shop links');

    // GunplaJunkies trusted shops & exclusive coupon codes
    const gjLinks = allLinks.filter(l => l.tenantSlug === 'gunplajunkies');
    assert.ok(gjLinks.length >= 2, 'GunplaJunkies must have trusted shops');
    const gjMainShop = gjLinks.find(l => l.shopId === 'shop-gunpla-peru-store');
    assert.ok(gjMainShop);
    assert.equal(gjMainShop.isTrusted, true);
    assert.equal(gjMainShop.discountCode, 'GUNPLA10');
    assert.ok(gjMainShop.discountDescription.includes('10%'));
    assert.equal(gjMainShop.badgeLabel, 'Tienda Oficial Aliada');

    // PlamoScale trusted shops & exclusive coupon codes
    const psLinks = allLinks.filter(l => l.tenantSlug === 'plamoscale');
    assert.ok(psLinks.length >= 2, 'PlamoScale must have trusted shops');
    const psMainShop = psLinks.find(l => l.shopId === 'shop-scale-hobby-art');
    assert.ok(psMainShop);
    assert.equal(psMainShop.isTrusted, true);
    assert.equal(psMainShop.discountCode, 'PLAMO7');
    assert.ok(psMainShop.discountDescription.includes('7%'));
    assert.equal(psMainShop.badgeLabel, 'Aliado Escala Militar');
  });

  await t.test('3. Community News Articles are scoped per tenant with category classification', () => {
    const allNews = getTenantNewsFromDb();
    assert.ok(allNews.length >= 4, 'Must have starter community news');

    // GunplaJunkies news
    const gjNews = allNews.filter(n => n.tenantSlug === 'gunplajunkies');
    assert.ok(gjNews.length >= 2);
    assert.ok(gjNews.some(n => n.category === 'lanzamientos' && n.title.includes('RG 2.0')));
    assert.ok(gjNews.some(n => n.category === 'tecnicas' && n.title.includes('Panel Lining')));

    // PlamoScale news
    const psNews = allNews.filter(n => n.tenantSlug === 'plamoscale');
    assert.ok(psNews.length >= 2);
    assert.ok(psNews.some(n => n.category === 'lanzamientos' && n.title.includes('Panzer')));
    assert.ok(psNews.some(n => n.category === 'tecnicas' && n.title.includes('Weathering')));
  });

  await t.test('4. Community Featured Photos showcase collector works per community', () => {
    const allPhotos = getFeaturedPhotosFromDb();
    assert.ok(allPhotos.length >= 4, 'Must have featured photos for community landing galleries');

    const gjPhotos = allPhotos.filter(p => p.tenantSlug === 'gunplajunkies');
    assert.ok(gjPhotos.length >= 2);
    assert.ok(gjPhotos.some(p => p.builderUsername === 'aperich'));

    const psPhotos = allPhotos.filter(p => p.tenantSlug === 'plamoscale');
    assert.ok(psPhotos.length >= 2);
    assert.ok(psPhotos.some(p => p.builderUsername === 'dcampos' || p.builderUsername === 'marcus_plamo'));
  });
});
