"use client";

import { useMemo, useState } from "react";
import { Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAllTemplates,
  getTemplateHomeLayout,
} from "@/lib/website-templates";
import type { WebsiteTemplate, WebsiteTemplateId } from "@/lib/website-templates/types";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemesWebsiteGalleryProps {
  activeTemplateId: WebsiteTemplateId | null;
  applyingId: WebsiteTemplateId | null;
  onApply: (template: WebsiteTemplate) => void;
}

const MOCKUP: Record<
  WebsiteTemplateId,
  {
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
    mood: string;
    brand: string;
  }
> = {
  aura: {
    canvas: "#0a0a0a",
    surface: "#fafafa",
    text: "#ffffff",
    muted: "#a3a3a3",
    heroTitle: "Refined simplicity",
    heroSub: "Structural lines for the modern store",
    heroBg: "#171717",
    productGrad: (i) => `linear-gradient(145deg, #262626 ${i * 10}%, #525252)`,
    ctaLabel: "Explore",
    ctaBg: "#ffffff",
    ctaFg: "#0a0a0a",
    mood: "Editorial",
    brand: "AURA",
  },
  tech: {
    canvas: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
    heroTitle: "Hot gadget deals",
    heroSub: "Up to 25% off featured products",
    heroBg: "linear-gradient(135deg, #eff6ff, #f8fafc)",
    productGrad: (i) => `linear-gradient(145deg, #dbeafe ${i * 12}%, #93c5fd)`,
    ctaLabel: "Shop now",
    ctaBg: "#2563eb",
    ctaFg: "#ffffff",
    mood: "Tech",
    brand: "TechNova",
  },
  paper: {
    canvas: "#fafafa",
    surface: "#ffffff",
    text: "#171717",
    muted: "#78716c",
    heroTitle: "Welcome to your store",
    heroSub: "Curated essentials for everyday",
    heroBg: "#f5f5f4",
    productGrad: (i) => `linear-gradient(145deg, #e7e5e4 ${i * 10}%, #a8a29e)`,
    ctaLabel: "Shop all",
    ctaBg: "#171717",
    ctaFg: "#ffffff",
    mood: "Minimal",
    brand: "Paper",
  },
};

export function ThemesWebsiteGallery({
  activeTemplateId,
  applyingId,
  onApply,
}: ThemesWebsiteGalleryProps) {
  const templates = getAllTemplates();
  const [preview, setPreview] = useState<WebsiteTemplate | null>(null);
  const [confirm, setConfirm] = useState<WebsiteTemplate | null>(null);

  return (
    <section id="themes-designs" className={cn(dashboardCard, "scroll-mt-24 overflow-hidden")}>
      <div className={cn(dashboardCardPad, "border-b border-neutral-100")}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={dashboardKicker}>Storefront designs</p>
            <h2 className={cn(dashboardTitle, "mt-1 text-lg")}>Choose a starting layout</h2>
            <p className={cn(dashboardSubtitle, "mt-1 max-w-lg")}>
              Apply a full home layout, navigation, and theme. Customize anytime in the editor.
            </p>
          </div>
          <p className="text-xs tabular-nums text-neutral-400">{templates.length} available</p>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
        {templates.map((template) => {
          const isLive = activeTemplateId === template.id;
          const home = getTemplateHomeLayout(template);
          const applying = applyingId === template.id;
          const look = MOCKUP[template.id];

          return (
            <article
              key={template.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-xl border bg-white transition",
                isLive
                  ? "border-neutral-900 ring-1 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-300",
              )}
            >
              <button
                type="button"
                onClick={() => setPreview(template)}
                className="group relative block w-full text-left"
                aria-label={`Preview ${template.name}`}
              >
                <StorefrontMockup look={look} />
                <div className="absolute left-2.5 top-2.5">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-medium text-neutral-600 shadow-sm ring-1 ring-black/5">
                      {look.mood}
                    </span>
                  )}
                </div>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-950/0 opacity-0 transition group-hover:bg-neutral-950/20 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-md">
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </span>
                </div>
              </button>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-neutral-900">
                      {template.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                      {template.tagline ?? template.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1 pt-0.5">
                    <span
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: template.theme.primaryColor }}
                    />
                    <span
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: template.theme.secondaryColor }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400">
                  {home.sections.length} sections · {template.navigation.length} nav links ·{" "}
                  {template.theme.font}
                </p>

                <div className="mt-auto flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 rounded-lg border-neutral-200 text-xs"
                    onClick={() => setPreview(template)}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 flex-1 rounded-lg bg-neutral-900 text-xs text-white hover:bg-neutral-800"
                    loading={applying}
                    disabled={isLive || !!applyingId}
                    onClick={() => setConfirm(template)}
                  >
                    {isLive ? "In use" : "Apply"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <WebsiteTemplateDetailDialog
        template={preview}
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
        onApply={() => {
          if (preview) {
            setConfirm(preview);
            setPreview(null);
          }
        }}
        isLive={preview ? activeTemplateId === preview.id : false}
      />

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply {confirm?.name}?</DialogTitle>
            <DialogDescription>
              Updates your live store layout, navigation, and theme colors. Creates About & Contact
              pages if missing.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
            Customers see the new design immediately. You can keep customizing in the website
            editor.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              className="bg-neutral-900 hover:bg-neutral-800"
              loading={!!applyingId}
              onClick={() => {
                if (confirm) {
                  onApply(confirm);
                  setConfirm(null);
                }
              }}
            >
              Apply & go live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function StorefrontMockup({
  look,
}: {
  look: (typeof MOCKUP)[WebsiteTemplateId];
}) {
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden border-b border-neutral-100"
      style={{ backgroundColor: look.canvas }}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1 border-b border-black/5 bg-white/95 px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <span className="ml-2 h-3 flex-1 rounded bg-neutral-100" />
      </div>

      <div className="absolute inset-0 pt-7">
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ color: look.text }}
        >
          <span className="text-[10px] font-semibold tracking-wide">{look.brand}</span>
          <span
            className="rounded px-1.5 py-0.5 text-[8px] font-semibold"
            style={{ backgroundColor: look.ctaBg, color: look.ctaFg }}
          >
            Cart
          </span>
        </div>

        <div
          className="mx-2.5 overflow-hidden rounded-lg px-3 py-4"
          style={{ background: look.heroBg }}
        >
          <p
            className="max-w-[90%] text-[13px] font-semibold leading-snug tracking-tight"
            style={{ color: look.text }}
          >
            {look.heroTitle}
          </p>
          <p className="mt-1 text-[9px] leading-relaxed" style={{ color: look.muted }}>
            {look.heroSub}
          </p>
          <div
            className="mt-2.5 inline-flex rounded-md px-2.5 py-1 text-[8px] font-semibold"
            style={{ backgroundColor: look.ctaBg, color: look.ctaFg }}
          >
            {look.ctaLabel}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5 px-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-md"
              style={{ backgroundColor: look.surface }}
            >
              <div className="aspect-square" style={{ background: look.productGrad(i) }} />
              <div className="space-y-1 p-1">
                <div className="h-1 w-3/4 rounded-full bg-neutral-200" />
                <div className="h-1 w-1/2 rounded-full bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WebsiteTemplateDetailDialog({
  template,
  open,
  onOpenChange,
  onApply,
  isLive,
}: {
  template: WebsiteTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  isLive: boolean;
}) {
  const home = useMemo(
    () => (template ? getTemplateHomeLayout(template) : null),
    [template],
  );
  if (!template || !home) return null;

  const look = MOCKUP[template.id];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <div className="border-b border-neutral-100">
          <StorefrontMockup look={look} />
        </div>
        <div className="space-y-4 p-5">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-lg">{template.name}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {template.description}
            </DialogDescription>
          </DialogHeader>

          <div>
            <p className={dashboardKicker}>Home sections</p>
            <ul className="mt-2 grid max-h-36 gap-1 overflow-y-auto sm:grid-cols-2">
              {home.sections.map((section) => (
                <li
                  key={section.id}
                  className="flex items-center gap-2 rounded-lg bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-700"
                >
                  <Check className="h-3 w-3 shrink-0 text-neutral-400" />
                  {SECTION_REGISTRY[section.type]?.label ?? section.type}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-neutral-500">
            Best for{" "}
            <span className="font-medium text-neutral-700">
              {template.businessModels.join(", ")}
            </span>{" "}
            · {template.industry}
          </p>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Close
            </Button>
            <Button
              onClick={onApply}
              disabled={isLive}
              className="rounded-xl bg-neutral-900 hover:bg-neutral-800"
            >
              {isLive ? "Already active" : `Apply ${template.name}`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
