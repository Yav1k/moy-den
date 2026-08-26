"use client";

import type { Habit } from "@/lib/supabase/types";
import { ChecklistRow } from "./ChecklistRow";
import { AddInline } from "./AddInline";

export function HabitList({
  habits,
  isDoneToday,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}: {
  habits: Habit[];
  isDoneToday: (habitId: string) => boolean;
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Ежедневные привычки</h2>
      <p className="text-xs text-muted">
        Появляются каждый день заново и учитываются в серии дней подряд.
      </p>

      <div className="mt-2">
        {habits.length === 0 && (
          <p className="px-2 py-3 text-sm text-muted">
            Добавьте привычку, например «Пить воду» или «Читать 10 минут».
          </p>
        )}
        {habits.map((habit) => (
          <ChecklistRow
            key={habit.id}
            title={habit.title}
            done={isDoneToday(habit.id)}
            onToggle={() => onToggle(habit.id)}
            onEdit={(title) => onEdit(habit.id, title)}
            onDelete={() => onDelete(habit.id)}
          />
        ))}
      </div>

      <AddInline placeholder="Новая привычка..." onAdd={onAdd} />
    </section>
  );
}
