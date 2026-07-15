/**
 * @deprecated Layout state lives in useCentralBuilderStore — this re-export preserves compatibility.
 */
export {
  useCentralBuilderStore as useWebsiteLayoutStore,
  useCentralBuilderStore,
} from "@/lib/builder/central-builder-store";

export type { CentralBuilderState } from "@/lib/builder/central-builder-store";

import type { ThemeId } from "@/lib/themes";
import type { HomeLayout } from "@/lib/sections/types";
import {
  getDefaultCollectionLayout,
  getDefaultHomeLayout,
  getDefaultProductLayout,
} from "@/lib/sections/defaults";

export function ensureLayoutForTheme(layout: HomeLayout | null | undefined, theme: ThemeId): HomeLayout {
  if (layout?.sections?.length) return layout;
  return getDefaultHomeLayout(theme);
}

export function ensureTemplateLayouts(
  layouts: {
    home?: HomeLayout | null;
    product?: HomeLayout | null;
    collection?: HomeLayout | null;
  },
  theme: ThemeId
): { home: HomeLayout; product: HomeLayout; collection: HomeLayout } {
  return {
    home: ensureLayoutForTheme(layouts.home, theme),
    product: layouts.product?.sections?.length ? layouts.product : getDefaultProductLayout(theme),
    collection: layouts.collection?.sections?.length
      ? layouts.collection
      : getDefaultCollectionLayout(theme),
  };
}
