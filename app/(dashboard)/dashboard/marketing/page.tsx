import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { parseMarketingIntegrations } from "@/lib/marketing-integrations";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { MarketingIntegrationsClient } from "@/components/marketing/marketing-integrations-client";

export const metadata = { title: "Marketing" };
export const dynamic = "force-dynamic";

export default async function MarketingPage() {
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
        description="Connect ad platforms, manage pixels, and track storefront conversions"
      />
      <DashboardPageContent>
        <MarketingIntegrationsClient initialIntegrations={integrations} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
