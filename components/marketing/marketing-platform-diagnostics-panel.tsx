"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MinusCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import type { MarketingPlatformLink } from "@/lib/marketing-integrations";

interface MarketingPlatformDiagnosticsPanelProps {
  link: MarketingPlatformLink;
}

type StatusFilter = "all" | "ok" | "error" | "skipped";

interface DiagnosticEvent {
  id: string;
  eventName: string;
  eventId: string | null;
  status: string;
  source: string | null;
  channel: string;
  httpStatus: number | null;
  error: string | null;
  testMode: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface DiagnosticsPayload {
  last24h: { ok: number; error: number; skipped: number; total: number };
  events: DiagnosticEvent[];
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StatusIcon({ status }: { status: string }) {
  if (status === "ok") {
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  }
  if (status === "error") {
    return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
  }
  return <MinusCircle className="h-3.5 w-3.5 text-neutral-400" />;
}

export function MarketingPlatformDiagnosticsPanel({
  link,
}: MarketingPlatformDiagnosticsPanelProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [data, setData] = useState<DiagnosticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(nextFilter = filter) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/marketing/meta/diagnostics?status=${encodeURIComponent(nextFilter)}`
      );
      const text = await res.text();
      let json: {
        message?: string;
        last24h?: DiagnosticsPayload["last24h"];
        events?: DiagnosticEvent[];
      } = {};
      try {
        json = text ? (JSON.parse(text) as typeof json) : {};
      } catch {
        throw new Error(
          res.ok
            ? "Unexpected end of JSON input"
            : `Diagnostics failed (${res.status})`
        );
      }
      if (!res.ok) throw new Error(json.message ?? "Failed to load diagnostics");
      setData({
        last24h: json.last24h ?? { ok: 0, error: 0, skipped: 0, total: 0 },
        events: Array.isArray(json.events) ? json.events : [],
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load diagnostics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, link.accessToken, link.pixelId]);

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "ok", label: "Sent" },
    { id: "error", label: "Failed" },
    { id: "skipped", label: "Skipped" },
  ];

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1877F2]/10 text-[#1877F2]">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className={dashboardTitle}>Event diagnostics</h3>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Server Conversions API deliveries for this store — successes,
                failures, and skips. Works with or without test mode.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-[11px] text-neutral-500"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {!link.accessToken ? (
          <div className="rounded-[10px] border border-amber-500/20 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Add a Conversions API access token (Advanced) to start logging server
            events here. For Pinterest, also set the Ad account ID on Connection.
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Last 24h", value: data?.last24h.total ?? 0 },
            { label: "Sent", value: data?.last24h.ok ?? 0 },
            { label: "Failed", value: data?.last24h.error ?? 0 },
            { label: "Skipped", value: data?.last24h.skipped ?? 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                {stat.label}
              </p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                {loading && !data ? "…" : stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter === item.id
                  ? "bg-[#1877F2]/10 text-[#1877F2]"
                  : "bg-[#F5F5F7] text-neutral-500 hover:text-neutral-800 dark:bg-white/[0.06] dark:hover:text-neutral-200"
              )}
            >
              {item.label}
            </button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto h-7 rounded-md border-black/[0.06] px-2 text-[11px] dark:border-white/10"
            asChild
          >
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Events Manager
            </a>
          </Button>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-black/[0.05] dark:border-white/10">
          {loading && !data ? (
            <div className="flex items-center justify-center gap-2 px-3 py-10 text-[12px] text-neutral-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading events…
            </div>
          ) : !data?.events.length ? (
            <div className="px-3 py-10 text-center text-[12px] text-neutral-500">
              No CAPI events logged yet. Browse your storefront, add to cart, or
              complete a test order — deliveries will show up here.
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.04] dark:divide-white/10">
              {data.events.map((event) => {
                const meta = event.metadata ?? {};
                const detailBits = [
                  event.source,
                  event.eventId ? `id ${event.eventId}` : null,
                  typeof meta.orderId === "string" ? `order ${meta.orderId}` : null,
                  typeof meta.value === "number" && typeof meta.currency === "string"
                    ? `${meta.value} ${meta.currency}`
                    : null,
                  event.testMode ? "test" : null,
                ].filter(Boolean);

                return (
                  <li key={event.id} className="px-3 py-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        <StatusIcon status={event.status} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                          <p className="font-mono text-[12px] font-medium text-neutral-900 dark:text-white">
                            {event.eventName}
                            <span className="ml-1.5 font-sans text-[10px] font-normal uppercase tracking-wide text-neutral-400">
                              {event.status}
                              {event.httpStatus ? ` · ${event.httpStatus}` : ""}
                            </span>
                          </p>
                          <span className="text-[10px] tabular-nums text-neutral-400">
                            {formatWhen(event.createdAt)}
                          </span>
                        </div>
                        {detailBits.length ? (
                          <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                            {detailBits.join(" · ")}
                          </p>
                        ) : null}
                        {event.error ? (
                          <p className="mt-1 line-clamp-2 text-[11px] text-amber-700 dark:text-amber-400">
                            {event.error}
                          </p>
                        ) : null}
                        {event.status === "skipped" &&
                        typeof meta.reason === "string" ? (
                          <p className="mt-1 text-[11px] text-neutral-400">
                            Reason: {meta.reason.replace(/_/g, " ")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className={dashboardSubtitle}>
          Keeps the latest ~150 server events per store. Successful PageViews are
          omitted to reduce noise (failures still appear). Browser-only Pixel hits
          without CAPI are not listed — use Events Manager or test mode for those.
        </p>
      </div>
    </section>
  );
}
