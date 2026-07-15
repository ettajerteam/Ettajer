import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

export const portfolioTemplate: WebsiteTemplateDefinition = {
  id: "portfolio",
  name: "Portfolio",
  description: "Minimal showcase for creatives, freelancers, and personal brands.",
  tagline: "Work that speaks for itself",
  industry: "Creative & Personal",
  thumbnail: "linear-gradient(135deg, #111111 0%, #666666 50%, #eeeeee 100%)",
  theme: {
    theme: "modern",
    primaryColor: "#111111",
    secondaryColor: "#EEEEEE",
    font: "Outfit",
  },
  branding: {
    tagline: "Work that speaks for itself",
    storeNameStyle: "minimal",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("hero-portfolio-1", "hero", {
          headline: "Alex Morgan",
          subheadline: "Designer & creative director crafting thoughtful digital experiences.",
          ctaText: "View Work",
          ctaLink: "#work",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#111111",
          textColor: "#ffffff",
          padding: "7rem 2rem",
          minHeight: "500px",
        }),
        tplSection("work-portfolio-1", "rich-text", {
          title: "Selected Work",
          content:
            "<p><strong>Brand Identity — Lumina Studio</strong><br/>Visual identity for a boutique architecture firm.</p><p><strong>E-commerce — Field & Form</strong><br/>Storefront design for a sustainable home goods brand.</p>",
          alignment: "left",
          backgroundColor: "#ffffff",
          textColor: "#111111",
          padding: "5rem 2rem",
          customClass: "portfolio-work",
        }),
        tplSection("about-portfolio-1", "rich-text", {
          title: "About",
          content:
            "<p>With over a decade of experience across branding and product design, I partner with teams who value clarity and craft.</p>",
          alignment: "left",
          backgroundColor: "#f5f5f5",
          textColor: "#333333",
          padding: "4rem 2rem",
        }),
        tplSection("services-portfolio-1", "rich-text", {
          title: "Services",
          content:
            "<p><strong>Brand Strategy</strong> — Positioning and visual systems.</p><p><strong>Digital Design</strong> — Websites and design systems.</p>",
          alignment: "left",
          backgroundColor: "#ffffff",
          padding: "4rem 2rem",
        }),
        tplFooter("footer-portfolio-1", { backgroundColor: "#111111", textColor: "#888888" }, false)
      ),
    },
    {
      slug: "about",
      title: "About",
      status: "draft",
      layout: tplLayout(
        tplSection("about-page-portfolio-hero", "hero", {
          headline: "About Alex",
          subheadline: "Multidisciplinary designer based in Brooklyn.",
          alignment: "center",
          backgroundColor: "#111111",
          textColor: "#ffffff",
          showStoreDescription: false,
        }),
        tplSection("about-page-portfolio-body", "rich-text", {
          title: "Background",
          content:
            "<p>I have led design at startups and agencies, shipping products used by millions. Available for select freelance and advisory work.</p>",
          alignment: "left",
          padding: "4rem 2rem",
        }),
        tplFooter("about-page-portfolio-footer", { backgroundColor: "#111111", textColor: "#888888" }, false)
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "draft",
      layout: tplLayout(
        tplSection("contact-portfolio-hero", "hero", {
          headline: "Let's Collaborate",
          subheadline: "Open to new projects and speaking engagements.",
          alignment: "center",
          backgroundColor: "#f5f5f5",
          textColor: "#111111",
          showStoreDescription: false,
        }),
        tplSection("contact-portfolio-body", "rich-text", {
          title: "Reach Out",
          content:
            "<p><strong>alex@example.com</strong></p><p>LinkedIn · Dribbble · Instagram</p>",
          alignment: "center",
          padding: "4rem 2rem",
        }),
        tplFooter("contact-portfolio-footer", { backgroundColor: "#111111", textColor: "#888888" }, false)
      ),
    },
  ],
  navigation: [
    tplNav("nav-portfolio-home", "Home", "/"),
    tplNav("nav-portfolio-work", "Work", "/#work"),
    tplNav("nav-portfolio-about", "About", "/about"),
    tplNav("nav-portfolio-contact", "Contact", "/contact"),
  ],
};
