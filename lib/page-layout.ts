import type { EditorPageTarget } from "@/lib/builder/editor-types";
import { createSectionFromBlock } from "@/lib/builder/legacy-adapter";
import { getBlock, getBlockBySectionType } from "@/lib/builder/block-registry";
import type { ThemeId } from "@/lib/themes";
import type { HomeLayout, PageTemplateType, StoreSection } from "@/lib/sections/types";
import { parseHomeLayout, serializeHomeLayout } from "@/lib/sections/parse";
import {
  parsePageContent,
  serializePageContent,
  type PageContentData,
} from "@/lib/page-content";

export type PageLayoutKey =
  | "home"
  | "product"
  | "collection"
  | "blog-post"
  | `route:${string}`
  | `page:${string}`;

export type TemplateLayoutKey = Extract<PageLayoutKey, "home" | "product" | "collection">;

export interface StoreTemplateLayouts {
  home: HomeLayout;
  product: HomeLayout;
  collection: HomeLayout;
}

export function getPageLayoutKey(target: EditorPageTarget): PageLayoutKey {
  if (target.type === "home") return "home";
  if (target.type === "product") return "product";
  if (target.type === "collection") return "collection";
  if (target.type === "blog-post") return "blog-post";
  if (target.type === "route") return `route:${target.route}`;
  return `page:${target.page.id}`;
}

export function getTemplateLayoutKey(target: EditorPageTarget): TemplateLayoutKey | null {
  if (target.type === "home" || target.type === "product" || target.type === "collection") {
    return target.type;
  }
  return null;
}

export function getPageTemplateType(target: EditorPageTarget): PageTemplateType | null {
  return getTemplateLayoutKey(target);
}

export function getEmptyPageLayout(): HomeLayout {
  return { version: 1, sections: [] };
}

function newSectionId(type: string): string {
  return `${type}-${Math.random().toString(36).slice(2, 10)}`;
}

function section(type: StoreSection["type"], settings?: Record<string, unknown>): StoreSection {
  const block = getBlockBySectionType(type) ?? getBlock(type);
  if (block) {
    const created = createSectionFromBlock(block.id, { settings });
    if (created) return created;
  }
  return {
    id: newSectionId(type),
    type,
    settings: settings ?? {},
    visible: true,
  };
}

/** Default section templates when a page slug matches a known page type. */
export function getDefaultPageLayoutTemplate(slug: string, _theme: ThemeId = "minimal"): HomeLayout {
  const normalized = slug.toLowerCase().replace(/^\/+/, "");

  if (normalized === "about") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Our story",
          subheadline: "Fewer pieces. Better materials. Built to last.",
          ctaText: "Shop the catalog",
          ctaLink: "/products",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          overlay: true,
          minHeight: "78vh",
          padding: "0",
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
        }),
        section("rich-text", {
          title: "The idea",
          layout: "intro",
          content:
            "<p><em>We exist for people who want less noise and more intention — things made carefully, priced fairly, and meant to stay.</em></p>",
          alignment: "center",
          backgroundColor: "#ffffff",
          padding: "5rem 2rem 2rem",
        }),
        section("rich-text", {
          title: "How we work",
          content:
            "<p>Every piece starts with materials we trust and makers we know by name. We choose longevity over novelty — construction you can feel, finishes that hold up, and supply partners who share that standard.</p><p>From the first sample to the last stitch, the goal is simple: something you’ll reach for again.</p>",
          alignment: "left",
          backgroundColor: "#ffffff",
          padding: "2rem 2rem 4rem",
        }),
        section("image", {
          alt: "Atelier and materials",
          layout: "cinematic",
          caption: "Craft in the room — not just on the hangtag.",
          padding: "0",
          backgroundColor: "#0a0a0a",
        }),
        section("rich-text", {
          title: "",
          layout: "stats",
          content:
            "<p><strong>Fewer</strong> SKUs, chosen with care</p><p><strong>Fair</strong> pricing without the theatre</p><p><strong>COD</strong> when you need it</p>",
          alignment: "center",
          backgroundColor: "#fafafa",
          padding: "4rem 2rem",
        }),
        section("cta", {
          title: "See what’s in the edit",
          subtitle: "Browse the full catalog — quiet pieces, ready to ship.",
          buttonText: "Shop now",
          buttonLink: "/products",
          layout: "banner",
          alignment: "center",
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          padding: "4.5rem 2rem",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  if (normalized === "contact") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Contact",
          subheadline: "Orders, returns, and questions — we’re here to help.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: false,
          overlay: true,
          eyebrow: "Support",
          minHeight: "38vh",
          padding: "0",
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
        }),
        section("contact-form", {
          title: "Send a message",
          description: "Tell us what you need — we typically reply within one business day.",
          buttonText: "Send message",
          showPhone: true,
          layout: "split",
          detailEmail: "hello@studio.example",
          detailHours: "Mon–Fri · 9am–6pm",
          detailAddress: "Share your studio or storefront address here.",
          backgroundColor: "#ffffff",
          padding: "4rem 2rem 5rem",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  if (normalized === "products" || normalized === "shop") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "All pieces",
          subheadline: "Browse the full catalog — sort, filter, and find what belongs.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: false,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          minHeight: "42vh",
          overlay: true,
          eyebrow: "Full catalog",
          padding: "0",
        }),
        section("product-grid", {
          title: "",
          subtitle: "",
          productSource: "latest",
          limit: 48,
          showViewAll: false,
          layout: "grid",
          backgroundColor: "#ffffff",
          padding: "1.5rem 2rem 4rem",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  if (normalized === "collections") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Collections",
          accentHeadline: "Curated edits",
          subheadline: "Numbered archives, seasonal capsules, and everyday essentials.",
          alignment: "left",
          showStoreDescription: false,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          minHeight: "420px",
          overlay: true,
          eyebrow: "Shop by edit",
          ctaText: "Shop all products",
          ctaLink: "/products",
        }),
        section("featured-collections", {
          title: "All collections",
          backgroundColor: "#ffffff",
          padding: "3rem 2rem 1rem",
        }),
        section("rich-text", {
          title: "Stay in the edit",
          layout: "newsletter",
          content: "<p><strong>Aura Dispatch</strong></p><p>Archive drops and restocks — delivered quietly.</p>",
          alignment: "center",
          backgroundColor: "#0a0a0a",
          textColor: "#e5e5e5",
          padding: "5rem 2rem",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  if (normalized === "search") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Search",
          accentHeadline: "Find a piece",
          subheadline: "Search the full catalog by name, description, or tags.",
          alignment: "left",
          showStoreDescription: false,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          minHeight: "320px",
          overlay: true,
          eyebrow: "Catalog",
        }),
        section("rich-text", {
          title: "",
          layout: "intro",
          content: "<p><em>Results appear below as you search.</em></p>",
          alignment: "center",
          backgroundColor: "#ffffff",
          padding: "2rem 2rem 0",
        }),
        section("product-grid", {
          title: "Browse instead",
          subtitle: "Or explore the latest arrivals.",
          productSource: "latest",
          limit: 8,
          backgroundColor: "#ffffff",
          padding: "2rem 2rem 1rem",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  if (normalized === "blog" || normalized === "journal") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Journal",
          accentHeadline: "Stories & notes",
          subheadline: "Atelier notes, lookbook frames, and quiet dispatches from the archive.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: false,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          minHeight: "42vh",
          overlay: true,
          eyebrow: "Editorial",
          padding: "0",
        }),
        section("rich-text", {
          title: "",
          layout: "intro",
          content: "<p><em>Published stories appear below — fewer notes, written carefully.</em></p>",
          alignment: "center",
          backgroundColor: "#ffffff",
          padding: "3.5rem 2rem 0.5rem",
        }),
        section("rich-text", {
          title: "Stay close",
          layout: "newsletter",
          content:
            "<p><strong>Journal dispatch</strong></p><p>New stories and archive drops — quiet updates only.</p>",
          alignment: "center",
          backgroundColor: "#0a0a0a",
          textColor: "#e5e5e5",
          padding: "5rem 2rem",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  if (normalized === "lookbook") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Lookbook",
          accentHeadline: "Season frames",
          subheadline: "Editorial stills from the latest edit — outfit stories and quiet styling notes.",
          alignment: "left",
          showStoreDescription: false,
          showBrand: true,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          minHeight: "78vh",
          overlay: true,
          padding: "0",
          ctaText: "Shop the edit",
          ctaLink: "/products",
        }),
        section("rich-text", {
          title: "",
          layout: "intro",
          content:
            "<p><em>Frames meant to be worn — not just watched.</em></p>",
          alignment: "center",
          backgroundColor: "#fafafa",
          padding: "4.5rem 2rem 1rem",
        }),
        section("gallery", {
          title: "Season frames",
          layout: "lookbook",
          columns: 3,
          gap: "0.5rem",
          borderRadius: "0",
          backgroundColor: "#fafafa",
          padding: "1rem 1rem 3rem",
        }),
        section("image", {
          layout: "cinematic",
          alt: "Campaign frame",
          caption: "Full-bleed campaign still.",
          padding: "0",
          backgroundColor: "#0a0a0a",
        }),
        section("product-grid", {
          title: "Shop the frames",
          subtitle: "Pieces from this season’s shoot.",
          productSource: "latest",
          limit: 4,
          showViewAll: true,
          backgroundColor: "#ffffff",
          padding: "4rem 2rem 2rem",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  if (normalized === "privacy" || normalized === "terms" || normalized === "shipping") {
    const titles: Record<string, { headline: string; body: string }> = {
      privacy: {
        headline: "Privacy policy",
        body:
          "<h2>Information we collect</h2><p>Name, email, phone, and shipping address at checkout. Marketing preferences if you subscribe.</p><h2>How we use it</h2><p>To fulfil orders, provide support, and send updates you opt into. We do not sell personal data.</p><h2>Your rights</h2><p>Contact us to request access, correction, or deletion of your data.</p>",
      },
      terms: {
        headline: "Terms of service",
        body:
          "<h2>Orders</h2><p>By placing an order you agree to these terms. Prices are shown in your store currency at checkout.</p><h2>Availability</h2><p>We may limit quantities or cancel orders affected by stock errors.</p><h2>Delivery</h2><p>Risk of loss passes on delivery to the address provided. See Shipping &amp; returns for timelines.</p>",
      },
      shipping: {
        headline: "Shipping & returns",
        body:
          "<h2>Delivery</h2><p>Standard delivery is typically 3–5 business days on qualifying orders. Tracking is sent by email.</p><h2>Returns</h2><p>Return unused items within your store’s return window. Contact support with your order number.</p><h2>COD</h2><p>Cash on delivery is available where enabled at checkout.</p>",
      },
    };
    const copy = titles[normalized];
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: copy.headline,
          alignment: "left",
          showStoreDescription: false,
          showBrand: false,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff",
          overlay: true,
          minHeight: "36vh",
          padding: "0",
          eyebrow: "Policies",
        }),
        section("rich-text", {
          title: "",
          content: copy.body,
          alignment: "left",
          padding: "4.5rem 2rem 5rem",
          backgroundColor: "#F5F5F0",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  if (normalized === "landing" || normalized.startsWith("landing-")) {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Welcome",
          subheadline: "Discover what we have to offer.",
          ctaText: "Shop now",
          alignment: "center",
        }),
        section("product-grid", { title: "Featured products" }),
        section("rich-text", {
          title: "Why choose us",
          content: "<p>Highlight your key benefits and value proposition here.</p>",
        }),
        section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
      ],
    };
  }

  return getEmptyPageLayout();
}

export function extractLayoutFromPageContent(
  content: string,
  theme?: ThemeId
): HomeLayout | null {
  const parsed = parsePageContent(content);
  if (!parsed.layout) return null;
  const layout = parseHomeLayout(parsed.layout, theme);
  return layout.sections.length > 0 ? layout : null;
}

export function getSavedLayoutFromPageContent(content: string, theme?: ThemeId): HomeLayout {
  return extractLayoutFromPageContent(content, theme) ?? getEmptyPageLayout();
}

export function pageHasSectionLayout(content: string): boolean {
  return extractLayoutFromPageContent(content) !== null;
}

export function serializePageContentWithLayout(data: PageContentData): string {
  const hasLayout = Boolean(data.layout?.sections?.length);
  const hasSeo = Boolean(data.metaTitle?.trim() || data.metaDescription?.trim());
  const hasBody = Boolean(data.body?.trim());

  if (!hasLayout && !hasSeo && !hasBody) return "";

  if (!hasLayout && !hasSeo) return data.body;

  return JSON.stringify({
    __ettajerPage: true,
    body: data.body,
    metaTitle: data.metaTitle?.trim() || undefined,
    metaDescription: data.metaDescription?.trim() || undefined,
    layout: hasLayout ? serializeHomeLayout(data.layout!) : undefined,
  });
}

export function updatePageContentLayout(content: string, layout: HomeLayout): string {
  const parsed = parsePageContent(content);
  return serializePageContentWithLayout({
    ...parsed,
    layout: layout.sections.length > 0 ? layout : undefined,
  });
}

export function createInitialPageContent(slug: string, theme?: ThemeId): string {
  const template = getDefaultPageLayoutTemplate(slug, theme);
  if (template.sections.length === 0) return "";
  return serializePageContentWithLayout({ body: "", layout: template });
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Turn legacy plain-text body into HTML that rich-text can render like the old article view. */
export function legacyBodyToRichTextHtml(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return trimmed;

  const paragraphs = trimmed.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return "";

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export type ConvertLegacyPageResult =
  | { ok: true; content: string; layout: HomeLayout }
  | { ok: false; reason: "no-body" | "already-sections" };

/**
 * One-click migration: wrap legacy page body in hero + rich-text + footer sections,
 * clear body so the storefront uses the section renderer.
 */
export function convertLegacyPageBodyToSections(
  content: string,
  options?: { pageTitle?: string }
): ConvertLegacyPageResult {
  if (pageHasSectionLayout(content)) {
    return { ok: false, reason: "already-sections" };
  }

  const parsed = parsePageContent(content);
  const body = parsed.body.trim();
  if (!body) {
    return { ok: false, reason: "no-body" };
  }

  const headline = options?.pageTitle?.trim() || "Page";
  const html = legacyBodyToRichTextHtml(body);

  const layout: HomeLayout = {
    version: 1,
    sections: [
      section("hero", {
        headline,
        alignment: "center",
        showStoreDescription: false,
        backgroundColor: "#0a0a0a",
        textColor: "#ffffff",
        overlay: true,
      }),
      section("rich-text", {
        title: "",
        content: html,
        alignment: "left",
        padding: "4rem 2rem",
        backgroundColor: "#ffffff",
      }),
      section("footer", {
          backgroundColor: "#0a0a0a",
          textColor: "#a3a3a3",
          showNav: true,
          showClientCare: true,
          showLegal: true,
          showPoweredBy: true,
          padding: "4rem 1.5rem 3rem",
        }),
    ],
  };

  return {
    ok: true,
    layout,
    content: serializePageContentWithLayout({
      body: "",
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      layout,
    }),
  };
}

/** @deprecated Use serializePageContentWithLayout */
export { serializePageContent };
