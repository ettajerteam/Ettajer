"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DEVELOPER_SCOPES,
  THEME_AI_DEFAULT_SCOPES,
  parseScopes,
  scopeDescription,
  type DeveloperScope,
} from "@/lib/developer/scopes";

export function OAuthAuthorizeClient({
  appName,
  storeName,
}: {
  appName: string;
  storeName: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = params.get("client_id") || "";
  const redirectUri = params.get("redirect_uri") || "";
  const state = params.get("state") || "";
  const codeChallenge = params.get("code_challenge") || "";
  const codeChallengeMethod = params.get("code_challenge_method") || "";
  const requestedScopes = useMemo(() => {
    const parsed = parseScopes(params.get("scope") || "");
    return parsed.length > 0 ? parsed : [...THEME_AI_DEFAULT_SCOPES];
  }, [params]);

  async function submit(deny: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: requestedScopes.join(" "),
          state,
          code_challenge: codeChallenge || undefined,
          code_challenge_method: codeChallengeMethod || undefined,
          deny,
        }),
      });
      const data = (await res.json()) as {
        redirectTo?: string;
        error?: { message?: string };
      };
      if (!res.ok) {
        setError(data.error?.message || "Authorization failed");
        setBusy(false);
        return;
      }
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
        return;
      }
      setError("No redirect returned");
      setBusy(false);
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  if (!clientId || !redirectUri) {
    return (
      <p className="text-sm text-muted-foreground">
        Missing client_id or redirect_uri.
      </p>
    );
  }

  if (!state || state.length < 8) {
    return (
      <p className="text-sm text-muted-foreground">
        Missing or invalid <code>state</code> parameter (required for CSRF protection,
        min 8 characters).
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border bg-white p-8 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Authorize application
        </p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          {appName} wants access to {storeName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AI may customize your theme and presentation. Ettajer keeps cart,
          checkout, payments, and orders.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-neutral-900">Permissions</h2>
        <ul className="mt-3 space-y-2">
          {requestedScopes.map((scope) => (
            <li
              key={scope}
              className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
            >
              <span className="font-medium text-neutral-900">{scope}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {DEVELOPER_SCOPES.includes(scope as DeveloperScope)
                  ? scopeDescription(scope as DeveloperScope)
                  : scope}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button
          className="flex-1"
          disabled={busy}
          onClick={() => void submit(false)}
        >
          Authorize
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={busy}
          onClick={() => void submit(true)}
        >
          Deny
        </Button>
      </div>

      <button
        type="button"
        className="text-xs text-muted-foreground underline"
        onClick={() => router.push("/dashboard/developer")}
      >
        Manage developer apps
      </button>
    </div>
  );
}
