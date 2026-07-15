"use client";

import { useMemo } from "react";
import { ExternalLink, FileText, Layers, Navigation, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import { buildPreviewUrl } from "@/lib/preview-engine";
import {
  getTemplateHomeLayout,
  getTemplatePreviewSettings,
  getTemplateSecondaryPages,
} from "@/lib/website-templates";
import type { WebsiteTemplate } from "@/lib/website-templates";
import type { PreviewPaths } from "@/types/theme";

interface WebsiteTemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WebsiteTemplate | null;
  storeSlug: string;
  previewPaths: PreviewPaths;
  onApply: () => void;
}

export function WebsiteTemplatePreviewDialog({
  open,
  onOpenChange,
  template,
  storeSlug,
  previewPaths,
  onApply,
}: WebsiteTemplatePreviewDialogProps) {
  const homeLayout = template ? getTemplateHomeLayout(template) : null;
  const secondaryPages = template ? getTemplateSecondaryPages(template) : [];

  const previewUrl = useMemo(() => {
    if (!template || !homeLayout) return "";
    return buildPreviewUrl(
      storeSlug,
      getTemplatePreviewSettings(template),
      "home",
      previewPaths,
      homeLayout
    );
  }, [template, homeLayout, storeSlug, previewPaths]);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <iframe
              title={`${template.name} preview`}
              src={previewUrl}
              className="h-[360px] w-full bg-white sm:h-[420px]"
            />
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Palette className="h-3.5 w-3.5" />
                Theme style
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full border border-neutral-200"
                  style={{ backgroundColor: template.theme.primaryColor }}
                />
                <span
                  className="h-5 w-5 rounded-full border border-neutral-200"
                  style={{ backgroundColor: template.theme.secondaryColor }}
                />
                <span className="text-xs text-neutral-600 capitalize">
                  {template.theme.theme} · {template.theme.font}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Layers className="h-3.5 w-3.5" />
                Sections ({homeLayout?.sections.length ?? 0})
              </p>
              <ul className="space-y-1">
                {homeLayout?.sections.map((section) => (
                  <li key={section.id} className="text-xs text-neutral-700">
                    {SECTION_REGISTRY[section.type].label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Navigation className="h-3.5 w-3.5" />
                Navigation
              </p>
              <div className="flex flex-wrap gap-1">
                {template.navigation.map((item) => (
                  <Badge key={item.id} variant="outline" className="text-[10px] font-normal">
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>

            {secondaryPages.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                  <FileText className="h-3.5 w-3.5" />
                  Pages
                </p>
                <ul className="space-y-1">
                  {secondaryPages.map((page) => (
                    <li key={page.slug} className="text-xs text-neutral-700">
                      {page.title}{" "}
                      <span className="text-neutral-400">({page.status ?? "draft"})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" size="sm" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Open full preview
            </a>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="bg-[#007AFF]" onClick={onApply}>
              Apply template
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
