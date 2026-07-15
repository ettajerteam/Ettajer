import type { Metadata } from "next";
import { GetHelpPage } from "@/components/help/get-help-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getHelpSeo } from "@/lib/help/help-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import { buildHelpIndexGraph } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getHelpSeo(locale).index,
    path: "/help",
    locale,
  });
}

export default async function HelpPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const locale = await getServerLocale();
  const initialQuery = searchParams?.q?.trim() ?? "";

  return (
    <>
      <JsonLd graph={buildHelpIndexGraph(locale)} />
      <GetHelpPage initialQuery={initialQuery} />
    </>
  );
}
