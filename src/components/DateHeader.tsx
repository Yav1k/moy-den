"use client";

import { formatBigDate, weekDates, WEEKDAYS_SHORT_MON_FIRST } from "@/lib/date";

export function DateHeader({ today }: { today: string }) {
  const { day, month } = formatBigDate(today);
  const week = weekDates(today);

  return (
    <div>
      <h1 className="text-3xl font-bold text-text">
        {day} {month}
      </h1>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {week.map((dateKey, i) => {
          const isToday = dateKey === today;
          const dayNum = Number(dateKey.slice(8, 10));
          return (
            <div key={dateKey} className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase text-muted">
                {WEEKDAYS_SHORT_MON_FIRST[i]}
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  isToday ? "bg-accent text-accent-fg" : "text-text"
                }`}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
