"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableMultiSelect } from "@/components/catalog/searchable-multi-select";
import {
  DIGITAL_PRODUCT_CATEGORIES,
  PHYSICAL_PRODUCT_CATEGORIES,
} from "@/lib/catalog-defaults";
import type { Category, Collection } from "@/types/catalog";
import { toast } from "sonner";

interface ProductCatalogFieldsProps {
  categoryId: string | null | undefined;
  collectionIds: string[];
  onCategoryChange: (id: string | null) => void;
  onCollectionsChange: (ids: string[]) => void;
  /** Seeds matching default categories when digital / physical / dropshipping. */
  productType?: "physical" | "digital" | "dropshipping" | "service" | string;
  /** Hide collections + keep only category (inline picker). */
  categoryOnly?: boolean;
  required?: boolean;
}

const OTHER_VALUE = "__other__";

const DIGITAL_NAMES = new Set(
  DIGITAL_PRODUCT_CATEGORIES.map((c) => c.name.toLowerCase())
);
const PHYSICAL_NAMES = new Set(
  PHYSICAL_PRODUCT_CATEGORIES.map((c) => c.name.toLowerCase())
);

export function ProductCatalogFields({
  categoryId,
  collectionIds,
  onCategoryChange,
  onCollectionsChange,
  productType,
  categoryOnly = false,
  required = false,
}: ProductCatalogFieldsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectValue, setSelectValue] = useState<string>(categoryId ?? "none");
  const [customName, setCustomName] = useState("");
  const [creating, setCreating] = useState(false);
  const isDigital = productType === "digital";
  const isPhysicalLike =
    productType === "physical" || productType === "dropshipping";
  const requiresCategory = required || isDigital || isPhysicalLike;
  const showOtherInput = selectValue === OTHER_VALUE;

  useEffect(() => {
    setSelectValue(categoryId ?? "none");
  }, [categoryId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const categoriesUrl = isDigital
      ? "/api/categories?ensure=digital"
      : isPhysicalLike
        ? "/api/categories?ensure=physical"
        : "/api/categories";

    Promise.all([
      fetch(categoriesUrl).then((r) => r.json()),
      categoryOnly
        ? Promise.resolve({ collections: [] as Collection[] })
        : fetch("/api/collections").then((r) => r.json()),
    ])
      .then(([catData, colData]) => {
        if (cancelled) return;
        if (catData.categories) setCategories(catData.categories);
        if (colData.collections) setCollections(colData.collections);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isDigital, isPhysicalLike, categoryOnly]);

  const sortedCategories = useMemo(() => {
    if (isDigital) {
      return [...categories].sort((a, b) => {
        const aDig = DIGITAL_NAMES.has(a.name.toLowerCase()) ? 0 : 1;
        const bDig = DIGITAL_NAMES.has(b.name.toLowerCase()) ? 0 : 1;
        if (aDig !== bDig) return aDig - bDig;
        return a.name.localeCompare(b.name);
      });
    }
    if (isPhysicalLike) {
      return [...categories].sort((a, b) => {
        const aPhys = PHYSICAL_NAMES.has(a.name.toLowerCase()) ? 0 : 1;
        const bPhys = PHYSICAL_NAMES.has(b.name.toLowerCase()) ? 0 : 1;
        if (aPhys !== bPhys) return aPhys - bPhys;
        return a.name.localeCompare(b.name);
      });
    }
    return categories;
  }, [categories, isDigital, isPhysicalLike]);

  const collectionOptions = collections.map((c) => ({ id: c.id, label: c.name }));

  const handleSelect = (v: string) => {
    setSelectValue(v);
    if (v === OTHER_VALUE) {
      setCustomName("");
      return;
    }
    onCategoryChange(v === "none" ? null : v);
  };

  const createCustomCategory = async () => {
    const name = customName.trim();
    if (!name) {
      toast.error("Type a category name");
      return;
    }

    const existing = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      onCategoryChange(existing.id);
      setSelectValue(existing.id);
      setCustomName("");
      toast.success(`Using existing category “${existing.name}”`);
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status: "active" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not create category");
      const created = data.category as Category;
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      onCategoryChange(created.id);
      setSelectValue(created.id);
      setCustomName("");
      toast.success(`Category “${created.name}” created`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create category");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5 pt-1">
      <div className="space-y-2">
        <Label>
          Category
          {requiresCategory ? <span className="text-destructive"> *</span> : null}
        </Label>
        <Select
          value={selectValue}
          onValueChange={handleSelect}
          disabled={loading || creating}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loading
                  ? "Loading..."
                  : isDigital
                    ? "Select digital category"
                    : isPhysicalLike
                      ? "Select product category"
                      : "Select category"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {!requiresCategory ? (
              <SelectItem value="none">No category</SelectItem>
            ) : null}
            {requiresCategory && selectValue === "none" ? (
              <SelectItem value="none" disabled>
                Select a category
              </SelectItem>
            ) : null}
            {sortedCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            <SelectItem value={OTHER_VALUE}>Other…</SelectItem>
          </SelectContent>
        </Select>

        {showOtherInput ? (
          <div className="flex flex-col gap-2 rounded-xl border border-black/[0.06] bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Type your category name"
              className="h-9 rounded-lg"
              disabled={creating}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void createCustomCategory();
                }
              }}
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              className="product-editor-btn-soft-primary h-9 shrink-0"
              loading={creating}
              onClick={() => void createCustomCategory()}
            >
              Add category
            </Button>
          </div>
        ) : null}

        {isDigital ? (
          <p className="text-xs text-muted-foreground">
            Choose a digital category (ebook, course, template…) or Other to type your own.
          </p>
        ) : null}
        {isPhysicalLike ? (
          <p className="text-xs text-muted-foreground">
            Choose a category, or Other to type a custom one.
          </p>
        ) : null}
      </div>

      {!categoryOnly ? (
        <SearchableMultiSelect
          label="Collections"
          options={collectionOptions}
          value={collectionIds}
          onChange={onCollectionsChange}
          placeholder="Search collections..."
          emptyMessage={
            loading
              ? "Loading..."
              : collections.length === 0
                ? "No collections yet"
                : "No match"
          }
        />
      ) : null}
    </div>
  );
}
