import { QUOTES } from "./quotes";
import { todayKey } from "./date";

// Детерминированный "случайный" выбор: одна и та же фраза весь день на
// любом устройстве, и меняется в полночь. Без внешних API и без бэкенда.
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getQuoteOfTheDay(dateKey: string = todayKey()): string {
  const index = hashString(dateKey) % QUOTES.length;
  return QUOTES[index];
}
