import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-config";
import { getPublicSitemapEntries } from "@/lib/seo/sitemap-data";

function getPriority(url: string): number {
  const home = getSiteUrl().toString();
  if (url === home || url === `${home}/`) return 1;
  if (url.includes("/help/")) return 0.65;
  if (
    url.endsWith("/help") ||
    url.endsWith("/contact") ||
    url.endsWith("/founder-card") ||
    url.includes("/privacy") ||
    url.includes("/terms") ||
    url.includes("/cookies")
  ) {
    return 0.85;
  }
  return 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return getPublicSitemapEntries().map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: "weekly",
    priority: getPriority(entry.url),
  }));
}
