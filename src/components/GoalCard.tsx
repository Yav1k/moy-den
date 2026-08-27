"use client";

import { useState } from "react";
import type { Goal } from "@/lib/supabase/types";

export function GoalCard({
  goal,
  onIncrement,
  onSetValue,
  onDelete,
}: {
  goal: Goal;
  onIncrement: (id: string, delta: number) => void;
  onSetValue: (id: string, value: number) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(goal.current_value));

  const ratio = Math.min(1, goal.current_value / goal.target_value);
  const done = goal.current_value >= goal.target_value;

  function commit() {
    setEditing(false);
    const num = Number(draft);
    if (Number.isFinite(num)) onSetValue(goal.id, num);
    else setDraft(String(goal.current_value));
  }

  return (
    <section className="group rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text">
          {goal.title}
          {done && " 🎉"}
        </h3>
        <button
          onClick={() => onDelete(goal.id)}
          aria-label="Удалить цель"
          className="rounded-lg p-1 text-muted opacity-0 transition hover:text-red-500 group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface2">
        <div
          className={`h-full rounded-full transition-all ${done ? "bg-emerald-500" : "bg-accent"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        {editing ? (
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="w-20 rounded-lg border border-border bg-surface2 px-2 py-1 text-sm text-text outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(String(goal.current_value));
              setEditing(true);
            }}
            className="text-sm text-muted hover:text-text"
          >
            {goal.current_value} / {goal.target_value} {goal.unit}
          </button>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onIncrement(goal.id, -1)}
            aria-label="Убавить"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text hover:bg-surface2"
          >
            −
          </button>
          <button
            onClick={() => onIncrement(goal.id, 1)}
            aria-label="Прибавить"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-fg"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}
