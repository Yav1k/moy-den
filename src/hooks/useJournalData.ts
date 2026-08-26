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

  const saveJournal = useCallback(
    async (dateKey: string, content: string) => {
      setEntries((prev) => {
        const existing = prev.find((e) => e.entry_date === dateKey);
        if (existing) {
          return prev.map((e) => (e.entry_date === dateKey ? { ...e, content } : e));
        }
        return [
          ...prev,
          {
            id: `optimistic-${dateKey}`,
            user_id: userId,
            entry_date: dateKey,
            content,
            updated_at: new Date().toISOString(),
          },
        ];
      });
      await supabase
        .from("journal_entries")
        .upsert(
          { user_id: userId, entry_date: dateKey, content, updated_at: new Date().toISOString() },
          { onConflict: "user_id,entry_date" }
        );
    },
    [supabase, userId]
  );

  return { loading, today, journalForDate, saveJournal };
}
