import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScalematesSlug } from '../../apps/api/dist/slices/catalog-scalemates/scalemates-parser.js';

test('Scalemates Parser Unit Tests', async (t) => {
  await t.test('correctly parses Bandai RG kit URL', () => {
    const url = 'https://www.scalemates.com/kits/bandai-spirits-5061919-rg-1-144-hi-nu-gundam--1359732';
    const parsed = parseScalematesSlug(url);

    assert.equal(parsed.brand, 'Bandai Spirits');
    assert.equal(parsed.scale, '1/144');
    assert.equal(parsed.grade, 'RG (Real Grade)');
    assert.equal(parsed.category, 'gunpla-mecha');
    assert.equal(parsed.kitNumber, '5061919');
    assert.ok(parsed.name?.includes('Hi Nu Gundam'));
  });

  await t.test('correctly parses Tamiya Military Tank kit URL', () => {
    const url = 'https://www.scalemates.com/kits/tamiya-35216-tiger-i--132891';
    const parsed = parseScalematesSlug(url);

    assert.equal(parsed.brand, 'Tamiya');
    assert.equal(parsed.scale, '1/35');
    assert.equal(parsed.category, 'military');
    assert.equal(parsed.kitNumber, '35216');
    assert.ok(parsed.name?.includes('Tiger'));
  });

  await t.test('correctly parses Aviation Spitfire kit URL', () => {
    const url = 'https://www.scalemates.com/kits/tamiya-61119-supermarine-spitfire-mki--1159987';
    const parsed = parseScalematesSlug(url);

    assert.equal(parsed.brand, 'Tamiya');
    assert.equal(parsed.scale, '1/48');
    assert.equal(parsed.category, 'aviation');
    assert.equal(parsed.kitNumber, '61119');
    assert.ok(parsed.name?.includes('Spitfire'));
  });

  await t.test('rejects non-URL input with error', () => {
    assert.throws(
      () => parseScalematesSlug('not-a-valid-url'),
      /Formato de URL inválido/
    );
  });

  await t.test('rejects non-scalemates domain with error', () => {
    assert.throws(
      () => parseScalematesSlug('https://www.google.com/search?q=gunpla'),
      /El dominio debe ser de scalemates\.com/
    );
  });
});
