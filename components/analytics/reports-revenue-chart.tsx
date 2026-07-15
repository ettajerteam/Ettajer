"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import type { ReportRange, ReportTrendPoint } from "@/lib/reports";
import { REPORT_RANGES } from "@/components/analytics/analytics-section-nav";
import { dashboardCard, dashboardCardPad, dashboardMetric, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

function formatAxisLabel(range: ReportRange, date: string): string {
  if (range === 1) {
    return new Date(date).toLocaleTimeString("en", { hour: "numeric" });
  }
  if (range === 365) {
    return new Date(date).toLocaleDateString("en", { month: "short" });
  }
  return new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" });
}

function formatTooltipLabel(range: ReportRange, date: string): string {
  if (range === 1) {
    return new Date(date).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  }
  return new Date(date).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ReportsRevenueChartProps {
  trend: ReportTrendPoint[];
  previousTrend: ReportTrendPoint[];
  range: ReportRange;
  currency: string;
  totalRevenue: number;
  revenueChange: number;
  peakRevenue: number;
  peakLabel: string | null;
}

export function ReportsRevenueChart({
  trend,
  previousTrend,
  range,
  currency,
  totalRevenue,
  revenueChange,
  peakRevenue,
  peakLabel,
}: ReportsRevenueChartProps) {
  const pathname = usePathname();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [compare, setCompare] = useState(false);
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");

  const metricKey = chartMetric;

  const { revenuePath, previousPath, areaPath, coords, labels, maxValue } = useMemo(() => {
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const max = Math.max(
      ...trend.map((point) => point[metricKey]),
      ...(compare ? previousTrend.map((point) => point[metricKey]) : []),
      1
    );

    const revenueCoords = trend.map((point, index) => ({
      x: PADDING.left + (index / Math.max(trend.length - 1, 1)) * innerWidth,
      y: PADDING.top + innerHeight - (point[metricKey] / max) * innerHeight,
    }));

    const previousCoords = previousTrend.map((point, index) => ({
      x: PADDING.left + (index / Math.max(previousTrend.length - 1, 1)) * innerWidth,
      y: PADDING.top + innerHeight - (point[metricKey] / max) * innerHeight,
    }));

    const labelStep = Math.max(1, Math.floor(trend.length / 6));
    const chartLabels = trend
      .map((point, index) => ({ index, date: point.date }))
      .filter((_, index) => index % labelStep === 0)
      .map((entry) => ({
        x: PADDING.left + (entry.index / Math.max(trend.length - 1, 1)) * innerWidth,
        label: formatAxisLabel(range, entry.date),
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
  }, [trend, previousTrend, range, compare, metricKey]);

  const hoverPoint = hoverIndex !== null ? trend[hoverIndex] : null;
  const hoverCoord = hoverIndex !== null ? coords[hoverIndex] : null;

  function handleExport() {
    const rows = [
      "Date,Revenue,Orders",
      ...trend.map((point) => `${point.date},${point.revenue},${point.orders}`),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `reports-revenue-${range}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={cn(dashboardCard, dashboardCardPad, "ring-1 ring-neutral-200/60 dark:ring-white/10")}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={dashboardTitle}>Performance trend</h2>
          <p className={dashboardSubtitle}>
            {chartMetric === "revenue" ? "Revenue over the selected period" : "Order volume over time"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-neutral-200/80 bg-neutral-50/80 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
            {(["revenue", "orders"] as const).map((metric) => (
              <button
                key={metric}
                type="button"
                onClick={() => setChartMetric(metric)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                  chartMetric === metric
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                )}
              >
                {metric}
              </button>
            ))}
          </div>
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
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={dashboardMetric}>
            {chartMetric === "revenue"
              ? formatCurrency(totalRevenue, currency)
              : trend.reduce((sum, point) => sum + point.orders, 0).toLocaleString()}
          </p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium",
              revenueChange >= 0 ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {chartMetric === "revenue" ? (
              <>
                {revenueChange >= 0 ? "+" : ""}
                {revenueChange.toFixed(1)}% vs previous period
              </>
            ) : (
              "Switch to revenue for period comparison"
            )}
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 dark:bg-white/5">
          {REPORT_RANGES.map((item) => (
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
          aria-label="Revenue trend chart"
        >
          <defs>
            <linearGradient id="reportsRevenueFill" x1="0" y1="0" x2="0" y2="1">
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

          {areaPath ? <path d={areaPath} fill="url(#reportsRevenueFill)" /> : null}
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
            className="pointer-events-none absolute z-10 rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg"
            style={{
              left: `${(hoverCoord.x / WIDTH) * 100}%`,
              top: 0,
              transform: "translate(-50%, -10px)",
            }}
          >
            <p className="font-semibold">{formatTooltipLabel(range, hoverPoint.date)}</p>
            <p className="mt-1 text-white/80">
              {chartMetric === "revenue"
                ? `${formatCurrency(hoverPoint.revenue, currency)} · ${hoverPoint.orders} orders`
                : `${hoverPoint.orders} orders`}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
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
        {peakLabel ? (
          <span className="ml-auto">
            Peak {formatCurrency(peakRevenue, currency)} · {peakLabel}
          </span>
        ) : null}
      </div>
    </section>
  );
}
