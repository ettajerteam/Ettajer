"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Plus, Trash2, Palette, Ruler, Tag } from "lucide-react";
import { toast } from "sonner";
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
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingUpload = useRef<{ variantId: string; option: string } | null>(null);

  const hasVariant = (name: string) =>
    variants.some((v) => v.name.trim().toLowerCase() === name.toLowerCase());

  const addPreset = (name: string) => {
    if (hasVariant(name)) return;
    onChange([...variants, { id: crypto.randomUUID(), name, options: [""], optionImages: {} }]);
  };

  const addCustom = () => {
    onChange([
      ...variants,
      { id: crypto.randomUUID(), name: "", options: [""], optionImages: {} },
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
      variants.map((v) => {
        if (v.id !== variantId) return v;
        const prev = v.options[index];
        const options = v.options.map((o, i) => (i === index ? value : o));
        const optionImages = { ...(v.optionImages ?? {}) };
        if (prev && optionImages[prev] && prev !== value) {
          optionImages[value] = optionImages[prev];
          delete optionImages[prev];
        }
        return { ...v, options, optionImages };
      })
    );
  };

  const removeOption = (variantId: string, index: number) => {
    onChange(
      variants.map((v) => {
        if (v.id !== variantId) return v;
        const removed = v.options[index];
        const options = v.options.filter((_, i) => i !== index);
        const optionImages = { ...(v.optionImages ?? {}) };
        if (removed) delete optionImages[removed];
        return { ...v, options, optionImages };
      })
    );
  };

  const setOptionImage = (variantId: string, option: string, url: string | null) => {
    onChange(
      variants.map((v) => {
        if (v.id !== variantId) return v;
        const optionImages = { ...(v.optionImages ?? {}) };
        if (!url) delete optionImages[option];
        else optionImages[option] = url;
        return { ...v, optionImages };
      })
    );
  };

  const pickImage = (variantId: string, option: string) => {
    if (!option.trim()) {
      toast.error("Enter the option name first (e.g. Red)");
      return;
    }
    pendingUpload.current = { variantId, option };
    fileRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const pending = pendingUpload.current;
    e.target.value = "";
    if (!file || !pending) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const key = `${pending.variantId}:${pending.option}`;
    setUploadingKey(key);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");
      const url =
        Array.isArray(data.assets) && data.assets[0]?.url
          ? data.assets[0].url
          : Array.isArray(data.urls)
            ? data.urls[0]
            : null;
      if (!url) throw new Error("No image returned");
      setOptionImage(pending.variantId, pending.option, url);
      toast.success("Variant image added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingKey(null);
      pendingUpload.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

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
              <Label className="text-xs text-muted-foreground">
                Values · each can have its own image
              </Label>
              {variant.options.map((option, index) => {
                const img = option.trim()
                  ? variant.optionImages?.[option.trim()] ?? variant.optionImages?.[option]
                  : undefined;
                const uploadKey = `${variant.id}:${option}`;
                const busy = uploadingKey === uploadKey;

                return (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => pickImage(variant.id, option.trim() || option)}
                      className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-black/10 bg-white/70 text-muted-foreground hover:border-[#007AFF]/40 hover:text-[#007AFF] dark:border-white/15 dark:bg-white/5"
                      title="Variant image"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : img ? (
                        <Image src={img} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                    </button>
                    <Input
                      placeholder={preset?.placeholder ?? "e.g. Value"}
                      value={option}
                      onChange={(e) => updateOption(variant.id, index, e.target.value)}
                    />
                    {img ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Remove image"
                        onClick={() => setOptionImage(variant.id, option, null)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
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
                );
              })}
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
