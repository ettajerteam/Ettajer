"use client";

import { Badge } from "@/components/ui/badge";
import { dashboardCard, dashboardCardInteractive, dashboardKicker } from "@/lib/dashboard-ui";
import { getTemplateThumbnailStyle, type WebsiteTemplate } from "@/lib/website-templates";
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
  return (
    <article
      className={cn(
        dashboardCard,
        dashboardCardInteractive,
        "group flex flex-col overflow-hidden",
        selected && "ring-2 ring-[#007AFF] ring-offset-2"
      )}
    >
      <button
        type="button"
        onClick={onPreview}
        className="relative block w-full text-left"
        aria-label={`Preview ${template.name} template`}
      >
        <div
          className="aspect-[16/10] w-full"
          style={(() => {
            const thumb = getTemplateThumbnailStyle(template.thumbnail);
            return thumb.type === "gradient"
              ? { background: thumb.value }
              : {
                  backgroundImage: `url(${thumb.value})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                };
          })()}
        />
        <div className="absolute left-3 top-3">
          <Badge variant="secondary" className="bg-white/90 text-[10px] font-medium text-neutral-700 shadow-sm">
            {template.industry}
          </Badge>
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div>
          <p className={dashboardKicker}>Website template</p>
          <h3 className="text-sm font-semibold tracking-[-0.02em] text-neutral-900">{template.name}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            {template.tagline ?? template.branding?.tagline ?? template.description}
          </p>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-lg bg-[#007AFF] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0066DD]"
          >
            Apply
          </button>
        </div>
      </div>
    </article>
  );
}
