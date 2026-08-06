"use client";

import Link from "next/link";
import {
  Bell,
  HelpCircle,
  Mail,
  MessageSquare,
  Package,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsSection } from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings } from "@/lib/store-settings";
import type { NotificationAlerts } from "@/lib/shop-preferences";
import { cn } from "@/lib/utils";

interface NotificationSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

type AlertKey = keyof NotificationAlerts;

const DASHBOARD_ROWS: {
  key: AlertKey;
  title: string;
  description: string;
  icon: typeof Bell;
}[] = [
  {
    key: "orders",
    title: "New orders",
    description: "Notify when a customer places an order.",
    icon: ShoppingBag,
  },
  {
    key: "orderStatus",
    title: "Order status updates",
    description: "Notify when an order status changes.",
    icon: Bell,
  },
  {
    key: "messages",
    title: "Messages",
    description: "Alert when shoppers send a contact form message.",
    icon: MessageSquare,
  },
  {
    key: "stock",
    title: "Stock",
    description: "Warn when products are low or out of stock.",
    icon: Package,
  },
  {
    key: "abandoned",
    title: "Abandoned carts",
    description: "Alert when a shopper leaves checkout unfinished.",
    icon: ShoppingCart,
  },
];

export function NotificationSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty = false,
}: NotificationSettingsProps) {
  const alerts = store.settings.shop.alerts;

  const patchAlerts = (patch: Partial<NotificationAlerts>) => {
    onChange({
      settings: {
        ...store.settings,
        shop: {
          ...store.settings.shop,
          alerts: { ...alerts, ...patch },
        },
      },
    });
  };

  const enabledCount = DASHBOARD_ROWS.filter((r) => alerts[r.key]).length;

  return (
    <SettingsPanel
      title="Notifications"
      description="Choose what appears in the dashboard bell and email alerts."
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      saveLabel="Save notifications"
      action={
        <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
          <Link href="/dashboard/settings/email">
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Email setup
          </Link>
        </Button>
      }
    >
      <SettingsSection
        title="Dashboard bell"
        description={`${enabledCount} of ${DASHBOARD_ROWS.length} alert types enabled in the header popup.`}
      >
        <div className="space-y-2">
          {DASHBOARD_ROWS.map((row) => {
            const Icon = row.icon;
            const checked = alerts[row.key];
            return (
              <label
                key={row.key}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      checked
                        ? "bg-[#007AFF]/10 text-[#007AFF]"
                        : "bg-neutral-100 text-neutral-400 dark:bg-white/10"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                      {row.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                      {row.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={checked}
                  onCheckedChange={(v) => patchAlerts({ [row.key]: v })}
                />
              </label>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Email to you"
        description="Merchant inbox alerts — separate from customer order emails."
      >
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                alerts.merchantEmail
                  ? "bg-[#007AFF]/10 text-[#007AFF]"
                  : "bg-neutral-100 text-neutral-400 dark:bg-white/10"
              )}
            >
              <Mail className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                New order email
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Email your store contact when a customer places an order.
              </p>
            </div>
          </div>
          <Switch
            checked={alerts.merchantEmail}
            onCheckedChange={(v) => patchAlerts({ merchantEmail: v })}
          />
        </label>

        <div className="rounded-[10px] border border-dashed border-black/[0.08] bg-[#FAFAFA]/80 px-3.5 py-3 dark:border-white/15 dark:bg-white/[0.02]">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <p className="text-[11px] leading-relaxed text-neutral-500">
              Customer-facing order status emails are sent from{" "}
              <Link
                href="/dashboard/settings/email"
                className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
              >
                Email settings
              </Link>{" "}
              when a provider is connected. Use the order page notify-customer
              checkbox when updating status.
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Related:{" "}
        <SettingsRelatedLink tab="checkout">Checkout</SettingsRelatedLink>
        {" · "}
        <Link
          href="/dashboard/settings/email"
          className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
        >
          Email
        </Link>
        {" · "}
        <Link
          href="/dashboard/messages"
          className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
        >
          Messages
        </Link>
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
