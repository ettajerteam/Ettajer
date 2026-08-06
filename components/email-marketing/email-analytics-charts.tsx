"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { EmailAnalyticsDailyPoint } from "@/lib/email-marketing/email-analytics-types";

const WIDTH = 720;
const HEIGHT = 180;
const PADDING = { top: 14, right: 10, bottom: 26, left: 10 };

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

type MetricKey = "sends" | "opens" | "clicks";

const METRICS: {
  id: MetricKey;
  label: string;
  color: string;
  fill: string;
}[] = [
  {
    id: "sends",
    label: "Daily sends",
    color: "#171717",
    fill: "rgba(23,23,23,0.08)",
  },
  {
    id: "opens",
    label: "Daily opens",
    color: "#525252",
    fill: "rgba(82,82,82,0.1)",
  },
  {
    id: "clicks",
    label: "Daily clicks",
    color: "#a3a3a3",
    fill: "rgba(163,163,163,0.14)",
  },
];

interface EmailAnalyticsChartsProps {
  daily: EmailAnalyticsDailyPoint[];
}

export function EmailAnalyticsCharts({ daily }: EmailAnalyticsChartsProps) {
  const [metric, setMetric] = useState<MetricKey>("sends");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const active = METRICS.find((m) => m.id === metric) ?? METRICS[0];

  const { linePath, areaPath, coords, labels, total } = useMemo(() => {
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const max = Math.max(...daily.map((p) => p[metric]), 1);
    const metricCoords = daily.map((point, index) => ({
      x: PADDING.left + (index / Math.max(daily.length - 1, 1)) * innerWidth,
      y: PADDING.top + innerHeight - (point[metric] / max) * innerHeight,
      value: point[metric],
      date: point.date,
    }));
    const path = buildSmoothPath(metricCoords);
    const fill =
      metricCoords.length > 0
        ? `${path} L ${metricCoords[metricCoords.length - 1].x},${HEIGHT - PADDING.bottom} L ${metricCoords[0].x},${HEIGHT - PADDING.bottom} Z`
        : "";
    const labelStep = Math.max(1, Math.floor(daily.length / 6));
    const chartLabels = daily
      .map((point, index) => ({ index, date: point.date }))
      .filter((_, index) => index % labelStep === 0)
      .map((entry) => ({
        x:
          PADDING.left +
          (entry.index / Math.max(daily.length - 1, 1)) * innerWidth,
        label: new Date(entry.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      }));
    return {
      linePath: path,
      areaPath: fill,
      coords: metricCoords,
      labels: chartLabels,
      total: daily.reduce((sum, p) => sum + p[metric], 0),
    };
  }, [daily, metric]);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-neutral-100 px-4 py-3.5 dark:border-white/10">
        <div>
          <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            {active.label}
          </h2>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            {total.toLocaleString()} total in range
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                metric === m.id
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              )}
            >
              {m.id === "sends"
                ? "Sends"
                : m.id === "opens"
                  ? "Opens"
                  : "Clicks"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 pb-2 pt-3 sm:px-4">
        {daily.every((p) => p.sends === 0 && p.opens === 0 && p.clicks === 0) ? (
          <div className="flex h-[180px] items-center justify-center">
            <p className="text-[12px] text-neutral-400">
              No engagement data yet — send a campaign to start the chart.
            </p>
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-[180px] w-full"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <path d={areaPath} fill={active.fill} />
              <path
                d={linePath}
                fill="none"
                stroke={active.color}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {coords.map((point, index) => (
                <rect
                  key={point.date}
                  x={point.x - (WIDTH / Math.max(coords.length, 1)) / 2}
                  y={PADDING.top}
                  width={WIDTH / Math.max(coords.length, 1)}
                  height={HEIGHT - PADDING.top - PADDING.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(index)}
                />
              ))}
              {hoverIndex != null && coords[hoverIndex] ? (
                <>
                  <line
                    x1={coords[hoverIndex].x}
                    x2={coords[hoverIndex].x}
                    y1={PADDING.top}
                    y2={HEIGHT - PADDING.bottom}
                    stroke="rgba(0,0,0,0.12)"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={coords[hoverIndex].x}
                    cy={coords[hoverIndex].y}
                    r="3.5"
                    fill={active.color}
                  />
                </>
              ) : null}
              {labels.map((label) => (
                <text
                  key={label.label + label.x}
                  x={label.x}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-neutral-400"
                  style={{ fontSize: 10 }}
                >
                  {label.label}
                </text>
              ))}
            </svg>
            {hoverIndex != null && coords[hoverIndex] ? (
              <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md border border-black/[0.06] bg-white px-2.5 py-1.5 text-[11px] shadow-sm dark:border-white/10 dark:bg-[#1C1C1E]">
                <span className="text-neutral-400">
                  {new Date(coords[hoverIndex].date).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric" }
                  )}
                </span>
                <span className="ml-2 font-semibold tabular-nums text-neutral-900 dark:text-white">
                  {coords[hoverIndex].value.toLocaleString()}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
