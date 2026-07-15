import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listAbandonedCheckouts, serializeAbandoned } from "@/lib/abandoned";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { MarketingCampaignsClient } from "@/components/marketing/marketing-campaigns-client";

export const metadata = { title: "Campaigns" };

export default async function MarketingCampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const checkouts = (await listAbandonedCheckouts(store.id)).map(serializeAbandoned);

  return (
    <DashboardLayout>
      <DashboardHeader title="Marketing" description="Campaigns and abandoned cart recovery" />
      <DashboardPageContent>
        <MarketingCampaignsClient
          initial={checkouts}
          currency={store.currency}
          storeSlug={store.slug}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
