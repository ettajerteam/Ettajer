import type { WebsiteTemplateDefinition } from "../types";
import { tplFooter, tplLayout, tplNav, tplSection } from "../helpers";

const PAPER_HERO =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80";
const PAPER_EDITORIAL =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80";
const PAPER_ABOUT =
  "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1400&q=80";

const FOOTER = { backgroundColor: "#171717", textColor: "#a8a29e" } as const;
const FOOTER_EXTRAS = {
  tagline: "Curated essentials for modern living — thoughtful design, everyday quality.",
  showNav: true,
  showClientCare: true,
  showLegal: true,
  showPoweredBy: true,
};

/** Paper — minimal curated essentials storefront for any product type */
export const paperTemplate: WebsiteTemplateDefinition = {
  id: "paper",
  name: "Paper",
  description:
    "Clean minimal storefront — editorial heroes, real features/FAQ/contact, published policies, nested shop nav, and COD-ready pages for any product type.",
  tagline: "Curated essentials for modern living",
  industry: "General Retail",
  thumbnail: "linear-gradient(135deg, #fafafa 0%, #e7e5e4 40%, #171717 100%)",
  businessModels: ["physical", "digital", "dropshipping"],
  recommendedCategories: ["fashion", "home", "beauty", "handmade", "other"],
  theme: {
    theme: "minimal",
    primaryColor: "#171717",
    secondaryColor: "#f5f5f4",
    font: "Outfit",
  },
  branding: {
    tagline: "Curated essentials for modern living. Discover pieces chosen with care.",
    storeNameStyle: "minimal",
  },
  pages: [
    {
      slug: "home",
      title: "Home",
      layout: tplLayout(
        tplSection("paper-hero", "hero", {
          headline: "Essentials, edited",
          subheadline: "Thoughtful design for everyday living.",
          ctaText: "Shop all",
          ctaLink: "/products",
          secondaryCtaText: "Collections",
          secondaryCtaLink: "/collections",
          imageUrl: PAPER_HERO,
          imageAlt: "Curated product on a clean editorial panel",
          alignment: "center",
          showStoreDescription: false,
          showBrand: true,
          overlay: true,
          backgroundColor: "#171717",
          textColor: "#fafafa",
          padding: "0",
          minHeight: "100svh",
          animation: "fade",
        }),
        tplSection("paper-trust", "rich-text", {
          title: "",
          layout: "strip",
          content:
            "<p><strong>Free shipping</strong> · <strong>30-day</strong> returns · <strong>COD available</strong></p>",
          alignment: "center",
          backgroundColor: "#171717",
          textColor: "#a8a29e",
          padding: "0",
        }),
        tplSection("paper-featured", "product-grid", {
          title: "Featured",
          subtitle: "A short edit of pieces worth starting with.",
          productSource: "latest",
          limit: 8,
          showViewAll: true,
          backgroundColor: "#ffffff",
          padding: "5.5rem 2rem",
          animation: "slide-up",
        }),
        tplSection("paper-categories", "featured-collections", {
          title: "Shop by category",
          collectionSource: "featured",
          limit: 6,
          backgroundColor: "#f5f5f4",
          padding: "4rem 2rem",
          animation: "slide-up",
        }),
        tplSection("paper-editorial", "hero", {
          headline: "Designed to last",
          subheadline:
            "Thoughtful materials and timeless silhouettes — pieces you'll reach for season after season.",
          ctaText: "Explore collections",
          ctaLink: "/collections",
          imageUrl: PAPER_EDITORIAL,
          imageAlt: "Editorial lifestyle collection",
          alignment: "left",
          showStoreDescription: false,
          layout: "editorial",
          backgroundColor: "#ffffff",
          textColor: "#171717",
        }),
        tplSection("paper-features", "features", {
          title: "Why shop with us",
          items: [
            {
              title: "Curated quality",
              body: "Every product is selected for craftsmanship and longevity — not trend-chasing.",
              icon: "◇",
            },
            {
              title: "Fast fulfillment",
              body: "Orders ship with tracking from checkout to delivery.",
              icon: "⇢",
            },
            {
              title: "Easy returns",
              body: "Hassle-free returns within 30 days. We stand behind what we sell.",
              icon: "↺",
            },
          ],
          backgroundColor: "#f5f5f4",
          textColor: "#171717",
          padding: "4rem 2rem",
        }),
        tplSection("paper-story", "rich-text", {
          title: "Crafted with care",
          layout: "intro",
          content:
            "<p><em>Thoughtful design and everyday quality — pieces you'll reach for again and again.</em></p>",
          alignment: "center",
          backgroundColor: "#171717",
          textColor: "#fafafa",
          padding: "5rem 2rem 2rem",
          animation: "fade",
        }),
        tplSection("paper-new", "product-grid", {
          title: "New arrivals",
          subtitle: "Fresh finds for the season.",
          productSource: "latest",
          limit: 4,
          offset: 8,
          showViewAll: true,
          backgroundColor: "#ffffff",
          padding: "4rem 2rem",
        }),
        tplSection("paper-reviews", "testimonials", {
          title: "What customers say",
          items: [
            {
              quote: "Simple checkout, fast delivery, and the product matched the photos.",
              author: "Nadia R.",
              role: "Tangier",
            },
            {
              quote: "Returns were easy when I needed a different size. Will order again.",
              author: "Karim H.",
              role: "Fes",
            },
            {
              quote: "Feels like a real boutique — not a noisy marketplace.",
              author: "Lina A.",
              role: "Agadir",
            },
          ],
          backgroundColor: "#f5f5f4",
          padding: "4rem 2rem",
        }),
        tplSection("paper-faq", "faq", {
          title: "Quick answers",
          items: [
            {
              question: "Do you offer cash on delivery?",
              answer: "Yes — COD is available where enabled at checkout.",
            },
            {
              question: "How long is delivery?",
              answer: "Most orders arrive in 2–5 business days with tracking.",
            },
            {
              question: "What is your return window?",
              answer: "30 days on unused items. Reply to your order email to start a return.",
            },
          ],
          backgroundColor: "#ffffff",
          padding: "3rem 2rem",
        }),
        tplSection("paper-cta", "cta", {
          title: "Start your edit",
          subtitle: "Browse the full catalog or shop by collection.",
          buttonText: "Shop all",
          buttonLink: "/products",
          alignment: "center",
          backgroundColor: "#171717",
          textColor: "#fafafa",
          padding: "4rem 2rem",
        }),
        tplSection("paper-newsletter", "rich-text", {
          title: "Stay in the loop",
          layout: "newsletter",
          content:
            "<p><strong>Store notes</strong></p><p>New arrivals and restocks — quiet updates, no spam.</p>",
          alignment: "center",
          backgroundColor: "#f5f5f4",
          textColor: "#171717",
          padding: "4.5rem 2rem",
        }),
        tplFooter("paper-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "about",
      title: "About",
      status: "published",
      layout: tplLayout(
        tplSection("paper-about-hero", "hero", {
          headline: "Our story",
          subheadline:
            "Thoughtful design and everyday quality — a curated shop for modern living.",
          ctaText: "Shop the edit",
          ctaLink: "/products",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          overlay: true,
          imageUrl: PAPER_ABOUT,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          minHeight: "78vh",
          padding: "0",
        }),
        tplSection("paper-about-intro", "rich-text", {
          title: "The idea",
          layout: "intro",
          content:
            "<p><em>We bring together pieces that earn their place — well made, quietly priced, and meant for daily life.</em></p>",
          alignment: "center",
          backgroundColor: "#ffffff",
          padding: "5rem 2rem 2rem",
        }),
        tplSection("paper-about-body", "rich-text", {
          title: "How we curate",
          content:
            "<p>Every piece is chosen for craftsmanship, materials, and how it fits into daily life. We partner with makers who share our standard for longevity — not seasonal noise.</p><p>What you see in the catalog is what we would keep ourselves.</p>",
          alignment: "left",
          padding: "2rem 2rem 4rem",
          backgroundColor: "#ffffff",
        }),
        tplSection("paper-about-image", "image", {
          imageUrl: PAPER_EDITORIAL,
          alt: "Curated interiors and materials",
          caption: "Material first — then the silhouette.",
          layout: "cinematic",
          backgroundColor: "#171717",
          padding: "0",
        }),
        tplSection("paper-about-stats", "rich-text", {
          title: "",
          layout: "stats",
          content:
            "<p><strong>30d</strong> Easy returns</p><p><strong>2–5d</strong> Typical delivery</p><p><strong>COD</strong> At checkout</p>",
          alignment: "center",
          backgroundColor: "#f5f5f4",
          padding: "4.5rem 2rem",
        }),
        tplSection("paper-about-cta", "cta", {
          title: "Browse the catalog",
          subtitle: "Quiet essentials, ready when you are.",
          buttonText: "Shop all",
          buttonLink: "/products",
          layout: "banner",
          alignment: "center",
          backgroundColor: "#171717",
          textColor: "#fafafa",
          padding: "4.5rem 2rem",
        }),
        tplFooter("paper-about-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "shipping",
      title: "Shipping & returns",
      status: "published",
      layout: tplLayout(
        tplSection("paper-ship-hero", "hero", {
          headline: "Shipping & returns",
          subheadline: "Clear policies so checkout feels confident — COD-friendly and trackable.",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#171717",
          textColor: "#fafafa",
          minHeight: "260px",
          overlay: true,
          eyebrow: "Policies",
        }),
        tplSection("paper-ship-body", "rich-text", {
          title: "What to expect",
          content:
            "<p><strong>Free shipping</strong> on qualifying orders (threshold set in your store settings).</p><p><strong>30-day returns</strong> — hassle-free if something isn’t right.</p><p>Tracking links arrive in your confirmation email. For COD orders, keep your phone available at delivery.</p>",
          alignment: "left",
          padding: "4rem 2rem 2rem",
          backgroundColor: "#ffffff",
        }),
        tplSection("paper-ship-faq", "faq", {
          title: "Shipping FAQ",
          items: [
            {
              question: "Can I change my address after ordering?",
              answer: "Yes — contact us quickly with your order number before dispatch.",
            },
            {
              question: "Do you ship nationwide?",
              answer: "We deliver across Morocco. International options depend on your courier setup.",
            },
          ],
          backgroundColor: "#f5f5f4",
          padding: "2rem 2rem 4rem",
        }),
        tplFooter("paper-ship-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "contact",
      title: "Contact",
      status: "published",
      layout: tplLayout(
        tplSection("paper-contact-hero", "hero", {
          headline: "Get in touch",
          subheadline: "Orders, returns, and product questions — we’re here to help.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: false,
          overlay: true,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          minHeight: "36vh",
          eyebrow: "Support",
          padding: "0",
        }),
        tplSection("paper-contact-form", "contact-form", {
          title: "Send a message",
          description: "We reply within one business day.",
          buttonText: "Send message",
          showPhone: true,
          layout: "split",
          detailEmail: "hello@yourstore.com",
          detailHours: "Mon–Fri · 9am–6pm",
          detailAddress: "Reply to your order confirmation for the fastest help with tracking.",
          backgroundColor: "#ffffff",
          padding: "4rem 2rem 5rem",
        }),
        tplFooter("paper-contact-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      status: "published",
      layout: tplLayout(
        tplSection("paper-privacy-hero", "hero", {
          headline: "Privacy",
          subheadline: "How we collect and protect your information.",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#171717",
          textColor: "#fafafa",
          minHeight: "220px",
          overlay: true,
          eyebrow: "Legal",
        }),
        tplSection("paper-privacy-body", "rich-text", {
          title: "Your privacy",
          content:
            "<p><strong>Information we collect</strong> — name, email, phone, and shipping address at checkout.</p><p><strong>How we use it</strong> — to fulfil orders and support you.</p><p><strong>Sharing</strong> — we do not sell personal data.</p>",
          alignment: "left",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
        }),
        tplFooter("paper-privacy-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "terms",
      title: "Terms of Service",
      status: "published",
      layout: tplLayout(
        tplSection("paper-terms-hero", "hero", {
          headline: "Terms",
          subheadline: "The terms that govern purchases from this store.",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#171717",
          textColor: "#fafafa",
          minHeight: "220px",
          overlay: true,
          eyebrow: "Legal",
        }),
        tplSection("paper-terms-body", "rich-text", {
          title: "Agreement",
          content:
            "<p><strong>Orders</strong> — by placing an order you agree to these terms.</p><p><strong>Prices</strong> — shown in your store currency at checkout.</p><p><strong>Delivery</strong> — risk of loss passes on delivery to the address provided.</p>",
          alignment: "left",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
        }),
        tplFooter("paper-terms-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "collections",
      title: "Collections",
      status: "published",
      layout: tplLayout(
        tplSection("paper-collections-hero", "hero", {
          headline: "Collections",
          subheadline: "Shop by category — curated groups for how you live.",
          ctaText: "Shop all products",
          ctaLink: "/products",
          alignment: "left",
          showStoreDescription: false,
          layout: "editorial",
          eyebrow: "Catalog",
          imageUrl: PAPER_EDITORIAL,
          backgroundColor: "#ffffff",
          textColor: "#171717",
        }),
        tplSection("paper-collections-grid", "featured-collections", {
          title: "All collections",
          collectionSource: "all",
          limit: 12,
          backgroundColor: "#f5f5f4",
          padding: "3rem 2rem 4rem",
        }),
        tplFooter("paper-collections-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "search",
      title: "Search",
      status: "published",
      layout: tplLayout(
        tplSection("paper-search-hero", "hero", {
          headline: "Search",
          subheadline: "Find a product by name or keyword.",
          alignment: "center",
          showStoreDescription: false,
          backgroundColor: "#171717",
          textColor: "#fafafa",
          minHeight: "240px",
          overlay: true,
          eyebrow: "Catalog",
        }),
        tplSection("paper-search-bar", "search", {
          title: "Find a piece",
          placeholder: "Search products…",
          buttonText: "Search",
          backgroundColor: "#ffffff",
          padding: "3rem 2rem 1rem",
        }),
        tplSection("paper-search-browse", "product-grid", {
          title: "Or browse",
          productSource: "latest",
          limit: 8,
          showViewAll: true,
          backgroundColor: "#ffffff",
          padding: "2rem 2rem 4rem",
        }),
        tplFooter("paper-search-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
    {
      slug: "products",
      title: "Products",
      status: "published",
      layout: tplLayout(
        tplSection("paper-products-hero", "hero", {
          headline: "All pieces",
          subheadline: "The full catalog — curated essentials for modern living.",
          ctaText: "Browse collections",
          ctaLink: "/collections",
          alignment: "left",
          showStoreDescription: false,
          layout: "editorial",
          eyebrow: "Full catalog",
          imageUrl: PAPER_HERO,
          backgroundColor: "#ffffff",
          textColor: "#171717",
          minHeight: "42vh",
        }),
        tplSection("paper-products-grid", "product-grid", {
          title: "",
          subtitle: "",
          productSource: "latest",
          limit: 48,
          showViewAll: false,
          layout: "grid",
          backgroundColor: "#ffffff",
          padding: "1rem 2rem 4rem",
        }),
        tplFooter("paper-products-footer", FOOTER, FOOTER_EXTRAS)
      ),
    },
  ],
  navigation: [
    tplNav("nav-paper-home", "Home", "/"),
    tplNav("nav-paper-shop", "Shop", "/products", [
      tplNav("nav-paper-shop-all", "All products", "/products"),
      tplNav("nav-paper-shop-collections", "Collections", "/collections"),
    ]),
    tplNav("nav-paper-collections", "Collections", "/collections"),
    tplNav("nav-paper-about", "About", "/about"),
    tplNav("nav-paper-contact", "Contact", "/contact"),
  ],
  productLayout: tplLayout(
    tplSection("paper-pdp-gallery", "product-gallery", {
      showThumbnails: true,
      backgroundColor: "#f5f5f4",
      padding: "2rem",
    }),
    tplSection("paper-pdp-info", "product-info", {
      showDescription: true,
      padding: "1rem 2rem",
    }),
    tplSection("paper-pdp-price", "product-price", { padding: "0.5rem 2rem" }),
    tplSection("paper-pdp-variants", "product-variants", { padding: "0.5rem 2rem" }),
    tplSection("paper-pdp-buy", "product-buy-button", {
      buttonText: "Add to cart",
      padding: "1rem 2rem 1rem",
    }),
    tplSection("paper-pdp-trust", "rich-text", {
      title: "",
      layout: "strip",
      content:
        "<p><strong>Free shipping</strong> on qualifying orders · <strong>30-day</strong> returns · <strong>COD</strong> available</p>",
      alignment: "center",
      backgroundColor: "#f5f5f4",
      textColor: "#78716c",
      padding: "1.25rem 2rem",
    }),
    tplSection("paper-pdp-faq", "product-faq", {
      title: "Details & care",
      content:
        "<p><strong>Shipping</strong> — tracked delivery in 2–5 business days.</p><p><strong>Returns</strong> — 30 days on unused items.</p><p><strong>Support</strong> — reply to your order email for the fastest help.</p>",
      padding: "2rem 2rem",
      backgroundColor: "#ffffff",
    }),
    tplSection("paper-pdp-reviews", "product-reviews", {
      title: "Reviews",
      padding: "2rem 2rem",
      backgroundColor: "#ffffff",
    }),
    tplSection("paper-pdp-related", "product-related", {
      title: "You may also like",
      limit: 4,
      padding: "2rem 2rem 2rem",
      backgroundColor: "#f5f5f4",
    }),
    tplSection("paper-pdp-recent", "product-recently-viewed", {
      title: "Recently viewed",
      limit: 4,
      padding: "0 2rem 3rem",
      backgroundColor: "#ffffff",
    }),
    tplFooter("paper-pdp-footer", FOOTER, FOOTER_EXTRAS)
  ),
  collectionLayout: tplLayout(
    tplSection("paper-col-banner", "collection-page-banner", {
      padding: "0",
      layout: "hero",
      minHeight: "38vh",
      showBreadcrumb: true,
      showTitle: true,
      backgroundColor: "#171717",
      textColor: "#fafafa",
    }),
    tplSection("paper-col-desc", "collection-description", {
      padding: "0",
      layout: "centered",
      showTitle: false,
      showDescription: true,
      backgroundColor: "#ffffff",
    }),
    tplSection("paper-col-filters", "collection-filters", {
      title: "Browse",
      layout: "minimal",
      padding: "0",
      backgroundColor: "#ffffff",
    }),
    tplSection("paper-col-grid", "collection-product-grid", {
      columns: 3,
      density: "comfortable",
      layout: "grid",
      padding: "0",
      backgroundColor: "#ffffff",
    }),
    tplSection("paper-col-pages", "collection-pagination", {
      pageSize: 12,
      layout: "simple",
      padding: "0",
      backgroundColor: "#ffffff",
    }),
    tplSection("paper-col-newsletter", "collection-newsletter", {
      title: "Stay in the loop",
      description: "New arrivals and restocks — no spam.",
      buttonText: "Join",
      layout: "strip",
      padding: "0",
      backgroundColor: "#171717",
      textColor: "#fafafa",
    }),
    tplFooter("paper-col-footer", FOOTER, FOOTER_EXTRAS)
  ),
  blogPostLayout: tplLayout(
    tplSection("paper-post-hero", "hero", {
      headline: "Journal note",
      subheadline: "Notes from the shop — quiet stories and product guides.",
      alignment: "left",
      showStoreDescription: false,
      showBrand: false,
      layout: "editorial",
      eyebrow: "Journal",
      imageUrl: PAPER_ABOUT,
      minHeight: "58vh",
      overlay: true,
      padding: "0",
      backgroundColor: "#171717",
      textColor: "#ffffff",
    }),
    tplSection("paper-post-body", "rich-text", {
      title: "",
      content: "<p>Your published article appears here.</p>",
      alignment: "left",
      backgroundColor: "#ffffff",
      padding: "3.5rem 2rem 2rem",
    }),
    tplSection("paper-post-cta", "cta", {
      title: "Shop the pieces",
      subtitle: "Browse the catalog from this note.",
      buttonText: "Shop all",
      buttonLink: "/products",
      layout: "banner",
      alignment: "center",
      backgroundColor: "#f5f5f4",
      textColor: "#171717",
      padding: "3.5rem 2rem",
    }),
    tplSection("paper-post-newsletter", "rich-text", {
      title: "Stay close",
      layout: "newsletter",
      content: "<p><strong>Shop notes</strong></p><p>New stories when they matter — nothing noisy.</p>",
      alignment: "center",
      backgroundColor: "#171717",
      textColor: "#e5e5e5",
      padding: "5rem 2rem",
    }),
    tplFooter("paper-post-footer", FOOTER, FOOTER_EXTRAS)
  ),
};
