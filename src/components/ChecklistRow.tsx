"use client";

import { useState } from "react";

export function ChecklistRow({
  title,
  done,
  onToggle,
  onEdit,
  onDelete,
  locked = false,
  meta,
  dragHandleProps,
}: {
  title: string;
  done: boolean;
  onToggle: () => void;
  onEdit: (title: string) => void;
  onDelete: () => void;
  /** Скрывает переименование и удаление — для строк, не привязанных к этому месту (например, привычка в карточке дня в календаре). */
  locked?: boolean;
  /** Небольшая метка перед текстом, например время задачи. */
  meta?: string;
  /** Показывает ручку для перетаскивания и порядка строк. */
  dragHandleProps?: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  function commit() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== title) onEdit(draft);
    else setDraft(title);
  }

  return (
    <div className="group flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-surface2">
      {dragHandleProps && (
        <button
          type="button"
          aria-label="Изменить порядок"
          className="shrink-0 touch-none cursor-grab rounded-lg p-1 text-muted active:cursor-grabbing"
          onPointerDown={dragHandleProps.onPointerDown}
          onPointerMove={dragHandleProps.onPointerMove}
          onPointerUp={dragHandleProps.onPointerUp}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="6" r="1.5" />
            <circle cx="16" cy="6" r="1.5" />
            <circle cx="8" cy="12" r="1.5" />
            <circle cx="16" cy="12" r="1.5" />
            <circle cx="8" cy="18" r="1.5" />
            <circle cx="16" cy="18" r="1.5" />
          </svg>
        </button>
      )}
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
          {meta && <span className="mr-1.5 text-xs font-medium text-accent">{meta}</span>}
          {title}
        </span>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={`flex-1 truncate text-left text-sm ${
            done ? "text-muted line-through" : "text-text"
          }`}
        >
          {meta && <span className="mr-1.5 text-xs font-medium text-accent">{meta}</span>}
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
