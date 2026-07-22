import { SITE_NAME } from "@/lib/seo/site-config";

/** Official brand + common Moroccan Latin / Arabic spellings people type in Google. */
export const BRAND_OFFICIAL_NAME = SITE_NAME;

export const BRAND_ARABIC_NAME = "التاجر";

/**
 * Alternate names for Organization / WebSite JSON-LD.
 * Helps Google connect misspellings and Arabic forms to Ettajer without spammy meta keywords.
 */
export const BRAND_ALTERNATE_NAMES: string[] = [
  BRAND_ARABIC_NAME,
  "تاجير",
  "اتاجر",
  "ايتاجر",
  "Etajer",
  "Etajir",
  "Atajir",
  "Itajir",
  "Tajir",
  "Ettajir",
  "Atajer",
];

/** Short natural line for SEO (visually hidden on the homepage; kept in JSON-LD + meta). */
export const BRAND_AKA_LINE = {
  en: `Ettajer (${BRAND_ARABIC_NAME}) — also searched as Etajer, Tajir, Atajir, Etajir, or Itajir.`,
  fr: `Ettajer (${BRAND_ARABIC_NAME}) — aussi recherché sous Etajer, Tajir, Atajir, Etajir ou Itajir.`,
  ar: `Ettajer (${BRAND_ARABIC_NAME}) — يُبحث عنها أيضاً كتاجير، اتاجر، ايتاجر، Etajer أو Tajir.`,
} as const;
