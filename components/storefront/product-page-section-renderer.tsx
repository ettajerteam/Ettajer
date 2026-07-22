import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { BuilderSectionBridge } from "@/components/storefront/builder-section-bridge";
import { FadeInSection } from "@/components/storefront/motion-wrapper";
import { ProductPageLayoutProvider } from "@/components/storefront/product-page-layout-context";
import { ProductVariantProvider } from "@/components/storefront/product-variant-context";
import { ProductMobileBuyBar } from "@/components/storefront/product-mobile-buy-bar";
import { ResponsiveSectionStyles } from "@/components/storefront/responsive-section-styles";
import { RegistryBlockRenderer } from "@/components/builder/registry-block-renderer";
import {
  sectionWrapperClassName,
  sectionWrapperStyle,
  shouldMountSectionForDevice,
} from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import type { PublicCategory, PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { getStoreProductsUrl, getStoreUrl } from "@/lib/storefront-urls";

const DETAIL_TYPES = new Set([
  "product-info",
  "product-price",
  "product-variants",
  "product-buy-button",
]);

function partitionProductSections(sections: StoreSection[], includeHidden: boolean) {
  const gallery: StoreSection[] = [];
  const details: StoreSection[] = [];
  const below: StoreSection[] = [];

  for (const section of sections) {
    if (!includeHidden && !section.visible) continue;
    const settings = section.settings as Record<string, unknown>;
    if (section.type === "product-gallery") gallery.push(section);
    else if (
      DETAIL_TYPES.has(section.type) ||
      (section.type === "rich-text" && settings.layout === "strip")
    ) {
      details.push(section);
    } else below.push(section);
  }

  return { gallery, details, below };
}

function renderBlock(
  section: StoreSection,
  props: {
    store: PublicStore;
    product: PublicProduct;
    products: PublicProduct[];
    categories: PublicCategory[];
    previewDevice?: DeviceMode;
    builderMode?: boolean;
  }
) {
  return (
    <RegistryBlockRenderer
      section={section}
      store={props.store}
      products={props.products}
      product={props.product}
      categories={props.categories}
      previewDevice={props.previewDevice}
      builderMode={props.builderMode}
    />
  );
}

interface ProductPageSectionRendererProps {
  store: PublicStore;
  layout: HomeLayout;
  product: PublicProduct;
  products: PublicProduct[];
  categories?: PublicCategory[];
  previewDevice?: DeviceMode;
  builderMode?: boolean;
  selectedSectionId?: string | null;
}

export function ProductPageSectionRenderer({
  store,
  layout,
  product,
  products,
  categories = [],
  previewDevice,
  builderMode,
  selectedSectionId,
}: ProductPageSectionRendererProps) {
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isBold = themeId === "bold";
  const isModern = themeId === "modern";
  const forcedDevice = previewDevice != null;
  const sections = builderMode
    ? layout.sections
    : layout.sections.filter((section) => section.visible);
  const { gallery, details, below } = partitionProductSections(sections, Boolean(builderMode));
  const hasComposedMain = gallery.length > 0 || details.length > 0;

  const blockProps = { store, product, products, categories, previewDevice, builderMode };

  const renderSectionWrapper = (section: StoreSection, content: React.ReactNode) => {
    const settings = section.settings as Record<string, unknown>;
    if (!builderMode && !shouldMountSectionForDevice(settings, previewDevice)) return null;
    if (builderMode && !section.visible) return null;

    return (
      <div key={section.id}>
        <ResponsiveSectionStyles sectionId={section.id} settings={settings} />
        <div
          id={`section-${section.id}`}
          data-section-id={section.id}
          data-section-type={section.type}
          data-section-selected={selectedSectionId === section.id ? "true" : undefined}
          style={sectionWrapperStyle(settings, forcedDevice ? previewDevice : undefined)}
          className={cn(
            !forcedDevice && sectionWrapperClassName(settings),
            builderMode && "relative cursor-pointer transition-shadow duration-200"
          )}
        >
          {content}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        isBold ? "bg-zinc-950" : isModern ? "" : "bg-[#f7f7f5]"
      )}
      style={isModern ? { backgroundColor: store.secondaryColor } : undefined}
    >
      <BuilderSectionBridge enabled={builderMode} initialSectionId={selectedSectionId} />
      <StorefrontHeader
        store={store}
        variant={themeId}
        categories={categories}
        backHref={getStoreProductsUrl(store.slug)}
        backLabel="← Shop"
      />

      {product.id === "preview-placeholder" ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          Template preview — add products in your dashboard to preview with real catalog data.
        </div>
      ) : null}

      <ProductVariantProvider key={product.id} variants={product.variants ?? []}>
        {hasComposedMain ? (
          <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-3 sm:px-6 lg:px-8 lg:pb-16 lg:pt-6">
            <div className="mb-4 sm:mb-6">
              <StorefrontBreadcrumb
                variant={themeId}
                items={[
                  { label: store.name, href: getStoreUrl(store.slug) },
                  { label: "Shop", href: getStoreProductsUrl(store.slug) },
                  { label: product.title },
                ]}
              />
            </div>

            <div
              className={cn(
                "overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-0",
                isModern ? "rounded-sm" : "rounded-[1.75rem]",
                isBold
                  ? "border border-white/10 bg-zinc-900/80 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]"
                  : "border border-black/[0.06] bg-white shadow-[0_28px_80px_-48px_rgba(15,23,42,0.35)]"
              )}
            >
              <div
                className={cn(
                  "relative",
                  isBold
                    ? "bg-zinc-950"
                    : isModern
                      ? "bg-[#efece4]"
                      : "bg-gradient-to-b from-neutral-100 to-neutral-50"
                )}
              >
                <div className="lg:sticky lg:top-[4.5rem] lg:self-start">
                  {gallery.map((section) =>
                    renderSectionWrapper(
                      section,
                      <ProductPageLayoutProvider zone="gallery">
                        {renderBlock(section, blockProps)}
                      </ProductPageLayoutProvider>
                    )
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14 xl:px-14",
                  isBold ? "bg-zinc-900" : "bg-white",
                  isModern && "bg-white/90"
                )}
              >
                <div className="mx-auto w-full max-w-md space-y-0 pb-20 lg:mx-0 lg:max-w-none lg:pb-0">
                  {details.map((section, index) =>
                    renderSectionWrapper(
                      section,
                      <ProductPageLayoutProvider zone="details">
                        <div
                          className={cn(
                            "py-5 first:pt-0 last:pb-0",
                            index > 0 &&
                              (isBold ? "border-t border-white/10" : "border-t border-neutral-100")
                          )}
                        >
                          {renderBlock(section, blockProps)}
                        </div>
                      </ProductPageLayoutProvider>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {below.length > 0 ? (
          <div
            className={cn(
              "pb-28 lg:pb-10",
              isModern
                ? "bg-transparent"
                : isBold
                  ? "bg-zinc-950"
                  : "bg-[#f7f7f5]"
            )}
          >
            <div className="mx-auto max-w-[1400px] space-y-4 px-4 sm:px-6 lg:px-8">
              {below.map((section, index) =>
                renderSectionWrapper(
                  section,
                  <ProductPageLayoutProvider zone="below">
                    <FadeInSection delay={Math.min(index * 0.04, 0.16)}>
                      <div
                        className={cn(
                          "overflow-hidden",
                          isModern ? "rounded-sm" : "rounded-3xl",
                          isBold
                            ? "border border-white/10 bg-zinc-900"
                            : "border border-black/[0.05] bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.25)]"
                        )}
                      >
                        {renderBlock(section, blockProps)}
                      </div>
                    </FadeInSection>
                  </ProductPageLayoutProvider>
                )
              )}
            </div>
          </div>
        ) : null}

        {!builderMode ? (
          <ProductMobileBuyBar store={store} product={product} />
        ) : null}
      </ProductVariantProvider>
    </div>
  );
}
