import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

const TECH_HERO =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80";
const TECH_WATCH =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";
const TECH_CIRCUIT =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80";
const TECH_HEADPHONES =
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80";

const FOOTER = { backgroundColor: "#0f172a", textColor: "#94a3b8" } as const;
const FOOTER_EXTRAS = {
  tagline: "Premium gadgets, curated for you — Care+ protected, COD-ready.",
  showNav: true,
  showClientCare: true,
  showLegal: true,
  showPoweredBy: true,
};

/** TechNova — premium gadgets storefront for electronics merchants */
export const techTemplate: WebsiteTemplateDefinition = {
  id: "tech",
  name: "TechNova",
  description:
    "High-fidelity gadgets storefront — split product heroes, Care+ trust, live FAQ/contact, countdown deals, published support pages, and COD-ready checkout.",
  tagline: "Hot gadgets. Curated fidelity.",
  industry: "Electronics & Tech",
  thumbnail: "linear-gradient(135deg, #0f172a 0%, #2563eb 45%, #4f46e5 70%, #f8fafc 100%)",
  businessModels: ["physical", "digital", "dropshipping"],
  recommendedCategories: ["electronics", "other"],
  theme: {
    theme: "minimal",
    primaryColor: "#2563eb",
    secondaryColor: "#f8fafc",
    font: "Outfit",
  },
  branding: {
    tagline: "Premium gadgets, curated for you",
    storeNameStyle: "bold",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("tech-hero", "hero", {
          headline: "Hot Gadgets Deals",
          accentHeadline: "Up to 25% Off",
          subheadline:
            "Experience sound redefined. Discover why audio experts rate the Orion Elite Pro as the gold standard in high-resolution spatial acoustics.",
          ctaText: "Shop Premier Collection",
          ctaLink: "/products",
          secondaryCtaText: "View deals",
          secondaryCtaLink: "/deals",
          imageUrl: TECH_HERO,
          imageAlt: "Orion Elite Pro wireless headphones",
          alignment: "left",
          showStoreDescription: false,
          layout: "split",
          eyebrow: "Limited offers",
          backgroundColor: "#f8fafc",
          textColor: "#0f172a",
          borderRadius: "32px",
          animation: "fade",
        }),
        tplSection("tech-features", "features", {
          title: "Built for confident checkout",
          items: [
            {
              title: "Insured shipping",
              body: "Fully tracked express delivery with in-box confirmation.",
              icon: "📦",
            },
            {
              title: "Care+ protection",
              body: "2-year premium warranty covering structural and electric fidelity.",
              icon: "🛡️",
            },
            {
              title: "30-day trial",
              body: "Return any item hassle-free if it doesn’t fit your setup.",
              icon: "↺",
            },
          ],
          backgroundColor: "#ffffff",
          padding: "3.5rem 2rem",
        }),
        tplSection("tech-categories", "featured-collections", {
          title: "Shop by category",
          collectionSource: "featured",
          limit: 6,
          backgroundColor: "#f8fafc",
          padding: "4rem 2rem",
          animation: "slide-up",
        }),
        tplSection("tech-grid", "product-grid", {
          title: "Premier Collections",
          subtitle: "Verified devices — mapped for specs, tested for everyday reliability.",
          productSource: "latest",
          limit: 8,
          offset: 0,
          showViewAll: true,
          backgroundColor: "#ffffff",
          padding: "4.5rem 2rem",
          animation: "slide-up",
        }),
        tplSection("tech-promo", "hero", {
          headline: "AeroWatch Series S",
          accentHeadline: "Special Release",
          subheadline:
            "The pinnacle of smart biometric tracking. Order now to secure a complimentary charging dock and an additional dynamic sports strap.",
          ctaText: "Explore Watch Bundle",
          ctaLink: "/products",
          imageUrl: TECH_WATCH,
          imageAlt: "AeroWatch Series S smartwatch",
          alignment: "left",
          showStoreDescription: false,
          layout: "split",
          eyebrow: "Exclusive bundle",
          backgroundColor: "#f8fafc",
          textColor: "#0f172a",
          borderRadius: "32px",
        }),
        tplSection("tech-countdown", "countdown", {
          title: "Deal window closing",
          subtitle: "Premier kits and AeroWatch bundles — while stocks last.",
          endAt: "2026-12-31T23:59",
          ctaText: "Shop deals",
          ctaLink: "/deals",
          backgroundColor: "#0f172a",
          textColor: "#e2e8f0",
          padding: "4rem 2rem",
          alignment: "center",
        }),
        tplSection("tech-value", "rich-text", {
          title: "Acoustically Perfect.\nDigitally Synchronized.",
          layout: "intro",
          content:
            "<p><em>More than a tech shop — a design-first curation workspace. Every headset, smartwatch, and soundbar is mapped for structural ratios and tested for everyday reliability.</em></p>",
          alignment: "left",
          backgroundColor: "#0f172a",
          textColor: "#e2e8f0",
          padding: "5rem 2rem 2rem",
          animation: "fade",
        }),
        tplSection("tech-stats", "rich-text", {
          title: "",
          layout: "stats",
          content:
            "<p><strong>40K+</strong> Units configured</p><p><strong>99.8%</strong> Fidelity ratio</p><p><strong>2 yr</strong> Care+ coverage</p>",
          alignment: "center",
          backgroundColor: "#0f172a",
          textColor: "#94a3b8",
          padding: "0 2rem 4rem",
        }),
        tplSection("tech-bestsellers", "product-grid", {
          title: "Staff picks",
          subtitle: "Devices our team actually uses — not just lists.",
          productSource: "latest",
          limit: 4,
          offset: 8,
          showViewAll: true,
          backgroundColor: "#ffffff",
          padding: "4rem 2rem",
        }),
        tplSection("tech-reviews", "testimonials", {
          title: "Verified buyers",
          items: [
            {
              quote: "Soundstage is absurd for the price. Setup took two minutes.",
              author: "Amine K.",
              role: "Casablanca",
            },
            {
              quote: "Care+ claim was approved same day. That alone sold me.",
              author: "Sara M.",
              role: "Rabat",
            },
            {
              quote: "COD arrived sealed with tracking. Exactly as listed.",
              author: "Youssef B.",
              role: "Marrakech",
            },
          ],
          backgroundColor: "#f8fafc",
          padding: "4rem 2rem",
        }),
        tplSection("tech-faq", "faq", {
          title: "Before you order",
          items: [
            {
              question: "Do you offer cash on delivery?",
              answer: "Yes — COD is available where enabled at checkout. Keep your phone on for delivery.",
            },
            {
              question: "What does Care+ cover?",
              answer:
                "Two years of structural and electric fidelity protection on eligible devices. Attach your order ID and serial for claims.",
            },
            {
              question: "How fast is shipping?",
              answer: "Most orders dispatch within 1–2 business days with full tracking.",
            },
          ],
          backgroundColor: "#ffffff",
          padding: "3rem 2rem",
        }),
        tplSection("tech-cta", "cta", {
          title: "Ready to upgrade your setup?",
          subtitle: "Browse the full catalog or jump into active deals.",
          buttonText: "Shop now",
          buttonLink: "/products",
          alignment: "center",
          backgroundColor: "#2563eb",
          textColor: "#ffffff",
          padding: "4rem 2rem",
        }),
        tplSection("tech-newsletter", "rich-text", {
          title: "Access the Private Releases",
          layout: "newsletter",
          content:
            "<p><strong>TechNova Dispatch</strong></p><p>Priority hardware drops and restocks — welcome code <strong>TECHNOVA10</strong>. Free express shipping on qualifying orders.</p>",
          alignment: "center",
          padding: "4.5rem 2rem",
          backgroundColor: "#0f172a",
          textColor: "#e2e8f0",
        }),
        tplFooter("tech-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "about",
      title: "About",
      status: "published",
      layout: tplLayout(
        tplSection("tech-about-hero", "hero", {
          headline: "Built for\nentusiasts",
          accentHeadline: "Design-first hardware",
          subheadline:
            "Curated devices for creators, gamers, and professionals — verified specs, honest reviews, Care+ protection.",
          ctaText: "Browse catalog",
          ctaLink: "/products",
          imageUrl: TECH_CIRCUIT,
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          overlay: true,
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          minHeight: "78vh",
          padding: "0",
        }),
        tplSection("tech-about-intro", "rich-text", {
          title: "The lab",
          layout: "intro",
          content:
            "<p><em>We source only what we’d put on our own desks — clear specs, no inflated claims, protection where it matters.</em></p>",
          alignment: "center",
          backgroundColor: "#ffffff",
          padding: "5rem 2rem 2rem",
        }),
        tplSection("tech-about-body", "rich-text", {
          title: "Our standard",
          content:
            "<p>Every listing is checked against manufacturer data. Wearables and audio are tried in real daily use. Copy stays honest — just what the device delivers.</p><p>Orders ship insured with tracking. Eligible carts unlock complimentary Care+. COD where configured.</p>",
          alignment: "left",
          padding: "2rem 2rem 4rem",
          backgroundColor: "#ffffff",
        }),
        tplSection("tech-about-image", "image", {
          imageUrl: TECH_HEADPHONES,
          alt: "Premium audio hardware detail",
          caption: "Desk-tested — then listed.",
          layout: "cinematic",
          backgroundColor: "#0f172a",
          padding: "0",
        }),
        tplSection("tech-about-features", "features", {
          title: "How we curate",
          subtitle: "Three checks before anything goes live.",
          layout: "minimal",
          cardStyle: "plain",
          alignment: "left",
          showIcons: false,
          columns: 3,
          items: [
            { title: "Spec verification", body: "Every listing checked against manufacturer data." },
            { title: "Desk-tested", body: "Wearables and audio tried in real daily use." },
            { title: "Honest copy", body: "No inflated claims — just what the device delivers." },
          ],
          backgroundColor: "#f8fafc",
          padding: "4.5rem 2rem",
        }),
        tplSection("tech-about-cta", "cta", {
          title: "See the catalog",
          subtitle: "Premier kits and staff picks — Care+-ready.",
          buttonText: "Shop devices",
          buttonLink: "/products",
          layout: "banner",
          alignment: "center",
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          padding: "4.5rem 2rem",
        }),
        tplFooter("tech-about-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "deals",
      title: "Deals",
      status: "published",
      layout: tplLayout(
        tplSection("tech-deals-hero", "hero", {
          headline: "Limited offers",
          accentHeadline: "Save on premier kits",
          subheadline:
            "Orion Elite Series up to 25% off. AeroWatch special release bundles while stocks last.",
          ctaText: "Shop deals",
          ctaLink: "/products",
          imageUrl: TECH_HEADPHONES,
          alignment: "left",
          showStoreDescription: false,
          layout: "split",
          eyebrow: "Hot deals",
          backgroundColor: "#f8fafc",
          textColor: "#0f172a",
          borderRadius: "32px",
        }),
        tplSection("tech-deals-countdown", "countdown", {
          title: "This window ends soon",
          subtitle: "Bundle savings unlock at checkout on eligible SKUs.",
          endAt: "2026-12-31T23:59",
          ctaText: "Grab a deal",
          ctaLink: "/products",
          backgroundColor: "#0f172a",
          textColor: "#e2e8f0",
          padding: "3rem 2rem",
          alignment: "center",
        }),
        tplSection("tech-deals-grid", "product-grid", {
          title: "Active promotions",
          subtitle: "Discounted kits and staff favourites.",
          productSource: "latest",
          limit: 8,
          showViewAll: true,
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
        }),
        tplFooter("tech-deals-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "support",
      title: "Support",
      status: "published",
      layout: tplLayout(
        tplSection("tech-support-hero", "hero", {
          headline: "Support & orders",
          subheadline: "Warranty, shipping, COD questions, and product advice — fast responses.",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          minHeight: "280px",
          overlay: true,
          eyebrow: "Client services",
        }),
        tplSection("tech-support-body", "rich-text", {
          title: "Reach us",
          content:
            "<p><strong>support@yourstore.com</strong><br/>Mon–Fri 9am–6pm</p><p>For Care+ claims, attach your order ID and serial number. Tracking links arrive in your confirmation email.</p>",
          alignment: "center",
          padding: "3rem 2rem 1rem",
          backgroundColor: "#ffffff",
        }),
        tplSection("tech-support-form", "contact-form", {
          title: "Send a ticket",
          description: "Orders, Care+, and product advice — we reply within one business day.",
          buttonText: "Submit",
          showPhone: true,
          backgroundColor: "#f8fafc",
          padding: "2rem 2rem 3rem",
        }),
        tplSection("tech-support-faq", "faq", {
          title: "Common questions",
          items: [
            {
              question: "Where is my tracking number?",
              answer: "It is emailed after dispatch. Check spam if you do not see it within 48 hours.",
            },
            {
              question: "Can I change my COD address?",
              answer: "Write to support before dispatch with your order number and the new address.",
            },
          ],
          backgroundColor: "#ffffff",
          padding: "2rem 2rem 4rem",
        }),
        tplFooter("tech-support-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "shipping",
      title: "Shipping & Returns",
      status: "published",
      layout: tplLayout(
        tplSection("tech-ship-hero", "hero", {
          headline: "Shipping &\nreturns",
          subheadline: "Clear timelines, Care+ claims, and COD notes.",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          minHeight: "300px",
          overlay: true,
          eyebrow: "Policies",
        }),
        tplSection("tech-ship-body", "rich-text", {
          title: "What to expect",
          content:
            "<p><strong>Standard delivery</strong> — 2–5 business days with tracking.</p><p><strong>Express</strong> — next-day in select cities when available.</p><p><strong>Returns</strong> — 30-day window on unused items in original packaging.</p><p><strong>Care+</strong> — warranty claims need order ID + serial number.</p><p><strong>COD</strong> — available where enabled at checkout.</p>",
          alignment: "left",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
        }),
        tplFooter("tech-ship-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "published",
      layout: tplLayout(
        tplSection("tech-contact-hero", "hero", {
          headline: "Contact",
          subheadline: "Sales and support in one calm place.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: false,
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          minHeight: "36vh",
          overlay: true,
          eyebrow: "Hello",
          padding: "0",
        }),
        tplSection("tech-contact-form", "contact-form", {
          title: "Message us",
          description: "We reply within one business day — sales, Care+, and order help.",
          buttonText: "Send message",
          showPhone: true,
          layout: "split",
          detailEmail: "support@yourstore.com",
          detailPhone: "+212 5XX XXX XXX",
          detailHours: "Mon–Fri · 9am–6pm",
          backgroundColor: "#ffffff",
          padding: "4rem 2rem 5rem",
        }),
        tplFooter("tech-contact-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      status: "published",
      layout: tplLayout(
        tplSection("tech-privacy-hero", "hero", {
          headline: "Privacy",
          subheadline: "How we collect and protect your information.",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          minHeight: "240px",
          overlay: true,
          eyebrow: "Legal",
        }),
        tplSection("tech-privacy-body", "rich-text", {
          title: "Your data",
          content:
            "<p><strong>What we collect</strong> — name, email, phone, and shipping details at checkout.</p><p><strong>How we use it</strong> — to fulfil orders, provide support, and send updates you opt into.</p><p><strong>Sharing</strong> — we do not sell personal data. Payments are handled by secure partners.</p>",
          alignment: "left",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
        }),
        tplFooter("tech-privacy-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "terms",
      title: "Terms of Service",
      status: "published",
      layout: tplLayout(
        tplSection("tech-terms-hero", "hero", {
          headline: "Terms",
          subheadline: "The terms that govern purchases from this store.",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          minHeight: "240px",
          overlay: true,
          eyebrow: "Legal",
        }),
        tplSection("tech-terms-body", "rich-text", {
          title: "Agreement",
          content:
            "<p><strong>Orders</strong> — placing an order accepts these terms. Prices are shown in your store currency at checkout.</p><p><strong>Stock</strong> — we may limit quantities or cancel orders affected by listing errors.</p><p><strong>Delivery</strong> — risk passes on delivery to the address provided.</p>",
          alignment: "left",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
        }),
        tplFooter("tech-terms-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "collections",
      title: "Collections",
      status: "published",
      layout: tplLayout(
        tplSection("tech-collections-hero", "hero", {
          headline: "Collections",
          accentHeadline: "Shop by setup",
          subheadline: "Audio, wearables, and desk essentials — grouped for how you work and play.",
          ctaText: "Shop all",
          ctaLink: "/products",
          alignment: "left",
          showStoreDescription: false,
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          minHeight: "360px",
          overlay: true,
          eyebrow: "Catalog",
          imageUrl: TECH_CIRCUIT,
        }),
        tplSection("tech-collections-grid", "featured-collections", {
          title: "All collections",
          collectionSource: "all",
          limit: 12,
          backgroundColor: "#ffffff",
          padding: "3rem 2rem 4rem",
        }),
        tplFooter("tech-collections-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "products",
      title: "Products",
      status: "published",
      layout: tplLayout(
        tplSection("tech-products-hero", "hero", {
          headline: "Full catalog",
          accentHeadline: "Every device",
          subheadline: "Premier kits, staff picks, and Care+-ready hardware.",
          ctaText: "Browse collections",
          ctaLink: "/collections",
          imageUrl: TECH_HERO,
          alignment: "left",
          showStoreDescription: false,
          layout: "split",
          backgroundColor: "#f8fafc",
          textColor: "#0f172a",
          borderRadius: "32px",
          eyebrow: "Shop",
          minHeight: "320px",
        }),
        tplSection("tech-products-grid", "product-grid", {
          title: "",
          subtitle: "",
          productSource: "latest",
          limit: 48,
          showViewAll: false,
          layout: "grid",
          backgroundColor: "#ffffff",
          padding: "1.5rem 2rem 4rem",
        }),
        tplFooter("tech-products-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
  ],
  navigation: [
    tplNav("nav-tech-home", "Home", "/"),
    tplNav("nav-tech-shop", "Shop", "/products", [
      tplNav("nav-tech-shop-all", "All products", "/products"),
      tplNav("nav-tech-shop-collections", "Collections", "/collections"),
      tplNav("nav-tech-shop-deals", "Deals", "/deals"),
    ]),
    tplNav("nav-tech-deals", "Deals", "/deals"),
    tplNav("nav-tech-about", "About", "/about"),
    tplNav("nav-tech-support", "Support", "/support"),
  ],
  productLayout: tplLayout(
    tplSection("tech-pdp-gallery", "product-gallery", {
      showThumbnails: true,
      backgroundColor: "#f8fafc",
      padding: "2rem",
    }),
    tplSection("tech-pdp-info", "product-info", {
      showDescription: true,
      padding: "1rem 2rem",
    }),
    tplSection("tech-pdp-price", "product-price", { padding: "0.5rem 2rem" }),
    tplSection("tech-pdp-variants", "product-variants", { padding: "0.5rem 2rem" }),
    tplSection("tech-pdp-buy", "product-buy-button", {
      buttonText: "Add to cart",
      padding: "1rem 2rem 1rem",
    }),
    tplSection("tech-pdp-trust", "rich-text", {
      title: "",
      layout: "strip",
      content:
        "<p><strong>Insured shipping</strong> · <strong>Care+</strong> on eligible devices · <strong>30-day</strong> trial · <strong>COD</strong> available</p>",
      alignment: "center",
      backgroundColor: "#f8fafc",
      textColor: "#64748b",
      padding: "1.25rem 2rem",
    }),
    tplSection("tech-pdp-faq", "product-faq", {
      title: "Specs & support",
      content:
        "<p><strong>Warranty</strong> — Care+ covers eligible devices for 2 years.</p><p><strong>Shipping</strong> — dispatch in 1–2 business days with tracking.</p><p><strong>Returns</strong> — 30 days unused in original packaging.</p>",
      padding: "2rem 2rem 2rem",
      backgroundColor: "#ffffff",
    }),
    tplSection("tech-pdp-reviews", "product-reviews", {
      title: "Verified reviews",
      padding: "2rem 2rem",
      backgroundColor: "#ffffff",
    }),
    tplSection("tech-pdp-related", "product-related", {
      title: "Complete the setup",
      limit: 4,
      padding: "2rem 2rem 2rem",
      backgroundColor: "#f8fafc",
    }),
    tplSection("tech-pdp-recent", "product-recently-viewed", {
      title: "Recently viewed",
      limit: 4,
      padding: "0 2rem 3rem",
      backgroundColor: "#ffffff",
    }),
    tplFooter("tech-pdp-footer", FOOTER, FOOTER_EXTRAS)
  ),
  collectionLayout: tplLayout(
    tplSection("tech-col-banner", "collection-page-banner", {
      padding: "0",
      layout: "contained",
      minHeight: "280px",
      showBreadcrumb: true,
      showTitle: true,
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
    }),
    tplSection("tech-col-desc", "collection-description", {
      padding: "0",
      layout: "centered",
      showTitle: false,
      showDescription: true,
      backgroundColor: "#ffffff",
    }),
    tplSection("tech-col-filters", "collection-filters", {
      title: "Browse",
      layout: "chips",
      padding: "0",
      backgroundColor: "#ffffff",
    }),
    tplSection("tech-col-grid", "collection-product-grid", {
      columns: 3,
      density: "comfortable",
      layout: "grid",
      padding: "0",
      backgroundColor: "#ffffff",
    }),
    tplSection("tech-col-pages", "collection-pagination", {
      pageSize: 12,
      layout: "numbered",
      padding: "0",
      backgroundColor: "#ffffff",
    }),
    tplSection("tech-col-newsletter", "collection-newsletter", {
      title: "Private releases",
      description: "Priority drops and restocks — no spam.",
      buttonText: "Join",
      layout: "strip",
      padding: "0",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
    }),
    tplFooter("tech-col-footer", FOOTER, FOOTER_EXTRAS)
  ),
  blogPostLayout: tplLayout(
    tplSection("tech-post-hero", "hero", {
      headline: "Lab note",
      accentHeadline: "Guides & reviews",
      subheadline: "Honest setup notes from TechNova Labs.",
      alignment: "left",
      showStoreDescription: false,
      showBrand: false,
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      minHeight: "58vh",
      overlay: true,
      padding: "0",
      eyebrow: "Journal",
      imageUrl: TECH_CIRCUIT,
    }),
    tplSection("tech-post-body", "rich-text", {
      title: "",
      content: "<p>Your published article appears here.</p>",
      alignment: "left",
      backgroundColor: "#ffffff",
      padding: "3.5rem 2rem 2rem",
    }),
    tplSection("tech-post-cta", "cta", {
      title: "Shop devices from this note",
      subtitle: "Browse the full catalog while stocks last.",
      buttonText: "Shop now",
      buttonLink: "/products",
      layout: "banner",
      alignment: "center",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
      padding: "3.5rem 2rem",
    }),
    tplSection("tech-post-newsletter", "rich-text", {
      title: "Lab dispatch",
      layout: "newsletter",
      content: "<p><strong>TechNova notes</strong></p><p>New guides and restocks — no spam.</p>",
      alignment: "center",
      backgroundColor: "#0f172a",
      textColor: "#e2e8f0",
      padding: "5rem 2rem",
    }),
    tplFooter("tech-post-footer", FOOTER, FOOTER_EXTRAS)
  ),
};
