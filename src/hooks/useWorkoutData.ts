"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BodyLog, Exercise, ExerciseKind, ExerciseSet } from "@/lib/supabase/types";
import { todayKey } from "@/lib/date";

const DEFAULT_EXERCISES: { title: string; kind: ExerciseKind }[] = [
  { title: "Отжимания", kind: "reps" },
  { title: "Приседания", kind: "reps" },
  { title: "Растяжка", kind: "duration" },
  { title: "Планка", kind: "duration" },
];

export function useWorkoutData(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayKey();

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([]);

  const loadAll = useCallback(async () => {
    const [exercisesRes, setsRes, bodyLogsRes] = await Promise.all([
      supabase
        .from("exercises")
        .select("*")
        .eq("archived", false)
        .order("position", { ascending: true }),
      // Без фильтра по дате — нужен весь список для личных рекордов.
      supabase.from("exercise_sets").select("*"),
      supabase.from("body_logs").select("*").order("entry_date", { ascending: true }),
    ]);

    let currentExercises = exercisesRes.data ?? [];

    if (currentExercises.length === 0 && !exercisesRes.error) {
      const { data: seeded } = await supabase
        .from("exercises")
        .insert(
          DEFAULT_EXERCISES.map((e, position) => ({
            title: e.title,
            kind: e.kind,
            user_id: userId,
            position,
            archived: false,
          }))
        )
        .select();
      if (seeded) currentExercises = seeded;
    }

    setExercises(currentExercises);
    if (setsRes.data) setSets(setsRes.data);
    if (bodyLogsRes.data) setBodyLogs(bodyLogsRes.data);
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const setsForExerciseOn = useCallback(
    (exerciseId: string, dateKey: string) =>
      sets
        .filter((s) => s.exercise_id === exerciseId && s.entry_date === dateKey)
        .sort((a, b) => a.position - b.position),
    [sets]
  );

  const personalRecord = useCallback(
    (exerciseId: string) => {
      const values = sets.filter((s) => s.exercise_id === exerciseId).map((s) => s.value);
      return values.length === 0 ? null : Math.max(...values);
    },
    [sets]
  );

  const addSet = useCallback(
    async (exerciseId: string, value: number, dateKey: string = today) => {
      if (!Number.isFinite(value) || value <= 0) return;
      const position = setsForExerciseOn(exerciseId, dateKey).length;
      const { data } = await supabase
        .from("exercise_sets")
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          entry_date: dateKey,
          value: Math.round(value),
          position,
        })
        .select()
        .single();
      if (data) setSets((prev) => [...prev, data]);
    },
    [supabase, userId, today, setsForExerciseOn]
  );

  const deleteSet = useCallback(
    async (id: string) => {
      setSets((prev) => prev.filter((s) => s.id !== id));
      await supabase.from("exercise_sets").delete().eq("id", id);
    },
    [supabase]
  );

  const addExercise = useCallback(
    async (title: string, kind: ExerciseKind) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const position = exercises.length;
      const { data } = await supabase
        .from("exercises")
        .insert({ title: trimmed, kind, user_id: userId, position, archived: false })
        .select()
        .single();
      if (data) setExercises((prev) => [...prev, data]);
    },
    [supabase, userId, exercises.length]
  );

  const deleteExercise = useCallback(
    async (id: string) => {
      setExercises((prev) => prev.filter((e) => e.id !== id));
      await supabase.from("exercises").update({ archived: true }).eq("id", id);
    },
    [supabase]
  );

  // --- Вес тела ---

  const weightForDate = useCallback(
    (dateKey: string) => bodyLogs.find((b) => b.entry_date === dateKey)?.weight_kg ?? null,
    [bodyLogs]
  );

  const latestWeight = useMemo(() => {
    const withWeight = bodyLogs.filter((b) => b.weight_kg != null);
    return withWeight.length === 0 ? null : withWeight[withWeight.length - 1];
  }, [bodyLogs]);

  const saveWeight = useCallback(
    async (dateKey: string, weightKg: number | null) => {
      setBodyLogs((prev) => {
        const existing = prev.find((b) => b.entry_date === dateKey);
        if (existing) {
          return prev.map((b) => (b.entry_date === dateKey ? { ...b, weight_kg: weightKg } : b));
        }
        return [
          ...prev,
          {
            id: `optimistic-${dateKey}`,
            user_id: userId,
            entry_date: dateKey,
            weight_kg: weightKg,
            created_at: new Date().toISOString(),
          },
        ].sort((a, b) => (a.entry_date < b.entry_date ? -1 : 1));
      });
      await supabase
        .from("body_logs")
        .upsert(
          { user_id: userId, entry_date: dateKey, weight_kg: weightKg },
          { onConflict: "user_id,entry_date" }
        );
    },
    [supabase, userId]
  );

  return {
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
    latestWeight,
    saveWeight,
  };
}
