"use client";

import type { Task } from "@/lib/supabase/types";
import { ChecklistRow } from "./ChecklistRow";
import { AddInline } from "./AddInline";

export function TaskList({
  tasks,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Задачи на сегодня</h2>

      <div className="mt-2">
        {tasks.length === 0 && (
          <p className="px-2 py-3 text-sm text-muted">
            Пока пусто. Добавьте первую задачу ниже.
          </p>
        )}
        {tasks.map((task) => (
          <ChecklistRow
            key={task.id}
            title={task.title}
            done={task.done}
            onToggle={() => onToggle(task.id)}
            onEdit={(title) => onEdit(task.id, title)}
            onDelete={() => onDelete(task.id)}
          />
        ))}
      </div>

      <AddInline placeholder="Новая задача..." onAdd={onAdd} />
    </section>
  );
}
