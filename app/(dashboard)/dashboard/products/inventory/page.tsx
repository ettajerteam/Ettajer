import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getInventoryPageData } from "@/lib/inventory";
import { getProductsSectionCounts } from "@/lib/products-stats";
import { parseProductReviews } from "@/lib/product-reviews";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { InventoryClient } from "@/components/inventory/inventory-client";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [{ items, summary }, counts, products] = await Promise.all([
    getInventoryPageData(store.id),
    getProductsSectionCounts(store.id),
    prisma.product.findMany({
      where: { storeId: store.id },
      select: { reviews: true },
    }),
  ]);

  const reviewsCount = products.reduce((sum, p) => {
    return sum + (parseProductReviews(p.reviews).length > 0 ? 1 : 0);
  }, 0);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Inventory"
        description="Stock levels, cost, and location — scan barcode to find products"
      />
      <DashboardPageContent>
        <InventoryClient
          initialItems={items}
          summary={summary}
          currency={store.currency}
          counts={counts}
          reviewsCount={reviewsCount}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
