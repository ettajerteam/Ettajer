"use client";

import Link from "next/link";
import {
  getDeveloperArticles,
  getDeveloperTutorials,
} from "@/lib/help/help-data";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import { getLocalizedArticleDisplay } from "@/lib/help/help-ui-i18n";
import { LandingCarousel } from "@/components/landing/landing-mobile-carousel";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import {
  HelpMobileSectionLabel,
  HelpMobileCard,
  HelpMobileListRow,
  HelpMobileGroup,
} from "@/components/help/help-mobile-ui";

export function HelpDeveloperGuidesSection() {
  const { locale } = useHelpLocale();
  const tutorials = getDeveloperTutorials();
  const articles = getDeveloperArticles().filter((a) => !a.tutorial);

  return (
    <section className="border-b border-black/[0.04] bg-white md:border-neutral-200 md:bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <HelpMobileSectionLabel
          title="Developers & AI"
          subtitle="Step-by-step tutorials for Claude, Cursor, MCP, and themes."
          action={
            <Link
              href="/help/category/developers"
              className="shrink-0 text-[14px] font-semibold text-[#007AFF] md:text-sm md:font-medium md:text-blue-600"
            >
              All developer articles →
            </Link>
          }
        />

        <p className="mt-6 text-[13px] font-semibold text-neutral-900 md:text-sm">
          Tutorials
        </p>

        <div className="mt-3 md:hidden">
          <LandingCarousel
            slideWidth={78}
            edgeToEdge
            ariaLabel="Developer tutorials"
            gap={12}
          >
            {tutorials.map((article) => {
              const localized = getLocalizedArticleDisplay(article, locale);
              return (
                <HelpMobileCard
                  key={article.slug}
                  className="flex min-h-[11rem] flex-col"
                >
                  <p className="text-[11px] font-semibold text-[#007AFF]">
                    Tutorial
                  </p>
                  <h3 className="mt-1 text-[1.15rem] font-bold text-neutral-900">
                    {localized.title.replace(/^Tutorial:\s*/i, "")}
                  </h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#8E8E93]">
                    {localized.excerpt}
                  </p>
                  <Link
                    href={`/help/${article.slug}`}
                    className="mt-5 inline-flex items-center gap-1 border-t border-[#E5E5EA] pt-4 text-[15px] font-semibold text-[#007AFF]"
                  >
                    Start tutorial
                    <LandingArrowForward className="h-3.5 w-3.5" />
                  </Link>
                </HelpMobileCard>
              );
            })}
          </LandingCarousel>
        </div>

        <div className="mt-3 hidden md:block">
          <HelpMobileGroup>
            {tutorials.map((article) => {
              const localized = getLocalizedArticleDisplay(article, locale);
              return (
                <HelpMobileListRow
                  key={article.slug}
                  href={`/help/${article.slug}`}
                  title={localized.title}
                  subtitle={localized.excerpt}
                />
              );
            })}
          </HelpMobileGroup>
        </div>

        {articles.length > 0 ? (
          <>
            <p className="mt-10 text-[13px] font-semibold text-neutral-900 md:text-sm">
              Reference articles
            </p>
            <div className="mt-3 hidden md:block">
              <HelpMobileGroup>
                {articles.map((article) => {
                  const localized = getLocalizedArticleDisplay(article, locale);
                  return (
                    <HelpMobileListRow
                      key={article.slug}
                      href={`/help/${article.slug}`}
                      title={localized.title}
                      subtitle={localized.excerpt}
                    />
                  );
                })}
              </HelpMobileGroup>
            </div>
            <div className="mt-3 md:hidden">
              <HelpMobileGroup>
                {articles.slice(0, 4).map((article) => {
                  const localized = getLocalizedArticleDisplay(article, locale);
                  return (
                    <HelpMobileListRow
                      key={article.slug}
                      href={`/help/${article.slug}`}
                      title={localized.title}
                      subtitle={localized.excerpt}
                    />
                  );
                })}
              </HelpMobileGroup>
            </div>
          </>
        ) : null}

        <div className="mt-4">
          <Link
            href="/developers"
            className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#007AFF]"
          >
            Ettajer for Developers docs
            <LandingArrowForward className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
