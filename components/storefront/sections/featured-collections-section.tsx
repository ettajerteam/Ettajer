import { FeaturedCollections } from "@/components/storefront/featured-collections";
import { resolveSectionCollections } from "@/lib/storefront-collections";
import type { DeviceMode } from "@/lib/builder/types";
import type { FeaturedCollectionsSectionSettings } from "@/lib/sections/types";
import type { PublicCollection, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";

interface FeaturedCollectionsSectionProps {
  store: PublicStore;
  collections: PublicCollection[];
  settings: FeaturedCollectionsSectionSettings;
  previewDevice?: DeviceMode;
}

export function FeaturedCollectionsSection({
  store,
  collections,
  settings,
}: FeaturedCollectionsSectionProps) {
  const visible = resolveSectionCollections(collections, settings);

  if (visible.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-sm text-neutral-400">
          {settings.collectionSource === "manual"
            ? "Pick collections in the editor to showcase them here."
            : "No collections to show yet. Create collections in Catalog, or mark some as featured."}
        </p>
      </div>
    );
  }

  const variant = (store.theme in { minimal: 1, modern: 1, bold: 1 }
    ? store.theme
    : "minimal") as ThemeId;

  return (
    <div className="mx-auto max-w-6xl px-6">
      <FeaturedCollections
        store={store}
        collections={visible}
        variant={variant}
        titleOverride={settings.title}
        settings={settings}
      />
    </div>
  );
}
