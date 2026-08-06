import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getStoreMenuDestinations, getStoreNavigation } from "@/lib/navigation";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { StoreMenuBuilder } from "@/components/navigation/store-menu-builder";
import {
  NAVIGATION_PAGE_TIPS,
  NavigationTipsFooter,
} from "@/components/shared/dashboard-tips-button";

export const metadata = { title: "Navigation" };

export default async function NavigationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [items, destinations] = await Promise.all([
    getStoreNavigation(store.id),
    getStoreMenuDestinations(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Navigation"
        description="Build the header menu shoppers use on your store"
        tips={NAVIGATION_PAGE_TIPS}
        tipsTitle="Menu tips"
        tipsDescription="A clear menu helps COD shoppers find trust pages fast."
        tipsFooter={<NavigationTipsFooter />}
      />
      <DashboardPageContent>
        <StoreMenuBuilder
          initial={items}
          destinations={destinations}
          storeSlug={store.slug}
          storeName={store.name}
          storeLogo={store.logo}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
