"use client";

import { useState } from "react";

export function ChecklistRow({
  title,
  done,
  onToggle,
  onEdit,
  onDelete,
  locked = false,
}: {
  title: string;
  done: boolean;
  onToggle: () => void;
  onEdit: (title: string) => void;
  onDelete: () => void;
  /** Скрывает переименование и удаление — для строк, не привязанных к этому месту (например, привычка в карточке дня в календаре). */
  locked?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  function commit() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== title) onEdit(draft);
    else setDraft(title);
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-surface2">
      <input
        type="checkbox"
        className="task-checkbox"
        checked={done}
        onChange={onToggle}
        aria-label={title}
      />

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(title);
              setEditing(false);
            }
          }}
          className="flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-sm text-text outline-none"
        />
      ) : locked ? (
        <span
          className={`flex-1 truncate text-left text-sm ${
            done ? "text-muted line-through" : "text-text"
          }`}
        >
          {title}
        </span>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={`flex-1 truncate text-left text-sm ${
            done ? "text-muted line-through" : "text-text"
          }`}
        >
          {title}
        </button>
      )}

      {!locked && (
        <button
          onClick={onDelete}
          aria-label="Удалить"
          className="shrink-0 rounded-lg p-1 text-muted opacity-0 transition hover:bg-surface hover:text-red-500 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
