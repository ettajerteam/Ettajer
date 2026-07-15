"use client";

import { Plus, Trash2, Palette, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductVariant } from "@/types";

interface VariantEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const PRESETS = {
  Color: {
    icon: Palette,
    placeholder: "e.g. Red, Blue, Black",
    defaultOptions: [""],
  },
  Size: {
    icon: Ruler,
    placeholder: "e.g. S, M, L, XL",
    defaultOptions: [""],
  },
} as const;

type PresetName = keyof typeof PRESETS;

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const hasVariant = (name: PresetName) =>
    variants.some((v) => v.name.toLowerCase() === name.toLowerCase());

  const addVariant = (name: PresetName) => {
    if (hasVariant(name)) return;
    onChange([
      ...variants,
      { id: crypto.randomUUID(), name, options: [...PRESETS[name].defaultOptions] },
    ]);
  };

  const removeVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={hasVariant("Color")}
          onClick={() => addVariant("Color")}
          className="text-[#007AFF] border-[#007AFF]/30"
        >
          <Palette className="h-3.5 w-3.5 mr-1" />
          Add Color
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={hasVariant("Size")}
          onClick={() => addVariant("Size")}
          className="text-[#007AFF] border-[#007AFF]/30"
        >
          <Ruler className="h-3.5 w-3.5 mr-1" />
          Add Size
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-4 text-center">
          Add color and size options for products with variants.
        </p>
      )}

      {variants.map((variant) => {
        const preset = PRESETS[variant.name as PresetName];
        const Icon = preset?.icon;

        return (
          <div
            key={variant.id}
            className="rounded-xl border bg-muted/20 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-[#007AFF]" />}
                <span className="font-medium text-sm">{variant.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeVariant(variant.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Options</Label>
              {variant.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={preset?.placeholder ?? "Option value"}
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
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add {variant.name.toLowerCase()} option
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
