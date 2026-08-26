"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Habit, HabitLog, JournalEntry, Task } from "@/lib/supabase/types";
import { addDays, lastNDays, todayKey, toDateKey } from "@/lib/date";

const WEEK_DAYS = 7;
const STREAK_LOOKBACK_DAYS = 60;
const HISTORY_DAYS = 400; // ~13 месяцев назад — достаточно для календаря и бэкфилла

export function useDayData(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayKey();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  const loadAll = useCallback(async () => {
    const since = addDays(today, -(HISTORY_DAYS - 1));
    const until = addDays(today, HISTORY_DAYS); // с запасом вперёд — для планов на будущее

    const [tasksRes, habitsRes, logsRes, journalRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .gte("task_date", since)
        .lte("task_date", until)
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
      supabase
        .from("journal_entries")
        .select("*")
        .gte("entry_date", since)
        .lte("entry_date", today),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (habitsRes.data) setHabits(habitsRes.data);
    if (logsRes.data) setLogs(logsRes.data);
    if (journalRes.data) setJournal(journalRes.data);
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

  // --- Задачи ---

  const tasksForDate = useCallback(
    (dateKey: string) =>
      tasks
        .filter((t) => t.task_date === dateKey)
        .sort((a, b) => {
          if (a.task_time && b.task_time) return a.task_time.localeCompare(b.task_time);
          if (a.task_time) return -1;
          if (b.task_time) return 1;
          return a.position - b.position;
        }),
    [tasks]
  );

  const todayTasks = useMemo(() => tasksForDate(today), [tasksForDate, today]);

  const addTask = useCallback(
    async (title: string, dateKey: string = today, time: string | null = null) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const position = tasksForDate(dateKey).length;
      const { data } = await supabase
        .from("tasks")
        .insert({
          title: trimmed,
          user_id: userId,
          task_date: dateKey,
          task_time: time,
          position,
        })
        .select()
        .single();
      if (data) setTasks((prev) => [...prev, data]);
    },
    [supabase, userId, today, tasksForDate]
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

  const toggleHabitOn = useCallback(
    async (habitId: string, dateKey: string = today) => {
      const doneNow = isHabitDoneOn(habitId, dateKey);
      if (doneNow) {
        setLogs((prev) =>
          prev.filter((l) => !(l.habit_id === habitId && l.log_date === dateKey))
        );
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("log_date", dateKey);
      } else {
        const { data } = await supabase
          .from("habit_logs")
          .insert({ habit_id: habitId, user_id: userId, log_date: dateKey })
          .select()
          .single();
        if (data) setLogs((prev) => [...prev, data]);
        else
          setLogs((prev) => [
            ...prev,
            {
              id: `optimistic-${habitId}-${dateKey}`,
              habit_id: habitId,
              user_id: userId,
              log_date: dateKey,
              created_at: new Date().toISOString(),
            },
          ]);
      }
    },
    [supabase, userId, isHabitDoneOn, today]
  );

  const toggleHabitToday = useCallback(
    (habitId: string) => toggleHabitOn(habitId, today),
    [toggleHabitOn, today]
  );

  // --- Статистика ---

  const habitsActiveOn = useCallback(
    (dateKey: string) => habits.filter((h) => toDateKey(new Date(h.created_at)) <= dateKey),
    [habits]
  );

  const doneCountOn = useCallback(
    (dateKey: string) => logs.filter((l) => l.log_date === dateKey).length,
    [logs]
  );

  const getDayStats = useCallback(
    (dateKey: string) => {
      const dayHabits = habitsActiveOn(dateKey);
      const dayHabitsDone = doneCountOn(dateKey);
      const dayTasks = tasksForDate(dateKey);
      const dayTasksDone = dayTasks.filter((t) => t.done).length;
      const total = dayHabits.length + dayTasks.length;
      const done = dayHabitsDone + dayTasksDone;
      return { total, done, ratio: total === 0 ? null : done / total };
    },
    [habitsActiveOn, doneCountOn, tasksForDate]
  );

  const stats = useMemo(() => {
    const todayHabits = habitsActiveOn(today);
    const todayHabitsDone = doneCountOn(today);
    const todayTasksList = tasksForDate(today);
    const todayTasksDone = todayTasksList.filter((t) => t.done).length;
    const todayTotal = todayHabits.length + todayTasksList.length;
    const todayDone = todayHabitsDone + todayTasksDone;

    // Неделя (последние 7 дней, включая сегодня)
    const week = lastNDays(WEEK_DAYS, today);
    let weekTotal = 0;
    let weekDone = 0;
    for (const day of week) {
      const dayHabits = habitsActiveOn(day);
      const dayTasks = tasksForDate(day);
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
  }, [habitsActiveOn, doneCountOn, tasksForDate, today]);

  // --- Дневник дня ---

  const journalByDate = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    for (const entry of journal) map.set(entry.entry_date, entry);
    return map;
  }, [journal]);

  const journalForDate = useCallback(
    (dateKey: string) => journalByDate.get(dateKey)?.content ?? "",
    [journalByDate]
  );

  const saveJournal = useCallback(
    async (dateKey: string, content: string) => {
      setJournal((prev) => {
        const existing = prev.find((e) => e.entry_date === dateKey);
        if (existing) {
          return prev.map((e) => (e.entry_date === dateKey ? { ...e, content } : e));
        }
        return [
          ...prev,
          {
            id: `optimistic-${dateKey}`,
            user_id: userId,
            entry_date: dateKey,
            content,
            updated_at: new Date().toISOString(),
          },
        ];
      });
      await supabase
        .from("journal_entries")
        .upsert(
          { user_id: userId, entry_date: dateKey, content, updated_at: new Date().toISOString() },
          { onConflict: "user_id,entry_date" }
        );
    },
    [supabase, userId]
  );

  // --- Планы (для точек в календаре на будущих днях) ---

  const hasPlansOn = useCallback(
    (dateKey: string) => tasksForDate(dateKey).length > 0,
    [tasksForDate]
  );

  return {
    loading,
    today,
    todayTasks,
    tasksForDate,
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
    toggleHabitOn,
    getDayStats,
    hasPlansOn,
    journalForDate,
    saveJournal,
    stats,
    refresh: loadAll,
  };
}
