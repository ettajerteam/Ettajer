"use client";

import { Banknote, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings } from "@/lib/store-settings";
import { cn } from "@/lib/utils";

interface PaymentSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

export function PaymentSettings({ store, onChange, onSave, saving, dirty }: PaymentSettingsProps) {
  const gateways = store.settings.paymentGateways;

  const updateGateways = (patch: Partial<typeof gateways>) => {
    onChange({
      settings: {
        ...store.settings,
        paymentGateways: { ...gateways, ...patch },
      },
    });
  };

  const handleStripeConnect = () => {
    toast.info("Stripe Connect integration coming soon. Enable the toggle to prepare your store.");
  };

  return (
    <SettingsPanel
      kicker="Payments"
      title="Checkout methods"
      description="Choose how customers pay — COD is the default for Moroccan shoppers."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save payments"
    >
      <div className="space-y-5">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-200",
            gateways.cashOnDelivery
              ? "border-[#007AFF]/30 bg-gradient-to-br from-[#007AFF]/[0.07] to-white shadow-[inset_0_0_0_1px_rgba(0,122,255,0.06)]"
              : "border-neutral-200/80 bg-white hover:border-neutral-300"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#007AFF]/10">
              <Banknote className="h-5 w-5 text-[#007AFF]" />
            </div>
            <div>
              <p className="font-medium tracking-[-0.01em]">Cash on delivery</p>
              <p className="text-[12px] text-neutral-500">Pay when the order arrives · Popular in Morocco</p>
            </div>
          </div>
          <Switch
            checked={gateways.cashOnDelivery}
            onCheckedChange={(checked) => {
              if (!checked && !gateways.stripe) {
                toast.error("Keep at least one payment method enabled");
                return;
              }
              updateGateways({ cashOnDelivery: checked });
            }}
          />
        </div>

        <div
          className={cn(
            "rounded-2xl border p-4 transition",
            gateways.stripe
              ? "border-neutral-300 bg-neutral-50/50"
              : "border-neutral-200/80 bg-white"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#635BFF]/10">
                <CreditCard className="h-5 w-5 text-[#635BFF]" />
              </div>
              <div>
                <p className="font-medium tracking-[-0.01em]">Stripe</p>
                <p className="text-[12px] text-neutral-500">Accept cards online</p>
              </div>
            </div>
            <Switch
              checked={gateways.stripe}
              onCheckedChange={(checked) => {
                if (!checked && !gateways.cashOnDelivery) {
                  toast.error("Keep at least one payment method enabled");
                  return;
                }
                updateGateways({ stripe: checked });
              }}
            />
          </div>

          {gateways.stripe ? (
            <div className="mt-4 space-y-3 border-t border-neutral-200/80 pt-4">
              {gateways.stripeAccountId ? (
                <p className="text-[13px] text-neutral-600">
                  Connected account:{" "}
                  <span className="font-mono text-neutral-900">{gateways.stripeAccountId}</span>
                </p>
              ) : (
                <p className="text-[13px] text-neutral-600">
                  Connect your Stripe account to receive card payments.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={handleStripeConnect}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                {gateways.stripeAccountId ? "Manage Stripe" : "Connect with Stripe"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {!gateways.stripe && !gateways.cashOnDelivery ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Enable at least one payment method so customers can checkout.
        </p>
      ) : null}

      <SettingsRelatedCard>
        Customize the COD message, minimum order, and announcement bar in{" "}
        <SettingsRelatedLink tab="checkout">Checkout settings</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
