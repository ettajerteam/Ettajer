"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getThemeTemplate } from "@/lib/themes";
import { dashboardCard, dashboardCardPad, dashboardKicker } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import type { ThemeId } from "@/lib/themes";

interface CurrentThemeCardProps {
  themeId: ThemeId;
  storeSlug: string;
  updatedAt?: string;
  onCustomize: () => void;
}

export function CurrentThemeCard({
  themeId,
  storeSlug,
  updatedAt,
  onCustomize,
}: CurrentThemeCardProps) {
  const template = getThemeTemplate(themeId);
  const savedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <section className={cn(dashboardCard, "relative overflow-hidden")}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-50",
          template.glow
        )}
      />

      <div className={`${dashboardCardPad} relative`}>
        <p className={dashboardKicker}>Current theme</p>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-border/60 shadow-inner sm:h-28 sm:w-48">
            <Image
              src={template.previewImage}
              alt={template.name}
              fill
              className="object-cover"
              sizes="192px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-2 left-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              Live
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-[-0.03em]">{template.name}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                v{template.version}
              </span>
              {template.popular && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-2 py-0.5 text-[10px] font-medium text-[#007AFF]">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              by {template.author} · {template.tagline}
            </p>
            {savedLabel && (
              <p className="mt-2 text-xs text-muted-foreground">
                Last published {savedLabel}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
            <Button
              asChild
              className="hidden rounded-xl premium-glow-blue transition-transform hover:scale-[1.02] active:scale-[0.98] md:inline-flex"
              style={{ backgroundColor: template.defaultPrimary }}
            >
              <Link href="/dashboard/themes/editor">
                <Pencil className="mr-2 h-4 w-4" />
                Open website editor
              </Link>
            </Button>
            <p className="w-full text-xs text-muted-foreground md:hidden">
              Website editor is available on desktop only.
            </p>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href={`/store/${storeSlug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View live site
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-4">
          {template.features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              <Check className="h-3 w-3 text-emerald-600" />
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
