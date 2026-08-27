"use client";

import Link from "next/link";
import { useJournalData } from "@/hooks/useJournalData";
import { JournalCard } from "./JournalCard";
import { BottomNav } from "./BottomNav";
import { formatHuman } from "@/lib/date";
import { moodByKey } from "@/lib/mood";

export function JournalPage({ userId }: { userId: string }) {
  const { loading, today, entries, journalForDate, moodForDate, saveJournal, setMood } =
    useJournalData(userId);

  const history = entries
    .filter((e) => e.entry_date !== today && (e.content.trim() || e.mood))
    .sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1))
    .slice(0, 14);

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
          <h1 className="text-xl font-bold text-text">Дневник эмоций</h1>
          <p className="text-sm text-muted">{formatHuman(today)}</p>
        </div>
      </header>

      <div className="mt-5 space-y-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
        ) : (
          <>
            <JournalCard
              dateKey={today}
              content={journalForDate(today)}
              onSave={saveJournal}
              mood={moodForDate(today)}
              onMoodChange={setMood}
              title="Сегодня"
              placeholder="Что чувствовал(а) сегодня? Что на это повлияло..."
            />

            {history.length > 0 && (
              <section>
                <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted">
                  Недавние записи
                </p>
                <div className="mt-2 space-y-2">
                  {history.map((entry) => {
                    const mood = moodByKey(entry.mood);
                    return (
                      <div
                        key={entry.entry_date}
                        className="rounded-xl border border-border bg-surface p-3"
                      >
                        <div className="flex items-center gap-2 text-xs text-muted">
                          {mood && <span className="text-base">{mood.emoji}</span>}
                          <span>{formatHuman(entry.entry_date)}</span>
                        </div>
                        {entry.content.trim() && (
                          <p className="mt-1 line-clamp-2 text-sm text-text">
                            {entry.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <p className="mt-3 px-1 text-xs text-muted">
        Записи за прошлые дни можно дополнить в разделе «Календарь».
      </p>

      <BottomNav />
    </main>
  );
}
