import type { BlockDefinition } from "../types";
import { RICH_TEXT_CONTENT_FIELDS, STANDARD_ADVANCED_FIELDS } from "./shared-schemas";
import { richTextBlock } from "./rich-text.block";

function marketingBlock(
  id: string,
  name: string,
  description: string,
  icon: string,
  gradient: string,
  defaultContent: Record<string, unknown>
): Omit<BlockDefinition, "component"> {
  return {
    id,
    category: "marketing",
    name,
    description,
    icon,
    legacySectionType: "rich-text",
    implemented: true,
    thumbnail: { type: "gradient", value: gradient },
    defaultContent,
    defaultStyles: richTextBlock.defaultStyles,
    settingsSchema: {
      content: RICH_TEXT_CONTENT_FIELDS,
      styles: richTextBlock.settingsSchema.styles,
      layout: richTextBlock.settingsSchema.layout,
      advanced: STANDARD_ADVANCED_FIELDS,
    },
  };
}

export const featuresBlock = marketingBlock(
  "features",
  "Features",
  "Highlight key product benefits",
  "sparkles",
  "from-violet-50 to-purple-100",
  { title: "Why shop with us", content: "Add your feature highlights here." }
);

export const testimonialsBlock = marketingBlock(
  "testimonials",
  "Testimonials",
  "Customer quotes and social proof",
  "quote",
  "from-amber-50 to-orange-100",
  { title: "What customers say", content: "Add testimonials here." }
);

export const faqBlock = marketingBlock(
  "faq",
  "FAQ",
  "Answer common questions",
  "help",
  "from-cyan-50 to-sky-100",
  { title: "Frequently asked questions", content: "Add FAQ content here." }
);

export const ctaBlock = marketingBlock(
  "cta",
  "CTA",
  "Call-to-action banner",
  "megaphone",
  "from-rose-50 to-pink-100",
  { title: "Ready to shop?", content: "Add your CTA message here." }
);

export const newsletterBlock = marketingBlock(
  "newsletter",
  "Newsletter",
  "Email signup promo block",
  "mail",
  "from-emerald-50 to-teal-100",
  { title: "Join our newsletter", content: "Get updates and offers." }
);
