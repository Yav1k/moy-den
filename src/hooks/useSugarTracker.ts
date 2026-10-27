"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SugarFreeDay } from "@/lib/supabase/types";
import { addDays, todayKey } from "@/lib/date";

const HISTORY_DAYS = 400;

export type SugarFlag = "soda" | "sweets_over_limit" | "fastfood" | "alcohol";

export const SUGAR_FLAG_LABELS: Record<SugarFlag, string> = {
  soda: "Газировка с сахаром",
  sweets_over_limit: "Сладкое сверх лимита",
  fastfood: "Фастфуд",
  alcohol: "Алкоголь",
};

const MILESTONES = [3, 7, 14, 30, 60, 100];

const MILESTONE_PHRASES: Record<number, string> = {
  3: "3 дня. Дай угадаю — уже скучно без газировки?",
  7: "Неделя. Организм ещё не заметил, а ты уже гордишься.",
  14: "Две недели. Можно начинать делать вид, что так было всегда.",
  30: "Месяц. Поздравляю, это уже не подвиг, а привычка.",
  60: "Два месяца. Если сорвёшься сейчас — будет особенно обидно.",
  100: "Сотня дней. Даже мы не ожидали.",
};

function isClean(day: SugarFreeDay | undefined): boolean {
  if (!day) return true;
  return !day.soda && !day.sweets_over_limit && !day.fastfood && !day.alcohol;
}

export function useSugarTracker(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayKey();

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<SugarFreeDay[]>([]);

  const loadAll = useCallback(async () => {
    const since = addDays(today, -(HISTORY_DAYS - 1));
    const { data } = await supabase.from("sugar_free_days").select("*").gte("log_date", since).lte("log_date", today);
    if (data) setDays(data);
    setLoading(false);
  }, [supabase, today]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const byDate = useMemo(() => {
    const map = new Map<string, SugarFreeDay>();
    for (const d of days) map.set(d.log_date, d);
    return map;
  }, [days]);

  const flagsForDate = useCallback(
    (dateKey: string) => {
      const d = byDate.get(dateKey);
      return {
        soda: d?.soda ?? false,
        sweets_over_limit: d?.sweets_over_limit ?? false,
        fastfood: d?.fastfood ?? false,
        alcohol: d?.alcohol ?? false,
      };
    },
    [byDate]
  );

  const isCleanOn = useCallback((dateKey: string) => isClean(byDate.get(dateKey)), [byDate]);

  const toggleFlag = useCallback(
    async (dateKey: string, flag: SugarFlag) => {
      const existing = byDate.get(dateKey);
      const next = {
        soda: existing?.soda ?? false,
        sweets_over_limit: existing?.sweets_over_limit ?? false,
        fastfood: existing?.fastfood ?? false,
        alcohol: existing?.alcohol ?? false,
        [flag]: !(existing?.[flag] ?? false),
      };

      setDays((prev) => {
        if (existing) return prev.map((d) => (d.log_date === dateKey ? { ...d, ...next } : d));
        return [
          ...prev,
          {
            id: `optimistic-${dateKey}`,
            user_id: userId,
            log_date: dateKey,
            ...next,
            updated_at: new Date().toISOString(),
          },
        ];
      });

      await supabase
        .from("sugar_free_days")
        .upsert({ user_id: userId, log_date: dateKey, ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id,log_date" });
    },
    [supabase, userId, byDate]
  );

  // Серия дней подряд без срывов, считая от earliest-записи (или от сегодня, если записей ещё нет) —
  // чтобы не показывать бесконечную серию только потому, что данных ещё нет.
  const earliestDate = useMemo(() => (days.length > 0 ? days.reduce((min, d) => (d.log_date < min ? d.log_date : min), days[0].log_date) : today), [days, today]);

  const streak = useMemo(() => {
    let count = 0;
    let cursor = today;
    while (cursor >= earliestDate) {
      if (!isClean(byDate.get(cursor))) break;
      count++;
      cursor = addDays(cursor, -1);
    }
    return count;
  }, [today, earliestDate, byDate]);

  const record = useMemo(() => {
    let best = 0;
    let run = 0;
    let cursor = earliestDate;
    while (cursor <= today) {
      if (isClean(byDate.get(cursor))) {
        run++;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
      cursor = addDays(cursor, 1);
    }
    return Math.max(best, streak);
  }, [earliestDate, today, byDate, streak]);

  const milestonePhrase = MILESTONES.includes(streak) ? MILESTONE_PHRASES[streak] : null;

  const monthStats = useCallback(
    (year: number, month: number) => {
      const first = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const last = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      let clean = 0;
      let total = 0;
      let cursor = first;
      while (cursor <= last && cursor <= today) {
        total++;
        if (isClean(byDate.get(cursor))) clean++;
        cursor = addDays(cursor, 1);
      }
      return { clean, total, percent: total === 0 ? null : Math.round((clean / total) * 100) };
    },
    [byDate, today]
  );

  const topSlips = useMemo(() => {
    const counts: Record<SugarFlag, number> = { soda: 0, sweets_over_limit: 0, fastfood: 0, alcohol: 0 };
    for (const d of days) {
      if (d.soda) counts.soda++;
      if (d.sweets_over_limit) counts.sweets_over_limit++;
      if (d.fastfood) counts.fastfood++;
      if (d.alcohol) counts.alcohol++;
    }
    return (Object.entries(counts) as [SugarFlag, number][])
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [days]);

  return {
    loading,
    today,
    flagsForDate,
    isCleanOn,
    toggleFlag,
    streak,
    record,
    milestonePhrase,
    monthStats,
    topSlips,
    refresh: loadAll,
  };
}
