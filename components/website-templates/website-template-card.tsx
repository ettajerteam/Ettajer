"use client";

import { Check, Layers, Sparkles } from "lucide-react";
import { getTemplateHomeLayout, type WebsiteTemplate } from "@/lib/website-templates";
import {
  TEMPLATE_MOCKUP,
  WebsiteTemplateMockup,
} from "@/components/website-templates/website-template-mockup";
import { cn } from "@/lib/utils";

interface WebsiteTemplateCardProps {
  template: WebsiteTemplate;
  selected?: boolean;
  onPreview: () => void;
  onApply: () => void;
}

export function WebsiteTemplateCard({
  template,
  selected,
  onPreview,
  onApply,
}: WebsiteTemplateCardProps) {
  const home = getTemplateHomeLayout(template);
  const look = TEMPLATE_MOCKUP[template.id];

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all",
        selected
          ? "border-[#007AFF] ring-2 ring-[#007AFF]/20"
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-md",
      )}
    >
      <button
        type="button"
        onClick={onPreview}
        className="relative block w-full text-left"
        aria-label={`Preview ${template.name} template`}
      >
        <WebsiteTemplateMockup templateId={template.id} compact />
        <div className="absolute left-2 top-2">
          <span className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-semibold text-neutral-700 shadow-sm">
            {look.mood}
          </span>
        </div>
        {selected ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
            <Check className="h-2.5 w-2.5" />
            Draft
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold tracking-[-0.02em] text-neutral-900">
              {template.name}
            </h3>
            <Sparkles className="h-3 w-3 text-amber-500" />
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-neutral-500">
            {template.tagline ?? template.branding?.tagline ?? template.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
            <Layers className="h-2.5 w-2.5" />
            {home.sections.length} sections
          </span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium capitalize text-neutral-600">
            {template.theme.font}
          </span>
        </div>

        <div className="mt-auto flex gap-1.5 pt-1">
          <button
            type="button"
            onClick={onPreview}
            className="h-8 flex-1 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-8 flex-1 rounded-lg bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Apply
          </button>
        </div>
      </div>
    </article>
  );
}
