"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { HelpShell } from "@/components/help/help-shell";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import {
  getLocalizedArticleDisplay,
  getLocalizedCategory,
} from "@/lib/help/help-ui-i18n";
import {
  getArticlesByCategory,
  getCategoryById,
} from "@/lib/help/help-data";
import {
  HelpMobileBackBar,
  HelpMobileHeader,
  HelpMobileGroup,
  HelpMobileListRow,
} from "@/components/help/help-mobile-ui";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

type HelpCategoryPageProps = {
  categoryId: string;
};

export function HelpCategoryPage({ categoryId }: HelpCategoryPageProps) {
  const { locale, copy, isRtl } = useHelpLocale();
  const a = copy.article;
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  const localized = getLocalizedCategory(category, locale);
  const articles = getArticlesByCategory(categoryId);
  const Icon = category.icon;

  const breadcrumb = (
    <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
      <Link href="/help" className="transition-colors hover:text-neutral-900">
        {a.getHelp}
      </Link>
      <ChevronRight className={cn("h-3.5 w-3.5", isRtl && "scale-x-[-1]")} />
      <span className="text-neutral-900">{localized.title}</span>
    </nav>
  );

  return (
    <HelpShell breadcrumb={breadcrumb}>
      <HelpMobileBackBar href="/help" label={a.allTopics} />

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF] md:bg-blue-50 md:text-blue-600">
            <Icon className="h-6 w-6" strokeWidth={2} />
          </span>
          <HelpMobileHeader title={localized.title} subtitle={localized.description} />
        </div>

        <HelpMobileGroup className="mt-8 md:mt-10">
          {articles.map((article) => {
            const articleLocalized = getLocalizedArticleDisplay(article, locale);
            return (
              <HelpMobileListRow
                key={article.slug}
                href={`/help/${article.slug}`}
                title={articleLocalized.title}
                subtitle={articleLocalized.excerpt}
              />
            );
          })}
        </HelpMobileGroup>

        <Link
          href="/help"
          className="mt-8 hidden items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900 md:inline-flex"
        >
          <ArrowLeft className={cn("h-4 w-4", isRtl && "scale-x-[-1]")} />
          {a.allTopics}
        </Link>
      </div>
    </HelpShell>
  );
}
