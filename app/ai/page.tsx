import type { Metadata } from "next";
import Link from "next/link";
import { HelpShell } from "@/components/help/help-shell";
import { absoluteUrl } from "@/lib/seo/site-config";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import {
  ETTAJER_PRODUCT_FACTS,
  getAiAssistantPrompt,
} from "@/lib/seo/llms-content";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/constants/support";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: {
      title: "Ettajer for AI assistants",
      description:
        "Official Ettajer knowledge for ChatGPT, Claude, Gemini, and other AI tools — llms.txt, knowledge.json, search API, and a copy-paste assistant prompt.",
      keywords: [
        "Ettajer AI",
        "llms.txt",
        "ChatGPT Ettajer",
        "Claude Ettajer",
        "knowledge.json",
        "COD Morocco",
      ],
    },
    path: "/ai",
    locale,
    alternateTypes: {
      "text/plain": [
        { url: absoluteUrl("/llms.txt"), title: "llms.txt" },
        { url: absoluteUrl("/llms-full.txt"), title: "llms-full.txt" },
      ],
      "application/json": [
        { url: absoluteUrl("/knowledge.json"), title: "knowledge.json" },
        { url: absoluteUrl("/ai/openapi.json"), title: "openapi.json" },
      ],
    },
  });
}

const SOURCES = [
  {
    title: "llms.txt",
    href: "/llms.txt",
    blurb: "Short index — what Ettajer is and where to dig deeper.",
  },
  {
    title: "llms-full.txt",
    href: "/llms-full.txt",
    blurb: "Full public help corpus with step-by-step articles.",
  },
  {
    title: "knowledge.json",
    href: "/knowledge.json",
    blurb: "Structured FAQ, product facts, and articles for tools.",
  },
  {
    title: "Search API",
    href: "/api/public/knowledge/search?q=COD",
    blurb: "GET ?q=… — ranked hits for Custom GPT Actions.",
  },
  {
    title: "OpenAPI",
    href: "/ai/openapi.json",
    blurb: "Import into ChatGPT Custom GPT Actions or other agents.",
  },
] as const;

export default function AiAssistantsPage() {
  const prompt = getAiAssistantPrompt();

  return (
    <HelpShell>
      <section className="border-b border-black/[0.04] bg-[#F2F2F7] md:border-neutral-200 md:bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8E8E93]">
            For AI assistants
          </p>
          <h1 className="mt-3 text-[2rem] font-bold tracking-tight text-neutral-900 md:text-4xl">
            Teach any AI Ettajer
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#636366] md:text-lg">
            Ettajer publishes official machine-readable docs so ChatGPT, Claude, Gemini,
            Perplexity, and coding agents can answer merchants from the real product — not
            guesses. Paste the prompt below, or point an agent at the sources.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <h2 className="text-xl font-bold text-neutral-900">1. Copy this into your AI</h2>
        <p className="mt-2 text-[15px] text-[#8E8E93]">
          Works in ChatGPT, Claude, Gemini, DeepSeek, and similar chats. Then ask your
          question about Ettajer.
        </p>
        <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-neutral-900 p-5 text-[13px] leading-relaxed text-neutral-100">
          {prompt}
        </pre>
        <p className="mt-3 text-[13px] text-[#8E8E93]">
          Tip: also paste{" "}
          <a className="font-medium text-[#007AFF]" href={absoluteUrl("/llms-full.txt")}>
            {absoluteUrl("/llms-full.txt")}
          </a>{" "}
          if your AI can fetch URLs.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-10 md:px-6 md:pb-14">
        <h2 className="text-xl font-bold text-neutral-900">2. Official sources</h2>
        <ul className="mt-5 divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)]">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-neutral-50"
              >
                <span className="text-[15px] font-semibold text-[#007AFF]">{source.title}</span>
                <span className="text-[14px] text-[#8E8E93]">{source.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-10 md:px-6 md:pb-14">
        <h2 className="text-xl font-bold text-neutral-900">3. Custom GPT / Actions</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#636366]">
          <li>Create a Custom GPT in ChatGPT.</li>
          <li>
            Add an Action and import schema from{" "}
            <a className="font-medium text-[#007AFF]" href="/ai/openapi.json">
              /ai/openapi.json
            </a>
            .
          </li>
          <li>
            Paste the assistant prompt above into the GPT instructions, and tell it to call
            search before answering how-to questions.
          </li>
        </ol>
        <p className="mt-4 text-[15px] text-[#636366]">
          There is no classic ChatGPT “plugin store” listing for Ettajer — Custom GPTs +
          public knowledge URLs are the supported path.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-14 md:px-6 md:pb-20">
        <h2 className="text-xl font-bold text-neutral-900">Product facts at a glance</h2>
        <div className="mt-5 space-y-4">
          {ETTAJER_PRODUCT_FACTS.map((fact) => (
            <div key={fact.id} className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-[16px] font-semibold text-neutral-900">{fact.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#636366]">{fact.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-[#F2F2F7] p-6 text-center md:p-8">
          <p className="text-[15px] text-[#636366]">
            Need a human?{" "}
            <a className="font-semibold text-[#007AFF]" href={SUPPORT_MAILTO}>
              {SUPPORT_EMAIL}
            </a>{" "}
            ·{" "}
            <Link href="/help" className="font-semibold text-[#007AFF]">
              Help center
            </Link>{" "}
            ·{" "}
            <Link href="/contact" className="font-semibold text-[#007AFF]">
              Contact
            </Link>
          </p>
        </div>
      </section>
    </HelpShell>
  );
}
