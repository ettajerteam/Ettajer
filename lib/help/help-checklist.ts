export type HelpChecklistItem = {
  step: number;
  title: string;
  description: string;
  href: string;
  articleSlug: string;
};

export const GETTING_STARTED_CHECKLIST: HelpChecklistItem[] = [
  {
    step: 1,
    title: "Create your account",
    description: "Sign up and complete onboarding.",
    href: "/signup",
    articleSlug: "how-long-does-setup-take",
  },
  {
    step: 2,
    title: "Add your first product",
    description: "Upload photos, set price, and publish.",
    href: "/dashboard/products/new?first=1",
    articleSlug: "create-your-first-product",
  },
  {
    step: 3,
    title: "Share your store link",
    description: "Send your live store on WhatsApp to get buyers.",
    href: "/dashboard?launch=1",
    articleSlug: "share-your-store-on-social",
  },
  {
    step: 4,
    title: "Customize your storefront",
    description: "Edit your theme in the visual builder (optional).",
    href: "/dashboard/themes",
    articleSlug: "use-the-visual-builder",
  },
  {
    step: 5,
    title: "Connect your domain",
    description: "Use your own domain with free SSL (later).",
    href: "/dashboard/domains",
    articleSlug: "connect-a-custom-domain",
  },
];

/** Featured marketing tutorials & guides on the help home — one card per platform. */
export type MarketingGuideItem = {
  id: string;
  title: string;
  description: string;
  articleSlug: string;
  href: string;
  /** Brand accent for the card badge */
  accent: string;
  /** Short label inside the badge */
  badge: string;
};

export const MARKETING_GUIDES: MarketingGuideItem[] = [
  {
    id: "meta",
    title: "Meta (Facebook & Instagram)",
    description: "Pixel, Conversions API, catalog, and ads checklist.",
    articleSlug: "connect-meta-pixel",
    href: "/dashboard/marketing/meta",
    accent: "#1877F2",
    badge: "Meta",
  },
  {
    id: "tiktok",
    title: "TikTok",
    description: "TikTok Pixel for ViewContent, AddToCart, and Purchase.",
    articleSlug: "connect-tiktok-pixel",
    href: "/dashboard/marketing/tiktok",
    accent: "#010101",
    badge: "TT",
  },
  {
    id: "google",
    title: "Google Tag Manager",
    description: "Load GTM once — fire tags from your container.",
    articleSlug: "connect-google-tag-manager",
    href: "/dashboard/marketing/google",
    accent: "#EA4335",
    badge: "GTM",
  },
  {
    id: "pinterest",
    title: "Pinterest",
    description: "Pinterest Tag for browse and checkout events.",
    articleSlug: "connect-pinterest-tag",
    href: "/dashboard/marketing/pinterest",
    accent: "#E60023",
    badge: "Pin",
  },
  {
    id: "snapchat",
    title: "Snapchat",
    description: "Snap Pixel for ads measurement and retargeting.",
    articleSlug: "connect-snapchat-pixel",
    href: "/dashboard/marketing/snapchat",
    accent: "#FFFC00",
    badge: "Snap",
  },
  {
    id: "email",
    title: "Email Marketing",
    description: "Launch checklist from empty list to first campaign.",
    articleSlug: "email-marketing-launch-checklist",
    href: "/dashboard/marketing/email",
    accent: "#007AFF",
    badge: "Mail",
  },
];

/** Featured payment platform guides on the help home. */
export type PaymentPlatformGuide = {
  id: string;
  name: string;
  description: string;
  articleSlug: string;
  href: string;
  accent: string;
  badge: string;
};

export const PAYMENT_PLATFORM_GUIDES: PaymentPlatformGuide[] = [
  {
    id: "cod",
    name: "Cash on delivery",
    description: "Native COD checkout — confirm buyers before you ship.",
    articleSlug: "how-cod-checkout-works",
    href: "/dashboard/settings?tab=payment",
    accent: "#34C759",
    badge: "COD",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Cards in ~2 months — visible in Payments, not activatable yet.",
    articleSlug: "connect-stripe-for-cards",
    href: "/dashboard/settings?tab=payment",
    accent: "#635BFF",
    badge: "Soon",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Client ID + Secret, verify, then get paid at checkout.",
    articleSlug: "connect-paypal-checkout",
    href: "/dashboard/settings?tab=payment",
    accent: "#0070BA",
    badge: "PayPal",
  },
  {
    id: "overview",
    name: "Online payments overview",
    description: "PayPal now with COD — Stripe cards coming in ~2 months.",
    articleSlug: "set-up-online-payments",
    href: "/dashboard/settings?tab=payment",
    accent: "#007AFF",
    badge: "All",
  },
];

/** Featured DNS / registrar tutorials on the help home. */
export type DomainRegistrarGuide = {
  id: string;
  name: string;
  description: string;
  articleSlug: string;
  logoSrc: string;
  logoBg: string;
};

export const DOMAIN_REGISTRAR_GUIDES: DomainRegistrarGuide[] = [
  {
    id: "namecheap",
    name: "Namecheap",
    description: "Add A + CNAME records in Advanced DNS.",
    articleSlug: "connect-domain-namecheap",
    logoSrc: "/help/registrars/namecheap.svg",
    logoBg: "#FFF1F0",
  },
  {
    id: "godaddy",
    name: "GoDaddy",
    description: "Edit DNS in My Products → DNS.",
    articleSlug: "connect-domain-godaddy",
    logoSrc: "/help/registrars/godaddy.svg",
    logoBg: "#E8FFFE",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    description: "DNS-only records (grey cloud) for SSL.",
    articleSlug: "connect-domain-cloudflare",
    logoSrc: "/help/registrars/cloudflare.svg",
    logoBg: "#FFF4EB",
  },
  {
    id: "hostinger",
    name: "Hostinger",
    description: "Point DNS from hPanel → Domains.",
    articleSlug: "connect-domain-hostinger",
    logoSrc: "/help/registrars/hostinger.svg",
    logoBg: "#F3EEFF",
  },
  {
    id: "ovh",
    name: "OVHcloud",
    description: "Zone DNS records for .ma and EU domains.",
    articleSlug: "connect-domain-ovh",
    logoSrc: "/help/registrars/ovh.svg",
    logoBg: "#EEF3F9",
  },
  {
    id: "google",
    name: "Google Domains",
    description: "Squarespace Domains DNS (ex-Google Domains).",
    articleSlug: "connect-domain-google-domains",
    logoSrc: "/help/registrars/google.svg",
    logoBg: "#EEF3FE",
  },
];
