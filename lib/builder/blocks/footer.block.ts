import type { BlockDefinition } from "../types";
import {
  STANDARD_ADVANCED_FIELDS,
  styleGroupField,
} from "./shared-schemas";

export const footerBlock: Omit<BlockDefinition, "component"> = {
  id: "footer",
  category: "layout",
  name: "Footer",
  description: "Brand, navigation, client care, and legal links",
  icon: "footer",
  legacySectionType: "footer",
  implemented: true,
  pageTemplates: ["home", "product", "collection"],
  thumbnail: { type: "gradient", value: "from-slate-50 to-slate-100" },
  defaultContent: {
    showPoweredBy: true,
    tagline: "",
    showNav: true,
    showClientCare: true,
    showLegal: true,
  },
  defaultStyles: {
    desktop: {
      padding: "4rem 1.5rem 3rem",
    },
  },
  settingsSchema: {
    focuses: ["section", "text"],
    content: [
      {
        key: "tagline",
        type: "textarea",
        label: "Tagline",
        group: "text",
        focus: ["text", "section"],
        placeholder: "Optional short brand line under your store name",
        description: "Overrides store description in the footer when set",
      },
      {
        key: "showNav",
        type: "toggle",
        label: "Show navigation links",
        group: "text",
        focus: "section",
      },
      {
        key: "showClientCare",
        type: "toggle",
        label: "Show client care links",
        group: "text",
        focus: "section",
      },
      {
        key: "showLegal",
        type: "toggle",
        label: "Show privacy & terms",
        group: "text",
        focus: "section",
      },
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
