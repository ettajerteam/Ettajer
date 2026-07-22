import type { StorePageRow } from "@/lib/pages";
import type { InspectorElementFocus } from "./inspector-config";
import type { BuilderPanelId } from "./types";

export type EditorPageTarget =
  | { type: "home" }
  | { type: "product" }
  | { type: "collection" }
  | { type: "blog-post" }
  | { type: "route"; route: import("@/lib/editor-pages-config").EditorRoutePageId }
  | { type: "custom"; page: StorePageRow };

export interface BuilderSettings {
  activePanel: BuilderPanelId;
  activeTab: string;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  inspectorFocus: InspectorElementFocus;
  /** Custom display names for layer nodes */
  layerRenames: Record<string, string>;
  /** Collapsed layer node ids */
  collapsedLayers: Record<string, boolean>;
}

export const DEFAULT_BUILDER_SETTINGS: BuilderSettings = {
  activePanel: "layers",
  activeTab: "layers",
  leftPanelOpen: true,
  rightPanelOpen: true,
  inspectorFocus: "section",
  layerRenames: {},
  collapsedLayers: {},
};

export const DEFAULT_ACTIVE_PAGE: EditorPageTarget = { type: "home" };
