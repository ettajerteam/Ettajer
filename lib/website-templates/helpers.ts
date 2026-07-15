import type { StoreSection } from "@/lib/sections/types";
import type { HomeLayout } from "@/lib/sections/types";
import { SECTION_REGISTRY } from "@/lib/sections/registry";

export function tplSection(
  id: string,
  type: StoreSection["type"],
  settings?: Record<string, unknown>
): StoreSection {
  return {
    id,
    type,
    settings: { ...SECTION_REGISTRY[type].defaultSettings, ...settings },
    visible: true,
  };
}

export function tplNav(id: string, label: string, href: string) {
  return { id, label, href };
}

export function tplLayout(...sections: StoreSection[]): HomeLayout {
  return { version: 1, sections };
}

export function tplFooter(
  id: string,
  colors: { backgroundColor: string; textColor: string },
  showPoweredBy = true
): StoreSection {
  return tplSection(id, "footer", {
    backgroundColor: colors.backgroundColor,
    textColor: colors.textColor,
    padding: "2.5rem 2rem",
    showPoweredBy,
  });
}
