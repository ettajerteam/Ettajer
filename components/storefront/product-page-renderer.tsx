import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ProductViewTracker } from "@/components/storefront/product-view-tracker";
import { SectionRenderer } from "@/components/storefront/section-renderer";
import { BuilderPreviewSections } from "@/components/storefront/builder-preview-sections";
import { MinimalProductPage } from "@/components/storefront/templates/minimal";
import { ModernProductPage } from "@/components/storefront/templates/modern";
import { BoldProductPage } from "@/components/storefront/templates/bold";
import { parseProductLayout } from "@/lib/sections/parse";
import type { HomeLayout } from "@/lib/sections/types";
import type { DeviceMode } from "@/lib/builder/types";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";

const LEGACY_PRODUCT_TEMPLATES: Record<
  ThemeId,
  React.ComponentType<{ store: PublicStore; product: PublicProduct }>
> = {
  minimal: MinimalProductPage,
  modern: ModernProductPage,
  bold: BoldProductPage,
};

interface ProductPageRendererProps {
  store: PublicStore;
  product: PublicProduct;
  relatedProducts?: PublicProduct[];
  productLayout?: HomeLayout | null;
  preview?: boolean;
  builderMode?: boolean;
  selectedSectionId?: string | null;
  previewDevice?: DeviceMode;
}

export function ProductPageRenderer({
  store,
  product,
  relatedProducts = [],
  productLayout,
  preview,
  builderMode,
  selectedSectionId,
  previewDevice,
}: ProductPageRendererProps) {
  const themeId = (store.theme in LEGACY_PRODUCT_TEMPLATES ? store.theme : "minimal") as ThemeId;
  const layout = productLayout ?? parseProductLayout(null, themeId);
  const useBlockLayout = layout.sections.length > 0;

  const tracker = (
    <ProductViewTracker
      marketing={store.marketing}
      product={{ id: product.id, title: product.title, price: product.price }}
      currency={store.currency}
    />
  );

  if (!useBlockLayout) {
    const Template = LEGACY_PRODUCT_TEMPLATES[themeId];
    return (
      <StorefrontShell store={store} preview={preview}>
        {tracker}
        <Template store={store} product={product} />
      </StorefrontShell>
    );
  }

  const sectionProps = {
    store,
    layout,
    products: relatedProducts,
    product,
    selectedSectionId,
    previewDevice,
  };

  return (
    <StorefrontShell store={store} preview={preview}>
      {tracker}
      {builderMode ? (
        <BuilderPreviewSections {...sectionProps} />
      ) : (
        <SectionRenderer {...sectionProps} />
      )}
    </StorefrontShell>
  );
}
