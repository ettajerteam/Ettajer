import { RichTextSection } from "@/components/storefront/sections/rich-text-section";
import type { RichTextSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const RichTextBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <RichTextSection
    store={store}
    settings={settings as RichTextSectionSettings}
    previewDevice={previewDevice}
  />
);
