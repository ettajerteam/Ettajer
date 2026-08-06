import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { getLandingLang } from "@/lib/landing/landing-i18n";
import { getLandingSeo } from "@/lib/landing/landing-seo";
import { getHelpSeo } from "@/lib/help/help-seo";
import { SUPPORT_EMAIL } from "@/lib/constants/support";
import {
  BRAND_ALTERNATE_NAMES,
} from "@/lib/seo/brand-aliases";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, SITE_NAME } from "@/lib/seo/site-config";

type SchemaNode = Record<string, unknown>;

function publisherReference(): SchemaNode {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    },
  };
}

export function buildOrganizationSchema(locale: LandingLocale): SchemaNode {
  const seo = getLandingSeo(locale);

  return {
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: SITE_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: absoluteUrl("/"),
    logo: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    description: seo.description,
    email: SUPPORT_EMAIL,
    areaServed: {
      "@type": "Country",
      name: "Morocco",
    },
    knowsLanguage: ["en", "fr", "ar"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
      availableLanguage: ["English", "French", "Arabic"],
    },
  };
}

export function buildWebSiteSchema(locale: LandingLocale): SchemaNode {
  const seo = getLandingSeo(locale);

  return {
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: SITE_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: absoluteUrl("/"),
    description: seo.description,
    inLanguage: getLandingLang(locale),
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/help")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Helps Google show a product-style result with brand + supporting lines. */
export function buildSoftwareApplicationSchema(locale: LandingLocale): SchemaNode {
  const seo = getLandingSeo(locale);

  return {
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl("/")}#software`,
    name: SITE_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: seo.description,
    url: absoluteUrl("/"),
    image: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    inLanguage: getLandingLang(locale),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "MAD",
      description: "First month free on every plan",
    },
    provider: { "@id": `${absoluteUrl("/")}#organization` },
  };
}

export function buildFaqPageSchema(
  locale: LandingLocale,
  faqs: { q: string; a: string }[],
  pagePath: string,
): SchemaNode {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(pagePath)}#faq`,
    url: absoluteUrl(pagePath),
    inLanguage: getLandingLang(locale),
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; path?: string }[],
): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

const HOW_TO_SLUG_PREFIX =
  /^(how-|connect-|create-|set-up-|setup-|fix-|verify-|test-|configure-|migrate-|sell-|start-|add-|share-|upgrade-|confirm-|read-|manage-|recover-|import-|publish-|customize-|preview-|reduce-|handle-|use-|track-|order-|product-|utm-|newsletter-|gift-|dropshipping-|ssl-|meta-|pixel-|checkout-|images-|store-|built-in-|change-|reset-|understand-)/i;

function looksLikeHowTo(slug: string, body: string[]): boolean {
  const paragraphs = body.filter((paragraph) => paragraph.trim().length > 0);
  if (paragraphs.length < 2) return false;

  const numbered = paragraphs.filter(
    (paragraph) =>
      /^(step\s*)?\d+[\).:\-]/i.test(paragraph.trim()) ||
      /^step\s+\d+/i.test(paragraph.trim()),
  );
  if (numbered.length >= 2) return true;

  if (HOW_TO_SLUG_PREFIX.test(slug) && paragraphs.length >= 2) return true;

  const instructional = paragraphs.filter((paragraph) =>
    /^(open|go to|click|enable|add|create|set|copy|paste|choose|confirm|use|in |when |after |from |turn |disable|export|share|call |ask )/i.test(
      paragraph.trim(),
    ),
  );
  return instructional.length >= 2;
}

function helpSteps(body: string[]): SchemaNode[] {
  return body
    .filter((paragraph) => paragraph.trim().length > 0)
    .slice(0, 16)
    .map((paragraph, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: paragraph.split(/[.!?]/)[0]?.trim().slice(0, 120) || `Step ${index + 1}`,
      text: paragraph,
    }));
}

export function buildHelpArticleGraph(input: {
  locale: LandingLocale;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  categoryId: string;
  categoryTitle: string;
  keywords?: string[];
}): SchemaNode[] {
  const articleUrl = absoluteUrl(`/help/${input.slug}`);
  const isHowTo = looksLikeHowTo(input.slug, input.body);
  const lang = getLandingLang(input.locale);
  const helpLabel =
    input.locale === "fr" ? "Aide" : input.locale === "ar" ? "مساعدة" : "Help";
  const articleBody = input.body.filter(Boolean).join("\n\n");

  const techArticle: SchemaNode = {
    "@type": "TechArticle",
    "@id": `${articleUrl}#article`,
    headline: input.title,
    description: input.excerpt,
    articleBody,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    inLanguage: lang,
    author: publisherReference(),
    publisher: publisherReference(),
    articleSection: input.categoryTitle,
    keywords: input.keywords?.join(", "),
    isAccessibleForFree: true,
  };

  const nodes: SchemaNode[] = [techArticle];

  if (isHowTo) {
    nodes.push({
      "@type": "HowTo",
      "@id": `${articleUrl}#howto`,
      name: input.title,
      description: input.excerpt,
      url: articleUrl,
      inLanguage: lang,
      publisher: publisherReference(),
      totalTime: `PT${Math.max(3, input.body.length * 2)}M`,
      step: helpSteps(input.body),
    });
  }

  nodes.push(
    buildBreadcrumbSchema([
      { name: "Ettajer", path: "/" },
      { name: helpLabel, path: "/help" },
      {
        name: input.categoryTitle,
        path: `/help/category/${input.categoryId}`,
      },
      { name: input.title },
    ]),
  );

  return nodes;
}

export function buildHelpIndexGraph(
  locale: LandingLocale,
  faqItems?: { q: string; a: string }[],
): SchemaNode[] {
  const seo = getLandingSeo(locale);
  const helpSeo = getHelpSeo(locale).index;
  const nodes: SchemaNode[] = [
    {
      "@type": "CollectionPage",
      "@id": `${absoluteUrl("/help")}#webpage`,
      name: helpSeo.title,
      description: helpSeo.description,
      url: absoluteUrl("/help"),
      inLanguage: getLandingLang(locale),
      isPartOf: { "@id": `${absoluteUrl("/")}#website` },
      about: {
        "@type": "Thing",
        name: "Ettajer merchant support",
        description: seo.description,
      },
      significantLink: [
        absoluteUrl("/llms.txt"),
        absoluteUrl("/llms-full.txt"),
        absoluteUrl("/knowledge.json"),
      ],
    },
    buildBreadcrumbSchema([
      { name: "Ettajer", path: "/" },
      { name: helpSeo.title },
    ]),
  ];

  if (faqItems && faqItems.length > 0) {
    nodes.push(buildFaqPageSchema(locale, faqItems, "/help"));
  }

  return nodes;
}

export function buildHelpCategoryGraph(input: {
  locale: LandingLocale;
  categoryId: string;
  categoryTitle: string;
  categoryDescription: string;
}): SchemaNode[] {
  const helpLabel =
    input.locale === "fr" ? "Aide" : input.locale === "ar" ? "مساعدة" : "Help";
  const categoryUrl = absoluteUrl(`/help/category/${input.categoryId}`);

  return [
    {
      "@type": "CollectionPage",
      "@id": `${categoryUrl}#collection`,
      name: input.categoryTitle,
      description: input.categoryDescription,
      url: categoryUrl,
      inLanguage: getLandingLang(input.locale),
      isPartOf: { "@id": `${absoluteUrl("/help")}#webpage` },
    },
    buildBreadcrumbSchema([
      { name: "Ettajer", path: "/" },
      { name: helpLabel, path: "/help" },
      { name: input.categoryTitle },
    ]),
  ];
}

export function buildHomeGraph(locale: LandingLocale): SchemaNode[] {
  return [buildWebSiteSchema(locale), buildSoftwareApplicationSchema(locale)];
}

/** Merchant store as Organization + WebSite (store home). */
export function buildStoreOrganizationSchema(input: {
  name: string;
  path: string;
  description?: string | null;
  logo?: string | null;
  currency?: string;
}): SchemaNode {
  const url = absoluteUrl(input.path);
  return {
    "@type": "OnlineStore",
    "@id": `${url}#store`,
    name: input.name,
    url,
    description: input.description ?? undefined,
    ...(input.logo
      ? {
          logo: {
            "@type": "ImageObject",
            url: input.logo.startsWith("http") ? input.logo : absoluteUrl(input.logo),
          },
        }
      : {}),
    ...(input.currency
      ? {
          currenciesAccepted: input.currency,
          paymentAccepted: "Cash, Credit Card",
        }
      : {}),
  };
}

export function buildStoreWebSiteSchema(input: {
  name: string;
  path: string;
  description?: string | null;
  searchPath: string;
}): SchemaNode {
  const url = absoluteUrl(input.path);
  return {
    "@type": "WebSite",
    "@id": `${url}#website`,
    name: input.name,
    url,
    description: input.description ?? undefined,
    publisher: { "@id": `${url}#store` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(input.searchPath)}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProductSchema(input: {
  name: string;
  path: string;
  description?: string | null;
  images?: string[];
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock";
  sku?: string | null;
  storeName: string;
  storePath: string;
}): SchemaNode {
  const url = absoluteUrl(input.path);
  const images = (input.images ?? [])
    .filter((src) => typeof src === "string" && src.trim())
    .map((src) => (src.startsWith("http") ? src : absoluteUrl(src)));

  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: input.name,
    description: input.description
      ? input.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500)
      : undefined,
    sku: input.sku ?? undefined,
    image: images.length > 0 ? images : undefined,
    url,
    brand: {
      "@type": "Brand",
      name: input.storeName,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: input.currency,
      price: Number(input.price.toFixed(2)),
      availability: `https://schema.org/${input.availability}`,
      seller: {
        "@type": "Organization",
        name: input.storeName,
        url: absoluteUrl(input.storePath),
      },
    },
  };
}

export function buildItemListSchema(input: {
  name: string;
  path: string;
  description?: string | null;
  items: { name: string; path: string }[];
}): SchemaNode {
  return {
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(input.path)}#collection`,
    name: input.name,
    description: input.description ?? undefined,
    url: absoluteUrl(input.path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.items.length,
      itemListElement: input.items.slice(0, 50).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(item.path),
        name: item.name,
      })),
    },
  };
}

export function buildBlogPostingSchema(input: {
  title: string;
  path: string;
  description?: string | null;
  image?: string | null;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
  storeName: string;
  storePath: string;
}): SchemaNode {
  const url = absoluteUrl(input.path);
  const image =
    input.image?.trim() &&
    (input.image.startsWith("http") ? input.image : absoluteUrl(input.image));

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.title,
    description: input.description ?? undefined,
    url,
    image: image || undefined,
    datePublished: input.datePublished
      ? new Date(input.datePublished).toISOString()
      : undefined,
    dateModified: input.dateModified
      ? new Date(input.dateModified).toISOString()
      : undefined,
    author: {
      "@type": "Organization",
      name: input.storeName,
      url: absoluteUrl(input.storePath),
    },
    publisher: {
      "@type": "Organization",
      name: input.storeName,
      url: absoluteUrl(input.storePath),
    },
    mainEntityOfPage: url,
  };
}
