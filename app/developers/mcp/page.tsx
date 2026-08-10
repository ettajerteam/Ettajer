import Link from "next/link";
import { ArrowRight, Lock, Server, Shield, Terminal, Zap } from "lucide-react";
import { OpenConsoleLink } from "@/components/developer/open-console-link";

export const metadata = {
  title: "MCP — Ettajer for Developers",
  description:
    "Connect Claude and Cursor to Ettajer via Model Context Protocol. Same OAuth and scopes as the REST API.",
};

const ENDPOINT = "https://www.ettajer.com/api/v1/mcp";

const TOOL_GROUPS = [
  {
    title: "Discover",
    tools: ["get_context", "get_theme_schema", "get_products", "get_collections"],
  },
  {
    title: "Design",
    tools: [
      "create_theme",
      "apply_theme_batch",
      "update_section",
      "get_theme",
      "preview_theme",
    ],
  },
  {
    title: "Publish",
    tools: ["publish_theme"],
    note: "Requires themes:publish — keep off for AI clients by default.",
  },
] as const;

const RESOURCES = [
  { name: "Store context", uri: "ettajer://store" },
  { name: "Theme schema", uri: "ettajer://theme-schema" },
  { name: "Products", uri: "ettajer://products" },
  { name: "Collections", uri: "ettajer://collections" },
  { name: "Navigation", uri: "ettajer://navigation" },
] as const;

export default function DevelopersMcpPage() {
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
            MCP
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">
            Model Context Protocol over HTTP JSON-RPC. Same Bearer auth and scopes
            as the REST API — Claude and Cursor use one connected store.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <OpenConsoleLink className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]">
              Open console
              <ArrowRight className="h-3.5 w-3.5" />
            </OpenConsoleLink>
            <Link
              href="/developers/quickstart"
              className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Quickstart
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[#007AFF]" />
            <h2 className="text-[18px] font-semibold text-neutral-900">
              Endpoint
            </h2>
          </div>
          <div className="mt-4 rounded-2xl border border-black/[0.06] bg-[#0B0D10] px-4 py-4 sm:px-5">
            <p className="text-[11px] font-medium text-white/35">
              Production
            </p>
            <p className="mt-1 break-all font-mono text-[13px] text-[#64B5FF]">
              {ENDPOINT}
            </p>
            <p className="mt-3 text-[12px] text-white/40">
              Method{" "}
              <code className="text-white/70">POST</code>
              {" · "}
              Header{" "}
              <code className="text-white/70">Authorization: Bearer …</code>
              {" · "}
              Body JSON-RPC 2.0
            </p>
          </div>

          <pre className="mt-3 overflow-x-auto rounded-2xl border border-black/[0.06] bg-[#F5F5F7] p-4 font-mono text-[12px] leading-relaxed text-neutral-800">{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}`}</pre>
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#007AFF]" />
            <h2 className="text-[18px] font-semibold text-neutral-900">
              Connect a client
            </h2>
          </div>
          <p className="mt-1.5 max-w-xl text-[13px] text-neutral-500">
            Create an app in the console with the correct redirect URIs, then
            complete OAuth. Do not put client secrets in browser code.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
              <h3 className="text-[14px] font-semibold text-neutral-900">
                Claude
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                Add a custom connector with the MCP URL above. Advanced settings:
                client ID and secret from your app. Callback{" "}
                <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[11px]">
                  https://claude.ai/api/mcp/auth_callback
                </code>
                .
              </p>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
              <h3 className="text-[14px] font-semibold text-neutral-900">
                Cursor
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                Point MCP at the production URL. Use{" "}
                <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[11px]">
                  {"${env:ETTAJER_MCP_CLIENT_SECRET}"}
                </code>{" "}
                for the secret. Complete interactive OAuth in Cursor settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#007AFF]" />
            <h2 className="text-[18px] font-semibold text-neutral-900">
              Recommended tool flow
            </h2>
          </div>
          <p className="mt-1.5 text-[13px] text-neutral-500">
            About 32 tools. Prefer batch over recreating themes.
          </p>

          <ul className="mt-6 space-y-3">
            {TOOL_GROUPS.map((group) => (
              <li
                key={group.title}
                className="rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 px-4 py-4 sm:px-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-neutral-900">
                    {group.title}
                  </h3>
                  {"note" in group && group.note ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                      <Lock className="h-3 w-3" />
                      Protected
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-neutral-700">
                  {group.tools.map((tool, i) => (
                    <span key={tool} className="inline-flex items-center gap-2">
                      {i > 0 ? (
                        <span className="text-neutral-300" aria-hidden>
                          →
                        </span>
                      ) : null}
                      <span>{tool}</span>
                    </span>
                  ))}
                </p>
                {"note" in group && group.note ? (
                  <p className="mt-2 text-[12px] text-neutral-500">
                    {group.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-[18px] font-semibold text-neutral-900">
            Preview & publish
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
              <h3 className="text-[14px] font-semibold text-neutral-900">
                preview_theme
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                Short-lived signed preview URL (~10 minutes). Read-only. Works on
                home, product, collection, and custom pages. Does not publish.
              </p>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
              <h3 className="text-[14px] font-semibold text-neutral-900">
                publish_theme
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                Requires{" "}
                <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[11px]">
                  themes:publish
                </code>
                . Transactional. Cart and checkout stay on Ettajer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-[18px] font-semibold text-neutral-900">
            Resources
          </h2>
          <p className="mt-1.5 text-[13px] text-neutral-500">
            Readable via{" "}
            <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px]">
              resources/list
            </code>{" "}
            and{" "}
            <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px]">
              resources/read
            </code>
            .
          </p>
          <ul className="mt-5 divide-y divide-black/[0.05] overflow-hidden rounded-2xl border border-black/[0.06]">
            {RESOURCES.map((r) => (
              <li
                key={r.uri}
                className="flex flex-col gap-0.5 bg-[#F5F5F7]/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-[13px] font-medium text-neutral-900">
                  {r.name}
                </span>
                <code className="text-[11px] text-neutral-500">{r.uri}</code>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#007AFF]" />
            <h2 className="text-[18px] font-semibold text-neutral-900">
              Rate limiting
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-neutral-500">
            Default{" "}
            <code className="rounded bg-white px-1 py-0.5 text-[12px]">
              RATE_LIMIT_BACKEND=memory
            </code>{" "}
            is fine for local or single-instance use. Production multi-instance
            should use{" "}
            <code className="rounded bg-white px-1 py-0.5 text-[12px]">
              RATE_LIMIT_BACKEND=redis
            </code>{" "}
            with Upstash REST credentials. In-memory limits are not shared across
            instances.
          </p>
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#0B0D10]">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[18px] font-semibold text-white">
              Ready to connect?
            </h2>
            <p className="mt-1 text-[13px] text-white/45">
              Create an app, add redirect URIs, then authorize your store.
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
