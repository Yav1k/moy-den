"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BodyLog } from "@/lib/supabase/types";
import { startOfWeek, todayKey } from "@/lib/date";

export type WeekAverage = { weekStart: string; avg: number; count: number };

export function useWeightData(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayKey();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<BodyLog[]>([]);

  const loadAll = useCallback(async () => {
    const { data } = await supabase.from("body_logs").select("*").order("entry_date", { ascending: true });
    if (data) setLogs(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of logs) if (l.weight_kg != null) map.set(l.entry_date, l.weight_kg);
    return map;
  }, [logs]);

  const weightForDate = useCallback((dateKey: string) => byDate.get(dateKey) ?? null, [byDate]);

  const latest = useMemo(() => {
    const withWeight = logs.filter((l) => l.weight_kg != null);
    return withWeight.length === 0 ? null : withWeight[withWeight.length - 1];
  }, [logs]);

  const saveWeight = useCallback(
    async (dateKey: string, weightKg: number | null) => {
      setLogs((prev) => {
        const existing = prev.find((l) => l.entry_date === dateKey);
        if (existing) return prev.map((l) => (l.entry_date === dateKey ? { ...l, weight_kg: weightKg } : l));
        return [
          ...prev,
          { id: `optimistic-${dateKey}`, user_id: userId, entry_date: dateKey, weight_kg: weightKg, created_at: new Date().toISOString() },
        ].sort((a, b) => (a.entry_date < b.entry_date ? -1 : 1));
      });
      await supabase.from("body_logs").upsert({ user_id: userId, entry_date: dateKey, weight_kg: weightKg }, { onConflict: "user_id,entry_date" });
    },
    [supabase, userId]
  );

  // Средние по неделям (пн-вс) — на них и нужно ориентироваться, а не на отдельные дни.
  const weeklyAverages = useMemo<WeekAverage[]>(() => {
    const buckets = new Map<string, number[]>();
    for (const l of logs) {
      if (l.weight_kg == null) continue;
      const weekStart = startOfWeek(l.entry_date);
      if (!buckets.has(weekStart)) buckets.set(weekStart, []);
      buckets.get(weekStart)!.push(l.weight_kg);
    }
    return Array.from(buckets.entries())
      .map(([weekStart, values]) => ({
        weekStart,
        avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
        count: values.length,
      }))
      .sort((a, b) => (a.weekStart < b.weekStart ? -1 : 1));
  }, [logs]);

  const hint = useMemo(() => {
    const n = weeklyAverages.length;
    if (n >= 2) {
      const last = weeklyAverages[n - 1];
      const prev = weeklyAverages[n - 2];
      if (prev.avg - last.avg > 1) {
        return { kind: "fast" as const, text: "Добавь 150 ккал, иначе уйдут мышцы." };
      }
    }
    if (n >= 3) {
      const last = weeklyAverages[n - 1];
      const twoAgo = weeklyAverages[n - 3];
      if (last.avg >= twoAgo.avg) {
        return { kind: "plateau" as const, text: "Убери 150 ккал — сладкое или часть гарнира." };
      }
    }
    return null;
  }, [weeklyAverages]);

  return {
    loading,
    today,
    logs,
    weightForDate,
    latest,
    saveWeight,
    weeklyAverages,
    hint,
    refresh: loadAll,
  };
}
