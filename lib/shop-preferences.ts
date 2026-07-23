import type { StoreSeoSettings } from "@/lib/seo/storefront-metadata";
import { parseStoreSeo } from "@/lib/seo/storefront-metadata";

/** Merchant shop controls stored under StoreSettings.seo.shop (no schema migration). */
export interface ShopPreferences {
  whatsapp: string | null;
  showContactOnStorefront: boolean;
  minOrderAmount: number;
  checkoutNote: string;
  codMessage: string;
  announceBarEnabled: boolean;
  announceBarText: string;
}

export const DEFAULT_SHOP_PREFERENCES: ShopPreferences = {
  whatsapp: null,
  showContactOnStorefront: true,
  minOrderAmount: 0,
  checkoutNote: "",
  codMessage: "",
  announceBarEnabled: false,
  announceBarText: "",
};

export function parseShopPreferences(seoRaw: unknown): ShopPreferences {
  if (!seoRaw || typeof seoRaw !== "object") return { ...DEFAULT_SHOP_PREFERENCES };
  const shop = (seoRaw as Record<string, unknown>).shop;
  if (!shop || typeof shop !== "object") return { ...DEFAULT_SHOP_PREFERENCES };
  const obj = shop as Record<string, unknown>;

  return {
    whatsapp:
      typeof obj.whatsapp === "string" && obj.whatsapp.trim()
        ? obj.whatsapp.trim()
        : null,
    showContactOnStorefront: obj.showContactOnStorefront !== false,
    minOrderAmount: Math.max(0, Number(obj.minOrderAmount ?? 0) || 0),
    checkoutNote:
      typeof obj.checkoutNote === "string" ? obj.checkoutNote.trim() : "",
    codMessage: typeof obj.codMessage === "string" ? obj.codMessage.trim() : "",
    announceBarEnabled: obj.announceBarEnabled === true,
    announceBarText:
      typeof obj.announceBarText === "string" ? obj.announceBarText.trim() : "",
  };
}

function asSeoObject(seoRaw: unknown): Record<string, unknown> {
  if (seoRaw && typeof seoRaw === "object" && !Array.isArray(seoRaw)) {
    return { ...(seoRaw as Record<string, unknown>) };
  }
  return {};
}

/** Merge SEO fields into existing seo JSON while preserving design / shop / other keys. */
export function mergeSeoSettings(
  seoRaw: unknown,
  seo: StoreSeoSettings,
): Record<string, unknown> {
  const base = asSeoObject(seoRaw);

  if (seo.title !== undefined) {
    if (seo.title?.trim()) base.title = seo.title.trim();
    else delete base.title;
  }
  if (seo.description !== undefined) {
    if (seo.description?.trim()) base.description = seo.description.trim();
    else delete base.description;
  }
  if (seo.keywords !== undefined) {
    if (seo.keywords.length > 0) base.keywords = seo.keywords;
    else delete base.keywords;
  }
  if (seo.noIndex !== undefined) {
    if (seo.noIndex) base.noIndex = true;
    else delete base.noIndex;
  }

  return base;
}

/** Merge shop preferences under seo.shop while preserving design / SEO keys. */
export function mergeShopPreferences(
  seoRaw: unknown,
  shop: Partial<ShopPreferences>,
): Record<string, unknown> {
  const base = asSeoObject(seoRaw);
  const current = parseShopPreferences(base);
  const next: ShopPreferences = {
    ...current,
    ...shop,
    whatsapp:
      shop.whatsapp === undefined
        ? current.whatsapp
        : shop.whatsapp?.trim()
          ? shop.whatsapp.trim()
          : null,
    checkoutNote:
      shop.checkoutNote === undefined
        ? current.checkoutNote
        : shop.checkoutNote.trim(),
    codMessage:
      shop.codMessage === undefined ? current.codMessage : shop.codMessage.trim(),
    announceBarText:
      shop.announceBarText === undefined
        ? current.announceBarText
        : shop.announceBarText.trim(),
    minOrderAmount:
      shop.minOrderAmount === undefined
        ? current.minOrderAmount
        : Math.max(0, Number(shop.minOrderAmount) || 0),
  };

  base.shop = next;
  return base;
}

export function getSeoAndShopFromRaw(seoRaw: unknown): {
  seo: StoreSeoSettings;
  shop: ShopPreferences;
} {
  return {
    seo: parseStoreSeo(seoRaw),
    shop: parseShopPreferences(seoRaw),
  };
}
