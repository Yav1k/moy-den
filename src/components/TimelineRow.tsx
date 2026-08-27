"use client";

import { useState } from "react";

function RepeatIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2.1l4 4-4 4M3 12.6v-2a4 4 0 0 1 4-4h14M7 21.9l-4-4 4-4M21 11.4v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function TimelineRow({
  icon,
  iconFilled,
  title,
  done,
  time,
  recurring = false,
  onToggle,
  onEdit,
  onDelete,
  isLast = false,
  dragHandleProps,
  onTimeClick,
}: {
  icon: React.ReactNode;
  iconFilled: boolean;
  title: string;
  done: boolean;
  time?: string | null;
  recurring?: boolean;
  onToggle: () => void;
  onEdit: (title: string) => void;
  onDelete: () => void;
  isLast?: boolean;
  dragHandleProps?: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
  /** Тап по времени/подписи "+ время" — открывает редактор напоминания (только для привычек). */
  onTimeClick?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  function commit() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== title) onEdit(draft);
    else setDraft(title);
  }

  return (
    <div className="group flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            iconFilled ? "bg-accent text-accent-fg" : "border-2 border-accent bg-surface2 text-accent"
          }`}
        >
          {icon}
        </div>
        {!isLast && <div className="my-1 w-0.5 flex-1 rounded bg-border" />}
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {recurring ? (
              <button
                onClick={onTimeClick}
                className="flex items-center gap-1 text-xs text-muted hover:text-accent"
              >
                {time ? (
                  <>
                    {time}
                    <RepeatIcon />
                  </>
                ) : (
                  "+ время"
                )}
              </button>
            ) : (
              time && <div className="flex items-center gap-1 text-xs text-muted">{time}</div>
            )}
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
                className="mt-0.5 w-full rounded-lg border border-border bg-surface px-2 py-1 text-sm text-text outline-none"
              />
            ) : (
              <button
                onClick={() => setEditing(true)}
                className={`mt-0.5 block w-full break-words text-left text-[15px] font-medium ${
                  done ? "text-muted line-through" : "text-text"
                }`}
              >
                {title}
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 pt-0.5">
            {dragHandleProps && (
              <button
                type="button"
                aria-label="Изменить порядок"
                className="touch-none cursor-grab rounded-lg p-1 text-muted/60 transition hover:text-muted active:cursor-grabbing"
                onPointerDown={dragHandleProps.onPointerDown}
                onPointerMove={dragHandleProps.onPointerMove}
                onPointerUp={dragHandleProps.onPointerUp}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="8" cy="6" r="1.5" />
                  <circle cx="16" cy="6" r="1.5" />
                  <circle cx="8" cy="12" r="1.5" />
                  <circle cx="16" cy="12" r="1.5" />
                  <circle cx="8" cy="18" r="1.5" />
                  <circle cx="16" cy="18" r="1.5" />
                </svg>
              </button>
            )}
            <button
              onClick={onDelete}
              aria-label="Удалить"
              className="rounded-lg p-1 text-muted/60 transition hover:text-red-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
              </svg>
            </button>
            <input type="checkbox" className="task-checkbox" checked={done} onChange={onToggle} aria-label={title} />
          </div>
        </div>
      </div>
    </div>
  );
}
