"use client";

import Link from "next/link";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/constants/support";
import {
  Mail,
  MessageSquare,
} from "lucide-react";
import { HelpShell } from "@/components/help/help-shell";
import { HelpSearch } from "@/components/help/help-search";
import { HelpChecklistSection } from "@/components/help/help-checklist-section";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  getPopularArticles,
} from "@/lib/help/help-data";
import {
  getLocalizedArticleDisplay,
  getLocalizedCategory,
  searchLocalizedArticles,
} from "@/lib/help/help-ui-i18n";
import { LandingCarousel } from "@/components/landing/landing-mobile-carousel";
import {
  HelpMobileHeader,
  HelpMobileSectionLabel,
  HelpMobileGroup,
  HelpMobileListRow,
  HelpMobileCard,
} from "@/components/help/help-mobile-ui";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import { useState } from "react";

export function GetHelpPage({ initialQuery = "" }: { initialQuery?: string }) {
  const { locale, copy } = useHelpLocale();
  const p = copy.page;
  const [query, setQuery] = useState(initialQuery);
  const popularArticles = getPopularArticles();
  const troubleshootingCategory = HELP_CATEGORIES.find(
    (category) => category.id === "troubleshooting",
  );

  const results = query.trim().length > 0 ? searchLocalizedArticles(query, locale) : [];
  const isSearching = query.trim().length > 0;

  return (
    <HelpShell>
      <section className="border-b border-black/[0.04] bg-[#F2F2F7] md:border-neutral-200 md:bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
          <HelpMobileHeader
            eyebrow={p.eyebrow}
            title={p.title}
            subtitle={p.subtitle}
          />

          <div className="mx-auto mt-8 max-w-2xl md:mt-10">
            <HelpSearch onQueryChange={setQuery} initialQuery={initialQuery} />
          </div>
        </div>
      </section>

      {isSearching ? (
        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
          <p className="text-[14px] font-medium text-[#8E8E93] md:text-sm md:text-neutral-500">
            {p.resultsFor(results.length, query.trim())}
          </p>

          {results.length > 0 ? (
            <HelpMobileGroup className="mt-5 md:mt-6">
              {results.map((article) => {
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
          ) : (
            <HelpMobileCard className="mt-6 text-center md:mt-8">
              <p className="text-[17px] font-semibold text-neutral-900">{p.noArticlesTitle}</p>
              <p className="mt-2 text-[15px] text-[#8E8E93]">{p.noArticlesSubtitle}</p>
              <Link
                href="/contact"
                className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-[#007AFF]"
              >
                {p.contactSupport}
                <LandingArrowForward className="h-4 w-4" />
              </Link>
            </HelpMobileCard>
          )}
        </section>
      ) : (
        <>
          <HelpChecklistSection />

          <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
            <HelpMobileSectionLabel
              title={p.browseTitle}
              subtitle={p.browseSubtitle}
            />

            <div className="md:hidden">
              <LandingCarousel slideWidth={72} edgeToEdge ariaLabel={p.categoriesAria} gap={12}>
                {HELP_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const localized = getLocalizedCategory(category, locale);
                  const articleCount = HELP_ARTICLES.filter(
                    (article) => article.categoryId === category.id,
                  ).length;

                  return (
                    <Link
                      key={category.id}
                      href={`/help/category/${category.id}`}
                      className="flex min-h-[11rem] flex-col rounded-[0.875rem] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] active:scale-[0.98]"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <h3 className="mt-4 text-[17px] font-bold text-neutral-900">{localized.title}</h3>
                      <p className="mt-1.5 flex-1 text-[14px] leading-snug text-[#8E8E93]">
                        {localized.description}
                      </p>
                      <p className="mt-3 text-[12px] font-semibold text-[#C7C7CC]">
                        {p.articleCount(articleCount)}
                      </p>
                    </Link>
                  );
                })}
              </LandingCarousel>
            </div>

            <div className="hidden gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:grid">
              {HELP_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const localized = getLocalizedCategory(category, locale);
                const articleCount = HELP_ARTICLES.filter(
                  (article) => article.categoryId === category.id,
                ).length;

                return (
                  <Link
                    key={category.id}
                    href={`/help/category/${category.id}`}
                    className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-neutral-900">{localized.title}</h3>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-neutral-500">
                      {localized.description}
                    </p>
                    <p className="mt-4 text-xs text-neutral-400">
                      {p.articleCount(articleCount)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="border-y border-black/[0.04] bg-white md:border-neutral-200 md:bg-neutral-50">
            <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
              <HelpMobileSectionLabel
                title={p.popularTitle}
                subtitle={p.popularSubtitle}
                action={
                  troubleshootingCategory ? (
                    <Link
                      href={`/help/category/${troubleshootingCategory.id}`}
                      className="shrink-0 text-[14px] font-semibold text-[#007AFF] md:text-sm md:font-medium md:text-blue-600"
                    >
                      {p.troubleshooting}
                    </Link>
                  ) : undefined
                }
              />

              <div className="md:hidden">
                <LandingCarousel slideWidth={90} edgeToEdge ariaLabel={p.popularAria} gap={12}>
                  {popularArticles.map((article) => {
                    const localized = getLocalizedArticleDisplay(article, locale);
                    return (
                      <Link
                        key={article.slug}
                        href={`/help/${article.slug}`}
                        className="block min-h-[9rem] rounded-[0.875rem] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] active:scale-[0.98]"
                      >
                        <p className="text-[17px] font-bold leading-snug text-neutral-900">
                          {localized.title}
                        </p>
                        <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-[#8E8E93]">
                          {localized.excerpt}
                        </p>
                      </Link>
                    );
                  })}
                </LandingCarousel>
              </div>

              <div className="mt-8 hidden gap-3 md:grid md:grid-cols-2">
                {popularArticles.map((article) => {
                  const localized = getLocalizedArticleDisplay(article, locale);
                  return (
                    <Link
                      key={article.slug}
                      href={`/help/${article.slug}`}
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-4 transition-all hover:border-neutral-300 hover:shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 group-hover:text-blue-600">
                          {localized.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{localized.excerpt}</p>
                      </div>
                      <LandingArrowForward className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <HelpMobileHeader
          title={p.stillNeedHelpTitle}
          subtitle={p.stillNeedHelpSubtitle}
          className="text-center"
        />

        <div className="mx-auto mt-8 max-w-3xl space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          <Link
            href="/contact"
            className="flex items-center gap-4 rounded-[0.875rem] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] active:bg-[#F2F2F7] md:flex-col md:items-center md:p-8 md:text-center md:hover:shadow-sm"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#007AFF] text-white shadow-[0_4px_14px_rgba(0,122,255,0.35)]">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1 md:mt-5">
              <h3 className="text-[17px] font-bold text-neutral-900 md:text-sm md:font-semibold">
                {p.contactCardTitle}
              </h3>
              <p className="mt-1 text-[15px] text-[#8E8E93] md:text-sm">{p.contactCardSubtitle}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-[#007AFF] md:mt-4">
                {p.getInTouch}
                <LandingArrowForward className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <a
            href={SUPPORT_MAILTO}
            className="flex items-center gap-4 rounded-[0.875rem] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] active:bg-[#F2F2F7] md:flex-col md:items-center md:p-8 md:text-center md:hover:shadow-sm"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-neutral-700">
              <Mail className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1 md:mt-5">
              <h3 className="text-[17px] font-bold text-neutral-900 md:text-sm md:font-semibold">
                {p.emailCardTitle}
              </h3>
              <p className="mt-1 truncate text-[15px] text-[#8E8E93] md:text-sm">{SUPPORT_EMAIL}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-neutral-700 md:mt-4">
                {p.openMailApp}
                <LandingArrowForward className="h-4 w-4" />
              </span>
            </div>
          </a>
        </div>
      </section>
    </HelpShell>
  );
}
