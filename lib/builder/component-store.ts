import { create } from "zustand";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import {
  captureSectionsAsComponentRoot,
  countComponentInstances,
  findSectionsByComponentId,
  getComponentRootSections,
  getComponentRef,
  newComponentId,
  newInstanceId,
  newSectionIdForComponent,
  resolveComponentSection,
  stripComponentRef,
  withComponentRef,
  type BuilderComponent,
  type ComponentRoot,
} from "@/lib/builder/components";

function cloneLayout(layout: HomeLayout): HomeLayout {
  return JSON.parse(JSON.stringify(layout)) as HomeLayout;
}

function componentsToRecord(components: BuilderComponent[]): Record<string, BuilderComponent> {
  const map: Record<string, BuilderComponent> = {};
  for (const c of components) map[c.id] = c;
  return map;
}

export interface ComponentStoreState {
  storeId: string | null;
  components: Record<string, BuilderComponent>;
  /** When set, edits target the component definition (global edit mode). */
  editingComponentId: string | null;
  loading: boolean;
  syncError: string | null;

  initComponents: (storeId: string, components: BuilderComponent[]) => void;
  setEditingComponent: (componentId: string | null) => void;

  saveSelectionAsComponent: (
    name: string,
    selectionIds: string[],
    layout: HomeLayout,
    options?: { description?: string; category?: string }
  ) => BuilderComponent | null;

  insertComponent: (
    componentId: string,
    layout: HomeLayout,
    index?: number
  ) => { layout: HomeLayout; instanceId: string; sectionIds: string[] } | null;

  detachComponent: (instanceId: string, layout: HomeLayout) => HomeLayout;

  updateComponent: (
    componentId: string,
    patch: Partial<Pick<BuilderComponent, "name" | "description" | "category" | "thumbnail" | "root" | "metadata">>
  ) => Promise<BuilderComponent | null>;

  /** @alias updateComponent — global definition edit */
  updateComponentDefinition: (
    componentId: string,
    patch: Partial<Pick<BuilderComponent, "name" | "description" | "category" | "thumbnail" | "root" | "metadata">>
  ) => Promise<BuilderComponent | null>;

  deleteComponent: (componentId: string) => Promise<boolean>;

  getComponentInstances: (componentId: string, layout: HomeLayout) => string[];

  /** Apply global edit: update component root section at index from layout section. */
  syncComponentSectionFromLayout: (
    componentId: string,
    sectionIndex: number,
    section: StoreSection
  ) => Promise<void>;

  fetchComponents: () => Promise<void>;
  persistComponent: (component: BuilderComponent) => Promise<void>;
}

async function apiFetchComponents(): Promise<BuilderComponent[]> {
  const res = await fetch("/api/components");
  if (!res.ok) return [];
  const data = (await res.json()) as { components?: BuilderComponent[] };
  return data.components ?? [];
}

async function apiCreateComponent(
  component: Omit<BuilderComponent, "createdAt" | "updatedAt"> & { createdAt?: string; updatedAt?: string }
): Promise<BuilderComponent | null> {
  const res = await fetch("/api/components", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ component }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { component?: BuilderComponent };
  return data.component ?? null;
}

async function apiPatchComponent(
  id: string,
  patch: Partial<BuilderComponent>
): Promise<BuilderComponent | null> {
  const res = await fetch(`/api/components/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patch }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { component?: BuilderComponent };
  return data.component ?? null;
}

async function apiDeleteComponent(id: string): Promise<boolean> {
  const res = await fetch(`/api/components/${id}`, { method: "DELETE" });
  return res.ok;
}

function buildInstanceSections(
  component: BuilderComponent,
  instanceId: string
): StoreSection[] {
  const templates = getComponentRootSections(component.root);
  return templates.map((template, sectionIndex) => {
    const section: StoreSection = {
      ...cloneComponentSection(template),
      id: newSectionIdForComponent(template.type),
      settings: { ...(template.settings as Record<string, unknown>) },
    };
    return withComponentRef(section, {
      componentId: component.id,
      instanceId,
      sectionIndex,
    });
  });
}

function cloneComponentSection(section: StoreSection): StoreSection {
  return JSON.parse(JSON.stringify(section)) as StoreSection;
}

export const useComponentStore = create<ComponentStoreState>((set, get) => ({
  storeId: null,
  components: {},
  editingComponentId: null,
  loading: false,
  syncError: null,

  initComponents: (storeId, components) => {
    set({
      storeId,
      components: componentsToRecord(components),
      loading: false,
      syncError: null,
    });
  },

  setEditingComponent: (componentId) => set({ editingComponentId: componentId }),

  saveSelectionAsComponent: (name, selectionIds, layout, options) => {
    const { storeId, components } = get();
    if (!storeId) return null;

    const root = captureSectionsAsComponentRoot(layout.sections, selectionIds);
    if (!root) return null;

    const now = new Date().toISOString();
    const component: BuilderComponent = {
      id: newComponentId(),
      storeId,
      name: name.trim() || "Untitled component",
      description: options?.description,
      category: options?.category,
      root,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    set({ components: { ...components, [component.id]: component } });

    void get().persistComponent(component);
    return component;
  },

  insertComponent: (componentId, layout, index) => {
    const component = get().components[componentId];
    if (!component) return null;

    const instanceId = newInstanceId();
    const instanceSections = buildInstanceSections(component, instanceId);
    const sections = [...layout.sections];
    const insertAt = Math.max(0, Math.min(index ?? sections.length, sections.length));
    sections.splice(insertAt, 0, ...instanceSections);

    return {
      layout: { version: 1, sections },
      instanceId,
      sectionIds: instanceSections.map((s) => s.id),
    };
  },

  detachComponent: (instanceId, layout) => {
    const { components } = get();
    const ctx = { components };

    const sections = layout.sections.map((section) => {
      const ref = getComponentRef(section);
      if (ref?.instanceId !== instanceId) return section;

      const resolved = resolveComponentSection(section, ctx);
      return stripComponentRef(resolved);
    });

    return { version: 1, sections };
  },

  updateComponent: async (componentId, patch) => {
    const existing = get().components[componentId];
    if (!existing) return null;

    const updated: BuilderComponent = {
      ...existing,
      ...patch,
      version: patch.root ? existing.version + 1 : existing.version,
      updatedAt: new Date().toISOString(),
    };

    set((s) => ({
      components: { ...s.components, [componentId]: updated },
    }));

    const persisted = await apiPatchComponent(componentId, patch);
    if (persisted) {
      set((s) => ({
        components: { ...s.components, [componentId]: persisted },
      }));
      return persisted;
    }

    return updated;
  },

  updateComponentDefinition: async (componentId, patch) => get().updateComponent(componentId, patch),

  deleteComponent: async (componentId) => {
    const ok = await apiDeleteComponent(componentId);
    if (!ok) return false;

    set((s) => {
      const next = { ...s.components };
      delete next[componentId];
      return { components: next };
    });
    return true;
  },

  getComponentInstances: (componentId, layout) => {
    const instanceIds = new Set<string>();
    for (const section of findSectionsByComponentId(layout.sections, componentId)) {
      const ref = getComponentRef(section);
      if (ref && !ref.detached) instanceIds.add(ref.instanceId);
    }
    return Array.from(instanceIds);
  },

  syncComponentSectionFromLayout: async (componentId, sectionIndex, section) => {
    const component = get().components[componentId];
    if (!component || component.root.kind !== "sections") return;

    const templates = [...component.root.sections];
    const stripped = stripComponentRef(section);
    templates[sectionIndex] = cloneComponentSection(stripped);

    const root: ComponentRoot = { kind: "sections", sections: templates };
    await get().updateComponent(componentId, { root });
  },

  fetchComponents: async () => {
    set({ loading: true, syncError: null });
    try {
      const components = await apiFetchComponents();
      set((s) => ({
        components: componentsToRecord(components),
        loading: false,
        storeId: s.storeId,
      }));
    } catch {
      set({ loading: false, syncError: "Failed to load components" });
    }
  },

  persistComponent: async (component) => {
    const saved = await apiCreateComponent(component);
    if (saved) {
      set((s) => ({
        components: { ...s.components, [saved.id]: saved },
      }));
    }
  },
}));

/** Helper: count linked instances for banner display */
export function getComponentInstanceCount(
  componentId: string,
  layout: HomeLayout
): number {
  return countComponentInstances(layout.sections, componentId);
}

export { cloneLayout as cloneHomeLayout };
