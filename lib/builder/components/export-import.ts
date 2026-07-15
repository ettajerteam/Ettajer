import type { BuilderComponent, ComponentExportBundle } from "./types";

export function exportComponent(component: BuilderComponent): ComponentExportBundle {
  const { storeId: _storeId, ...rest } = component;
  return {
    format: "ettajer-component",
    version: 1,
    exportedAt: new Date().toISOString(),
    component: rest,
  };
}

export function importComponent(
  bundle: ComponentExportBundle,
  storeId: string,
  newId: string
): BuilderComponent | null {
  if (bundle.format !== "ettajer-component" || bundle.version !== 1) return null;

  const now = new Date().toISOString();
  return {
    ...bundle.component,
    id: newId,
    storeId,
    createdAt: now,
    updatedAt: now,
  };
}

export function parseComponentExport(raw: unknown): ComponentExportBundle | null {
  if (!raw || typeof raw !== "object") return null;
  const bundle = raw as ComponentExportBundle;
  if (bundle.format !== "ettajer-component") return null;
  return bundle;
}
