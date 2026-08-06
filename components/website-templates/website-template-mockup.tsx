"use client";

import Image from "next/image";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";
import { cn } from "@/lib/utils";

export const TEMPLATE_MOCKUP: Record<
  WebsiteTemplateId,
  {
    mood: string;
    brand: string;
  }
> = {
  aura: { mood: "Premium Editorial", brand: "AURA" },
  tech: { mood: "Tech · Gadgets", brand: "TechNova" },
  paper: { mood: "Minimal · Essentials", brand: "Paper" },
};

const AURA = {
  hero: "/assets/aura-shop-hero-disco.png",
  a: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
  b: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
  c: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
};

const TECH = {
  hero: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  a: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
  b: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80",
  c: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=400&q=80",
};

const PAPER = {
  hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  a: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=70",
  b: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=70",
  c: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=400&q=70",
};

interface WebsiteTemplateMockupProps {
  templateId: WebsiteTemplateId;
  compact?: boolean;
  className?: string;
}

function FillImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 50vw, 280px"
      className={cn("object-cover", className)}
      priority={priority}
      // Prevent Next/Image from painting past the clipped frame
      style={{ maxWidth: "none" }}
    />
  );
}

/** Aura — cinematic dark fashion lookbook */
function AuraMockup({ compact }: { compact: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black text-white">
      <div className="relative h-[62%] overflow-hidden">
        <FillImage src={AURA.hero} alt="Aura lookbook" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <div className={cn("absolute inset-x-0 bottom-0 z-10 px-2.5", compact ? "pb-2" : "pb-3")}>
          <p className="text-[7px] font-semibold uppercase tracking-[0.28em] text-white/90">
            AURA
          </p>
          <p className="mt-0.5 text-[5.5px] font-medium uppercase tracking-[0.2em] text-white/60">
            Winter / 26
          </p>
          <p
            className={cn(
              "mt-1 font-serif font-semibold leading-[1.05] tracking-tight",
              compact ? "text-[13px]" : "text-[17px]"
            )}
          >
            Winter lookbook
          </p>
          <p className="mt-0.5 max-w-[90%] text-[5.5px] leading-snug text-white/55">
            Clean silhouettes. Tactile materials.
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="rounded-sm bg-white px-2 py-0.5 text-[6.5px] font-semibold text-black">
              Shop the collection
            </span>
            {!compact ? (
              <span className="text-[6.5px] text-white/60">Lookbook →</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid h-[38%] grid-cols-3 gap-px overflow-hidden bg-neutral-800">
        {[AURA.a, AURA.b, AURA.c].map((src, i) => (
          <div key={i} className="relative overflow-hidden bg-neutral-900">
            <FillImage src={src} alt={`Aura edit ${i + 1}`} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 pb-1 pt-3">
              <div className="h-0.5 w-6 rounded bg-white/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tech — bright commerce split + deal cards */
function TechMockup({ compact }: { compact: boolean }) {
  const cards = [
    { src: TECH.a, label: "Pulse Watch", price: "899" },
    { src: TECH.b, label: "Orion Pro", price: "1,249" },
    { src: TECH.c, label: "Air Buds", price: "449" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f1f5f9]">
      <div className={cn("space-y-1.5 px-2", compact ? "pt-7" : "pt-8")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#2563eb] text-[6px] font-bold text-white">
              T
            </span>
            <span className="text-[9px] font-bold tracking-tight text-slate-900">TechNova</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-[#2563eb]/10 px-1.5 py-0.5 text-[6px] font-semibold text-[#2563eb]">
              Deals
            </span>
            <span className="rounded-full bg-[#2563eb] px-1.5 py-0.5 text-[6px] font-semibold text-white">
              Cart 2
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80">
          <div className="flex flex-col justify-center gap-1 p-2.5">
            <span className="w-fit rounded-md bg-amber-400/90 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wide text-slate-900">
              −25% today
            </span>
            <p className={cn("font-bold leading-tight text-slate-900", compact ? "text-[11px]" : "text-[13px]")}>
              Hot Gadgets Deals
            </p>
            {!compact ? (
              <p className="text-[7px] leading-snug text-slate-500">
                Orion Elite Pro · spatial audio
              </p>
            ) : null}
            <span className="mt-0.5 inline-flex w-fit rounded-lg bg-[#2563eb] px-2 py-1 text-[7px] font-semibold text-white">
              Shop Premier
            </span>
          </div>
          <div className="relative min-h-[78px] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
            <FillImage src={TECH.hero} alt="Headphones" className="object-contain p-1.5" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {cards.map((card) => (
            <div
              key={card.label}
              className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200/70"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                <FillImage src={card.src} alt={card.label} />
              </div>
              <div className="px-1 py-1">
                <p className="truncate text-[6.5px] font-semibold text-slate-800">{card.label}</p>
                <p className="text-[6.5px] font-bold text-[#2563eb]">{card.price} MAD</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Paper — calm editorial boutique */
function PaperMockup({ compact }: { compact: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f7f6f3] text-neutral-900">
      <div className={cn("flex h-full flex-col", compact ? "pt-6" : "pt-8")}>
        <div className="flex items-center justify-between px-3 pb-1.5">
          <span className="text-[8px] font-semibold uppercase tracking-[0.28em] text-neutral-800">
            Paper
          </span>
          <div className="flex gap-2 text-[6.5px] text-neutral-400">
            <span>Shop</span>
            <span>Journal</span>
            <span>Cart</span>
          </div>
        </div>

        <div className="relative mx-2 overflow-hidden rounded-sm">
          <div className={cn("relative overflow-hidden", compact ? "h-[72px]" : "h-[96px]")}>
            <FillImage src={PAPER.hero} alt="Paper boutique" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center text-white">
              <p className="text-[6px] uppercase tracking-[0.28em] text-white/80">Essentials</p>
              <p
                className={cn(
                  "mt-1 font-medium tracking-[-0.02em]",
                  compact ? "text-[12px]" : "text-[15px]"
                )}
              >
                Edited for everyday
              </p>
              <span className="mt-1.5 border border-white/90 px-2 py-0.5 text-[6.5px] font-medium">
                Shop all
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-1.5 px-2 pb-2 pt-2">
          {[
            { src: PAPER.a, name: "Knit" },
            { src: PAPER.b, name: "Shade" },
            { src: PAPER.c, name: "Shoe" },
          ].map((item) => (
            <div key={item.name} className="min-w-0 text-center">
              <div className="relative aspect-square overflow-hidden bg-white ring-1 ring-black/[0.04]">
                <FillImage src={item.src} alt={item.name} />
              </div>
              <p className="mt-1 truncate text-[6px] font-medium tracking-wide text-neutral-500">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WebsiteTemplateMockup({
  templateId,
  compact = false,
  className,
}: WebsiteTemplateMockupProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[8px] bg-neutral-100",
        compact ? "aspect-[16/10]" : "aspect-[16/11]",
        className
      )}
      style={{
        clipPath: "inset(0 round 8px)",
        WebkitClipPath: "inset(0 round 8px)",
        contain: "paint",
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[8px]">
        <div className="absolute inset-x-0 top-0 z-30 flex items-center gap-1 border-b border-black/[0.06] bg-white px-2 py-1">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5f57]" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#febc2e]" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#28c840]" />
          <span className="ml-1.5 h-2.5 min-w-0 flex-1 rounded-sm bg-neutral-100" />
        </div>

        {templateId === "aura" ? <AuraMockup compact={compact} /> : null}
        {templateId === "tech" ? <TechMockup compact={compact} /> : null}
        {templateId === "paper" ? <PaperMockup compact={compact} /> : null}
      </div>
    </div>
  );
}
