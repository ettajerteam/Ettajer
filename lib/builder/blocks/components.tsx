import type { BlockStylesDefaults } from "../block-schema";
import type { BlockDefinition } from "../types";
import { FeaturedCollectionsBlock } from "./featured-collections-block";
import { FooterBlock } from "./footer-block";
import { HeroBlock } from "./hero-block";
import { ImageBlock } from "./image-block";
import { ProductGridBlock } from "./product-grid-block";
import { RichTextBlock } from "./rich-text-block";
import { PRODUCT_PAGE_COMPONENTS } from "./product-page-components";
import { COLLECTION_PAGE_COMPONENTS } from "./collection-page-components";
import type { BlockComponent, BlockDefinition as FullBlockDefinition, BlockId } from "../types";

export { HeroBlock } from "./hero-block";
export { FeaturedCollectionsBlock } from "./featured-collections-block";
export { ProductGridBlock } from "./product-grid-block";
export { RichTextBlock } from "./rich-text-block";
export { FooterBlock } from "./footer-block";
export { ImageBlock } from "./image-block";

export const BLOCK_COMPONENTS: Partial<Record<BlockId, BlockComponent>> = {
  hero: HeroBlock,
  "rich-text": RichTextBlock,
  features: RichTextBlock,
  testimonials: RichTextBlock,
  faq: RichTextBlock,
  cta: RichTextBlock,
  newsletter: RichTextBlock,
  "product-grid": ProductGridBlock,
  "featured-products": ProductGridBlock,
  "collection-banner": FeaturedCollectionsBlock,
  footer: FooterBlock,
  image: ImageBlock,
  ...PRODUCT_PAGE_COMPONENTS,
  ...COLLECTION_PAGE_COMPONENTS,
};

export function withBlockComponent(
  def: Omit<FullBlockDefinition, "component">
): FullBlockDefinition {
  const component = def.implemented ? BLOCK_COMPONENTS[def.id] : undefined;
  return { ...def, component };
}

export function buildStylesFromDefaults(
  defaultStyles: BlockStylesDefaults
): Record<string, unknown> | undefined {
  const styles: Record<string, unknown> = {};
  if (defaultStyles.desktop) styles.desktop = defaultStyles.desktop;
  if (defaultStyles.tablet) styles.tablet = defaultStyles.tablet;
  if (defaultStyles.mobile) styles.mobile = defaultStyles.mobile;
  return Object.keys(styles).length > 0 ? styles : undefined;
}

/** Merge block defaults with persisted section settings (section wins). */
export function mergeSectionSettings(
  block: BlockDefinition,
  sectionSettings: Record<string, unknown>
): Record<string, unknown> {
  const desktop = block.defaultStyles.desktop ?? {};
  const responsiveDefaults = buildStylesFromDefaults(block.defaultStyles);
  const merged: Record<string, unknown> = {
    ...block.defaultContent,
    ...desktop,
    ...sectionSettings,
  };

  if (responsiveDefaults && sectionSettings.styles == null) {
    merged.styles = responsiveDefaults;
  }

  return merged;
}
