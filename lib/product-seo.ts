export interface ProductSeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
}

/** Parse optional Product.seo JSON. */
export function parseProductSeo(raw: unknown): ProductSeoSettings {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const keywords = Array.isArray(obj.keywords)
    ? obj.keywords
        .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
        .map((k) => k.trim().slice(0, 40))
        .slice(0, 20)
    : typeof obj.keywords === "string"
      ? obj.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
          .map((k) => k.slice(0, 40))
          .slice(0, 20)
      : undefined;

  return {
    title: typeof obj.title === "string" && obj.title.trim() ? obj.title.trim() : undefined,
    description:
      typeof obj.description === "string" && obj.description.trim()
        ? obj.description.trim()
        : undefined,
    keywords: keywords?.length ? keywords : undefined,
  };
}

/** Normalize SEO before saving to the database (null when empty). */
export function serializeProductSeoForDb(seo: ProductSeoSettings | null | undefined): object | null {
  const parsed = parseProductSeo(seo ?? {});
  if (!parsed.title && !parsed.description && !parsed.keywords?.length) {
    return null;
  }
  return {
    ...(parsed.title ? { title: parsed.title.slice(0, 70) } : {}),
    ...(parsed.description ? { description: parsed.description.slice(0, 160) } : {}),
    ...(parsed.keywords?.length ? { keywords: parsed.keywords } : {}),
  };
}

export function stripHtmlForSeo(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Resolve title/description shown in search + metadata. */
export function resolveProductSeo(input: {
  seo?: ProductSeoSettings | null;
  title: string;
  description?: string | null;
  storeName?: string;
}): { title: string; description: string; keywords?: string[] } {
  const seo = input.seo ?? {};
  const fallbackDescription =
    (input.description ? stripHtmlForSeo(input.description).slice(0, 160) : "") ||
    (input.storeName
      ? `Buy ${input.title} at ${input.storeName}`
      : `Buy ${input.title} online with cash on delivery.`);

  return {
    title: seo.title?.trim() || input.title,
    description: seo.description?.trim() || fallbackDescription,
    keywords: seo.keywords,
  };
}
