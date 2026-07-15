import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

export const agencyTemplate: WebsiteTemplateDefinition = {
  id: "agency",
  name: "Agency",
  description: "Bold, conversion-focused layout for studios and service businesses.",
  tagline: "We build brands that move people",
  industry: "Agency & Services",
  thumbnail: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 40%, #ede9fe 100%)",
  theme: {
    theme: "bold",
    primaryColor: "#7C3AED",
    secondaryColor: "#0A0A0A",
    font: "Space Grotesk",
  },
  branding: {
    tagline: "We build brands that move people",
    storeNameStyle: "bold",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("hero-agency-1", "hero", {
          headline: "Grow Faster. Stand Out.",
          subheadline: "Full-service creative agency for ambitious brands ready to scale.",
          ctaText: "Start a Project",
          ctaLink: "/contact",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#0A0A0A",
          textColor: "#ffffff",
          padding: "6rem 2rem",
          minHeight: "520px",
        }),
        tplSection("services-agency-1", "rich-text", {
          title: "What We Do",
          content:
            "<p><strong>Brand Strategy</strong> — Positioning, messaging, and go-to-market plans.</p><p><strong>Design & Development</strong> — Websites and design systems that convert.</p><p><strong>Marketing</strong> — Campaigns and growth experiments.</p>",
          alignment: "left",
          backgroundColor: "#111111",
          textColor: "#e5e5e5",
          padding: "5rem 2rem",
        }),
        tplSection("cases-agency-1", "rich-text", {
          title: "Case Studies",
          content:
            "<p><strong>Velocity SaaS</strong> — 3× increase in demo requests after rebrand.</p><p><strong>Greenline Retail</strong> — 42% lift in online sales.</p>",
          alignment: "left",
          backgroundColor: "#7C3AED",
          textColor: "#ffffff",
          padding: "5rem 2rem",
        }),
        tplSection("cta-agency-1", "rich-text", {
          title: "Ready to Work Together?",
          content:
            "<p>Tell us about your goals and we'll craft a proposal tailored to your timeline.</p>",
          alignment: "center",
          backgroundColor: "#0A0A0A",
          textColor: "#ffffff",
          padding: "4rem 2rem",
        }),
        tplFooter("footer-agency-1", { backgroundColor: "#050505", textColor: "#737373" })
      ),
    },
    {
      slug: "about",
      title: "Team",
      status: "draft",
      layout: tplLayout(
        tplSection("about-agency-hero", "hero", {
          headline: "Meet the Team",
          subheadline: "Strategists, designers, and builders under one roof.",
          alignment: "center",
          backgroundColor: "#7C3AED",
          textColor: "#ffffff",
          showStoreDescription: false,
        }),
        tplSection("about-agency-body", "rich-text", {
          title: "Our Culture",
          content:
            "<p>We are a remote-first studio with hubs in NYC and Berlin. We believe in bold ideas, fast iteration, and measurable results.</p>",
          alignment: "left",
          padding: "4rem 2rem",
          backgroundColor: "#111111",
          textColor: "#e5e5e5",
        }),
        tplFooter("about-agency-footer", { backgroundColor: "#050505", textColor: "#737373" })
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "draft",
      layout: tplLayout(
        tplSection("contact-agency-hero", "hero", {
          headline: "Start a Project",
          subheadline: "Tell us about your goals — we respond within 24 hours.",
          alignment: "center",
          backgroundColor: "#0A0A0A",
          textColor: "#ffffff",
          showStoreDescription: false,
        }),
        tplSection("contact-agency-body", "rich-text", {
          title: "Get in Touch",
          content:
            "<p><strong>hello@youragency.com</strong></p><p>Schedule a discovery call to explore how we can help.</p>",
          alignment: "center",
          padding: "4rem 2rem",
        }),
        tplFooter("contact-agency-footer", { backgroundColor: "#050505", textColor: "#737373" })
      ),
    },
  ],
  navigation: [
    tplNav("nav-agency-home", "Home", "/"),
    tplNav("nav-agency-services", "Services", "/#services"),
    tplNav("nav-agency-work", "Work", "/collections"),
    tplNav("nav-agency-team", "Team", "/about"),
    tplNav("nav-agency-contact", "Contact", "/contact"),
  ],
};
