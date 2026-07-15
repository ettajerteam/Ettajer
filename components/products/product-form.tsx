"use client";

import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { getCurrencySymbol, slugify } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/products/image-upload";
import { VariantEditor } from "@/components/products/variant-editor";
import { TagInput } from "@/components/products/tag-input";
import { ProductCatalogFields } from "@/components/products/product-catalog-fields";
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
}

const defaultValues: ProductFormValues = {
  title: "",
  description: "",
  price: 0,
  comparePrice: null,
  inventory: 0,
  sku: "",
  images: [],
  variants: [],
  tags: [],
  ticketPrinterId: null,
  categoryId: null,
  collectionIds: [],
};

export function ProductForm({ currency, ticketPrinters = [], initialData, onSubmit, formId }: ProductFormProps) {
  const symbol = getCurrencySymbol(currency);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? "",
          price: initialData.price,
          comparePrice: initialData.comparePrice ?? null,
          inventory: initialData.inventory,
          sku: initialData.sku ?? "",
          images: initialData.images,
          variants: initialData.variants,
          tags: initialData.tags,
          ticketPrinterId: initialData.ticketPrinterId ?? null,
          categoryId: initialData.categoryId ?? null,
          collectionIds: initialData.collectionIds ?? [],
        }
      : defaultValues,
  });

  const title = watch("title");
  const slugPreview = slugify(title || "") || "product-slug";

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Basic details</h3>
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
            <RichTextEditor value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
      </div>
      </section>

      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Pricing & inventory</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inventory">Inventory</Label>
          <Input
            id="inventory"
            type="number"
            min="0"
            {...register("inventory", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU (optional)</Label>
          <Input id="sku" placeholder="e.g. BAG-001" {...register("sku")} />
        </div>
      </div>
      </section>

      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Media & variants</h3>
      <div className="space-y-2">
        <Label>Images</Label>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUpload images={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Variants</Label>
        <Controller
          name="variants"
          control={control}
          render={({ field }) => (
            <VariantEditor variants={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagInput tags={field.value} onChange={field.onChange} />
          )}
        />
        <p className="text-xs text-muted-foreground">Separate tags with commas or press Enter</p>
      </div>
      </section>

      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Ticket printer</h3>
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

      <section className="premium-card p-5">
      <ProductCatalogFields
        categoryId={watch("categoryId")}
        collectionIds={watch("collectionIds")}
        onCategoryChange={(id) => setValue("categoryId", id, { shouldDirty: true })}
        onCollectionsChange={(ids) => setValue("collectionIds", ids, { shouldDirty: true })}
      />
      </section>
    </form>
  );
}
