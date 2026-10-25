import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRubricScores, computeJudgeMetrics } from '../../apps/api/dist/slices/community/community.slice.js';

test('Contest Judge Rubrics & Score Metrics Unit Tests', async (t) => {
  await t.test('accepts valid 4-criteria rubric scores', () => {
    const validScores = {
      assembly: 10,
      painting: 9,
      finish: 8,
      creativity: 10
    };
    const result = validateRubricScores(validScores);
    assert.equal(result.valid, true);
    assert.deepEqual(result.scores, {
      assembly: 10,
      painting: 9,
      finish: 8,
      creativity: 10
    });
  });

  await t.test('rejects scores when a criterion is out of range (<1 or >10)', () => {
    // Score > 10
    const overScore = { assembly: 15, painting: 8, finish: 8, creativity: 8 };
    const resOver = validateRubricScores(overScore);
    assert.equal(resOver.valid, false);
    assert.ok(resOver.error?.includes('entre 1 y 10'));

    // Score < 1
    const underScore = { assembly: 0, painting: 8, finish: 8, creativity: 8 };
    const resUnder = validateRubricScores(underScore);
    assert.equal(resUnder.valid, false);

    // Score is NaN
    const nanScore = { assembly: 'high', painting: 8, finish: 8, creativity: 8 };
    const resNaN = validateRubricScores(nanScore);
    assert.equal(resNaN.valid, false);

    // Missing criterion
    const missingScore = { assembly: 9, painting: 9 };
    const resMissing = validateRubricScores(missingScore);
    assert.equal(resMissing.valid, false);

    // Null or undefined
    assert.equal(validateRubricScores(null).valid, false);
    assert.equal(validateRubricScores(undefined).valid, false);
  });

  await t.test('correctly calculates judge summary metrics and average', () => {
    // Single judge evaluation: 10+9+9+10 = 38
    const singleJudge = [{ totalScore: 38 }];
    const metrics1 = computeJudgeMetrics(singleJudge);
    assert.equal(metrics1.judgeCount, 1);
    assert.equal(metrics1.judgeScoreAverage, 38.0);

    // Two judges: 38 and 35 -> sum = 73, average = 36.5
    const twoJudges = [{ totalScore: 38 }, { totalScore: 35 }];
    const metrics2 = computeJudgeMetrics(twoJudges);
    assert.equal(metrics2.judgeCount, 2);
    assert.equal(metrics2.judgeScoreAverage, 36.5);

    // Three judges: 40, 37, 36 -> sum = 113, average = 37.666... -> rounded to 37.7
    const threeJudges = [{ totalScore: 40 }, { totalScore: 37 }, { totalScore: 36 }];
    const metrics3 = computeJudgeMetrics(threeJudges);
    assert.equal(metrics3.judgeCount, 3);
    assert.equal(metrics3.judgeScoreAverage, 37.7);

    // Empty array fallback
    const emptyMetrics = computeJudgeMetrics([]);
    assert.equal(emptyMetrics.judgeCount, 0);
    assert.equal(emptyMetrics.judgeScoreAverage, 0);
  });
});
