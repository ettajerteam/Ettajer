import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getInventorySummary, listInventory } from "@/lib/inventory";
import { getProductsSectionCounts } from "@/lib/products-stats";
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

  const [items, summary, counts] = await Promise.all([
    listInventory(store.id),
    getInventorySummary(store.id),
    getProductsSectionCounts(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader title="Products" description="Track and manage stock levels" />
      <DashboardPageContent>
        <InventoryClient
          initialItems={items}
          summary={summary}
          currency={store.currency}
          counts={counts}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
