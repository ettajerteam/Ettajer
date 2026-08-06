import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listDrafts, serializeDraftListItem } from "@/lib/drafts";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { DraftsClient } from "@/components/orders/drafts-client";

export const metadata = { title: "Draft Orders" };

export default async function DraftOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const drafts = await listDrafts(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Draft orders"
        description="Prepare orders before sending them to customers"
      />
      <DashboardPageContent>
        <DraftsClient
          initialDrafts={drafts.map(serializeDraftListItem)}
          currency={store.currency}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
