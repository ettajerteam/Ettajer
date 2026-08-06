"use client";

import { FlaskConical, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import type {
  MarketingPlatformConfig,
  MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformAdvancedPanelProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
  onChange: (patch: Partial<MarketingPlatformLink>) => void;
  onClear: () => void;
}

export function MarketingPlatformAdvancedPanel({
  platform,
  link,
  onChange,
  onClear,
}: MarketingPlatformAdvancedPanelProps) {
  const isMeta = platform.id === "meta";
  const isPinterest = platform.id === "pinterest";
  const hasToken = Boolean(link.accessToken?.trim());
  const hasAdAccount = Boolean(link.accountId?.trim());
  const pinCapiReady = isPinterest && hasToken && hasAdAccount;

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <h3 className={dashboardTitle}>Advanced</h3>
        <p className={cn(dashboardSubtitle, "mt-0.5")}>
          Test mode, API credentials, and reset options.
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between rounded-[10px] border border-black/[0.05] px-3 py-2.5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08]">
              <FlaskConical className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                Test mode
              </p>
              <p className={dashboardSubtitle}>
                Mark events as test while validating setup
              </p>
            </div>
          </div>
          <Switch
            checked={link.testMode}
            disabled={!link.enabled}
            onCheckedChange={(checked) => onChange({ testMode: checked })}
          />
        </div>

        {isMeta && link.testMode ? (
          <div className="space-y-1.5">
            <Label
              htmlFor={`${platform.id}-test-event-code`}
              className="text-[11px] font-medium text-neutral-500"
            >
              Test event code
            </Label>
            <Input
              id={`${platform.id}-test-event-code`}
              value={link.testEventCode ?? ""}
              onChange={(e) =>
                onChange({ testEventCode: e.target.value.trim() || null })
              }
              placeholder="TEST12345"
              disabled={!link.enabled}
              className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
            />
            <p className={dashboardSubtitle}>
              From Meta Events Manager → Test events. Sent with Conversions API
              only while test mode is on.
            </p>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label
            htmlFor={`${platform.id}-token`}
            className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500"
          >
            <KeyRound className="h-3 w-3" />
            {isMeta
              ? "Conversions API access token"
              : isPinterest
                ? "Conversions API access token"
                : "API / access token"}
          </Label>
          <Input
            id={`${platform.id}-token`}
            type="password"
            value={link.accessToken ?? ""}
            onChange={(e) => onChange({ accessToken: e.target.value.trim() || null })}
            placeholder={
              isMeta
                ? "Paste token from Events Manager → Settings"
                : isPinterest
                  ? "Paste Conversion access token from Pinterest Ads"
                  : "Optional — for server-side APIs"
            }
            disabled={!link.enabled}
            className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
          />
          <p className={dashboardSubtitle}>
            {isMeta
              ? hasToken
                ? "Conversions API is active — server events include hashed email/phone for better match when cookies are blocked."
                : "Generate an access token in Meta Events Manager (Pixel settings). Improves tracking when browsers block cookies. Checkout also sends hashed email/phone for advanced matching."
              : isPinterest
                ? pinCapiReady
                  ? "Pinterest Conversions API is active — Tag + server share event_id for dedupe. Requires Tag ID, ad account ID (Connection), and this token."
                  : "Create a Conversion access token in Pinterest Ads → Conversions. Also set your numeric Ad account ID on the Connection tab. Checkout/cart send hashed email/phone for better match."
                : "Optional credential for server-side event APIs on this platform."}
          </p>
        </div>

        <div className="rounded-[10px] border border-dashed border-black/[0.08] px-3 py-3 dark:border-white/10">
          <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
            Test your setup
          </p>
          <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>
            {isMeta
              ? "Enable test mode, add a test event code, visit your storefront, then check Meta Test events for Pixel + CAPI."
              : isPinterest
                ? "Enable test mode, place a small order on the live store, then check Pinterest Ads → Conversions / Tag Helper and Ettajer Diagnostics."
                : "Enable test mode, visit your storefront, and watch the live event log while you browse, add to cart, and checkout."}
          </p>
        </div>

        <div className="rounded-[10px] border border-dashed border-black/[0.08] px-3 py-3 dark:border-white/10">
          <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
            Reset integration
          </p>
          <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>
            Clears pixel ID, account ID, and tokens for {platform.name}. Tracking stops after
            you save.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2.5 h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] text-red-600 hover:text-red-600 dark:border-white/10"
            onClick={onClear}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Clear {platform.name} settings
          </Button>
        </div>
      </div>
    </section>
  );
}
