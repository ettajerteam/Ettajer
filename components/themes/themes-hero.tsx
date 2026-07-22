"use client";

import Link from "next/link";
import {
  ExternalLink,
  LayoutTemplate,
  Paintbrush,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getThemeTemplate, type ThemeId } from "@/lib/themes";
import { getTemplate } from "@/lib/website-templates/registry";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
  dashboardPrimaryBtn,
  dashboardSubtitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemesHeroProps {
  storeSlug: string;
  themeId: ThemeId;
  websiteTemplateId: WebsiteTemplateId | null;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  updatedAt?: string;
  brandProgress: number;
  dirty: boolean;
  onOpenEditor: () => void;
  onScrollToBrand: () => void;
  onScrollToDesigns: () => void;
}

export function ThemesHero({
  storeSlug,
  themeId,
  websiteTemplateId,
  primaryColor,
  secondaryColor,
  font,
  updatedAt,
  brandProgress,
  dirty,
  onOpenEditor,
  onScrollToBrand,
  onScrollToDesigns,
}: ThemesHeroProps) {
  const styleTheme = getThemeTemplate(themeId);
  const website = websiteTemplateId ? getTemplate(websiteTemplateId) : null;
  const savedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("en", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div
        className={cn(
          dashboardCardPad,
          "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8",
        )}
      >
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className={dashboardKicker}>Online store · Themes</p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
                dirty
                  ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80"
                  : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  dirty ? "bg-amber-500" : "bg-emerald-500",
                )}
              />
              {dirty ? "Unpublished changes" : "Live"}
            </span>
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-[-0.03em] text-neutral-900 sm:text-2xl">
              {website?.name ?? styleTheme.name}
            </h1>
            <p className={cn(dashboardSubtitle, "mt-1 max-w-xl leading-relaxed")}>
              {website
                ? website.tagline ?? website.description
                : "Choose a storefront design, set your brand, then publish."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: primaryColor }}
              />
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: secondaryColor }}
              />
              <span className="font-medium text-neutral-700">{font}</span>
            </span>
            <span className="text-neutral-300">·</span>
            <span>{styleTheme.name} style</span>
            <span className="text-neutral-300">·</span>
            <span>Brand {brandProgress}%</span>
            {savedLabel ? (
              <>
                <span className="text-neutral-300">·</span>
                <span>Updated {savedLabel}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            onClick={onOpenEditor}
            className={cn(dashboardPrimaryBtn, "hidden h-10 px-4 md:inline-flex")}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Customize
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-neutral-200"
            onClick={onScrollToDesigns}
          >
            <LayoutTemplate className="mr-2 h-3.5 w-3.5" />
            Designs
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-neutral-200"
            onClick={onScrollToBrand}
          >
            <Paintbrush className="mr-2 h-3.5 w-3.5" />
            Brand
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-neutral-200"
            asChild
          >
            <Link href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              View store
            </Link>
          </Button>
        </div>
      </div>

      <p className="border-t border-neutral-100 px-4 py-2.5 text-xs text-neutral-500 md:hidden sm:px-5">
        Website editor opens on desktop. Use Designs and Brand below on any device.
      </p>
    </section>
  );
}
