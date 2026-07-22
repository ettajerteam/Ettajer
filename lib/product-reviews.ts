import type { PublicProductReview } from "@/types/storefront";

export type { PublicProductReview };

export interface ProductReviewInput {
  id?: string;
  author: string;
  location?: string;
  rating: number;
  text: string;
  createdAt?: string;
}

function clampRating(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
}

/** Parse product.reviews JSON into a clean public list. */
export function parseProductReviews(raw: unknown): PublicProductReview[] {
  if (!Array.isArray(raw)) return [];
  const out: PublicProductReview[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const author = typeof r.author === "string" ? r.author.trim() : "";
    const text = typeof r.text === "string" ? r.text.trim() : "";
    if (!author || !text) continue;
    const location =
      typeof r.location === "string" && r.location.trim() ? r.location.trim() : undefined;
    const createdAt =
      typeof r.createdAt === "string" && r.createdAt.trim() ? r.createdAt.trim() : undefined;
    out.push({
      id: typeof r.id === "string" && r.id ? r.id : `rev-${out.length + 1}`,
      author,
      location,
      rating: clampRating(r.rating),
      text,
      createdAt,
    });
  }
  return out;
}

export function averageReviewRating(reviews: PublicProductReview[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/** Normalize reviews before saving to the database. */
export function normalizeProductReviews(raw: unknown): ProductReviewInput[] {
  return parseProductReviews(raw).map((r) => ({
    id: r.id,
    author: r.author,
    location: r.location,
    rating: r.rating,
    text: r.text,
    createdAt: r.createdAt ?? new Date().toISOString(),
  }));
}
