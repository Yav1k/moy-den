export const MOODS = [
  { key: "awful", emoji: "😞", label: "Плохо", value: 1 },
  { key: "bad", emoji: "🙁", label: "Так себе", value: 2 },
  { key: "neutral", emoji: "😐", label: "Нормально", value: 3 },
  { key: "good", emoji: "🙂", label: "Хорошо", value: 4 },
  { key: "great", emoji: "😄", label: "Отлично", value: 5 },
] as const;

export type MoodKey = (typeof MOODS)[number]["key"];

export function moodByKey(key: string | null | undefined) {
  return MOODS.find((m) => m.key === key) ?? null;
}
