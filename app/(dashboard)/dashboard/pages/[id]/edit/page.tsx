import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getStorePageById, serializeStorePage } from "@/lib/pages";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { PageEditorClient } from "@/components/pages/page-editor-client";
import {
  PAGES_PAGE_TIPS,
  PagesTipsFooter,
} from "@/components/shared/dashboard-tips-button";

export const metadata = { title: "Edit page" };

export default async function EditStorePage({
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

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Edit page"
        description="Update content, then fine-tune SEO & settings"
        tips={PAGES_PAGE_TIPS}
        tipsTitle="Writing tips"
        tipsDescription="Clear pages reduce support questions."
        tipsFooter={<PagesTipsFooter />}
      />
      <DashboardPageContent>
        <PageEditorClient
          storeSlug={store.slug}
          page={serializeStorePage(page)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
