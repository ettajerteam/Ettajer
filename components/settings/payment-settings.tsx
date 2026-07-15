"use client";

import { CreditCard, Banknote, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DashboardCardSection } from "@/components/dashboard/dashboard-card-section";
import type { StoreWithSettings } from "@/lib/store-settings";

interface PaymentSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function PaymentSettings({ store, onChange, onSave, saving }: PaymentSettingsProps) {
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
    <DashboardCardSection
      title="Payment methods"
      description="Choose how customers can pay at checkout."
      footer={
        <Button onClick={onSave} loading={saving} className="bg-[#007AFF] hover:bg-[#0071EB]">
          Save payment settings
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF]/10">
              <CreditCard className="h-5 w-5 text-[#635BFF]" />
            </div>
            <div>
              <p className="font-medium">Stripe</p>
              <p className="text-xs text-muted-foreground">Accept cards online</p>
            </div>
          </div>
          <Switch
            checked={gateways.stripe}
            onCheckedChange={(checked) => updateGateways({ stripe: checked })}
          />
        </div>

        {gateways.stripe && (
          <div className="rounded-xl border border-dashed p-4 space-y-3 ml-2">
            {gateways.stripeAccountId ? (
              <p className="text-sm text-muted-foreground">
                Connected account: <span className="font-mono">{gateways.stripeAccountId}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connect your Stripe account to receive card payments.
              </p>
            )}
            <Button type="button" variant="outline" size="sm" onClick={handleStripeConnect}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              {gateways.stripeAccountId ? "Manage Stripe" : "Connect with Stripe"}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#007AFF]/10">
              <Banknote className="h-5 w-5 text-[#007AFF]" />
            </div>
            <div>
              <p className="font-medium">Cash on delivery</p>
              <p className="text-xs text-muted-foreground">Popular in Morocco & MENA</p>
            </div>
          </div>
          <Switch
            checked={gateways.cashOnDelivery}
            onCheckedChange={(checked) => updateGateways({ cashOnDelivery: checked })}
          />
        </div>
      </div>

      {!gateways.stripe && !gateways.cashOnDelivery && (
        <p className="text-sm text-amber-600 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3">
          Enable at least one payment method for customers to checkout.
        </p>
      )}

    </DashboardCardSection>
  );
}
