"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import { getThemePreviewBlur } from "@/lib/theme-blur-data";
import { dashboardCard, dashboardKicker } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemeEditorTemplatePickerProps {
  selectedTemplate: ThemeId;
  liveTemplate: ThemeId;
  onSelect: (theme: ThemeId) => void;
}

export function ThemeEditorTemplatePicker({
  selectedTemplate,
  liveTemplate,
  onSelect,
}: ThemeEditorTemplatePickerProps) {
  return (
    <div className="space-y-2">
      <p className={dashboardKicker}>Theme style</p>
      <div className="grid gap-2">
        {THEME_TEMPLATES.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const isLive = liveTemplate === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={cn(
                dashboardCard,
                "flex w-full items-center gap-3 p-2.5 text-left transition-all duration-200",
                isSelected
                  ? "ring-2 ring-[#007AFF] ring-offset-2 bg-[#007AFF]/[0.04]"
                  : "hover:ring-1 hover:ring-neutral-200"
              )}
            >
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60">
                <Image
                  src={template.previewImage}
                  alt={template.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  placeholder={getThemePreviewBlur(template.id) ? "blur" : "empty"}
                  blurDataURL={getThemePreviewBlur(template.id)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{template.name}</p>
                  {isLive && (
                    <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                      Live
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{template.tagline}</p>
              </div>
              {isSelected && <Check className="h-4 w-4 shrink-0 text-[#007AFF]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
