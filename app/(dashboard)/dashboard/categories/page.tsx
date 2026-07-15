import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeCategory } from "@/lib/catalog";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { CategoriesClient } from "@/components/categories/categories-client";

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
      <DashboardHeader title="Categories" description="Organize products into categories" />
      <DashboardPageContent>
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="premium-skeleton h-12 w-full max-w-md animate-pulse rounded-2xl" />
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="premium-skeleton h-24 animate-pulse rounded-2xl" />
                ))}
              </div>
              <div className="premium-skeleton h-96 animate-pulse rounded-2xl" />
            </div>
          }
        >
          <CategoriesClient initialCategories={categories.map(serializeCategory)} />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
