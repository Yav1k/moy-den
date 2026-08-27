"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/lib/supabase/types";

export function useGoalsData(userId: string) {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("goals")
      .select("*")
      .eq("archived", false)
      .order("position", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setGoals(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const addGoal = useCallback(
    async (title: string, targetValue: number, unit: string) => {
      const trimmed = title.trim();
      if (!trimmed || !Number.isFinite(targetValue) || targetValue <= 0) return;
      const position = goals.length;
      const { data } = await supabase
        .from("goals")
        .insert({
          title: trimmed,
          target_value: targetValue,
          unit: unit.trim(),
          user_id: userId,
          position,
          archived: false,
        })
        .select()
        .single();
      if (data) setGoals((prev) => [...prev, data]);
    },
    [supabase, userId, goals.length]
  );

  const setGoalValue = useCallback(
    async (id: string, value: number) => {
      const clamped = Math.max(0, value);
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current_value: clamped } : g)));
      await supabase.from("goals").update({ current_value: clamped }).eq("id", id);
    },
    [supabase]
  );

  const incrementGoal = useCallback(
    (id: string, delta: number) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;
      setGoalValue(id, goal.current_value + delta);
    },
    [goals, setGoalValue]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      await supabase.from("goals").update({ archived: true }).eq("id", id);
    },
    [supabase]
  );

  return { loading, goals, addGoal, setGoalValue, incrementGoal, deleteGoal };
}
