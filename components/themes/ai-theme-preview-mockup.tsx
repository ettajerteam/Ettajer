"use client";

import { cn } from "@/lib/utils";

type ThemeSection = {
  id?: string;
  type?: string;
  settings?: Record<string, unknown>;
};

type ThemeDocLike = {
  theme?: {
    theme?: string;
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
  };
  templates?: {
    home?: {
      sections?: ThemeSection[];
    };
  };
};

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (full.length !== 6) return null;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const luma = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luma > 0.62;
}

/** Miniature storefront card — mirrors Designs gallery mockups for AI drafts. */
export function AiThemePreviewMockup({
  document,
  storeName,
  className,
}: {
  document?: ThemeDocLike | null;
  storeName?: string;
  className?: string;
}) {
  const primary = document?.theme?.primaryColor?.trim() || "#007AFF";
  const secondary = document?.theme?.secondaryColor?.trim() || "#FFFFFF";
  const font = document?.theme?.font?.trim() || "Inter";
  const sections = document?.templates?.home?.sections ?? [];
  const hero = sections.find((s) => s.type === "hero");
  const hasProducts = sections.some((s) => s.type === "product-grid");
  const hasFeatures = sections.some(
    (s) => s.type === "features" || s.type === "rich-text",
  );
  const hasFooter = sections.some((s) => s.type === "footer");

  const headline = asString(hero?.settings?.headline, storeName || "New season");
  const sub = asString(
    hero?.settings?.subheadline,
    "Premium. Minimal. Ready to publish.",
  );
  const cta = asString(hero?.settings?.ctaLabel, "Shop now");

  const darkHero = !isLight(secondary) || secondary.toLowerCase() === "#000000";
  const heroBg = darkHero ? "#0a0a0a" : secondary;
  const heroFg = darkHero || !isLight(heroBg) ? "#ffffff" : "#111111";

  return (
    <div
      className={cn(
        "relative aspect-[5/4] w-full overflow-hidden bg-[#F5F5F7]",
        className,
      )}
      aria-hidden
    >
      {/* Browser chrome */}
      <div className="absolute inset-x-0 top-0 z-20 flex h-4 items-center gap-1 border-b border-black/[0.06] bg-white/90 px-2 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 h-1.5 flex-1 rounded-full bg-neutral-100" />
      </div>

      <div className="absolute inset-0 top-4 flex flex-col pt-4">
        {/* Nav strip */}
        <div
          className="flex items-center justify-between px-2.5 py-1.5"
          style={{ backgroundColor: secondary }}
        >
          <span
            className="truncate text-[7px] font-semibold tracking-tight"
            style={{ color: isLight(secondary) ? "#111" : "#fff", fontFamily: font }}
          >
            {storeName || "Store"}
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-0.5 w-3 rounded-full opacity-40"
                style={{ backgroundColor: isLight(secondary) ? "#111" : "#fff" }}
              />
            ))}
          </div>
        </div>

        {/* Hero */}
        <div
          className="relative flex flex-[1.15] flex-col justify-end px-2.5 pb-2 pt-3"
          style={{ backgroundColor: heroBg, color: heroFg }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              background: `radial-gradient(ellipse at 70% 20%, ${primary}, transparent 55%)`,
            }}
          />
          <p
            className="relative line-clamp-2 text-[11px] font-semibold leading-[1.1] tracking-tight"
            style={{ fontFamily: font }}
          >
            {headline}
          </p>
          <p className="relative mt-0.5 line-clamp-2 text-[5.5px] leading-snug opacity-70">
            {sub}
          </p>
          <span
            className="relative mt-1.5 inline-flex w-fit rounded-[3px] px-1.5 py-0.5 text-[6px] font-semibold"
            style={{
              backgroundColor: primary,
              color: isLight(primary) ? "#111" : "#fff",
            }}
          >
            {cta}
          </span>
        </div>

        {/* Product strip */}
        {hasProducts ? (
          <div className="grid grid-cols-3 gap-1 bg-white px-2 py-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-[3px]">
                <div
                  className="aspect-square"
                  style={{
                    background: `linear-gradient(145deg, ${primary}${i === 0 ? "33" : "18"}, #e8e8ed)`,
                  }}
                />
                <div className="mt-0.5 h-0.5 w-3/4 rounded-full bg-neutral-200" />
                <div className="mt-0.5 h-0.5 w-1/2 rounded-full bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-white px-2 py-2">
            <div className="h-full w-full rounded-[4px] border border-dashed border-neutral-200 bg-neutral-50" />
          </div>
        )}

        {/* Feature chips */}
        {hasFeatures ? (
          <div className="flex gap-1 bg-white px-2 pb-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-3 flex-1 rounded-[3px] border border-neutral-100"
                style={{
                  background: `linear-gradient(90deg, ${primary}14, transparent)`,
                }}
              />
            ))}
          </div>
        ) : null}

        {/* Footer bar */}
        {hasFooter ? (
          <div
            className="mt-auto h-2.5 border-t border-black/[0.04]"
            style={{ backgroundColor: isLight(secondary) ? "#fafafa" : "#111" }}
          />
        ) : null}
      </div>

      {/* Color swatches */}
      <div className="absolute bottom-1.5 right-1.5 z-20 flex overflow-hidden rounded-full ring-1 ring-black/10 shadow-sm">
        <span className="h-2.5 w-2.5" style={{ backgroundColor: primary }} />
        <span className="h-2.5 w-2.5" style={{ backgroundColor: secondary }} />
      </div>
    </div>
  );
}
