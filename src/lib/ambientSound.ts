export type AmbientSound = {
  start: () => void;
  stop: () => void;
  setMuted: (muted: boolean) => void;
};

const TARGET_VOLUME = 0.18;

export function createAmbientSound(): AmbientSound {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let started = false;
  let oscNodes: { osc: OscillatorNode; lfo: OscillatorNode }[] = [];
  let noiseSource: AudioBufferSourceNode | null = null;

  function build() {
    const AudioCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioCtor();

    master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(TARGET_VOLUME, ctx.currentTime + 2.5);
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.connect(master);

    // Soft detuned pad — calm sustained triad, slowly breathing in volume.
    const freqs = [130.81, 164.81, 196.0]; // C3, E3, G3
    oscNodes = freqs.map((f, i) => {
      const osc = ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 4;

      const gain = ctx!.createGain();
      gain.gain.value = 0.5;

      const lfo = ctx!.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx!.createGain();
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(filter);

      osc.start();
      lfo.start();

      return { osc, lfo };
    });

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
    noiseFilter.frequency.value = 500;
    noiseFilter.Q.value = 0.6;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.03;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noiseSource.start();

    ctx.resume();
  }

  return {
    start() {
      if (started) {
        ctx?.resume();
        return;
      }
      build();
      started = true;
    },
    stop() {
      if (!ctx || !master) {
        started = false;
        return;
      }
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
      oscNodes = [];
      noiseSource = null;
      started = false;
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
