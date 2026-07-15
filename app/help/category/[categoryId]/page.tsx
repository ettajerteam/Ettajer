import type { Metadata } from "next";
import { HelpCategoryPage } from "@/components/help/help-category-page";
import { JsonLd } from "@/components/seo/json-ld";
import { HELP_CATEGORIES, getCategoryById } from "@/lib/help/help-data";
import { getHelpSeo } from "@/lib/help/help-seo";
import { getLocalizedCategory } from "@/lib/help/help-ui-i18n";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import { buildHelpCategoryGraph } from "@/lib/seo/structured-data";

type PageProps = {
  params: Promise<{ categoryId: string }>;
};

export async function generateStaticParams() {
  return HELP_CATEGORIES.map((category) => ({ categoryId: category.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const locale = await getServerLocale();
  const category = getCategoryById(categoryId);
  const helpSeo = getHelpSeo(locale);

  if (!category) {
    return buildPageMetadata({
      seo: {
        title: helpSeo.fallbackTitle,
        description: helpSeo.index.description,
      },
      path: `/help/category/${categoryId}`,
      locale,
    });
  }

  const localized = getLocalizedCategory(category, locale);

  return buildPageMetadata({
    seo: {
      title: `${localized.title}${helpSeo.categoryTitleSuffix}`,
      description: localized.description,
    },
    path: `/help/category/${categoryId}`,
    locale,
  });
}

export default async function HelpCategoryRoute({ params }: PageProps) {
  const { categoryId } = await params;
  const locale = await getServerLocale();
  const category = getCategoryById(categoryId);

  if (!category) {
    return <HelpCategoryPage categoryId={categoryId} />;
  }

  const localized = getLocalizedCategory(category, locale);
  const graph = buildHelpCategoryGraph({
    locale,
    categoryId,
    categoryTitle: localized.title,
    categoryDescription: localized.description,
  });

  return (
    <>
      <JsonLd graph={graph} />
      <HelpCategoryPage categoryId={categoryId} />
    </>
  );
}
