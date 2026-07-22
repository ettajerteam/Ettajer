import { HeroSection } from "@/components/storefront/sections/hero-section";
import type { HeroSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const HeroBlock: BlockComponent = ({
  store,
  settings,
  previewDevice,
  builderMode,
  sectionId,
}) => (
  <HeroSection
    store={store}
    settings={settings as HeroSectionSettings}
    previewDevice={previewDevice}
    builderMode={builderMode}
    sectionId={sectionId}
  />
);
