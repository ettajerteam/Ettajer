"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { HelpShell } from "@/components/help/help-shell";
import { HelpArticleView } from "@/components/help/help-article-view";
import { HelpMobileBackBar } from "@/components/help/help-mobile-ui";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import {
  getLocalizedArticleDisplay,
  getLocalizedCategory,
} from "@/lib/help/help-ui-i18n";
import {
  getArticleBySlug,
  getArticlesByCategory,
  getCategoryById,
} from "@/lib/help/help-data";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

type HelpArticlePageProps = {
  slug: string;
};

export function HelpArticlePage({ slug }: HelpArticlePageProps) {
  const { locale, copy, isRtl } = useHelpLocale();
  const a = copy.article;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategoryById(article.categoryId);
  const categoryLocalized = category ? getLocalizedCategory(category, locale) : null;
  const articleLocalized = getLocalizedArticleDisplay(article, locale);
  const related = getArticlesByCategory(article.categoryId)
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  const breadcrumb = (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
      <Link href="/help" className="transition-colors hover:text-neutral-900">
        {a.getHelp}
      </Link>
      <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", isRtl && "scale-x-[-1]")} />
      {categoryLocalized ? (
        <>
          <Link
            href={`/help/category/${category!.id}`}
            className="transition-colors hover:text-neutral-900"
          >
            {categoryLocalized.title}
          </Link>
          <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", isRtl && "scale-x-[-1]")} />
        </>
      ) : null}
      <span className="truncate text-neutral-900">{articleLocalized.title}</span>
    </nav>
  );

  return (
    <HelpShell breadcrumb={breadcrumb}>
      <HelpMobileBackBar
        href={category ? `/help/category/${category.id}` : "/help"}
        label={categoryLocalized?.title ?? a.helpCenter}
      />

      <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
        <HelpArticleView article={article} category={category} related={related} />

        <Link
          href="/help"
          className="mt-10 hidden items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900 md:inline-flex"
        >
          <ArrowLeft className={cn("h-4 w-4", isRtl && "scale-x-[-1]")} />
          {a.backToHelp}
        </Link>
      </article>
    </HelpShell>
  );
}
