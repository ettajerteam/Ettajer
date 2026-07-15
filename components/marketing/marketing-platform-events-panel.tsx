"use client";

import { Activity, Eye, ShoppingBag, ShoppingCart, CreditCard } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import type { MarketingPlatformConfig, MarketingPlatformLink } from "@/lib/marketing-integrations";

interface MarketingPlatformEventsPanelProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
  onChange: (patch: Partial<MarketingPlatformLink>) => void;
}

const EVENT_TOGGLES = [
  {
    key: "trackPageViews" as const,
    label: "Page views",
    description: "Track visits across your storefront",
    icon: Activity,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10",
  },
  {
    key: "trackViewContent" as const,
    label: "Product views",
    description: "Fire when a customer opens a product page",
    icon: Eye,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    key: "trackAddToCart" as const,
    label: "Add to cart",
    description: "Fire when items are added to the cart",
    icon: ShoppingCart,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    key: "trackInitiateCheckout" as const,
    label: "Checkout started",
    description: "Fire when checkout begins with items in cart",
    icon: CreditCard,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    key: "trackPurchases" as const,
    label: "Purchases",
    description: "Send order value on confirmation page",
    icon: ShoppingBag,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

export function MarketingPlatformEventsPanel({
  platform,
  link,
  onChange,
}: MarketingPlatformEventsPanelProps) {
  return (
    <section className={dashboardCard}>
      <div className={`${dashboardCardPad} border-b border-border/70`}>
        <h3 className="text-base font-semibold tracking-[-0.02em]">Events & tracking</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which customer actions are sent to {platform.name}.
        </p>
      </div>

      <div className={`${dashboardCardPad} space-y-3`}>
        {EVENT_TOGGLES.map((toggle) => {
          const Icon = toggle.icon;
          return (
            <div
              key={toggle.key}
              className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toggle.bg}`}>
                  <Icon className={`h-4 w-4 ${toggle.color}`} />
                </div>
                <div>
                  <p className="font-medium">{toggle.label}</p>
                  <p className="text-xs text-muted-foreground">{toggle.description}</p>
                </div>
              </div>
              <Switch
                checked={link[toggle.key]}
                disabled={!link.enabled}
                onCheckedChange={(checked) => onChange({ [toggle.key]: checked })}
              />
            </div>
          );
        })}

        <div className="space-y-3 pt-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Platform event mapping
          </Label>
          {platform.eventDetails.map((event) => (
            <div
              key={event.name}
              className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm font-medium">{event.name}</p>
                <span className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                  {event.trigger}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
