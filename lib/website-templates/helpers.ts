import type { StoreSection } from "@/lib/sections/types";
import type { HomeLayout } from "@/lib/sections/types";
import type { NavItem } from "@/lib/navigation";
import { SECTION_REGISTRY } from "@/lib/sections/registry";

export function tplSection(
  id: string,
  type: StoreSection["type"],
  settings?: Record<string, unknown>
): StoreSection {
  const defaults = SECTION_REGISTRY[type]?.defaultSettings ?? {};
  return {
    id,
    type,
    settings: { ...defaults, ...settings },
    visible: true,
  };
}

export function tplNav(
  id: string,
  label: string,
  href: string,
  children?: NavItem[]
): NavItem {
  return { id, label, href, ...(children?.length ? { children } : {}) };
}

export function tplLayout(...sections: StoreSection[]): HomeLayout {
  return { version: 1, sections };
}

export function tplFooter(
  id: string,
  colors: { backgroundColor: string; textColor: string },
  extras: {
    showPoweredBy?: boolean;
    tagline?: string;
    showNav?: boolean;
    showClientCare?: boolean;
    showLegal?: boolean;
  } = {}
): StoreSection {
  return tplSection(id, "footer", {
    backgroundColor: colors.backgroundColor,
    textColor: colors.textColor,
    padding: "4rem 1.5rem 3rem",
    showPoweredBy: extras.showPoweredBy ?? true,
    tagline: extras.tagline ?? "",
    showNav: extras.showNav ?? true,
    showClientCare: extras.showClientCare ?? true,
    showLegal: extras.showLegal ?? true,
  });
}
