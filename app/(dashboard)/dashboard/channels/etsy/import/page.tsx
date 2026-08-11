import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EtsyImportClient } from "@/components/channels/etsy-import-client";

export const metadata = { title: "Import from Etsy" };

export const dynamic = "force-dynamic";

export default async function EtsyImportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Import from Etsy"
        description="Review your Etsy listings and choose which ones to bring into Ettajer."
      />
      <DashboardPageContent>
        <EtsyImportClient />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
