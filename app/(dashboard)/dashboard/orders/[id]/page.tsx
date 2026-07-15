import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getOrderForStore, serializeOrderDetail } from "@/lib/orders";
import { parseTicketPrinters } from "@/lib/ticket-printers";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { OrderDetailClient } from "@/components/orders/order-detail-client";

export const metadata = { title: "Order Details" };

interface PageProps {
  params: { id: string };
}

export default async function DashboardOrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  const order = await getOrderForStore(params.id, store.id);
  if (!order) notFound();

  const ticketPrinters = parseTicketPrinters(store.settings?.ticketPrinters);

  return (
    <DashboardLayout>
      <DashboardHeader title="Order Details" description={order.orderNumber} />
      <DashboardPageContent>
        <OrderDetailClient
          orderId={order.id}
          initialOrder={serializeOrderDetail(order)}
          currency={store.currency}
          ticketPrinters={ticketPrinters}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
