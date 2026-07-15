"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Eye, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import { getThemePreviewBlur } from "@/lib/theme-blur-data";
import { dashboardCard, dashboardCardInteractive } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemeLibraryGridProps {
  selectedTemplate: ThemeId;
  liveTemplate: ThemeId;
  onSelect: (theme: ThemeId) => void;
  onCustomizeLive?: () => void;
}

export function ThemeLibraryGrid({
  selectedTemplate,
  liveTemplate,
  onSelect,
  onCustomizeLive,
}: ThemeLibraryGridProps) {
  const [detailId, setDetailId] = useState<ThemeId | null>(null);
  const [hoverId, setHoverId] = useState<ThemeId | null>(null);
  const detail = detailId ? THEME_TEMPLATES.find((t) => t.id === detailId) : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {THEME_TEMPLATES.map((template) => {
          const isLive = liveTemplate === template.id;
          const isSelected = selectedTemplate === template.id;

          return (
            <article
              key={template.id}
              className={cn(
                dashboardCard,
                dashboardCardInteractive,
                "group relative flex flex-col overflow-hidden",
                isSelected || isLive ? template.ring : "hover:ring-[#007AFF]/25"
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-40",
                  template.glow
                )}
              />

              <div
                className="relative aspect-[4/3] overflow-hidden border-b border-border/60"
                onMouseEnter={() => setHoverId(template.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <Image
                  src={template.previewImage}
                  alt={template.name}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500",
                    hoverId === template.id && template.popular ? "scale-105 opacity-0" : "group-hover:scale-[1.03]"
                  )}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={template.popular}
                  placeholder={getThemePreviewBlur(template.id) ? "blur" : "empty"}
                  blurDataURL={getThemePreviewBlur(template.id)}
                />
                {template.popular && hoverId === template.id && (
                  <Image
                    src="/assets/illustrations/storefront-preview.gif"
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {isLive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                      <Check className="h-3 w-3" />
                      Current
                    </span>
                  )}
                  {template.popular && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-900">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      Popular
                    </span>
                  )}
                  {isSelected && !isLive && (
                    <span className="rounded-full bg-[#007AFF] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                      Previewing
                    </span>
                  )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-lg shadow-lg"
                    onClick={() => setDetailId(template.id)}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg shadow-lg"
                    onClick={() => onSelect(template.id)}
                  >
                    Try theme
                  </Button>
                </div>
              </div>

              <div className="relative flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold tracking-[-0.02em]">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      by {template.author} · v{template.version}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: template.defaultPrimary }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: template.defaultSecondary }}
                    />
                  </div>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{template.description}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {template.industry.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                    onClick={() => setDetailId(template.id)}
                  >
                    View details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-lg"
                    onClick={() => (isLive && onCustomizeLive ? onCustomizeLive() : onSelect(template.id))}
                  >
                    {isLive ? "Customize" : "Try theme"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {detail && (
        <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {detail.name}
                {detail.popular && <Sparkles className="h-4 w-4 text-[#007AFF]" />}
              </DialogTitle>
              <DialogDescription>
                {detail.longDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="relative aspect-video overflow-hidden rounded-xl border">
              <Image src={detail.previewImage} alt={detail.name} fill className="object-cover" />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Features</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {detail.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Best for</p>
                <p className="mt-1 text-sm text-muted-foreground">{detail.industry.join(" · ")}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailId(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  onSelect(detail.id);
                  setDetailId(null);
                }}
              >
                Try {detail.name}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
