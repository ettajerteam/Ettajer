import type { Metadata } from "next";
import { FounderCardExplainerPage } from "@/components/founder/founder-card-explainer-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getFounderCardExplainerCopy } from "@/lib/founder/founder-card-explainer-i18n";
import { getFounderSeo } from "@/lib/founder/founder-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import { buildFaqPageSchema } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getFounderSeo(locale).founderCard,
    path: "/founder-card",
    locale,
  });
}

export default async function FounderCardRoutePage() {
  const locale = await getServerLocale();
  const copy = getFounderCardExplainerCopy(locale);

  return (
    <>
      <JsonLd
        graph={[
          buildFaqPageSchema(locale, copy.faq, "/founder-card"),
        ]}
      />
      <FounderCardExplainerPage />
    </>
  );
}
