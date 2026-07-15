"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { MarketingPlatformAdvancedPanel } from "@/components/marketing/marketing-platform-advanced-panel";
import { MarketingPlatformConnectionPanel } from "@/components/marketing/marketing-platform-connection-panel";
import { MarketingPlatformEventsPanel } from "@/components/marketing/marketing-platform-events-panel";
import { MarketingPlatformHeader } from "@/components/marketing/marketing-platform-header";
import { MarketingPlatformSidebar } from "@/components/marketing/marketing-platform-sidebar";
import { MarketingSectionNav } from "@/components/marketing/marketing-section-nav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  validatePixelId,
  validatePlatformLink,
  MARKETING_PLATFORMS,
  type MarketingIntegrations,
  type MarketingPlatformConfig,
  type MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformSetupClientProps {
  platform: MarketingPlatformConfig;
  initialIntegrations: MarketingIntegrations;
  storeSlug: string;
}

function serializeIntegrations(integrations: MarketingIntegrations): string {
  return JSON.stringify(integrations);
}

function normalizePlatformLink(
  platformId: MarketingPlatformConfig["id"],
  link: MarketingPlatformLink
): MarketingPlatformLink {
  const pixelId = link.pixelId?.trim() || null;
  const pixelOk = pixelId ? !validatePixelId(platformId, pixelId) : false;
  const eventsOk =
    link.trackPageViews ||
    link.trackViewContent ||
    link.trackAddToCart ||
    link.trackInitiateCheckout ||
    link.trackPurchases;
  return {
    ...link,
    pixelId,
    connected: Boolean(link.enabled && pixelOk && eventsOk),
  };
}

function normalizeIntegrations(
  integrations: MarketingIntegrations,
  platformId?: MarketingPlatformConfig["id"]
): MarketingIntegrations {
  if (platformId) {
    return {
      ...integrations,
      [platformId]: normalizePlatformLink(platformId, integrations[platformId]),
    };
  }
  return Object.fromEntries(
    MARKETING_PLATFORMS.map((platform) => [
      platform.id,
      normalizePlatformLink(platform.id, integrations[platform.id]),
    ])
  ) as MarketingIntegrations;
}

export function MarketingPlatformSetupClient({
  platform,
  initialIntegrations,
  storeSlug,
}: MarketingPlatformSetupClientProps) {
  const router = useRouter();
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [savedSnapshot, setSavedSnapshot] = useState(() => serializeIntegrations(initialIntegrations));
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("connection");

  const link = integrations[platform.id];
  const dirty = serializeIntegrations(integrations) !== savedSnapshot;

  function updatePlatform(patch: Partial<MarketingPlatformLink>) {
    setIntegrations((current) =>
      normalizeIntegrations(
        {
          ...current,
          [platform.id]: { ...current[platform.id], ...patch },
        },
        platform.id
      )
    );
  }

  function handleClear() {
    updatePlatform({
      enabled: false,
      pixelId: null,
      accountId: null,
      accessToken: null,
      testMode: false,
      trackPageViews: true,
      trackViewContent: true,
      trackAddToCart: true,
      trackInitiateCheckout: true,
      trackPurchases: true,
    });
    toast.message(`${platform.name} settings cleared — save to apply`);
  }

  async function handleSave() {
    const validationError = validatePlatformLink(platform.id, integrations[platform.id]);
    if (validationError) {
      toast.error(validationError);
      setActiveTab("connection");
      return;
    }

    const payload = normalizeIntegrations(integrations, platform.id);
    setSaving(true);
    try {
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingIntegrations: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save");

      const saved = data.store.settings.marketingIntegrations as MarketingIntegrations;
      setIntegrations(saved);
      setSavedSnapshot(serializeIntegrations(saved));
      router.refresh();
      toast.success(
        saved[platform.id].connected
          ? `${platform.name} is live on your storefront`
          : `${platform.name} settings saved`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleConnect() {
    toast.info(
      `${platform.name} OAuth connect is coming soon. Add your pixel ID in the Connection tab to start tracking.`
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/dashboard/marketing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <MarketingSectionNav />
        </div>
        <Button
          size="sm"
          className="h-8 rounded-lg text-xs self-end sm:self-auto"
          onClick={handleSave}
          loading={saving}
          disabled={!dirty || saving}
        >
          {dirty ? "Save changes" : "Saved"}
        </Button>
      </div>

      <MarketingPlatformHeader platform={platform} link={link} storeSlug={storeSlug} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="premium-card h-auto w-full justify-start gap-1 p-1">
              <TabsTrigger value="connection" className="rounded-lg text-xs">
                Connection
              </TabsTrigger>
              <TabsTrigger value="events" className="rounded-lg text-xs">
                Events & tracking
              </TabsTrigger>
              <TabsTrigger value="advanced" className="rounded-lg text-xs">
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="mt-0">
              <MarketingPlatformConnectionPanel
                platform={platform}
                link={link}
                storeSlug={storeSlug}
                onChange={updatePlatform}
                onConnect={handleConnect}
              />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <MarketingPlatformEventsPanel platform={platform} link={link} onChange={updatePlatform} />
            </TabsContent>

            <TabsContent value="advanced" className="mt-0">
              <MarketingPlatformAdvancedPanel
                platform={platform}
                link={link}
                onChange={updatePlatform}
                onClear={handleClear}
              />
            </TabsContent>
          </Tabs>
        </div>

        <MarketingPlatformSidebar platform={platform} link={link} />
      </div>
    </div>
  );
}
