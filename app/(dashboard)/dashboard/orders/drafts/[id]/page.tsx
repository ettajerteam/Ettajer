import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getDraftForStore, serializeDraftDetail } from "@/lib/drafts";
import { productInclude, serializeProduct } from "@/lib/products";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { DraftForm } from "@/components/orders/draft-form";

export const metadata = { title: "Edit Draft Order" };

interface PageProps {
  params: { id: string };
}

export default async function EditDraftOrderPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [draft, products] = await Promise.all([
    getDraftForStore(params.id, store.id),
    prisma.product.findMany({
      where: { storeId: store.id },
      include: productInclude,
      orderBy: { title: "asc" },
    }),
  ]);

  if (!draft) notFound();

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Edit draft order"
        description={draft.orderNumber}
      />
      <DashboardPageContent>
        <DraftForm
          products={products.map(serializeProduct)}
          currency={store.currency}
          draft={serializeDraftDetail(draft)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
