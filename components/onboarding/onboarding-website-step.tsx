"use client";

import { Check, LayoutTemplate } from "lucide-react";
import type { BusinessModel } from "@/lib/onboarding/business-models";
import type { OnboardingExtendedCopy } from "@/lib/onboarding/onboarding-i18n";
import { getTemplatesForBusinessModel } from "@/lib/website-templates";
import { getTemplateThumbnailStyle } from "@/lib/website-templates";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";
import { cn } from "@/lib/utils";

type Props = {
  copy: OnboardingExtendedCopy;
  businessModels: BusinessModel[];
  value: WebsiteTemplateId | "";
  onChange: (value: WebsiteTemplateId) => void;
};

export function OnboardingWebsiteStep({
  copy,
  businessModels,
  value,
  onChange,
}: Props) {
  const templates = getTemplatesForBusinessModel(businessModels);
  const labels = copy.website;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem]">
          {labels.title}
        </h2>
        <p className="mt-2 text-sm text-neutral-500 sm:text-[15px]">{labels.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const selected = value === template.id;
          const thumb = getTemplateThumbnailStyle(template.thumbnail);
          const localized = copy.templates[template.id];
          const isRecommended = template.recommendedCategories.length > 0;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={cn(
                "group overflow-hidden rounded-2xl border text-start transition-all duration-200",
                selected
                  ? "border-[#007AFF] shadow-md ring-2 ring-[#007AFF]/15"
                  : "border-neutral-200/80 bg-white/60 hover:border-neutral-300 hover:shadow-sm"
              )}
            >
              <div
                className="relative aspect-[16/10] w-full"
                style={
                  thumb.type === "gradient"
                    ? { background: thumb.value }
                    : {
                        backgroundImage: `url(${thumb.value})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                }
              >
                {isRecommended ? (
                  <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-neutral-700 shadow-sm">
                    {labels.recommended}
                  </span>
                ) : null}
                {selected ? (
                  <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#007AFF] text-white shadow">
                    <Check className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
              <div className="space-y-1 p-4">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-[#007AFF]" />
                  <p className="font-semibold tracking-tight">
                    {localized?.name ?? template.name}
                  </p>
                </div>
                <p className="text-sm text-neutral-500">
                  {localized?.tagline ?? template.tagline ?? template.description}
                </p>
                <p className="text-xs text-neutral-400">{template.industry}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
