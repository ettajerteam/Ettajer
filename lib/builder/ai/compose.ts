import { defaultNavigation } from "@/lib/navigation";
import type { NavItem } from "@/lib/navigation";
import { getBlock } from "../block-registry";
import type { BlockId, SectionVisualStyles } from "../types";
import type { ParsedIntent } from "./intent";
import type { AiGeneratedSection, AiGeneratedTheme } from "./types";

const LUXURY_PALETTE = {
  theme: "modern" as const,
  primaryColor: "#1a1a1a",
  secondaryColor: "#C9A962",
  font: "Playfair Display",
};

const MINIMAL_PALETTE = {
  theme: "minimal" as const,
  primaryColor: "#007AFF",
  secondaryColor: "#FFFFFF",
  font: "Inter",
};

const BOLD_PALETTE = {
  theme: "bold" as const,
  primaryColor: "#00FF87",
  secondaryColor: "#0A0A0A",
  font: "Space Grotesk",
};

const PROFESSIONAL_PALETTE = {
  theme: "modern" as const,
  primaryColor: "#111111",
  secondaryColor: "#F5F5F5",
  font: "Outfit",
};

function mergeContent(
  blockId: BlockId,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  const block = getBlock(blockId);
  return { ...(block?.defaultContent ?? {}), ...overrides };
}

function blockDefaultStyles(blockId: BlockId): SectionVisualStyles {
  const block = getBlock(blockId);
  if (!block?.defaultStyles) return {};
  return {
    desktop: block.defaultStyles.desktop,
    tablet: block.defaultStyles.tablet,
    mobile: block.defaultStyles.mobile,
  };
}

function luxuryHeroStyles(): SectionVisualStyles {
  return {
    desktop: { padding: "7rem 3rem", alignment: "center" },
    tablet: { padding: "5rem 2rem", alignment: "center" },
    mobile: { padding: "4rem 1.25rem", alignment: "center" },
  };
}

function buildLuxuryPerfumeSections(storeName?: string): AiGeneratedSection[] {
  const brand = storeName ?? "Maison Élégance";
  return [
    {
      blockId: "hero",
      content: mergeContent("hero", {
        headline: "Scent of Distinction",
        subheadline: `Discover ${brand} — handcrafted fragrances that capture timeless luxury.`,
        ctaText: "Explore Collection",
        alignment: "center",
        showStoreDescription: false,
        backgroundColor: "#1a1a1a",
        textColor: "#FAF7F2",
        padding: "6rem 2rem",
        minHeight: "520px",
      }),
      styles: luxuryHeroStyles(),
      visible: true,
    },
    {
      blockId: "collection-banner",
      content: mergeContent("collection-banner", {
        title: "Signature Collections",
        backgroundColor: "#FAF7F2",
        padding: "4rem 2rem",
      }),
      styles: {
        desktop: { padding: "5rem 3rem" },
        mobile: { padding: "3rem 1.25rem" },
      },
      visible: true,
    },
    {
      blockId: "product-grid",
      content: mergeContent("product-grid", {
        title: "Bestselling Fragrances",
        padding: "4rem 2rem",
      }),
      styles: {
        desktop: { padding: "5rem 3rem" },
        mobile: { padding: "3rem 1.25rem" },
      },
      visible: true,
    },
    {
      blockId: "rich-text",
      content: mergeContent("rich-text", {
        title: "Our Heritage",
        content:
          "<p>Each bottle tells a story of rare botanicals, master perfumers, and uncompromising craftsmanship. From the first note to the lasting dry-down, our fragrances are designed for those who appreciate the art of scent.</p><p>Experience the intersection of tradition and innovation — where every spray becomes a signature.</p>",
        alignment: "center",
        backgroundColor: "#1a1a1a",
        textColor: "#FAF7F2",
        padding: "5rem 2rem",
      }),
      styles: {
        desktop: { padding: "6rem 3rem", alignment: "center" },
        mobile: { padding: "3.5rem 1.25rem" },
      },
      visible: true,
    },
    {
      blockId: "footer",
      content: mergeContent("footer", {
        backgroundColor: "#111111",
        padding: "2.5rem 2rem",
        showPoweredBy: true,
      }),
      styles: blockDefaultStyles("footer"),
      visible: true,
    },
  ];
}

function buildEcommerceSections(intent: ParsedIntent, storeName?: string): AiGeneratedSection[] {
  const brand = storeName ?? intent.industry;
  const sections: AiGeneratedSection[] = [];

  for (const blockId of intent.suggestedBlocks) {
    if (blockId === "hero") {
      sections.push({
        blockId,
        content: mergeContent("hero", {
          headline: `Welcome to ${brand}`,
          subheadline: `Discover premium products curated for ${intent.industry.toLowerCase()}.`,
          ctaText: "Shop Now",
          alignment: "center",
        }),
        styles: blockDefaultStyles("hero"),
        visible: true,
      });
    } else if (blockId === "collection-banner") {
      sections.push({
        blockId,
        content: mergeContent("collection-banner", { title: "Featured Collections" }),
        styles: blockDefaultStyles("collection-banner"),
        visible: true,
      });
    } else if (blockId === "product-grid") {
      sections.push({
        blockId,
        content: mergeContent("product-grid", { title: "Our Products" }),
        styles: blockDefaultStyles("product-grid"),
        visible: true,
      });
    } else if (blockId === "rich-text") {
      sections.push({
        blockId,
        content: mergeContent("rich-text", {
          title: "About Us",
          content: `<p>We are passionate about delivering exceptional quality in ${intent.industry.toLowerCase()}.</p>`,
          alignment: "center",
        }),
        styles: blockDefaultStyles("rich-text"),
        visible: true,
      });
    } else if (blockId === "image") {
      sections.push({
        blockId,
        content: mergeContent("image", { alt: `${brand} showcase` }),
        styles: blockDefaultStyles("image"),
        visible: true,
      });
    } else if (blockId === "footer") {
      sections.push({
        blockId,
        content: mergeContent("footer", { showPoweredBy: true }),
        styles: blockDefaultStyles("footer"),
        visible: true,
      });
    }
  }

  return sections;
}

export function composeSectionsForIntent(
  intent: ParsedIntent,
  options?: { storeName?: string }
): AiGeneratedSection[] {
  const isLuxuryPerfume =
    intent.tone === "luxury" &&
    intent.keywords.some((k) => ["perfume", "fragrance", "beauty", "cosmetics"].includes(k));

  if (isLuxuryPerfume) {
    return buildLuxuryPerfumeSections(options?.storeName);
  }

  return buildEcommerceSections(intent, options?.storeName);
}

export function composeThemeForIntent(intent: ParsedIntent): AiGeneratedTheme {
  const isLuxuryPerfume =
    intent.tone === "luxury" &&
    intent.keywords.some((k) => ["perfume", "fragrance", "beauty", "cosmetics"].includes(k));

  if (isLuxuryPerfume) {
    return { ...LUXURY_PALETTE, logo: null };
  }

  switch (intent.tone) {
    case "luxury":
      return { ...LUXURY_PALETTE, logo: null };
    case "minimal":
      return { ...MINIMAL_PALETTE, logo: null };
    case "bold":
      return { ...BOLD_PALETTE, logo: null };
    default:
      return { ...PROFESSIONAL_PALETTE, logo: null };
  }
}

export function composeNavigationForIntent(intent: ParsedIntent): NavItem[] {
  const nav = defaultNavigation();

  if (intent.siteType === "restaurant") {
    return [
      { id: "nav-home", label: "Home", href: "/" },
      { id: "nav-menu", label: "Menu", href: "/menu" },
      { id: "nav-about", label: "About", href: "/about" },
      { id: "nav-reserve", label: "Reservations", href: "/contact" },
    ];
  }

  if (intent.siteType === "portfolio") {
    return [
      { id: "nav-home", label: "Home", href: "/" },
      { id: "nav-work", label: "Work", href: "/work" },
      { id: "nav-about", label: "About", href: "/about" },
      { id: "nav-contact", label: "Contact", href: "/contact" },
    ];
  }

  if (intent.siteType === "agency") {
    return [
      { id: "nav-home", label: "Home", href: "/" },
      { id: "nav-services", label: "Services", href: "/services" },
      { id: "nav-about", label: "About", href: "/about" },
      { id: "nav-contact", label: "Contact", href: "/contact" },
    ];
  }

  return nav.map((item) => ({
    ...item,
    id: `nav-${item.id}`,
  }));
}

export function composeSectionForBlock(
  blockId: BlockId,
  intent: ParsedIntent,
  promptText: string
): AiGeneratedSection {
  const block = getBlock(blockId);
  const baseContent = mergeContent(blockId, {});

  if (blockId === "hero") {
    return {
      blockId,
      content: mergeContent("hero", {
        headline: promptText.slice(0, 60) || "Welcome",
        subheadline: `Crafted for ${intent.industry.toLowerCase()}.`,
        ctaText: intent.siteType === "ecommerce" ? "Shop Now" : "Learn More",
        alignment: "center",
      }),
      styles: blockDefaultStyles("hero"),
      visible: true,
    };
  }

  if (blockId === "rich-text") {
    return {
      blockId,
      content: mergeContent("rich-text", {
        title: "About",
        content: `<p>${promptText}</p>`,
        alignment: "center",
      }),
      styles: blockDefaultStyles("rich-text"),
      visible: true,
    };
  }

  return {
    blockId,
    content: baseContent,
    styles: blockDefaultStyles(blockId),
    visible: true,
  };
}
