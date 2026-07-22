import { ProductCardSection } from "@/components/storefront/sections/product-card-section";
import { CountdownSection } from "@/components/storefront/sections/countdown-section";
import { CtaSection } from "@/components/storefront/sections/cta-section";
import { FeaturesSection } from "@/components/storefront/sections/features-section";
import { SearchSection } from "@/components/storefront/sections/search-section";
import { EmbedSection } from "@/components/storefront/sections/embed-section";
import type {
  CountdownSectionSettings,
  CtaSectionSettings,
  EmbedSectionSettings,
  FeaturesSectionSettings,
  ProductCardSectionSettings,
  SearchSectionSettings,
} from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const ProductCardBlock: BlockComponent = ({
  store,
  settings,
  products,
  previewDevice,
}) => (
  <ProductCardSection
    store={store}
    settings={settings as ProductCardSectionSettings}
    products={products}
    previewDevice={previewDevice}
  />
);

export const CountdownBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <CountdownSection
    store={store}
    settings={settings as CountdownSectionSettings}
    previewDevice={previewDevice}
  />
);

export const CtaBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <CtaSection
    store={store}
    settings={settings as CtaSectionSettings}
    previewDevice={previewDevice}
  />
);

export const FeaturesBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <FeaturesSection
    store={store}
    settings={settings as FeaturesSectionSettings}
    previewDevice={previewDevice}
  />
);

export const SearchBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <SearchSection
    store={store}
    settings={settings as SearchSectionSettings}
    previewDevice={previewDevice}
  />
);

export const EmbedBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <EmbedSection
    store={store}
    settings={settings as EmbedSectionSettings}
    previewDevice={previewDevice}
  />
);
