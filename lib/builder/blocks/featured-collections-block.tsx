import { FeaturedCollectionsSection } from "@/components/storefront/sections/featured-collections-section";
import type { FeaturedCollectionsSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const FeaturedCollectionsBlock: BlockComponent = ({
  store,
  settings,
  featuredCollections,
}) => (
  <FeaturedCollectionsSection
    store={store}
    collections={featuredCollections ?? []}
    settings={settings as FeaturedCollectionsSectionSettings}
  />
);
