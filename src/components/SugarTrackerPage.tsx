"use client";

import { useState } from "react";
import Link from "next/link";
import { useSugarTracker, SUGAR_FLAG_LABELS, type SugarFlag } from "@/hooks/useSugarTracker";
import { BottomNav } from "./BottomNav";
import { getMonthMatrix, monthLabel, todayKey, WEEKDAYS_SHORT_MON_FIRST } from "@/lib/date";

export function SugarTrackerPage({ userId }: { userId: string }) {
  const { loading, today, flagsForDate, isCleanOn, toggleFlag, streak, record, milestonePhrase, monthStats, topSlips } = useSugarTracker(userId);

  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [view, setView] = useState({ year: todayYear, month: todayMonth - 1 });

  const weeks = getMonthMatrix(view.year, view.month);
  const stats = monthStats(view.year, view.month);
  const flags = flagsForDate(today);

  function cellClasses(dateKey: string) {
    const inMonth = Number(dateKey.slice(5, 7)) - 1 === view.month;
    const isToday = dateKey === today;
    const isFuture = dateKey > today;
    const base = "relative aspect-square rounded-lg text-sm flex items-center justify-center transition";
    const opacity = inMonth ? "" : "opacity-30";
    const ring = isToday ? "ring-2 ring-accent" : "";
    if (isFuture) return `${base} ${opacity} ${ring} bg-surface2 text-muted`;
    return `${base} ${opacity} ${ring} ${isCleanOn(dateKey) ? "bg-accent/30 text-text" : "bg-red-500/30 text-text"}`;
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <header className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Без сахара</h1>
          <p className="text-sm text-muted">Трекер срывов</p>
        </div>
      </header>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
      ) : (
        <div className="mt-5 space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="text-3xl font-bold text-text">{streak}</p>
            <p className="text-sm text-muted">{streak === 1 ? "день подряд" : "дней подряд"}</p>
            <p className="mt-1 text-xs text-muted">Рекорд: {record}</p>
            {milestonePhrase && <p className="mt-2 text-sm text-accent">{milestonePhrase}</p>}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-text">Сегодня</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(SUGAR_FLAG_LABELS) as SugarFlag[]).map((flag) => (
                <button
                  key={flag}
                  onClick={() => toggleFlag(today, flag)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    flags[flag] ? "border-red-500/40 bg-red-500/10 text-red-500" : "border-border text-muted hover:bg-surface2"
                  }`}
                >
                  {SUGAR_FLAG_LABELS[flag]}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }))}
                aria-label="Предыдущий месяц"
                className="rounded-lg p-2 text-text hover:bg-surface2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="text-sm font-medium text-text">{monthLabel(view.year, view.month)}</span>
              <button
                onClick={() => setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }))}
                aria-label="Следующий месяц"
                className="rounded-lg p-2 text-text hover:bg-surface2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
              {WEEKDAYS_SHORT_MON_FIRST.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {weeks.flat().map((dateKey) => (
                <div key={dateKey} className={cellClasses(dateKey)}>
                  {Number(dateKey.slice(8, 10))}
                </div>
              ))}
            </div>

            {stats.percent !== null && (
              <p className="mt-3 text-center text-sm text-muted">
                Чистых дней в этом месяце: {stats.clean} из {stats.total} ({stats.percent}%)
              </p>
            )}
          </section>

          {topSlips.length > 0 && (
            <section className="rounded-2xl border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-text">Что срывается чаще всего</h2>
              <div className="mt-2 space-y-2">
                {topSlips.map(([flag, count]) => (
                  <div key={flag} className="flex items-center justify-between text-sm">
                    <span className="text-text">{SUGAR_FLAG_LABELS[flag]}</span>
                    <span className="text-muted">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
