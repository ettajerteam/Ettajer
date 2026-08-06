import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listCustomers } from "@/lib/customers";
import { getDraftForStore, serializeDraftDetail } from "@/lib/drafts";
import { productInclude, serializeProduct } from "@/lib/products";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { DraftForm } from "@/components/orders/draft-form";

export const metadata = { title: "Edit draft order" };

interface PageProps {
  params: { id: string };
}

export default async function EditDraftOrderPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [draft, products, recentCustomers] = await Promise.all([
    getDraftForStore(params.id, store.id),
    prisma.product.findMany({
      where: { storeId: store.id, status: { not: "archived" } },
      include: productInclude,
      orderBy: { title: "asc" },
    }),
    listCustomers(store.id, { sort: "recent" }),
  ]);

  if (!draft) notFound();

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Edit draft"
        description={draft.orderNumber}
        helpArticle="create-draft-orders"
        actions={
          <Link
            href="/dashboard/orders/drafts"
            className="inline-flex h-7 shrink-0 items-center rounded-md border border-black/[0.06] bg-white px-2.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
          >
            Cancel
          </Link>
        }
      />
      <DashboardPageContent>
        <DraftForm
          products={products.map(serializeProduct)}
          currency={store.currency}
          draft={serializeDraftDetail(draft)}
          recentCustomers={recentCustomers.slice(0, 8)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
