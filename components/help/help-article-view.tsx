"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { getContactTopicForCategory, getLocalizedArticle } from "@/lib/help/help-i18n";
import {
  getLocalizedArticleDisplay,
  getLocalizedCategory,
} from "@/lib/help/help-ui-i18n";
import type { HelpArticle, HelpCategory } from "@/lib/help/help-data";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import { LandingLanguageSwitcher } from "@/components/shared/language-switcher";
import {
  HelpMobileGroup,
  HelpMobileListRow,
  HelpMobileCard,
} from "@/components/help/help-mobile-ui";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";

type HelpArticleViewProps = {
  article: HelpArticle;
  category: HelpCategory | undefined;
  related: HelpArticle[];
};

export function HelpArticleView({
  article,
  category,
  related,
}: HelpArticleViewProps) {
  const { locale, copy } = useHelpLocale();
  const a = copy.article;
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const localized = getLocalizedArticle(article, locale);
  const categoryLocalized = category ? getLocalizedCategory(category, locale) : null;
  const contactTopic = getContactTopicForCategory(article.categoryId);
  const contactHref = `/contact?topic=${contactTopic}&ref=${article.slug}`;

  async function sendFeedback(helpful: boolean) {
    setFeedback(helpful ? "yes" : "no");
    setSubmitting(true);
    try {
      await fetch("/api/help/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: article.slug,
          helpful,
        }),
      });
    } catch {
      // Non-blocking
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <LandingLanguageSwitcher />
      </div>

      {categoryLocalized ? (
        <p className="text-[13px] font-bold uppercase tracking-wide text-[#007AFF] md:text-sm md:font-medium">
          {categoryLocalized.title}
        </p>
      ) : null}
      <h1 className="mt-2 text-[1.85rem] font-bold leading-[1.12] tracking-tight text-neutral-900 md:text-4xl md:font-semibold">
        {localized.title}
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-[#8E8E93] md:text-base md:text-neutral-500">
        {localized.excerpt}
      </p>

      <div className="mt-8 space-y-5 border-t border-[#E5E5EA] pt-8 md:mt-10 md:border-neutral-200 md:pt-10">
        {localized.body.map((paragraph) => (
          <p
            key={paragraph}
            className="text-[17px] leading-[1.65] text-neutral-700 md:text-base md:leading-relaxed"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <HelpMobileCard className="mt-10 md:mt-12 md:rounded-2xl md:border md:border-neutral-200 md:bg-neutral-50 md:shadow-none">
        <p className="text-[17px] font-semibold text-neutral-900 md:text-sm md:font-medium">
          {a.helpfulQuestion}
        </p>
        {feedback ? (
          <p className="mt-3 text-[15px] text-[#8E8E93] md:text-sm md:text-neutral-600">
            {feedback === "yes" ? a.thanksYes : a.thanksNo}
          </p>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => sendFeedback(true)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[0.75rem] bg-[#F2F2F7] text-[15px] font-semibold text-neutral-800 active:bg-[#E5E5EA] md:flex-none md:rounded-full md:border md:border-neutral-200 md:bg-white md:px-4 md:py-2 md:text-sm md:font-medium md:hover:bg-neutral-50"
            >
              <ThumbsUp className="h-4 w-4" />
              {a.yes}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => sendFeedback(false)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[0.75rem] bg-[#F2F2F7] text-[15px] font-semibold text-neutral-800 active:bg-[#E5E5EA] md:flex-none md:rounded-full md:border md:border-neutral-200 md:bg-white md:px-4 md:py-2 md:text-sm md:font-medium md:hover:bg-neutral-50"
            >
              <ThumbsDown className="h-4 w-4" />
              {a.no}
            </button>
          </div>
        )}
        <Link
          href={contactHref}
          className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-[#007AFF] md:text-sm md:font-medium md:text-blue-600"
        >
          {a.contactSupport}
          <LandingArrowForward className="h-4 w-4" />
        </Link>
      </HelpMobileCard>

      {related.length > 0 ? (
        <div className="mt-10 border-t border-[#E5E5EA] pt-10 md:mt-12 md:border-neutral-200">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#8E8E93] md:text-sm md:font-semibold md:normal-case md:text-neutral-900">
            {a.relatedArticles}
          </h2>
          <HelpMobileGroup className="mt-4">
            {related.map((item) => {
              const itemLocalized = getLocalizedArticleDisplay(item, locale);
              return (
                <HelpMobileListRow
                  key={item.slug}
                  href={`/help/${item.slug}`}
                  title={itemLocalized.title}
                />
              );
            })}
          </HelpMobileGroup>
        </div>
      ) : null}
    </>
  );
}
