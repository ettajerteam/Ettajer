"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DETAIL_PRESETS } from "@/lib/product-details";
import type { ProductDetail } from "@/types";

interface ProductDetailsEditorProps {
  details: ProductDetail[];
  onChange: (details: ProductDetail[]) => void;
}

export function ProductDetailsEditor({ details, onChange }: ProductDetailsEditorProps) {
  const usedLabels = new Set(details.map((d) => d.label.toLowerCase()));

  const addRow = (label = "") => {
    onChange([...details, { id: crypto.randomUUID(), label, value: "" }]);
  };

  const updateRow = (id: string, patch: Partial<Pick<ProductDetail, "label" | "value">>) => {
    onChange(details.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeRow = (id: string) => {
    onChange(details.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {DETAIL_PRESETS.filter((preset) => !usedLabels.has(preset.toLowerCase())).map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-[#007AFF]/25 text-[#007AFF] hover:bg-[#007AFF]/5"
            onClick={() => addRow(preset)}
          >
            + {preset}
          </Button>
        ))}
      </div>

      {details.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/80 px-4 py-6 text-center text-sm text-muted-foreground">
          Add specs customers care about — brand, material, weight, care instructions.
        </p>
      ) : (
        <div className="space-y-3">
          {details.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-muted/15 p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_auto]"
            >
              <div className="space-y-1.5">
                {index === 0 ? (
                  <Label className="text-xs text-muted-foreground">Label</Label>
                ) : null}
                <Input
                  value={row.label}
                  placeholder="e.g. Material"
                  onChange={(e) => updateRow(row.id, { label: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                {index === 0 ? (
                  <Label className="text-xs text-muted-foreground">Value</Label>
                ) : null}
                <Input
                  value={row.value}
                  placeholder="e.g. Genuine leather"
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                />
              </div>
              <div className={index === 0 ? "flex items-end" : "flex items-center"}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove detail"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-[#007AFF]"
        onClick={() => addRow()}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add custom detail
      </Button>
    </div>
  );
}
