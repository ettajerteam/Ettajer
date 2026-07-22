import type { ThemeId } from "@/lib/themes";
import type { HomeLayout, StoreSection } from "./types";
import { createSectionFromBlock } from "@/lib/builder/legacy-adapter";
import { getBlock, getBlockBySectionType } from "@/lib/builder/block-registry";

function section(
  type: StoreSection["type"],
  settings?: Record<string, unknown>,
  stableId?: string
): StoreSection {
  const id = stableId ?? `${type}-default`;
  const block = getBlockBySectionType(type) ?? getBlock(type);
  if (block) {
    const created = createSectionFromBlock(block.id, { settings });
    if (created) return { ...created, id };
  }
  return {
    id,
    type,
    settings: settings ?? {},
    visible: true,
  };
}

export function getDefaultHomeLayout(_theme: ThemeId = "minimal"): HomeLayout {
  return {
    version: 1,
    sections: [
      section(
        "hero",
        {
          headline: "Pay on delivery",
          subheadline: "Order today. Pay when your package arrives.",
          ctaText: "Shop the collection",
          ctaLink: "/products",
          showStoreDescription: false,
          showBrand: true,
          overlay: true,
          alignment: "center",
          minHeight: "100svh",
          padding: "0",
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
        },
        "home-hero"
      ),
      section(
        "rich-text",
        {
          title: "",
          layout: "strip",
          content:
            "<p><strong>Cash on delivery</strong> across Morocco · Tracked shipping · Easy returns</p>",
          alignment: "center",
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          padding: "0",
        },
        "home-trust-strip"
      ),
      section(
        "product-grid",
        {
          title: "New arrivals",
          subtitle: "Fresh pieces ready for COD checkout.",
          productSource: "latest",
          limit: 4,
          showViewAll: true,
          cardStyle: "minimal",
          padding: "5rem 1.5rem",
          animation: "slide-up",
        },
        "home-product-grid"
      ),
      section(
        "featured-collections",
        {
          title: "Shop by collection",
          padding: "2rem 1.5rem 5rem",
        },
        "home-collections"
      ),
      section(
        "footer",
        {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        },
        "home-footer"
      ),
    ],
  };
}

export function getDefaultProductLayout(_theme: ThemeId = "minimal"): HomeLayout {
  return {
    version: 1,
    sections: [
      section(
        "product-gallery",
        { showThumbnails: true, layout: "stack", padding: "0" },
        "pdp-gallery"
      ),
      section(
        "product-info",
        {
          showDescription: true,
          showBrand: true,
          layout: "editorial",
          padding: "0",
        },
        "pdp-info"
      ),
      section("product-price", { layout: "default", padding: "0" }, "pdp-price"),
      section("product-variants", { layout: "outline", padding: "0" }, "pdp-variants"),
      section(
        "product-buy-button",
        { buttonText: "Order now — COD", layout: "full", padding: "0" },
        "pdp-buy"
      ),
      section(
        "rich-text",
        {
          title: "",
          layout: "strip",
          content:
            "<p><strong>Cash on delivery</strong> · Pay when you receive · Tracked shipping</p>",
          alignment: "center",
          backgroundColor: "#fafafa",
          textColor: "#737373",
          padding: "0.85rem 0",
        },
        "pdp-cod-strip"
      ),
      section(
        "product-faq",
        {
          title: "Shipping & returns",
          layout: "accordion",
          content:
            "<p><strong>Cash on delivery</strong> — pay in cash when your order arrives. No card needed.</p><p><strong>Shipping</strong> — tracked delivery in 2–5 business days across Morocco.</p><p><strong>Returns</strong> — unused items within 30 days.</p><p><strong>Support</strong> — reply to your order confirmation for the fastest help.</p>",
          padding: "0",
        },
        "pdp-faq"
      ),
      section("product-reviews", { title: "Reviews", layout: "list", padding: "0" }, "pdp-reviews"),
      section(
        "product-related",
        { title: "You may also like", limit: 4, layout: "grid", padding: "0" },
        "pdp-related"
      ),
      section(
        "product-recently-viewed",
        { title: "Recently viewed", limit: 4, layout: "rail", padding: "0 0 2rem" },
        "pdp-recent"
      ),
      section(
        "footer",
        {
          showPoweredBy: true,
          showNav: true,
          showClientCare: true,
          showLegal: true,
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          padding: "4rem 1.5rem 3rem",
        },
        "pdp-footer"
      ),
    ],
  };
}

export function getDefaultCollectionLayout(_theme: ThemeId = "minimal"): HomeLayout {
  return {
    version: 1,
    sections: [
      section(
        "collection-page-banner",
        {
          layout: "hero",
          showBreadcrumb: true,
          showTitle: true,
          minHeight: "42vh",
          padding: "0",
        },
        "collection-banner"
      ),
      section(
        "collection-description",
        {
          layout: "centered",
          showTitle: false,
          showDescription: true,
          padding: "0",
        },
        "collection-description"
      ),
      section(
        "collection-filters",
        { title: "Browse", layout: "minimal", padding: "0" },
        "collection-filters"
      ),
      section(
        "collection-product-grid",
        { columns: 3, density: "comfortable", layout: "grid", padding: "0" },
        "collection-grid"
      ),
      section(
        "collection-pagination",
        { pageSize: 12, layout: "simple", padding: "0" },
        "collection-pagination"
      ),
      section(
        "collection-newsletter",
        {
          title: "Stay in the edit",
          description: "New arrivals and restocks — quiet updates only.",
          buttonText: "Subscribe",
          layout: "strip",
          padding: "0",
        },
        "collection-newsletter"
      ),
    ],
  };
}

export function getDefaultBlogPostLayout(_theme: ThemeId = "minimal"): HomeLayout {
  return {
    version: 1,
    sections: [
      section(
        "hero",
        {
          headline: "Journal note",
          subheadline: "Story title and excerpt appear from your article.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: false,
          overlay: true,
          eyebrow: "Journal",
          minHeight: "58vh",
          padding: "0",
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
        },
        "blog-hero"
      ),
      section(
        "rich-text",
        {
          title: "",
          content:
            "<p>Your published journal article content appears here on the live post.</p>",
          alignment: "left",
          padding: "3.5rem 2rem 2rem",
          backgroundColor: "#ffffff",
        },
        "blog-body"
      ),
      section(
        "cta",
        {
          title: "Shop the edit",
          subtitle: "Pieces referenced in the story — while quantities last.",
          buttonText: "Browse catalog",
          buttonLink: "/products",
          layout: "banner",
          alignment: "center",
          backgroundColor: "#fafafa",
          textColor: "#0a0a0a",
          padding: "3.5rem 2rem",
        },
        "blog-cta"
      ),
      section(
        "rich-text",
        {
          title: "Stay close",
          layout: "newsletter",
          content:
            "<p><strong>Journal dispatch</strong></p><p>New stories and archive drops — quiet updates only.</p>",
          alignment: "center",
          backgroundColor: "#0a0a0a",
          textColor: "#e5e5e5",
          padding: "5rem 2rem",
        },
        "blog-newsletter"
      ),
      section(
        "footer",
        {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        },
        "blog-footer"
      ),
    ],
  };
}
