"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Link2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsField,
  SettingsSection,
} from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import {
  getAbsoluteStoreUrl,
  getStoreQrImageUrl,
  getStoreUrl,
  getStoreWhatsAppShareUrl,
} from "@/lib/storefront-urls";
import type { StoreWithSettings } from "@/lib/store-settings";
import { cn } from "@/lib/utils";

interface WebsiteSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white font-sans text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function WebsiteSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: WebsiteSettingsProps) {
  const [copied, setCopied] = useState(false);
  const [absoluteUrl, setAbsoluteUrl] = useState(() =>
    getAbsoluteStoreUrl(store.slug)
  );

  const path = getStoreUrl(store.slug);
  const customDomain = store.settings.customDomain?.trim() || null;
  const slugClean = store.slug.trim().replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  const slugValid = SLUG_RE.test(slugClean) && slugClean.length >= 2;
  const qrUrl = getStoreQrImageUrl(store.slug, 140);
  const whatsapp = getStoreWhatsAppShareUrl(store.slug, store.name);

  useEffect(() => {
    setAbsoluteUrl(`${window.location.origin}${path}`);
  }, [path]);

  const displayHost = useMemo(() => {
    if (customDomain) return customDomain;
    try {
      return new URL(absoluteUrl).host + path;
    } catch {
      return absoluteUrl.replace(/^https?:\/\//, "");
    }
  }, [absoluteUrl, customDomain, path]);

  const checklist = useMemo(
    () => [
      { id: "slug", label: "URL slug", done: slugValid },
      { id: "live", label: "Live link", done: slugValid },
      { id: "domain", label: "Custom domain", done: Boolean(customDomain) },
    ],
    [customDomain, slugValid]
  );
  const doneCount = checklist.filter((item) => item.done).length;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Store link copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <SettingsPanel
      title="Website"
      description="The public link customers use to open your storefront."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save website"
    >
      {/* Live link preview */}
      <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-neutral-400">
            Live storefront
          </p>
          <p className="text-[10px] text-neutral-400">
            {doneCount}/{checklist.length} ready
          </p>
        </div>

        <div className="flex items-start gap-3 px-3.5 py-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.06] bg-white dark:border-white/10 dark:bg-[#1C1C1E]">
            <Globe2 className="h-4 w-4 text-[#007AFF]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {store.name.trim() || "Your store"}
              </p>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  slugValid
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                )}
              >
                {slugValid ? "Live" : "Invalid slug"}
              </span>
              {customDomain ? (
                <span className="rounded-md bg-[#007AFF]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#007AFF]">
                  Custom domain
                </span>
              ) : null}
            </div>
            <p
              className="mt-1 truncate font-sans text-[11px] text-neutral-500 dark:text-neutral-400"
              suppressHydrationWarning
            >
              {displayHost}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                asChild
              >
                <Link href={path} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3 w-3" />
                  Open
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                onClick={() => void handleCopy()}
              >
                {copied ? (
                  <Check className="mr-1.5 h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="mr-1.5 h-3 w-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                asChild
              >
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <Share2 className="mr-1.5 h-3 w-3" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
          <div className="hidden h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] border border-black/[0.06] bg-white p-1 sm:block dark:border-white/10 dark:bg-[#1C1C1E]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Store QR code"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-t border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          {checklist.map((item) => (
            <span
              key={item.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                item.done
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-black/[0.03] text-neutral-400 dark:bg-white/[0.04]"
              )}
            >
              {item.done ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full border border-current opacity-40" />
              )}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <SettingsSection
        title="Store URL"
        description="Lowercase letters, numbers, and hyphens. Changing this breaks old links."
      >
        <SettingsField
          label="Slug"
          htmlFor="storeSlug"
          hint={
            slugValid
              ? `Customers reach you at ${path}`
              : "Use at least 2 characters · letters, numbers, hyphens only"
          }
        >
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-9 shrink-0 items-center rounded-md border border-black/[0.06] bg-[#F5F5F7] px-2.5 font-sans text-[12px] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04]">
              /store/
            </span>
            <Input
              id="storeSlug"
              value={store.slug}
              onChange={(e) => {
                const next = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
                  .replace(/-+/g, "-")
                  .replace(/^-+/, "");
                onChange({ slug: next });
              }}
              onBlur={() => {
                const cleaned = store.slug.replace(/-+$/g, "");
                if (cleaned !== store.slug) onChange({ slug: cleaned });
              }}
              placeholder="my-store"
              className={cn(
                FIELD,
                !slugValid &&
                  store.slug.length > 0 &&
                  "border-amber-400 focus-visible:ring-amber-400/30"
              )}
              aria-invalid={!slugValid}
            />
          </div>
        </SettingsField>

        <div className="flex items-start gap-2 rounded-[10px] border border-black/[0.05] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
          <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
              Full link
            </p>
            <p
              className="mt-0.5 break-all font-sans text-[11px] text-neutral-400"
              suppressHydrationWarning
            >
              {absoluteUrl}
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Custom domain"
        description="Use your own domain with DNS setup and SSL."
        action={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
          >
            <Link href="/dashboard/domains">
              {customDomain ? "Manage" : "Connect"}
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        }
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
              customDomain
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-[#007AFF]/10 text-[#007AFF]"
            )}
          >
            <Globe2 className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            {customDomain ? (
              <>
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  Connected
                </p>
                <p className="mt-0.5 truncate font-sans text-[12px] text-neutral-500">
                  {customDomain}
                </p>
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Shoppers can open your store on this domain instead of the
                  default /store/ link.
                </p>
              </>
            ) : (
              <>
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  No domain yet
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                  Connect something like{" "}
                  <span className="font-sans text-neutral-600 dark:text-neutral-300">
                    shop.yourbrand.com
                  </span>{" "}
                  for a branded storefront address.
                </p>
              </>
            )}
          </div>
        </div>
      </SettingsSection>

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Update how you appear in search under{" "}
        <SettingsRelatedLink tab="seo">SEO</SettingsRelatedLink>
        . Brand name and logo live in{" "}
        <SettingsRelatedLink tab="general">Profile</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
