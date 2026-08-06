"use client";

import {
  Activity,
  Eye,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Server,
  MonitorSmartphone,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  dashboardCard,
  dashboardKicker,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import type {
  MarketingPlatformConfig,
  MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformEventsPanelProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
  onChange: (patch: Partial<MarketingPlatformLink>) => void;
}

const EVENT_TOGGLES = [
  {
    key: "trackPageViews" as const,
    label: "Page views",
    description: "Every storefront page load / SPA navigation",
    metaNote: "Shared event_id on Pixel + CAPI",
    icon: Activity,
  },
  {
    key: "trackViewContent" as const,
    label: "Product views",
    description: "Customer opens a product detail page",
    metaNote: "Shared event_id for Pixel ↔ CAPI dedupe",
    icon: Eye,
  },
  {
    key: "trackAddToCart" as const,
    label: "Add to cart",
    description: "Product added from the storefront",
    metaNote: "Shared event_id · Pixel + cart API CAPI",
    icon: ShoppingCart,
  },
  {
    key: "trackInitiateCheckout" as const,
    label: "Checkout started",
    description: "After contact details on checkout",
    metaNote: "Shared event_id · hashed email/phone matching",
    icon: CreditCard,
  },
  {
    key: "trackPurchases" as const,
    label: "Purchases",
    description: "Order confirmation + server checkout",
    metaNote: "purchase_{orderNumber} · Pixel + checkout CAPI",
    icon: ShoppingBag,
  },
];

export function MarketingPlatformEventsPanel({
  platform,
  link,
  onChange,
}: MarketingPlatformEventsPanelProps) {
  const isMeta = platform.id === "meta";
  const isPinterest = platform.id === "pinterest";
  const showCapiNotes = isMeta || isPinterest;
  const enabledCount = EVENT_TOGGLES.filter((t) => link[t.key]).length;

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className={dashboardTitle}>Events & tracking</h3>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              Choose which customer actions are sent to {platform.name}.
            </p>
          </div>
          <span className="rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-neutral-500 dark:bg-white/[0.08]">
            {enabledCount}/{EVENT_TOGGLES.length} on
          </span>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {showCapiNotes ? (
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <div className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
              <MonitorSmartphone
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  isMeta ? "text-[#1877F2]" : "text-[#E60023]"
                )}
              />
              <div>
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  {isMeta ? "Browser Pixel" : "Pinterest Tag"}
                </p>
                <p className={dashboardSubtitle}>
                  {link.pixelId
                    ? "Fires in the customer’s browser"
                    : isMeta
                      ? "Connect a pixel on the Connection tab"
                      : "Paste your Tag ID on the Connection tab"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
              <Server
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  isMeta ? "text-[#1877F2]" : "text-[#E60023]"
                )}
              />
              <div>
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  Conversions API
                </p>
                <p className={dashboardSubtitle}>
                  {isMeta
                    ? link.accessToken
                      ? "Server events on — better when cookies are blocked"
                      : "Connect with Meta to save a CAPI token"
                    : link.accessToken && link.accountId
                      ? "Server events on — Tag + CAPI share event_id"
                      : "Add ad account ID + conversion token (Advanced)"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {EVENT_TOGGLES.map((toggle) => {
          const Icon = toggle.icon;
          return (
            <div
              key={toggle.key}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-black/[0.05] px-3 py-2.5 dark:border-white/10"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-300">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                    {toggle.label}
                  </p>
                  <p className={dashboardSubtitle}>{toggle.description}</p>
                  {showCapiNotes ? (
                    <p
                      className={cn(
                        "mt-0.5 truncate text-[10px]",
                        isMeta ? "text-[#1877F2]/90" : "text-[#E60023]/90"
                      )}
                    >
                      {toggle.metaNote}
                    </p>
                  ) : null}
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

        <div className="space-y-2 pt-2">
          <Label className={dashboardKicker}>Platform event mapping</Label>
          {platform.eventDetails.map((event) => (
            <div
              key={event.name}
              className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/60 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[12px] font-medium text-neutral-900 dark:text-white">
                  {event.name}
                </p>
                <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-neutral-400 dark:bg-white/[0.06]">
                  {event.trigger}
                </span>
              </div>
              <p className={cn(dashboardSubtitle, "mt-1")}>{event.description}</p>
            </div>
          ))}
        </div>

        {isMeta && link.testMode ? (
          <div className="rounded-[10px] border border-amber-500/20 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Test mode is on — events are marked as test. Add a test event code under
            Advanced, then open{" "}
            <a
              href="https://business.facebook.com/events_manager2/test_events"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline-offset-2 hover:underline"
            >
              Meta Test events
            </a>
            .
          </div>
        ) : isMeta && link.pixelId ? (
          <div className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/80 px-3 py-2.5 text-[11px] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400">
            Verify dual delivery in{" "}
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#1877F2] underline-offset-2 hover:underline"
            >
              Events Manager
            </a>
            — browser and server events with the same{" "}
            <span className="font-mono">event_id</span> count as one.
          </div>
        ) : null}
      </div>
    </section>
  );
}
