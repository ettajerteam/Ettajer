"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AiGeneratedPage, AiGeneratedSection } from "@/lib/builder/ai/types";
import { cn } from "@/lib/utils";

export type AiGenerateMode = "section" | "page";

interface BuilderAiGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName?: string;
  storeDescription?: string | null;
  onGeneratedSection: (section: AiGeneratedSection) => void;
  onGeneratedPage: (
    page: AiGeneratedPage,
    options: { applyToCurrent: boolean }
  ) => void | Promise<void>;
}

const SECTION_PLACEHOLDER =
  "e.g. A bold hero for a luxury perfume brand with a shop CTA";
const PAGE_PLACEHOLDER =
  "e.g. About page for a handmade ceramics shop, or contact page with a form";

export function BuilderAiGenerateDialog({
  open,
  onOpenChange,
  storeName,
  storeDescription,
  onGeneratedSection,
  onGeneratedPage,
}: BuilderAiGenerateDialogProps) {
  const [mode, setMode] = useState<AiGenerateMode>("section");
  const [prompt, setPrompt] = useState("");
  const [applyToCurrent, setApplyToCurrent] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    const text = prompt.trim();
    if (text.length < 3) {
      toast.error("Add a short description of what to generate");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/builder/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt: text,
          storeName,
          storeDescription: storeDescription ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        section?: AiGeneratedSection;
        page?: AiGeneratedPage;
        warnings?: string[];
      };

      if (!res.ok) {
        toast.error(data.message ?? "Generation failed");
        return;
      }

      if (mode === "section") {
        if (!data.section) {
          toast.error("No section was generated");
          return;
        }
        onGeneratedSection(data.section);
        onOpenChange(false);
        setPrompt("");
      } else {
        if (!data.page) {
          toast.error("No page was generated");
          return;
        }
        await onGeneratedPage(data.page, { applyToCurrent });
        onOpenChange(false);
        setPrompt("");
      }

      if (data.warnings?.length) {
        toast.message(data.warnings[0]);
      }
    } catch {
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#007AFF]" />
            Generate with AI
          </DialogTitle>
          <DialogDescription>
            Describe a section or page. We’ll draft layout and copy you can edit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              onClick={() => setMode("section")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                mode === "section"
                  ? "bg-white text-[#007AFF] shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Section
            </button>
            <button
              type="button"
              onClick={() => setMode("page")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                mode === "page"
                  ? "bg-white text-[#007AFF] shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Page
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-generate-prompt">
              {mode === "section" ? "Describe the section" : "Describe the page"}
            </Label>
            <Textarea
              id="ai-generate-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === "section" ? SECTION_PLACEHOLDER : PAGE_PLACEHOLDER}
              rows={4}
              className="resize-none text-sm"
              disabled={loading}
            />
          </div>

          {mode === "page" ? (
            <div className="space-y-2 rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Where to put it
              </p>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-700">
                <input
                  type="radio"
                  name="ai-page-target"
                  checked={applyToCurrent}
                  onChange={() => setApplyToCurrent(true)}
                  className="mt-1"
                  disabled={loading}
                />
                <span>
                  <span className="font-medium">Apply to current page</span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    Replaces this page’s sections with the generated layout
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-700">
                <input
                  type="radio"
                  name="ai-page-target"
                  checked={!applyToCurrent}
                  onChange={() => setApplyToCurrent(false)}
                  className="mt-1"
                  disabled={loading}
                />
                <span>
                  <span className="font-medium">Create as new page</span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    Saves a draft custom page you can open from Pages
                  </span>
                </span>
              </label>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleGenerate()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
