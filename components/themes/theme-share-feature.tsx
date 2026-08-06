"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StoreShareDialog } from "@/components/shared/store-share-dialog";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";
import {
  dashboardCard,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemeShareFeatureProps {
  storeSlug: string;
  storeName?: string;
}

/** Themes page — share store (QR + link + social), matches share dialog style. */
export function ThemeShareFeature({ storeSlug, storeName }: ThemeShareFeatureProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [absolute, setAbsolute] = useState(() => getAbsoluteStoreUrl(storeSlug));

  useEffect(() => {
    setAbsolute(`${window.location.origin}/store/${storeSlug}`);
  }, [storeSlug]);

  const qrPreview = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(absolute)}`,
    [absolute]
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <>
      <section className={cn(dashboardCard, "overflow-hidden")}>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 bg-[#F5F5F7] p-2 dark:bg-white/[0.06]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrPreview}
                alt="Store QR code"
                width={72}
                height={72}
                className="block h-[72px] w-[72px] bg-white"
                suppressHydrationWarning
              />
            </div>
            <div className="min-w-0">
              <h2 className={dashboardTitle}>Share your store</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                QR code, social links, and copy for customers
              </p>
              <p
                className="mt-1.5 truncate font-sans text-[11px] text-neutral-500"
                suppressHydrationWarning
                title={absolute}
              >
                {absolute}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <Button
              className={cn(dashboardPrimaryBtn, "h-7 px-2.5")}
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="mr-1.5 h-3 w-3" />
              Share
            </Button>
            <Button
              variant="outline"
              className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
              onClick={() => void handleCopy()}
            >
              {copied ? (
                <Check className="mr-1.5 h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="mr-1.5 h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      </section>

      <StoreShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        storeSlug={storeSlug}
        storeName={storeName}
      />
    </>
  );
}
