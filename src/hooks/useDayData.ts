"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Habit, HabitLog, Task } from "@/lib/supabase/types";
import { addDays, lastNDays, todayKey, toDateKey } from "@/lib/date";

const WEEK_DAYS = 7;
const STREAK_LOOKBACK_DAYS = 60;

export function useDayData(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayKey();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  const loadAll = useCallback(async () => {
    const since = addDays(today, -(STREAK_LOOKBACK_DAYS - 1));

    const [tasksRes, habitsRes, logsRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .gte("task_date", since)
        .order("position", { ascending: true }),
      supabase
        .from("habits")
        .select("*")
        .eq("archived", false)
        .order("position", { ascending: true }),
      supabase
        .from("habit_logs")
        .select("*")
        .gte("log_date", since),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (habitsRes.data) setHabits(habitsRes.data);
    if (logsRes.data) setLogs(logsRes.data);
    setLoading(false);
  }, [supabase, today]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    function onFocus() {
      if (document.visibilityState === "visible") loadAll();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [loadAll]);

  // --- Задачи на сегодня ---

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.task_date === today),
    [tasks, today]
  );

  const addTask = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const position = todayTasks.length;
      const { data } = await supabase
        .from("tasks")
        .insert({ title: trimmed, user_id: userId, task_date: today, position })
        .select()
        .single();
      if (data) setTasks((prev) => [...prev, data]);
    },
    [supabase, userId, today, todayTasks.length]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const done = !task.done;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
      await supabase.from("tasks").update({ done }).eq("id", id);
    },
    [supabase, tasks]
  );

  const editTask = useCallback(
    async (id: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)));
      await supabase.from("tasks").update({ title: trimmed }).eq("id", id);
    },
    [supabase]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await supabase.from("tasks").delete().eq("id", id);
    },
    [supabase]
  );

  // --- Привычки (ежедневный чек-лист) ---

  const logsByHabitAndDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const log of logs) {
      if (!map.has(log.habit_id)) map.set(log.habit_id, new Set());
      map.get(log.habit_id)!.add(log.log_date);
    }
    return map;
  }, [logs]);

  const isHabitDoneOn = useCallback(
    (habitId: string, dateKey: string) =>
      logsByHabitAndDate.get(habitId)?.has(dateKey) ?? false,
    [logsByHabitAndDate]
  );

  const addHabit = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const position = habits.length;
      const { data } = await supabase
        .from("habits")
        .insert({ title: trimmed, user_id: userId, position, archived: false })
        .select()
        .single();
      if (data) setHabits((prev) => [...prev, data]);
    },
    [supabase, userId, habits.length]
  );

  const editHabit = useCallback(
    async (id: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, title: trimmed } : h)));
      await supabase.from("habits").update({ title: trimmed }).eq("id", id);
    },
    [supabase]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      await supabase.from("habits").update({ archived: true }).eq("id", id);
    },
    [supabase]
  );

  const toggleHabitToday = useCallback(
    async (habitId: string) => {
      const doneNow = isHabitDoneOn(habitId, today);
      if (doneNow) {
        setLogs((prev) =>
          prev.filter((l) => !(l.habit_id === habitId && l.log_date === today))
        );
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("log_date", today);
      } else {
        const { data } = await supabase
          .from("habit_logs")
          .insert({ habit_id: habitId, user_id: userId, log_date: today })
          .select()
          .single();
        if (data) setLogs((prev) => [...prev, data]);
        else
          setLogs((prev) => [
            ...prev,
            {
              id: `optimistic-${habitId}-${today}`,
              habit_id: habitId,
              user_id: userId,
              log_date: today,
              created_at: new Date().toISOString(),
            },
          ]);
      }
    },
    [supabase, userId, today, isHabitDoneOn]
  );

  // --- Статистика ---

  const stats = useMemo(() => {
    const habitsActiveOn = (dateKey: string) =>
      habits.filter((h) => toDateKey(new Date(h.created_at)) <= dateKey);

    const doneCountOn = (dateKey: string) =>
      logs.filter((l) => l.log_date === dateKey).length;

    const tasksOn = (dateKey: string) => tasks.filter((t) => t.task_date === dateKey);

    // Сегодня
    const todayHabits = habitsActiveOn(today);
    const todayHabitsDone = doneCountOn(today);
    const todayTasksList = tasksOn(today);
    const todayTasksDone = todayTasksList.filter((t) => t.done).length;
    const todayTotal = todayHabits.length + todayTasksList.length;
    const todayDone = todayHabitsDone + todayTasksDone;

    // Неделя (последние 7 дней, включая сегодня)
    const week = lastNDays(WEEK_DAYS, today);
    let weekTotal = 0;
    let weekDone = 0;
    for (const day of week) {
      const dayHabits = habitsActiveOn(day);
      const dayTasks = tasksOn(day);
      weekTotal += dayHabits.length + dayTasks.length;
      weekDone += doneCountOn(day) + dayTasks.filter((t) => t.done).length;
    }

    // Серия дней подряд без пропусков (по привычкам)
    let streak = 0;
    let cursor = today;
    // Если сегодняшний чек-лист ещё не полностью закрыт, начинаем отсчёт со вчера,
    // чтобы не обнулять серию раньше времени в течение дня.
    const todayComplete =
      todayHabits.length > 0 && todayHabitsDone >= todayHabits.length;
    if (todayHabits.length > 0 && !todayComplete) {
      cursor = addDays(today, -1);
    }
    for (let step = 0; step < STREAK_LOOKBACK_DAYS; step++) {
      const dayHabits = habitsActiveOn(cursor);
      if (dayHabits.length === 0) {
        cursor = addDays(cursor, -1);
        continue;
      }
      const doneOnDay = doneCountOn(cursor);
      if (doneOnDay >= dayHabits.length) {
        streak += 1;
        cursor = addDays(cursor, -1);
      } else {
        break;
      }
    }

    return { todayTotal, todayDone, weekTotal, weekDone, streak };
  }, [habits, logs, tasks, today]);

  return {
    loading,
    today,
    todayTasks,
    habits,
    isHabitDoneOn,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
    addHabit,
    editHabit,
    deleteHabit,
    toggleHabitToday,
    stats,
    refresh: loadAll,
  };
}
