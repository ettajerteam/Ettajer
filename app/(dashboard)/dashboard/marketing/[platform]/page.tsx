import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  getMarketingPlatform,
  parseMarketingIntegrations,
  parseMarketingPlatformId,
} from "@/lib/marketing-integrations";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { MarketingPlatformSetupClient } from "@/components/marketing/marketing-platform-setup-client";

interface PageProps {
  params: { platform: string };
}

export async function generateMetadata({ params }: PageProps) {
  const platform = getMarketingPlatform(params.platform);
  return { title: platform ? `${platform.name} Integration` : "Marketing" };
}

export const dynamic = "force-dynamic";

export default async function MarketingPlatformPage({ params }: PageProps) {
  const platformId = parseMarketingPlatformId(params.platform);
  if (!platformId) notFound();

  const platform = getMarketingPlatform(platformId);
  if (!platform) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  const integrations = parseMarketingIntegrations(store.settings?.marketingIntegrations);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Marketing"
        description={`Set up ${platform.name} tracking for your storefront`}
      />
      <DashboardPageContent>
        <MarketingPlatformSetupClient
          platform={platform}
          initialIntegrations={integrations}
          storeSlug={store.slug}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
