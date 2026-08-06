import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Printer } from "lucide-react";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getOrderForStore, serializeOrderDetail } from "@/lib/orders";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { OrderDetailClient } from "@/components/orders/order-detail-client";

export const metadata = { title: "Order" };

interface PageProps {
  params: { id: string };
}

export default async function DashboardOrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const order = await getOrderForStore(params.id, store.id);
  if (!order) notFound();

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Order"
        description={order.orderNumber}
        helpArticle="manage-orders-and-fulfillment"
        actions={
          <Link
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-black/[0.06] bg-white px-2.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
          >
            <Printer className="h-3 w-3" />
            Invoice
          </Link>
        }
      />
      <DashboardPageContent>
        <OrderDetailClient
          orderId={order.id}
          initialOrder={serializeOrderDetail(order)}
          currency={store.currency}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
