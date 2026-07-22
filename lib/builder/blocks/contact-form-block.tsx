import { ContactFormSection } from "@/components/storefront/sections/contact-form-section";
import type { ContactFormSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const ContactFormBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <ContactFormSection
    store={store}
    settings={settings as ContactFormSectionSettings}
    previewDevice={previewDevice}
  />
);
