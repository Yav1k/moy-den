"use client";

import Link from "next/link";
import { useJournalData } from "@/hooks/useJournalData";
import { JournalCard } from "./JournalCard";
import { formatHuman } from "@/lib/date";

export function JournalPage({ userId }: { userId: string }) {
  const { loading, today, journalForDate, saveJournal } = useJournalData(userId);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16 pt-6 sm:px-6">
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
          <h1 className="text-xl font-bold text-text">Дневник эмоций</h1>
          <p className="text-sm text-muted">{formatHuman(today)}</p>
        </div>
      </header>

      <div className="mt-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
        ) : (
          <JournalCard
            dateKey={today}
            content={journalForDate(today)}
            onSave={saveJournal}
            title="Сегодня"
            placeholder="Что чувствовал(а) сегодня? Что на это повлияло..."
          />
        )}
      </div>

      <p className="mt-3 px-1 text-xs text-muted">
        Записи за прошлые дни можно посмотреть и дополнить в календаре на главном экране.
      </p>
    </main>
  );
}
