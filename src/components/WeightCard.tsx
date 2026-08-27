"use client";

import { useEffect, useState } from "react";
import type { BodyLog } from "@/lib/supabase/types";

export function WeightCard({
  today,
  bodyLogs,
  weightForDate,
  onSave,
}: {
  today: string;
  bodyLogs: BodyLog[];
  weightForDate: (dateKey: string) => number | null;
  onSave: (dateKey: string, weightKg: number | null) => void;
}) {
  const todayWeight = weightForDate(today);
  const [value, setValue] = useState(todayWeight != null ? String(todayWeight) : "");

  useEffect(() => {
    setValue(todayWeight != null ? String(todayWeight) : "");
  }, [todayWeight]);

  const withWeight = bodyLogs.filter(
    (b) => b.weight_kg != null && b.entry_date !== today
  );
  const previous = withWeight.length > 0 ? withWeight[withWeight.length - 1] : null;
  const delta =
    previous && todayWeight != null ? Math.round((todayWeight - previous.weight_kg!) * 10) / 10 : null;

  function commit() {
    const num = value.trim() === "" ? null : Number(value);
    if (value.trim() !== "" && (!Number.isFinite(num) || (num as number) <= 0)) return;
    onSave(today, num);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-text">Вес</h3>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          placeholder="кг"
          className="w-28 rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
        {delta !== null && delta !== 0 && (
          <span className={`text-xs ${delta > 0 ? "text-red-500" : "text-emerald-500"}`}>
            {delta > 0 ? "+" : ""}
            {delta} кг с прошлой записи
          </span>
        )}
        {previous && todayWeight == null && (
          <span className="text-xs text-muted">Прошлая запись: {previous.weight_kg} кг</span>
        )}
      </div>
    </section>
  );
}
