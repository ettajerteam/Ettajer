import { escapeHtml } from "@/lib/email/base-template";
import { parseProductImageAssets } from "@/lib/product-images";
import { parseProductVariants } from "@/lib/product-variants";
import { absoluteUrl } from "@/lib/seo/site-config";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { formatCurrency } from "@/lib/utils";
import {
  parseEmailBlocks,
  type EmailBlock,
  type EmailProductBlock,
  type ResolvedEmailProductCard,
} from "@/lib/email-marketing/email-blocks";

export type { ResolvedEmailProductCard } from "@/lib/email-marketing/email-blocks";

function discountPercent(price: number, comparePrice: number | null): number | null {
  if (comparePrice == null || comparePrice <= price || price < 0) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

function variantLabelFromBlock(
  block: EmailProductBlock,
  variantsJson: unknown
): string | null {
  const variants = parseProductVariants(variantsJson);
  const selected = block.selectedOptions ?? {};
  const parts: string[] = [];

  for (const variant of variants) {
    const chosen = selected[variant.name]?.trim();
    if (chosen) {
      parts.push(`${variant.name}: ${chosen}`);
      continue;
    }
    if (variant.options.filter(Boolean).length) {
      parts.push(`${variant.name}: ${variant.options.filter(Boolean).join(" / ")}`);
    }
  }

  if (parts.length) return parts.join(" · ");
  return null;
}

function imageForBlock(
  block: EmailProductBlock,
  imagesJson: unknown,
  variantsJson: unknown
): string | null {
  const variants = parseProductVariants(variantsJson);
  const selected = block.selectedOptions ?? {};
  for (const variant of variants) {
    const chosen = selected[variant.name]?.trim();
    if (chosen && variant.optionImages?.[chosen]) {
      return variant.optionImages[chosen];
    }
  }
  const images = parseProductImageAssets(imagesJson);
  return images[0]?.url ?? null;
}

/** Client-side resolve when product catalog is already loaded in the editor. */
export function resolveEmailProductBlocksFromCatalog(input: {
  storeSlug: string;
  currency: string;
  blocks: EmailBlock[];
  products: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images?: unknown;
    variants?: unknown;
    status?: string;
  }>;
}): ResolvedEmailProductCard[] {
  const byId = new Map(input.products.map((p) => [p.id, p]));
  const cards: ResolvedEmailProductCard[] = [];
  for (const block of parseEmailBlocks(input.blocks)) {
    if (block.type !== "product") continue;
    const product = byId.get(block.productId);
    if (!product || product.status === "archived") continue;
    const compare =
      product.comparePrice != null && product.comparePrice > product.price
        ? product.comparePrice
        : null;
    const showVariant = block.showVariant !== false;
    cards.push({
      blockId: block.id,
      productId: product.id,
      title: product.title,
      imageUrl: imageForBlock(block, product.images, product.variants),
      price: product.price,
      comparePrice: compare,
      discountPercent: discountPercent(product.price, compare),
      variantLabel: showVariant
        ? variantLabelFromBlock(block, product.variants)
        : null,
      buttonLabel: block.buttonLabel?.trim() || "Shop now",
      productUrl: absoluteUrl(
        getStoreProductUrl(input.storeSlug, product.slug)
      ),
      showComparePrice: block.showComparePrice !== false,
      showDiscountBadge: block.showDiscountBadge !== false,
      showVariant,
    });
  }
  return cards;
}

export function buildEmailProductBlocksHtml(
  cards: ResolvedEmailProductCard[],
  currency: string
): string {
  if (cards.length === 0) return "";

  const rows = cards
    .map((card) => {
      const priceHtml = escapeHtml(formatCurrency(card.price, currency));
      const compareHtml =
        card.showComparePrice && card.comparePrice != null
          ? `<span style="margin-left:8px;color:#a3a3a3;font-size:13px;text-decoration:line-through;">${escapeHtml(
              formatCurrency(card.comparePrice, currency)
            )}</span>`
          : "";
      const badgeHtml =
        card.showDiscountBadge && card.discountPercent != null
          ? `<span style="display:inline-block;margin:0 0 8px;padding:4px 8px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:700;letter-spacing:0.02em;">-${card.discountPercent}%</span>`
          : "";
      const variantHtml =
        card.showVariant && card.variantLabel
          ? `<p style="margin:6px 0 0;color:#737373;font-size:12px;line-height:1.4;">${escapeHtml(
              card.variantLabel
            )}</p>`
          : "";
      const imageHtml = card.imageUrl
        ? `<img src="${escapeHtml(card.imageUrl)}" alt="${escapeHtml(
            card.title
          )}" width="120" height="120" style="display:block;width:120px;height:120px;object-fit:cover;border-radius:12px;border:1px solid #f0f0f0;" />`
        : `<div style="width:120px;height:120px;border-radius:12px;background:#f5f5f5;border:1px solid #f0f0f0;"></div>`;

      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="120" valign="top" style="width:120px;">${imageHtml}</td>
              <td valign="top" style="padding-left:14px;">
                ${badgeHtml}
                <p style="margin:0;color:#171717;font-size:15px;font-weight:650;letter-spacing:-0.02em;line-height:1.35;">${escapeHtml(
                  card.title
                )}</p>
                ${variantHtml}
                <p style="margin:8px 0 0;color:#171717;font-size:15px;font-weight:600;">
                  ${priceHtml}${compareHtml}
                </p>
                <a href="${escapeHtml(
                  card.productUrl
                )}" style="display:inline-block;margin-top:10px;padding:8px 14px;border-radius:10px;background:#171717;color:#ffffff;font-size:12px;font-weight:600;text-decoration:none;">${escapeHtml(
                  card.buttonLabel
                )}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;">
    <tr>
      <td style="padding:0 0 8px;color:#737373;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
        Featured products
      </td>
    </tr>
    ${rows}
  </table>`;
}

/** Shared helpers for server resolve — keep image/variant logic in one place. */
export const productBlockHelpers = {
  discountPercent,
  variantLabelFromBlock,
  imageForBlock,
};
