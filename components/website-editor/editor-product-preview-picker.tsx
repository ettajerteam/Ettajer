"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditorControlSkeleton } from "@/components/website-editor/editor-skeleton";
import { PREVIEW_PRODUCT_SLUG } from "@/lib/storefront-preview-product";

interface CatalogProduct {
  slug: string;
  title: string;
}

interface EditorProductPreviewPickerProps {
  value: string;
  onChange: (slug: string) => void;
}

export function EditorProductPreviewPicker({
  value,
  onChange,
}: EditorProductPreviewPickerProps) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = (await res.json()) as {
          products?: Array<{ slug: string; title: string }>;
        };
        if (cancelled) return;
        setProducts(
          (data.products ?? []).filter(
            (p): p is CatalogProduct =>
              typeof p.slug === "string" && typeof p.title === "string"
          )
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <EditorControlSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-3 py-2.5 text-xs text-neutral-600">
        <p className="font-medium text-neutral-800">No products yet</p>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          Add products in Dashboard → Products to preview this template with real catalog data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-neutral-600">Preview product</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 bg-white text-sm">
          <SelectValue placeholder="Choose a product" />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.slug} value={product.slug}>
              <span className="inline-flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-neutral-400" />
                {product.title}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === PREVIEW_PRODUCT_SLUG ? null : (
        <p className="text-[11px] text-neutral-500">Showing live catalog data in the preview.</p>
      )}
    </div>
  );
}
