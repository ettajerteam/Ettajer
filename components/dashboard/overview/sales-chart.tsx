"use client";

import { useMemo, useState } from "react";
import type { TrendPoint } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface SalesChartProps {
  trend: TrendPoint[];
  currency: string;
}

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 20, right: 12, bottom: 28, left: 12 };

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

export function SalesChart({ trend, currency }: SalesChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const { revenuePath, profitPath, coords, maxVal, labels } = useMemo(() => {
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const max = Math.max(...trend.map((t) => t.revenue), 1);

    const toCoords = (key: "revenue" | "profit") =>
      trend.map((t, i) => ({
        x: PADDING.left + (i / Math.max(trend.length - 1, 1)) * innerW,
        y: PADDING.top + innerH - (t[key] / max) * innerH,
      }));

    const revenueCoords = toCoords("revenue");
    const profitCoords = toCoords("profit");

    const labelCount = Math.min(7, trend.length);
    const labelStep = Math.max(1, Math.floor(trend.length / labelCount));
    const lbls = trend
      .map((t, i) => ({ i, date: t.date }))
      .filter((_, i) => i % labelStep === 0)
      .map((l) => ({
        x: PADDING.left + (l.i / Math.max(trend.length - 1, 1)) * innerW,
        label: new Date(l.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      }));

    return {
      revenuePath: buildSmoothPath(revenueCoords),
      profitPath: buildSmoothPath(profitCoords),
      coords: revenueCoords,
      maxVal: max,
      labels: lbls,
    };
  }, [trend]);

  const hoverPoint = hover !== null ? trend[hover] : null;
  const hoverCoord = hover !== null ? coords[hover] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#007AFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * f}
            y2={PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * f}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-border"
            strokeDasharray="3 4"
          />
        ))}

        {revenuePath && (
          <path
            d={`${revenuePath} L ${coords[coords.length - 1].x},${HEIGHT - PADDING.bottom} L ${coords[0].x},${HEIGHT - PADDING.bottom} Z`}
            fill="url(#revFill)"
          />
        )}
        <path d={profitPath} fill="none" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={revenuePath} fill="none" stroke="#007AFF" strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        {hoverCoord && (
          <>
            <line
              x1={hoverCoord.x}
              x2={hoverCoord.x}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              stroke="#007AFF"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle cx={hoverCoord.x} cy={hoverCoord.y} r={4} fill="#007AFF" stroke="white" strokeWidth={2} />
          </>
        )}

        {trend.map((_, i) => (
          <rect
            key={i}
            x={PADDING.left + (i / Math.max(trend.length - 1, 1)) * (WIDTH - PADDING.left - PADDING.right) - 6}
            y={0}
            width={12}
            height={HEIGHT - PADDING.bottom}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {labels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: "10px" }}
          >
            {l.label}
          </text>
        ))}
      </svg>

      {hoverPoint && hoverCoord && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl bg-neutral-900 text-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${(hoverCoord.x / WIDTH) * 100}%`,
            top: 0,
            transform: "translate(-50%, -8px)",
          }}
        >
          <p className="font-semibold mb-1">
            {new Date(hoverPoint.date).toLocaleDateString("en", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
            Revenue {formatCurrency(hoverPoint.revenue, currency)}
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Profit {formatCurrency(hoverPoint.profit, currency)}
          </p>
        </div>
      )}
    </div>
  );
}
