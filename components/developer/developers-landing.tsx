import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Layers,
  Lock,
  Sparkles,
  Store,
  Workflow,
} from "lucide-react";
import { THEME_AI_DEFAULT_SCOPES, scopeDescription } from "@/lib/developer/scopes";
import { OpenConsoleLink } from "@/components/developer/open-console-link";
import { DeveloperHelpGuides } from "@/components/developer/developer-help-guides";

const STEPS = [
  {
    title: "Create an app",
    body: "Open the console, add redirect URIs for Claude or Cursor, and save your client credentials once.",
  },
  {
    title: "Connect with OAuth",
    body: "Authorize the store. PKCE protects the flow. Tokens stay scoped to one merchant.",
  },
  {
    title: "Design with MCP",
    body: "Agents read context, apply theme batches, and open signed previews — without publishing.",
  },
] as const;

const CAPABILITIES = [
  {
    icon: Sparkles,
    title: "Theme & layout",
    body: "Draft themes, sections, navigation, and media. Preview before anything goes live.",
  },
  {
    icon: Store,
    title: "Store context",
    body: "Products, collections, and branding — tenant-scoped for the connected store only.",
  },
  {
    icon: Lock,
    title: "Publish protection",
    body: "AI can draft and preview. Publishing stays a merchant action unless you grant it.",
  },
  {
    icon: Workflow,
    title: "Batch mutations",
    body: "Apply many theme edits in one fail-closed operation validated against the schema.",
  },
] as const;

export function DevelopersLanding() {
  return (
    <div className="font-[family-name:var(--font-inter),ui-sans-serif,system-ui,sans-serif]">
      {/* Hero — one composition */}
      <section className="relative overflow-hidden bg-[#0B0D10] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% -10%, rgba(0,122,255,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 100%, rgba(255,255,255,0.04), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <p className="text-[13px] font-medium text-white/45">
            Ettajer for Developers
          </p>
          <h1 className="mt-3 max-w-2xl text-[36px] font-semibold leading-[1.08] text-white sm:text-[44px]">
            Build AI storefronts on Ettajer
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/55">
            Connect Claude, Cursor, and agents with OAuth and MCP. AI shapes
            presentation. Ettajer keeps cart, checkout, and commerce.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
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

      {/* Principle */}
      <section className="border-b border-black/[0.05] bg-white">
        <div className="mx-auto grid max-w-5xl gap-px bg-black/[0.05] sm:grid-cols-2">
          <div className="bg-white px-5 py-8 sm:px-8">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <Sparkles className="h-4 w-4 text-[#007AFF]" />
              AI
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
              Themes, layouts, sections, copy structure, and media — draft and
              preview safely.
            </p>
          </div>
          <div className="bg-white px-5 py-8 sm:px-8">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              <Store className="h-4 w-4 text-[#007AFF]" />
              Ettajer
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
              Products, inventory, cart, checkout, payments, and orders — owned
              by the platform.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-[22px] font-semibold text-neutral-900">
            How it works
          </h2>
          <p className="mt-1.5 max-w-lg text-[14px] text-neutral-500">
            Three steps from app creation to a signed theme preview.
          </p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-black/[0.06] bg-white p-5"
              >
                <span className="text-[12px] font-semibold text-[#007AFF]">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-[15px] font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-[22px] font-semibold text-neutral-900">
            What agents can do
          </h2>
          <p className="mt-1.5 max-w-lg text-[14px] text-neutral-500">
            Scoped tools over REST and MCP — same authorization layer.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {CAPABILITIES.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 p-5"
              >
                <item.icon className="h-4 w-4 text-[#007AFF]" />
                <h3 className="mt-3 text-[15px] font-semibold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Docs strip */}
      <section className="border-t border-black/[0.05] bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[22px] font-semibold text-neutral-900">
                Documentation
              </h2>
              <p className="mt-1.5 text-[14px] text-neutral-500">
                Guides for humans and machine-readable contracts for agents.
              </p>
            </div>
            <Link
              href="/developers/openapi.json"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#007AFF] hover:underline"
            >
              <Code2 className="h-3.5 w-3.5" />
              OpenAPI JSON
            </Link>
          </div>
          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            {[
              { href: "/developers/mcp", label: "MCP", desc: "Tools & resources" },
              { href: "/developers/oauth", label: "OAuth", desc: "PKCE & tokens" },
              { href: "/developers/api", label: "API", desc: "REST /api/v1" },
              {
                href: "/developers/themes",
                label: "Themes",
                desc: "Schema & drafts",
              },
              {
                href: "/developers/authentication",
                label: "Authentication",
                desc: "Keys & grants",
              },
              {
                href: "/developers/examples",
                label: "Examples",
                desc: "Workflow samples",
              },
            ].map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="rounded-xl border border-black/[0.06] bg-white px-4 py-3.5 transition hover:border-black/[0.1]"
              >
                <p className="text-[14px] font-semibold text-neutral-900">
                  {doc.label}
                </p>
                <p className="mt-0.5 text-[12px] text-neutral-500">{doc.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Scopes */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#007AFF]" />
            <h2 className="text-[22px] font-semibold text-neutral-900">
              Default theme AI scopes
            </h2>
          </div>
          <p className="mt-1.5 max-w-lg text-[14px] text-neutral-500">
            Publishing needs a separate{" "}
            <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[12px]">
              themes:publish
            </code>{" "}
            grant.
          </p>
          <ul className="mt-6 divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/50">
            {THEME_AI_DEFAULT_SCOPES.map((scope) => (
              <li
                key={scope}
                className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <code className="shrink-0 text-[12px] font-medium text-neutral-900">
                  {scope}
                </code>
                <span className="text-[12px] text-neutral-500">
                  {scopeDescription(scope)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/[0.05] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <DeveloperHelpGuides />
        </div>
      </section>

      <section className="border-t border-black/[0.05] bg-[#0B0D10]">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[20px] font-semibold text-white">
              Ready to connect an agent?
            </h2>
            <p className="mt-1 text-[13px] text-white/45">
              Create an application in the console and authorize your store.
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
