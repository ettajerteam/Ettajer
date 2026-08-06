import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ThemesLibraryClient } from "@/components/themes/themes-library-client";
import { isWebsiteTemplateId } from "@/lib/website-templates/registry";

export const metadata = { title: "Theme library" };

export default async function ThemesLibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const active =
    store.websiteTemplateId && isWebsiteTemplateId(store.websiteTemplateId)
      ? store.websiteTemplateId
      : null;

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Theme library"
        description="Choose a storefront layout"
      />
      <DashboardPageContent>
        <ThemesLibraryClient activeTemplateId={active} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
