import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeOrderListItem } from "@/lib/orders";
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

  const orders = await prisma.order.findMany({
    where: { storeId: store.id, status: { in: ["returned", "refunded"] } },
    include: { items: true, _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Returns"
        description="Returned and refunded orders — review history and restocks"
        helpArticle="handle-returns-and-refunds"
      />
      <DashboardPageContent>
        <ReturnsClient
          orders={orders.map(serializeOrderListItem)}
          currency={store.currency}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
