"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { ExerciseCard } from "./ExerciseCard";
import { WeightCard } from "./WeightCard";
import type { ExerciseKind } from "@/lib/supabase/types";
import { formatHuman } from "@/lib/date";

export function WorkoutPage({ userId }: { userId: string }) {
  const {
    loading,
    today,
    exercises,
    setsForExerciseOn,
    personalRecord,
    addSet,
    deleteSet,
    addExercise,
    deleteExercise,
    bodyLogs,
    weightForDate,
    saveWeight,
  } = useWorkoutData(userId);

  const [newTitle, setNewTitle] = useState("");
  const [newKind, setNewKind] = useState<ExerciseKind>("reps");

  function submitNewExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addExercise(newTitle, newKind);
    setNewTitle("");
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16 pt-6 sm:px-6">
      <header className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Утренняя тренировка</h1>
          <p className="text-sm text-muted">{formatHuman(today)}</p>
        </div>
      </header>

      <div className="mt-5 space-y-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
        ) : (
          <>
            <WeightCard
              today={today}
              bodyLogs={bodyLogs}
              weightForDate={weightForDate}
              onSave={saveWeight}
            />

            {exercises.map((exercise) => (
              <div key={exercise.id} className="group/exercise relative">
                <ExerciseCard
                  exercise={exercise}
                  sets={setsForExerciseOn(exercise.id, today)}
                  record={personalRecord(exercise.id)}
                  onAddSet={(value) => addSet(exercise.id, value, today)}
                  onDeleteSet={deleteSet}
                />
                <button
                  onClick={() => deleteExercise(exercise.id)}
                  aria-label="Удалить упражнение"
                  className="absolute right-3 top-3 rounded-lg p-1 text-muted opacity-0 transition hover:text-red-500 group-hover/exercise:opacity-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                  </svg>
                </button>
              </div>
            ))}

            <section className="rounded-2xl border border-dashed border-border bg-surface p-4">
              <h3 className="text-sm font-semibold text-text">Добавить упражнение</h3>
              <form onSubmit={submitNewExercise} className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Название..."
                  className="min-w-0 flex-1 rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
                />
                <select
                  value={newKind}
                  onChange={(e) => setNewKind(e.target.value as ExerciseKind)}
                  className="rounded-xl border border-border bg-surface2 px-2 py-2 text-sm text-text outline-none"
                >
                  <option value="reps">Повторения</option>
                  <option value="duration">Время</option>
                </select>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
                >
                  Добавить
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
