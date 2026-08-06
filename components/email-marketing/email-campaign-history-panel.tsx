"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CampaignHistoryFilter,
  CampaignRow,
  CampaignStatusCounts,
} from "@/lib/email-marketing/campaign-types";
import { formatCampaignPresentationLabel } from "@/lib/email-marketing/campaign-types";
import { formatUtcInTimeZone } from "@/lib/email-marketing/campaign-timezone";

interface EmailCampaignHistoryPanelProps {
  initialCampaigns: CampaignRow[];
  initialCounts: CampaignStatusCounts;
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
  onEditDraft?: (campaign: CampaignRow) => void;
}

export function EmailCampaignHistoryPanel({
  initialCampaigns,
  initialCounts,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
  onEditDraft,
}: EmailCampaignHistoryPanelProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [counts, setCounts] = useState(initialCounts);
  const [filter, setFilter] = useState<CampaignHistoryFilter>("all");
  const [q, setQ] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setCampaigns(initialCampaigns);
    setCounts(initialCounts);
    setTotal(initialTotal);
    setPage(initialPage);
    setTotalPages(initialTotalPages);
  }, [
    initialCampaigns,
    initialCounts,
    initialTotal,
    initialPage,
    initialTotalPages,
  ]);

  const refresh = useCallback(
    async (opts?: {
      filter?: CampaignHistoryFilter;
      q?: string;
      page?: number;
    }) => {
      const nextFilter = opts?.filter ?? filter;
      const nextQ = opts?.q ?? q;
      const nextPage = opts?.page ?? page;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          status: nextFilter,
          page: String(nextPage),
          pageSize: String(pageSize),
        });
        if (nextQ) params.set("q", nextQ);
        const res = await fetch(`/api/email/campaigns?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.message === "string" ? data.message : "Failed to load"
          );
        }
        setCampaigns(data.campaigns as CampaignRow[]);
        setCounts(data.counts as CampaignStatusCounts);
        setTotal(data.total as number);
        setTotalPages(data.totalPages as number);
        setPage(data.page as number);
        setFilter(nextFilter);
        setQ(nextQ);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [filter, q, page, pageSize]
  );

  const pills: { id: CampaignHistoryFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.total - counts.cancelled },
    { id: "draft", label: "Draft", count: counts.draft },
    { id: "scheduled", label: "Scheduled", count: counts.scheduled },
    { id: "sending", label: "Sending", count: counts.sending },
    { id: "completed", label: "Completed", count: counts.sent },
    { id: "failed", label: "Failed", count: counts.failed },
    { id: "archived", label: "Archived", count: counts.archived },
  ];

  async function runAction(
    id: string,
    action: "duplicate" | "archive" | "unschedule" | "cancel",
    successMessage: string
  ) {
    setBusy(`${action}:${id}`);
    try {
      const res = await fetch(`/api/email/campaigns/${id}`, {
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
      toast.success(successMessage);
      await refresh({ page: 1 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this campaign permanently?")) return;
    setBusy(`delete:${id}`);
    try {
      const res = await fetch(`/api/email/campaigns/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Delete failed"
        );
      }
      toast.success("Campaign deleted");
      await refresh({ page: 1 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            History
          </h2>
          <p className="mt-1 text-[13px] text-neutral-400">
            Search, filter, and manage past sends
          </p>
        </div>
        <Link
          href="/dashboard/marketing/email/queue"
          className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        >
          Sending status
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void refresh({ q: queryInput.trim(), page: 1 });
              }
            }}
            placeholder="Search subject or name…"
            className="h-9 rounded-full border-neutral-200 bg-neutral-50 pl-9 text-[13px] dark:border-white/10 dark:bg-white/[0.04]"
          />
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void refresh({ q: queryInput.trim(), page: 1 })}
          className="inline-flex h-9 items-center rounded-full bg-neutral-950 px-4 text-[12px] font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950"
        >
          Search
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => void refresh({ filter: pill.id, page: 1 })}
            className={cn(
              "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              filter === pill.id
                ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            )}
          >
            {pill.label}
            <span className="ml-1 tabular-nums opacity-50">{pill.count}</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
        {campaigns.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
              No campaigns here
            </p>
            <p className="mt-1 text-[12px] text-neutral-400">
              Save a draft, schedule a send, or broadcast now.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-white/10">
            {campaigns.map((campaign) => {
              const presentation = campaign.presentationStatus;
              const canEdit =
                campaign.status === "draft" || campaign.status === "scheduled";
              const canCancel =
                campaign.status === "scheduled" ||
                campaign.status === "sending";
              const canArchive =
                campaign.status === "sent" || campaign.status === "cancelled";
              const canDelete = ["draft", "cancelled", "archived"].includes(
                campaign.status
              );
              return (
                <li
                  key={campaign.id}
                  className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-neutral-400">
                      {formatCampaignPresentationLabel(presentation)}
                    </p>
                    <Link
                      href={`/dashboard/marketing/email/campaigns/${campaign.id}`}
                      className="mt-0.5 block truncate text-[13px] font-medium text-neutral-950 hover:opacity-70 dark:text-white"
                    >
                      {campaign.name || campaign.subject}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-neutral-400">
                      {campaign.status === "scheduled" && campaign.scheduledAt
                        ? `Sends ${formatUtcInTimeZone(
                            campaign.scheduledAt,
                            campaign.timezone || "UTC"
                          )}`
                        : `${campaign.deliveredCount || campaign.sentCount}/${campaign.recipientCount} delivered`}
                      {campaign.failedCount > 0
                        ? ` · ${campaign.failedCount} failed`
                        : ""}
                      {" · "}
                      {campaign.openRate}% open
                      {" · "}
                      {new Date(campaign.createdAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" }
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link
                      href={`/dashboard/marketing/email/campaigns/${campaign.id}`}
                      className="text-[12px] font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                    >
                      Open
                    </Link>
                    {canEdit && onEditDraft ? (
                      <button
                        type="button"
                        className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        onClick={() => onEditDraft(campaign)}
                      >
                        Edit
                      </button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto p-0 text-[12px] font-medium text-neutral-400 hover:bg-transparent hover:text-neutral-900 dark:hover:text-white"
                      loading={busy === `duplicate:${campaign.id}`}
                      onClick={() =>
                        void runAction(
                          campaign.id,
                          "duplicate",
                          "Duplicated as draft"
                        )
                      }
                    >
                      Duplicate
                    </Button>
                    {canCancel ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto p-0 text-[12px] font-medium text-neutral-400 hover:bg-transparent hover:text-neutral-900 dark:hover:text-white"
                        loading={busy === `cancel:${campaign.id}`}
                        onClick={() =>
                          void runAction(
                            campaign.id,
                            campaign.status === "scheduled"
                              ? "unschedule"
                              : "cancel",
                            campaign.status === "scheduled"
                              ? "Moved to draft"
                              : "Cancelled"
                          )
                        }
                      >
                        {campaign.status === "scheduled"
                          ? "Unschedule"
                          : "Cancel"}
                      </Button>
                    ) : null}
                    {canArchive ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto p-0 text-[12px] font-medium text-neutral-400 hover:bg-transparent hover:text-neutral-900 dark:hover:text-white"
                        loading={busy === `archive:${campaign.id}`}
                        onClick={() =>
                          void runAction(campaign.id, "archive", "Archived")
                        }
                      >
                        Archive
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto p-0 text-[12px] font-medium text-red-600 hover:bg-transparent hover:text-red-700"
                        loading={busy === `delete:${campaign.id}`}
                        onClick={() => void handleDelete(campaign.id)}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 || total > pageSize ? (
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-white/10">
            <p className="text-[11px] text-neutral-400">
              {total} campaign{total === 1 ? "" : "s"} · page {page} of{" "}
              {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => void refresh({ page: page - 1 })}
                className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 disabled:opacity-40 dark:hover:text-white"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => void refresh({ page: page + 1 })}
                className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 disabled:opacity-40 dark:hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
