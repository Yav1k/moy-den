"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BottomNav } from "./BottomNav";
import { PRACTICES, type Practice } from "@/lib/breathing";
import { createAmbientSound, type AmbientSound } from "@/lib/ambientSound";

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

export function MeditationPage() {
  const [practice, setPractice] = useState<Practice | null>(null);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <header className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Медитация</h1>
          <p className="text-sm text-muted">Дыхательные практики под спокойную музыку</p>
        </div>
      </header>

      <div className="mt-5">
        {practice ? (
          <BreathingSession practice={practice} onExit={() => setPractice(null)} />
        ) : (
          <div className="space-y-3">
            {PRACTICES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPractice(p)}
                className="w-full rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-text">{p.title}</h2>
                  <span className="shrink-0 text-xs text-muted">{p.durationLabel}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{p.description}</p>
                <p className="mt-2 text-xs text-muted">{p.pattern}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function BreathingSession({ practice, onExit }: { practice: Practice; onExit: () => void }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundRef = useRef<AmbientSound | null>(null);

  const phase = practice.phases[phaseIdx];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      soundRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    timeoutRef.current = setTimeout(() => {
      const nextIdx = phaseIdx + 1;
      if (nextIdx >= practice.phases.length) {
        if (cycle >= practice.cycles) {
          setPlaying(false);
          setDone(true);
          soundRef.current?.stop();
          return;
        }
        setCycle((c) => c + 1);
        setPhaseIdx(0);
      } else {
        setPhaseIdx(nextIdx);
      }
    }, phase.duration * 1000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [playing, phaseIdx, cycle, practice, phase.duration]);

  function start() {
    setDone(false);
    setPhaseIdx(0);
    setCycle(1);
    setPlaying(true);
    if (!soundRef.current) soundRef.current = createAmbientSound();
    soundRef.current.start();
    soundRef.current.setMuted(muted);
  }

  function stop() {
    setPlaying(false);
    setDone(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    soundRef.current?.stop();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    soundRef.current?.setMuted(next);
  }

  const scale = playing ? phase.scale : 0.85;
  const transitionDuration = playing ? phase.duration : 0.6;

  return (
    <div className="flex flex-col items-center">
      <button onClick={onExit} className="mb-4 self-start text-sm text-muted hover:text-accent">
        ← Все практики
      </button>

      <p className="text-sm font-medium text-text">{practice.title}</p>

      <div className="relative mt-6 flex h-64 w-64 items-center justify-center">
        <div
          className="absolute rounded-full bg-accent/20"
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${scale})`,
            transition: `transform ${transitionDuration}s ease-in-out`,
          }}
        />
        <div
          className="absolute rounded-full bg-accent/40"
          style={{
            width: "70%",
            height: "70%",
            transform: `scale(${scale})`,
            transition: `transform ${transitionDuration}s ease-in-out`,
          }}
        />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-accent px-2 text-center text-accent-fg">
          <span className="text-sm font-semibold">
            {playing ? phase.label : done ? "Готово 🎉" : "Начать?"}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {playing
          ? `Цикл ${cycle} из ${practice.cycles}`
          : done
            ? "Практика завершена"
            : practice.pattern}
      </p>

      <div className="mt-6 flex items-center gap-3">
        {!playing ? (
          <button
            onClick={start}
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:opacity-90"
          >
            {done ? "Повторить" : "Начать"}
          </button>
        ) : (
          <button
            onClick={stop}
            className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text transition hover:bg-surface2"
          >
            Остановить
          </button>
        )}
        <button
          onClick={toggleMute}
          aria-label={muted ? "Включить звук" : "Выключить звук"}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text transition hover:bg-surface2"
        >
          {muted ? <MuteIcon /> : <SoundIcon />}
        </button>
      </div>
    </div>
  );
}
