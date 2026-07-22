import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-config";
import {
  getPublicSitemapEntries,
  getStorefrontSitemapEntries,
} from "@/lib/seo/sitemap-data";

function getPriority(url: string): number {
  const home = getSiteUrl().toString();
  if (url === home || url === `${home}/`) return 1;
  if (url.includes("/store/") && url.includes("/product/")) return 0.8;
  if (url.includes("/store/") && url.includes("/collection/")) return 0.75;
  if (url.includes("/store/") && !url.slice(url.indexOf("/store/") + 7).includes("/")) {
    return 0.9;
  }
  if (url.includes("/store/")) return 0.7;
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [platform, stores] = await Promise.all([
    Promise.resolve(getPublicSitemapEntries()),
    getStorefrontSitemapEntries().catch(() => []),
  ]);

  return [...platform, ...stores].map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.url.includes("/store/") ? "daily" : "weekly",
    priority: getPriority(entry.url),
  }));
}
