"use client";

import { addDays, formatBigDate, todayKey, weekDates, WEEKDAYS_SHORT_MON_FIRST } from "@/lib/date";

export function DateHeader({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const today = todayKey();
  const { day, month } = formatBigDate(selectedDate);
  const week = weekDates(selectedDate);

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelectDate(addDays(selectedDate, -7))}
          aria-label="Предыдущая неделя"
          className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-text"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="flex-1 text-3xl font-bold text-text">
          {day} {month}
        </h1>
        <button
          onClick={() => onSelectDate(addDays(selectedDate, 7))}
          aria-label="Следующая неделя"
          className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-text"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        {selectedDate !== today && (
          <button
            onClick={() => onSelectDate(today)}
            className="ml-1 rounded-lg px-2 py-1 text-xs font-medium text-accent hover:bg-surface2"
          >
            Сегодня
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {week.map((dateKey, i) => {
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDate;
          const dayNum = Number(dateKey.slice(8, 10));
          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[10px] uppercase text-muted">
                {WEEKDAYS_SHORT_MON_FIRST[i]}
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                  isSelected
                    ? "bg-accent text-accent-fg"
                    : isToday
                      ? "text-accent ring-1 ring-accent"
                      : "text-text hover:bg-surface2"
                }`}
              >
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
