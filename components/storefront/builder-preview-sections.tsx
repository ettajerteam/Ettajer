"use client";

import { useEffect, useState } from "react";
import { SectionRenderer } from "@/components/storefront/section-renderer";
import type { DeviceMode } from "@/lib/builder/types";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import type { HomeLayout } from "@/lib/sections/types";
import type { PublicCategory, PublicCollection, PublicProduct, PublicStore } from "@/types/storefront";

interface BuilderPreviewSectionsProps {
  store: PublicStore;
  layout: HomeLayout;
  products: PublicProduct[];
  categories?: PublicCategory[];
  featuredCollections?: PublicCollection[];
  selectedSectionId?: string | null;
  previewDevice?: DeviceMode;
}

export function BuilderPreviewSections({
  previewDevice: initialDevice,
  ...props
}: BuilderPreviewSectionsProps) {
  const [device, setDevice] = useState<DeviceMode>(initialDevice ?? "desktop");

  useEffect(() => {
    if (initialDevice) setDevice(initialDevice);
  }, [initialDevice]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "ettajer:preview-device") return;
      const next = parsePreviewDevice(event.data.device);
      if (next) setDevice(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <SectionRenderer {...props} builderMode previewDevice={device} />;
}
