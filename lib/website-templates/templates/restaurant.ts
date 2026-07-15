import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

export const restaurantTemplate: WebsiteTemplateDefinition = {
  id: "restaurant",
  name: "Restaurant",
  description: "Warm, inviting layout for dining, cafés, and hospitality.",
  tagline: "Where every meal tells a story",
  industry: "Food & Hospitality",
  thumbnail: "linear-gradient(135deg, #C4714A 0%, #FAF7F2 60%, #e8dcc8 100%)",
  theme: {
    theme: "minimal",
    primaryColor: "#C4714A",
    secondaryColor: "#FAF7F2",
    font: "Playfair Display",
  },
  branding: {
    tagline: "Where every meal tells a story",
    storeNameStyle: "editorial",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("hero-restaurant-1", "hero", {
          headline: "Taste the Season",
          subheadline: "Farm-to-table cuisine in a welcoming atmosphere.",
          ctaText: "Reserve a Table",
          ctaLink: "/contact",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#C4714A",
          textColor: "#FAF7F2",
          padding: "6rem 2rem",
          minHeight: "480px",
        }),
        tplSection("hours-restaurant-1", "rich-text", {
          title: "Hours & Location",
          content:
            "<p><strong>Open daily</strong><br/>Lunch: 11:30 AM – 2:30 PM<br/>Dinner: 5:30 PM – 10:00 PM</p><p>123 Culinary Lane, Downtown</p>",
          alignment: "center",
          backgroundColor: "#FAF7F2",
          textColor: "#3d2c24",
          padding: "3.5rem 2rem",
        }),
        tplSection("menu-restaurant-1", "featured-collections", {
          title: "Menu Categories",
          backgroundColor: "#ffffff",
          padding: "4rem 2rem",
        }),
        tplSection("story-restaurant-1", "rich-text", {
          title: "Our Kitchen",
          content:
            "<p>Our chefs source seasonal ingredients from local farms. Each dish honors tradition while embracing creative flair.</p>",
          alignment: "left",
          backgroundColor: "#f5ede4",
          textColor: "#3d2c24",
          padding: "4rem 2rem",
        }),
        tplFooter("footer-restaurant-1", { backgroundColor: "#3d2c24", textColor: "#e8dcc8" })
      ),
    },
    {
      slug: "about",
      title: "About",
      status: "draft",
      layout: tplLayout(
        tplSection("about-restaurant-hero", "hero", {
          headline: "Our Story",
          subheadline: "A neighborhood gathering place since 2015.",
          alignment: "center",
          backgroundColor: "#C4714A",
          textColor: "#FAF7F2",
          showStoreDescription: false,
        }),
        tplSection("about-restaurant-body", "rich-text", {
          title: "From Our Family to Yours",
          content:
            "<p>What started as a weekend pop-up became a beloved local destination. We believe great food brings people together.</p>",
          alignment: "left",
          padding: "4rem 2rem",
        }),
        tplFooter("about-restaurant-footer", { backgroundColor: "#3d2c24", textColor: "#e8dcc8" })
      ),
    },
    {
      slug: "contact",
      title: "Reservations",
      status: "draft",
      layout: tplLayout(
        tplSection("contact-restaurant-hero", "hero", {
          headline: "Reserve a Table",
          subheadline: "Groups of 8+ please call ahead.",
          alignment: "center",
          backgroundColor: "#FAF7F2",
          textColor: "#3d2c24",
          showStoreDescription: false,
        }),
        tplSection("contact-restaurant-body", "rich-text", {
          title: "Book Now",
          content:
            "<p><strong>(555) 012-3456</strong><br/>reservations@yourrestaurant.com</p><p>Walk-ins welcome — expect a short wait on weekends.</p>",
          alignment: "center",
          padding: "4rem 2rem",
        }),
        tplFooter("contact-restaurant-footer", { backgroundColor: "#3d2c24", textColor: "#e8dcc8" })
      ),
    },
  ],
  navigation: [
    tplNav("nav-restaurant-home", "Home", "/"),
    tplNav("nav-restaurant-menu", "Menu", "/products"),
    tplNav("nav-restaurant-reservations", "Reservations", "/contact"),
    tplNav("nav-restaurant-about", "About", "/about"),
    tplNav("nav-restaurant-contact", "Contact", "/contact"),
  ],
};
