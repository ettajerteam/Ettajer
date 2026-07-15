"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MarketingIntegrationsBrief } from "@/components/marketing/marketing-integrations-brief";
import { MarketingPlatformTile } from "@/components/marketing/marketing-platform-tile";
import { MarketingSectionNav } from "@/components/marketing/marketing-section-nav";
import {
  MARKETING_PLATFORMS,
  countConnectedIntegrations,
  getIntegrationBrief,
  type MarketingIntegrations,
} from "@/lib/marketing-integrations";

interface MarketingIntegrationsClientProps {
  initialIntegrations: MarketingIntegrations;
}

export function MarketingIntegrationsClient({
  initialIntegrations,
}: MarketingIntegrationsClientProps) {
  const router = useRouter();
  const [integrations, setIntegrations] = useState(initialIntegrations);

  useEffect(() => {
    setIntegrations(initialIntegrations);
  }, [initialIntegrations]);

  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [router]);

  const connectedCount = useMemo(() => countConnectedIntegrations(integrations), [integrations]);
  const brief = useMemo(() => getIntegrationBrief(integrations), [integrations]);
  const totalCount = MARKETING_PLATFORMS.length;

  return (
    <div className="space-y-4">
      <MarketingSectionNav />

      <MarketingIntegrationsBrief
        message={brief.message}
        tone={brief.tone}
        connectedCount={connectedCount}
        totalCount={totalCount}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {MARKETING_PLATFORMS.map((platform) => (
          <MarketingPlatformTile
            key={platform.id}
            platform={platform}
            link={integrations[platform.id]}
          />
        ))}
      </div>
    </div>
  );
}
