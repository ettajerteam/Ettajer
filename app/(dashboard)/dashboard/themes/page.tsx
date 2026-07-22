import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ThemesPageClient } from "@/components/themes/themes-page-client";
import { isWebsiteTemplateId } from "@/lib/website-templates/registry";

export const metadata = { title: "Themes" };

export default async function DashboardThemesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [sampleProduct, sampleCategory, sampleCollection] = await Promise.all([
    prisma.product.findFirst({ where: { storeId: store.id }, select: { slug: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findFirst({ where: { storeId: store.id, status: "active" }, select: { slug: true } }),
    prisma.collection.findFirst({ where: { storeId: store.id }, select: { slug: true }, orderBy: { featured: "desc" } }),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Themes"
        description="Storefront design, brand, and live preview"
      />
      <DashboardPageContent>
        <ThemesPageClient
          store={{
            slug: store.slug,
            logo: store.logo,
            theme: store.theme as "minimal" | "modern" | "bold",
            primaryColor: store.primaryColor,
            secondaryColor: store.secondaryColor,
            font: store.font,
            updatedAt: store.updatedAt.toISOString(),
            websiteTemplateId:
              store.websiteTemplateId && isWebsiteTemplateId(store.websiteTemplateId)
                ? store.websiteTemplateId
                : null,
            businessModel: store.businessModel,
          }}
          previewPaths={{
            product: sampleProduct?.slug ?? null,
            category: sampleCategory?.slug ?? null,
            collection: sampleCollection?.slug ?? null,
          }}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
