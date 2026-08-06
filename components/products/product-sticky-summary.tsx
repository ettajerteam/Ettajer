"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  computeProductSeoScore,
  statusLabel,
  type ProductCommerceSettings,
  type ProductVisibilityChannels,
} from "@/lib/product-commerce";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/product-types";

interface ProductStickySummaryProps {
  status: ProductStatus;
  onStatusChange: (status: ProductStatus) => void;
  commerce: ProductCommerceSettings;
  onCommerceChange: (commerce: ProductCommerceSettings) => void;
  inventory: number;
  title: string;
  description?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  imagesCount: number;
  categoryId?: string | null;
  hasDetails?: boolean;
  storeSlug: string;
  productSlug?: string | null;
}

const CHANNELS: { key: keyof ProductVisibilityChannels; label: string }[] = [
  { key: "onlineStore", label: "Online Store" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok Shop" },
  { key: "google", label: "Google Shopping" },
];

export function ProductStickySummary({
  status,
  onStatusChange,
  commerce,
  onCommerceChange,
  inventory,
  title,
  description,
  seoTitle,
  seoDescription,
  imagesCount,
  categoryId,
  hasDetails,
  storeSlug,
  productSlug,
}: ProductStickySummaryProps) {
  const visibility = commerce.visibility ?? {
    onlineStore: true,
    facebook: false,
    instagram: false,
    tiktok: false,
    google: false,
  };

  const seoScore = computeProductSeoScore({
    title,
    description,
    seoTitle,
    seoDescription,
    imagesCount,
    categoryId,
    hasDetails,
  });

  const previewHref = productSlug
    ? getStoreProductUrl(storeSlug, productSlug)
    : getStoreProductUrl(storeSlug, "preview");

  const setChannel = (key: keyof ProductVisibilityChannels, value: boolean) => {
    onCommerceChange({
      ...commerce,
      visibility: { ...visibility, [key]: value },
    });
  };

  return (
    <aside className="product-editor-card space-y-5 lg:sticky lg:top-4">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Status
        </p>
        <Select value={status} onValueChange={(v) => onStatusChange(v as ProductStatus)}>
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          {statusLabel(status)}
          {status === "active" ? " — visible on your store" : null}
          {status === "draft" ? " — hidden from customers" : null}
          {status === "archived" ? " — removed from catalog" : null}
        </p>
      </div>

      <div className="border-t border-black/[0.06] pt-4 dark:border-white/10">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Sales channels
        </p>
        <ul className="space-y-2.5">
          {CHANNELS.map(({ key, label }) => (
            <li key={key} className="flex items-center justify-between gap-3">
              <Label htmlFor={`channel-${key}`} className="cursor-pointer text-[13px] font-normal">
                {label}
              </Label>
              <Switch
                id={`channel-${key}`}
                checked={visibility[key]}
                onCheckedChange={(v) => setChannel(key, v)}
                className="h-5 w-9 data-[state=checked]:bg-[#007AFF]/85 [&>span]:h-4 [&>span]:w-4 data-[state=checked]:[&>span]:translate-x-4"
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-black/[0.06] pt-4 dark:border-white/10">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Inventory
        </p>
        <p className="mt-1.5 text-lg font-semibold tracking-[-0.02em] tabular-nums">
          {inventory}{" "}
          <span className="text-sm font-normal text-muted-foreground">in stock</span>
        </p>
      </div>

      <div className="border-t border-black/[0.06] pt-4 dark:border-white/10">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          SEO score
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold tracking-[-0.03em] tabular-nums">
            {seoScore}
            <span className="text-sm font-normal text-muted-foreground">/100</span>
          </p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              seoScore >= 80
                ? "bg-emerald-50 text-emerald-700"
                : seoScore >= 50
                  ? "bg-amber-50 text-amber-700"
                  : "bg-neutral-100 text-neutral-600"
            )}
          >
            {seoScore >= 80 ? "Great" : seoScore >= 50 ? "Okay" : "Needs work"}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-[#007AFF] transition-all duration-500"
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </div>

      <div className="border-t border-black/[0.06] pt-4 dark:border-white/10">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Preview
        </p>
        {productSlug ? (
          <Link
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="product-editor-btn-soft inline-flex w-full items-center justify-center gap-1.5"
          >
            View product
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            Publish to get a live product link.
          </p>
        )}
      </div>
    </aside>
  );
}
