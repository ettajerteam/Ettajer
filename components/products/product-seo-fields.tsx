"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveProductSeo, type ProductSeoSettings } from "@/lib/product-seo";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { absoluteUrl } from "@/lib/seo/site-config";
import { slugify } from "@/lib/utils";

interface ProductSeoFieldsProps {
  seo: ProductSeoSettings;
  onChange: (seo: ProductSeoSettings) => void;
  productTitle: string;
  productDescription?: string | null;
  storeSlug: string;
  storeName?: string;
  productSlug?: string | null;
  onSlugChange?: (slug: string) => void;
}

export function ProductSeoFields({
  seo,
  onChange,
  productTitle,
  productDescription,
  storeSlug,
  storeName,
  productSlug,
  onSlugChange,
}: ProductSeoFieldsProps) {
  const resolved = resolveProductSeo({
    seo,
    title: productTitle || "Product name",
    description: productDescription,
    storeName,
  });

  const slug =
    (productSlug?.trim() || slugify(productTitle || "") || "product-slug").replace(
      /^\/+|\/+$/g,
      ""
    );
  const previewUrl = absoluteUrl(getStoreProductUrl(storeSlug, slug)).replace(
    /^https?:\/\//,
    ""
  );

  const titleLen = (seo.title ?? "").length;
  const descLen = (seo.description ?? "").length;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="product-url-handle">URL handle</Label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">/products/</span>
          <Input
            id="product-url-handle"
            value={productSlug ?? ""}
            placeholder={slugify(productTitle || "") || "leather-bag"}
            onChange={(e) => {
              const next = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/-{2,}/g, "-");
              onSlugChange?.(next);
            }}
            className="font-mono text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Leave blank to auto-generate from the product name.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product-seo-title">
          SEO title
          <span className="ml-2 font-normal text-muted-foreground">
            {titleLen}/70
          </span>
        </Label>
        <Input
          id="product-seo-title"
          value={seo.title ?? ""}
          maxLength={70}
          placeholder={productTitle || "Product name"}
          onChange={(e) => onChange({ ...seo, title: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to use the product name.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product-seo-description">
          Meta description
          <span className="ml-2 font-normal text-muted-foreground">
            {descLen}/160
          </span>
        </Label>
        <Textarea
          id="product-seo-description"
          value={seo.description ?? ""}
          maxLength={160}
          rows={3}
          placeholder="Short pitch for Google — what it is and why to buy."
          className="resize-none"
          onChange={(e) => onChange({ ...seo, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product-seo-keywords">
          Keywords
          <span className="ml-2 font-normal text-muted-foreground">
            {(seo.keywords ?? []).length}/20
          </span>
        </Label>
        <Input
          id="product-seo-keywords"
          value={(seo.keywords ?? []).join(", ")}
          placeholder="leather bag, casablanca, cash on delivery"
          onChange={(e) =>
            onChange({
              ...seo,
              keywords: e.target.value
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
                .slice(0, 20)
                .map((k) => k.slice(0, 40)),
            })
          }
        />
        <p className="text-xs text-muted-foreground">Comma-separated.</p>
      </div>

      <div className="rounded-xl border border-neutral-200/80 bg-white/80 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="mb-1 text-[10px] font-light uppercase tracking-[0.08em] text-neutral-400">
          How it looks in Google
        </p>
        <div className="max-w-xl">
          <p className="truncate text-[12px] font-light leading-tight text-[#202124] dark:text-neutral-400">
            {previewUrl}
          </p>
          <p className="truncate text-[18px] font-normal leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
            {resolved.title}
          </p>
          <p className="line-clamp-2 text-[12px] font-light leading-snug text-[#4d5156] dark:text-neutral-500">
            {resolved.description}
          </p>
        </div>
      </div>
    </div>
  );
}
