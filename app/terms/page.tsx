import type { Metadata } from "next";
import { TermsPage } from "@/components/legal/terms-page";
import { getLegalDocSeo } from "@/lib/legal/legal-i18n";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getLegalDocSeo(locale, "terms"),
    path: "/terms",
    locale,
  });
}

export default function TermsRoutePage() {
  return <TermsPage />;
}
