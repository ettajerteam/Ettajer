import type { StoreSection } from "@/lib/sections/types";
import { COMPONENT_REF_KEY } from "./constants";
import type { ComponentInstanceRef } from "./types";

export function getComponentRef(section: StoreSection): ComponentInstanceRef | null {
  const settings = section.settings as Record<string, unknown>;
  const ref = settings[COMPONENT_REF_KEY];
  if (!ref || typeof ref !== "object") return null;
  const r = ref as ComponentInstanceRef;
  if (typeof r.componentId !== "string" || typeof r.instanceId !== "string") return null;
  return r;
}

export function isComponentInstance(section: StoreSection): boolean {
  const ref = getComponentRef(section);
  return Boolean(ref && !ref.detached);
}

export function isDetachedComponent(section: StoreSection): boolean {
  const ref = getComponentRef(section);
  return Boolean(ref?.detached);
}

export function stripComponentRef(section: StoreSection): StoreSection {
  const settings = { ...(section.settings as Record<string, unknown>) };
  delete settings[COMPONENT_REF_KEY];
  return { ...section, settings };
}

export function withComponentRef(
  section: StoreSection,
  ref: ComponentInstanceRef
): StoreSection {
  const settings = {
    ...(section.settings as Record<string, unknown>),
    [COMPONENT_REF_KEY]: ref,
  };
  return {
    ...section,
    settings: settings as StoreSection["settings"],
  };
}

export function findSectionsByInstanceId(
  sections: StoreSection[],
  instanceId: string
): StoreSection[] {
  return sections.filter((s) => getComponentRef(s)?.instanceId === instanceId);
}

export function findSectionsByComponentId(
  sections: StoreSection[],
  componentId: string
): StoreSection[] {
  return sections.filter((s) => getComponentRef(s)?.componentId === componentId);
}

export function countComponentInstances(
  sections: StoreSection[],
  componentId: string
): number {
  const instanceIds = new Set<string>();
  for (const section of sections) {
    const ref = getComponentRef(section);
    if (ref?.componentId === componentId && !ref.detached) {
      instanceIds.add(ref.instanceId);
    }
  }
  return instanceIds.size;
}

/** Instances whose pinnedVersion lags the live definition version. */
export function findStaleComponentInstances(
  sections: StoreSection[],
  components: Record<string, { version: number }>
): Array<{ sectionId: string; componentId: string; pinnedVersion: number; liveVersion: number }> {
  const stale: Array<{
    sectionId: string;
    componentId: string;
    pinnedVersion: number;
    liveVersion: number;
  }> = [];
  const seenInstances = new Set<string>();
  for (const section of sections) {
    const ref = getComponentRef(section);
    if (!ref || ref.detached) continue;
    if (seenInstances.has(ref.instanceId)) continue;
    seenInstances.add(ref.instanceId);
    const live = components[ref.componentId];
    if (!live) continue;
    const pinned = ref.pinnedVersion ?? 0;
    if (pinned > 0 && pinned < live.version) {
      stale.push({
        sectionId: section.id,
        componentId: ref.componentId,
        pinnedVersion: pinned,
        liveVersion: live.version,
      });
    }
  }
  return stale;
}

export function bumpPinnedVersions(
  sections: StoreSection[],
  componentId: string,
  version: number
): StoreSection[] {
  return sections.map((section) => {
    const ref = getComponentRef(section);
    if (!ref || ref.componentId !== componentId || ref.detached) return section;
    return withComponentRef(section, { ...ref, pinnedVersion: version });
  });
}
