"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  ListOrdered,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { buildFacebookDomainVerificationMetaTag } from "@/lib/meta-domain-verification";
import { cn } from "@/lib/utils";
import type { MarketingPlatformLink } from "@/lib/marketing-integrations";

interface MarketingPlatformDomainPanelProps {
  link: MarketingPlatformLink;
  onChange: (patch: Partial<MarketingPlatformLink>) => void;
}

interface DomainStatusPayload {
  storefrontUrl: string;
  customDomain: string | null;
  rootDomain: string | null;
  verifyOnCustomDomain: boolean;
  code: string | null;
  metaTag: string | null;
  markedVerifiedAt: string | null;
  live: {
    ok: boolean;
    foundCode: string | null;
    matches: boolean;
    status: number | null;
    error: string | null;
  } | null;
  guide: {
    businessDomainsUrl: string;
    helpUrl: string;
    steps: string[];
  };
}

function formatWhen(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MarketingPlatformDomainPanel({
  link,
  onChange,
}: MarketingPlatformDomainPanelProps) {
  const [status, setStatus] = useState<DomainStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const draftCode = link.domainVerificationCode ?? "";

  const previewTag = useMemo(
    () =>
      draftCode.trim()
        ? buildFacebookDomainVerificationMetaTag(draftCode.trim())
        : null,
    [draftCode]
  );

  async function loadStatus(opts?: { check?: boolean }) {
    if (opts?.check) setChecking(true);
    else setLoading(true);
    try {
      const qs = opts?.check ? "?check=1" : "";
      const res = await fetch(`/api/marketing/meta/domain-verification${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load domain status");
      setStatus(data as DomainStatusPayload);
      if (opts?.check) {
        if (data.live?.ok) {
          toast.success("Verification meta tag found on your storefront");
        } else if (data.live?.error) {
          toast.error(data.live.error);
        } else if (data.live && !data.live.matches) {
          toast.message(
            data.live.foundCode
              ? "A different verification code is on the storefront — save & retry"
              : "Meta tag not found yet — save your code, then check again"
          );
        }
      }
    } catch (err) {
      if (opts?.check) {
        toast.error(err instanceof Error ? err.message : "Check failed");
      } else {
        setStatus(null);
      }
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }

  useEffect(() => {
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link.domainVerificationCode, link.domainVerifiedAt]);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  }

  const checklist = [
    {
      ok: Boolean(status?.verifyOnCustomDomain),
      label: "Custom domain connected",
      hint: "Meta verifies your own domain (not ettajer.com)",
    },
    {
      ok: Boolean(draftCode.trim()),
      label: "Verification code saved",
      hint: "Paste the content value from Meta",
    },
    {
      ok: Boolean(status?.live?.ok),
      label: "Meta tag live on storefront",
      hint: "Save, then Check status",
    },
    {
      ok: Boolean(link.domainVerifiedAt || status?.markedVerifiedAt),
      label: "Marked verified in Meta",
      hint: "After Meta shows Verified",
    },
  ];

  const aemPriority = [
    { rank: 1, event: "Purchase", why: "Highest value — optimize ads for sales" },
    { rank: 2, event: "InitiateCheckout", why: "Strong purchase intent" },
    { rank: 3, event: "AddToCart", why: "Retargeting & mid-funnel" },
    { rank: 4, event: "ViewContent", why: "Product interest" },
    { rank: 5, event: "PageView", why: "Broad traffic (lowest priority)" },
  ];

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1877F2]/10 text-[#1877F2]">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className={dashboardTitle}>Domain verification</h3>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Verify your domain in Meta Business Manager for Aggregated Event
                Measurement and link ownership. We inject the meta tag on your
                storefront.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-[11px] text-neutral-500"
            onClick={() => void loadStatus()}
            disabled={loading || checking}
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: "Domain",
              value: loading
                ? "…"
                : status?.rootDomain || status?.customDomain || "Not set",
            },
            {
              label: "Code",
              value: draftCode.trim() ? "Saved" : "Missing",
            },
            {
              label: "Tag live",
              value: checking
                ? "…"
                : status?.live
                  ? status.live.ok
                    ? "Yes"
                    : "No"
                  : "Not checked",
            },
            {
              label: "In Meta",
              value: link.domainVerifiedAt ? "Verified" : "Pending",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                {item.label}
              </p>
              <p className="mt-1 truncate text-[13px] font-semibold text-neutral-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {!status?.verifyOnCustomDomain ? (
          <div className="rounded-[10px] border border-amber-500/20 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Meta verifies a domain you own. Connect a custom domain first, then
            verify that root domain in Business Manager.{" "}
            <Link
              href="/dashboard/domains"
              className="font-medium underline-offset-2 hover:underline"
            >
              Open Domains
            </Link>
          </div>
        ) : (
          <div className="rounded-[10px] border border-black/[0.05] px-3 py-2.5 dark:border-white/10">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              Verify in Meta as{" "}
              <span className="font-mono">{status.rootDomain}</span>
            </p>
            <p className={cn(dashboardSubtitle, "mt-1")}>
              Storefront URL:{" "}
              <a
                href={status.storefrontUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#1877F2] underline-offset-2 hover:underline"
              >
                {status.storefrontUrl}
              </a>
            </p>
          </div>
        )}

        <div className="rounded-[10px] border border-black/[0.05] px-3 py-3 dark:border-white/10">
          <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
            Readiness
          </p>
          <ul className="mt-2 space-y-1.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-[12px]">
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                    item.ok
                      ? "bg-emerald-500 text-white"
                      : "bg-[#F5F5F7] text-neutral-400 dark:bg-white/[0.08]"
                  )}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span>
                  <span
                    className={cn(
                      "font-medium",
                      item.ok
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-500"
                    )}
                  >
                    {item.label}
                  </span>
                  {!item.ok ? (
                    <span className="text-neutral-400"> — {item.hint}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="meta-domain-verification-code"
            className="text-[11px] font-medium text-neutral-500"
          >
            Meta verification code
          </Label>
          <Input
            id="meta-domain-verification-code"
            value={draftCode}
            onChange={(e) => {
              const next =
                e.target.value.trim().length === 0
                  ? null
                  : e.target.value;
              onChange({
                domainVerificationCode: next,
                ...(next ? {} : { domainVerifiedAt: null }),
              });
            }}
            placeholder="Paste content from Meta (e.g. ab12cd34…)"
            className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
          />
          <p className={dashboardSubtitle}>
            From Domains → your domain → Meta-tag verification. Save Meta settings
            so the tag appears on your homepage.
          </p>
        </div>

        {previewTag ? (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-neutral-500">
              Meta tag on storefront
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                readOnly
                value={previewTag}
                className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[11px] dark:border-white/10 dark:bg-white/[0.05]"
                onFocus={(e) => e.target.select()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
                onClick={() => void copyText(previewTag, "Meta tag")}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            className="h-8 rounded-md bg-[#1877F2] px-3 text-[12px] text-white hover:bg-[#166FE5]"
            onClick={() => void loadStatus({ check: true })}
            loading={checking}
            disabled={checking || !draftCode.trim()}
          >
            Check status
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            disabled={!draftCode.trim()}
            onClick={() =>
              onChange({
                domainVerifiedAt: new Date().toISOString(),
              })
            }
          >
            Mark verified in Meta
          </Button>
          {link.domainVerifiedAt ? (
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-md px-2.5 text-[12px]"
              onClick={() => onChange({ domainVerifiedAt: null })}
            >
              Clear verified mark
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            asChild
          >
            <a
              href={
                status?.guide.businessDomainsUrl ??
                "https://business.facebook.com/settings/owned-domains"
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Open Domains
            </a>
          </Button>
        </div>

        {link.domainVerifiedAt ? (
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            Marked verified {formatWhen(link.domainVerifiedAt)}. Keep the meta tag
            published — Meta may re-check.
          </p>
        ) : null}

        <div className="rounded-[10px] border border-[#1877F2]/20 bg-[#1877F2]/[0.04] px-3 py-3 dark:border-[#1877F2]/30">
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1877F2]/10 text-[#1877F2]">
              <ListOrdered className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                Aggregated Event Measurement (AEM) priority
              </p>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                After the domain is verified, open Events Manager → your pixel →
                Aggregated Event Measurement and set this order (8-event limit on
                iOS). Match Ettajer&apos;s tracked events.
              </p>
              <ol className="mt-2.5 space-y-1.5">
                {aemPriority.map((item) => (
                  <li
                    key={item.event}
                    className="flex items-start gap-2 text-[12px]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-[10px] font-semibold text-white">
                      {item.rank}
                    </span>
                    <span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {item.event}
                      </span>
                      <span className="text-neutral-400"> — {item.why}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md border-[#1877F2]/25 px-2.5 text-[12px] text-[#1877F2] hover:bg-[#1877F2]/5 dark:border-[#1877F2]/40"
                  asChild
                >
                  <a
                    href="https://business.facebook.com/events_manager2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open Events Manager
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-md px-2.5 text-[12px]"
                  asChild
                >
                  <a
                    href="https://www.facebook.com/business/help/1179145642402618"
                    target="_blank"
                    rel="noreferrer"
                  >
                    AEM help
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-dashed border-black/[0.08] px-3 py-3 dark:border-white/10">
          <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
            Guide
          </p>
          <ol className="mt-2 space-y-1.5">
            {(status?.guide.steps ?? []).map((step, index) => (
              <li
                key={step}
                className="flex gap-2 text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[10px] font-medium text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className={cn(dashboardSubtitle, "mt-2.5")}>
            DNS TXT and HTML file upload also work in Meta — meta-tag is the
            easiest on Ettajer.{" "}
            <a
              href={
                status?.guide.helpUrl ??
                "https://www.facebook.com/business/help/321167023127050"
              }
              target="_blank"
              rel="noreferrer"
              className="text-[#1877F2] underline-offset-2 hover:underline"
            >
              Meta help
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
