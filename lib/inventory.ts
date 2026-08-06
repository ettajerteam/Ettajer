import { prisma } from "@/lib/db";
import { parseProductImages } from "@/lib/product-images";
import { parseProductCommerce } from "@/lib/product-commerce";
import { getStockStatus, LOW_STOCK_THRESHOLD, type StockStatus } from "@/lib/stock-status";
import { isProductType, productTracksInventory, type ProductType } from "@/lib/product-types";

export type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  image: string | null;
  inventory: number;
  price: number;
  costPrice: number | null;
  comparePrice: number | null;
  productType: ProductType;
  productStatus: string;
  categoryName: string | null;
  tracksInventory: boolean;
  trackQuantity: boolean;
  inventoryLocation: "warehouse" | "supplier";
  lowStockAlert: number;
  supplier: string | null;
  status: StockStatus;
  stockValue: number;
  costValue: number;
  potentialProfit: number | null;
  updatedAt: string;
}

export { getStockStatus } from "@/lib/stock-status";

function stockStatusFor(inventory: number, lowStockAlert: number): StockStatus {
  if (inventory <= 0) return "out_of_stock";
  if (inventory <= lowStockAlert) return "low_stock";
  return "in_stock";
}

export async function listInventory(
  storeId: string,
  filter: StockFilter = "all",
  search?: string
): Promise<InventoryItem[]> {
  const q = search?.trim() ?? "";
  const products = await prisma.product.findMany({
    where: {
      storeId,
      ...(q
        ? {
            OR: [
              { barcode: { equals: q } },
              { sku: { equals: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { barcode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      sku: true,
      barcode: true,
      images: true,
      inventory: true,
      price: true,
      costPrice: true,
      comparePrice: true,
      productType: true,
      status: true,
      commerce: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
    orderBy: [{ inventory: "asc" }, { title: "asc" }],
  });

  const items: InventoryItem[] = products.map((p) => {
    const productType = isProductType(p.productType) ? p.productType : "physical";
    const commerce = parseProductCommerce(p.commerce);
    const lowStockAlert =
      typeof commerce.lowStockAlert === "number" && commerce.lowStockAlert >= 0
        ? commerce.lowStockAlert
        : LOW_STOCK_THRESHOLD;
    const tracks = productTracksInventory(productType);
    const inventory = p.inventory;
    const costPrice = p.costPrice ?? null;
    const stockValue = inventory * p.price;
    const costValue =
      typeof costPrice === "number" && costPrice >= 0 ? inventory * costPrice : 0;
    const potentialProfit =
      typeof costPrice === "number" && costPrice >= 0
        ? Math.round((p.price - costPrice) * inventory * 100) / 100
        : null;

    return {
      id: p.id,
      title: p.title,
      sku: p.sku,
      barcode: p.barcode,
      image: parseProductImages(p.images)[0] ?? null,
      inventory,
      price: p.price,
      costPrice,
      comparePrice: p.comparePrice ?? null,
      productType,
      productStatus: p.status,
      categoryName: p.category?.name ?? null,
      tracksInventory: tracks,
      trackQuantity: commerce.trackQuantity !== false,
      inventoryLocation: commerce.inventoryLocation === "supplier" ? "supplier" : "warehouse",
      lowStockAlert,
      supplier: commerce.supplier?.trim() || commerce.brand?.trim() || null,
      status: tracks ? stockStatusFor(inventory, lowStockAlert) : "in_stock",
      stockValue,
      costValue,
      potentialProfit,
      updatedAt: p.updatedAt.toISOString(),
    };
  });

  // Exact barcode / SKU matches first so scanner lookups surface the product immediately
  if (q) {
    const needle = q.toLowerCase();
    items.sort((a, b) => {
      const score = (item: InventoryItem) => {
        if (item.barcode === q) return 0;
        if (item.sku?.toLowerCase() === needle) return 1;
        if (item.barcode?.toLowerCase() === needle) return 2;
        return 3;
      };
      return score(a) - score(b);
    });
  }

  // Inventory page focuses on products that actually track stock
  const stocked = items.filter((i) => i.tracksInventory);

  if (filter === "all") return stocked;
  return stocked.filter((i) => i.status === filter);
}

export async function getInventorySummary(storeId: string) {
  const items = await listInventory(storeId, "all");

  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let totalValue = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let units = 0;

  for (const item of items) {
    if (item.status === "in_stock") inStock++;
    else if (item.status === "low_stock") lowStock++;
    else outOfStock++;
    totalValue += item.stockValue;
    totalCost += item.costValue;
    if (typeof item.potentialProfit === "number") totalProfit += item.potentialProfit;
    units += Math.max(0, item.inventory);
  }

  return {
    totalProducts: items.length,
    inStock,
    lowStock,
    outOfStock,
    totalValue,
    totalCost,
    totalProfit,
    units,
    needsAttention: lowStock + outOfStock,
  };
}

/** One DB round-trip for the inventory page. */
export async function getInventoryPageData(storeId: string) {
  const items = await listInventory(storeId, "all");
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let totalValue = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let units = 0;

  for (const item of items) {
    if (item.status === "in_stock") inStock++;
    else if (item.status === "low_stock") lowStock++;
    else outOfStock++;
    totalValue += item.stockValue;
    totalCost += item.costValue;
    if (typeof item.potentialProfit === "number") totalProfit += item.potentialProfit;
    units += Math.max(0, item.inventory);
  }

  return {
    items,
    summary: {
      totalProducts: items.length,
      inStock,
      lowStock,
      outOfStock,
      totalValue,
      totalCost,
      totalProfit,
      units,
      needsAttention: lowStock + outOfStock,
    },
  };
}

export async function updateInventory(productId: string, storeId: string, inventory: number) {
  const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
  if (!product) throw new Error("Product not found");

  return prisma.product.update({
    where: { id: productId },
    data: { inventory: Math.max(0, Math.floor(inventory)) },
    select: {
      id: true,
      title: true,
      sku: true,
      images: true,
      inventory: true,
      price: true,
      costPrice: true,
    },
  });
}
