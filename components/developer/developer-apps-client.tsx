"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";

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

export function DeveloperAppsClient() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [redirectUris, setRedirectUris] = useState("http://localhost:3000/callback");
  const [creating, setCreating] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);

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
      body: JSON.stringify({ action: "revoke_api_key", applicationId, apiKeyId }),
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

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Developer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Build with AI. Connect Claude, Cursor, and other tools to customize your
          storefront theme — Ettajer keeps cart, checkout, and orders.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/developers" className="font-medium text-[#007AFF]">
            Read the developer docs →
          </Link>
        </p>
      </div>

      {(revealedSecret || revealedApiKey) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900">
            Copy this secret now — it will not be shown again.
          </p>
          {revealedSecret ? (
            <div className="mt-2 space-y-1 font-mono text-xs break-all">
              <p>Client ID: {revealedSecret.clientId}</p>
              <p>Client Secret: {revealedSecret.clientSecret}</p>
            </div>
          ) : null}
          {revealedApiKey ? (
            <p className="mt-2 font-mono text-xs break-all">API Key: {revealedApiKey}</p>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setRevealedSecret(null);
              setRevealedApiKey(null);
            }}
          >
            Dismiss
          </Button>
        </div>
      )}

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Create application</h2>
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Application name (e.g. Claude)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Textarea
            placeholder="Redirect URI(s), one per line"
            value={redirectUris}
            onChange={(e) => setRedirectUris(e.target.value)}
          />
          <Button
            className={dashboardPrimaryBtn}
            disabled={creating || !name.trim()}
            onClick={() => void createApp()}
          >
            {creating ? "Creating…" : "Create application"}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Applications</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : apps.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {apps.map((app) => (
              <li key={app.id} className="rounded-2xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{app.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {app.status === "active" ? "Connected" : app.status} · Client ID{" "}
                      <span className="font-mono">{app.clientId}</span>
                    </p>
                    {app.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void regenerate(app.id)}
                    >
                      Regenerate secret
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void createApiKey(app.id)}
                    >
                      Create API key
                    </Button>
                  </div>
                </div>

                {app.apiKeys.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      API keys
                    </p>
                    <ul className="mt-2 space-y-2">
                      {app.apiKeys.map((k) => (
                        <li
                          key={k.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm"
                        >
                          <span className="font-mono text-xs text-muted-foreground">
                            {k.name}: {k.keyPrefix}… · scopes {k.scopes.join(", ")} ·
                            last used{" "}
                            {k.lastUsedAt
                              ? new Date(k.lastUsedAt).toLocaleString()
                              : "never"}
                          </span>
                          <span className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void rotateApiKey(app.id, k.id)}
                            >
                              Rotate
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void revokeApiKey(app.id, k.id)}
                            >
                              Revoke
                            </Button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {app.grants.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Connected (OAuth)
                    </p>
                    <ul className="mt-2 space-y-2">
                      {app.grants.map((g) => (
                        <li
                          key={g.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm"
                        >
                          <span>
                            <span className="font-medium text-emerald-700">Connected</span>
                            {" · "}
                            {g.storeName}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              Scopes: {g.scopes.join(", ")} · last used{" "}
                              {new Date(g.updatedAt).toLocaleString()}
                            </span>
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void revokeGrant(g.id)}
                          >
                            Revoke
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">
                    No OAuth connections yet. Authorize via /oauth/authorize.
                  </p>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                  Created {new Date(app.updatedAt).toLocaleString()} · Client ID{" "}
                  <code className="rounded bg-neutral-100 px-1">{app.clientId}</code>
                  {" · "}
                  secrets are never shown again after creation.
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Authorize URL:{" "}
                  <code className="rounded bg-neutral-100 px-1">
                    /oauth/authorize?client_id={app.clientId}&amp;redirect_uri=…
                  </code>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
