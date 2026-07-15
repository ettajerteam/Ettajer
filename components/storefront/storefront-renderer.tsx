import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { SectionRenderer } from "@/components/storefront/section-renderer";
import { BuilderPreviewSections } from "@/components/storefront/builder-preview-sections";
import { parseHomeLayout } from "@/lib/sections/parse";
import type { DeviceMode } from "@/lib/builder/types";
import type { StorefrontProps } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";

interface StorefrontRendererProps extends StorefrontProps {
  preview?: boolean;
  builderMode?: boolean;
  selectedSectionId?: string | null;
  previewDevice?: DeviceMode;
}

export function StorefrontRenderer({
  store,
  products,
  categories = [],
  featuredCollections = [],
  homeLayout,
  preview,
  builderMode,
  selectedSectionId,
  previewDevice,
}: StorefrontRendererProps) {
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const layout = homeLayout ?? parseHomeLayout(null, themeId);

  const sectionProps = {
    store,
    layout,
    products,
    categories,
    featuredCollections,
    selectedSectionId,
  };

  return (
    <StorefrontShell store={store} preview={preview}>
      {builderMode ? (
        <BuilderPreviewSections {...sectionProps} previewDevice={previewDevice} />
      ) : (
        <SectionRenderer {...sectionProps} />
      )}
    </StorefrontShell>
  );
}
