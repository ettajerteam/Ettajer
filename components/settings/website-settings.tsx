"use client";

import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { StoreWebsiteAccess } from "@/components/shared/store-website-access";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";
import type { StoreWithSettings } from "@/lib/store-settings";

interface WebsiteSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function WebsiteSettings({ store, onChange, onSave, saving }: WebsiteSettingsProps) {
  const liveUrl = getAbsoluteStoreUrl(store.slug);
  const customDomain = store.settings.customDomain;

  return (
    <SettingsPanel
      kicker="Website"
      title="Public address"
      description="Control the link customers use to reach your storefront."
      onSave={onSave}
      saving={saving}
      saveLabel="Save website"
    >
      <div className="space-y-2">
        <Label>Live link</Label>
        <StoreWebsiteAccess storeSlug={store.slug} storeName={store.name} variant="inline" />
        <p className="truncate font-mono text-[12px] text-neutral-500">{liveUrl}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeSlug">Store URL slug</Label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500">
            /store/
          </span>
          <Input
            id="storeSlug"
            value={store.slug}
            onChange={(e) => {
              const next = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
              onChange({ slug: next });
            }}
            placeholder="my-store"
            className="h-11 rounded-xl font-mono"
          />
        </div>
        <p className="text-[12px] text-neutral-500">
          Changing the slug updates your public link. Old links will stop working.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[#007AFF]">
            <Link2 className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900">Custom domain</p>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
              {customDomain ? (
                <>
                  Connected:{" "}
                  <span className="font-mono text-neutral-900">{customDomain}</span>
                </>
              ) : (
                <>Use your own domain (shop.yourbrand.com) with DNS instructions and SSL.</>
              )}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
              <Link href="/dashboard/domains">
                {customDomain ? "Manage domain" : "Connect domain"}
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <StoreWebsiteAccess storeSlug={store.slug} storeName={store.name} variant="card" />
    </SettingsPanel>
  );
}
