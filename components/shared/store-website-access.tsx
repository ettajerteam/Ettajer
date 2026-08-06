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
  variant?: "compact" | "card" | "inline";
  className?: string;
  labels?: {
    yourWebsite?: string;
    liveStorefront?: string;
    openLiveStore?: string;
    copyLink?: string;
    copied?: string;
    shareWhatsApp?: string;
  };
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function useLiveStoreUrls(storeSlug: string, storeName?: string) {
  const path = getStoreUrl(storeSlug);
  const [absolute, setAbsolute] = useState(() => getAbsoluteStoreUrl(storeSlug));

  useEffect(() => {
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
  labels,
}: StoreWebsiteAccessProps) {
  const [copied, setCopied] = useState(false);
  const { path, absolute, whatsapp, qr } = useLiveStoreUrls(storeSlug, storeName);
  const t = {
    yourWebsite: labels?.yourWebsite ?? "Your website",
    liveStorefront: labels?.liveStorefront ?? "Live storefront",
    openLiveStore: labels?.openLiveStore ?? "Open live store",
    copyLink: labels?.copyLink ?? "Copy link",
    copied: labels?.copied ?? "Copied",
    shareWhatsApp: labels?.shareWhatsApp ?? "Share on WhatsApp",
  };

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
          className="h-9 rounded-full border-black/[0.08] bg-white px-3.5 text-xs font-medium dark:border-white/10 dark:bg-[#161616]"
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
          className="h-9 w-9 rounded-full text-neutral-500"
          onClick={() => void handleCopy()}
          aria-label="Copy store link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-neutral-500"
              aria-label="Share store"
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
        <Button variant="outline" size="sm" className="h-8 rounded-full text-xs" asChild>
          <Link href={path} target="_blank" rel="noopener noreferrer">
            Open
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-full text-xs"
          onClick={() => void handleCopy()}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="outline" size="sm" className="h-8 rounded-full text-xs" asChild>
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
        "rounded-[12px] border border-black/[0.06] bg-white p-4 dark:border-white/[0.08] dark:bg-[#1C1C1E]",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
            {t.yourWebsite}
          </p>
          <p className="mt-1 text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {storeName ?? t.liveStorefront}
          </p>
          <p
            className="mt-1 truncate font-mono text-[11px] text-neutral-400"
            suppressHydrationWarning
          >
            {absolute}
          </p>
        </div>
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.04]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Store QR code" className="h-full w-full object-contain p-1" />
        </div>
      </div>
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        <Button
          size="sm"
          className="h-7 rounded-md border border-black/[0.06] bg-[#F5F5F7] px-2.5 text-[11px] font-medium text-neutral-700 shadow-none hover:bg-neutral-200/80 dark:border-white/10 dark:bg-white/[0.08] dark:text-neutral-100 dark:hover:bg-white/[0.12]"
          asChild
        >
          <Link href={path} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3 w-3" />
            {t.openLiveStore}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-md border-black/[0.08] text-[11px] dark:border-white/10"
          onClick={() => void handleCopy()}
        >
          {copied ? <Check className="mr-1.5 h-3 w-3" /> : <Copy className="mr-1.5 h-3 w-3" />}
          {copied ? t.copied : t.copyLink}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-md border-black/[0.08] text-[11px] dark:border-white/10"
          asChild
        >
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            {t.shareWhatsApp}
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
    <DialogContent className="max-w-sm rounded-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-[17px]">
          <QrCode className="h-4 w-4 text-neutral-500" />
          Share your website
        </DialogTitle>
        <DialogDescription>
          {storeName
            ? `Send customers to ${storeName} with a link or QR code.`
            : "Send customers to your live storefront."}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code" width={160} height={160} className="h-40 w-40" />
        </div>
        <p
          className="w-full break-all rounded-xl bg-neutral-50 px-3 py-2 text-center font-mono text-[11px] text-neutral-600"
          suppressHydrationWarning
        >
          {absolute}
        </p>
        <div className="flex w-full flex-wrap gap-2">
          <Button
            className="flex-1 rounded-full bg-neutral-900 text-white hover:bg-neutral-800"
            asChild
          >
            <Link href={path} target="_blank" rel="noopener noreferrer">
              Open
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 rounded-full" onClick={onCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" className="flex-1 rounded-full" asChild>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
