import {
  dropshippingProviderLabel,
  type DropshippingProvider,
  type ImportedProductDetail,
  type ImportedSupplierProduct,
  type ImportedVariantOption,
} from "@/lib/dropshipping/providers";
import { fetchAliExpressViaRapidApi } from "@/lib/dropshipping/aliexpress-rapidapi";

export type { ImportedSupplierProduct };

const PROVIDER_HOSTS: Record<DropshippingProvider, RegExp[]> = {
  aliexpress: [
    /(^|\.)aliexpress\.(com|us|ru|es|fr|it|de|nl|pl|pt|ko|jp|id|th|vi|ar|tr)(\.|$)/i,
    /(^|\.)aliexpress\.com$/i,
  ],
  cj: [/(^|\.)cjdropshipping\.com$/i, /(^|\.)cjdropship\.com$/i],
  bigbuy: [/(^|\.)bigbuy\.eu$/i, /(^|\.)bigbuy\.com$/i],
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export function detectProviderFromUrl(url: string): DropshippingProvider | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [provider, patterns] of Object.entries(PROVIDER_HOSTS) as [
      DropshippingProvider,
      RegExp[],
    ][]) {
      if (patterns.some((re) => re.test(host))) return provider;
    }
  } catch {
    return null;
  }
  return null;
}

export function assertSupplierUrl(
  rawUrl: string,
  provider: DropshippingProvider
): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("Enter a valid product URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must start with https://");
  }
  const host = parsed.hostname.toLowerCase();
  const allowed = PROVIDER_HOSTS[provider];
  if (!allowed.some((re) => re.test(host))) {
    throw new Error(
      `This URL doesn’t match ${dropshippingProviderLabel(provider)}. Paste a product link from that supplier.`
    );
  }
  return parsed;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1].trim());
  }
  return null;
}

function allMetaImages(html: string): string[] {
  const keys = ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"];
  const out: string[] = [];
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "gi"
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      if (m[1]) out.push(decodeEntities(m[1].trim()));
    }
  }
  return out;
}

function extractJsonLdProducts(html: string): Record<string, unknown>[] {
  const products: Record<string, unknown>[] = [];
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const raw = m[1].trim();
      if (!raw) continue;
      const parsed = JSON.parse(raw) as unknown;
      const stack = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of stack) {
        if (!item || typeof item !== "object") continue;
        const obj = item as Record<string, unknown>;
        const type = obj["@type"];
        const types = Array.isArray(type) ? type : [type];
        if (types.some((t) => String(t).toLowerCase() === "product")) {
          products.push(obj);
        }
        if (Array.isArray(obj["@graph"])) {
          for (const g of obj["@graph"]) {
            if (g && typeof g === "object") {
              const gt = (g as Record<string, unknown>)["@type"];
              const gtypes = Array.isArray(gt) ? gt : [gt];
              if (gtypes.some((t) => String(t).toLowerCase() === "product")) {
                products.push(g as Record<string, unknown>);
              }
            }
          }
        }
      }
    } catch {
      // ignore bad JSON-LD
    }
  }
  return products;
}

function offerPrice(offers: unknown): { price: number | null; currency: string | null } {
  if (!offers) return { price: null, currency: null };
  const list = Array.isArray(offers) ? offers : [offers];
  for (const offer of list) {
    if (!offer || typeof offer !== "object") continue;
    const o = offer as Record<string, unknown>;
    const priceRaw = o.price ?? o.lowPrice ?? o.highPrice;
    const price =
      typeof priceRaw === "number"
        ? priceRaw
        : typeof priceRaw === "string"
          ? Number(priceRaw.replace(/[^\d.]/g, ""))
          : NaN;
    const currency = typeof o.priceCurrency === "string" ? o.priceCurrency : null;
    if (Number.isFinite(price) && price > 0) return { price, currency };
  }
  return { price: null, currency: null };
}

function collectImages(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((v) => {
      if (typeof v === "string") return [v];
      if (v && typeof v === "object" && "url" in v && typeof (v as { url: unknown }).url === "string") {
        return [(v as { url: string }).url];
      }
      return [];
    });
  }
  if (typeof value === "object" && value && "url" in value) {
    const url = (value as { url: unknown }).url;
    return typeof url === "string" ? [url] : [];
  }
  return [];
}

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const url = normalizeImageUrl(raw);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

function normalizeImageUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/\\u002F/g, "/");
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

/** Pull AliExpress embedded product fields from SSR / boot scripts. */
function parseAliExpressEmbedded(html: string): Partial<ImportedSupplierProduct> {
  const title =
    matchString(html, /"subject"\s*:\s*"((?:\\.|[^"\\])*)"/) ||
    matchString(html, /"title"\s*:\s*"((?:\\.|[^"\\])*)"/);

  const imagePathList = matchJsonArray(html, /"imagePathList"\s*:\s*(\[[^\]]*\])/);
  const imageList = matchJsonArray(html, /"imageList"\s*:\s*(\[[^\]]*\])/);
  const images = uniqueUrls([
    ...imagePathList.filter((x): x is string => typeof x === "string"),
    ...imageList.filter((x): x is string => typeof x === "string"),
  ]);

  const priceCandidates = [
    matchNumber(html, /"formatedActivityPrice"\s*:\s*"US\s*\$?\s*([\d.]+)"/i),
    matchNumber(html, /"formatedPrice"\s*:\s*"US\s*\$?\s*([\d.]+)"/i),
    matchNumber(html, /"skuPrice"\s*:\s*"?([\d.]+)"?/),
    matchNumber(html, /"actSkuPrice"\s*:\s*"?([\d.]+)"?/),
    matchNumber(html, /"salePrice"\s*:\s*"?([\d.]+)"?/),
    matchNumber(html, /"price"\s*:\s*"?([\d.]+)"?/),
  ].filter((n): n is number => n != null && n > 0);

  const compareCandidates = [
    matchNumber(html, /"formatedOriginalPrice"\s*:\s*"US\s*\$?\s*([\d.]+)"/i),
    matchNumber(html, /"originalPrice"\s*:\s*"?([\d.]+)"?/),
    matchNumber(html, /"targetOriginalPrice"\s*:\s*"?([\d.]+)"?/),
    matchNumber(html, /"skuOrigPrice"\s*:\s*"?([\d.]+)"?/),
    matchNumber(html, /"marketPrice"\s*:\s*"?([\d.]+)"?/),
  ].filter((n): n is number => n != null && n > 0);

  const sku =
    matchString(html, /"skuId"\s*:\s*"((?:\\.|[^"\\])*)"/) ||
    matchString(html, /"productId"\s*:\s*"((?:\\.|[^"\\])*)"/);

  const brand =
    matchString(html, /"brandName"\s*:\s*"((?:\\.|[^"\\])*)"/) ||
    matchString(html, /"brand"\s*:\s*"((?:\\.|[^"\\])*)"/);

  const variants = parseAliExpressVariants(html);
  const details = parseAliExpressSpecs(html);

  const sale = priceCandidates[0] ?? null;
  const original = Math.max(0, ...(compareCandidates.length ? compareCandidates : [0])) || null;
  const price = sale ?? original;
  const comparePrice =
    original && price && original > price ? original : null;

  return {
    title: title ? unescapeJsonString(title) : undefined,
    images,
    price,
    comparePrice,
    currency: price != null ? "USD" : null,
    sku: sku ? unescapeJsonString(sku) : null,
    brand: brand ? unescapeJsonString(brand) : null,
    variants,
    details,
  };
}

function parseAliExpressVariants(html: string): ImportedVariantOption[] {
  const blocks = [
    matchJsonArray(html, /"productSKUPropertyList"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/),
    matchJsonArray(html, /"skuPropertyList"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/),
    matchJsonArray(html, /"skuProperties"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/),
  ];

  const out: ImportedVariantOption[] = [];
  for (const block of blocks) {
    for (const row of block) {
      if (!row || typeof row !== "object") continue;
      const obj = row as Record<string, unknown>;
      const name =
        (typeof obj.skuPropertyName === "string" && obj.skuPropertyName) ||
        (typeof obj.name === "string" && obj.name) ||
        null;
      if (!name) continue;
      const valuesRaw = obj.skuPropertyValues || obj.values;
      if (!Array.isArray(valuesRaw)) continue;

      const options: string[] = [];
      const optionImages: Record<string, string> = {};
      for (const v of valuesRaw) {
        if (!v || typeof v !== "object") continue;
        const vo = v as Record<string, unknown>;
        const label =
          (typeof vo.propertyValueDisplayName === "string" && vo.propertyValueDisplayName) ||
          (typeof vo.propertyValueName === "string" && vo.propertyValueName) ||
          (typeof vo.name === "string" && vo.name) ||
          null;
        if (!label) continue;
        options.push(label);
        const img =
          (typeof vo.skuPropertyImagePath === "string" && vo.skuPropertyImagePath) ||
          (typeof vo.skuPropertyImageSummPath === "string" && vo.skuPropertyImageSummPath) ||
          null;
        if (img) {
          optionImages[label] = img.startsWith("//") ? `https:${img}` : img;
        }
      }
      if (!options.length) continue;
      if (out.some((v) => v.name.toLowerCase() === name.toLowerCase())) continue;
      out.push({
        id: crypto.randomUUID(),
        name,
        options: Array.from(new Set(options)),
        optionImages: Object.keys(optionImages).length ? optionImages : undefined,
      });
    }
    if (out.length) break;
  }
  return out;
}

function parseAliExpressSpecs(html: string): ImportedProductDetail[] {
  const blocks = [
    matchJsonArray(html, /"productPropList"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/),
    matchJsonArray(html, /"props"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/),
    matchJsonArray(html, /"specs"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/),
  ];
  const out: ImportedProductDetail[] = [];
  for (const block of blocks) {
    for (const row of block) {
      if (!row || typeof row !== "object") continue;
      const obj = row as Record<string, unknown>;
      const label =
        (typeof obj.attrName === "string" && obj.attrName) ||
        (typeof obj.name === "string" && obj.name) ||
        null;
      let value: string | null = null;
      if (typeof obj.attrValue === "string") value = obj.attrValue;
      else if (Array.isArray(obj.attrValue)) {
        value = obj.attrValue.filter((x): x is string => typeof x === "string").join(", ");
      } else if (typeof obj.value === "string") value = obj.value;
      if (!label || !value?.trim()) continue;
      if (out.some((d) => d.label.toLowerCase() === label.toLowerCase())) continue;
      out.push({ id: crypto.randomUUID(), label, value: value.trim() });
    }
    if (out.length) break;
  }
  return out.slice(0, 24);
}

function matchString(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m?.[1] ?? null;
}

function matchNumber(html: string, re: RegExp): number | null {
  const m = html.match(re);
  if (!m?.[1]) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function matchJsonArray(html: string, re: RegExp): unknown[] {
  const m = html.match(re);
  if (!m?.[1]) return [];
  try {
    const parsed = JSON.parse(m[1]) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function unescapeJsonString(value: string): string {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, " ").replace(/\\\\/g, "\\");
  }
}

function parseFromHtml(
  html: string,
  provider: DropshippingProvider,
  sourceUrl: string
): ImportedSupplierProduct {
  const warnings: string[] = [];
  const ld = extractJsonLdProducts(html)[0];
  const embedded = provider === "aliexpress" ? parseAliExpressEmbedded(html) : {};

  const title = pickTitle(
    embedded.title,
    typeof ld?.name === "string" ? ld.name : null,
    metaContent(html, "og:title"),
    metaContent(html, "twitter:title"),
    stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
  );

  const descriptionText =
    (typeof ld?.description === "string" ? ld.description : null) ||
    metaContent(html, "og:description") ||
    metaContent(html, "description") ||
    "";

  const descriptionHtml = descriptionText
    ? `<p>${escapeHtml(stripTags(descriptionText))}</p>`
    : "";

  const ldOffer = offerPrice(ld?.offers);
  const price =
    embedded.price ??
    ldOffer.price ??
    numberFromMeta(metaContent(html, "product:price:amount") || metaContent(html, "og:price:amount"));

  const currency =
    embedded.currency ||
    ldOffer.currency ||
    metaContent(html, "product:price:currency") ||
    metaContent(html, "og:price:currency");

  const images = uniqueUrls([
    ...(embedded.images ?? []),
    ...collectImages(ld?.image),
    ...allMetaImages(html),
  ]).slice(0, 12);

  const ldDetails: ImportedProductDetail[] = [];
  const additional = ld?.additionalProperty;
  if (Array.isArray(additional)) {
    for (const row of additional) {
      if (!row || typeof row !== "object") continue;
      const obj = row as Record<string, unknown>;
      if (typeof obj.name === "string" && typeof obj.value === "string" && obj.value.trim()) {
        ldDetails.push({
          id: crypto.randomUUID(),
          label: obj.name,
          value: obj.value.trim(),
        });
      }
    }
  }

  if (!title.trim()) warnings.push("Could not find a product title on the page.");
  if (!images.length) warnings.push("No product images found — you can upload them manually.");
  if (price == null) warnings.push("Price was not found — enter it manually.");

  return {
    title: title.trim().slice(0, 200),
    descriptionHtml,
    price,
    comparePrice: embedded.comparePrice ?? null,
    currency,
    images,
    sku: embedded.sku ?? null,
    brand: embedded.brand ?? null,
    variants: embedded.variants ?? [],
    details: [...(embedded.details ?? []), ...ldDetails].slice(0, 24),
    sourceUrl,
    provider,
    warnings,
  };
}

function numberFromMeta(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchHtml(url: string): Promise<string> {
  const attempts = [
    BROWSER_UA,
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
  ];
  let lastError: Error | null = null;
  for (const ua of attempts) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) {
        lastError = new Error(`Supplier page returned HTTP ${res.status}`);
        continue;
      }
      const text = await res.text();
      if (text.length > 500) return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Fetch failed");
    }
  }
  throw lastError ?? new Error("Could not fetch supplier page");
}

/** Jina reader often renders CSR product pages into markdown we can parse. */
async function fetchViaJina(url: string): Promise<Partial<ImportedSupplierProduct> | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: "text/plain",
        "User-Agent": BROWSER_UA,
        "X-Return-Format": "markdown",
      },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const md = await res.text();

    const titleCandidates = [
      md.match(/^Title:\s*(.+)$/m)?.[1]?.trim(),
      ...Array.from(md.matchAll(/^#\s+(.+)$/gm)).map((m) => m[1]?.trim()),
      md.match(/\*\*([^*]{8,120})\*\*/)?.[1]?.trim(),
    ];
    const title = pickTitle(...titleCandidates);

    const images = uniqueUrls(
      Array.from(md.matchAll(/!\[[^\]]*\]\((https?:[^)\s]+)\)/g)).map((m) => m[1])
    ).filter((u) => isUsefulProductImage(u));

    const priceMatch =
      md.match(/(?:US\s*)?\$\s*([\d]+(?:\.\d{1,2})?)/i) ||
      md.match(/€\s*([\d]+(?:\.\d{1,2})?)/) ||
      md.match(/([\d]+(?:\.\d{1,2})?)\s*(?:USD|EUR)/i);
    const price = priceMatch ? Number(priceMatch[1]) : null;
    const desc =
      md
        .split("\n")
        .map((l) => l.trim())
        .find(
          (l) =>
            l.length > 40 &&
            !l.startsWith("http") &&
            !l.startsWith("!") &&
            !l.startsWith("#") &&
            !/^title:/i.test(l) &&
            !/^url source:/i.test(l) &&
            !/^markdown content:/i.test(l)
        ) || "";

    if (!title && !images.length) return null;
    return {
      title: title || undefined,
      images,
      price: price && Number.isFinite(price) ? price : null,
      currency: priceMatch?.[0]?.includes("€") ? "EUR" : price != null ? "USD" : null,
      descriptionHtml: desc ? `<p>${escapeHtml(desc.slice(0, 1200))}</p>` : undefined,
    };
  } catch {
    return null;
  }
}

function isUsefulProductImage(url: string): boolean {
  const u = url.toLowerCase();
  if (!/^https?:\/\//i.test(url)) return false;
  if (u.includes("1x1.") || u.includes("pixel") || u.includes("spacer")) return false;
  if (/\.gif(\?|$)/i.test(u)) return false;
  if (/tps-\d+-\d+/i.test(u)) return false; // AE UI chrome banners
  if (/\/\d{2,3}x\d{2,3}(\.|\/)/i.test(u)) return false;
  if (/_\d{2,3}x\d{2,3}\./i.test(u)) return false;
  // Real product gallery paths
  if (/\/kf\/[a-z0-9]/i.test(u)) return true;
  if (/aliexpress-media\.com/i.test(u)) return true;
  if (/alicdn\.com/i.test(u) && !/imgextra\/i\d\/o1cn01/i.test(u)) return true;
  if (/cjdropshipping|bigbuy|kfcdn/i.test(u)) return true;
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(u)) return true;
  return false;
}

async function fetchAliExpressReviewImages(productId: string): Promise<string[]> {
  try {
    const url = `https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${encodeURIComponent(productId)}&page=1&pageSize=20&filter=all&sort=complex_default`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/json,text/plain,*/*",
        Referer: `https://www.aliexpress.com/item/${productId}.html`,
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: { evaViewList?: Array<{ images?: string[]; photos?: string[]; thumbnails?: string[] }> };
    };
    const list = data.data?.evaViewList ?? [];
    const urls: string[] = [];
    for (const row of list) {
      for (const img of [...(row.images ?? []), ...(row.photos ?? []), ...(row.thumbnails ?? [])]) {
        if (typeof img === "string") urls.push(img);
      }
    }
    return uniqueUrls(urls);
  } catch {
    return [];
  }
}

async function fetchViaMicrolink(url: string): Promise<Partial<ImportedSupplierProduct> | null> {
  try {
    const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true`;
    const res = await fetch(endpoint, {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status?: string;
      data?: {
        title?: string;
        description?: string;
        image?: { url?: string } | string;
        price?: number | string;
        currency?: string;
      };
    };
    if (data.status !== "success" || !data.data) return null;
    const img =
      typeof data.data.image === "string"
        ? data.data.image
        : data.data.image?.url;
    const priceRaw = data.data.price;
    const price =
      typeof priceRaw === "number"
        ? priceRaw
        : typeof priceRaw === "string"
          ? Number(String(priceRaw).replace(/[^\d.]/g, ""))
          : NaN;
    return {
      title: data.data.title,
      descriptionHtml: data.data.description
        ? `<p>${escapeHtml(data.data.description)}</p>`
        : undefined,
      images: img ? [img] : [],
      price: Number.isFinite(price) && price > 0 ? price : null,
      currency: data.data.currency ?? null,
    };
  } catch {
    return null;
  }
}

function cleanImportedTitle(title: string): string {
  return title
    .replace(/\s*[-–—|]\s*AliExpress(?:\s*\d+)?\s*\/?\s*$/i, "")
    .replace(/\s*[-–—|]\s*CJdropshipping\s*$/i, "")
    .replace(/\s*[-–—|]\s*BigBuy\s*$/i, "")
    .replace(/\s*\|.*$/i, (m) => (m.length > 40 ? "" : m)) // drop long pipe suffixes
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function isBadTitle(title: string | null | undefined): boolean {
  const t = (title ?? "").trim();
  if (!t) return true;
  if (t.length < 4) return true;
  if (/^url source:/i.test(t)) return true;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^aliexpress$/i.test(t)) return true;
  if (/^\d+\.html$/i.test(t)) return true;
  if (/!\[|\]\(|点击|源网页|captcha/i.test(t)) return true;
  return /captcha|interception|access denied|robot|just a moment|cloudflare|verify you are human|attention required|aliexpress\.com\/item/i.test(
    t
  );
}

function pickTitle(...candidates: Array<string | null | undefined>): string {
  for (const c of candidates) {
    const t = cleanImportedTitle((c ?? "").trim());
    if (!isBadTitle(t)) return t;
  }
  return "";
}

function aliexpressProductId(url: string): string | null {
  const m =
    url.match(/\/item\/(\d+)\.html/i) ||
    url.match(/[?&]productId=(\d+)/i) ||
    url.match(/\/i\/(\d+)\.html/i);
  return m?.[1] ?? null;
}

function mergePartials(
  base: ImportedSupplierProduct,
  extra: Partial<ImportedSupplierProduct> | null | undefined
): ImportedSupplierProduct {
  if (!extra) return base;

  const mergedVariants = mergeVariants(base.variants, extra.variants);
  const mergedDetails = mergeDetails(base.details, extra.details);

  const sale = base.price ?? extra.price ?? null;
  const originalCandidates = [base.comparePrice, extra.comparePrice].filter(
    (n): n is number => typeof n === "number" && n > 0
  );
  const original = originalCandidates.length ? Math.max(...originalCandidates) : null;
  const price = sale ?? original;
  const comparePrice =
    original && price && original > price ? original : null;

  const merged: ImportedSupplierProduct = {
    ...base,
    title: pickTitle(base.title, extra.title),
    descriptionHtml: base.descriptionHtml || extra.descriptionHtml || "",
    price,
    comparePrice,
    currency: base.currency || extra.currency || null,
    images: uniqueUrls([...(base.images ?? []), ...(extra.images ?? [])]).slice(0, 12),
    sku: base.sku || extra.sku || null,
    barcode: base.barcode || extra.barcode || null,
    brand: base.brand || extra.brand || null,
    tags: Array.from(new Set([...(base.tags ?? []), ...(extra.tags ?? [])])).slice(0, 16),
    highlights: Array.from(
      new Set([...(base.highlights ?? []), ...(extra.highlights ?? [])])
    ).slice(0, 12),
    variants: mergedVariants,
    details: mergedDetails,
    packageWeightKg: base.packageWeightKg ?? extra.packageWeightKg ?? null,
    warnings: [...base.warnings],
  };
  if (!merged.title.trim()) merged.warnings.push("Could not find a product title.");
  if (!merged.images.length) merged.warnings.push("No product images found.");
  if (merged.price == null) merged.warnings.push("Price was not found.");
  merged.warnings = Array.from(new Set(merged.warnings));
  return merged;
}

function mergeVariants(
  a?: ImportedVariantOption[],
  b?: ImportedVariantOption[]
): ImportedVariantOption[] {
  const map = new Map<string, ImportedVariantOption>();
  for (const v of [...(a ?? []), ...(b ?? [])]) {
    const key = v.name.trim().toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...v,
        options: Array.from(new Set(v.options.filter(Boolean))),
        optionImages: { ...(v.optionImages ?? {}) },
      });
      continue;
    }
    const optionImages = { ...(existing.optionImages ?? {}), ...(v.optionImages ?? {}) };
    map.set(key, {
      ...existing,
      options: Array.from(new Set([...existing.options, ...v.options].filter(Boolean))),
      optionImages: Object.keys(optionImages).length ? optionImages : undefined,
    });
  }
  return Array.from(map.values());
}

function mergeDetails(
  a?: ImportedProductDetail[],
  b?: ImportedProductDetail[]
): ImportedProductDetail[] {
  const map = new Map<string, ImportedProductDetail>();
  for (const d of [...(a ?? []), ...(b ?? [])]) {
    const key = d.label.trim().toLowerCase();
    if (!key || !d.value.trim()) continue;
    if (!map.has(key)) map.set(key, d);
  }
  return Array.from(map.values()).slice(0, 24);
}

export async function importSupplierProduct(input: {
  url: string;
  provider: DropshippingProvider;
}): Promise<ImportedSupplierProduct> {
  const parsed = assertSupplierUrl(input.url, input.provider);
  const sourceUrl = parsed.toString();
  const warnings: string[] = [];
  const productId =
    input.provider === "aliexpress" ? aliexpressProductId(sourceUrl) : null;

  let result: ImportedSupplierProduct = {
    title: "",
    descriptionHtml: "",
    price: null,
    comparePrice: null,
    currency: null,
    images: [],
    sku: productId,
    brand: null,
    tags: [],
    highlights: [],
    variants: [],
    details: [],
    packageWeightKg: null,
    sourceUrl,
    provider: input.provider,
    warnings: [],
  };

  // Best path for AliExpress when RapidAPI key is configured
  if (input.provider === "aliexpress" && productId) {
    const rapid = await fetchAliExpressViaRapidApi(productId);
    result = mergePartials(result, rapid);
  }

  const urlsToTry = [sourceUrl];
  if (input.provider === "aliexpress" && productId) {
    urlsToTry.push(`https://www.aliexpress.com/item/${productId}.html`);
    urlsToTry.push(`https://m.aliexpress.com/item/${productId}.html`);
    urlsToTry.push(`https://www.aliexpress.us/item/${productId}.html`);
  }

  let html = "";
  for (const tryUrl of Array.from(new Set(urlsToTry))) {
    try {
      html = await fetchHtml(tryUrl);
      if (html && !/captcha|punish|____errorCode|__baxia__/i.test(html.slice(0, 4000))) {
        break;
      }
    } catch (err) {
      warnings.push(
        err instanceof Error ? err.message : "Could not open the supplier page directly."
      );
    }
  }

  if (html) {
    result = mergePartials(result, parseFromHtml(html, input.provider, sourceUrl));
  }

  if (isBadTitle(result.title)) {
    result = { ...result, title: "" };
  }

  result.warnings = Array.from(new Set([...warnings, ...result.warnings]));

  const alwaysEnrich = input.provider === "aliexpress" || input.provider === "cj";
  const needsEnrichment =
    alwaysEnrich || !result.title || result.images.length < 1 || result.price == null;

  if (needsEnrichment) {
    const jina = await fetchViaJina(sourceUrl);
    result = mergePartials(result, jina);
    if ((!result.title || result.images.length < 2) && urlsToTry[1]) {
      const jinaAlt = await fetchViaJina(urlsToTry[1]);
      result = mergePartials(result, jinaAlt);
    }
  }

  if (!result.title || result.images.length < 1 || result.price == null) {
    const micro = await fetchViaMicrolink(sourceUrl);
    result = mergePartials(result, micro);
  }

  if (input.provider === "aliexpress" && productId && result.images.length < 2) {
    const reviewImages = await fetchAliExpressReviewImages(productId);
    if (reviewImages.length) {
      result = mergePartials(result, { images: reviewImages });
    }
  }

  const rawImages = uniqueUrls(result.images).map((u) =>
    u.includes("alicdn.com") ? u.replace(/_\d+x\d+\./, ".") : u
  );
  const filtered = rawImages.filter((u) => isUsefulProductImage(u));
  // Prefer filtered; if empty keep CDN gallery candidates from the raw set
  const fallbackGallery = rawImages.filter(
    (u) => /\/kf\/S/i.test(u) || /aliexpress-media\.com\/kf\//i.test(u)
  );
  result.images = (filtered.length ? filtered : fallbackGallery.length ? fallbackGallery : rawImages).slice(
    0,
    12
  );

  // Soft fallback so the merchant still gets into the editor with something useful
  result.title = cleanImportedTitle(result.title);
  if (!result.title.trim()) {
    if (input.provider === "aliexpress" && productId) {
      result.title = `AliExpress product ${productId}`;
      result.warnings.push("Title was incomplete — rename it before publishing.");
    } else if (result.images.length > 0) {
      result.title = "Imported product";
      result.warnings.push("Title was incomplete — rename it before publishing.");
    }
  }

  if (!result.title.trim() && result.images.length === 0) {
    throw new Error(
      "Couldn’t read this product link. AliExpress often blocks automated access — try another link, set RAPIDAPI_KEY for full AliExpress import, or Create manually."
    );
  }

  const finalWarnings: string[] = [];
  if (!result.images.length) finalWarnings.push("No product images found — upload them manually.");
  if (result.price == null) finalWarnings.push("Price was not found — enter it manually.");
  if (/^AliExpress product \d+$/i.test(result.title) || result.title === "Imported product") {
    finalWarnings.push("Rename the product title before publishing.");
  }
  result.warnings = Array.from(new Set(finalWarnings));

  return result;
}
