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

interface MetaPixelOption {
  id: string;
  name: string;
  adAccountId?: string | null;
  businessId?: string | null;
}

interface MetaPixelPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelected: (result: {
    pixelId: string;
    pixelName: string | null;
    integrations: MarketingIntegrations;
  }) => void;
}

export function MetaPixelPickerDialog({
  open,
  onOpenChange,
  onSelected,
}: MetaPixelPickerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pixels, setPixels] = useState<MetaPixelOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setPixels([]);
      setSelectedId(null);
      try {
        const res = await fetch("/api/marketing/meta/pixels");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message ?? "Failed to load pixels");
        }
        if (cancelled) return;
        if (!data.sessionActive) {
          setError("Meta login expired. Connect with Meta again.");
          return;
        }
        const list = Array.isArray(data.pixels) ? (data.pixels as MetaPixelOption[]) : [];
        setPixels(list);
        if (list.length === 1) setSelectedId(list[0]!.id);
        if (list.length === 0) {
          setError("No pixels found on this Meta account. Create a pixel in Events Manager first.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load pixels");
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
    const pixel = pixels.find((p) => p.id === selectedId);
    setSaving(true);
    try {
      const res = await fetch("/api/marketing/meta/select-pixel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelId: selectedId,
          pixelName: pixel?.name ?? null,
          businessId: pixel?.businessId ?? null,
          adAccountId: pixel?.adAccountId ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save pixel");

      onSelected({
        pixelId: data.pixelId,
        pixelName: data.pixelName ?? pixel?.name ?? null,
        integrations: data.integrations,
      });
      onOpenChange(false);
      toast.success(
        pixel?.name
          ? `Connected “${pixel.name}” — tracking is ready`
          : "Meta Pixel connected"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save pixel");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-black/[0.06] p-0 dark:border-white/10 sm:rounded-xl">
        <DialogHeader className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
          <DialogTitle className="text-[15px]">Choose a Meta Pixel</DialogTitle>
          <DialogDescription className="text-[12px]">
            Pick the pixel to run on your storefront. We&apos;ll also save your access
            token for Conversions API.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading pixels from Meta…
            </div>
          ) : error ? (
            <p className="rounded-[10px] border border-amber-500/20 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              {error}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {pixels.map((pixel) => {
                const active = selectedId === pixel.id;
                return (
                  <li key={pixel.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(pixel.id)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors",
                        active
                          ? "border-[#1877F2]/40 bg-[#1877F2]/5"
                          : "border-black/[0.05] hover:bg-[#F5F5F7] dark:border-white/10 dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                          active
                            ? "bg-[#1877F2] text-white"
                            : "bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08]"
                        )}
                      >
                        <Radio className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-white">
                          {pixel.name}
                        </span>
                        <span className="mt-0.5 block font-mono text-[11px] text-neutral-400">
                          {pixel.id}
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
            className="h-8 rounded-md bg-[#1877F2] px-3 text-[12px] text-white hover:bg-[#166FE5]"
            disabled={!selectedId || saving || loading}
            loading={saving}
            onClick={handleConfirm}
          >
            Use this pixel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
