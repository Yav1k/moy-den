"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDayData } from "@/hooks/useDayData";
import { MotivationCard } from "./MotivationCard";
import { ThemeToggle } from "./ThemeToggle";
import { StatsPanel } from "./StatsPanel";
import { Timeline } from "./Timeline";
import { JournalCard } from "./JournalCard";
import { StatsCharts } from "./StatsCharts";
import { CollapsibleSection } from "./CollapsibleSection";
import { BottomNav } from "./BottomNav";
import { DateHeader } from "./DateHeader";
import { moodByKey } from "@/lib/mood";

export function Dashboard({ userId, email }: { userId: string; email: string }) {
  const {
    loading,
    today,
    logs,
    tasksForDate,
    habits,
    isHabitDoneOn,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
    reorderTasks,
    addHabit,
    editHabit,
    setHabitReminder,
    deleteHabit,
    reorderHabits,
    toggleHabitOn,
    journal,
    journalForDate,
    moodForDate,
    saveJournal,
    setMood,
    stats,
  } = useDayData(userId);

  const [viewDate, setViewDate] = useState(today);
  const isFuture = viewDate > today;
  const isToday = viewDate === today;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const viewMood = moodByKey(moodForDate(viewDate));
  const journalSummary = viewMood
    ? `${viewMood.emoji} ${viewMood.label}`
    : journalForDate(viewDate).trim()
      ? "Есть запись"
      : isToday
        ? "Нет записи за сегодня"
        : "Нет записи";

  const statsSummary = `Сегодня ${stats.todayDone}/${stats.todayTotal} · серия ${stats.streak} 🔥`;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <DateHeader selectedDate={viewDate} onSelectDate={setViewDate} />
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <ThemeToggle />
          <button
            onClick={signOut}
            title={email}
            aria-label="Выйти"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <MotivationCard />
        <StatsPanel stats={stats} />

        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
        ) : (
          <>
            <section className="rounded-2xl border border-border bg-surface p-4">
              <Timeline
                habits={habits}
                isHabitDoneOn={(id) => isHabitDoneOn(id, viewDate)}
                onToggleHabit={(id) => toggleHabitOn(id, viewDate)}
                onEditHabit={editHabit}
                onDeleteHabit={deleteHabit}
                onSetHabitReminder={setHabitReminder}
                onReorderHabits={reorderHabits}
                onAddHabit={addHabit}
                tasks={tasksForDate(viewDate)}
                onToggleTask={toggleTask}
                onEditTask={editTask}
                onDeleteTask={deleteTask}
                onReorderTasks={reorderTasks}
                onAddTask={(title, time) => addTask(title, viewDate, time)}
                isFuture={isFuture}
              />
            </section>

            {!isFuture && (
              <CollapsibleSection
                title="Дневник эмоций"
                summary={journalSummary}
                storageKey="section-journal-expanded"
              >
                <JournalCard
                  dateKey={viewDate}
                  content={journalForDate(viewDate)}
                  onSave={saveJournal}
                  mood={moodForDate(viewDate)}
                  onMoodChange={setMood}
                  placeholder="Что чувствовал(а) в этот день? Что на это повлияло..."
                  bare
                />
              </CollapsibleSection>
            )}

            <CollapsibleSection
              title="Статистика"
              summary={statsSummary}
              storageKey="section-stats-expanded"
            >
              <StatsCharts
                today={today}
                habits={habits}
                logs={logs}
                tasksForDate={tasksForDate}
                journal={journal}
              />
            </CollapsibleSection>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
