import type { BlockDefinition } from "../types";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  BASIC_TYPOGRAPHY_STYLES,
  RICH_TEXT_CONTENT_FIELDS,
  STANDARD_ADVANCED_FIELDS,
  TITLE_CONTENT_FIELD,
} from "./shared-schemas";
import { richTextBlock } from "./rich-text.block";

export const testimonialsBlock: Omit<BlockDefinition, "component"> = {
  id: "testimonials",
  category: "marketing",
  name: "Testimonials",
  description: "Customer quote cards",
  icon: "quote",
  legacySectionType: "testimonials",
  implemented: true,
  pageTemplates: ["home", "product"],
  thumbnail: { type: "gradient", value: "from-amber-50 to-orange-100" },
  defaultContent: {
    title: "What customers say",
    subtitle: "Real feedback from shoppers across Morocco",
    layout: "cards",
    cardStyle: "bordered",
    columns: 3,
    items: [
      {
        quote: "Beautiful quality and arrived faster than expected.",
        author: "Amira K.",
        role: "Casablanca",
      },
      {
        quote: "Exactly what I was looking for — packaging felt premium.",
        author: "Youssef B.",
        role: "Rabat",
      },
      {
        quote: "Support was helpful and the product matched the photos.",
        author: "Sara M.",
        role: "Marrakech",
      },
    ],
  },
  defaultStyles: {
    desktop: { padding: "3.5rem 1.5rem" },
  },
  settingsSchema: {
    focuses: ["text", "section"],
    content: [
      TITLE_CONTENT_FIELD,
      {
        key: "subtitle",
        type: "textarea",
        label: "Subtitle",
        group: "text",
        focus: ["text", "section"],
      },
      {
        key: "layout",
        type: "select",
        label: "Design layout",
        group: "layout",
        focus: "section",
        options: [
          { value: "cards", label: "Quote cards" },
          { value: "spotlight", label: "Spotlight" },
          { value: "carousel", label: "Carousel" },
          { value: "stacked", label: "Stacked list" },
          { value: "minimal", label: "Minimal quotes" },
        ],
      },
      {
        key: "cardStyle",
        type: "select",
        label: "Card style",
        group: "style",
        focus: "section",
        options: [
          { value: "bordered", label: "Bordered" },
          { value: "soft", label: "Soft fill" },
          { value: "plain", label: "Plain" },
        ],
        showWhen: { key: "layout", in: ["cards", "spotlight", "carousel", "stacked"] },
      },
      {
        key: "columns",
        type: "select",
        label: "Columns",
        group: "layout",
        focus: "section",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
        ],
        showWhen: { key: "layout", equals: "cards" },
      },
      {
        key: "items",
        type: "itemList",
        label: "Quotes",
        itemLabel: "Quote",
        maxItems: 9,
        group: "text",
        focus: ["text", "section"],
        itemFields: [
          {
            key: "quote",
            type: "textarea",
            label: "Quote",
            placeholder: "What the customer said…",
          },
          {
            key: "author",
            type: "text",
            label: "Name",
            placeholder: "Customer name",
          },
          {
            key: "role",
            type: "text",
            label: "Detail",
            placeholder: "City, role, or company",
          },
        ],
      },
    ],
    styles: [...BASIC_TYPOGRAPHY_STYLES, BASIC_BACKGROUND_STYLE],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};

export const faqBlock: Omit<BlockDefinition, "component"> = {
  id: "faq",
  category: "marketing",
  name: "FAQ",
  description: "Expandable Q&A list",
  icon: "help",
  legacySectionType: "faq",
  implemented: true,
  pageTemplates: ["home", "product"],
  thumbnail: { type: "gradient", value: "from-cyan-50 to-sky-100" },
  defaultContent: {
    title: "Frequently asked questions",
    subtitle: "Quick answers before you order",
    layout: "accordion",
    openFirst: true,
    items: [
      {
        question: "How long does shipping take?",
        answer: "Most orders arrive within 2–5 business days depending on your city.",
      },
      {
        question: "Can I pay on delivery?",
        answer: "Yes — cash on delivery is available for eligible orders.",
      },
      {
        question: "What is your return policy?",
        answer: "Unused items can be returned within 14 days. Contact us and we’ll help.",
      },
    ],
  },
  defaultStyles: {
    desktop: { padding: "3.5rem 1.5rem" },
  },
  settingsSchema: {
    focuses: ["text", "section"],
    content: [
      TITLE_CONTENT_FIELD,
      {
        key: "subtitle",
        type: "textarea",
        label: "Subtitle",
        group: "text",
        focus: ["text", "section"],
      },
      {
        key: "layout",
        type: "select",
        label: "Design layout",
        group: "layout",
        focus: "section",
        options: [
          { value: "accordion", label: "Accordion" },
          { value: "two-column", label: "Two columns" },
          { value: "stacked", label: "Always open" },
          { value: "compact", label: "Compact accordion" },
        ],
      },
      {
        key: "openFirst",
        type: "toggle",
        label: "Open first question",
        group: "layout",
        focus: "section",
        showWhen: { key: "layout", in: ["accordion", "two-column", "compact"] },
      },
      {
        key: "items",
        type: "itemList",
        label: "Questions",
        itemLabel: "Question",
        maxItems: 16,
        group: "text",
        focus: ["text", "section"],
        itemFields: [
          {
            key: "question",
            type: "text",
            label: "Question",
            placeholder: "What do customers ask?",
          },
          {
            key: "answer",
            type: "textarea",
            label: "Answer",
            placeholder: "Clear, helpful answer…",
          },
        ],
      },
    ],
    styles: [...BASIC_TYPOGRAPHY_STYLES, BASIC_BACKGROUND_STYLE],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};

/** Newsletter stays a rich-text layout variant (signup form wired in rich-text section). */
export const newsletterBlock: Omit<BlockDefinition, "component"> = {
  id: "newsletter",
  category: "marketing",
  name: "Newsletter",
  description: "Email signup promo block",
  icon: "mail",
  legacySectionType: "rich-text",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-emerald-50 to-teal-100" },
  defaultContent: {
    title: "Join our newsletter",
    content: "Get updates and offers.",
    layout: "newsletter",
  },
  defaultStyles: richTextBlock.defaultStyles,
  settingsSchema: {
    content: RICH_TEXT_CONTENT_FIELDS,
    styles: [...BASIC_TYPOGRAPHY_STYLES, BASIC_BACKGROUND_STYLE],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
