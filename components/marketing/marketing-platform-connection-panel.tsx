"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Copy, ExternalLink, Link2, Store, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import {
  validatePixelId,
  type MarketingPlatformConfig,
  type MarketingPlatformId,
  type MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformConnectionPanelProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
  storeSlug: string;
  onChange: (patch: Partial<MarketingPlatformLink>) => void;
  onConnect: () => void;
}

export function MarketingPlatformConnectionPanel({
  platform,
  link,
  storeSlug,
  onChange,
  onConnect,
}: MarketingPlatformConnectionPanelProps) {
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
    <section className={dashboardCard}>
      <div className={`${dashboardCardPad} border-b border-border/70`}>
        <h3 className="text-base font-semibold tracking-[-0.02em]">Connection</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn on {platform.name}, paste your pixel ID, and tracking goes live on your storefront after you save.
        </p>
      </div>

      <div className={`${dashboardCardPad} space-y-5`}>
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 px-4 py-3">
          <div>
            <p className="font-medium">Enable {platform.name}</p>
            <p className="text-xs text-muted-foreground">Activate pixel on your live store</p>
          </div>
          <Switch checked={link.enabled} onCheckedChange={(checked) => onChange({ enabled: checked })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${platform.id}-pixel`}>{platform.pixelLabel}</Label>
          <div className="flex gap-2">
            <Input
              id={`${platform.id}-pixel`}
              value={link.pixelId ?? ""}
              onChange={(e) => onChange({ pixelId: e.target.value.trim() || null })}
              placeholder={platform.pixelPlaceholder}
              disabled={!link.enabled}
              className={cn("font-mono text-sm", pixelError && "border-amber-500 focus-visible:ring-amber-500/30")}
            />
            {link.pixelId && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 rounded-lg"
                onClick={handleCopyId}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{platform.pixelHelp}</p>
          {pixelError && (
            <p className="text-xs text-amber-700 dark:text-amber-400">{pixelError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${platform.id}-account`}>{platform.accountLabel}</Label>
          <Input
            id={`${platform.id}-account`}
            value={link.accountId ?? ""}
            onChange={(e) => onChange({ accountId: e.target.value.trim() || null })}
            placeholder={platform.accountPlaceholder}
            disabled={!link.enabled}
            className="font-mono text-sm"
          />
        </div>

        {link.connected && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
            Tracking is live. Open your store and check {platform.name}&apos;s events dashboard for incoming hits.
          </div>
        )}

        {pixelError && link.enabled && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-300">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>Fix the pixel ID above, then save to activate tracking.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={!link.enabled}
            onClick={onConnect}
          >
            <Link2 className="mr-1.5 h-4 w-4" />
            Connect account
          </Button>
          <Button type="button" variant="outline" className="rounded-lg" asChild>
            <a href={platform.consoleUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Open {platform.name}
            </a>
          </Button>
          <Button type="button" variant="ghost" className="rounded-lg" asChild>
            <Link href={`/store/${storeSlug}`} target="_blank">
              <Store className="mr-1.5 h-4 w-4" />
              Test on storefront
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
