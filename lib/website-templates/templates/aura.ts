import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

/** Premium lifestyle / nightlife editorial hero for shop & campaigns */
const AURA_SHOP_HERO_IMAGE = "/assets/aura-shop-hero-disco.png";

const AURA_HOME_HERO =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80";
const AURA_ATELIER =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80";
const AURA_EDITORIAL =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80";
const AURA_CAPSULE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80";
const AURA_LOOKBOOK =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80";
const AURA_LOOKBOOK_2 =
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80";
const AURA_ABOUT =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80";

/** Shared Aura visual tokens — keep pages on one system */
const AURA_INK = "#0a0a0a";
const AURA_PAPER = "#F5F5F0";
const AURA_WHITE = "#ffffff";
const AURA_MUTE = "#a3a3a3";
const AURA_ON_DARK = "#e5e5e5";

const FOOTER = { backgroundColor: AURA_INK, textColor: AURA_MUTE } as const;
const FOOTER_EXTRAS = {
  tagline: "Quiet luxury, vivid energy — numbered archives & atelier essentials.",
  showNav: true,
  showClientCare: true,
  showLegal: true,
  showPoweredBy: true,
};

const AURA_NEWSLETTER = {
  title: "Stay in the edit",
  layout: "newsletter" as const,
  content:
    "<p><strong>Aura Dispatch</strong></p><p>Archive drops, restocks, and atelier notes — delivered quietly.</p>",
  alignment: "center" as const,
  backgroundColor: AURA_INK,
  textColor: AURA_ON_DARK,
  padding: "5rem 2rem",
  styles: {
    desktop: { padding: "5rem 2rem" },
    mobile: { padding: "3.5rem 1.25rem" },
  },
};

/** Aura — premium cinematic editorial lifestyle storefront */
export const auraTemplate: WebsiteTemplateDefinition = {
  id: "aura",
  name: "Aura",
  description:
    "Premium editorial storefront — cinematic heroes, lookbook gallery, journal, contact, nested shop nav, full PDP/collection templates, and calm legal pages.",
  tagline: "Quiet luxury, vivid energy",
  industry: "Fashion & Lifestyle",
  thumbnail: "linear-gradient(135deg, #0a0a0a 0%, #1c1917 38%, #c2410c 55%, #d6d3d1 78%, #fafaf9 100%)",
  businessModels: ["physical", "digital", "dropshipping"],
  recommendedCategories: ["fashion", "beauty", "handmade"],
  theme: {
    theme: "modern",
    primaryColor: AURA_INK,
    secondaryColor: AURA_PAPER,
    font: "Playfair Display",
  },
  branding: {
    tagline: "Refined lifestyle essentials — crafted in limited batches",
    storeNameStyle: "editorial",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("aura-hero", "hero", {
          headline: "Winter lookbook",
          subheadline: "Clean silhouettes. Tactile materials. The season ahead.",
          ctaText: "Shop the collection",
          ctaLink: "/products",
          secondaryCtaText: "Lookbook",
          secondaryCtaLink: "/lookbook",
          imageAlt: "Winter lookbook — refined lifestyle fashion",
          imageUrl: AURA_HOME_HERO,
          alignment: "center",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          padding: "0",
          minHeight: "100svh",
          animation: "fade",
          overlay: true,
          eyebrow: "Winter / 26",
          styles: {
            desktop: { padding: "0", minHeight: "100svh" },
            mobile: { padding: "0", minHeight: "100svh" },
          },
        }),
        tplSection("aura-trust", "rich-text", {
          title: "",
          layout: "strip",
          content:
            "<p><strong>Free shipping</strong> · <strong>30-day returns</strong> · <strong>Secure COD</strong></p>",
          alignment: "center",
          backgroundColor: AURA_INK,
          textColor: AURA_MUTE,
          padding: "0",
          styles: {
            desktop: { padding: "0" },
            mobile: { padding: "0" },
          },
        }),
        tplSection("aura-intro", "rich-text", {
          title: "The edit",
          layout: "intro",
          content:
            "<p><em>Quiet luxury for everyday dress — fewer pieces, better materials.</em></p>",
          alignment: "center",
          backgroundColor: AURA_WHITE,
          padding: "6rem 2rem 3rem",
          styles: {
            desktop: { padding: "6rem 2rem 3rem" },
            mobile: { padding: "3.5rem 1.25rem 2rem" },
          },
        }),
        tplSection("aura-collections", "featured-collections", {
          title: "Curated edits",
          collectionSource: "featured",
          limit: 4,
          backgroundColor: AURA_WHITE,
          padding: "1rem 2rem 0",
          styles: {
            desktop: { padding: "1rem 2rem 0" },
            mobile: { padding: "0.5rem 1.25rem 0" },
          },
        }),
        tplSection("aura-trending", "product-grid", {
          title: "Trending now",
          subtitle: "Pieces defining the season.",
          productSource: "latest",
          limit: 4,
          offset: 0,
          showViewAll: true,
          backgroundColor: AURA_WHITE,
          padding: "5rem 2rem 2rem",
          animation: "slide-up",
          styles: {
            desktop: { padding: "5rem 2rem 2rem" },
            mobile: { padding: "3rem 1.25rem 1.5rem" },
          },
        }),
        tplSection("aura-atelier", "hero", {
          headline: "The atelier standard",
          subheadline:
            "Every garment begins with fibre selection — weight, drape, and hand-feel tested before a single stitch.",
          ctaText: "Our story",
          ctaLink: "/about",
          imageUrl: AURA_ATELIER,
          imageAlt: "Atelier craftsmanship — textile detail",
          layout: "editorial",
          showBrand: false,
          alignment: "left",
          showStoreDescription: false,
          backgroundColor: AURA_PAPER,
          padding: "0",
          eyebrow: "Craft",
          styles: {
            desktop: { padding: "0" },
            mobile: { padding: "0" },
          },
        }),
        tplSection("aura-editorial-image", "image", {
          imageUrl: AURA_EDITORIAL,
          alt: "Editorial fashion still — structural silhouette",
          caption: "Structural silhouette — Winter / 26",
          layout: "editorial",
          objectFit: "cover",
          linkUrl: "/lookbook",
          alignment: "center",
          backgroundColor: AURA_PAPER,
          padding: "2rem 0 0",
          styles: {
            desktop: { padding: "2rem 0 0" },
            mobile: { padding: "1rem 0 0" },
          },
        }),
        tplSection("aura-philosophy", "rich-text", {
          title: "Craft over trend",
          content:
            "<p>A wardrobe should be a curated set of high-functioning pieces — not a carousel of fleeting drops.</p>",
          alignment: "left",
          backgroundColor: AURA_PAPER,
          textColor: AURA_INK,
          padding: "4rem 2rem 5rem",
          animation: "fade",
          styles: {
            desktop: { padding: "4rem 2rem 5rem" },
            mobile: { padding: "2.5rem 1.25rem 3.5rem" },
          },
        }),
        tplSection("aura-promo", "hero", {
          headline: "Night & gold",
          subheadline: "Cinematic colour meets atelier construction.",
          ctaText: "Shop the campaign",
          ctaLink: "/products",
          imageUrl: AURA_SHOP_HERO_IMAGE,
          imageAlt: "Nightlife campaign — gold and orange editorial",
          alignment: "center",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          padding: "0",
          minHeight: "78vh",
          overlay: true,
          eyebrow: "Campaign",
          styles: {
            desktop: { padding: "0", minHeight: "78vh" },
            mobile: { padding: "0", minHeight: "70svh" },
          },
        }),
        tplSection("aura-new", "product-grid", {
          title: "New arrivals",
          subtitle: "Fresh from the atelier.",
          productSource: "latest",
          limit: 4,
          offset: 4,
          showViewAll: true,
          backgroundColor: AURA_WHITE,
          padding: "5.5rem 2rem 2rem",
          animation: "slide-up",
          styles: {
            desktop: { padding: "5.5rem 2rem 2rem" },
            mobile: { padding: "3.25rem 1.25rem 1.5rem" },
          },
        }),
        tplSection("aura-reviews", "testimonials", {
          title: "From the community",
          items: [
            {
              quote:
                "The drape and weight feel otherworldly — construction details rival pieces at twice the price.",
              author: "Eleanor V.",
              role: "London",
            },
            {
              quote: "No loud logos. Just gorgeous materials and understated luxury.",
              author: "Marcus S.",
              role: "Berlin",
            },
            {
              quote: "Incredible comfort. Feels premium with trousers or linen shorts.",
              author: "Soren L.",
              role: "Copenhagen",
            },
          ],
          backgroundColor: AURA_PAPER,
          textColor: AURA_INK,
          padding: "5.5rem 2rem",
          styles: {
            desktop: { padding: "5.5rem 2rem" },
            mobile: { padding: "3.5rem 1.25rem" },
          },
        }),
        tplSection("aura-faq", "faq", {
          title: "Client care",
          items: [
            {
              question: "How long does shipping take?",
              answer:
                "Standard delivery is 3–5 business days on qualifying orders. Express next-day is available in select cities.",
            },
            {
              question: "What is your return policy?",
              answer:
                "30-day returns on unworn pieces with tags attached. Archive editions are final sale unless faulty.",
            },
            {
              question: "Do you offer cash on delivery?",
              answer: "Yes — COD is available where enabled at checkout.",
            },
          ],
          backgroundColor: AURA_WHITE,
          textColor: AURA_INK,
          padding: "5rem 2rem",
          styles: {
            desktop: { padding: "5rem 2rem" },
            mobile: { padding: "3.25rem 1.25rem" },
          },
        }),
        tplSection("aura-cta", "cta", {
          title: "Ready for the next archive?",
          subtitle: "Browse the full edit.",
          buttonText: "Shop the edit",
          buttonLink: "/products",
          alignment: "center",
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          padding: "5rem 2rem",
          styles: {
            desktop: { padding: "5rem 2rem" },
            mobile: { padding: "3.5rem 1.25rem" },
          },
        }),
        tplFooter(
          "aura-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "about",
      title: "About",
      status: "published",
      layout: tplLayout(
        tplSection("aura-about-hero", "hero", {
          headline: "Our atelier",
          accentHeadline: "Craft & conscience",
          subheadline:
            "Fewer pieces. Honest materials. Partners across Europe and Morocco.",
          ctaText: "Shop the edit",
          ctaLink: "/products",
          secondaryCtaText: "Lookbook",
          secondaryCtaLink: "/lookbook",
          imageUrl: AURA_ABOUT,
          imageAlt: "Aura atelier — craft and quiet luxury",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "88vh",
          overlay: true,
          padding: "0",
          eyebrow: "About",
          styles: {
            desktop: { padding: "0", minHeight: "88vh" },
            mobile: { padding: "0", minHeight: "78svh" },
          },
        }),
        tplSection("aura-about-intro", "rich-text", {
          title: "The idea",
          layout: "intro",
          content:
            "<p><em>We make fewer things, better — for people who value how a garment feels as much as how it looks.</em></p>",
          alignment: "center",
          backgroundColor: AURA_WHITE,
          padding: "5.5rem 2rem 2rem",
          styles: {
            desktop: { padding: "5.5rem 2rem 2rem" },
            mobile: { padding: "3.25rem 1.25rem 1.5rem" },
          },
        }),
        tplSection("aura-about-body", "rich-text", {
          title: "Built for longevity",
          content:
            "<p>We favor recycled and biodegradable fibres, Responsible Wool Standard wool, organic flax linens, and certified vegetable-tanned leather.</p><p>Each piece is finished with reinforced seams and durable hardware — backed by a five-year repair pledge and transparent supply-chain documentation.</p><p>From Tangier workshops to European mills, every partner is chosen for craft first — not speed.</p>",
          alignment: "left",
          padding: "2rem 2rem 5rem",
          backgroundColor: AURA_WHITE,
          styles: {
            desktop: { padding: "2rem 2rem 5rem" },
            mobile: { padding: "1.25rem 1.25rem 3.25rem" },
          },
        }),
        tplSection("aura-about-image", "image", {
          imageUrl: AURA_ATELIER,
          alt: "Textile craftsmanship detail",
          caption: "Hands, fibre, and time — the atelier standard.",
          layout: "cinematic",
          backgroundColor: AURA_INK,
          padding: "0",
          styles: {
            desktop: { padding: "0" },
            mobile: { padding: "0" },
          },
        }),
        tplSection("aura-about-stats", "rich-text", {
          title: "Commitments",
          layout: "stats",
          content:
            "<p><strong>100%</strong> Traceable supply chain</p><p><strong>0</strong> Single-use plastic in packaging</p><p><strong>5 yr</strong> Repair-first service pledge</p>",
          alignment: "center",
          backgroundColor: AURA_PAPER,
          padding: "5rem 2rem",
          styles: {
            desktop: { padding: "5rem 2rem" },
            mobile: { padding: "3.25rem 1.25rem" },
          },
        }),
        tplSection("aura-about-cta", "cta", {
          title: "Browse the archive",
          subtitle: "Numbered drops and everyday essentials — while quantities last.",
          buttonText: "Shop the edit",
          buttonLink: "/products",
          layout: "banner",
          alignment: "center",
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          padding: "5rem 2rem",
          styles: {
            desktop: { padding: "5rem 2rem" },
            mobile: { padding: "3.5rem 1.25rem" },
          },
        }),
        tplFooter(
          "aura-about-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "lookbook",
      title: "Lookbook",
      status: "published",
      layout: tplLayout(
        tplSection("aura-lookbook-hero", "hero", {
          headline: "Lookbook",
          accentHeadline: "Season frames",
          subheadline:
            "Editorial stills from the current edit — worn, not only watched.",
          imageUrl: AURA_LOOKBOOK,
          imageAlt: "Aura lookbook — winter editorial frames",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "82vh",
          overlay: true,
          padding: "0",
          eyebrow: "Winter / 26",
          ctaText: "Shop the edit",
          ctaLink: "/products",
          secondaryCtaText: "Our story",
          secondaryCtaLink: "/about",
          styles: {
            desktop: { padding: "0", minHeight: "82vh" },
            mobile: { padding: "0", minHeight: "72svh" },
          },
        }),
        tplSection("aura-lookbook-intro", "rich-text", {
          title: "",
          layout: "intro",
          content:
            "<p><em>Shot between atelier light and after-hours glow — frames meant to be worn, not just watched.</em></p>",
          alignment: "center",
          backgroundColor: AURA_PAPER,
          padding: "4.5rem 2rem 1rem",
          styles: {
            desktop: { padding: "4.5rem 2rem 1rem" },
            mobile: { padding: "3rem 1.25rem 0.75rem" },
          },
        }),
        tplSection("aura-lookbook-gallery", "gallery", {
          title: "Season frames",
          layout: "lookbook",
          columns: 3,
          gap: "0.5rem",
          borderRadius: "0",
          images: [
            { url: AURA_HOME_HERO, alt: "Winter tailoring" },
            { url: AURA_EDITORIAL, alt: "Structural silhouette" },
            { url: AURA_CAPSULE, alt: "Sand & Alabaster" },
            { url: AURA_LOOKBOOK, alt: "Street editorial" },
            { url: AURA_LOOKBOOK_2, alt: "Layered tailoring" },
            { url: AURA_ATELIER, alt: "Atelier detail" },
          ],
          backgroundColor: AURA_PAPER,
          padding: "1rem 1rem 3rem",
          styles: {
            desktop: { padding: "1rem 1rem 3rem" },
            mobile: { padding: "0.5rem 0.75rem 2rem" },
          },
        }),
        tplSection("aura-lookbook-video", "video", {
          title: "Campaign reel",
          videoSource: "url",
          videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
          aspectRatio: "16/9",
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          padding: "4rem 2rem",
          styles: {
            desktop: { padding: "4rem 2rem" },
            mobile: { padding: "2.75rem 1.25rem" },
          },
        }),
        tplSection("aura-lookbook-editorial", "image", {
          imageUrl: AURA_HOME_HERO,
          alt: "Lookbook spread — winter tailoring",
          layout: "editorial",
          backgroundColor: AURA_PAPER,
          padding: "1rem 0 2rem",
          styles: {
            desktop: { padding: "1rem 0 2rem" },
            mobile: { padding: "0.75rem 0 1.25rem" },
          },
        }),
        tplSection("aura-lookbook-campaign", "image", {
          imageUrl: AURA_SHOP_HERO_IMAGE,
          alt: "Campaign frame — nightlife gold",
          layout: "cinematic",
          backgroundColor: AURA_INK,
          padding: "0",
          styles: {
            desktop: { padding: "0" },
            mobile: { padding: "0" },
          },
        }),
        tplSection("aura-lookbook-frame-2", "image", {
          imageUrl: AURA_LOOKBOOK_2,
          alt: "Lookbook frame — layered tailoring",
          layout: "cinematic",
          backgroundColor: AURA_INK,
          padding: "0",
          styles: {
            desktop: { padding: "0" },
            mobile: { padding: "0" },
          },
        }),
        tplSection("aura-lookbook-grid", "product-grid", {
          title: "Shop the frames",
          subtitle: "Pieces from this season’s shoot — available while quantities last.",
          productSource: "latest",
          limit: 4,
          showViewAll: true,
          padding: "4rem 2rem 1rem",
          backgroundColor: AURA_PAPER,
          styles: {
            desktop: { padding: "4rem 2rem 1rem" },
            mobile: { padding: "2.75rem 1.25rem 0.75rem" },
          },
        }),
        tplSection("aura-lookbook-newsletter", "rich-text", {
          ...AURA_NEWSLETTER,
          styles: {
            desktop: { padding: "5rem 2rem" },
            mobile: { padding: "3.25rem 1.25rem" },
          },
        }),
        tplFooter(
          "aura-lookbook-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "published",
      layout: tplLayout(
        tplSection("aura-contact-hero", "hero", {
          headline: "Visit & enquire",
          subheadline: "Styling, orders, and personal shopping — by request.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "48vh",
          overlay: true,
          eyebrow: "Client care",
          padding: "0",
          styles: {
            desktop: { padding: "0", minHeight: "48vh" },
            mobile: { padding: "0", minHeight: "42svh" },
          },
        }),
        tplSection("aura-contact-form", "contact-form", {
          title: "Send a message",
          description: "We reply within one business day — styling, orders, and repairs.",
          buttonText: "Send enquiry",
          showPhone: true,
          layout: "split",
          detailEmail: "clientcare@aura.studio",
          detailPhone: "+212 522 00 00 00",
          detailHours: "Mon–Sat · 10am–7pm",
          detailAddress: "Atelier visits by appointment",
          backgroundColor: AURA_WHITE,
          padding: "4.5rem 2rem 5rem",
          styles: {
            desktop: { padding: "4.5rem 2rem 5rem" },
            mobile: { padding: "2.75rem 1.25rem 3.5rem" },
          },
        }),
        tplFooter(
          "aura-contact-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "shipping",
      title: "Shipping & Returns",
      status: "published",
      layout: tplLayout(
        tplSection("aura-ship-hero", "hero", {
          headline: "Shipping & returns",
          subheadline: "Clear timelines, easy returns, repair-first service.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "42vh",
          overlay: true,
          padding: "0",
          eyebrow: "Client care",
          styles: {
            desktop: { padding: "0", minHeight: "42vh" },
            mobile: { padding: "0", minHeight: "36svh" },
          },
        }),
        tplSection("aura-ship-body", "rich-text", {
          title: "Delivery & returns",
          content:
            "<h2>Standard delivery</h2><p>3–5 business days on qualifying orders. Tracking is sent by email once your order leaves the atelier.</p><h2>Express</h2><p>Next-day in select cities — order by 2pm local time for same-day dispatch when available.</p><h2>Returns</h2><p>30-day window on unworn pieces with tags attached. Archive and capsule editions are final sale unless faulty.</p><h2>Repairs</h2><p>Our five-year craftsmanship pledge covers complimentary minor repairs. Include your order number when you write to client care.</p><h2>Cash on delivery</h2><p>COD is available where enabled at checkout. Keep your phone available for the courier.</p>",
          alignment: "left",
          padding: "4.5rem 2rem 2rem",
          backgroundColor: AURA_PAPER,
          styles: {
            desktop: { padding: "4.5rem 2rem 2rem" },
            mobile: { padding: "2.75rem 1.25rem 1.5rem" },
          },
        }),
        tplSection("aura-ship-faq", "faq", {
          title: "Shipping questions",
          items: [
            {
              question: "Can I change my delivery address?",
              answer:
                "Yes — write to client care within 2 hours of placing the order, before dispatch.",
            },
            {
              question: "Do you ship internationally?",
              answer:
                "We ship across Morocco and selected EU destinations. Duties may apply outside Morocco.",
            },
            {
              question: "How do archive returns work?",
              answer:
                "Numbered archive pieces are final sale unless faulty. Faulty items are repaired or replaced under the five-year pledge.",
            },
          ],
          backgroundColor: AURA_PAPER,
          padding: "2rem 2rem 4rem",
          styles: {
            desktop: { padding: "2rem 2rem 4rem" },
            mobile: { padding: "1.25rem 1.25rem 3rem" },
          },
        }),
        tplFooter(
          "aura-ship-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      status: "published",
      layout: tplLayout(
        tplSection("aura-privacy-hero", "hero", {
          headline: "Privacy policy",
          subheadline: "How we collect, use, and protect your information.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "42vh",
          overlay: true,
          padding: "0",
          eyebrow: "Legal",
          styles: {
            desktop: { padding: "0", minHeight: "42vh" },
            mobile: { padding: "0", minHeight: "36svh" },
          },
        }),
        tplSection("aura-privacy-body", "rich-text", {
          title: "",
          content:
            "<h2>Information we collect</h2><p>Name, email, phone, and shipping address at checkout. If you subscribe to Aura Dispatch, we also store your marketing preference.</p><h2>How we use it</h2><p>To fulfil orders, provide client care, process returns and repairs, and send updates you have opted into. We never sell personal data.</p><h2>Payments</h2><p>Payment details are processed by secure payment partners. We do not store full card numbers on our servers.</p><h2>Cookies</h2><p>We use essential cookies for cart and checkout. Analytics cookies run only where enabled in your store settings.</p><h2>Retention</h2><p>Order records are kept as required for accounting and consumer law. Marketing contacts can unsubscribe at any time.</p><h2>Your rights</h2><p>Request access, correction, or deletion via client care. We respond within a reasonable period under applicable law.</p><h2>Contact</h2><p>Questions about privacy — write to client care from the Contact page, or email the address listed there.</p>",
          alignment: "left",
          padding: "4.5rem 2rem 5rem",
          backgroundColor: AURA_PAPER,
          styles: {
            desktop: { padding: "4.5rem 2rem 5rem" },
            mobile: { padding: "2.75rem 1.25rem 3.5rem" },
          },
        }),
        tplFooter(
          "aura-privacy-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "terms",
      title: "Terms of Service",
      status: "published",
      layout: tplLayout(
        tplSection("aura-terms-hero", "hero", {
          headline: "Terms of service",
          subheadline: "The terms that govern purchases from our store.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "42vh",
          overlay: true,
          padding: "0",
          eyebrow: "Legal",
          styles: {
            desktop: { padding: "0", minHeight: "42vh" },
            mobile: { padding: "0", minHeight: "36svh" },
          },
        }),
        tplSection("aura-terms-body", "rich-text", {
          title: "",
          content:
            "<h2>Orders</h2><p>By placing an order you agree to these terms. Prices are shown in your store currency at checkout and may change without notice for future orders.</p><h2>Availability</h2><p>We may limit quantities on archive releases and cancel orders affected by stock or pricing errors. You will be notified promptly if that happens.</p><h2>Payment &amp; COD</h2><p>Accepted methods appear at checkout. Cash on delivery is available where enabled; unpaid COD refusals may affect future COD eligibility.</p><h2>Delivery</h2><p>Risk of loss passes on delivery to the address you provide. See Shipping &amp; returns for timelines and international notes.</p><h2>Returns &amp; archive pieces</h2><p>Standard returns follow the Shipping &amp; returns policy. Numbered archive editions are final sale unless faulty.</p><h2>Disputes</h2><p>Disputes are handled under the laws of your country of residence unless local consumer law requires otherwise.</p>",
          alignment: "left",
          padding: "4.5rem 2rem 5rem",
          backgroundColor: AURA_PAPER,
          styles: {
            desktop: { padding: "4.5rem 2rem 5rem" },
            mobile: { padding: "2.75rem 1.25rem 3.5rem" },
          },
        }),
        tplFooter(
          "aura-terms-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "collections",
      title: "Collections",
      status: "published",
      layout: tplLayout(
        tplSection("aura-collections-hero", "hero", {
          headline: "Collections",
          accentHeadline: "Curated edits",
          subheadline:
            "Archives, capsules, and essentials — grouped for how you dress.",
          ctaText: "Shop all products",
          ctaLink: "/products",
          secondaryCtaText: "View lookbook",
          secondaryCtaLink: "/lookbook",
          imageUrl: AURA_LOOKBOOK,
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "58vh",
          overlay: true,
          padding: "0",
          eyebrow: "Shop by edit",
          styles: {
            desktop: { padding: "0", minHeight: "58vh" },
            mobile: { padding: "0", minHeight: "48svh" },
          },
        }),
        tplSection("aura-collections-grid", "featured-collections", {
          title: "All collections",
          collectionSource: "all",
          limit: 12,
          backgroundColor: AURA_WHITE,
          padding: "3.5rem 2rem 1rem",
          styles: {
            desktop: { padding: "3.5rem 2rem 1rem" },
            mobile: { padding: "2.5rem 1.25rem 0.75rem" },
          },
        }),
        tplSection("aura-collections-newsletter", "rich-text", AURA_NEWSLETTER),
        tplFooter(
          "aura-collections-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "search",
      title: "Search",
      status: "published",
      layout: tplLayout(
        tplSection("aura-search-hero", "hero", {
          headline: "Search",
          accentHeadline: "Find a piece",
          subheadline: "Search by name, material, or tag.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "42vh",
          overlay: true,
          padding: "0",
          eyebrow: "Catalog",
          styles: {
            desktop: { padding: "0", minHeight: "42vh" },
            mobile: { padding: "0", minHeight: "36svh" },
          },
        }),
        tplSection("aura-search-bar", "search", {
          title: "Search the archive",
          placeholder: "Try linen, wool, archive…",
          buttonText: "Search",
          backgroundColor: AURA_PAPER,
          padding: "3rem 2rem 1rem",
          styles: {
            desktop: { padding: "3rem 2rem 1rem" },
            mobile: { padding: "2.25rem 1.25rem 0.75rem" },
          },
        }),
        tplSection("aura-search-intro", "rich-text", {
          title: "",
          layout: "intro",
          content: "<p><em>Results appear below as you search — or browse the latest arrivals.</em></p>",
          alignment: "center",
          backgroundColor: AURA_PAPER,
          padding: "1rem 2rem 0",
          styles: {
            desktop: { padding: "1rem 2rem 0" },
            mobile: { padding: "0.75rem 1.25rem 0" },
          },
        }),
        tplSection("aura-search-browse", "product-grid", {
          title: "Browse instead",
          subtitle: "Or explore the latest arrivals.",
          productSource: "latest",
          limit: 8,
          showViewAll: true,
          backgroundColor: AURA_PAPER,
          padding: "2rem 2rem 1rem",
          styles: {
            desktop: { padding: "2rem 2rem 1rem" },
            mobile: { padding: "1.5rem 1.25rem 0.75rem" },
          },
        }),
        tplSection("aura-search-newsletter", "rich-text", AURA_NEWSLETTER),
        tplFooter(
          "aura-search-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "blog",
      title: "Journal",
      status: "published",
      layout: tplLayout(
        tplSection("aura-blog-hero", "hero", {
          headline: "Journal",
          accentHeadline: "Stories & notes",
          subheadline: "Atelier notes and quiet dispatches from the archive.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          minHeight: "52vh",
          overlay: true,
          padding: "0",
          eyebrow: "Editorial",
          styles: {
            desktop: { padding: "0", minHeight: "52vh" },
            mobile: { padding: "0", minHeight: "44svh" },
          },
        }),
        tplSection("aura-blog-intro", "rich-text", {
          title: "",
          layout: "intro",
          content:
            "<p><em>Published stories appear below — featured first, then the quieter archive.</em></p>",
          alignment: "center",
          backgroundColor: AURA_WHITE,
          padding: "3.5rem 2rem 0.5rem",
          styles: {
            desktop: { padding: "3.5rem 2rem 0.5rem" },
            mobile: { padding: "2.5rem 1.25rem 0.25rem" },
          },
        }),
        tplSection("aura-blog-newsletter", "rich-text", {
          ...AURA_NEWSLETTER,
          title: "Stay close",
          content:
            "<p><strong>Aura Dispatch</strong></p><p>New journal notes and archive drops — no noise.</p>",
        }),
        tplFooter(
          "aura-blog-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
    {
      slug: "products",
      title: "Products",
      status: "published",
      layout: tplLayout(
        tplSection("aura-products-hero", "hero", {
          headline: "All pieces",
          accentHeadline: "The full edit",
          subheadline:
            "Atelier essentials, numbered archives, and campaign pieces.",
          ctaText: "Browse collections",
          ctaLink: "/collections",
          secondaryCtaText: "Lookbook",
          secondaryCtaLink: "/lookbook",
          imageUrl: AURA_SHOP_HERO_IMAGE,
          imageAlt: "Moroccan woman dancing under disco ball — gold and orange nightlife editorial",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: AURA_INK,
          textColor: AURA_WHITE,
          padding: "0",
          minHeight: "58vh",
          overlay: true,
          eyebrow: "Full catalog",
          styles: {
            desktop: { padding: "0", minHeight: "58vh" },
            mobile: { padding: "0", minHeight: "48svh" },
          },
        }),
        tplSection("aura-products-grid", "product-grid", {
          title: "",
          subtitle: "",
          productSource: "latest",
          limit: 48,
          showViewAll: false,
          layout: "grid",
          backgroundColor: AURA_WHITE,
          padding: "1.5rem 2rem 3.5rem",
          animation: "slide-up",
          styles: {
            desktop: { padding: "1.5rem 2rem 3.5rem" },
            mobile: { padding: "1rem 1.25rem 2.5rem" },
          },
        }),
        tplSection("aura-products-collections", "featured-collections", {
          title: "Shop by edit",
          collectionSource: "featured",
          limit: 6,
          backgroundColor: AURA_PAPER,
          padding: "3.5rem 2rem 1rem",
          styles: {
            desktop: { padding: "3.5rem 2rem 1rem" },
            mobile: { padding: "2.5rem 1.25rem 0.75rem" },
          },
        }),
        tplSection("aura-products-newsletter", "rich-text", AURA_NEWSLETTER),
        tplFooter(
          "aura-products-footer",
          FOOTER,
          FOOTER_EXTRAS
        )
      ),
    },
  ],
  navigation: [
    tplNav("nav-aura-home", "Home", "/"),
    tplNav("nav-aura-shop", "Shop", "/products", [
      tplNav("nav-aura-shop-all", "All products", "/products"),
      tplNav("nav-aura-shop-collections", "Collections", "/collections"),
      tplNav("nav-aura-shop-lookbook", "Lookbook", "/lookbook"),
    ]),
    tplNav("nav-aura-journal", "Journal", "/blog"),
    tplNav("nav-aura-about", "About", "/about"),
    tplNav("nav-aura-contact", "Contact", "/contact"),
  ],
  productLayout: tplLayout(
    tplSection("aura-pdp-gallery", "product-gallery", {
      layout: "side",
      showThumbnails: true,
      thumbPosition: "left",
      backgroundColor: AURA_PAPER,
      padding: "0",
      styles: {
        desktop: { padding: "0" },
        mobile: { padding: "0" },
      },
    }),
    tplSection("aura-pdp-info", "product-info", {
      layout: "editorial",
      showDescription: true,
      showBrand: true,
      padding: "0",
      styles: {
        desktop: { padding: "0" },
        mobile: { padding: "0" },
      },
    }),
    tplSection("aura-pdp-price", "product-price", {
      layout: "stacked",
      padding: "0.25rem 0 0",
      styles: {
        desktop: { padding: "0.25rem 0 0" },
        mobile: { padding: "0.2rem 0 0" },
      },
    }),
    tplSection("aura-pdp-variants", "product-variants", {
      layout: "underline",
      label: "Select",
      padding: "0.5rem 0 0",
      styles: {
        desktop: { padding: "0.5rem 0 0" },
        mobile: { padding: "0.4rem 0 0" },
      },
    }),
    tplSection("aura-pdp-buy", "product-buy-button", {
      buttonText: "Buy now",
      layout: "solid",
      padding: "0.75rem 0 0",
      styles: {
        desktop: { padding: "0.75rem 0 0" },
        mobile: { padding: "0.65rem 0 0" },
      },
    }),
    tplSection("aura-pdp-trust", "rich-text", {
      title: "",
      layout: "strip",
      content:
        "<p><strong>Complimentary shipping</strong> on qualifying orders · <strong>30-day</strong> returns · <strong>2-day</strong> atelier dispatch · <strong>5-year</strong> craftsmanship pledge</p>",
      alignment: "left",
      backgroundColor: "transparent",
      textColor: AURA_MUTE,
      padding: "1.25rem 0 0",
      styles: {
        desktop: { padding: "1.25rem 0 0" },
        mobile: { padding: "1rem 0 0" },
      },
    }),
    tplSection("aura-pdp-materials", "rich-text", {
      title: "Material notes",
      layout: "intro",
      content:
        "<p><em>Fibre origins, finish, and fit notes live with every piece — ask client care for the full composition sheet.</em></p>",
      alignment: "center",
      backgroundColor: AURA_WHITE,
      textColor: AURA_INK,
      padding: "4.5rem 2rem 2rem",
      styles: {
        desktop: { padding: "4.5rem 2rem 2rem" },
        mobile: { padding: "3rem 1.25rem 1.5rem" },
      },
    }),
    tplSection("aura-pdp-reviews", "product-reviews", {
      title: "From the community",
      layout: "cards",
      showSummary: true,
      padding: "2.5rem 2rem 2rem",
      backgroundColor: AURA_WHITE,
      styles: {
        desktop: { padding: "2.5rem 2rem 2rem" },
        mobile: { padding: "2rem 1.25rem 1.5rem" },
      },
    }),
    tplSection("aura-pdp-faq", "product-faq", {
      title: "Details & care",
      layout: "accordion",
      content:
        "<p><strong>Materials</strong> — full composition on the garment label; fibre origins available on request.</p><p><strong>Care</strong> — cold wash, line dry, low iron. Dry clean recommended for wool archive pieces.</p><p><strong>Fit</strong> — true to size unless noted. Model is 178cm wearing size M.</p><p><strong>Shipping</strong> — dispatched within 2 business days; tracking sent by email.</p>",
      padding: "2rem 2rem 3.5rem",
      backgroundColor: AURA_WHITE,
      styles: {
        desktop: { padding: "2rem 2rem 3.5rem" },
        mobile: { padding: "1.5rem 1.25rem 2.75rem" },
      },
    }),
    tplSection("aura-pdp-related", "product-related", {
      title: "Shop the frame",
      layout: "grid",
      limit: 4,
      columns: 4,
      padding: "3.5rem 2rem 3rem",
      backgroundColor: AURA_PAPER,
      styles: {
        desktop: { padding: "3.5rem 2rem 3rem" },
        mobile: { padding: "2.5rem 1.25rem 2rem" },
      },
    }),
    tplSection("aura-pdp-recent", "product-recently-viewed", {
      title: "Recently viewed",
      layout: "rail",
      limit: 4,
      padding: "0 2rem 5rem",
      backgroundColor: AURA_WHITE,
      styles: {
        desktop: { padding: "0 2rem 5rem" },
        mobile: { padding: "0 1.25rem 3.5rem" },
      },
    }),
    tplFooter(
      "aura-pdp-footer",
      FOOTER,
      FOOTER_EXTRAS
    )
  ),
  collectionLayout: tplLayout(
    tplSection("aura-col-banner", "collection-page-banner", {
      padding: "0",
      layout: "hero",
      minHeight: "52vh",
      showBreadcrumb: true,
      showTitle: true,
      backgroundColor: AURA_INK,
      textColor: AURA_WHITE,
      styles: {
        desktop: { padding: "0", minHeight: "52vh" },
        mobile: { padding: "0", minHeight: "42svh" },
      },
    }),
    tplSection("aura-col-desc", "collection-description", {
      padding: "2.5rem 2rem 1rem",
      layout: "centered",
      showTitle: false,
      showDescription: true,
      backgroundColor: AURA_WHITE,
      styles: {
        desktop: { padding: "2.5rem 2rem 1rem" },
        mobile: { padding: "1.75rem 1.25rem 0.75rem" },
      },
    }),
    tplSection("aura-col-filters", "collection-filters", {
      title: "Browse",
      layout: "minimal",
      padding: "0 2rem",
      backgroundColor: AURA_WHITE,
      styles: {
        desktop: { padding: "0 2rem" },
        mobile: { padding: "0 1.25rem" },
      },
    }),
    tplSection("aura-col-grid", "collection-product-grid", {
      columns: 3,
      density: "comfortable",
      layout: "grid",
      padding: "1rem 2rem 2rem",
      backgroundColor: AURA_WHITE,
      styles: {
        desktop: { padding: "1rem 2rem 2rem" },
        mobile: { padding: "0.75rem 1.25rem 1.5rem" },
      },
    }),
    tplSection("aura-col-pages", "collection-pagination", {
      pageSize: 12,
      layout: "simple",
      padding: "0 2rem 3.5rem",
      backgroundColor: AURA_WHITE,
      styles: {
        desktop: { padding: "0 2rem 3.5rem" },
        mobile: { padding: "0 1.25rem 2.5rem" },
      },
    }),
    tplSection("aura-col-newsletter", "collection-newsletter", {
      title: "Stay in the edit",
      description: "Archive drops, restocks, and editorial notes — no noise.",
      buttonText: "Join",
      layout: "strip",
      padding: "4rem 2rem",
      backgroundColor: AURA_INK,
      textColor: AURA_ON_DARK,
      styles: {
        desktop: { padding: "4rem 2rem" },
        mobile: { padding: "3rem 1.25rem" },
      },
    }),
    tplFooter(
      "aura-col-footer",
      FOOTER,
      FOOTER_EXTRAS
    )
  ),
  blogPostLayout: tplLayout(
    tplSection("aura-post-hero", "hero", {
      headline: "Journal note",
      subheadline: "Atelier notes and quiet dispatches from the archive.",
      alignment: "left",
      showStoreDescription: false,
      showBrand: true,
      backgroundColor: AURA_INK,
      textColor: AURA_WHITE,
      minHeight: "52vh",
      overlay: true,
      padding: "0",
      eyebrow: "Journal",
      imageUrl: AURA_LOOKBOOK,
      styles: {
        desktop: { padding: "0", minHeight: "52vh" },
        mobile: { padding: "0", minHeight: "44svh" },
      },
    }),
    tplSection("aura-post-body", "rich-text", {
      title: "",
      content:
        "<p>Your published journal article appears here — keep the tone quiet, precise, and material-first.</p>",
      alignment: "left",
      backgroundColor: AURA_WHITE,
      padding: "3.5rem 2rem 2rem",
      styles: {
        desktop: { padding: "3.5rem 2rem 2rem" },
        mobile: { padding: "2.5rem 1.25rem 1.5rem" },
      },
    }),
    tplSection("aura-post-cta", "cta", {
      title: "Shop the frames from this note",
      subtitle: "Pieces referenced in the story — while archive quantities last.",
      buttonText: "Browse the edit",
      buttonLink: "/products",
      layout: "banner",
      alignment: "center",
      backgroundColor: AURA_PAPER,
      textColor: AURA_INK,
      padding: "3.5rem 2rem",
      styles: {
        desktop: { padding: "3.5rem 2rem" },
        mobile: { padding: "2.5rem 1.25rem" },
      },
    }),
    tplSection("aura-post-newsletter", "rich-text", {
      ...AURA_NEWSLETTER,
      title: "Stay close",
      content:
        "<p><strong>Aura Dispatch</strong></p><p>New journal notes and archive drops — no noise.</p>",
    }),
    tplFooter(
      "aura-post-footer",
      FOOTER,
      FOOTER_EXTRAS
    )
  ),
};
