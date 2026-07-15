import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listAbandonedCheckouts, serializeAbandoned } from "@/lib/abandoned";
import {
  getAbandonedListStats,
  getOrdersSectionCounts,
} from "@/lib/orders-stats";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { AbandonedClient } from "@/components/orders/abandoned-client";

export const metadata = { title: "Abandoned Checkouts" };

export default async function AbandonedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [rows, counts, stats] = await Promise.all([
    listAbandonedCheckouts(store.id),
    getOrdersSectionCounts(store.id),
    getAbandonedListStats(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader title="Orders" description="Recover lost sales from abandoned checkouts" />
      <DashboardPageContent>
        <AbandonedClient
          initial={rows.map(serializeAbandoned)}
          currency={store.currency}
          counts={counts}
          stats={stats}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
