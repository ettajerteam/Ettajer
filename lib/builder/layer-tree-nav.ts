import type { LayerNode } from "./layer-tree";

/** Flatten visible tree nodes in display order (respecting collapse). */
export function flattenVisibleLayerNodes(
  roots: LayerNode[],
  collapsed: Record<string, boolean>
): LayerNode[] {
  const out: LayerNode[] = [];
  const walk = (nodes: LayerNode[]) => {
    for (const node of nodes) {
      out.push(node);
      if (node.children.length > 0 && collapsed[node.id] !== true) {
        walk(node.children);
      }
    }
  };
  walk(roots);
  return out;
}
