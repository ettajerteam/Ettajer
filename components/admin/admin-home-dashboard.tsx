"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import { TimeOfDayGreeting } from "@/hooks/use-time-of-day-greeting";
import { HomeSparkline } from "@/components/dashboard/home/home-sparkline";
import {
  homeCard,
  homeCardPad,
  homeKicker,
  homeLinkQuiet,
  homePage,
  homeSubtitle,
  homeTitle,
} from "@/components/dashboard/home/home-ui";
import { cn } from "@/lib/utils";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelative(value: Date | string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return formatDate(value);
}

function deltaVsYesterday(current: number, prior: number, unit: "MAD" | "count") {
  const delta = current - prior;
  if (delta === 0) return "flat vs yesterday";
  const formatted =
    unit === "MAD"
      ? Math.round(delta).toLocaleString()
      : delta.toLocaleString();
  return `${delta > 0 ? "+" : ""}${formatted} vs yesterday`;
}

function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("ettajer:open-command-palette"));
}

function HealthDot({ status }: { status: string }) {
  const color =
    status === "operational"
      ? "bg-emerald-500"
      : status === "issues"
        ? "bg-rose-500"
        : status === "attention"
          ? "bg-amber-500"
          : "bg-neutral-300";
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", color)} />;
}

const LIVE_FILTERS = [
  "all",
  "commerce",
  "merchants",
  "support",
  "errors",
] as const;

export function AdminHomeDashboard({
  data,
  userName,
}: {
  data: PlatformOverviewData;
  userName: string;
}) {
  const [liveFilter, setLiveFilter] = useState<(typeof LIVE_FILTERS)[number]>(
    "all"
  );

  const attention = data.attentionItems ?? [];
  const health = data.health;
  const funnel = data.funnel;
  const total = Math.max(funnel.totalStores, 1);

  const funnelStages = [
    {
      key: "empty",
      label: "Empty",
      count: funnel.noProducts,
      href: "/admin/activation?stage=empty",
    },
    {
      key: "draft",
      label: "Draft",
      count: funnel.draftOnly,
      href: "/admin/activation?stage=draft",
    },
    {
      key: "listed",
      label: "Listed / 0 sales",
      count: funnel.activeNoOrders,
      href: "/admin/activation?stage=listed",
    },
    {
      key: "activated",
      label: "Activated",
      count: funnel.hasOrders,
      href: "/admin/activation?stage=activated",
    },
  ] as const;

  const liveEvents = useMemo(() => {
    const feed = data.liveFeed ?? [];
    if (liveFilter === "all") return feed;
    return feed.filter((e) => e.category === liveFilter);
  }, [data.liveFeed, liveFilter]);

  const overallOk = health?.overall === "operational";

  return (
    <div className={homePage}>
      {/* GLOBAL HEADER */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              Ettajer Console
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:border-white/10 dark:text-neutral-300">
              <HealthDot status={health?.overall ?? "unknown"} />
              {health?.overallLabel ?? "Status unknown"}
            </span>
          </div>
          <p className={cn("mt-1", homeSubtitle)}>
            <TimeOfDayGreeting />, {userName}
            {data.attentionSentence ? ` · ${data.attentionSentence}` : null}
          </p>
        </div>
        <button
          type="button"
          onClick={openCommandPalette}
          className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 text-left text-[12px] text-neutral-400 transition-colors hover:border-black/[0.12] hover:bg-[#FAFAFA] sm:w-64 dark:border-white/10 dark:bg-[#121212] dark:hover:bg-white/[0.04]"
        >
          <span className="flex-1 truncate">Search anything…</span>
          <kbd className="rounded border border-black/[0.06] bg-[#F5F5F7] px-1.5 py-0.5 font-mono text-[9px] text-neutral-500 dark:border-white/10 dark:bg-white/5">
            ⌘K
          </kbd>
        </button>
      </section>

      {/* PLATFORM HEALTH */}
      {health ? (
        <section aria-label="Platform health">
          <p className={homeKicker}>Platform health</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
            {health.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                title={item.detail}
                className="flex items-center justify-between gap-2 rounded-lg border border-black/[0.06] bg-white px-2.5 py-2 transition-colors hover:bg-[#FAFAFA] dark:border-white/10 dark:bg-[#121212] dark:hover:bg-white/[0.03]"
              >
                <span className="truncate text-[11px] text-neutral-500">
                  {item.label}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-neutral-800 dark:text-neutral-100">
                  <HealthDot status={item.status} />
                  {item.statusLabel}
                </span>
              </Link>
            ))}
          </div>
          {!overallOk ? (
            <p className={cn("mt-1.5", homeSubtitle)}>
              Statuses derived from live orders, DNS checks, auth failures, and
              email env — not synthetic probes.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* TIME DIMENSIONS */}
      <section
        aria-label="Business snapshot"
        className="grid gap-2 lg:grid-cols-3"
      >
        <div className={cn(homeCard, homeCardPad)}>
          <p className={homeKicker}>Today</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-neutral-400">GMV</p>
              <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                {Math.round(data.today.revenue).toLocaleString()}
              </p>
              <p className={cn("mt-0.5 text-[10px]", homeSubtitle)}>
                {deltaVsYesterday(
                  data.today.revenue,
                  data.yesterday.revenue,
                  "MAD"
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400">Orders</p>
              <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                {data.today.orders}
              </p>
              <p className={cn("mt-0.5 text-[10px]", homeSubtitle)}>
                {deltaVsYesterday(
                  data.today.orders,
                  data.yesterday.orders,
                  "count"
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400">Signups</p>
              <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                {data.today.signups}
              </p>
              <p className={cn("mt-0.5 text-[10px]", homeSubtitle)}>
                {deltaVsYesterday(
                  data.today.signups,
                  data.yesterday.signups,
                  "count"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className={cn(homeCard, homeCardPad)}>
          <div className="flex items-center justify-between gap-2">
            <p className={homeKicker}>Last 7 days</p>
            <HomeSparkline
              points={data.sparklines.revenue}
              className="opacity-70"
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-neutral-400">Real GMV</p>
              <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                {Math.round(data.realRevenue7d).toLocaleString()} MAD
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[10px] font-medium",
                  data.changes.revenue7d > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-400"
                )}
              >
                {data.changes.revenue7d > 0 ? "+" : ""}
                {data.changes.revenue7d}% vs prior 7d
              </p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400">Real orders</p>
              <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                {data.realOrders7d}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[10px] font-medium",
                  data.changes.orders7d > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-400"
                )}
              >
                {data.changes.orders7d > 0 ? "+" : ""}
                {data.changes.orders7d}% vs prior 7d
              </p>
            </div>
          </div>
        </div>

        <div className={cn(homeCard, homeCardPad)}>
          <p className={homeKicker}>Lifetime</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Link href="/admin/users" className="min-w-0">
              <p className="text-[10px] text-neutral-400">Users</p>
              <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                {data.totalUsers.toLocaleString()}
              </p>
            </Link>
            <Link href="/admin/stores" className="min-w-0">
              <p className="text-[10px] text-neutral-400">Stores</p>
              <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                {data.totalStores.toLocaleString()}
              </p>
            </Link>
            <Link href="/admin/stores" className="min-w-0">
              <p className="text-[10px] text-neutral-400">Live</p>
              <p className="text-[14px] font-semibold tabular-nums tracking-tight">
                {data.liveStores.toLocaleString()}
              </p>
            </Link>
          </div>
          <p className={cn("mt-2", homeSubtitle)}>
            {data.activeProducts.toLocaleString()} live products ·{" "}
            {data.realOrders} real orders ·{" "}
            {Math.round(data.totalRevenue).toLocaleString()} MAD GMV
          </p>
        </div>
      </section>

      {/* ATTENTION CENTER */}
      <section aria-label="Needs attention">
        <div className="mb-2">
          <h2 className={homeTitle}>Needs attention</h2>
          <p className={homeSubtitle}>
            Prioritized by urgency, impact, and merchant risk · deterministic
            scores
          </p>
        </div>
        {attention.length === 0 ? (
          <div
            className={cn(
              homeCard,
              homeCardPad,
              "text-[13px] text-neutral-500"
            )}
          >
            No critical blockers — platform pulse is clear.
          </div>
        ) : (
          <ul className="space-y-2">
            {attention.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group block rounded-[12px] border border-black/[0.06] bg-white px-3 py-3 transition-colors hover:border-black/[0.1] hover:bg-[#FAFAFA] dark:border-white/10 dark:bg-[#121212] dark:hover:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <p className="w-12 shrink-0 text-[22px] font-semibold tabular-nums tracking-tight text-neutral-900 dark:text-white">
                      {item.count}
                    </p>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]",
                            item.tier === "high"
                              ? "bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300"
                              : item.tier === "medium"
                                ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                                : item.tier === "opportunity"
                                  ? "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300"
                                  : "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
                          )}
                        >
                          {item.tierLabel}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          score {item.priorityScore} · {item.priorityReason}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] font-medium text-neutral-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                        Why
                      </p>
                      <p className={homeSubtitle}>{item.why ?? item.reason}</p>
                      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                        Impact
                      </p>
                      <p className={homeSubtitle}>{item.impact}</p>
                      <p className="mt-2 text-[12px] font-medium text-[#007AFF]">
                        {item.cta} →
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ACTIVATION / FIRST SALE */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className={cn(homeCard, homeCardPad)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className={homeTitle}>Merchant activation</h2>
              <p className={homeSubtitle}>
                Mutually exclusive stages · {funnel.totalStores} stores
              </p>
            </div>
            <Link href="/admin/activation" className={homeLinkQuiet}>
              Full board →
            </Link>
          </div>

          <div className="mt-4 space-y-1">
            {funnelStages.map((stage, index) => {
              const pct = Math.round((stage.count / total) * 100);
              return (
                <div key={stage.key}>
                  {index > 0 ? (
                    <div className="flex justify-center py-0.5 text-[10px] text-neutral-300 dark:text-neutral-600">
                      ↓
                    </div>
                  ) : null}
                  <Link
                    href={stage.href}
                    className="block rounded-lg px-2 py-1.5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <p className="text-[12px] font-medium text-neutral-800 dark:text-neutral-100">
                        {stage.label}
                      </p>
                      <p className="text-[12px] tabular-nums text-neutral-500">
                        {stage.count.toLocaleString()}
                        <span className="ml-1 text-neutral-400">· {pct}%</span>
                      </p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-neutral-900 dark:bg-white"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-black/[0.05] pt-3 dark:border-white/[0.06]">
            <div>
              <p className={homeKicker}>Empty → listed share</p>
              <p className="mt-1 text-[13px] font-semibold tabular-nums">
                {funnel.totalStores > 0
                  ? Math.round(
                      ((funnel.activeNoOrders + funnel.hasOrders) /
                        funnel.totalStores) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className={cn("mt-0.5", homeSubtitle)}>
                Stores with ≥1 live product
              </p>
            </div>
            <div>
              <p className={homeKicker}>Listed → first sale</p>
              <p className="mt-1 text-[13px] font-semibold tabular-nums">
                {funnel.activeNoOrders + funnel.hasOrders > 0
                  ? Math.round(
                      (funnel.hasOrders /
                        (funnel.activeNoOrders + funnel.hasOrders)) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className={cn("mt-0.5", homeSubtitle)}>
                Of listed stores that sold
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={cn(homeCard, homeCardPad)}>
            <h2 className={homeTitle}>First-sale opportunity</h2>
            <p className="mt-2 text-[22px] font-semibold tabular-nums tracking-tight text-neutral-900 dark:text-white">
              {data.firstSale?.count?.toLocaleString() ??
                funnel.activeNoOrders.toLocaleString()}
              <span className="ml-2 text-[12px] font-medium text-neutral-400">
                stores
              </span>
            </p>
            <p className={cn("mt-1", homeSubtitle)}>
              {data.activeProducts.toLocaleString()} live products across the
              platform · high-intent subset:{" "}
              {data.firstSale?.highIntentCount?.toLocaleString() ?? "—"}
            </p>
            {data.firstSale?.bottlenecks ? (
              <ul className="mt-3 space-y-1 text-[12px] text-neutral-600 dark:text-neutral-300">
                <li>
                  · {data.firstSale.bottlenecks.lowRecentActivity} cold /
                  low recent activity
                </li>
                <li>
                  · {data.firstSale.bottlenecks.singleProduct} with only 1 live
                  product
                </li>
                <li>
                  · {data.firstSale.bottlenecks.multiProductReady} with 3+ live
                  products ready
                </li>
              </ul>
            ) : null}
            <Link
              href="/admin/activation?stage=listed"
              className="mt-3 inline-flex text-[12px] font-medium text-[#007AFF]"
            >
              View first-sale targets →
            </Link>
          </div>

          <div className={cn(homeCard, homeCardPad)}>
            <div className="flex items-center justify-between gap-2">
              <h2 className={homeTitle}>Who should we help today?</h2>
              <Link
                href="/admin/activation?stage=empty&temp=hot"
                className={homeLinkQuiet}
              >
                All hot →
              </Link>
            </div>
            <p className={cn("mt-1 mb-3", homeSubtitle)}>
              HIGH intent = recent login + store + no products
            </p>
            {(data.helpToday ?? []).length === 0 ? (
              <p className={homeSubtitle}>No hot empty stores right now.</p>
            ) : (
              <ul className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {(data.helpToday ?? []).map((row) => (
                  <li
                    key={row.storeId}
                    className="flex items-center gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                        {row.ownerName || row.ownerEmail}
                      </p>
                      <p className="truncate text-[10px] text-neutral-400">
                        {row.storeName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                        row.intent === "HIGH"
                          ? "bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300"
                          : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                      )}
                    >
                      {row.intent}
                    </span>
                    <span className="w-8 text-right text-[11px] tabular-nums text-neutral-500">
                      {row.healthScore}
                    </span>
                    <Link
                      href={`/admin/stores/${row.storeId}`}
                      className="text-[11px] font-medium text-[#007AFF]"
                    >
                      Open →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* LIVE + REVENUE */}
      <section className="grid gap-4 xl:grid-cols-2">
        <div className={cn(homeCard, homeCardPad)}>
          <div className="flex items-center justify-between gap-2">
            <h2 className={homeTitle}>Live</h2>
            <Link href="/admin/activity" className={homeLinkQuiet}>
              Full stream →
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {LIVE_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setLiveFilter(f)}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize transition-colors",
                  liveFilter === f
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-black/[0.06] text-neutral-500 hover:bg-black/[0.02] dark:border-white/10"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <ul className="mt-3 space-y-2">
            {liveEvents.length === 0 ? (
              <li className={homeSubtitle}>No events in this filter.</li>
            ) : (
              liveEvents.slice(0, 6).map((event) => (
                <li key={event.id}>
                  <Link
                    href={event.href}
                    className="flex gap-2.5 rounded-md px-1 py-1 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#007AFF]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className={homeSubtitle}>{event.detail}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-neutral-400">
                      {formatRelative(event.createdAt)}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className={cn(homeCard, homeCardPad)}>
          <h2 className={homeTitle}>Revenue concentration</h2>
          {data.concentrationRisk?.message ? (
            <>
              <p className="mt-2 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
                {data.concentrationRisk.message}
              </p>
              {data.concentrationRisk.why ? (
                <p className={cn("mt-2", homeSubtitle)}>
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    Risk:{" "}
                  </span>
                  {data.concentrationRisk.why}
                </p>
              ) : null}
              {data.concentrationRisk.recommended ? (
                <p className={cn("mt-1", homeSubtitle)}>
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    Recommended:{" "}
                  </span>
                  {data.concentrationRisk.recommended}
                </p>
              ) : null}
            </>
          ) : (
            <p className={cn("mt-2", homeSubtitle)}>
              Not enough real GMV yet to measure concentration.
            </p>
          )}
          <ul className="mt-3 space-y-1.5">
            {data.concentration.slice(0, 4).map((row) => (
              <li key={row.id} className="flex items-center gap-2 text-[12px]">
                <Link
                  href={`/admin/stores/${row.id}`}
                  className="min-w-0 flex-1 truncate font-medium text-neutral-800 hover:underline dark:text-neutral-100"
                >
                  {row.name}
                </Link>
                <span className="tabular-nums text-neutral-500">
                  {row.sharePct}%
                </span>
                <span className="w-16 text-right tabular-nums text-neutral-400">
                  {Math.round(row.gmv).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/analytics?range=30"
            className="mt-3 inline-flex text-[12px] font-medium text-[#007AFF]"
          >
            Open intelligence →
          </Link>
        </div>
      </section>

      {/* COMPACT FEEDS */}
      <section className="grid gap-3 lg:grid-cols-3">
        <div className={cn(homeCard, homeCardPad)}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className={homeTitle}>Recent orders</h2>
            <Link href="/admin/payments" className={homeLinkQuiet}>
              View all →
            </Link>
          </div>
          <ul className="space-y-2">
            {data.recentOrders
              .filter((o) => !o.isTest)
              .slice(0, 6)
              .map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="block rounded-md px-0.5 py-0.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] font-medium">
                        {order.orderNumber}
                      </p>
                      <p className="shrink-0 text-[11px] tabular-nums">
                        {Math.round(order.total).toLocaleString()}
                      </p>
                    </div>
                    <p className={homeSubtitle}>
                      {order.store.name} · {order.status} ·{" "}
                      {formatRelative(order.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div className={cn(homeCard, homeCardPad)}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className={homeTitle}>New merchants</h2>
            <Link href="/admin/users" className={homeLinkQuiet}>
              View all →
            </Link>
          </div>
          <ul className="space-y-2">
            {data.recentUsers.slice(0, 6).map((user) => (
              <li key={user.id}>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="block rounded-md px-0.5 py-0.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <p className="truncate text-[12px] font-medium">
                    {user.name || user.email}
                  </p>
                  <p className={homeSubtitle}>
                    {user._count.stores} store
                    {user._count.stores === 1 ? "" : "s"} · {user.status} ·{" "}
                    {formatRelative(user.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={cn(homeCard, homeCardPad)}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className={homeTitle}>Support</h2>
            <Link href="/admin/messages" className={homeLinkQuiet}>
              View all →
            </Link>
          </div>
          <ul className="space-y-2">
            {data.recentMessages.slice(0, 6).map((msg) => (
              <li key={msg.id}>
                <Link
                  href="/admin/messages"
                  className="block rounded-md px-0.5 py-0.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <p className="truncate text-[12px] font-medium">{msg.name}</p>
                  <p className={homeSubtitle}>
                    {msg.topic} · {msg.status} ·{" "}
                    {formatRelative(msg.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
