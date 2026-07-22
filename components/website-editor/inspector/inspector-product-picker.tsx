"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EditorPanelListSkeleton } from "@/components/website-editor/editor-skeleton";
import { cn, formatCurrency } from "@/lib/utils";

interface PickerProduct {
  id: string;
  title: string;
  price: number;
  images: string[];
}

interface InspectorProductPickerProps {
  label: string;
  description?: string;
  value: string[];
  onChange: (ids: string[]) => void;
  currency?: string;
}

export function InspectorProductPicker({
  label,
  description,
  value,
  onChange,
  currency = "MAD",
}: InspectorProductPickerProps) {
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = (await res.json()) as {
          products?: Array<{
            id: string;
            title: string;
            price: number;
            images?: string[];
          }>;
        };
        if (cancelled) return;
        setProducts(
          (data.products ?? []).map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            images: Array.isArray(p.images) ? p.images : [],
          }))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.title.toLowerCase().includes(q));
  }, [products, query]);

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs text-neutral-600">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[11px] text-neutral-400">{description}</p>
        ) : null}
      </div>

      {loading ? (
        <EditorPanelListSkeleton rows={4} variant="rows" label="Loading products" />
      ) : error ? (
        <p className="rounded-lg border border-dashed border-red-200 bg-red-50 px-3 py-3 text-xs text-red-600">
          {error}
        </p>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center">
          <Package className="mx-auto mb-2 h-5 w-5 text-neutral-300" />
          <p className="text-xs font-medium text-neutral-600">No products yet</p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Add products in Products. Preview shows samples until then — they never publish.
          </p>
        </div>
      ) : (
        <>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-8 rounded-lg text-xs"
          />
          <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-[11px] text-neutral-400">No matches</p>
            ) : (
              filtered.map((product) => {
                const selected = value.includes(product.id);
                const thumb = product.images[0];
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggle(product.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                      selected
                        ? "bg-[#007AFF]/10 ring-1 ring-[#007AFF]/25"
                        : "hover:bg-neutral-50"
                    )}
                  >
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      {thumb ? (
                        <Image src={thumb} alt="" fill className="object-cover" sizes="32px" />
                      ) : (
                        <Package className="m-1.5 h-5 w-5 text-neutral-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-neutral-800">{product.title}</p>
                      <p className="text-[10px] text-neutral-400">
                        {formatCurrency(product.price, currency)}
                      </p>
                    </div>
                    {selected ? <Check className="h-3.5 w-3.5 shrink-0 text-[#007AFF]" /> : null}
                  </button>
                );
              })
            )}
          </div>
          {value.length > 0 ? (
            <p className="text-[11px] text-neutral-400">{value.length} selected</p>
          ) : null}
        </>
      )}
    </div>
  );
}
