import type { HomeLayout } from "@/lib/sections/types";
import type { WebsiteTemplateDefinition, WebsiteTemplatePageDefinition } from "./types";

const HOME_SLUGS = new Set(["", "home", "/"]);

export function isHomePageSlug(slug: string): boolean {
  return HOME_SLUGS.has(slug.trim().toLowerCase());
}

export function getTemplateHomeLayout(template: WebsiteTemplateDefinition): HomeLayout {
  const home = template.pages.find((p) => isHomePageSlug(p.slug));
  return home?.layout ?? template.pages[0]?.layout ?? { version: 1, sections: [] };
}

export function getTemplateSecondaryPages(
  template: WebsiteTemplateDefinition
): WebsiteTemplatePageDefinition[] {
  return template.pages.filter((p) => !isHomePageSlug(p.slug));
}

export function getTemplateThumbnailStyle(
  thumbnail: string
): { type: "gradient" | "image"; value: string } {
  if (
    thumbnail.startsWith("linear-gradient") ||
    thumbnail.startsWith("radial-gradient") ||
    thumbnail.startsWith("#")
  ) {
    const value = thumbnail.startsWith("#")
      ? `linear-gradient(135deg, ${thumbnail} 0%, #ffffff 100%)`
      : thumbnail;
    return { type: "gradient", value };
  }
  return { type: "image", value: thumbnail };
}
