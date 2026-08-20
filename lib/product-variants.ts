import type { ProductVariant } from "@/types";

/**
 * Merchants (and some imports) often paste "S, M, L, XL" into a single option
 * field because the editor placeholder looked like a list. Expand those into
 * real selectable values so storefront chips render correctly.
 */
export function expandVariantOptionValues(options: string[]): string[] {
  const out: string[] = [];

  for (const raw of options) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (trimmed.includes(",")) {
      const parts = trimmed
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        out.push(...parts);
        continue;
      }
    }

    if (/\s\/\s/.test(trimmed)) {
      const parts = trimmed
        .split(/\s\/\s/)
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        out.push(...parts);
        continue;
      }
    }

    out.push(trimmed);
  }

  return Array.from(new Set(out));
}

function remapOptionImages(
  optionImages: Record<string, string> | undefined,
  expandedOptions: string[],
  originalOptions: string[]
): Record<string, string> | undefined {
  if (!optionImages || Object.keys(optionImages).length === 0) return undefined;

  const next: Record<string, string> = {};
  for (const [key, url] of Object.entries(optionImages)) {
    if (!url?.trim()) continue;
    const trimmedKey = key.trim();
    if (expandedOptions.includes(trimmedKey)) {
      next[trimmedKey] = url.trim();
      continue;
    }
    // Legacy key was the whole comma-list — drop it (can't map one image to many).
    if (originalOptions.some((o) => o.trim() === trimmedKey)) {
      continue;
    }
    if (expandedOptions.includes(key)) next[key] = url.trim();
  }
  return Object.keys(next).length ? next : undefined;
}

/** Normalize a single variant's options (expand comma-lists, drop empties). */
export function normalizeProductVariant(variant: ProductVariant): ProductVariant {
  const originalOptions = variant.options ?? [];
  const options = expandVariantOptionValues(originalOptions);
  return {
    ...variant,
    name: variant.name.trim(),
    options: options.length ? options : [""],
    optionImages: remapOptionImages(variant.optionImages, options, originalOptions),
  };
}

export function normalizeProductVariants(variants: ProductVariant[]): ProductVariant[] {
  return variants
    .map(normalizeProductVariant)
    .filter((v) => v.name.trim().length > 0)
    .map((v) => ({
      ...v,
      options: v.options.map((o) => o.trim()).filter(Boolean),
    }))
    .filter((v) => v.options.length > 0);
}

export function parseProductVariants(variants: unknown): ProductVariant[] {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((v): ProductVariant | null => {
      if (typeof v !== "object" || v === null) return null;
      const obj = v as Record<string, unknown>;
      if (typeof obj.id !== "string" || typeof obj.name !== "string") return null;
      if (!Array.isArray(obj.options)) return null;
      const options = obj.options
        .map((o) => {
          if (typeof o === "string") return o;
          if (o && typeof o === "object" && "value" in o && typeof (o as { value: unknown }).value === "string") {
            return (o as { value: string }).value;
          }
          return null;
        })
        .filter((o): o is string => o !== null);

      const optionImages: Record<string, string> = {};
      if (obj.optionImages && typeof obj.optionImages === "object") {
        for (const [key, val] of Object.entries(obj.optionImages as Record<string, unknown>)) {
          if (typeof val === "string" && val.trim()) optionImages[key] = val.trim();
        }
      }
      // Legacy: options as { value, imageUrl }
      if (Array.isArray(obj.options)) {
        for (const o of obj.options) {
          if (
            o &&
            typeof o === "object" &&
            "value" in o &&
            typeof (o as { value: unknown }).value === "string" &&
            "imageUrl" in o &&
            typeof (o as { imageUrl: unknown }).imageUrl === "string"
          ) {
            optionImages[(o as { value: string }).value] = (o as { imageUrl: string }).imageUrl;
          }
        }
      }

      return normalizeProductVariant({
        id: obj.id,
        name: obj.name,
        options: options.length ? options : [""],
        optionImages: Object.keys(optionImages).length ? optionImages : undefined,
      });
    })
    .filter((v): v is ProductVariant => v !== null);
}
