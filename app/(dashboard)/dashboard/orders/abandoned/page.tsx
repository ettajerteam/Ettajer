import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listAbandonedCheckouts, serializeAbandoned } from "@/lib/abandoned";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { AbandonedClient } from "@/components/orders/abandoned-client";

export const metadata = { title: "Abandoned Checkouts" };

export default async function AbandonedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const rows = await listAbandonedCheckouts(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Abandoned checkouts"
        description="Carts left before payment — recover with email or a draft order"
        helpArticle="recover-abandoned-carts"
      />
      <DashboardPageContent>
        <AbandonedClient
          initial={rows.map(serializeAbandoned)}
          currency={store.currency}
          storeSlug={store.slug}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
