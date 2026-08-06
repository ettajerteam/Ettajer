import type { Metadata } from "next";
import { GetHelpPage } from "@/components/help/get-help-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getPopularArticles } from "@/lib/help/help-data";
import { getLocalizedArticle } from "@/lib/help/help-i18n";
import { getHelpSeo } from "@/lib/help/help-seo";
import { getLandingCopy } from "@/lib/landing/landing-i18n";
import { absoluteUrl } from "@/lib/seo/site-config";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import { buildHelpIndexGraph } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getHelpSeo(locale).index,
    path: "/help",
    locale,
    alternateTypes: {
      "text/plain": [
        { url: absoluteUrl("/llms.txt"), title: "llms.txt" },
        { url: absoluteUrl("/llms-full.txt"), title: "llms-full.txt" },
      ],
      "application/json": [
        { url: absoluteUrl("/knowledge.json"), title: "knowledge.json" },
      ],
    },
  });
}

export default async function HelpPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const locale = await getServerLocale();
  const initialQuery = searchParams?.q?.trim() ?? "";

  const landingFaq = getLandingCopy(locale).faq.items.map((item) => ({
    q: item.question,
    a: item.answer,
  }));
  const popularFaq = getPopularArticles()
    .slice(0, 12)
    .map((article) => {
      const localized = getLocalizedArticle(article, locale);
      return {
        q: localized.title,
        a: [localized.excerpt, ...localized.body.slice(0, 2)].join(" "),
      };
    });

  return (
    <>
      <JsonLd graph={buildHelpIndexGraph(locale, [...landingFaq, ...popularFaq])} />
      <GetHelpPage initialQuery={initialQuery} />
    </>
  );
}
