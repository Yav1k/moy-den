"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDayData } from "@/hooks/useDayData";
import { useMealData } from "@/hooks/useMealData";
import { useSugarTracker, SUGAR_FLAG_LABELS, type SugarFlag } from "@/hooks/useSugarTracker";
import { useWeightData } from "@/hooks/useWeightData";
import { ReminderList } from "./ReminderList";
import { ThemeToggle } from "./ThemeToggle";
import { ProgressBar } from "./ProgressBar";
import { BottomNav } from "./BottomNav";
import { formatHuman } from "@/lib/date";
import { MEAL_SLOT_ORDER, MEAL_SLOT_LABELS } from "@/data/nutritionBase";
import { DAILY_TARGETS } from "@/data/menu";

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function TodayPage({ userId, email }: { userId: string; email: string }) {
  const {
    loading: dayLoading,
    today,
    tasksForDate,
    habits,
    isHabitDoneOn,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
    editHabit,
    deleteHabit,
    toggleHabitOn,
  } = useDayData(userId);

  const { loading: mealLoading, statusForSlot, setStatus, totals } = useMealData(userId, today);
  const { streak, flagsForDate, toggleFlag } = useSugarTracker(userId);
  const { weightForDate, latest, saveWeight, hint } = useWeightData(userId);

  const [weightInput, setWeightInput] = useState<string>("");
  const [weightTouched, setWeightTouched] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const todayWeight = weightForDate(today);
  const weightValue = weightTouched ? weightInput : todayWeight != null ? String(todayWeight) : "";

  function commitWeight() {
    setWeightTouched(false);
    const num = weightInput.trim() === "" ? null : Number(weightInput);
    if (weightInput.trim() !== "" && (!Number.isFinite(num) || (num as number) <= 0)) return;
    saveWeight(today, num);
  }

  const flags = flagsForDate(today);
  const loading = dayLoading || mealLoading;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Сегодня</h1>
          <p className="text-sm text-muted">{formatHuman(today)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <Link
            href="/calendar"
            aria-label="Календарь"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
          >
            <CalendarIcon />
          </Link>
          <Link
            href="/settings"
            aria-label="Настройки"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
          >
            <GearIcon />
          </Link>
          <ThemeToggle />
          <button
            onClick={signOut}
            title={email}
            aria-label="Выйти"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
          >
            <SignOutIcon />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
      ) : (
        <div className="mt-5 space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-text">Напоминания</h2>
            <div className="mt-2">
              <ReminderList
                dateKey={today}
                tasks={tasksForDate(today)}
                habits={habits}
                isHabitDoneOn={isHabitDoneOn}
                onToggleHabit={toggleHabitOn}
                onEditHabit={editHabit}
                onDeleteHabit={deleteHabit}
                onToggleTask={toggleTask}
                onEditTask={editTask}
                onDeleteTask={deleteTask}
                onAddTask={addTask}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Рацион</h2>
              <Link href="/nutrition" className="text-xs text-primary hover:underline">
                Рецепты →
              </Link>
            </div>
            <div className="mt-2 space-y-1">
              {MEAL_SLOT_ORDER.map((slot) => {
                const status = statusForSlot(slot);
                const eaten = status === "eaten" || status === "half";
                return (
                  <label key={slot} className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-surface2">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={eaten}
                      onChange={() => setStatus(slot, eaten ? "pending" : "eaten")}
                    />
                    <span className={`flex-1 text-sm ${eaten ? "text-muted line-through" : "text-text"}`}>
                      {MEAL_SLOT_LABELS[slot]}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <ProgressBar label="Калории" value={totals.kcal} target={DAILY_TARGETS.kcal} unit="ккал" />
              <ProgressBar label="Белок" value={totals.protein} target={DAILY_TARGETS.protein} unit="г" />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Без сахара</h2>
              <Link href="/sugar" className="text-xs text-primary hover:underline">
                Серия: {streak} {streak === 1 ? "день" : "дней"} →
              </Link>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(SUGAR_FLAG_LABELS) as SugarFlag[]).map((flag) => (
                <button
                  key={flag}
                  onClick={() => toggleFlag(today, flag)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    flags[flag] ? "border-danger/40 bg-danger/10 text-danger" : "border-border text-muted hover:bg-surface2"
                  }`}
                >
                  {SUGAR_FLAG_LABELS[flag]}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-text">Вес</h2>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min={1}
                value={weightValue}
                onChange={(e) => {
                  setWeightTouched(true);
                  setWeightInput(e.target.value);
                }}
                onBlur={commitWeight}
                onKeyDown={(e) => e.key === "Enter" && commitWeight()}
                placeholder="кг"
                className="w-28 rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
              {latest && latest.entry_date !== today && (
                <span className="text-xs text-muted">Прошлая запись: {latest.weight_kg} кг</span>
              )}
            </div>
            {hint && <p className="mt-2 text-xs text-warning">{hint.text}</p>}
          </section>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
