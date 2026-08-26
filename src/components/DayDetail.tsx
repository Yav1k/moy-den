"use client";

import type { Habit, Task } from "@/lib/supabase/types";
import { formatHuman } from "@/lib/date";
import { ChecklistRow } from "./ChecklistRow";
import { AddTaskInline } from "./AddTaskInline";
import { JournalCard } from "./JournalCard";

export function DayDetail({
  dateKey,
  today,
  tasks,
  habits,
  isHabitDoneOn,
  journalContent,
  onSaveJournal,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onToggleHabit,
  onBack,
}: {
  dateKey: string;
  today: string;
  tasks: Task[];
  habits: Habit[];
  isHabitDoneOn: (habitId: string, dateKey: string) => boolean;
  journalContent: string;
  onSaveJournal: (dateKey: string, content: string) => void;
  onAddTask: (title: string, dateKey: string, time: string | null) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleHabit: (habitId: string, dateKey: string) => void;
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

      {!isFuture && habits.length > 0 && (
        <div className="mt-3">
          <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted">
            Привычки
          </p>
          <div className="mt-1">
            {habits.map((habit) => (
              <ChecklistRow
                key={habit.id}
                title={habit.title}
                done={isHabitDoneOn(habit.id, dateKey)}
                onToggle={() => onToggleHabit(habit.id, dateKey)}
                onEdit={() => {}}
                onDelete={() => {}}
                locked
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted">
          {isFuture ? "Планы" : "Задачи"}
        </p>
        <div className="mt-1">
          {tasks.length === 0 && (
            <p className="px-2 py-2 text-sm text-muted">
              {isFuture ? "Пока ничего не запланировано." : "Задач в этот день не было."}
            </p>
          )}
          {tasks.map((task) => (
            <ChecklistRow
              key={task.id}
              title={task.title}
              done={task.done}
              meta={task.task_time ? task.task_time.slice(0, 5) : undefined}
              onToggle={() => onToggleTask(task.id)}
              onEdit={(title) => onEditTask(task.id, title)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </div>
        <AddTaskInline
          placeholder={isFuture ? "Запланировать дело..." : "Добавить задним числом..."}
          onAdd={(title, time) => onAddTask(title, dateKey, time)}
        />
      </div>

      {!isFuture && (
        <div className="mt-4">
          <JournalCard
            dateKey={dateKey}
            content={journalContent}
            onSave={onSaveJournal}
            title={isToday ? "Дневник дня" : "Дневник"}
            placeholder="Что было в этот день..."
          />
        </div>
      )}
    </div>
  );
}
