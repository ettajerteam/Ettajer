import { VideoSection } from "@/components/storefront/sections/video-section";
import type { VideoSectionSettings } from "@/lib/sections/types";
import type { BlockComponent } from "../types";

export const VideoBlock: BlockComponent = ({ store, settings, previewDevice }) => (
  <VideoSection
    store={store}
    settings={settings as VideoSectionSettings}
    previewDevice={previewDevice}
  />
);
