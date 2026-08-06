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
  isSectionVisibleOnDevice,
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
  const isAuraPdp = layout.sections.some((section) =>
    section.id.startsWith("aura-pdp-")
  );
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
      data-pdp={isAuraPdp ? "aura" : undefined}
      className={cn(
        "relative min-h-screen overflow-x-hidden",
        isBold ? "bg-zinc-950" : isAuraPdp ? "pdp-aura-ambient" : "pdp-ambient"
      )}
    >
      {!isBold && !isAuraPdp ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] opacity-70"
          style={{
            background: `radial-gradient(ellipse 55% 45% at 70% 18%, color-mix(in srgb, var(--store-primary) 14%, transparent), transparent 70%)`,
          }}
        />
      ) : null}

      <BuilderSectionBridge enabled={builderMode} initialSectionId={selectedSectionId} />
      <StorefrontHeader
        store={store}
        variant={themeId}
        categories={categories}
        backHref={getStoreProductsUrl(store.slug)}
        backLabel="← Shop"
      />

      {product.id === "preview-placeholder" ? (
        <div className="border-b border-amber-200/80 bg-amber-50/80 px-4 py-2 text-center text-xs text-amber-900 backdrop-blur-md">
          Template preview — add products in your dashboard to preview with real catalog data.
        </div>
      ) : null}

      <ProductVariantProvider key={product.id} variants={product.variants ?? []}>
        {hasComposedMain ? (
          <div
            className={cn(
              "relative mx-auto max-w-[1280px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-20 lg:pt-8",
              isAuraPdp && "lg:max-w-[1360px] lg:pt-10"
            )}
          >
            <div className={cn("mb-5 sm:mb-8", isAuraPdp && "mb-7 sm:mb-10")}>
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
                "overflow-hidden lg:grid lg:items-start",
                isAuraPdp
                  ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:gap-12 xl:gap-16"
                  : "lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)] lg:gap-8 xl:gap-10"
              )}
            >
              <FadeInSection
                className={cn(
                  "relative overflow-hidden",
                  isBold
                    ? "pdp-glass-dark rounded-[2rem]"
                    : isAuraPdp
                      ? "pdp-aura-panel"
                      : "pdp-glass rounded-[2rem]"
                )}
              >
                <div className="lg:sticky lg:top-[4.75rem] lg:self-start">
                  {gallery.map((section) =>
                    renderSectionWrapper(
                      section,
                      <ProductPageLayoutProvider zone="gallery">
                        {renderBlock(section, blockProps)}
                      </ProductPageLayoutProvider>
                    )
                  )}
                </div>
              </FadeInSection>

              <FadeInSection
                delay={0.08}
                className={cn(
                  "mt-5 lg:mt-0 lg:sticky lg:top-[4.75rem]",
                  isBold
                    ? "pdp-glass-dark rounded-[2rem]"
                    : isAuraPdp
                      ? "pdp-aura-panel pdp-aura-details"
                      : "pdp-glass rounded-[2rem]"
                )}
              >
                <div
                  className={cn(
                    "flex flex-col",
                    isAuraPdp
                      ? "px-1 py-2 sm:px-2 sm:py-3 lg:px-1 lg:py-2"
                      : "px-5 py-7 sm:px-8 sm:py-9 lg:px-9 lg:py-10",
                    isBold ? "text-white" : "text-neutral-950"
                  )}
                >
                  <div
                    className={cn(
                      "mx-auto w-full max-w-md space-y-0 pb-24 lg:mx-0 lg:max-w-none lg:pb-0",
                      isAuraPdp && "max-w-lg space-y-1"
                    )}
                  >
                    {details.map((section, index) =>
                      renderSectionWrapper(
                        section,
                        <ProductPageLayoutProvider zone="details">
                          <div
                            className={cn(
                              "py-5 first:pt-0 last:pb-0",
                              index > 0 &&
                                (isBold
                                  ? "border-t border-white/10"
                                  : "border-t border-black/[0.06]")
                            )}
                          >
                            {renderBlock(section, blockProps)}
                          </div>
                        </ProductPageLayoutProvider>
                      )
                    )}
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        ) : null}

        {below.length > 0 ? (
          <div className={cn("pb-28 lg:pb-14", isBold ? "bg-transparent" : "bg-transparent")}>
            <div
              className={cn(
                "mx-auto space-y-5 px-4 sm:px-6 lg:px-8",
                isAuraPdp
                  ? "max-w-none space-y-0 px-0 sm:px-0 lg:px-0"
                  : "max-w-[1280px]"
              )}
            >
              {below.map((section, index) =>
                renderSectionWrapper(
                  section,
                  <ProductPageLayoutProvider zone="below">
                    <FadeInSection delay={Math.min(index * 0.05, 0.2)}>
                      <div
                        className={cn(
                          "overflow-hidden",
                          isAuraPdp
                            ? "rounded-none"
                            : isBold
                              ? "rounded-[1.75rem] pdp-glass-dark"
                              : "rounded-[1.75rem] pdp-glass"
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
          <ProductMobileBuyBar
            store={store}
            product={product}
            label={
              (
                details.find((s) => s.type === "product-buy-button")
                  ?.settings as { buttonText?: string } | undefined
              )?.buttonText
            }
            forceDesktop={
              !details.some((s) => {
                if (s.type !== "product-buy-button" || s.visible === false) {
                  return false;
                }
                const settings = s.settings as Record<string, unknown>;
                if (settings.hideOnDesktop === true) return false;
                return isSectionVisibleOnDevice(settings, "desktop");
              })
            }
          />
        ) : null}
      </ProductVariantProvider>
    </div>
  );
}
