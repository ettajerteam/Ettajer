import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listCustomers } from "@/lib/customers";
import { productInclude, serializeProduct } from "@/lib/products";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { DraftForm } from "@/components/orders/draft-form";

export const metadata = { title: "New draft" };

export default async function NewDraftOrderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [products, recentCustomers] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id, status: { not: "archived" } },
      include: productInclude,
      orderBy: { title: "asc" },
    }),
    listCustomers(store.id, { sort: "recent" }),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="New draft"
        description="Manual draft for phone, WhatsApp, or in-person sales"
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
          recentCustomers={recentCustomers.slice(0, 8)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
