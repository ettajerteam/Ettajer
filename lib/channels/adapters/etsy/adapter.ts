import { EtsyApiClient } from "@/lib/channels/adapters/etsy/client";
import { getEtsyClientId, refreshEtsyAccessToken } from "@/lib/channels/adapters/etsy/oauth";
import {
  mapEtsyListingToImportResult,
  type EtsyListing,
} from "@/lib/channels/adapters/etsy/map-listing";
import {
  mapEtsyReceiptToOrderDetail,
  mapEtsyReceiptToOrderSummary,
  type EtsyReceipt,
} from "@/lib/channels/adapters/etsy/map-order";
import type {
  ChannelAdapter,
  ChannelFulfillmentInput,
  ChannelImageInput,
  ChannelInventoryUpdate,
  ChannelListOrdersParams,
  ChannelListPage,
  ChannelListProductsParams,
  ChannelListing,
  ChannelOrderDetail,
  ChannelOrderSummary,
  ChannelProductInput,
  ChannelShop,
} from "@/lib/channels/adapters/types";

const IMAGE_FETCH_TIMEOUT_MS = 20_000;

async function fetchImageAsFile(
  url: string,
  index: number
): Promise<{ data: Buffer; filename: string; contentType: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Could not download image (${res.status})`);
    }
    const contentType = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    if (!contentType.startsWith("image/")) {
      throw new Error(`URL is not an image (${contentType})`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const data = Buffer.from(arrayBuffer);
    if (data.byteLength < 100) throw new Error("Image file is empty");
    const ext =
      contentType.includes("png")
        ? "png"
        : contentType.includes("webp")
          ? "webp"
          : contentType.includes("gif")
            ? "gif"
            : "jpg";
    return {
      data,
      filename: `listing-${index + 1}.${ext}`,
      contentType: contentType === "image/jpg" ? "image/jpeg" : contentType,
    };
  } finally {
    clearTimeout(timer);
  }
}

export interface EtsyAdapterTokens {
  accessToken: string;
  refreshToken?: string | null;
}

export interface EtsyAdapterOptions {
  /** Known Etsy shop id — skips a getMe()+getShopByOwnerUserId() round trip when provided. */
  shopId?: string | null;
  /**
   * Called after a successful token refresh so the caller can persist the new
   * access/refresh token pair (see connection-service.updateConnectionTokens).
   */
  onTokenRefreshed?: (tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }) => Promise<void> | void;
}

/**
 * Etsy Open API v3 implementation of the channel-agnostic ChannelAdapter.
 * Lazily resolves the shop id on first use and transparently refreshes the
 * access token on a 401 if a refresh token + onTokenRefreshed callback are provided.
 */
export class EtsyAdapter implements ChannelAdapter {
  private accessToken: string;
  private refreshToken: string | null;
  private readonly clientId: string;
  private readonly onTokenRefreshed: EtsyAdapterOptions["onTokenRefreshed"];
  private shopId: string | null;
  private client: EtsyApiClient;

  constructor(tokens: EtsyAdapterTokens, options: EtsyAdapterOptions = {}) {
    const clientId = getEtsyClientId();
    if (!clientId) throw new Error("ETSY_CLIENT_ID is not configured");
    this.clientId = clientId;
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken ?? null;
    this.shopId = options.shopId ?? null;
    this.onTokenRefreshed = options.onTokenRefreshed;
    this.client = new EtsyApiClient({ clientId, accessToken: this.accessToken });
  }

  /** Run an API call, refreshing the token once and retrying on 401. */
  private async withAuthRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const isUnauthorized =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status?: number }).status === 401;
      if (!isUnauthorized || !this.refreshToken) throw error;

      const refreshed = await refreshEtsyAccessToken(this.refreshToken);
      this.accessToken = refreshed.accessToken;
      this.refreshToken = refreshed.refreshToken;
      this.client = new EtsyApiClient({ clientId: this.clientId, accessToken: this.accessToken });

      if (this.onTokenRefreshed) {
        await this.onTokenRefreshed({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
        });
      }

      return fn();
    }
  }

  private async resolveShopId(): Promise<string> {
    if (this.shopId) return this.shopId;
    const shop = await this.getShop();
    this.shopId = shop.externalShopId;
    return shop.externalShopId;
  }

  async getShop(): Promise<ChannelShop> {
    return this.withAuthRetry(async () => {
      if (this.shopId) {
        const raw = await this.client.getShop(this.shopId);
        return this.mapShop(raw);
      }
      const me = await this.client.getMe();
      const shopsResponse = await this.client.getShopByOwnerUserId(me.user_id);
      const raw = shopsResponse.results[0];
      if (!raw) throw new Error("Etsy user has no shops");
      this.shopId = String(raw.shop_id);
      return this.mapShop(raw, String(me.user_id));
    });
  }

  private mapShop(raw: Record<string, unknown>, externalAccountId?: string): ChannelShop {
    return {
      externalShopId: String(raw.shop_id),
      externalAccountId: externalAccountId ?? String(raw.user_id ?? raw.shop_id),
      name: (raw.shop_name as string) ?? "Etsy shop",
      url: (raw.url as string) ?? null,
      currencyCode: (raw.currency_code as string) ?? null,
      countryCode: (raw.country_iso as string) ?? null,
      listingActiveCount: (raw.listing_active_count as number) ?? null,
      raw,
    };
  }

  async listProducts(
    params: ChannelListProductsParams = {}
  ): Promise<ChannelListPage<ChannelListing>> {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      const limit = params.limit ?? 25;
      const offset = params.cursor ? Number(params.cursor) || 0 : 0;
      const response = await this.client.getListingsByShop(shopId, {
        state: (params.state as "active" | "inactive" | "draft") ?? "active",
        limit,
        offset,
        includes: ["Images", "Inventory"],
      });
      const items = response.results.map(
        (raw) => mapEtsyListingToImportResult(raw as EtsyListing).channelListing
      );
      const nextOffset = offset + response.results.length;
      return {
        items,
        nextCursor: nextOffset < response.count ? String(nextOffset) : null,
      };
    });
  }

  async getProduct(externalProductId: string): Promise<ChannelListing> {
    return this.withAuthRetry(async () => {
      const raw = await this.client.getListing(externalProductId, [
        "Images",
        "Inventory",
        "Shipping",
      ]);
      return mapEtsyListingToImportResult(raw as EtsyListing).channelListing;
    });
  }

  async createProduct(
    input: ChannelProductInput
  ): Promise<{ externalProductId: string; raw: unknown }> {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      const attrs = input.channelAttributes ?? {};
      const requiredAttrs = ["who_made", "when_made", "taxonomy_id"] as const;
      const missing = requiredAttrs.filter((key) => attrs[key] === undefined);
      if (missing.length > 0) {
        throw new Error(
          `Etsy createProduct requires channelAttributes: ${missing.join(", ")}`
        );
      }
      if (!attrs.shipping_profile_id) {
        throw new Error(
          "Etsy createProduct requires a shipping_profile_id — reconnect Etsy or add a shipping profile in your Etsy shop settings"
        );
      }

      const raw = await this.client.createDraftListing(shopId, {
        quantity: Math.max(1, input.quantity),
        title: input.title.slice(0, 140),
        description: input.description || input.title,
        price: input.price,
        tags: input.tags.slice(0, 13),
        sku: input.sku ? [input.sku] : undefined,
        type: attrs.type ?? "physical",
        ...attrs,
      });
      const externalProductId = String(raw.listing_id);

      if (input.images.length > 0) {
        const imageResult = await this.uploadImagesInternal(
          shopId,
          externalProductId,
          input.images
        );
        if (imageResult.failed > 0) {
          throw new Error(
            `Failed to upload listing image: ${imageResult.errors[0] ?? "unknown error"}`
          );
        }
      }

      return { externalProductId, raw };
    });
  }

  async updateProduct(
    externalProductId: string,
    input: Partial<ChannelProductInput>
  ): Promise<{ raw: unknown }> {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      const payload: Record<string, unknown> = { ...(input.channelAttributes ?? {}) };
      if (input.title !== undefined) payload.title = input.title.slice(0, 140);
      if (input.description !== undefined) payload.description = input.description;
      if (input.price !== undefined) payload.price = input.price;
      if (input.quantity !== undefined) payload.quantity = Math.max(0, input.quantity);
      if (input.tags !== undefined) payload.tags = input.tags.slice(0, 13);

      const raw = await this.client.updateListing(shopId, externalProductId, payload);

      if (input.images && input.images.length > 0) {
        const imageResult = await this.uploadImagesInternal(
          shopId,
          externalProductId,
          input.images
        );
        if (imageResult.failed > 0) {
          throw new Error(
            `Failed to upload listing image: ${imageResult.errors[0] ?? "unknown error"}`
          );
        }
      }

      return { raw };
    });
  }

  async publishProduct(externalProductId: string): Promise<{ raw: unknown }> {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      const raw = await this.client.updateListing(shopId, externalProductId, {
        state: "active",
      });
      return { raw };
    });
  }

  async syncProductImages(
    externalProductId: string,
    images: ChannelImageInput[]
  ): Promise<{ uploaded: number; failed: number; errors: string[] }> {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      return this.uploadImagesInternal(shopId, externalProductId, images);
    });
  }

  async listShippingProfiles(): Promise<
    Array<{ id: string; title: string; isDefault?: boolean }>
  > {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      const response = await this.client.getShopShippingProfiles(shopId);
      return (response.results ?? []).map((raw, index) => ({
        id: String(raw.shipping_profile_id),
        title:
          (typeof raw.title === "string" && raw.title) ||
          (typeof raw.name === "string" && raw.name) ||
          `Shipping profile ${index + 1}`,
        isDefault: Boolean(raw.is_default) || index === 0,
      }));
    });
  }

  private async uploadImagesInternal(
    shopId: string,
    listingId: string,
    images: ChannelImageInput[]
  ): Promise<{ uploaded: number; failed: number; errors: string[] }> {
    const MAX_IMAGES = 10;
    let uploaded = 0;
    let failed = 0;
    const errors: string[] = [];

    const limited = images.slice(0, MAX_IMAGES);
    for (let index = 0; index < limited.length; index++) {
      const image = limited[index];
      try {
        const file = await fetchImageAsFile(image.url, index);
        await this.client.uploadListingImage(shopId, listingId, {
          ...file,
          rank: (image.position ?? index) + 1,
        });
        uploaded += 1;
      } catch (error) {
        failed += 1;
        errors.push(
          error instanceof Error ? error.message.slice(0, 200) : `Image ${index + 1} failed`
        );
      }
    }

    return { uploaded, failed, errors };
  }

  async updateInventory(
    externalProductId: string,
    updates: ChannelInventoryUpdate[]
  ): Promise<{ raw: unknown }> {
    return this.withAuthRetry(async () => {
      const raw = await this.client.getListing(externalProductId, ["Inventory"]);
      const inventory = (raw as EtsyListing).inventory;
      if (!inventory) {
        throw new Error(
          `Etsy listing ${externalProductId} has no inventory to update`
        );
      }

      const bySku = new Map(updates.filter((u) => u.sku).map((u) => [u.sku, u.quantity]));
      const products = inventory.products.map((product) => {
        const newQty = product.sku ? bySku.get(product.sku) : undefined;
        if (newQty === undefined) return product;
        return {
          ...product,
          offerings: product.offerings.map((offering, i) =>
            i === 0 ? { ...offering, quantity: newQty } : offering
          ),
        };
      });

      const result = await this.client.updateListingInventory(externalProductId, {
        products,
      });
      return { raw: result };
    });
  }

  async listOrders(
    params: ChannelListOrdersParams = {}
  ): Promise<ChannelListPage<ChannelOrderSummary>> {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      const limit = params.limit ?? 25;
      const offset = params.cursor ? Number(params.cursor) || 0 : 0;
      const minCreated = params.since
        ? Math.floor(new Date(params.since).getTime() / 1000)
        : undefined;

      const response = await this.client.getShopReceipts(shopId, {
        limit,
        offset,
        minCreated,
      });
      const items = response.results.map((raw) =>
        mapEtsyReceiptToOrderSummary(raw as EtsyReceipt)
      );
      const nextOffset = offset + response.results.length;
      return {
        items,
        nextCursor: nextOffset < response.count ? String(nextOffset) : null,
      };
    });
  }

  async getOrder(externalOrderId: string): Promise<ChannelOrderDetail> {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      const raw = await this.client.getShopReceipt(shopId, externalOrderId);
      return mapEtsyReceiptToOrderDetail(raw as EtsyReceipt);
    });
  }

  async updateFulfillment(
    externalOrderId: string,
    input: ChannelFulfillmentInput
  ): Promise<{ raw: unknown }> {
    return this.withAuthRetry(async () => {
      const shopId = await this.resolveShopId();
      const raw = await this.client.createReceiptShipment(shopId, externalOrderId, {
        tracking_code: input.trackingNumber,
        carrier_name: input.carrierName ?? undefined,
      });
      return { raw };
    });
  }
}
