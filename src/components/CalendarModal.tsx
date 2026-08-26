"use client";

import { useState } from "react";
import type { Habit, Task } from "@/lib/supabase/types";
import { CalendarView } from "./CalendarView";
import { DayDetail } from "./DayDetail";

type DayStats = { total: number; done: number; ratio: number | null };

export function CalendarModal({
  today,
  getDayStats,
  tasksForDate,
  habits,
  isHabitDoneOn,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onToggleHabit,
  onClose,
}: {
  today: string;
  getDayStats: (dateKey: string) => DayStats;
  tasksForDate: (dateKey: string) => Task[];
  habits: Habit[];
  isHabitDoneOn: (habitId: string, dateKey: string) => boolean;
  onAddTask: (title: string, dateKey: string) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleHabit: (habitId: string, dateKey: string) => void;
  onClose: () => void;
}) {
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [view, setView] = useState({ year: todayYear, month: todayMonth - 1 });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function shiftMonth(delta: number) {
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToday() {
    setView({ year: todayYear, month: todayMonth - 1 });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-4 shadow-xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Календарь</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-3">
          {selectedDate ? (
            <DayDetail
              dateKey={selectedDate}
              isToday={selectedDate === today}
              tasks={tasksForDate(selectedDate)}
              habits={habits}
              isHabitDoneOn={isHabitDoneOn}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onToggleHabit={onToggleHabit}
              onBack={() => setSelectedDate(null)}
            />
          ) : (
            <CalendarView
              year={view.year}
              month={view.month}
              today={today}
              getDayStats={getDayStats}
              onSelectDay={setSelectedDate}
              onPrevMonth={() => shiftMonth(-1)}
              onNextMonth={() => shiftMonth(1)}
              onToday={goToday}
            />
          )}
        </div>
      </div>
    </div>
  );
}
