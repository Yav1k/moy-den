"use client";

import type { Habit, Task } from "@/lib/supabase/types";
import { ChecklistRow } from "./ChecklistRow";
import { AddTaskInline } from "./AddTaskInline";

type Item = { kind: "habit" | "task"; id: string; title: string; time: string | null; done: boolean };

/** Общий простой список «Напоминаний» — привычки и задачи одним списком, без драг-н-дропа.
 * Используется и на «Сегодня», и в карточке дня календаря. */
export function ReminderList({
  dateKey,
  isFuture = false,
  lockHabits = false,
  tasks,
  habits,
  isHabitDoneOn,
  onToggleHabit,
  onEditHabit,
  onDeleteHabit,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: {
  dateKey: string;
  isFuture?: boolean;
  /** Привычки нельзя удалить отсюда (используется в карточке дня календаря — там это чужой день). */
  lockHabits?: boolean;
  tasks: Task[];
  habits: Habit[];
  isHabitDoneOn: (habitId: string, dateKey: string) => boolean;
  onToggleHabit: (habitId: string, dateKey: string) => void;
  onEditHabit: (id: string, title: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (title: string, dateKey: string, time: string | null) => void;
}) {
  const items: Item[] = [
    ...(isFuture
      ? []
      : habits.map((h) => ({ kind: "habit" as const, id: h.id, title: h.title, time: h.reminder_time, done: isHabitDoneOn(h.id, dateKey) }))),
    ...tasks.map((t) => ({ kind: "task" as const, id: t.id, title: t.title, time: t.task_time, done: t.done })),
  ].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  return (
    <div>
      {items.length === 0 && <p className="px-2 py-2 text-sm text-muted">Напоминаний нет.</p>}
      {items.map((item) => (
        <ChecklistRow
          key={`${item.kind}-${item.id}`}
          title={item.title}
          done={item.done}
          meta={item.time ? item.time.slice(0, 5) : undefined}
          locked={item.kind === "habit" && lockHabits}
          onToggle={() => (item.kind === "habit" ? onToggleHabit(item.id, dateKey) : onToggleTask(item.id))}
          onEdit={(title) => (item.kind === "task" ? onEditTask(item.id, title) : onEditHabit(item.id, title))}
          onDelete={() => (item.kind === "habit" ? onDeleteHabit(item.id) : onDeleteTask(item.id))}
        />
      ))}
      <AddTaskInline placeholder="Добавить напоминание..." onAdd={(title, time) => onAddTask(title, dateKey, time)} />
    </div>
  );
}
