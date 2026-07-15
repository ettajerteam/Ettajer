"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Package,
  Zap,
  Download,
  ChevronRight,
  Award,
  Trophy,
  Target,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency } from "@/lib/utils";
import type {
  ExecutiveDashboardData,
  HealthScore,
  KpiMetric,
  TopProduct,
} from "@/types/dashboard";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardCardInteractive,
} from "@/lib/dashboard-ui";

interface ExecutiveDashboardProps {
  data: ExecutiveDashboardData;
  userName?: string;
}

const RANGE_OPTIONS: { value: number; label: string }[] = [
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
  { value: 90, label: "90 Days" },
];

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const step = width / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HealthGauge({ health }: { health: HealthScore }) {
  const gradeColor =
    health.grade === "A"
      ? "text-emerald-500"
      : health.grade === "B"
        ? "text-[#007AFF]"
        : health.grade === "C"
          ? "text-amber-500"
          : "text-red-500";
  const ringColor =
    health.grade === "A"
      ? "#10b981"
      : health.grade === "B"
        ? "#007AFF"
        : health.grade === "C"
          ? "#f59e0b"
          : "#ef4444";
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (health.score / 100) * circumference;

  return (
    <div className={cn(dashboardCard, dashboardCardPad)}>
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-4 w-4 text-[#007AFF]" />
        <h2 className="font-semibold">Business Health</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width={100} height={100} className="-rotate-90">
            <circle cx={50} cy={50} r={42} fill="none" stroke="currentColor" strokeWidth={8} className="text-muted/30" />
            <circle
              cx={50}
              cy={50}
              r={42}
              fill="none"
              stroke={ringColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", gradeColor)}>{health.grade}</span>
            <span className="text-[10px] text-muted-foreground">{health.score}/100</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-semibold">{health.label}</p>
          {health.factors.slice(0, 4).map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-24 shrink-0">{f.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${f.value}%`,
                    backgroundColor: f.value >= 65 ? "#10b981" : f.value >= 45 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopProducts({
  products,
  currency,
}: {
  products: TopProduct[];
  currency: string;
}) {
  return (
    <div className={cn(dashboardCard, dashboardCardPad)}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-amber-500" />
        <h2 className="font-semibold">Top Products</h2>
        <span className="ml-auto text-xs text-muted-foreground">by revenue</span>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No sales in this period yet.
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-[#007AFF]"
                    style={{ width: `${Math.max(p.share, 3)}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{formatCurrency(p.revenue, currency)}</p>
                <p className="text-xs text-muted-foreground">{p.units} units</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChangeBadge({ value, invert }: { value: number; invert?: boolean }) {
  const positive = invert ? value < 0 : value > 0;
  const neutral = Math.abs(value) < 0.1;
  if (neutral) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        positive ? "text-emerald-500" : "text-red-500"
      )}
    >
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function KpiCard({ metric, highlight }: { metric: KpiMetric; highlight?: boolean }) {
  const sparkColor = highlight ? "#007AFF" : "#10b981";
  return (
    <div
      className={cn(
        dashboardCard,
        dashboardCardPad,
        dashboardCardInteractive,
        highlight && "ring-1 ring-[#007AFF]/20"
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {metric.label}
        </p>
        {metric.sparkline && (
          <div className="opacity-80">
            <Sparkline points={metric.sparkline} color={sparkColor} />
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{metric.value}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {metric.label === "Ad Spend" ? (
          <ChangeBadge value={metric.change} invert />
        ) : (
          metric.label !== "Cash Runway" && <ChangeBadge value={metric.change} />
        )}
        <span className="text-xs text-muted-foreground">{metric.changeLabel}</span>
      </div>
      {metric.subtext && (
        <p
          className={cn(
            "text-xs font-medium mt-2",
            metric.status === "healthy" ? "text-emerald-500" : "text-amber-500"
          )}
        >
          {metric.subtext}
        </p>
      )}
    </div>
  );
}

function RevenueChart({
  trend,
  previousTrend,
  currency,
  range,
  compare,
}: {
  trend: ExecutiveDashboardData["trend"];
  previousTrend: ExecutiveDashboardData["trend"];
  currency: string;
  range: number;
  compare: boolean;
}) {
  const maxVal = Math.max(
    ...trend.map((t) => t.revenue),
    ...(compare ? previousTrend.map((t) => t.revenue) : []),
    1
  );

  const width = 100;
  const height = 100;
  const prevPath = previousTrend.length
    ? previousTrend
        .map((p, i) => {
          const x = (i / Math.max(previousTrend.length - 1, 1)) * width;
          const y = height - (p.revenue / maxVal) * height;
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ")
    : "";

  return (
    <div className="space-y-4">
      <div className="relative h-40">
        <div className="flex items-end gap-[2px] h-full">
          {trend.map((point) => (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group relative">
              <div
                className="w-full rounded-t-sm bg-[#007AFF]/80 transition-all group-hover:bg-[#007AFF]"
                style={{ height: `${Math.max((point.revenue / maxVal) * 100, 2)}%` }}
              />
              <div
                className="w-full rounded-t-sm bg-emerald-500/60 absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ height: `${Math.max((point.profit / maxVal) * 100, 1)}%` }}
              />
            </div>
          ))}
        </div>
        {compare && prevPath && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <path d={prevPath} fill="none" stroke="#f59e0b" strokeWidth={1} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
          </svg>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[#007AFF]" /> Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Profit
        </span>
        {compare && (
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-amber-500" style={{ borderTop: "1px dashed" }} /> Prev period
          </span>
        )}
        <span className="ml-auto">{currency} · Last {range} days</span>
      </div>
    </div>
  );
}

function GoalTracker({
  rawRevenue,
  suggestedGoal,
  currency,
  range,
}: {
  rawRevenue: number;
  suggestedGoal: number;
  currency: string;
  range: number;
}) {
  const [goal, setGoal] = useState(suggestedGoal);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(suggestedGoal));

  useEffect(() => {
    const stored = window.localStorage.getItem("ettajer-revenue-goal");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        setGoal(parsed);
        setDraft(String(parsed));
      }
    }
  }, []);

  const save = () => {
    const parsed = parseInt(draft.replace(/[^\d]/g, ""), 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setGoal(parsed);
      window.localStorage.setItem("ettajer-revenue-goal", String(parsed));
    }
    setEditing(false);
  };

  const progress = goal > 0 ? Math.min((rawRevenue / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - rawRevenue, 0);
  const onTrack = progress >= 70;

  return (
    <div className={cn(dashboardCard, dashboardCardPad)}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-[#007AFF]" />
        <h2 className="font-semibold">Revenue Goal</h2>
        <span className="ml-auto text-xs text-muted-foreground">{range}-day target</span>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-bold">{formatCurrency(rawRevenue, currency)}</p>
          <p className="text-xs text-muted-foreground">of {formatCurrency(goal, currency)} goal</p>
        </div>
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-8 w-28 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
            <Button size="icon" className="h-8 w-8" onClick={save}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setEditing(true)}>
            <Pencil className="h-3 w-3" />
            Edit goal
          </Button>
        )}
      </div>

      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", onTrack ? "bg-emerald-500" : "bg-[#007AFF]")}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className={cn("font-semibold", onTrack ? "text-emerald-500" : "text-[#007AFF]")}>
          {progress.toFixed(0)}% reached
        </span>
        <span className="text-muted-foreground">
          {remaining > 0 ? `${formatCurrency(remaining, currency)} to go` : "Goal reached 🎉"}
        </span>
      </div>
    </div>
  );
}

function exportDashboardCsv(data: ExecutiveDashboardData) {
  const rows: string[][] = [
    ["Ettajer Dashboard Export"],
    ["Store", data.storeName],
    ["Range", `${data.range} days`],
    ["Generated", new Date().toLocaleString()],
    [],
    ["Metric", "Value", "Change %"],
    [data.kpis.revenue.label, data.kpis.revenue.value, data.kpis.revenue.change.toFixed(1)],
    [data.kpis.netProfit.label, data.kpis.netProfit.value, data.kpis.netProfit.change.toFixed(1)],
    [data.kpis.adSpend.label, data.kpis.adSpend.value, data.kpis.adSpend.change.toFixed(1)],
    [data.kpis.cashRunway.label, data.kpis.cashRunway.value, ""],
    [data.operational.orders.label, data.operational.orders.value, data.operational.orders.change.toFixed(1)],
    [data.operational.aov.label, data.operational.aov.value, data.operational.aov.change.toFixed(1)],
    [data.operational.conversion.label, data.operational.conversion.value, data.operational.conversion.change.toFixed(1)],
    [data.operational.returns.label, data.operational.returns.value, data.operational.returns.change.toFixed(1)],
    [],
    ["Business Health", `${data.healthScore.score}/100 (${data.healthScore.grade})`],
    [],
    ["Top Products", "Units", "Revenue"],
    ...data.topProducts.map((p) => [p.title, String(p.units), String(Math.round(p.revenue))]),
    [],
    ["Daily Revenue", "Date", "Revenue", "Profit"],
    ...data.trend.map((t) => ["", t.date, String(Math.round(t.revenue)), String(Math.round(t.profit))]),
  ];

  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ettajer-dashboard-${data.range}d-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExecutiveDashboard({ data, userName }: ExecutiveDashboardProps) {
  const [compare, setCompare] = useState(false);
  const updatedAgo = Math.max(
    1,
    Math.round((Date.now() - new Date(data.lastUpdated).getTime()) / 60000)
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {userName ? `Welcome, ${userName}` : "Executive Dashboard"}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {data.storeName} · Last updated {updatedAgo} min ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="premium-card inline-flex p-0.5">
            {RANGE_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/dashboard?range=${opt.value}`}
                scroll={false}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  data.range === opt.value
                    ? "premium-nav-active premium-glow-blue bg-[#007AFF] text-white ring-0"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 hidden md:flex"
            onClick={() => exportDashboardCsv(data)}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard metric={data.kpis.revenue} highlight />
        <KpiCard metric={data.kpis.netProfit} />
        <KpiCard metric={data.kpis.adSpend} />
        <KpiCard metric={data.kpis.cashRunway} />
      </div>

      {/* Chart + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={cn("xl:col-span-2", dashboardCard, dashboardCardPad)}>
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h2 className="font-semibold text-lg">Revenue & Profit Trend</h2>
              <p className="text-sm text-muted-foreground">
                Track growth quality, not just top-line sales
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCompare((c) => !c)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                compare ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" : "hover:bg-accent"
              )}
            >
              {compare ? "Hide" : "Compare"} prev period
            </button>
          </div>
          <RevenueChart
            trend={data.trend}
            previousTrend={data.previousTrend}
            currency={data.currency}
            range={data.range}
            compare={compare}
          />
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Revenue growth</p>
              <ChangeBadge value={data.trendSummary.revenueGrowth} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Profit growth</p>
              <ChangeBadge value={data.trendSummary.profitGrowth} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Margin trend</p>
              <p className="text-sm font-semibold">
                {data.trendSummary.marginStart.toFixed(1)}% → {data.trendSummary.marginEnd.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className={cn(dashboardCard, dashboardCardPad, "flex flex-col")}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[#007AFF]" />
            <h2 className="font-semibold">AI Insights</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">
              Priority
            </span>
          </div>
          <div className="space-y-3 flex-1">
            {data.insights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  insight.priority ? "border-[#007AFF]/20 bg-[#007AFF]/5" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold shrink-0",
                      insight.impactType === "positive" && "text-emerald-500",
                      insight.impactType === "negative" && "text-red-500",
                      insight.impactType === "neutral" && "text-muted-foreground"
                    )}
                  >
                    {insight.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-muted/50 p-4 border">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
              Recommended action · Today
            </p>
            <p className="text-sm font-medium">{data.recommendedAction.text}</p>
            <p className="text-xs text-emerald-500 font-semibold mt-2">
              Est. impact: {data.recommendedAction.savings}
            </p>
          </div>
        </div>
      </div>

      {/* Operational + Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={cn(dashboardCard, dashboardCardPad)}>
          <h2 className="font-semibold mb-4">Operational Performance</h2>
          <p className="text-xs text-muted-foreground mb-4">Last 30 days</p>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(data.operational).map((m) => (
              <div key={m.label} className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-xl font-bold mt-1">{m.value}</p>
                <ChangeBadge
                  value={m.change}
                  invert={m.label === "Returns"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={cn("xl:col-span-2", dashboardCard, "overflow-hidden")}>
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold">Recent Orders</h2>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/dashboard/orders">
                View all <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </Button>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground text-sm">
              No orders yet. Share your store to get started.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-3 text-sm font-medium">
                      <Link href={`/dashboard/orders/${order.id}`} className="hover:text-[#007AFF]">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm">{order.customerName}</td>
                    <td className="px-6 py-3 text-sm">
                      {formatCurrency(order.total, data.currency)}
                    </td>
                    <td className="px-6 py-3">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Goal + Health score + Top products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GoalTracker
          rawRevenue={data.rawRevenue}
          suggestedGoal={data.suggestedGoal}
          currency={data.currency}
          range={data.range}
        />
        <HealthGauge health={data.healthScore} />
        <TopProducts products={data.topProducts} currency={data.currency} />
      </div>

      {/* Risk + Inventory */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={cn(dashboardCard, dashboardCardPad)}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold">Risk Monitor</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {data.risks.filter((r) => r.level !== "good").length} alerts
            </span>
          </div>
          <div className="space-y-3">
            {data.risks.map((risk) => (
              <div key={risk.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{risk.title}</p>
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                      risk.level === "high" && "bg-red-500/10 text-red-500",
                      risk.level === "watch" && "bg-amber-500/10 text-amber-500",
                      risk.level === "good" && "bg-emerald-500/10 text-emerald-500"
                    )}
                  >
                    {risk.level === "high" ? "High" : risk.level === "watch" ? "Watch" : "Good"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Current</span>
                    <p className="font-semibold">{risk.current}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target</span>
                    <p className="font-semibold">{risk.target}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{risk.impact}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={cn(dashboardCard, dashboardCardPad)}>
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-[#007AFF]" />
            <h2 className="font-semibold">Inventory & Working Capital</h2>
            <span className="ml-auto text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {data.inventory.outOfStock === 0 && data.inventory.lowStock < 5
                ? "Optimized"
                : "Action needed"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Low Stock", value: data.inventory.lowStock },
              { label: "Out of Stock", value: data.inventory.outOfStock },
              {
                label: "Inventory Value",
                value: formatCurrency(data.inventory.inventoryValue, data.currency),
              },
              {
                label: "Slow Moving",
                value: formatCurrency(data.inventory.slowMovingValue, data.currency),
              },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-lg font-bold mt-0.5">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-muted/50 border p-4">
            <p className="text-xs font-medium">{data.inventory.recommendation}</p>
            <p className="text-sm text-emerald-500 font-semibold mt-1">
              Expected cash release: {data.inventory.cashRelease}
            </p>
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      <div className="rounded-2xl border bg-gradient-to-br from-[#007AFF]/5 to-transparent border-[#007AFF]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-[#007AFF]" />
          <h2 className="font-semibold text-lg">Today&apos;s Priority Actions</h2>
          <span className="text-xs text-muted-foreground ml-2">
            {data.priorityActions.length} items
          </span>
        </div>
        {data.priorityActions.length === 0 ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            All clear — no urgent actions today.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {data.priorityActions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-xl border bg-background/80 p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-emerald-500 font-semibold mt-1">{action.impact}</p>
                  </div>
                  {action.href && (
                    <Button variant="ghost" size="icon" className="shrink-0" asChild>
                      <Link href={action.href}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#007AFF]/10">
              <div>
                <p className="text-xs text-muted-foreground">Total projected impact</p>
                <p className="text-2xl font-bold text-[#007AFF]">
                  +{formatCurrency(data.totalProjectedImpact, data.currency)}
                </p>
              </div>
              <Button className="bg-[#007AFF] hover:bg-[#0071EB] rounded-xl gap-2">
                <Eye className="h-4 w-4" />
                Review Actions
              </Button>
            </div>
          </>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground text-center pb-2">
        Profit, ad spend & conversion metrics use estimates until marketing & analytics integrations are connected.
      </p>
    </div>
  );
}
