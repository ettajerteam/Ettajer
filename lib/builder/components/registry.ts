import type { BuilderComponent } from "./types";

/**
 * User-composite components registry — separate from BlockRegistry (primitives).
 * Phase 1: in-memory + API-backed store. Future: marketplace catalog.
 */
export interface ComponentRegistry {
  get(id: string): BuilderComponent | undefined;
  getAll(): BuilderComponent[];
  getByStore(storeId: string): BuilderComponent[];
  register(component: BuilderComponent): void;
  unregister(id: string): void;
  update(id: string, patch: Partial<Omit<BuilderComponent, "id" | "storeId">>): BuilderComponent | null;
}

export function createComponentRegistry(initial: BuilderComponent[] = []): ComponentRegistry {
  const map = new Map<string, BuilderComponent>();
  for (const c of initial) map.set(c.id, c);

  return {
    get: (id) => map.get(id),
    getAll: () => Array.from(map.values()),
    getByStore: (storeId) => Array.from(map.values()).filter((c) => c.storeId === storeId),
    register: (component) => {
      map.set(component.id, component);
    },
    unregister: (id) => {
      map.delete(id);
    },
    update: (id, patch) => {
      const existing = map.get(id);
      if (!existing) return null;
      const updated: BuilderComponent = {
        ...existing,
        ...patch,
        id: existing.id,
        storeId: existing.storeId,
        updatedAt: new Date().toISOString(),
        version: patch.root ? existing.version + 1 : existing.version,
      };
      map.set(id, updated);
      return updated;
    },
  };
}
