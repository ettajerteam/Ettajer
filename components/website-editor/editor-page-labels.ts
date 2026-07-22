import type { StorePageRow } from "@/lib/pages";

/** Human-readable label for a dirty page layout key (home / templates / custom pages). */
export function getEditorDirtyPageLabel(key: string, pages: StorePageRow[]): string {
  if (key === "home") return "Home";
  if (key === "product") return "Product template";
  if (key === "collection") return "Collection template";
  if (key === "blog-post") return "Blog post template";
  return pages.find((p) => p.id === key.slice("page:".length))?.title ?? "Custom page";
}
