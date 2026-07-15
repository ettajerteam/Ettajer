import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

export const electronicsTemplate: WebsiteTemplateDefinition = {
  id: "electronics",
  name: "Electronics",
  description: "Clean, product-focused layout for tech and gadget retailers.",
  tagline: "Innovation at your fingertips",
  industry: "Electronics & Tech",
  thumbnail: "linear-gradient(135deg, #0066CC 0%, #ffffff 55%, #e8f4ff 100%)",
  theme: {
    theme: "minimal",
    primaryColor: "#0066CC",
    secondaryColor: "#FFFFFF",
    font: "Inter",
  },
  branding: {
    tagline: "Innovation at your fingertips",
    storeNameStyle: "minimal",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("hero-electronics-1", "hero", {
          headline: "Next-Gen Tech",
          subheadline: "Premium devices, smart accessories, and expert support.",
          ctaText: "Browse Products",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#0066CC",
          textColor: "#ffffff",
          padding: "5rem 2rem",
          minHeight: "460px",
        }),
        tplSection("products-electronics-1", "product-grid", {
          title: "Featured Products",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
        }),
        tplSection("support-electronics-1", "rich-text", {
          title: "Warranty & Support",
          content:
            "<p>Every purchase includes a <strong>2-year manufacturer warranty</strong> and free technical support.</p>",
          alignment: "left",
          backgroundColor: "#f0f7ff",
          textColor: "#1a3a5c",
          padding: "4rem 2rem",
        }),
        tplSection("categories-electronics-1", "featured-collections", {
          title: "Shop by Category",
          padding: "4rem 2rem",
        }),
        tplFooter("footer-electronics-1", { backgroundColor: "#1a3a5c", textColor: "#b8d4f0" })
      ),
    },
    {
      slug: "about",
      title: "Support",
      status: "draft",
      layout: tplLayout(
        tplSection("about-electronics-hero", "hero", {
          headline: "Expert Support",
          subheadline: "Setup guides, troubleshooting, and warranty info.",
          alignment: "center",
          backgroundColor: "#0066CC",
          textColor: "#ffffff",
          showStoreDescription: false,
        }),
        tplSection("about-electronics-body", "rich-text", {
          title: "How We Help",
          content:
            "<p><strong>Setup assistance</strong> — Video guides and live chat for every product.</p><p><strong>Returns</strong> — 30-day hassle-free returns on unopened items.</p>",
          alignment: "left",
          padding: "4rem 2rem",
        }),
        tplFooter("about-electronics-footer", { backgroundColor: "#1a3a5c", textColor: "#b8d4f0" })
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "draft",
      layout: tplLayout(
        tplSection("contact-electronics-hero", "hero", {
          headline: "Contact Support",
          subheadline: "Available 7 days a week.",
          alignment: "center",
          backgroundColor: "#f0f7ff",
          textColor: "#1a3a5c",
          showStoreDescription: false,
        }),
        tplSection("contact-electronics-body", "rich-text", {
          title: "Get Help",
          content:
            "<p><strong>support@yourtech.com</strong><br/>1-800-TECH-HELP</p><p>Mon–Sun 8am–10pm EST</p>",
          alignment: "center",
          padding: "4rem 2rem",
        }),
        tplFooter("contact-electronics-footer", { backgroundColor: "#1a3a5c", textColor: "#b8d4f0" })
      ),
    },
  ],
  navigation: [
    tplNav("nav-electronics-home", "Home", "/"),
    tplNav("nav-electronics-products", "Products", "/products"),
    tplNav("nav-electronics-deals", "Deals", "/collections"),
    tplNav("nav-electronics-support", "Support", "/about"),
    tplNav("nav-electronics-contact", "Contact", "/contact"),
  ],
  productLayout: tplLayout(
    tplSection("product-electronics-hero", "hero", {
      headline: "All Products",
      subheadline: "Browse our full catalog.",
      alignment: "center",
      showStoreDescription: false,
      backgroundColor: "#0066CC",
      textColor: "#ffffff",
    }),
    tplSection("product-electronics-grid", "product-grid", { title: "Products", padding: "3rem 2rem" }),
    tplFooter("product-electronics-footer", { backgroundColor: "#1a3a5c", textColor: "#b8d4f0" })
  ),
  collectionLayout: tplLayout(
    tplSection("collection-electronics-hero", "featured-collections", {
      title: "Deals & Bundles",
      padding: "4rem 2rem",
      backgroundColor: "#f0f7ff",
    }),
    tplSection("collection-electronics-grid", "product-grid", { title: "On sale now", padding: "3rem 2rem" }),
    tplFooter("collection-electronics-footer", { backgroundColor: "#1a3a5c", textColor: "#b8d4f0" })
  ),
};
