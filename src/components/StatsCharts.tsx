"use client";

import { useMemo } from "react";
import type { Habit, HabitLog, JournalEntry, Task } from "@/lib/supabase/types";
import { BarTrendChart } from "./BarTrendChart";
import { MoodLineChart } from "./MoodLineChart";
import { addDays, lastNDays, toDateKey } from "@/lib/date";
import { moodByKey } from "@/lib/mood";

const WEEK_BUCKETS = 8;
const MOOD_DAYS = 30;

export function StatsCharts({
  today,
  habits,
  logs,
  tasksForDate,
  journal,
}: {
  today: string;
  habits: Habit[];
  logs: HabitLog[];
  tasksForDate: (dateKey: string) => Task[];
  journal: JournalEntry[];
}) {
  const weekly = useMemo(() => {
    const habitBars: { label: string; ratio: number | null }[] = [];
    const taskBars: { label: string; ratio: number | null }[] = [];

    for (let w = WEEK_BUCKETS - 1; w >= 0; w--) {
      const end = addDays(today, -7 * w);
      const days = lastNDays(7, end);

      let habitTotal = 0;
      let habitDone = 0;
      let taskTotal = 0;
      let taskDone = 0;

      for (const day of days) {
        const dayHabits = habits.filter((h) => toDateKey(new Date(h.created_at)) <= day);
        habitTotal += dayHabits.length;
        habitDone += logs.filter((l) => l.log_date === day).length;

        const dayTasks = tasksForDate(day);
        taskTotal += dayTasks.length;
        taskDone += dayTasks.filter((t) => t.done).length;
      }

      const label = w === 0 ? "эта" : `-${w}`;
      habitBars.push({ label, ratio: habitTotal === 0 ? null : habitDone / habitTotal });
      taskBars.push({ label, ratio: taskTotal === 0 ? null : taskDone / taskTotal });
    }

    return { habitBars, taskBars };
  }, [today, habits, logs, tasksForDate]);

  const moodPoints = useMemo(() => {
    const days = lastNDays(MOOD_DAYS, today);
    const byDate = new Map(journal.map((e) => [e.entry_date, e]));
    return days.map((day) => {
      const entry = byDate.get(day);
      const mood = moodByKey(entry?.mood ?? null);
      const [, m, d] = day.split("-");
      return { label: `${d}.${m}`, date: day, value: mood?.value ?? null };
    });
  }, [today, journal]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-text">Привычки по неделям</h3>
        <p className="text-xs text-muted">
          % выполненных привычек за каждую из последних {WEEK_BUCKETS} недель
        </p>
        <BarTrendChart bars={weekly.habitBars} />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-text">Задачи по неделям</h3>
        <p className="text-xs text-muted">% закрытых задач за неделю</p>
        <BarTrendChart bars={weekly.taskBars} />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-text">Настроение</h3>
        <p className="text-xs text-muted">
          Последние {MOOD_DAYS} дней, по отметкам в дневнике эмоций
        </p>
        <MoodLineChart points={moodPoints} />
      </section>
    </div>
  );
}
