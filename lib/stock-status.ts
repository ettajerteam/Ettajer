export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export const LOW_STOCK_THRESHOLD = 10;

export function getStockStatus(
  inventory: number,
  lowStockAlert: number = LOW_STOCK_THRESHOLD
): StockStatus {
  if (inventory <= 0) return "out_of_stock";
  if (inventory <= Math.max(0, lowStockAlert)) return "low_stock";
  return "in_stock";
}
