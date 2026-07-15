import type { PageSeoCopy } from "@/lib/seo/types";
import type { LandingLocale } from "@/lib/landing/landing-i18n";

const LANDING_SEO: Record<LandingLocale, PageSeoCopy> = {
  en: {
    title: "Ettajer — Sell Online Beautifully",
    description:
      "COD-first ecommerce for Moroccan merchants. Launch your store with WhatsApp verification, order automation, and a visual builder.",
    keywords: [
      "ecommerce morocco",
      "online store",
      "cash on delivery",
      "cod checkout",
      "shopify alternative",
      "ettajer",
    ],
  },
  fr: {
    title: "Ettajer — Vendez en ligne avec style",
    description:
      "E-commerce pensé pour le paiement à la livraison au Maroc. Lancez votre boutique avec vérification WhatsApp, automatisation des commandes et éditeur visuel.",
    keywords: [
      "ecommerce maroc",
      "boutique en ligne",
      "paiement à la livraison",
      "cod maroc",
      "alternative shopify",
      "ettajer",
    ],
  },
  ar: {
    title: "Ettajer — بِع أونلاين بأناقة",
    description:
      "تجارة إلكترونية للدفع عند الاستلام للتجار المغاربة. أطلق متجرك مع التحقق عبر واتساب، أتمتة الطلبات، ومحرّر مرئي.",
    keywords: [
      "تجارة إلكترونية المغرب",
      "متجر إلكتروني",
      "الدفع عند الاستلام",
      "cod",
      "بديل شوبيفاي",
      "ettajer",
    ],
  },
};

export function getLandingSeo(locale: LandingLocale): PageSeoCopy {
  return LANDING_SEO[locale] ?? LANDING_SEO.en;
}
