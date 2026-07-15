import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

export const fashionTemplate: WebsiteTemplateDefinition = {
  id: "fashion",
  name: "Fashion Store",
  description: "Editorial storefront for apparel, accessories, and lifestyle brands.",
  tagline: "Curated style for every season",
  industry: "Fashion & Apparel",
  thumbnail: "linear-gradient(135deg, #1a1a1a 0%, #B76E79 50%, #f5e6e8 100%)",
  theme: {
    theme: "modern",
    primaryColor: "#1a1a1a",
    secondaryColor: "#B76E79",
    font: "Playfair Display",
  },
  branding: {
    tagline: "Curated style for every season",
    storeNameStyle: "editorial",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("hero-fashion-1", "hero", {
          headline: "Define Your Style",
          subheadline: "Discover curated collections crafted for the modern wardrobe.",
          ctaText: "Shop New Arrivals",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#1a1a1a",
          textColor: "#ffffff",
          padding: "6rem 2rem",
          minHeight: "520px",
        }),
        tplSection("featured-fashion-1", "featured-collections", {
          title: "Season Collections",
          backgroundColor: "#fafafa",
          padding: "4rem 2rem",
        }),
        tplSection("products-fashion-1", "product-grid", {
          title: "Trending Now",
          padding: "4rem 2rem",
        }),
        tplSection("story-fashion-1", "rich-text", {
          title: "Our Story",
          content:
            "<p>Founded on the belief that fashion should feel effortless, we blend timeless silhouettes with contemporary details.</p>",
          alignment: "center",
          backgroundColor: "#1a1a1a",
          textColor: "#f5f5f5",
          padding: "5rem 2rem",
        }),
        tplFooter("footer-fashion-1", { backgroundColor: "#111111", textColor: "#a3a3a3" })
      ),
    },
    {
      slug: "about",
      title: "About",
      status: "draft",
      layout: tplLayout(
        tplSection("about-fashion-hero", "hero", {
          headline: "Our Atelier",
          subheadline: "Crafting wardrobe essentials since 2018.",
          alignment: "center",
          backgroundColor: "#1a1a1a",
          textColor: "#ffffff",
          showStoreDescription: false,
        }),
        tplSection("about-fashion-body", "rich-text", {
          title: "The Fashion Edit",
          content:
            "<p>We partner with independent designers and ethical manufacturers to bring you pieces that last beyond the season.</p><p>Every collection is edited for versatility, quality, and modern elegance.</p>",
          alignment: "left",
          padding: "4rem 2rem",
        }),
        tplFooter("about-fashion-footer", { backgroundColor: "#111111", textColor: "#a3a3a3" })
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "draft",
      layout: tplLayout(
        tplSection("contact-fashion-hero", "hero", {
          headline: "Visit Our Boutique",
          subheadline: "Styling appointments and personal shopping available.",
          alignment: "center",
          backgroundColor: "#B76E79",
          textColor: "#ffffff",
          showStoreDescription: false,
        }),
        tplSection("contact-fashion-body", "rich-text", {
          title: "Get in Touch",
          content:
            "<p><strong>hello@yourstore.com</strong><br/>Mon–Sat 10am–7pm</p><p>456 Fashion Avenue, New York</p>",
          alignment: "center",
          padding: "4rem 2rem",
        }),
        tplFooter("contact-fashion-footer", { backgroundColor: "#111111", textColor: "#a3a3a3" })
      ),
    },
  ],
  navigation: [
    tplNav("nav-fashion-home", "Home", "/"),
    tplNav("nav-fashion-shop", "Shop", "/products"),
    tplNav("nav-fashion-collections", "Collections", "/collections"),
    tplNav("nav-fashion-about", "About", "/about"),
    tplNav("nav-fashion-contact", "Contact", "/contact"),
  ],
  productLayout: tplLayout(
    tplSection("product-fashion-hero", "hero", {
      headline: "Shop the Collection",
      subheadline: "Premium apparel and accessories.",
      alignment: "center",
      showStoreDescription: false,
      backgroundColor: "#fafafa",
      textColor: "#1a1a1a",
      padding: "3rem 2rem",
    }),
    tplSection("product-fashion-grid", "product-grid", { title: "All Products", padding: "3rem 2rem" }),
    tplFooter("product-fashion-footer", { backgroundColor: "#111111", textColor: "#a3a3a3" })
  ),
  collectionLayout: tplLayout(
    tplSection("collection-fashion-hero", "featured-collections", {
      title: "Collections",
      padding: "4rem 2rem",
      backgroundColor: "#fafafa",
    }),
    tplSection("collection-fashion-grid", "product-grid", { title: "From this collection", padding: "3rem 2rem" }),
    tplFooter("collection-fashion-footer", { backgroundColor: "#111111", textColor: "#a3a3a3" })
  ),
};
