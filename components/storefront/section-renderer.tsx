import { memo, useMemo } from "react";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { BuilderSectionBridge } from "@/components/storefront/builder-section-bridge";
import { ResponsiveSectionStyles } from "@/components/storefront/responsive-section-styles";
import { RegistryBlockRenderer } from "@/components/builder/registry-block-renderer";
import { getBlockBySectionType } from "@/lib/builder/block-registry";
import type { DeviceMode } from "@/lib/builder/types";
import {
  isSectionVisibleOnDevice,
  shouldMountSectionForDevice,
  sectionWrapperClassName,
  sectionWrapperStyle,
} from "@/lib/builder/section-styles";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import type { PublicCategory, PublicCollection, PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { resolveLayoutSections, type BuilderComponent } from "@/lib/builder/components";
import { hashSection } from "@/lib/builder/layout-hash";

interface SectionRendererProps {
  store: PublicStore;
  layout: HomeLayout;
  products: PublicProduct[];
  categories?: PublicCategory[];
  featuredCollections?: PublicCollection[];
  product?: PublicProduct;
  collection?: PublicCollection;
  selectedSectionId?: string | null;
  builderMode?: boolean;
  previewDevice?: DeviceMode;
  /** When provided, linked component instances are resolved before render. */
  components?: Record<string, BuilderComponent>;
  /** Hide storefront header when rendering nested template pages that manage their own chrome. */
  showHeader?: boolean;
}

type SectionContentProps = Pick<
  SectionRendererProps,
  | "store"
  | "products"
  | "categories"
  | "featuredCollections"
  | "product"
  | "collection"
  | "previewDevice"
  | "builderMode"
>;

function renderSectionContent(section: StoreSection, props: SectionContentProps) {
  return (
    <RegistryBlockRenderer
      section={section}
      store={props.store}
      products={props.products}
      categories={props.categories}
      featuredCollections={props.featuredCollections}
      product={props.product}
      collection={props.collection}
      previewDevice={props.previewDevice}
      builderMode={props.builderMode}
    />
  );
}

function BuilderSectionGhost({ section }: { section: StoreSection }) {
  const block = getBlockBySectionType(section.type);
  const label = block?.name ?? section.type.replace(/-/g, " ");
  return (
    <div className="ettajer-builder-section-ghost flex min-h-[120px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <span className="rounded-full bg-neutral-200/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        Hidden section
      </span>
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className="max-w-xs text-xs text-neutral-400">
        This block is hidden on your live store. Toggle visibility in the section list to show it.
      </p>
    </div>
  );
}

function BuilderDeviceHiddenGhost({ device }: { device: DeviceMode }) {
  const label = device === "mobile" ? "mobile" : device === "tablet" ? "tablet" : "desktop";
  return (
    <div className="ettajer-builder-section-ghost flex min-h-[80px] flex-col items-center justify-center gap-1 px-6 py-6 text-center">
      <span className="rounded-full bg-neutral-200/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        Hidden on {label}
      </span>
    </div>
  );
}

type PreviewSectionRowProps = {
  section: StoreSection;
  index: number;
  contentProps: SectionContentProps;
  builderMode?: boolean;
  activeDevice: DeviceMode;
  isSelected: boolean;
};

const PreviewSectionRow = memo(function PreviewSectionRow({
  section,
  index,
  contentProps,
  builderMode,
  activeDevice,
  isSelected,
}: PreviewSectionRowProps) {
  const settings = section.settings as Record<string, unknown>;
  const isHidden = !section.visible;
  const showGhost = builderMode && isHidden;
  const showContent = section.visible;
  const previewDevice = contentProps.previewDevice;
  const forcedDevice = previewDevice != null;
  const visibleOnDevice = forcedDevice
    ? isSectionVisibleOnDevice(settings, previewDevice)
    : true;
  const showDeviceGhost = builderMode && showContent && forcedDevice && !visibleOnDevice;
  if (!showGhost && !showContent) return null;
  if (!builderMode && !shouldMountSectionForDevice(settings, previewDevice)) return null;

  const wrapperDevice = builderMode && previewDevice ? previewDevice : undefined;
  // Live storefront / CSS path: always apply visibility utilities + media CSS.
  // Forced device preview: JS mount + inline styles; skip conflicting Tailwind hide classes.
  const applyCssVisibility = !forcedDevice;
  // Avoid display:none on the wrapper when showing the "hidden on device" ghost.
  const wrapperStyle = sectionWrapperStyle(
    settings,
    showDeviceGhost ? undefined : wrapperDevice
  );

  return (
    <div data-section-hash={hashSection(section)}>
      {builderMode && (
        <div data-drop-index={index} className="ettajer-builder-drop-zone" aria-hidden />
      )}
      <ResponsiveSectionStyles sectionId={section.id} settings={settings} />
      <div
        id={`section-${section.id}`}
        data-section-id={section.id}
        data-section-type={section.type}
        data-section-hidden={isHidden || showDeviceGhost ? "true" : undefined}
        data-section-selected={isSelected ? "true" : undefined}
        style={wrapperStyle}
        className={cn(
          builderMode && "relative cursor-pointer transition-shadow duration-200",
          showGhost && "ettajer-builder-section-hidden",
          applyCssVisibility && sectionWrapperClassName(settings)
        )}
      >
        {showGhost ? <BuilderSectionGhost section={section} /> : null}
        {showDeviceGhost ? <BuilderDeviceHiddenGhost device={previewDevice!} /> : null}
        {showContent && visibleOnDevice ? renderSectionContent(section, contentProps) : null}
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.index === next.index &&
    prev.builderMode === next.builderMode &&
    prev.activeDevice === next.activeDevice &&
    prev.isSelected === next.isSelected &&
    prev.contentProps.store === next.contentProps.store &&
    prev.contentProps.products === next.contentProps.products &&
    prev.contentProps.categories === next.contentProps.categories &&
    prev.contentProps.featuredCollections === next.contentProps.featuredCollections &&
    prev.contentProps.product === next.contentProps.product &&
    prev.contentProps.collection === next.contentProps.collection &&
    prev.contentProps.previewDevice === next.contentProps.previewDevice &&
    prev.contentProps.builderMode === next.contentProps.builderMode &&
    hashSection(prev.section) === hashSection(next.section)
  );
});

export function SectionRenderer({
  store,
  layout,
  products,
  categories = [],
  featuredCollections = [],
  product,
  collection,
  selectedSectionId,
  builderMode,
  previewDevice,
  components,
  showHeader = true,
}: SectionRendererProps) {
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const variant = themeId;
  const isBold = variant === "bold";
  const activeDevice = previewDevice ?? "desktop";

  const sections = components
    ? resolveLayoutSections(layout.sections, components)
    : layout.sections;

  const contentProps = useMemo<SectionContentProps>(
    () => ({
      store,
      products,
      categories,
      featuredCollections,
      product,
      collection,
      previewDevice,
      builderMode,
    }),
    [
      store,
      products,
      categories,
      featuredCollections,
      product,
      collection,
      previewDevice,
      builderMode,
    ]
  );

  return (
    <div className={cn("min-h-screen", isBold ? "bg-zinc-950" : "bg-white")}>
      <BuilderSectionBridge
        enabled={builderMode}
        initialSectionId={selectedSectionId}
      />
      {showHeader && (
        <StorefrontHeader store={store} variant={variant} categories={categories} />
      )}
      {builderMode && layout.sections.length === 0 && (
        <div
          data-drop-index={0}
          className="ettajer-builder-drop-zone ettajer-builder-drop-zone-empty"
          aria-hidden
        >
          <span className="ettajer-builder-drop-zone-empty-icon">+</span>
          <span className="ettajer-builder-drop-zone-label">Drop your first block here</span>
          <span className="ettajer-builder-drop-zone-empty-hint">Drag a block from the Add panel</span>
        </div>
      )}
      {sections.map((section, index) => (
        <PreviewSectionRow
          key={section.id}
          section={section}
          index={index}
          contentProps={contentProps}
          builderMode={builderMode}
          activeDevice={activeDevice}
          isSelected={selectedSectionId === section.id}
        />
      ))}
      {builderMode && (
        <div
          data-drop-index={layout.sections.length}
          className="ettajer-builder-drop-zone ettajer-builder-drop-zone-end"
          aria-hidden
        >
          <span className="ettajer-builder-drop-zone-label">Drop block here</span>
        </div>
      )}
    </div>
  );
}
