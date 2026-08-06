"use client";

/** Email providers, domains, senders, and logs — readiness/health live in the header popup. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CheckCircle2,
  Link2,
  Mail,
  Megaphone,
  RefreshCw,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardPrimaryBtn,
  dashboardSegmentNav,
  dashboardSegmentTab,
  dashboardSegmentTabActive,
  dashboardSegmentTabInactive,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { StoreEmailProviderRow } from "@/lib/mailhub/providers";
import type { EmailIdentityRow } from "@/lib/mailhub/identities";
import type { EmailLogRow } from "@/lib/mailhub/logs";
import {
  MAILHUB_PROVIDER_KINDS,
  MAILHUB_PROVIDER_LABELS,
  type MailHubProviderKind,
} from "@/lib/mailhub/types";

type Tab = "providers" | "domains" | "identities" | "logs";

interface DomainRow {
  id: string;
  domain: string;
  provider: string;
  spfStatus: string;
  dkimStatus: string;
  dmarcStatus: string;
  verificationStatus?: string;
  isDefault?: boolean;
  expectedRecords?: unknown;
}

interface CatalogItem {
  kind: string;
  label: string;
  available: boolean;
  requiresSecrets: boolean;
}

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

const SELECT =
  "h-9 w-full rounded-md border border-black/[0.06] bg-white px-3 text-[13px] dark:border-white/10 dark:bg-transparent";

function StatusDot({ ok }: { ok: boolean | null | undefined }) {
  if (ok == null) return <span className="h-2 w-2 rounded-full bg-neutral-300" />;
  return ok ? (
    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  ) : (
    <XCircle className="h-3.5 w-3.5 text-red-500" />
  );
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (s === "verified" || s === "active" || s === "sent" || s === "delivered")
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (s === "failed" || s === "bounced" || s === "rejected")
    return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300";
  if (s === "pending" || s === "queued")
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-black/[0.03] text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300";
}

export function MailHubSettingsClient() {
  const [tab, setTab] = useState<Tab>("providers");
  const [busy, setBusy] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [providers, setProviders] = useState<StoreEmailProviderRow[]>([]);
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [identities, setIdentities] = useState<EmailIdentityRow[]>([]);
  const [logs, setLogs] = useState<EmailLogRow[]>([]);
  const [logQ, setLogQ] = useState("");

  const [kind, setKind] = useState<MailHubProviderKind>("resend");
  const [providerName, setProviderName] = useState("My Resend");
  const [apiKey, setApiKey] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpEnc, setSmtpEnc] = useState<"ssl" | "tls" | "starttls" | "none">(
    "starttls"
  );
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [mailgunDomain, setMailgunDomain] = useState("");
  const [testTo, setTestTo] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newIdentity, setNewIdentity] = useState("");
  const [identityName, setIdentityName] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadGenRef = useRef(0);

  const refreshOverview = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    const gen = ++loadGenRef.current;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/mailhub?view=overview");
      const data = await res.json().catch(() => ({}));
      if (gen !== loadGenRef.current) return;
      if (!res.ok) throw new Error(data.message || "Failed to load");
      setCatalog(data.catalog || []);
      setProviders(data.providers || []);
      setDomains(data.domains || []);
      setIdentities(data.identities || []);
      setLogs(data.recentLogs || []);
    } catch (e) {
      if (gen !== loadGenRef.current) return;
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      if (gen === loadGenRef.current) {
        setRefreshing(false);
        setInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refreshOverview();
    return () => {
      // Invalidate in-flight responses on unmount so they never update state
      loadGenRef.current += 1;
    };
  }, [refreshOverview]);

  const tabs: { id: Tab; label: string; count?: number }[] = useMemo(
    () => [
      { id: "providers", label: "Providers", count: providers.length },
      { id: "domains", label: "Domains", count: domains.length },
      { id: "identities", label: "Senders", count: identities.length },
      { id: "logs", label: "Logs", count: logs.length },
    ],
    [domains.length, identities.length, logs.length, providers.length]
  );

  async function saveProvider() {
    setBusy("save-provider");
    try {
      const config: Record<string, unknown> = {
        fromEmail: fromEmail || undefined,
        fromName: fromName || undefined,
      };
      if (kind === "smtp") {
        config.host = smtpHost;
        config.port = Number(smtpPort) || 587;
        config.username = smtpUser;
        config.password = smtpPass;
        config.encryption = smtpEnc;
      } else if (kind === "mailgun") {
        config.apiKey = apiKey;
        config.domain = mailgunDomain;
      } else if (kind === "postmark") {
        config.serverToken = apiKey;
      } else if (kind !== "ettajer_managed") {
        config.apiKey = apiKey;
      }

      const res = await fetch("/api/mailhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_provider",
          name: providerName,
          kind,
          status: "active",
          isDefaultMarketing: providers.length === 0,
          isDefaultTransactional: providers.length === 0,
          config,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Save failed");
      toast.success("Provider saved");
      setApiKey("");
      setSmtpPass("");
      await refreshOverview({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  }

  async function runTest(id: string) {
    if (!testTo.trim()) {
      toast.error("Enter a test recipient email");
      return;
    }
    setBusy(`test-${id}`);
    try {
      const res = await fetch("/api/mailhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_provider",
          id,
          toEmail: testTo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Test failed");
      const ok = data.connection?.ok && data.send?.success !== false;
      toast[ok ? "success" : "error"](
        ok
          ? `OK · ${data.send?.latencyMs ?? data.connection?.latencyMs ?? "—"}ms`
          : data.connection?.message || data.send?.error || "Test failed"
      );
      await refreshOverview({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setBusy(null);
    }
  }

  async function setDefault(
    id: string,
    purpose: "marketing" | "transactional" | "both"
  ) {
    setBusy(purpose === "marketing" ? `def-m-${id}` : `def-${id}`);
    try {
      const res = await fetch("/api/mailhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_default_provider", id, purpose }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success("Default updated");
      await refreshOverview({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function removeProvider(id: string) {
    setBusy(`del-${id}`);
    try {
      const res = await fetch("/api/mailhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_provider", id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("Provider removed");
      await refreshOverview({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  async function addDomain() {
    setBusy("domain");
    try {
      const res = await fetch("/api/mailhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert_domain", domain: newDomain }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed");
      setNewDomain("");
      toast.success("Domain added — publish DNS records");
      await refreshOverview({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function verifyDomain(id: string) {
    setBusy(`verify-${id}`);
    try {
      const res = await fetch("/api/mailhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_domain", id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Verify failed");
      toast.success("DNS re-checked");
      await refreshOverview({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setBusy(null);
    }
  }

  async function addIdentity() {
    setBusy("identity");
    try {
      const res = await fetch("/api/mailhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_identity",
          email: newIdentity,
          displayName: identityName || null,
          isDefault: identities.length === 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed");
      setNewIdentity("");
      setIdentityName("");
      toast.success("Sender identity saved");
      await refreshOverview({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function searchLogs() {
    setBusy("logs");
    try {
      const params = new URLSearchParams({ view: "logs", q: logQ });
      const res = await fetch(`/api/mailhub?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed");
      setLogs(data.logs || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={dashboardStack}>
      {initialLoading ? (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06]" />
          <div className="h-10 animate-pulse rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06]" />
          <div className="h-48 animate-pulse rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06]" />
        </div>
      ) : (
        <>
      {/* Email marketing bridge */}
      <div className={cn(dashboardCard, "overflow-hidden")}>
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-black/[0.05] px-3.5 py-2.5 dark:border-white/10">
          <div className="min-w-0">
            <p className={dashboardTitle}>Email marketing</p>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              Campaigns and automations send through your marketing default
              provider.
            </p>
          </div>
          <Link
            href="/dashboard/marketing/email"
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-[#007AFF] transition hover:bg-[#007AFF]/10"
          >
            Open hub
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-px bg-black/[0.04] sm:grid-cols-3 dark:bg-white/10">
          {[
            {
              href: "/dashboard/marketing/email/campaigns",
              title: "Campaigns",
              body: "Send to your list",
              icon: Megaphone,
            },
            {
              href: "/dashboard/marketing/email/subscribers",
              title: "Subscribers",
              body: "Grow and clean list",
              icon: Users,
            },
            {
              href: "/dashboard/marketing/email/automations",
              title: "Automations",
              body: "Welcome & flows",
              icon: Mail,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-2.5 bg-white px-3.5 py-3 transition hover:bg-[#FAFAFA] dark:bg-[#1C1C1E] dark:hover:bg-white/[0.03]"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-[12px] font-medium text-neutral-900 dark:text-white">
                    {item.title}
                    <ArrowUpRight className="h-3 w-3 text-neutral-300" />
                  </span>
                  <span className="mt-0.5 block text-[11px] text-neutral-400">
                    {item.body}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tabs + refresh */}
      <div className="flex flex-wrap items-center gap-2">
        <nav className={cn(dashboardSegmentNav, "flex-1")} aria-label="Email sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                dashboardSegmentTab,
                tab === t.id
                  ? dashboardSegmentTabActive
                  : dashboardSegmentTabInactive
              )}
            >
              {t.label}
              {t.count != null ? (
                <span className="text-[10px] tabular-nums text-neutral-400">
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={refreshing}
          onClick={() => void refreshOverview()}
          className="h-8 gap-1.5 rounded-md px-2 text-[11px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <RefreshCw
            className={cn("h-3 w-3", refreshing && "animate-spin")}
          />
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {/* Providers */}
      {tab === "providers" ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Connected providers</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Defaults for marketing and transactional mail.
              </p>
            </div>
            {providers.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  No providers yet
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Connect Resend, SES, SMTP, or use Ettajer Managed
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-black/[0.05] dark:divide-white/10">
                {providers.map((p) => (
                  <li key={p.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                          {p.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-neutral-400">
                          {p.kindLabel}
                          {p.isDefaultMarketing ? " · Marketing default" : ""}
                          {p.isDefaultTransactional
                            ? " · Transactional default"
                            : ""}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 font-medium capitalize",
                              badge(p.status)
                            )}
                          >
                            {p.status}
                          </span>
                          {p.lastTestAt ? (
                            <span className="inline-flex items-center gap-1 text-neutral-400">
                              <StatusDot ok={p.lastTestOk} />
                              Last test{" "}
                              {p.lastTestLatencyMs != null
                                ? `${p.lastTestLatencyMs}ms`
                                : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          onClick={() => void setDefault(p.id, "marketing")}
                          loading={busy === `def-m-${p.id}`}
                        >
                          Marketing default
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          onClick={() => void setDefault(p.id, "both")}
                          loading={busy === `def-${p.id}`}
                        >
                          Make default
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          loading={busy === `test-${p.id}`}
                          onClick={() => void runTest(p.id)}
                        >
                          Send test
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                          loading={busy === `del-${p.id}`}
                          onClick={() => void removeProvider(p.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cn(dashboardCard, "space-y-2.5 p-3.5")}>
            <div>
              <p className={dashboardTitle}>Add provider</p>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Credentials stay encrypted on your store.
              </p>
            </div>
            <Input
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="Display name"
              className={FIELD}
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as MailHubProviderKind)}
              className={SELECT}
            >
              {MAILHUB_PROVIDER_KINDS.map((k) => {
                const c = catalog.find((x) => x.kind === k);
                return (
                  <option key={k} value={k} disabled={c && !c.available}>
                    {MAILHUB_PROVIDER_LABELS[k]}
                    {c && !c.available ? " (unavailable)" : ""}
                  </option>
                );
              })}
            </select>

            {kind === "smtp" ? (
              <div className="space-y-2">
                <Input
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="Host"
                  className={FIELD}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="Port"
                    className={FIELD}
                  />
                  <select
                    value={smtpEnc}
                    onChange={(e) =>
                      setSmtpEnc(e.target.value as typeof smtpEnc)
                    }
                    className={SELECT}
                  >
                    <option value="starttls">STARTTLS</option>
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <Input
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="Username"
                  className={FIELD}
                />
                <Input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="Password"
                  className={FIELD}
                />
              </div>
            ) : kind === "mailgun" ? (
              <div className="space-y-2">
                <Input
                  value={mailgunDomain}
                  onChange={(e) => setMailgunDomain(e.target.value)}
                  placeholder="Mailgun domain"
                  className={FIELD}
                />
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API key"
                  className={FIELD}
                />
              </div>
            ) : kind !== "ettajer_managed" ? (
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={kind === "postmark" ? "Server token" : "API key"}
                className={FIELD}
              />
            ) : (
              <p className="text-[11px] text-neutral-400">
                Uses Ettajer platform Resend — no keys needed.
              </p>
            )}

            <Input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="From name (optional)"
              className={FIELD}
            />
            <Input
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="From email (optional)"
              className={cn(FIELD, "font-sans")}
            />
            <Input
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="Test recipient (for Send test)"
              className={cn(FIELD, "font-sans")}
            />

            <Button
              type="button"
              className={cn(dashboardPrimaryBtn, "h-9 w-full")}
              loading={busy === "save-provider"}
              onClick={() => void saveProvider()}
            >
              Save provider
            </Button>
          </div>
        </div>
      ) : null}

      {/* Domains */}
      {tab === "domains" ? (
        <div className="space-y-3">
          <div className={cn(dashboardCard, "flex flex-wrap gap-2 p-3")}>
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className={cn(FIELD, "min-w-[200px] flex-1 font-sans")}
            />
            <Button
              type="button"
              className={cn(dashboardPrimaryBtn, "h-9 px-3")}
              loading={busy === "domain"}
              onClick={() => void addDomain()}
            >
              Connect domain
            </Button>
          </div>
          {domains.length === 0 ? (
            <div className={cn(dashboardCard, "px-4 py-10 text-center")}>
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                No domains yet
              </p>
              <p className="mt-1 text-[11px] text-neutral-400">
                Add a sending domain, then publish SPF, DKIM, and DMARC.
              </p>
            </div>
          ) : null}
          {domains.map((d) => (
            <div key={d.id} className={cn(dashboardCard, "p-3.5")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-sans text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                    {d.domain}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                    {[
                      ["SPF", d.spfStatus],
                      ["DKIM", d.dkimStatus],
                      ["DMARC", d.dmarcStatus],
                      ["Overall", d.verificationStatus || "pending"],
                    ].map(([label, status]) => (
                      <span
                        key={label}
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-medium",
                          badge(String(status))
                        )}
                      >
                        {label}: {status}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                  loading={busy === `verify-${d.id}`}
                  onClick={() => void verifyDomain(d.id)}
                >
                  <Shield className="mr-1.5 h-3 w-3" />
                  Re-check DNS
                </Button>
              </div>
              {d.expectedRecords &&
              typeof d.expectedRecords === "object" &&
              Array.isArray(
                (d.expectedRecords as { records?: unknown[] }).records
              ) ? (
                <div className="mt-3 space-y-1.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
                  <p className="text-[11px] font-medium text-neutral-400">
                    Required DNS
                  </p>
                  {(
                    d.expectedRecords as {
                      records: Array<{
                        type: string;
                        host: string;
                        recommendedValue: string;
                        purpose: string;
                      }>;
                    }
                  ).records.map((r, i) => (
                    <div
                      key={`${r.host}-${i}`}
                      className="rounded-[10px] bg-[#F5F5F7] px-2.5 py-2 text-[11px] dark:bg-white/[0.04]"
                    >
                      <span className="font-medium text-neutral-600 dark:text-neutral-300">
                        {r.type}
                      </span>{" "}
                      <span className="text-neutral-400">{r.purpose}</span>
                      <p className="mt-0.5 break-all font-sans text-[11px] text-neutral-700 dark:text-neutral-300">
                        {r.host}
                      </p>
                      <p className="mt-0.5 break-all font-sans text-[11px] text-neutral-500">
                        {r.recommendedValue}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Senders */}
      {tab === "identities" ? (
        <div className="space-y-3">
          <div className={cn(dashboardCard, "flex flex-wrap gap-2 p-3")}>
            <Input
              value={identityName}
              onChange={(e) => setIdentityName(e.target.value)}
              placeholder="Display name"
              className={cn(FIELD, "w-36")}
            />
            <Input
              value={newIdentity}
              onChange={(e) => setNewIdentity(e.target.value)}
              placeholder="hello@example.com"
              className={cn(FIELD, "min-w-[200px] flex-1 font-sans")}
            />
            <Button
              type="button"
              className={cn(dashboardPrimaryBtn, "h-9 px-3")}
              loading={busy === "identity"}
              onClick={() => void addIdentity()}
            >
              Add sender
            </Button>
          </div>
          {identities.length === 0 ? (
            <div className={cn(dashboardCard, "px-4 py-10 text-center")}>
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                No senders yet
              </p>
              <p className="mt-1 text-[11px] text-neutral-400">
                Add a from address shoppers will see in their inbox.
              </p>
            </div>
          ) : null}
          {identities.map((id) => (
            <div
              key={id.id}
              className={cn(
                dashboardCard,
                "flex items-center justify-between gap-2 px-3.5 py-3"
              )}
            >
              <div className="min-w-0">
                <p className="truncate font-sans text-[12px] font-medium text-neutral-900 dark:text-white">
                  {id.displayName ? `${id.displayName} · ` : ""}
                  {id.email}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {id.purpose}
                  {id.isDefault ? " · default" : ""}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize",
                  badge(id.status)
                )}
              >
                {id.status}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Logs */}
      {tab === "logs" ? (
        <div className="space-y-3">
          <div className={cn(dashboardCard, "flex gap-2 p-3")}>
            <Input
              value={logQ}
              onChange={(e) => setLogQ(e.target.value)}
              placeholder="Search recipient or subject…"
              className={cn(FIELD, "flex-1")}
              onKeyDown={(e) => {
                if (e.key === "Enter") void searchLogs();
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-md border-black/[0.06] px-3 text-[12px] shadow-none dark:border-white/10"
              loading={busy === "logs"}
              onClick={() => void searchLogs()}
            >
              Search
            </Button>
          </div>
          <div className={cn(dashboardCard, "overflow-hidden")}>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-black/[0.05] text-left text-[11px] font-medium text-neutral-400 dark:border-white/10">
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">To</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Provider</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-black/[0.04] dark:border-white/[0.06]"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-neutral-400">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-sans text-neutral-700 dark:text-neutral-300">
                      {l.toEmail}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2">
                      {l.subject}
                    </td>
                    <td className="px-3 py-2 capitalize">{l.provider}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-medium capitalize",
                          badge(l.status)
                        )}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-neutral-400"
                    >
                      No logs yet
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Related */}
      <div
        className={cn(
          dashboardCard,
          "flex gap-3 rounded-[10px] px-3.5 py-3 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400"
        )}
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
          <Link2 className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          Brand name and contact live in{" "}
          <Link
            href="/dashboard/settings?tab=general"
            className="inline-flex items-center gap-0.5 font-medium text-[#007AFF] transition hover:text-[#0071EB]"
          >
            General
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          . Campaigns and lists are under{" "}
          <Link
            href="/dashboard/marketing/email"
            className="inline-flex items-center gap-0.5 font-medium text-[#007AFF] transition hover:text-[#0071EB]"
          >
            Email marketing
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          .
        </div>
      </div>
        </>
      )}
    </div>
  );
}
