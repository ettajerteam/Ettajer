import type { StoreSection } from "@/lib/sections/types";
import type { BuilderComponent, ComponentRoot } from "./types";
import { getComponentRef, stripComponentRef } from "./section-meta";
import { getComponentRootSections } from "./capture";

export interface ResolveContext {
  components: Record<string, BuilderComponent>;
  /** Cycle detection stack — component ids currently being resolved */
  visiting?: Set<string>;
}

function mergeSettings(
  base: Record<string, unknown>,
  overrides?: Record<string, unknown>
): Record<string, unknown> {
  if (!overrides || Object.keys(overrides).length === 0) return base;
  return { ...base, ...overrides };
}

function resolveSectionFromRoot(
  template: StoreSection,
  instanceSection: StoreSection,
  ctx: ResolveContext
): StoreSection {
  const ref = getComponentRef(instanceSection);
  const overrides = ref?.overrides;

  const resolved: StoreSection = {
    ...template,
    id: instanceSection.id,
    visible: instanceSection.visible,
    settings: mergeSettings(
      template.settings as Record<string, unknown>,
      overrides
    ) as StoreSection["settings"],
  };

  // Preserve component ref on the instance shell
  const refSettings = instanceSection.settings as Record<string, unknown>;
  if (refSettings._componentRef) {
    (resolved.settings as Record<string, unknown>)._componentRef = refSettings._componentRef;
  }

  // Recursively resolve nested component instances inside template sections
  const nestedRef = getComponentRef(resolved);
  if (nestedRef && !nestedRef.detached) {
    return resolveComponentSection(resolved, ctx);
  }

  return resolved;
}

/**
 * Resolve a linked component instance section to its renderable form.
 * Detached instances return local content only.
 */
export function resolveComponentSection(
  section: StoreSection,
  ctx: ResolveContext
): StoreSection {
  const ref = getComponentRef(section);
  if (!ref || ref.detached) {
    return stripComponentRef(section);
  }

  const component = ctx.components[ref.componentId];
  if (!component) {
    return stripComponentRef(section);
  }

  const visiting = ctx.visiting ?? new Set<string>();
  if (visiting.has(ref.componentId)) {
    // Cycle detected — render local shell to avoid infinite recursion
    return stripComponentRef(section);
  }

  visiting.add(ref.componentId);

  try {
    const rootSections = getRootSections(component.root);
    const template = rootSections[ref.sectionIndex];
    if (!template) {
      return stripComponentRef(section);
    }

    return resolveSectionFromRoot(template, section, { ...ctx, visiting });
  } finally {
    visiting.delete(ref.componentId);
  }
}

export function getRootSections(root: ComponentRoot): StoreSection[] {
  return getComponentRootSections(root);
}

/** Resolve all sections in a layout, expanding component instances. */
export function resolveLayoutSections(
  sections: StoreSection[],
  components: Record<string, BuilderComponent>
): StoreSection[] {
  const ctx: ResolveContext = { components };
  return sections.map((section) => resolveComponentSection(section, ctx));
}

/** Merge global definition + instance overrides for a single instance ref. */
export function resolveComponentInstance(
  instanceRef: { componentId: string; sectionIndex: number; overrides?: Record<string, unknown> },
  components: Record<string, BuilderComponent>,
  visiting: Set<string> = new Set()
): StoreSection | null {
  if (visiting.has(instanceRef.componentId)) return null;
  visiting.add(instanceRef.componentId);

  try {
    const component = components[instanceRef.componentId];
    if (!component) return null;

    const rootSections = getRootSections(component.root);
    const template = rootSections[instanceRef.sectionIndex];
    if (!template) return null;

    return {
      ...template,
      id: `resolved-${instanceRef.componentId}-${instanceRef.sectionIndex}`,
      settings: mergeSettings(
        template.settings as Record<string, unknown>,
        instanceRef.overrides
      ) as StoreSection["settings"],
    };
  } finally {
    visiting.delete(instanceRef.componentId);
  }
}
