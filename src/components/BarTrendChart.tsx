"use client";

import { useState } from "react";

export function BarTrendChart({
  bars,
  height = 120,
}: {
  bars: { label: string; ratio: number | null }[];
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 320;
  const padTop = 22;
  const padBottom = 20;
  const plotHeight = height - padTop - padBottom;
  const barSlot = width / bars.length;
  const barWidth = Math.min(28, barSlot * 0.55);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="График по неделям"
    >
      <line
        x1={0}
        y1={height - padBottom}
        x2={width}
        y2={height - padBottom}
        stroke="rgb(var(--color-border))"
        strokeWidth={1}
      />

      {bars.map((bar, i) => {
        const cx = barSlot * i + barSlot / 2;
        const hasData = bar.ratio !== null;
        const barHeight = hasData ? Math.max(3, bar.ratio! * plotHeight) : 3;
        const y = height - padBottom - barHeight;
        const isHovered = hovered === i;

        return (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            className="cursor-default"
          >
            <rect x={barSlot * i} y={padTop} width={barSlot} height={height - padTop - padBottom} fill="transparent" />
            <rect
              x={cx - barWidth / 2}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={hasData ? "rgb(var(--color-accent))" : "rgb(var(--color-border))"}
              opacity={hasData && !isHovered ? 0.85 : 1}
            />
            {isHovered && (
              <text
                x={cx}
                y={y - 6}
                textAnchor="middle"
                fontSize="10"
                fill="rgb(var(--color-text))"
                fontWeight={600}
              >
                {hasData ? `${Math.round(bar.ratio! * 100)}%` : "—"}
              </text>
            )}
            <text
              x={cx}
              y={height - 6}
              textAnchor="middle"
              fontSize="9"
              fill="rgb(var(--color-muted))"
            >
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
