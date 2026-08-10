import Link from "next/link";
import { ArrowRight, Lock, Sparkles, Terminal } from "lucide-react";
import { OpenConsoleLink } from "@/components/developer/open-console-link";

export const metadata = {
  title: "Quickstart — Ettajer for Developers",
  description:
    "Minimal AI workflow: auth → context → schema → theme → preview → publish",
};

const STEPS = [
  {
    title: "Authenticate",
    detail: (
      <>
        Use OAuth (
        <Link href="/developers/oauth" className="font-medium text-[#007AFF] hover:underline">
          docs
        </Link>
        ) or an API key from the{" "}
        <OpenConsoleLink className="font-medium text-[#007AFF] hover:underline">
          console
        </OpenConsoleLink>
        . Send{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          Authorization: Bearer …
        </code>
        .
      </>
    ),
  },
  {
    title: "Load store context",
    detail: (
      <>
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          GET /api/v1/context
        </code>{" "}
        — branding, products, collections, and themes for the connected store.
      </>
    ),
  },
  {
    title: "Read the theme schema",
    detail: (
      <>
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          GET /api/v1/themes/schema
        </code>{" "}
        — allowed sections, settings, and reference shapes.
      </>
    ),
  },
  {
    title: "Create a private draft",
    detail: (
      <>
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          POST /api/v1/themes
        </code>{" "}
        with{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          {`{ "name": "AI Minimal", "provider": "claude" }`}
        </code>
        . Does not publish.
      </>
    ),
  },
  {
    title: "Build the homepage",
    detail: (
      <>
        Prefer{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          POST /api/v1/themes/:id/batch
        </code>{" "}
        (or MCP{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          apply_theme_batch
        </code>
        ) for hero, product-grid with real product IDs, and footer. Optional pages via{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          /pages
        </code>{" "}
        — not cart, checkout, or products.
      </>
    ),
  },
  {
    title: "Generate a preview",
    detail: (
      <>
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          POST /api/v1/themes/:id/preview-token
        </code>{" "}
        returns a short-lived signed URL. Same storefront renderer; real catalog and
        checkout. Merchant session can preview without a token.
      </>
    ),
  },
  {
    title: "Merchant review",
    detail: (
      <>
        Customize opens{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          /dashboard/themes/editor?themeId=…
        </code>{" "}
        and loads the draft in the visual editor.
      </>
    ),
  },
  {
    title: "Publish (merchant)",
    detail: (
      <>
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          POST /api/v1/themes/:id/publish
        </code>{" "}
        requires{" "}
        <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
          themes:publish
        </code>
        . Transactional. Cart and checkout stay on Ettajer.
      </>
    ),
  },
] as const;

const MCP_FLOW = [
  "get_context",
  "get_theme_schema",
  "get_products",
  "create_theme",
  "apply_theme_batch",
  "preview_theme",
] as const;

export default function DevelopersQuickstartPage() {
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
            Quickstart
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">
            Auth → context → schema → draft theme → preview → merchant publish.
            AI controls presentation. Ettajer controls commerce.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <OpenConsoleLink className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]">
              Open console
              <ArrowRight className="h-3.5 w-3.5" />
            </OpenConsoleLink>
            <Link
              href="/developers/mcp"
              className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              MCP docs
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-black/[0.05] bg-white">
        <div className="mx-auto grid max-w-5xl gap-px bg-black/[0.05] sm:grid-cols-2">
          <div className="bg-white px-5 py-6 sm:px-8">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <Sparkles className="h-4 w-4 text-[#007AFF]" />
              AI
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              Draft themes, sections, and previews. Prefer batch mutations over
              one-off recreates.
            </p>
          </div>
          <div className="bg-white px-5 py-6 sm:px-8">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <Lock className="h-4 w-4 text-[#007AFF]" />
              Publish
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              Going live needs{" "}
              <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px]">
                themes:publish
              </code>
              . Keep it off for AI clients by default.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
          <h2 className="text-[20px] font-semibold text-neutral-900">
            REST workflow
          </h2>
          <p className="mt-1 text-[13px] text-neutral-500">
            Same authorization for REST and MCP.
          </p>

          <ol className="mt-6 space-y-2">
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
                      {step.detail}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#007AFF]" />
            <h2 className="text-[20px] font-semibold text-neutral-900">
              MCP path
            </h2>
          </div>
          <p className="mt-1.5 max-w-xl text-[13px] text-neutral-500">
            Endpoint{" "}
            <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px] text-neutral-800">
              POST /api/v1/mcp
            </code>
            . Prefer batch over repeated single-section calls.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-black/[0.06] bg-[#0B0D10] px-4 py-4 sm:px-5">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-white/80">
              {MCP_FLOW.map((tool, i) => (
                <span key={tool} className="inline-flex items-center gap-2">
                  {i > 0 ? (
                    <span className="text-white/25" aria-hidden>
                      →
                    </span>
                  ) : null}
                  <span className="text-[#64B5FF]">{tool}</span>
                </span>
              ))}
            </p>
            <p className="mt-3 text-[12px] text-white/35">
              Then merchant publish — or{" "}
              <code className="text-white/50">publish_theme</code> only with{" "}
              <code className="text-white/50">themes:publish</code>.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/developers/mcp"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-white px-3.5 text-[12px] font-semibold text-neutral-800 transition hover:bg-[#F5F5F7]"
            >
              MCP guide
            </Link>
            <Link
              href="/developers/llms-full.txt"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-white px-3.5 text-[12px] font-semibold text-neutral-800 transition hover:bg-[#F5F5F7]"
            >
              llms-full.txt
            </Link>
            <Link
              href="/developers/ai-system-prompt"
              className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] bg-white px-3.5 text-[12px] font-semibold text-neutral-800 transition hover:bg-[#F5F5F7]"
            >
              AI system prompt
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#0B0D10]">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[18px] font-semibold text-white">
              Create your first app
            </h2>
            <p className="mt-1 text-[13px] text-white/45">
              Add Claude and Cursor redirect URIs, then authorize the store.
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
