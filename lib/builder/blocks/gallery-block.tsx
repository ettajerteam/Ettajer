import { GallerySection } from "@/components/storefront/sections/gallery-section";
import type { GallerySectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const GalleryBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <GallerySection
    store={store}
    settings={settings as GallerySectionSettings}
    previewDevice={previewDevice}
  />
);
