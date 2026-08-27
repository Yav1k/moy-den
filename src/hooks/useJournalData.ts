"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/supabase/types";
import { todayKey } from "@/lib/date";

export function useJournalData(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayKey();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("journal_entries")
      .select("*")
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setEntries(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const entryByDate = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    for (const entry of entries) map.set(entry.entry_date, entry);
    return map;
  }, [entries]);

  const journalForDate = useCallback(
    (dateKey: string) => entryByDate.get(dateKey)?.content ?? "",
    [entryByDate]
  );

  const moodForDate = useCallback(
    (dateKey: string) => entryByDate.get(dateKey)?.mood ?? null,
    [entryByDate]
  );

  const upsertEntry = useCallback(
    async (dateKey: string, patch: { content?: string; mood?: string | null }) => {
      const existing = entryByDate.get(dateKey);
      const next = {
        content: patch.content ?? existing?.content ?? "",
        mood: "mood" in patch ? patch.mood ?? null : existing?.mood ?? null,
      };

      setEntries((prev) => {
        if (existing) {
          return prev.map((e) => (e.entry_date === dateKey ? { ...e, ...next } : e));
        }
        return [
          ...prev,
          {
            id: `optimistic-${dateKey}`,
            user_id: userId,
            entry_date: dateKey,
            content: next.content,
            mood: next.mood,
            updated_at: new Date().toISOString(),
          },
        ];
      });

      await supabase
        .from("journal_entries")
        .upsert(
          {
            user_id: userId,
            entry_date: dateKey,
            content: next.content,
            mood: next.mood,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,entry_date" }
        );
    },
    [supabase, userId, entryByDate]
  );

  const saveJournal = useCallback(
    (dateKey: string, content: string) => upsertEntry(dateKey, { content }),
    [upsertEntry]
  );

  const setMood = useCallback(
    (dateKey: string, mood: string | null) => upsertEntry(dateKey, { mood }),
    [upsertEntry]
  );

  return { loading, today, entries, journalForDate, moodForDate, saveJournal, setMood };
}
