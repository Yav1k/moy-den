"use client";

import { useState } from "react";
import Link from "next/link";
import { useDayData } from "@/hooks/useDayData";
import { CalendarView } from "./CalendarView";
import { DayDetail } from "./DayDetail";
import { BottomNav } from "./BottomNav";

export function CalendarPage({ userId }: { userId: string }) {
  const {
    loading,
    today,
    getDayStats,
    hasPlansOn,
    tasksForDate,
    habits,
    isHabitDoneOn,
    journalForDate,
    moodForDate,
    saveJournal,
    setMood,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
    toggleHabitOn,
    editHabit,
    deleteHabit,
  } = useDayData(userId);

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
    setSelectedDate(null);
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <header className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-text">Календарь</h1>
      </header>

      <div className="mt-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
        ) : selectedDate ? (
          <DayDetail
            dateKey={selectedDate}
            today={today}
            tasks={tasksForDate(selectedDate)}
            habits={habits}
            isHabitDoneOn={isHabitDoneOn}
            journalContent={journalForDate(selectedDate)}
            onSaveJournal={saveJournal}
            journalMood={moodForDate(selectedDate)}
            onMoodChange={setMood}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onEditTask={editTask}
            onDeleteTask={deleteTask}
            onToggleHabit={toggleHabitOn}
            onEditHabit={editHabit}
            onDeleteHabit={deleteHabit}
            onBack={() => setSelectedDate(null)}
          />
        ) : (
          <CalendarView
            year={view.year}
            month={view.month}
            today={today}
            getDayStats={getDayStats}
            hasPlansOn={hasPlansOn}
            onSelectDay={setSelectedDate}
            onPrevMonth={() => shiftMonth(-1)}
            onNextMonth={() => shiftMonth(1)}
            onToday={goToday}
          />
        )}
      </div>

      <BottomNav />
    </main>
  );
}
