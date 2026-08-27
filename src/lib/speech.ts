let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickRussianVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  cachedVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("ru")) ?? null;
  return cachedVoice;
}

/** Call once from a user-gesture handler before the first speakPhase, so voice list + iOS unlock are ready. */
export function primeVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
  };
}

export function speakPhase(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ru-RU";
  const voice = pickRussianVoice();
  if (voice) utter.voice = voice;
  utter.rate = 0.95;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}
