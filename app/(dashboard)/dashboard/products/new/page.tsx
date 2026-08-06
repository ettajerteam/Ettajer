import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { parseTicketPrinters } from "@/lib/ticket-printers";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ProductEditorClient } from "@/components/products/product-editor-client";

export const metadata = { title: "Add product" };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { first?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  const productCount = await prisma.product.count({
    where: { storeId: store.id },
  });
  const quickStart = searchParams.first === "1" || productCount === 0;
  const ticketPrinters = parseTicketPrinters(store.settings?.ticketPrinters);

  return (
    <DashboardLayout>
      <DashboardHeader
        title={quickStart ? "Add your first product" : "Add product"}
        description={
          quickStart
            ? "Name, price, and photos — publish in a few minutes. COD checkout is already on."
            : "Choose a type, fill in the details, add media, then publish when you’re ready."
        }
      />
      <DashboardPageContent>
        <ProductEditorClient
          currency={store.currency}
          ticketPrinters={ticketPrinters}
          storeSlug={store.slug}
          storeName={store.name}
          quickStart={quickStart}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
