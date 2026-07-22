"use client";

import { useEffect, useState, useRef } from "react";
import { SectionRenderer } from "@/components/storefront/section-renderer";
import { ProductPageSectionRenderer } from "@/components/storefront/product-page-section-renderer";
import type { DeviceMode } from "@/lib/builder/types";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import type { HomeLayout } from "@/lib/sections/types";
import type { PublicCategory, PublicCollection, PublicProduct, PublicStore } from "@/types/storefront";
import type { NavItem } from "@/lib/navigation";
import { isTrustedBridgeEvent } from "@/lib/builder/events";

interface BuilderPreviewSectionsProps {
  store: PublicStore;
  layout: HomeLayout;
  products: PublicProduct[];
  categories?: PublicCategory[];
  featuredCollections?: PublicCollection[];
  product?: PublicProduct;
  collection?: PublicCollection;
  selectedSectionId?: string | null;
  previewDevice?: DeviceMode;
}

export function BuilderPreviewSections({
  previewDevice: initialDevice,
  layout: initialLayout,
  selectedSectionId: initialSectionId,
  store: initialStore,
  product,
  ...props
}: BuilderPreviewSectionsProps) {
  const [device, setDevice] = useState<DeviceMode>(initialDevice ?? "desktop");
  const [layout, setLayout] = useState<HomeLayout>(initialLayout);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    initialSectionId ?? null
  );
  const [store, setStore] = useState<PublicStore>(initialStore);
  const lastSeqRef = useRef(0);

  useEffect(() => {
    if (initialDevice) setDevice(initialDevice);
  }, [initialDevice]);

  useEffect(() => {
    setLayout(initialLayout);
  }, [initialLayout]);

  useEffect(() => {
    setSelectedSectionId(initialSectionId ?? null);
  }, [initialSectionId]);

  useEffect(() => {
    setStore(initialStore);
  }, [initialStore]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isTrustedBridgeEvent(event)) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "ettajer:preview-device") {
        const next = parsePreviewDevice(data.device);
        if (next) setDevice(next);
        return;
      }

      if (data.type === "ettajer:preview-layout" && data.layout?.sections) {
        const seq = typeof data.seq === "number" ? data.seq : null;
        if (seq != null && seq < lastSeqRef.current) return;
        if (seq != null) lastSeqRef.current = seq;
        setLayout(data.layout as HomeLayout);
        return;
      }

      if (data.type === "ettajer:preview-layout-patch" && Array.isArray(data.patches)) {
        const seq = typeof data.seq === "number" ? data.seq : null;
        if (seq != null && seq < lastSeqRef.current) return;
        if (seq != null) lastSeqRef.current = seq;
        setLayout((prev) => {
          let sections = [...prev.sections];
          for (const patch of data.patches as Array<Record<string, unknown>>) {
            if (patch.op === "section" && patch.section && typeof patch.section === "object") {
              const section = patch.section as HomeLayout["sections"][number];
              const idx = sections.findIndex((s) => s.id === section.id);
              if (idx >= 0) sections[idx] = section;
              else sections.push(section);
            } else if (patch.op === "remove" && typeof patch.sectionId === "string") {
              sections = sections.filter((s) => s.id !== patch.sectionId);
            } else if (patch.op === "order" && Array.isArray(patch.sectionIds)) {
              const ids = patch.sectionIds as string[];
              const byId = new Map(sections.map((s) => [s.id, s]));
              const next = ids.map((id) => byId.get(id)).filter(Boolean) as typeof sections;
              for (const s of sections) {
                if (!ids.includes(s.id)) next.push(s);
              }
              sections = next;
            } else if (
              patch.op === "setting" &&
              typeof patch.sectionId === "string" &&
              typeof patch.key === "string"
            ) {
              const idx = sections.findIndex((s) => s.id === patch.sectionId);
              if (idx >= 0) {
                const current = sections[idx]!;
                sections[idx] = {
                  ...current,
                  settings: {
                    ...(current.settings as Record<string, unknown>),
                    [patch.key]: patch.value,
                  } as typeof current.settings,
                };
              }
            }
          }
          return { version: 1 as const, sections };
        });
        return;
      }

      if (data.type === "ettajer:preview-theme" && data.theme && typeof data.theme === "object") {
        const theme = data.theme as Partial<PublicStore>;
        setStore((prev) => ({
          ...prev,
          ...(typeof theme.theme === "string" ? { theme: theme.theme } : null),
          ...(typeof theme.primaryColor === "string"
            ? { primaryColor: theme.primaryColor }
            : null),
          ...(typeof theme.secondaryColor === "string"
            ? { secondaryColor: theme.secondaryColor }
            : null),
          ...(typeof theme.font === "string" ? { font: theme.font } : null),
          ...(theme.logo !== undefined ? { logo: theme.logo as string | null } : null),
        }));
        return;
      }

      if (data.type === "ettajer:preview-navigation" && Array.isArray(data.navigation)) {
        setStore((prev) => ({
          ...prev,
          navigation: data.navigation as NavItem[],
        }));
        return;
      }

      if (data.type === "ettajer:focus-section" && typeof data.sectionId === "string") {
        setSelectedSectionId(data.sectionId);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (product) {
    return (
      <ProductPageSectionRenderer
        store={store}
        layout={layout}
        product={product}
        products={props.products}
        categories={props.categories}
        previewDevice={device}
        builderMode
        selectedSectionId={selectedSectionId}
      />
    );
  }

  return (
    <SectionRenderer
      {...props}
      store={store}
      layout={layout}
      product={product}
      selectedSectionId={selectedSectionId}
      builderMode
      previewDevice={device}
    />
  );
}
