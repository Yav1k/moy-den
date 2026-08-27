export type Metronome = {
  start: () => void;
  stop: () => void;
};

export function createMetronome(): Metronome {
  let ctx: AudioContext | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function tick() {
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  return {
    start() {
      if (ctx) return;
      const AudioCtor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtor();
      ctx.resume();
      tick();
      intervalId = setInterval(tick, 1000);
    },
    stop() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      if (ctx) {
        const c = ctx;
        setTimeout(() => c.close(), 150);
        ctx = null;
      }
    },
  };
}
