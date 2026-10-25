import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBuildCostSummary } from '../../packages/shared/dist/index.js';
import { INITIAL_BUILDS } from '../../apps/api/dist/seed/seed-builds.js';

test('Project Cost Accounting & Consumables Estimator Unit Tests', async (t) => {
  await t.test('1. Pure calculateBuildCostSummary calculation logic', async (st) => {
    await st.test('calculates empty expenses correctly', () => {
      const summary = calculateBuildCostSummary('build-empty', []);
      assert.equal(summary.buildId, 'build-empty');
      assert.equal(summary.totalCost, 0);
      assert.equal(summary.totalLaborHours, 0);
      assert.equal(summary.suggestedCommissionPrice, 0);
      assert.equal(summary.currency, 'USD');
      assert.equal(summary.breakdownByCategory.kit, 0);
      assert.equal(summary.breakdownByCategory.paint, 0);
      assert.equal(summary.breakdownByCategory.labor, 0);
    });

    await st.test('aggregates categories and labor hours with commission markup', () => {
      const sampleExpenses = [
        {
          id: 'exp-1',
          buildId: 'build-123',
          category: 'kit',
          name: 'MG 1/100 Barbatos',
          amount: 50.0,
          currency: 'USD',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp-2',
          buildId: 'build-123',
          category: 'paint',
          name: 'Tamiya XF-1 Flat Black',
          amount: 6.5,
          currency: 'USD',
          paintBottleFraction: 0.5,
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp-3',
          buildId: 'build-123',
          category: 'aftermarket',
          name: 'Photo-Etch Detail Set',
          amount: 15.0,
          currency: 'USD',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp-4',
          buildId: 'build-123',
          category: 'labor',
          name: 'Pintura y Envejecido',
          amount: 120.0,
          currency: 'USD',
          laborHours: 8.0,
          createdAt: new Date().toISOString()
        }
      ];

      const summary = calculateBuildCostSummary('build-123', sampleExpenses, 15, 'USD');

      assert.equal(summary.buildId, 'build-123');
      assert.equal(summary.totalCost, 191.5); // 50 + 6.5 + 15 + 120
      assert.equal(summary.breakdownByCategory.kit, 50.0);
      assert.equal(summary.breakdownByCategory.paint, 6.5);
      assert.equal(summary.breakdownByCategory.aftermarket, 15.0);
      assert.equal(summary.breakdownByCategory.labor, 120.0);
      assert.equal(summary.totalLaborHours, 8.0);

      // Materials = 50 + 6.5 + 15 = 71.5. Markup 1.25 = 89.38. Labor = 120. Suggested = 209.38
      assert.equal(summary.suggestedCommissionPrice, 209.38);
    });

    await st.test('calculates labor cost from hourlyRate if labor expense amount is zero', () => {
      const expenses = [
        {
          id: 'exp-labor-only',
          buildId: 'b-labor',
          category: 'labor',
          name: 'Armado basico',
          amount: 0,
          currency: 'PEN',
          laborHours: 10,
          createdAt: new Date().toISOString()
        }
      ];

      const summary = calculateBuildCostSummary('b-labor', expenses, 20, 'PEN');
      assert.equal(summary.currency, 'PEN');
      assert.equal(summary.totalLaborHours, 10);
      // Labor cost = 10 * 20 = 200. Materials = 0. Suggested = 200.
      assert.equal(summary.suggestedCommissionPrice, 200);
    });
  });

  await t.test('2. Starter Seed Database Expenses Consistency', async (st) => {
    await st.test('build-aperich-hinu contains valid initial expenses', () => {
      const hinu = INITIAL_BUILDS.find(b => b.id === 'build-aperich-hinu');
      assert.ok(hinu, 'build-aperich-hinu must exist in seed');
      assert.ok(Array.isArray(hinu.expenses), 'hinu.expenses must be an array');
      assert.ok(hinu.expenses.length >= 3, 'hinu must have at least 3 starter expenses');

      const summary = calculateBuildCostSummary(hinu.id, hinu.expenses);
      assert.ok(summary.totalCost > 50, 'Total cost should exceed kit price');
      assert.ok(summary.breakdownByCategory.kit > 0, 'Kit category cost present');
      assert.ok(summary.breakdownByCategory.paint > 0, 'Paint category cost present');
      assert.ok(summary.suggestedCommissionPrice > summary.totalCost, 'Commission suggestion includes markup');
    });
  });

  await t.test('3. Expense Modification & Calculation Consistency', async (st) => {
    await st.test('adding and removing expense maintains correct totals', () => {
      const expenses = [
        { id: 'e1', buildId: 'b1', category: 'kit', name: 'Kit', amount: 30, currency: 'USD', createdAt: '' }
      ];
      let sum = calculateBuildCostSummary('b1', expenses);
      assert.equal(sum.totalCost, 30);

      // Add expense
      const newExp = { id: 'e2', buildId: 'b1', category: 'paint', name: 'Paint', amount: 10, currency: 'USD', createdAt: '' };
      expenses.push(newExp);
      sum = calculateBuildCostSummary('b1', expenses);
      assert.equal(sum.totalCost, 40);

      // Remove expense
      expenses.pop();
      sum = calculateBuildCostSummary('b1', expenses);
      assert.equal(sum.totalCost, 30);
    });
  });
});
