"use client";

import Link from "next/link";
import { useDayData } from "@/hooks/useDayData";
import { StatsPanel } from "./StatsPanel";
import { StatsCharts } from "./StatsCharts";
import { BottomNav } from "./BottomNav";

export function StatsPage({ userId }: { userId: string }) {
  const { loading, today, habits, logs, tasksForDate, journal, stats } = useDayData(userId);

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
          <h1 className="text-xl font-bold text-text">Статистика</h1>
          <p className="text-sm text-muted">Тренды по неделям и месяцу</p>
        </div>
      </header>

      <div className="mt-5 space-y-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
        ) : (
          <>
            <StatsPanel stats={stats} />
            <StatsCharts
              today={today}
              habits={habits}
              logs={logs}
              tasksForDate={tasksForDate}
              journal={journal}
            />
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
