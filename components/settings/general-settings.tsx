"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SettingsPanel } from "@/components/settings/settings-panel";
import type { StoreWithSettings } from "@/lib/store-settings";

interface GeneralSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function GeneralSettings({ store, onChange, onSave, saving }: GeneralSettingsProps) {
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
      saveLabel="Save profile"
    >
      <div className="space-y-2">
        <Label>Store logo</Label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
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
              <span className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-50">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeName">Store name</Label>
        <Input
          id="storeName"
          value={store.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Store description</Label>
        <Textarea
          id="description"
          rows={4}
          value={store.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Tell customers what makes your store special…"
          className="rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={store.contactEmail ?? ""}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            placeholder="hello@yourstore.com"
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            value={store.phone ?? ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+212 6 00 00 00 00"
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Store address</Label>
        <Textarea
          id="address"
          rows={2}
          value={store.address ?? ""}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Street, city, country"
          className="rounded-xl"
        />
      </div>
    </SettingsPanel>
  );
}
