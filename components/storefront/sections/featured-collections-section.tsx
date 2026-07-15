import { FeaturedCollections } from "@/components/storefront/featured-collections";
import type { FeaturedCollectionsSectionSettings } from "@/lib/sections/types";
import type { PublicCollection, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";

interface FeaturedCollectionsSectionProps {
  store: PublicStore;
  collections: PublicCollection[];
  settings: FeaturedCollectionsSectionSettings;
}

export function FeaturedCollectionsSection({
  store,
  collections,
  settings,
}: FeaturedCollectionsSectionProps) {
  if (collections.length === 0) return null;

  const variant = (store.theme in { minimal: 1, modern: 1, bold: 1 }
    ? store.theme
    : "minimal") as ThemeId;

  return (
    <div className="max-w-6xl mx-auto px-6">
      <FeaturedCollections
        store={store}
        collections={collections}
        variant={variant}
        titleOverride={settings.title}
      />
    </div>
  );
}
