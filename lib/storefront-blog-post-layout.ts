import type { HomeLayout, StoreSection } from "@/lib/sections/types";

export interface BlogPostContent {
  title: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  publishedAt?: string | Date | null;
}

/**
 * Inject live journal post fields into a saved blog-post layout:
 * first hero → title / excerpt / cover; first body rich-text → article HTML.
 */
export function hydrateBlogPostLayout(layout: HomeLayout, post: BlogPostContent): HomeLayout {
  let filledHero = false;
  let filledBody = false;

  const sections: StoreSection[] = layout.sections.map((section) => {
    if (section.type === "hero" && !filledHero) {
      filledHero = true;
      const settings = { ...(section.settings as Record<string, unknown>) };
      settings.headline = post.title;
      if (post.excerpt) settings.subheadline = post.excerpt;
      if (post.image) settings.imageUrl = post.image;
      settings.showBrand = false;
      settings.showStoreDescription = false;
      if (!settings.eyebrow) settings.eyebrow = "Journal";
      if (settings.overlay === undefined) settings.overlay = true;
      if (!settings.minHeight) settings.minHeight = "56vh";
      if (!settings.backgroundColor) settings.backgroundColor = "#0a0a0a";
      if (!settings.textColor) settings.textColor = "#ffffff";
      // Article pages: one calm entry — drop campaign CTAs / accents from the template hero.
      delete settings.ctaText;
      delete settings.ctaLink;
      delete settings.secondaryCtaText;
      delete settings.secondaryCtaLink;
      delete settings.accentHeadline;
      return { ...section, settings: settings as StoreSection["settings"] };
    }

    if (section.type === "rich-text" && !filledBody) {
      const layoutMode = (section.settings as { layout?: string }).layout;
      if (
        layoutMode === "newsletter" ||
        layoutMode === "intro" ||
        layoutMode === "stats" ||
        layoutMode === "strip" ||
        layoutMode === "testimonials"
      ) {
        return section;
      }
      filledBody = true;
      return {
        ...section,
        settings: {
          ...(section.settings as Record<string, unknown>),
          title: "",
          content: post.content,
          alignment: "left",
          layout: "default",
        } as StoreSection["settings"],
      };
    }

    return section;
  });

  return { version: 1, sections };
}
