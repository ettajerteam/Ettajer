import type { LandingLocale } from "@/lib/landing/landing-i18n";
import type { PageSeoCopy } from "@/lib/seo/types";

export type HelpSeoCopy = {
  index: PageSeoCopy;
  articleTitleSuffix: string;
  categoryTitleSuffix: string;
  fallbackTitle: string;
};

const EN: HelpSeoCopy = {
  index: {
    title: "Get Help",
    description:
      "Search Ettajer help articles, browse support topics, and contact our team.",
    keywords: ["ettajer help", "support", "cod setup", "store builder guide"],
  },
  articleTitleSuffix: " — Help",
  categoryTitleSuffix: " — Help",
  fallbackTitle: "Help",
};

const FR: HelpSeoCopy = {
  index: {
    title: "Centre d'aide",
    description:
      "Recherchez des articles d'aide Ettajer, parcourez les sujets de support et contactez notre équipe.",
    keywords: ["aide ettajer", "support", "configuration cod", "guide boutique"],
  },
  articleTitleSuffix: " — Aide",
  categoryTitleSuffix: " — Aide",
  fallbackTitle: "Aide",
};

const AR: HelpSeoCopy = {
  index: {
    title: "مركز المساعدة",
    description:
      "ابحث في مقالات مساعدة Ettajer، تصفّح مواضيع الدعم، وتواصل مع فريقنا.",
    keywords: ["مساعدة ettajer", "دعم", "إعداد cod", "دليل المتجر"],
  },
  articleTitleSuffix: " — مساعدة",
  categoryTitleSuffix: " — مساعدة",
  fallbackTitle: "مساعدة",
};

const COPIES: Record<LandingLocale, HelpSeoCopy> = { en: EN, fr: FR, ar: AR };

export function getHelpSeo(locale: LandingLocale): HelpSeoCopy {
  return COPIES[locale] ?? EN;
}
