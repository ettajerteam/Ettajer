import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/site-config";
import {
  DEVELOPER_SCOPES,
  THEME_AI_DEFAULT_SCOPES,
  scopeDescription,
} from "@/lib/developer/scopes";

export const metadata: Metadata = {
  title: "Ettajer Developers",
  description:
    "Connect Claude, Cursor, and AI agents to Ettajer with OAuth, Developer API, and MCP. AI designs themes; Ettajer runs commerce.",
};

const LINKS = [
  { href: "/developers/authentication", label: "Authentication" },
  { href: "/developers/oauth", label: "OAuth" },
  { href: "/developers/api", label: "API" },
  { href: "/developers/themes", label: "Themes" },
  { href: "/developers/mcp", label: "MCP" },
  { href: "/developers/examples", label: "Examples" },
  { href: "/developers/quickstart", label: "AI Quickstart" },
  { href: "/developers/ai-integration", label: "AI Integration" },
  { href: "/developers/ai-system-prompt", label: "AI System Prompt" },
  { href: "/developers/openapi.json", label: "OpenAPI JSON" },
  { href: "/developers/llms.txt", label: "llms.txt" },
];

export default function DevelopersHomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8E8E93]">
        Developer Platform
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
        Build with AI on Ettajer
      </h1>
      <p className="mt-4 text-lg text-[#636366]">
        Connect Claude, Cursor, and other agents to a merchant store. AI controls
        presentation — themes, layouts, sections, media, pages. Ettajer controls
        products, cart, checkout, payments, and orders.
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-2xl border bg-white px-5 py-4 text-sm font-semibold text-[#007AFF] shadow-sm hover:bg-neutral-50"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Default theme AI scopes</h2>
        <ul className="mt-4 space-y-2 text-sm text-[#636366]">
          {THEME_AI_DEFAULT_SCOPES.map((s) => (
            <li key={s}>
              <code className="text-neutral-900">{s}</code> — {scopeDescription(s)}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[#636366]">
          Publishing requires separate <code>themes:publish</code>. Full scope list:{" "}
          {DEVELOPER_SCOPES.length} scopes.
        </p>
      </section>

      <section className="mt-12 rounded-2xl bg-[#F2F2F7] p-6 text-sm text-[#636366]">
        <p>
          Merchants manage apps at{" "}
          <Link href="/dashboard/developer" className="font-semibold text-[#007AFF]">
            /dashboard/developer
          </Link>
          . Machine docs:{" "}
          <a href={absoluteUrl("/developers/llms-full.txt")} className="font-semibold text-[#007AFF]">
            llms-full.txt
          </a>
          .
        </p>
      </section>
    </main>
  );
}
