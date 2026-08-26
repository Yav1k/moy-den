"use client";

import { useState } from "react";
import type { Exercise, ExerciseSet } from "@/lib/supabase/types";
import { formatDuration } from "@/lib/format";
import { Stopwatch } from "./Stopwatch";

export function ExerciseCard({
  exercise,
  sets,
  record,
  onAddSet,
  onDeleteSet,
}: {
  exercise: Exercise;
  sets: ExerciseSet[];
  record: number | null;
  onAddSet: (value: number) => void;
  onDeleteSet: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const isDuration = exercise.kind === "duration";

  function formatValue(value: number) {
    return isDuration ? formatDuration(value) : `${value}`;
  }

  function submitDraft(e: React.FormEvent) {
    e.preventDefault();
    const num = isDuration ? Number(draft) * 60 : Number(draft);
    if (!draft.trim() || !Number.isFinite(num) || num <= 0) return;
    onAddSet(Math.round(num));
    setDraft("");
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">{exercise.title}</h3>
        {record !== null && (
          <span className="text-xs text-muted">Рекорд: {formatValue(record)}{!isDuration && " раз"}</span>
        )}
      </div>

      {sets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sets.map((s, i) => (
            <span
              key={s.id}
              className="group flex items-center gap-1 rounded-lg bg-surface2 py-1 pl-2.5 pr-1 text-xs text-text"
            >
              #{i + 1} · {formatValue(s.value)}
              {!isDuration && " раз"}
              <button
                onClick={() => onDeleteSet(s.id)}
                aria-label="Удалить подход"
                className="rounded p-0.5 text-muted opacity-60 hover:bg-surface hover:text-red-500 hover:opacity-100"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={submitDraft} className="mt-3 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={isDuration ? "минуты" : "повторения"}
          className="w-24 rounded-xl border border-dashed border-border bg-transparent px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
        >
          Подход
        </button>
        {isDuration && <Stopwatch onFinish={onAddSet} />}
      </form>
    </section>
  );
}
