export * from "./types";

/** Builder Core V2 — scalable element-tree foundation (coexists with V1) */
export * as BuilderCore from "./v2";
/** @deprecated Prefer BuilderCore — alias kept for prior imports */
export * as BuilderV2 from "./v2";

/** Block schema + registry */
export * from "./block-schema";
export * from "./block-registry";

/** Renderer (registry resolution + UI re-exports) */
export * from "./renderer";

/** V1 ↔ V2 adapters */
export * from "./adapter";
export * from "./legacy-adapter";

/** Editor ↔ preview postMessage protocol */
export * from "./events";

/** Backward-compat verification */
export { runBuilderCompatChecks, verifyCoreBlocks, verifyDefaultLayoutRoundTrip } from "./compat";
export type { BuilderCompatReport } from "./compat";

export * from "./ai";
export {
  useCentralBuilderStore,
  useBuilderStore,
  MIN_ZOOM,
  MAX_ZOOM,
} from "./central-builder-store";
export type { CentralBuilderState } from "./central-builder-store";
export type { EditorPageTarget, BuilderSettings } from "./editor-types";
export * from "./inspector-config";
export * from "./layer-tree";
export type { LayerNode, LayerNodeKind } from "./layer-tree";
export * from "./components";
export { useComponentStore, getComponentInstanceCount } from "./component-store";
export {
  parseSectionVisualSettings,
  sectionWrapperStyle,
  sectionWrapperClassName,
} from "./section-styles";
export {
  getSectionVisualStyles,
  getResolvedStyles,
  resolveStylesForDevice,
  getStyleOverride,
  setStyleOverride,
  clearStyleOverride,
  hasOverride,
  updateDeviceStyle,
  deviceStyleToCss,
  buildResponsiveCss,
  sectionVisibilityClassName,
  parsePreviewDevice,
  DEVICE_LABELS,
  COLUMN_OPTIONS,
  BREAKPOINT_TABLET_MAX,
  BREAKPOINT_MOBILE_MAX,
} from "./responsive-styles";
export * as StyleSystem from "./style-system";
export {
  getStyleForDevice,
  patchElementStyle,
  normalizeSectionStyleSettings,
  elementStyleToCss,
  buildElementStyleCss,
} from "./style-system";
