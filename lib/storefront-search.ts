import type { PublicProduct } from "@/types/storefront";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "for",
  "from",
  "with",
  "your",
  "our",
  "new",
  "set",
  "pack",
  "edition",
  "collection",
  "product",
  "item",
]);

export function normalizeSearchQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function scoreProduct(product: PublicProduct, q: string): number {
  const title = product.title.toLowerCase();
  const desc = (product.description ?? "").toLowerCase();
  const tags = product.tags.map((t) => t.toLowerCase());

  let score = 0;
  if (title === q) score += 100;
  else if (title.startsWith(q)) score += 80;
  else if (title.includes(q)) score += 50;

  for (const tag of tags) {
    if (tag === q) score += 40;
    else if (tag.startsWith(q) || tag.includes(q)) score += 25;
  }

  if (desc.includes(q)) score += 10;

  // Multi-word: boost when every token appears in the title
  const tokens = q.split(" ").filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => title.includes(t))) {
    score += 30;
  }

  return score;
}

/** Ranked product search — title/tag matches before description. */
export function searchProducts(products: PublicProduct[], query: string): PublicProduct[] {
  const q = normalizeSearchQuery(query).toLowerCase();
  if (!q) return [];

  return products
    .map((product) => ({ product, score: scoreProduct(product, q) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title))
    .map((row) => row.product);
}

function titleKeywords(title: string): string[] {
  return title
    .split(/[\s,/|&–—-]+/)
    .map((w) => w.replace(/[^a-zA-Z0-9']/g, ""))
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()));
}

/**
 * Build high-signal suggestion chips from tags, categories, and distinctive title words.
 */
export function collectSearchSuggestions(
  products: PublicProduct[],
  options?: {
    categoryNames?: string[];
    limit?: number;
  }
): string[] {
  const limit = options?.limit ?? 8;
  const tagCounts = new Map<string, number>();

  for (const product of products) {
    for (const raw of product.tags) {
      const tag = raw.trim();
      if (tag.length < 2) continue;
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const fromTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);

  const fromCategories = (options?.categoryNames ?? [])
    .map((n) => n.trim())
    .filter((n) => n.length > 1);

  const wordCounts = new Map<string, number>();
  for (const product of products) {
    for (const word of titleKeywords(product.title)) {
      const key = word[0].toUpperCase() + word.slice(1);
      wordCounts.set(key, (wordCounts.get(key) ?? 0) + 1);
    }
  }
  const fromTitles = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word);

  const out: string[] = [];
  const seen = new Set<string>();

  const push = (value: string) => {
    const key = value.toLowerCase();
    if (seen.has(key) || out.length >= limit) return;
    seen.add(key);
    out.push(value);
  };

  // Interleave sources for variety: category → tag → title word
  const maxRounds = Math.max(fromCategories.length, fromTags.length, fromTitles.length);
  for (let i = 0; i < maxRounds && out.length < limit; i++) {
    if (fromCategories[i]) push(fromCategories[i]);
    if (fromTags[i]) push(fromTags[i]);
    if (fromTitles[i]) push(fromTitles[i]);
  }

  return out;
}

/** Suggestions that still make sense for the current draft query. */
export function filterSuggestionsForQuery(suggestions: string[], draft: string, limit = 6): string[] {
  const q = normalizeSearchQuery(draft).toLowerCase();
  if (!q) return suggestions.slice(0, limit);
  return suggestions
    .filter((s) => {
      const lower = s.toLowerCase();
      return lower.includes(q) || q.includes(lower);
    })
    .slice(0, limit);
}
