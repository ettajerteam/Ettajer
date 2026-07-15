"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collectionSchema, type CollectionFormValues } from "@/lib/validations/catalog";
import { slugify } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SingleImageUpload } from "@/components/catalog/single-image-upload";
import { SearchableMultiSelect } from "@/components/catalog/searchable-multi-select";
import type { Collection } from "@/types/catalog";
import type { Product } from "@/types";

interface CollectionFormProps {
  initialData?: Collection;
  products: Product[];
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

export function CollectionForm({
  initialData,
  products,
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
  const productIds = watch("productIds");
  const slugPreview = slugify(name || "") || "collection-slug";

  const productOptions = products.map((p) => ({ id: p.id, label: p.title }));

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Basic details</h3>
        <div className="space-y-2">
          <Label htmlFor="collection-name">Name *</Label>
          <Input
            id="collection-name"
            className="rounded-xl"
            placeholder="e.g. Summer Sale"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          <p className="text-xs text-muted-foreground">
            URL slug: <span className="font-mono text-foreground/70">{slugPreview}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-description">Description</Label>
          <Textarea
            id="collection-description"
            className="rounded-xl"
            placeholder="Optional description"
            rows={3}
            {...register("description")}
          />
        </div>
      </section>

      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Cover image</h3>
        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <SingleImageUpload image={field.value ?? null} onChange={field.onChange} />
          )}
        />
      </section>

      <section className="premium-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="featured">Featured on homepage</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Show this collection on your store homepage
            </p>
          </div>
          <Controller
            name="featured"
            control={control}
            render={({ field }) => (
              <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </section>

      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Products</h3>
        <SearchableMultiSelect
          label="Products"
          options={productOptions}
          value={productIds}
          onChange={(ids) => setValue("productIds", ids, { shouldDirty: true })}
          placeholder="Search products..."
          emptyMessage={products.length === 0 ? "No products yet" : "No products match"}
        />
      </section>
    </form>
  );
}
