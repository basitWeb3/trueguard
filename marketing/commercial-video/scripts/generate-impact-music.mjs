import fs from "node:fs";

const output = process.argv[2];
if (!output) throw new Error("Pass an output WAV path.");

const sampleRate = 48000;
const duration = 40;
const frames = sampleRate * duration;
const channels = 2;
const bpm = 148;
const beat = 60 / bpm;
const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const chords = [
  { root: 38, notes: [50, 53, 57, 62] },
  { root: 34, notes: [46, 50, 53, 58] },
  { root: 29, notes: [41, 45, 48, 53] },
  { root: 36, notes: [48, 52, 55, 60] },
];
const chordLength = beat * 8;
const arp = [0, 2, 1, 3, 2, 1, 3, 1];
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

for (let i = 0; i < frames; i += 1) {
  const t = i / sampleRate;
  const globalFade = Math.min(1, t / 0.28, (duration - t) / 1.25);
  const chordIndex = Math.floor(t / chordLength) % chords.length;
  const chord = chords[chordIndex];
  const beatPhase = t % beat;
  const beatIndex = Math.floor(t / beat);
  const halfBeat = beat / 2;
  const halfPhase = t % halfBeat;
  const sixteenth = beat / 4;
  const sixteenthPhase = t % sixteenth;

  const kickEnv = Math.exp(-beatPhase * 18);
  const kickFreq = 48 + 72 * Math.exp(-beatPhase * 24);
  const kick = Math.sin(2 * Math.PI * kickFreq * beatPhase) * kickEnv * (beatIndex % 4 === 0 ? 0.28 : 0.17);

  const snareBeat = beatIndex % 4 === 1 || beatIndex % 4 === 3;
  const snareEnv = snareBeat ? Math.exp(-beatPhase * 24) : 0;
  const snare = random() * snareEnv * 0.105 + Math.sin(2 * Math.PI * 190 * beatPhase) * snareEnv * 0.035;

  const hat = random() * Math.exp(-sixteenthPhase * 55) * (beatIndex % 8 < 4 ? 0.022 : 0.029);

  const bassGate = Math.exp(-halfPhase * 5.8);
  const bass = (Math.sin(2 * Math.PI * midi(chord.root) * t) + 0.22 * Math.sin(4 * Math.PI * midi(chord.root) * t)) * bassGate * 0.095;

  const arpStep = Math.floor(t / sixteenth);
  const arpNote = chord.notes[arp[arpStep % arp.length]] + 12;
  const arpEnv = Math.exp(-sixteenthPhase * 20);
  const arpTone = (Math.sin(2 * Math.PI * midi(arpNote) * sixteenthPhase) + 0.35 * Math.sin(4 * Math.PI * midi(arpNote) * sixteenthPhase)) * arpEnv * 0.035;
  const arpPan = Math.sin(arpStep * 1.7) * 0.34;

  let padL = 0;
  let padR = 0;
  chord.notes.forEach((note, index) => {
    const phase = 2 * Math.PI * midi(note) * t;
    const tone = Math.sin(phase) + 0.15 * Math.sin(phase * 2);
    const pan = (index / 3 - 0.5) * 0.6;
    padL += tone * (0.5 - pan * 0.2);
    padR += tone * (0.5 + pan * 0.2);
  });
  const sectionPulse = 0.55 + 0.45 * Math.sin(2 * Math.PI * t / (beat * 8)) ** 2;
  padL *= 0.025 * sectionPulse;
  padR *= 0.025 * sectionPulse;

  const impactPoints = [0, 3, 7.5, 12, 18.5, 24.5, 30, 36.5];
  let impact = 0;
  for (const point of impactPoints) {
    const d = t - point;
    if (d >= 0 && d < 0.8) impact += Math.sin(2 * Math.PI * (42 + 30 * Math.exp(-d * 10)) * d) * Math.exp(-d * 5.2) * 0.17;
  }

  const l = (kick + snare + hat + bass + arpTone * (0.5 - arpPan) + padL + impact) * globalFade;
  const r = (kick + snare * 0.92 - hat * 0.72 + bass + arpTone * (0.5 + arpPan) + padR + impact) * globalFade;
  left[i] = l;
  right[i] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}

const gain = 0.83 / Math.max(peak, 0.001);
for (let i = 0; i < frames; i += 1) {
  buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * gain)) * 32767), 44 + i * 4);
  buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * gain)) * 32767), 46 + i * 4);
}

fs.writeFileSync(output, buffer);
console.log(`Wrote ${output} (${duration}s, ${bpm} BPM original impact score)`);
