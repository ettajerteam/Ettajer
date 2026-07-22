"use client";

import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { PRODUCT_TYPE_OPTIONS, productTracksInventory } from "@/lib/product-types";
import { getCurrencySymbol, slugify, cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/products/image-upload";
import { VariantEditor } from "@/components/products/variant-editor";
import { TagInput } from "@/components/products/tag-input";
import { ReviewsEditor } from "@/components/products/reviews-editor";
import { ProductCatalogFields } from "@/components/products/product-catalog-fields";
import { ProductDetailsEditor } from "@/components/products/product-details-editor";
import type { Product } from "@/types";
import type { TicketPrinter } from "@/lib/ticket-printers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RichTextEditor = dynamic(
  () => import("@/components/products/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="premium-skeleton h-[160px] animate-pulse" />,
  }
);

interface ProductFormProps {
  currency: string;
  ticketPrinters?: TicketPrinter[];
  initialData?: Product;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  formId: string;
  layout?: "sheet" | "page";
}

const defaultValues: ProductFormValues = {
  title: "",
  description: "",
  price: 0,
  comparePrice: null,
  costPrice: null,
  inventory: 0,
  sku: "",
  barcode: "",
  status: "draft",
  productType: "physical",
  copyrightOwner: "",
  copyrightNotice: "",
  images: [],
  variants: [],
  details: [],
  reviews: [],
  tags: [],
  ticketPrinterId: null,
  categoryId: null,
  collectionIds: [],
};

function toFormValues(product: Product): ProductFormValues {
  return {
    title: product.title,
    description: product.description ?? "",
    price: product.price,
    comparePrice: product.comparePrice ?? null,
    costPrice: product.costPrice ?? null,
    inventory: product.inventory,
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    status: product.status,
    productType: product.productType,
    copyrightOwner: product.copyrightOwner ?? "",
    copyrightNotice: product.copyrightNotice ?? "",
    images: product.imageAssets?.length
      ? product.imageAssets
      : product.images.map((url) => ({ url })),
    variants: product.variants,
    details: product.details ?? [],
    reviews: product.reviews ?? [],
    tags: product.tags,
    ticketPrinterId: product.ticketPrinterId ?? null,
    categoryId: product.categoryId ?? null,
    collectionIds: product.collectionIds ?? [],
  };
}

export function ProductForm({
  currency,
  ticketPrinters = [],
  initialData,
  onSubmit,
  formId,
  layout = "sheet",
}: ProductFormProps) {
  const symbol = getCurrencySymbol(currency);
  const isPage = layout === "page";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? toFormValues(initialData) : defaultValues,
  });

  const title = watch("title");
  const price = watch("price");
  const costPrice = watch("costPrice");
  const productType = watch("productType");
  const showInventory = productTracksInventory(productType);
  const slugPreview = slugify(title || "") || "product-slug";
  const margin =
    typeof costPrice === "number" && costPrice > 0 && typeof price === "number" && price > 0
      ? Math.round(((price - costPrice) / price) * 1000) / 10
      : null;

  const mainColumn = (
    <>
      <section className="premium-card space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
            Product type
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose how this product is fulfilled.
          </p>
        </div>
        <Controller
          name="productType"
          control={control}
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {PRODUCT_TYPE_OPTIONS.map((option) => {
                const selected = field.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition",
                      selected
                        ? "border-[#007AFF] bg-[#007AFF]/5 ring-1 ring-[#007AFF]/30"
                        : "border-border hover:border-neutral-300 hover:bg-muted/40"
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        />
      </section>

      <section className="premium-card space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
            Basic details
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Name and description customers see on your storefront.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Product name *</Label>
          <Input
            id="title"
            placeholder="e.g. Handmade Leather Bag"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            URL slug: <span className="font-mono text-foreground/70">{slugPreview}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Tell customers what’s special — materials, fit, what’s included…"
              />
            )}
          />
        </div>
      </section>

      <section className="premium-card space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
            Product details
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Specs shown as a clean list on the product page (brand, material, weight, care…).
          </p>
        </div>
        <Controller
          name="details"
          control={control}
          render={({ field }) => (
            <ProductDetailsEditor details={field.value} onChange={field.onChange} />
          )}
        />
      </section>

      <section className="premium-card space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Media</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            First image is the cover. We store width × height and file size for each photo.
          </p>
        </div>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUpload images={field.value} onChange={field.onChange} />
          )}
        />
      </section>

      <section className="premium-card space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
            Variants
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Available on every product type — color, size, or any custom option.
          </p>
        </div>
        <Controller
          name="variants"
          control={control}
          render={({ field }) => (
            <VariantEditor variants={field.value} onChange={field.onChange} />
          )}
        />
      </section>

      <section className="premium-card space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
            Copyright
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Protect photos and product content shown on your store.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="copyrightOwner">Copyright owner</Label>
          <Input
            id="copyrightOwner"
            placeholder="e.g. Your store name or brand"
            {...register("copyrightOwner")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="copyrightNotice">Copyright notice</Label>
          <Textarea
            id="copyrightNotice"
            rows={3}
            placeholder="© 2026 Your Brand. All rights reserved. Images may not be reused without permission."
            {...register("copyrightNotice")}
          />
        </div>
      </section>

      <section className="premium-card space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
            Customer reviews
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            These appear on the product page. Leave empty until you have real feedback.
          </p>
        </div>
        <Controller
          name="reviews"
          control={control}
          render={({ field }) => (
            <ReviewsEditor
              reviews={field.value.map((r) => ({
                ...r,
                location: r.location || undefined,
              }))}
              onChange={field.onChange}
            />
          )}
        />
      </section>
    </>
  );

  const sideColumn = (
    <>
      <section className="premium-card space-y-4 p-5 sm:p-6">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
          Pricing{showInventory ? " & inventory" : ""}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="space-y-2">
            <Label htmlFor="price">Price * ({currency})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className="pl-10"
                {...register("price", { valueAsNumber: true })}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comparePrice">Compare-at price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Original price"
                className="pl-10"
                {...register("comparePrice", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" || isNaN(v) ? null : v),
                })}
              />
            </div>
            <p className="text-xs text-muted-foreground">Shows as a strikethrough sale price.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost per item</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Your cost"
                className="pl-10"
                {...register("costPrice", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" || isNaN(v) ? null : v),
                })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Private — not shown to customers
              {margin != null ? ` · ~${margin}% margin` : ""}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {showInventory ? (
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                {...register("inventory", { valueAsNumber: true })}
              />
            </div>
          ) : (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {productType === "digital"
                ? "Digital products don’t use warehouse stock."
                : "Services aren’t tracked as physical inventory."}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="e.g. BAG-001" {...register("sku")} />
          </div>

          {showInventory ? (
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" placeholder="EAN / UPC" {...register("barcode")} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="premium-card space-y-4 p-5 sm:p-6">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
          Organization
        </h3>
        <ProductCatalogFields
          categoryId={watch("categoryId")}
          collectionIds={watch("collectionIds")}
          onCategoryChange={(id) => setValue("categoryId", id, { shouldDirty: true })}
          onCollectionsChange={(ids) => setValue("collectionIds", ids, { shouldDirty: true })}
        />
        <div className="space-y-2">
          <Label>Tags</Label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput tags={field.value} onChange={field.onChange} />
            )}
          />
          <p className="text-xs text-muted-foreground">
            Separate tags with commas or press Enter
          </p>
        </div>
      </section>

      <section className="premium-card space-y-4 p-5 sm:p-6">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
          Ticket printer
        </h3>
        <div className="space-y-2">
          <Label>Route to printer</Label>
          <Controller
            name="ticketPrinterId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No printer assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No printer</SelectItem>
                  {ticketPrinters.map((printer) => (
                    <SelectItem key={printer.id} value={printer.id}>
                      {printer.name}
                      {printer.location ? ` · ${printer.location}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            When this product is ordered, its ticket prints to the selected station.
          </p>
        </div>
      </section>
    </>
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={isPage ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start" : "space-y-7"}
    >
      <input type="hidden" {...register("status")} />
      {isPage ? (
        <>
          <div className="space-y-6">{mainColumn}</div>
          <div className="space-y-6 lg:sticky lg:top-4">{sideColumn}</div>
        </>
      ) : (
        <>
          {mainColumn}
          {sideColumn}
        </>
      )}
    </form>
  );
}
