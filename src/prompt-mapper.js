const TAG_RULES = {
  'ねこ': {
    bpm: 112,
    instruments: ['pizz_strings', 'marimba'],
    drumPattern: 'brush',
  },
  'ねむい': {
    bpm: 80,
    drumPattern: 'none',
    mix: { lowpassHz: 4000 },
  },
  'だいぼうけん': {
    bpm: 140,
    instruments: ['brass'],
    drumPattern: 'snare',
  },
};

function clampBpm(bpm) {
  return Math.min(160, Math.max(80, bpm));
}

function mapTagsToAttributes(tags = [], tempo, key) {
  const used = [];
  let bpm = tempo ?? 112;
  let instruments = [];
  let drumPattern = 'basic';
  let mix = { lowpassHz: 8000 };

  const limited = tags.filter((t) => TAG_RULES[t]).slice(0, 3);
  for (const t of limited) {
    used.push(t);
    const rule = TAG_RULES[t];
    if (rule.instruments) instruments.push(...rule.instruments);
    if (rule.drumPattern) drumPattern = rule.drumPattern;
    if (rule.mix && rule.mix.lowpassHz) mix.lowpassHz = rule.mix.lowpassHz;
  }

  if (used.includes('ねむい') && used.includes('だいぼうけん')) {
    bpm = 108;
  } else if (used.length) {
    for (const t of used) {
      const rule = TAG_RULES[t];
      if (rule.bpm !== undefined) bpm = rule.bpm;
    }
  }

  bpm = clampBpm(bpm);
  return { bpm, instruments, drumPattern, mix, usedTags: used };
}

function enforceKidSafeMix(mix) {
  return {
    trebleGainDb: Math.min(mix.trebleGainDb ?? 0, 0),
    lowpassHz: Math.min(mix.lowpassHz ?? 20000, 8000),
    loudnessLUFS: Math.max(mix.loudnessLUFS ?? -16, -16),
  };
}

function quantizeAndClamp(melody, key, scale) {
  const notes = melody.notes;
  if (notes.length > 64) throw new Error('too many notes');
  const allowed = buildScale(key, scale);
  const quantized = notes.map((n) => ({ ...n, pitch: clampPitch(n.pitch, allowed) }));
  return { ...melody, notes: quantized };
}

function buildScale(key, scale) {
  const keyToMidi = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 };
  const root = keyToMidi[key] ?? 60;
  const intervals = scale === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  return intervals.map((i) => root + i);
}

function clampPitch(pitch, allowed) {
  if (allowed.includes(pitch)) return pitch;
  let nearest = allowed[0];
  let diff = Math.abs(pitch - nearest);
  for (const a of allowed) {
    const d = Math.abs(pitch - a);
    if (d < diff) {
      diff = d;
      nearest = a;
    }
  }
  return nearest;
}

module.exports = { mapTagsToAttributes, enforceKidSafeMix, quantizeAndClamp };
