import { prisma } from "@/lib/db";
import { getStockStatus } from "@/lib/stock-status";
import type { ProductsListStats, ProductsSectionCounts } from "@/types/products-stats";

export type { ProductsListStats, ProductsSectionCounts } from "@/types/products-stats";
export {
  EMPTY_PRODUCTS_LIST_STATS,
  EMPTY_PRODUCTS_SECTION_COUNTS,
} from "@/types/products-stats";

export async function getProductsSectionCounts(storeId: string): Promise<ProductsSectionCounts> {
  const products = await prisma.product.findMany({
    where: { storeId },
    select: { inventory: true },
  });

  let lowStock = 0;
  let outOfStock = 0;

  for (const product of products) {
    const status = getStockStatus(product.inventory);
    if (status === "low_stock") lowStock++;
    if (status === "out_of_stock") outOfStock++;
  }

  return {
    products: products.length,
    lowStock,
    outOfStock,
  };
}

export async function getProductsListStats(storeId: string): Promise<ProductsListStats> {
  const products = await prisma.product.findMany({
    where: { storeId },
    select: { inventory: true, price: true },
  });

  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let catalogValue = 0;

  for (const product of products) {
    const status = getStockStatus(product.inventory);
    if (status === "in_stock") inStock++;
    else if (status === "low_stock") lowStock++;
    else outOfStock++;
    catalogValue += product.inventory * product.price;
  }

  return {
    total: products.length,
    inStock,
    lowStock,
    outOfStock,
    catalogValue,
  };
}
