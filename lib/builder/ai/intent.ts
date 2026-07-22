import type { WebsiteTemplateId } from "@/lib/website-templates/types";
import type { BlockId } from "../types";
import { getImplementedBlocks } from "../block-registry";

export interface ParsedIntent {
  industry: string;
  tone: string;
  siteType: "ecommerce" | "portfolio" | "restaurant" | "agency" | "general";
  keywords: string[];
  suggestedBlocks: BlockId[];
  suggestedTemplateId?: WebsiteTemplateId;
}

const ECOMMERCE_BLOCKS: BlockId[] = [
  "hero",
  "collection-banner",
  "product-grid",
  "rich-text",
  "footer",
];

const RESTAURANT_BLOCKS: BlockId[] = ["hero", "rich-text", "image", "footer"];

const PORTFOLIO_BLOCKS: BlockId[] = ["hero", "image", "rich-text", "footer"];

const AGENCY_BLOCKS: BlockId[] = ["hero", "rich-text", "image", "footer"];

const GENERAL_BLOCKS: BlockId[] = ["hero", "rich-text", "footer"];

const KEYWORD_PATTERNS: { pattern: RegExp; keyword: string }[] = [
  { pattern: /\bluxury\b/i, keyword: "luxury" },
  { pattern: /\bpremium\b/i, keyword: "premium" },
  { pattern: /\belegant\b/i, keyword: "elegant" },
  { pattern: /\bperfume\b/i, keyword: "perfume" },
  { pattern: /\bfragrance\b/i, keyword: "fragrance" },
  { pattern: /\bbeauty\b/i, keyword: "beauty" },
  { pattern: /\bcosmetic/i, keyword: "cosmetics" },
  { pattern: /\bfashion\b/i, keyword: "fashion" },
  { pattern: /\bapparel\b/i, keyword: "apparel" },
  { pattern: /\bclothing\b/i, keyword: "clothing" },
  { pattern: /\brestaurant\b/i, keyword: "restaurant" },
  { pattern: /\bfood\b/i, keyword: "food" },
  { pattern: /\bcafe\b/i, keyword: "cafe" },
  { pattern: /\bdining\b/i, keyword: "dining" },
  { pattern: /\belectronic/i, keyword: "electronics" },
  { pattern: /\bgadget/i, keyword: "gadgets" },
  { pattern: /\btech\b/i, keyword: "tech" },
  { pattern: /\bportfolio\b/i, keyword: "portfolio" },
  { pattern: /\bphotographer\b/i, keyword: "photographer" },
  { pattern: /\bcreative\b/i, keyword: "creative" },
  { pattern: /\bagency\b/i, keyword: "agency" },
  { pattern: /\bstudio\b/i, keyword: "studio" },
  { pattern: /\bconsulting\b/i, keyword: "consulting" },
  { pattern: /\becommerce\b/i, keyword: "ecommerce" },
  { pattern: /\bshop\b/i, keyword: "shop" },
  { pattern: /\bstore\b/i, keyword: "store" },
  { pattern: /\bminimal\b/i, keyword: "minimal" },
  { pattern: /\bbold\b/i, keyword: "bold" },
  { pattern: /\bplayful\b/i, keyword: "playful" },
  { pattern: /\bprofessional\b/i, keyword: "professional" },
];

function extractKeywords(text: string): string[] {
  const found = new Set<string>();
  for (const { pattern, keyword } of KEYWORD_PATTERNS) {
    if (pattern.test(text)) found.add(keyword);
  }
  return Array.from(found);
}

function detectSiteType(keywords: string[], text: string): ParsedIntent["siteType"] {
  if (keywords.some((k) => ["restaurant", "food", "cafe", "dining"].includes(k))) {
    return "restaurant";
  }
  if (keywords.some((k) => ["portfolio", "photographer", "creative"].includes(k))) {
    return "portfolio";
  }
  if (keywords.some((k) => ["agency", "studio", "consulting"].includes(k))) {
    return "agency";
  }
  if (
    keywords.some((k) =>
      ["ecommerce", "shop", "store", "perfume", "fragrance", "beauty", "cosmetics", "fashion", "apparel", "clothing", "electronics", "gadgets", "tech"].includes(k)
    ) ||
    /\b(sell|selling|buy|catalog|products?)\b/i.test(text)
  ) {
    return "ecommerce";
  }
  return "general";
}

function detectIndustry(keywords: string[], siteType: ParsedIntent["siteType"]): string {
  if (keywords.includes("perfume") || keywords.includes("fragrance")) return "Fragrance & Perfume";
  if (keywords.includes("beauty") || keywords.includes("cosmetics")) return "Beauty & Cosmetics";
  if (keywords.includes("fashion") || keywords.includes("apparel") || keywords.includes("clothing")) {
    return "Fashion & Apparel";
  }
  if (keywords.includes("electronics") || keywords.includes("gadgets") || keywords.includes("tech")) {
    return "Electronics";
  }
  if (siteType === "restaurant") return "Food & Beverage";
  if (siteType === "portfolio") return "Creative & Portfolio";
  if (siteType === "agency") return "Professional Services";
  if (siteType === "ecommerce") return "E-commerce";
  return "General";
}

function detectTone(keywords: string[]): string {
  if (keywords.includes("luxury") || keywords.includes("premium") || keywords.includes("elegant")) {
    return "luxury";
  }
  if (keywords.includes("minimal")) return "minimal";
  if (keywords.includes("bold")) return "bold";
  if (keywords.includes("playful")) return "playful";
  if (keywords.includes("professional")) return "professional";
  return "professional";
}

function suggestTemplateId(
  keywords: string[],
  siteType: ParsedIntent["siteType"]
): WebsiteTemplateId | undefined {
  if (keywords.includes("electronics") || keywords.includes("gadgets") || keywords.includes("tech")) {
    return "tech";
  }
  if (
    keywords.some((k) =>
      ["fashion", "apparel", "clothing", "beauty", "cosmetics", "perfume", "fragrance"].includes(k)
    )
  ) {
    return "aura";
  }
  if (siteType === "ecommerce") return "paper";
  return undefined;
}

function suggestBlocks(siteType: ParsedIntent["siteType"], available: BlockId[]): BlockId[] {
  let preferred: BlockId[];
  switch (siteType) {
    case "restaurant":
      preferred = RESTAURANT_BLOCKS;
      break;
    case "portfolio":
      preferred = PORTFOLIO_BLOCKS;
      break;
    case "agency":
      preferred = AGENCY_BLOCKS;
      break;
    case "ecommerce":
      preferred = ECOMMERCE_BLOCKS;
      break;
    default:
      preferred = GENERAL_BLOCKS;
  }
  return preferred.filter((id) => available.includes(id));
}

export function parsePromptIntent(prompt: string): ParsedIntent {
  const text = prompt.trim().toLowerCase();
  const keywords = extractKeywords(text);
  const siteType = detectSiteType(keywords, text);
  const available = getImplementedBlocks().map((b) => b.id);

  let suggestedBlocks = suggestBlocks(siteType, available);
  if (/\b(faq|questions?|q\s*&\s*a)\b/i.test(text) && available.includes("faq")) {
    suggestedBlocks = ["faq", ...suggestedBlocks.filter((id) => id !== "faq")];
  } else if (
    /\b(testimonial|review|quote|social proof)\b/i.test(text) &&
    available.includes("testimonials")
  ) {
    suggestedBlocks = ["testimonials", ...suggestedBlocks.filter((id) => id !== "testimonials")];
  }

  return {
    industry: detectIndustry(keywords, siteType),
    tone: detectTone(keywords),
    siteType,
    keywords,
    suggestedBlocks,
    suggestedTemplateId: suggestTemplateId(keywords, siteType),
  };
}
