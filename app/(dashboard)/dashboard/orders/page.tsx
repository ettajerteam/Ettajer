import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeOrderListItem } from "@/lib/orders";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { OrdersClient } from "@/components/orders/orders-client";
import { OrderTableSkeleton } from "@/components/orders/order-table-skeleton";

export const metadata = { title: "Orders" };

export default async function DashboardOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const orders = await prisma.order.findMany({
    where: { storeId: store.id, status: { not: "draft" } },
    include: {
      items: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Orders"
        description="Track and fulfill customer orders"
      />
      <DashboardPageContent>
        <Suspense fallback={<OrderTableSkeleton />}>
          <OrdersClient
            initialOrders={orders.map(serializeOrderListItem)}
            currency={store.currency}
          />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
