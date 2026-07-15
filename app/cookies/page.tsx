import type { Metadata } from "next";
import { CookiesPage } from "@/components/legal/cookies-page";
import { getLegalDocSeo } from "@/lib/legal/legal-i18n";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getLegalDocSeo(locale, "cookies"),
    path: "/cookies",
    locale,
  });
}

export default function CookiesRoutePage() {
  return <CookiesPage />;
}
