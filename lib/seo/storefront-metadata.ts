import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo/site-config";

export type StorefrontMetadataInput = {
  /** Store display name (used as siteName / title suffix). */
  storeName: string;
  /** Path starting with /store/... */
  path: string;
  title: string;
  description?: string | null;
  /** Absolute or site-relative image URL for OG/Twitter. */
  image?: string | null;
  keywords?: string[];
  type?: "website" | "article";
  /** When true, title is used as-is (no "| Store" template). */
  absoluteTitle?: boolean;
  noIndex?: boolean;
};

function resolveImageUrl(image?: string | null): string {
  if (!image?.trim()) return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  const trimmed = image.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return absoluteUrl(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Build crawler-ready metadata for merchant storefront pages. */
export function buildStorefrontMetadata(input: StorefrontMetadataInput): Metadata {
  const description = input.description
    ? stripHtml(input.description).slice(0, 160)
    : `Shop at ${input.storeName}`;
  const canonical = absoluteUrl(input.path);
  const ogImage = resolveImageUrl(input.image);
  const title = input.absoluteTitle
    ? { absolute: input.title }
    : input.title;

  return {
    title,
    description,
    keywords: input.keywords,
    alternates: {
      canonical,
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      url: canonical,
      title: input.title,
      description,
      siteName: input.storeName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
  };
}

export interface StoreSeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/** Parse optional StoreSettings.seo JSON. */
export function parseStoreSeo(raw: unknown): StoreSeoSettings {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const keywords = Array.isArray(obj.keywords)
    ? obj.keywords.filter((k): k is string => typeof k === "string" && k.trim().length > 0)
    : typeof obj.keywords === "string"
      ? obj.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : undefined;

  return {
    title: typeof obj.title === "string" && obj.title.trim() ? obj.title.trim() : undefined,
    description:
      typeof obj.description === "string" && obj.description.trim()
        ? obj.description.trim()
        : undefined,
    keywords,
    noIndex: obj.noIndex === true,
  };
}
