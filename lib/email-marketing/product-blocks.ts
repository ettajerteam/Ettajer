import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo/site-config";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import {
  parseEmailBlocks,
  type EmailBlock,
  type EmailProductBlock,
  type EmailProductRecoBlock,
  type ResolvedEmailProductCard,
} from "@/lib/email-marketing/email-blocks";
import { productBlockHelpers } from "@/lib/email-marketing/product-blocks-render";
import { recommendProducts } from "@/lib/email-marketing/atlas/recommendations";

export type { ResolvedEmailProductCard } from "@/lib/email-marketing/email-blocks";
export {
  buildEmailProductBlocksHtml,
  resolveEmailProductBlocksFromCatalog,
} from "@/lib/email-marketing/product-blocks-render";

/**
 * Resolve product + recommendation blocks to live catalog data.
 * Call at preview (server) and send time so price/image updates sync automatically.
 * Pass recipientEmail so reco strategies personalize at send.
 */
export async function resolveEmailProductBlocks(input: {
  storeId: string;
  storeSlug: string;
  currency: string;
  blocks: EmailBlock[] | unknown;
  recipientEmail?: string | null;
}): Promise<ResolvedEmailProductCard[]> {
  const blocks = parseEmailBlocks(input.blocks);
  if (blocks.length === 0) return [];

  const productBlocks = blocks.filter(
    (b): b is EmailProductBlock => b.type === "product"
  );
  const recoBlocks = blocks.filter(
    (b): b is EmailProductRecoBlock => b.type === "product_reco"
  );

  const staticIds = productBlocks.map((b) => b.productId);
  const recoIdLists: { block: EmailProductRecoBlock; ids: string[] }[] = [];

  for (const block of recoBlocks) {
    const ids = await recommendProducts({
      storeId: input.storeId,
      email: input.recipientEmail,
      strategy: block.strategy,
      limit: block.limit,
      seedProductId: block.seedProductId,
    });
    recoIdLists.push({ block, ids });
  }

  const allIds = Array.from(
    new Set([...staticIds, ...recoIdLists.flatMap((r) => r.ids)])
  );
  if (allIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { storeId: input.storeId, id: { in: allIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      comparePrice: true,
      images: true,
      variants: true,
      status: true,
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const cards: ResolvedEmailProductCard[] = [];

  for (const block of productBlocks) {
    const card = toCard(block, byId.get(block.productId), input.storeSlug);
    if (card) cards.push(card);
  }

  for (const { block, ids } of recoIdLists) {
    for (const productId of ids) {
      const product = byId.get(productId);
      if (!product || product.status === "archived") continue;
      const compare =
        product.comparePrice != null && product.comparePrice > product.price
          ? product.comparePrice
          : null;
      cards.push({
        blockId: `${block.id}:${productId}`,
        productId: product.id,
        title: product.title,
        imageUrl: Array.isArray(product.images)
          ? (product.images[0] as string) || null
          : null,
        price: product.price,
        comparePrice: compare,
        discountPercent: productBlockHelpers.discountPercent(
          product.price,
          compare
        ),
        variantLabel: null,
        buttonLabel: block.buttonLabel?.trim() || "Shop now",
        productUrl: absoluteUrl(
          getStoreProductUrl(input.storeSlug, product.slug)
        ),
        showComparePrice: block.showComparePrice !== false,
        showDiscountBadge: block.showDiscountBadge !== false,
        showVariant: false,
      });
    }
  }

  return cards;
}

function toCard(
  block: EmailProductBlock,
  product:
    | {
        id: string;
        title: string;
        slug: string;
        price: number;
        comparePrice: number | null;
        images: unknown;
        variants: unknown;
        status: string;
      }
    | undefined,
  storeSlug: string
): ResolvedEmailProductCard | null {
  if (!product || product.status === "archived") return null;
  const compare =
    product.comparePrice != null && product.comparePrice > product.price
      ? product.comparePrice
      : null;
  const showVariant = block.showVariant !== false;
  return {
    blockId: block.id,
    productId: product.id,
    title: product.title,
    imageUrl: productBlockHelpers.imageForBlock(
      block,
      product.images,
      product.variants
    ),
    price: product.price,
    comparePrice: compare,
    discountPercent: productBlockHelpers.discountPercent(product.price, compare),
    variantLabel: showVariant
      ? productBlockHelpers.variantLabelFromBlock(block, product.variants)
      : null,
    buttonLabel: block.buttonLabel?.trim() || "Shop now",
    productUrl: absoluteUrl(getStoreProductUrl(storeSlug, product.slug)),
    showComparePrice: block.showComparePrice !== false,
    showDiscountBadge: block.showDiscountBadge !== false,
    showVariant,
  };
}
