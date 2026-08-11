import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EtsyChannelClient } from "@/components/channels/etsy-channel-client";

export const metadata = { title: "Etsy" };

export const dynamic = "force-dynamic";

export default async function EtsyChannelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Etsy"
        description="Connect your Etsy shop to sync listings, inventory, and orders with Ettajer."
      />
      <DashboardPageContent>
        <EtsyChannelClient />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
