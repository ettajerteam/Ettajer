"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardCardSection } from "@/components/dashboard/dashboard-card-section";
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
    <DashboardCardSection
      title="General"
      description="Basic information about your store."
      footer={
        <Button onClick={onSave} loading={saving} className="bg-[#007AFF] hover:bg-[#0071EB]">
          Save general settings
        </Button>
      }
    >
      <div className="space-y-2">
        <Label>Store logo</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-xl border bg-muted overflow-hidden flex items-center justify-center">
            {store.logo ? (
              <Image src={store.logo} alt="Logo" fill className="object-cover" unoptimized />
            ) : uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
            <span className="inline-flex items-center justify-center rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
              {uploading ? "Uploading…" : "Upload logo"}
            </span>
          </label>
          {store.logo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange({ logo: null })}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeName">Store name</Label>
        <Input
          id="storeName"
          value={store.name}
          onChange={(e) => onChange({ name: e.target.value })}
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
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={store.contactEmail ?? ""}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            placeholder="hello@yourstore.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            value={store.phone ?? ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+212 6 00 00 00 00"
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
        />
      </div>

    </DashboardCardSection>
  );
}
