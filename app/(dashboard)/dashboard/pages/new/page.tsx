import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listStorePages } from "@/lib/pages";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { PageNewClient } from "@/components/pages/page-new-client";
import {
  PAGES_PAGE_TIPS,
  PagesTipsFooter,
} from "@/components/shared/dashboard-tips-button";

export const metadata = { title: "New page" };

export default async function NewStorePage({
  searchParams,
}: {
  searchParams: { template?: string };
}) {
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
        title="New page"
        description="Choose a template or start blank — then write and publish"
        tips={PAGES_PAGE_TIPS}
        tipsTitle="Writing tips"
        tipsDescription="Clear pages reduce support questions."
        tipsFooter={<PagesTipsFooter />}
      />
      <DashboardPageContent>
        <PageNewClient
          storeSlug={store.slug}
          existingPages={pages.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
          }))}
          initialTemplateId={searchParams.template ?? null}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
