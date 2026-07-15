"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableMultiSelect } from "@/components/catalog/searchable-multi-select";
import type { Category, Collection } from "@/types/catalog";

interface ProductCatalogFieldsProps {
  categoryId: string | null | undefined;
  collectionIds: string[];
  onCategoryChange: (id: string | null) => void;
  onCollectionsChange: (ids: string[]) => void;
}

export function ProductCatalogFields({
  categoryId,
  collectionIds,
  onCategoryChange,
  onCollectionsChange,
}: ProductCatalogFieldsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/collections").then((r) => r.json()),
    ])
      .then(([catData, colData]) => {
        if (catData.categories) setCategories(catData.categories);
        if (colData.collections) setCollections(colData.collections);
      })
      .finally(() => setLoading(false));
  }, []);

  const collectionOptions = collections.map((c) => ({ id: c.id, label: c.name }));

  return (
    <div className="space-y-5 pt-1">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={categoryId ?? "none"}
          onValueChange={(v) => onCategoryChange(v === "none" ? null : v)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading..." : "Select category"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SearchableMultiSelect
        label="Collections"
        options={collectionOptions}
        value={collectionIds}
        onChange={onCollectionsChange}
        placeholder="Search collections..."
        emptyMessage={loading ? "Loading..." : collections.length === 0 ? "No collections yet" : "No match"}
      />
    </div>
  );
}
