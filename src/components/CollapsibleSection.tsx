"use client";

import { useEffect, useState } from "react";

export function CollapsibleSection({
  title,
  subtitle,
  done,
  total,
  storageKey,
  defaultExpanded = false,
  children,
}: {
  title: string;
  subtitle?: string;
  done: number;
  total: number;
  storageKey: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setExpanded(stored === "1");
    } catch {
      // localStorage недоступен — остаёмся на значении по умолчанию.
    }
    setHydrated(true);
  }, [storageKey]);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    try {
      localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {
      // игнорируем — просто не сохранится между визитами
    }
  }

  const percent = total === 0 ? null : Math.round((done / total) * 100);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface p-4">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {!expanded && hydrated && (
            <p className="mt-0.5 truncate text-xs text-muted">
              {percent === null ? "Пока пусто" : `${done}/${total} выполнено · ${percent}%`}
            </p>
          )}
          {expanded && subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && <div className="mt-2">{children}</div>}
    </section>
  );
}
