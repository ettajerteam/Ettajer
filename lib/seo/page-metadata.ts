import type { Metadata } from "next";
import { cookies } from "next/headers";
import { EMAIL_LOCALE_COOKIE } from "@/lib/email/email-locale-constants";
import { toLandingLocale, type LandingLocale } from "@/lib/landing/landing-i18n";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE_PATH,
  getOgAlternateLocales,
  getOgLocale,
  getSiteUrl,
  SITE_NAME,
} from "@/lib/seo/site-config";
import type { PageSeoCopy } from "@/lib/seo/types";

export type BuildPageMetadataInput = {
  seo: PageSeoCopy;
  path: string;
  locale?: LandingLocale;
  type?: "website" | "article";
  noIndex?: boolean;
};

export async function getServerLocale(): Promise<LandingLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(EMAIL_LOCALE_COOKIE)?.value;
  return toLandingLocale(value ?? "en");
}

export function buildPageMetadata({
  seo,
  path,
  locale = "en",
  type = "website",
  noIndex = false,
}: BuildPageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        fr: canonical,
        ar: canonical,
        "x-default": canonical,
      },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      url: canonical,
      title: seo.title,
      description: seo.description,
      siteName: SITE_NAME,
      locale: getOgLocale(locale),
      alternateLocale: getOgAlternateLocales(locale),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
  };
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl().toString();
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  const defaultTitle = "Ettajer — COD Ecommerce Platform for Morocco";
  const defaultDescription =
    "Ettajer (التاجر): launch your online store with cash-on-delivery checkout, WhatsApp order verification, and a visual builder — built for Moroccan merchants.";

  return {
    metadataBase: getSiteUrl(),
    applicationName: SITE_NAME,
    appleWebApp: {
      capable: true,
      title: SITE_NAME,
      statusBarStyle: "default",
    },
    title: {
      default: defaultTitle,
      template: `%s | ${SITE_NAME}`,
    },
    description: defaultDescription,
    keywords: [
      "ettajer",
      "التاجر",
      "تاجير",
      "etajer",
      "tajir",
      "atajir",
      "etajir",
      "itajir",
      "ecommerce morocco",
      "cod morocco",
      "online store",
      "cash on delivery",
      "shopify alternative morocco",
    ],
    alternates: {
      canonical: siteUrl,
      languages: {
        en: siteUrl,
        fr: siteUrl,
        ar: siteUrl,
        "x-default": siteUrl,
      },
    },
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: SITE_NAME,
      title: defaultTitle,
      description: defaultDescription,
      locale: "en_US",
      alternateLocale: ["fr_MA", "ar_MA"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — التاجر`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: [ogImage],
    },
  };
}
