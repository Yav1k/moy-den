export type BreathPhase = {
  key: "inhale" | "hold" | "exhale";
  label: string;
  duration: number;
  scale: number;
};

export type Practice = {
  id: string;
  title: string;
  description: string;
  pattern: string;
  durationLabel: string;
  cycles: number;
  phases: BreathPhase[];
};

export const PRACTICES: Practice[] = [
  {
    id: "box",
    title: "Квадратное дыхание",
    description: "Выравнивает ритм дыхания и помогает сосредоточиться",
    pattern: "Вдох 4 – Задержка 4 – Выдох 4 – Задержка 4",
    durationLabel: "~3 мин",
    cycles: 8,
    phases: [
      { key: "inhale", label: "Вдох", duration: 4, scale: 1.3 },
      { key: "hold", label: "Задержка", duration: 4, scale: 1.3 },
      { key: "exhale", label: "Выдох", duration: 4, scale: 0.85 },
      { key: "hold", label: "Задержка", duration: 4, scale: 0.85 },
    ],
  },
  {
    id: "calm478",
    title: "4-7-8",
    description: "Снижает тревожность и помогает быстрее уснуть",
    pattern: "Вдох 4 – Задержка 7 – Выдох 8",
    durationLabel: "~3 мин",
    cycles: 6,
    phases: [
      { key: "inhale", label: "Вдох", duration: 4, scale: 1.3 },
      { key: "hold", label: "Задержка", duration: 7, scale: 1.3 },
      { key: "exhale", label: "Выдох", duration: 8, scale: 0.85 },
    ],
  },
  {
    id: "deep",
    title: "Глубокое дыхание",
    description: "Мягко замедляет пульс, снимает напряжение",
    pattern: "Вдох 4 – Выдох 6",
    durationLabel: "~2 мин",
    cycles: 10,
    phases: [
      { key: "inhale", label: "Вдох", duration: 4, scale: 1.3 },
      { key: "exhale", label: "Выдох", duration: 6, scale: 0.85 },
    ],
  },
];
