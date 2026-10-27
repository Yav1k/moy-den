"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutDayType, WorkoutSession, WorkoutSet } from "@/lib/supabase/types";
import { addDays, todayKey } from "@/lib/date";
import { dayTypeFor, PROGRAM, type DayType } from "@/data/workoutProgram";

export function useWorkoutProgram(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayKey();
  const yesterday = addDays(today, -1);

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [shiftAccepted, setShiftAccepted] = useState(false);

  const loadAll = useCallback(async () => {
    const [sessionsRes, setsRes] = await Promise.all([
      supabase.from("workout_sessions").select("*").order("session_date", { ascending: true }),
      supabase.from("workout_sets").select("*").order("created_at", { ascending: true }),
    ]);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (setsRes.data) setSets(setsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const scheduledToday = dayTypeFor(today);
  const scheduledYesterday = dayTypeFor(yesterday);

  const completedOn = useCallback(
    (dateKey: string) => sessions.find((s) => s.session_date === dateKey && s.completed_at),
    [sessions]
  );

  const missedYesterday = scheduledYesterday !== "rest" && !completedOn(yesterday);

  // Эффективный тип тренировки на сегодня: обычный по расписанию,
  // либо перенесённый пропущенный день, если пользователь согласился.
  const effectiveDayType: DayType = shiftAccepted && missedYesterday ? scheduledYesterday : scheduledToday;

  const todaySession = useMemo(
    () => sessions.find((s) => s.session_date === today && !s.completed_at) ?? null,
    [sessions, today]
  );

  const todayCompletedSession = useMemo(() => sessions.find((s) => s.session_date === today && s.completed_at), [sessions, today]);

  const setsForSession = useCallback(
    (sessionId: string) => sets.filter((s) => s.session_id === sessionId),
    [sets]
  );

  const ensureSession = useCallback(
    async (dayType: "upper" | "lower") => {
      if (todaySession) return todaySession;

      // Создаём сессию оптимистично — чтобы отметка подхода и таймер отдыха
      // не зависели от того, успеет ли ответить сервер.
      const optimistic: WorkoutSession = {
        id: `optimistic-${today}`,
        user_id: userId,
        session_date: today,
        day_type: dayType,
        started_at: new Date().toISOString(),
        completed_at: null,
        duration_seconds: null,
        total_tonnage: null,
        created_at: new Date().toISOString(),
      };
      setSessions((prev) => (prev.some((s) => s.id === optimistic.id) ? prev : [...prev, optimistic]));

      const { data } = await supabase
        .from("workout_sessions")
        .insert({ user_id: userId, session_date: today, day_type: dayType })
        .select()
        .single();
      if (data) {
        setSessions((prev) => prev.map((s) => (s.id === optimistic.id ? data : s)));
        setSets((prev) => prev.map((s) => (s.session_id === optimistic.id ? { ...s, session_id: data.id } : s)));
        return data;
      }
      return optimistic;
    },
    [supabase, userId, today, todaySession]
  );

  const logSet = useCallback(
    async (dayType: "upper" | "lower", exerciseId: string, setIndex: number, weightKg: number | null, reps: number | null) => {
      const session = await ensureSession(dayType);
      if (!session) return;

      const existing = sets.find((s) => s.session_id === session.id && s.exercise_id === exerciseId && s.set_index === setIndex);
      const optimistic: WorkoutSet = {
        id: existing?.id ?? `optimistic-${exerciseId}-${setIndex}`,
        user_id: userId,
        session_id: session.id,
        exercise_id: exerciseId,
        set_index: setIndex,
        weight_kg: weightKg,
        reps,
        created_at: existing?.created_at ?? new Date().toISOString(),
      };
      setSets((prev) => (existing ? prev.map((s) => (s.id === existing.id ? optimistic : s)) : [...prev, optimistic]));

      const { data } = await supabase
        .from("workout_sets")
        .upsert(
          { user_id: userId, session_id: session.id, exercise_id: exerciseId, set_index: setIndex, weight_kg: weightKg, reps },
          { onConflict: "session_id,exercise_id,set_index" }
        )
        .select()
        .single();
      if (data) setSets((prev) => prev.map((s) => (s.id === optimistic.id ? data : s)));
    },
    [supabase, userId, sets, ensureSession]
  );

  // Значения с прошлой тренировки этого типа — для подстановки, чтобы менять только то, что изменилось.
  const lastValuesFor = useCallback(
    (exerciseId: string, setIndex: number) => {
      const relevantSessionIds = new Set(
        sessions.filter((s) => s.completed_at && s.session_date !== today).map((s) => s.id)
      );
      const history = sets
        .filter((s) => s.exercise_id === exerciseId && s.set_index === setIndex && relevantSessionIds.has(s.session_id))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      return history[0] ?? null;
    },
    [sets, sessions, today]
  );

  const previousSessionOfType = useCallback(
    (dayType: "upper" | "lower", excludeId?: string) =>
      sessions
        .filter((s) => s.day_type === dayType && s.completed_at && s.id !== excludeId)
        .sort((a, b) => (a.session_date < b.session_date ? 1 : -1))[0] ?? null,
    [sessions]
  );

  const tonnageFor = useCallback(
    (sessionId: string) =>
      sets
        .filter((s) => s.session_id === sessionId)
        .reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0),
    [sets]
  );

  const completeSession = useCallback(
    async (dayType: "upper" | "lower") => {
      const session = await ensureSession(dayType);
      if (!session) return null;

      const startedAt = new Date(session.started_at).getTime();
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const totalTonnage = tonnageFor(session.id);
      const prev = previousSessionOfType(dayType, session.id);
      const prevTonnage = prev ? tonnageFor(prev.id) : null;

      const completedAt = new Date().toISOString();
      setSessions((prevList) =>
        prevList.map((s) => (s.id === session.id ? { ...s, completed_at: completedAt, duration_seconds: durationSeconds, total_tonnage: totalTonnage } : s))
      );
      await supabase
        .from("workout_sessions")
        .update({ completed_at: completedAt, duration_seconds: durationSeconds, total_tonnage: totalTonnage })
        .eq("id", session.id);

      return {
        durationSeconds,
        totalTonnage,
        prevTonnage,
        prevDurationSeconds: prev?.duration_seconds ?? null,
      };
    },
    [supabase, ensureSession, tonnageFor, previousSessionOfType]
  );

  return {
    loading,
    today,
    scheduledToday,
    scheduledYesterday,
    missedYesterday,
    shiftAccepted,
    acceptShift: () => setShiftAccepted(true),
    dismissShift: () => setShiftAccepted(false),
    effectiveDayType,
    program: effectiveDayType === "rest" ? [] : PROGRAM[effectiveDayType],
    todaySession,
    todayCompletedSession,
    setsForSession,
    logSet,
    lastValuesFor,
    completeSession,
    refresh: loadAll,
  };
}
