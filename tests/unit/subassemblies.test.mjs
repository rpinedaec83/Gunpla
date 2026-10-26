import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDefaultSubassemblies,
  calculateSubassemblyOverallProgress,
  generateSubassemblyWorksheetHtml
} from '../../packages/shared/dist/index.js';

describe('DT23: Parts Breakdown & Assembly Subassembly Cards Unit Tests', () => {
  test('1. generateDefaultSubassemblies produces anatomical blocks per model category', () => {
    // 1.1 Gunpla / Sci-Fi
    const gunplaCards = generateDefaultSubassemblies('build-test-1', 'gunpla', 'HG');
    assert.equal(gunplaCards.length, 7, 'Gunpla template must generate 7 anatomical subassemblies');
    const expectedGunplaTypes = ['head', 'torso', 'arms', 'waist', 'legs', 'backpack', 'weapons'];
    assert.deepEqual(gunplaCards.map(c => c.type), expectedGunplaTypes);
    assert.ok(gunplaCards.every(c => c.buildId === 'build-test-1'));
    assert.ok(gunplaCards.every(c => c.stages && c.stages.cut === false));

    // 1.2 Military Armor / Tanks
    const militaryCards = generateDefaultSubassemblies('build-test-2', 'military', '1/35');
    assert.equal(militaryCards.length, 5, 'Military armor template must generate 5 subassemblies');
    assert.ok(militaryCards.some(c => c.name.includes('Orugas') || c.name.includes('Tracks')));
    assert.ok(militaryCards.some(c => c.name.includes('Torreta') || c.type === 'turret'));

    // 1.3 Aviation
    const aviationCards = generateDefaultSubassemblies('build-test-3', 'aviation', '1/48');
    assert.equal(aviationCards.length, 5, 'Aviation template must generate 5 subassemblies');
    assert.ok(aviationCards.some(c => c.type === 'cockpit'));
    assert.ok(aviationCards.some(c => c.type === 'wings'));

    // 1.4 Automotive
    const autoCards = generateDefaultSubassemblies('build-test-4', 'automotive', '1/24');
    assert.equal(autoCards.length, 4, 'Automotive template must generate 4 subassemblies');
    assert.ok(autoCards.some(c => c.type === 'engine'));
    assert.ok(autoCards.some(c => c.name.includes('Carrocería')));
  });

  test('2. Grade parts multiplier adjusts estimated parts count for higher complexity grades', () => {
    const hgCards = generateDefaultSubassemblies('build-hg', 'gunpla', 'HG');
    const mgCards = generateDefaultSubassemblies('build-mg', 'gunpla', 'MG');
    const pgCards = generateDefaultSubassemblies('build-pg', 'gunpla', 'PG');

    const hgTotalParts = hgCards.reduce((acc, c) => acc + c.partCountEstimated, 0);
    const mgTotalParts = mgCards.reduce((acc, c) => acc + c.partCountEstimated, 0);
    const pgTotalParts = pgCards.reduce((acc, c) => acc + c.partCountEstimated, 0);

    assert.ok(mgTotalParts > hgTotalParts, 'MG parts count must be higher than HG');
    assert.ok(pgTotalParts > mgTotalParts, 'PG parts count must be significantly higher than MG');
  });

  test('3. calculateSubassemblyOverallProgress computes total parts and phase completion percentages accurately', () => {
    // 3.1 Empty cards list
    const emptyProgress = calculateSubassemblyOverallProgress([]);
    assert.equal(emptyProgress.totalCards, 0);
    assert.equal(emptyProgress.completionPercentage, 0);

    // 3.2 2 cards, 5 stages each (10 stages total)
    const cards = [
      {
        id: 'sub-1',
        buildId: 'b1',
        name: 'Cabeza',
        type: 'head',
        icon: '🤖',
        runners: ['A', 'B'],
        partCountEstimated: 15,
        stages: { cut: true, cleaned: true, primed: true, painted: false, topcoated: false },
        customNotes: '',
        orderIndex: 0,
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 'sub-2',
        buildId: 'b1',
        name: 'Torso',
        type: 'torso',
        icon: '🥋',
        runners: ['A', 'C'],
        partCountEstimated: 25,
        stages: { cut: true, cleaned: false, primed: false, painted: false, topcoated: false },
        customNotes: '',
        orderIndex: 1,
        createdAt: '',
        updatedAt: ''
      }
    ];

    const progress = calculateSubassemblyOverallProgress(cards);
    assert.equal(progress.totalCards, 2);
    assert.equal(progress.totalPartsEstimated, 40);
    assert.equal(progress.totalStagesCount, 10);
    // sub-1 has 3 completed, sub-2 has 1 completed -> 4 / 10 = 40%
    assert.equal(progress.completedStagesCount, 4);
    assert.equal(progress.completionPercentage, 40);

    // Stage breakdown:
    // cut: 2/2 = 100%
    // cleaned: 1/2 = 50%
    // primed: 1/2 = 50%
    // painted: 0/2 = 0%
    // topcoated: 0/2 = 0%
    assert.equal(progress.stageBreakdown.cut.completed, 2);
    assert.equal(progress.stageBreakdown.cut.pct, 100);
    assert.equal(progress.stageBreakdown.cleaned.completed, 1);
    assert.equal(progress.stageBreakdown.cleaned.pct, 50);
    assert.equal(progress.stageBreakdown.painted.pct, 0);
  });

  test('4. generateSubassemblyWorksheetHtml generates printable A4 organizer sheet with cut guides', () => {
    const cards = generateDefaultSubassemblies('build-aperich-hinu', 'gunpla', 'RG');
    cards[0].stages.cut = true;
    cards[0].stages.cleaned = true;
    cards[0].customNotes = 'Chisel panel line 0.15mm en crestas laterales';
    cards[0].colorPaletteNotes = 'Gundam White C1, Titan Blue C65';

    const html = generateSubassemblyWorksheetHtml({
      buildTitle: 'RG Hi-Nu Gundam Titanium Custom',
      kitName: 'RG 1/144 Hi-Nu Gundam',
      scale: '1/144',
      grade: 'RG',
      builderName: 'aperich',
      tenantTitle: 'PlamoScale',
      cards
    });

    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('@page'));
    assert.ok(html.includes('@media print'));
    assert.ok(html.includes('RG Hi-Nu Gundam Titanium Custom'));
    assert.ok(html.includes('aperich'));
    assert.ok(html.includes('Cabeza / Head Unit'));
    assert.ok(html.includes('✂️ Cortar ficha para bandeja'));
    assert.ok(html.includes('Chisel panel line 0.15mm en crestas laterales'));
    assert.ok(html.includes('Gundam White C1, Titan Blue C65'));
    assert.ok(html.includes('1. Cortado'));
    assert.ok(html.includes('PlamoScale'));
  });
});
