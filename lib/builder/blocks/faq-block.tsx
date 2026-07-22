import { FaqSection } from "@/components/storefront/sections/faq-section";
import type { FaqSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const FaqBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <FaqSection
    store={store}
    settings={settings as FaqSectionSettings}
    previewDevice={previewDevice}
  />
);
