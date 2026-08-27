"use client";

import { createClient } from "@/lib/supabase/client";
import { useDayData } from "@/hooks/useDayData";
import { MotivationCard } from "./MotivationCard";
import { ThemeToggle } from "./ThemeToggle";
import { StatsPanel } from "./StatsPanel";
import { TaskList } from "./TaskList";
import { HabitList } from "./HabitList";
import { JournalCard } from "./JournalCard";
import { StatsCharts } from "./StatsCharts";
import { CollapsibleSection } from "./CollapsibleSection";
import { BottomNav } from "./BottomNav";
import { formatHuman } from "@/lib/date";
import { moodByKey } from "@/lib/mood";

export function Dashboard({ userId, email }: { userId: string; email: string }) {
  const {
    loading,
    today,
    logs,
    todayTasks,
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
    toggleHabitToday,
    journal,
    journalForDate,
    moodForDate,
    saveJournal,
    setMood,
    stats,
  } = useDayData(userId);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const todayMood = moodByKey(moodForDate(today));
  const journalSummary = todayMood
    ? `${todayMood.emoji} ${todayMood.label}`
    : journalForDate(today).trim()
      ? "Есть запись за сегодня"
      : "Нет записи за сегодня";

  const statsSummary = `Сегодня ${stats.todayDone}/${stats.todayTotal} · серия ${stats.streak} 🔥`;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Мой день</h1>
          <p className="text-sm text-muted">{formatHuman(today)}</p>
        </div>
        <div className="flex items-center gap-2">
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
      </header>

      <div className="mt-5 space-y-4">
        <MotivationCard />
        <StatsPanel stats={stats} />

        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
        ) : (
          <>
            <HabitList
              habits={habits}
              isDoneToday={(id) => isHabitDoneOn(id, today)}
              onAdd={addHabit}
              onToggle={toggleHabitToday}
              onEdit={editHabit}
              onDelete={deleteHabit}
              onSetReminder={setHabitReminder}
              onReorder={reorderHabits}
            />
            <TaskList
              tasks={todayTasks}
              onAdd={(title, time) => addTask(title, today, time)}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
              onReorder={reorderTasks}
            />

            <CollapsibleSection
              title="Дневник эмоций"
              summary={journalSummary}
              storageKey="section-journal-expanded"
            >
              <JournalCard
                dateKey={today}
                content={journalForDate(today)}
                onSave={saveJournal}
                mood={moodForDate(today)}
                onMoodChange={setMood}
                placeholder="Что чувствовал(а) сегодня? Что на это повлияло..."
                bare
              />
            </CollapsibleSection>

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
