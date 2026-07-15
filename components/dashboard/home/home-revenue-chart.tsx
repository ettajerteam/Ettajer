"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import type { DashboardRange, TrendPoint } from "@/types/dashboard";
import { homeCard, homeCardPad, homeMetric } from "./home-ui";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HomeSectionHeader } from "./home-section-header";
import { HomeGoalTracker } from "./home-goal-tracker";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: 1, label: "Today" },
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
  { value: 365, label: "12 Months" },
];

interface HomeRevenueChartProps {
  trend: TrendPoint[];
  previousTrend: TrendPoint[];
  currency: string;
  range: DashboardRange;
  totalRevenue: number;
  revenueChange: number;
  suggestedGoal: number;
}

const WIDTH = 760;
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

export function HomeRevenueChart({
  trend,
  previousTrend,
  currency,
  range,
  totalRevenue,
  revenueChange,
  suggestedGoal,
}: HomeRevenueChartProps) {
  const pathname = usePathname();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [compare, setCompare] = useState(false);

  const rangeLabel =
    range === 1 ? "Today" : range === 365 ? "12-month" : `${range}-day`;

  const { revenuePath, previousPath, areaPath, coords, labels, maxValue } = useMemo(() => {
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const max = Math.max(
      ...trend.map((point) => point.revenue),
      ...(compare ? previousTrend.map((point) => point.revenue) : []),
      1
    );

    const revenueCoords = trend.map((point, index) => ({
      x: PADDING.left + (index / Math.max(trend.length - 1, 1)) * innerWidth,
      y: PADDING.top + innerHeight - (point.revenue / max) * innerHeight,
    }));

    const previousCoords = previousTrend.map((point, index) => ({
      x: PADDING.left + (index / Math.max(previousTrend.length - 1, 1)) * innerWidth,
      y: PADDING.top + innerHeight - (point.revenue / max) * innerHeight,
    }));

    const labelStep = Math.max(1, Math.floor(trend.length / 6));
    const chartLabels = trend
      .map((point, index) => ({ index, date: point.date }))
      .filter((_, index) => index % labelStep === 0)
      .map((entry) => ({
        x: PADDING.left + (entry.index / Math.max(trend.length - 1, 1)) * innerWidth,
        label:
          range === 1
            ? new Date(entry.date).toLocaleTimeString("en", { hour: "numeric" })
            : range === 365
              ? new Date(entry.date).toLocaleDateString("en", { month: "short" })
              : new Date(entry.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      }));

    const linePath = buildSmoothPath(revenueCoords);
    const fillPath =
      revenueCoords.length > 0
        ? `${linePath} L ${revenueCoords[revenueCoords.length - 1].x},${HEIGHT - PADDING.bottom} L ${revenueCoords[0].x},${HEIGHT - PADDING.bottom} Z`
        : "";

    return {
      revenuePath: linePath,
      previousPath: buildSmoothPath(previousCoords),
      areaPath: fillPath,
      coords: revenueCoords,
      labels: chartLabels,
      maxValue: max,
    };
  }, [trend, previousTrend, range, compare]);

  const hoverPoint = hoverIndex !== null ? trend[hoverIndex] : null;
  const hoverCoord = hoverIndex !== null ? coords[hoverIndex] : null;

  function handleExport() {
    const rows = ["Date,Revenue,Profit", ...trend.map((point) => `${point.date},${point.revenue},${point.profit}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "revenue-overview.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={cn(homeCard, homeCardPad, "scroll-mt-24")} id="revenue">
      <HomeSectionHeader
        title="Revenue"
        description="Performance for selected period"
        compact
        action={
          <div className="flex items-center gap-1.5">
            <Button
              variant={compare ? "default" : "outline"}
              size="sm"
              className="h-8 rounded-lg text-xs"
              onClick={() => setCompare((value) => !value)}
            >
              Compare
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs"
              onClick={handleExport}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={homeMetric}>{formatCurrency(totalRevenue, currency)}</p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium",
              revenueChange >= 0 ? "text-emerald-600" : "text-red-600"
            )}
          >
            {revenueChange >= 0 ? "+" : ""}
            {revenueChange.toFixed(1)}% vs previous
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 dark:bg-white/5">
          {RANGES.map((item) => (
            <Link
              key={item.value}
              href={`${pathname}?range=${item.value}`}
              scroll={false}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                range === item.value
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-[#222] dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="relative mt-4 w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="Revenue chart"
        >
          <defs>
            <linearGradient id="homeRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#007AFF" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((fraction) => (
            <line
              key={fraction}
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * fraction}
              y2={PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * fraction}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-[#ECECEC] dark:text-white/10"
            />
          ))}

          {areaPath ? <path d={areaPath} fill="url(#homeRevenueFill)" /> : null}
          {compare && previousPath ? (
            <path
              d={previousPath}
              fill="none"
              stroke="#FF9500"
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {revenuePath ? (
            <path
              d={revenuePath}
              fill="none"
              stroke="#007AFF"
              strokeWidth={2.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {hoverCoord ? (
            <>
              <line
                x1={hoverCoord.x}
                x2={hoverCoord.x}
                y1={PADDING.top}
                y2={HEIGHT - PADDING.bottom}
                stroke="#007AFF"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <circle
                cx={hoverCoord.x}
                cy={hoverCoord.y}
                r={5}
                fill="#007AFF"
                stroke="white"
                strokeWidth={2}
              />
            </>
          ) : null}

          {trend.map((_, index) => (
            <rect
              key={index}
              x={
                PADDING.left +
                (index / Math.max(trend.length - 1, 1)) * (WIDTH - PADDING.left - PADDING.right) -
                8
              }
              y={0}
              width={16}
              height={HEIGHT - PADDING.bottom}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
            />
          ))}

          {labels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={HEIGHT - 10}
              textAnchor="middle"
              className="fill-neutral-400 text-[10px]"
            >
              {label.label}
            </text>
          ))}
        </svg>

        {hoverPoint && hoverCoord ? (
          <div
            className="pointer-events-none absolute z-10 rounded-[14px] bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg"
            style={{
              left: `${(hoverCoord.x / WIDTH) * 100}%`,
              top: 0,
              transform: "translate(-50%, -10px)",
            }}
          >
            <p className="font-semibold">
              {range === 1
                ? new Date(hoverPoint.date).toLocaleTimeString("en", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : new Date(hoverPoint.date).toLocaleDateString("en", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
            </p>
            <p className="mt-1 text-white/80">
              Revenue {formatCurrency(hoverPoint.revenue, currency)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#007AFF]" />
          Current period
        </span>
        {compare ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#FF9500]" />
            Previous period
          </span>
        ) : null}
        <span className="ml-auto">Peak {formatCurrency(maxValue, currency)}</span>
      </div>

      <div className="mt-3">
        <HomeGoalTracker
          currentRevenue={totalRevenue}
          suggestedGoal={suggestedGoal}
          currency={currency}
          rangeLabel={`${rangeLabel} target`}
        />
      </div>
    </section>
  );
}
