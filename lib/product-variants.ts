import type { ProductVariant } from "@/types";

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

      return {
        id: obj.id,
        name: obj.name,
        options: options.length ? options : [""],
        optionImages: Object.keys(optionImages).length ? optionImages : undefined,
      };
    })
    .filter((v): v is ProductVariant => v !== null);
}
