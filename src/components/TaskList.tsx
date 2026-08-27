"use client";

import type { Task } from "@/lib/supabase/types";
import { ChecklistRow } from "./ChecklistRow";
import { AddTaskInline } from "./AddTaskInline";
import { DragList } from "./DragList";

export function TaskList({
  tasks,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
}: {
  tasks: Task[];
  onAdd: (title: string, time: string | null) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
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
        <DragList
          items={tasks}
          onReorder={onReorder}
          renderItem={(task, dragHandleProps) => (
            <ChecklistRow
              title={task.title}
              done={task.done}
              meta={task.task_time ? task.task_time.slice(0, 5) : undefined}
              onToggle={() => onToggle(task.id)}
              onEdit={(title) => onEdit(task.id, title)}
              onDelete={() => onDelete(task.id)}
              dragHandleProps={dragHandleProps}
            />
          )}
        />
      </div>

      <AddTaskInline placeholder="Новая задача..." onAdd={onAdd} />
    </section>
  );
}
