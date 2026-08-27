"use client";

import { useState } from "react";
import { PHASE_LABELS, PHASE_ORDER, type PhaseKey, type Rhythm } from "@/lib/breathing";

function PhaseRing({ size = 56, progress = 0, active = false }: { size?: number; progress?: number; active?: boolean }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border" />
      {active && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="text-accent"
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
      )}
    </svg>
  );
}

const MIN: Record<PhaseKey, number> = { inhale: 1, hold1: 0, exhale: 1, hold2: 0 };
const MAX: Record<PhaseKey, number> = { inhale: 20, hold1: 60, exhale: 20, hold2: 60 };

export function RhythmCircles({
  rhythm,
  onChange,
  editable = false,
  activeKey = null,
  activeProgress = 0,
}: {
  rhythm: Rhythm;
  onChange?: (next: Rhythm) => void;
  editable?: boolean;
  activeKey?: PhaseKey | null;
  activeProgress?: number;
}) {
  const [editing, setEditing] = useState<PhaseKey | null>(null);

  function adjust(key: PhaseKey, delta: number) {
    if (!onChange) return;
    const next = Math.max(MIN[key], Math.min(MAX[key], rhythm[key] + delta));
    onChange({ ...rhythm, [key]: next });
  }

  return (
    <div>
      <div className="flex justify-center gap-3">
        {PHASE_ORDER.map((key) => {
          const isActive = activeKey === key;
          return (
            <button
              key={key}
              type="button"
              disabled={!editable}
              onClick={() => setEditing((cur) => (cur === key ? null : key))}
              className="flex flex-col items-center gap-1"
            >
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border text-sm font-semibold text-text">
                <PhaseRing progress={activeProgress} active={isActive} />
                {rhythm[key] || "—"}
              </div>
              <span className="text-[11px] text-muted">{PHASE_LABELS[key]}</span>
            </button>
          );
        })}
      </div>

      {editable && editing && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            onClick={() => adjust(editing, -1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text hover:bg-surface2"
          >
            −
          </button>
          <span className="w-28 text-center text-sm text-muted">
            {PHASE_LABELS[editing]}: {rhythm[editing]} с
          </span>
          <button
            onClick={() => adjust(editing, 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text hover:bg-surface2"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
