"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DeliverabilityBundle } from "@/lib/email-marketing/deliverability";
import type { EmailSendingDomainRow } from "@/lib/email-marketing/sending-domains";
import type { EmailSuppressionRow } from "@/lib/email-marketing/suppression";
import type { EmailProviderStatus } from "@/lib/email-marketing/providers/types";
import type { SenderReputation } from "@/lib/email-marketing/reputation";

interface EmailDeliverabilityClientProps {
  initial: DeliverabilityBundle;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "verified") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }
  if (status === "failed") {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }
  return <CircleAlert className="h-4 w-4 text-amber-500" />;
}

function reputationColor(grade: SenderReputation["grade"]) {
  switch (grade) {
    case "excellent":
      return "text-emerald-600";
    case "good":
      return "text-neutral-950 dark:text-white";
    case "fair":
      return "text-amber-600";
    case "poor":
      return "text-orange-600";
    case "critical":
      return "text-red-600";
    default:
      return "text-neutral-500";
  }
}

function providerHealthLabel(health: EmailProviderStatus["health"]) {
  switch (health) {
    case "configured":
      return "Ready";
    case "missing_credentials":
      return "Not configured";
    case "degraded":
      return "Needs credentials";
    case "inactive":
      return "Standby";
    default:
      return health;
  }
}

export function EmailDeliverabilityClient({
  initial,
}: EmailDeliverabilityClientProps) {
  const [bundle, setBundle] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [suppressionEmail, setSuppressionEmail] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "bounce" | "complaint" | "unsubscribe" | "manual">("all");

  const filteredSuppressions = useMemo(() => {
    if (filter === "all") return bundle.suppressions;
    return bundle.suppressions.filter((s) => s.reason === filter);
  }, [bundle.suppressions, filter]);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/email/deliverability");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to refresh"
        );
      }
      setBundle(data as DeliverabilityBundle);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  async function postAction(body: Record<string, unknown>) {
    const res = await fetch("/api/email/deliverability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof data.message === "string" ? data.message : "Action failed"
      );
    }
    return data;
  }

  async function addDomain() {
    if (!domainInput.trim()) return;
    try {
      await postAction({
        action: "add_domain",
        domain: domainInput.trim(),
        provider: bundle.activeProvider,
      });
      setDomainInput("");
      toast.success("Domain added");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function verifyDomain(domainId: string) {
    setVerifyingId(domainId);
    try {
      const data = await postAction({
        action: "verify_domain",
        domainId,
      });
      const checks = data.checks as {
        allVerified?: boolean;
      };
      toast.success(
        checks?.allVerified
          ? "SPF, DKIM, and DMARC verified"
          : "Verification complete — check status below"
      );
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verify failed");
    } finally {
      setVerifyingId(null);
    }
  }

  async function removeDomain(domainId: string) {
    try {
      await postAction({ action: "delete_domain", domainId });
      toast.success("Domain removed");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Remove failed");
    }
  }

  async function addSuppression() {
    if (!suppressionEmail.trim()) return;
    try {
      await postAction({
        action: "add_suppression",
        email: suppressionEmail.trim(),
        reason: "manual",
      });
      setSuppressionEmail("");
      toast.success("Added to suppression list");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function removeSuppression(email: string) {
    try {
      await postAction({ action: "remove_suppression", email });
      toast.success("Removed from suppression list");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  const reputation = bundle.reputation;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
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

      {/* Reputation */}
      <section className="space-y-4 border-b border-neutral-100 pb-8 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
              Sender reputation
            </p>
            <p
              className={cn(
                "mt-2 text-[40px] font-semibold tabular-nums tracking-[-0.045em]",
                reputationColor(reputation.grade)
              )}
            >
              {reputation.score}
            </p>
            <p
              className={cn(
                "text-[14px] font-medium",
                reputationColor(reputation.grade)
              )}
            >
              {reputation.label}
            </p>
            <p className="mt-1 text-[12px] text-neutral-400">
              Last {reputation.days} days · from {bundle.sender.from}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {[
              { label: "Delivery", value: `${reputation.deliveryRate}%` },
              { label: "Bounce", value: `${reputation.bounceRate}%` },
              { label: "Complaint", value: `${reputation.complaintRate}%` },
              { label: "Sent", value: String(reputation.sent) },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-[11px] text-neutral-400">{m.label}</p>
                <p className="mt-1 text-[18px] font-semibold tabular-nums tracking-[-0.03em] text-neutral-950 dark:text-white">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>
        {reputation.tips.length > 0 ? (
          <ul className="space-y-1.5">
            {reputation.tips.map((tip) => (
              <li key={tip} className="text-[12px] text-neutral-400">
                {tip}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* Provider status */}
      <section className="space-y-3">
        <div>
          <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            Provider status
          </h3>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            Active:{" "}
            <span className="text-neutral-700 dark:text-neutral-200">
              {bundle.activeProvider}
            </span>
            {" · "}
            Set <code className="text-[11px]">EMAIL_PROVIDER</code> to switch
          </p>
        </div>
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
          {bundle.providers.map((provider) => (
            <li
              key={provider.id}
              className="flex items-start justify-between gap-3 px-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
                  {provider.label}
                  {provider.active ? (
                    <span className="ml-2 text-[11px] font-medium text-neutral-400">
                      Active
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  Webhook{" "}
                  {provider.webhookRegistered ? "registered" : "pending"} ·{" "}
                  <span className="font-mono text-[10px]">
                    {provider.webhookPath}
                  </span>
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-neutral-400">
                {provider.active
                  ? "Ready"
                  : providerHealthLabel(provider.health)}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-neutral-400">
          Retries: up to {bundle.retries.maxAttempts} attempts · backoff{" "}
          {bundle.retries.backoffSeconds.join("s → ")}s
        </p>
      </section>

      {/* DNS auth */}
      <section className="space-y-3">
        <div>
          <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            Domain authentication
          </h3>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            Verify SPF, DKIM, and DMARC for your sending domain
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="example.com"
            className="h-9 max-w-xs rounded-full border-neutral-200 bg-neutral-50 text-[13px] dark:border-white/10 dark:bg-white/[0.04]"
          />
          <Button
            type="button"
            className="h-9 rounded-full bg-neutral-950 px-4 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            onClick={() => void addDomain()}
          >
            Add domain
          </Button>
        </div>

        {bundle.domains.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-200 px-3 py-8 text-center text-[12px] text-neutral-400 dark:border-white/15">
            No sending domains yet. Add the domain in your EMAIL_FROM address.
          </p>
        ) : (
          <div className="space-y-2">
            {bundle.domains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                verifying={verifyingId === domain.id}
                onVerify={() => void verifyDomain(domain.id)}
                onRemove={() => void removeDomain(domain.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Suppression */}
      <section className="space-y-3">
        <div>
          <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            Suppression list
          </h3>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            {bundle.suppressionCount} suppressed · bounce & complaint webhooks
            add automatically
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {(
            [
              ["all", "All"],
              ["bounce", "Bounces"],
              ["complaint", "Complaints"],
              ["unsubscribe", "Unsubscribes"],
              ["manual", "Manual"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                filter === id
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            value={suppressionEmail}
            onChange={(e) => setSuppressionEmail(e.target.value)}
            placeholder="email@example.com"
            className="h-9 max-w-xs rounded-full border-neutral-200 bg-neutral-50 text-[13px] dark:border-white/10 dark:bg-white/[0.04]"
          />
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-neutral-200 px-4 text-[12px] dark:border-white/10"
            onClick={() => void addSuppression()}
          >
            Suppress
          </Button>
        </div>

        {filteredSuppressions.length === 0 ? (
          <p className="text-[12px] text-neutral-400">
            No suppressions in this filter.
          </p>
        ) : (
          <div className="max-h-64 space-y-0 overflow-y-auto overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
            {filteredSuppressions.map((row) => (
              <SuppressionRow
                key={row.id}
                row={row}
                onRemove={() => void removeSuppression(row.email)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DomainCard({
  domain,
  verifying,
  onVerify,
  onRemove,
}: {
  domain: EmailSendingDomainRow;
  verifying: boolean;
  onVerify: () => void;
  onRemove: () => void;
}) {
  const detail = domain.lastCheckDetail as
    | {
        spf?: { detail?: string };
        dkim?: { detail?: string };
        dmarc?: { detail?: string };
      }
    | null;

  return (
    <div className="rounded-2xl border border-neutral-100 px-4 py-3 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
            {domain.domain}
          </p>
          <p className="text-[11px] text-neutral-400">
            Provider: {domain.provider}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            className="h-7 rounded-md border-black/[0.06] px-2 text-[11px] dark:border-white/10"
            onClick={onVerify}
            disabled={verifying}
          >
            {verifying ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-3 w-3" />
            )}
            Verify DNS
          </Button>
          <button
            type="button"
            aria-label="Remove domain"
            onClick={onRemove}
            className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
        {(
          [
            ["SPF", domain.spfStatus, detail?.spf?.detail],
            ["DKIM", domain.dkimStatus, detail?.dkim?.detail],
            ["DMARC", domain.dmarcStatus, detail?.dmarc?.detail],
          ] as const
        ).map(([label, status, tip]) => (
          <div
            key={label}
            className="rounded bg-[#F5F5F7] px-2 py-1.5 dark:bg-white/[0.04]"
          >
            <div className="flex items-center gap-1.5">
              <StatusIcon status={status} />
              <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                {label}
              </span>
              <span className="text-[10px] capitalize text-neutral-400">
                {status}
              </span>
            </div>
            {tip ? (
              <p className="mt-0.5 line-clamp-2 text-[10px] text-neutral-500">
                {tip}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SuppressionRow({
  row,
  onRemove,
}: {
  row: EmailSuppressionRow;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-black/[0.05] px-2 py-1.5 dark:border-white/10">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
          {row.email}
        </p>
        <p className="text-[10px] text-neutral-500">
          {row.reason}
          {row.bounceType ? ` · ${row.bounceType}` : ""}
          {" · "}
          {row.source}
          {row.expiresAt ? ` · expires ${new Date(row.expiresAt).toLocaleDateString()}` : ""}
        </p>
      </div>
      <button
        type="button"
        aria-label="Remove suppression"
        onClick={onRemove}
        className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
