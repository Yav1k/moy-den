"use client";

import { createClient } from "@/lib/supabase/client";
import { useDayData } from "@/hooks/useDayData";
import { MotivationCard } from "./MotivationCard";
import { ThemeToggle } from "./ThemeToggle";
import { StatsPanel } from "./StatsPanel";
import { TaskList } from "./TaskList";
import { HabitList } from "./HabitList";
import { formatHuman } from "@/lib/date";

export function Dashboard({ userId, email }: { userId: string; email: string }) {
  const {
    loading,
    today,
    todayTasks,
    habits,
    isHabitDoneOn,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
    addHabit,
    editHabit,
    deleteHabit,
    toggleHabitToday,
    stats,
  } = useDayData(userId);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16 pt-6 sm:px-6">
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
            />
            <TaskList
              tasks={todayTasks}
              onAdd={addTask}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          </>
        )}
      </div>
    </main>
  );
}
