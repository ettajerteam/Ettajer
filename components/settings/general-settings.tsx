"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Store,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsField,
  SettingsSection,
} from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings } from "@/lib/store-settings";
import { cn } from "@/lib/utils";

interface GeneralSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";
const AREA =
  "rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

const DESC_MAX = 280;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function GeneralSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: GeneralSettingsProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const checklist = useMemo(
    () => [
      { id: "name", label: "Name", done: Boolean(store.name.trim()) },
      { id: "logo", label: "Logo", done: Boolean(store.logo) },
      {
        id: "description",
        label: "Description",
        done: Boolean(store.description?.trim()),
      },
      {
        id: "email",
        label: "Email",
        done: Boolean(store.contactEmail?.trim()),
      },
      { id: "phone", label: "Phone", done: Boolean(store.phone?.trim()) },
      {
        id: "address",
        label: "Address",
        done: Boolean(store.address?.trim()),
      },
    ],
    [store]
  );
  const doneCount = checklist.filter((item) => item.done).length;
  const descLen = (store.description ?? "").length;
  const displayName = store.name.trim() || "Your store";
  const displayDescription =
    store.description?.trim() ||
    "Add a short description so shoppers know what you sell.";

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5 MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/store/logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");

      onChange({ logo: data.logo });
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  return (
    <SettingsPanel
      title="Profile"
      description="Brand identity and business contact shown across your shop and invoices."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save profile"
    >
      {/* Live preview */}
      <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-neutral-400">
            Customer preview
          </p>
          <p className="text-[10px] text-neutral-400">
            {doneCount}/{checklist.length} complete
          </p>
        </div>
        <div className="flex items-start gap-3 px-3.5 py-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-black/[0.06] bg-white dark:border-white/10 dark:bg-[#1C1C1E]">
            {store.logo ? (
              <Image
                src={store.logo}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="text-[12px] font-semibold tracking-tight text-neutral-400">
                {initials(displayName)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              {displayName}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {displayDescription}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {store.contactEmail?.trim() ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-neutral-500 ring-1 ring-black/[0.05] dark:bg-white/[0.04] dark:ring-white/10">
                  <Mail className="h-2.5 w-2.5" />
                  {store.contactEmail.trim()}
                </span>
              ) : null}
              {store.phone?.trim() ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-neutral-500 ring-1 ring-black/[0.05] dark:bg-white/[0.04] dark:ring-white/10">
                  <Phone className="h-2.5 w-2.5" />
                  {store.phone.trim()}
                </span>
              ) : null}
              {!store.contactEmail?.trim() && !store.phone?.trim() ? (
                <span className="text-[10px] text-neutral-400">
                  Add email or phone so shoppers can reach you
                </span>
              ) : null}
            </div>
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
        title="Brand"
        description="Logo and name shown on your storefront, checkout, and invoices."
      >
        <div
          className={cn(
            "flex flex-col gap-3 rounded-[10px] border border-dashed p-3 transition sm:flex-row sm:items-center",
            dragging
              ? "border-[#007AFF]/50 bg-[#007AFF]/[0.04]"
              : "border-black/[0.08] bg-white dark:border-white/15 dark:bg-transparent"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void uploadFile(file);
          }}
        >
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA] transition hover:border-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.04]"
            aria-label="Upload logo"
          >
            {store.logo ? (
              <Image
                src={store.logo}
                alt="Store logo"
                fill
                className="object-cover"
                unoptimized
              />
            ) : uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            ) : (
              <div className="flex flex-col items-center gap-0.5 text-neutral-400">
                <ImagePlus className="h-4 w-4" />
                <span className="text-[9px] font-medium">Logo</span>
              </div>
            )}
          </button>

          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[12px] font-medium text-neutral-800 dark:text-neutral-200">
              {store.logo ? "Store logo" : "Upload a logo"}
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              PNG or JPG · square works best · drag & drop or browse · max 5 MB
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Uploading…
                  </>
                ) : store.logo ? (
                  "Replace"
                ) : (
                  "Browse"
                )}
              </Button>
              {store.logo ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                  onClick={() => onChange({ logo: null })}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <SettingsField label="Store name" htmlFor="storeName">
          <div className="relative">
            <Store className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              id="storeName"
              value={store.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Wateqa Store"
              className={cn(FIELD, "pl-8 font-medium")}
            />
          </div>
        </SettingsField>

        <SettingsField
          label="Store description"
          htmlFor="description"
          hint={`${descLen}/${DESC_MAX} · Used as SEO fallback and footer tagline.`}
        >
          <Textarea
            id="description"
            rows={3}
            value={store.description ?? ""}
            maxLength={DESC_MAX}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Tell customers what makes your store special…"
            className={cn(AREA, "min-h-[72px]")}
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection
        title="Business contact"
        description="Shown on invoices and optionally on your storefront footer."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SettingsField label="Contact email" htmlFor="contactEmail">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                id="contactEmail"
                type="email"
                value={store.contactEmail ?? ""}
                onChange={(e) => onChange({ contactEmail: e.target.value })}
                placeholder="hello@yourstore.com"
                className={cn(FIELD, "pl-8")}
              />
            </div>
          </SettingsField>
          <SettingsField label="Phone number" htmlFor="phone">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                id="phone"
                value={store.phone ?? ""}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+212 6 00 00 00 00"
                className={cn(FIELD, "pl-8")}
              />
            </div>
          </SettingsField>
        </div>

        <SettingsField label="Store address" htmlFor="address">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Textarea
              id="address"
              rows={2}
              value={store.address ?? ""}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Street, city, country"
              className={cn(AREA, "min-h-[56px] pl-8")}
            />
          </div>
        </SettingsField>
      </SettingsSection>

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Control WhatsApp and footer visibility in{" "}
        <SettingsRelatedLink tab="contact">Contact</SettingsRelatedLink>
        . SEO titles live under{" "}
        <SettingsRelatedLink tab="seo">SEO</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
