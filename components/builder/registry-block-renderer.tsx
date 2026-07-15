import { resolveSectionBlock } from "@/lib/builder/resolve-block";
import type { BlockRenderProps, DeviceMode } from "@/lib/builder/types";
import type { StoreSection } from "@/lib/sections/types";
import type { PublicCategory, PublicCollection, PublicProduct, PublicStore } from "@/types/storefront";
import { BlockRenderErrorBoundary } from "@/components/builder/block-render-error-boundary";
import { UnknownBlockPlaceholder } from "@/components/builder/block-placeholder";

export interface RegistryBlockRendererProps {
  section: StoreSection;
  store: PublicStore;
  products?: PublicProduct[];
  categories?: PublicCategory[];
  featuredCollections?: PublicCollection[];
  product?: PublicProduct;
  collection?: PublicCollection;
  previewDevice?: DeviceMode;
  builderMode?: boolean;
}

/**
 * Renders a single layout section via the Block Registry.
 * Component-driven — no switch/case on section type.
 */
export function RegistryBlockRenderer({
  section,
  store,
  products,
  categories,
  featuredCollections,
  product,
  collection,
  previewDevice,
  builderMode,
}: RegistryBlockRendererProps) {
  const { block, hasComponent, settings } = resolveSectionBlock(section);

  if (!block || !hasComponent || !block.component) {
    return (
      <UnknownBlockPlaceholder
        section={section}
        block={block}
        builderMode={builderMode}
      />
    );
  }

  const Component = block.component;
  const renderProps: BlockRenderProps = {
    store,
    settings,
    products,
    categories,
    featuredCollections,
    product,
    collection,
    ...(previewDevice ? { previewDevice } : {}),
  };

  return (
    <BlockRenderErrorBoundary
      blockId={block.id}
      blockName={block.name}
      sectionId={section.id}
      builderMode={builderMode}
    >
      <Component key={section.id} {...renderProps} />
    </BlockRenderErrorBoundary>
  );
}
