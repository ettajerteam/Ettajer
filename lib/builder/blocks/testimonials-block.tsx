import { TestimonialsSection } from "@/components/storefront/sections/testimonials-section";
import type { TestimonialsSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const TestimonialsBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <TestimonialsSection
    store={store}
    settings={settings as TestimonialsSectionSettings}
    previewDevice={previewDevice}
  />
);
