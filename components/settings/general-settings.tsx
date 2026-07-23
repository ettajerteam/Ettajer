"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
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

interface GeneralSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

export function GeneralSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: GeneralSettingsProps) {
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/store/logo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");

      onChange({ logo: data.logo });
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SettingsPanel
      kicker="Store profile"
      title="Basic information"
      description="How your store appears to customers — name, logo, and how they can reach you."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save profile"
    >
      <SettingsSection
        title="Brand"
        description="Logo and name shown across your storefront and checkout."
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/10">
            {store.logo ? (
              <Image src={store.logo} alt="Logo" fill className="object-cover" unoptimized />
            ) : uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            ) : (
              <Upload className="h-5 w-5 text-neutral-400" />
            )}
          </div>
          <div className="space-y-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
              <span className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/5">
                {uploading ? "Uploading…" : "Upload logo"}
              </span>
            </label>
            {store.logo ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive"
                onClick={() => onChange({ logo: null })}
              >
                Remove
              </Button>
            ) : null}
            <p className="text-[12px] text-neutral-500">PNG or JPG, square works best.</p>
          </div>
        </div>

        <SettingsField label="Store name" htmlFor="storeName">
          <Input
            id="storeName"
            value={store.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="h-11 rounded-xl bg-white dark:bg-transparent"
          />
        </SettingsField>

        <SettingsField
          label="Store description"
          htmlFor="description"
          hint="Used in SEO fallbacks and your store footer tagline."
        >
          <Textarea
            id="description"
            rows={3}
            value={store.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Tell customers what makes your store special…"
            className="rounded-xl bg-white dark:bg-transparent"
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection
        title="Business contact"
        description="Shown on invoices and optionally on your storefront footer."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SettingsField label="Contact email" htmlFor="contactEmail">
            <Input
              id="contactEmail"
              type="email"
              value={store.contactEmail ?? ""}
              onChange={(e) => onChange({ contactEmail: e.target.value })}
              placeholder="hello@yourstore.com"
              className="h-11 rounded-xl bg-white dark:bg-transparent"
            />
          </SettingsField>
          <SettingsField label="Phone number" htmlFor="phone">
            <Input
              id="phone"
              value={store.phone ?? ""}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+212 6 00 00 00 00"
              className="h-11 rounded-xl bg-white dark:bg-transparent"
            />
          </SettingsField>
        </div>

        <SettingsField label="Store address" htmlFor="address">
          <Textarea
            id="address"
            rows={2}
            value={store.address ?? ""}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Street, city, country"
            className="rounded-xl bg-white dark:bg-transparent"
          />
        </SettingsField>
      </SettingsSection>

      <SettingsRelatedCard>
        Control WhatsApp and footer visibility in{" "}
        <SettingsRelatedLink tab="contact">Storefront contact</SettingsRelatedLink>
        . SEO titles live under{" "}
        <SettingsRelatedLink tab="seo">SEO</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
