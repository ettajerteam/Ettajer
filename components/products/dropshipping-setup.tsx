"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Link2, Package, Sparkles, X, ImageIcon, Tag, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DROPSHIPPING_PROVIDERS,
  type DropshippingProvider,
} from "@/lib/dropshipping/providers";
import { cn } from "@/lib/utils";

export type { DropshippingProvider };

const IMPORT_BEATS = [
  { icon: Link2, title: "Opening the link", tip: "Fetching the supplier page…" },
  { icon: ImageIcon, title: "Collecting photos", tip: "Grabbing the best product shots…" },
  { icon: Tag, title: "Reading the price", tip: "Pulling price, SKU, and brand…" },
  { icon: Boxes, title: "Mapping variants", tip: "Color, size, and specs coming in…" },
  { icon: Sparkles, title: "Almost there", tip: "Preparing your product form…" },
];

interface DropshippingSetupProps {
  provider: DropshippingProvider | "";
  url: string;
  onProviderChange: (provider: DropshippingProvider) => void;
  onUrlChange: (url: string) => void;
  onImport: () => void;
  onCreateManually: () => void;
  importing?: boolean;
}

function ImportGeneratingOverlay({
  provider,
  url,
}: {
  provider: DropshippingProvider | "";
  url: string;
}) {
  const [beat, setBeat] = useState(0);
  const [progress, setProgress] = useState(8);
  const label =
    DROPSHIPPING_PROVIDERS.find((p) => p.id === provider)?.label ?? "supplier";
  const current = IMPORT_BEATS[beat] ?? IMPORT_BEATS[0];
  const Icon = current.icon;

  useEffect(() => {
    const beatId = window.setInterval(() => {
      setBeat((s) => (s + 1) % IMPORT_BEATS.length);
    }, 1100);
    const progId = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return 88 + Math.random() * 4;
        return Math.min(92, p + 3 + Math.random() * 6);
      });
    }, 280);
    return () => {
      window.clearInterval(beatId);
      window.clearInterval(progId);
    };
  }, []);

  const cards = useMemo(
    () => Array.from({ length: 4 }, (_, i) => i),
    []
  );

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-b from-white via-[#F7FBFF] to-white px-6 py-10 dark:from-[#141414] dark:via-[#101820] dark:to-[#141414]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-[#007AFF]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-10 h-36 w-36 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#007AFF]/15" />
        <span className="absolute inset-0 animate-[dropship-orbit_2s_linear_infinite] rounded-full border border-dashed border-[#007AFF]/40" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007AFF] text-white shadow-[0_12px_30px_-12px_rgba(0,122,255,0.8)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="max-w-sm space-y-1.5 text-center">
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
          Importing from {label}
        </p>
        <p
          key={beat}
          className="animate-[ettajer-fade-in_0.3s_ease-out] text-[13px] text-muted-foreground"
        >
          {current.tip}
        </p>
        {url ? (
          <p className="truncate text-[11px] text-muted-foreground/70" title={url}>
            {url}
          </p>
        ) : null}
      </div>

      <div className="w-full max-w-xs space-y-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
          <div
            className="h-full rounded-full bg-[#007AFF] transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
          <span>{current.title}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="flex gap-2">
        {cards.map((i) => (
          <div
            key={i}
            className="h-14 w-11 overflow-hidden rounded-xl border border-black/[0.06] bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/5"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="h-full w-full animate-[dropship-shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-br from-[#007AFF]/10 via-transparent to-orange-400/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DropshippingSetup({
  provider,
  url,
  onProviderChange,
  onUrlChange,
  onImport,
  onCreateManually,
  importing,
}: DropshippingSetupProps) {
  return (
    <section className="product-editor-card relative space-y-5 overflow-hidden">
      {importing ? <ImportGeneratingOverlay provider={provider} url={url} /> : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Dropshipping
          </p>
          <h3 className="product-editor-card-title mt-1">Choose supplier</h3>
          <p className="product-editor-card-desc">
            Paste a product link — photos, price, variants, and specs fill in automatically.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {DROPSHIPPING_PROVIDERS.map((p) => {
          const selected = provider === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={importing}
              onClick={() => onProviderChange(p.id)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300",
                "border-black/[0.07] bg-white/60 hover:-translate-y-0.5 hover:border-black/12 hover:bg-white hover:shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]",
                "dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]",
                selected &&
                  "border-[#007AFF]/40 shadow-[0_16px_40px_-24px_rgba(0,122,255,0.45)] ring-2 ring-[#007AFF]/20",
                importing && "pointer-events-none opacity-60"
              )}
            >
              <span
                className={cn(
                  "relative flex h-[96px] items-center justify-center px-5",
                  p.logoBg
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.logo}
                  alt={`${p.label} logo`}
                  className={cn("object-contain", p.logoFrameClass)}
                  style={{ width: "auto", height: "auto", maxHeight: "3rem", maxWidth: "9rem" }}
                />
              </span>
              <span className="space-y-1 border-t border-black/[0.06] bg-white/50 px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold tracking-[-0.01em]">
                    {p.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                      selected
                        ? "border-transparent bg-[#007AFF] text-white"
                        : "border-black/10 text-transparent group-hover:border-black/20 dark:border-white/15"
                    )}
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                </span>
                <span className="block text-[11px] leading-snug text-muted-foreground">
                  {p.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dropship-url">Paste product URL</Label>
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="dropship-url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://www.aliexpress.com/item/…"
            className="h-11 rounded-xl border-black/[0.08] bg-white/80 pl-10 pr-10 dark:border-white/10 dark:bg-white/[0.04]"
            disabled={!provider || importing}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (provider && url.trim()) onImport();
              }
            }}
          />
          {url && !importing ? (
            <button
              type="button"
              onClick={() => onUrlChange("")}
              className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/10"
              aria-label="Clear link"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground">
          New link? Clear and paste another — we replace the old product details on import.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-black/[0.05] pt-4 dark:border-white/10">
        <Button
          type="button"
          className="product-editor-btn-soft-primary h-10 px-5"
          disabled={!provider || !url.trim() || importing}
          onClick={onImport}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {importing ? "Importing…" : "Import product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="product-editor-btn-soft h-10"
          disabled={importing}
          onClick={onCreateManually}
        >
          <Package className="mr-1.5 h-3.5 w-3.5" />
          Create manually
        </Button>
      </div>
    </section>
  );
}
