"use client";

import { useMemo, useState } from "react";
import type { AdminTrendPoint } from "@/lib/admin/platform-intelligence";
import { homeCard, homeCardPad, homeKicker, homeSubtitle } from "@/components/dashboard/home/home-ui";
import { cn } from "@/lib/utils";

const WIDTH = 720;
const HEIGHT = 200;
const PADDING = { top: 16, right: 12, bottom: 28, left: 12 };

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let path = `M ${points[0].x},${points[0].y}`;
  for (let index = 0; index < points.length - 1; index++) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = (current.x + next.x) / 2;
    path += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
  }
  return path;
}

type Metric = "revenue" | "orders" | "signups";

const METRICS: { id: Metric; label: string }[] = [
  { id: "revenue", label: "Real GMV" },
  { id: "orders", label: "Orders" },
  { id: "signups", label: "Signups" },
];

interface AdminTrendChartProps {
  series: AdminTrendPoint[];
  range: number;
  defaultMetric?: Metric;
}

export function AdminTrendChart({
  series,
  range,
  defaultMetric = "revenue",
}: AdminTrendChartProps) {
  const [metric, setMetric] = useState<Metric>(defaultMetric);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { path, areaPath, coords, labels, maxValue } = useMemo(() => {
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const values = series.map((point) => point[metric]);
    const max = Math.max(...values, 1);

    const pointCoords = series.map((point, index) => ({
      x: PADDING.left + (index / Math.max(series.length - 1, 1)) * innerWidth,
      y: PADDING.top + innerHeight - (point[metric] / max) * innerHeight,
      value: point[metric],
      date: point.date,
    }));

    const labelStep = Math.max(1, Math.floor(series.length / 6));
    const chartLabels = series
      .map((point, index) => ({ index, date: point.date }))
      .filter((_, index) => index % labelStep === 0)
      .map((entry) => ({
        x:
          PADDING.left +
          (entry.index / Math.max(series.length - 1, 1)) * innerWidth,
        label: new Date(entry.date + "T12:00:00Z").toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        }),
      }));

    const linePath = buildSmoothPath(pointCoords);
    const fillPath =
      pointCoords.length > 0
        ? `${linePath} L ${pointCoords[pointCoords.length - 1].x},${HEIGHT - PADDING.bottom} L ${pointCoords[0].x},${HEIGHT - PADDING.bottom} Z`
        : "";

    return {
      path: linePath,
      areaPath: fillPath,
      coords: pointCoords,
      labels: chartLabels,
      maxValue: max,
    };
  }, [series, metric]);

  const active = hoverIndex != null ? coords[hoverIndex] : null;
  const total = series.reduce((sum, point) => sum + point[metric], 0);

  return (
    <section className={cn(homeCard, homeCardPad)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={homeKicker}>Platform trend · last {range}d</p>
          <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
            {metric === "revenue"
              ? `${Math.round(total).toLocaleString()} MAD`
              : total.toLocaleString()}
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            {metric === "revenue"
              ? "Real GMV only — test checkouts excluded"
              : metric === "orders"
                ? "Real COD orders across all stores"
                : "New merchant accounts (non-demo)"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {METRICS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMetric(item.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                metric === item.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-black/[0.04] text-neutral-600 hover:bg-black/[0.07] dark:bg-white/[0.06] dark:text-neutral-300"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-[200px] w-full"
          role="img"
          aria-label={`${metric} trend chart`}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="adminTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D1D1F" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1D1D1F" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#adminTrendFill)" />
          <path
            d={path}
            fill="none"
            stroke="#1D1D1F"
            strokeWidth="2"
            className="dark:stroke-white"
          />
          {coords.map((point, index) => (
            <circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              r={hoverIndex === index ? 4 : 0}
              className="fill-neutral-900 dark:fill-white"
              onMouseEnter={() => setHoverIndex(index)}
            />
          ))}
          {coords.map((point, index) => (
            <rect
              key={`hit-${point.date}`}
              x={point.x - 8}
              y={PADDING.top}
              width={16}
              height={HEIGHT - PADDING.top - PADDING.bottom}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
            />
          ))}
          {labels.map((label) => (
            <text
              key={label.label + label.x}
              x={label.x}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-neutral-400"
              fontSize="10"
            >
              {label.label}
            </text>
          ))}
        </svg>
        {active ? (
          <div className="pointer-events-none absolute left-3 top-1 rounded-md border border-black/[0.06] bg-white/95 px-2 py-1 text-[11px] shadow-sm dark:border-white/10 dark:bg-neutral-900/95">
            <span className="text-neutral-400">
              {new Date(active.date + "T12:00:00Z").toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
              {metric === "revenue"
                ? `${Math.round(active.value).toLocaleString()} MAD`
                : active.value.toLocaleString()}
            </span>
            <span className="ml-2 text-neutral-400">
              max {Math.round(maxValue).toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
