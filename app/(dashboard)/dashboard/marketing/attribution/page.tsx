import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getAttributionStats } from "@/lib/marketing-attribution-stats";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { MarketingAttributionClient } from "@/components/marketing/marketing-attribution-client";

export const metadata = { title: "Attribution" };

export default async function MarketingAttributionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const stats = await getAttributionStats(store.id);
  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/store/${store.slug}`;

  return (
    <DashboardLayout>
      <DashboardHeader title="Marketing" description="Traffic attribution and UTM tracking" />
      <DashboardPageContent>
        <MarketingAttributionClient
          stats={stats}
          currency={store.currency}
          storeUrl={storeUrl}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
