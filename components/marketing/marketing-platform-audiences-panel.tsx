"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import type {
  MarketingIntegrations,
  MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformAudiencesPanelProps {
  link: MarketingPlatformLink;
  onChange: (patch: Partial<MarketingPlatformLink>) => void;
  onIntegrationsSynced?: (integrations: MarketingIntegrations) => void;
}

interface AudienceStats {
  ready: boolean;
  adAccountId: string | null;
  adAccounts: Array<{ id: string; name: string }>;
  adAccountsError: string | null;
  purchasers: {
    eligible: number;
    audienceId: string | null;
    lastSyncedAt: string | null;
  };
  abandoners: {
    eligible: number;
    audienceId: string | null;
    lastSyncedAt: string | null;
  };
}

function formatSyncedAt(value: string | null | undefined): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MarketingPlatformAudiencesPanel({
  link,
  onChange,
  onIntegrationsSynced,
}: MarketingPlatformAudiencesPanelProps) {
  const [stats, setStats] = useState<AudienceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<"purchasers" | "abandoners" | null>(
    null
  );
  const [adAccountId, setAdAccountId] = useState(link.adAccountId ?? "");

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/meta/audiences");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load audiences");
      const next: AudienceStats = {
        ready: Boolean(data.ready),
        adAccountId: data.adAccountId ?? null,
        adAccounts: Array.isArray(data.adAccounts) ? data.adAccounts : [],
        adAccountsError: data.adAccountsError ?? null,
        purchasers: {
          eligible: data.purchasers?.eligible ?? 0,
          audienceId: data.purchasers?.audienceId ?? null,
          lastSyncedAt: data.purchasers?.lastSyncedAt ?? null,
        },
        abandoners: {
          eligible: data.abandoners?.eligible ?? 0,
          audienceId: data.abandoners?.audienceId ?? null,
          lastSyncedAt: data.abandoners?.lastSyncedAt ?? null,
        },
      };
      setStats(next);
      if (next.adAccountId && !adAccountId) {
        setAdAccountId(next.adAccountId);
        if (next.adAccountId !== link.adAccountId) {
          onChange({ adAccountId: next.adAccountId });
        }
      }
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    link.accessToken,
    link.adAccountId,
    link.purchasersAudienceId,
    link.abandonersAudienceId,
  ]);

  async function syncList(list: "purchasers" | "abandoners") {
    if (!adAccountId) {
      toast.error("Select a Meta ad account first");
      return;
    }
    setSyncing(list);
    try {
      const res = await fetch("/api/marketing/meta/audiences/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list, adAccountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Sync failed");

      if (data.integrations && onIntegrationsSynced) {
        onIntegrationsSynced(data.integrations as MarketingIntegrations);
      } else {
        onChange({
          adAccountId: data.adAccountId ?? adAccountId,
          ...(list === "purchasers"
            ? {
                purchasersAudienceId: data.audienceId,
                purchasersAudienceSyncedAt: data.syncedAt,
              }
            : {
                abandonersAudienceId: data.audienceId,
                abandonersAudienceSyncedAt: data.syncedAt,
              }),
        });
      }

      toast.success(
        list === "purchasers"
          ? `Pushed ${data.uploaded} purchasers to Meta`
          : `Pushed ${data.uploaded} abandoners to Meta`
      );
      await loadStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(null);
    }
  }

  const lists = [
    {
      key: "purchasers" as const,
      title: "Purchasers",
      description: "Customers who placed an order — great for lookalikes and exclusion.",
      icon: ShoppingBag,
      eligible: stats?.purchasers.eligible ?? 0,
      audienceId: link.purchasersAudienceId ?? stats?.purchasers.audienceId,
      lastSyncedAt:
        link.purchasersAudienceSyncedAt ?? stats?.purchasers.lastSyncedAt,
      label: "GENERAL_CUSTOMERS",
    },
    {
      key: "abandoners" as const,
      title: "Abandoners",
      description:
        "Started checkout but didn’t buy — excludes known purchasers.",
      icon: ShoppingCart,
      eligible: stats?.abandoners.eligible ?? 0,
      audienceId: link.abandonersAudienceId ?? stats?.abandoners.audienceId,
      lastSyncedAt:
        link.abandonersAudienceSyncedAt ?? stats?.abandoners.lastSyncedAt,
      label: "ENGAGED_USERS",
    },
  ];

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1877F2]/10 text-[#1877F2]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className={dashboardTitle}>Custom audiences</h3>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Push hashed customer lists to Meta for retargeting and lookalikes.
                Emails and phones are SHA-256 hashed before upload.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-[11px] text-neutral-500"
            onClick={() => void loadStats()}
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
            Connect with Meta on the Connection tab first — Custom Audiences need
            your ads access token.
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-neutral-500">
            Meta ad account
          </Label>
          {stats?.adAccounts && stats.adAccounts.length > 0 ? (
            <Select
              value={adAccountId || undefined}
              onValueChange={(value) => {
                setAdAccountId(value);
                onChange({ adAccountId: value });
              }}
              disabled={!link.accessToken}
            >
              <SelectTrigger className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] dark:border-white/10 dark:bg-white/[0.05]">
                <SelectValue placeholder="Select ad account" />
              </SelectTrigger>
              <SelectContent>
                {stats.adAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}{" "}
                    <span className="font-mono text-[10px] text-neutral-400">
                      {account.id}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className={dashboardSubtitle}>
              {loading
                ? "Loading ad accounts…"
                : stats?.adAccountsError ||
                  "No ad accounts found. Make sure your Login for Business config includes ads permissions."}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {lists.map((list) => {
            const Icon = list.icon;
            const busy = syncing === list.key;
            return (
              <div
                key={list.key}
                className="rounded-[10px] border border-black/[0.05] px-3 py-3 dark:border-white/10"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08]">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                        {list.title}
                      </p>
                      <p className={cn(dashboardSubtitle, "mt-0.5")}>
                        {list.description}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-400">
                        <span className="tabular-nums">
                          {loading ? "…" : list.eligible} eligible
                        </span>
                        <span>·</span>
                        <span>Last sync {formatSyncedAt(list.lastSyncedAt)}</span>
                        {list.audienceId ? (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Check className="h-3 w-3" />
                              <span className="font-mono tabular-nums">
                                {list.audienceId.slice(0, 6)}…
                              </span>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 shrink-0 rounded-md bg-[#1877F2] px-3 text-[12px] text-white hover:bg-[#166FE5]"
                    disabled={
                      !link.accessToken ||
                      !adAccountId ||
                      busy ||
                      syncing !== null ||
                      (!loading && list.eligible === 0)
                    }
                    loading={busy}
                    onClick={() => void syncList(list.key)}
                  >
                    {list.audienceId ? "Re-sync to Meta" : "Push to Meta"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="min-w-0 pr-3">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              Daily auto re-sync
            </p>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              Re-upload existing Purchasers and Abandoners audiences every night
              (about 04:00 UTC). Push at least once first, then enable and save.
            </p>
          </div>
          <Switch
            checked={Boolean(link.audiencesAutoSync)}
            onCheckedChange={(checked) =>
              onChange({ audiencesAutoSync: checked })
            }
            disabled={!link.accessToken}
          />
        </div>

        <div className="rounded-[10px] bg-[#F5F5F7] px-3 py-2.5 dark:bg-white/[0.05]">
          <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            Meta matches hashed emails/phones against Facebook accounts (usually within
            a few hours). Use these lists for retargeting, lookalikes, or to exclude
            existing buyers from prospecting campaigns.
          </p>
        </div>
      </div>
    </section>
  );
}
