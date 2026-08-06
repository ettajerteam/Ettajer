"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CampaignRecipientRow,
  CampaignRow,
  CampaignTimelineItem,
} from "@/lib/email-marketing/campaign-types";
import { formatCampaignPresentationLabel } from "@/lib/email-marketing/campaign-types";
import { formatUtcInTimeZone } from "@/lib/email-marketing/campaign-timezone";

interface EmailCampaignDetailClientProps {
  campaignId: string;
  initialCampaign: CampaignRow;
  initialTimeline: CampaignTimelineItem[];
  initialPresentationLabel: string;
  initialRecipientStatusCounts: Record<string, number>;
}

function timelineDot(type: CampaignTimelineItem["type"]) {
  switch (type) {
    case "completed":
      return "bg-emerald-500";
    case "failed":
      return "bg-red-500";
    case "sending":
      return "bg-blue-500";
    case "scheduled":
      return "bg-violet-500";
    case "cancelled":
      return "bg-neutral-400";
    case "archived":
      return "bg-neutral-300";
    case "event":
      return "bg-neutral-900 dark:bg-white";
    default:
      return "bg-amber-500";
  }
}

export function EmailCampaignDetailClient({
  campaignId,
  initialCampaign,
  initialTimeline,
  initialPresentationLabel,
  initialRecipientStatusCounts,
}: EmailCampaignDetailClientProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(initialCampaign);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [label, setLabel] = useState(initialPresentationLabel);
  const [recipientStatusCounts, setRecipientStatusCounts] = useState(
    initialRecipientStatusCounts
  );
  const [recipients, setRecipients] = useState<CampaignRecipientRow[]>([]);
  const [recipientTotal, setRecipientTotal] = useState(0);
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientTotalPages, setRecipientTotalPages] = useState(1);
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [recipientQ, setRecipientQ] = useState("");
  const [recipientQuery, setRecipientQuery] = useState("");
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function refreshAttribution() {
    setBusy("attribute");
    try {
      const res = await fetch("/api/email/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "attribute_campaign",
          campaignId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Attribution failed"
        );
      }
      const attr = data.attribution as {
        revenue: number;
        orders: number;
        conversionRate: number;
        averageOrderValue: number;
        revenuePerRecipient: number;
        revenuePerEmail: number;
        roi: number;
        attributedAt: string | null;
      };
      setCampaign((prev) => ({
        ...prev,
        attributedRevenue: attr.revenue,
        attributedOrders: attr.orders,
        attributedAt: attr.attributedAt,
        conversionRate: attr.conversionRate,
        averageOrderValue: attr.averageOrderValue,
        revenuePerRecipient: attr.revenuePerRecipient,
        revenuePerEmail: attr.revenuePerEmail,
        roi: attr.roi,
      }));
      toast.success("Revenue attribution updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Attribution failed"
      );
    } finally {
      setBusy(null);
    }
  }

  const loadRecipients = useCallback(
    async (opts?: { status?: string; q?: string; page?: number }) => {
      const status = opts?.status ?? recipientFilter;
      const q = opts?.q ?? recipientQ;
      const page = opts?.page ?? recipientPage;
      setLoadingRecipients(true);
      try {
        const params = new URLSearchParams({
          status,
          page: String(page),
          pageSize: "25",
        });
        if (q) params.set("q", q);
        const res = await fetch(
          `/api/email/campaigns/${campaignId}/recipients?${params}`
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.message === "string" ? data.message : "Failed to load"
          );
        }
        setRecipients(data.recipients as CampaignRecipientRow[]);
        setRecipientTotal(data.total as number);
        setRecipientPage(data.page as number);
        setRecipientTotalPages(data.totalPages as number);
        setRecipientFilter(status);
        setRecipientQ(q);
        if (data.statusCounts) {
          setRecipientStatusCounts(data.statusCounts as Record<string, number>);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load");
      } finally {
        setLoadingRecipients(false);
      }
    },
    [campaignId, recipientFilter, recipientQ, recipientPage]
  );

  useEffect(() => {
    void loadRecipients({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [campaignId]);

  async function refreshDetail() {
    const res = await fetch(`/api/email/campaigns/${campaignId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    setCampaign(data.campaign as CampaignRow);
    setTimeline(data.timeline as CampaignTimelineItem[]);
    setLabel(data.presentationLabel as string);
    if (data.recipientStatusCounts) {
      setRecipientStatusCounts(
        data.recipientStatusCounts as Record<string, number>
      );
    }
  }

  async function runAction(action: "duplicate" | "archive") {
    setBusy(action);
    try {
      const res = await fetch(`/api/email/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Action failed"
        );
      }
      if (action === "duplicate" && data.campaign?.id) {
        toast.success("Duplicated as draft");
        router.push(
          `/dashboard/marketing/email/campaigns/${data.campaign.id}`
        );
        return;
      }
      toast.success("Archived");
      await refreshDetail();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this campaign permanently?")) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/email/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Delete failed"
        );
      }
      toast.success("Campaign deleted");
      router.push("/dashboard/marketing/email/campaigns");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  const stats = [
    { label: "Recipients", value: campaign.recipientCount },
    { label: "Sent", value: campaign.sentCount },
    { label: "Delivered", value: campaign.deliveredCount },
    { label: "Opened", value: campaign.openedCount },
    { label: "Clicked", value: campaign.clickedCount },
    { label: "Bounced", value: campaign.bouncedCount },
    { label: "Failed", value: campaign.failedCount },
    { label: "Open rate", value: `${campaign.openRate}%` },
    { label: "CTR", value: `${campaign.clickRate}%` },
    { label: "Delivery", value: `${campaign.deliveryRate}%` },
    {
      label: "Revenue",
      value: campaign.attributedRevenue.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      }),
    },
    { label: "Orders", value: campaign.attributedOrders },
    { label: "Conv. rate", value: `${campaign.conversionRate}%` },
    {
      label: "AOV",
      value: campaign.averageOrderValue.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      }),
    },
    {
      label: "Rev / recipient",
      value: campaign.revenuePerRecipient.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }),
    },
    {
      label: "Rev / email",
      value: campaign.revenuePerEmail.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }),
    },
    { label: "ROI", value: `${campaign.roi}×` },
  ];

  const recipientPills = [
    { id: "all", label: "All", count: recipientTotal },
    ...Object.entries(recipientStatusCounts).map(([id, count]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    })),
  ];

  const canArchive =
    campaign.status === "sent" || campaign.status === "cancelled";
  const canDelete = ["draft", "cancelled", "archived"].includes(
    campaign.status
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/marketing/email/campaigns"
            className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            ← Campaigns
          </Link>
          <p className="mt-3 text-[11px] font-medium text-neutral-400">
            {label ||
              formatCampaignPresentationLabel(campaign.presentationStatus)}
          </p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.04em] text-neutral-950 dark:text-white">
            {campaign.name || campaign.subject}
          </h1>
          <p className="mt-1 text-[13px] text-neutral-400">
            {campaign.subject}
            {campaign.scheduledAt
              ? ` · Scheduled ${formatUtcInTimeZone(
                  campaign.scheduledAt,
                  campaign.timezone || "UTC"
                )}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 text-[12px] font-medium text-neutral-400 hover:bg-transparent hover:text-neutral-900 dark:hover:text-white"
            loading={busy === "attribute"}
            onClick={() => void refreshAttribution()}
          >
            Refresh revenue
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 text-[12px] font-medium text-neutral-400 hover:bg-transparent hover:text-neutral-900 dark:hover:text-white"
            loading={busy === "duplicate"}
            onClick={() => void runAction("duplicate")}
          >
            Duplicate
          </Button>
          <a
            href={`/api/email/campaigns/${campaignId}/recipients?format=csv`}
            download
            className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            Export CSV
          </a>
          {canArchive ? (
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 text-[12px] font-medium text-neutral-400 hover:bg-transparent hover:text-neutral-900 dark:hover:text-white"
              loading={busy === "archive"}
              onClick={() => void runAction("archive")}
            >
              Archive
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 text-[12px] font-medium text-red-600 hover:bg-transparent hover:text-red-700"
              loading={busy === "delete"}
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-neutral-100 py-6 sm:grid-cols-4 dark:border-white/10">
        {stats.slice(0, 8).map((s) => (
          <div key={s.label}>
            <p className="text-[11px] text-neutral-400">{s.label}</p>
            <p className="mt-1 text-[18px] font-semibold tabular-nums tracking-[-0.03em] text-neutral-950 dark:text-white">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {stats.length > 8 ? (
        <section className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          {stats.slice(8).map((s) => (
            <div key={s.label}>
              <p className="text-[11px] text-neutral-400">{s.label}</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-neutral-950 dark:text-white">
                {s.value}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <section>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          Timeline
        </h2>
        <ol className="mt-4 space-y-4 border-l border-neutral-100 pl-4 dark:border-white/10">
          {timeline.map((item) => (
            <li key={item.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#0a0a0a]",
                  timelineDot(item.type)
                )}
              />
              <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
                {item.label}
              </p>
              {item.detail ? (
                <p className="text-[12px] text-neutral-400">{item.detail}</p>
              ) : null}
              <p className="mt-0.5 text-[11px] text-neutral-400">
                {new Date(item.at).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
        <div className="space-y-3 border-b border-neutral-100 px-4 py-4 dark:border-white/10">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              Recipients
            </h2>
            <p className="mt-1 text-[12px] text-neutral-400">
              {recipientTotal} job{recipientTotal === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                value={recipientQuery}
                onChange={(e) => setRecipientQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void loadRecipients({
                      q: recipientQuery.trim(),
                      page: 1,
                    });
                  }
                }}
                placeholder="Search email…"
                className="h-9 rounded-full border-neutral-200 bg-neutral-50 pl-9 text-[13px] dark:border-white/10 dark:bg-white/[0.04]"
              />
            </div>
            <button
              type="button"
              disabled={loadingRecipients}
              onClick={() =>
                void loadRecipients({ q: recipientQuery.trim(), page: 1 })
              }
              className="inline-flex h-9 items-center rounded-full bg-neutral-950 px-4 text-[12px] font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950"
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {recipientPills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() =>
                  void loadRecipients({ status: pill.id, page: 1 })
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                  recipientFilter === pill.id
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                )}
              >
                {pill.label}
                <span className="ml-1 tabular-nums opacity-50">
                  {pill.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {recipients.length === 0 ? (
          <p className="px-4 py-10 text-center text-[12px] text-neutral-400">
            No recipients for this filter.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-white/10">
            {recipients.map((row) => (
              <li key={row.id} className="px-4 py-3">
                <p className="truncate text-[13px] font-medium text-neutral-950 dark:text-white">
                  {row.email}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  {row.status}
                  {" · "}
                  attempt {row.attempts}/{row.maxAttempts}
                  {row.sentAt
                    ? ` · sent ${new Date(row.sentAt).toLocaleString()}`
                    : ""}
                </p>
                {row.lastError ? (
                  <p className="mt-0.5 truncate text-[11px] text-red-600">
                    {row.lastError}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {recipientTotalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-white/10">
            <p className="text-[11px] text-neutral-400">
              Page {recipientPage} of {recipientTotalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={recipientPage <= 1 || loadingRecipients}
                onClick={() =>
                  void loadRecipients({ page: recipientPage - 1 })
                }
                className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 disabled:opacity-40 dark:hover:text-white"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  recipientPage >= recipientTotalPages || loadingRecipients
                }
                onClick={() =>
                  void loadRecipients({ page: recipientPage + 1 })
                }
                className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 disabled:opacity-40 dark:hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
