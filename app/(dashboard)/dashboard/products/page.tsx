import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeProduct, productInclude } from "@/lib/products";
import { getProductsListStats, getProductsSectionCounts } from "@/lib/products-stats";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import {
  ProductsClient,
  ProductsPageSkeleton,
} from "@/components/products/products-client";

export const metadata = { title: "Products" };

export default async function DashboardProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [products, counts, stats] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      include: productInclude,
    }),
    getProductsSectionCounts(store.id),
    getProductsListStats(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader title="Products" description="Manage your product catalog" />
      <DashboardPageContent>
        <Suspense fallback={<ProductsPageSkeleton />}>
          <ProductsClient
            initialProducts={products.map(serializeProduct)}
            currency={store.currency}
            counts={counts}
            stats={stats}
          />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
