import type { PageSeoCopy } from "@/lib/seo/types";
import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { BRAND_ARABIC_NAME } from "@/lib/seo/brand-aliases";

const LANDING_SEO: Record<LandingLocale, PageSeoCopy> = {
  en: {
    title: "Ettajer — COD Ecommerce Platform for Morocco",
    description:
      "Ettajer (التاجر): launch your online store with cash-on-delivery checkout, WhatsApp order verification, and a visual builder — built for Moroccan merchants.",
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
      "online store morocco",
      "cash on delivery",
      "shopify alternative morocco",
    ],
  },
  fr: {
    title: "Ettajer — Plateforme e-commerce COD au Maroc",
    description:
      "Ettajer (التاجر) : lancez votre boutique en ligne avec paiement à la livraison, vérification WhatsApp et éditeur visuel — conçu pour les marchands marocains.",
    keywords: [
      "ettajer",
      "التاجر",
      "تاجير",
      "etajer",
      "tajir",
      "atajir",
      "ecommerce maroc",
      "cod maroc",
      "boutique en ligne maroc",
      "paiement à la livraison",
      "alternative shopify maroc",
    ],
  },
  ar: {
    title: `Ettajer | ${BRAND_ARABIC_NAME} — منصة تجارة إلكترونية COD في المغرب`,
    description:
      "Ettajer (التاجر): أطلق متجرك الإلكتروني مع الدفع عند الاستلام، التحقق عبر واتساب، ومحرّر مرئي — مصمم للتجار المغاربة.",
    keywords: [
      "ettajer",
      "التاجر",
      "تاجير",
      "اتاجر",
      "ايتاجر",
      "etajer",
      "tajir",
      "atajir",
      "تجارة إلكترونية المغرب",
      "متجر إلكتروني المغرب",
      "الدفع عند الاستلام",
      "بديل شوبيفاي",
    ],
  },
};

export function getLandingSeo(locale: LandingLocale): PageSeoCopy {
  return LANDING_SEO[locale] ?? LANDING_SEO.en;
}
