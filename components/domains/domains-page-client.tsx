"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import {
  getAbsoluteStoreUrl,
  normalizeCustomDomain,
} from "@/lib/storefront-urls";
import type { StoreWithSettings } from "@/lib/store-settings";
import {
  apexRoot,
  detectDomainMode,
  isApexHostname,
  preferredHostname,
  subdomainLabel,
  type DomainMode,
  type DomainPrimary,
} from "@/lib/domains/hostname";
import { diagnoseDomain } from "@/lib/domains/diagnose";
import {
  dashboardCard,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

const FALLBACK_CNAME =
  process.env.NEXT_PUBLIC_DOMAIN_CNAME_TARGET?.trim() || "cname.vercel-dns.com";
const FALLBACK_A =
  process.env.NEXT_PUBLIC_DOMAIN_A_TARGET?.trim() || "76.76.21.21";

const DNS_POLL_MS = 30_000;

type VerifyPayload = {
  connected: boolean;
  domain: string | null;
  mapped: boolean;
  live: boolean;
  dns: { ok: boolean; detail: string; records: string[] } | null;
  wwwDns?: { ok: boolean; detail: string } | null;
  httpsUrl: string | null;
  vercelConfigured?: boolean;
  vercel?: {
    found: boolean;
    verified: boolean;
    error: string | null;
    verification?: unknown;
  } | null;
  recommendations?: {
    cnameTarget: string;
    aTarget: string;
    misconfigured: boolean;
    currentCnames: string[];
    currentA: string[];
  } | null;
  steps?: {
    saved: boolean;
    provisioned: boolean;
    dns: boolean;
    ssl: boolean;
  };
  expected?: {
    cnameTarget: string;
    aTarget: string;
    mode: DomainMode | null;
    host: string | null;
  };
};

type VerifyState = VerifyPayload | null;

interface DomainsPageClientProps {
  store: StoreWithSettings;
}

function CopyCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="group inline-flex max-w-full items-center gap-1.5 text-left font-sans text-[12px] text-neutral-800 transition hover:text-[#007AFF] dark:text-neutral-200"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied");
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          toast.error("Couldn’t copy");
        }
      }}
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 shrink-0 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 text-neutral-300 opacity-0 transition group-hover:opacity-100" />
      )}
    </button>
  );
}

function StatusChip({
  tone,
  children,
}: {
  tone: "live" | "wait" | "idle";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        tone === "live" &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        tone === "wait" &&
          "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        tone === "idle" && "bg-[#F5F5F7] text-neutral-500 dark:bg-white/10"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "live" && "bg-emerald-500",
          tone === "wait" && "bg-amber-500",
          tone === "idle" && "bg-neutral-400"
        )}
      />
      {children}
    </span>
  );
}

function Step({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
          done
            ? "bg-[#007AFF] text-white"
            : active
              ? "border border-[#007AFF] text-[#007AFF]"
              : "border border-black/[0.08] text-neutral-300 dark:border-white/15"
        )}
      >
        {done ? <Check className="h-3 w-3" /> : null}
      </span>
      <span
        className={cn(
          "text-[11px]",
          done || active ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-400"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function DomainsPageClient({ store: initialStore }: DomainsPageClientProps) {
  const [store, setStore] = useState(initialStore);
  const [domainInput, setDomainInput] = useState(store.settings.customDomain ?? "");
  const [mode, setMode] = useState<DomainMode>(() => {
    const host = normalizeCustomDomain(store.settings.customDomain);
    return host ? detectDomainMode(host) : "subdomain";
  });
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verify, setVerify] = useState<VerifyState>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [watching, setWatching] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const [savingPrimary, setSavingPrimary] = useState(false);

  const liveUrl = getAbsoluteStoreUrl(store.slug);
  const liveHost = liveUrl.replace(/^https?:\/\//, "");
  const connectedDomain = store.settings.customDomain;
  const domainPrimary: DomainPrimary = store.settings.domainPrimary ?? "apex";
  const connectedApex = connectedDomain
    ? apexRoot(normalizeCustomDomain(connectedDomain) ?? connectedDomain)
    : null;
  const publicHost = connectedDomain
    ? preferredHostname(connectedDomain, domainPrimary)
    : null;
  const dirty =
    normalizeCustomDomain(domainInput) !==
    normalizeCustomDomain(connectedDomain ?? "");

  const previewHost = useMemo(
    () => normalizeCustomDomain(domainInput) ?? "",
    [domainInput]
  );

  const cnameHost = useMemo(() => {
    if (mode === "apex") return "www";
    if (!previewHost) return "shop";
    return isApexHostname(previewHost) ? "shop" : subdomainLabel(previewHost);
  }, [mode, previewHost]);

  const cnameTarget =
    verify?.recommendations?.cnameTarget ||
    verify?.expected?.cnameTarget ||
    FALLBACK_CNAME;
  const aTarget =
    verify?.recommendations?.aTarget || verify?.expected?.aTarget || FALLBACK_A;

  const statusTone: "live" | "wait" | "idle" = !connectedDomain
    ? "idle"
    : verify?.live
      ? "live"
      : "wait";

  const statusLabel = !connectedDomain
    ? "Ettajer link"
    : verify?.live
      ? "Live"
      : verify?.steps?.provisioned
        ? "Waiting on DNS"
        : "Connecting…";

  const steps = verify?.steps ?? {
    saved: Boolean(connectedDomain),
    provisioned: false,
    dns: false,
    ssl: false,
  };

  const runVerify = useCallback(async (silent = false) => {
    setVerifying(true);
    try {
      const res = await fetch("/api/store/domain-verify", { cache: "no-store" });
      const data = (await res.json()) as VerifyState & { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Verification failed");
      setVerify(data);
      setLastCheckedAt(Date.now());
      if (data.live) {
        setWatching(false);
        if (!silent) toast.success("Domain is live");
      } else if (!silent) {
        if (!data.connected) toast.message("No custom domain yet");
        else
          toast.message("Still waiting on DNS", {
            description: data.dns?.detail ?? "Check records at your registrar",
          });
      }
    } catch (error) {
      if (!silent) {
        toast.error(error instanceof Error ? error.message : "Verification failed");
      }
    } finally {
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (connectedDomain) {
      void runVerify(true);
      setWatching(true);
    } else {
      setWatching(false);
      setVerify(null);
      setLastCheckedAt(null);
    }
  }, [connectedDomain, runVerify]);

  useEffect(() => {
    if (!watching || !connectedDomain || verify?.live) return;
    const id = window.setInterval(() => {
      void runVerify(true);
    }, DNS_POLL_MS);
    return () => window.clearInterval(id);
  }, [watching, connectedDomain, verify?.live, runVerify]);

  useEffect(() => {
    if (verify?.live) setWatching(false);
  }, [verify?.live]);

  useEffect(() => {
    const host = normalizeCustomDomain(domainInput);
    if (!host) return;
    setMode(detectDomainMode(host));
  }, [domainInput]);

  const saveDomain = useCallback(
    async (nextDomain: string | null) => {
      setSaving(true);
      try {
        const res = await fetch("/api/store/domain", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: nextDomain }),
        });
        const data = (await res.json()) as {
          message?: string;
          store?: StoreWithSettings;
          dns?: VerifyPayload["dns"];
          vercelConfigured?: boolean;
        };
        if (!res.ok) throw new Error(data.message ?? "Failed to save domain");
        if (data.store) {
          setStore(data.store);
          setDomainInput(data.store.settings.customDomain ?? "");
        }
        if (nextDomain) {
          if (data.vercelConfigured === false) {
            toast.message("Domain saved", {
              description:
                "Hostname is stored, but SSL provisioning isn’t configured yet. Contact support if DNS doesn’t go live.",
            });
          } else {
            toast.success("Domain connected", {
              description: data.dns?.ok
                ? "DNS already looks correct."
                : "Add the DNS records below, then check again.",
            });
          }
          window.setTimeout(() => void runVerify(true), 600);
          setWatching(true);
          window.setTimeout(() => {
            document.getElementById("domain-connect")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        } else {
          setVerify(null);
          toast.success("Domain removed");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [runVerify]
  );

  const handleConnect = () => {
    const normalized = normalizeCustomDomain(domainInput);
    if (!normalized) {
      toast.error("Enter a valid domain");
      return;
    }
    if (mode === "subdomain" && isApexHostname(normalized)) {
      toast.error("Use a subdomain like shop.yourbrand.com", {
        description: "Or switch to Root domain.",
      });
      return;
    }
    void saveDomain(normalized);
  };

  const dnsRows = useMemo(() => {
    if (mode === "subdomain") {
      return [{ type: "CNAME", host: cnameHost, value: cnameTarget }];
    }
    return [
      { type: "A", host: "@", value: aTarget },
      { type: "CNAME", host: "www", value: cnameTarget },
    ];
  }, [mode, cnameHost, cnameTarget, aTarget]);

  const copyAllDns = async () => {
    const text = dnsRows
      .map((r) => `${r.type}\t${r.host}\t${r.value}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("All DNS records copied");
    } catch {
      toast.error("Couldn’t copy");
    }
  };

  const primaryUrl = publicHost ? `https://${publicHost}` : liveUrl;
  const primaryHost = publicHost ?? liveHost;
  const diagnosis = useMemo(() => diagnoseDomain(verify), [verify]);

  const saveDomainPrimary = useCallback(
    async (nextPrimary: DomainPrimary) => {
      if (!connectedApex || nextPrimary === domainPrimary) return;
      setSavingPrimary(true);
      try {
        const res = await fetch("/api/store/domain", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domainPrimary: nextPrimary }),
        });
        const data = (await res.json()) as {
          message?: string;
          store?: StoreWithSettings;
        };
        if (!res.ok) throw new Error(data.message ?? "Failed to update primary");
        if (data.store) setStore(data.store);
        toast.success(
          nextPrimary === "www"
            ? "Primary set to www"
            : "Primary set to root domain",
          {
            description:
              nextPrimary === "www"
                ? `${connectedApex} will redirect to www.${connectedApex}`
                : `www.${connectedApex} will redirect to ${connectedApex}`,
          }
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update primary"
        );
      } finally {
        setSavingPrimary(false);
      }
    },
    [connectedApex, domainPrimary]
  );

  const stepIndex = !steps.saved
    ? 0
    : !steps.provisioned
      ? 1
      : !steps.dns
        ? 2
        : !steps.ssl
          ? 3
          : 4;

  const lastCheckedLabel = lastCheckedAt
    ? new Date(lastCheckedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <OnlineStorePageShell>
      <div className="space-y-5">
        {/* Primary address */}
        <section className={cn(dashboardCard, "overflow-hidden")}>
          <div className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={dashboardTitle}>Domain</h2>
              <StatusChip tone={statusTone}>{statusLabel}</StatusChip>
            </div>

            <div className="mt-3 min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                {connectedDomain ? "Custom domain" : "Current address"}
              </p>
              <a
                href={primaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate font-sans text-[18px] font-semibold tracking-[-0.03em] text-neutral-900 transition hover:text-[#007AFF] dark:text-white"
              >
                {primaryHost}
              </a>
              <p className={cn(dashboardSubtitle, "mt-1 max-w-lg")}>
                {connectedDomain
                  ? verify?.live
                    ? "Customers reach your store on this hostname with SSL."
                    : "Add the DNS records below, then Check DNS until SSL goes live."
                  : "Your store is live on Ettajer. Connect a custom domain for your brand."}
              </p>
            </div>
          </div>

          {connectedDomain ? (
            <div className="border-t border-black/[0.05] px-4 py-3 dark:border-white/10">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                  Setup progress
                </p>
                <div className="flex items-center gap-2">
                  {lastCheckedLabel ? (
                    <p className="text-[10px] tabular-nums text-neutral-400">
                      Checked {lastCheckedLabel}
                    </p>
                  ) : null}
                  <p className="text-[10px] tabular-nums text-neutral-400">
                    {Math.min(stepIndex, 4)}/4
                  </p>
                </div>
              </div>
              <div className="mb-3 h-1 overflow-hidden rounded-full bg-[#F5F5F7] dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[#007AFF] transition-all duration-500"
                  style={{ width: `${(Math.min(stepIndex, 4) / 4) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Step label="Saved" done={steps.saved} />
                <Step
                  label="Provisioned"
                  done={steps.provisioned}
                  active={steps.saved && !steps.provisioned}
                />
                <Step
                  label="DNS"
                  done={steps.dns}
                  active={steps.provisioned && !steps.dns}
                />
                <Step
                  label="SSL"
                  done={steps.ssl}
                  active={steps.dns && !steps.ssl}
                />
              </div>

              {diagnosis ? (
                <div className="mt-3 rounded-[10px] border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
                    {diagnosis.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-200/80">
                    Fix: {diagnosis.fix}
                  </p>
                </div>
              ) : verify?.live ? (
                <p className="mt-3 text-[11px] text-emerald-700 dark:text-emerald-400">
                  {verify.dns?.detail ?? "Domain is live with SSL."}
                </p>
              ) : null}

              {!verify?.live ? (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="outline"
                    className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                    disabled={verifying}
                    onClick={() => void runVerify(false)}
                  >
                    {verifying ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : null}
                    Check now
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-7 rounded-md px-2 text-[11px] text-neutral-500"
                    onClick={() => setWatching((w) => !w)}
                  >
                    {watching ? (
                      <>
                        <Pause className="mr-1.5 h-3 w-3" />
                        Stop auto-check
                      </>
                    ) : (
                      <>
                        <Play className="mr-1.5 h-3 w-3" />
                        Auto-check every 30s
                      </>
                    )}
                  </Button>
                  {watching ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#007AFF]" />
                      Watching…
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {connectedApex ? (
          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="px-4 py-3">
              <h2 className={dashboardTitle}>Primary address</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Visitors on the other hostname are redirected here (308).
              </p>
              <div className={cn(dashboardPillGroup, "mt-3")}>
                {(
                  [
                    {
                      id: "apex" as const,
                      label: connectedApex,
                      hint: "Root",
                    },
                    {
                      id: "www" as const,
                      label: `www.${connectedApex}`,
                      hint: "www",
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={savingPrimary}
                    onClick={() => void saveDomainPrimary(opt.id)}
                    className={cn(
                      dashboardPill,
                      "flex-1 sm:flex-none",
                      domainPrimary === opt.id
                        ? dashboardPillActive
                        : dashboardPillInactive
                    )}
                  >
                    <span className="block text-left">
                      {opt.label}
                      <span className="ml-1.5 text-[10px] font-normal text-neutral-400">
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                {domainPrimary === "www" ? (
                  <>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {connectedApex}
                    </span>{" "}
                    → redirects to{" "}
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      www.{connectedApex}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      www.{connectedApex}
                    </span>{" "}
                    → redirects to{" "}
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {connectedApex}
                    </span>
                  </>
                )}
                {savingPrimary ? (
                  <Loader2 className="ml-1.5 inline h-3 w-3 animate-spin" />
                ) : null}
              </p>
            </div>
          </section>
        ) : null}

        {/* Connect + DNS */}
        <section
          id="domain-connect"
          className={cn(dashboardCard, "scroll-mt-4 overflow-hidden")}
        >
          <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
            <h2 className={dashboardTitle}>
              {connectedDomain ? "Update hostname" : "Connect custom domain"}
            </h2>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              1) Choose type · 2) Enter hostname · 3) Add DNS · 4) Check until Live
            </p>
          </div>

          <div className="space-y-4 px-4 py-3">
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                Domain type
              </p>
              <div className={dashboardPillGroup}>
                {(
                  [
                    {
                      id: "subdomain" as const,
                      label: "Subdomain",
                      hint: "shop.brand.com",
                    },
                    {
                      id: "apex" as const,
                      label: "Root domain",
                      hint: "brand.com",
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={cn(
                      dashboardPill,
                      "flex-1 sm:flex-none",
                      mode === opt.id ? dashboardPillActive : dashboardPillInactive
                    )}
                  >
                    <span className="block text-left">
                      {opt.label}
                      <span className="ml-1.5 text-[10px] font-normal text-neutral-400">
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="domain-input"
                className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
              >
                {mode === "apex" ? "Root domain" : "Hostname"}
              </label>
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400">
                    https://
                  </span>
                  <Input
                    id="domain-input"
                    className="h-8 rounded-md border-black/[0.06] bg-white pl-[3.4rem] font-sans text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-white/[0.04]"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConnect();
                    }}
                    placeholder={
                      mode === "apex" ? "yourbrand.com" : "shop.yourbrand.com"
                    }
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <Button
                  onClick={handleConnect}
                  loading={saving}
                  disabled={!dirty && Boolean(connectedDomain)}
                  className={cn(dashboardPrimaryBtn, "h-8 shrink-0 px-3")}
                >
                  {connectedDomain ? (dirty ? "Save" : "Saved") : "Connect"}
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  DNS records to add
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copyAllDns()}
                    className="text-[11px] font-medium text-neutral-500 transition hover:text-[#007AFF]"
                  >
                    Copy all
                  </button>
                  <Link
                    href="/help/category/domains-hosting"
                    className="text-[11px] text-neutral-400 transition hover:text-[#007AFF]"
                  >
                    Guide
                  </Link>
                </div>
              </div>

              <div className="overflow-hidden rounded-[10px] border border-black/[0.06] dark:border-white/10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black/[0.05] bg-[#F5F5F7] text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.04]">
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Host</th>
                      <th className="px-3 py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnsRows.map((row, i) => (
                      <tr
                        key={`${row.type}-${row.host}`}
                        className={cn(
                          i < dnsRows.length - 1 &&
                            "border-b border-black/[0.04] dark:border-white/5"
                        )}
                      >
                        <td className="px-3 py-2.5 font-sans text-[11px] text-neutral-500">
                          {row.type}
                        </td>
                        <td className="px-3 py-2.5">
                          <CopyCell value={row.host} />
                        </td>
                        <td className="px-3 py-2.5">
                          <CopyCell value={row.value} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-2 text-[10px] text-neutral-400">
                Need registrar steps? Open the tips icon next to Help, or see the{" "}
                <Link
                  href="/help/category/domains-hosting"
                  className="font-medium text-[#007AFF] hover:underline"
                >
                  Domains guides
                </Link>
                .
              </p>
            </div>

            {connectedDomain ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] pt-3 dark:border-white/10">
                <Button
                  variant="outline"
                  className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                  disabled={verifying}
                  onClick={() => void runVerify(false)}
                >
                  {verifying ? (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  ) : null}
                  Check DNS
                </Button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 transition hover:text-red-600"
                  onClick={() => setRemoveOpen(true)}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove domain
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent
          className={cn(
            "w-[min(100vw-1.5rem,360px)] max-w-[360px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10"
          )}
        >
          <DialogHeader className="space-y-0 px-3.5 pb-0 pt-3.5 pr-10 text-left">
            <DialogTitle className="text-[13px] font-semibold tracking-[-0.02em]">
              Remove domain?
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[11px] text-neutral-500">
              {connectedDomain} will stop mapping to your store. Your Ettajer link stays
              online.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-1.5 px-3.5 pb-3.5 pt-3">
            <Button
              className="h-7 flex-1 rounded-md bg-red-600 px-2.5 text-[12px] font-medium text-white shadow-none [background-image:none] hover:bg-red-700 hover:scale-100"
              loading={saving}
              onClick={() => {
                setRemoveOpen(false);
                void saveDomain(null);
              }}
            >
              Remove
            </Button>
            <Button
              variant="ghost"
              className="h-7 rounded-md px-2.5 text-[11px] text-neutral-500"
              onClick={() => setRemoveOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </OnlineStorePageShell>
  );
}
