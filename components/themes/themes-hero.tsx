"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getThemeTemplate, STORE_FONTS, THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import { getTemplate } from "@/lib/website-templates/registry";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";
import {
  dashboardCard,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemesStatusStripProps {
  storeSlug: string;
  themeId: ThemeId;
  websiteTemplateId: WebsiteTemplateId | null;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  updatedAt?: string;
  dirty: boolean;
  selectedTemplate: ThemeId;
  liveTemplate: ThemeId;
  onOpenEditor: () => void;
  onScrollToDesigns: () => void;
  onPrimaryChange: (color: string) => void;
  onSecondaryChange: (color: string) => void;
  onFontChange: (font: string) => void;
  onSelectStyle: (theme: ThemeId) => void;
}

const textBtn =
  "h-8 rounded-md px-2.5 text-[12px] font-medium text-neutral-500 transition-colors hover:bg-transparent hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white";

/** Slim current-theme row + optional Brand disclosure (Apple-quiet). */
export function ThemesStatusStrip({
  storeSlug,
  themeId,
  websiteTemplateId,
  primaryColor,
  secondaryColor,
  font,
  dirty,
  selectedTemplate,
  liveTemplate,
  onOpenEditor,
  onScrollToDesigns,
  onPrimaryChange,
  onSecondaryChange,
  onFontChange,
  onSelectStyle,
}: ThemesStatusStripProps) {
  const [brandOpen, setBrandOpen] = useState(false);
  const styleTheme = getThemeTemplate(themeId);
  const website = websiteTemplateId ? getTemplate(websiteTemplateId) : null;

  return (
    <section
      className={cn(dashboardCard, "overflow-hidden font-[family-name:var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif]")}
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={dashboardTitle}>{website?.name ?? styleTheme.name}</h2>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                dirty
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  dirty ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
              {dirty ? "Unpublished" : "Live"}
            </span>
          </div>
          <p className={dashboardSubtitle}>
            {styleTheme.name} style
            {website ? ` · ${website.tagline ?? website.industry}` : " · Apply a design below"}
          </p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className="h-3 w-3 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: primaryColor }}
            />
            <span
              className="h-3 w-3 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-[11px] text-neutral-500">{font}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-0.5">
          <Button onClick={onOpenEditor} className={cn(dashboardPrimaryBtn, "h-8 px-3")}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Customize
          </Button>
          <Button variant="ghost" className={textBtn} onClick={onScrollToDesigns}>
            Change design
          </Button>
          <Button variant="ghost" className={textBtn} asChild>
            <Link href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
              View store
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(textBtn, "gap-1")}
            onClick={() => setBrandOpen((o) => !o)}
            aria-expanded={brandOpen}
          >
            Brand
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", brandOpen && "rotate-180")}
            />
          </Button>
        </div>
      </div>

      {brandOpen ? (
        <div className="space-y-3 border-t border-black/[0.05] px-4 py-3 dark:border-white/10">
          <div className="grid grid-cols-2 gap-2 sm:max-w-md">
            <label className="block space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                Accent
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => onPrimaryChange(e.target.value)}
                  className="h-8 w-9 cursor-pointer rounded-md border border-black/[0.06] bg-white p-0.5 dark:border-white/10"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => onPrimaryChange(e.target.value)}
                  className="h-8 flex-1 rounded-md border border-black/[0.06] bg-[#F5F5F7] px-2 font-mono text-[11px] uppercase outline-none focus:ring-1 focus:ring-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.05]"
                />
              </div>
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                Background
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => onSecondaryChange(e.target.value)}
                  className="h-8 w-9 cursor-pointer rounded-md border border-black/[0.06] bg-white p-0.5 dark:border-white/10"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => onSecondaryChange(e.target.value)}
                  className="h-8 flex-1 rounded-md border border-black/[0.06] bg-[#F5F5F7] px-2 font-mono text-[11px] uppercase outline-none focus:ring-1 focus:ring-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.05]"
                />
              </div>
            </label>
          </div>

          <label className="block max-w-md space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
              Font
            </span>
            <select
              value={font}
              onChange={(e) => onFontChange(e.target.value)}
              className="h-8 w-full rounded-md border border-black/[0.06] bg-[#F5F5F7] px-2.5 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.05]"
            >
              {STORE_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {THEME_TEMPLATES.map((template) => {
              const selected = selectedTemplate === template.id;
              const live = liveTemplate === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelectStyle(template.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                    selected
                      ? "border-[#007AFF]/40 bg-[#007AFF]/[0.06] text-neutral-900 dark:text-white"
                      : "border-black/[0.06] text-neutral-500 hover:text-neutral-900 dark:border-white/10 dark:hover:text-white"
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: template.preview.accent }}
                  />
                  {template.name}
                  {live ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Live</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export const ThemesHero = ThemesStatusStrip;
