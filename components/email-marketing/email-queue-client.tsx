"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  formatEmailJobStatusLabel,
  type EmailJobRow,
  type EmailJobStatus,
  type EmailQueueStats,
} from "@/lib/email-marketing/email-queue-types";

interface EmailQueueClientProps {
  initialStats: EmailQueueStats;
  initialJobs: EmailJobRow[];
}

type Filter = EmailJobStatus | "all";

export function EmailQueueClient({
  initialStats,
  initialJobs,
}: EmailQueueClientProps) {
  const [stats, setStats] = useState(initialStats);
  const [jobs, setJobs] = useState(initialJobs);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function refresh(nextFilter: Filter = filter) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/email/queue?status=${encodeURIComponent(nextFilter)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to load",
        );
      }
      setStats(data.stats as EmailQueueStats);
      setJobs(data.jobs as EmailJobRow[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setStats(initialStats);
    setJobs(initialJobs);
  }, [initialStats, initialJobs]);

  const pills: { id: Filter; label: string; count?: number }[] = useMemo(
    () => [
      { id: "all", label: "All", count: stats.total },
      { id: "pending", label: "Pending", count: stats.pending },
      { id: "sending", label: "Sending", count: stats.sending },
      { id: "sent", label: "Sent", count: stats.sent },
      { id: "failed", label: "Failed", count: stats.failed },
    ],
    [stats],
  );

  async function cancelJob(id: string) {
    setCancellingId(id);
    try {
      const res = await fetch("/api/email/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: [id] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Cancel failed",
        );
      }
      toast.success("Cancelled");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cancel failed");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={() => void refresh()}
          className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 disabled:opacity-50 dark:hover:text-white"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-neutral-100 py-6 sm:grid-cols-4 dark:border-white/10">
        {[
          { label: "Pending", value: stats.pending },
          { label: "Sending", value: stats.sending },
          { label: "Sent", value: stats.sent },
          { label: "Failed", value: stats.failed },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-[11px] text-neutral-400">{stat.label}</p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.04em] text-neutral-950 dark:text-white">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => {
              setFilter(pill.id);
              void refresh(pill.id);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              filter === pill.id
                ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
            )}
          >
            {pill.label}
            {typeof pill.count === "number" ? (
              <span className="ml-1 tabular-nums opacity-50">{pill.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
        {jobs.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
              Nothing pending
            </p>
            <p className="mt-1 text-[12px] text-neutral-400">
              New campaign and automation sends appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-white/10">
            {jobs.map((job) => {
              const canCancel =
                job.status === "pending" ||
                job.status === "scheduled" ||
                (job.status === "failed" && job.attempts < job.maxAttempts);
              return (
                <li
                  key={job.id}
                  className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium text-neutral-400">
                        {formatEmailJobStatusLabel(job.status)}
                      </span>
                      <span className="text-[11px] text-neutral-300">·</span>
                      <span className="text-[11px] text-neutral-400">
                        {job.kind}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[13px] font-medium text-neutral-950 dark:text-white">
                      {job.subject}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-neutral-400">
                      {job.toEmail}
                      {" · "}
                      {job.attempts}/{job.maxAttempts}
                    </p>
                    {job.lastError ? (
                      <p className="mt-1 text-[11px] text-red-600">
                        {job.lastError}
                      </p>
                    ) : null}
                  </div>
                  {canCancel ? (
                    <button
                      type="button"
                      disabled={cancellingId === job.id}
                      onClick={() => void cancelJob(job.id)}
                      className="shrink-0 text-[12px] font-medium text-neutral-400 hover:text-neutral-900 disabled:opacity-50 dark:hover:text-white"
                    >
                      {cancellingId === job.id ? "…" : "Cancel"}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
