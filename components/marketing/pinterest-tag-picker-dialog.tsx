"use client";

import { useEffect, useState } from "react";
import { Loader2, Radio } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { MarketingIntegrations } from "@/lib/marketing-integrations";

interface PinterestTagOption {
  id: string;
  name: string;
  adAccountId: string;
  adAccountName?: string | null;
  status?: string | null;
}

interface PinterestTagPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelected: (result: {
    tagId: string;
    tagName: string | null;
    needsConversionToken: boolean;
    integrations: MarketingIntegrations;
  }) => void;
}

export function PinterestTagPickerDialog({
  open,
  onOpenChange,
  onSelected,
}: PinterestTagPickerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<PinterestTagOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setTags([]);
      setSelectedId(null);
      try {
        const res = await fetch("/api/marketing/pinterest/tags");
        const data = await res.json();
        if (!res.ok && !data.sessionActive) {
          throw new Error(data.message ?? "Failed to load tags");
        }
        if (cancelled) return;
        if (!data.sessionActive) {
          setError("Pinterest login expired. Connect with Pinterest again.");
          return;
        }
        if (data.message && (!Array.isArray(data.tags) || data.tags.length === 0)) {
          setError(data.message);
          return;
        }
        const list = Array.isArray(data.tags)
          ? (data.tags as PinterestTagOption[])
          : [];
        setTags(list);
        if (list.length === 1) setSelectedId(list[0]!.id);
        if (list.length === 0) {
          setError(
            "No Pinterest Tags found. Create a Tag in Pinterest Ads → Conversions first."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tags");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleConfirm() {
    if (!selectedId) return;
    const tag = tags.find((t) => t.id === selectedId);
    if (!tag) return;
    setSaving(true);
    try {
      const res = await fetch("/api/marketing/pinterest/select-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagId: selectedId,
          tagName: tag.name ?? null,
          adAccountId: tag.adAccountId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save tag");

      onSelected({
        tagId: data.tagId,
        tagName: data.tagName ?? tag.name ?? null,
        needsConversionToken: Boolean(data.needsConversionToken),
        integrations: data.integrations,
      });
      onOpenChange(false);
      toast.success(
        tag.name
          ? `Connected “${tag.name}” — Tag + ad account saved`
          : "Pinterest Tag connected"
      );
      if (data.needsConversionToken) {
        toast.message(
          "Add a Conversion access token under Advanced for server-side events."
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save tag");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-black/[0.06] p-0 dark:border-white/10 sm:rounded-xl">
        <DialogHeader className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
          <DialogTitle className="text-[15px]">Choose a Pinterest Tag</DialogTitle>
          <DialogDescription className="text-[12px]">
            Pick the Tag for your storefront. Ad account ID is saved for
            Conversions API — you still add the Conversion token under Advanced.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading tags from Pinterest…
            </div>
          ) : error ? (
            <p className="rounded-[10px] border border-amber-500/20 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              {error}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {tags.map((tag) => {
                const active = selectedId === tag.id;
                return (
                  <li key={`${tag.adAccountId}-${tag.id}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(tag.id)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors",
                        active
                          ? "border-[#E60023]/40 bg-[#E60023]/5"
                          : "border-black/[0.05] hover:bg-[#F5F5F7] dark:border-white/10 dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                          active
                            ? "bg-[#E60023] text-white"
                            : "bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08]"
                        )}
                      >
                        <Radio className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-white">
                          {tag.name}
                        </span>
                        <span className="mt-0.5 block font-mono text-[11px] text-neutral-400">
                          {tag.id}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-neutral-400">
                          Ad account{" "}
                          <span className="font-mono">
                            {tag.adAccountName
                              ? `${tag.adAccountName} · ${tag.adAccountId}`
                              : tag.adAccountId}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="border-t border-black/[0.05] px-4 py-3 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] text-[12px] dark:border-white/10"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-8 rounded-md bg-[#E60023] px-3 text-[12px] text-white hover:bg-[#C4001A]"
            disabled={!selectedId || saving || loading}
            loading={saving}
            onClick={handleConfirm}
          >
            Use this tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
