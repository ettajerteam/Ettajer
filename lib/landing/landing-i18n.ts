import type { LucideIcon } from "lucide-react";
import {
  Layout,
  Truck,
  ShieldCheck,
  Package,
  Smartphone,
  Zap,
  MessageCircle,
  MessageSquare,
  Navigation,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { LANDING_PRICING_PLANS, USD_TO_MAD, type PricingCurrency, type PricingPlan } from "@/lib/landing/pricing";
import { integrationGroups as baseIntegrationGroups } from "@/lib/landing/integrations-data";
import { AR_COPY, HERO_SLIDES_AR } from "@/lib/landing/landing-i18n-ar";

export type LandingLocale = "en" | "fr" | "ar";

export type HeroSlide = {
  lines: { before: string; highlight: string; after?: string }[];
  subtitle: string;
};

export type LandingCopy = {
  nav: {
    pricing: string;
    signIn: string;
    startFree: string;
    languageAria: string;
  };
  hero: {
    eyebrow: string;
    ctaPrimary: string;
    ctaSecondary: string;
    disclaimer: string;
    carouselAria: string;
    showHeadlineAria: (n: number) => string;
  };
  socialProof: {
    eyebrow: string;
    storesSuffix: string;
    storesLabel: string;
    metrics: { label: string; detail: string }[];
  };
  liveActivity: {
    template: (city: string, message: string) => string;
    events: { id: string; city: string; message: string; timeAgo: string }[];
  };
  founderCard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    stats: { foundersJoined: string; spotsLeft: string; full: string; community: string };
    preview: { label: string; lead: string; badge: string; demoName: string; swipeHint: string };
    identity: { title: string; body: string };
    mobile: { benefitsLabel: string; benefitsLead: string; carouselAria: string };
    benefits: { title: string; description: string }[];
    cta: { claim: string; full: string; learnMore: string; signIn: string };
    footer: { full: string; remaining: (spots: number, max: number) => string };
  };
  whyEttajer: {
    eyebrow: string;
    title: string;
    subtitle: string;
    mobile: { exploreLabel: string; exploreLead: string; carouselAria: string };
    visualBuilder: { title: string; description: string; imageAlt: string; cta: string };
    features: { title: string; description: string }[];
    performance: { title: string; description: string; cta: string };
  };
  cod: {
    eyebrow: string;
    title: string;
    subtitle: string;
    subtitleDesktop: string;
    imageAlt: string;
    stats: { tools: string; steps: string; fees: string };
    feesValue: string;
    includedLabel: string;
    capabilities: string[];
    workflow: {
      label: string;
      lead: string;
      carouselAria: string;
      stepBadge: (step: string) => string;
      steps: { title: string; description: string }[];
    };
    cta: string;
  };
  hosting: {
    eyebrow: string;
    title: string;
    subtitle: string;
    imageAlt: string;
    stats: { load: string; uptime: string; regions: string; loadTime: string; edgeRegions: string };
    mobile: { highlightsLabel: string; highlightsLead: string; carouselAria: string };
    features: string[];
  };
  integrations: {
    eyebrow: string;
    title: string;
    subtitle: string;
    mobile: { partnerToolsLabel: string; partnerToolsLead: string; carouselAria: string };
    logoAlt: (name: string) => string;
    groups: { title: string; description: string }[];
  };
  showcase: {
    eyebrow: string;
    title: string;
    subtitle: string;
    mobile: { galleryLabel: string; galleryLead: string; carouselAria: string };
    stores: { name: string; category: string; description: string }[];
    storefrontAlt: (name: string) => string;
    cta: string;
  };
  merchants: {
    eyebrow: string;
    title: string;
    subtitle: string;
    mobile: { storiesLabel: string; storiesLead: string; carouselAria: string };
    testimonials: { name: string; role: string; store: string; city: string; quote: string; avatar: string }[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    billing: { monthly: string; annualMobile: string; annualDesktop: string };
    mobile: { choosePlanLabel: string; choosePlanLead: string; carouselAria: string };
    badge: { mostPopular: string };
    firstMonth: { label: string; value: string; then: string };
    footnote: { mobile: string; desktop: (includes: string) => string };
    everyPlanIncludes: string;
    includes: string[];
    plans: { name: string; description: string; cta: string; features: string[] }[];
    formatPrice: (amountUsd: number, currency: PricingCurrency, perMonth?: boolean) => string;
    formatSavings: (savedUsd: number, currency: PricingCurrency) => string;
    formatAnnualTotal: (totalUsd: number, currency: PricingCurrency) => string;
  };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    stillHaveQuestions: string;
    browseHelpCenter: string;
    browseHelpCenterCta: string;
    sidebarBody: string;
    items: { question: string; answer: string; category: string }[];
  };
  cta: {
    eyebrow: string;
    title: string;
    subtitle: string;
    startForFree: string;
    signIn: string;
  };
  footer: {
    tagline: string;
    copyright: (year: number) => string;
    mobile: {
      getStarted: string;
      startForFree: string;
      firstMonthSubtitle: string;
      explore: string;
      support: string;
      signInSubtitle: string;
    };
    nav: {
      platform: { title: string; links: Record<string, string> };
      features: { title: string; links: Record<string, string> };
      resources: { title: string; links: Record<string, string> };
      company: { title: string; links: Record<string, string> };
      legal: { title: string; links: Record<string, string> };
      support: { title: string; links: Record<string, string> };
    };
  };
  mobileNav: {
    openMenu: string;
    closeMenu: string;
    navigationMenu: string;
    close: string;
    tagline: string;
    startForFree: string;
    explore: string;
    account: string;
    support: string;
    language: string;
    createAccount: string;
    createAccountSubtitle: string;
    signInSubtitle: string;
    sections: Record<string, { label: string; subtitle: string }>;
    supportLinks: Record<string, string>;
  };
};

const EN_COPY: LandingCopy = {
  nav: {
    pricing: "Pricing",
    signIn: "Sign in",
    startFree: "Start free",
    languageAria: "Language",
  },
  hero: {
    eyebrow: "Built for Moroccan merchants",
    ctaPrimary: "Start for free",
    ctaSecondary: "See COD suite",
    disclaimer: "No credit card required · 0 DH first month on every plan",
    carouselAria: "Hero headlines",
    showHeadlineAria: (n) => `Show headline ${n}`,
  },
  socialProof: {
    eyebrow: "Trusted by Moroccan businesses",
    storesSuffix: " stores",
    storesLabel: "Moroccan stores powered by Ettajer",
    metrics: [
      { label: "Fewer fake COD orders", detail: "avg. after verification" },
      { label: "Median launch time", detail: "signup to live store" },
      { label: "Mobile conversion lift", detail: "vs. previous platforms" },
    ],
  },
  liveActivity: {
    template: (city, message) => `A merchant in ${city} ${message}`,
    events: [
      { id: "1", city: "Casablanca", message: "enabled COD verification", timeAgo: "2m ago" },
      { id: "2", city: "Rabat", message: "launched a new storefront", timeAgo: "5m ago" },
      { id: "3", city: "Marrakech", message: "confirmed 12 COD orders", timeAgo: "8m ago" },
      { id: "4", city: "Tanger", message: "connected Meta Pixel", timeAgo: "11m ago" },
      { id: "5", city: "Fès", message: "reduced fake orders by 43%", timeAgo: "14m ago" },
      { id: "6", city: "Agadir", message: "published their first product", timeAgo: "18m ago" },
    ],
  },
  founderCard: {
    eyebrow: "Early access",
    title: "Join the first 100 founders.",
    subtitle:
      "Create your account tonight and receive an exclusive Ettajer founder card — your permanent proof of being here from day one.",
    stats: {
      foundersJoined: "Founders joined",
      spotsLeft: "Spots left",
      full: "Full",
      community: "Community",
    },
    preview: {
      label: "Founder card preview",
      lead: "Tap to flip · Delivered by email after signup",
      badge: "Founder #0042 preview",
      demoName: "Your Name",
      swipeHint: "Swipe to view full card →",
    },
    identity: {
      title: "Your Ettajer identity starts here.",
      body: "Sign up free, activate your account, and unlock your personal founder card on the early access page. We also email your card image and a designed PDF certificate.",
    },
    mobile: {
      benefitsLabel: "What founders get",
      benefitsLead: "Swipe through member benefits",
      carouselAria: "Founder benefits",
    },
    benefits: [
      { title: "Founder card", description: "A premium digital member card with your permanent founder number." },
      { title: "Early access", description: "Try new features before public launch and shape the platform." },
      { title: "Priority support", description: "Direct line to the Ettajer team while we build." },
      { title: "Future rewards", description: "Exclusive perks from Ettajer and partner merchants." },
    ],
    cta: {
      claim: "Claim your founder card",
      full: "Founder program full",
      learnMore: "Learn more",
      signIn: "Already a founder? Sign in",
    },
    footer: {
      full: "All 100 founder spots are taken. You can still create an account and join the waitlist.",
      remaining: (spots, max) => `Only ${spots} of ${max} founder cards remaining · Free to join`,
    },
  },
  whyEttajer: {
    eyebrow: "Platform features",
    title: "Everything you need. Nothing you don't.",
    subtitle:
      "A focused toolkit for launching, selling, and scaling — without bloated plugins or disconnected apps.",
    mobile: {
      exploreLabel: "Explore the platform",
      exploreLead: "Swipe through core tools built for COD merchants",
      carouselAria: "Platform features",
    },
    visualBuilder: {
      title: "Visual builder",
      description:
        "Drag sections, tune spacing and colors, and publish a polished storefront without touching code.",
      imageAlt: "Designing a storefront",
      cta: "Try the editor",
    },
    features: [
      {
        title: "COD checkout",
        description:
          "Localized checkout with city, neighborhood, and phone fields — no payment gateway required.",
      },
      {
        title: "Fake order protection",
        description: "WhatsApp and SMS verification confirms buyers before you pack and ship.",
      },
      {
        title: "Order automation",
        description: "Status updates, notifications, and fulfillment workflows in one dashboard.",
      },
      {
        title: "Mobile-first storefront",
        description: "Every section is responsive so COD buyers convert on any device.",
      },
    ],
    performance: {
      title: "Blazing performance",
      description: "Optimized delivery keeps pages fast and SEO-ready from day one.",
      cta: "See hosting",
    },
  },
  cod: {
    eyebrow: "Cash on delivery",
    title: "The ultimate COD suite",
    subtitle: "Every tool Moroccan merchants need — from checkout to courier handoff.",
    subtitleDesktop:
      "Every tool Moroccan merchants need — from checkout to courier handoff. Verify orders, block fakes, and ship with confidence.",
    imageAlt: "Stacked shipping packages ready for dispatch",
    stats: { tools: "COD tools", steps: "Steps", fees: "Fees" },
    feesValue: "0 DH",
    includedLabel: "Included in every plan",
    capabilities: [
      "COD checkout",
      "WhatsApp verification",
      "SMS verification",
      "Fake order protection",
      "Address validation",
      "Order automation",
      "Courier integrations",
    ],
    workflow: {
      label: "How it works",
      lead: "Three steps from order to dispatch",
      carouselAria: "COD workflow",
      stepBadge: (step) => `Step ${step}`,
      steps: [
        {
          title: "COD checkout",
          description:
            "Buyers complete checkout with localized address fields. No card, no gateway setup.",
        },
        {
          title: "WhatsApp & SMS verification",
          description: "Customers confirm or cancel in one tap. Fake orders never reach your courier.",
        },
        {
          title: "Order automation & dispatch",
          description:
            "Verified orders flow to your dashboard with address validation and courier handoff.",
        },
      ],
    },
    cta: "Start with COD checkout",
  },
  hosting: {
    eyebrow: "Next-generation hosting",
    title: "Speed at the core of every transaction.",
    subtitle:
      "Pre-rendered, cached at the edge, and delivered globally — so buyers never wait at checkout.",
    imageAlt: "Digital marketing and analytics",
    stats: {
      load: "Load",
      uptime: "Uptime",
      regions: "Regions",
      loadTime: "Load time",
      edgeRegions: "Edge regions",
    },
    mobile: {
      highlightsLabel: "Performance highlights",
      highlightsLead: "Edge caching and global delivery for checkout speed",
      carouselAria: "Hosting features",
    },
    features: [
      "Pre-rendered storefront pages at the edge",
      "Automatic image optimization and caching",
      "Global CDN replication in real time",
      "Core Web Vitals tuned for checkout speed",
    ],
  },
  integrations: {
    eyebrow: "Integrations",
    title: "Connect the tools you already use.",
    subtitle: "Marketing pixels and analytics — wired in without plugins or custom code.",
    mobile: {
      partnerToolsLabel: "Partner tools",
      partnerToolsLead: "Pixels, analytics, and marketing integrations",
      carouselAria: "Integrations",
    },
    logoAlt: (name) => `${name} logo`,
    groups: [
      {
        title: "Marketing & analytics",
        description: "Track campaigns and attribute sales across ad platforms.",
      },
    ],
  },
  showcase: {
    eyebrow: "Storefront gallery",
    title: "Designed for exquisite taste.",
    subtitle:
      "High-converting presets you can customize — typography, spacing, and sections included.",
    mobile: {
      galleryLabel: "Template gallery",
      galleryLead: "Swipe through storefront presets",
      carouselAria: "Storefront showcase",
    },
    stores: [
      {
        name: "Mobile storefront",
        category: "App-ready layouts",
        description:
          "Clean product grids, collections, and checkout flows designed for phones first.",
      },
      {
        name: "Shopping experience",
        category: "Lifestyle retail",
        description: "Bright, editorial storefronts that feel personal and conversion-focused.",
      },
    ],
    storefrontAlt: (name) => `${name} storefront`,
    cta: "Start with a template",
  },
  merchants: {
    eyebrow: "Trusted by Moroccan businesses",
    title: "Real merchants. Real results.",
    subtitle:
      "From Casablanca to Agadir, Moroccan brands use Ettajer to launch faster, sell with COD, and grow with confidence.",
    mobile: {
      storiesLabel: "Merchant stories",
      storiesLead: "Real feedback from Moroccan store owners",
      carouselAria: "Merchant testimonials",
    },
    testimonials: [
      {
        name: "Yasmine El Amrani",
        role: "Founder",
        store: "Maison Yasmine",
        city: "Casablanca",
        quote:
          "We launched in one afternoon. WhatsApp COD verification alone cut our fake orders by nearly half.",
        avatar: "/landing/profiles/yasmine-el-amrani.jpg",
      },
      {
        name: "Karim Benali",
        role: "Owner",
        store: "Benali Gear",
        city: "Rabat",
        quote:
          "The builder is fast and clean. I redesigned our homepage without touching a single line of code.",
        avatar: "/landing/profiles/karim-benali.jpg",
      },
      {
        name: "Salma Idrissi",
        role: "Founder",
        store: "Idrissi Ceramics",
        city: "Fès",
        quote:
          "Our storefront finally feels premium. Customers trust the shop more and COD checkout is smoother.",
        avatar: "/landing/profiles/salma-idrissi.jpg",
      },
      {
        name: "Mehdi Alaoui",
        role: "Operations Lead",
        store: "Alaoui Essentials",
        city: "Marrakech",
        quote:
          "Orders, courier handoffs, and COD confirmations all live in one place. That saved us hours every week.",
        avatar: "/landing/profiles/mehdi-alaoui.jpg",
      },
      {
        name: "Nadia Cherkaoui",
        role: "Founder",
        store: "Cherkaoui Beauty",
        city: "Tanger",
        quote:
          "The first month at 0 DH let us test COD workflows properly before scaling our ad spend.",
        avatar: "/landing/profiles/nadia-cherkaoui.jpg",
      },
      {
        name: "Omar Tazi",
        role: "Co-founder",
        store: "Tazi Streetwear",
        city: "Agadir",
        quote:
          "Page speed is noticeably better than our old setup. Mobile COD sales picked up within the first week.",
        avatar: "/landing/profiles/omar-tazi.jpg",
      },
    ],
  },
  pricing: {
    eyebrow: "Simple pricing",
    title: "Three plans. Zero guesswork.",
    subtitle:
      "Start with a 0 DH first month on Starter, Growth, and Business. Every plan includes COD checkout, edge hosting, and the visual builder.",
    billing: {
      monthly: "Monthly",
      annualMobile: "Annual · -20%",
      annualDesktop: "Annually · Save 20%",
    },
    mobile: {
      choosePlanLabel: "Choose your plan",
      choosePlanLead: "Swipe to compare Starter, Growth, and Business",
      carouselAria: "Pricing plans",
    },
    badge: { mostPopular: "Most popular" },
    firstMonth: { label: "First month", value: "0 DH", then: "Then " },
    footnote: {
      mobile: "0 DH first month on every plan.",
      desktop: (includes) => `0 DH first month on every plan. All plans include ${includes}.`,
    },
    everyPlanIncludes: "Every plan includes",
    includes: [
      "0% fees on Growth & Business",
      "SSL security",
      "Edge hosting",
      "COD-ready checkout",
    ],
    plans: LANDING_PRICING_PLANS.map((p) => ({
      name: p.name,
      description: p.description,
      cta: p.cta,
      features: [...p.features],
    })),
    formatPrice: (amountUsd, currency, perMonth) => {
      if (currency === "MAD") {
        const mad = amountUsd * USD_TO_MAD;
        return perMonth ? `${mad} MAD/mo` : `${mad} MAD`;
      }
      return perMonth ? `$${amountUsd}/mo` : `$${amountUsd}`;
    },
    formatSavings: (savedUsd, currency) => {
      if (currency === "MAD") return `Save ${savedUsd * USD_TO_MAD} MAD/year`;
      return `Save $${savedUsd}/year`;
    },
    formatAnnualTotal: (totalUsd, currency) => {
      if (currency === "MAD") return `${totalUsd * USD_TO_MAD} MAD/year`;
      return `$${totalUsd}/year`;
    },
  },
  faq: {
    eyebrow: "Help center",
    title: "Frequently asked questions",
    subtitle: "Quick answers about setup, pricing, migration, and launch.",
    stillHaveQuestions: "Still have questions?",
    browseHelpCenter: "Browse the help center",
    browseHelpCenterCta: "Browse help center",
    sidebarBody:
      "We can help you pick a plan, migrate your catalog, or configure COD checkout.",
    items: [
      {
        category: "Setup",
        question: "How fast can I launch with COD?",
        answer:
          "Most merchants go live in under five minutes. Sign up, add products, enable COD checkout, and publish your storefront. WhatsApp and SMS verification can be turned on immediately — no payment gateway or developer required.",
      },
      {
        category: "COD",
        question: "How does Ettajer reduce fake COD orders?",
        answer:
          "After checkout, buyers confirm or cancel via WhatsApp or SMS before you ship. Invalid numbers and unverified orders stay out of your fulfillment queue. Merchants typically see a sharp drop in refused deliveries and courier fees wasted on fake orders.",
      },
      {
        category: "Domains",
        question: "Can I connect my own domain?",
        answer:
          "Yes — on every plan. Add your domain in Settings, update DNS, and Ettajer provisions SSL automatically. Your store stays on the same edge network, so checkout speed and COD conversion are not affected.",
      },
      {
        category: "Migration",
        question: "Can I migrate from Shopify or WooCommerce?",
        answer:
          "Yes. Import products via CSV or connect Shopify directly. We preserve titles, images, variants, and URLs where possible so you do not lose search rankings. Rebuild your storefront in the visual builder — most migrations are done in a single day.",
      },
      {
        category: "Pricing",
        question: "Do you charge transaction fees?",
        answer:
          "Growth and Business plans include 0% Ettajer transaction fees — you keep more of every COD and card sale. Starter includes a small platform fee. Card processing fees from Stripe still apply only if you accept online payments.",
      },
      {
        category: "Growth",
        question: "What makes Ettajer better for Morocco than Shopify?",
        answer:
          "Ettajer is built around COD: localized checkout fields, WhatsApp verification, fake order protection, address validation, and order automation out of the box. No plugins, no workarounds — just a storefront and admin designed for how Moroccan merchants actually sell.",
      },
    ],
  },
  cta: {
    eyebrow: "Launch today",
    title: "Ready to build?",
    subtitle: "COD checkout, verification, and a visual builder — ready in minutes.",
    startForFree: "Start for free",
    signIn: "Sign in",
  },
  footer: {
    tagline:
      "COD-first ecommerce for Moroccan merchants — launch, verify, and fulfill from one platform.",
    copyright: (year) => `© ${year} Ettajer. All rights reserved.`,
    mobile: {
      getStarted: "Get started",
      startForFree: "Start for free",
      firstMonthSubtitle: "0 DH first month",
      explore: "Explore",
      support: "Support",
      signInSubtitle: "Access your dashboard",
    },
    nav: {
      platform: {
        title: "Platform",
        links: {
          features: "Features",
          templates: "Templates",
          integrations: "Integrations",
          pricing: "Pricing",
        },
      },
      features: {
        title: "Features",
        links: {
          codSuite: "COD suite",
          visualBuilder: "Visual builder",
          orderManagement: "Order management",
          performance: "Performance",
        },
      },
      resources: {
        title: "Resources",
        links: {
          helpCenter: "Help center",
          founderCard: "Founder card",
          contactSupport: "Contact support",
          faq: "FAQ",
          migration: "Migration",
        },
      },
      company: {
        title: "Company",
        links: {
          merchants: "Merchants",
          about: "About",
          signUp: "Sign up",
          signIn: "Sign in",
        },
      },
      legal: {
        title: "Legal",
        links: {
          privacy: "Privacy",
          terms: "Terms",
          cookies: "Cookies",
          apiDocs: "API docs",
        },
      },
      support: {
        title: "Support",
        links: {
          getHelp: "Get help",
          contact: "Contact",
          emailSupport: "Email support",
        },
      },
    },
  },
  mobileNav: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    navigationMenu: "Navigation menu",
    close: "Close",
    tagline: "COD-first ecommerce for Moroccan merchants",
    startForFree: "Start for free",
    explore: "Explore",
    account: "Account",
    support: "Support",
    language: "Language",
    createAccount: "Create account",
    createAccountSubtitle: "0 DH first month · Join founders",
    signInSubtitle: "Access your dashboard",
    sections: {
      founderCard: { label: "Founder card", subtitle: "First 100 members" },
      features: { label: "Features", subtitle: "Builder & tools" },
      cod: { label: "COD", subtitle: "Cash on delivery" },
      gallery: { label: "Gallery", subtitle: "Storefront presets" },
      pricing: { label: "Pricing", subtitle: "0 DH first month" },
      faq: { label: "FAQ", subtitle: "Quick answers" },
    },
    supportLinks: {
      helpCenter: "Help center",
      contactSupport: "Contact support",
    },
  },
};

const FR_COPY: LandingCopy = {
  ...EN_COPY,
  nav: {
    pricing: "Tarifs",
    signIn: "Se connecter",
    startFree: "Commencer",
    languageAria: "Langue",
  },
  hero: {
    eyebrow: "Conçu pour les marchands marocains",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Voir la suite COD",
    disclaimer: "Sans carte bancaire · 0 DH le premier mois sur chaque forfait",
    carouselAria: "Titres principaux",
    showHeadlineAria: (n) => `Afficher le titre ${n}`,
  },
  socialProof: {
    eyebrow: "Plébiscité par les entreprises marocaines",
    storesSuffix: " boutiques",
    storesLabel: "Boutiques marocaines propulsées par Ettajer",
    metrics: [
      { label: "Moins de fausses commandes COD", detail: "en moy. après vérification" },
      { label: "Temps de lancement médian", detail: "inscription à boutique en ligne" },
      { label: "Hausse conversion mobile", detail: "vs. anciennes plateformes" },
    ],
  },
  liveActivity: {
    template: (city, message) => `Un marchand à ${city} ${message}`,
    events: [
      { id: "1", city: "Casablanca", message: "a activé la vérification COD", timeAgo: "il y a 2 min" },
      { id: "2", city: "Rabat", message: "a lancé une nouvelle boutique", timeAgo: "il y a 5 min" },
      { id: "3", city: "Marrakech", message: "a confirmé 12 commandes COD", timeAgo: "il y a 8 min" },
      { id: "4", city: "Tanger", message: "a connecté Meta Pixel", timeAgo: "il y a 11 min" },
      { id: "5", city: "Fès", message: "a réduit les fausses commandes de 43 %", timeAgo: "il y a 14 min" },
      { id: "6", city: "Agadir", message: "a publié son premier produit", timeAgo: "il y a 18 min" },
    ],
  },
  founderCard: {
    eyebrow: "Accès anticipé",
    title: "Rejoignez les 100 premiers fondateurs.",
    subtitle:
      "Créez votre compte ce soir et recevez une carte fondateur Ettajer exclusive — la preuve permanente que vous étiez là dès le premier jour.",
    stats: {
      foundersJoined: "Fondateurs inscrits",
      spotsLeft: "Places restantes",
      full: "Complet",
      community: "Communauté",
    },
    preview: {
      label: "Aperçu de la carte fondateur",
      lead: "Appuyez pour retourner · Envoyée par e-mail après inscription",
      badge: "Aperçu Fondateur n°0042",
      demoName: "Votre nom",
      swipeHint: "Glissez pour voir la carte →",
    },
    identity: {
      title: "Votre identité Ettajer commence ici.",
      body: "Inscrivez-vous gratuitement, activez votre compte et débloquez votre carte fondateur sur la page d'accès anticipé. Nous envoyons aussi l'image de la carte et un certificat PDF par e-mail.",
    },
    mobile: {
      benefitsLabel: "Ce que reçoivent les fondateurs",
      benefitsLead: "Parcourez les avantages membres",
      carouselAria: "Avantages fondateur",
    },
    benefits: [
      {
        title: "Carte fondateur",
        description: "Une carte membre numérique premium avec votre numéro fondateur permanent.",
      },
      {
        title: "Accès anticipé",
        description: "Testez les nouvelles fonctionnalités avant le lancement public.",
      },
      {
        title: "Support prioritaire",
        description: "Ligne directe avec l'équipe Ettajer pendant que nous construisons la plateforme.",
      },
      {
        title: "Récompenses futures",
        description: "Avantages exclusifs d'Ettajer et de partenaires marchands.",
      },
    ],
    cta: {
      claim: "Obtenir ma carte fondateur",
      full: "Programme fondateur complet",
      learnMore: "En savoir plus",
      signIn: "Déjà fondateur ? Se connecter",
    },
    footer: {
      full: "Les 100 places fondateur sont prises. Vous pouvez toujours créer un compte et rejoindre la liste d'attente.",
      remaining: (spots, max) =>
        `Plus que ${spots} cartes fondateur sur ${max} · Inscription gratuite`,
    },
  },
  whyEttajer: {
    eyebrow: "Fonctionnalités",
    title: "Tout ce qu'il vous faut. Rien de superflu.",
    subtitle:
      "Une boîte à outils ciblée pour lancer, vendre et grandir — sans plugins lourds ni applications déconnectées.",
    mobile: {
      exploreLabel: "Explorer la plateforme",
      exploreLead: "Parcourez les outils essentiels pour le COD",
      carouselAria: "Fonctionnalités plateforme",
    },
    visualBuilder: {
      title: "Éditeur visuel",
      description:
        "Glissez des sections, ajustez couleurs et espacements, et publiez une boutique soignée sans code.",
      imageAlt: "Conception d'une boutique en ligne",
      cta: "Essayer l'éditeur",
    },
    features: [
      {
        title: "Paiement à la livraison",
        description:
          "Checkout localisé avec ville, quartier et téléphone — aucune passerelle de paiement requise.",
      },
      {
        title: "Protection anti-fausses commandes",
        description:
          "Vérification WhatsApp et SMS avant d'emballer et d'expédier.",
      },
      {
        title: "Automatisation des commandes",
        description:
          "Statuts, notifications et flux de livraison dans un seul tableau de bord.",
      },
      {
        title: "Boutique mobile-first",
        description:
          "Chaque section est responsive pour convertir les acheteurs COD sur tout appareil.",
      },
    ],
    performance: {
      title: "Performances éclairs",
      description:
        "Une livraison optimisée garde vos pages rapides et prêtes pour le SEO dès le premier jour.",
      cta: "Voir l'hébergement",
    },
  },
  cod: {
    eyebrow: "Paiement à la livraison",
    title: "La suite COD ultime",
    subtitle:
      "Tous les outils dont les marchands marocains ont besoin — du checkout à la remise au livreur.",
    subtitleDesktop:
      "Tous les outils dont les marchands marocains ont besoin — du checkout à la remise au livreur. Vérifiez, bloquez les fausses commandes et expédiez en confiance.",
    imageAlt: "Colis prêts pour expédition",
    stats: { tools: "Outils COD", steps: "Étapes", fees: "Frais" },
    feesValue: "0 DH",
    includedLabel: "Inclus dans chaque forfait",
    capabilities: [
      "Checkout COD",
      "Vérification WhatsApp",
      "Vérification SMS",
      "Protection anti-fausses commandes",
      "Validation d'adresse",
      "Automatisation des commandes",
      "Intégrations livreurs",
    ],
    workflow: {
      label: "Comment ça marche",
      lead: "Trois étapes de la commande à l'expédition",
      carouselAria: "Parcours COD",
      stepBadge: (step) => `Étape ${step}`,
      steps: [
        {
          title: "Checkout COD",
          description:
            "Les acheteurs passent commande avec des champs d'adresse localisés. Sans carte, sans passerelle.",
        },
        {
          title: "Vérification WhatsApp & SMS",
          description:
            "Les clients confirment ou annulent en un clic. Les fausses commandes n'atteignent jamais le livreur.",
        },
        {
          title: "Automatisation & expédition",
          description:
            "Les commandes vérifiées arrivent dans votre tableau de bord avec validation d'adresse et remise au livreur.",
        },
      ],
    },
    cta: "Commencer avec le COD",
  },
  hosting: {
    eyebrow: "Hébergement nouvelle génération",
    title: "La vitesse au cœur de chaque transaction.",
    subtitle:
      "Pré-rendu, mis en cache en périphérie et livré mondialement — les acheteurs n'attendent jamais au checkout.",
    imageAlt: "Marketing digital et analytique",
    stats: {
      load: "Chargement",
      uptime: "Disponibilité",
      regions: "Régions",
      loadTime: "Temps de chargement",
      edgeRegions: "Régions edge",
    },
    mobile: {
      highlightsLabel: "Points forts performance",
      highlightsLead: "Cache edge et livraison globale pour un checkout rapide",
      carouselAria: "Fonctionnalités hébergement",
    },
    features: [
      "Pages boutique pré-rendues en périphérie",
      "Optimisation et cache d'images automatiques",
      "Réplication CDN mondiale en temps réel",
      "Core Web Vitals optimisés pour le checkout",
    ],
  },
  integrations: {
    eyebrow: "Intégrations",
    title: "Connectez les outils que vous utilisez déjà.",
    subtitle:
      "Pixels marketing et analytique — branchés sans plugins ni code personnalisé.",
    mobile: {
      partnerToolsLabel: "Outils partenaires",
      partnerToolsLead: "Pixels, analytique et intégrations marketing",
      carouselAria: "Intégrations",
    },
    logoAlt: (name) => `Logo ${name}`,
    groups: [
      {
        title: "Marketing & analytique",
        description: "Suivez vos campagnes et attribuez les ventes sur les plateformes publicitaires.",
      },
    ],
  },
  showcase: {
    eyebrow: "Galerie de boutiques",
    title: "Conçu pour les goûts exigeants.",
    subtitle:
      "Des modèles à fort taux de conversion — typographie, espacements et sections inclus.",
    mobile: {
      galleryLabel: "Galerie de modèles",
      galleryLead: "Parcourez les modèles de boutique",
      carouselAria: "Vitrine boutiques",
    },
    stores: [
      {
        name: "Boutique mobile",
        category: "Mises en page app-ready",
        description:
          "Grilles produits, collections et checkout pensés pour le mobile en premier.",
      },
      {
        name: "Expérience shopping",
        category: "Retail lifestyle",
        description:
          "Boutiques éditoriales lumineuses, personnelles et orientées conversion.",
      },
    ],
    storefrontAlt: (name) => `Boutique ${name}`,
    cta: "Commencer avec un modèle",
  },
  merchants: {
    eyebrow: "Plébiscité par les entreprises marocaines",
    title: "De vrais marchands. De vrais résultats.",
    subtitle:
      "De Casablanca à Agadir, les marques marocaines utilisent Ettajer pour lancer plus vite, vendre en COD et grandir sereinement.",
    mobile: {
      storiesLabel: "Témoignages marchands",
      storiesLead: "Retours d'expérience de propriétaires de boutiques marocaines",
      carouselAria: "Témoignages marchands",
    },
    testimonials: [
      {
        name: "Yasmine El Amrani",
        role: "Fondatrice",
        store: "Maison Yasmine",
        city: "Casablanca",
        quote:
          "Nous avons lancé en un après-midi. La vérification COD WhatsApp a réduit nos fausses commandes de près de moitié.",
        avatar: "/landing/profiles/yasmine-el-amrani.jpg",
      },
      {
        name: "Karim Benali",
        role: "Propriétaire",
        store: "Benali Gear",
        city: "Rabat",
        quote:
          "L'éditeur est rapide et épuré. J'ai refait notre page d'accueil sans une ligne de code.",
        avatar: "/landing/profiles/karim-benali.jpg",
      },
      {
        name: "Salma Idrissi",
        role: "Fondatrice",
        store: "Idrissi Ceramics",
        city: "Fès",
        quote:
          "Notre boutique a enfin l'air premium. Les clients nous font plus confiance et le checkout COD est plus fluide.",
        avatar: "/landing/profiles/salma-idrissi.jpg",
      },
      {
        name: "Mehdi Alaoui",
        role: "Responsable opérations",
        store: "Alaoui Essentials",
        city: "Marrakech",
        quote:
          "Commandes, livreurs et confirmations COD au même endroit. Ça nous a fait gagner des heures chaque semaine.",
        avatar: "/landing/profiles/mehdi-alaoui.jpg",
      },
      {
        name: "Nadia Cherkaoui",
        role: "Fondatrice",
        store: "Cherkaoui Beauty",
        city: "Tanger",
        quote:
          "Le premier mois à 0 DH nous a permis de tester le COD avant d'augmenter nos dépenses pub.",
        avatar: "/landing/profiles/nadia-cherkaoui.jpg",
      },
      {
        name: "Omar Tazi",
        role: "Co-fondateur",
        store: "Tazi Streetwear",
        city: "Agadir",
        quote:
          "La vitesse des pages est nettement meilleure. Les ventes COD mobile ont décollé dès la première semaine.",
        avatar: "/landing/profiles/omar-tazi.jpg",
      },
    ],
  },
  pricing: {
    eyebrow: "Tarifs simples",
    title: "Trois forfaits. Zéro surprise.",
    subtitle:
      "0 DH le premier mois sur Starter, Growth et Business. Chaque forfait inclut checkout COD, hébergement edge et éditeur visuel.",
    billing: {
      monthly: "Mensuel",
      annualMobile: "Annuel · -20 %",
      annualDesktop: "Annuel · Économisez 20 %",
    },
    mobile: {
      choosePlanLabel: "Choisissez votre forfait",
      choosePlanLead: "Comparez Starter, Growth et Business",
      carouselAria: "Forfaits tarifaires",
    },
    badge: { mostPopular: "Le plus populaire" },
    firstMonth: { label: "Premier mois", value: "0 DH", then: "Puis " },
    footnote: {
      mobile: "0 DH le premier mois sur chaque forfait.",
      desktop: (includes) =>
        `0 DH le premier mois sur chaque forfait. Tous les forfaits incluent ${includes}.`,
    },
    everyPlanIncludes: "Chaque forfait inclut",
    includes: [
      "0 % de frais sur Growth & Business",
      "Sécurité SSL",
      "Hébergement edge",
      "Checkout prêt pour le COD",
    ],
    plans: [
      {
        name: "Starter",
        description: "Lancez votre première boutique et validez votre catalogue en COD.",
        cta: "Choisir Starter",
        features: [
          "Checkout COD inclus",
          "Jusqu'à 100 produits",
          "1 domaine personnalisé",
          "Éditeur visuel de boutique",
        ],
      },
      {
        name: "Growth",
        description: "Grandissez avec 0 % de frais plateforme et l'automatisation COD complète.",
        cta: "Choisir Growth",
        features: [
          "0 % de frais de transaction Ettajer",
          "Vérification WhatsApp & SMS",
          "Produits illimités",
          "3 domaines personnalisés",
          "Automatisation des commandes",
        ],
      },
      {
        name: "Business",
        description: "Opérations COD à fort volume avec support dédié.",
        cta: "Choisir Business",
        features: [
          "0 % de frais de transaction Ettajer",
          "Intégrations livreurs",
          "Boutiques et domaines illimités",
          "Conciergerie migration",
          "Gestionnaire de compte dédié",
        ],
      },
    ],
    formatPrice: (amountUsd, currency, perMonth) => {
      if (currency === "MAD") {
        const mad = amountUsd * USD_TO_MAD;
        return perMonth ? `${mad} MAD/mois` : `${mad} MAD`;
      }
      return perMonth ? `${amountUsd} $/mois` : `${amountUsd} $`;
    },
    formatSavings: (savedUsd, currency) => {
      if (currency === "MAD") return `Économisez ${savedUsd * USD_TO_MAD} MAD/an`;
      return `Économisez ${savedUsd} $/an`;
    },
    formatAnnualTotal: (totalUsd, currency) => {
      if (currency === "MAD") return `${totalUsd * USD_TO_MAD} MAD/an`;
      return `${totalUsd} $/an`;
    },
  },
  faq: {
    eyebrow: "Centre d'aide",
    title: "Questions fréquentes",
    subtitle: "Réponses rapides sur la configuration, les tarifs, la migration et le lancement.",
    stillHaveQuestions: "Encore des questions ?",
    browseHelpCenter: "Parcourir le centre d'aide",
    browseHelpCenterCta: "Centre d'aide",
    sidebarBody:
      "Nous pouvons vous aider à choisir un forfait, migrer votre catalogue ou configurer le COD.",
    items: [
      {
        category: "Configuration",
        question: "En combien de temps puis-je lancer avec le COD ?",
        answer:
          "La plupart des marchands sont en ligne en moins de cinq minutes. Inscrivez-vous, ajoutez des produits, activez le checkout COD et publiez votre boutique. La vérification WhatsApp et SMS est disponible immédiatement — sans passerelle ni développeur.",
      },
      {
        category: "COD",
        question: "Comment Ettajer réduit-il les fausses commandes COD ?",
        answer:
          "Après le checkout, les acheteurs confirment ou annulent via WhatsApp ou SMS avant expédition. Les numéros invalides et commandes non vérifiées restent hors de votre file de préparation. Les marchands constatent une forte baisse des refus à la livraison.",
      },
      {
        category: "Domaines",
        question: "Puis-je connecter mon propre domaine ?",
        answer:
          "Oui — sur chaque forfait. Ajoutez votre domaine dans les Paramètres, mettez à jour le DNS et Ettajer provisionne le SSL automatiquement. Votre boutique reste sur le même réseau edge.",
      },
      {
        category: "Migration",
        question: "Puis-je migrer depuis Shopify ou WooCommerce ?",
        answer:
          "Oui. Importez via CSV ou connectez Shopify directement. Nous conservons titres, images, variantes et URLs quand c'est possible. Reconstruisez votre vitrine dans l'éditeur visuel — la plupart des migrations se font en une journée.",
      },
      {
        category: "Tarifs",
        question: "Facturez-vous des frais de transaction ?",
        answer:
          "Les forfaits Growth et Business incluent 0 % de frais Ettajer — vous gardez plus sur chaque vente COD ou carte. Starter inclut de petits frais plateforme. Les frais Stripe s'appliquent uniquement si vous acceptez les paiements en ligne.",
      },
      {
        category: "Croissance",
        question: "Pourquoi Ettajer est-il meilleur pour le Maroc que Shopify ?",
        answer:
          "Ettajer est pensé pour le COD : champs de checkout localisés, vérification WhatsApp, protection anti-fausses commandes, validation d'adresse et automatisation incluses. Pas de plugins — une vitrine et un admin conçus pour la vente marocaine.",
      },
    ],
  },
  cta: {
    eyebrow: "Lancez-vous aujourd'hui",
    title: "Prêt à construire ?",
    subtitle: "Checkout COD, vérification et éditeur visuel — prêts en quelques minutes.",
    startForFree: "Commencer gratuitement",
    signIn: "Se connecter",
  },
  footer: {
    tagline:
      "E-commerce COD pour marchands marocains — lancez, vérifiez et livrez depuis une seule plateforme.",
    copyright: (year) => `© ${year} Ettajer. Tous droits réservés.`,
    mobile: {
      getStarted: "Commencer",
      startForFree: "Commencer gratuitement",
      firstMonthSubtitle: "0 DH le premier mois",
      explore: "Explorer",
      support: "Support",
      signInSubtitle: "Accédez à votre tableau de bord",
    },
    nav: {
      platform: {
        title: "Plateforme",
        links: {
          features: "Fonctionnalités",
          templates: "Modèles",
          integrations: "Intégrations",
          pricing: "Tarifs",
        },
      },
      features: {
        title: "Fonctionnalités",
        links: {
          codSuite: "Suite COD",
          visualBuilder: "Éditeur visuel",
          orderManagement: "Gestion commandes",
          performance: "Performance",
        },
      },
      resources: {
        title: "Ressources",
        links: {
          helpCenter: "Centre d'aide",
          founderCard: "Carte fondateur",
          contactSupport: "Contacter le support",
          faq: "FAQ",
          migration: "Migration",
        },
      },
      company: {
        title: "Entreprise",
        links: {
          merchants: "Marchands",
          about: "À propos",
          signUp: "S'inscrire",
          signIn: "Se connecter",
        },
      },
      legal: {
        title: "Légal",
        links: {
          privacy: "Confidentialité",
          terms: "Conditions",
          cookies: "Cookies",
          apiDocs: "Docs API",
        },
      },
      support: {
        title: "Support",
        links: {
          getHelp: "Obtenir de l'aide",
          contact: "Contact",
          emailSupport: "E-mail support",
        },
      },
    },
  },
  mobileNav: {
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    navigationMenu: "Menu de navigation",
    close: "Fermer",
    tagline: "E-commerce COD pour marchands marocains",
    startForFree: "Commencer gratuitement",
    explore: "Explorer",
    account: "Compte",
    support: "Support",
    language: "Langue",
    createAccount: "Créer un compte",
    createAccountSubtitle: "0 DH le 1er mois · Rejoignez les fondateurs",
    signInSubtitle: "Accédez à votre tableau de bord",
    sections: {
      founderCard: { label: "Carte fondateur", subtitle: "100 premiers membres" },
      features: { label: "Fonctionnalités", subtitle: "Éditeur & outils" },
      cod: { label: "COD", subtitle: "Paiement à la livraison" },
      gallery: { label: "Galerie", subtitle: "Modèles de boutique" },
      pricing: { label: "Tarifs", subtitle: "0 DH le 1er mois" },
      faq: { label: "FAQ", subtitle: "Réponses rapides" },
    },
    supportLinks: {
      helpCenter: "Centre d'aide",
      contactSupport: "Contacter le support",
    },
  },
};

const HERO_SLIDES_EN: HeroSlide[] = [
  {
    lines: [
      { before: "Build your brand and sell to customers", highlight: "", after: "" },
      { before: "around the ", highlight: "world", after: " — from one beautiful storefront." },
    ],
    subtitle:
      "Reach buyers across Morocco and beyond with a polished store, localized checkout, and tools built for cross-border growth.",
  },
  {
    lines: [
      { before: "Create, publish, and sell ", highlight: "digital", after: " products" },
      { before: "that deliver instantly and scale without limits.", highlight: "", after: "" },
    ],
    subtitle:
      "Courses, templates, downloads, and subscriptions — launch fast, accept payment your way, and keep every sale in one dashboard.",
  },
  {
    lines: [
      { before: "Run a ", highlight: "dropshipping", after: " business without warehouses," },
      { before: "without plugins, and without the operational headache.", highlight: "", after: "" },
    ],
    subtitle:
      "Source products, automate orders, and fulfill from anywhere — Ettajer handles the store, you handle the growth.",
  },
  {
    lines: [
      { before: "", highlight: "COD", after: " commerce for Moroccan merchants," },
      {
        before: "beautifully built to verify orders, fulfill faster, and grow with confidence.",
        highlight: "",
        after: "",
      },
    ],
    subtitle:
      "Native cash-on-delivery checkout, WhatsApp and SMS verification, and order automation — no payment gateway required.",
  },
];

const HERO_SLIDES_FR: HeroSlide[] = [
  {
    lines: [
      { before: "Construisez votre marque et vendez à des clients", highlight: "", after: "" },
      { before: "partout dans le ", highlight: "monde", after: " — depuis une belle boutique en ligne." },
    ],
    subtitle:
      "Touchez des acheteurs au Maroc et au-delà avec une boutique soignée, un checkout localisé et des outils pensés pour l'international.",
  },
  {
    lines: [
      { before: "Créez, publiez et vendez des produits ", highlight: "numériques", after: "" },
      { before: "livrés instantanément et sans limites.", highlight: "", after: "" },
    ],
    subtitle:
      "Formations, modèles, téléchargements et abonnements — lancez vite, encaissez à votre façon et centralisez chaque vente.",
  },
  {
    lines: [
      { before: "Lancez un business de ", highlight: "dropshipping", after: " sans entrepôt," },
      { before: "sans plugins et sans charge opérationnelle.", highlight: "", after: "" },
    ],
    subtitle:
      "Sourcez vos produits, automatisez les commandes et livrez de partout — Ettajer gère la boutique, vous gérez la croissance.",
  },
  {
    lines: [
      { before: "Le commerce ", highlight: "COD", after: " pour les marchands marocains," },
      {
        before: "conçu pour vérifier, livrer plus vite et grandir en confiance.",
        highlight: "",
        after: "",
      },
    ],
    subtitle:
      "Checkout paiement à la livraison natif, vérification WhatsApp et SMS, et automatisation — sans passerelle de paiement.",
  },
];

const PLATFORM_FEATURE_ICONS = [Truck, ShieldCheck, Package, Smartphone] as const;
const COD_CAPABILITY_ICONS = [
  Truck,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Navigation,
  RefreshCw,
  MapPin,
] as const;
const COD_WORKFLOW_ICONS = [Truck, MessageCircle, MapPin] as const;

export type LandingContent = {
  heroSlides: HeroSlide[];
  platformFeatures: { icon: LucideIcon; title: string; description: string }[];
  codCapabilities: { icon: LucideIcon; label: string }[];
  codWorkflowSteps: { step: string; icon: LucideIcon; title: string; description: string }[];
  storeShowcases: { name: string; category: string; description: string; image: string; featured: boolean }[];
  hostingFeatures: string[];
  integrationGroups: { title: string; description: string; items: typeof baseIntegrationGroups[0]["items"] }[];
  pricingPlans: (PricingPlan & { localizedName: string; localizedDescription: string; localizedCta: string; localizedFeatures: string[] })[];
  merchantMetrics: { value: number; suffix: string; label: string; detail: string }[];
  storeCounterLabel: string;
};

const STORE_IMAGES = {
  storefrontShowcase: "/landing/storefront-showcase.jpg",
  shopping: "/landing/shopping.jpg",
} as const;

export function toLandingLocale(value: string): LandingLocale {
  const normalized = value.trim().toLowerCase();
  if (normalized === "fr") return "fr";
  if (normalized === "ar") return "ar";
  return "en";
}

export function toSelectorValue(locale: LandingLocale): string {
  return locale.toUpperCase();
}

export { getLandingSeo } from "@/lib/landing/landing-seo";

export function getLandingCopy(locale: LandingLocale): LandingCopy {
  if (locale === "fr") return FR_COPY;
  if (locale === "ar") return AR_COPY;
  return EN_COPY;
}

export function getHeroSlides(locale: LandingLocale): HeroSlide[] {
  if (locale === "fr") return HERO_SLIDES_FR;
  if (locale === "ar") return HERO_SLIDES_AR;
  return HERO_SLIDES_EN;
}

export function isLandingRtl(locale: LandingLocale): boolean {
  return locale === "ar";
}

export function getLandingDir(locale: LandingLocale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getLandingLang(locale: LandingLocale): string {
  if (locale === "ar") return "ar";
  if (locale === "fr") return "fr";
  return "en";
}

export function buildLandingContent(locale: LandingLocale): LandingContent {
  const copy = getLandingCopy(locale);

  return {
    heroSlides: getHeroSlides(locale),
    platformFeatures: copy.whyEttajer.features.map((feature, index) => ({
      ...feature,
      icon: PLATFORM_FEATURE_ICONS[index] ?? Truck,
    })),
    codCapabilities: copy.cod.capabilities.map((label, index) => ({
      label,
      icon: COD_CAPABILITY_ICONS[index] ?? Truck,
    })),
    codWorkflowSteps: copy.cod.workflow.steps.map((step, index) => ({
      step: String(index + 1).padStart(2, "0"),
      title: step.title,
      description: step.description,
      icon: COD_WORKFLOW_ICONS[index] ?? Truck,
    })),
    storeShowcases: copy.showcase.stores.map((store, index) => ({
      ...store,
      image: index === 0 ? STORE_IMAGES.storefrontShowcase : STORE_IMAGES.shopping,
      featured: index === 0,
    })),
    hostingFeatures: copy.hosting.features,
    integrationGroups: baseIntegrationGroups.map((group, index) => ({
      ...group,
      title: copy.integrations.groups[index]?.title ?? group.title,
      description: copy.integrations.groups[index]?.description ?? group.description,
    })),
    pricingPlans: LANDING_PRICING_PLANS.map((plan, index) => {
      const localized = copy.pricing.plans[index];
      return {
        ...plan,
        localizedName: localized?.name ?? plan.name,
        localizedDescription: localized?.description ?? plan.description,
        localizedCta: localized?.cta ?? plan.cta,
        localizedFeatures: localized?.features ?? [...plan.features],
      };
    }),
    merchantMetrics: [
      { value: 47, suffix: "%", label: copy.socialProof.metrics[0].label, detail: copy.socialProof.metrics[0].detail },
      { value: 5, suffix: locale === "ar" ? " د" : " min", label: copy.socialProof.metrics[1].label, detail: copy.socialProof.metrics[1].detail },
      { value: 2.4, suffix: "×", label: copy.socialProof.metrics[2].label, detail: copy.socialProof.metrics[2].detail },
    ],
    storeCounterLabel: copy.socialProof.storesLabel,
  };
}

export function getFooterNavGroups(locale: LandingLocale) {
  const copy = getLandingCopy(locale).footer.nav;
  return [
    {
      title: copy.platform.title,
      links: [
        { label: copy.platform.links.features, href: "#why-ettajer" },
        { label: copy.platform.links.templates, href: "#showcase" },
        { label: copy.platform.links.integrations, href: "#integrations" },
        { label: copy.platform.links.pricing, href: "#pricing" },
      ],
    },
    {
      title: copy.features.title,
      links: [
        { label: copy.features.links.codSuite, href: "#cod-suite" },
        { label: copy.features.links.visualBuilder, href: "#why-ettajer" },
        { label: copy.features.links.orderManagement, href: "#cod-suite" },
        { label: copy.features.links.performance, href: "#hosting" },
      ],
    },
    {
      title: copy.resources.title,
      links: [
        { label: copy.resources.links.helpCenter, href: "/help" },
        { label: copy.resources.links.founderCard, href: "/founder-card" },
        { label: copy.resources.links.contactSupport, href: "/contact" },
        { label: copy.resources.links.faq, href: "#faq" },
        { label: copy.resources.links.migration, href: "/help/migrate-from-shopify" },
      ],
    },
    {
      title: copy.company.title,
      links: [
        { label: copy.company.links.merchants, href: "#merchants" },
        { label: copy.company.links.about, href: "#about" },
        { label: copy.company.links.signUp, href: "/signup" },
        { label: copy.company.links.signIn, href: "/login" },
      ],
    },
    {
      title: copy.legal.title,
      links: [
        { label: copy.legal.links.privacy, href: "/privacy" },
        { label: copy.legal.links.terms, href: "/terms" },
        { label: copy.legal.links.cookies, href: "/cookies" },
        { label: copy.legal.links.apiDocs, href: "#" },
      ],
    },
    {
      title: copy.support.title,
      links: [
        { label: copy.support.links.getHelp, href: "/help" },
        { label: copy.support.links.contact, href: "/contact" },
        { label: copy.support.links.emailSupport, href: "mailto:support@ettajer.com" },
      ],
    },
  ] as const;
}
