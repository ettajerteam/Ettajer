export const SITE_NAME = "Ettajer";

/** Default social preview image (absolute path on site). */
export const DEFAULT_OG_IMAGE_PATH = "/brand/App-Logo.png";

const LOCALE_OG_MAP = {
  en: "en_US",
  fr: "fr_MA",
  ar: "ar_MA",
} as const;

export function getSiteUrl(): URL {
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  // Local dev should use NEXTAUTH_URL (localhost), not production SITE_URL.
  const raw =
    process.env.NODE_ENV === "development" && nextAuthUrl
      ? nextAuthUrl
      : publicSiteUrl || nextAuthUrl || "https://ettajer.com";

  const normalized = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  return new URL(normalized);
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return new URL(path.startsWith("/") ? path : `/${path}`, base).toString();
}

export function getOgLocale(locale: "en" | "fr" | "ar"): string {
  return LOCALE_OG_MAP[locale];
}

export function getOgAlternateLocales(locale: "en" | "fr" | "ar"): string[] {
  return (["en", "fr", "ar"] as const)
    .filter((item) => item !== locale)
    .map((item) => LOCALE_OG_MAP[item]);
}
