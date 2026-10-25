import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllSoundscapePresets,
  getSoundscapePreset,
  calculateTimerSeconds,
  WORKSHOP_SOUNDSCAPE_PRESETS
} from '../../packages/shared/dist/index.js';

describe('DT21: Workshop Soundscapes & Procedural Audio Generator Unit Tests', () => {
  test('1. getAllSoundscapePresets returns all 5 presets with complete layer metadata', () => {
    const presets = getAllSoundscapePresets();
    assert.equal(presets.length, 5);

    const expectedIds = [
      'lluvia-taller',
      'compresor-aerografo',
      'hangar-mecha',
      'lo-fi-beats',
      'jardin-zen'
    ];

    expectedIds.forEach(id => {
      const p = presets.find(item => item.id === id);
      assert.ok(p, `Preset ${id} must exist in catalog`);
      assert.ok(p.name, `Preset ${id} must have a name`);
      assert.ok(p.tag, `Preset ${id} must have a tag`);
      assert.ok(p.description, `Preset ${id} must have a description`);
      assert.ok(p.icon, `Preset ${id} must have an icon emoji`);
      assert.ok(p.color, `Preset ${id} must have a theme color`);
      assert.ok(Array.isArray(p.layers), `Preset ${id} layers must be an array`);
      assert.ok(p.layers.length >= 3, `Preset ${id} must contain at least 3 audio layers`);

      p.layers.forEach(layer => {
        assert.ok(layer.id, `Layer in ${id} must have an id`);
        assert.ok(layer.name, `Layer in ${id} must have a name`);
        assert.ok(['noise', 'drone', 'tone', 'texture'].includes(layer.type), `Layer type must be valid`);
        assert.ok(layer.defaultVolume >= 0.0 && layer.defaultVolume <= 1.0, `Layer defaultVolume must be 0-1`);
      });
    });
  });

  test('2. getSoundscapePreset retrieves individual presets correctly', () => {
    const rain = getSoundscapePreset('lluvia-taller');
    assert.ok(rain);
    assert.equal(rain.name, 'Lluvia en el Taller');
    assert.equal(rain.category, 'nature');

    const mecha = getSoundscapePreset('hangar-mecha');
    assert.ok(mecha);
    assert.equal(mecha.name, 'Hangar Sci-Fi Mecha');
    assert.equal(mecha.category, 'scifi');

    const lofi = getSoundscapePreset('lo-fi-beats');
    assert.ok(lofi);
    assert.equal(lofi.name, 'Lo-Fi Chillhop Taller');
    assert.equal(lofi.tempoBpm, 72);

    const nonexistent = getSoundscapePreset('unknown-soundscape');
    assert.equal(nonexistent, undefined);
  });

  test('3. calculateTimerSeconds computes correct focus intervals', () => {
    assert.equal(calculateTimerSeconds('none'), 0);
    assert.equal(calculateTimerSeconds('pomodoro-25'), 1500); // 25 min * 60
    assert.equal(calculateTimerSeconds('deep-work-45'), 2700); // 45 min * 60
    assert.equal(calculateTimerSeconds('session-60'), 3600); // 60 min * 60
  });

  test('4. Soundscape presets cover diverse modeling workshop acoustics', () => {
    const presets = WORKSHOP_SOUNDSCAPE_PRESETS;
    const categories = new Set(presets.map(p => p.category));
    assert.ok(categories.has('nature'));
    assert.ok(categories.has('workshop'));
    assert.ok(categories.has('scifi'));
    assert.ok(categories.has('music'));

    // Check airbrush preset specific layers
    const airbrush = presets.find(p => p.id === 'compresor-aerografo');
    assert.ok(airbrush);
    const layerIds = airbrush.layers.map(l => l.id);
    assert.ok(layerIds.includes('compressor-hum'));
    assert.ok(layerIds.includes('airflow-hiss'));
    assert.ok(layerIds.includes('booth-fan'));
  });
});
