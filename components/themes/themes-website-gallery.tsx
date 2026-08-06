"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllTemplates, getTemplateHomeLayout } from "@/lib/website-templates";
import type { WebsiteTemplate, WebsiteTemplateId } from "@/lib/website-templates/types";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import { WebsiteTemplateMockup } from "@/components/website-templates/website-template-mockup";
import {
  dashboardCard,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemesWebsiteGalleryProps {
  activeTemplateId: WebsiteTemplateId | null;
  applyingId: WebsiteTemplateId | null;
  onApply: (template: WebsiteTemplate) => void;
}

const textBtn =
  "h-8 rounded-md px-2.5 text-[12px] font-medium text-neutral-500 hover:bg-transparent hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white";

/** Quiet design library — Apple flat blue Apply, text Details. */
export function ThemesWebsiteGallery({
  activeTemplateId,
  applyingId,
  onApply,
}: ThemesWebsiteGalleryProps) {
  const templates = getAllTemplates();
  const [preview, setPreview] = useState<WebsiteTemplate | null>(null);
  const [confirm, setConfirm] = useState<WebsiteTemplate | null>(null);

  return (
    <section
      id="themes-designs"
      className={cn(
        dashboardCard,
        "scroll-mt-20 overflow-hidden font-[family-name:var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif]"
      )}
    >
      <div className="flex items-end justify-between gap-3 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div>
          <h2 className={dashboardTitle}>Designs</h2>
          <p className={dashboardSubtitle}>Apply a layout — goes live immediately</p>
        </div>
        <span className="text-[10px] tabular-nums text-neutral-400">{templates.length}</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 p-3 sm:p-4">
        {templates.map((template) => {
          const isLive = activeTemplateId === template.id;
          const home = getTemplateHomeLayout(template);
          const applying = applyingId === template.id;

          return (
            <article
              key={template.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-[12px] border bg-white transition-colors dark:bg-[#1C1C1E]",
                isLive
                  ? "border-[#007AFF]/40 ring-1 ring-[#007AFF]/20"
                  : "border-black/[0.06] dark:border-white/10"
              )}
            >
              {/* Inset frame so preview sits inside card curves (L/R/top) */}
              <button
                type="button"
                onClick={() => setPreview(template)}
                className="relative block w-full p-2 pb-0 text-left"
                aria-label={`Preview ${template.name}`}
              >
                <div className="relative overflow-hidden rounded-[8px] ring-1 ring-black/[0.06] dark:ring-white/10">
                  <WebsiteTemplateMockup templateId={template.id} compact />
                  {isLive ? (
                    <span className="absolute left-1.5 top-1.5 z-40 inline-flex items-center gap-1 rounded-md bg-[#007AFF] px-1.5 py-0.5 text-[10px] font-medium text-white">
                      <Check className="h-2.5 w-2.5" />
                      Active
                    </span>
                  ) : null}
                </div>
              </button>

              <div className="flex flex-1 flex-col gap-2 p-3">
                <div>
                  <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500">
                    {template.tagline ?? template.description}
                  </p>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    {home.sections.length} sections · {template.theme.font}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-1 pt-1">
                  <Button
                    variant="ghost"
                    className={cn(textBtn, "flex-1")}
                    onClick={() => setPreview(template)}
                  >
                    Details
                  </Button>
                  <Button
                    className={cn(dashboardPrimaryBtn, "h-8 flex-1")}
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
        <DialogContent className="rounded-[14px] border-black/[0.06] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[15px] tracking-[-0.02em]">
              Apply {confirm?.name}?
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              Updates live layout, navigation, and theme. Customers see it immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className={textBtn}
              onClick={() => setConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              className={cn(dashboardPrimaryBtn, "h-8 px-3")}
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
    [template]
  );

  const sectionLabels = useMemo(() => {
    if (!home) return [] as string[];
    const labels = home.sections.map(
      (section) => SECTION_REGISTRY[section.type]?.label ?? section.type
    );
    return Array.from(new Set(labels));
  }, [home]);

  if (!template || !home) return null;

  const shownSections = sectionLabels.slice(0, 6);
  const extraSections = Math.max(0, sectionLabels.length - shownSections.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[min(100vw-1.5rem,360px)] max-w-[360px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10",
          "max-h-[min(90vh,640px)]"
        )}
      >
        <DialogHeader className="space-y-0 px-3.5 pb-0 pt-3.5 pr-10 text-left">
          <DialogTitle className="text-[13px] font-semibold tracking-[-0.02em]">
            {template.name}
          </DialogTitle>
          <DialogDescription className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500">
            {template.tagline ?? template.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-3.5 pb-3.5 pt-2.5">
          <div className="overflow-hidden rounded-[8px] ring-1 ring-black/[0.06] dark:ring-white/10">
            <WebsiteTemplateMockup templateId={template.id} compact />
          </div>

          <div className="flex flex-wrap gap-1">
            <span className="rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300">
              {template.industry}
            </span>
            <span className="rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300">
              {template.theme.font}
            </span>
            <span className="rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300">
              {home.sections.length} sections
            </span>
            {isLive ? (
              <span className="rounded-md bg-[#007AFF]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#007AFF]">
                Active
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
              Includes
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {shownSections.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-md bg-[#F5F5F7] px-1.5 py-1 text-[10px] text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300"
                >
                  <Check className="h-2.5 w-2.5 text-neutral-400" />
                  {label}
                </span>
              ))}
              {extraSections > 0 ? (
                <span className="rounded-md px-1.5 py-1 text-[10px] text-neutral-400">
                  +{extraSections} more
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex gap-1.5">
            <Button
              className={cn(dashboardPrimaryBtn, "h-7 flex-1 px-2.5")}
              disabled={isLive}
              onClick={onApply}
            >
              {isLive ? "Already active" : "Apply template"}
            </Button>
            <Button
              variant="ghost"
              className="h-7 rounded-md px-2.5 text-[11px] text-neutral-500"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
