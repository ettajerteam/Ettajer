import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

export const beautyTemplate: WebsiteTemplateDefinition = {
  id: "beauty",
  name: "Beauty & Skincare",
  description: "Soft, luxurious layout for cosmetics, skincare, and wellness brands.",
  tagline: "Glow from within",
  industry: "Beauty & Wellness",
  thumbnail: "linear-gradient(135deg, #D4A5A5 0%, #FFF5F5 45%, #F8E8E8 100%)",
  theme: {
    theme: "minimal",
    primaryColor: "#C4847A",
    secondaryColor: "#FFF5F5",
    font: "Cormorant Garamond",
  },
  branding: {
    tagline: "Glow from within",
    storeNameStyle: "editorial",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("hero-beauty-1", "hero", {
          headline: "Radiance, Redefined",
          subheadline: "Clean beauty essentials for your daily ritual.",
          ctaText: "Shop Bestsellers",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#FFF5F5",
          textColor: "#5C4033",
          padding: "6rem 2rem",
          minHeight: "500px",
        }),
        tplSection("featured-beauty-1", "featured-collections", {
          title: "Shop by Concern",
          backgroundColor: "#ffffff",
          padding: "4rem 2rem",
        }),
        tplSection("products-beauty-1", "product-grid", {
          title: "Bestsellers",
          padding: "4rem 2rem",
          backgroundColor: "#FFF5F5",
        }),
        tplSection("ritual-beauty-1", "rich-text", {
          title: "The Ritual",
          content:
            "<p>Our formulas blend botanical extracts with clinically proven actives. Cruelty-free, dermatologist-tested, and designed for every skin type.</p>",
          alignment: "center",
          backgroundColor: "#C4847A",
          textColor: "#ffffff",
          padding: "5rem 2rem",
        }),
        tplSection("testimonial-beauty-1", "rich-text", {
          title: "Loved by Thousands",
          content:
            "<p><em>\"My skin has never felt this balanced. The serum is a game-changer.\"</em> — Sarah M.</p>",
          alignment: "center",
          backgroundColor: "#ffffff",
          padding: "3rem 2rem",
        }),
        tplFooter("footer-beauty-1", { backgroundColor: "#5C4033", textColor: "#F8E8E8" })
      ),
    },
    {
      slug: "about",
      title: "About",
      status: "draft",
      layout: tplLayout(
        tplSection("about-beauty-hero", "hero", {
          headline: "Our Philosophy",
          subheadline: "Beauty that honors your skin and the planet.",
          alignment: "center",
          backgroundColor: "#C4847A",
          textColor: "#ffffff",
          showStoreDescription: false,
        }),
        tplSection("about-beauty-body", "rich-text", {
          title: "Clean Ingredients",
          content:
            "<p>We source responsibly and never use parabens, sulfates, or artificial fragrances. Every product is formulated in small batches for maximum freshness.</p>",
          alignment: "left",
          padding: "4rem 2rem",
        }),
        tplFooter("about-beauty-footer", { backgroundColor: "#5C4033", textColor: "#F8E8E8" })
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "draft",
      layout: tplLayout(
        tplSection("contact-beauty-hero", "hero", {
          headline: "Beauty Concierge",
          subheadline: "Personalized routines and product recommendations.",
          alignment: "center",
          backgroundColor: "#FFF5F5",
          textColor: "#5C4033",
          showStoreDescription: false,
        }),
        tplSection("contact-beauty-body", "rich-text", {
          title: "Reach Us",
          content:
            "<p><strong>care@yourbeauty.com</strong><br/>Live chat Mon–Fri 9am–6pm</p><p>Book a virtual skin consultation today.</p>",
          alignment: "center",
          padding: "4rem 2rem",
        }),
        tplFooter("contact-beauty-footer", { backgroundColor: "#5C4033", textColor: "#F8E8E8" })
      ),
    },
  ],
  navigation: [
    tplNav("nav-beauty-home", "Home", "/"),
    tplNav("nav-beauty-shop", "Shop", "/products"),
    tplNav("nav-beauty-routines", "Routines", "/collections"),
    tplNav("nav-beauty-about", "About", "/about"),
    tplNav("nav-beauty-contact", "Contact", "/contact"),
  ],
  productLayout: tplLayout(
    tplSection("product-beauty-hero", "hero", {
      headline: "Shop Skincare",
      subheadline: "Serums, moisturizers, and treatments.",
      alignment: "center",
      showStoreDescription: false,
      backgroundColor: "#FFF5F5",
      textColor: "#5C4033",
    }),
    tplSection("product-beauty-grid", "product-grid", { title: "All Products", padding: "3rem 2rem" }),
    tplFooter("product-beauty-footer", { backgroundColor: "#5C4033", textColor: "#F8E8E8" })
  ),
};
