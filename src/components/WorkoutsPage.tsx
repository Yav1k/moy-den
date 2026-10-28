"use client";

import { useState } from "react";
import { useWorkoutProgram } from "@/hooks/useWorkoutProgram";
import { RestTimer } from "./RestTimer";
import { BottomNav } from "./BottomNav";
import { formatHuman, todayKey } from "@/lib/date";
import { DAY_TYPE_LABELS, type WorkoutExercise } from "@/data/workoutProgram";

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m} мин ${s} сек`;
}

type Draft = { weight: string; reps: string };

export function WorkoutsPage({ userId }: { userId: string }) {
  const today = todayKey();
  const {
    loading,
    scheduledYesterday,
    missedYesterday,
    shiftAccepted,
    acceptShift,
    effectiveDayType,
    program,
    todaySession,
    todayCompletedSession,
    setsForSession,
    logSet,
    lastValuesFor,
    completeSession,
  } = useWorkoutProgram(userId);

  const [draft, setDraft] = useState<Record<string, Draft>>({});
  const [activeRest, setActiveRest] = useState<{ key: string; seconds: number } | null>(null);
  const [infoOpen, setInfoOpen] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    durationSeconds: number;
    totalTonnage: number;
    prevTonnage: number | null;
    prevDurationSeconds: number | null;
  } | null>(null);

  const loggedSets = todaySession ? setsForSession(todaySession.id) : [];

  function draftFor(exercise: WorkoutExercise, setIndex: number): Draft {
    const key = `${exercise.id}-${setIndex}`;
    if (draft[key]) return draft[key];
    const logged = loggedSets.find((s) => s.exercise_id === exercise.id && s.set_index === setIndex);
    if (logged) return { weight: logged.weight_kg != null ? String(logged.weight_kg) : "", reps: logged.reps != null ? String(logged.reps) : "" };
    const last = lastValuesFor(exercise.id, setIndex);
    return { weight: last?.weight_kg != null ? String(last.weight_kg) : "", reps: last?.reps != null ? String(last.reps) : "" };
  }

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { weight: "", reps: "" }), ...patch } }));
  }

  function isLogged(exerciseId: string, setIndex: number) {
    return loggedSets.some((s) => s.exercise_id === exerciseId && s.set_index === setIndex);
  }

  async function confirmSet(exercise: WorkoutExercise, setIndex: number) {
    if (effectiveDayType === "rest") return;
    const key = `${exercise.id}-${setIndex}`;
    const d = draftFor(exercise, setIndex);
    if (!d.reps.trim()) return;
    const weight = d.weight.trim() === "" ? null : Number(d.weight);
    const reps = Number(d.reps);
    if (!Number.isFinite(reps)) return;
    await logSet(effectiveDayType, exercise.id, setIndex, Number.isFinite(weight as number) ? weight : null, reps);
    setActiveRest({ key, seconds: exercise.restSeconds });
  }

  async function finishWorkout() {
    if (effectiveDayType === "rest") return;
    const result = await completeSession(effectiveDayType);
    if (result) setSummary(result);
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <header>
        <h1 className="text-xl font-bold text-text">Тренировка</h1>
        <p className="text-sm text-muted">{formatHuman(today)}</p>
      </header>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
      ) : (
        <div className="mt-5 space-y-4">
          {missedYesterday && !shiftAccepted && (
            <section className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
              <p className="text-sm text-text">
                Вчера была пропущена тренировка «{DAY_TYPE_LABELS[scheduledYesterday as "upper" | "lower"]}».
              </p>
              <button
                onClick={acceptShift}
                className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-fill transition hover:opacity-90"
              >
                Перенести на сегодня?
              </button>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-base font-semibold text-text">{DAY_TYPE_LABELS[effectiveDayType]}</h2>
            {effectiveDayType === "rest" ? (
              <p className="mt-1 text-sm text-muted">Сегодня день отдыха.</p>
            ) : (
              <p className="mt-1 text-sm text-muted">{program.length} упражнений</p>
            )}
          </section>

          {summary && (
            <section className="rounded-2xl border border-success/40 bg-success/10 p-4">
              <h2 className="text-sm font-semibold text-success">Тренировка завершена 🎉</h2>
              <p className="mt-1 text-sm text-text">Длительность: {formatDuration(summary.durationSeconds)}</p>
              <p className="text-sm text-text">Тоннаж: {Math.round(summary.totalTonnage)} кг</p>
              {summary.prevTonnage != null && (
                <p className="mt-1 text-xs text-muted">
                  В прошлый раз: {Math.round(summary.prevTonnage)} кг
                  {summary.prevTonnage > 0 && (
                    <> ({summary.totalTonnage >= summary.prevTonnage ? "+" : ""}
                    {Math.round(summary.totalTonnage - summary.prevTonnage)} кг)</>
                  )}
                </p>
              )}
            </section>
          )}

          {effectiveDayType !== "rest" &&
            program.map((exercise) => (
              <section key={exercise.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-text">{exercise.title}</h3>
                    <p className="text-xs text-muted">
                      {exercise.sets}×{exercise.repsLabel}
                      {exercise.perSide ? " на сторону" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setInfoOpen(infoOpen === exercise.id ? null : exercise.id)}
                    aria-label="Техника выполнения"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted hover:bg-surface2"
                  >
                    ⓘ
                  </button>
                </div>

                {infoOpen === exercise.id && (
                  <div className="mt-2 rounded-xl bg-surface2 p-3 text-xs text-text">
                    {exercise.techniqueTip.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    <p className="mt-1.5 text-danger">Не допускай: {exercise.mainMistake}</p>
                    {exercise.substitution && <p className="mt-1.5 text-muted">Замена: {exercise.substitution}</p>}
                    {exercise.progression && <p className="mt-1 text-muted">{exercise.progression}</p>}
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  {Array.from({ length: exercise.sets }).map((_, i) => {
                    const key = `${exercise.id}-${i}`;
                    const d = draftFor(exercise, i);
                    const done = isLogged(exercise.id, i);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-xs text-muted">Подход {i + 1}</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="кг"
                          value={d.weight}
                          onChange={(e) => updateDraft(key, { weight: e.target.value })}
                          className="w-16 rounded-lg border border-border bg-surface2 px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder={exercise.trackingType === "seconds" ? "сек" : "повт"}
                          value={d.reps}
                          onChange={(e) => updateDraft(key, { reps: e.target.value })}
                          className="w-16 rounded-lg border border-border bg-surface2 px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => confirmSet(exercise, i)}
                          className={`ml-auto flex h-8 w-8 items-center justify-center rounded-full border transition ${
                            done ? "border-success bg-success text-on-fill" : "border-border text-muted hover:bg-surface2"
                          }`}
                          aria-label="Отметить подход"
                        >
                          ✓
                        </button>
                      </div>
                    );
                  })}
                </div>

                {activeRest && activeRest.key.startsWith(`${exercise.id}-`) && (
                  <div className="mt-3">
                    <RestTimer seconds={activeRest.seconds} onDone={() => setActiveRest(null)} key={activeRest.key} />
                  </div>
                )}
              </section>
            ))}

          {effectiveDayType !== "rest" && !todayCompletedSession && (
            <button
              onClick={finishWorkout}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-on-fill transition hover:opacity-90"
            >
              Тренировка завершена
            </button>
          )}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
