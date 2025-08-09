async function mapTags() {
  const tags = document.getElementById('tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const res = await fetch('/api/map-tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags })
  });
  const json = await res.json();
  document.getElementById('map-result').textContent = JSON.stringify(json, null, 2);
}

async function enforceMix() {
  const data = {
    trebleGainDb: parseFloat(document.getElementById('treble').value),
    lowpassHz: parseFloat(document.getElementById('lowpass').value),
    loudnessLUFS: parseFloat(document.getElementById('loudness').value)
  };
  const res = await fetch('/api/enforce-mix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  document.getElementById('mix-result').textContent = JSON.stringify(json, null, 2);
}

async function quantize() {
  const melody = JSON.parse(document.getElementById('melody').value);
  const key = document.getElementById('key').value;
  const scale = document.getElementById('scale').value;
  const res = await fetch('/api/quantize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ melody, key, scale })
  });
  const json = await res.json();
  document.getElementById('quantize-result').textContent = JSON.stringify(json, null, 2);
}

document.addEventListener('DOMContentLoaded', () => {
  mapTags();
  enforceMix();
  quantize();
});
