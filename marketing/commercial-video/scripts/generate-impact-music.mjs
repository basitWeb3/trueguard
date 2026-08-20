import fs from "node:fs";

const output = process.argv[2];
if (!output) throw new Error("Pass an output WAV path.");

const sampleRate = 48000;
const duration = 40;
const frames = sampleRate * duration;
const channels = 2;
const bpm = 132;
const beat = 60 / bpm;
const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const progression = [
  { root: 38, notes: [50, 53, 57, 62] },
  { root: 34, notes: [46, 50, 53, 58] },
  { root: 31, notes: [43, 46, 50, 55] },
  { root: 33, notes: [45, 49, 52, 57] },
];
const chordLength = beat * 8;
const newsCuts = [0, 3, 4.83, 5.67, 8.08, 10.17, 15.54, 20.25, 24.58, 27.21, 30.33, 36.04];
const introPiano = [
  [0.0, 50], [1.24, 45], [2.42, 53], [3.02, 38], [4.83, 57],
  [5.67, 50], [6.72, 46], [8.08, 53], [9.18, 45],
];
const buffer = Buffer.alloc(44 + frames * channels * 2);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(buffer.length - 8, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * channels * 2, 28);
buffer.writeUInt16LE(channels * 2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(frames * channels * 2, 40);

const left = new Float32Array(frames);
const right = new Float32Array(frames);
let peak = 0;
let seed = 90731;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647 * 2 - 1;
};
const piano = (note, elapsed) => {
  if (elapsed < 0 || elapsed > 4.2) return 0;
  const frequency = midi(note);
  const attack = Math.min(1, elapsed * 90);
  const envelope = attack * (0.76 * Math.exp(-elapsed * 1.42) + 0.24 * Math.exp(-elapsed * 4.8));
  const body =
    Math.sin(2 * Math.PI * frequency * elapsed) +
    0.43 * Math.sin(2 * Math.PI * frequency * 2.01 * elapsed + 0.14) +
    0.18 * Math.sin(2 * Math.PI * frequency * 3.98 * elapsed + 0.31) +
    0.08 * Math.sin(2 * Math.PI * frequency * 6.03 * elapsed);
  return body * envelope;
};

for (let i = 0; i < frames; i += 1) {
  const t = i / sampleRate;
  const globalFade = Math.min(1, t / 0.22, (duration - t) / 1.15);
  const chordIndex = Math.floor(t / chordLength) % progression.length;
  const chord = progression[chordIndex];
  const beatPhase = t % beat;
  const beatIndex = Math.floor(t / beat);
  const halfBeat = beat / 2;
  const halfPhase = t % halfBeat;

  let pianoL = 0;
  let pianoR = 0;
  for (let p = 0; p < introPiano.length; p += 1) {
    const [start, note] = introPiano[p];
    const tone = piano(note, t - start) * 0.115;
    const pan = p % 2 ? 0.12 : -0.12;
    pianoL += tone * (0.88 - pan);
    pianoR += tone * (0.88 + pan);
  }

  if (t >= 10) {
    const noteStep = Math.floor((t - 10) / beat);
    for (let back = 0; back < 5; back += 1) {
      const step = noteStep - back;
      if (step < 0) continue;
      const start = 10 + step * beat;
      const activeChord = progression[Math.floor(start / chordLength) % progression.length];
      const pattern = [0, 2, 1, 3, 1, 2, 0, 3];
      const note = activeChord.notes[pattern[step % pattern.length]] + (step % 4 === 3 ? 12 : 0);
      const tone = piano(note, t - start) * 0.052;
      const pan = Math.sin(step * 1.61) * 0.22;
      pianoL += tone * (0.82 - pan);
      pianoR += tone * (0.82 + pan);
    }
  }

  const dronePhase = 2 * Math.PI * midi(chord.root) * t;
  const dronePulse = 0.58 + 0.42 * Math.sin(Math.PI * (t % chordLength) / chordLength) ** 2;
  const drone = (Math.sin(dronePhase) + 0.21 * Math.sin(dronePhase * 2.003)) * 0.048 * dronePulse;

  const percussionIn = Math.max(0, Math.min(1, (t - 9.5) / 2.2));
  const kickEnv = Math.exp(-beatPhase * 16);
  const kickFrequency = 44 + 65 * Math.exp(-beatPhase * 22);
  const kick = Math.sin(2 * Math.PI * kickFrequency * beatPhase) * kickEnv * 0.14 * percussionIn;
  const pulse = (Math.sin(2 * Math.PI * midi(chord.root) * t) + 0.18 * Math.sin(4 * Math.PI * midi(chord.root) * t)) * Math.exp(-halfPhase * 6) * 0.052 * percussionIn;
  const tick = random() * Math.exp(-(t % (beat / 2)) * 48) * 0.012 * percussionIn;

  let cutImpact = 0;
  let reverseBreath = 0;
  for (const point of newsCuts) {
    const after = t - point;
    if (after >= 0 && after < 0.82) {
      cutImpact += Math.sin(2 * Math.PI * (39 + 36 * Math.exp(-after * 11)) * after) * Math.exp(-after * 5.4) * 0.14;
    }
    const before = point - t;
    if (before > 0 && before < 0.52) reverseBreath += random() * (1 - before / 0.52) ** 2 * 0.012;
  }

  const unresolvedHigh = t < 10.2 ? Math.sin(2 * Math.PI * midi(81) * t) * (0.008 + 0.006 * Math.sin(t * 2.1) ** 2) : 0;
  const l = (pianoL + drone + kick + pulse + tick + cutImpact + reverseBreath + unresolvedHigh) * globalFade;
  const r = (pianoR + drone * 0.96 + kick + pulse - tick * 0.72 + cutImpact + reverseBreath - unresolvedHigh * 0.45) * globalFade;
  left[i] = l;
  right[i] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}

const gain = 0.82 / Math.max(peak, 0.001);
for (let i = 0; i < frames; i += 1) {
  buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * gain)) * 32767), 44 + i * 4);
  buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * gain)) * 32767), 46 + i * 4);
}

fs.writeFileSync(output, buffer);
console.log(`Wrote ${output} (${duration}s, original suspense-piano impact score)`);
