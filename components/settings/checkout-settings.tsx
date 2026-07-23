"use client";

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

interface CheckoutSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

export function CheckoutSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: CheckoutSettingsProps) {
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
      kicker="Checkout"
      title="Orders & checkout"
      description="Shape what customers see when they buy — notes, minimums, and COD messaging."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save checkout"
    >
      <SettingsSection
        title="Order rules"
        description="Protect margins and set expectations before payment."
      >
        <SettingsField
          label={`Minimum order (${store.currency})`}
          htmlFor="min-order"
          hint="Set 0 to allow any order size."
        >
          <Input
            id="min-order"
            type="number"
            min={0}
            value={shop.minOrderAmount}
            onChange={(e) =>
              patchShop({ minOrderAmount: Number(e.target.value) || 0 })
            }
            className="h-11 max-w-xs rounded-xl bg-white dark:bg-transparent"
          />
        </SettingsField>

        <SettingsField label="Checkout note" htmlFor="checkout-note">
          <Textarea
            id="checkout-note"
            value={shop.checkoutNote}
            onChange={(e) => patchShop({ checkoutNote: e.target.value })}
            placeholder="Delivery in 24–48h · COD available nationwide"
            className="min-h-[80px] rounded-xl bg-white dark:bg-transparent"
            maxLength={280}
          />
        </SettingsField>

        <SettingsField label="Cash on delivery message" htmlFor="cod-message">
          <Textarea
            id="cod-message"
            value={shop.codMessage}
            onChange={(e) => patchShop({ codMessage: e.target.value })}
            placeholder="Pay the courier when your package arrives. No card needed."
            className="min-h-[80px] rounded-xl bg-white dark:bg-transparent"
            maxLength={280}
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection
        title="Announcement bar"
        description="A slim promo strip across the top of your storefront."
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-[#007AFF] focus:ring-[#007AFF]"
            checked={shop.announceBarEnabled}
            onChange={(e) => patchShop({ announceBarEnabled: e.target.checked })}
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900 dark:text-white">
              Show announcement bar
            </span>
            <span className="mt-0.5 block text-[12px] text-neutral-500">
              Great for free shipping, flash sales, or festival hours.
            </span>
          </span>
        </label>

        <SettingsField label="Bar text" htmlFor="announce-text">
          <Input
            id="announce-text"
            value={shop.announceBarText}
            onChange={(e) => patchShop({ announceBarText: e.target.value })}
            placeholder="Free shipping over 200 MAD this week"
            className="h-11 rounded-xl bg-white dark:bg-transparent"
            maxLength={120}
            disabled={!shop.announceBarEnabled}
          />
        </SettingsField>

        {shop.announceBarEnabled && shop.announceBarText.trim() ? (
          <div
            className="rounded-xl px-4 py-2.5 text-center text-[12px] font-medium tracking-wide text-white sm:text-[13px]"
            style={{ backgroundColor: store.primaryColor || "#007AFF" }}
          >
            {shop.announceBarText}
          </div>
        ) : null}
      </SettingsSection>

      <SettingsRelatedCard>
        Turn COD on or off under{" "}
        <SettingsRelatedLink tab="payment">Payments</SettingsRelatedLink>
        . Shipping zones live in{" "}
        <SettingsRelatedLink tab="shipping">Shipping</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
