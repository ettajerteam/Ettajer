"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAbsoluteStoreUrl, getStoreUrl } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

interface StoreWebsiteAccessProps {
  storeSlug: string;
  storeName?: string;
  /** compact = header chip; card = dashboard panel; inline = settings row */
  variant?: "compact" | "card" | "inline";
  className?: string;
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function useLiveStoreUrls(storeSlug: string, storeName?: string) {
  const path = getStoreUrl(storeSlug);
  // Seed with a hydration-safe absolute URL (same on server + first client paint).
  const [absolute, setAbsolute] = useState(() => getAbsoluteStoreUrl(storeSlug));

  useEffect(() => {
    // Align share/copy links with the browser origin after mount.
    setAbsolute(`${window.location.origin}${path}`);
  }, [path]);

  const text = storeName
    ? `Shop ${storeName}: ${absolute}`
    : `Check out my store: ${absolute}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(absolute)}`;

  return { path, absolute, whatsapp, qr };
}

export function StoreWebsiteAccess({
  storeSlug,
  storeName,
  variant = "compact",
  className,
}: StoreWebsiteAccessProps) {
  const [copied, setCopied] = useState(false);
  const { path, absolute, whatsapp, qr } = useLiveStoreUrls(storeSlug, storeName);

  async function handleCopy() {
    try {
      await copyText(absolute);
      setCopied(true);
      toast.success("Store link copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy link");
    }
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-neutral-200 bg-white px-3 text-xs font-medium dark:border-white/10 dark:bg-[#161616]"
          asChild
        >
          <Link href={path} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            View live
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-neutral-500"
          onClick={() => void handleCopy()}
          aria-label="Copy store link"
          title="Copy store link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-neutral-500"
              aria-label="Share store"
              title="Share store"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <StoreShareDialogContent
            storeName={storeName}
            absolute={absolute}
            path={path}
            whatsapp={whatsapp}
            qr={qr}
            onCopy={() => void handleCopy()}
            copied={copied}
          />
        </Dialog>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <code
          className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
          suppressHydrationWarning
        >
          {absolute}
        </code>
        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" asChild>
          <Link href={path} target="_blank" rel="noopener noreferrer">
            Open
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => void handleCopy()}>
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" asChild>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#161616]",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Your website
          </p>
          <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
            {storeName ?? "Live storefront"}
          </p>
          <p className="mt-1 truncate font-mono text-xs text-neutral-500" suppressHydrationWarning>
            {absolute}
          </p>
        </div>
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Store QR code" className="h-full w-full object-contain p-1" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" className="h-9 rounded-lg bg-[#007AFF] text-xs hover:bg-[#0066d6]" asChild>
          <Link href={path} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Open live site
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="h-9 rounded-lg text-xs" onClick={() => void handleCopy()}>
          {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="outline" size="sm" className="h-9 rounded-lg text-xs" asChild>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            Share on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

function StoreShareDialogContent({
  storeName,
  absolute,
  path,
  whatsapp,
  qr,
  onCopy,
  copied,
}: {
  storeName?: string;
  absolute: string;
  path: string;
  whatsapp: string;
  qr: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-[#007AFF]" />
          Share your website
        </DialogTitle>
        <DialogDescription>
          {storeName
            ? `Send customers to ${storeName} with a link or QR code.`
            : "Send customers to your live storefront."}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code" width={160} height={160} className="h-40 w-40" />
        </div>
        <p
          className="w-full break-all rounded-lg bg-neutral-50 px-3 py-2 text-center font-mono text-[11px] text-neutral-600"
          suppressHydrationWarning
        >
          {absolute}
        </p>
        <div className="flex w-full flex-wrap gap-2">
          <Button className="flex-1 rounded-lg bg-[#007AFF] hover:bg-[#0066d6]" asChild>
            <Link href={path} target="_blank" rel="noopener noreferrer">
              Open
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 rounded-lg" onClick={onCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" className="flex-1 rounded-lg" asChild>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
