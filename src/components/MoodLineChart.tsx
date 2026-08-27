"use client";

import { useState } from "react";
import { MOODS } from "@/lib/mood";

export function MoodLineChart({
  points,
  height = 140,
}: {
  points: { label: string; date: string; value: number | null }[];
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 320;
  const padLeft = 22;
  const padRight = 6;
  const padTop = 16;
  const padBottom = 18;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const yFor = (value: number) => padTop + plotHeight - ((value - 1) / 4) * plotHeight;
  const xFor = (i: number) => padLeft + stepX * i;

  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  points.forEach((p, i) => {
    if (p.value === null) {
      if (current.length > 1) segments.push(current);
      current = [];
      return;
    }
    current.push({ x: xFor(i), y: yFor(p.value) });
  });
  if (current.length > 1) segments.push(current);

  const hasAnyData = points.some((p) => p.value !== null);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Тренд настроения"
    >
      {[1, 3, 5].map((v) => (
        <g key={v}>
          <line
            x1={padLeft}
            y1={yFor(v)}
            x2={width - padRight}
            y2={yFor(v)}
            stroke="rgb(var(--color-border))"
            strokeWidth={1}
            strokeDasharray="2,3"
          />
          <text x={4} y={yFor(v) + 3} fontSize="9">
            {MOODS.find((m) => m.value === v)?.emoji}
          </text>
        </g>
      ))}

      {!hasAnyData && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fontSize="10"
          fill="rgb(var(--color-muted))"
        >
          Пока нет отметок настроения
        </text>
      )}

      {segments.map((seg, i) => (
        <polyline
          key={i}
          points={seg.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="rgb(var(--color-accent))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {points.map((p, i) =>
        p.value === null ? null : (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
          >
            <circle cx={xFor(i)} cy={padTop} r={8} fill="transparent" />
            <circle
              cx={xFor(i)}
              cy={yFor(p.value)}
              r={hovered === i ? 4 : 3}
              fill="rgb(var(--color-accent))"
            />
            {hovered === i && (
              <text
                x={xFor(i)}
                y={yFor(p.value) - 8}
                textAnchor="middle"
                fontSize="9"
                fill="rgb(var(--color-text))"
                fontWeight={600}
              >
                {p.label}
              </text>
            )}
          </g>
        )
      )}
    </svg>
  );
}
