"use client";

import { useState } from "react";
import type { Habit, Task } from "@/lib/supabase/types";
import { TimelineRow } from "./TimelineRow";
import { DragList } from "./DragList";
import { AddItemSheet } from "./AddItemSheet";

function FlameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1 1 2 2.5 2 4.5A5.5 5.5 0 0 1 11.5 20 6.5 6.5 0 0 1 5 13.5C5 9 8 6 12 2Z" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function Timeline({
  habits,
  isHabitDoneOn,
  onToggleHabit,
  onEditHabit,
  onDeleteHabit,
  onSetHabitReminder,
  onReorderHabits,
  onAddHabit,
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
  onAddTask,
  isFuture = false,
}: {
  habits: Habit[];
  isHabitDoneOn: (habitId: string) => boolean;
  onToggleHabit: (id: string) => void;
  onEditHabit: (id: string, title: string) => void;
  onDeleteHabit: (id: string) => void;
  onSetHabitReminder: (id: string, time: string | null) => void;
  onReorderHabits: (orderedIds: string[]) => void;
  onAddHabit: (title: string, reminderTime: string | null) => void;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (orderedIds: string[]) => void;
  onAddTask: (title: string, time: string | null) => void;
  /** Скрывает привычки — их нельзя отметить заранее (как в календаре). */
  isFuture?: boolean;
}) {
  const [reminderEditorId, setReminderEditorId] = useState<string | null>(null);
  const [addSheet, setAddSheet] = useState<"task" | "habit" | null>(null);

  const timedHabits = isFuture ? [] : habits.filter((h) => h.reminder_time);
  const untimedHabits = isFuture ? [] : habits.filter((h) => !h.reminder_time);
  const timedTasks = tasks.filter((t) => t.task_time);
  const untimedTasks = tasks.filter((t) => !t.task_time);

  type Anchor = { time: string; kind: "habit" | "task"; item: Habit | Task };
  const timedAll: Anchor[] = [
    ...timedHabits.map((h) => ({ time: h.reminder_time!, kind: "habit" as const, item: h })),
    ...timedTasks.map((t) => ({ time: t.task_time!, kind: "task" as const, item: t })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const allIdsInOrder = [
    ...timedAll.map((a) => a.item.id),
    ...untimedHabits.map((h) => h.id),
    ...untimedTasks.map((t) => t.id),
  ];
  const lastId = allIdsInOrder[allIdsInOrder.length - 1];

  const isEmpty = tasks.length === 0 && (isFuture || habits.length === 0);

  return (
    <div>
      {isEmpty && (
        <p className="px-1 pb-4 text-sm text-muted">
          Добавьте первую задачу или привычку ниже.
        </p>
      )}

      {timedAll.map((anchor) => {
        const isHabit = anchor.kind === "habit";
        const habit = isHabit ? (anchor.item as Habit) : null;
        const task = !isHabit ? (anchor.item as Task) : null;
        return (
          <div key={anchor.item.id}>
            <TimelineRow
              icon={isHabit ? <FlameIcon /> : <TaskIcon />}
              iconFilled={isHabit}
              title={anchor.item.title}
              done={isHabit ? isHabitDoneOn(habit!.id) : task!.done}
              time={anchor.time.slice(0, 5)}
              recurring={isHabit}
              onToggle={() => (isHabit ? onToggleHabit(habit!.id) : onToggleTask(task!.id))}
              onEdit={(title) =>
                isHabit ? onEditHabit(habit!.id, title) : onEditTask(task!.id, title)
              }
              onDelete={() => (isHabit ? onDeleteHabit(habit!.id) : onDeleteTask(task!.id))}
              isLast={anchor.item.id === lastId}
              onTimeClick={
                isHabit
                  ? () => setReminderEditorId(reminderEditorId === habit!.id ? null : habit!.id)
                  : undefined
              }
            />
            {isHabit && reminderEditorId === habit!.id && (
              <div className="ml-[3.25rem] mb-3 flex items-center gap-2">
                <input
                  type="time"
                  value={habit!.reminder_time?.slice(0, 5) ?? ""}
                  onChange={(e) => onSetHabitReminder(habit!.id, e.target.value || null)}
                  className="rounded-lg border border-border bg-surface2 px-2 py-1 text-xs text-text outline-none"
                />
                <button
                  onClick={() => onSetHabitReminder(habit!.id, null)}
                  className="text-xs text-muted hover:text-red-500"
                >
                  Убрать время
                </button>
              </div>
            )}
          </div>
        );
      })}

      {untimedHabits.length > 0 && (
        <DragList
          items={untimedHabits}
          onReorder={onReorderHabits}
          renderItem={(habit, dragHandleProps) => (
            <div>
              <TimelineRow
                icon={<FlameIcon />}
                iconFilled
                title={habit.title}
                done={isHabitDoneOn(habit.id)}
                recurring
                onToggle={() => onToggleHabit(habit.id)}
                onEdit={(title) => onEditHabit(habit.id, title)}
                onDelete={() => onDeleteHabit(habit.id)}
                isLast={habit.id === lastId}
                dragHandleProps={dragHandleProps}
                onTimeClick={() =>
                  setReminderEditorId(reminderEditorId === habit.id ? null : habit.id)
                }
              />
              {reminderEditorId === habit.id && (
                <div className="ml-[3.25rem] mb-3 flex items-center gap-2">
                  <input
                    type="time"
                    value={habit.reminder_time?.slice(0, 5) ?? ""}
                    onChange={(e) => onSetHabitReminder(habit.id, e.target.value || null)}
                    className="rounded-lg border border-border bg-surface2 px-2 py-1 text-xs text-text outline-none"
                  />
                </div>
              )}
            </div>
          )}
        />
      )}

      {untimedTasks.length > 0 && (
        <DragList
          items={untimedTasks}
          onReorder={onReorderTasks}
          renderItem={(task, dragHandleProps) => (
            <TimelineRow
              icon={<TaskIcon />}
              iconFilled={false}
              title={task.title}
              done={task.done}
              onToggle={() => onToggleTask(task.id)}
              onEdit={(title) => onEditTask(task.id, title)}
              onDelete={() => onDeleteTask(task.id)}
              isLast={task.id === lastId}
              dragHandleProps={dragHandleProps}
            />
          )}
        />
      )}

      <div className="ml-[3.25rem] flex gap-2">
        <button
          onClick={() => setAddSheet("task")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted transition hover:border-accent hover:text-accent"
        >
          <span className="text-base leading-none">+</span> {isFuture ? "Дело" : "Задача"}
        </button>
        {!isFuture && (
          <button
            onClick={() => setAddSheet("habit")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted transition hover:border-accent hover:text-accent"
          >
            <span className="text-base leading-none">+</span> Привычка
          </button>
        )}
      </div>

      {addSheet && (
        <AddItemSheet
          initialType={addSheet}
          onClose={() => setAddSheet(null)}
          onCreateTask={onAddTask}
          onCreateHabit={onAddHabit}
        />
      )}
    </div>
  );
}
