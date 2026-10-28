"use client";

import { useEffect, useRef, useState } from "react";

export function RestTimer({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
          doneRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds]);

  const progress = 1 - remaining / seconds;
  const r = 14;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2">
      <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90 shrink-0">
        <circle cx="16" cy="16" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="text-primary"
          style={{ transition: "stroke-dashoffset 0.9s linear" }}
        />
      </svg>
      <span className="text-sm font-medium text-primary">Отдых: {remaining} с</span>
      <button
        onClick={() => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRemaining(0);
          doneRef.current?.();
        }}
        className="ml-auto text-xs text-muted hover:text-primary"
      >
        Пропустить
      </button>
    </div>
  );
}
