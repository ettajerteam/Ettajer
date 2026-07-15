"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { dashboardKicker, dashboardSubtitle } from "@/lib/dashboard-ui";
import { listWebsiteTemplates } from "@/lib/website-templates";
import type { WebsiteTemplate } from "@/lib/website-templates";
import { WebsiteTemplateCard } from "./website-template-card";

interface WebsiteTemplatesPanelProps {
  onPreview: (template: WebsiteTemplate) => void;
  onApply: (template: WebsiteTemplate) => void;
}

export function WebsiteTemplatesPanel({ onPreview, onApply }: WebsiteTemplatesPanelProps) {
  const [query, setQuery] = useState("");
  const templates = listWebsiteTemplates();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.industry.toLowerCase().includes(q) ||
        t.tagline?.toLowerCase().includes(q) ||
        t.branding?.tagline?.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [query, templates]);

  return (
    <div className="space-y-4">
      <div>
        <p className={dashboardKicker}>Website templates</p>
        <p className={dashboardSubtitle}>
          Full layouts with sections, navigation, and theme — distinct from theme style below.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates…"
          className="h-9 pl-8 text-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
          No templates match your search.
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((template) => (
            <WebsiteTemplateCard
              key={template.id}
              template={template}
              onPreview={() => onPreview(template)}
              onApply={() => onApply(template)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
