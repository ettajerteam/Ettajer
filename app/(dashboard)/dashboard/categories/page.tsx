import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeCategory } from "@/lib/catalog";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { CategoriesClient } from "@/components/categories/categories-client";
import { CategoryTableSkeleton } from "@/components/categories/category-table-skeleton";

export const metadata = { title: "Categories" };

export default async function DashboardCategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Categories"
        description="Organize products so shoppers can browse by type"
      />
      <DashboardPageContent>
        <Suspense fallback={<CategoryTableSkeleton />}>
          <CategoriesClient initialCategories={categories.map(serializeCategory)} />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
