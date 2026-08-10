import Link from "next/link";
import { ArrowRight, KeyRound, Lock, RefreshCw, Shield } from "lucide-react";
import { OpenConsoleLink } from "@/components/developer/open-console-link";

export const metadata = {
  title: "OAuth — Ettajer for Developers",
  description:
    "OAuth 2.0 authorization code + PKCE S256 for Ettajer Developer Platform. Authorize, token, refresh, revoke.",
};

const STEPS = [
  {
    title: "Create an application",
    body: (
      <>
        In the{" "}
        <OpenConsoleLink className="font-medium text-[#007AFF] hover:underline">
          console
        </OpenConsoleLink>
        , create an app and copy the client ID and secret once. Register exact
        redirect URIs (Claude and Cursor presets are included).
      </>
    ),
  },
  {
    title: "Start authorization",
    body: (
      <>
        Send the merchant to{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          /oauth/authorize
        </code>{" "}
        with{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          client_id
        </code>
        ,{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          redirect_uri
        </code>
        ,{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          response_type=code
        </code>
        ,{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          scope
        </code>
        ,{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          state
        </code>
        , and PKCE{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          code_challenge
        </code>{" "}
        (S256 only).
      </>
    ),
  },
  {
    title: "Merchant consent",
    body: "The merchant signs in and authorizes scopes for one store. The grant is permanently bound to that store.",
  },
  {
    title: "Exchange the code",
    body: (
      <>
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          POST /api/oauth/token
        </code>{" "}
        with{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          grant_type=authorization_code
        </code>
        , the code, redirect URI, and{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          code_verifier
        </code>
        . Codes are single-use.
      </>
    ),
  },
  {
    title: "Refresh & revoke",
    body: (
      <>
        Refresh with{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          grant_type=refresh_token
        </code>{" "}
        (rotation enabled). Revoke via{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          POST /api/oauth/revoke
        </code>
        .
      </>
    ),
  },
] as const;

const ENDPOINTS = [
  {
    label: "Authorize",
    path: "/oauth/authorize",
    also: "/authorize",
    note: "Browser redirect + consent",
  },
  {
    label: "Token",
    path: "/api/oauth/token",
    also: "/token",
    note: "Code exchange & refresh",
  },
  {
    label: "Revoke",
    path: "/api/oauth/revoke",
    also: null,
    note: "Invalidate tokens",
  },
  {
    label: "Discovery",
    path: "/.well-known/oauth-authorization-server",
    also: null,
    note: "AS metadata (PKCE S256)",
  },
] as const;

const REDIRECTS = [
  {
    name: "Claude",
    uri: "https://claude.ai/api/mcp/auth_callback",
  },
  {
    name: "Cursor (local)",
    uri: "http://localhost:8787/callback",
  },
  {
    name: "Cursor (cloud)",
    uri: "https://www.cursor.com/agents/mcp/oauth/callback",
  },
] as const;

export default function DevelopersOAuthPage() {
  return (
    <div className="font-[family-name:var(--font-inter),ui-sans-serif,system-ui,sans-serif]">
      <section className="relative overflow-hidden bg-[#0B0D10] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(0,122,255,0.18), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14">
          <p className="text-[13px] font-medium text-white/45">
            Ettajer for Developers
          </p>
          <h1 className="mt-2 max-w-2xl text-[32px] font-semibold leading-[1.1] text-white sm:text-[40px]">
            OAuth
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">
            Authorization code flow with PKCE S256. One merchant, one store,
            scoped access — no store ID from the client.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <OpenConsoleLink className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]">
              Open console
              <ArrowRight className="h-3.5 w-3.5" />
            </OpenConsoleLink>
            <Link
              href="/developers/authentication"
              className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Authentication
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-black/[0.05] bg-white">
        <div className="mx-auto grid max-w-5xl gap-px bg-black/[0.05] sm:grid-cols-3">
          <div className="bg-white px-5 py-6 sm:px-6">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <Shield className="h-4 w-4 text-[#007AFF]" />
              PKCE S256
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              Required. Plain challenges are rejected. Verifier must match at
              token exchange.
            </p>
          </div>
          <div className="bg-white px-5 py-6 sm:px-6">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <Lock className="h-4 w-4 text-[#007AFF]" />
              Exact redirect
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              Redirect URI must match a registered value exactly — no wildcards.
            </p>
          </div>
          <div className="bg-white px-5 py-6 sm:px-6">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <KeyRound className="h-4 w-4 text-[#007AFF]" />
              Single-use codes
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              Authorization codes expire quickly and cannot be reused.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-[18px] font-semibold text-neutral-900">
            Flow
          </h2>
          <ol className="mt-5 space-y-2">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-black/[0.06] bg-white px-4 py-4 sm:px-5"
              >
                <div className="flex gap-3 sm:gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10 text-[12px] font-semibold text-[#007AFF]">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-neutral-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-[18px] font-semibold text-neutral-900">
            Endpoints
          </h2>
          <ul className="mt-5 divide-y divide-black/[0.05] overflow-hidden rounded-2xl border border-black/[0.06]">
            {ENDPOINTS.map((ep) => (
              <li
                key={ep.path}
                className="flex flex-col gap-1 bg-[#F5F5F7]/40 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900">
                    {ep.label}
                  </p>
                  <p className="mt-0.5 break-all font-mono text-[11px] text-neutral-600">
                    {ep.path}
                    {ep.also ? (
                      <span className="text-neutral-400"> · also {ep.also}</span>
                    ) : null}
                  </p>
                </div>
                <p className="text-[12px] text-neutral-500 sm:text-right">
                  {ep.note}
                </p>
              </li>
            ))}
          </ul>

          <pre className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-[#0B0D10] p-4 font-mono text-[11px] leading-relaxed text-white/75">{`GET /oauth/authorize
  ?client_id=…
  &redirect_uri=…
  &response_type=code
  &scope=store:read%20themes:read%20themes:create%20themes:write%20themes:preview
  &state=…
  &code_challenge=…
  &code_challenge_method=S256

POST /api/oauth/token
  grant_type=authorization_code
  code=…
  redirect_uri=…
  client_id=…
  client_secret=…
  code_verifier=…`}</pre>
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-[#007AFF]" />
            <h2 className="text-[18px] font-semibold text-neutral-900">
              Common redirect URIs
            </h2>
          </div>
          <p className="mt-1.5 text-[13px] text-neutral-500">
            Must be registered exactly on the app.
          </p>
          <ul className="mt-5 space-y-2">
            {REDIRECTS.map((r) => (
              <li
                key={r.uri}
                className="rounded-xl border border-black/[0.06] bg-white px-4 py-3"
              >
                <p className="text-[13px] font-semibold text-neutral-900">
                  {r.name}
                </p>
                <code className="mt-1 block break-all text-[11px] text-neutral-600">
                  {r.uri}
                </code>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h2 className="text-[18px] font-semibold text-neutral-900">
            Related
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/developers/authentication"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-[#F5F5F7] px-3.5 text-[12px] font-semibold text-neutral-800"
            >
              Authentication
            </Link>
            <Link
              href="/developers/mcp"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-[#F5F5F7] px-3.5 text-[12px] font-semibold text-neutral-800"
            >
              MCP
            </Link>
            <Link
              href="/developers/api"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-[#F5F5F7] px-3.5 text-[12px] font-semibold text-neutral-800"
            >
              API
            </Link>
            <Link
              href="/developers/quickstart"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-[#F5F5F7] px-3.5 text-[12px] font-semibold text-neutral-800"
            >
              Quickstart
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#0B0D10]">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[18px] font-semibold text-white">
              Create an OAuth app
            </h2>
            <p className="mt-1 text-[13px] text-white/45">
              Register redirect URIs, then connect Claude or Cursor.
            </p>
          </div>
          <OpenConsoleLink className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]">
            Open console
            <ArrowRight className="h-3.5 w-3.5" />
          </OpenConsoleLink>
        </div>
      </section>
    </div>
  );
}
