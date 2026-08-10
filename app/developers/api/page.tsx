import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Lock, Shield } from "lucide-react";
import { OpenConsoleLink } from "@/components/developer/open-console-link";

export const metadata = {
  title: "API — Ettajer for Developers",
  description:
    "Ettajer Developer API v1 — REST under /api/v1 with OAuth, envelopes, pagination, and idempotency.",
};

const ENDPOINT_GROUPS = [
  {
    title: "Context",
    items: [
      { method: "GET", path: "/api/v1/context", note: "Store snapshot + workflow.next" },
      { method: "GET", path: "/api/v1/store", note: "Store profile" },
      { method: "GET", path: "/api/v1/store/settings", note: "Settings & branding" },
    ],
  },
  {
    title: "Catalog (read)",
    items: [
      { method: "GET", path: "/api/v1/products", note: "Cursor pagination" },
      { method: "GET", path: "/api/v1/products/:id", note: "One product" },
      { method: "GET", path: "/api/v1/collections", note: "List collections" },
      { method: "GET", path: "/api/v1/collections/:id", note: "One collection" },
    ],
  },
  {
    title: "Commerce (read)",
    items: [
      { method: "GET", path: "/api/v1/orders", note: "Read-only" },
      { method: "GET", path: "/api/v1/orders/:id", note: "One order" },
      { method: "GET", path: "/api/v1/customers", note: "Read-only" },
      { method: "GET", path: "/api/v1/checkout", note: "Checkout summary" },
    ],
  },
  {
    title: "Themes",
    items: [
      { method: "GET", path: "/api/v1/themes/schema", note: "Canonical schema" },
      { method: "GET", path: "/api/v1/themes", note: "List drafts" },
      { method: "POST", path: "/api/v1/themes", note: "Create draft" },
      { method: "GET", path: "/api/v1/themes/:id", note: "Read theme" },
      { method: "POST", path: "/api/v1/themes/:id/batch", note: "Fail-closed batch" },
      { method: "POST", path: "/api/v1/themes/:id/preview-token", note: "Signed preview" },
      {
        method: "POST",
        path: "/api/v1/themes/:id/publish",
        note: "Requires themes:publish",
        protected: true,
      },
    ],
  },
  {
    title: "Media & navigation",
    items: [
      { method: "GET", path: "/api/v1/media", note: "List media" },
      { method: "POST", path: "/api/v1/media", note: "Register URL" },
      { method: "GET", path: "/api/v1/navigation", note: "Read nav" },
      { method: "PATCH", path: "/api/v1/navigation", note: "Update nav" },
    ],
  },
  {
    title: "MCP",
    items: [
      { method: "POST", path: "/api/v1/mcp", note: "JSON-RPC tools & resources" },
    ],
  },
] as const;

function MethodBadge({ method }: { method: string }) {
  const tone =
    method === "GET"
      ? "bg-emerald-50 text-emerald-700"
      : method === "POST"
        ? "bg-sky-50 text-sky-700"
        : "bg-amber-50 text-amber-800";
  return (
    <span
      className={`inline-flex min-w-[3.25rem] justify-center rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold ${tone}`}
    >
      {method}
    </span>
  );
}

export default function DevelopersApiPage() {
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
            API
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">
            Versioned REST under{" "}
            <code className="text-white/80">/api/v1</code>. Same Bearer auth as
            MCP. AI designs themes — commerce writes stay on Ettajer.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/developers/openapi.json"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]"
            >
              <Code2 className="h-3.5 w-3.5" />
              OpenAPI
            </Link>
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
              Stable v1
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              Compatible additions may ship without a new version. Breaking
              changes need{" "}
              <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[11px]">
                /api/v2
              </code>
              .
            </p>
          </div>
          <div className="bg-white px-5 py-6 sm:px-6">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <BookOpen className="h-4 w-4 text-[#007AFF]" />
              Shared services
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              REST and MCP call the same auth, scope, and tenant checks.
            </p>
          </div>
          <div className="bg-white px-5 py-6 sm:px-6">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <Lock className="h-4 w-4 text-[#007AFF]" />
              No commerce writes
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              Products, cart, and checkout are not writable through this API.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-[18px] font-semibold text-neutral-900">
            Response contract
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-[#0B0D10] p-4 font-mono text-[12px] leading-relaxed text-white/80">{`Success  { "data": … }
List     { "data": { "products": […] }, "pagination": { "nextCursor", "hasMore", "limit" } }
Error    { "error": { "code", "message", "details?", "requestId" } }`}</pre>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
              <p className="text-[13px] font-semibold text-neutral-900">
                Headers
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">
                <code className="text-neutral-700">X-Request-Id</code>,{" "}
                <code className="text-neutral-700">X-RateLimit-*</code>. Mutations
                accept{" "}
                <code className="text-neutral-700">Idempotency-Key</code>. On
                429:{" "}
                <code className="text-neutral-700">Retry-After</code>.
              </p>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
              <p className="text-[13px] font-semibold text-neutral-900">
                Rate limiting
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">
                <code className="text-neutral-700">RATE_LIMIT_BACKEND=memory</code>{" "}
                is not multi-instance safe. Use Redis with Upstash in production.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-[18px] font-semibold text-neutral-900">
            Core endpoints
          </h2>
          <p className="mt-1.5 text-[13px] text-neutral-500">
            Full machine contract:{" "}
            <Link
              href="/developers/openapi.json"
              className="font-medium text-[#007AFF] hover:underline"
            >
              OpenAPI JSON
            </Link>
            .
          </p>

          <div className="mt-6 space-y-4">
            {ENDPOINT_GROUPS.map((group) => (
              <div
                key={group.title}
                className="overflow-hidden rounded-2xl border border-black/[0.06]"
              >
                <div className="border-b border-black/[0.05] bg-[#F5F5F7] px-4 py-2.5">
                  <h3 className="text-[13px] font-semibold text-neutral-900">
                    {group.title}
                  </h3>
                </div>
                <ul className="divide-y divide-black/[0.04] bg-white">
                  {group.items.map((item) => (
                    <li
                      key={`${item.method}-${item.path}`}
                      className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <MethodBadge method={item.method} />
                        <code className="truncate text-[12px] text-neutral-800">
                          {item.path}
                        </code>
                        {"protected" in item && item.protected ? (
                          <span className="hidden rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 sm:inline">
                            Protected
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[12px] text-neutral-500 sm:text-right">
                        {item.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h2 className="text-[18px] font-semibold text-neutral-900">
            Related
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/developers/authentication"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-white px-3.5 text-[12px] font-semibold text-neutral-800 transition hover:bg-white"
            >
              Authentication
            </Link>
            <Link
              href="/developers/oauth"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-white px-3.5 text-[12px] font-semibold text-neutral-800"
            >
              OAuth
            </Link>
            <Link
              href="/developers/mcp"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-white px-3.5 text-[12px] font-semibold text-neutral-800"
            >
              MCP
            </Link>
            <Link
              href="/developers/ai-integration"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-white px-3.5 text-[12px] font-semibold text-neutral-800"
            >
              AI integration
            </Link>
            <Link
              href="/developers/quickstart"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-white px-3.5 text-[12px] font-semibold text-neutral-800"
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
              Get a token
            </h2>
            <p className="mt-1 text-[13px] text-white/45">
              Create an app in the console, then call /api/v1 with Bearer auth.
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
