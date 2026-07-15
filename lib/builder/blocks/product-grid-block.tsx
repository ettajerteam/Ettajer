import { ProductGridSection } from "@/components/storefront/sections/product-grid-section";
import type { ProductGridSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const ProductGridBlock: BlockComponent = ({
  store,
  settings,
  products,
  previewDevice,
}) => (
  <ProductGridSection
    store={store}
    products={products ?? []}
    settings={settings as ProductGridSectionSettings}
    previewDevice={previewDevice}
  />
);
