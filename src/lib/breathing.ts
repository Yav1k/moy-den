export type PhaseKey = "inhale" | "hold1" | "exhale" | "hold2";

export type Rhythm = {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
};

export const PHASE_ORDER: PhaseKey[] = ["inhale", "hold1", "exhale", "hold2"];

export const PHASE_LABELS: Record<PhaseKey, string> = {
  inhale: "Вдох",
  hold1: "Задержка",
  exhale: "Выдох",
  hold2: "Пауза",
};

export type RhythmPreset = {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  rhythm: Rhythm;
};

export const RHYTHM_PRESETS: RhythmPreset[] = [
  {
    id: "box",
    title: "Квадратное дыхание",
    subtitle: "Выравнивает ритм и помогает сосредоточиться",
    theme: "from-sky-500/40 to-sky-500/5",
    rhythm: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  },
  {
    id: "relax478",
    title: "4-7-8",
    subtitle: "Снижает тревожность, помогает уснуть",
    theme: "from-violet-500/40 to-violet-500/5",
    rhythm: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  },
  {
    id: "deep",
    title: "Глубокое дыхание",
    subtitle: "Мягко замедляет пульс, снимает напряжение",
    theme: "from-emerald-500/40 to-emerald-500/5",
    rhythm: { inhale: 4, hold1: 0, exhale: 6, hold2: 0 },
  },
  {
    id: "tibetan",
    title: "Ритмическое дыхание",
    subtitle: "Дыхание из тибетской йоги",
    theme: "from-amber-500/40 to-amber-500/5",
    rhythm: { inhale: 6, hold1: 10, exhale: 4, hold2: 4 },
  },
  {
    id: "coherent",
    title: "Когерентное дыхание",
    subtitle: "Ровный пульс и ясный ум",
    theme: "from-rose-500/40 to-rose-500/5",
    rhythm: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
  },
];

// Quick-pick rhythm table, grouped by the second-hold length — mirrors the
// "выберите свой ритм" grid pattern from the reference app.
export const RHYTHM_GRID_GROUPS: Rhythm[][] = [
  [8, 10, 12, 14, 16].map((hold1) => ({ inhale: 6, hold1, exhale: 4, hold2: 4 })),
  [10, 12, 14, 16, 18, 20].map((hold1) => ({ inhale: 6, hold1, exhale: 5, hold2: 5 })),
  [12, 14, 16, 18, 20].map((hold1) => ({ inhale: 6, hold1, exhale: 6, hold2: 6 })),
];

export function phaseSequence(rhythm: Rhythm): { key: PhaseKey; seconds: number }[] {
  return PHASE_ORDER.map((key) => ({ key, seconds: rhythm[key] })).filter((p) => p.seconds > 0);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
