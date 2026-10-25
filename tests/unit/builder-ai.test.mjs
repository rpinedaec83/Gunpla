import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeRunnerPhotoOffline,
  analyzeNubPhotoOffline
} from '../../packages/shared/dist/index.js';

test('AI Workbench Smart Builder Assistant (DT19) Unit Tests', async (t) => {
  await t.test('1. Pure Offline Runner Inspection (analyzeRunnerPhotoOffline)', async (st) => {
    await st.test('analyzes default runner cleanly', () => {
      const res = analyzeRunnerPhotoOffline();
      assert.equal(res.runnerLetter, 'A');
      assert.ok(res.totalPartsDetected > 0);
      assert.equal(res.totalPartsDetected, res.remainingPartsCount + res.removedPartsCount);
      assert.ok(res.completionPercentage >= 0 && res.completionPercentage <= 100);
      assert.equal(res.aiEngine, 'expert-local-rules');
      assert.ok(Array.isArray(res.parts));
      assert.equal(res.parts.length, res.totalPartsDetected);
      assert.ok(res.parts[0].partNumber.startsWith('A'));
      assert.ok(res.recommendations.length > 0);
      assert.ok(res.inspectedAt);
    });

    await st.test('normalizes custom runner letters and kit names', () => {
      const resB = analyzeRunnerPhotoOffline('b', 'HG 1/144 Aerial Gundam');
      assert.equal(resB.runnerLetter, 'B');
      assert.equal(resB.parts[0].partNumber, 'B1');

      const resD = analyzeRunnerPhotoOffline('D2', 'MG Barbatos');
      assert.equal(resD.runnerLetter, 'D');
      assert.equal(resD.parts[0].partNumber, 'D1');
    });

    await st.test('part status and completion percentage calculation', () => {
      const res = analyzeRunnerPhotoOffline('C');
      const expectedCompletion = Math.round((res.removedPartsCount / res.totalPartsDetected) * 100);
      assert.equal(res.completionPercentage, expectedCompletion);

      const intactParts = res.parts.filter((p) => p.status === 'intact');
      const removedParts = res.parts.filter((p) => p.status === 'removed');
      assert.equal(intactParts.length, res.remainingPartsCount);
      assert.equal(removedParts.length, res.removedPartsCount);
    });
  });

  await t.test('2. Pure Offline Nub Inspection (analyzeNubPhotoOffline)', async (st) => {
    await st.test('evaluates default part cut quality with valid score and diagnosis', () => {
      const res = analyzeNubPhotoOffline();
      assert.ok(res.qualityScore >= 0 && res.qualityScore <= 100);
      assert.ok(['clean_cut', 'protruding_nub', 'stress_mark', 'gouge', 'under_sanded'].includes(res.diagnosis));
      assert.ok(['none', 'minor', 'moderate', 'severe'].includes(res.severity));
      assert.ok(res.headline);
      assert.ok(res.detailedAnalysis);
      assert.equal(res.aiEngine, 'expert-local-rules');
      assert.ok(typeof res.stressMarkPresent === 'boolean');
      assert.ok(res.inspectedAt);
    });

    await st.test('includes specific plastic type in analysis', () => {
      const resABS = analyzeNubPhotoOffline('Inner Frame Arm Joint', 'ABS');
      assert.ok(resABS.detailedAnalysis.includes('ABS'));

      const resKPS = analyzeNubPhotoOffline('KPS Torso Core', 'KPS');
      assert.ok(resKPS.detailedAnalysis.includes('KPS'));
    });

    await st.test('correction steps are ordered and detailed', () => {
      const res = analyzeNubPhotoOffline('Leg Armor', 'PS');
      assert.ok(Array.isArray(res.correctionSteps));
      assert.ok(res.correctionSteps.length >= 3);

      for (let i = 0; i < res.correctionSteps.length; i++) {
        const step = res.correctionSteps[i];
        assert.equal(step.stepOrder, i + 1);
        assert.ok(step.tool);
        assert.ok(step.instruction);
      }
    });

    await st.test('sanding grit sequence is monotonically increasing', () => {
      const res = analyzeNubPhotoOffline();
      assert.ok(Array.isArray(res.sandingGritSequence));
      assert.ok(res.sandingGritSequence.length >= 3);

      for (let i = 1; i < res.sandingGritSequence.length; i++) {
        assert.ok(
          res.sandingGritSequence[i] > res.sandingGritSequence[i - 1],
          `Grit ${res.sandingGritSequence[i]} must be finer than previous ${res.sandingGritSequence[i - 1]}`
        );
      }
    });
  });
});
