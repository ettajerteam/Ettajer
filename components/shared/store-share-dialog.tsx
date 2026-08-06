"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface StoreShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeSlug: string;
  storeName?: string;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.717-8.739L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.16 15.7a6.34 6.34 0 0010.94 4.36V9.79a8.23 8.23 0 004.86 1.57V7.9a4.85 4.85 0 01-.37-.21z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

type SocialAction =
  | { id: string; label: string; href: string; color: string; icon: ReactNode }
  | { id: string; label: string; href?: undefined; color: string; icon: ReactNode; copyOnly: true };

export function StoreShareDialog({
  open,
  onOpenChange,
  storeSlug,
  storeName,
}: StoreShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [absolute, setAbsolute] = useState(() => getAbsoluteStoreUrl(storeSlug));

  useEffect(() => {
    setAbsolute(`${window.location.origin}/store/${storeSlug}`);
  }, [storeSlug]);

  const qrUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(absolute)}`,
    [absolute]
  );
  const qrPreview = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(absolute)}`,
    [absolute]
  );

  const shareText = storeName
    ? `Shop ${storeName}: ${absolute}`
    : `Check out my store: ${absolute}`;

  const socials: SocialAction[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      color: "bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/18",
      icon: <WhatsAppIcon className="h-4 w-4" />,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absolute)}`,
      color: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/18",
      icon: <FacebookIcon className="h-4 w-4" />,
    },
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(absolute)}&text=${encodeURIComponent(shareText)}`,
      color: "bg-neutral-900/5 text-neutral-900 hover:bg-neutral-900/10 dark:bg-white/10 dark:text-white",
      icon: <XIcon className="h-3.5 w-3.5" />,
    },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(absolute)}&text=${encodeURIComponent(shareText)}`,
      color: "bg-[#26A5E4]/10 text-[#229ED9] hover:bg-[#26A5E4]/18",
      icon: <TelegramIcon className="h-4 w-4" />,
    },
    {
      id: "instagram",
      label: "Instagram",
      copyOnly: true,
      color: "bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/18",
      icon: <InstagramIcon className="h-4 w-4" />,
    },
    {
      id: "tiktok",
      label: "TikTok",
      copyOnly: true,
      color: "bg-neutral-900/5 text-neutral-900 hover:bg-neutral-900/10 dark:bg-white/10 dark:text-white",
      icon: <TikTokIcon className="h-4 w-4" />,
    },
  ];

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

  async function handleCopyForSocial(label: string) {
    try {
      await navigator.clipboard.writeText(absolute);
      toast.success(`Link copied — paste it in ${label}`);
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function handleDownloadQr() {
    setDownloading(true);
    try {
      const res = await fetch(qrUrl);
      if (!res.ok) throw new Error("Failed to fetch QR");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${storeSlug}-store-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("QR code downloaded");
    } catch {
      // Fallback: open image in new tab
      window.open(qrUrl, "_blank", "noopener,noreferrer");
      toast.message("Opened QR image — save it from there");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[min(100vw-1.5rem,320px)] max-w-[320px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10"
        )}
      >
        <DialogHeader className="space-y-0 px-5 pb-0 pt-3.5 pr-10 text-left">
          <DialogTitle className="text-[13px] font-semibold tracking-[-0.02em]">
            Share store
          </DialogTitle>
          <DialogDescription className="sr-only">
            {storeName
              ? `QR code and links for ${storeName}`
              : "QR code and social links for your live store"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 px-5 pb-4 pt-2.5">
          {/* Side space so QR stays clear of dialog edges; square QR (no rounded crop) */}
          <div className="flex w-full justify-center px-4">
            <div className="bg-[#F5F5F7] p-3 dark:bg-white/[0.06]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrPreview}
                alt="Store QR code"
                width={120}
                height={120}
                className="block h-[120px] w-[120px] bg-white"
                suppressHydrationWarning
              />
            </div>
          </div>

          <div className="flex w-full items-center gap-1.5 rounded-lg bg-[#F5F5F7] px-2 py-1.5 dark:bg-white/[0.06]">
            <p
              className="min-w-0 flex-1 truncate font-sans text-[11px] font-normal tracking-normal text-neutral-500"
              suppressHydrationWarning
              title={absolute}
            >
              {absolute}
            </p>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md bg-white px-1.5 font-sans text-[10px] font-medium text-neutral-700 ring-1 ring-black/[0.06] transition-colors hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex w-full items-center justify-between gap-1">
            {socials.map((s) =>
              "copyOnly" in s && s.copyOnly ? (
                <button
                  key={s.id}
                  type="button"
                  title={s.label}
                  aria-label={s.label}
                  onClick={() => void handleCopyForSocial(s.label)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    s.color
                  )}
                >
                  {s.icon}
                </button>
              ) : (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  aria-label={s.label}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    s.color
                  )}
                >
                  {s.icon}
                </a>
              )
            )}
          </div>

          <div className="flex w-full gap-1.5">
            <Button
              className={cn(dashboardPrimaryBtn, "h-7 flex-1 px-2")}
              loading={downloading}
              onClick={() => void handleDownloadQr()}
            >
              <Download className="mr-1 h-3 w-3" />
              Download QR
            </Button>
            <Button
              variant="ghost"
              className="h-7 rounded-md px-2.5 text-[11px] text-neutral-500"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
