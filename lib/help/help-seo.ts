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
      "Search Ettajer help articles and step-by-step guides for COD, Stripe, PayPal, Email Marketing, Meta ads, domains, and store setup. Also available as llms.txt and knowledge.json for AI assistants.",
    keywords: [
      "ettajer help",
      "support",
      "cod setup",
      "email marketing guide",
      "meta pixel guide",
      "store builder guide",
      "llms.txt",
    ],
  },
  articleTitleSuffix: " — Help",
  categoryTitleSuffix: " — Help",
  fallbackTitle: "Help",
};

const FR: HelpSeoCopy = {
  index: {
    title: "Centre d'aide",
    description:
      "Articles d'aide Ettajer et guides pas à pas (COD, Meta, domaines). Aussi disponibles en llms.txt et knowledge.json pour les assistants IA.",
    keywords: ["aide ettajer", "support", "configuration cod", "guide boutique", "llms.txt"],
  },
  articleTitleSuffix: " — Aide",
  categoryTitleSuffix: " — Aide",
  fallbackTitle: "Aide",
};

const AR: HelpSeoCopy = {
  index: {
    title: "مركز المساعدة",
    description:
      "مقالات مساعدة إيتاجر وأدلة خطوة بخطوة (COD وMeta والنطاقات). متاحة أيضاً عبر llms.txt وknowledge.json للمساعدات الذكية.",
    keywords: ["مساعدة ettajer", "دعم", "إعداد cod", "دليل المتجر", "llms.txt"],
  },
  articleTitleSuffix: " — مساعدة",
  categoryTitleSuffix: " — مساعدة",
  fallbackTitle: "مساعدة",
};

const COPIES: Record<LandingLocale, HelpSeoCopy> = { en: EN, fr: FR, ar: AR };

export function getHelpSeo(locale: LandingLocale): HelpSeoCopy {
  return COPIES[locale] ?? EN;
}
