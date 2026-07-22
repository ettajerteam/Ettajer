import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { CatalogPage } from "@/components/storefront/catalog-page";
import { SectionRenderer } from "@/components/storefront/section-renderer";
import { BuilderPreviewSections } from "@/components/storefront/builder-preview-sections";
import { parseCollectionLayout } from "@/lib/sections/parse";
import type { HomeLayout } from "@/lib/sections/types";
import type { DeviceMode } from "@/lib/builder/types";
import type { PublicCategory, PublicCollection, PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";

interface CollectionPageRendererProps {
  store: PublicStore;
  collection: PublicCollection;
  products: PublicProduct[];
  categories: PublicCategory[];
  collectionLayout?: HomeLayout | null;
  preview?: boolean;
  builderMode?: boolean;
  selectedSectionId?: string | null;
  previewDevice?: DeviceMode;
}

export function CollectionPageRenderer({
  store,
  collection,
  products,
  categories,
  collectionLayout,
  preview,
  builderMode,
  selectedSectionId,
  previewDevice,
}: CollectionPageRendererProps) {
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const layout = collectionLayout ?? parseCollectionLayout(null, themeId);
  const useBlockLayout = layout.sections.length > 0;

  if (!useBlockLayout) {
    return (
      <CatalogPage
        store={store}
        products={products}
        categories={categories}
        title={collection.name}
        description={collection.description}
        image={collection.image}
        breadcrumbLabel={collection.name}
        preview={preview}
      />
    );
  }

  const sectionProps = {
    store,
    layout,
    products,
    categories,
    collection,
    selectedSectionId,
    previewDevice,
  };

  return (
    <StorefrontShell store={store} preview={preview}>
      {collection.id === "preview-placeholder" ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          Template preview — add collections in your dashboard to preview with real catalog data.
        </div>
      ) : null}
      {builderMode ? (
        <BuilderPreviewSections {...sectionProps} />
      ) : (
        <SectionRenderer {...sectionProps} />
      )}
    </StorefrontShell>
  );
}
