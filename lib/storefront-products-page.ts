import type { PublicProduct } from "@/types/storefront";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

export function parseProductSort(value: string | undefined): ProductSort {
  if (value === "price-asc" || value === "price-desc" || value === "name") return value;
  return "newest";
}

export function sortPublicProducts(products: PublicProduct[], sort: ProductSort) {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "name":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return copy;
  }
}
