/**
 * Heuristic (non-LLM) recommendations derived purely from a listing's own
 * title/description text. This module never invents commercial facts
 * (price, inventory, materials) — it only rephrases/summarizes what's given.
 */

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "for", "with", "in", "on", "at",
  "to", "from", "by", "is", "are", "was", "were", "be", "this", "that", "it",
  "as", "your", "you", "our", "we", "will", "can", "has", "have", "not",
  "each", "all", "any", "into", "than", "then", "so", "if", "no", "yes",
]);

/** Lightweight keyword → suggested category map for common handmade/vintage niches. */
const CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  { category: "Jewelry", keywords: ["necklace", "earring", "earrings", "bracelet", "ring", "pendant", "jewelry", "jewellery"] },
  { category: "Home & Living", keywords: ["candle", "mug", "pillow", "blanket", "decor", "vase", "coaster", "lamp"] },
  { category: "Clothing", keywords: ["shirt", "dress", "sweater", "hoodie", "jacket", "scarf", "hat", "socks"] },
  { category: "Art & Collectibles", keywords: ["print", "painting", "poster", "illustration", "artwork", "canvas"] },
  { category: "Craft Supplies", keywords: ["beads", "fabric", "yarn", "supply", "supplies", "pattern", "kit"] },
  { category: "Bags & Purses", keywords: ["bag", "purse", "tote", "backpack", "wallet", "pouch"] },
  { category: "Toys & Games", keywords: ["toy", "game", "puzzle", "plush", "doll"] },
  { category: "Wedding & Party", keywords: ["wedding", "invitation", "bridal", "party", "favor", "favors"] },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export interface ProductAiRecommendations {
  suggestedCategory: string | null;
  suggestedTags: string[];
  seoTitle: string;
  /** Human-readable explanation of how each field was derived — for transparency. */
  rationale: string[];
}

/**
 * Suggest a category, tags, and an SEO-friendly title from a listing's own
 * title/description. Pure heuristic word-frequency + keyword matching —
 * no external calls, no fabricated facts.
 */
export function recommendListingMetadata(input: {
  title: string;
  description?: string | null;
  existingTags?: string[];
}): ProductAiRecommendations {
  const rationale: string[] = [];
  const combinedText = `${input.title} ${input.description ?? ""}`;
  const tokens = tokenize(combinedText);

  let suggestedCategory: string | null = null;
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some((kw) => tokens.includes(kw))) {
      suggestedCategory = entry.category;
      rationale.push(
        `Category "${entry.category}" matched keyword(s) found in the title/description.`
      );
      break;
    }
  }
  if (!suggestedCategory) {
    rationale.push("No confident category keyword match — left for manual review.");
  }

  const frequency = new Map<string, number>();
  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }
  const existing = new Set((input.existingTags ?? []).map((t) => t.toLowerCase()));
  const keywordTags = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter((word) => !existing.has(word));

  const suggestedTags = Array.from(new Set([...(input.existingTags ?? []), ...keywordTags])).slice(
    0,
    13
  );
  rationale.push(
    `Tags ranked by word frequency across the title and description (Etsy allows up to 13).`
  );

  const seoTitle = buildSeoTitle(input.title, keywordTags);
  rationale.push("SEO title keeps the original title and appends top unused keywords, capped at 140 characters.");

  return { suggestedCategory, suggestedTags, seoTitle, rationale };
}

function buildSeoTitle(title: string, keywordTags: string[]): string {
  const base = title.trim();
  const extras: string[] = [];
  const usedLower = new Set(tokenize(base));
  for (const tag of keywordTags) {
    if (usedLower.has(tag)) continue;
    const candidate = [base, ...extras, tag].join(" | ");
    if (candidate.length > 140) break;
    extras.push(tag);
  }
  return extras.length ? `${base} | ${extras.join(" | ")}` : base;
}
