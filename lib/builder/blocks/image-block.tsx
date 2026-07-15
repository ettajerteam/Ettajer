import { ImageSection } from "@/components/storefront/sections/image-section";
import type { ImageSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const ImageBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <ImageSection
    store={store}
    settings={settings as ImageSectionSettings}
    previewDevice={previewDevice}
  />
);
