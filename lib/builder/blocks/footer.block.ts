import type { BlockDefinition } from "../types";
import {
  STANDARD_ADVANCED_FIELDS,
  styleGroupField,
} from "./shared-schemas";

export const footerBlock: Omit<BlockDefinition, "component"> = {
  id: "footer",
  category: "layout",
  name: "Footer",
  description: "Copyright and powered by",
  icon: "footer",
  legacySectionType: "footer",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-slate-50 to-slate-100" },
  defaultContent: {
    showPoweredBy: true,
  },
  defaultStyles: {
    desktop: {
      padding: "3rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["section"],
    content: [
      {
        key: "showPoweredBy",
        type: "toggle",
        label: 'Show "Powered by Ettajer"',
        group: "text",
        focus: "section",
        description: "Display the powered-by line below your copyright",
      },
    ],
    styles: [styleGroupField("background", "section")],
    layout: [styleGroupField("spacing", "section")],
    advanced: STANDARD_ADVANCED_FIELDS.filter((f) => f.key !== "animation"),
  },
};
