"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmailAnalyticsCharts } from "@/components/email-marketing/email-analytics-charts";
import type {
  EmailAnalyticsDailyPoint,
  EmailAnalyticsSummary,
  EmailCampaignAnalyticsRow,
} from "@/lib/email-marketing/email-analytics-types";

interface EmailAnalyticsClientProps {
  initialSummary: EmailAnalyticsSummary;
  initialDaily: EmailAnalyticsDailyPoint[];
  initialCampaigns: EmailCampaignAnalyticsRow[];
  initialDays: number;
}

const RANGES = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
] as const;

function formatRate(value: number) {
  return `${value.toFixed(1)}%`;
}

export function EmailAnalyticsClient({
  initialSummary,
  initialDaily,
  initialCampaigns,
  initialDays,
}: EmailAnalyticsClientProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [daily, setDaily] = useState(initialDaily);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [days, setDays] = useState(initialDays);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialCampaigns[0]?.id ?? null,
  );

  useEffect(() => {
    setSummary(initialSummary);
    setDaily(initialDaily);
    setCampaigns(initialCampaigns);
    setDays(initialDays);
    setSelectedId(initialCampaigns[0]?.id ?? null);
  }, [initialSummary, initialDaily, initialCampaigns, initialDays]);

  async function refresh(nextDays: number = days) {
    setLoading(true);
    try {
      const res = await fetch(`/api/email/analytics?days=${nextDays}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to load",
        );
      }
      setSummary(data.summary as EmailAnalyticsSummary);
      setDaily(data.daily as EmailAnalyticsDailyPoint[]);
      setCampaigns(data.campaigns as EmailCampaignAnalyticsRow[]);
      setDays(nextDays);
      if (data.campaigns?.[0]?.id) {
        setSelectedId((prev) =>
          (data.campaigns as EmailCampaignAnalyticsRow[]).some(
            (c) => c.id === prev,
          )
            ? prev
            : data.campaigns[0].id,
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const selected =
    campaigns.find((c) => c.id === selectedId) ?? campaigns[0] ?? null;

  const kpis = [
    { label: "Sent", value: summary.sent.toLocaleString() },
    { label: "Open rate", value: formatRate(summary.openRate) },
    { label: "Click rate", value: formatRate(summary.clickRate) },
    { label: "Unsubscribes", value: summary.unsubscribed.toLocaleString() },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            Performance
          </h2>
          <p className="mt-1 text-[13px] text-neutral-400">
            Last {days} days
          </p>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              disabled={loading}
              onClick={() => void refresh(range.days)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                days === range.days
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-neutral-100 py-6 sm:grid-cols-4 dark:border-white/10">
        {kpis.map((kpi) => (
          <div key={kpi.label}>
            <p className="text-[11px] text-neutral-400">{kpi.label}</p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.04em] text-neutral-950 dark:text-white">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <EmailAnalyticsCharts daily={daily} />

      <section>
        <h3 className="mb-3 text-[13px] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-white">
          By campaign
        </h3>

        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-10 text-center dark:border-white/15">
            <p className="text-[13px] font-medium text-neutral-800 dark:text-white">
              No campaigns yet
            </p>
            <p className="mt-1 text-[12px] text-neutral-400">
              Send a campaign to see results here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
              <ul className="divide-y divide-neutral-100 dark:divide-white/10 lg:border-r lg:border-neutral-100 dark:lg:border-white/10">
                {campaigns.map((campaign) => {
                  const active = selected?.id === campaign.id;
                  return (
                    <li key={campaign.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(campaign.id)}
                        className={cn(
                          "w-full px-4 py-3 text-left transition-colors",
                          active
                            ? "bg-neutral-50 dark:bg-white/[0.04]"
                            : "hover:bg-neutral-50/80 dark:hover:bg-white/[0.03]",
                        )}
                      >
                        <p className="truncate text-[13px] font-medium text-neutral-950 dark:text-white">
                          {campaign.subject}
                        </p>
                        <p className="mt-0.5 text-[11px] text-neutral-400">
                          {formatRate(campaign.openRate)} open
                          {" · "}
                          {new Date(campaign.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {selected ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-4">
                  {[
                    { label: "Recipients", value: selected.recipients },
                    { label: "Delivered", value: selected.delivered },
                    { label: "Opened", value: selected.opened },
                    { label: "Clicked", value: selected.clicked },
                    { label: "Open rate", value: formatRate(selected.openRate) },
                    { label: "CTR", value: formatRate(selected.ctr) },
                  ].map((row) => (
                    <div key={row.label}>
                      <dt className="text-[11px] text-neutral-400">
                        {row.label}
                      </dt>
                      <dd className="mt-0.5 text-[15px] font-semibold tabular-nums tracking-[-0.02em] text-neutral-950 dark:text-white">
                        {typeof row.value === "number"
                          ? row.value.toLocaleString()
                          : row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
