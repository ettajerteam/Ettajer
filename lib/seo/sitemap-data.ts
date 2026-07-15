import { HELP_ARTICLES, HELP_CATEGORIES } from "@/lib/help/help-data";
import { absoluteUrl } from "@/lib/seo/site-config";

export const PUBLIC_STATIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/activate",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/cookies",
  "/help",
  "/contact",
  "/founder-card",
] as const;

export function getPublicSitemapEntries(): { url: string; lastModified?: Date }[] {
  const now = new Date();
  const entries: { url: string; lastModified?: Date }[] = PUBLIC_STATIC_PATHS.map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified: now,
    }),
  );

  for (const article of HELP_ARTICLES) {
    entries.push({
      url: absoluteUrl(`/help/${article.slug}`),
      lastModified: now,
    });
  }

  for (const category of HELP_CATEGORIES) {
    entries.push({
      url: absoluteUrl(`/help/category/${category.id}`),
      lastModified: now,
    });
  }

  return entries;
}
