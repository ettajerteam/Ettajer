"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, RotateCcw, Palette, Type, ImageIcon, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STORE_FONTS, THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import { getColorSchemesForTheme, findMatchingScheme } from "@/lib/theme-color-schemes";
import { getTemplateDefaults } from "@/lib/theme-utils";
import { DEFAULT_DESIGN_TOKENS } from "@/lib/design-tokens";
import { dashboardCard, dashboardCardPad, dashboardKicker } from "@/lib/dashboard-ui";
import type { StoreThemeSettings } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface ThemeCustomizerProps {
  draft: StoreThemeSettings;
  selectedTemplate: ThemeId;
  onChange: (updates: Partial<StoreThemeSettings>) => void;
  embedded?: boolean;
  sections?: ("brand" | "colors" | "typography" | "surface")[];
}

const RADIUS_PRESETS = [
  { value: "0", label: "Sharp" },
  { value: "0.375rem", label: "Soft" },
  { value: "0.75rem", label: "Rounded" },
  { value: "9999px", label: "Pill" },
];

export function ThemeCustomizer({
  draft,
  selectedTemplate,
  onChange,
  embedded = false,
  sections,
}: ThemeCustomizerProps) {
  const [uploading, setUploading] = useState(false);
  const idPrefix = useId().replace(/:/g, "");
  const fid = (name: string) => `${idPrefix}-${name}`;

  const primaryColor = draft.primaryColor ?? "#007AFF";
  const secondaryColor = draft.secondaryColor ?? "#FFFFFF";
  const font = draft.font ?? "Inter";
  const logo = draft.logo ?? null;
  const textColor = draft.textColor ?? DEFAULT_DESIGN_TOKENS.textColor;
  const mutedColor = draft.mutedColor ?? DEFAULT_DESIGN_TOKENS.mutedColor;
  const borderColor = draft.borderColor ?? DEFAULT_DESIGN_TOKENS.borderColor;
  const buttonRadius = draft.buttonRadius ?? DEFAULT_DESIGN_TOKENS.buttonRadius;
  const template = THEME_TEMPLATES.find((t) => t.id === selectedTemplate);
  const colorSchemes = getColorSchemesForTheme(selectedTemplate);
  const activeScheme = findMatchingScheme(selectedTemplate, primaryColor, secondaryColor);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message ?? "Upload failed");

      onChange({ logo: uploadData.urls[0] });
      toast.success("Logo added to preview");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetToTemplateDefaults = () => {
    const defaults = getTemplateDefaults(selectedTemplate);
    onChange({
      ...defaults,
      textColor: DEFAULT_DESIGN_TOKENS.textColor,
      mutedColor: DEFAULT_DESIGN_TOKENS.mutedColor,
      borderColor: DEFAULT_DESIGN_TOKENS.borderColor,
      buttonRadius: DEFAULT_DESIGN_TOKENS.buttonRadius,
    });
    toast.message("Reset to template defaults");
  };

  const showBrand = !sections || sections.includes("brand");
  const showColors = !sections || sections.includes("colors");
  const showTypography = !sections || sections.includes("typography");
  const showSurface = !sections || sections.includes("surface");
  const showTabs = sections == null;

  const brandContent = (
    <div className="space-y-3">
      <Label>Store logo</Label>
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {logo ? (
            <Image src={logo} alt="Store logo" fill className="object-cover" />
          ) : uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
            <span className="inline-flex items-center justify-center rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
              {uploading ? "Uploading…" : logo ? "Replace logo" : "Upload logo"}
            </span>
          </label>
          {logo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-destructive"
              onClick={() => onChange({ logo: null })}
            >
              Remove logo
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Recommended: square PNG or SVG, at least 200×200px.
      </p>
    </div>
  );

  const colorsContent = (
    <>
      <div className="space-y-3">
        <Label className={dashboardKicker}>Color schemes</Label>
        <div className="grid grid-cols-2 gap-2">
          {colorSchemes.map((scheme) => {
            const active = activeScheme?.id === scheme.id;
            return (
              <button
                key={scheme.id}
                type="button"
                onClick={() =>
                  onChange({
                    primaryColor: scheme.primary,
                    secondaryColor: scheme.secondary,
                  })
                }
                className={cn(
                  "rounded-xl border p-3 text-left transition-all duration-200",
                  active
                    ? "border-[#007AFF] bg-[#007AFF]/5 ring-2 ring-[#007AFF]/30 ring-offset-1"
                    : "hover:bg-accent/50"
                )}
              >
                <div className="flex gap-2">
                  <span
                    className="h-7 w-7 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: scheme.primary }}
                  />
                  <span
                    className="h-7 w-7 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: scheme.secondary }}
                  />
                </div>
                <p className="mt-2 text-sm font-medium">{scheme.name}</p>
                {scheme.description && (
                  <p className="text-[11px] text-muted-foreground">{scheme.description}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={fid("primaryColor")}>Accent</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={fid("primaryColor")}
              name="primaryColor"
              autoComplete="off"
              value={primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border shadow-sm"
            />
            <Input
              id={fid("primaryColor-hex")}
              name="primaryColorHex"
              autoComplete="off"
              value={primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="font-mono text-xs"
              aria-label="Accent color hex"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={fid("secondaryColor")}>Page background</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={fid("secondaryColor")}
              name="secondaryColor"
              autoComplete="off"
              value={secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border shadow-sm"
            />
            <Input
              id={fid("secondaryColor-hex")}
              name="secondaryColorHex"
              autoComplete="off"
              value={secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="font-mono text-xs"
              aria-label="Page background hex"
            />
          </div>
        </div>
      </div>

      {template && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Template palette</Label>
          <button
            type="button"
            onClick={() =>
              onChange({
                primaryColor: template.defaultPrimary,
                secondaryColor: template.defaultSecondary,
              })
            }
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors hover:bg-accent"
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: template.defaultPrimary }}
            />
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: template.defaultSecondary }}
            />
            Use {template.name} defaults
          </button>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={resetToTemplateDefaults} className="gap-1.5 rounded-lg">
        <RotateCcw className="h-3.5 w-3.5" />
        Reset all to template
      </Button>
    </>
  );

  const surfaceContent = (
    <>
      <p className="text-xs text-muted-foreground">
        Text, borders, and button shape used across your storefront.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={fid("textColor")}>Text</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={fid("textColor")}
              name="textColor"
              autoComplete="off"
              value={textColor}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border shadow-sm"
            />
            <Input
              id={fid("textColor-hex")}
              name="textColorHex"
              autoComplete="off"
              value={textColor}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="font-mono text-xs"
              aria-label="Text color hex"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={fid("mutedColor")}>Muted text</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={fid("mutedColor")}
              name="mutedColor"
              autoComplete="off"
              value={mutedColor}
              onChange={(e) => onChange({ mutedColor: e.target.value })}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border shadow-sm"
            />
            <Input
              id={fid("mutedColor-hex")}
              name="mutedColorHex"
              autoComplete="off"
              value={mutedColor}
              onChange={(e) => onChange({ mutedColor: e.target.value })}
              className="font-mono text-xs"
              aria-label="Muted text color hex"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={fid("borderColor")}>Borders</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={fid("borderColor")}
              name="borderColor"
              autoComplete="off"
              value={borderColor}
              onChange={(e) => onChange({ borderColor: e.target.value })}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border shadow-sm"
            />
            <Input
              id={fid("borderColor-hex")}
              name="borderColorHex"
              autoComplete="off"
              value={borderColor}
              onChange={(e) => onChange({ borderColor: e.target.value })}
              className="font-mono text-xs"
              aria-label="Border color hex"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label className={dashboardKicker}>Button corners</Label>
        <div className="grid grid-cols-4 gap-2">
          {RADIUS_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange({ buttonRadius: preset.value })}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-medium transition-all",
                buttonRadius === preset.value
                  ? "border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]"
                  : "hover:bg-accent/50"
              )}
            >
              <span
                className="h-6 w-10 border-2 border-current bg-current/10"
                style={{ borderRadius: preset.value, color: primaryColor }}
              />
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const typographyContent = (
    <>
      <Label className={dashboardKicker}>Font family</Label>
      <div className="grid gap-2">
        {STORE_FONTS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange({ font: f.value })}
            className={cn(
              "flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all duration-200",
              font === f.value
                ? "border-[#007AFF] bg-[#007AFF]/5 ring-2 ring-[#007AFF]/30 ring-offset-1"
                : "hover:bg-accent/50"
            )}
          >
            <span className="text-sm font-medium">{f.label}</span>
            <span
              className="text-base leading-snug text-neutral-600"
              style={{ fontFamily: f.value }}
            >
              The quick brown fox jumps over the lazy dog
            </span>
          </button>
        ))}
      </div>
    </>
  );

  if (!showTabs) {
    return (
      <section className={embedded ? "block space-y-4" : dashboardCard}>
        {showBrand && brandContent}
        {showColors && colorsContent}
        {showSurface && surfaceContent}
        {showTypography && typographyContent}
      </section>
    );
  }

  return (
    <section className={embedded ? "block" : dashboardCard}>
      {!embedded && (
        <div className={`${dashboardCardPad} border-b border-border/70`}>
          <h3 className="text-base font-semibold tracking-[-0.02em]">Customize</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Brand, colors, surfaces, and typography. Changes preview instantly.
          </p>
        </div>
      )}

      <Tabs defaultValue="brand" className={embedded ? "p-0" : "p-4 sm:p-5"}>
        <TabsList className="premium-card mb-5 grid h-auto w-full grid-cols-4 gap-1 p-1">
          <TabsTrigger value="brand" className="gap-1 rounded-lg px-1 text-[11px] sm:text-xs">
            <ImageIcon className="h-3.5 w-3.5" />
            Brand
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-1 rounded-lg px-1 text-[11px] sm:text-xs">
            <Palette className="h-3.5 w-3.5" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="surface" className="gap-1 rounded-lg px-1 text-[11px] sm:text-xs">
            <Square className="h-3.5 w-3.5" />
            Surface
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-1 rounded-lg px-1 text-[11px] sm:text-xs">
            <Type className="h-3.5 w-3.5" />
            Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="mt-0 space-y-4">
          {brandContent}
        </TabsContent>

        <TabsContent value="colors" className="mt-0 space-y-5">
          {colorsContent}
        </TabsContent>

        <TabsContent value="surface" className="mt-0 space-y-5">
          {surfaceContent}
        </TabsContent>

        <TabsContent value="typography" className="mt-0 space-y-3">
          {typographyContent}
        </TabsContent>
      </Tabs>
    </section>
  );
}
