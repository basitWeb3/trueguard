import fs from "node:fs";

const output = process.argv[2];
if (!output) throw new Error("Pass an output WAV path.");

const sampleRate = 48000;
const duration = 30;
const frames = sampleRate * duration;
const channels = 2;
const bpm = 96;
const beat = 60 / bpm;

const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const chords = [
  { root: 38, notes: [50, 53, 57, 62] }, // D minor
  { root: 34, notes: [46, 50, 53, 58] }, // B-flat
  { root: 29, notes: [41, 45, 48, 53] }, // F
  { root: 36, notes: [48, 52, 55, 60] }, // C
];
const progressionSeconds = duration / chords.length;
const arpeggio = [0, 2, 1, 3, 1, 2, 0, 2];

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

let peak = 0;
const left = new Float32Array(frames);
const right = new Float32Array(frames);

for (let i = 0; i < frames; i += 1) {
  const t = i / sampleRate;
  const chordIndex = Math.min(chords.length - 1, Math.floor(t / progressionSeconds));
  const chord = chords[chordIndex];
  const localChord = t % progressionSeconds;
  const globalFade = Math.min(1, t / 1.2, (duration - t) / 2.2);
  const chordFade = Math.min(1, localChord / 0.7, (progressionSeconds - localChord) / 0.7);

  let padL = 0;
  let padR = 0;
  chord.notes.forEach((note, index) => {
    const f = midi(note);
    const drift = Math.sin(2 * Math.PI * (0.06 + index * 0.012) * t) * 0.0025;
    const phase = 2 * Math.PI * f * t * (1 + drift);
    const tone = Math.sin(phase) + 0.22 * Math.sin(phase * 2) + 0.08 * Math.sin(phase * 3);
    const pan = (index / (chord.notes.length - 1) - 0.5) * 0.65;
    padL += tone * (0.5 - pan * 0.22);
    padR += tone * (0.5 + pan * 0.22);
  });
  padL *= 0.045 * chordFade;
  padR *= 0.045 * chordFade;

  const beatPhase = t % beat;
  const beatNumber = Math.floor(t / beat);
  const kickEnv = Math.exp(-beatPhase * 12);
  const kick = Math.sin(2 * Math.PI * (46 + 30 * Math.exp(-beatPhase * 18)) * beatPhase) * kickEnv * (beatNumber % 4 === 0 ? 0.14 : 0.055);

  const bass = Math.sin(2 * Math.PI * midi(chord.root) * t) * (0.055 + 0.015 * Math.sin(2 * Math.PI * t / progressionSeconds));

  const eighth = beat / 2;
  const pluckPhase = t % eighth;
  const pluckStep = Math.floor(t / eighth);
  const note = chord.notes[arpeggio[pluckStep % arpeggio.length]] + 12;
  const pluckEnv = Math.exp(-pluckPhase * 15);
  const pluckTone = (Math.sin(2 * Math.PI * midi(note) * pluckPhase) + 0.3 * Math.sin(4 * Math.PI * midi(note) * pluckPhase)) * pluckEnv * 0.045;
  const pluckPan = Math.sin(pluckStep * 1.8) * 0.24;

  const barPhase = t % (beat * 4);
  const sparkleEnv = Math.exp(-barPhase * 5.5);
  const sparkle = Math.sin(2 * Math.PI * midi(chord.notes[2] + 24) * barPhase) * sparkleEnv * 0.018;

  const transitionDistance = Math.min(...[7.5, 15, 22.5].map((point) => Math.abs(t - point)));
  const lift = transitionDistance < 0.8
    ? Math.sin(2 * Math.PI * (380 + 240 * (0.8 - transitionDistance)) * t) * (0.8 - transitionDistance) * 0.012
    : 0;

  const l = (padL + bass + kick + pluckTone * (0.5 - pluckPan) + sparkle + lift) * globalFade;
  const r = (padR + bass + kick + pluckTone * (0.5 + pluckPan) + sparkle * 0.72 - lift * 0.4) * globalFade;
  left[i] = l;
  right[i] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}

const gain = 0.76 / Math.max(peak, 0.001);
for (let i = 0; i < frames; i += 1) {
  const l = Math.max(-1, Math.min(1, left[i] * gain));
  const r = Math.max(-1, Math.min(1, right[i] * gain));
  buffer.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
  buffer.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
}

fs.writeFileSync(output, buffer);
console.log(`Wrote ${output} (${duration}s original TrueGuard music bed)`);
