"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ImageIcon,
  Layers,
  Package,
  Search,
  Star,
  X,
} from "lucide-react";
import { collectionSchema, type CollectionFormValues } from "@/lib/validations/catalog";
import { cn, formatCurrency, slugify } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SingleImageUpload } from "@/components/catalog/single-image-upload";
import type { Collection } from "@/types/catalog";
import type { Product } from "@/types";

interface CollectionFormProps {
  initialData?: Collection;
  products: Product[];
  currency?: string;
  onSubmit: (data: CollectionFormValues) => Promise<void>;
  formId: string;
}

const defaultValues: CollectionFormValues = {
  name: "",
  description: "",
  image: null,
  featured: false,
  productIds: [],
};

function catalogTitle(title: string, maxChars = 42): string {
  const cleaned = title.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  const slice = cleaned.slice(0, maxChars);
  const cut = slice.replace(/\s+\S*$/, "").trimEnd();
  return `${(cut.length > 16 ? cut : slice).trimEnd()}…`;
}

export function CollectionForm({
  initialData,
  products,
  currency = "MAD",
  onSubmit,
  formId,
}: CollectionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? "",
          image: initialData.image,
          featured: initialData.featured,
          productIds: initialData.productIds,
        }
      : defaultValues,
  });

  const name = watch("name");
  const featured = watch("featured");
  const productIds = watch("productIds");
  const slugPreview = slugify(name || "") || "collection-slug";

  const selectedProducts = useMemo(
    () => products.filter((p) => productIds.includes(p.id)),
    [products, productIds]
  );

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
      <section className="product-editor-card space-y-5">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Collection details</h3>
          <p className="mt-1 text-[13px] leading-normal text-muted-foreground">
            Name it for shoppers — this shows on your store and in campaigns.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-name" className="text-[13px] font-medium">
            Name
          </Label>
          <Input
            id="collection-name"
            className="h-11 rounded-xl border-black/[0.08] bg-white/80 text-[15px] dark:border-white/10 dark:bg-white/[0.04]"
            placeholder="e.g. New arrivals, Summer sale, Best sellers"
            autoComplete="off"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-[12px] text-destructive">{errors.name.message}</p>
          ) : (
            <p className="text-[12px] leading-normal text-muted-foreground">
              Store URL:{" "}
              <span className="font-medium text-foreground/80">/collections/{slugPreview}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-description" className="text-[13px] font-medium">
            Description
            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="collection-description"
            className="min-h-[96px] rounded-xl border-black/[0.08] bg-white/80 text-[14px] leading-relaxed dark:border-white/10 dark:bg-white/[0.04]"
            placeholder="A short line shoppers see under the collection title."
            rows={3}
            {...register("description")}
          />
        </div>
      </section>

      <section className="product-editor-card space-y-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Cover image</h3>
          <p className="mt-1 text-[13px] leading-normal text-muted-foreground">
            Used on the collection page and featured blocks. Square or landscape works best.
          </p>
        </div>
        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <SingleImageUpload
              image={field.value ?? null}
              onChange={field.onChange}
              label="Cover"
            />
          )}
        />
      </section>

      <section className="product-editor-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                featured
                  ? "bg-[#007AFF]/12 text-[#007AFF]"
                  : "bg-neutral-500/10 text-muted-foreground"
              )}
            >
              <Star className={cn("h-4 w-4", featured && "fill-current")} />
            </span>
            <div className="min-w-0">
              <Label htmlFor="featured" className="text-[14px] font-medium text-foreground">
                Feature on homepage
              </Label>
              <p className="mt-1 text-[12px] leading-normal text-muted-foreground">
                Highlight this collection in your storefront featured section.
              </p>
            </div>
          </div>
          <Controller
            name="featured"
            control={control}
            render={({ field }) => (
              <Switch
                id="featured"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </section>

      <section className="product-editor-card space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">Products</h3>
            <p className="mt-1 text-[13px] leading-normal text-muted-foreground">
              Pick what belongs in this collection. You can change this anytime.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-black/[0.04] px-2.5 py-1 text-[12px] font-medium tabular-nums text-muted-foreground dark:bg-white/[0.06]">
            {productIds.length} selected
          </span>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() =>
                  setValue(
                    "productIds",
                    productIds.filter((id) => id !== product.id),
                    { shouldDirty: true }
                  )
                }
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 py-1 pl-1 pr-2.5 text-left transition hover:border-red-200 hover:bg-red-50/80 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-red-500/10"
                title="Remove from collection"
              >
                <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-muted">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      sizes="24px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <Package className="h-3 w-3 text-muted-foreground" />
                    </span>
                  )}
                </span>
                <span className="truncate text-[12px] font-medium text-foreground">
                  {catalogTitle(product.title, 28)}
                </span>
                <X className="h-3 w-3 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : null}

        <CollectionProductPicker
          products={products}
          value={productIds}
          currency={currency}
          onChange={(ids) => setValue("productIds", ids, { shouldDirty: true })}
        />
      </section>
    </form>
  );
}

function CollectionProductPicker({
  products,
  value,
  currency,
  onChange,
}: {
  products: Product[];
  value: string[];
  currency: string;
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        (p.categoryName ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/[0.08] bg-neutral-50/80 px-4 py-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
          <Layers className="h-4 w-4" />
        </span>
        <p className="mt-3 text-[13px] font-medium text-foreground">No products yet</p>
        <p className="mt-1 text-[12px] leading-normal text-muted-foreground">
          Add products to your catalog first, then come back to build this collection.
        </p>
        <Link
          href="/dashboard/products/new"
          className="mt-4 inline-flex text-[13px] font-medium text-[#007AFF] hover:underline"
        >
          Add a product
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/60 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="border-b border-black/[0.05] p-3 dark:border-white/10">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or category…"
            className="h-10 w-full rounded-xl border border-black/[0.07] bg-white/90 pl-9 pr-3 text-sm outline-none transition focus:border-[#007AFF]/35 focus:ring-2 focus:ring-[#007AFF]/15 dark:border-white/10 dark:bg-white/[0.04]"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
            No products match your search.
          </p>
        ) : (
          <ul className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
            {filtered.map((product) => {
              const selected = value.includes(product.id);
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => toggle(product.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors",
                      selected
                        ? "bg-[#007AFF]/[0.06]"
                        : "hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-muted dark:border-white/10">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-foreground">
                        {catalogTitle(product.title)}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] leading-normal text-muted-foreground">
                        {[
                          formatCurrency(product.price, currency),
                          product.sku,
                          product.categoryName,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                        selected
                          ? "border-[#007AFF] bg-[#007AFF] text-white"
                          : "border-black/[0.12] bg-white text-transparent dark:border-white/20 dark:bg-white/[0.04]"
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
