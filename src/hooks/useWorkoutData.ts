"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Exercise, ExerciseKind, ExerciseSet } from "@/lib/supabase/types";
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

  const loadAll = useCallback(async () => {
    const [exercisesRes, setsRes] = await Promise.all([
      supabase
        .from("exercises")
        .select("*")
        .eq("archived", false)
        .order("position", { ascending: true }),
      // Без фильтра по дате — нужен весь список для личных рекордов.
      supabase.from("exercise_sets").select("*"),
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
  };
}
