"use client";

import { useEffect, useRef, useState } from "react";
import { BottomNav } from "./BottomNav";
import { RhythmCircles } from "./RhythmCircles";
import { MeditationSettingsSheet } from "./MeditationSettingsSheet";
import {
  RHYTHM_PRESETS,
  PHASE_LABELS,
  phaseSequence,
  formatClock,
  type Rhythm,
} from "@/lib/breathing";
import { createAmbientSound, type AmbientSound } from "@/lib/ambientSound";
import { createMetronome, type Metronome } from "@/lib/metronome";
import { speakPhase, primeVoices } from "@/lib/speech";

const STORAGE_KEY = "meditation-settings-v1";

type SessionMode = "time" | "cycles";

type StoredSettings = {
  sessionMode: SessionMode;
  sessionMinutes: number;
  sessionCycles: number;
  autoSwitch: boolean;
  autoSwitchAfter: number;
  musicOn: boolean;
  voiceOn: boolean;
  metronomeOn: boolean;
};

const DEFAULT_SETTINGS: StoredSettings = {
  sessionMode: "time",
  sessionMinutes: 5,
  sessionCycles: 10,
  autoSwitch: false,
  autoSwitchAfter: 3,
  musicOn: true,
  voiceOn: false,
  metronomeOn: false,
};

function loadSettings(): StoredSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function MusicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function VoiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  );
}
function MetronomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21 10 4h4l4 17H6ZM12 4v3M9.5 14 14 9" />
    </svg>
  );
}
function SoundIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 12 5 12 19 8 15 4 15 4 9" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 12 5 12 19 8 15 4 15 4 9" />
      <path d="M16 9l6 6M22 9l-6 6" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
function RewindIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </svg>
  );
}
function ForwardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </svg>
  );
}

function IconToggle({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
        active ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:bg-surface2"
      }`}
    >
      {children}
    </button>
  );
}

function presetCount() {
  return RHYTHM_PRESETS.length;
}

export function MeditationPage() {
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  const [presetIndex, setPresetIndex] = useState(0);
  const [customRhythm, setCustomRhythm] = useState<Rhythm | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  const [sessionStarted, setSessionStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(() => phaseSequence(RHYTHM_PRESETS[0].rhythm)[0]?.seconds ?? 0);
  const [cyclesTotal, setCyclesTotal] = useState(0);
  const [cyclesThisRhythm, setCyclesThisRhythm] = useState(0);
  const [circleScale, setCircleScale] = useState(0.85);

  const activeRhythm = customRhythm ?? RHYTHM_PRESETS[presetIndex].rhythm;
  const phases = phaseSequence(activeRhythm);
  const currentPhase = phases[phaseIdx] ?? phases[0];

  const soundRef = useRef<AmbientSound | null>(null);
  const metronomeRef = useRef<Metronome | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const tickRef = useRef<() => void>(() => {});

  function getAudio() {
    if (!soundRef.current) soundRef.current = createAmbientSound();
    return soundRef.current;
  }
  function getMetronome() {
    if (!metronomeRef.current) metronomeRef.current = createMetronome();
    return metronomeRef.current;
  }

  useEffect(() => {
    return () => {
      soundRef.current?.stop();
      metronomeRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (running && settings.musicOn) {
      getAudio().start();
      getAudio().setMuted(muted);
    } else {
      soundRef.current?.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, settings.musicOn, muted]);

  useEffect(() => {
    if (running && settings.metronomeOn && !muted) {
      getMetronome().start();
    } else {
      metronomeRef.current?.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, settings.metronomeOn, muted]);

  function finish() {
    setRunning(false);
    setCompleted(true);
  }

  tickRef.current = () => {
    const seq = phases;
    if (seq.length === 0) return;

    const newElapsed = elapsedSeconds + 1;
    const newPhaseRemaining = phaseRemaining - 1;

    if (newPhaseRemaining > 0) {
      setPhaseRemaining(newPhaseRemaining);
      setElapsedSeconds(newElapsed);
      if (settings.sessionMode === "time" && newElapsed >= settings.sessionMinutes * 60) {
        finish();
      }
      return;
    }

    const newPhaseIdx = (phaseIdx + 1) % seq.length;
    const wrapped = newPhaseIdx === 0;

    let newCyclesTotal = cyclesTotal;
    let newCyclesThisRhythm = cyclesThisRhythm;
    let sessionDone = false;
    let switchPreset = false;

    if (wrapped) {
      newCyclesTotal += 1;
      newCyclesThisRhythm += 1;
      if (settings.sessionMode === "cycles" && newCyclesTotal >= settings.sessionCycles) {
        sessionDone = true;
      }
      if (!sessionDone && settings.autoSwitch && newCyclesThisRhythm >= settings.autoSwitchAfter) {
        switchPreset = true;
      }
    }

    if (settings.sessionMode === "time" && newElapsed >= settings.sessionMinutes * 60) {
      sessionDone = true;
    }

    setElapsedSeconds(newElapsed);
    setCyclesTotal(newCyclesTotal);

    if (sessionDone) {
      finish();
      return;
    }

    if (switchPreset) {
      const nextIndex = (presetIndex + 1) % presetCount();
      const nextRhythm = RHYTHM_PRESETS[nextIndex].rhythm;
      const nextSeq = phaseSequence(nextRhythm);
      setPresetIndex(nextIndex);
      setCustomRhythm(null);
      setCyclesThisRhythm(0);
      setPhaseIdx(0);
      setPhaseRemaining(nextSeq[0]?.seconds ?? 0);
      scrollCarouselTo(nextIndex);
      if (settings.voiceOn && !muted) speakPhase(PHASE_LABELS[nextSeq[0]?.key ?? "inhale"]);
      return;
    }

    setCyclesThisRhythm(newCyclesThisRhythm);
    setPhaseIdx(newPhaseIdx);
    setPhaseRemaining(seq[newPhaseIdx].seconds);
    if (settings.voiceOn && !muted) speakPhase(PHASE_LABELS[seq[newPhaseIdx].key]);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tickRef.current(), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (currentPhase?.key === "inhale") setCircleScale(1.3);
    else if (currentPhase?.key === "exhale") setCircleScale(0.85);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIdx, running]);

  function resetRuntime(rhythm: Rhythm) {
    const seq = phaseSequence(rhythm);
    setPhaseIdx(0);
    setPhaseRemaining(seq[0]?.seconds ?? 0);
    setElapsedSeconds(0);
    setCyclesTotal(0);
    setCyclesThisRhythm(0);
    setCircleScale(0.85);
  }

  function scrollCarouselTo(index: number) {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  function selectPreset(index: number) {
    const wrapped = ((index % presetCount()) + presetCount()) % presetCount();
    setPresetIndex(wrapped);
    setCustomRhythm(null);
    resetRuntime(RHYTHM_PRESETS[wrapped].rhythm);
    setCompleted(false);
    scrollCarouselTo(wrapped);
  }

  function handleCarouselScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== presetIndex && idx >= 0 && idx < presetCount()) {
      setPresetIndex(idx);
      setCustomRhythm(null);
      resetRuntime(RHYTHM_PRESETS[idx].rhythm);
      setCompleted(false);
    }
  }

  function handleRhythmChange(next: Rhythm) {
    setCustomRhythm(next);
    resetRuntime(next);
    setCompleted(false);
  }

  function togglePlay() {
    if (running) {
      setRunning(false);
      return;
    }
    primeVoices();
    if (!sessionStarted || completed) {
      setSessionStarted(true);
      setCompleted(false);
      resetRuntime(activeRhythm);
    }
    setRunning(true);
  }

  function exitSession() {
    setRunning(false);
    setSessionStarted(false);
    setCompleted(false);
  }

  const sessionSummary = `${settings.sessionMode === "time" ? `${settings.sessionMinutes} минут` : `${settings.sessionCycles} циклов`}${
    settings.autoSwitch ? `, переключать после ${settings.autoSwitchAfter} циклов` : ""
  }`;

  const centerDisplay =
    settings.sessionMode === "time"
      ? formatClock(Math.max(0, settings.sessionMinutes * 60 - elapsedSeconds))
      : `${cyclesTotal} / ${settings.sessionCycles}`;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      {!sessionStarted ? (
        <>
          <header>
            <h1 className="text-xl font-bold text-text">Медитация</h1>
            <p className="text-sm text-muted">Дыхательные практики под спокойную музыку</p>
          </header>

          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="mt-5 flex snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {RHYTHM_PRESETS.map((preset) => (
              <div key={preset.id} className="w-full shrink-0 snap-center px-1">
                <div className={`flex aspect-[4/3] flex-col items-center justify-center rounded-3xl bg-gradient-to-br ${preset.theme} p-6 text-center`}>
                  <h2 className="text-lg font-bold text-text">{preset.title}</h2>
                  <p className="mt-1 text-sm text-muted">{preset.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-center gap-1.5">
            {RHYTHM_PRESETS.map((preset, i) => (
              <button
                key={preset.id}
                onClick={() => selectPreset(i)}
                aria-label={preset.title}
                className={`h-1.5 rounded-full transition-all ${i === presetIndex ? "w-4 bg-accent" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>

          <p className="mt-3 text-center text-sm text-muted">{sessionSummary}</p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <button
              onClick={exitSession}
              aria-label="Закрыть"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text hover:bg-surface2"
            >
              <CloseIcon />
            </button>
            <div className="flex items-center gap-2">
              <IconToggle active={settings.musicOn} onClick={() => setSettings((s) => ({ ...s, musicOn: !s.musicOn }))} label="Музыка">
                <MusicIcon />
              </IconToggle>
              <IconToggle active={settings.voiceOn} onClick={() => setSettings((s) => ({ ...s, voiceOn: !s.voiceOn }))} label="Голос">
                <VoiceIcon />
              </IconToggle>
              <IconToggle active={settings.metronomeOn} onClick={() => setSettings((s) => ({ ...s, metronomeOn: !s.metronomeOn }))} label="Метроном">
                <MetronomeIcon />
              </IconToggle>
              <IconToggle active={!muted} onClick={() => setMuted((m) => !m)} label={muted ? "Включить звук" : "Выключить звук"}>
                {muted ? <MuteIcon /> : <SoundIcon />}
              </IconToggle>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-center">
            <div className="flex-1">
              <p className="text-lg font-semibold text-text">{formatClock(elapsedSeconds)}</p>
              <p className="text-xs text-muted">Всего</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-text">{centerDisplay}</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-text">{cyclesTotal}</p>
              <p className="text-xs text-muted">Циклов</p>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex flex-col items-center">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <div
            className="absolute rounded-full bg-accent/20"
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${sessionStarted ? circleScale : 0.85})`,
              transition: `transform ${sessionStarted && running ? currentPhase?.seconds ?? 0.6 : 0.6}s ease-in-out`,
            }}
          />
          <div
            className="absolute rounded-full bg-accent/40"
            style={{
              width: "70%",
              height: "70%",
              transform: `scale(${sessionStarted ? circleScale : 0.85})`,
              transition: `transform ${sessionStarted && running ? currentPhase?.seconds ?? 0.6 : 0.6}s ease-in-out`,
            }}
          />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-accent px-2 text-center text-accent-fg">
            <span className="text-sm font-semibold">
              {sessionStarted
                ? running
                  ? PHASE_LABELS[currentPhase?.key ?? "inhale"]
                  : completed
                    ? "Готово 🎉"
                    : "Пауза"
                : RHYTHM_PRESETS[presetIndex].title}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <RhythmCircles
            rhythm={activeRhythm}
            onChange={!sessionStarted ? handleRhythmChange : undefined}
            editable={!sessionStarted}
            activeKey={sessionStarted && running ? currentPhase?.key : null}
            activeProgress={currentPhase && currentPhase.seconds > 0 ? 1 - phaseRemaining / currentPhase.seconds : 0}
          />
        </div>

        {!sessionStarted && (
          <button
            onClick={() => setSettingsOpen(true)}
            className="mt-4 flex items-center gap-1.5 text-sm text-muted hover:text-accent"
          >
            <GearIcon /> Настройки
          </button>
        )}

        <div className="mt-6 flex items-center gap-6">
          <button
            onClick={() => selectPreset(presetIndex - 1)}
            aria-label="Предыдущий ритм"
            className="flex h-11 w-11 items-center justify-center rounded-full text-text hover:bg-surface2"
          >
            <RewindIcon />
          </button>
          <button
            onClick={togglePlay}
            aria-label={running ? "Пауза" : "Начать"}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-fg transition hover:opacity-90"
          >
            {running ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            onClick={() => selectPreset(presetIndex + 1)}
            aria-label="Следующий ритм"
            className="flex h-11 w-11 items-center justify-center rounded-full text-text hover:bg-surface2"
          >
            <ForwardIcon />
          </button>
        </div>
      </div>

      {settingsOpen && (
        <MeditationSettingsSheet
          onClose={() => setSettingsOpen(false)}
          sessionMode={settings.sessionMode}
          onSessionModeChange={(m) => setSettings((s) => ({ ...s, sessionMode: m }))}
          sessionMinutes={settings.sessionMinutes}
          onSessionMinutesChange={(n) => setSettings((s) => ({ ...s, sessionMinutes: n }))}
          sessionCycles={settings.sessionCycles}
          onSessionCyclesChange={(n) => setSettings((s) => ({ ...s, sessionCycles: n }))}
          autoSwitch={settings.autoSwitch}
          onAutoSwitchChange={(v) => setSettings((s) => ({ ...s, autoSwitch: v }))}
          autoSwitchAfter={settings.autoSwitchAfter}
          onAutoSwitchAfterChange={(n) => setSettings((s) => ({ ...s, autoSwitchAfter: n }))}
          onPickRhythm={handleRhythmChange}
        />
      )}

      {!sessionStarted && <BottomNav />}
    </main>
  );
}
