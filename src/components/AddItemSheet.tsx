"use client";

import { useState } from "react";

const MAX_LEN = 60;

export function AddItemSheet({
  initialType,
  onClose,
  onCreateTask,
  onCreateHabit,
}: {
  initialType: "task" | "habit";
  onClose: () => void;
  onCreateTask: (title: string, time: string | null) => void;
  onCreateHabit: (title: string, time: string | null) => void;
}) {
  const [type, setType] = useState<"task" | "habit">(initialType);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (type === "task") onCreateTask(trimmed, time || null);
    else onCreateHabit(trimmed, time || null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-surface p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface2 hover:text-text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-text">
            {type === "task" ? "Новая задача" : "Новая привычка"}
          </h2>
          <div className="w-9" />
        </div>

        <div className="mt-3 flex gap-1 rounded-xl bg-surface2 p-1">
          <button
            onClick={() => setType("task")}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
              type === "task" ? "bg-accent text-accent-fg" : "text-muted"
            }`}
          >
            Задача
          </button>
          <button
            onClick={() => setType("habit")}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
              type === "habit" ? "bg-accent text-accent-fg" : "text-muted"
            }`}
          >
            Привычка
          </button>
        </div>

        <div className="mt-5 text-center">
          <input
            autoFocus
            value={title}
            maxLength={MAX_LEN}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={type === "task" ? "Что нужно сделать?" : "Новая привычка"}
            className="w-full bg-transparent text-center text-xl font-medium text-text outline-none placeholder:text-muted"
          />
          <p className="mt-1 text-xs text-muted">
            {title.length}/{MAX_LEN}
          </p>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-2xl bg-surface2">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-3 text-sm text-text">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              {type === "task" ? "Время" : "Напоминание"}
            </span>
            <span className="flex items-center gap-2 text-sm text-muted">
              {time || "Нет"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </div>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label={type === "task" ? "Время" : "Напоминание"}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        {time && (
          <button
            onClick={() => setTime("")}
            className="mt-1 px-1 text-xs text-muted hover:text-red-500"
          >
            Убрать время
          </button>
        )}

        <button
          onClick={submit}
          disabled={!title.trim()}
          className="mt-5 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-fg disabled:opacity-50"
        >
          Создать
        </button>
      </div>
    </div>
  );
}
