import { SpacerSection } from "@/components/storefront/sections/spacer-section";
import { DividerSection } from "@/components/storefront/sections/divider-section";
import { ColumnsSection } from "@/components/storefront/sections/columns-section";
import { LogoWallSection } from "@/components/storefront/sections/logo-wall-section";
import type {
  ColumnsSectionSettings,
  DividerSectionSettings,
  LogoWallSectionSettings,
  SpacerSectionSettings,
} from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const SpacerBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <SpacerSection
    store={store}
    settings={settings as SpacerSectionSettings}
    previewDevice={previewDevice}
  />
);

export const DividerBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <DividerSection
    store={store}
    settings={settings as DividerSectionSettings}
    previewDevice={previewDevice}
  />
);

export const ColumnsBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <ColumnsSection
    store={store}
    settings={settings as ColumnsSectionSettings}
    previewDevice={previewDevice}
  />
);

export const LogoWallBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <LogoWallSection
    store={store}
    settings={settings as LogoWallSectionSettings}
    previewDevice={previewDevice}
  />
);
