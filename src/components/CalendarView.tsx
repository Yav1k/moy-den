"use client";

import { getMonthMatrix, monthLabel, WEEKDAYS_SHORT_MON_FIRST } from "@/lib/date";

type DayStats = { total: number; done: number; ratio: number | null };

export function CalendarView({
  year,
  month,
  today,
  getDayStats,
  hasPlansOn,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onToday,
}: {
  year: number;
  month: number;
  today: string;
  getDayStats: (dateKey: string) => DayStats;
  hasPlansOn: (dateKey: string) => boolean;
  onSelectDay: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  const weeks = getMonthMatrix(year, month);

  function cellClasses(dateKey: string, isFuture: boolean) {
    const inMonth = Number(dateKey.slice(5, 7)) - 1 === month;
    const isToday = dateKey === today;
    const ratio = isFuture ? null : getDayStats(dateKey).ratio;

    const base =
      "relative aspect-square rounded-lg text-sm flex items-center justify-center transition cursor-pointer";
    const opacity = inMonth ? "" : "opacity-30";
    const ring = isToday ? "ring-2 ring-accent" : "";

    if (isFuture) {
      return `${base} ${opacity} ${ring} bg-surface2 text-text hover:bg-border`;
    }
    if (ratio === null) {
      return `${base} ${opacity} ${ring} bg-surface2 text-text hover:bg-border`;
    }
    if (ratio >= 1) {
      return `${base} ${opacity} ${ring} bg-accent text-accent-fg font-medium`;
    }
    if (ratio > 0) {
      return `${base} ${opacity} ${ring} bg-accent/40 text-text`;
    }
    return `${base} ${opacity} ${ring} bg-surface2 text-muted`;
  }

  return (
    <div>
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onPrevMonth}
          aria-label="Предыдущий месяц"
          className="rounded-lg p-2 text-text hover:bg-surface2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button onClick={onToday} className="text-sm font-medium text-text hover:text-accent">
          {monthLabel(year, month)}
        </button>
        <button
          onClick={onNextMonth}
          aria-label="Следующий месяц"
          className="rounded-lg p-2 text-text hover:bg-surface2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 px-1 text-center text-xs text-muted">
        {WEEKDAYS_SHORT_MON_FIRST.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1 px-1">
        {weeks.flat().map((dateKey) => {
          const isFuture = dateKey > today;
          return (
            <button
              key={dateKey}
              onClick={() => onSelectDay(dateKey)}
              className={cellClasses(dateKey, isFuture)}
            >
              {Number(dateKey.slice(8, 10))}
              {isFuture && hasPlansOn(dateKey) && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
