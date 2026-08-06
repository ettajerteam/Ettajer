"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Copy, ExternalLink, Link2, Store, TriangleAlert } from "lucide-react";
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
import {
  validatePixelId,
  type MarketingPlatformConfig,
  type MarketingPlatformId,
  type MarketingPlatformLink,
} from "@/lib/marketing-integrations";
import { MetaAppDashboardUrlsCard } from "@/components/marketing/meta-app-dashboard-urls-card";

interface MarketingPlatformConnectionPanelProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
  storeSlug: string;
  onChange: (patch: Partial<MarketingPlatformLink>) => void;
  onConnect: () => void;
  onMetaOAuthConnect?: () => void;
  metaOAuthConfigured?: boolean | null;
  metaOAuthConnecting?: boolean;
  onPinterestOAuthConnect?: () => void;
  pinterestOAuthConfigured?: boolean | null;
  pinterestOAuthConnecting?: boolean;
}

export function MarketingPlatformConnectionPanel({
  platform,
  link,
  storeSlug,
  onChange,
  onConnect,
  onMetaOAuthConnect,
  metaOAuthConfigured = null,
  metaOAuthConnecting = false,
  onPinterestOAuthConnect,
  pinterestOAuthConfigured = null,
  pinterestOAuthConnecting = false,
}: MarketingPlatformConnectionPanelProps) {
  const isMeta = platform.id === "meta";
  const isPinterest = platform.id === "pinterest";
  const pixelError =
    link.enabled && link.pixelId
      ? validatePixelId(platform.id as MarketingPlatformId, link.pixelId)
      : link.enabled && !link.pixelId?.trim()
        ? "Pixel ID is required when tracking is enabled."
        : null;

  async function handleCopyId() {
    if (!link.pixelId) return;
    await navigator.clipboard.writeText(link.pixelId);
    toast.success(`${platform.name} ID copied`);
  }

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <h3 className={dashboardTitle}>Connection</h3>
        <p className={cn(dashboardSubtitle, "mt-0.5")}>
          {isMeta
            ? "Connect with Meta to pick a pixel, or paste an ID manually."
            : isPinterest
              ? "Connect with Pinterest to pick a Tag, or paste IDs manually."
              : `Turn on ${platform.name}, paste your pixel ID, then save to go live.`}
        </p>
      </div>

      <div className="space-y-4 p-4">
        {isMeta && onMetaOAuthConnect ? (
          <div className="rounded-[10px] border border-[#1877F2]/20 bg-[#1877F2]/[0.04] px-3 py-3 dark:border-[#1877F2]/30">
            {link.pixelId ? (
              <>
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  Meta connected
                </p>
                <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>
                  Pixel{" "}
                  <span className="font-mono text-neutral-600 dark:text-neutral-300">
                    {link.pixelId}
                  </span>
                  {link.accessToken ? " · Conversions API token saved" : ""}. Next: review{" "}
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    Events
                  </span>{" "}
                  and connect your{" "}
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    Catalog
                  </span>{" "}
                  feed for Dynamic Ads.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2.5 h-8 rounded-md border-[#1877F2]/25 px-3 text-[12px] text-[#1877F2] hover:bg-[#1877F2]/5 dark:border-[#1877F2]/40"
                  onClick={onMetaOAuthConnect}
                  loading={metaOAuthConnecting}
                  disabled={metaOAuthConnecting}
                >
                  Reconnect / switch pixel
                </Button>
              </>
            ) : (
              <>
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  Connect with Meta Business
                </p>
                <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>
                  Log in with Facebook, grant access, then choose a pixel — no copy-paste.
                  We also store your token for Conversions API.
                </p>
                {metaOAuthConfigured === false ? (
                  <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                    OAuth isn’t ready on this server — paste a Pixel ID below, or add{" "}
                    <span className="font-mono">META_LOGIN_CONFIG_ID</span> to{" "}
                    <span className="font-mono">.env</span>.
                  </p>
                ) : null}
                <Button
                  type="button"
                  className="mt-2.5 h-8 rounded-md bg-[#1877F2] px-3 text-[12px] text-white hover:bg-[#166FE5]"
                  onClick={onMetaOAuthConnect}
                  loading={metaOAuthConnecting}
                  disabled={metaOAuthConnecting || metaOAuthConfigured === false}
                >
                  Connect with Meta
                </Button>
              </>
            )}
          </div>
        ) : null}

        {isPinterest && onPinterestOAuthConnect ? (
          <div className="rounded-[10px] border border-[#E60023]/20 bg-[#E60023]/[0.04] px-3 py-3 dark:border-[#E60023]/30">
            {link.pixelId ? (
              <>
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  Pinterest connected
                </p>
                <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>
                  Tag{" "}
                  <span className="font-mono text-neutral-600 dark:text-neutral-300">
                    {link.pixelId}
                  </span>
                  {link.accountId ? (
                    <>
                      {" "}
                      · Ad account{" "}
                      <span className="font-mono text-neutral-600 dark:text-neutral-300">
                        {link.accountId}
                      </span>
                    </>
                  ) : null}
                  {link.accessToken
                    ? " · Conversion token saved"
                    : " · Add Conversion token under Advanced for CAPI"}
                  . Next: review Events and Catalog feed.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2.5 h-8 rounded-md border-[#E60023]/25 px-3 text-[12px] text-[#E60023] hover:bg-[#E60023]/5 dark:border-[#E60023]/40"
                  onClick={onPinterestOAuthConnect}
                  loading={pinterestOAuthConnecting}
                  disabled={pinterestOAuthConnecting}
                >
                  Reconnect / switch tag
                </Button>
              </>
            ) : (
              <>
                <p className="text-[12px] font-medium text-[#E60023]">
                  Connect with Pinterest
                </p>
                <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>
                  Log in with Pinterest, grant access, then choose a Tag — we fill Tag ID
                  and ad account. Conversion access token still comes from Ads Manager
                  (Advanced).
                </p>
                {pinterestOAuthConfigured === false ? (
                  <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                    OAuth isn’t ready on this server — paste Tag + ad account below, or add{" "}
                    <span className="font-mono">PINTEREST_APP_ID</span> and{" "}
                    <span className="font-mono">PINTEREST_APP_SECRET</span> to{" "}
                    <span className="font-mono">.env</span>.
                  </p>
                ) : null}
                <Button
                  type="button"
                  className="mt-2.5 h-8 rounded-md bg-[#E60023] px-3 text-[12px] text-white shadow-none [background-image:none] hover:scale-100 hover:bg-[#C4001A] hover:shadow-none"
                  onClick={onPinterestOAuthConnect}
                  loading={pinterestOAuthConnecting}
                  disabled={
                    pinterestOAuthConnecting || pinterestOAuthConfigured === false
                  }
                >
                  Connect with Pinterest
                </Button>
              </>
            )}
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
          <div>
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              Enable {platform.name}
            </p>
            <p className={dashboardSubtitle}>Activate pixel on your live store</p>
          </div>
          <Switch
            checked={link.enabled}
            onCheckedChange={(checked) => onChange({ enabled: checked })}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`${platform.id}-pixel`}
            className="text-[11px] font-medium text-neutral-500"
          >
            {platform.pixelLabel}
            {isMeta || isPinterest ? (
              <span className="ml-1 font-normal text-neutral-400">(or connect above)</span>
            ) : null}
          </Label>
          <div className="flex gap-1.5">
            <Input
              id={`${platform.id}-pixel`}
              value={link.pixelId ?? ""}
              onChange={(e) => {
                const next = e.target.value.trim() || null;
                onChange({
                  pixelId: next,
                  ...(next && !link.enabled ? { enabled: true } : {}),
                });
              }}
              placeholder={platform.pixelPlaceholder}
              disabled={false}
              className={cn(
                "h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[12px] dark:border-white/10 dark:bg-white/[0.05]",
                pixelError && "border-amber-500 focus-visible:ring-amber-500/30"
              )}
            />
            {link.pixelId ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-md border-black/[0.06] dark:border-white/10"
                onClick={handleCopyId}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
          <p className={dashboardSubtitle}>{platform.pixelHelp}</p>
          {pixelError ? (
            <p className="text-[11px] text-amber-700 dark:text-amber-400">{pixelError}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`${platform.id}-account`}
            className="text-[11px] font-medium text-neutral-500"
          >
            {platform.accountLabel}
          </Label>
          <Input
            id={`${platform.id}-account`}
            value={link.accountId ?? ""}
            onChange={(e) => onChange({ accountId: e.target.value.trim() || null })}
            placeholder={platform.accountPlaceholder}
            disabled={!link.enabled}
            className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
          />
        </div>

        {link.connected ? (
          <div className="rounded-[10px] border border-emerald-500/20 bg-emerald-50 px-3 py-2.5 text-[12px] text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            Tracking is live. Check {platform.name}&apos;s events dashboard for incoming hits.
          </div>
        ) : null}

        {pixelError && link.enabled ? (
          <div className="flex items-start gap-2 rounded-[10px] border border-amber-500/20 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>Fix the pixel ID above, then save to activate tracking.</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            onClick={onConnect}
          >
            <Link2 className="mr-1 h-3.5 w-3.5" />
            {isMeta ? "Open Events Manager" : "Open console"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            asChild
          >
            <a href={platform.consoleUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              Open {platform.name}
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-md px-2.5 text-[12px]"
            asChild
          >
            <Link href={`/store/${storeSlug}`} target="_blank">
              <Store className="mr-1 h-3.5 w-3.5" />
              Test on storefront
            </Link>
          </Button>
        </div>

        {isMeta ? <MetaAppDashboardUrlsCard /> : null}
      </div>
    </section>
  );
}
