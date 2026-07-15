import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeOrderListItem } from "@/lib/orders";
import {
  getOrdersSectionCounts,
  getReturnsListStats,
} from "@/lib/orders-stats";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ReturnsClient } from "@/components/orders/returns-client";

export const metadata = { title: "Returns" };

export default async function ReturnsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [orders, counts, stats] = await Promise.all([
    prisma.order.findMany({
      where: { storeId: store.id, status: "returned" },
      include: { items: true, _count: { select: { items: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    getOrdersSectionCounts(store.id),
    getReturnsListStats(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader title="Orders" description="Manage returned orders" />
      <DashboardPageContent>
        <ReturnsClient
          orders={orders.map(serializeOrderListItem)}
          currency={store.currency}
          counts={counts}
          stats={stats}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
