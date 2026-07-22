"use client";

import { Plus, Trash2, Palette, Ruler, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductVariant } from "@/types";

interface VariantEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const PRESETS = [
  { name: "Color", icon: Palette, placeholder: "e.g. Red, Blue, Black" },
  { name: "Size", icon: Ruler, placeholder: "e.g. S, M, L, XL" },
  { name: "Material", icon: Tag, placeholder: "e.g. Cotton, Leather" },
  { name: "Style", icon: Tag, placeholder: "e.g. Classic, Sport" },
] as const;

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const hasVariant = (name: string) =>
    variants.some((v) => v.name.trim().toLowerCase() === name.toLowerCase());

  const addPreset = (name: string) => {
    if (hasVariant(name)) return;
    onChange([...variants, { id: crypto.randomUUID(), name, options: [""] }]);
  };

  const addCustom = () => {
    onChange([
      ...variants,
      { id: crypto.randomUUID(), name: "", options: [""] },
    ]);
  };

  const removeVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  const updateName = (id: string, name: string) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, name } : v)));
  };

  const addOption = (variantId: string) => {
    onChange(
      variants.map((v) =>
        v.id === variantId ? { ...v, options: [...v.options, ""] } : v
      )
    );
  };

  const updateOption = (variantId: string, index: number, value: string) => {
    onChange(
      variants.map((v) =>
        v.id === variantId
          ? { ...v, options: v.options.map((o, i) => (i === index ? value : o)) }
          : v
      )
    );
  };

  const removeOption = (variantId: string, index: number) => {
    onChange(
      variants.map((v) =>
        v.id === variantId
          ? { ...v, options: v.options.filter((_, i) => i !== index) }
          : v
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <Button
              key={preset.name}
              type="button"
              variant="outline"
              size="sm"
              disabled={hasVariant(preset.name)}
              onClick={() => addPreset(preset.name)}
              className="border-[#007AFF]/30 text-[#007AFF]"
            >
              <Icon className="mr-1 h-3.5 w-3.5" />
              {preset.name}
            </Button>
          );
        })}
        <Button type="button" variant="outline" size="sm" onClick={addCustom}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Custom option
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          Add color, size, material, or any custom option customers can pick.
        </p>
      )}

      {variants.map((variant) => {
        const preset = PRESETS.find(
          (p) => p.name.toLowerCase() === variant.name.trim().toLowerCase()
        );
        const Icon = preset?.icon ?? Tag;

        return (
          <div key={variant.id} className="space-y-3 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-[#007AFF]" />
                <Input
                  value={variant.name}
                  onChange={(e) => updateName(variant.id, e.target.value)}
                  placeholder="Option name (e.g. Capacity)"
                  className="h-9 max-w-xs font-medium"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeVariant(variant.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Values</Label>
              {variant.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={preset?.placeholder ?? "e.g. Value"}
                    value={option}
                    onChange={(e) => updateOption(variant.id, index, e.target.value)}
                  />
                  {variant.options.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(variant.id, index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[#007AFF]"
                onClick={() => addOption(variant.id)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add value
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
