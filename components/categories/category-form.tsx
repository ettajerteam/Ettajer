"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/catalog";
import { slugify } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SingleImageUpload } from "@/components/catalog/single-image-upload";
import type { Category } from "@/types/catalog";

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  formId: string;
}

const defaultValues: CategoryFormValues = {
  name: "",
  description: "",
  image: null,
  status: "active",
};

export function CategoryForm({ initialData, onSubmit, formId }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? "",
          image: initialData.image,
          status: initialData.status,
        }
      : defaultValues,
  });

  const name = watch("name");
  const slugPreview = slugify(name || "") || "category-slug";

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Basic details</h3>
        <div className="space-y-2">
          <Label htmlFor="category-name">Name *</Label>
          <Input
            id="category-name"
            className="rounded-xl"
            placeholder="e.g. Accessories"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          <p className="text-xs text-muted-foreground">
            URL slug: <span className="font-mono text-foreground/70">{slugPreview}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description">Description</Label>
          <Textarea
            id="category-description"
            className="rounded-xl"
            placeholder="Optional description for this category"
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

      <section className="premium-card space-y-4 p-5">
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Visibility</h3>
        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </section>
    </form>
  );
}
