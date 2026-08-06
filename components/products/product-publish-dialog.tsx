"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Package,
  ChevronRight,
  Copy,
  ExternalLink,
} from "lucide-react";
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
import type { PublishIssue } from "@/lib/product-publish-checklist";
import {
  getAbsoluteStoreUrl,
  getStoreUrl,
  getStoreWhatsAppShareUrl,
} from "@/lib/storefront-urls";

export type PublishDialogState =
  | { open: false }
  | { open: true; mode: "missing"; issues: PublishIssue[] }
  | { open: true; mode: "publishing"; title: string }
  | {
      open: true;
      mode: "published";
      title: string;
      firstSaleShare?: boolean;
    };

interface ProductPublishDialogProps {
  state: PublishDialogState;
  onClose: () => void;
  onViewCatalog: () => void;
  onGoToIssue?: (issue: PublishIssue) => void;
  storeSlug?: string;
  storeName?: string;
  onShared?: () => void;
}

export function ProductPublishDialog({
  state,
  onClose,
  onViewCatalog,
  onGoToIssue,
  storeSlug,
  storeName,
  onShared,
}: ProductPublishDialogProps) {
  const open = state.open;
  const firstIssue =
    state.open && state.mode === "missing" ? state.issues[0] : null;
  const firstSaleShare =
    state.open && state.mode === "published" && state.firstSaleShare;
  const [absolute, setAbsolute] = useState(() =>
    storeSlug ? getAbsoluteStoreUrl(storeSlug) : ""
  );

  useEffect(() => {
    if (!storeSlug) return;
    setAbsolute(`${window.location.origin}${getStoreUrl(storeSlug)}`);
  }, [storeSlug]);

  const path = storeSlug ? getStoreUrl(storeSlug) : "/";
  const whatsapp = useMemo(() => {
    if (!storeSlug) return "#";
    if (typeof window === "undefined") {
      return getStoreWhatsAppShareUrl(storeSlug, storeName);
    }
    const text = storeName
      ? `Shop ${storeName}: ${absolute}`
      : `Check out my store: ${absolute}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [absolute, storeName, storeSlug]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absolute);
      onShared?.();
      toast.success("Store link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-border/80 shadow-[0_16px_48px_-24px_rgba(15,23,42,0.45)]">
        {state.open && state.mode === "missing" ? (
          <>
            <DialogHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl tracking-[-0.02em]">
                Almost ready to publish
              </DialogTitle>
              <DialogDescription>
                Tap an item below to jump straight to that field.
              </DialogDescription>
            </DialogHeader>
            <ul className="mt-2 space-y-2">
              {state.issues.map((issue) => (
                <li key={issue.id}>
                  <button
                    type="button"
                    onClick={() => onGoToIssue?.(issue)}
                    className="flex w-full items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3.5 py-3 text-left transition-colors hover:border-amber-500/35 hover:bg-amber-500/[0.1]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-foreground">
                        {issue.label}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">
                        {issue.hint}
                      </span>
                      <span className="mt-1.5 inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-white/10 dark:text-amber-300">
                        {issue.where}
                      </span>
                    </span>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-amber-600/70" />
                  </button>
                </li>
              ))}
            </ul>
            <DialogFooter className="mt-3 gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="product-editor-btn-soft"
                onClick={onClose}
              >
                Close
              </Button>
              {firstIssue && onGoToIssue ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="product-editor-btn-soft-primary"
                  onClick={() => onGoToIssue(firstIssue)}
                >
                  Fix first issue
                </Button>
              ) : null}
            </DialogFooter>
          </>
        ) : null}

        {state.open && state.mode === "publishing" ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#007AFF]/15" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </span>
            </div>
            <div>
              <DialogTitle className="text-lg tracking-[-0.02em]">Publishing…</DialogTitle>
              <DialogDescription className="mt-1.5">
                Uploading{" "}
                <span className="font-medium text-foreground">
                  {state.title || "your product"}
                </span>{" "}
                to your storefront.
              </DialogDescription>
            </div>
          </div>
        ) : null}

        {state.open && state.mode === "published" ? (
          <>
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <DialogTitle className="text-xl tracking-[-0.02em]">
                  {firstSaleShare ? "Store is ready" : "Product published"}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  <span className="font-medium text-foreground">{state.title}</span> is live
                  on your store.
                  {firstSaleShare
                    ? " Share the link to get your first order."
                    : " Nice work."}
                </DialogDescription>
              </div>
            </div>
            {firstSaleShare && storeSlug ? (
              <div className="mt-2 flex flex-col gap-2">
                <Button
                  type="button"
                  className="h-10 w-full rounded-md bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                  asChild
                >
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onShared?.()}
                  >
                    Share on WhatsApp
                  </a>
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 flex-1 rounded-md"
                    onClick={() => void handleCopy()}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 flex-1 rounded-md"
                    asChild
                  >
                    <Link href={path} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      View live
                    </Link>
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 text-[12px] text-muted-foreground"
                  onClick={onViewCatalog}
                >
                  <Package className="mr-1.5 h-3.5 w-3.5" />
                  View catalog
                </Button>
              </div>
            ) : (
              <DialogFooter className="mt-2 sm:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="product-editor-btn-soft-primary h-10 px-5"
                  onClick={onViewCatalog}
                >
                  <Package className="mr-1.5 h-3.5 w-3.5" />
                  View catalog
                </Button>
              </DialogFooter>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
