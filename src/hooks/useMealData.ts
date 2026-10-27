"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MealLog, MealSlotDb, MealStatus } from "@/lib/supabase/types";
import { todayKey } from "@/lib/date";
import { menuForDate } from "@/data/menu";
import { getRecipe, recipeMacros, MEAL_SLOT_ORDER, type Macros } from "@/data/nutritionBase";

export function useMealData(userId: string, dateKey: string = todayKey()) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<MealLog[]>([]);

  const loadAll = useCallback(async () => {
    const { data } = await supabase.from("meal_logs").select("*").eq("log_date", dateKey);
    if (data) setLogs(data);
    setLoading(false);
  }, [supabase, dateKey]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const logBySlot = useMemo(() => {
    const map = new Map<MealSlotDb, MealLog>();
    for (const log of logs) map.set(log.meal_slot, log);
    return map;
  }, [logs]);

  const menu = menuForDate(dateKey);

  const recipeIdForSlot = useCallback(
    (slot: MealSlotDb) => logBySlot.get(slot)?.recipe_id ?? menu[slot],
    [logBySlot, menu]
  );

  const statusForSlot = useCallback(
    (slot: MealSlotDb): MealStatus => logBySlot.get(slot)?.status ?? "pending",
    [logBySlot]
  );

  const upsertLog = useCallback(
    async (slot: MealSlotDb, patch: { status?: MealStatus; recipe_id?: string | null }) => {
      const existing = logBySlot.get(slot);
      const next = {
        status: patch.status ?? existing?.status ?? ("pending" as MealStatus),
        recipe_id: "recipe_id" in patch ? patch.recipe_id ?? null : existing?.recipe_id ?? null,
      };

      setLogs((prev) => {
        if (existing) {
          return prev.map((l) => (l.meal_slot === slot ? { ...l, ...next } : l));
        }
        return [
          ...prev,
          {
            id: `optimistic-${slot}`,
            user_id: userId,
            log_date: dateKey,
            meal_slot: slot,
            status: next.status,
            recipe_id: next.recipe_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      });

      await supabase.from("meal_logs").upsert(
        {
          user_id: userId,
          log_date: dateKey,
          meal_slot: slot,
          status: next.status,
          recipe_id: next.recipe_id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,log_date,meal_slot" }
      );
    },
    [supabase, userId, dateKey, logBySlot]
  );

  const setStatus = useCallback((slot: MealSlotDb, status: MealStatus) => upsertLog(slot, { status }), [upsertLog]);
  const replaceMeal = useCallback((slot: MealSlotDb, recipeId: string) => upsertLog(slot, { recipe_id: recipeId }), [upsertLog]);
  const resetToDefault = useCallback((slot: MealSlotDb) => upsertLog(slot, { recipe_id: null }), [upsertLog]);

  const totals = useMemo(() => {
    const sum: Macros = { kcal: 0, protein: 0, fat: 0, carbs: 0 };
    for (const slot of MEAL_SLOT_ORDER) {
      const status = statusForSlot(slot);
      if (status !== "eaten" && status !== "half") continue;
      const recipe = getRecipe(recipeIdForSlot(slot));
      if (!recipe) continue;
      const m = recipeMacros(recipe);
      const factor = status === "half" ? 0.5 : 1;
      sum.kcal += m.kcal * factor;
      sum.protein += m.protein * factor;
      sum.fat += m.fat * factor;
      sum.carbs += m.carbs * factor;
    }
    return {
      kcal: Math.round(sum.kcal),
      protein: Math.round(sum.protein * 10) / 10,
      fat: Math.round(sum.fat * 10) / 10,
      carbs: Math.round(sum.carbs * 10) / 10,
    };
  }, [statusForSlot, recipeIdForSlot]);

  return {
    loading,
    dateKey,
    menu,
    recipeIdForSlot,
    statusForSlot,
    setStatus,
    replaceMeal,
    resetToDefault,
    totals,
    refresh: loadAll,
  };
}
