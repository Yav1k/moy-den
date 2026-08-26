// Работаем с датами в локальной таймзоне устройства, в формате YYYY-MM-DD,
// чтобы "сегодня" совпадало с тем, что видит пользователь на экране.

export function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toDateKey(date);
}

export function daysBetween(fromKey: string, toKey: string): string[] {
  const result: string[] = [];
  let cursor = fromKey;
  while (cursor <= toKey) {
    result.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return result;
}

export function lastNDays(n: number, endKey: string = todayKey()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(addDays(endKey, -i));
  }
  return days;
}

const WEEKDAYS_RU = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

export function formatHuman(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = WEEKDAYS_RU[date.getDay()];
  return `${d}.${String(m).padStart(2, "0")}, ${weekday}`;
}
