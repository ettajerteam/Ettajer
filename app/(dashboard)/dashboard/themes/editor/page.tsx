import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { WebsiteEditorClient } from "@/components/website-editor/website-editor-client";
import { parseCollectionLayout, parseHomeLayout, parseProductLayout } from "@/lib/sections/parse";
import { listStorePages, serializeStorePage } from "@/lib/pages";
import type { ThemeId } from "@/lib/themes";

export const metadata = { title: "Website editor" };

export default async function ThemeEditorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  const [sampleProduct, sampleCategory, sampleCollection] = await Promise.all([
    prisma.product.findFirst({ where: { storeId: store.id }, select: { slug: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findFirst({ where: { storeId: store.id, status: "active" }, select: { slug: true } }),
    prisma.collection.findFirst({ where: { storeId: store.id }, select: { slug: true }, orderBy: { featured: "desc" } }),
  ]);

  const theme = store.theme as ThemeId;
  const settings = store.settings as typeof store.settings & {
    productLayout?: unknown;
    collectionLayout?: unknown;
  };
  const homeLayout = parseHomeLayout(settings?.homeLayout, theme);
  const productLayout = parseProductLayout(settings?.productLayout, theme);
  const collectionLayout = parseCollectionLayout(settings?.collectionLayout, theme);
  const pages = (await listStorePages(store.id)).map(serializeStorePage);

  return (
    <WebsiteEditorClient
      store={{
        id: store.id,
        slug: store.slug,
        logo: store.logo,
        theme,
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        font: store.font,
        updatedAt: store.updatedAt.toISOString(),
        homeLayout,
        productLayout,
        collectionLayout,
      }}
      previewPaths={{
        product: sampleProduct?.slug ?? null,
        category: sampleCategory?.slug ?? null,
        collection: sampleCollection?.slug ?? null,
      }}
      initialPages={pages}
    />
  );
}
