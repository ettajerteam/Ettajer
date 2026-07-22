import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontRenderer } from "@/components/storefront/storefront-renderer";
import { SectionRenderer } from "@/components/storefront/section-renderer";
import {
  getStoreBySlug,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { getPublishedBlogPost } from "@/lib/blog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { getStoreBlogUrl, getStoreUrl, getStoreBlogPostUrl, getStoreProductsUrl } from "@/lib/storefront-urls";
import {
  getPreviewPlaceholderBlogPost,
  isPreviewBlogPostSlug,
} from "@/lib/storefront-preview-blog-post";
import { parseBlogPostLayout } from "@/lib/sections/parse";
import { hydrateBlogPostLayout } from "@/lib/storefront-blog-post-layout";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";
import { buildBlogPostingSchema, buildBreadcrumbSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import Image from "next/image";

interface PageProps {
  params: { slug: string; postSlug: string };
  searchParams: {
    preview?: string;
    theme?: string;
    primary?: string;
    secondary?: string;
    font?: string;
    logo?: string;
    layout?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) return { title: "Post Not Found" };

  if (isPreviewBlogPostSlug(params.postSlug)) {
    return { title: `Blog post preview — ${storeData.name}` };
  }

  const post = await getPublishedBlogPost(storeData.id, params.postSlug);
  if (!post) return { title: "Post Not Found" };
  return buildStorefrontMetadata({
    storeName: storeData.name,
    path: getStoreBlogPostUrl(storeData.slug, post.slug),
    title: post.title,
    description: post.excerpt || `Read ${post.title} at ${storeData.name}`,
    image: post.image ?? storeData.logo,
    type: "article",
  });
}

function MagazineArticleFallback({
  store,
  themeId,
  categories,
  post,
  isPreviewBanner,
}: {
  store: ReturnType<typeof serializePublicStore>;
  themeId: ThemeId;
  categories: ReturnType<typeof serializePublicCategory>[];
  post: {
    title: string;
    excerpt: string | null;
    content: string;
    image: string | null;
    publishedAt?: Date | string | null;
  };
  isPreviewBanner?: boolean;
}) {
  const isBold = themeId === "bold";
  const isModern = themeId === "modern";
  const date =
    post.publishedAt &&
    new Date(post.publishedAt).toLocaleDateString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className={cn("min-h-screen", isBold ? "bg-zinc-950 text-white" : "bg-white")}>
      {isPreviewBanner ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          Template preview — create journal posts in your dashboard to preview with real content.
        </div>
      ) : null}
      <StorefrontHeader
        store={store}
        variant={themeId}
        categories={categories}
        backHref={getStoreBlogUrl(store.slug)}
        backLabel="← Journal"
      />

      {post.image ? (
        <div className="relative min-h-[42vh] w-full overflow-hidden bg-neutral-900 sm:min-h-[56vh]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 mx-auto px-6 pb-10 sm:pb-14",
              isModern ? "max-w-4xl" : "max-w-3xl"
            )}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Journal{date ? ` · ${date}` : ""}
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              {post.title}
            </h1>
          </div>
        </div>
      ) : null}

      <article
        className={cn(
          "mx-auto px-6 py-12 sm:py-16",
          isModern ? "max-w-2xl" : "max-w-xl sm:max-w-2xl"
        )}
      >
        {!post.image ? (
          <>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Journal{date ? ` · ${date}` : ""}
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
          </>
        ) : null}

        {post.excerpt ? (
          <p
            className={cn(
              "mt-6 text-lg font-light leading-relaxed sm:text-xl sm:leading-relaxed",
              isBold ? "text-white/65" : "text-neutral-600"
            )}
          >
            {post.excerpt}
          </p>
        ) : null}

        <div
          className={cn(
            "prose prose-neutral mt-10 max-w-none prose-headings:tracking-tight prose-p:text-[15px] prose-p:leading-[1.8] prose-img:rounded-sm",
            isBold && "prose-invert",
            isModern && "prose-p:text-neutral-600"
          )}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div
          className={cn(
            "mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-8",
            isBold ? "border-white/10" : "border-neutral-200"
          )}
        >
          <Link
            href={getStoreBlogUrl(store.slug)}
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.16em] transition",
              isBold ? "text-white/45 hover:text-white" : "text-neutral-400 hover:text-neutral-900"
            )}
          >
            ← All journal notes
          </Link>
          <Link
            href={getStoreProductsUrl(store.slug)}
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.16em] transition",
              isBold ? "text-white/45 hover:text-white" : "text-neutral-400 hover:text-neutral-900"
            )}
          >
            Shop the edit →
          </Link>
        </div>
      </article>
    </div>
  );
}

export default async function StoreBlogPostPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const isPreview = searchParams.preview === "true";
  const store = applyPreviewOverrides(serializePublicStore(storeData, storeData.settings), searchParams);
  const categories = storeData.categories.map(serializePublicCategory);
  const featuredCollections = storeData.collections.map(serializePublicCollection);
  const products = storeData.products.map(serializePublicProduct);
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;

  const settingsExt = storeData.settings as typeof storeData.settings & {
    blogPostLayout?: unknown;
  };
  const baseLayout = parseBlogPostLayout(settingsExt?.blogPostLayout, themeId);

  if (isPreviewBlogPostSlug(params.postSlug) && isPreview) {
    const post = getPreviewPlaceholderBlogPost();
    const hydrated = hydrateBlogPostLayout(baseLayout, {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      publishedAt: post.publishedAt,
    });

    return (
      <StorefrontShell store={store} preview>
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          Template preview — create journal posts in your dashboard to preview with real content.
        </div>
        <StorefrontRenderer
          store={store}
          products={products}
          categories={categories}
          featuredCollections={featuredCollections}
          homeLayout={hydrated}
          preview
          builderMode
        />
      </StorefrontShell>
    );
  }

  const post = await getPublishedBlogPost(storeData.id, params.postSlug);
  if (!post) notFound();

  const hydrated = hydrateBlogPostLayout(baseLayout, {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    image: post.image,
    publishedAt: post.publishedAt,
  });

  const hasHero = hydrated.sections.some((s) => s.type === "hero" && s.visible);
  const hasBody = hydrated.sections.some(
    (s) =>
      s.type === "rich-text" &&
      s.visible &&
      (s.settings as { content?: string }).content === post.content
  );

  // Prefer section template when it successfully absorbed the article.
  if (hasHero && hasBody) {
    return (
      <>
        {!isPreview ? (
          <JsonLd
            graph={[
              buildBlogPostingSchema({
                title: post.title,
                path: getStoreBlogPostUrl(store.slug, post.slug),
                description: post.excerpt,
                image: post.image,
                datePublished: post.publishedAt,
                dateModified: post.updatedAt ?? post.publishedAt,
                storeName: store.name,
                storePath: getStoreUrl(store.slug),
              }),
              buildBreadcrumbSchema([
                { name: store.name, path: getStoreUrl(store.slug) },
                { name: "Journal", path: getStoreBlogUrl(store.slug) },
                { name: post.title },
              ]),
            ]}
          />
        ) : null}
        <StorefrontShell store={store} preview={isPreview}>
          <SectionRenderer
            store={store}
            layout={hydrated}
            products={products}
            categories={categories}
            featuredCollections={featuredCollections}
            showHeader
          />
        </StorefrontShell>
      </>
    );
  }

  return (
    <>
      {!isPreview ? (
        <JsonLd
          graph={[
            buildBlogPostingSchema({
              title: post.title,
              path: getStoreBlogPostUrl(store.slug, post.slug),
              description: post.excerpt,
              image: post.image,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt ?? post.publishedAt,
              storeName: store.name,
              storePath: getStoreUrl(store.slug),
            }),
            buildBreadcrumbSchema([
              { name: store.name, path: getStoreUrl(store.slug) },
              { name: "Journal", path: getStoreBlogUrl(store.slug) },
              { name: post.title },
            ]),
          ]}
        />
      ) : null}
      <StorefrontShell store={store} preview={isPreview}>
        <MagazineArticleFallback
          store={store}
          themeId={themeId}
          categories={categories}
          post={post}
        />
      </StorefrontShell>
    </>
  );
}
