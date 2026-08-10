import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  KeyRound,
  LifeBuoy,
  MessageCircle,
  Sparkles,
  Terminal,
  Workflow,
} from "lucide-react";
import { SUPPORT_MAILTO } from "@/lib/constants/support";
import {
  getDeveloperArticles,
  getDeveloperTutorials,
} from "@/lib/help/help-data";
import { cn } from "@/lib/utils";

export const DEVELOPER_GUIDES = [
  {
    href: "/developers/quickstart",
    title: "Quickstart",
    body: "Auth → context → theme → preview in one path.",
    icon: Workflow,
  },
  {
    href: "/developers/mcp",
    title: "MCP setup",
    body: "Connect Claude or Cursor to the Ettajer MCP endpoint.",
    icon: Terminal,
  },
  {
    href: "/developers/oauth",
    title: "OAuth & PKCE",
    body: "Authorize a store, exchange codes, refresh tokens.",
    icon: KeyRound,
  },
  {
    href: "/developers/api",
    title: "API reference",
    body: "REST under /api/v1 — envelopes, scopes, pagination.",
    icon: Code2,
  },
  {
    href: "/developers/authentication",
    title: "Authentication",
    body: "Bearer tokens, API keys, and store-bound grants.",
    icon: BookOpen,
  },
  {
    href: "/developers/ai-integration",
    title: "AI integration",
    body: "How agents should design themes without publishing.",
    icon: Sparkles,
  },
  {
    href: "/developers/examples",
    title: "Examples",
    body: "Sample requests and common agent workflows.",
    icon: BookOpen,
  },
  {
    href: "/developers/themes",
    title: "Themes",
    body: "Schema, batches, preview tokens, and publish rules.",
    icon: Sparkles,
  },
] as const;

type DeveloperHelpGuidesProps = {
  className?: string;
  /** Compact list for console; full grid for docs hub */
  variant?: "console" | "page";
  /** Hide the section title when the page already has a hero */
  hideHeading?: boolean;
};

function ArticleList({
  articles,
}: {
  articles: { slug: string; title: string; excerpt: string }[];
}) {
  return (
    <ul className="mt-2 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
      {articles.map((article, i) => (
        <li
          key={article.slug}
          className={cn(i > 0 && "border-t border-black/[0.05]")}
        >
          <Link
            href={`/help/${article.slug}`}
            className="flex items-start justify-between gap-3 px-4 py-3.5 transition hover:bg-[#FAFAFA] sm:px-5"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-neutral-900">
                {article.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-neutral-500">
                {article.excerpt}
              </p>
            </div>
            <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-300" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function DeveloperHelpGuides({
  className,
  variant = "console",
  hideHeading = false,
}: DeveloperHelpGuidesProps) {
  const guides =
    variant === "console" ? DEVELOPER_GUIDES.slice(0, 4) : DEVELOPER_GUIDES;
  const tutorials = getDeveloperTutorials();
  const shownTutorials =
    variant === "console" ? tutorials.slice(0, 5) : tutorials;
  const referenceArticles = getDeveloperArticles().filter(
    (a) => !a.tutorial,
  );
  const shownReference =
    variant === "console"
      ? referenceArticles.filter((a) => a.popular).slice(0, 3)
      : referenceArticles;

  return (
    <section className={cn(className)}>
      {!hideHeading ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-[#007AFF]" />
              <h2 className="text-[18px] font-semibold text-neutral-900">
                Get help
              </h2>
            </div>
            <p className="mt-1 text-[13px] text-neutral-500">
              Tutorials, articles, and docs for OAuth, MCP, and the API.
            </p>
          </div>
          {variant === "console" ? (
            <Link
              href="/dashboard/developer/help"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#007AFF] hover:underline"
            >
              All guides
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : null}
        </div>
      ) : null}

      {shownTutorials.length > 0 ? (
        <div className={cn(hideHeading ? "mt-0" : "mt-5")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[13px] font-semibold text-neutral-900">
              Tutorials
            </h3>
            <Link
              href="/help/category/developers"
              className="text-[12px] font-medium text-[#007AFF] hover:underline"
            >
              Browse all
            </Link>
          </div>
          <ArticleList articles={shownTutorials} />
        </div>
      ) : null}

      {shownReference.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-[13px] font-semibold text-neutral-900">
            Articles
          </h3>
          <ArticleList articles={shownReference} />
        </div>
      ) : null}

      <div className="mt-5">
        <h3 className="text-[13px] font-semibold text-neutral-900">Docs</h3>
        <ul
          className={cn(
            "mt-2 grid gap-2",
            variant === "page"
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-2",
          )}
        >
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <li key={guide.href}>
                <Link
                  href={guide.href}
                  className="group flex h-full gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-3.5 transition hover:border-black/[0.1] hover:bg-[#FAFAFA]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7] text-neutral-600 transition group-hover:bg-[#007AFF]/10 group-hover:text-[#007AFF]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-neutral-900">
                      {guide.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-neutral-500">
                      {guide.body}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href="/help/category/developers"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[12px] font-semibold text-neutral-800 transition hover:bg-[#F5F5F7]"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Developer articles
        </Link>
        <Link
          href="/help"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[12px] font-semibold text-neutral-800 transition hover:bg-[#F5F5F7]"
        >
          Help center
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[12px] font-semibold text-neutral-800 transition hover:bg-[#F5F5F7]"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Contact
        </Link>
        <a
          href={SUPPORT_MAILTO}
          className="inline-flex h-9 items-center rounded-lg px-3 text-[12px] font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          Email support
        </a>
      </div>
    </section>
  );
}
