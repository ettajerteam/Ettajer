import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { productInclude, serializeProduct } from "@/lib/products";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { DraftForm } from "@/components/orders/draft-form";

export const metadata = { title: "Create Draft Order" };

export default async function NewDraftOrderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    include: productInclude,
    orderBy: { title: "asc" },
  });

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Create draft order"
        description="Add products and customer details, then save or complete the draft"
      />
      <DashboardPageContent>
        <DraftForm
          products={products.map(serializeProduct)}
          currency={store.currency}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
