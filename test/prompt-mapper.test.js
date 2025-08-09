const test = require('node:test');
const assert = require('assert');
const { mapTagsToAttributes, enforceKidSafeMix, quantizeAndClamp } = require('../src/prompt-mapper');

const Cmaj = { key: 'C', scale: 'major' };

test('ねこ → 軽快、BPM=~112、ピッツィカート', () => {
  const r = mapTagsToAttributes(['ねこ']);
  assert.ok(r.bpm >= 104 && r.bpm <= 120);
  assert.ok(r.instruments.includes('pizz_strings'));
  assert.ok(/brush|light/.test(r.drumPattern));
});

test('ねむい → スロー、ドラム無し、ローパス', () => {
  const r = mapTagsToAttributes(['ねむい']);
  assert.ok(r.bpm <= 90);
  assert.strictEqual(r.drumPattern, 'none');
  assert.ok(r.mix.lowpassHz >= 2000);
});

test('だいぼうけん → 速め、ブラス/スネア強調', () => {
  const r = mapTagsToAttributes(['だいぼうけん']);
  assert.ok(r.bpm >= 124);
  assert.ok(r.instruments.includes('brass'));
  assert.ok(/snare|toms/.test(r.drumPattern));
});

test('競合解決: ねむい + だいぼうけん → 中庸BPM', () => {
  const r = mapTagsToAttributes(['ねむい', 'だいぼうけん']);
  assert.ok(r.bpm >= 96 && r.bpm <= 116);
});

test('未知タグは無視しつつ既知タグ適用', () => {
  const r = mapTagsToAttributes(['???', 'ねこ']);
  assert.ok(r.instruments.includes('pizz_strings'));
});

test('タグ>3は切り詰め', () => {
  const r = mapTagsToAttributes(['ねこ', 'ねむい', 'だいぼうけん', 'さかな']);
  assert.ok(r.usedTags.length <= 3);
});

test('高域ブースト過多を制限', () => {
  const r = enforceKidSafeMix({ trebleGainDb: +6, lowpassHz: 20000, loudnessLUFS: -10 });
  assert.ok(r.trebleGainDb <= 0);
  assert.ok(r.loudnessLUFS >= -16);
  assert.ok(r.lowpassHz <= 8000);
});

test('スケール外音を最近傍音へ吸着', () => {
  const melody = { ppq: 480, length: 4, notes: [{ pitch: 61, start: 0, duration: 0.5 }] };
  const r = quantizeAndClamp(melody, Cmaj.key, Cmaj.scale);
  const allowed = [60, 62, 64, 65, 67, 69, 71];
  assert.ok(allowed.includes(r.notes[0].pitch));
});

test('ノート数>64はエラー', () => {
  const notes = Array.from({ length: 80 }, (_, i) => ({ pitch: 60, start: i * 0.25, duration: 0.25 }));
  assert.throws(() => quantizeAndClamp({ ppq: 480, length: 8, notes }, 'C', 'major'));
});
