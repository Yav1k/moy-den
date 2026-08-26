"use client";

import { getMonthMatrix, monthLabel, WEEKDAYS_SHORT_MON_FIRST } from "@/lib/date";

type DayStats = { total: number; done: number; ratio: number | null };

export function CalendarView({
  year,
  month,
  today,
  getDayStats,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onToday,
}: {
  year: number;
  month: number;
  today: string;
  getDayStats: (dateKey: string) => DayStats;
  onSelectDay: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  const weeks = getMonthMatrix(year, month);

  function cellClasses(dateKey: string) {
    const inMonth = Number(dateKey.slice(5, 7)) - 1 === month;
    const isFuture = dateKey > today;
    const isToday = dateKey === today;
    const { ratio } = isFuture ? { ratio: null } : getDayStats(dateKey);

    const base = "aspect-square rounded-lg text-sm flex items-center justify-center transition";
    const opacity = inMonth ? "" : "opacity-30";
    const ring = isToday ? "ring-2 ring-accent" : "";

    if (isFuture) {
      return `${base} ${opacity} text-muted cursor-default`;
    }
    if (ratio === null) {
      return `${base} ${opacity} ${ring} bg-surface2 text-text hover:bg-border cursor-pointer`;
    }
    if (ratio >= 1) {
      return `${base} ${opacity} ${ring} bg-accent text-accent-fg font-medium cursor-pointer`;
    }
    if (ratio > 0) {
      return `${base} ${opacity} ${ring} bg-accent/40 text-text cursor-pointer`;
    }
    return `${base} ${opacity} ${ring} bg-surface2 text-muted cursor-pointer`;
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
        {weeks.flat().map((dateKey) => (
          <button
            key={dateKey}
            onClick={() => dateKey <= today && onSelectDay(dateKey)}
            disabled={dateKey > today}
            className={cellClasses(dateKey)}
          >
            {Number(dateKey.slice(8, 10))}
          </button>
        ))}
      </div>
    </div>
  );
}
