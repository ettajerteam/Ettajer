"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/catalog";
import { cn, slugify } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
    setValue,
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
  const status = watch("status");
  const isActive = status === "active";
  const slugPreview = slugify(name || "") || "category-slug";

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
      <section className="product-editor-card space-y-5">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Category details</h3>
          <p className="mt-1 text-[13px] leading-normal text-muted-foreground">
            Name it the way shoppers browse — Clothing, Electronics, Home…
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-name" className="text-[13px] font-medium">
            Name
          </Label>
          <Input
            id="category-name"
            className="h-11 rounded-xl border-black/[0.08] bg-white/80 text-[15px] dark:border-white/10 dark:bg-white/[0.04]"
            placeholder="e.g. Accessories, Beauty, Footwear"
            autoComplete="off"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-[12px] text-destructive">{errors.name.message}</p>
          ) : (
            <p className="text-[12px] leading-normal text-muted-foreground">
              Store URL:{" "}
              <span className="font-medium text-foreground/80">/categories/{slugPreview}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description" className="text-[13px] font-medium">
            Description
            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="category-description"
            className="min-h-[96px] rounded-xl border-black/[0.08] bg-white/80 text-[14px] leading-relaxed dark:border-white/10 dark:bg-white/[0.04]"
            placeholder="A short line that can appear on the category page."
            rows={3}
            {...register("description")}
          />
        </div>
      </section>

      <section className="product-editor-card space-y-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Cover image</h3>
          <p className="mt-1 text-[13px] leading-normal text-muted-foreground">
            Shown on category pages and navigation. Square or landscape works best.
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
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-neutral-500/10 text-muted-foreground"
              )}
            >
              {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <Label htmlFor="category-active" className="text-[14px] font-medium text-foreground">
                Active on storefront
              </Label>
              <p className="mt-1 text-[12px] leading-normal text-muted-foreground">
                Inactive categories stay hidden from shoppers.
              </p>
            </div>
          </div>
          <Switch
            id="category-active"
            checked={isActive}
            onCheckedChange={(checked) =>
              setValue("status", checked ? "active" : "inactive", { shouldDirty: true })
            }
          />
        </div>
      </section>
    </form>
  );
}
