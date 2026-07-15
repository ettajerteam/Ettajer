export type {
  FounderCardSection,
  FounderTierRow,
  FounderCardFaq,
  FounderCardExplainerCopy,
} from "@/lib/founder/founder-card-explainer-i18n";

export {
  getFounderCardExplainerCopy,
} from "@/lib/founder/founder-card-explainer-i18n";

import { getFounderCardExplainerCopy } from "@/lib/founder/founder-card-explainer-i18n";

/** @deprecated Use getFounderCardExplainerCopy(locale) */
export const FOUNDER_CARD_PAGE_UPDATED = getFounderCardExplainerCopy("en").pageUpdated;

/** @deprecated Use getFounderCardExplainerCopy(locale) */
export const FOUNDER_CARD_SECTIONS = getFounderCardExplainerCopy("en").sections;

/** @deprecated Use getFounderCardExplainerCopy(locale) */
export const FOUNDER_TIER_ROWS = getFounderCardExplainerCopy("en").tierRows;

/** @deprecated Use getFounderCardExplainerCopy(locale) */
export const FOUNDER_CARD_FAQ = getFounderCardExplainerCopy("en").faq;
