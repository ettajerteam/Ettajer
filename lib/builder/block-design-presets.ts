import type { BlockId } from "@/lib/builder/types";

export type BlockDesignThumbKind =
  | "hero-stack"
  | "hero-split"
  | "hero-editorial"
  | "hero-overlay"
  | "hero-minimal"
  | "gallery-grid"
  | "gallery-masonry"
  | "gallery-carousel"
  | "gallery-dense"
  | "image-contained"
  | "image-editorial"
  | "image-cinematic"
  | "text-default"
  | "text-intro"
  | "text-strip"
  | "text-quotes"
  | "text-newsletter"
  | "text-stats"
  | "cta-dark"
  | "cta-light"
  | "cta-accent"
  | "cta-split"
  | "features-grid"
  | "features-compact"
  | "features-row"
  | "testimonials"
  | "testimonials-spotlight"
  | "testimonials-carousel"
  | "testimonials-minimal"
  | "faq"
  | "faq-columns"
  | "faq-stacked"
  | "products-grid"
  | "products-featured"
  | "products-carousel"
  | "products-list"
  | "products-dense"
  | "products-spotlight"
  | "products-compact"
  | "products-large"
  | "collections"
  | "collections-carousel"
  | "collections-editorial"
  | "collections-mosaic"
  | "collections-list"
  | "video"
  | "contact"
  | "countdown"
  | "logo-wall"
  | "spacer"
  | "divider"
  | "columns"
  | "columns-cards"
  | "columns-media"
  | "columns-cta"
  | "search"
  | "embed"
  | "footer"
  | "product-card"
  | "pdp-gallery-stack"
  | "pdp-gallery-side"
  | "pdp-gallery-carousel"
  | "pdp-info"
  | "pdp-price"
  | "pdp-variants"
  | "pdp-buy"
  | "pdp-reviews"
  | "pdp-faq"
  | "pdp-related"
  | "collection-banner-hero"
  | "collection-banner-split"
  | "collection-banner-minimal"
  | "collection-desc"
  | "collection-filters"
  | "collection-grid"
  | "collection-newsletter"
  | "collection-pagination"
  | "generic";

export interface BlockDesignPreset {
  id: string;
  blockId: BlockId;
  name: string;
  description: string;
  /** Merged into createSectionFromBlock(blockId, { settings }) */
  settings: Record<string, unknown>;
  thumb: BlockDesignThumbKind;
  /** Real product photos for visual demos in the design picker */
  previewImages?: string[];
}

const GALLERY_SAMPLE_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    alt: "Gallery image 1",
  },
  {
    url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
    alt: "Gallery image 2",
  },
  {
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    alt: "Gallery image 3",
  },
  {
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    alt: "Gallery image 4",
  },
];

const SAMPLE_HERO_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80";

const SAMPLE_HERO_IMAGE_2 =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80";

const SAMPLE_HERO_IMAGE_3 =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80";

const SAMPLE_COLLECTION_IMAGES = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
];

const COUNTDOWN_END = "2099-12-31T23:59:00";

export const BLOCK_DESIGN_PRESETS: BlockDesignPreset[] = [
  // —— Hero ——
  {
    id: "hero-stack",
    blockId: "hero",
    name: "Stack",
    description: "Image above headline and buttons",
    thumb: "hero-stack",
    settings: {
      layout: "stack",
      overlay: false,
      headline: "New season essentials",
      subheadline: "Shop the looks your customers love.",
      ctaText: "Shop now",
      ctaLink: "/products",
      imageUrl: SAMPLE_HERO_IMAGE,
      showStoreDescription: false,
    },
  },
  {
    id: "hero-split",
    blockId: "hero",
    name: "Split",
    description: "Side-by-side image and copy",
    thumb: "hero-split",
    settings: {
      layout: "split",
      overlay: false,
      headline: "Designed for everyday",
      subheadline: "Discover pieces that feel as good as they look.",
      ctaText: "Explore",
      ctaLink: "/products",
      imageUrl: SAMPLE_HERO_IMAGE,
      showStoreDescription: false,
    },
  },
  {
    id: "hero-editorial",
    blockId: "hero",
    name: "Editorial",
    description: "Magazine-style story layout",
    thumb: "hero-editorial",
    settings: {
      layout: "editorial",
      overlay: false,
      eyebrow: "Lookbook",
      headline: "Quiet luxury, loud details",
      accentHeadline: "SS collection",
      subheadline: "A refined edit for customers who notice the craft.",
      ctaText: "View collection",
      ctaLink: "/collections",
      imageUrl: SAMPLE_HERO_IMAGE,
      showStoreDescription: false,
    },
  },
  {
    id: "hero-overlay",
    blockId: "hero",
    name: "Overlay",
    description: "Full-bleed image with text on top",
    thumb: "hero-overlay",
    settings: {
      layout: "stack",
      overlay: true,
      headline: "Limited drop",
      subheadline: "Don’t miss the pieces selling out fast.",
      ctaText: "Shop the drop",
      ctaLink: "/products",
      imageUrl: SAMPLE_HERO_IMAGE,
      showStoreDescription: false,
    },
  },
  {
    id: "hero-minimal",
    blockId: "hero",
    name: "Minimal text",
    description: "Clean headline-first banner",
    thumb: "hero-minimal",
    settings: {
      layout: "stack",
      overlay: false,
      eyebrow: "Welcome",
      headline: "Your next favorite find",
      subheadline: "Curated pieces, delivered nationwide.",
      ctaText: "Browse products",
      ctaLink: "/products",
      secondaryCtaText: "Our story",
      secondaryCtaLink: "/pages/about",
      imageUrl: "",
      showStoreDescription: false,
    },
  },
  {
    id: "hero-sale",
    blockId: "hero",
    name: "Sale spotlight",
    description: "Bold promo with dual buttons",
    thumb: "hero-overlay",
    previewImages: [SAMPLE_HERO_IMAGE_2],
    settings: {
      layout: "stack",
      overlay: true,
      eyebrow: "Limited time",
      headline: "Up to 40% off",
      accentHeadline: "Season sale",
      subheadline: "Selected styles while stocks last.",
      ctaText: "Shop sale",
      ctaLink: "/products",
      secondaryCtaText: "View all",
      secondaryCtaLink: "/collections",
      imageUrl: SAMPLE_HERO_IMAGE_2,
      showStoreDescription: false,
    },
  },
  {
    id: "hero-split-lookbook",
    blockId: "hero",
    name: "Lookbook split",
    description: "Fashion-forward side-by-side",
    thumb: "hero-split",
    previewImages: [SAMPLE_HERO_IMAGE_3],
    settings: {
      layout: "split",
      overlay: false,
      eyebrow: "Lookbook",
      headline: "Wear it your way",
      subheadline: "Mix textures, tones, and silhouettes from the latest edit.",
      ctaText: "See the lookbook",
      ctaLink: "/collections",
      imageUrl: SAMPLE_HERO_IMAGE_3,
      showStoreDescription: false,
    },
  },

  // —— Gallery ——
  {
    id: "gallery-grid",
    blockId: "gallery",
    name: "Grid",
    description: "Clean equal image grid",
    thumb: "gallery-grid",
    settings: {
      title: "Gallery",
      layout: "grid",
      columns: 3,
      gap: "0.75rem",
      images: GALLERY_SAMPLE_IMAGES,
    },
  },
  {
    id: "gallery-masonry",
    blockId: "gallery",
    name: "Masonry",
    description: "Staggered heights for a lookbook feel",
    thumb: "gallery-masonry",
    settings: {
      title: "Lookbook",
      layout: "masonry",
      columns: 3,
      gap: "0.5rem",
      images: GALLERY_SAMPLE_IMAGES,
    },
  },
  {
    id: "gallery-carousel",
    blockId: "gallery",
    name: "Carousel",
    description: "Swipeable showcase strip",
    thumb: "gallery-carousel",
    settings: {
      title: "Highlights",
      layout: "carousel",
      columns: 3,
      gap: "1rem",
      images: GALLERY_SAMPLE_IMAGES,
    },
  },
  {
    id: "gallery-dense",
    blockId: "gallery",
    name: "Dense mosaic",
    description: "Tight 4-column photo wall",
    thumb: "gallery-dense",
    settings: {
      title: "In the shop",
      layout: "grid",
      columns: 4,
      gap: "0.35rem",
      images: [
        ...GALLERY_SAMPLE_IMAGES,
        {
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
          alt: "Gallery image 5",
        },
        {
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
          alt: "Gallery image 6",
        },
      ],
    },
  },
  {
    id: "gallery-duo",
    blockId: "gallery",
    name: "Statement duo",
    description: "Two large images side by side",
    thumb: "gallery-grid",
    settings: {
      title: "Featured moments",
      layout: "grid",
      columns: 2,
      gap: "1rem",
      images: GALLERY_SAMPLE_IMAGES.slice(0, 2),
    },
  },

  // —— Image ——
  {
    id: "image-contained",
    blockId: "image",
    name: "Contained",
    description: "Centered image with padding",
    thumb: "image-contained",
    settings: {
      layout: "contained",
      objectFit: "cover",
      imageUrl: SAMPLE_HERO_IMAGE,
      alt: "Featured image",
      caption: "",
    },
  },
  {
    id: "image-editorial",
    blockId: "image",
    name: "Editorial wide",
    description: "Wide story image",
    thumb: "image-editorial",
    settings: {
      layout: "editorial",
      objectFit: "cover",
      imageUrl: SAMPLE_HERO_IMAGE,
      alt: "Editorial image",
      caption: "A moment from the collection",
    },
  },
  {
    id: "image-cinematic",
    blockId: "image",
    name: "Cinematic",
    description: "Edge-to-edge full bleed",
    thumb: "image-cinematic",
    settings: {
      layout: "cinematic",
      objectFit: "cover",
      imageUrl: SAMPLE_HERO_IMAGE,
      alt: "Cinematic image",
      caption: "",
    },
  },
  {
    id: "image-portrait",
    blockId: "image",
    name: "Portrait focus",
    description: "Tall crop for product lifestyle",
    thumb: "image-contained",
    previewImages: [SAMPLE_HERO_IMAGE_3],
    settings: {
      layout: "contained",
      objectFit: "cover",
      imageUrl: SAMPLE_HERO_IMAGE_3,
      alt: "Portrait image",
      caption: "Styled in store",
    },
  },

  // —— Rich text ——
  {
    id: "rich-default",
    blockId: "rich-text",
    name: "Story",
    description: "Simple title and paragraph",
    thumb: "text-default",
    settings: {
      title: "Our story",
      content: "Tell customers what makes your brand different.",
      layout: "default",
      alignment: "center",
    },
  },
  {
    id: "rich-intro",
    blockId: "rich-text",
    name: "Intro manifesto",
    description: "Bold opening statement",
    thumb: "text-intro",
    settings: {
      title: "Made for people who care",
      content: "We build products that feel considered — from materials to packing.",
      layout: "intro",
      alignment: "left",
    },
  },
  {
    id: "rich-strip",
    blockId: "rich-text",
    name: "Strip",
    description: "Compact horizontal band",
    thumb: "text-strip",
    settings: {
      title: "Free shipping over 500 MAD",
      content: "Nationwide delivery on qualifying orders.",
      layout: "strip",
      alignment: "center",
    },
  },
  {
    id: "rich-testimonials",
    blockId: "rich-text",
    name: "Quotes look",
    description: "Testimonial-style rich text",
    thumb: "text-quotes",
    settings: {
      title: "Loved by customers",
      content:
        "<p><em>“Beautiful quality and arrived faster than expected.”</em></p><p>— Amira K., Casablanca</p>",
      layout: "testimonials",
      alignment: "center",
    },
  },
  {
    id: "rich-newsletter",
    blockId: "rich-text",
    name: "Newsletter",
    description: "Signup-oriented content block",
    thumb: "text-newsletter",
    settings: {
      title: "Join the list",
      content: "Get drops, offers, and styling tips first.",
      layout: "newsletter",
      alignment: "center",
    },
  },
  {
    id: "rich-stats",
    blockId: "rich-text",
    name: "Stats",
    description: "Numbers and proof points",
    thumb: "text-stats",
    settings: {
      title: "By the numbers",
      content:
        "<p><strong>2–5 days</strong> average delivery</p><p><strong>14-day</strong> easy returns</p><p><strong>4.9★</strong> customer rating</p>",
      layout: "stats",
      alignment: "center",
    },
  },
  {
    id: "rich-about",
    blockId: "rich-text",
    name: "About brand",
    description: "Editorial brand story column",
    thumb: "text-default",
    settings: {
      title: "How we work",
      content:
        "<p>Every piece starts with materials we trust and makers we know by name. We choose longevity over novelty — construction you can feel, finishes that hold up, and supply partners who share that standard.</p><p>From the first sample to the last stitch, the goal is simple: something you’ll reach for again.</p>",
      layout: "default",
      alignment: "left",
      padding: "2rem 2rem 4rem",
    },
  },
  {
    id: "rich-about-intro",
    blockId: "rich-text",
    name: "About manifesto",
    description: "Centered one-line brand idea",
    thumb: "text-default",
    settings: {
      title: "The idea",
      content:
        "<p><em>We exist for people who want less noise and more intention — things made carefully, priced fairly, and meant to stay.</em></p>",
      layout: "intro",
      alignment: "center",
      padding: "5rem 2rem 2rem",
    },
  },
  {
    id: "rich-announcement",
    blockId: "rich-text",
    name: "Announcement",
    description: "Short promo notice strip",
    thumb: "text-strip",
    settings: {
      title: "New: express delivery in major cities",
      content: "Order before 2pm for faster dispatch.",
      layout: "strip",
      alignment: "center",
    },
  },

  // —— CTA ——
  {
    id: "cta-dark",
    blockId: "cta",
    name: "Dark banner",
    description: "Centered high-contrast call to action",
    thumb: "cta-dark",
    settings: {
      title: "Ready to shop?",
      subtitle: "Browse the latest arrivals and exclusive drops.",
      buttonText: "Shop now",
      buttonLink: "/products",
      layout: "banner",
      alignment: "center",
      backgroundColor: "#0a0a0a",
      textColor: "#ffffff",
      padding: "4rem 1.5rem",
    },
  },
  {
    id: "cta-light",
    blockId: "cta",
    name: "Soft light",
    description: "Calm contained card CTA",
    thumb: "cta-light",
    settings: {
      title: "Need help choosing?",
      subtitle: "Message us — we’re happy to recommend the right piece.",
      buttonText: "Contact us",
      buttonLink: "/pages/contact",
      layout: "card",
      alignment: "center",
      backgroundColor: "#f5f5f5",
      textColor: "#171717",
      padding: "2rem 1.5rem",
    },
  },
  {
    id: "cta-accent",
    blockId: "cta",
    name: "Accent fill",
    description: "Bold accent banner with dual buttons",
    thumb: "cta-accent",
    settings: {
      title: "Members get early access",
      subtitle: "Join the list for launches and private offers.",
      buttonText: "Join now",
      buttonLink: "/products",
      secondaryButtonText: "Browse products",
      secondaryButtonLink: "/products",
      layout: "banner",
      alignment: "center",
      backgroundColor: "#007AFF",
      textColor: "#ffffff",
      padding: "3.5rem 1.5rem",
    },
  },
  {
    id: "cta-warm",
    blockId: "cta",
    name: "Warm strip",
    description: "Compact horizontal trust bar",
    thumb: "cta-light",
    settings: {
      title: "Visit the full catalog",
      subtitle: "Hundreds of styles ready to ship.",
      buttonText: "Explore products",
      buttonLink: "/products",
      layout: "strip",
      alignment: "left",
      backgroundColor: "#faf6f1",
      textColor: "#1c1917",
      padding: "1.25rem 1.5rem",
    },
  },
  {
    id: "cta-left",
    blockId: "cta",
    name: "Split actions",
    description: "Copy on the left, buttons on the right",
    thumb: "cta-split",
    settings: {
      title: "Start your order today",
      subtitle: "Cash on delivery available on eligible products.",
      buttonText: "Shop bestsellers",
      buttonLink: "/products",
      secondaryButtonText: "View all",
      secondaryButtonLink: "/products",
      layout: "split",
      alignment: "left",
      backgroundColor: "#111827",
      textColor: "#f9fafb",
      padding: "3.5rem 2rem",
    },
  },
  {
    id: "cta-stacked",
    blockId: "cta",
    name: "Large stacked",
    description: "Big headline with full-width energy",
    thumb: "cta-dark",
    settings: {
      title: "Your next favorite find",
      subtitle: "New arrivals every week — delivered nationwide.",
      buttonText: "Shop new arrivals",
      buttonLink: "/products",
      layout: "stacked",
      alignment: "center",
      backgroundColor: "#0a0a0a",
      textColor: "#ffffff",
      padding: "5rem 1.5rem",
    },
  },

  // —— Features ——
  {
    id: "features-grid",
    blockId: "features",
    name: "Three pillars",
    description: "Classic three benefit cards",
    thumb: "features-grid",
    settings: {
      title: "Why shop with us",
      subtitle: "Everything you need for a smooth order",
      layout: "cards",
      cardStyle: "bordered",
      columns: 3,
      alignment: "center",
      showIcons: true,
      items: [
        { title: "Fast shipping", body: "Delivered across Morocco in 2–5 days.", icon: "🚚" },
        { title: "Secure checkout", body: "COD and card payments you can trust.", icon: "🔒" },
        { title: "Easy returns", body: "14-day returns on unused items.", icon: "↩️" },
      ],
    },
  },
  {
    id: "features-compact",
    blockId: "features",
    name: "Icon rows",
    description: "Two focused benefits as rows",
    thumb: "features-compact",
    settings: {
      title: "The promise",
      subtitle: "Simple commitments we keep every day",
      layout: "icon-left",
      cardStyle: "bordered",
      columns: 2,
      alignment: "left",
      showIcons: true,
      items: [
        { title: "Quality first", body: "Materials and finishing we stand behind.", icon: "✨" },
        { title: "Human support", body: "Real people ready to help your order.", icon: "💬" },
      ],
    },
  },
  {
    id: "features-four",
    blockId: "features",
    name: "Four benefits",
    description: "Soft 4-column service grid",
    thumb: "features-grid",
    settings: {
      title: "Shopping made simple",
      subtitle: "From checkout to delivery",
      layout: "cards",
      cardStyle: "soft",
      columns: 4,
      alignment: "center",
      showIcons: true,
      items: [
        { title: "Nationwide delivery", body: "We ship to every major city.", icon: "📦" },
        { title: "Cash on delivery", body: "Pay when your order arrives.", icon: "💵" },
        { title: "Quality checked", body: "Each item reviewed before shipping.", icon: "✅" },
        { title: "WhatsApp help", body: "Quick answers from our team.", icon: "💬" },
      ],
    },
  },
  {
    id: "features-values",
    blockId: "features",
    name: "Brand values",
    description: "Centered icons with airy spacing",
    thumb: "features-row",
    settings: {
      title: "What we stand for",
      subtitle: "A brand built for everyday wear",
      layout: "centered",
      cardStyle: "plain",
      columns: 3,
      alignment: "center",
      showIcons: true,
      items: [
        { title: "Thoughtful design", body: "Pieces that work in real life.", icon: "🎨" },
        { title: "Fair pricing", body: "Premium feel without the markup.", icon: "🏷️" },
        { title: "Local focus", body: "Built for Moroccan shoppers.", icon: "🇲🇦" },
      ],
    },
  },
  {
    id: "features-strip",
    blockId: "features",
    name: "Trust strip",
    description: "Compact horizontal trust bar",
    thumb: "features-row",
    settings: {
      title: "",
      subtitle: "",
      layout: "strip",
      cardStyle: "bordered",
      columns: 4,
      alignment: "center",
      showIcons: true,
      items: [
        { title: "2–5 day delivery", body: "Nationwide", icon: "🚚" },
        { title: "Cash on delivery", body: "Pay on arrival", icon: "💵" },
        { title: "14-day returns", body: "Easy & free", icon: "↩️" },
        { title: "Secure checkout", body: "Protected", icon: "🔒" },
      ],
    },
  },
  {
    id: "features-numbered",
    blockId: "features",
    name: "How it works",
    description: "Numbered steps for your process",
    thumb: "features-compact",
    settings: {
      title: "How ordering works",
      subtitle: "Three simple steps from cart to door",
      layout: "numbered",
      cardStyle: "soft",
      columns: 3,
      alignment: "center",
      showIcons: false,
      items: [
        { title: "Pick your pieces", body: "Browse the catalog and add favorites to cart.", icon: "" },
        { title: "Checkout your way", body: "Pay online or choose cash on delivery.", icon: "" },
        { title: "We deliver fast", body: "Track your order until it arrives at your door.", icon: "" },
      ],
    },
  },
  {
    id: "features-minimal",
    blockId: "features",
    name: "Minimal grid",
    description: "Open layout without heavy cards",
    thumb: "features-grid",
    settings: {
      title: "Why customers stay",
      subtitle: "Clear benefits, no clutter",
      layout: "minimal",
      cardStyle: "plain",
      columns: 3,
      alignment: "left",
      showIcons: true,
      items: [
        { title: "Honest photos", body: "What you see is what you get.", icon: "📷" },
        { title: "Reliable sizing", body: "Guides that actually help you choose.", icon: "📏" },
        { title: "Care that lasts", body: "Products made for everyday wear.", icon: "🧵" },
      ],
    },
  },
  {
    id: "features-accent",
    blockId: "features",
    name: "Accent cards",
    description: "Light blue wash benefit cards",
    thumb: "features-grid",
    settings: {
      title: "Perks with every order",
      subtitle: "Small details that make shopping nicer",
      layout: "cards",
      cardStyle: "accent",
      columns: 3,
      alignment: "center",
      showIcons: true,
      items: [
        { title: "Gift-ready packing", body: "Orders arrive looking thoughtful.", icon: "🎁" },
        { title: "Order updates", body: "SMS or WhatsApp tracking notes.", icon: "📱" },
        { title: "Friendly support", body: "Real people, quick replies.", icon: "🤝" },
      ],
    },
  },

  // —— Testimonials ——
  {
    id: "testimonials-trio",
    blockId: "testimonials",
    name: "Quote cards",
    description: "Three bordered testimonial cards",
    thumb: "testimonials",
    settings: {
      title: "What customers say",
      subtitle: "Real feedback from shoppers across Morocco",
      layout: "cards",
      cardStyle: "bordered",
      columns: 3,
      items: [
        {
          quote: "Beautiful quality and arrived faster than expected.",
          author: "Amira K.",
          role: "Casablanca",
        },
        {
          quote: "Exactly what I was looking for — packaging felt premium.",
          author: "Youssef B.",
          role: "Rabat",
        },
        {
          quote: "Support was helpful and the product matched the photos.",
          author: "Sara M.",
          role: "Marrakech",
        },
      ],
    },
  },
  {
    id: "testimonials-spotlight",
    blockId: "testimonials",
    name: "Spotlight",
    description: "One featured review with supporting quotes",
    thumb: "testimonials-spotlight",
    settings: {
      title: "Customer love",
      subtitle: "Why people keep coming back",
      layout: "spotlight",
      cardStyle: "soft",
      columns: 2,
      items: [
        {
          quote: "This is now my go-to store — thoughtful products and smooth delivery.",
          author: "Nadia L.",
          role: "Verified buyer",
        },
        {
          quote: "Packaging felt premium and shipping was fast.",
          author: "Karim H.",
          role: "Tangier",
        },
        {
          quote: "Support replied in minutes on WhatsApp.",
          author: "Sara M.",
          role: "Marrakech",
        },
      ],
    },
  },
  {
    id: "testimonials-carousel",
    blockId: "testimonials",
    name: "Carousel",
    description: "Swipe through customer quotes",
    thumb: "testimonials-carousel",
    settings: {
      title: "Loved by customers",
      subtitle: "Swipe to read more",
      layout: "carousel",
      cardStyle: "bordered",
      columns: 3,
      items: [
        {
          quote: "Ordered twice already — sizing is accurate and shipping is reliable.",
          author: "Karim H.",
          role: "Tangier",
        },
        {
          quote: "The photos are honest and the quality feels expensive.",
          author: "Imane R.",
          role: "Fes",
        },
        {
          quote: "Beautiful quality and arrived faster than expected.",
          author: "Amira K.",
          role: "Casablanca",
        },
        {
          quote: "Will order again for gifts.",
          author: "Fatima",
          role: "Buyer",
        },
      ],
    },
  },
  {
    id: "testimonials-pair",
    blockId: "testimonials",
    name: "Review pair",
    description: "Two soft side-by-side quotes",
    thumb: "testimonials",
    settings: {
      title: "Real feedback",
      subtitle: "",
      layout: "cards",
      cardStyle: "soft",
      columns: 2,
      items: [
        {
          quote: "Ordered twice already — sizing is accurate and shipping is reliable.",
          author: "Karim H.",
          role: "Tangier",
        },
        {
          quote: "The photos are honest and the quality feels expensive.",
          author: "Imane R.",
          role: "Fes",
        },
      ],
    },
  },
  {
    id: "testimonials-social",
    blockId: "testimonials",
    name: "Minimal quotes",
    description: "Light social-proof style without heavy cards",
    thumb: "testimonials-minimal",
    settings: {
      title: "Loved online",
      subtitle: "Short notes from real buyers",
      layout: "minimal",
      cardStyle: "plain",
      columns: 3,
      items: [
        { quote: "5 stars — packaging was beautiful.", author: "Layla", role: "Instagram" },
        { quote: "Came on time, looks even better in person.", author: "Omar", role: "Buyer" },
        { quote: "Will order again for gifts.", author: "Fatima", role: "Buyer" },
        { quote: "Support replied in minutes.", author: "Hassan", role: "WhatsApp" },
      ],
    },
  },
  {
    id: "testimonials-stacked",
    blockId: "testimonials",
    name: "Stacked list",
    description: "Vertical list of quote cards",
    thumb: "testimonials",
    settings: {
      title: "From our customers",
      subtitle: "Stories from recent orders",
      layout: "stacked",
      cardStyle: "bordered",
      columns: 2,
      items: [
        {
          quote: "Beautiful quality and arrived faster than expected.",
          author: "Amira K.",
          role: "Casablanca",
        },
        {
          quote: "Exactly what I was looking for — packaging felt premium.",
          author: "Youssef B.",
          role: "Rabat",
        },
        {
          quote: "Support was helpful and the product matched the photos.",
          author: "Sara M.",
          role: "Marrakech",
        },
      ],
    },
  },

  // —— FAQ ——
  {
    id: "faq-standard",
    blockId: "faq",
    name: "Help center",
    description: "Classic expandable accordion",
    thumb: "faq",
    settings: {
      title: "Frequently asked questions",
      subtitle: "Quick answers before you order",
      layout: "accordion",
      openFirst: true,
      items: [
        {
          question: "How long does delivery take?",
          answer: "Most orders arrive in 2–5 business days depending on your city.",
        },
        {
          question: "Do you offer cash on delivery?",
          answer: "Yes — COD is available on eligible orders.",
        },
        {
          question: "What is your return policy?",
          answer: "Unused items can be returned within 14 days of delivery.",
        },
      ],
    },
  },
  {
    id: "faq-shipping",
    blockId: "faq",
    name: "Shipping focus",
    description: "Compact accordion for delivery Q&A",
    thumb: "faq",
    settings: {
      title: "Shipping & returns",
      subtitle: "Everything about getting your order",
      layout: "compact",
      openFirst: true,
      items: [
        {
          question: "Where do you ship?",
          answer: "We deliver nationwide across Morocco.",
        },
        {
          question: "When will I receive my order?",
          answer: "You’ll get tracking updates after the order is confirmed.",
        },
        {
          question: "Can I change my address?",
          answer: "Contact us quickly after ordering and we’ll update it if possible.",
        },
      ],
    },
  },
  {
    id: "faq-orders",
    blockId: "faq",
    name: "Two columns",
    description: "Q&A split across two columns",
    thumb: "faq-columns",
    settings: {
      title: "Orders & payment",
      subtitle: "Checkout questions, answered",
      layout: "two-column",
      openFirst: true,
      items: [
        {
          question: "Can I pay on delivery?",
          answer: "Yes, cash on delivery is available for eligible products and cities.",
        },
        {
          question: "How do I track my order?",
          answer: "We’ll send updates by SMS or WhatsApp once your order ships.",
        },
        {
          question: "Can I change my address?",
          answer: "Contact us quickly after ordering and we’ll update it if possible.",
        },
        {
          question: "What if an item is out of stock?",
          answer: "We’ll confirm availability before shipping and offer alternatives if needed.",
        },
      ],
    },
  },
  {
    id: "faq-product-care",
    blockId: "faq",
    name: "Always open",
    description: "All answers visible — no expand needed",
    thumb: "faq-stacked",
    settings: {
      title: "Sizing & care",
      subtitle: "Helpful guides in plain view",
      layout: "stacked",
      openFirst: false,
      items: [
        {
          question: "How do I choose the right size?",
          answer: "Check the size guide on each product page, or message us for a recommendation.",
        },
        {
          question: "How should I care for my items?",
          answer: "Follow the care label — most pieces prefer gentle wash and air dry.",
        },
        {
          question: "Do you offer exchanges?",
          answer: "Yes — unused items can usually be exchanged within 14 days.",
        },
      ],
    },
  },

  // —— Product grid (photo demos — pick a layout when adding) ——
  {
    id: "products-grid",
    blockId: "product-grid",
    name: "Classic grid",
    description: "4-column catalog with product photos",
    thumb: "products-grid",
    previewImages: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "New arrivals",
      subtitle: "Just added to the shop",
      productSource: "latest",
      limit: 8,
      offset: 0,
      showViewAll: true,
      layout: "grid",
      cardStyle: "minimal",
      showCardButton: false,
      cardButtonText: "View",
      cardButtonStyle: "",
      viewAllStyle: "link",
      columns: 4,
    },
  },
  {
    id: "products-carousel",
    blockId: "product-grid",
    name: "Carousel",
    description: "Swipe through products horizontally",
    thumb: "products-carousel",
    previewImages: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "Shop the edit",
      subtitle: "Swipe to explore",
      productSource: "latest",
      limit: 10,
      offset: 0,
      showViewAll: true,
      layout: "carousel",
      cardStyle: "bordered",
      showCardButton: true,
      cardButtonText: "Shop",
      cardButtonStyle: "outline",
      viewAllStyle: "outline",
      columns: 3,
    },
  },
  {
    id: "products-featured",
    blockId: "product-grid",
    name: "Featured picks",
    description: "Hand-pick products from your catalog",
    thumb: "products-featured",
    previewImages: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "Featured products",
      subtitle: "Selected for you",
      productSource: "manual",
      productIds: [],
      limit: 4,
      showViewAll: false,
      layout: "grid",
      cardStyle: "bordered",
      showCardButton: true,
      cardButtonText: "View product",
      cardButtonStyle: "",
      viewAllStyle: "link",
      columns: 4,
    },
  },
  {
    id: "products-list",
    blockId: "product-grid",
    name: "List rows",
    description: "Photo + details + button in stacked rows",
    thumb: "products-list",
    previewImages: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842fbf?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "All products",
      subtitle: "",
      productSource: "latest",
      limit: 6,
      offset: 0,
      showViewAll: true,
      layout: "list",
      cardStyle: "minimal",
      showCardButton: true,
      cardButtonText: "View",
      cardButtonStyle: "secondary",
      viewAllStyle: "ghost",
      columns: 1,
    },
  },
  {
    id: "products-dense",
    blockId: "product-grid",
    name: "Dense showcase",
    description: "Tight cards with photo overlay CTAs",
    thumb: "products-dense",
    previewImages: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1467043232710-1a748ee8b1f0?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "Bestsellers",
      subtitle: "Customer favorites",
      productSource: "latest",
      limit: 6,
      offset: 0,
      showViewAll: true,
      layout: "dense",
      cardStyle: "overlay",
      showCardButton: true,
      cardButtonText: "Shop now",
      cardButtonStyle: "",
      viewAllStyle: "",
      columns: 2,
    },
  },
  {
    id: "products-spotlight",
    blockId: "product-grid",
    name: "Spotlight",
    description: "One hero product + supporting tiles",
    thumb: "products-spotlight",
    previewImages: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "Editor’s pick",
      subtitle: "This week’s highlight",
      productSource: "latest",
      limit: 5,
      offset: 0,
      showViewAll: true,
      layout: "spotlight",
      cardStyle: "minimal",
      showCardButton: true,
      cardButtonText: "Explore",
      cardButtonStyle: "",
      viewAllStyle: "link",
      columns: 2,
    },
  },
  {
    id: "products-compact",
    blockId: "product-grid",
    name: "Compact trio",
    description: "Three large product cards",
    thumb: "products-compact",
    previewImages: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "Trending now",
      subtitle: "Three must-haves",
      productSource: "latest",
      limit: 3,
      offset: 0,
      showViewAll: true,
      layout: "grid",
      cardStyle: "bordered",
      showCardButton: true,
      cardButtonText: "Shop",
      cardButtonStyle: "outline",
      viewAllStyle: "outline",
      columns: 3,
    },
  },
  {
    id: "products-large",
    blockId: "product-grid",
    name: "Large cards",
    description: "Two big photo cards with shop buttons",
    thumb: "products-large",
    previewImages: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
    ],
    settings: {
      title: "Lookbook",
      subtitle: "Statement pieces",
      productSource: "latest",
      limit: 2,
      offset: 0,
      showViewAll: false,
      layout: "grid",
      cardStyle: "minimal",
      showCardButton: true,
      cardButtonText: "Shop the look",
      cardButtonStyle: "",
      viewAllStyle: "link",
      columns: 2,
    },
  },

  // —— Newsletter alias block ——
  {
    id: "newsletter-classic",
    blockId: "newsletter",
    name: "Classic signup",
    description: "Newsletter layout for your list",
    thumb: "text-newsletter",
    settings: {
      title: "Stay in the loop",
      content: "New drops and offers, straight to your inbox.",
      layout: "newsletter",
      alignment: "center",
    },
  },
  {
    id: "newsletter-strip",
    blockId: "newsletter",
    name: "Compact strip",
    description: "Short band with signup focus",
    thumb: "text-strip",
    settings: {
      title: "Get 10% off your first order",
      content: "Subscribe for exclusive offers.",
      layout: "strip",
      alignment: "center",
    },
  },
  {
    id: "newsletter-welcome",
    blockId: "newsletter",
    name: "Welcome offer",
    description: "Discount-led email capture",
    thumb: "text-newsletter",
    settings: {
      title: "Welcome — enjoy 15% off",
      content: "Join for early access to launches and member-only deals.",
      layout: "newsletter",
      alignment: "center",
    },
  },
  {
    id: "newsletter-drops",
    blockId: "newsletter",
    name: "Drop alerts",
    description: "Launch notification signup",
    thumb: "text-newsletter",
    settings: {
      title: "Be first to know",
      content: "Get notified the moment new products go live.",
      layout: "newsletter",
      alignment: "center",
    },
  },

  // —— Collection banner ——
  {
    id: "collections-grid",
    blockId: "collection-banner",
    name: "Classic grid",
    description: "Equal overlay cards in a clean grid",
    thumb: "collections",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      title: "Shop by collection",
      subtitle: "Find your next favorite category",
      collectionSource: "featured",
      limit: 6,
      layout: "grid",
      cardStyle: "overlay",
      columns: 3,
      showViewAll: true,
      showDescription: true,
    },
  },
  {
    id: "collections-carousel",
    blockId: "collection-banner",
    name: "Carousel",
    description: "Swipe through tall collection cards",
    thumb: "collections-carousel",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      title: "Explore the edit",
      subtitle: "Swipe to browse categories",
      collectionSource: "featured",
      limit: 8,
      layout: "carousel",
      cardStyle: "overlay",
      columns: 3,
      showViewAll: true,
      showDescription: false,
    },
  },
  {
    id: "collections-editorial",
    blockId: "collection-banner",
    name: "Editorial",
    description: "Large lead collection + side stack",
    thumb: "collections-editorial",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      title: "Featured collections",
      subtitle: "A curated starting point",
      collectionSource: "featured",
      limit: 4,
      layout: "editorial",
      cardStyle: "overlay",
      columns: 2,
      showViewAll: true,
      showDescription: true,
    },
  },
  {
    id: "collections-mosaic",
    blockId: "collection-banner",
    name: "Mosaic",
    description: "Asymmetric spotlight mosaic",
    thumb: "collections-mosaic",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      title: "Start shopping",
      subtitle: "Spotlight looks from the catalog",
      collectionSource: "all",
      limit: 5,
      layout: "mosaic",
      cardStyle: "overlay",
      columns: 3,
      showViewAll: true,
      showDescription: false,
    },
  },
  {
    id: "collections-overlay",
    blockId: "collection-banner",
    name: "Tall overlay",
    description: "Portrait cards with text on image",
    thumb: "collections",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      title: "Collections",
      subtitle: "",
      collectionSource: "featured",
      limit: 4,
      layout: "overlay",
      cardStyle: "overlay",
      columns: 4,
      showViewAll: true,
      showDescription: false,
    },
  },
  {
    id: "collections-below",
    blockId: "collection-banner",
    name: "Text below",
    description: "Clean cards with titles under images",
    thumb: "collections",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      title: "Browse collections",
      subtitle: "Simple catalog-style tiles",
      collectionSource: "all",
      limit: 6,
      layout: "grid",
      cardStyle: "below",
      columns: 3,
      showViewAll: true,
      showDescription: true,
    },
  },
  {
    id: "collections-list",
    blockId: "collection-banner",
    name: "List rows",
    description: "Compact horizontal collection rows",
    thumb: "collections-list",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      title: "All categories",
      subtitle: "Quick links into each collection",
      collectionSource: "all",
      limit: 8,
      layout: "list",
      cardStyle: "bordered",
      columns: 2,
      showViewAll: false,
      showDescription: true,
    },
  },
  {
    id: "collections-trio",
    blockId: "collection-banner",
    name: "Compact trio",
    description: "Three bordered collection cards",
    thumb: "collections",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      title: "Start here",
      subtitle: "Three places to begin",
      collectionSource: "featured",
      limit: 3,
      layout: "grid",
      cardStyle: "bordered",
      columns: 3,
      showViewAll: true,
      showDescription: true,
    },
  },

  // —— Video ——
  {
    id: "video-widescreen",
    blockId: "video",
    name: "Widescreen",
    description: "Classic 16:9 embed",
    thumb: "video",
    settings: {
      title: "Watch the story",
      videoSource: "url",
      videoUrl: "",
      aspectRatio: "16/9",
    },
  },
  {
    id: "video-square",
    blockId: "video",
    name: "Square reel",
    description: "1:1 social-style video",
    thumb: "video",
    settings: {
      title: "Behind the scenes",
      videoSource: "url",
      videoUrl: "",
      aspectRatio: "1/1",
    },
  },
  {
    id: "video-portrait",
    blockId: "video",
    name: "Vertical story",
    description: "9:16 mobile story format",
    thumb: "video",
    settings: {
      title: "Quick look",
      videoSource: "url",
      videoUrl: "",
      aspectRatio: "9/16",
    },
  },

  // —— Contact form ——
  {
    id: "contact-full",
    blockId: "contact-form",
    name: "Full contact",
    description: "Split form with email and hours",
    thumb: "contact",
    settings: {
      title: "Get in touch",
      description: "Send a message and we’ll reply as soon as we can.",
      buttonText: "Send message",
      showPhone: true,
      layout: "split",
      detailEmail: "hello@yourstore.com",
      detailHours: "Mon–Fri · 9am–6pm",
    },
  },
  {
    id: "contact-compact",
    blockId: "contact-form",
    name: "Compact",
    description: "Centered form without phone",
    thumb: "contact",
    settings: {
      title: "Write to us",
      description: "Questions about an order or product? We’re here.",
      buttonText: "Send",
      showPhone: false,
      layout: "centered",
    },
  },
  {
    id: "contact-support",
    blockId: "contact-form",
    name: "Order support",
    description: "Split layout for support desks",
    thumb: "contact",
    settings: {
      title: "Need help with an order?",
      description: "Share your order details and we’ll follow up quickly.",
      buttonText: "Contact support",
      showPhone: true,
      layout: "split",
      detailEmail: "support@yourstore.com",
      detailHours: "Mon–Fri · 9am–6pm",
    },
  },
  {
    id: "contact-map",
    blockId: "contact-form",
    name: "With map",
    description: "Form + details ready for a Maps embed",
    thumb: "contact",
    settings: {
      title: "Visit & enquire",
      description: "Drop by or send a note — we reply within one business day.",
      buttonText: "Send enquiry",
      showPhone: true,
      layout: "split",
      detailEmail: "hello@yourstore.com",
      detailAddress: "Add your street address",
      detailHours: "Mon–Sat · 10am–7pm",
      mapEmbedUrl: "",
    },
  },

  // —— Countdown ——
  {
    id: "countdown-sale",
    blockId: "countdown",
    name: "Flash sale",
    description: "Urgent sale timer",
    thumb: "countdown",
    settings: {
      title: "Sale ends soon",
      subtitle: "Don’t miss these deals",
      endAt: COUNTDOWN_END,
      ctaText: "Shop the sale",
      ctaLink: "/products",
    },
  },
  {
    id: "countdown-launch",
    blockId: "countdown",
    name: "Launch night",
    description: "Product drop countdown",
    thumb: "countdown",
    settings: {
      title: "New drop in",
      subtitle: "Be ready when it goes live",
      endAt: COUNTDOWN_END,
      ctaText: "Notify me",
      ctaLink: "/products",
    },
  },
  {
    id: "countdown-weekend",
    blockId: "countdown",
    name: "Weekend deal",
    description: "Short promo window",
    thumb: "countdown",
    settings: {
      title: "Weekend only",
      subtitle: "Extra savings until Sunday",
      endAt: COUNTDOWN_END,
      ctaText: "Grab the deal",
      ctaLink: "/products",
    },
  },

  // —— Logo wall ——
  {
    id: "logo-trusted",
    blockId: "logo-wall",
    name: "Trusted by",
    description: "Four grayscale partner logos",
    thumb: "logo-wall",
    settings: {
      title: "Trusted by",
      grayscale: true,
      columns: 4,
      logos: [
        { url: "", alt: "Partner 1", href: "" },
        { url: "", alt: "Partner 2", href: "" },
        { url: "", alt: "Partner 3", href: "" },
        { url: "", alt: "Partner 4", href: "" },
      ],
    },
  },
  {
    id: "logo-press",
    blockId: "logo-wall",
    name: "As seen in",
    description: "Press / media logo row",
    thumb: "logo-wall",
    settings: {
      title: "As seen in",
      grayscale: true,
      columns: 6,
      logos: [
        { url: "", alt: "Press 1", href: "" },
        { url: "", alt: "Press 2", href: "" },
        { url: "", alt: "Press 3", href: "" },
        { url: "", alt: "Press 4", href: "" },
        { url: "", alt: "Press 5", href: "" },
        { url: "", alt: "Press 6", href: "" },
      ],
    },
  },
  {
    id: "logo-color",
    blockId: "logo-wall",
    name: "Color partners",
    description: "Full-color logo grid",
    thumb: "logo-wall",
    settings: {
      title: "Our partners",
      grayscale: false,
      columns: 3,
      logos: [
        { url: "", alt: "Partner A", href: "" },
        { url: "", alt: "Partner B", href: "" },
        { url: "", alt: "Partner C", href: "" },
      ],
    },
  },

  // —— Spacer ——
  {
    id: "spacer-sm",
    blockId: "spacer",
    name: "Small",
    description: "Tight breathing room",
    thumb: "spacer",
    settings: { height: "2rem" },
  },
  {
    id: "spacer-md",
    blockId: "spacer",
    name: "Medium",
    description: "Standard section gap",
    thumb: "spacer",
    settings: { height: "4rem" },
  },
  {
    id: "spacer-lg",
    blockId: "spacer",
    name: "Large",
    description: "Generous vertical space",
    thumb: "spacer",
    settings: { height: "6rem" },
  },

  // —— Divider ——
  {
    id: "divider-thin",
    blockId: "divider",
    name: "Thin full width",
    description: "Subtle horizontal rule",
    thumb: "divider",
    settings: {
      thickness: "1px",
      width: "100%",
      color: "#e5e5e5",
      alignment: "center",
    },
  },
  {
    id: "divider-short",
    blockId: "divider",
    name: "Short accent",
    description: "Centered short line",
    thumb: "divider",
    settings: {
      thickness: "2px",
      width: "4rem",
      color: "#007AFF",
      alignment: "center",
    },
  },
  {
    id: "divider-bold",
    blockId: "divider",
    name: "Bold separator",
    description: "Stronger full-width line",
    thumb: "divider",
    settings: {
      thickness: "3px",
      width: "100%",
      color: "#d4d4d4",
      alignment: "center",
    },
  },

  // —— Columns ——
  {
    id: "columns-two",
    blockId: "columns",
    name: "Two text columns",
    description: "Side-by-side copy",
    thumb: "columns",
    settings: {
      layout: "plain",
      columnCount: 2,
      gap: "1.5rem",
      alignment: "left",
      columns: [
        { cellType: "text", title: "Our craft", content: "<p>Materials and details we obsess over.</p>" },
        { cellType: "text", title: "Our promise", content: "<p>Reliable delivery and honest pricing.</p>" },
      ],
    },
  },
  {
    id: "columns-three",
    blockId: "columns",
    name: "Three services",
    description: "Service / info columns",
    thumb: "columns",
    settings: {
      layout: "plain",
      columnCount: 3,
      gap: "1.25rem",
      alignment: "left",
      columns: [
        { cellType: "text", title: "Shipping", content: "<p>2–5 day delivery nationwide.</p>" },
        { cellType: "text", title: "Returns", content: "<p>14-day returns on unused items.</p>" },
        { cellType: "text", title: "Support", content: "<p>Message us anytime for help.</p>" },
      ],
    },
  },
  {
    id: "columns-four",
    blockId: "columns",
    name: "Four quick links",
    description: "Compact info grid",
    thumb: "columns",
    settings: {
      layout: "plain",
      columnCount: 4,
      gap: "1rem",
      alignment: "left",
      columns: [
        { cellType: "text", title: "Shop", content: "<p>New arrivals weekly.</p>" },
        { cellType: "text", title: "Care", content: "<p>Size & care guides.</p>" },
        { cellType: "text", title: "Track", content: "<p>Follow your order.</p>" },
        { cellType: "text", title: "Help", content: "<p>Talk to support.</p>" },
      ],
    },
  },
  {
    id: "columns-cards",
    blockId: "columns",
    name: "Info cards",
    description: "Bordered text cards",
    thumb: "columns-cards",
    settings: {
      layout: "cards",
      cardStyle: "bordered",
      columnCount: 3,
      gap: "1.25rem",
      alignment: "left",
      columns: [
        { cellType: "text", title: "Free shipping", content: "<p>On orders over 500 MAD.</p>" },
        { cellType: "text", title: "Easy returns", content: "<p>14 days, no hassle.</p>" },
        { cellType: "text", title: "Secure checkout", content: "<p>Pay on delivery or online.</p>" },
      ],
    },
  },
  {
    id: "columns-image-text",
    blockId: "columns",
    name: "Image + text",
    description: "Photo cells with copy underneath",
    thumb: "columns-media",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      layout: "media",
      columnCount: 3,
      gap: "1.5rem",
      alignment: "left",
      columns: [
        {
          cellType: "image-text",
          title: "New season",
          content: "<p>Fresh cuts for everyday wear.</p>",
          imageUrl: SAMPLE_COLLECTION_IMAGES[0],
          imageAlt: "New season",
        },
        {
          cellType: "image-text",
          title: "Essentials",
          content: "<p>Pieces you’ll reach for weekly.</p>",
          imageUrl: SAMPLE_COLLECTION_IMAGES[1],
          imageAlt: "Essentials",
        },
        {
          cellType: "image-text",
          title: "Archive",
          content: "<p>Limited restocks from past drops.</p>",
          imageUrl: SAMPLE_COLLECTION_IMAGES[2],
          imageAlt: "Archive",
        },
      ],
    },
  },
  {
    id: "columns-cta-cells",
    blockId: "columns",
    name: "CTA cells",
    description: "Each column ends with a button",
    thumb: "columns-cta",
    settings: {
      layout: "cta",
      cardStyle: "soft",
      columnCount: 3,
      gap: "1.25rem",
      alignment: "center",
      columns: [
        {
          cellType: "cta",
          title: "Women",
          content: "<p>Dresses, knits, and more.</p>",
          buttonText: "Shop women",
          buttonLink: "/collections",
        },
        {
          cellType: "cta",
          title: "Men",
          content: "<p>Layers built for daily wear.</p>",
          buttonText: "Shop men",
          buttonLink: "/collections",
        },
        {
          cellType: "cta",
          title: "Sale",
          content: "<p>Limited-time markdowns.</p>",
          buttonText: "View sale",
          buttonLink: "/collections",
        },
      ],
    },
  },
  {
    id: "columns-image-cta",
    blockId: "columns",
    name: "Image + CTA",
    description: "Photos with shop buttons",
    thumb: "columns-cta",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      layout: "media",
      columnCount: 2,
      gap: "1.5rem",
      alignment: "left",
      columns: [
        {
          cellType: "cta",
          title: "Lookbook",
          content: "<p>See how we style the collection.</p>",
          imageUrl: SAMPLE_HERO_IMAGE,
          imageAlt: "Lookbook",
          buttonText: "Explore",
          buttonLink: "/collections",
        },
        {
          cellType: "cta",
          title: "Gift guide",
          content: "<p>Ideas for every occasion.</p>",
          imageUrl: SAMPLE_HERO_IMAGE_2,
          imageAlt: "Gift guide",
          buttonText: "Shop gifts",
          buttonLink: "/products",
        },
      ],
    },
  },
  {
    id: "columns-image-only",
    blockId: "columns",
    name: "Image mosaic",
    description: "Four image-only cells",
    thumb: "columns-media",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: {
      layout: "media",
      columnCount: 4,
      gap: "0.75rem",
      alignment: "center",
      columns: [
        { cellType: "image", title: "One", imageUrl: SAMPLE_COLLECTION_IMAGES[0], imageAlt: "Look 1" },
        { cellType: "image", title: "Two", imageUrl: SAMPLE_COLLECTION_IMAGES[1], imageAlt: "Look 2" },
        { cellType: "image", title: "Three", imageUrl: SAMPLE_COLLECTION_IMAGES[2], imageAlt: "Look 3" },
        {
          cellType: "image",
          title: "Four",
          imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
          imageAlt: "Look 4",
        },
      ],
    },
  },

  // —— Search ——
  {
    id: "search-catalog",
    blockId: "search",
    name: "Catalog search",
    description: "Find products fast",
    thumb: "search",
    settings: {
      title: "Find a product",
      placeholder: "Search the catalog…",
      buttonText: "Search",
    },
  },
  {
    id: "search-minimal",
    blockId: "search",
    name: "Minimal bar",
    description: "Quiet search without title noise",
    thumb: "search",
    settings: {
      title: "",
      placeholder: "Search products…",
      buttonText: "Go",
    },
  },
  {
    id: "search-help",
    blockId: "search",
    name: "Help me find",
    description: "Friendly discovery wording",
    thumb: "search",
    settings: {
      title: "Looking for something?",
      placeholder: "Type a product, color, or style…",
      buttonText: "Find it",
    },
  },

  // —— Embed ——
  {
    id: "embed-map",
    blockId: "embed",
    name: "Map embed",
    description: "Store location map (16:9)",
    thumb: "embed",
    settings: {
      title: "Find us",
      url: "",
      aspectRatio: "16 / 9",
    },
  },
  {
    id: "embed-square",
    blockId: "embed",
    name: "Square widget",
    description: "1:1 social / widget frame",
    thumb: "embed",
    settings: {
      title: "Follow along",
      url: "",
      aspectRatio: "1 / 1",
    },
  },
  {
    id: "embed-ultrawide",
    blockId: "embed",
    name: "Ultrawide",
    description: "Cinema 21:9 embed",
    thumb: "embed",
    settings: {
      title: "",
      url: "",
      aspectRatio: "21 / 9",
    },
  },

  // —— Footer ——
  {
    id: "footer-full",
    blockId: "footer",
    name: "Full footer",
    description: "Nav, care, legal, powered-by",
    thumb: "footer",
    settings: {
      showPoweredBy: true,
      tagline: "Quality products, delivered with care.",
      showNav: true,
      showClientCare: true,
      showLegal: true,
    },
  },
  {
    id: "footer-minimal",
    blockId: "footer",
    name: "Minimal",
    description: "Lean footer with legal only",
    thumb: "footer",
    settings: {
      showPoweredBy: false,
      tagline: "",
      showNav: false,
      showClientCare: false,
      showLegal: true,
    },
  },
  {
    id: "footer-brand",
    blockId: "footer",
    name: "Brand + nav",
    description: "Tagline and navigation links",
    thumb: "footer",
    settings: {
      showPoweredBy: true,
      tagline: "Shop thoughtfully. Live simply.",
      showNav: true,
      showClientCare: false,
      showLegal: true,
    },
  },

  // —— Product card ——
  {
    id: "product-card-latest",
    blockId: "product-card",
    name: "Latest spotlight",
    description: "Highlight your newest product",
    thumb: "product-card",
    previewImages: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "Featured product",
      productSource: "latest",
      productIds: [],
      ctaText: "View product",
    },
  },
  {
    id: "product-card-shop",
    blockId: "product-card",
    name: "Shop this",
    description: "Strong shop CTA wording",
    thumb: "product-card",
    previewImages: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "Customer favorite",
      productSource: "latest",
      productIds: [],
      ctaText: "Shop now",
    },
  },
  {
    id: "product-card-pick",
    blockId: "product-card",
    name: "Hand-picked",
    description: "Manual pick — choose in inspector",
    thumb: "product-card",
    previewImages: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
    ],
    settings: {
      title: "Editor’s pick",
      productSource: "manual",
      productIds: [],
      ctaText: "See details",
    },
  },

  // —— Product page (PDP) ——
  {
    id: "pdp-gallery-stack",
    blockId: "product-gallery",
    name: "Stack",
    description: "Main image with thumbnails below",
    thumb: "pdp-gallery-stack",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "stack", showThumbnails: true, thumbPosition: "bottom" },
  },
  {
    id: "pdp-gallery-side",
    blockId: "product-gallery",
    name: "Side thumbs",
    description: "Thumbnails beside the main image",
    thumb: "pdp-gallery-side",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "side", showThumbnails: true, thumbPosition: "left" },
  },
  {
    id: "pdp-gallery-carousel",
    blockId: "product-gallery",
    name: "Carousel",
    description: "Swipeable main image with dots",
    thumb: "pdp-gallery-carousel",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "carousel", showThumbnails: false },
  },
  {
    id: "pdp-gallery-single",
    blockId: "product-gallery",
    name: "Single image",
    description: "One large product photo only",
    thumb: "image-contained",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "single", showThumbnails: false },
  },
  {
    id: "pdp-info-default",
    blockId: "product-info",
    name: "Classic",
    description: "Brand, title, and full description",
    thumb: "pdp-info",
    settings: { layout: "default", showBrand: true, showDescription: true },
  },
  {
    id: "pdp-info-compact",
    blockId: "product-info",
    name: "Compact",
    description: "Tighter title with clipped description",
    thumb: "pdp-info",
    settings: { layout: "compact", showBrand: true, showDescription: true },
  },
  {
    id: "pdp-info-editorial",
    blockId: "product-info",
    name: "Editorial",
    description: "Large display title, roomy copy",
    thumb: "text-intro",
    settings: { layout: "editorial", showBrand: false, showDescription: true },
  },
  {
    id: "pdp-price-inline",
    blockId: "product-price",
    name: "Inline",
    description: "Price and compare-at side by side",
    thumb: "pdp-price",
    settings: { layout: "default", showComparePrice: true },
  },
  {
    id: "pdp-price-stacked",
    blockId: "product-price",
    name: "Stacked",
    description: "Compare price above large sale price",
    thumb: "pdp-price",
    settings: { layout: "stacked", showComparePrice: true },
  },
  {
    id: "pdp-price-badge",
    blockId: "product-price",
    name: "Badge",
    description: "Pill price with savings badge",
    thumb: "pdp-price",
    settings: { layout: "badge", showComparePrice: true },
  },
  {
    id: "pdp-variants-outline",
    blockId: "product-variants",
    name: "Outlined",
    description: "Bordered option buttons",
    thumb: "pdp-variants",
    settings: { layout: "outline", label: "Options" },
  },
  {
    id: "pdp-variants-pills",
    blockId: "product-variants",
    name: "Pills",
    description: "Filled pill selectors",
    thumb: "pdp-variants",
    settings: { layout: "pills", label: "Options" },
  },
  {
    id: "pdp-variants-underline",
    blockId: "product-variants",
    name: "Underline",
    description: "Minimal text tabs",
    thumb: "pdp-variants",
    settings: { layout: "underline", label: "Options" },
  },
  {
    id: "pdp-buy-solid",
    blockId: "product-buy-button",
    name: "Solid",
    description: "Filled primary button",
    thumb: "pdp-buy",
    settings: { layout: "solid", buttonText: "Add to cart" },
  },
  {
    id: "pdp-buy-outline",
    blockId: "product-buy-button",
    name: "Outline",
    description: "Bordered add-to-cart",
    thumb: "pdp-buy",
    settings: { layout: "outline", buttonText: "Add to cart" },
  },
  {
    id: "pdp-buy-full",
    blockId: "product-buy-button",
    name: "Full width",
    description: "Edge-to-edge CTA",
    thumb: "pdp-buy",
    settings: { layout: "full", buttonText: "Add to cart" },
  },
  {
    id: "pdp-buy-pill",
    blockId: "product-buy-button",
    name: "Pill",
    description: "Rounded pill button",
    thumb: "pdp-buy",
    settings: { layout: "pill", buttonText: "Add to cart" },
  },
  {
    id: "pdp-reviews-cards",
    blockId: "product-reviews",
    name: "Cards",
    description: "Review cards in a grid",
    thumb: "pdp-reviews",
    settings: { layout: "cards", title: "Customer reviews", showSummary: true, limit: 6 },
  },
  {
    id: "pdp-reviews-list",
    blockId: "product-reviews",
    name: "List",
    description: "Stacked review rows",
    thumb: "testimonials",
    settings: { layout: "list", title: "What buyers say", showSummary: true, limit: 8 },
  },
  {
    id: "pdp-reviews-compact",
    blockId: "product-reviews",
    name: "Compact",
    description: "Dense rating snippets",
    thumb: "testimonials-minimal",
    settings: { layout: "compact", title: "Reviews", showSummary: false, limit: 5 },
  },
  {
    id: "pdp-faq-default",
    blockId: "product-faq",
    name: "Accordion",
    description: "Expandable Q&A from FAQ paragraphs",
    thumb: "pdp-faq",
    settings: { layout: "accordion", title: "Details & care" },
  },
  {
    id: "pdp-faq-stacked",
    blockId: "product-faq",
    name: "Stacked",
    description: "Title above FAQ content",
    thumb: "pdp-faq",
    settings: { layout: "default", title: "Frequently asked questions" },
  },
  {
    id: "pdp-faq-strip",
    blockId: "product-faq",
    name: "Strip",
    description: "Title beside content",
    thumb: "faq-columns",
    settings: { layout: "strip", title: "Good to know" },
  },
  {
    id: "pdp-faq-intro",
    blockId: "product-faq",
    name: "Centered",
    description: "Centered intro-style FAQ",
    thumb: "faq",
    settings: { layout: "intro", title: "Questions?" },
  },
  {
    id: "pdp-related-grid",
    blockId: "product-related",
    name: "Grid",
    description: "Four-column related products",
    thumb: "pdp-related",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "grid", title: "You may also like", limit: 4 },
  },
  {
    id: "pdp-related-carousel",
    blockId: "product-related",
    name: "Carousel",
    description: "Horizontal scroll of related items",
    thumb: "products-carousel",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "carousel", title: "You may also like", limit: 8 },
  },
  {
    id: "pdp-related-compact",
    blockId: "product-related",
    name: "Compact",
    description: "Tighter multi-column grid",
    thumb: "products-dense",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "compact", title: "More like this", limit: 5 },
  },
  {
    id: "pdp-recent-grid",
    blockId: "product-recently-viewed",
    name: "Grid",
    description: "Recently viewed product grid",
    thumb: "pdp-related",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "grid", title: "Recently viewed", limit: 4 },
  },
  {
    id: "pdp-recent-rail",
    blockId: "product-recently-viewed",
    name: "Rail",
    description: "Horizontal recently viewed rail",
    thumb: "products-carousel",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "rail", title: "Recently viewed", limit: 8 },
  },
  {
    id: "pdp-recent-compact",
    blockId: "product-recently-viewed",
    name: "Compact",
    description: "Dense recently viewed grid",
    thumb: "products-dense",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "compact", title: "You viewed", limit: 5 },
  },

  // —— Collection page ——
  {
    id: "coll-banner-hero",
    blockId: "collection-page-banner",
    name: "Hero",
    description: "Full-bleed overlay title",
    thumb: "collection-banner-hero",
    previewImages: [SAMPLE_HERO_IMAGE],
    settings: { layout: "hero", showBreadcrumb: true, showTitle: true, minHeight: "320px" },
  },
  {
    id: "coll-banner-contained",
    blockId: "collection-page-banner",
    name: "Contained",
    description: "Rounded banner under breadcrumb",
    thumb: "image-contained",
    previewImages: [SAMPLE_HERO_IMAGE_2],
    settings: { layout: "contained", showBreadcrumb: true, showTitle: true },
  },
  {
    id: "coll-banner-split",
    blockId: "collection-page-banner",
    name: "Split",
    description: "Image beside title panel",
    thumb: "collection-banner-split",
    previewImages: [SAMPLE_HERO_IMAGE_3],
    settings: { layout: "split", showBreadcrumb: true, showTitle: true },
  },
  {
    id: "coll-banner-minimal",
    blockId: "collection-page-banner",
    name: "Minimal strip",
    description: "Thin image strip with title",
    thumb: "collection-banner-minimal",
    previewImages: [SAMPLE_HERO_IMAGE],
    settings: { layout: "minimal", showBreadcrumb: true, showTitle: true, minHeight: "120px" },
  },
  {
    id: "coll-desc-stacked",
    blockId: "collection-description",
    name: "Stacked",
    description: "Title above description",
    thumb: "collection-desc",
    settings: { layout: "stacked", showTitle: true, showDescription: true },
  },
  {
    id: "coll-desc-centered",
    blockId: "collection-description",
    name: "Centered",
    description: "Centered collection copy",
    thumb: "text-intro",
    settings: { layout: "centered", showTitle: true, showDescription: true },
  },
  {
    id: "coll-desc-inline",
    blockId: "collection-description",
    name: "Inline",
    description: "Title and description in one row",
    thumb: "collection-desc",
    settings: { layout: "inline", showTitle: true, showDescription: true },
  },
  {
    id: "coll-filters-chips",
    blockId: "collection-filters",
    name: "Chips",
    description: "Outlined filter chips",
    thumb: "collection-filters",
    settings: { layout: "chips", title: "Filter" },
  },
  {
    id: "coll-filters-pills",
    blockId: "collection-filters",
    name: "Pills",
    description: "Filled filter pills",
    thumb: "collection-filters",
    settings: { layout: "pills", title: "Shop by" },
  },
  {
    id: "coll-filters-minimal",
    blockId: "collection-filters",
    name: "Text tabs",
    description: "Minimal underline filters",
    thumb: "collection-filters",
    settings: { layout: "minimal", title: "Filter" },
  },
  {
    id: "coll-grid-standard",
    blockId: "collection-product-grid",
    name: "Standard",
    description: "3-column comfortable grid",
    thumb: "collection-grid",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "grid", columns: 3, density: "comfortable" },
  },
  {
    id: "coll-grid-four",
    blockId: "collection-product-grid",
    name: "Four columns",
    description: "Denser 4-column catalog",
    thumb: "products-dense",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "grid", columns: 4, density: "comfortable" },
  },
  {
    id: "coll-grid-dense",
    blockId: "collection-product-grid",
    name: "Dense",
    description: "Tight spacing, square tiles",
    thumb: "products-compact",
    previewImages: SAMPLE_COLLECTION_IMAGES,
    settings: { layout: "dense", columns: 4, density: "dense" },
  },
  {
    id: "coll-news-card",
    blockId: "collection-newsletter",
    name: "Card",
    description: "Contained signup card",
    thumb: "collection-newsletter",
    settings: {
      layout: "card",
      title: "Stay in the loop",
      description: "Get updates on new arrivals and offers.",
      buttonText: "Subscribe",
    },
  },
  {
    id: "coll-news-banner",
    blockId: "collection-newsletter",
    name: "Banner",
    description: "Full-width dark signup",
    thumb: "text-newsletter",
    settings: {
      layout: "banner",
      title: "Stay in the edit",
      description: "Early access to drops and restocks.",
      buttonText: "Subscribe",
      backgroundColor: "#0a0a0a",
      textColor: "#e5e5e5",
    },
  },
  {
    id: "coll-news-strip",
    blockId: "collection-newsletter",
    name: "Strip",
    description: "Compact inline signup",
    thumb: "text-strip",
    settings: {
      layout: "strip",
      title: "Newsletter",
      description: "New arrivals in your inbox.",
      buttonText: "Join",
    },
  },
  {
    id: "coll-page-numbered",
    blockId: "collection-pagination",
    name: "Numbered",
    description: "Page number buttons",
    thumb: "collection-pagination",
    settings: { layout: "numbered", pageSize: 12 },
  },
  {
    id: "coll-page-simple",
    blockId: "collection-pagination",
    name: "Previous / Next",
    description: "Simple prev/next links",
    thumb: "collection-pagination",
    settings: { layout: "simple", pageSize: 12 },
  },
  {
    id: "coll-page-load-more",
    blockId: "collection-pagination",
    name: "Load more",
    description: "Single load-more button",
    thumb: "collection-pagination",
    settings: { layout: "load-more", pageSize: 16 },
  },
];

const BY_BLOCK = new Map<string, BlockDesignPreset[]>();
for (const preset of BLOCK_DESIGN_PRESETS) {
  const list = BY_BLOCK.get(preset.blockId) ?? [];
  list.push(preset);
  BY_BLOCK.set(preset.blockId, list);
}

export function getPresetsForBlock(blockId: BlockId | string): BlockDesignPreset[] {
  const key = blockId === "featured-products" ? "product-grid" : blockId;
  return BY_BLOCK.get(key) ?? [];
}

/** Always true — Add/Change design always opens the templates popup. */
export function blockHasDesignGallery(_blockId?: BlockId | string): boolean {
  return true;
}

export function getPresetById(presetId: string): BlockDesignPreset | undefined {
  return BLOCK_DESIGN_PRESETS.find((p) => p.id === presetId);
}

/** Blocks that should open the design gallery on add (all designable sections). */
export function getDesignableBlockIds(): BlockId[] {
  return Array.from(BY_BLOCK.keys()) as BlockId[];
}
