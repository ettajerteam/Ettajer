"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  detectDomainMode,
  isApexHostname,
  subdomainLabel,
  type DomainMode,
} from "@/lib/domains/hostname";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

const FALLBACK_CNAME =
  process.env.NEXT_PUBLIC_DOMAIN_CNAME_TARGET?.trim() || "cname.vercel-dns.com";
const FALLBACK_A =
  process.env.NEXT_PUBLIC_DOMAIN_A_TARGET?.trim() || "76.76.21.21";

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
      className="group inline-flex max-w-full items-center gap-2 text-left font-mono text-[13px] text-neutral-800 transition hover:text-neutral-950"
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
      <span className="truncate border-b border-transparent group-hover:border-neutral-300">
        {value}
      </span>
      {copied ? (
        <Check className="h-3 w-3 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 text-neutral-300 opacity-0 transition group-hover:opacity-100" />
      )}
    </button>
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
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
          done
            ? "bg-neutral-900 text-white"
            : active
              ? "border border-neutral-900 text-neutral-900"
              : "border border-neutral-200 text-neutral-300"
        )}
      >
        {done ? <Check className="h-3 w-3" /> : null}
      </span>
      <span
        className={cn(
          "text-xs",
          done || active ? "text-neutral-800" : "text-neutral-400"
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

  const liveUrl = getAbsoluteStoreUrl(store.slug);
  const connectedDomain = store.settings.customDomain;
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
      if (!silent) {
        if (!data.connected) toast.message("No custom domain yet");
        else if (data.live) toast.success("Domain is live");
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
    if (connectedDomain) void runVerify(true);
  }, [connectedDomain, runVerify]);

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

  return (
    <OnlineStorePageShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn(dashboardCard, "overflow-hidden")}
        >
          <div className={cn(dashboardCardPad, "space-y-6 sm:p-7")}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className={dashboardKicker}>Domains</p>
              <p className="text-[11px] font-medium tracking-wide text-neutral-400">
                {statusLabel}
              </p>
            </div>

            <div className="space-y-2">
              <h1 className="text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.035em] text-neutral-950 sm:text-[2rem]">
                {connectedDomain ? (
                  <a
                    href={`https://${connectedDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-[#007AFF]"
                  >
                    {connectedDomain}
                  </a>
                ) : (
                  <>ettajer.com/store/{store.slug}</>
                )}
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-neutral-500">
                {connectedDomain
                  ? verify?.live
                    ? "Traffic and SSL are ready on this hostname."
                    : "Hostname is on Ettajer. Finish DNS, then check again."
                  : "Your storefront is live on Ettajer. Connect your own domain when you’re ready."}
              </p>
            </div>

            {connectedDomain ? (
              <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-4">
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
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              {connectedDomain ? (
                <>
                  <Button
                    size="sm"
                    className={cn(dashboardPrimaryBtn, "h-9 px-3.5")}
                    asChild
                  >
                    <a
                      href={`https://${connectedDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-neutral-200"
                    disabled={verifying}
                    onClick={() => void runVerify(false)}
                  >
                    {verifying ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Check DNS
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 text-neutral-500"
                    onClick={() => setRemoveOpen(true)}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className={cn(dashboardPrimaryBtn, "h-9 px-3.5")}
                  onClick={() => document.getElementById("domain-input")?.focus()}
                >
                  Connect a domain
                </Button>
              )}
            </div>

            {connectedDomain && verify?.dns ? (
              <p
                className={cn(
                  "text-xs",
                  verify.live ? "text-neutral-500" : "text-amber-800/80"
                )}
              >
                {verify.dns.detail}
                {verify.recommendations?.misconfigured
                  ? " · Vercel still reports DNS as incomplete."
                  : null}
              </p>
            ) : null}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3 px-0.5"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className={dashboardKicker}>Ettajer link</p>
              <p className="mt-1 font-mono text-sm text-neutral-800">
                {liveUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                className="font-medium text-neutral-500 transition hover:text-neutral-900"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(liveUrl);
                    toast.success("Link copied");
                  } catch {
                    toast.error("Couldn’t copy");
                  }
                }}
              >
                Copy
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-500 transition hover:text-neutral-900"
              >
                Open
              </a>
              <Link
                href="/dashboard/settings?tab=website"
                className="font-medium text-neutral-500 transition hover:text-neutral-900"
              >
                Edit slug
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(dashboardCard, "overflow-hidden")}
        >
          <div className={cn(dashboardCardPad, "border-b border-neutral-100 sm:px-7 sm:pt-6")}>
            <p className={dashboardKicker}>Custom domain</p>
            <h2 className={cn(dashboardTitle, "mt-1 text-lg")}>
              {connectedDomain ? "Update hostname" : "Point your domain here"}
            </h2>
            <p className={cn(dashboardSubtitle, "mt-1 max-w-lg leading-relaxed")}>
              Connect the hostname, then add DNS at your registrar. We provision SSL
              automatically once DNS is correct.
            </p>
          </div>

          <div className={cn(dashboardCardPad, "space-y-8 sm:p-7")}>
            <div className="flex gap-6 border-b border-neutral-100">
              {(
                [
                  { id: "subdomain" as const, label: "Subdomain" },
                  { id: "apex" as const, label: "Root domain" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id)}
                  className={cn(
                    "relative pb-3 text-sm transition",
                    mode === opt.id
                      ? "font-medium text-neutral-950"
                      : "text-neutral-400 hover:text-neutral-700"
                  )}
                >
                  {opt.label}
                  {mode === opt.id ? (
                    <motion.span
                      layoutId="domain-mode-underline"
                      className="absolute inset-x-0 -bottom-px h-px bg-neutral-950"
                    />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label htmlFor="domain-input" className="text-xs font-medium text-neutral-600">
                {mode === "apex" ? "Domain" : "Hostname"}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  id="domain-input"
                  className="h-11 flex-1 rounded-xl border-neutral-200 bg-white font-mono text-sm tracking-tight shadow-none focus-visible:ring-neutral-900/10"
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
                <Button
                  onClick={handleConnect}
                  loading={saving}
                  disabled={!dirty && Boolean(connectedDomain)}
                  className={cn(dashboardPrimaryBtn, "h-11 shrink-0 px-5")}
                >
                  {connectedDomain ? (dirty ? "Save" : "Saved") : "Connect"}
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="text-xs font-medium text-neutral-600">DNS records</p>
                <Link
                  href="/help/connect-a-custom-domain"
                  className="text-xs text-neutral-400 transition hover:text-neutral-700"
                >
                  Guide
                </Link>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200/90">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] uppercase tracking-[0.06em] text-neutral-400">
                      <th className="px-4 py-2.5 font-medium">Type</th>
                      <th className="px-4 py-2.5 font-medium">Host</th>
                      <th className="px-4 py-2.5 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {mode === "subdomain" ? (
                      <tr>
                        <td className="px-4 py-3.5 font-mono text-xs text-neutral-500">
                          CNAME
                        </td>
                        <td className="px-4 py-3.5">
                          <CopyCell value={cnameHost} />
                        </td>
                        <td className="px-4 py-3.5">
                          <CopyCell value={cnameTarget} />
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr className="border-b border-neutral-50">
                          <td className="px-4 py-3.5 font-mono text-xs text-neutral-500">A</td>
                          <td className="px-4 py-3.5">
                            <CopyCell value="@" />
                          </td>
                          <td className="px-4 py-3.5">
                            <CopyCell value={aTarget} />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3.5 font-mono text-xs text-neutral-500">
                            CNAME
                          </td>
                          <td className="px-4 py-3.5">
                            <CopyCell value="www" />
                          </td>
                          <td className="px-4 py-3.5">
                            <CopyCell value={cnameTarget} />
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                After saving DNS, wait a few minutes and press Check DNS. Your Ettajer link
                keeps working either way.
              </p>
            </div>

            {connectedDomain ? (
              <div className="flex items-center justify-between border-t border-neutral-100 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-neutral-200"
                  disabled={verifying}
                  onClick={() => void runVerify(false)}
                >
                  {verifying ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Check DNS
                </Button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-red-600"
                  onClick={() => setRemoveOpen(true)}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove domain
                </button>
              </div>
            ) : null}
          </div>
        </motion.section>
      </div>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {connectedDomain}?</DialogTitle>
            <DialogDescription>
              The custom hostname will stop mapping to your store. Your Ettajer link stays
              online.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={saving}
              onClick={() => {
                setRemoveOpen(false);
                void saveDomain(null);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OnlineStorePageShell>
  );
}
