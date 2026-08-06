"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { MarketingPlatformAdvancedPanel } from "@/components/marketing/marketing-platform-advanced-panel";
import { MarketingPlatformAudiencesPanel } from "@/components/marketing/marketing-platform-audiences-panel";
import { MarketingPlatformCatalogPanel } from "@/components/marketing/marketing-platform-catalog-panel";
import { MarketingPlatformConnectionPanel } from "@/components/marketing/marketing-platform-connection-panel";
import { MarketingPlatformDiagnosticsPanel } from "@/components/marketing/marketing-platform-diagnostics-panel";
import { MarketingPlatformDomainPanel } from "@/components/marketing/marketing-platform-domain-panel";
import { MarketingPlatformEventsPanel } from "@/components/marketing/marketing-platform-events-panel";
import { MarketingPlatformHeader } from "@/components/marketing/marketing-platform-header";
import { MarketingPlatformSidebar } from "@/components/marketing/marketing-platform-sidebar";
import { MetaPixelPickerDialog } from "@/components/marketing/meta-pixel-picker-dialog";
import { PinterestTagPickerDialog } from "@/components/marketing/pinterest-tag-picker-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { dashboardStack } from "@/lib/dashboard-ui";
import {
  countEnabledTrackingEvents,
  normalizeMarketingIntegrations,
  normalizePlatformLinkForId,
  validatePlatformLink,
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

function oauthErrorMessage(code: string, platform: "meta" | "pinterest" = "meta"): string {
  const normalized = decodeURIComponent(code).replace(/\+/g, " ").trim();
  const lower = normalized.toLowerCase();
  if (platform === "pinterest") {
    switch (code) {
      case "missing_app_id":
      case "not_configured":
        return "Pinterest OAuth needs PINTEREST_APP_ID and PINTEREST_APP_SECRET in .env.";
      case "denied":
      case "access_denied":
      case "user_denied":
        return "Pinterest login was cancelled.";
      case "invalid_state":
        return "Pinterest login expired. Try Connect with Pinterest again.";
      case "missing_code":
        return "Pinterest did not return an auth code. Try again.";
      case "unauthorized":
        return "Sign in to Ettajer, then connect Pinterest again.";
      default:
        return normalized || "Pinterest connection failed.";
    }
  }
  if (lower.includes("invalid scope") || code === "invalid_scope") {
    return "Meta rejected classic Login scopes. Use Facebook Login for Business: create a Configuration in the App Dashboard and set META_LOGIN_CONFIG_ID in .env (do not pass ads_* as scope).";
  }
  switch (code) {
    case "missing_config_id":
      return "Add META_LOGIN_CONFIG_ID to .env. Create it under Meta App → Facebook Login for Business → Configurations.";
    case "not_configured":
      return "Meta OAuth needs META_APP_ID, META_APP_SECRET, and META_LOGIN_CONFIG_ID in .env.";
    case "denied":
    case "access_denied":
    case "user_denied":
      return "Meta login was cancelled.";
    case "invalid_state":
      return "Meta login expired. Try Connect with Meta again.";
    case "missing_code":
      return "Meta did not return an auth code. Try again.";
    case "unauthorized":
      return "Sign in to Ettajer, then connect Meta again.";
    default:
      return normalized || "Meta connection failed.";
  }
}

export function MarketingPlatformSetupClient({
  platform,
  initialIntegrations,
  storeSlug,
}: MarketingPlatformSetupClientProps) {
  const router = useRouter();
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeIntegrations(initialIntegrations)
  );
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("connection");
  const [metaOAuthConfigured, setMetaOAuthConfigured] = useState<boolean | null>(null);
  const [pixelPickerOpen, setPixelPickerOpen] = useState(false);
  const [connectingMeta, setConnectingMeta] = useState(false);
  const [pinterestOAuthConfigured, setPinterestOAuthConfigured] = useState<
    boolean | null
  >(null);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [connectingPinterest, setConnectingPinterest] = useState(false);

  const link = integrations[platform.id];
  const dirty = serializeIntegrations(integrations) !== savedSnapshot;

  useEffect(() => {
    if (platform.id !== "meta") return;
    let cancelled = false;
    void fetch("/api/marketing/meta/oauth/status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMetaOAuthConfigured(Boolean(data.configured));
      })
      .catch(() => {
        if (!cancelled) setMetaOAuthConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, [platform.id]);

  useEffect(() => {
    if (platform.id !== "pinterest") return;
    let cancelled = false;
    void fetch("/api/marketing/pinterest/oauth/status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPinterestOAuthConfigured(Boolean(data.configured));
      })
      .catch(() => {
        if (!cancelled) setPinterestOAuthConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, [platform.id]);

  useEffect(() => {
    if (platform.id !== "meta" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get("oauth");
    const oauthError = params.get("oauth_error");

    if (oauthError) {
      toast.error(oauthErrorMessage(oauthError, "meta"));
      params.delete("oauth_error");
      const next = params.toString();
      router.replace(
        next ? `/dashboard/marketing/meta?${next}` : "/dashboard/marketing/meta"
      );
      return;
    }

    if (oauth === "picker") {
      setActiveTab("connection");
      setPixelPickerOpen(true);
      params.delete("oauth");
      const next = params.toString();
      router.replace(
        next ? `/dashboard/marketing/meta?${next}` : "/dashboard/marketing/meta"
      );
    }
  }, [platform.id, router]);

  useEffect(() => {
    if (platform.id !== "pinterest" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get("oauth");
    const oauthError = params.get("oauth_error");

    if (oauthError) {
      toast.error(oauthErrorMessage(oauthError, "pinterest"));
      params.delete("oauth_error");
      const next = params.toString();
      router.replace(
        next
          ? `/dashboard/marketing/pinterest?${next}`
          : "/dashboard/marketing/pinterest"
      );
      return;
    }

    if (oauth === "picker") {
      setActiveTab("connection");
      setTagPickerOpen(true);
      params.delete("oauth");
      const next = params.toString();
      router.replace(
        next
          ? `/dashboard/marketing/pinterest?${next}`
          : "/dashboard/marketing/pinterest"
      );
    }
  }, [platform.id, router]);

  function updatePlatform(patch: Partial<MarketingPlatformLink>) {
    setIntegrations((current) => ({
      ...current,
      [platform.id]: normalizePlatformLinkForId(platform.id, {
        ...current[platform.id],
        ...patch,
      }),
    }));
  }

  function handleClear() {
    updatePlatform({
      enabled: false,
      pixelId: null,
      accountId: null,
      accessToken: null,
      testEventCode: null,
      catalogId: null,
      catalogFeedToken: null,
      adAccountId: null,
      purchasersAudienceId: null,
      abandonersAudienceId: null,
      purchasersAudienceSyncedAt: null,
      abandonersAudienceSyncedAt: null,
      audiencesAutoSync: false,
      domainVerificationCode: null,
      domainVerifiedAt: null,
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

    const payload = normalizeMarketingIntegrations(integrations);
    setSaving(true);
    try {
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingIntegrations: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save");

      const saved = normalizeMarketingIntegrations(
        data.store.settings.marketingIntegrations as MarketingIntegrations
      );
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
    if (platform.id === "meta") {
      window.open(platform.consoleUrl, "_blank", "noopener,noreferrer");
      toast.message(
        "Optional: open Events Manager if you prefer to copy a Pixel ID manually."
      );
      setActiveTab("connection");
      return;
    }
    window.open(platform.consoleUrl, "_blank", "noopener,noreferrer");
    toast.message(`Open ${platform.name}, copy your pixel ID, paste it here, then save.`);
  }

  function handleMetaOAuthConnect() {
    if (metaOAuthConfigured === false) {
      toast.error(
        "Meta OAuth isn’t ready. Add META_APP_ID, META_APP_SECRET, and META_LOGIN_CONFIG_ID (Facebook Login for Business configuration) to .env."
      );
      return;
    }
    setConnectingMeta(true);
    window.location.href = "/api/marketing/meta/oauth/start";
  }

  function handlePinterestOAuthConnect() {
    if (pinterestOAuthConfigured === false) {
      toast.error(
        "Pinterest OAuth isn’t ready. Add PINTEREST_APP_ID and PINTEREST_APP_SECRET to .env."
      );
      return;
    }
    setConnectingPinterest(true);
    window.location.href = "/api/marketing/pinterest/oauth/start";
  }

  return (
    <div className={cn(dashboardStack, "pb-16")}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-fit gap-1 px-2 text-[12px] text-neutral-500"
          asChild
        >
          <Link href="/dashboard/marketing">
            <ArrowLeft className="h-3.5 w-3.5" />
            Integrations
          </Link>
        </Button>
        <Button
          size="sm"
          className={cn(
            "h-7 self-end rounded-md px-2.5 text-[12px] font-medium shadow-none [background-image:none] hover:scale-100 sm:self-auto",
            dirty
              ? "bg-[#007AFF] text-white hover:bg-[#0071EB] hover:shadow-none"
              : "bg-[#007AFF]/15 text-[#007AFF] hover:bg-[#007AFF]/15"
          )}
          onClick={handleSave}
          loading={saving}
          disabled={!dirty || saving}
        >
          {dirty ? "Save changes" : "Saved"}
        </Button>
      </div>

      <MarketingPlatformHeader platform={platform} link={link} storeSlug={storeSlug} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
            <TabsList className="h-auto w-full justify-start gap-0.5 rounded-[12px] border border-black/[0.06] bg-white p-1 dark:border-white/10 dark:bg-[#1C1C1E]">
              <TabsTrigger
                value="connection"
                className="rounded-md px-2.5 py-1.5 text-[12px] data-[state=active]:bg-[#F5F5F7] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
              >
                Connection
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="rounded-md px-2.5 py-1.5 text-[12px] data-[state=active]:bg-[#F5F5F7] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
              >
                Events
                {platform.id === "meta" ? (
                  <span className="ml-1.5 tabular-nums text-[10px] text-neutral-400">
                    {countEnabledTrackingEvents(link)}/5
                  </span>
                ) : null}
              </TabsTrigger>
              {platform.id === "meta" || platform.id === "pinterest" ? (
                <TabsTrigger
                  value="catalog"
                  className="rounded-md px-2.5 py-1.5 text-[12px] data-[state=active]:bg-[#F5F5F7] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
                >
                  Catalog
                  {link.catalogId || link.catalogFeedToken ? (
                    <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                      {link.catalogId ? "linked" : "feed"}
                    </span>
                  ) : null}
                </TabsTrigger>
              ) : null}
              {platform.id === "meta" ? (
                <TabsTrigger
                  value="audiences"
                  className="rounded-md px-2.5 py-1.5 text-[12px] data-[state=active]:bg-[#F5F5F7] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
                >
                  Audiences
                  {link.purchasersAudienceId || link.abandonersAudienceId ? (
                    <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                      synced
                    </span>
                  ) : null}
                </TabsTrigger>
              ) : null}
              {platform.id === "meta" ? (
                <TabsTrigger
                  value="domain"
                  className="rounded-md px-2.5 py-1.5 text-[12px] data-[state=active]:bg-[#F5F5F7] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
                >
                  Domain
                  {link.domainVerifiedAt ? (
                    <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                      verified
                    </span>
                  ) : null}
                </TabsTrigger>
              ) : null}
              {platform.id === "meta" || platform.id === "pinterest" ? (
                <TabsTrigger
                  value="diagnostics"
                  className="rounded-md px-2.5 py-1.5 text-[12px] data-[state=active]:bg-[#F5F5F7] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
                >
                  Diagnostics
                </TabsTrigger>
              ) : null}
              <TabsTrigger
                value="advanced"
                className="rounded-md px-2.5 py-1.5 text-[12px] data-[state=active]:bg-[#F5F5F7] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
              >
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
                onMetaOAuthConnect={
                  platform.id === "meta" ? handleMetaOAuthConnect : undefined
                }
                metaOAuthConfigured={metaOAuthConfigured}
                metaOAuthConnecting={connectingMeta}
                onPinterestOAuthConnect={
                  platform.id === "pinterest"
                    ? handlePinterestOAuthConnect
                    : undefined
                }
                pinterestOAuthConfigured={pinterestOAuthConfigured}
                pinterestOAuthConnecting={connectingPinterest}
              />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <MarketingPlatformEventsPanel
                platform={platform}
                link={link}
                onChange={updatePlatform}
              />
            </TabsContent>

            {platform.id === "meta" || platform.id === "pinterest" ? (
              <TabsContent value="catalog" className="mt-0">
                <MarketingPlatformCatalogPanel
                  platformId={platform.id}
                  link={link}
                  storeSlug={storeSlug}
                  onChange={updatePlatform}
                />
              </TabsContent>
            ) : null}

            {platform.id === "meta" ? (
              <TabsContent value="audiences" className="mt-0">
                <MarketingPlatformAudiencesPanel
                  link={link}
                  onChange={updatePlatform}
                  onIntegrationsSynced={(next) => {
                    const normalized = normalizeMarketingIntegrations(next);
                    setIntegrations(normalized);
                    setSavedSnapshot(serializeIntegrations(normalized));
                    router.refresh();
                  }}
                />
              </TabsContent>
            ) : null}

            {platform.id === "meta" ? (
              <TabsContent value="domain" className="mt-0">
                <MarketingPlatformDomainPanel
                  link={link}
                  onChange={updatePlatform}
                />
              </TabsContent>
            ) : null}

            {platform.id === "meta" ? (
              <TabsContent value="diagnostics" className="mt-0">
                <MarketingPlatformDiagnosticsPanel link={link} />
              </TabsContent>
            ) : null}

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

      {platform.id === "meta" ? (
        <MetaPixelPickerDialog
          open={pixelPickerOpen}
          onOpenChange={setPixelPickerOpen}
          onSelected={({ integrations: next }) => {
            const normalized = normalizeMarketingIntegrations(next);
            setIntegrations(normalized);
            setSavedSnapshot(serializeIntegrations(normalized));
            router.refresh();
          }}
        />
      ) : null}

      {platform.id === "pinterest" ? (
        <PinterestTagPickerDialog
          open={tagPickerOpen}
          onOpenChange={setTagPickerOpen}
          onSelected={({ needsConversionToken, integrations: next }) => {
            const normalized = normalizeMarketingIntegrations(next);
            setIntegrations(normalized);
            setSavedSnapshot(serializeIntegrations(normalized));
            if (needsConversionToken) setActiveTab("advanced");
            router.refresh();
          }}
        />
      ) : null}

      {dirty ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#121212]/95">
          <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                Unsaved {platform.name} changes
              </p>
              <p className="text-[11px] text-neutral-400">
                Save to apply tracking updates on your storefront.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                disabled={saving}
                onClick={() => {
                  try {
                    setIntegrations(JSON.parse(savedSnapshot) as MarketingIntegrations);
                  } catch {
                    setIntegrations(initialIntegrations);
                  }
                }}
              >
                Discard
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-md bg-[#007AFF] px-3 text-[12px] font-medium text-white shadow-none [background-image:none] hover:scale-100 hover:bg-[#0071EB] hover:shadow-none"
                onClick={handleSave}
                loading={saving}
                disabled={saving}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
