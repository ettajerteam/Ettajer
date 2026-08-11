"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Layers, Sparkles, Tags, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { computeEtsySeoScore } from "@/lib/channels/etsy-seo";
import { recommendListingMetadata } from "@/lib/channels/ai-product-mapper";

interface EtsySeoPanelProps {
  title: string;
  tags: string[];
  description: string;
  imageCount: number;
  /** Optional wiring — when provided, "Apply" pushes the suggestion into the product form. */
  onApplyTags?: (tags: string[]) => void;
  onApplySeoTitle?: (title: string) => void;
  onApplyCategorySuggestion?: (category: string) => void;
  defaultOpen?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function EtsySeoPanel({
  title,
  tags,
  description,
  imageCount,
  onApplyTags,
  onApplySeoTitle,
  onApplyCategorySuggestion,
  defaultOpen = false,
}: EtsySeoPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [decisions, setDecisions] = useState<Record<string, "applied" | "rejected">>({});

  const seo = useMemo(
    () => computeEtsySeoScore({ title, tags, description, imageCount }),
    [title, tags, description, imageCount]
  );

  const ai = useMemo(
    () => recommendListingMetadata({ title, description, existingTags: tags }),
    [title, description, tags]
  );

  const newTags = ai.suggestedTags.filter((t) => !tags.map((x) => x.toLowerCase()).includes(t.toLowerCase()));

  function decide(key: string, decision: "applied" | "rejected") {
    setDecisions((d) => ({ ...d, [key]: decision }));
  }

  function applyTags() {
    if (onApplyTags) {
      onApplyTags(ai.suggestedTags);
      toast.success("Suggested tags applied");
    } else {
      toast.message("Copy these tags into your listing's tags field.");
    }
    decide("tags", "applied");
  }

  function applySeoTitle() {
    if (onApplySeoTitle) {
      onApplySeoTitle(ai.seoTitle);
      toast.success("SEO title applied");
    } else {
      toast.message("Copy this title into your listing.");
    }
    decide("title", "applied");
  }

  function applyCategory() {
    if (!ai.suggestedCategory) return;
    if (onApplyCategorySuggestion) {
      onApplyCategorySuggestion(ai.suggestedCategory);
      toast.success("Category suggestion applied");
    } else {
      toast.message(`Consider filing this under "${ai.suggestedCategory}".`);
    }
    decide("category", "applied");
  }

  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className={dashboardTitle}>Etsy SEO</h3>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              Listing score: <span className={cn("font-semibold", scoreColor(seo.score))}>{seo.score}/100</span>
            </p>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-black/[0.05] px-4 py-4 dark:border-white/10">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-neutral-500">Overall score</p>
              <p className={cn("text-[12px] font-semibold", scoreColor(seo.score))}>{seo.score}/100</p>
            </div>
            <Progress value={seo.score} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["Title", seo.breakdown.titleScore, 30],
                ["Tags", seo.breakdown.tagScore, 30],
                ["Description", seo.breakdown.descriptionScore, 20],
                ["Images", seo.breakdown.imageScore, 20],
              ] as const
            ).map(([label, value, max]) => (
              <div key={label} className="rounded-[10px] border border-black/[0.05] px-2.5 py-2 dark:border-white/10">
                <p className="text-[10px] text-neutral-400">{label}</p>
                <p className="text-[13px] font-semibold text-neutral-900 dark:text-white">
                  {value}
                  <span className="text-[10px] font-normal text-neutral-400">/{max}</span>
                </p>
              </div>
            ))}
          </div>

          {seo.suggestions.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-neutral-500">Suggestions</p>
              <ul className="space-y-1">
                {seo.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-2 rounded-[10px] border border-[#007AFF]/15 bg-[#007AFF]/[0.03] p-3 dark:border-[#007AFF]/25">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-200">
              <Sparkles className="h-3 w-3 text-[#007AFF]" />
              AI suggestions
            </p>

            {newTags.length > 0 ? (
              <SuggestionRow
                icon={<Tags className="h-3.5 w-3.5 text-neutral-400" />}
                label={`Add ${newTags.length} tag${newTags.length === 1 ? "" : "s"}`}
                preview={newTags.join(", ")}
                decision={decisions.tags}
                onApply={applyTags}
                onReject={() => decide("tags", "rejected")}
              />
            ) : null}

            {ai.seoTitle !== title.trim() ? (
              <SuggestionRow
                icon={<Type className="h-3.5 w-3.5 text-neutral-400" />}
                label="SEO title"
                preview={ai.seoTitle}
                decision={decisions.title}
                onApply={applySeoTitle}
                onReject={() => decide("title", "rejected")}
              />
            ) : null}

            {ai.suggestedCategory ? (
              <SuggestionRow
                icon={<Layers className="h-3.5 w-3.5 text-neutral-400" />}
                label="Suggested category"
                preview={ai.suggestedCategory}
                decision={decisions.category}
                onApply={applyCategory}
                onReject={() => decide("category", "rejected")}
              />
            ) : null}

            {newTags.length === 0 && ai.seoTitle === title.trim() && !ai.suggestedCategory ? (
              <p className="text-[11px] text-neutral-400">No further suggestions — this listing looks well optimized.</p>
            ) : null}

            <details className="text-[10px] text-neutral-400">
              <summary className="cursor-pointer select-none">Why these suggestions?</summary>
              <ul className="mt-1 space-y-0.5 pl-3">
                {ai.rationale.map((r, i) => (
                  <li key={i} className="list-disc">{r}</li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SuggestionRow({
  icon,
  label,
  preview,
  decision,
  onApply,
  onReject,
}: {
  icon: React.ReactNode;
  label: string;
  preview: string;
  decision?: "applied" | "rejected";
  onApply: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-white px-2.5 py-2 dark:bg-white/[0.04]">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
          <p className="truncate text-[10px] text-neutral-400" title={preview}>
            {preview}
          </p>
        </div>
      </div>
      {decision ? (
        <span
          className={cn(
            "shrink-0 text-[10px] font-medium",
            decision === "applied" ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400"
          )}
        >
          {decision === "applied" ? "Applied" : "Dismissed"}
        </span>
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
            onClick={onApply}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-neutral-400 hover:bg-neutral-500/10"
            onClick={onReject}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
