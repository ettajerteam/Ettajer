import type { Metadata } from "next";
import { HelpArticlePage } from "@/components/help/help-article-page";
import { JsonLd } from "@/components/seo/json-ld";
import { HELP_ARTICLES, getArticleBySlug, getCategoryById } from "@/lib/help/help-data";
import { getLocalizedArticle } from "@/lib/help/help-i18n";
import { getHelpSeo } from "@/lib/help/help-seo";
import { getLocalizedCategory } from "@/lib/help/help-ui-i18n";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import { buildHelpArticleGraph } from "@/lib/seo/structured-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return HELP_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const article = getArticleBySlug(slug);
  const helpSeo = getHelpSeo(locale);

  if (!article) {
    return buildPageMetadata({
      seo: {
        title: helpSeo.fallbackTitle,
        description: helpSeo.index.description,
      },
      path: `/help/${slug}`,
      locale,
    });
  }

  const localized = getLocalizedArticle(article, locale);

  return buildPageMetadata({
    seo: {
      title: `${localized.title}${helpSeo.articleTitleSuffix}`,
      description: localized.excerpt,
      keywords: article.keywords,
    },
    path: `/help/${slug}`,
    locale,
    type: "article",
  });
}

export default async function HelpArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const article = getArticleBySlug(slug);

  if (!article) {
    return <HelpArticlePage slug={slug} />;
  }

  const localized = getLocalizedArticle(article, locale);
  const category = getCategoryById(article.categoryId);
  const categoryTitle = category
    ? getLocalizedCategory(category, locale).title
    : article.categoryId;

  const graph = buildHelpArticleGraph({
    locale,
    slug,
    title: localized.title,
    excerpt: localized.excerpt,
    body: localized.body,
    categoryId: article.categoryId,
    categoryTitle,
    keywords: article.keywords,
  });

  return (
    <>
      <JsonLd graph={graph} />
      <HelpArticlePage slug={slug} />
    </>
  );
}
