import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { DomainsPageClient } from "@/components/domains/domains-page-client";

export const metadata = { title: "Domains" };

export default async function DashboardDomainsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Online Store"
        description="Your storefront address"
      />
      <DashboardPageContent>
        <DomainsPageClient store={serializeStoreWithSettings(store)} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
