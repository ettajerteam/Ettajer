export type DropshippingProvider = "aliexpress" | "cj" | "bigbuy";

export type ImportedVariantOption = {
  id: string;
  name: string;
  options: string[];
  optionImages?: Record<string, string>;
};

export type ImportedProductDetail = {
  id: string;
  label: string;
  value: string;
};

export type ImportedSupplierProduct = {
  title: string;
  descriptionHtml: string;
  price: number | null;
  comparePrice: number | null;
  currency: string | null;
  images: string[];
  sku: string | null;
  barcode?: string | null;
  brand?: string | null;
  tags?: string[];
  highlights?: string[];
  variants?: ImportedVariantOption[];
  details?: ImportedProductDetail[];
  packageWeightKg?: number | null;
  sourceUrl: string;
  provider: DropshippingProvider;
  warnings: string[];
};

export const DROPSHIPPING_PROVIDERS: {
  id: DropshippingProvider;
  label: string;
  hint: string;
  /** Primary brand mark shown in the tile */
  logo: string;
  /** Optional secondary mark (icon) */
  icon?: string;
  logoBg: string;
  /** Relative frame for next/image fill */
  logoFrameClass: string;
}[] = [
  {
    id: "aliexpress",
    label: "AliExpress",
    hint: "Import from AliExpress product URL",
    logo: "/dropshipping/aliexpress-wordmark.svg",
    icon: "/dropshipping/aliexpress.png",
    logoBg: "bg-gradient-to-b from-white to-[#FFF5F3]",
    logoFrameClass: "h-8 max-h-8 w-auto max-w-[140px]",
  },
  {
    id: "cj",
    label: "CJdropshipping",
    hint: "Import from CJ product URL",
    logo: "/dropshipping/cj.png",
    logoBg: "bg-gradient-to-b from-[#FF7A1A] to-[#FF6A00]",
    logoFrameClass: "h-12 max-h-12 w-auto max-w-12",
  },
  {
    id: "bigbuy",
    label: "BigBuy",
    hint: "Import from BigBuy catalog URL",
    logo: "/dropshipping/bigbuy.svg",
    logoBg: "bg-gradient-to-b from-white to-[#FFF9E8]",
    logoFrameClass: "h-12 max-h-12 w-auto max-w-12",
  },
];

export function dropshippingProviderLabel(provider: DropshippingProvider): string {
  if (provider === "aliexpress") return "AliExpress";
  if (provider === "cj") return "CJdropshipping";
  return "BigBuy";
}

/** Strip tracking query/hash so supplier links stay short enough to save. */
export function normalizeSupplierProductUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return trimmed.slice(0, 2048);
  }
}
