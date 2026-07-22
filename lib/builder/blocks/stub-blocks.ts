/**
 * Deferred / not-yet-shipped block ideas.
 * These are intentionally NOT registered in the add panel.
 * When ready to ship one, move it to a real *.block.ts and register it.
 */
import type { BlockDefinition } from "../types";
import type { BlockThumbnail } from "../block-schema";

function stubBlock(
  id: string,
  category: BlockDefinition["category"],
  name: string,
  description: string,
  icon: string,
  thumbnail: BlockThumbnail
): Omit<BlockDefinition, "component"> {
  return {
    id,
    category,
    name,
    description,
    icon,
    implemented: false,
    thumbnail,
    defaultContent: {},
    defaultStyles: {},
    settingsSchema: { content: [], styles: [], layout: [] },
  };
}

/** Kept for the todo list — do not register until implemented. */
export const FUTURE_STUB_BLOCKS: Omit<BlockDefinition, "component">[] = [
  stubBlock(
    "container",
    "layout",
    "Container",
    "Wrap content in a max-width container",
    "box",
    { type: "gradient", value: "from-slate-100 to-slate-200" }
  ),
  stubBlock(
    "custom-html",
    "advanced",
    "Custom HTML",
    "Insert raw HTML for custom layouts",
    "type",
    { type: "gradient", value: "from-indigo-50 to-violet-100" }
  ),
];
