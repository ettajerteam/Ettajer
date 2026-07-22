"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditorControlSkeleton } from "@/components/website-editor/editor-skeleton";

interface CatalogCollection {
  slug: string;
  name: string;
}

interface EditorCollectionPreviewPickerProps {
  value: string;
  onChange: (slug: string) => void;
}

export function EditorCollectionPreviewPicker({
  value,
  onChange,
}: EditorCollectionPreviewPickerProps) {
  const [collections, setCollections] = useState<CatalogCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/collections");
        if (!res.ok) return;
        const data = (await res.json()) as {
          collections?: Array<{ slug: string; name: string }>;
        };
        if (cancelled) return;
        setCollections(
          (data.collections ?? []).filter(
            (c): c is CatalogCollection =>
              typeof c.slug === "string" && typeof c.name === "string"
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

  if (collections.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-3 py-2.5 text-xs text-neutral-600">
        <p className="font-medium text-neutral-800">No collections yet</p>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          Add collections in Dashboard → Collections to preview this template with real data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-neutral-600">Preview collection</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 bg-white text-sm">
          <SelectValue placeholder="Choose a collection" />
        </SelectTrigger>
        <SelectContent>
          {collections.map((collection) => (
            <SelectItem key={collection.slug} value={collection.slug}>
              <span className="inline-flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-neutral-400" />
                {collection.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-neutral-500">Showing live collection data in the preview.</p>
    </div>
  );
}
