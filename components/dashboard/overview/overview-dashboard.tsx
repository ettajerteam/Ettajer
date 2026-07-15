"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  ClipboardCheck,
  ClipboardX,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  SlidersHorizontal,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ExecutiveDashboardData, DashboardRange } from "@/types/dashboard";
import { formatCurrency, cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardCardInteractive,
  dashboardKicker,
  dashboardMetric,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
} from "@/lib/dashboard-ui";
import { SalesChart } from "./sales-chart";

interface OverviewDashboardProps {
  data: ExecutiveDashboardData;
  userName?: string;
}

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: 1, label: "1d" },
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 365, label: "12m" },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function ChangeBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-xs font-medium text-muted-foreground">0%</span>;
  }
  const positive = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
        positive
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
      )}
    >
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  change: number;
}) {
  return (
    <div className={cn(dashboardCard, dashboardCardPad, dashboardCardInteractive, "premium-card-hover")}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/10">
          <Icon className="h-5 w-5 text-[#007AFF]" />
        </div>
        <div className="min-w-0">
          <p className={cn("truncate", dashboardKicker)}>{label}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={dashboardMetric}>{value}</span>
            <ChangeBadge value={change} />
          </div>
        </div>
      </div>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  completed: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  paid: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  shipped: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  processing: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  pending: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  cancelled: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  canceled: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export function OverviewDashboard({ data, userName }: OverviewDashboardProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [carousel, setCarousel] = useState(0);

  const revenueDelta = data.rawRevenue - data.rawRevenuePrevious;
  const revenueChangePct = data.kpis.revenue.change;

  const filteredTx = data.transactions.filter(
    (t) =>
      t.item.toLowerCase().includes(query.toLowerCase()) ||
      t.orderNumber.toLowerCase().includes(query.toLowerCase())
  );

  const bestSellers = data.bestSellers;
  const activeSeller = bestSellers[carousel];

  const today = new Date().toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting()}, {userName ?? "there"}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your store today
          </p>
        </div>
        <div className={cn(dashboardCard, "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground")}>
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {today}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total products"
          value={data.counts.totalProducts.toLocaleString()}
          change={data.counts.totalProductsChange}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Completed orders"
          value={data.counts.completedOrders.toLocaleString()}
          change={data.counts.completedOrdersChange}
        />
        <StatCard
          icon={ClipboardX}
          label="Canceled orders"
          value={data.counts.canceledOrders.toLocaleString()}
          change={data.counts.canceledOrdersChange}
        />
        <StatCard
          icon={Trophy}
          label="Top product units"
          value={data.counts.topProductUnits.toLocaleString()}
          change={data.counts.topProductUnitsChange}
        />
      </div>

      <div className={cn(dashboardCard, dashboardCardPad)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your sales report</h2>
            <p className="text-sm text-muted-foreground">Look at your sales</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground">
            Total Sales
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-center">
          <div>
            <p className="text-4xl font-bold tracking-tight text-foreground">
              {formatCurrency(data.rawRevenue, data.currency)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {revenueDelta >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {formatCurrency(Math.abs(revenueDelta), data.currency)} ({revenueChangePct >= 0 ? "+" : ""}
              {revenueChangePct.toFixed(1)}%)
            </p>

            <div className={cn("mt-5", dashboardPillGroup)}>
              {RANGES.map((r) => {
                const isActive = data.range === r.value;
                return (
                  <Link
                    key={r.label}
                    href={`${pathname}?range=${r.value}`}
                    scroll={false}
                    className={cn(
                      dashboardPill,
                      isActive ? dashboardPillActive : dashboardPillInactive
                    )}
                  >
                    {r.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#007AFF]" /> Revenue
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Profit
              </span>
            </div>
          </div>

          <SalesChart trend={data.trend} currency={data.currency} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">Last transactions</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="h-9 w-40 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  filteredTx.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3 font-medium text-foreground">#{t.orderNumber}</td>
                      <td className="px-5 py-3 text-muted-foreground">{t.item}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("en", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {formatCurrency(t.price, data.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                            statusStyles[t.status] ?? "bg-muted text-muted-foreground"
                          )}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cn(dashboardCard, dashboardCardPad, "bg-gradient-to-b from-muted/40 to-transparent")}>
          <h3 className="text-lg font-bold text-foreground">Congratulations! 🎉</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Some of your products already have the highest buyers
          </p>

          {activeSeller ? (
            <>
              <div className="relative mt-6 flex items-center justify-center">
                {bestSellers.length > 1 && (
                  <button
                    onClick={() =>
                      setCarousel((c) => (c - 1 + bestSellers.length) % bestSellers.length)
                    }
                    className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-border bg-card">
                  <Image
                    src={activeSeller.image}
                    alt={activeSeller.title}
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                </div>

                {bestSellers.length > 1 && (
                  <button
                    onClick={() => setCarousel((c) => (c + 1) % bestSellers.length)}
                    className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 text-center">
                <p className="font-semibold text-foreground">{activeSeller.title}</p>
                <p className="text-sm text-muted-foreground">{activeSeller.unitsSold} sold</p>
              </div>

              {bestSellers.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  {bestSellers.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarousel(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === carousel ? "w-5 bg-foreground" : "w-1.5 bg-border"
                      )}
                      aria-label={`Go to ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 text-center text-sm text-muted-foreground">
              No sales data yet — your best sellers will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
