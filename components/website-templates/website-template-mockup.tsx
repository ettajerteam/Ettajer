"use client";

import type { WebsiteTemplateId } from "@/lib/website-templates/types";
import { cn } from "@/lib/utils";

export const TEMPLATE_MOCKUP: Record<
  WebsiteTemplateId,
  {
    accent: string;
    canvas: string;
    surface: string;
    text: string;
    muted: string;
    heroTitle: string;
    heroSub: string;
    heroBg: string;
    productGrad: (i: number) => string;
    ctaLabel: string;
    ctaBg: string;
    ctaFg: string;
    fontClass: string;
    mood: string;
    brand: string;
  }
> = {
  aura: {
    accent: "#ffffff",
    canvas: "#0a0a0a",
    surface: "#fafaf9",
    text: "#ffffff",
    muted: "#a8a29e",
    heroTitle: "Winter Lookbook 26",
    heroSub: "Atelier standard · archive capsules · full storefront",
    heroBg: "#171717",
    productGrad: (i) => `linear-gradient(160deg, #292524 ${i * 8}%, #78716c)`,
    ctaLabel: "Shop the collection",
    ctaBg: "#ffffff",
    ctaFg: "#0a0a0a",
    fontClass: "font-serif",
    mood: "Premium Editorial",
    brand: "AURA",
  },
  tech: {
    accent: "#2563eb",
    canvas: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
    heroTitle: "Hot Gadgets Deals",
    heroSub: "Up to 25% off — Orion Elite Pro spatial audio",
    heroBg: "linear-gradient(135deg, #eff6ff, #f8fafc)",
    productGrad: (i) => `linear-gradient(145deg, #dbeafe ${i * 12}%, #93c5fd)`,
    ctaLabel: "Shop now",
    ctaBg: "#2563eb",
    ctaFg: "#ffffff",
    fontClass: "font-sans",
    mood: "Tech · Gadgets",
    brand: "TechNova",
  },
  paper: {
    accent: "#171717",
    canvas: "#fafafa",
    surface: "#ffffff",
    text: "#171717",
    muted: "#78716c",
    heroTitle: "Welcome to your store",
    heroSub: "Curated essentials for modern living",
    heroBg: "#f5f5f4",
    productGrad: (i) => `linear-gradient(145deg, #e7e5e4 ${i * 10}%, #a8a29e)`,
    ctaLabel: "Shop all",
    ctaBg: "#171717",
    ctaFg: "#ffffff",
    fontClass: "font-sans",
    mood: "Minimal · Essentials",
    brand: "Paper",
  },
};

interface WebsiteTemplateMockupProps {
  templateId: WebsiteTemplateId;
  compact?: boolean;
  className?: string;
}

export function WebsiteTemplateMockup({
  templateId,
  compact = false,
  className,
}: WebsiteTemplateMockupProps) {
  const look = TEMPLATE_MOCKUP[templateId];

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        compact ? "aspect-[16/10]" : "aspect-[16/11]",
        className,
      )}
      style={{ backgroundColor: look.canvas }}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1 border-b border-black/10 bg-white/90 px-2 py-1.5 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
        <span className="ml-1.5 h-3 flex-1 rounded bg-neutral-100" />
      </div>

      <div className={cn("absolute inset-0", compact ? "pt-6" : "pt-8")}>
        <div
          className="flex items-center justify-between px-2.5 py-1.5"
          style={{ color: look.text }}
        >
          <span className={cn("text-[9px] font-bold tracking-wide", look.fontClass)}>
            {look.brand}
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[7px] font-semibold"
            style={{ backgroundColor: look.ctaBg, color: look.ctaFg }}
          >
            Cart
          </span>
        </div>

        <div
          className={cn("mx-2 overflow-hidden rounded-lg px-2.5", compact ? "py-3" : "py-5")}
          style={{ background: look.heroBg }}
        >
          <p
            className={cn(
              "font-semibold leading-tight tracking-tight",
              look.fontClass,
              compact ? "text-[11px]" : "text-sm",
            )}
            style={{ color: look.text }}
          >
            {look.heroTitle}
          </p>
          {!compact ? (
            <p className="mt-1 text-[9px] leading-relaxed" style={{ color: look.muted }}>
              {look.heroSub}
            </p>
          ) : null}
          <div
            className="mt-2 inline-flex rounded px-2 py-1 text-[7px] font-semibold"
            style={{ backgroundColor: look.ctaBg, color: look.ctaFg }}
          >
            {look.ctaLabel}
          </div>
        </div>

        <div className={cn("mt-2 grid grid-cols-3 gap-1 px-2", compact && "mt-1.5")}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded"
              style={{ backgroundColor: look.surface }}
            >
              <div className="aspect-square" style={{ background: look.productGrad(i) }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
