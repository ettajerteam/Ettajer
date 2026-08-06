import type {
  DropshippingProvider,
  ImportedProductDetail,
  ImportedSupplierProduct,
  ImportedVariantOption,
} from "@/lib/dropshipping/providers";

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return asNumber(obj.value ?? obj.amount ?? obj.salePrice ?? obj.minPrice);
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function collectImages(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === "string") return [raw];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object") {
        const o = x as Record<string, unknown>;
        return asString(o.url ?? o.imageUrl ?? o.imgUrl ?? o.path);
      }
      return null;
    })
    .filter((x): x is string => Boolean(x));
}

function parseVariants(raw: unknown): ImportedVariantOption[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  const out: ImportedVariantOption[] = [];

  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const obj = row as Record<string, unknown>;
    const name =
      asString(obj.skuPropertyName) ||
      asString(obj.name) ||
      asString(obj.propertyName) ||
      asString(obj.attrName) ||
      asString(obj.title);
    if (!name) continue;

    const valuesRaw =
      obj.skuPropertyValues ||
      obj.values ||
      obj.options ||
      obj.propertyValueList ||
      obj.attributes ||
      [];
    if (!Array.isArray(valuesRaw)) continue;

    const options: string[] = [];
    const optionImages: Record<string, string> = {};

    for (const v of valuesRaw) {
      if (typeof v === "string" && v.trim()) {
        options.push(v.trim());
        continue;
      }
      if (!v || typeof v !== "object") continue;
      const vo = v as Record<string, unknown>;
      const label =
        asString(vo.propertyValueDisplayName) ||
        asString(vo.propertyValueName) ||
        asString(vo.displayName) ||
        asString(vo.name) ||
        asString(vo.value) ||
        asString(vo.skuPropertyValueRemark);
      if (!label) continue;
      options.push(label);
      const img =
        asString(vo.skuPropertyImagePath) ||
        asString(vo.image) ||
        asString(vo.imageUrl) ||
        asString(vo.skuPropertyImageSummPath);
      if (img) optionImages[label] = img.startsWith("//") ? `https:${img}` : img;
    }

    if (!options.length) continue;
    out.push({
      id: crypto.randomUUID(),
      name,
      options: Array.from(new Set(options)),
      optionImages: Object.keys(optionImages).length ? optionImages : undefined,
    });
  }

  return out;
}

function parseDetails(raw: unknown): ImportedProductDetail[] {
  if (!Array.isArray(raw)) return [];
  const out: ImportedProductDetail[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const obj = row as Record<string, unknown>;
    const label =
      asString(obj.attrName) ||
      asString(obj.name) ||
      asString(obj.label) ||
      asString(obj.propertyName);
    const value =
      asString(obj.attrValue) ||
      asString(obj.value) ||
      asString(obj.propertyValue) ||
      (Array.isArray(obj.attrValueList)
        ? obj.attrValueList.filter((x): x is string => typeof x === "string").join(", ")
        : null);
    if (!label || !value) continue;
    out.push({ id: crypto.randomUUID(), label, value });
  }
  return out;
}

/**
 * Optional RapidAPI AliExpress DataHub (set RAPIDAPI_KEY in env).
 * Docs: https://rapidapi.com/digi4success/api/aliexpress-datahub
 */
export async function fetchAliExpressViaRapidApi(
  productId: string
): Promise<Partial<ImportedSupplierProduct> | null> {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) return null;

  const host =
    process.env.RAPIDAPI_ALIEXPRESS_HOST?.trim() || "aliexpress-datahub.p.rapidapi.com";

  try {
    const endpoint = `https://${host}/item_detail_2?itemId=${encodeURIComponent(productId)}`;
    const res = await fetch(endpoint, {
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": host,
      },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, unknown>;
    const result =
      (json.result as Record<string, unknown> | undefined) ||
      (json.data as Record<string, unknown> | undefined) ||
      json;
    const item =
      (result.item as Record<string, unknown> | undefined) ||
      (result.itemInfo as Record<string, unknown> | undefined) ||
      (result.product as Record<string, unknown> | undefined) ||
      result;

    const title =
      asString(item.title) ||
      asString(item.productTitle) ||
      asString(item.subject) ||
      null;

    const images = collectImages(
      item.images ||
        item.imageList ||
        item.productImages ||
        item.gallery ||
        item.imagePathList
    );

    const price =
      asNumber(item.salePrice) ||
      asNumber(item.price) ||
      asNumber(item.skuPrice) ||
      asNumber((item.priceInfo as Record<string, unknown> | undefined)?.salePrice) ||
      null;

    const originalPrice =
      asNumber(item.originalPrice) ||
      asNumber(item.marketPrice) ||
      asNumber((item.priceInfo as Record<string, unknown> | undefined)?.originalPrice) ||
      null;

    const salePrice = price || originalPrice;
    const comparePrice =
      originalPrice && salePrice && originalPrice > salePrice ? originalPrice : null;

    const description =
      asString(item.description) ||
      asString(item.productDescription) ||
      asString(item.detailDesc) ||
      "";

    const variants = parseVariants(
      item.skuProperties ||
        item.productSKUPropertyList ||
        item.skuPropertyList ||
        item.variants ||
        (item.sku as Record<string, unknown> | undefined)?.props
    );

    const details = parseDetails(
      item.specs ||
        item.attributes ||
        item.properties ||
        item.productPropList ||
        item.props
    );

    const brand =
      asString(item.brand) ||
      asString(item.brandName) ||
      details.find((d) => /brand/i.test(d.label))?.value ||
      null;

    const tags = Array.isArray(item.keywords)
      ? item.keywords.filter((x): x is string => typeof x === "string").slice(0, 12)
      : [];

    if (!title && !images.length) return null;

    return {
      title: title ?? undefined,
      images,
      price: salePrice,
      comparePrice,
      currency: asString(item.currency) || "USD",
      descriptionHtml: description
        ? description.includes("<")
          ? description
          : `<p>${description}</p>`
        : undefined,
      sku: productId,
      brand,
      tags,
      variants,
      details,
      provider: "aliexpress" satisfies DropshippingProvider,
    };
  } catch {
    return null;
  }
}
