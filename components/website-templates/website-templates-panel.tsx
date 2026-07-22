"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { listWebsiteTemplates } from "@/lib/website-templates";
import type { WebsiteTemplate } from "@/lib/website-templates";
import { WebsiteTemplateCard } from "./website-template-card";

interface WebsiteTemplatesPanelProps {
  onPreview: (template: WebsiteTemplate) => void;
  onApply: (template: WebsiteTemplate) => void;
  activeTemplateId?: string | null;
}

export function WebsiteTemplatesPanel({
  onPreview,
  onApply,
  activeTemplateId,
}: WebsiteTemplatesPanelProps) {
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
        t.description.toLowerCase().includes(q),
    );
  }, [query, templates]);

  return (
    <div className="space-y-3">
      <div className="px-0.5">
        <p className="text-xs font-semibold text-neutral-800">Full storefronts</p>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          Aura, TechNova, and Paper — complete page layouts. Colors and theme style live under Design.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Aura, TechNova, Paper…"
          className="h-9 pl-8 text-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
          No templates match your search.
        </p>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((template) => (
            <WebsiteTemplateCard
              key={template.id}
              template={template}
              selected={activeTemplateId === template.id}
              onPreview={() => onPreview(template)}
              onApply={() => onApply(template)}
            />
          ))}
        </div>
      )}

      <Link
        href="/dashboard/themes"
        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#007AFF] hover:underline"
      >
        Open full gallery
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}
