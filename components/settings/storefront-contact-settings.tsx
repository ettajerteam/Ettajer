"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings } from "@/lib/store-settings";

interface StorefrontContactSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

export function StorefrontContactSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: StorefrontContactSettingsProps) {
  const shop = store.settings.shop;

  const patchShop = (patch: Partial<typeof shop>) => {
    onChange({
      settings: {
        ...store.settings,
        shop: { ...shop, ...patch },
      },
    });
  };

  return (
    <SettingsPanel
      kicker="Storefront"
      title="Customer contact"
      description="Show how shoppers can reach you on the live store — WhatsApp, phone, and email."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save contact"
    >
      <div className="space-y-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-[#007AFF] focus:ring-[#007AFF]"
            checked={shop.showContactOnStorefront}
            onChange={(e) =>
              patchShop({ showContactOnStorefront: e.target.checked })
            }
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900">
              Show contact details on storefront
            </span>
            <span className="mt-0.5 block text-[12px] text-neutral-500">
              Displays email, phone, and WhatsApp in the shop footer when available.
            </span>
          </span>
        </label>

        <div className="space-y-2">
          <Label htmlFor="shop-whatsapp">WhatsApp number</Label>
          <Input
            id="shop-whatsapp"
            value={shop.whatsapp ?? ""}
            onChange={(e) => patchShop({ whatsapp: e.target.value || null })}
            placeholder="2126XXXXXXXX"
            className="h-11 rounded-xl"
          />
          <p className="text-[12px] text-neutral-500">
            Country code without + (e.g. 2126…). Used for a WhatsApp chat link.
          </p>
        </div>

        <SettingsRelatedCard>
          <p className="font-medium text-neutral-800">Also shown from Store profile</p>
          <ul className="mt-2 space-y-1">
            <li>Email: {store.contactEmail || "—"}</li>
            <li>Phone: {store.phone || "—"}</li>
            <li>Address: {store.address || "—"}</li>
          </ul>
          <p className="mt-2 text-[12px]">
            Edit these under{" "}
            <SettingsRelatedLink tab="general">Store profile</SettingsRelatedLink>.
          </p>
        </SettingsRelatedCard>
      </div>
    </SettingsPanel>
  );
}
