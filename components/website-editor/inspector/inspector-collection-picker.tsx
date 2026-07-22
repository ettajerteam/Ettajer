"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EditorPanelListSkeleton } from "@/components/website-editor/editor-skeleton";
import { cn } from "@/lib/utils";

interface PickerCollection {
  id: string;
  name: string;
  image: string | null;
  featured: boolean;
  productCount: number;
}

interface InspectorCollectionPickerProps {
  label: string;
  description?: string;
  value: string[];
  onChange: (ids: string[]) => void;
}

export function InspectorCollectionPicker({
  label,
  description,
  value,
  onChange,
}: InspectorCollectionPickerProps) {
  const [collections, setCollections] = useState<PickerCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/collections");
        if (!res.ok) throw new Error("Failed to load collections");
        const data = (await res.json()) as {
          collections?: Array<{
            id: string;
            name: string;
            image?: string | null;
            featured?: boolean;
            productCount?: number;
            _count?: { products?: number };
          }>;
        };
        if (cancelled) return;
        setCollections(
          (data.collections ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            image: c.image ?? null,
            featured: Boolean(c.featured),
            productCount: c.productCount ?? c._count?.products ?? 0,
          }))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load collections");
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
    if (!q) return collections;
    return collections.filter((c) => c.name.toLowerCase().includes(q));
  }, [collections, query]);

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
        <EditorPanelListSkeleton rows={4} variant="rows" label="Loading collections" />
      ) : error ? (
        <p className="rounded-lg border border-dashed border-red-200 bg-red-50 px-3 py-3 text-xs text-red-600">
          {error}
        </p>
      ) : collections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center">
          <FolderOpen className="mx-auto mb-2 h-5 w-5 text-neutral-300" />
          <p className="text-xs font-medium text-neutral-600">No collections yet</p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Create collections in Catalog to showcase them here.
          </p>
        </div>
      ) : (
        <>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collections…"
            className="h-8 rounded-lg text-xs"
          />
          <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-[11px] text-neutral-400">No matches</p>
            ) : (
              filtered.map((collection) => {
                const selected = value.includes(collection.id);
                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => toggle(collection.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                      selected
                        ? "bg-[#007AFF]/10 ring-1 ring-[#007AFF]/25"
                        : "hover:bg-neutral-50"
                    )}
                  >
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      {collection.image ? (
                        <Image
                          src={collection.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <FolderOpen className="m-1.5 h-5 w-5 text-neutral-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-neutral-800">
                        {collection.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {collection.productCount} products
                        {collection.featured ? " · Featured" : ""}
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
