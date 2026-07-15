import { FooterSection } from "@/components/storefront/sections/footer-section";
import type { FooterSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const FooterBlock: BlockComponent = ({ store, settings }) => (
  <FooterSection store={store} settings={settings as FooterSectionSettings} />
);
