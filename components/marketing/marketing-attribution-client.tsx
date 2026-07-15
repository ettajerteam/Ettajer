"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Link2, BarChart3, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarketingSectionNav } from "@/components/marketing/marketing-section-nav";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import { formatCurrency } from "@/lib/utils";
import { buildTrackedUrl } from "@/lib/marketing-attribution-stats";
import type { AttributionStats } from "@/lib/marketing-attribution-stats";

interface MarketingAttributionClientProps {
  stats: AttributionStats;
  currency: string;
  storeUrl: string;
}

export function MarketingAttributionClient({
  stats,
  currency,
  storeUrl,
}: MarketingAttributionClientProps) {
  const [utmSource, setUtmSource] = useState("instagram");
  const [utmMedium, setUtmMedium] = useState("social");
  const [utmCampaign, setUtmCampaign] = useState("summer_sale");

  const trackedUrl = useMemo(
    () =>
      buildTrackedUrl(storeUrl, {
        utmSource,
        utmMedium,
        utmCampaign,
      }),
    [storeUrl, utmSource, utmMedium, utmCampaign]
  );

  const attributionRate =
    stats.totalOrders > 0
      ? Math.round((stats.attributedOrders / stats.totalOrders) * 100)
      : 0;

  const statCards = [
    { label: "Attributed orders", value: stats.attributedOrders.toString(), icon: Target },
    { label: "Attributed revenue", value: formatCurrency(stats.attributedRevenue, currency), icon: TrendingUp },
    { label: "Attribution rate", value: `${attributionRate}%`, icon: BarChart3 },
    { label: "Top source", value: stats.topSources[0]?.source ?? "—", icon: Link2 },
  ];

  async function copyUrl() {
    await navigator.clipboard.writeText(trackedUrl);
    toast.success("Tracked link copied");
  }

  return (
    <div className="space-y-4">
      <MarketingSectionNav />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={dashboardCard}>
              <div className={`${dashboardCardPad} flex items-center gap-3`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10">
                  <Icon className="h-4 w-4 text-[#007AFF]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold tracking-tight">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={dashboardCard}>
          <div className={`${dashboardCardPad} border-b border-border/70`}>
            <h3 className="text-base font-semibold tracking-[-0.02em]">UTM link builder</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate tracked links for Instagram bio, TikTok, email, or ads.
            </p>
          </div>
          <div className={`${dashboardCardPad} space-y-3`}>
            <div>
              <Label>Source</Label>
              <Input value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder="instagram" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Medium</Label>
                <Input value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder="social" />
              </div>
              <div>
                <Label>Campaign</Label>
                <Input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="summer_sale" />
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Tracked URL</p>
              <p className="text-xs font-mono break-all text-foreground/90">{trackedUrl}</p>
            </div>
            <Button onClick={copyUrl} className="bg-[#007AFF] hover:bg-[#007AFF]/90">
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </Button>
          </div>
        </section>

        <section className={dashboardCard}>
          <div className={`${dashboardCardPad} border-b border-border/70`}>
            <h3 className="text-base font-semibold tracking-[-0.02em]">Top traffic sources</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Orders with UTM parameters captured at checkout.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Medium</th>
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                      No attributed orders yet. Share tracked links to start measuring.
                    </td>
                  </tr>
                ) : (
                  stats.topSources.map((row) => (
                    <tr key={`${row.source}-${row.medium}-${row.campaign}`} className="border-b last:border-0">
                      <td className="px-5 py-3 font-medium">{row.source}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.medium ?? "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.campaign ?? "—"}</td>
                      <td className="px-5 py-3">{row.orders}</td>
                      <td className="px-5 py-3 font-medium">{formatCurrency(row.revenue, currency)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
