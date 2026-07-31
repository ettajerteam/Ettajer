"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Activity, Check, Mail, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  dashboardMetric,
  dashboardPrimaryBtn,
  dashboardSubtitle,
} from "@/lib/dashboard-ui";
import type { MailHubHealthBundle } from "@/lib/mailhub/health";
import type { StoreEmailProviderRow } from "@/lib/mailhub/providers";

interface DomainRow {
  verificationStatus?: string;
  spfStatus: string;
}

interface IdentityRow {
  id: string;
}

/** Soft-gray health icon next to Help — opens email readiness + deliverability popup. */
export function EmailHealthCheckButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<MailHubHealthBundle | null>(null);
  const [providers, setProviders] = useState<StoreEmailProviderRow[]>([]);
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [senderCount, setSenderCount] = useState(0);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mailhub?view=overview");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Health check failed");
      setHealth(data.health ?? null);
      setProviders(data.providers || []);
      setDomains(data.domains || []);
      setSenderCount((data.identities as IdentityRow[] | undefined)?.length ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Health check failed");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) void loadHealth();
  }

  const defaultProvider =
    providers.find((p) => p.isDefaultMarketing || p.isDefaultTransactional) ??
    providers[0];

  const checklist = [
    {
      id: "provider",
      label: "Provider",
      done:
        providers.some((p) => p.status === "active") || providers.length > 0,
    },
    {
      id: "domain",
      label: "Domain",
      done: domains.some((d) => {
        const s = (d.verificationStatus || "").toLowerCase();
        return s === "verified" || d.spfStatus === "verified";
      }) || domains.length > 0,
    },
    {
      id: "sender",
      label: "Sender",
      done: senderCount > 0,
    },
    {
      id: "health",
      label: "Health",
      done: health != null && health.healthScore >= 70,
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label="Email readiness"
        title="Email readiness"
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200",
          "hover:bg-black/[0.04] hover:text-neutral-600",
          "dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300",
          className
        )}
      >
        <Activity className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "w-[min(100vw-1.5rem,420px)] max-w-[420px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10"
          )}
        >
          <DialogHeader className="space-y-0 border-b border-black/[0.05] px-4 pb-3 pt-4 pr-12 text-left dark:border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
                  <Activity className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    Email readiness
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-[11px] text-neutral-500">
                    Setup status and deliverability for Email marketing.
                  </DialogDescription>
                </div>
              </div>
              {!loading ? (
                <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
                  {doneCount}/{checklist.length} ready
                </span>
              ) : null}
            </div>
          </DialogHeader>

          <div className="max-h-[min(70vh,520px)] space-y-0 overflow-y-auto">
            {loading && !health && providers.length === 0 ? (
              <div className="space-y-2 px-4 py-3">
                <div className="h-14 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
                <div className="h-20 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
                <div className="h-16 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#007AFF]/10 text-[#007AFF]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                      {defaultProvider
                        ? defaultProvider.name
                        : "Connect a sending provider"}
                    </p>
                    <p className={cn(dashboardSubtitle, "mt-0.5")}>
                      {defaultProvider
                        ? `${defaultProvider.kindLabel}${
                            defaultProvider.isDefaultMarketing
                              ? " · Marketing default"
                              : defaultProvider.isDefaultTransactional
                                ? " · Transactional default"
                                : ""
                          }`
                        : "Resend, SES, SMTP, or Ettajer Managed — used by Email marketing"}
                    </p>
                  </div>
                </div>

                {health ? (
                  <div className="grid grid-cols-2 gap-1.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                    {[
                      {
                        label: "Health score",
                        value: `${Math.round(health.healthScore)}`,
                      },
                      {
                        label: "Bounce rate",
                        value: `${health.bounceRate}%`,
                      },
                      { label: "Open rate", value: `${health.openRate}%` },
                      {
                        label: "Reputation",
                        value: health.domainReputation,
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-[10px] bg-[#F5F5F7] px-2.5 py-2 dark:bg-white/[0.04]"
                      >
                        <p className="text-[10px] text-neutral-400">
                          {m.label}
                        </p>
                        <p
                          className={cn(
                            dashboardMetric,
                            "mt-0.5 capitalize tabular-nums text-[15px]"
                          )}
                        >
                          {m.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                    <p className={dashboardSubtitle}>
                      No health metrics yet. Connect a provider and send a few
                      emails.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
                  {checklist.map((item) => (
                    <span
                      key={item.id}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                        item.done
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-black/[0.03] text-neutral-400 dark:bg-white/[0.04]"
                      )}
                    >
                      {item.done ? (
                        <Check className="h-2.5 w-2.5" />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full border border-current opacity-40" />
                      )}
                      {item.label}
                    </span>
                  ))}
                </div>

                <div className="px-4 py-3">
                  <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                    Recommendations
                  </p>
                  {health?.recommendations?.length ? (
                    <ul className="mt-1.5 space-y-1.5">
                      {health.recommendations.map((r) => (
                        <li
                          key={r}
                          className="rounded-[10px] bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={cn(dashboardSubtitle, "mt-1.5")}>
                      Looking healthy — keep monitoring bounce and complaint
                      rates.
                    </p>
                  )}
                  {health?.scoredAt ? (
                    <p className="mt-2 text-[10px] text-neutral-400">
                      Checked{" "}
                      {new Date(health.scoredAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-black/[0.05] px-4 py-3 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
              loading={loading}
              onClick={() => void loadHealth()}
            >
              <RefreshCw className="mr-1.5 h-3 w-3" />
              Re-check
            </Button>
            <Button
              type="button"
              className={cn(dashboardPrimaryBtn, "h-8 px-3")}
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const EMAIL_SETTINGS_TIPS = [
  {
    title: "Pick a marketing default",
    body: "Campaigns and automations send through the provider marked Marketing default.",
  },
  {
    title: "Verify your domain",
    body: "Add SPF, DKIM, and DMARC so messages land in the inbox instead of spam.",
  },
  {
    title: "Add a from address",
    body: "Create a sender identity shoppers recognize — e.g. hello@yourbrand.com.",
  },
  {
    title: "Test before you blast",
    body: "Use Send test on a provider, then open Email marketing to launch a campaign.",
  },
] as const;
