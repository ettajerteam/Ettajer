import type { InspectorElementFocus } from "./inspector-config";
import { getInspectorProfile } from "./inspector-config";
import { getBlock, getBlockBySectionType } from "./block-registry";
import { getSchemaInspectorFocuses, hasSchemaFields } from "./schema-inspector-utils";
import { sectionToBlockId } from "./legacy-adapter";
import { getSectionLabel } from "@/lib/sections/registry";
import type { StoreSection } from "@/lib/sections/types";
import { getComponentRef, isComponentInstance } from "@/lib/builder/components";

export type LayerNodeKind = "page" | "section" | "element";

export interface LayerNode {
  id: string;
  kind: LayerNodeKind;
  label: string;
  sectionId?: string;
  focus?: InspectorElementFocus;
  visible: boolean;
  draggable: boolean;
  children: LayerNode[];
  /** Linked component instance metadata */
  componentInstanceId?: string;
  componentId?: string;
  isComponentInstance?: boolean;
}

const ELEMENT_ORDER: Partial<Record<StoreSection["type"], InspectorElementFocus[]>> = {
  hero: ["section", "text", "button", "image", "link"],
  "rich-text": ["section", "text", "link"],
  "product-grid": ["section", "text"],
  "featured-collections": ["section", "text"],
  image: ["section", "image"],
  footer: ["section"],
};

function elementLabel(sectionType: StoreSection["type"], focus: InspectorElementFocus): string {
  if (focus === "section") return "Container";
  if (focus === "text") {
    if (sectionType === "hero") return "Heading";
    if (sectionType === "rich-text") return "Text";
    return "Title";
  }
  if (focus === "image") return "Image";
  if (focus === "button") return "Button";
  if (focus === "link") return "Link";
  return focus;
}

export function layerIdForFocus(sectionId: string, focus: InspectorElementFocus): string {
  return focus === "section" ? sectionId : `${sectionId}:${focus}`;
}

export function parseLayerSelection(layerId: string): {
  sectionId: string;
  focus: InspectorElementFocus;
} {
  const colon = layerId.indexOf(":");
  if (colon === -1) {
    return { sectionId: layerId, focus: "section" };
  }
  return {
    sectionId: layerId.slice(0, colon),
    focus: layerId.slice(colon + 1) as InspectorElementFocus,
  };
}

export function resolveActiveLayerId(
  selectedSectionId: string | null,
  inspectorFocus: InspectorElementFocus,
  selectedElementId: string | null
): string | null {
  if (!selectedSectionId) return null;
  if (selectedElementId?.includes(":")) {
    const parsed = parseLayerSelection(selectedElementId);
    if (parsed.sectionId === selectedSectionId) return selectedElementId;
  }
  return layerIdForFocus(selectedSectionId, inspectorFocus);
}

function sectionDisplayName(section: StoreSection, componentNames?: Record<string, string>): string {
  const ref = getComponentRef(section);
  if (ref && !ref.detached && componentNames?.[ref.componentId]) {
    const base = componentNames[ref.componentId];
    const rootSections = ref.sectionIndex > 0 ? ` (${ref.sectionIndex + 1})` : "";
    return `${base}${rootSections}`;
  }
  const block = getBlockBySectionType(section.type) ?? getBlock(sectionToBlockId(section));
  if (block?.name) return block.name;
  return getSectionLabel(section.type);
}

export function sectionElementFocuses(section: StoreSection): InspectorElementFocus[] {
  const block = getBlockBySectionType(section.type);
  if (block && hasSchemaFields(block)) {
    return ["section", ...getSchemaInspectorFocuses(block).filter((f) => f !== "section")];
  }
  const profile = getInspectorProfile(section.type);
  return (
    ELEMENT_ORDER[section.type] ??
    (["section", ...profile.focuses.filter((f) => f !== "section")] as InspectorElementFocus[])
  );
}

export function adjacentElementFocus(
  section: StoreSection,
  current: InspectorElementFocus,
  delta: number
): InspectorElementFocus {
  const order = sectionElementFocuses(section);
  const idx = order.indexOf(current);
  const base = idx >= 0 ? idx : 0;
  const next = Math.max(0, Math.min(order.length - 1, base + delta));
  return order[next] ?? "section";
}

function buildSectionChildren(section: StoreSection): LayerNode[] {
  const order = sectionElementFocuses(section);

  return order.map((focus) => ({
    id: layerIdForFocus(section.id, focus),
    kind: "element" as const,
    label: elementLabel(section.type, focus),
    sectionId: section.id,
    focus,
    visible: section.visible,
    draggable: false,
    children: [],
  }));
}

export function buildPageLayerTree(
  sections: StoreSection[],
  pageLabel = "Home",
  layerRenames: Record<string, string> = {},
  componentNames: Record<string, string> = {}
): LayerNode {
  const applyRename = (node: LayerNode): LayerNode => ({
    ...node,
    label: layerRenames[node.id] ?? node.label,
    children: node.children.map(applyRename),
  });

  const root: LayerNode = {
    id: "page:home",
    kind: "page",
    label: pageLabel,
    visible: true,
    draggable: false,
    children: sections.map((section) => {
      const ref = getComponentRef(section);
      const linked = isComponentInstance(section);
      return {
        id: section.id,
        kind: "section" as const,
        label: sectionDisplayName(section, componentNames),
        sectionId: section.id,
        focus: "section",
        visible: section.visible,
        draggable: true,
        children: buildSectionChildren(section),
        componentInstanceId: linked ? ref?.instanceId : undefined,
        componentId: linked ? ref?.componentId : undefined,
        isComponentInstance: linked,
      };
    }),
  };

  return applyRename(root);
}
