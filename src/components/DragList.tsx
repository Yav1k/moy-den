"use client";

import { useEffect, useRef, useState } from "react";

export function DragList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (
    item: T,
    dragHandleProps: {
      onPointerDown: (e: React.PointerEvent) => void;
      onPointerMove: (e: React.PointerEvent) => void;
      onPointerUp: (e: React.PointerEvent) => void;
    }
  ) => React.ReactNode;
}) {
  const [order, setOrder] = useState(items);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const draggingId = useRef<string | null>(null);
  const orderRef = useRef(order);
  orderRef.current = order;

  // Синхронизируемся с внешним списком (после фетча/добавления/удаления),
  // но не во время самого перетаскивания, чтобы не сбить жест.
  useEffect(() => {
    if (!draggingId.current) setOrder(items);
  }, [items]);

  function onPointerDown(id: string, e: React.PointerEvent) {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    draggingId.current = id;
    const el = rowRefs.current.get(id);
    if (el) el.style.opacity = "0.6";
  }

  function onPointerMove(e: React.PointerEvent) {
    const id = draggingId.current;
    if (!id) return;
    const current = orderRef.current;
    const currentIndex = current.findIndex((i) => i.id === id);
    if (currentIndex === -1) return;

    for (let i = 0; i < current.length; i++) {
      if (i === currentIndex) continue;
      const el = rowRefs.current.get(current[i].id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const movingDown = i > currentIndex;
      if ((movingDown && e.clientY > mid) || (!movingDown && e.clientY < mid)) {
        const next = [...current];
        const [moved] = next.splice(currentIndex, 1);
        next.splice(i, 0, moved);
        setOrder(next);
        break;
      }
    }
  }

  function onPointerUp() {
    const id = draggingId.current;
    if (!id) return;
    const el = rowRefs.current.get(id);
    if (el) el.style.opacity = "";
    draggingId.current = null;
    onReorder(orderRef.current.map((i) => i.id));
  }

  return (
    <div>
      {order.map((item) => (
        <div
          key={item.id}
          ref={(el) => {
            if (el) rowRefs.current.set(item.id, el);
            else rowRefs.current.delete(item.id);
          }}
          className="touch-none"
        >
          {renderItem(item, {
            onPointerDown: (e) => onPointerDown(item.id, e),
            onPointerMove,
            onPointerUp,
          })}
        </div>
      ))}
    </div>
  );
}
