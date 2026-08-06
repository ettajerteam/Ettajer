import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getStorePageById, listStorePages, serializeStorePage } from "@/lib/pages";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { PageSettingsClient } from "@/components/pages/page-settings-client";
import {
  PAGES_PAGE_TIPS,
  PagesTipsFooter,
} from "@/components/shared/dashboard-tips-button";

export const metadata = { title: "Page settings" };

export default async function PageSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const page = await getStorePageById(params.id, store.id);
  if (!page) notFound();

  const siblings = await listStorePages(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="SEO & settings"
        description="Search listing, visibility, URL, and social share"
        tips={PAGES_PAGE_TIPS}
        tipsTitle="Page tips"
        tipsDescription="Clear pages reduce support questions."
        tipsFooter={<PagesTipsFooter />}
      />
      <DashboardPageContent>
        <PageSettingsClient
          storeSlug={store.slug}
          page={serializeStorePage(page)}
          siblingSlugs={siblings
            .filter((p) => p.id !== page.id)
            .map((p) => p.slug)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
