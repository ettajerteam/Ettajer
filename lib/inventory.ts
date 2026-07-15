import { prisma } from "@/lib/db";
import { parseProductImages } from "@/lib/product-images";
import { getStockStatus } from "@/lib/stock-status";

export type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: string;
  title: string;
  sku: string | null;
  image: string | null;
  inventory: number;
  price: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export { getStockStatus } from "@/lib/stock-status";

export async function listInventory(storeId: string, filter: StockFilter = "all", search?: string) {
  const products = await prisma.product.findMany({
    where: {
      storeId,
      ...(search?.trim()
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, title: true, sku: true, images: true, inventory: true, price: true },
    orderBy: { title: "asc" },
  });

  const items: InventoryItem[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    sku: p.sku,
    image: parseProductImages(p.images)[0] ?? null,
    inventory: p.inventory,
    price: p.price,
    status: getStockStatus(p.inventory),
  }));

  if (filter === "all") return items;
  return items.filter((i) => i.status === filter);
}

export async function getInventorySummary(storeId: string) {
  const products = await prisma.product.findMany({
    where: { storeId },
    select: { inventory: true, price: true },
  });

  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let totalValue = 0;

  for (const p of products) {
    const status = getStockStatus(p.inventory);
    if (status === "in_stock") inStock++;
    else if (status === "low_stock") lowStock++;
    else outOfStock++;
    totalValue += p.inventory * p.price;
  }

  return {
    totalProducts: products.length,
    inStock,
    lowStock,
    outOfStock,
    totalValue,
  };
}

export async function updateInventory(productId: string, storeId: string, inventory: number) {
  const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
  if (!product) throw new Error("Product not found");

  return prisma.product.update({
    where: { id: productId },
    data: { inventory: Math.max(0, Math.floor(inventory)) },
    select: { id: true, title: true, sku: true, images: true, inventory: true, price: true },
  });
}
