import Link from "next/link";
import type { PlatformAnalyticsData } from "@/lib/admin/platform-stats";
import type { AdminAnalyticsRange } from "@/lib/admin/platform-intelligence";
import {
  AdminPageHeader,
  AdminSectionTitle,
  AdminStatCard,
  AdminTableShell,
  adminPage,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
} from "@/components/admin/admin-ui";
import { AdminTrendChart } from "@/components/admin/admin-trend-chart";
import { AdminInsightsPanel } from "@/components/admin/admin-insights-panel";
import { AdminActivationFunnel } from "@/components/admin/admin-activation-funnel";
import { AdminShareBars } from "@/components/admin/admin-share-bars";
import {
  homeKicker,
  homeStatCell,
  homeSubtitle,
} from "@/components/dashboard/home/home-ui";
import { cn } from "@/lib/utils";

const RANGES: { value: AdminAnalyticsRange; label: string }[] = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

function ChangeHint({ change }: { change: number }) {
  if (change === 0) {
    return (
      <span className="text-[12px] font-semibold text-neutral-400">flat</span>
    );
  }
  return (
    <span
      className={cn(
        "text-[12px] font-semibold",
        change > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      )}
    >
      {change > 0 ? "+" : ""}
      {change}%
    </span>
  );
}

interface AdminIntelligenceDashboardProps {
  data: PlatformAnalyticsData;
}

export function AdminIntelligenceDashboard({
  data,
}: AdminIntelligenceDashboardProps) {
  const { totals, signals, series, insights, funnel } = data;

  return (
    <div className={adminPage}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          title="Platform intelligence"
          description="Real GMV, merchant growth, and activation — not vanity traffic. Test checkouts stay out of the revenue curve."
        />
        <div className="inline-flex rounded-lg border border-black/[0.06] bg-[#F5F5F7]/80 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
          {RANGES.map((item) => (
            <Link
              key={item.value}
              href={`/admin/analytics?range=${item.value}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                data.range === item.value
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={`Real GMV (${data.range}d)`}
          value={`${Math.round(totals.revenue).toLocaleString()} MAD`}
          accent="emerald"
          hint={`${totals.orders.toLocaleString()} real orders · ${totals.revenueChange > 0 ? "+" : ""}${totals.revenueChange}% vs prior`}
        />
        <AdminStatCard
          label={`Orders (${data.range}d)`}
          value={totals.orders}
          hint={`Prior ${data.range}d: ${totals.ordersPrev.toLocaleString()} · ${totals.ordersChange > 0 ? "+" : ""}${totals.ordersChange}%`}
        />
        <AdminStatCard
          label={`Signups (${data.range}d)`}
          value={totals.signups}
          hint={`Prior ${data.range}d: ${totals.signupsPrev.toLocaleString()} · ${totals.signupsChange > 0 ? "+" : ""}${totals.signupsChange}%`}
        />
        <AdminStatCard
          label={`AOV (${data.range}d)`}
          value={`${Math.round(totals.aov).toLocaleString()} MAD`}
          hint={`${totals.customers.toLocaleString()} customers lifetime · ${totals.aovChange > 0 ? "+" : ""}${totals.aovChange}%`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className={homeStatCell}>
          <p className={homeKicker}>GMV vs prior</p>
          <p className="mt-1">
            <ChangeHint change={totals.revenueChange} />
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            {Math.round(totals.revenuePrev).toLocaleString()} MAD prior
          </p>
        </div>
        <div className={homeStatCell}>
          <p className={homeKicker}>Orders vs prior</p>
          <p className="mt-1">
            <ChangeHint change={totals.ordersChange} />
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            {totals.ordersPrev.toLocaleString()} prior
          </p>
        </div>
        <div className={homeStatCell}>
          <p className={homeKicker}>Signups vs prior</p>
          <p className="mt-1">
            <ChangeHint change={totals.signupsChange} />
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            {totals.signupsPrev.toLocaleString()} prior
          </p>
        </div>
        <div className={homeStatCell}>
          <p className={homeKicker}>Test share</p>
          <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {totals.testSharePct}%
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            {totals.testOrders.toLocaleString()} test ·{" "}
            {totals.realOrders.toLocaleString()} real
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminTrendChart series={series} range={data.range} />
        <AdminInsightsPanel insights={insights} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminShareBars
          title={`Top stores (${data.range}d)`}
          subtitle="Real GMV share inside the selected window."
          rows={data.topStoresInRange}
          hrefAll="/admin/stores"
        />
        <AdminActivationFunnel
          funnel={funnel}
          hotEmptyCount={signals.hotEmptyCount}
          loggedInEmpty7d={signals.loggedInEmpty7d}
        />
      </div>

      <div className="space-y-3">
          <AdminSectionTitle title="Real orders by status (lifetime)" />
          <AdminTableShell>
            <table className="w-full min-w-[480px] text-left text-[12px]">
              <thead className={adminThead}>
                <tr>
                  <th className={adminTh}>Status</th>
                  <th className={adminTh}>Count</th>
                  <th className={adminTh}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.ordersByStatus.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-neutral-400">
                      No real orders yet
                    </td>
                  </tr>
                ) : (
                  data.ordersByStatus.map((row) => (
                    <tr key={row.status} className={adminTr}>
                      <td className={cn(adminTd, "capitalize")}>{row.status}</td>
                      <td className={cn(adminTd, "tabular-nums")}>{row.count}</td>
                      <td className={cn(adminTd, "tabular-nums")}>
                        {row.revenue.toLocaleString()} MAD
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AdminTableShell>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className={homeStatCell}>
              <p className={homeKicker}>Stores</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                {totals.stores.toLocaleString()}
              </p>
            </div>
            <div className={homeStatCell}>
              <p className={homeKicker}>Products</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                {totals.products.toLocaleString()}
              </p>
            </div>
            <div className={homeStatCell}>
              <p className={homeKicker}>Open support</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                {signals.openSupport}
              </p>
            </div>
            <div className={homeStatCell}>
              <p className={homeKicker}>Failed logins 24h</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                {signals.failedLogins24h}
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}
