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

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: "Ettajer — Sell Online Beautifully",
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "COD-first ecommerce for Moroccan merchants. Launch your store with WhatsApp verification, order automation, and a visual builder.",
    keywords: [
      "ecommerce",
      "morocco",
      "shopify alternative",
      "online store",
      "ettajer",
      "cod",
      "cash on delivery",
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
      title: "Ettajer — Sell Online Beautifully",
      description:
        "COD-first ecommerce for Moroccan merchants. Launch your store with WhatsApp verification, order automation, and a visual builder.",
      locale: "en_US",
      alternateLocale: ["fr_MA", "ar_MA"],
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
      title: "Ettajer — Sell Online Beautifully",
      description:
        "COD-first ecommerce for Moroccan merchants. Launch your store with WhatsApp verification, order automation, and a visual builder.",
      images: [ogImage],
    },
  };
}
