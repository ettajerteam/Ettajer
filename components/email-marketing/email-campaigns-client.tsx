"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarClock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { EmailTemplateRow } from "@/lib/email-marketing/types";
import type {
  CampaignRow,
  CampaignStatusCounts,
} from "@/lib/email-marketing/campaign-types";
import { formatCampaignPresentationLabel } from "@/lib/email-marketing/campaign-types";
import {
  CAMPAIGN_TIMEZONES,
  defaultCampaignTimezone,
  utcToDatetimeLocalValue,
} from "@/lib/email-marketing/campaign-timezone";
import { EmailCampaignHistoryPanel } from "@/components/email-marketing/email-campaign-history-panel";

interface EmailCampaignsClientProps {
  templates: EmailTemplateRow[];
  activeCount: number;
  audienceStats: {
    total: number;
    active: number;
    unsubscribed: number;
    bounced: number;
    complained: number;
  };
  initialCampaigns: CampaignRow[];
  initialCounts: CampaignStatusCounts;
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
  segments: { id: string; name: string; cachedCount: number }[];
}

type SendMode = "now" | "schedule";

export function EmailCampaignsClient({
  templates,
  activeCount,
  audienceStats,
  initialCampaigns,
  initialCounts,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
  segments,
}: EmailCampaignsClientProps) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [counts, setCounts] = useState(initialCounts);
  const [historyTotal, setHistoryTotal] = useState(initialTotal);
  const [historyPage, setHistoryPage] = useState(initialPage);
  const [historyTotalPages, setHistoryTotalPages] = useState(initialTotalPages);
  const [historyKey, setHistoryKey] = useState(0);
  const [mode, setMode] = useState<SendMode>("now");
  const [timezone, setTimezone] = useState(defaultCampaignTimezone());
  const [localDatetime, setLocalDatetime] = useState("");
  const [segmentIds, setSegmentIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setCampaigns(initialCampaigns);
    setCounts(initialCounts);
    setHistoryTotal(initialTotal);
    setHistoryPage(initialPage);
    setHistoryTotalPages(initialTotalPages);
  }, [
    initialCampaigns,
    initialCounts,
    initialTotal,
    initialPage,
    initialTotalPages,
  ]);

  const editing = useMemo(
    () => campaigns.find((c) => c.id === editingId) ?? null,
    [campaigns, editingId]
  );

  useEffect(() => {
    if (!editing) return;
    if (editing.templateId) setSelectedId(editing.templateId);
    setSegmentIds(editing.segmentIds ?? []);
    if (editing.timezone) setTimezone(editing.timezone);
    if (editing.scheduledAt) {
      setMode("schedule");
      setLocalDatetime(
        utcToDatetimeLocalValue(
          editing.scheduledAt,
          editing.timezone || timezone
        )
      );
    }
  }, [editing, timezone]);

  async function refreshHistory() {
    const res = await fetch(
      "/api/email/campaigns?status=all&page=1&pageSize=20"
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof data.message === "string" ? data.message : "Failed to refresh"
      );
    }
    setCampaigns(data.campaigns as CampaignRow[]);
    setCounts(data.counts as CampaignStatusCounts);
    setHistoryTotal(data.total as number);
    setHistoryPage(data.page as number);
    setHistoryTotalPages(data.totalPages as number);
    setHistoryKey((k) => k + 1);
  }

  function contentBody(extra: Record<string, unknown> = {}) {
    return {
      emailTemplateId: selectedId,
      campaignId: editingId || undefined,
      segmentIds,
      ...extra,
    };
  }

  function toggleSegment(id: string) {
    setSegmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const targetedLabel =
    segmentIds.length === 0
      ? `${activeCount} active subscriber${activeCount === 1 ? "" : "s"}`
      : `${segmentIds.length} segment${segmentIds.length === 1 ? "" : "s"} selected`;

  async function handleSaveDraft() {
    if (!selectedId) {
      toast.error("Add a template first");
      return;
    }
    setBusy("draft");
    try {
      const res = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentBody({ action: "draft" })),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save draft");
      toast.success("Draft saved");
      setEditingId((data.campaign as CampaignRow).id);
      await refreshHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleSendOrSchedule() {
    if (!selectedId) {
      toast.error("Add a template first");
      return;
    }
    if (activeCount <= 0) {
      toast.error("No active subscribers");
      return;
    }
    if (mode === "schedule") {
      if (!localDatetime) {
        toast.error("Pick a date and time");
        return;
      }
      setBusy("schedule");
      try {
        const endpoint = editingId
          ? `/api/email/campaigns/${editingId}`
          : "/api/email/campaigns";
        const res = await fetch(endpoint, {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingId
              ? {
                  action: "schedule",
                  emailTemplateId: selectedId,
                  timezone,
                  localDatetime,
                  segmentIds,
                }
              : contentBody({
                  action: "schedule",
                  timezone,
                  localDatetime,
                })
          ),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Schedule failed");
        toast.success("Campaign scheduled");
        setEditingId((data.campaign as CampaignRow).id);
        await refreshHistory();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed");
      } finally {
        setBusy(null);
      }
      return;
    }

    setBusy("send");
    try {
      const endpoint = editingId
        ? `/api/email/campaigns/${editingId}`
        : "/api/email/campaigns";
      const res = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId
            ? { action: "send", emailTemplateId: selectedId, segmentIds }
            : contentBody({ action: "send" })
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Send failed");
      const queued =
        typeof data.queuedCount === "number" ? data.queuedCount : activeCount;
      toast.success(
        `Queued ${queued} email${queued === 1 ? "" : "s"}`
      );
      setEditingId(null);
      setMode("now");
      setLocalDatetime("");
      await refreshHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  function startEdit(campaign: CampaignRow) {
    if (campaign.status !== "draft" && campaign.status !== "scheduled") {
      toast.error("Only drafts and scheduled campaigns can be edited");
      return;
    }
    setEditingId(campaign.id);
    setSelectedId(campaign.templateId);
    setSegmentIds(campaign.segmentIds ?? []);
    if (campaign.status === "scheduled") {
      setMode("schedule");
      setTimezone(campaign.timezone || defaultCampaignTimezone());
      setLocalDatetime(
        utcToDatetimeLocalValue(
          campaign.scheduledAt,
          campaign.timezone || defaultCampaignTimezone()
        )
      );
    } else {
      setMode("now");
      setLocalDatetime("");
    }
  }

  const selected = templates.find((t) => t.id === selectedId);

  const tzOptions = useMemo(() => {
    const ids = new Set<string>(CAMPAIGN_TIMEZONES.map((t) => t.id));
    if (!ids.has(timezone)) {
      return [{ id: timezone, label: timezone }, ...CAMPAIGN_TIMEZONES];
    }
    return [...CAMPAIGN_TIMEZONES];
  }, [timezone]);

  if (templates.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-white/15">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          Create a template first
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-neutral-400">
          Campaigns send one of your templates to active subscribers.
        </p>
        <Button
          asChild
          className="mt-5 h-9 rounded-full bg-neutral-950 px-4 text-[13px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
        >
          <Link href="/dashboard/marketing/email/templates">Go to templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-b border-neutral-100 pb-6 sm:grid-cols-4 dark:border-white/10">
        {[
          { label: "On list", value: audienceStats.total },
          { label: "Will receive", value: audienceStats.active },
          { label: "Scheduled", value: counts.scheduled },
          { label: "Drafts", value: counts.draft },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-[11px] text-neutral-400">{stat.label}</p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.04em] text-neutral-950 dark:text-white">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-5 rounded-2xl border border-neutral-100 p-5 dark:border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              {editing ? "Edit campaign" : "New campaign"}
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-400">
              {editing
                ? `${formatCampaignPresentationLabel(editing.presentationStatus)} · ${editing.subject}`
                : targetedLabel}
            </p>
          </div>
          {editing ? (
            <button
              type="button"
              className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              onClick={() => {
                setEditingId(null);
                setMode("now");
                setLocalDatetime("");
                setSegmentIds([]);
              }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="flex gap-1 rounded-full border border-neutral-100 p-1 dark:border-white/10">
          {(["now", "schedule"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-[12px] font-medium transition-colors",
                mode === m
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
              )}
            >
              {m === "now" ? "Send now" : "Schedule"}
            </button>
          ))}
        </div>

        {mode === "schedule" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-neutral-400">Date & time</Label>
              <Input
                type="datetime-local"
                value={localDatetime}
                onChange={(e) => setLocalDatetime(e.target.value)}
                className="h-9 rounded-xl border-neutral-200 bg-white text-[13px] dark:border-white/10 dark:bg-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-neutral-400">Timezone</Label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-2 text-[13px] dark:border-white/10 dark:bg-transparent"
              >
                {tzOptions.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] text-neutral-400">
              Segments · empty = all active
            </p>
            <Link
              href="/dashboard/marketing/email/segments"
              className="text-[12px] font-medium text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-300"
            >
              Manage
            </Link>
          </div>
          {segments.length === 0 ? (
            <p className="text-[12px] text-neutral-400">
              No segments yet — sending to all active subscribers.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {segments.map((segment) => {
                const active = segmentIds.includes(segment.id);
                return (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() => toggleSegment(segment.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                      active
                        ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-white/15",
                    )}
                  >
                    {segment.name}
                    <span className="ml-1 opacity-50">{segment.cachedCount}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-[12px] text-neutral-400">Template</p>
          <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
            {templates.map((tpl) => {
              const active = selectedId === tpl.id;
              return (
                <li key={tpl.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(tpl.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                      active
                        ? "bg-neutral-50 dark:bg-white/[0.04]"
                        : "hover:bg-neutral-50/80 dark:hover:bg-white/[0.03]",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-neutral-950 dark:text-white">
                        {tpl.name}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-neutral-400">
                        {tpl.subject}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "h-4 w-4 shrink-0 rounded-full border",
                        active
                          ? "border-neutral-950 bg-neutral-950 dark:border-white dark:bg-white"
                          : "border-neutral-200 dark:border-white/20",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
          {selected ? (
            <p className="mt-2 text-[12px] text-neutral-400">
              <Link
                href={`/dashboard/marketing/email/templates/${selected.id}/edit`}
                className="font-medium text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-300"
              >
                Edit template
              </Link>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-neutral-200 px-4 text-[13px] dark:border-white/15"
            loading={busy === "draft"}
            disabled={!selectedId || busy !== null}
            onClick={() => void handleSaveDraft()}
          >
            Save draft
          </Button>
          <Button
            type="button"
            className="h-9 rounded-full bg-neutral-950 px-4 text-[13px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            loading={busy === "send" || busy === "schedule"}
            disabled={
              activeCount <= 0 ||
              !selectedId ||
              busy !== null ||
              (mode === "schedule" && !localDatetime)
            }
            onClick={() => void handleSendOrSchedule()}
          >
            {mode === "schedule" ? (
              <>
                <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
                {editing?.status === "scheduled"
                  ? "Update schedule"
                  : "Schedule"}
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Send to {activeCount}
              </>
            )}
          </Button>
        </div>
      </section>

      <EmailCampaignHistoryPanel
        key={historyKey}
        initialCampaigns={campaigns}
        initialCounts={counts}
        initialTotal={historyTotal}
        initialPage={historyPage}
        initialPageSize={initialPageSize}
        initialTotalPages={historyTotalPages}
        onEditDraft={startEdit}
      />
    </div>
  );
}
