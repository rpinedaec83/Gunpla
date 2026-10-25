import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDelimitedText,
  inferScaleCategory,
  normalizeStashStatus,
  normalizePaintStatus,
  extractStashRow,
  extractPaintRow
} from '../../apps/api/dist/slices/workbench-stash/workbench.slice.js';

test('Bulk Import Tool Unit Tests (CSV / TSV / Excel)', async (t) => {
  await t.test('parseDelimitedText parses comma-separated content with headers', () => {
    const csv = `Nombre,Marca,Escala,Grado,Estado
RG Hi-Nu Gundam,Bandai Spirits,1/144,RG,unbuilt
MG Eclipse Gundam,Bandai Spirits,1/100,MG,in_progress`;

    const records = parseDelimitedText(csv);
    assert.equal(records.length, 2);
    assert.equal(records[0].nombre, 'RG Hi-Nu Gundam');
    assert.equal(records[0].marca, 'Bandai Spirits');
    assert.equal(records[0].escala, '1/144');
    assert.equal(records[0].grado, 'RG');
    assert.equal(records[0].estado, 'unbuilt');

    assert.equal(records[1].nombre, 'MG Eclipse Gundam');
    assert.equal(records[1].estado, 'in_progress');
  });

  await t.test('parseDelimitedText parses semicolon-separated content (Excel español)', () => {
    const csv = `Codigo;Marca;Nombre;Cantidad;Estado
XF-1;Tamiya;Flat Black;2;owned
LP-11;Tamiya;Silver;1;low_stock`;

    const records = parseDelimitedText(csv);
    assert.equal(records.length, 2);
    assert.equal(records[0].codigo, 'XF-1');
    assert.equal(records[0].marca, 'Tamiya');
    assert.equal(records[0].nombre, 'Flat Black');
    assert.equal(records[0].cantidad, '2');
    assert.equal(records[0].estado, 'owned');

    assert.equal(records[1].codigo, 'LP-11');
    assert.equal(records[1].cantidad, '1');
    assert.equal(records[1].estado, 'low_stock');
  });

  await t.test('parseDelimitedText handles tab-delimited text (TSV / copy-paste spreadsheet)', () => {
    const tsv = "Name\tBrand\tScale\tStatus\nHG Calibarn\tBandai\t1/144\tbuilt";
    const records = parseDelimitedText(tsv);
    assert.equal(records.length, 1);
    assert.equal(records[0].name, 'HG Calibarn');
    assert.equal(records[0].brand, 'Bandai');
    assert.equal(records[0].scale, '1/144');
    assert.equal(records[0].status, 'built');
  });

  await t.test('parseDelimitedText handles quoted fields with delimiters', () => {
    const csv = `Name,Brand,Notes
"Gundam Aerial, Full Mechanics",Bandai,"Purchased at Yodobashi, Akihabara"
"Zaku II, Custom",Bandai,"Weathered with Tamiya weathering master"`;

    const records = parseDelimitedText(csv);
    assert.equal(records.length, 2);
    assert.equal(records[0].name, 'Gundam Aerial, Full Mechanics');
    assert.equal(records[0].notes, 'Purchased at Yodobashi, Akihabara');
    assert.equal(records[1].name, 'Zaku II, Custom');
    assert.equal(records[1].notes, 'Weathered with Tamiya weathering master');
  });

  await t.test('parseDelimitedText supports headerless rows with fallback col indices', () => {
    const text = `RG God Gundam,Bandai,1/144,RG
MG Barbatos,Bandai,1/100,MG`;

    const records = parseDelimitedText(text);
    assert.equal(records.length, 2);
    assert.equal(records[0].col_0, 'RG God Gundam');
    assert.equal(records[0].col_1, 'Bandai');
    assert.equal(records[0].col_2, '1/144');
    assert.equal(records[0].col_3, 'RG');
  });

  await t.test('inferScaleCategory correctly classifies diverse model types', () => {
    assert.equal(inferScaleCategory('RG Hi-Nu Gundam', 'Bandai', '1/144'), 'gunpla-mecha');
    assert.equal(inferScaleCategory('Evangelion Test Type-01', 'Meng', '1/100'), 'gunpla-mecha');
    assert.equal(inferScaleCategory('F-14D Super Tomcat', 'Tamiya', '1/48'), 'aviation');
    assert.equal(inferScaleCategory('Spitfire Mk.IXc', 'Eduard', '1/72'), 'aviation');
    assert.equal(inferScaleCategory('Tiger I Early Production', 'Dragon', '1/35'), 'military');
    assert.equal(inferScaleCategory('Panzer IV Ausf.H', 'Tamiya', '1/35'), 'military');
    assert.equal(inferScaleCategory('Porsche 911 GT3 RS', 'Tamiya', '1/24'), 'automotive');
    assert.equal(inferScaleCategory('Nissan Skyline GT-R R34', 'Aoshima', '1/24'), 'automotive');
    assert.equal(inferScaleCategory('Battleship Yamato 1945', 'Tamiya', '1/350'), 'naval');
  });

  await t.test('normalizeStashStatus normalizes multiple language variants', () => {
    assert.equal(normalizeStashStatus('sin armar'), 'unbuilt');
    assert.equal(normalizeStashStatus('en caja'), 'unbuilt');
    assert.equal(normalizeStashStatus('backlog'), 'unbuilt');
    assert.equal(normalizeStashStatus('wip'), 'in_progress');
    assert.equal(normalizeStashStatus('en progreso'), 'in_progress');
    assert.equal(normalizeStashStatus('armado'), 'built');
    assert.equal(normalizeStashStatus('completed'), 'built');
    assert.equal(normalizeStashStatus('wishlist'), 'wishlist');
    assert.equal(normalizeStashStatus('lista de deseos'), 'wishlist');
    assert.equal(normalizeStashStatus('for_trade'), 'for_trade');
    assert.equal(normalizeStashStatus('cambio'), 'for_trade');
    assert.equal(normalizeStashStatus(undefined), 'unbuilt');
  });

  await t.test('normalizePaintStatus normalizes multiple synonyms', () => {
    assert.equal(normalizePaintStatus('en rack'), 'owned');
    assert.equal(normalizePaintStatus('owned'), 'owned');
    assert.equal(normalizePaintStatus('low_stock'), 'low_stock');
    assert.equal(normalizePaintStatus('poco stock'), 'low_stock');
    assert.equal(normalizePaintStatus('wishlist'), 'wishlist');
    assert.equal(normalizePaintStatus('por comprar'), 'wishlist');
    assert.equal(normalizePaintStatus(undefined), 'owned');
  });

  await t.test('extractStashRow maps record fields accurately', () => {
    const row = extractStashRow({
      nombre: 'MG Sazabi Ver.Ka',
      marca: 'Bandai',
      escala: '1/100',
      grado: 'MG',
      estado: 'en caja',
      notas: 'Incluye photoetch',
      precio: '85.50'
    });

    assert.equal(row.name, 'MG Sazabi Ver.Ka');
    assert.equal(row.brand, 'Bandai');
    assert.equal(row.scale, '1/100');
    assert.equal(row.grade, 'MG');
    assert.equal(row.status, 'unbuilt');
    assert.equal(row.notes, 'Incluye photoetch');
    assert.equal(row.pricePaid, 85.5);
  });

  await t.test('extractPaintRow maps paint fields and normalizes code & quantity', () => {
    const row = extractPaintRow({
      codigo: 'xf-1',
      marca: 'Tamiya',
      nombre: 'Flat Black',
      cantidad: '3',
      estado: 'en rack',
      notas: 'Frascos acrílicos'
    });

    assert.equal(row.code, 'XF-1');
    assert.equal(row.brand, 'Tamiya');
    assert.equal(row.name, 'Flat Black');
    assert.equal(row.quantity, 3);
    assert.equal(row.status, 'owned');
    assert.equal(row.notes, 'Frascos acrílicos');
  });
});
