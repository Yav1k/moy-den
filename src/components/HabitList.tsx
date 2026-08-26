"use client";

import { useState } from "react";
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
  onSetReminder,
}: {
  habits: Habit[];
  isDoneToday: (habitId: string) => boolean;
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onSetReminder: (id: string, time: string | null) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          <div key={habit.id}>
            <div className="flex items-center gap-1">
              <div className="flex-1">
                <ChecklistRow
                  title={habit.title}
                  done={isDoneToday(habit.id)}
                  onToggle={() => onToggle(habit.id)}
                  onEdit={(title) => onEdit(habit.id, title)}
                  onDelete={() => onDelete(habit.id)}
                />
              </div>
              <button
                onClick={() => setExpandedId(expandedId === habit.id ? null : habit.id)}
                aria-label="Напоминание"
                className={`shrink-0 rounded-lg p-1.5 text-xs ${
                  habit.reminder_time ? "text-accent" : "text-muted hover:text-text"
                }`}
              >
                {habit.reminder_time ? habit.reminder_time.slice(0, 5) : "⏰"}
              </button>
            </div>
            {expandedId === habit.id && (
              <div className="flex items-center gap-2 px-2 pb-2">
                <input
                  type="time"
                  value={habit.reminder_time?.slice(0, 5) ?? ""}
                  onChange={(e) => onSetReminder(habit.id, e.target.value || null)}
                  className="rounded-lg border border-border bg-surface2 px-2 py-1 text-xs text-text outline-none"
                />
                {habit.reminder_time && (
                  <button
                    onClick={() => onSetReminder(habit.id, null)}
                    className="text-xs text-muted hover:text-red-500"
                  >
                    Убрать напоминание
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <AddInline placeholder="Новая привычка..." onAdd={onAdd} />
    </section>
  );
}
