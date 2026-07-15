import type { Metadata } from "next";
import { PrivacyPage } from "@/components/legal/privacy-page";
import { getLegalDocSeo } from "@/lib/legal/legal-i18n";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getLegalDocSeo(locale, "privacy"),
    path: "/privacy",
    locale,
  });
}

export default function PrivacyRoutePage() {
  return <PrivacyPage />;
}
