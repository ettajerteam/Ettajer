import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

export const furnitureTemplate: WebsiteTemplateDefinition = {
  id: "furniture",
  name: "Furniture & Home",
  description: "Warm, spacious layout for furniture, décor, and home goods.",
  tagline: "Spaces that feel like home",
  industry: "Furniture & Home",
  thumbnail: "linear-gradient(135deg, #8B7355 0%, #F5F0EB 50%, #E8DFD5 100%)",
  theme: {
    theme: "minimal",
    primaryColor: "#8B7355",
    secondaryColor: "#F5F0EB",
    font: "DM Sans",
  },
  branding: {
    tagline: "Spaces that feel like home",
    storeNameStyle: "minimal",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("hero-furniture-1", "hero", {
          headline: "Crafted for Living",
          subheadline: "Timeless furniture and thoughtful home essentials.",
          ctaText: "Explore Collections",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#F5F0EB",
          textColor: "#3D3229",
          padding: "6rem 2rem",
          minHeight: "500px",
        }),
        tplSection("rooms-furniture-1", "featured-collections", {
          title: "Shop by Room",
          backgroundColor: "#ffffff",
          padding: "4rem 2rem",
        }),
        tplSection("products-furniture-1", "product-grid", {
          title: "New Arrivals",
          padding: "4rem 2rem",
          backgroundColor: "#F5F0EB",
        }),
        tplSection("craft-furniture-1", "rich-text", {
          title: "Artisan Craft",
          content:
            "<p>Each piece is built from sustainably sourced wood and natural materials. Designed to age beautifully and last for generations.</p>",
          alignment: "left",
          backgroundColor: "#8B7355",
          textColor: "#F5F0EB",
          padding: "5rem 2rem",
        }),
        tplSection("delivery-furniture-1", "rich-text", {
          title: "White-Glove Delivery",
          content:
            "<p>Free assembly and placement in your home. We handle everything from doorstep to final styling.</p>",
          alignment: "center",
          backgroundColor: "#ffffff",
          padding: "3rem 2rem",
        }),
        tplFooter("footer-furniture-1", { backgroundColor: "#3D3229", textColor: "#E8DFD5" })
      ),
    },
    {
      slug: "about",
      title: "About",
      status: "draft",
      layout: tplLayout(
        tplSection("about-furniture-hero", "hero", {
          headline: "Our Workshop",
          subheadline: "Handcrafted in small batches since 2010.",
          alignment: "center",
          backgroundColor: "#8B7355",
          textColor: "#F5F0EB",
          showStoreDescription: false,
        }),
        tplSection("about-furniture-body", "rich-text", {
          title: "Made to Last",
          content:
            "<p>We collaborate with master craftspeople who share our commitment to quality and sustainability. Every joint, finish, and fabric is chosen with care.</p>",
          alignment: "left",
          padding: "4rem 2rem",
        }),
        tplFooter("about-furniture-footer", { backgroundColor: "#3D3229", textColor: "#E8DFD5" })
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "draft",
      layout: tplLayout(
        tplSection("contact-furniture-hero", "hero", {
          headline: "Design Consultation",
          subheadline: "Free in-home or virtual styling sessions.",
          alignment: "center",
          backgroundColor: "#F5F0EB",
          textColor: "#3D3229",
          showStoreDescription: false,
        }),
        tplSection("contact-furniture-body", "rich-text", {
          title: "Visit Our Showroom",
          content:
            "<p><strong>hello@yourhome.com</strong><br/>789 Design District</p><p>Open Tue–Sat 10am–6pm</p>",
          alignment: "center",
          padding: "4rem 2rem",
        }),
        tplFooter("contact-furniture-footer", { backgroundColor: "#3D3229", textColor: "#E8DFD5" })
      ),
    },
  ],
  navigation: [
    tplNav("nav-furniture-home", "Home", "/"),
    tplNav("nav-furniture-shop", "Shop", "/products"),
    tplNav("nav-furniture-rooms", "Rooms", "/collections"),
    tplNav("nav-furniture-about", "About", "/about"),
    tplNav("nav-furniture-contact", "Contact", "/contact"),
  ],
  productLayout: tplLayout(
    tplSection("product-furniture-hero", "hero", {
      headline: "All Furniture",
      subheadline: "Sofas, tables, storage, and more.",
      alignment: "center",
      showStoreDescription: false,
      backgroundColor: "#F5F0EB",
      textColor: "#3D3229",
    }),
    tplSection("product-furniture-grid", "product-grid", { title: "Products", padding: "3rem 2rem" }),
    tplFooter("product-furniture-footer", { backgroundColor: "#3D3229", textColor: "#E8DFD5" })
  ),
  collectionLayout: tplLayout(
    tplSection("collection-furniture-hero", "featured-collections", {
      title: "Room Collections",
      padding: "4rem 2rem",
      backgroundColor: "#F5F0EB",
    }),
    tplSection("collection-furniture-grid", "product-grid", { title: "In this room", padding: "3rem 2rem" }),
    tplFooter("collection-furniture-footer", { backgroundColor: "#3D3229", textColor: "#E8DFD5" })
  ),
};
