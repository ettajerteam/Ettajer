import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listDrafts, serializeDraftListItem } from "@/lib/drafts";
import {
  getDraftsListStats,
  getOrdersSectionCounts,
} from "@/lib/orders-stats";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { DraftsClient } from "@/components/orders/drafts-client";

export const metadata = { title: "Draft Orders" };

export default async function DraftOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [drafts, counts, stats] = await Promise.all([
    listDrafts(store.id),
    getOrdersSectionCounts(store.id),
    getDraftsListStats(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Orders"
        description="Prepare draft orders before sending them to customers"
      />
      <DashboardPageContent>
        <DraftsClient
          initialDrafts={drafts.map(serializeDraftListItem)}
          currency={store.currency}
          counts={counts}
          stats={stats}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
