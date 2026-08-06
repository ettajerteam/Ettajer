import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listStorePages, serializeStorePage } from "@/lib/pages";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { PagesClient } from "@/components/pages/pages-client";
import {
  PAGES_PAGE_TIPS,
  PagesTipsFooter,
} from "@/components/shared/dashboard-tips-button";

export const metadata = { title: "Pages" };

export default async function StorePagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const pages = await listStorePages(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Pages"
        description="Custom About, FAQ, and policy pages for your store"
        tips={PAGES_PAGE_TIPS}
        tipsTitle="Page tips"
        tipsDescription="Build trust pages shoppers actually read."
        tipsFooter={<PagesTipsFooter />}
      />
      <DashboardPageContent>
        <PagesClient
          initial={pages.map(serializeStorePage)}
          storeSlug={store.slug}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
