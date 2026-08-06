import {
  isRecoStrategy,
  type RecoStrategy,
} from "@/lib/email-marketing/atlas/types";

export const EMAIL_BLOCK_TYPES = ["product", "product_reco"] as const;
export type EmailBlockType = (typeof EMAIL_BLOCK_TYPES)[number];

/** Stored on EmailTemplate.blocks — product data resolved live at render/send. */
export interface EmailProductBlock {
  id: string;
  type: "product";
  productId: string;
  /** Selected option values by variant name, e.g. { Size: "M" } */
  selectedOptions?: Record<string, string>;
  buttonLabel?: string;
  showComparePrice?: boolean;
  showDiscountBadge?: boolean;
  showVariant?: boolean;
}

/** Dynamic recommendation block — product IDs resolved per-recipient at send. */
export interface EmailProductRecoBlock {
  id: string;
  type: "product_reco";
  strategy: RecoStrategy;
  limit: number;
  seedProductId?: string | null;
  buttonLabel?: string;
  showComparePrice?: boolean;
  showDiscountBadge?: boolean;
}

export type EmailBlock = EmailProductBlock | EmailProductRecoBlock;

export interface ResolvedEmailProductCard {
  blockId: string;
  productId: string;
  title: string;
  imageUrl: string | null;
  price: number;
  comparePrice: number | null;
  discountPercent: number | null;
  variantLabel: string | null;
  buttonLabel: string;
  productUrl: string;
  showComparePrice: boolean;
  showDiscountBadge: boolean;
  showVariant: boolean;
}

function newBlockId(): string {
  return `blk_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function createProductBlock(productId: string): EmailProductBlock {
  return {
    id: newBlockId(),
    type: "product",
    productId,
    selectedOptions: {},
    buttonLabel: "Shop now",
    showComparePrice: true,
    showDiscountBadge: true,
    showVariant: true,
  };
}

export function createProductRecoBlock(
  strategy: RecoStrategy = "best_sellers"
): EmailProductRecoBlock {
  return {
    id: newBlockId(),
    type: "product_reco",
    strategy,
    limit: 3,
    seedProductId: null,
    buttonLabel: "Shop now",
    showComparePrice: true,
    showDiscountBadge: true,
  };
}

export function parseEmailBlocks(raw: unknown): EmailBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks: EmailBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const id =
      typeof obj.id === "string" && obj.id.trim() ? obj.id : newBlockId();

    if (obj.type === "product_reco") {
      const strategyRaw =
        typeof obj.strategy === "string" ? obj.strategy : "best_sellers";
      const strategy = isRecoStrategy(strategyRaw)
        ? strategyRaw
        : "best_sellers";
      const limit =
        typeof obj.limit === "number" && obj.limit > 0
          ? Math.min(12, Math.floor(obj.limit))
          : 3;
      blocks.push({
        id,
        type: "product_reco",
        strategy,
        limit,
        seedProductId:
          typeof obj.seedProductId === "string" ? obj.seedProductId : null,
        buttonLabel:
          typeof obj.buttonLabel === "string" && obj.buttonLabel.trim()
            ? obj.buttonLabel.trim()
            : "Shop now",
        showComparePrice: obj.showComparePrice !== false,
        showDiscountBadge: obj.showDiscountBadge !== false,
      });
      continue;
    }

    if (obj.type !== "product") continue;
    if (typeof obj.productId !== "string" || !obj.productId.trim()) continue;
    const selectedOptions: Record<string, string> = {};
    if (obj.selectedOptions && typeof obj.selectedOptions === "object") {
      for (const [key, val] of Object.entries(
        obj.selectedOptions as Record<string, unknown>
      )) {
        if (typeof val === "string" && val.trim()) {
          selectedOptions[key] = val.trim();
        }
      }
    }
    blocks.push({
      id,
      type: "product",
      productId: obj.productId.trim(),
      selectedOptions,
      buttonLabel:
        typeof obj.buttonLabel === "string" && obj.buttonLabel.trim()
          ? obj.buttonLabel.trim()
          : "Shop now",
      showComparePrice: obj.showComparePrice !== false,
      showDiscountBadge: obj.showDiscountBadge !== false,
      showVariant: obj.showVariant !== false,
    });
  }
  return blocks;
}

export function emailProductBlockIds(blocks: EmailBlock[]): string[] {
  return Array.from(
    new Set(
      blocks
        .filter((b): b is EmailProductBlock => b.type === "product")
        .map((b) => b.productId)
    )
  );
}
