"use client";

import { RHYTHM_GRID_GROUPS, type Rhythm } from "@/lib/breathing";

type SessionMode = "time" | "cycles";

export function MeditationSettingsSheet({
  onClose,
  sessionMode,
  onSessionModeChange,
  sessionMinutes,
  onSessionMinutesChange,
  sessionCycles,
  onSessionCyclesChange,
  autoSwitch,
  onAutoSwitchChange,
  autoSwitchAfter,
  onAutoSwitchAfterChange,
  onPickRhythm,
}: {
  onClose: () => void;
  sessionMode: SessionMode;
  onSessionModeChange: (mode: SessionMode) => void;
  sessionMinutes: number;
  onSessionMinutesChange: (n: number) => void;
  sessionCycles: number;
  onSessionCyclesChange: (n: number) => void;
  autoSwitch: boolean;
  onAutoSwitchChange: (v: boolean) => void;
  autoSwitchAfter: number;
  onAutoSwitchAfterChange: (n: number) => void;
  onPickRhythm: (rhythm: Rhythm) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <h2 className="px-1 text-sm font-semibold text-text">Настройки сессии</h2>

        <div className="mt-3 space-y-2">
          <ToggleRow
            label="Время сессии"
            value={`Дышать ${sessionMinutes} мин`}
            checked={sessionMode === "time"}
            onToggle={() => onSessionModeChange("time")}
          >
            <Stepper value={sessionMinutes} min={1} max={60} onChange={onSessionMinutesChange} suffix="мин" />
          </ToggleRow>

          <ToggleRow
            label="Циклы дыхания"
            value={`${sessionCycles} циклов`}
            checked={sessionMode === "cycles"}
            onToggle={() => onSessionModeChange("cycles")}
          >
            <Stepper value={sessionCycles} min={1} max={100} onChange={onSessionCyclesChange} suffix="циклов" />
          </ToggleRow>

          <ToggleRow
            label="Автопереключение"
            value={`после ${autoSwitchAfter} циклов`}
            checked={autoSwitch}
            onToggle={() => onAutoSwitchChange(!autoSwitch)}
          >
            <Stepper value={autoSwitchAfter} min={1} max={20} onChange={onAutoSwitchAfterChange} suffix="циклов" />
          </ToggleRow>
        </div>

        <p className="mt-5 px-1 text-sm font-medium text-text">Выберите свой ритм</p>
        <p className="px-1 text-xs text-muted">Вдох – Задержка – Выдох – Пауза, в секундах</p>

        <div className="mt-2 space-y-3">
          {RHYTHM_GRID_GROUPS.map((group, gi) => (
            <div key={gi} className="overflow-hidden rounded-xl border border-border">
              {group.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onPickRhythm(r);
                    onClose();
                  }}
                  className="grid w-full grid-cols-4 border-b border-border py-2 text-center text-sm text-text last:border-b-0 hover:bg-surface2"
                >
                  <span>{r.inhale}</span>
                  <span>{r.hold1}</span>
                  <span>{r.exhale}</span>
                  <span>{r.hold2}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  checked,
  onToggle,
  children,
}: {
  label: string;
  value: string;
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={checked}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-accent" : "bg-surface2"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`}
          />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">{label}</p>
          <p className="text-xs text-muted">{value}</p>
        </div>
      </div>
      {checked && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text hover:bg-surface2"
      >
        −
      </button>
      <span className="w-24 text-center text-sm text-muted">
        {value} {suffix}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text hover:bg-surface2"
      >
        +
      </button>
    </div>
  );
}
