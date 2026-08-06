import { prisma } from "@/lib/db";
import {
  ean13CheckDigit,
  generateProductBarcode,
  generateProductSku,
} from "@/lib/product-code-generators";

export { generateProductBarcode, generateProductSku } from "@/lib/product-code-generators";

async function isSkuTaken(storeId: string, sku: string, excludeProductId?: string) {
  const found = await prisma.product.findFirst({
    where: {
      storeId,
      sku,
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(found);
}

async function isBarcodeTaken(storeId: string, barcode: string, excludeProductId?: string) {
  const found = await prisma.product.findFirst({
    where: {
      storeId,
      barcode,
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(found);
}

export async function allocateUniqueSku(
  storeId: string,
  preferred?: string | null,
  excludeProductId?: string
): Promise<string> {
  const trimmed = preferred?.trim() || "";
  if (trimmed && !(await isSkuTaken(storeId, trimmed, excludeProductId))) {
    return trimmed;
  }

  for (let attempt = 0; attempt < 24; attempt++) {
    const candidate = generateProductSku();
    if (!(await isSkuTaken(storeId, candidate, excludeProductId))) {
      return candidate;
    }
  }

  return `P-${Date.now().toString(36).toUpperCase()}-${generateProductSku().slice(-3)}`;
}

export async function allocateUniqueBarcode(
  storeId: string,
  preferred?: string | null,
  excludeProductId?: string
): Promise<string> {
  const trimmed = preferred?.trim() || "";
  if (trimmed && !(await isBarcodeTaken(storeId, trimmed, excludeProductId))) {
    return trimmed;
  }

  for (let attempt = 0; attempt < 24; attempt++) {
    const candidate = generateProductBarcode();
    if (!(await isBarcodeTaken(storeId, candidate, excludeProductId))) {
      return candidate;
    }
  }

  const fallback = `20${Date.now().toString().slice(-10)}`.slice(0, 12);
  return fallback + ean13CheckDigit(fallback);
}

/** Ensures every product has a unique SKU + barcode for the store. */
export async function ensureProductCodes(
  storeId: string,
  input: { sku?: string | null; barcode?: string | null },
  excludeProductId?: string
): Promise<{ sku: string; barcode: string }> {
  const sku = await allocateUniqueSku(storeId, input.sku, excludeProductId);
  const barcode = await allocateUniqueBarcode(storeId, input.barcode, excludeProductId);
  return { sku, barcode };
}
