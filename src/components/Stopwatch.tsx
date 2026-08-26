"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/format";

export function Stopwatch({ onFinish }: { onFinish: (seconds: number) => void }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) {
      setRunning(false);
      const finalSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsed(0);
      if (finalSeconds > 0) onFinish(finalSeconds);
    } else {
      startedAtRef.current = Date.now();
      setElapsed(0);
      setRunning(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
        running
          ? "border-red-500/40 bg-red-500/10 text-red-500"
          : "border-dashed border-border text-text hover:border-accent"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {running ? (
          <><rect x="6" y="6" width="4" height="12" /><rect x="14" y="6" width="4" height="12" /></>
        ) : (
          <polygon points="5 3 19 12 5 21 5 3" />
        )}
      </svg>
      {running ? formatDuration(elapsed) : "Секундомер"}
    </button>
  );
}
