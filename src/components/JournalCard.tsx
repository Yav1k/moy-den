"use client";

import { useEffect, useRef, useState } from "react";
import { MOODS } from "@/lib/mood";

export function JournalCard({
  dateKey,
  content,
  onSave,
  mood = null,
  onMoodChange,
  title = "Дневник дня",
  placeholder = "Как прошёл день? Что запомнилось...",
  bare = false,
}: {
  dateKey: string;
  content: string;
  onSave: (dateKey: string, content: string) => void;
  mood?: string | null;
  onMoodChange?: (dateKey: string, mood: string | null) => void;
  title?: string;
  placeholder?: string;
  /** Без собственной рамки/заголовка — для встраивания в другую карточку (например, сворачиваемую секцию). */
  bare?: boolean;
}) {
  const [value, setValue] = useState(content);
  const [status, setStatus] = useState<"idle" | "pending" | "saved">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Синхронизируемся, если карточка переиспользуется для другой даты
  // (переключение дня в календаре) или пришли свежие данные с сервера.
  useEffect(() => {
    setValue(content);
    setStatus("idle");
  }, [dateKey, content]);

  function handleChange(next: string) {
    setValue(next);
    setStatus("pending");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSave(dateKey, next);
      setStatus("saved");
    }, 800);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const body = (
    <>
      {!bare && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <span className="text-xs text-muted">
            {status === "pending" && "Сохранение..."}
            {status === "saved" && "Сохранено"}
          </span>
        </div>
      )}
      {bare && (status === "pending" || status === "saved") && (
        <p className="mb-1 text-right text-xs text-muted">
          {status === "pending" ? "Сохранение..." : "Сохранено"}
        </p>
      )}

      {onMoodChange && (
        <div className="mt-2 flex items-center gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => onMoodChange(dateKey, mood === m.key ? null : m.key)}
              aria-label={m.label}
              title={m.label}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                mood === m.key
                  ? "bg-accent/20 ring-2 ring-accent"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-none rounded-xl border border-border bg-surface2 p-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent"
      />
    </>
  );

  if (bare) return body;

  return <section className="rounded-2xl border border-border bg-surface p-4">{body}</section>;
}
