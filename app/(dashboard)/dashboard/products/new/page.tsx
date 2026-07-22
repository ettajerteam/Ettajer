import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { parseTicketPrinters } from "@/lib/ticket-printers";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ProductEditorClient } from "@/components/products/product-editor-client";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  const ticketPrinters = parseTicketPrinters(store.settings?.ticketPrinters);

  return (
    <DashboardLayout>
      <DashboardPageContent>
        <ProductEditorClient currency={store.currency} ticketPrinters={ticketPrinters} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
