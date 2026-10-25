import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWhatsAppInquiry } from '../../apps/api/dist/slices/build-logs/builds.slice.js';

test('Direct WhatsApp Community Inquiries Unit Tests', async (t) => {
  await t.test('generates prefilled message for paint_recipe inquiries', () => {
    const res = generateWhatsAppInquiry({
      builderUsername: 'aperich',
      builderDisplayName: 'Aldo Perich',
      targetWhatsapp: '+51 987 654 321',
      itemTitle: 'RG Hi-Nu Gundam Titanium Finish',
      tenantName: 'GunplaJunkies',
      inquiryType: 'paint_recipe',
      clientName: 'Roberto',
      itemUrl: 'https://gunplajunkies.com/#build-rg-hinu'
    });

    assert.equal(res.builderUsername, 'aperich');
    assert.equal(res.builderDisplayName, 'Aldo Perich');
    assert.equal(res.inquiryType, 'paint_recipe');
    assert.ok(res.prefilledMessage.includes('¡Hola Aldo Perich! Soy Roberto.'));
    assert.ok(res.prefilledMessage.includes('recetas de pintura o diluciones'));
    assert.ok(res.prefilledMessage.includes('RG Hi-Nu Gundam Titanium Finish'));
    assert.ok(res.prefilledMessage.includes('https://gunplajunkies.com/#build-rg-hinu'));
    assert.ok(res.whatsappUrl.startsWith('https://wa.me/51987654321?text='));
    assert.ok(res.whatsappUrl.includes(encodeURIComponent('recetas de pintura')));
  });

  await t.test('generates prefilled message for custom_commission inquiries', () => {
    const res = generateWhatsAppInquiry({
      builderUsername: 'fog1labs1',
      builderDisplayName: 'Fernando Garaicoa',
      targetWhatsapp: '+51 999 888 777',
      itemTitle: 'Tiger I Kursk 1943',
      tenantName: 'PlamoScale',
      inquiryType: 'custom_commission',
      clientName: 'Carlos'
    });

    assert.equal(res.inquiryType, 'custom_commission');
    assert.ok(res.prefilledMessage.includes('¡Hola Fernando Garaicoa! Soy Carlos.'));
    assert.ok(res.prefilledMessage.includes('cotizar un encargo de pintura / armado personalizado'));
    assert.ok(res.prefilledMessage.includes('¿Tienes cupos disponibles en tu taller?'));
    assert.equal(res.whatsappUrl.split('?')[0], 'https://wa.me/51999888777');
  });

  await t.test('generates prefilled message for purchase_build inquiries', () => {
    const res = generateWhatsAppInquiry({
      builderUsername: 'dcampos',
      builderDisplayName: 'Daniel Campos',
      targetWhatsapp: '+51 912 345 678',
      itemTitle: 'MG Barbatos Custom',
      tenantName: 'PlamoScale',
      inquiryType: 'purchase_build'
    });

    assert.equal(res.inquiryType, 'purchase_build');
    assert.ok(res.prefilledMessage.includes('¡Hola Daniel Campos!'));
    assert.ok(res.prefilledMessage.includes('adquirir o consultar si tienes a la venta tu maqueta'));
    assert.ok(res.prefilledMessage.includes('MG Barbatos Custom'));
  });

  await t.test('handles general inquiry type and preserves chat.whatsapp.com group invites', () => {
    const res = generateWhatsAppInquiry({
      builderUsername: 'community',
      builderDisplayName: 'Comunidad PlamoScale',
      targetWhatsapp: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
      itemTitle: 'Showcase Gallery Photo #12',
      tenantName: 'PlamoScale',
      inquiryType: 'general'
    });

    assert.equal(res.inquiryType, 'general');
    assert.equal(res.whatsappUrl, 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx');
    assert.ok(res.prefilledMessage.includes('Showcase Gallery Photo #12'));
  });
});
