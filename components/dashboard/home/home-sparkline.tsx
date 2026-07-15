"use client";

import { cn } from "@/lib/utils";

interface HomeSparklineProps {
  points: number[];
  color?: string;
  className?: string;
}

export function HomeSparkline({ points, color = "#007AFF", className }: HomeSparklineProps) {
  if (!points || points.length < 2) {
    return <div className={cn("h-8 w-20", className)} />;
  }

  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const width = 88;
  const height = 32;
  const step = width / (points.length - 1);

  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
