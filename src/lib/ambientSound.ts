export type AmbientSound = {
  start: () => void;
  stop: () => void;
  setMuted: (muted: boolean) => void;
};

const TARGET_VOLUME = 0.32;
const PAD_VOLUME = 0.85;

// Pentatonic-ish note pool (C major pentatonic across two octaves) — any combination sounds consonant,
// so notes can be picked at random without ever clashing.
const CHIME_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

export function createAmbientSound(): AmbientSound {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let delayBus: DelayNode | null = null;
  let started = false;
  let oscNodes: { osc: OscillatorNode; lfo: OscillatorNode }[] = [];
  let noiseSource: AudioBufferSourceNode | null = null;
  let chimeTimeout: ReturnType<typeof setTimeout> | null = null;

  function scheduleChime() {
    const wait = 2800 + Math.random() * 4200;
    chimeTimeout = setTimeout(() => {
      if (!started || !ctx || !master || !delayBus) return;
      playChime();
      scheduleChime();
    }, wait);
  }

  function playChime() {
    if (!ctx || !master || !delayBus) return;
    const freq = CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    // A faint octave-up partial gives the chime a bell-like shimmer instead of a plain tone.
    const partial = ctx.createOscillator();
    partial.type = "sine";
    partial.frequency.value = freq * 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

    const partialGain = ctx.createGain();
    partialGain.gain.setValueAtTime(0.0001, now);
    partialGain.gain.linearRampToValueAtTime(0.06, now + 0.05);
    partialGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc.connect(gain);
    partial.connect(partialGain);
    gain.connect(master);
    partialGain.connect(master);
    gain.connect(delayBus);

    osc.start(now);
    partial.start(now);
    osc.stop(now + 3.6);
    partial.stop(now + 2.4);
  }

  function build() {
    const AudioCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioCtor();

    master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(TARGET_VOLUME, ctx.currentTime + 2.5);
    master.connect(ctx.destination);

    // Simple delay-based reverb bus so chimes have soft trailing space instead of sounding dry/plain.
    const delay = ctx.createDelay(2.0);
    delay.delayTime.value = 0.36;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 2600;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;

    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delayFilter.connect(wet);
    wet.connect(master);
    delayBus = delay;

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 2200;
    const padBus = ctx.createGain();
    padBus.gain.value = PAD_VOLUME;
    padFilter.connect(padBus);
    padBus.connect(master);

    // Soft detuned pad underneath the chimes — calm sustained triad, slowly breathing in volume.
    const layers = [
      { freqs: [130.81, 164.81, 196.0], gain: 0.4 }, // C3, E3, G3
      { freqs: [261.63, 329.63, 392.0], gain: 0.16 }, // C4, E4, G4
    ];
    oscNodes = layers.flatMap(({ freqs, gain: layerGain }) =>
      freqs.map((f, i) => {
        const osc = ctx!.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        osc.detune.value = (i - 1) * 4;

        const gain = ctx!.createGain();
        gain.gain.value = layerGain;

        const lfo = ctx!.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.05 + i * 0.02;
        const lfoGain = ctx!.createGain();
        lfoGain.gain.value = layerGain * 0.3;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        osc.connect(gain);
        gain.connect(padFilter);

        osc.start();
        lfo.start();

        return { osc, lfo };
      })
    );

    // Faint filtered noise texture, like distant wind — adds warmth under the pad.
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 700;
    noiseFilter.Q.value = 0.6;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noiseSource.start();

    ctx.resume();
    // First chime shortly after start, so the melodic layer is heard right away instead of
    // waiting on the random schedule.
    chimeTimeout = setTimeout(() => {
      if (!started) return;
      playChime();
      scheduleChime();
    }, 900);
  }

  return {
    start() {
      if (started) {
        ctx?.resume();
        return;
      }
      started = true;
      build();
    },
    stop() {
      started = false;
      if (chimeTimeout) clearTimeout(chimeTimeout);
      chimeTimeout = null;

      if (!ctx || !master) return;
      const activeCtx = ctx;
      const activeMaster = master;
      const activeOscNodes = oscNodes;
      const activeNoise = noiseSource;
      const now = activeCtx.currentTime;
      activeMaster.gain.cancelScheduledValues(now);
      activeMaster.gain.setValueAtTime(activeMaster.gain.value, now);
      activeMaster.gain.linearRampToValueAtTime(0.0001, now + 0.8);

      setTimeout(() => {
        activeOscNodes.forEach(({ osc, lfo }) => {
          osc.stop();
          lfo.stop();
        });
        activeNoise?.stop();
        activeCtx.close();
      }, 900);

      ctx = null;
      master = null;
      delayBus = null;
      oscNodes = [];
      noiseSource = null;
    },
    setMuted(muted: boolean) {
      if (!ctx || !master) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(muted ? 0.0001 : TARGET_VOLUME, now + 0.4);
    },
  };
}
