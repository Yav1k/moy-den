"use client";

import { useEffect, useRef, useState } from "react";

export function JournalCard({
  dateKey,
  content,
  onSave,
  title = "Дневник дня",
  placeholder = "Как прошёл день? Что запомнилось...",
}: {
  dateKey: string;
  content: string;
  onSave: (dateKey: string, content: string) => void;
  title?: string;
  placeholder?: string;
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

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        <span className="text-xs text-muted">
          {status === "pending" && "Сохранение..."}
          {status === "saved" && "Сохранено"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-none rounded-xl border border-border bg-surface2 p-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent"
      />
    </section>
  );
}
