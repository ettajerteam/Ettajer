import { create } from "zustand";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import { isKnownSectionType } from "@/lib/sections/parse";
import { getDefaultHomeLayout, getDefaultProductLayout, getDefaultCollectionLayout, getDefaultBlogPostLayout } from "@/lib/sections/defaults";
import { layoutsEqualFast } from "@/lib/builder/layout-hash";
import { createSectionFromBlock } from "@/lib/builder/legacy-adapter";
import { getBlock, getBlockBySectionType } from "@/lib/builder/block-registry";
import { getInspectorProfile } from "./inspector-config";
import { getSchemaInspectorFocuses, hasSchemaFields } from "./schema-inspector-utils";
import {
  DEFAULT_ACTIVE_PAGE,
  DEFAULT_BUILDER_SETTINGS,
  type BuilderSettings,
  type EditorPageTarget,
} from "./editor-types";
import type { StorePageRow } from "@/lib/pages";
import {
  getPageLayoutKey,
  getSavedLayoutFromPageContent,
  type PageLayoutKey,
} from "@/lib/page-layout";
import type {
  BlockId,
  BuilderCanvasState,
  BuilderDragState,
  BuilderPanelId,
  DeviceMode,
} from "./types";
import type { InspectorElementFocus } from "./inspector-config";
import {
  adjacentElementFocus,
  layerIdForFocus,
  parseLayerSelection,
  sectionElementFocuses,
} from "./layer-tree";
import { patchElementStyle, type ElementStyleValues } from "./style-system";

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2;
const ZOOM_STEP = 0.05;
const HISTORY_LIMIT = 40;
const HISTORY_COALESCE_MS = 450;
const HISTORY_SNAPSHOT_EVERY = 8;

let lastHistoryPushAt = 0;
let lastHistoryCoalesceKey: string | null = null;
let historyStepsSinceSnapshot = 0;

export type LayoutHistoryEntry =
  | {
      kind: "snapshot";
      layout: HomeLayout;
      selectedSectionId: string | null;
      selectedElementId: string | null;
    }
  | {
      kind: "section";
      sectionId: string;
      before: StoreSection;
      after: StoreSection;
      selectedSectionId: string | null;
      selectedElementId: string | null;
    };

function resolveSelectionAfterHistory(
  layout: HomeLayout,
  preferredSectionId: string | null,
  preferredElementId: string | null
): { selectedSectionId: string | null; selectedElementId: string | null } {
  const sectionStillExists = preferredSectionId
    ? layout.sections.some((s) => s.id === preferredSectionId)
    : false;
  const selectedSectionId = sectionStillExists
    ? preferredSectionId
    : (layout.sections[0]?.id ?? null);
  if (!selectedSectionId) {
    return { selectedSectionId: null, selectedElementId: null };
  }
  if (preferredElementId?.startsWith(`${selectedSectionId}:`)) {
    return { selectedSectionId, selectedElementId: preferredElementId };
  }
  if (preferredElementId === selectedSectionId) {
    return { selectedSectionId, selectedElementId: preferredElementId };
  }
  return { selectedSectionId, selectedElementId: selectedSectionId };
}

function buildHistoryEntry(
  before: HomeLayout,
  after: HomeLayout,
  selection: {
    selectedSectionId: string | null;
    selectedElementId: string | null;
  }
): LayoutHistoryEntry {
  const forceSnapshot = historyStepsSinceSnapshot >= HISTORY_SNAPSHOT_EVERY - 1;
  if (!forceSnapshot && before.sections.length === after.sections.length) {
    const sameOrder = before.sections.every((s, i) => s.id === after.sections[i]?.id);
    if (sameOrder) {
      let changedIndex = -1;
      for (let i = 0; i < before.sections.length; i++) {
        if (JSON.stringify(before.sections[i]) !== JSON.stringify(after.sections[i])) {
          if (changedIndex !== -1) {
            changedIndex = -2;
            break;
          }
          changedIndex = i;
        }
      }
      if (changedIndex >= 0) {
        historyStepsSinceSnapshot += 1;
        return {
          kind: "section",
          sectionId: before.sections[changedIndex]!.id,
          before: cloneSection(before.sections[changedIndex]!),
          after: cloneSection(after.sections[changedIndex]!),
          ...selection,
        };
      }
    }
  }
  historyStepsSinceSnapshot = 0;
  return {
    kind: "snapshot",
    layout: cloneLayout(before),
    ...selection,
  };
}

function applyHistoryEntryToLayout(
  layout: HomeLayout,
  entry: LayoutHistoryEntry,
  direction: "undo" | "redo"
): HomeLayout {
  if (entry.kind === "snapshot") {
    return cloneLayout(entry.layout);
  }
  const section = direction === "undo" ? entry.before : entry.after;
  return {
    version: 1,
    sections: layout.sections.map((s) =>
      s.id === entry.sectionId ? cloneSection(section) : s
    ),
  };
}

const defaultCanvas: BuilderCanvasState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  isPanning: false,
  showGrid: true,
  snapToGrid: true,
};

const defaultDrag: BuilderDragState = {
  active: false,
  blockId: null,
  blockName: null,
  source: null,
  insertIndex: null,
  hoverSectionId: null,
};

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));
}

function newSectionId(type: string): string {
  return `${type}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneSection(section: StoreSection): StoreSection {
  try {
    return structuredClone(section);
  } catch {
    return JSON.parse(JSON.stringify(section)) as StoreSection;
  }
}

function cloneLayout(layout: HomeLayout): HomeLayout {
  try {
    return structuredClone(layout);
  } catch {
    return JSON.parse(JSON.stringify(layout)) as HomeLayout;
  }
}

function layoutsEqual(a: HomeLayout, b: HomeLayout): boolean {
  return layoutsEqualFast(a, b);
}

export interface PageLayoutSnapshot {
  draft: HomeLayout;
  saved: HomeLayout;
  historyPast?: LayoutHistoryEntry[];
  historyFuture?: LayoutHistoryEntry[];
}

export interface CentralBuilderState {
  selectedElementId: string | null;
  selectedSectionId: string | null;
  hoveredElementId: string | null;
  activePage: EditorPageTarget;
  activeDevice: DeviceMode;
  canvas: BuilderCanvasState;
  drag: BuilderDragState;
  clipboardSection: StoreSection | null;
  historyPast: LayoutHistoryEntry[];
  historyFuture: LayoutHistoryEntry[];
  savedLayout: HomeLayout;
  draftLayout: HomeLayout;
  /** Per-page layout snapshots keyed by `home` or `page:{id}`. */
  pageLayoutCache: Record<string, PageLayoutSnapshot>;
  builderSettings: BuilderSettings;

  setSelectedSection: (id: string | null) => void;
  selectAdjacentSection: (delta: number) => void;
  cycleElementFocus: (delta: number) => void;
  setSelectedElement: (id: string | null) => void;
  setHoveredElement: (id: string | null) => void;
  setInspectorFocus: (focus: InspectorElementFocus) => void;
  setActivePage: (page: EditorPageTarget) => void;
  setActiveDevice: (device: DeviceMode) => void;
  setBuilderSettings: (partial: Partial<BuilderSettings>) => void;
  setActivePanel: (panel: BuilderPanelId) => void;
  setActiveTab: (tab: string) => void;
  selectLayer: (layerId: string) => void;
  setLayerRename: (layerId: string, name: string) => void;
  toggleLayerExpanded: (layerId: string) => void;

  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetView: () => void;
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  setIsPanning: (active: boolean) => void;

  startDrag: (blockId: BlockId, source: BuilderDragState["source"]) => void;
  updateDrag: (partial: Partial<BuilderDragState>) => void;
  endDrag: () => void;

  initLayout: (layout: HomeLayout) => void;
  initTemplateLayouts: (
    layouts: { home: HomeLayout; product: HomeLayout; collection: HomeLayout },
    pages: StorePageRow[],
    theme?: Parameters<typeof getDefaultHomeLayout>[0]
  ) => void;
  initPageLayouts: (
    homeLayout: HomeLayout,
    pages: StorePageRow[],
    theme?: Parameters<typeof getDefaultHomeLayout>[0]
  ) => void;
  switchPage: (page: EditorPageTarget) => void;
  syncActivePageToCache: () => void;
  getDirtyPageKeys: () => PageLayoutKey[];
  commitSavedLayouts: () => void;
  applyTemplateToDraft: (layout: HomeLayout) => void;
  /** Replace draft + saved for the active page (e.g. after legacy → sections convert). */
  seedActivePageLayout: (layout: HomeLayout) => void;
  resetDraft: () => void;
  reorderSections: (fromId: string, toId: string) => void;
  /** Move section so it lands at insertIndex in the resulting list. */
  reorderSectionToIndex: (sectionId: string, insertIndex: number) => void;
  moveSectionUp: (id: string) => void;
  moveSectionDown: (id: string) => void;
  moveSectionBy: (id: string, delta: number) => void;
  duplicateSection: (id: string) => void;
  copySection: (id: string) => void;
  pasteSection: (afterId?: string, fromClipboard?: StoreSection | null) => boolean;
  clearClipboard: () => void;
  removeSection: (id: string) => void;
  addSection: (type: StoreSection["type"]) => void;
  insertSectionAt: (section: StoreSection, index: number) => void;
  toggleSectionVisible: (id: string) => void;
  updateSectionSettings: (id: string, settings: Record<string, unknown>) => void;
  updateSectionStyle: (
    id: string,
    device: DeviceMode,
    patch: Partial<ElementStyleValues>,
    options?: { forceResponsive?: boolean }
  ) => void;
  /** Alias for updateSectionStyle — device-aware responsive style patches. */
  updateSectionResponsiveStyle: (
    id: string,
    device: DeviceMode,
    patch: Partial<ElementStyleValues>,
    options?: { forceResponsive?: boolean }
  ) => void;
  replaceDraftLayout: (layout: HomeLayout, extra?: Partial<CentralBuilderState>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  isDirty: () => boolean;
}

function pushHistory(
  state: CentralBuilderState,
  nextLayout: HomeLayout,
  options?: { coalesceKey?: string }
): Pick<CentralBuilderState, "historyPast" | "historyFuture"> {
  const now =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const coalesceKey = options?.coalesceKey ?? null;
  if (
    coalesceKey &&
    coalesceKey === lastHistoryCoalesceKey &&
    now - lastHistoryPushAt < HISTORY_COALESCE_MS &&
    state.historyPast.length > 0
  ) {
    return { historyPast: state.historyPast, historyFuture: [] };
  }

  lastHistoryPushAt = now;
  lastHistoryCoalesceKey = coalesceKey;
  const entry = buildHistoryEntry(state.draftLayout, nextLayout, {
    selectedSectionId: state.selectedSectionId,
    selectedElementId: state.selectedElementId,
  });
  const past = [...state.historyPast, entry].slice(-HISTORY_LIMIT);
  return { historyPast: past, historyFuture: [] };
}

function applyLayoutChange(
  state: CentralBuilderState,
  updater: (layout: HomeLayout) => HomeLayout,
  extra?: Partial<CentralBuilderState>,
  options?: { coalesceKey?: string }
): CentralBuilderState {
  const nextLayout = updater(state.draftLayout);
  if (layoutsEqual(state.draftLayout, nextLayout)) return state;
  return {
    ...state,
    ...pushHistory(state, nextLayout, options),
    draftLayout: nextLayout,
    ...extra,
  };
}

function defaultFocusForSection(section: StoreSection | undefined): InspectorElementFocus {
  if (!section) return "section";
  const block = getBlockBySectionType(section.type);
  if (block && hasSchemaFields(block)) {
    return getSchemaInspectorFocuses(block)[0] ?? "section";
  }
  const profile = getInspectorProfile(section.type);
  return profile.focuses[0] ?? "section";
}

function firstSectionSelection(layout: HomeLayout): Pick<
  CentralBuilderState,
  "selectedSectionId" | "selectedElementId"
> {
  const firstId = layout.sections[0]?.id ?? null;
  return { selectedSectionId: firstId, selectedElementId: firstId };
}

function persistActiveLayoutToCache(
  state: CentralBuilderState
): Record<string, PageLayoutSnapshot> {
  const key = getPageLayoutKey(state.activePage);
  return {
    ...state.pageLayoutCache,
    [key]: {
      draft: cloneLayout(state.draftLayout),
      saved: cloneLayout(state.savedLayout),
      // History entries are immutable snapshots — reuse references (no deep reclone).
      historyPast: state.historyPast,
      historyFuture: state.historyFuture,
    },
  };
}

export const useCentralBuilderStore = create<CentralBuilderState>((set, get) => ({
  selectedElementId: null,
  selectedSectionId: null,
  hoveredElementId: null,
  activePage: DEFAULT_ACTIVE_PAGE,
  activeDevice: "desktop",
  canvas: defaultCanvas,
  drag: defaultDrag,
  clipboardSection: null,
  historyPast: [],
  historyFuture: [],
  savedLayout: getDefaultHomeLayout(),
  draftLayout: getDefaultHomeLayout(),
  pageLayoutCache: {},
  builderSettings: { ...DEFAULT_BUILDER_SETTINGS },

  setSelectedSection: (id) => {
    if (id === null) {
      set({
        selectedSectionId: null,
        selectedElementId: null,
        builderSettings: {
          ...get().builderSettings,
          inspectorFocus: "section",
        },
      });
      return;
    }
    const section = get().draftLayout.sections.find((s) => s.id === id);
    set({
      selectedSectionId: id,
      selectedElementId: id,
      builderSettings: {
        ...get().builderSettings,
        inspectorFocus: defaultFocusForSection(section),
      },
    });
  },

  selectAdjacentSection: (delta) => {
    const { draftLayout, selectedSectionId } = get();
    const { sections } = draftLayout;
    if (sections.length === 0) return;

    const currentIdx = selectedSectionId
      ? sections.findIndex((s) => s.id === selectedSectionId)
      : -1;
    const nextIdx =
      currentIdx === -1
        ? delta > 0
          ? 0
          : sections.length - 1
        : Math.max(0, Math.min(sections.length - 1, currentIdx + delta));

    if (sections[nextIdx]?.id === selectedSectionId) return;
    get().setSelectedSection(sections[nextIdx]?.id ?? null);
  },

  cycleElementFocus: (delta) => {
    const { selectedSectionId, draftLayout, builderSettings } = get();
    if (!selectedSectionId) return;
    const section = draftLayout.sections.find((s) => s.id === selectedSectionId);
    if (!section) return;

    const focuses = sectionElementFocuses(section);
    if (focuses.length <= 1) return;

    const nextFocus = adjacentElementFocus(section, builderSettings.inspectorFocus, delta);
    get().setInspectorFocus(nextFocus);
  },

  setSelectedElement: (id) => set({ selectedElementId: id }),
  setHoveredElement: (id) => set({ hoveredElementId: id }),

  setInspectorFocus: (focus) => {
    const { selectedSectionId, builderSettings } = get();
    if (!selectedSectionId) {
      set({ builderSettings: { ...builderSettings, inspectorFocus: focus } });
      return;
    }
    set({
      selectedElementId: layerIdForFocus(selectedSectionId, focus),
      builderSettings: { ...builderSettings, inspectorFocus: focus },
    });
  },

  setActivePage: (page) => get().switchPage(page),
  setActiveDevice: (device) =>
    set((s) => ({
      activeDevice: device,
      canvas: {
        ...s.canvas,
        zoom: device === "desktop" ? 1 : device === "tablet" ? 0.85 : 0.72,
        panX: 0,
        panY: 0,
      },
    })),

  setBuilderSettings: (partial) =>
    set((s) => ({
      builderSettings: { ...s.builderSettings, ...partial },
    })),

  setActivePanel: (panel) =>
    set((s) => ({
      builderSettings: { ...s.builderSettings, activePanel: panel },
    })),

  setActiveTab: (tab) =>
    set((s) => ({
      builderSettings: { ...s.builderSettings, activeTab: tab },
    })),

  selectLayer: (layerId) => {
    if (layerId.startsWith("page:")) return;
    const { sectionId, focus } = parseLayerSelection(layerId);
    const section = get().draftLayout.sections.find((s) => s.id === sectionId);
    if (!section) return;
    set({
      selectedSectionId: sectionId,
      selectedElementId: layerId,
      builderSettings: {
        ...get().builderSettings,
        inspectorFocus: focus,
      },
    });
  },

  setLayerRename: (layerId, name) => {
    const trimmed = name.trim();
    // Section layers persist rename on StoreSection.label (survives save / reload).
    if (!layerId.includes(":")) {
      set((state) => {
        const nextRenames = { ...state.builderSettings.layerRenames };
        delete nextRenames[layerId];
        const withSettings: CentralBuilderState = {
          ...state,
          builderSettings: { ...state.builderSettings, layerRenames: nextRenames },
        };
        return applyLayoutChange(withSettings, (draft) => ({
          version: 1,
          sections: draft.sections.map((s) => {
            if (s.id !== layerId) return s;
            if (!trimmed) {
              const { label: _removed, ...rest } = s;
              return rest as StoreSection;
            }
            return { ...s, label: trimmed };
          }),
        }));
      });
      return;
    }

    set((s) => {
      const next = { ...s.builderSettings.layerRenames };
      if (!trimmed) {
        delete next[layerId];
      } else {
        next[layerId] = trimmed;
      }
      return {
        builderSettings: { ...s.builderSettings, layerRenames: next },
      };
    });
  },

  toggleLayerExpanded: (layerId) =>
    set((s) => {
      const collapsed = { ...s.builderSettings.collapsedLayers };
      collapsed[layerId] = !collapsed[layerId];
      return {
        builderSettings: { ...s.builderSettings, collapsedLayers: collapsed },
      };
    }),

  setZoom: (zoom) =>
    set((s) => ({
      canvas: { ...s.canvas, zoom: clampZoom(zoom) },
    })),

  zoomIn: () => {
    const { zoom } = get().canvas;
    set((s) => ({ canvas: { ...s.canvas, zoom: clampZoom(zoom + ZOOM_STEP * 2) } }));
  },

  zoomOut: () => {
    const { zoom } = get().canvas;
    set((s) => ({ canvas: { ...s.canvas, zoom: clampZoom(zoom - ZOOM_STEP * 2) } }));
  },

  zoomToFit: () => set((s) => ({ canvas: { ...s.canvas, zoom: 1, panX: 0, panY: 0 } })),
  resetView: () => set({ canvas: defaultCanvas }),
  setPan: (x, y) => set((s) => ({ canvas: { ...s.canvas, panX: x, panY: y } })),
  panBy: (dx, dy) =>
    set((s) => ({
      canvas: { ...s.canvas, panX: s.canvas.panX + dx, panY: s.canvas.panY + dy },
    })),
  setIsPanning: (active) => set((s) => ({ canvas: { ...s.canvas, isPanning: active } })),

  startDrag: (blockId, source) => {
    const block = getBlock(blockId);
    set({
      drag: {
        active: true,
        blockId,
        blockName: block?.name ?? null,
        source,
        insertIndex: null,
        hoverSectionId: null,
      },
    });
  },
  updateDrag: (partial) => set((s) => ({ drag: { ...s.drag, ...partial } })),
  endDrag: () => set({ drag: defaultDrag }),

  initLayout: (layout) => {
    const snapshot = { draft: layout, saved: layout };
    set({
      savedLayout: layout,
      draftLayout: layout,
      pageLayoutCache: { home: snapshot },
      ...firstSectionSelection(layout),
      historyPast: [],
      historyFuture: [],
    });
  },

  initTemplateLayouts: (layouts, pages, theme) => {
    const blogPost = getDefaultBlogPostLayout(theme);
    const cache: Record<string, PageLayoutSnapshot> = {
      home: { draft: cloneLayout(layouts.home), saved: cloneLayout(layouts.home) },
      product: { draft: cloneLayout(layouts.product), saved: cloneLayout(layouts.product) },
      collection: { draft: cloneLayout(layouts.collection), saved: cloneLayout(layouts.collection) },
      "blog-post": { draft: cloneLayout(blogPost), saved: cloneLayout(blogPost) },
    };
    for (const page of pages) {
      const saved = getSavedLayoutFromPageContent(page.content, theme);
      cache[`page:${page.id}`] = { draft: cloneLayout(saved), saved: cloneLayout(saved) };
    }
    set({
      pageLayoutCache: cache,
      savedLayout: layouts.home,
      draftLayout: layouts.home,
      activePage: DEFAULT_ACTIVE_PAGE,
      ...firstSectionSelection(layouts.home),
      historyPast: [],
      historyFuture: [],
    });
  },

  initPageLayouts: (homeLayout, pages, theme) => {
    get().initTemplateLayouts(
      {
        home: homeLayout,
        product: getDefaultProductLayout(theme),
        collection: getDefaultCollectionLayout(theme),
      },
      pages,
      theme
    );
  },

  syncActivePageToCache: () => {
    set((state) => ({
      pageLayoutCache: persistActiveLayoutToCache(state),
    }));
  },

  switchPage: (page) => {
    set((state) => {
      if (
        state.activePage.type === page.type &&
        (page.type === "home" ||
          page.type === "product" ||
          page.type === "collection" ||
          page.type === "blog-post" ||
          (page.type === "route" &&
            state.activePage.type === "route" &&
            state.activePage.route === page.route) ||
          (state.activePage.type === "custom" &&
            page.type === "custom" &&
            state.activePage.page.id === page.page.id))
      ) {
        return { activePage: page };
      }

      const cache = persistActiveLayoutToCache(state);
      const nextKey = getPageLayoutKey(page);
      let snapshot = cache[nextKey];
      if (!snapshot) {
        if (page.type === "custom") {
          const saved = getSavedLayoutFromPageContent(page.page.content);
          snapshot = { draft: cloneLayout(saved), saved: cloneLayout(saved) };
        } else if (page.type === "product") {
          const layout = getDefaultProductLayout();
          snapshot = { draft: cloneLayout(layout), saved: cloneLayout(layout) };
        } else if (page.type === "collection") {
          const layout = getDefaultCollectionLayout();
          snapshot = { draft: cloneLayout(layout), saved: cloneLayout(layout) };
        } else if (page.type === "blog-post") {
          const layout = getDefaultBlogPostLayout();
          snapshot = { draft: cloneLayout(layout), saved: cloneLayout(layout) };
        } else if (page.type === "route") {
          const empty = { version: 1 as const, sections: [] };
          snapshot = { draft: cloneLayout(empty), saved: cloneLayout(empty) };
        } else {
          snapshot = {
            draft: cloneLayout(getDefaultHomeLayout()),
            saved: cloneLayout(getDefaultHomeLayout()),
          };
        }
        cache[nextKey] = snapshot;
      }
      const nextDraft = cloneLayout(snapshot.draft);
      const nextSaved = cloneLayout(snapshot.saved);
      lastHistoryCoalesceKey = null;
      lastHistoryPushAt = 0;

      return {
        activePage: page,
        pageLayoutCache: cache,
        draftLayout: nextDraft,
        savedLayout: nextSaved,
        ...firstSectionSelection(nextDraft),
        historyPast: snapshot.historyPast ?? [],
        historyFuture: snapshot.historyFuture ?? [],
      };
    });
  },

  getDirtyPageKeys: () => {
    const state = get();
    const cache = persistActiveLayoutToCache(state);
    const dirty: PageLayoutKey[] = [];
    for (const [key, snapshot] of Object.entries(cache)) {
      if (!layoutsEqual(snapshot.draft, snapshot.saved)) {
        dirty.push(key as PageLayoutKey);
      }
    }
    return dirty;
  },

  commitSavedLayouts: () => {
    set((state) => {
      const cache = persistActiveLayoutToCache(state);
      const nextCache: Record<string, PageLayoutSnapshot> = {};
      for (const [key, snapshot] of Object.entries(cache)) {
        nextCache[key] = {
          draft: cloneLayout(snapshot.draft),
          saved: cloneLayout(snapshot.draft),
        };
      }
      const activeKey = getPageLayoutKey(state.activePage);
      const activeSaved = nextCache[activeKey]?.saved ?? state.savedLayout;
      return {
        pageLayoutCache: nextCache,
        savedLayout: cloneLayout(activeSaved),
      };
    });
  },

  applyTemplateToDraft: (layout) => {
    set((state) =>
      applyLayoutChange(state, () => cloneLayout(layout), {
        selectedSectionId: layout.sections[0]?.id ?? null,
        selectedElementId: layout.sections[0]?.id ?? null,
      })
    );
  },

  seedActivePageLayout: (layout) => {
    set((state) => {
      const cloned = cloneLayout(layout);
      const key = getPageLayoutKey(state.activePage);
      return {
        draftLayout: cloned,
        savedLayout: cloneLayout(cloned),
        pageLayoutCache: {
          ...state.pageLayoutCache,
          [key]: { draft: cloneLayout(cloned), saved: cloneLayout(cloned) },
        },
        ...firstSectionSelection(cloned),
        historyPast: [],
        historyFuture: [],
      };
    });
  },

  resetDraft: () => {
    const { savedLayout } = get();
    set((state) => ({
      draftLayout: savedLayout,
      pageLayoutCache: {
        ...state.pageLayoutCache,
        [getPageLayoutKey(state.activePage)]: {
          draft: cloneLayout(savedLayout),
          saved: cloneLayout(savedLayout),
        },
      },
      ...firstSectionSelection(savedLayout),
      historyPast: [],
      historyFuture: [],
    }));
  },

  reorderSections: (fromId, toId) => {
    if (fromId === toId) return;
    set((state) =>
      applyLayoutChange(state, (draft) => {
        const sections = [...draft.sections];
        const from = sections.findIndex((s) => s.id === fromId);
        const to = sections.findIndex((s) => s.id === toId);
        if (from < 0 || to < 0) return draft;
        const [item] = sections.splice(from, 1);
        sections.splice(to, 0, item);
        return { version: 1, sections };
      })
    );
  },

  reorderSectionToIndex: (sectionId, insertIndex) => {
    set((state) =>
      applyLayoutChange(state, (draft) => {
        const sections = [...draft.sections];
        const from = sections.findIndex((s) => s.id === sectionId);
        if (from < 0) return draft;
        const [item] = sections.splice(from, 1);
        const clamped = Math.max(0, Math.min(insertIndex, sections.length));
        sections.splice(clamped, 0, item);
        return { version: 1, sections };
      })
    );
  },

  moveSectionUp: (id) => {
    set((state) =>
      applyLayoutChange(state, (draft) => {
        const sections = [...draft.sections];
        const idx = sections.findIndex((s) => s.id === id);
        if (idx <= 0) return draft;
        [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
        return { version: 1, sections };
      })
    );
  },

  moveSectionDown: (id) => {
    set((state) =>
      applyLayoutChange(state, (draft) => {
        const sections = [...draft.sections];
        const idx = sections.findIndex((s) => s.id === id);
        if (idx < 0 || idx >= sections.length - 1) return draft;
        [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
        return { version: 1, sections };
      })
    );
  },

  moveSectionBy: (id, delta) => {
    if (delta === 0) return;
    set((state) =>
      applyLayoutChange(state, (draft) => {
        const sections = [...draft.sections];
        const idx = sections.findIndex((s) => s.id === id);
        if (idx < 0) return draft;
        const newIdx = Math.max(0, Math.min(sections.length - 1, idx + delta));
        if (newIdx === idx) return draft;
        const [item] = sections.splice(idx, 1);
        sections.splice(newIdx, 0, item);
        return { version: 1, sections };
      })
    );
  },

  duplicateSection: (id) => {
    set((state) => {
      const idx = state.draftLayout.sections.findIndex((s) => s.id === id);
      if (idx < 0) return state;
      const source = state.draftLayout.sections[idx];
      const duplicate: StoreSection = {
        ...source,
        id: newSectionId(source.type),
        settings: { ...source.settings },
      };
      const sections = [...state.draftLayout.sections];
      sections.splice(idx + 1, 0, duplicate);
      return applyLayoutChange(state, () => ({ version: 1, sections }), {
        selectedSectionId: duplicate.id,
        selectedElementId: duplicate.id,
      });
    });
  },

  copySection: (id) => {
    const section = get().draftLayout.sections.find((s) => s.id === id);
    if (!section) return;
    const cloned = cloneSection(section);
    set({ clipboardSection: cloned });
    void import("@/lib/builder/section-clipboard").then(({ writeSectionToSystemClipboard }) => {
      void writeSectionToSystemClipboard(cloned);
    });
  },

  pasteSection: (afterId, fromClipboard) => {
    const { clipboardSection, draftLayout, selectedSectionId } = get();
    const source = fromClipboard ?? clipboardSection;
    if (!source) return false;
    // Reject unknown types — they crash layers / inspector via registry lookups.
    if (!isKnownSectionType(source.type)) return false;
    const newSection: StoreSection = {
      ...cloneSection(source),
      id: newSectionId(source.type),
      type: source.type,
      visible: source.visible !== false,
      settings: { ...(source.settings && typeof source.settings === "object" ? source.settings : {}) },
    };
    const anchorId = afterId ?? selectedSectionId;
    const anchorIdx = anchorId
      ? draftLayout.sections.findIndex((s) => s.id === anchorId)
      : -1;
    const insertIndex = anchorIdx >= 0 ? anchorIdx + 1 : draftLayout.sections.length;
    set((state) =>
      applyLayoutChange(
        state,
        (draft) => {
          const sections = [...draft.sections];
          sections.splice(insertIndex, 0, newSection);
          return { version: 1, sections };
        },
        {
          selectedSectionId: newSection.id,
          selectedElementId: newSection.id,
          clipboardSection: source,
        }
      )
    );
    return true;
  },

  clearClipboard: () => set({ clipboardSection: null }),

  removeSection: (id) => {
    set((state) => {
      const sections = state.draftLayout.sections.filter((s) => s.id !== id);
      if (sections.length === state.draftLayout.sections.length) return state;
      const nextSelected =
        state.selectedSectionId === id ? (sections[0]?.id ?? null) : state.selectedSectionId;
      return applyLayoutChange(state, () => ({ version: 1, sections }), {
        selectedSectionId: nextSelected,
        selectedElementId: nextSelected,
      });
    });
  },

  addSection: (type) => {
    const block = getBlockBySectionType(type);
    if (!block) return;
    const section = createSectionFromBlock(block.id);
    if (!section) return;
    set((state) =>
      applyLayoutChange(
        state,
        (draft) => ({
          version: 1,
          sections: [...draft.sections, section],
        }),
        { selectedSectionId: section.id, selectedElementId: section.id }
      )
    );
  },

  insertSectionAt: (section, index) => {
    set((state) =>
      applyLayoutChange(
        state,
        (draft) => {
          const sections = [...draft.sections];
          const clamped = Math.max(0, Math.min(index, sections.length));
          sections.splice(clamped, 0, section);
          return { version: 1, sections };
        },
        { selectedSectionId: section.id, selectedElementId: section.id }
      )
    );
  },

  toggleSectionVisible: (id) => {
    set((state) =>
      applyLayoutChange(state, (draft) => ({
        version: 1,
        sections: draft.sections.map((s) =>
          s.id === id ? { ...s, visible: !s.visible } : s
        ),
      }))
    );
  },

  updateSectionSettings: (id, settings) => {
    set((state) =>
      applyLayoutChange(
        state,
        (draft) => ({
          version: 1,
          sections: draft.sections.map((s) =>
            s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s
          ),
        }),
        undefined,
        { coalesceKey: `settings:${id}` }
      )
    );
  },

  updateSectionStyle: (id, device, patch, options) => {
    set((state) => {
      const section = state.draftLayout.sections.find((s) => s.id === id);
      if (!section) return state;
      const current = section.settings as Record<string, unknown>;
      const nextSettings = patchElementStyle(current, device, patch, options);
      if (JSON.stringify(current) === JSON.stringify(nextSettings)) return state;
      return applyLayoutChange(
        state,
        (draft) => ({
          version: 1,
          sections: draft.sections.map((s) =>
            s.id === id ? { ...s, settings: nextSettings as StoreSection["settings"] } : s
          ),
        }),
        undefined,
        { coalesceKey: `style:${id}:${device}` }
      );
    });
  },

  updateSectionResponsiveStyle: (id, device, patch, options) => {
    get().updateSectionStyle(id, device, patch, options);
  },

  replaceDraftLayout: (layout, extra) => {
    set((state) => applyLayoutChange(state, () => cloneLayout(layout), extra));
  },

  undo: () => {
    set((state) => {
      if (state.historyPast.length === 0) return state;
      const past = [...state.historyPast];
      const entry = past.pop()!;
      const currentSnapshot: LayoutHistoryEntry = {
        kind: "snapshot",
        layout: cloneLayout(state.draftLayout),
        selectedSectionId: state.selectedSectionId,
        selectedElementId: state.selectedElementId,
      };
      const future = [currentSnapshot, ...state.historyFuture].slice(0, HISTORY_LIMIT);
      const nextLayout = applyHistoryEntryToLayout(state.draftLayout, entry, "undo");
      const selection = resolveSelectionAfterHistory(
        nextLayout,
        entry.selectedSectionId,
        entry.selectedElementId
      );
      lastHistoryCoalesceKey = null;
      return {
        historyPast: past,
        historyFuture: future,
        draftLayout: nextLayout,
        ...selection,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyFuture.length === 0) return state;
      const [entry, ...future] = state.historyFuture;
      const currentSnapshot: LayoutHistoryEntry = {
        kind: "snapshot",
        layout: cloneLayout(state.draftLayout),
        selectedSectionId: state.selectedSectionId,
        selectedElementId: state.selectedElementId,
      };
      const past = [...state.historyPast, currentSnapshot].slice(0, HISTORY_LIMIT);
      const nextLayout =
        entry.kind === "snapshot"
          ? cloneLayout(entry.layout)
          : applyHistoryEntryToLayout(state.draftLayout, entry, "redo");
      const selection = resolveSelectionAfterHistory(
        nextLayout,
        entry.selectedSectionId,
        entry.selectedElementId
      );
      lastHistoryCoalesceKey = null;
      return {
        historyPast: past,
        historyFuture: future,
        draftLayout: nextLayout,
        ...selection,
      };
    });
  },

  canUndo: () => get().historyPast.length > 0,
  canRedo: () => get().historyFuture.length > 0,

  isDirty: () => {
    const state = get();
    const cache = persistActiveLayoutToCache(state);
    return Object.values(cache).some((snapshot) => !layoutsEqual(snapshot.draft, snapshot.saved));
  },
}));

export const useBuilderStore = useCentralBuilderStore;
