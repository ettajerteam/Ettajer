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
import {
  documentToEditorHydration,
  resolveStoreThemeSourceLabel,
} from "@/lib/developer/theme-editor-bridge";
import { parseNavigation } from "@/lib/navigation";

export const metadata = { title: "Website editor" };

export default async function ThemeEditorPage({
  searchParams,
}: {
  searchParams?: { themeId?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  const themeId = searchParams?.themeId?.trim() || null;
  let storeThemeMeta: {
    id: string;
    name: string;
    sourceLabel: ReturnType<typeof resolveStoreThemeSourceLabel>;
  } | null = null;

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

  const designTokens = parseDesignTokens(store.settings?.seo);
  const layoutRevision = parseLayoutRevision(store.settings?.seo);
  const liveNav = parseNavigation(store.settings?.navigation);

  let editorStore;
  let initialPages;
  let initialNavigation = liveNav;

  if (themeId) {
    const owned = await prisma.storeTheme.findFirst({
      where: { id: themeId, storeId: store.id },
    });
    if (!owned) redirect("/dashboard/themes");

    const hydrated = documentToEditorHydration(owned.document, {
      storeId: store.id,
      slug: store.slug,
      name: store.name,
      description: store.description,
      updatedAt: owned.updatedAt.toISOString(),
      layoutRevision,
    });
    editorStore = {
      ...hydrated.store,
      textColor: designTokens.textColor,
      mutedColor: designTokens.mutedColor,
      borderColor: designTokens.borderColor,
      buttonRadius: designTokens.buttonRadius,
    };
    initialPages = hydrated.initialPages;
    initialNavigation = hydrated.initialNavigation;
    storeThemeMeta = {
      id: owned.id,
      name: owned.name,
      sourceLabel: resolveStoreThemeSourceLabel(owned),
    };
  } else {
    const theme = store.theme as ThemeId;
    const settings = store.settings as typeof store.settings & {
      productLayout?: unknown;
      collectionLayout?: unknown;
    };
    const homeLayout = parseHomeLayout(settings?.homeLayout, theme);
    const productLayout = parseProductLayout(settings?.productLayout, theme);
    const collectionLayout = parseCollectionLayout(settings?.collectionLayout, theme);
    initialPages = (await listStorePages(store.id)).map(serializeStorePage);
    editorStore = {
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
      layoutRevision,
      websiteTemplateId:
        store.websiteTemplateId && isWebsiteTemplateId(store.websiteTemplateId)
          ? store.websiteTemplateId
          : null,
      homeLayout,
      productLayout,
      collectionLayout,
    };
  }

  return (
    <WebsiteEditorDesktopOnly
      store={editorStore}
      previewPaths={{
        product: sampleProduct?.slug ?? null,
        category: sampleCategory?.slug ?? null,
        collection: sampleCollection?.slug ?? null,
        blogPost: sampleBlogPost?.slug ?? null,
      }}
      initialPages={initialPages}
      productCount={productCount}
      storeThemeId={storeThemeMeta?.id}
      storeThemeName={storeThemeMeta?.name}
      storeThemeSource={storeThemeMeta?.sourceLabel}
      initialNavigation={initialNavigation}
    />
  );
}
