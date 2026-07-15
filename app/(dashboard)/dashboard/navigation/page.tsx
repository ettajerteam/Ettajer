import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getStoreNavigation } from "@/lib/navigation";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { NavigationClient } from "@/components/navigation/navigation-client";

export const metadata = { title: "Navigation" };

export default async function NavigationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const items = await getStoreNavigation(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader title="Online Store" description="Edit your storefront menu" />
      <DashboardPageContent>
        <NavigationClient initial={items} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
