import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listStorePages, serializeStorePage } from "@/lib/pages";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { PagesClient } from "@/components/pages/pages-client";

export const metadata = { title: "Pages" };

export default async function StorePagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const pages = await listStorePages(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader title="Online Store" description="Custom storefront pages" />
      <DashboardPageContent>
        <PagesClient initial={pages.map(serializeStorePage)} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
