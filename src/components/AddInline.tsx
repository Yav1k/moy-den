"use client";

import { useState } from "react";

export function AddInline({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (title: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  }

  return (
    <form onSubmit={submit} className="mt-2 flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-dashed border-border bg-transparent px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-accent"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
        disabled={!value.trim()}
      >
        Добавить
      </button>
    </form>
  );
}
