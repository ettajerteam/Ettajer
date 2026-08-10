"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldOff,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DeveloperBrandLoader } from "@/components/developer/developer-brand-loader";
import { ConnectedAiClients } from "@/components/developer/connected-ai-clients";
import { AiClientLogo } from "@/components/developer/ai-client-logo";
import { collectConnectedAiClients, detectAiClient } from "@/lib/developer/ai-clients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AppRow = {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  status: string;
  redirectUris: string[];
  updatedAt: string;
  grants: {
    id: string;
    storeName: string;
    scopes: string[];
    updatedAt: string;
  }[];
  apiKeys: {
    id: string;
    name: string;
    keyPrefix: string;
    scopes: string[];
    lastUsedAt: string | null;
  }[];
};

type TabId = "applications" | "create";

type PendingAction =
  | {
      kind: "regenerate_secret";
      applicationId: string;
      appName: string;
    }
  | {
      kind: "revoke_api_key";
      applicationId: string;
      apiKeyId: string;
      keyLabel: string;
    }
  | {
      kind: "rotate_api_key";
      applicationId: string;
      apiKeyId: string;
      keyLabel: string;
    }
  | {
      kind: "revoke_grant";
      grantId: string;
      storeName: string;
    }
  | {
      kind: "delete_app";
      applicationId: string;
      appName: string;
    };

const MCP_ENDPOINT = "https://www.ettajer.com/api/v1/mcp";

const REDIRECT_PRESETS = [
  {
    id: "claude",
    label: "Claude",
    uri: "https://claude.ai/api/mcp/auth_callback",
  },
  {
    id: "cursor-local",
    label: "Cursor local",
    uri: "http://localhost:8787/callback",
  },
  {
    id: "cursor-cloud",
    label: "Cursor cloud",
    uri: "https://www.cursor.com/agents/mcp/oauth/callback",
  },
] as const;

const DEFAULT_REDIRECTS = REDIRECT_PRESETS.map((p) => p.uri).join("\n");

const SETUP_STEPS = [
  {
    title: "Create an app",
    body: "Add redirect URIs for Claude or Cursor.",
  },
  {
    title: "Copy credentials",
    body: "Save the client ID and secret once.",
  },
  {
    title: "Connect MCP",
    body: "Authorize the store in your AI client.",
  },
] as const;

const QUICK_TUTORIALS = [
  {
    href: "/help/tutorial-first-ai-theme-in-10-minutes",
    title: "First AI theme",
    body: "10-minute path to preview",
  },
  {
    href: "/help/tutorial-connect-claude-mcp",
    title: "Connect Claude",
    body: "OAuth + MCP setup",
  },
  {
    href: "/help/tutorial-connect-cursor-mcp",
    title: "Connect Cursor",
    body: "Local and cloud callbacks",
  },
] as const;

function copyText(label: string, value: string) {
  void navigator.clipboard.writeText(value).then(
    () => toast.success(`${label} copied`),
    () => toast.error("Could not copy"),
  );
}

export function DeveloperAppsClient() {
  const [tab, setTab] = useState<TabId>("applications");
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [redirectUris, setRedirectUris] = useState(DEFAULT_REDIRECTS);
  const [creating, setCreating] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/developer/apps");
      const data = (await res.json()) as { applications?: AppRow[] };
      setApps(data.applications ?? []);
    } catch {
      toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function togglePreset(uri: string) {
    const lines = redirectUris
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    const next = lines.includes(uri)
      ? lines.filter((u) => u !== uri)
      : [...lines, uri];
    setRedirectUris(next.join("\n"));
  }

  async function createApp() {
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/developer/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name,
          description,
          redirectUris: redirectUris
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean),
        }),
      });
      const data = (await res.json()) as {
        application?: AppRow;
        clientSecret?: string;
        error?: { message?: string };
      };
      if (!res.ok) {
        toast.error(data.error?.message || "Create failed");
        return;
      }
      setRevealedSecret({
        clientId: data.application!.clientId,
        clientSecret: data.clientSecret!,
      });
      setName("");
      setDescription("");
      toast.success("Application created — copy the secret now");
      await load();
      setTab("applications");
      if (data.application?.id) setExpandedId(data.application.id);
    } finally {
      setCreating(false);
    }
  }

  async function regenerate(applicationId: string) {
    const res = await fetch("/api/dashboard/developer/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "regenerate_secret", applicationId }),
    });
    const data = (await res.json()) as { clientSecret?: string };
    if (!res.ok || !data.clientSecret) {
      toast.error("Could not regenerate secret");
      return;
    }
    const app = apps.find((a) => a.id === applicationId);
    setRevealedSecret({
      clientId: app?.clientId || "",
      clientSecret: data.clientSecret,
    });
    toast.success("New client secret generated");
  }

  async function createApiKey(applicationId: string) {
    const res = await fetch("/api/dashboard/developer/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_api_key",
        applicationId,
        apiKeyName: "Agent key",
      }),
    });
    const data = (await res.json()) as { secret?: string };
    if (!res.ok || !data.secret) {
      toast.error("Could not create API key");
      return;
    }
    setRevealedApiKey(data.secret);
    toast.success("API key created — copy it now");
    await load();
  }

  async function revokeGrant(grantId: string) {
    await fetch("/api/dashboard/developer/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke_grant", grantId }),
    });
    toast.success("Access revoked");
    await load();
  }

  async function revokeApiKey(applicationId: string, apiKeyId: string) {
    const res = await fetch("/api/dashboard/developer/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "revoke_api_key",
        applicationId,
        apiKeyId,
      }),
    });
    if (!res.ok) {
      toast.error("Could not revoke API key");
      return;
    }
    toast.success("API key revoked");
    await load();
  }

  async function rotateApiKey(applicationId: string, apiKeyId: string) {
    const res = await fetch("/api/dashboard/developer/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "rotate_api_key",
        applicationId,
        apiKeyId,
      }),
    });
    const data = (await res.json()) as { secret?: string };
    if (!res.ok || !data.secret) {
      toast.error("Could not rotate API key");
      return;
    }
    setRevealedApiKey(data.secret);
    toast.success("API key rotated — copy the new secret now");
    await load();
  }

  async function deleteApp(applicationId: string) {
    const res = await fetch("/api/dashboard/developer/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_app", applicationId }),
    });
    if (!res.ok) {
      toast.error("Could not delete application");
      return;
    }
    toast.success("Application deleted");
    if (expandedId === applicationId) setExpandedId(null);
    await load();
  }

  async function runPendingAction() {
    if (!pending) return;
    setConfirming(true);
    try {
      switch (pending.kind) {
        case "regenerate_secret":
          await regenerate(pending.applicationId);
          break;
        case "revoke_api_key":
          await revokeApiKey(pending.applicationId, pending.apiKeyId);
          break;
        case "rotate_api_key":
          await rotateApiKey(pending.applicationId, pending.apiKeyId);
          break;
        case "revoke_grant":
          await revokeGrant(pending.grantId);
          break;
        case "delete_app":
          await deleteApp(pending.applicationId);
          break;
      }
      setPending(null);
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return <DeveloperBrandLoader fullPage />;
  }

  const selectedUris = new Set(
    redirectUris
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean),
  );

  const hasApps = apps.length > 0;
  const connectedAi = collectConnectedAiClients(apps);

  return (
    <div>
      <section className="relative overflow-hidden bg-[#0B0D10] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 80% -10%, rgba(0,122,255,0.22), transparent 55%), radial-gradient(ellipse 40% 40% at 0% 100%, rgba(255,255,255,0.04), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-12">
          <p className="text-[13px] font-medium text-white/45">
            Ettajer for Developers
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 max-w-xl">
              <h1 className="text-[30px] font-semibold leading-[1.08] text-white sm:text-[36px]">
                Console
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-white/55">
                OAuth apps and credentials for Claude, Cursor, and agents. AI
                designs — Ettajer keeps commerce.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/developer/help"
                className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Get help
              </Link>
              <button
                type="button"
                onClick={() => setTab("create")}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]"
              >
                <Plus className="h-3.5 w-3.5" />
                Create app
              </button>
            </div>
          </div>
        </div>
      </section>

      {!hasApps ? (
        <section className="border-b border-black/[0.05] bg-white">
          <div className="mx-auto grid max-w-5xl gap-px bg-black/[0.05] sm:grid-cols-3">
            {SETUP_STEPS.map((step, i) => (
              <div key={step.title} className="bg-white px-4 py-5 sm:px-6">
                <p className="text-[11px] font-medium text-neutral-400">
                  Step {i + 1}
                </p>
                <p className="mt-1 text-[13px] font-semibold text-neutral-900">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-500">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
        {(revealedSecret || revealedApiKey) && (
          <SecretRevealCard
            clientId={revealedSecret?.clientId}
            clientSecret={revealedSecret?.clientSecret}
            apiKey={revealedApiKey}
            onDismiss={() => {
              setRevealedSecret(null);
              setRevealedApiKey(null);
            }}
          />
        )}

        <ConnectedAiClients clients={connectedAi} />

        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5 sm:px-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-neutral-900">
                <Terminal className="h-3.5 w-3.5 text-[#007AFF]" />
                MCP endpoint
              </div>
              <p className="mt-1 break-all font-mono text-[12px] text-neutral-600">
                {MCP_ENDPOINT}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => copyText("MCP endpoint", MCP_ENDPOINT)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F5F5F7] px-3 text-[11px] font-semibold text-neutral-800 transition hover:bg-[#EBEBF0]"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
              <Link
                href="/developers/mcp"
                className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[11px] font-semibold text-[#007AFF] transition hover:underline"
              >
                Docs
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {QUICK_TUTORIALS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-black/[0.06] bg-white px-4 py-3.5 transition hover:border-black/[0.1] hover:bg-[#FAFAFA]"
            >
              <p className="text-[11px] font-medium text-[#007AFF]">Tutorial</p>
              <p className="mt-0.5 text-[13px] font-semibold text-neutral-900">
                {item.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-neutral-500">
                {item.body}
                <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
              </p>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            role="tablist"
            className="inline-flex rounded-[10px] bg-[#E8E8ED] p-0.5"
          >
            <TabButton
              active={tab === "applications"}
              onClick={() => setTab("applications")}
            >
              Applications
              {apps.length > 0 ? (
                <span className="ml-1 tabular-nums text-neutral-400">
                  {apps.length}
                </span>
              ) : null}
            </TabButton>
            <TabButton
              active={tab === "create"}
              onClick={() => setTab("create")}
            >
              Create app
            </TabButton>
          </div>
          {tab === "applications" ? (
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard/developer/activity"
                className="inline-flex h-8 items-center rounded-lg px-2.5 text-[12px] font-medium text-neutral-500 transition hover:bg-black/[0.04] hover:text-neutral-800"
              >
                Activity
              </Link>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-neutral-500 transition hover:bg-black/[0.04] hover:text-neutral-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          ) : null}
        </div>

        {tab === "create" ? (
          <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            <div className="border-b border-black/[0.05] px-4 py-3.5 sm:px-5">
              <h2 className="text-[15px] font-semibold text-neutral-900">
                Create application
              </h2>
              <p className="mt-0.5 text-[12px] text-neutral-500">
                Redirect URIs must match exactly — use the presets below.
              </p>
            </div>
            <div className="space-y-3.5 px-4 py-4 sm:px-5">
              <Field label="Application name">
                <Input
                  placeholder="e.g. Claude MCP / Cursor MCP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 rounded-lg border-black/[0.08] text-[13px]"
                />
              </Field>
              <Field label="Description" optional>
                <Textarea
                  placeholder="What this app is for"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[64px] rounded-lg border-black/[0.08] text-[13px]"
                />
              </Field>
              <div>
                <p className="mb-1.5 text-[12px] font-medium text-neutral-700">
                  Redirect presets
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {REDIRECT_PRESETS.map((preset) => {
                    const on = selectedUris.has(preset.uri);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => togglePreset(preset.uri)}
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition",
                          on
                            ? "border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]"
                            : "border-black/[0.08] bg-white text-neutral-600 hover:bg-[#F5F5F7]",
                        )}
                      >
                        {on ? <Check className="h-3 w-3" /> : null}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field label="Redirect URIs" hint="One per line">
                <Textarea
                  value={redirectUris}
                  onChange={(e) => setRedirectUris(e.target.value)}
                  className="min-h-[96px] rounded-lg border-black/[0.08] font-mono text-[12px]"
                />
              </Field>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <Button
                  className={cn(
                    "h-9 rounded-lg px-4 text-[13px] font-semibold text-white shadow-none hover:scale-100 hover:shadow-none disabled:opacity-100 [background-image:none]",
                    creating || !name.trim()
                      ? "bg-neutral-300 hover:bg-neutral-300"
                      : "bg-[#007AFF] hover:bg-[#0071EB]",
                  )}
                  disabled={creating || !name.trim()}
                  onClick={() => void createApp()}
                >
                  {creating ? "Creating…" : "Create application"}
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 rounded-lg text-[12px] text-neutral-500"
                  onClick={() => setTab("applications")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        ) : apps.length === 0 ? (
          <EmptyApps onCreate={() => setTab("create")} />
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            {apps.map((app, index) => {
              const open = expandedId === app.id;
              const connected = app.grants.length > 0;
              const ai = detectAiClient(app);
              return (
                <li
                  key={app.id}
                  className={cn(index > 0 && "border-t border-black/[0.05]")}
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#FAFAFA] sm:px-5"
                    onClick={() => setExpandedId(open ? null : app.id)}
                  >
                    <AiClientLogo kind={ai.kind} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[14px] font-semibold text-neutral-900">
                          {app.name}
                        </h3>
                        {app.status !== "active" ? (
                          <StatusChip
                            connected={connected}
                            status={app.status}
                          />
                        ) : connected ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                            {ai.label} connected
                          </span>
                        ) : (
                          <StatusChip
                            connected={connected}
                            status={app.status}
                          />
                        )}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-neutral-400">
                        {app.clientId}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right text-[11px] text-neutral-400 sm:block">
                      <p>
                        {app.apiKeys.length} key
                        {app.apiKeys.length === 1 ? "" : "s"}
                      </p>
                      <p>
                        {app.grants.length} grant
                        {app.grants.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-neutral-300 transition",
                        open && "rotate-180",
                      )}
                    />
                  </button>

                  {open ? (
                    <div className="space-y-3 border-t border-black/[0.04] bg-[#FAFAFA] px-4 py-4 sm:px-5">
                      {app.description ? (
                        <p className="text-[12px] text-neutral-500">
                          {app.description}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap gap-1.5">
                        <QuietBtn
                          onClick={() => copyText("Client ID", app.clientId)}
                        >
                          <Copy className="h-3 w-3" />
                          Copy client ID
                        </QuietBtn>
                        <QuietBtn
                          onClick={() =>
                            setPending({
                              kind: "regenerate_secret",
                              applicationId: app.id,
                              appName: app.name,
                            })
                          }
                        >
                          <RefreshCw className="h-3 w-3" />
                          Regenerate secret
                        </QuietBtn>
                        <QuietBtn onClick={() => void createApiKey(app.id)}>
                          <KeyRound className="h-3 w-3" />
                          Create API key
                        </QuietBtn>
                        <QuietBtn
                          danger
                          onClick={() =>
                            setPending({
                              kind: "delete_app",
                              applicationId: app.id,
                              appName: app.name,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete app
                        </QuietBtn>
                      </div>

                      {app.redirectUris.length > 0 ? (
                        <DetailBlock title="Redirect URIs">
                          <ul className="space-y-1 rounded-xl border border-black/[0.05] bg-white px-3 py-2.5">
                            {app.redirectUris.map((uri) => (
                              <li
                                key={uri}
                                className="truncate font-mono text-[11px] text-neutral-600"
                              >
                                {uri}
                              </li>
                            ))}
                          </ul>
                        </DetailBlock>
                      ) : null}

                      {app.apiKeys.length > 0 ? (
                        <DetailBlock title="API keys">
                          <ul className="space-y-1.5">
                            {app.apiKeys.map((k) => (
                              <li
                                key={k.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/[0.05] bg-white px-3 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="font-mono text-[12px] text-neutral-800">
                                    {k.name}: {k.keyPrefix}…
                                  </p>
                                  <p className="mt-0.5 text-[11px] text-neutral-400">
                                    Last used{" "}
                                    {k.lastUsedAt
                                      ? new Date(k.lastUsedAt).toLocaleString()
                                      : "never"}
                                  </p>
                                </div>
                                <span className="flex gap-0.5">
                                  <QuietBtn
                                    onClick={() =>
                                      setPending({
                                        kind: "rotate_api_key",
                                        applicationId: app.id,
                                        apiKeyId: k.id,
                                        keyLabel: `${k.name}: ${k.keyPrefix}…`,
                                      })
                                    }
                                  >
                                    Rotate
                                  </QuietBtn>
                                  <QuietBtn
                                    danger
                                    onClick={() =>
                                      setPending({
                                        kind: "revoke_api_key",
                                        applicationId: app.id,
                                        apiKeyId: k.id,
                                        keyLabel: `${k.name}: ${k.keyPrefix}…`,
                                      })
                                    }
                                  >
                                    Revoke
                                  </QuietBtn>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </DetailBlock>
                      ) : null}

                      {app.grants.length > 0 ? (
                        <DetailBlock title="OAuth connections">
                          <ul className="space-y-1.5">
                            {app.grants.map((g) => (
                              <li
                                key={g.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="text-[12px] font-medium text-emerald-800">
                                    Connected · {g.storeName}
                                  </p>
                                  <p className="mt-0.5 truncate text-[11px] text-emerald-700/70">
                                    {g.scopes.join(", ")}
                                  </p>
                                </div>
                                <QuietBtn
                                  onClick={() =>
                                    setPending({
                                      kind: "revoke_grant",
                                      grantId: g.id,
                                      storeName: g.storeName,
                                    })
                                  }
                                >
                                  <ShieldOff className="h-3 w-3" />
                                  Revoke
                                </QuietBtn>
                              </li>
                            ))}
                          </ul>
                        </DetailBlock>
                      ) : (
                        <p className="rounded-xl border border-dashed border-black/[0.08] bg-white px-3 py-2.5 text-[12px] text-neutral-500">
                          No OAuth connections yet. Authorize via{" "}
                          <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[11px]">
                            /oauth/authorize
                          </code>
                          .
                        </p>
                      )}

                      <p className="text-[11px] text-neutral-400">
                        Updated {new Date(app.updatedAt).toLocaleString()} ·{" "}
                        <Link
                          href="/developers/mcp"
                          className="font-medium text-[#007AFF] hover:underline"
                        >
                          MCP setup guide
                        </Link>
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmActionDialog
        pending={pending}
        busy={confirming}
        onCancel={() => {
          if (!confirming) setPending(null);
        }}
        onConfirm={() => void runPendingAction()}
      />
    </div>
  );
}

function confirmCopy(pending: PendingAction): {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
} {
  switch (pending.kind) {
    case "regenerate_secret":
      return {
        title: "Regenerate client secret?",
        body: `The current secret for “${pending.appName}” will stop working immediately. Copy the new secret when it appears.`,
        confirmLabel: "Regenerate",
        danger: true,
      };
    case "rotate_api_key":
      return {
        title: "Rotate API key?",
        body: `“${pending.keyLabel}” will be revoked and replaced. Scripts using the old key will fail until you update them.`,
        confirmLabel: "Rotate key",
        danger: true,
      };
    case "revoke_api_key":
      return {
        title: "Revoke API key?",
        body: `“${pending.keyLabel}” will stop working immediately. This cannot be undone.`,
        confirmLabel: "Revoke key",
        danger: true,
      };
    case "revoke_grant":
      return {
        title: "Revoke store access?",
        body: `Disconnect this app from “${pending.storeName}”. The agent will need to authorize again to reconnect.`,
        confirmLabel: "Revoke access",
        danger: true,
      };
    case "delete_app":
      return {
        title: "Delete application?",
        body: `“${pending.appName}” will be permanently disabled. All OAuth connections and API keys will be revoked.`,
        confirmLabel: "Delete app",
        danger: true,
      };
  }
}

function ConfirmActionDialog({
  pending,
  busy,
  onCancel,
  onConfirm,
}: {
  pending: PendingAction | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const copy = pending ? confirmCopy(pending) : null;

  return (
    <Dialog
      open={Boolean(pending)}
      onOpenChange={(open) => {
        if (!open && !busy) onCancel();
      }}
    >
      <DialogContent className="max-w-[400px] gap-0 overflow-hidden rounded-2xl border-black/[0.08] bg-white p-0 shadow-xl">
        <DialogHeader className="space-y-2 px-5 pt-5 text-left sm:px-6 sm:pt-6">
          <DialogTitle className="text-[17px] font-semibold tracking-tight text-neutral-900">
            {copy?.title}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-neutral-500">
            {copy?.body}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5 flex-row justify-end gap-2 border-t border-black/[0.05] bg-[#FAFAFA] px-5 py-3.5 sm:space-x-0 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            className="h-9 rounded-lg text-[13px] text-neutral-600"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={busy}
            className={cn(
              "h-9 rounded-lg text-[13px] font-semibold text-white",
              copy?.danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#007AFF] hover:bg-[#0071EB]",
            )}
            onClick={onConfirm}
          >
            {busy ? "Working…" : copy?.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition",
        active
          ? "bg-white text-neutral-900 shadow-sm"
          : "text-neutral-500 hover:text-neutral-800",
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  optional,
  hint,
  children,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-neutral-700">
        {label}
        {optional ? (
          <span className="font-normal text-neutral-400">optional</span>
        ) : null}
        {hint ? (
          <span className="font-normal text-neutral-400">· {hint}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

function SecretRevealCard({
  clientId,
  clientSecret,
  apiKey,
  onDismiss,
}: {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string | null;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(label: string, value: string) {
    void navigator.clipboard.writeText(value).then(
      () => {
        setCopied(label);
        toast.success(`${label} copied`);
        window.setTimeout(() => {
          setCopied((prev) => (prev === label ? null : prev));
        }, 1600);
      },
      () => toast.error("Could not copy"),
    );
  }

  function copyAll() {
    const lines: string[] = [];
    if (clientId) lines.push(`Client ID: ${clientId}`);
    if (clientSecret) lines.push(`Client secret: ${clientSecret}`);
    if (apiKey) lines.push(`API key: ${apiKey}`);
    handleCopy("Credentials", lines.join("\n"));
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-3 border-b border-black/[0.05] bg-[#FFF9F0] px-4 py-3 sm:px-5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF9F0A]/15 text-[#C93400]">
          <ShieldAlert className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-neutral-900">
            Copy this secret now
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-neutral-500">
            It will not be shown again. Store it somewhere safe before you leave
            this page.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-black/[0.04] hover:text-neutral-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 px-4 py-3 sm:px-5">
        {clientId ? (
          <SecretRow
            label="Client ID"
            value={clientId}
            copied={copied === "Client ID"}
            onCopy={() => handleCopy("Client ID", clientId)}
          />
        ) : null}
        {clientSecret ? (
          <SecretRow
            label="Client secret"
            value={clientSecret}
            sensitive
            copied={copied === "Client secret"}
            onCopy={() => handleCopy("Client secret", clientSecret)}
          />
        ) : null}
        {apiKey ? (
          <SecretRow
            label="API key"
            value={apiKey}
            sensitive
            copied={copied === "API key"}
            onCopy={() => handleCopy("API key", apiKey)}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-black/[0.05] px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#007AFF] px-3 text-[12px] font-semibold text-white transition hover:bg-[#0066D6]"
        >
          {copied === "Credentials" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied === "Credentials" ? "Copied" : "Copy all"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-8 items-center rounded-lg px-3 text-[12px] font-medium text-neutral-500 transition hover:bg-black/[0.04] hover:text-neutral-800"
        >
          Done
        </button>
      </div>
    </section>
  );
}

function SecretRow({
  label,
  value,
  sensitive,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  sensitive?: boolean;
  copied?: boolean;
  onCopy: () => void;
}) {
  const [visible, setVisible] = useState(!sensitive);
  const displayValue = sensitive && !visible
    ? "•".repeat(Math.min(Math.max(value.length, 24), 48))
    : value;

  return (
    <div className="rounded-xl border border-black/[0.06] bg-[#F5F5F7] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="text-[12px] font-medium text-neutral-600">{label}</p>
          {sensitive ? (
            <span className="rounded-md bg-[#FF9F0A]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#C93400]">
              One-time
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {sensitive ? (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-black/[0.05] hover:text-neutral-800"
              aria-label={visible ? `Hide ${label}` : `Show ${label}`}
            >
              {visible ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-[#007AFF] px-2.5 text-[11px] font-semibold text-white transition hover:bg-[#0066D6]"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <p
        className={cn(
          "mt-1.5 break-all font-mono text-[12px] leading-relaxed text-neutral-900",
          sensitive && !visible && "tracking-[0.12em]",
        )}
      >
        {displayValue}
      </p>
    </div>
  );
}

function StatusChip({
  connected,
  status,
}: {
  connected: boolean;
  status: string;
}) {
  if (status !== "active") {
    return (
      <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500">
        {status}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        connected
          ? "bg-emerald-50 text-emerald-700"
          : "bg-sky-50 text-sky-700",
      )}
    >
      {connected ? "Connected" : "Ready"}
    </span>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium text-neutral-500">{title}</p>
      {children}
    </div>
  );
}

function QuietBtn({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium transition",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-neutral-600 hover:bg-black/[0.04]",
      )}
    >
      {children}
    </button>
  );
}

function EmptyApps({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
      <div className="px-5 py-10 text-center sm:px-8">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0D10] text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="mt-4 text-[16px] font-semibold text-neutral-900">
          Create your first app
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-neutral-500">
          Connect Claude or Cursor with OAuth. You’ll get a client ID and secret
          once — then authorize your store.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button
            className="h-9 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white shadow-none [background-image:none] hover:scale-100 hover:bg-[#0071EB] hover:shadow-none"
            onClick={onCreate}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create app
          </Button>
          <Link
            href="/help/tutorial-first-ai-theme-in-10-minutes"
            className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] px-3.5 text-[12px] font-semibold text-neutral-800 transition hover:bg-[#F5F5F7]"
          >
            10-minute tutorial
          </Link>
        </div>
      </div>
      <div className="grid gap-px border-t border-black/[0.05] bg-black/[0.05] sm:grid-cols-3">
        {QUICK_TUTORIALS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white px-4 py-3.5 text-left transition hover:bg-[#FAFAFA]"
          >
            <p className="text-[12px] font-semibold text-neutral-900">
              {item.title}
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-500">{item.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
