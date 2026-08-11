"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Info,
  Package,
  RefreshCw,
  ShoppingBag,
  Store as StoreIcon,
  Unlink,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardMetric,
  dashboardPrimaryBtn,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type {
  ChannelAutopilotFlags,
  ChannelConnectionPublic,
  ChannelConnectionStatus,
  EtsyShopMetadata,
} from "@/lib/channels/types";

interface RecentLog {
  id: string;
  operation: string;
  status: "success" | "failed" | "skipped" | "info" | string;
  externalId: string | null;
  durationMs: number | null;
  errorCode: string | null;
  message: string | null;
  createdAt: string;
}

interface EtsyStatusResponse {
  connected: boolean;
  connection: ChannelConnectionPublic | null;
  listingCount: number;
  orderCount: number;
  recentLogs: RecentLog[];
}

interface EtsyChannelClientProps {
  /** Reserved for future storefront deep-links (e.g. "View live listing"). */
  storeSlug?: string;
}

const OPERATION_LABELS: Record<string, string> = {
  connect: "Connected",
  disconnect: "Disconnected",
  import_listings: "Import listings",
  import_listing: "Import listing",
  publish_listing: "Publish listing",
  unpublish_listing: "Unpublish listing",
  update_listing: "Update listing",
  sync_inventory: "Sync inventory",
  sync_orders: "Sync orders",
  sync_tracking: "Sync tracking",
  sync_order_status: "Sync order status",
  refresh_token: "Refresh token",
};

function formatOperation(operation: string): string {
  return OPERATION_LABELS[operation] ?? operation.replace(/_/g, " ");
}

const STATUS_BADGE: Record<
  ChannelConnectionStatus,
  { label: string; className: string }
> = {
  CONNECTED: {
    label: "Connected",
    className:
      "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  EXPIRED: {
    label: "Expired",
    className:
      "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  REAUTH_REQUIRED: {
    label: "Needs reconnect",
    className:
      "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  ERROR: {
    label: "Error",
    className:
      "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  DISCONNECTED: {
    label: "Disconnected",
    className:
      "border-transparent bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300",
  },
};

interface AutopilotToggleDef {
  key: keyof ChannelAutopilotFlags | "failedOrderAlerts" | "seoSuggestions";
  label: string;
  description: string;
  supported: boolean;
}

const AUTOPILOT_TOGGLES: AutopilotToggleDef[] = [
  {
    key: "inventorySync",
    label: "Inventory sync",
    description: "Push Ettajer stock to Etsy about every hour (checked every 5 minutes).",
    supported: true,
  },
  {
    key: "orderSync",
    label: "Order sync",
    description: "Pull new Etsy orders into Ettajer about every hour (checked every 5 minutes).",
    supported: true,
  },
  {
    key: "trackingSync",
    label: "Tracking sync",
    description: "Push ship notes / tracking numbers back to Etsy after you mark orders shipped.",
    supported: true,
  },
  {
    key: "priceSync",
    label: "Price sync",
    description: "Push Ettajer price changes to Etsy automatically.",
    supported: false,
  },
  {
    key: "failedOrderAlerts",
    label: "Failed order alerts",
    description: "Notify you the moment an order fails to sync.",
    supported: false,
  },
  {
    key: "seoSuggestions",
    label: "SEO suggestions",
    description: "Surface AI-generated SEO tips for your listings.",
    supported: false,
  },
];

function LogStatusIcon({ status }: { status: string }) {
  if (status === "success") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (status === "failed") return <XCircle className="h-3.5 w-3.5 text-red-500" />;
  if (status === "skipped") return <Clock className="h-3.5 w-3.5 text-neutral-400" />;
  return <Info className="h-3.5 w-3.5 text-[#007AFF]" />;
}

export function EtsyChannelClient(_props: EtsyChannelClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<EtsyStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [pendingFlag, setPendingFlag] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/channels/etsy/status");
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Failed to load Etsy status");
      setStatus(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load Etsy status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");

    if (connected === "1") {
      toast.success("Etsy shop connected");
      params.delete("connected");
      const next = params.toString();
      router.replace(next ? `/dashboard/channels/etsy?${next}` : "/dashboard/channels/etsy");
      void fetchStatus();
      return;
    }

    if (error) {
      toast.error(decodeURIComponent(error).replace(/\+/g, " "));
      params.delete("error");
      const next = params.toString();
      router.replace(next ? `/dashboard/channels/etsy?${next}` : "/dashboard/channels/etsy");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/channels/etsy/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "full" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Failed to queue sync");
      toast.success("Sync queued — listings, inventory, and orders will update shortly");
      window.setTimeout(() => void fetchStatus(), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to queue sync");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    if (typeof window !== "undefined" && !window.confirm("Disconnect your Etsy shop? AutoPilot and syncing will stop.")) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch("/api/channels/etsy/disconnect", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Failed to disconnect Etsy");
      toast.success("Etsy disconnected");
      await fetchStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect Etsy");
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleAutopilotToggle(key: string, checked: boolean) {
    if (!status?.connection) return;
    setPendingFlag(key);
    const previous = status;
    setStatus({
      ...status,
      connection: {
        ...status.connection,
        autopilot: { ...status.connection.autopilot, [key]: checked },
      },
    });
    try {
      const res = await fetch("/api/channels/etsy/autopilot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: checked }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Failed to update AutoPilot setting");
      setStatus((current) =>
        current ? { ...current, connection: data.connection } : current
      );
    } catch (error) {
      setStatus(previous);
      toast.error(error instanceof Error ? error.message : "Failed to update AutoPilot setting");
    } finally {
      setPendingFlag(null);
    }
  }

  if (loading) {
    return (
      <div className={dashboardStack}>
        <Skeleton className="h-24 w-full rounded-[12px]" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20 w-full rounded-[12px]" />
          <Skeleton className="h-20 w-full rounded-[12px]" />
          <Skeleton className="h-20 w-full rounded-[12px]" />
        </div>
        <Skeleton className="h-40 w-full rounded-[12px]" />
      </div>
    );
  }

  const connection = status?.connection ?? null;
  const metadata = (connection?.metadata ?? {}) as EtsyShopMetadata;
  const isFullyConnected = Boolean(status?.connected);

  if (!connection) {
    return (
      <div className={dashboardStack}>
        <section className={cn(dashboardCard, dashboardCardPad, "flex flex-col items-center gap-3 py-10 text-center")}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1641E]/10 text-[#F1641E]">
            <StoreIcon className="h-6 w-6" />
          </span>
          <div>
            <h3 className={dashboardTitle}>Connect your Etsy shop</h3>
            <p className={cn(dashboardSubtitle, "mx-auto mt-1 max-w-sm")}>
              Sync listings, inventory, and orders between Ettajer and Etsy — automatically, once connected.
            </p>
          </div>
          <Button asChild className={cn(dashboardPrimaryBtn, "h-9 px-4")}>
            <a href="/api/channels/etsy/oauth/start">Connect with Etsy</a>
          </Button>
        </section>
      </div>
    );
  }

  const badge = STATUS_BADGE[connection.status];

  return (
    <div className={dashboardStack}>
      {!isFullyConnected ? (
        <section className={cn(dashboardCard, dashboardCardPad, "flex flex-wrap items-center justify-between gap-3 border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/[0.06]")}>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                {badge?.label ?? "Connection needs attention"}
              </p>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                {connection.lastError ?? "Reconnect your Etsy shop to keep syncing."}
              </p>
            </div>
          </div>
          <Button asChild className={cn(dashboardPrimaryBtn, "h-8 shrink-0 px-3")}>
            <a href="/api/channels/etsy/oauth/start">Reconnect with Etsy</a>
          </Button>
        </section>
      ) : null}

      <section className={cn(dashboardCard, dashboardCardPad, "flex flex-wrap items-center justify-between gap-3")}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1641E]/10 text-[#F1641E]">
            <StoreIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                {metadata.shopName || "Etsy shop"}
              </h3>
              {badge ? (
                <Badge className={cn("rounded-full px-2 py-0 text-[10px] font-medium", badge.className)}>
                  {badge.label}
                </Badge>
              ) : null}
            </div>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              Last sync {connection.lastSyncAt ? formatRelativeTime(connection.lastSyncAt) : "never"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {metadata.shopUrl ? (
            <Button variant="outline" className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10" asChild>
              <a href={metadata.shopUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                View shop
              </a>
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            onClick={handleSync}
            loading={syncing}
            disabled={syncing || !isFullyConnected}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Sync now
          </Button>
          <Button
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            asChild
          >
            <Link href="/dashboard/channels/etsy/import">
              <Download className="mr-1 h-3.5 w-3.5" />
              Import from Etsy
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-8 rounded-md border-red-500/20 px-2.5 text-[12px] text-red-600 hover:bg-red-500/5 dark:border-red-500/30 dark:text-red-400"
            onClick={handleDisconnect}
            loading={disconnecting}
            disabled={disconnecting}
          >
            <Unlink className="mr-1 h-3.5 w-3.5" />
            Disconnect
          </Button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={cn(dashboardCard, dashboardCardPad, "flex items-center gap-3")}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
            <Package className="h-4 w-4" />
          </span>
          <div>
            <p className={dashboardMetric}>{status?.listingCount ?? 0}</p>
            <p className={dashboardSubtitle}>Products synced</p>
          </div>
        </div>
        <div className={cn(dashboardCard, dashboardCardPad, "flex items-center gap-3")}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5856D6]/10 text-[#5856D6]">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <p className={dashboardMetric}>{status?.orderCount ?? 0}</p>
            <p className={dashboardSubtitle}>Orders imported</p>
          </div>
        </div>
        <div className={cn(dashboardCard, dashboardCardPad, "flex items-center gap-3")}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <p className={dashboardMetric}>
              {connection.lastSyncAt ? formatRelativeTime(connection.lastSyncAt) : "Never"}
            </p>
            <p className={dashboardSubtitle}>Last sync</p>
          </div>
        </div>
      </div>

      <section className={cn(dashboardCard, "overflow-hidden")}>
        <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-[#007AFF]" />
            <h3 className={dashboardTitle}>AutoPilot</h3>
          </div>
          <p className={cn(dashboardSubtitle, "mt-0.5")}>
            Cron checks every 5 minutes and runs enabled syncs about once per hour.
          </p>
        </div>
        <div className="divide-y divide-black/[0.05] dark:divide-white/10">
          {AUTOPILOT_TOGGLES.map((toggle) => {
            const checked = toggle.supported
              ? Boolean(connection.autopilot[toggle.key as keyof ChannelAutopilotFlags])
              : false;
            return (
              <div key={toggle.key} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-medium text-neutral-900 dark:text-white">{toggle.label}</p>
                    {!toggle.supported ? (
                      <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[9px] font-medium">
                        Coming soon
                      </Badge>
                    ) : null}
                  </div>
                  <p className={cn(dashboardSubtitle, "mt-0.5")}>{toggle.description}</p>
                </div>
                <Switch
                  checked={checked}
                  disabled={!toggle.supported || !isFullyConnected || pendingFlag === toggle.key}
                  onCheckedChange={(next) => handleAutopilotToggle(toggle.key, next)}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className={cn(dashboardCard, "overflow-hidden")}>
        <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
          <h3 className={dashboardTitle}>Recent activity</h3>
          <p className={cn(dashboardSubtitle, "mt-0.5")}>Latest sync events for this connection.</p>
        </div>
        {status?.recentLogs?.length ? (
          <div className="divide-y divide-black/[0.05] dark:divide-white/10">
            {status.recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 px-4 py-2.5">
                <span className="mt-0.5 shrink-0">
                  <LogStatusIcon status={log.status} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                      {formatOperation(log.operation)}
                    </p>
                    <span className="text-[10px] text-neutral-400">{formatRelativeTime(log.createdAt)}</span>
                  </div>
                  {log.message ? (
                    <p className="mt-0.5 truncate text-[11px] text-neutral-500 dark:text-neutral-400" title={log.message}>
                      {log.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={cn(dashboardSubtitle, "px-4 py-6 text-center")}>No activity yet.</p>
        )}
      </section>
    </div>
  );
}
