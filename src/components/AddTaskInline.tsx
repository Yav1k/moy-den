"use client";

import { useState } from "react";

export function AddTaskInline({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (title: string, time: string | null) => void;
}) {
  const [value, setValue] = useState("");
  const [time, setTime] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value, time || null);
    setValue("");
    setTime("");
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-dashed border-border bg-transparent px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-accent"
      />
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Время (необязательно)"
          className="min-w-0 flex-1 rounded-xl border border-dashed border-border bg-transparent px-2 py-2 text-sm text-text outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
          disabled={!value.trim()}
        >
          Добавить
        </button>
      </div>
    </form>
  );
}
