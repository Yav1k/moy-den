"use client";

import type { Habit, Task } from "@/lib/supabase/types";
import { formatHuman } from "@/lib/date";
import { ReminderList } from "./ReminderList";
import { JournalCard } from "./JournalCard";

export function DayDetail({
  dateKey,
  today,
  tasks,
  habits,
  isHabitDoneOn,
  journalContent,
  onSaveJournal,
  journalMood,
  onMoodChange,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onToggleHabit,
  onEditHabit,
  onDeleteHabit,
  onBack,
}: {
  dateKey: string;
  today: string;
  tasks: Task[];
  habits: Habit[];
  isHabitDoneOn: (habitId: string, dateKey: string) => boolean;
  journalContent: string;
  onSaveJournal: (dateKey: string, content: string) => void;
  journalMood: string | null;
  onMoodChange: (dateKey: string, mood: string | null) => void;
  onAddTask: (title: string, dateKey: string, time: string | null) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleHabit: (habitId: string, dateKey: string) => void;
  onEditHabit: (id: string, title: string) => void;
  onDeleteHabit: (id: string) => void;
  onBack: () => void;
}) {
  const isToday = dateKey === today;
  const isFuture = dateKey > today;

  return (
    <div>
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={onBack}
          aria-label="Назад к календарю"
          className="rounded-lg p-2 text-text hover:bg-surface2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h3 className="text-sm font-semibold text-text">
          {formatHuman(dateKey)}
          {isToday && <span className="ml-1 font-normal text-muted">· сегодня</span>}
          {isFuture && <span className="ml-1 font-normal text-muted">· план</span>}
        </h3>
      </div>

      <div className="mt-4">
        <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted">Напоминания</p>
        <div className="mt-1">
          <ReminderList
            dateKey={dateKey}
            isFuture={isFuture}
            lockHabits
            tasks={tasks}
            habits={habits}
            isHabitDoneOn={isHabitDoneOn}
            onToggleHabit={onToggleHabit}
            onEditHabit={onEditHabit}
            onDeleteHabit={onDeleteHabit}
            onToggleTask={onToggleTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onAddTask={onAddTask}
          />
        </div>
      </div>

      {!isFuture && (
        <div className="mt-4">
          <JournalCard
            dateKey={dateKey}
            content={journalContent}
            onSave={onSaveJournal}
            mood={journalMood}
            onMoodChange={onMoodChange}
            title="Дневник эмоций"
            placeholder="Что чувствовал(а) в этот день..."
          />
        </div>
      )}
    </div>
  );
}
