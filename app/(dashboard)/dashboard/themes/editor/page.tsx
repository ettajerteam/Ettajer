import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { WebsiteEditorDesktopOnly } from "@/components/website-editor/website-editor-desktop-only";
import { parseCollectionLayout, parseHomeLayout, parseProductLayout } from "@/lib/sections/parse";
import { listStorePages, serializeStorePage } from "@/lib/pages";
import type { ThemeId } from "@/lib/themes";
import { isWebsiteTemplateId } from "@/lib/website-templates/registry";
import { parseDesignTokens } from "@/lib/design-tokens";
import { parseLayoutRevision } from "@/lib/builder/layout-revision";

export const metadata = { title: "Website editor" };

export default async function ThemeEditorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  const [sampleProduct, sampleCategory, sampleCollection, sampleBlogPost, productCount] =
    await Promise.all([
      prisma.product.findFirst({
        where: { storeId: store.id },
        select: { slug: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findFirst({
        where: { storeId: store.id, status: "active" },
        select: { slug: true },
      }),
      prisma.collection.findFirst({
        where: { storeId: store.id },
        select: { slug: true },
        orderBy: { featured: "desc" },
      }),
      prisma.blogPost.findFirst({
        where: { storeId: store.id, status: "published" },
        select: { slug: true },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.product.count({ where: { storeId: store.id } }),
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
  const designTokens = parseDesignTokens(settings?.seo);

  return (
    <WebsiteEditorDesktopOnly
      store={{
        id: store.id,
        slug: store.slug,
        name: store.name,
        description: store.description,
        logo: store.logo,
        theme,
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        font: store.font,
        textColor: designTokens.textColor,
        mutedColor: designTokens.mutedColor,
        borderColor: designTokens.borderColor,
        buttonRadius: designTokens.buttonRadius,
        updatedAt: store.updatedAt.toISOString(),
        layoutRevision: parseLayoutRevision(settings?.seo),
        websiteTemplateId:
          store.websiteTemplateId && isWebsiteTemplateId(store.websiteTemplateId)
            ? store.websiteTemplateId
            : null,
        homeLayout,
        productLayout,
        collectionLayout,
      }}
      previewPaths={{
        product: sampleProduct?.slug ?? null,
        category: sampleCategory?.slug ?? null,
        collection: sampleCollection?.slug ?? null,
        blogPost: sampleBlogPost?.slug ?? null,
      }}
      initialPages={pages}
      productCount={productCount}
    />
  );
}
