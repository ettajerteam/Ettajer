"use client";

import { FlaskConical, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import type { MarketingPlatformConfig, MarketingPlatformLink } from "@/lib/marketing-integrations";

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
  return (
    <section className={dashboardCard}>
      <div className={`${dashboardCardPad} border-b border-border/70`}>
        <h3 className="text-base font-semibold tracking-[-0.02em]">Advanced</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Test mode, API credentials, and reset options for power users.
        </p>
      </div>

      <div className={`${dashboardCardPad} space-y-5`}>
        <div className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
              <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium">Test mode</p>
              <p className="text-xs text-muted-foreground">Mark events as test while validating setup</p>
            </div>
          </div>
          <Switch
            checked={link.testMode}
            disabled={!link.enabled}
            onCheckedChange={(checked) => onChange({ testMode: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${platform.id}-token`} className="flex items-center gap-2">
            <KeyRound className="h-3.5 w-3.5" />
            API / access token
          </Label>
          <Input
            id={`${platform.id}-token`}
            type="password"
            value={link.accessToken ?? ""}
            onChange={(e) => onChange({ accessToken: e.target.value.trim() || null })}
            placeholder="Optional — for Conversions API (coming soon)"
            disabled={!link.enabled}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Server-side event forwarding will use this token in a future release.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-border/80 px-4 py-4">
          <p className="text-sm font-medium">Test your setup</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Enable test mode, visit your storefront, and watch the live event log appear in the
            bottom-right corner while you browse, add to cart, and checkout.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-border/80 px-4 py-4">
          <p className="text-sm font-medium">Reset integration</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clears pixel ID, account ID, and tokens for {platform.name}. Tracking stops immediately.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 rounded-lg text-destructive hover:text-destructive"
            onClick={onClear}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear {platform.name} settings
          </Button>
        </div>
      </div>
    </section>
  );
}
