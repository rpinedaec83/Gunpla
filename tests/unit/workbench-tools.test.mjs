import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateToolWear,
  calculateWorkbenchToolsSummary,
  getStarterToolsForUser,
  TOOL_CATEGORIES
} from '../../packages/shared/dist/index.js';

describe('DT24: Workbench Tool Inventory & Blade Wear Tracker Unit Tests', () => {
  test('1. Constants validation: TOOL_CATEGORIES includes essential modeling tool types', () => {
    assert.ok(Array.isArray(TOOL_CATEGORIES));
    assert.ok(TOOL_CATEGORIES.includes('nippers'));
    assert.ok(TOOL_CATEGORIES.includes('knives'));
    assert.ok(TOOL_CATEGORIES.includes('chisels'));
    assert.ok(TOOL_CATEGORIES.includes('abrasives'));
    assert.ok(TOOL_CATEGORIES.includes('airbrush'));
    assert.ok(TOOL_CATEGORIES.includes('rotary-drill'));
    assert.ok(TOOL_CATEGORIES.includes('general'));
  });

  test('2. calculateToolWear: verifies wear percentage, remaining lifespan, and dull warnings', () => {
    // 2.1 Brand new tool (0 cuts out of 400)
    const newTool = {
      id: 'tool-test-1',
      userId: 'user-builder',
      name: 'GodHand SPN-120',
      brand: 'GodHand',
      category: 'nippers',
      status: 'active',
      condition: 'new',
      wear: {
        enabled: true,
        currentCutsCount: 0,
        maxRecommendedCuts: 400,
        sessionsCount: 0,
        totalBladesConsumed: 0
      },
      maintenanceLog: []
    };
    const wearNew = calculateToolWear(newTool);
    assert.equal(wearNew.wearPercentage, 0);
    assert.equal(wearNew.remainingLifespanPct, 100);
    assert.equal(wearNew.conditionSuggestion, 'new');
    assert.equal(wearNew.isDullWarning, false);

    // 2.2 Mid-life tool (200 cuts out of 400 -> 50% wear)
    const midTool = {
      ...newTool,
      wear: {
        ...newTool.wear,
        currentCutsCount: 200,
        sessionsCount: 5
      }
    };
    const wearMid = calculateToolWear(midTool);
    assert.equal(wearMid.wearPercentage, 50);
    assert.equal(wearMid.remainingLifespanPct, 50);
    assert.equal(wearMid.conditionSuggestion, 'fair');
    assert.equal(wearMid.isDullWarning, false);

    // 2.3 Worn tool (340 cuts out of 400 -> 85% wear, triggers dull alert)
    const wornTool = {
      ...newTool,
      wear: {
        ...newTool.wear,
        currentCutsCount: 340,
        sessionsCount: 12
      }
    };
    const wearWorn = calculateToolWear(wornTool);
    assert.equal(wearWorn.wearPercentage, 85);
    assert.equal(wearWorn.remainingLifespanPct, 15);
    assert.equal(wearWorn.conditionSuggestion, 'worn');
    assert.equal(wearWorn.isDullWarning, true);
    assert.ok(wearWorn.alertMessage?.includes('Desgaste avanzado'));

    // 2.4 Exhausted tool (420 cuts out of 400 -> capped at 100% wear, 0% lifespan remaining)
    const exhaustedTool = {
      ...newTool,
      wear: {
        ...newTool.wear,
        currentCutsCount: 420,
        sessionsCount: 18
      }
    };
    const wearExhausted = calculateToolWear(exhaustedTool);
    assert.equal(wearExhausted.wearPercentage, 100);
    assert.equal(wearExhausted.remainingLifespanPct, 0);
    assert.equal(wearExhausted.conditionSuggestion, 'needs_replacement');
    assert.equal(wearExhausted.isDullWarning, true);
    assert.ok(wearExhausted.alertMessage?.includes('¡Filo agotado'));

    // 2.5 Non-wearing permanent tool (wear.enabled = false)
    const permanentTool = {
      id: 'tool-test-perm',
      userId: 'user-builder',
      name: 'Stainless Steel Tweezers',
      brand: 'Tamiya',
      category: 'general',
      condition: 'good',
      status: 'active',
      wear: {
        enabled: false,
        currentCutsCount: 1000,
        maxRecommendedCuts: 0,
        sessionsCount: 50,
        totalBladesConsumed: 0
      },
      maintenanceLog: []
    };
    const wearPerm = calculateToolWear(permanentTool);
    assert.equal(wearPerm.wearPercentage, 0);
    assert.equal(wearPerm.remainingLifespanPct, 100);
    assert.equal(wearPerm.isDullWarning, false);
    assert.equal(wearPerm.conditionSuggestion, 'good');
  });

  test('3. calculateWorkbenchToolsSummary: aggregates KPIs and category counts', () => {
    const mockTools = [
      {
        id: 't1',
        userId: 'u1',
        name: 'GodHand SPN-120',
        brand: 'GodHand',
        category: 'nippers',
        status: 'active',
        condition: 'worn',
        wear: {
          enabled: true,
          currentCutsCount: 360, // 90% -> worn
          maxRecommendedCuts: 400,
          sessionsCount: 10,
          totalBladesConsumed: 2
        },
        maintenanceLog: []
      },
      {
        id: 't2',
        userId: 'u1',
        name: 'Olfa AK-4',
        brand: 'Olfa',
        category: 'knives',
        status: 'active',
        condition: 'needs_replacement',
        wear: {
          enabled: true,
          currentCutsCount: 220, // 110% -> needs_replacement
          maxRecommendedCuts: 200,
          sessionsCount: 8,
          totalBladesConsumed: 1
        },
        maintenanceLog: []
      },
      {
        id: 't3',
        userId: 'u1',
        name: 'BMC Chisel 0.15mm',
        brand: 'BMC',
        category: 'chisels',
        status: 'active',
        condition: 'good',
        wear: {
          enabled: true,
          currentCutsCount: 50, // 25% -> good
          maxRecommendedCuts: 200,
          sessionsCount: 3,
          totalBladesConsumed: 0
        },
        maintenanceLog: []
      },
      {
        id: 't4',
        userId: 'u1',
        name: 'Retired Backup Nipper',
        brand: 'Plats',
        category: 'nippers',
        status: 'retired',
        condition: 'fair',
        wear: {
          enabled: false,
          currentCutsCount: 0,
          maxRecommendedCuts: 0,
          sessionsCount: 0,
          totalBladesConsumed: 0
        },
        maintenanceLog: []
      }
    ];

    const summary = calculateWorkbenchToolsSummary(mockTools);
    assert.equal(summary.totalTools, 4);
    assert.equal(summary.activeToolsCount, 3);
    assert.equal(summary.wornToolsCount, 1);
    assert.equal(summary.needsReplacementCount, 1);
    assert.equal(summary.totalBladesConsumedAllTime, 3);
    assert.equal(summary.byCategory.nippers, 2);
    assert.equal(summary.byCategory.knives, 1);
    assert.equal(summary.byCategory.chisels, 1);
    assert.equal(summary.byCategory.abrasives, 0);
  });

  test('4. getStarterToolsForUser: generates standard modeling arsenal', () => {
    const starterTools = getStarterToolsForUser('user-newbie-123');
    assert.ok(Array.isArray(starterTools));
    assert.equal(starterTools.length, 4);

    const categories = starterTools.map(t => t.category);
    assert.ok(categories.includes('nippers'));
    assert.ok(categories.includes('knives'));
    assert.ok(categories.includes('abrasives'));
    assert.ok(categories.includes('airbrush'));

    starterTools.forEach(tool => {
      assert.equal(tool.userId, 'user-newbie-123');
      assert.ok(tool.id.startsWith('tool-'));
      assert.equal(tool.status, 'active');
      assert.ok(typeof tool.wear.enabled === 'boolean');
      assert.ok(Array.isArray(tool.maintenanceLog));
    });
  });
});
