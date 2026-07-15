import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeCollection } from "@/lib/catalog";
import { serializeProduct, productInclude } from "@/lib/products";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { CollectionsClient } from "@/components/collections/collections-client";

export const metadata = { title: "Collections" };

export default async function DashboardCollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      where: { storeId: store.id },
      include: {
        _count: { select: { products: true } },
        products: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { title: "asc" },
      include: productInclude,
    }),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader title="Collections" description="Curate product collections for your store" />
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
          <CollectionsClient
            initialCollections={collections.map(serializeCollection)}
            products={products.map(serializeProduct)}
          />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
