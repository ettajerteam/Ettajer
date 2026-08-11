import { prisma } from "@/lib/db";
import type { ChannelConnection, ChannelSyncJob, Prisma } from "@prisma/client";
import { getAdapter } from "@/lib/channels/adapters";
import type {
  ChannelAdapter,
  ChannelListing,
  ChannelOrderDetail,
  ChannelProductInput,
} from "@/lib/channels/adapters/types";
import { EtsyApiError } from "@/lib/channels/adapters/etsy/client";
import type { ChannelTokenPayload, ListingImportReadiness } from "@/lib/channels/types";
import {
  getConnectionTokens,
  markConnectionReauthRequired,
  touchConnectionSync,
  updateConnectionTokens,
} from "@/lib/channels/connection-service";
import { appendChannelSyncLog } from "@/lib/channels/sync-log";
import {
  markJobFail,
  markJobRetryOrFail,
  markJobSuccess,
} from "@/lib/channels/sync-queue";
import { ensureProductCodes } from "@/lib/product-codes";
import { parseProductImageAssets, serializeProductImagesForDb } from "@/lib/product-images";
import { generateOrderNumber, slugify } from "@/lib/utils";
import { upsertOrderCustomer } from "@/lib/orders";
import { createStoreNotification } from "@/lib/notifications/create-store-notification";
import type { OrderPaymentStatus, OrderStatus, ShippingAddress } from "@/types";

/**
 * Executes channel sync work — both from the cron-driven job queue
 * (processChannelJob) and from merchant-triggered API routes that want an
 * immediate result (runChannelOperationForStore). Both paths funnel through
 * the same operation implementations + logging so behavior never diverges.
 */

export interface ProcessJobResult {
  status: "success" | "failed" | "retrying";
  message?: string;
}

export interface OperationResult {
  message?: string;
}

const MAX_LIST_PAGES = 40;

function requireString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function loadConnection(
  connectionId: string
): Promise<{ connection: ChannelConnection; tokens: ChannelTokenPayload }> {
  const connection = await prisma.channelConnection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error("Channel connection not found");
  if (connection.status === "DISCONNECTED") {
    throw new Error("Channel connection is disconnected — reconnect to sync again");
  }
  const tokens = getConnectionTokens(connection);
  if (!tokens) throw new Error("Channel connection has no stored credentials — reconnect required");
  return { connection, tokens };
}

function buildAdapter(connection: ChannelConnection, tokens: ChannelTokenPayload): ChannelAdapter {
  return getAdapter(connection.channel, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shopId: connection.externalShopId,
    onTokenRefreshed: async (refreshed) => {
      await updateConnectionTokens(connection.id, refreshed);
    },
  });
}

/**
 * Channel-agnostic readiness classification, mirroring the Etsy-specific
 * logic in adapters/etsy/map-listing.ts but operating on the already-mapped
 * ChannelListing shape so it works for any future adapter too.
 */
export function classifyChannelListing(
  listing: ChannelListing
): { readiness: ListingImportReadiness; issues: string[] } {
  const issues: string[] = [];

  if (listing.state && listing.state !== "active" && listing.state !== "draft") {
    issues.push(`Unsupported listing state: ${listing.state}`);
    return { readiness: "unsupported", issues };
  }

  const hasTitle = Boolean(listing.title.trim());
  const hasPrice = listing.price > 0;
  const hasImages = listing.images.length > 0;
  if (!hasTitle) issues.push("Missing title");
  if (!hasPrice) issues.push("Missing or unparseable price");
  if (!hasImages) issues.push("No usable images");

  if (!hasTitle || !hasPrice || !hasImages) {
    return { readiness: "needs_review", issues };
  }

  if (listing.variants.length > 1 && listing.variants.some((v) => !v.sku)) {
    issues.push("One or more variants are missing a SKU");
  }

  if (listing.variants.length > 0 && listing.variants.every((v) => !v.sku) && !listing.sku) {
    return { readiness: "missing_sku", issues };
  }

  return { readiness: "ready", issues };
}

async function uniqueProductSlug(storeId: string, title: string, fallbackId: string): Promise<string> {
  let slug = slugify(title) || `etsy-${fallbackId}`;
  const taken = await prisma.product.findFirst({ where: { storeId, slug }, select: { id: true } });
  if (taken) slug = `${slug}-${fallbackId}`;
  return slug;
}

/** Create a Product + ProductChannelListing pair for one remote listing. Caller must have already deduped. */
async function importSingleListing(
  storeId: string,
  connection: ChannelConnection,
  listing: ChannelListing
): Promise<string> {
  const title = listing.title.trim() || `Etsy listing ${listing.externalProductId}`;
  const [slug, codes] = await Promise.all([
    uniqueProductSlug(storeId, title, listing.externalProductId),
    ensureProductCodes(storeId, { sku: listing.sku ?? undefined }),
  ]);

  const images = serializeProductImagesForDb(
    listing.images.slice(0, 10).map((img) => ({ url: img.url, alt: img.alt ?? null }))
  );

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        title,
        slug,
        description: listing.description || null,
        price: listing.price > 0 ? listing.price : 0,
        inventory: Math.max(0, listing.quantity ?? 0),
        sku: codes.sku,
        barcode: codes.barcode,
        status: listing.state === "active" ? "active" : "draft",
        productType: "physical",
        images,
        tags: listing.tags.slice(0, 20),
        storeId,
      },
    });

    await tx.productChannelListing.create({
      data: {
        storeId,
        productId: created.id,
        channel: connection.channel,
        connectionId: connection.id,
        externalProductId: listing.externalProductId,
        status: listing.state === "active" ? "active" : "inactive",
        lastSyncedAt: new Date(),
        metadata: { title, url: listing.url ?? null } as Prisma.InputJsonValue,
      },
    });

    return created;
  });

  return product.id;
}

async function importListingsOp(
  storeId: string,
  connectionId: string,
  payload: Record<string, unknown>
): Promise<OperationResult> {
  const { connection, tokens } = await loadConnection(connectionId);
  const adapter = buildAdapter(connection, tokens);
  const state = typeof payload.state === "string" ? payload.state : "active";

  let cursor: string | null | undefined = typeof payload.cursor === "string" ? payload.cursor : null;
  let imported = 0;
  let skippedExisting = 0;
  let skippedNotReady = 0;
  let pages = 0;

  do {
    const page = await adapter.listProducts({ cursor, limit: 25, state });
    for (const listing of page.items) {
      const existing = await prisma.productChannelListing.findUnique({
        where: {
          storeId_channel_connectionId_externalProductId: {
            storeId,
            channel: connection.channel,
            connectionId,
            externalProductId: listing.externalProductId,
          },
        },
        select: { id: true },
      });
      if (existing) {
        skippedExisting += 1;
        continue;
      }

      const { readiness } = classifyChannelListing(listing);
      if (readiness !== "ready" && readiness !== "missing_sku") {
        skippedNotReady += 1;
        continue;
      }

      await importSingleListing(storeId, connection, listing);
      imported += 1;
    }
    cursor = page.nextCursor;
    pages += 1;
  } while (cursor && pages < MAX_LIST_PAGES);

  return {
    message: `Imported ${imported} listing(s); skipped ${skippedExisting} already linked, ${skippedNotReady} needing review`,
  };
}

export interface ImportSpecificListingsResult {
  imported: number;
  skipped: number;
  errors: { externalProductId: string; message: string }[];
}

/** Import a merchant-selected set of listings regardless of readiness (they already reviewed them in preview). */
export async function importSpecificListings(
  storeId: string,
  connectionId: string,
  externalProductIds: string[]
): Promise<ImportSpecificListingsResult> {
  const result = await runChannelOperation(storeId, connectionId, "import_listing", { externalProductIds });
  return result.details as ImportSpecificListingsResult;
}

async function importSpecificListingsOp(
  storeId: string,
  connectionId: string,
  payload: Record<string, unknown>
): Promise<OperationResult & { details: unknown }> {
  const { connection, tokens } = await loadConnection(connectionId);
  const adapter = buildAdapter(connection, tokens);
  const externalProductIds = Array.isArray(payload.externalProductIds)
    ? payload.externalProductIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    : [];
  if (externalProductIds.length === 0) {
    throw new Error("importSpecificListings requires at least one externalProductId");
  }

  let imported = 0;
  let skipped = 0;
  const errors: { externalProductId: string; message: string }[] = [];

  for (const externalProductId of externalProductIds) {
    try {
      const existing = await prisma.productChannelListing.findUnique({
        where: {
          storeId_channel_connectionId_externalProductId: {
            storeId,
            channel: connection.channel,
            connectionId,
            externalProductId,
          },
        },
        select: { id: true },
      });
      if (existing) {
        skipped += 1;
        continue;
      }
      const listing = await adapter.getProduct(externalProductId);
      await importSingleListing(storeId, connection, listing);
      imported += 1;
    } catch (error) {
      errors.push({
        externalProductId,
        message: error instanceof Error ? error.message : "Import failed",
      });
    }
  }

  return {
    message: `Imported ${imported}, skipped ${skipped}${errors.length ? `, ${errors.length} failed` : ""}`,
    details: { imported, skipped, errors },
  };
}

/**
 * Etsy requires who_made / when_made / taxonomy_id on every new listing and
 * has no generic equivalent. We fall back to safe, commonly-valid defaults
 * (handmade, made to order, generic "Craft Supplies & Tools" taxonomy) when
 * the caller doesn't supply an override, so publish never hard-fails — but
 * merchants should still review the listing on Etsy afterwards.
 */
const DEFAULT_ETSY_LISTING_ATTRIBUTES: Record<string, unknown> = {
  who_made: "i_did",
  when_made: "made_to_order",
  taxonomy_id: 1,
  is_supply: false,
  type: "physical",
};

async function ensureEtsyShippingProfileId(
  connection: ChannelConnection,
  adapter: ChannelAdapter
): Promise<{ shippingProfileId: string; returnPolicyId: string | null }> {
  const meta = isRecord(connection.metadata) ? connection.metadata : {};
  let shippingProfileId =
    typeof meta.shippingProfileId === "string" ? meta.shippingProfileId : null;
  let returnPolicyId =
    typeof meta.returnPolicyId === "string" ? meta.returnPolicyId : null;

  if (!shippingProfileId && adapter.listShippingProfiles) {
    const profiles = await adapter.listShippingProfiles();
    const preferred = profiles.find((p) => p.isDefault) ?? profiles[0];
    if (preferred) {
      shippingProfileId = preferred.id;
      await prisma.channelConnection.update({
        where: { id: connection.id },
        data: {
          metadata: {
            ...meta,
            shippingProfileId,
            ...(returnPolicyId ? { returnPolicyId } : {}),
          } as Prisma.InputJsonValue,
        },
      });
    }
  }

  if (!shippingProfileId) {
    throw new Error(
      "No Etsy shipping profile found. Add a shipping profile in your Etsy shop settings, then reconnect or Sync now."
    );
  }

  return { shippingProfileId, returnPolicyId };
}

async function publishListingOp(
  storeId: string,
  connectionId: string,
  payload: Record<string, unknown>
): Promise<OperationResult> {
  const productId = requireString(payload, "productId");
  const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
  if (!product) throw new Error("Product not found");

  const { connection, tokens } = await loadConnection(connectionId);
  const adapter = buildAdapter(connection, tokens);

  const existingListing = await prisma.productChannelListing.findFirst({
    where: { storeId, productId, connectionId, channel: connection.channel },
  });

  const shopMetadata = isRecord(connection.metadata) ? connection.metadata : {};
  const currencyCode =
    typeof shopMetadata.currencyCode === "string" ? shopMetadata.currencyCode : "USD";

  const images = parseProductImageAssets(product.images).map((asset, index) => ({
    url: asset.url,
    alt: asset.alt ?? null,
    position: index,
  }));
  if (images.length === 0) {
    throw new Error("Add at least one product image before publishing to Etsy");
  }

  const { shippingProfileId, returnPolicyId } = await ensureEtsyShippingProfileId(
    connection,
    adapter
  );

  const overrideAttributes = isRecord(payload.channelAttributes)
    ? payload.channelAttributes
    : {};
  const existingMetadata =
    existingListing && isRecord(existingListing.metadata) ? existingListing.metadata : undefined;
  const existingAttributes = isRecord(existingMetadata?.channelAttributes)
    ? existingMetadata?.channelAttributes
    : undefined;

  const channelAttributes: Record<string, unknown> = {
    ...DEFAULT_ETSY_LISTING_ATTRIBUTES,
    shipping_profile_id: Number(shippingProfileId) || shippingProfileId,
    ...(returnPolicyId
      ? { return_policy_id: Number(returnPolicyId) || returnPolicyId }
      : {}),
    ...(existingAttributes ?? {}),
    ...overrideAttributes,
  };

  const input: ChannelProductInput = {
    title: product.title,
    description: product.description ?? "",
    price: product.price,
    currencyCode,
    sku: product.sku,
    quantity: product.inventory,
    tags: product.tags.slice(0, 13),
    images,
    channelAttributes,
  };

  const shouldActivate = product.status === "active";
  let externalProductId: string;
  let activateError: string | null = null;
  let imageNote = "";

  try {
    if (existingListing) {
      externalProductId = existingListing.externalProductId;
      await adapter.updateProduct(externalProductId, { ...input, images: undefined });
      if (adapter.syncProductImages) {
        const imageResult = await adapter.syncProductImages(externalProductId, images);
        if (imageResult.failed > 0) {
          throw new Error(
            `Failed to upload listing image: ${imageResult.errors[0] ?? "unknown error"}`
          );
        }
        if (imageResult.uploaded > 0) {
          imageNote = ` · ${imageResult.uploaded} image(s) synced`;
        }
      }
    } else {
      const created = await adapter.createProduct(input);
      externalProductId = created.externalProductId;
      imageNote = images.length > 0 ? ` · ${images.length} image(s) uploaded` : "";
    }

    if (shouldActivate) {
      try {
        await adapter.publishProduct(externalProductId);
      } catch (error) {
        activateError =
          error instanceof Error
            ? error.message.slice(0, 500)
            : "Could not activate listing on Etsy";
      }
    }

    const listingStatus =
      shouldActivate && !activateError
        ? "active"
        : shouldActivate
          ? "error"
          : "draft";

    if (existingListing) {
      await prisma.productChannelListing.update({
        where: { id: existingListing.id },
        data: {
          status: listingStatus,
          lastSyncedAt: new Date(),
          lastError: activateError,
          metadata: {
            ...(isRecord(existingListing.metadata) ? existingListing.metadata : {}),
            channelAttributes,
          } as Prisma.InputJsonValue,
        },
      });
    } else {
      await prisma.productChannelListing.create({
        data: {
          storeId,
          productId,
          channel: connection.channel,
          connectionId,
          externalProductId,
          status: listingStatus,
          lastSyncedAt: new Date(),
          lastError: activateError,
          metadata: { channelAttributes } as Prisma.InputJsonValue,
        },
      });
    }

    if (activateError) {
      throw new Error(
        `Listing saved on Etsy as draft (${externalProductId}) but could not go live: ${activateError}. Check shipping profile, images, and required Etsy fields.`
      );
    }

    return {
      message: existingListing
        ? `Updated Etsy listing ${externalProductId}${shouldActivate ? " (active)" : ""}${imageNote}`
        : `Created Etsy listing ${externalProductId}${shouldActivate ? " (active)" : ""}${imageNote}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Publish failed";
    if (existingListing) {
      await prisma.productChannelListing.update({
        where: { id: existingListing.id },
        data: { status: "error", lastError: message },
      });
    }
    throw error;
  }
}

async function syncInventoryOp(
  storeId: string,
  connectionId: string,
  payload: Record<string, unknown>
): Promise<OperationResult> {
  const { connection, tokens } = await loadConnection(connectionId);
  const adapter = buildAdapter(connection, tokens);

  const productId = typeof payload.productId === "string" ? payload.productId : null;
  const listings = await prisma.productChannelListing.findMany({
    where: {
      storeId,
      connectionId,
      channel: connection.channel,
      status: { in: ["active", "draft"] },
      ...(productId ? { productId } : {}),
    },
    include: { product: { select: { sku: true, inventory: true } } },
  });

  if (productId && listings.length === 0) {
    throw new Error("No Etsy listing is linked to this product yet — publish it first");
  }

  let updated = 0;
  let failed = 0;
  for (const listing of listings) {
    try {
      await adapter.updateInventory(listing.externalProductId, [
        { sku: listing.product.sku, quantity: listing.product.inventory },
      ]);
      await prisma.productChannelListing.update({
        where: { id: listing.id },
        data: { lastSyncedAt: new Date(), lastError: null },
      });
      updated += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message.slice(0, 500) : "Inventory sync failed";
      await prisma.productChannelListing.update({
        where: { id: listing.id },
        data: { lastError: message },
      });
    }
  }

  if (failed > 0 && updated === 0) {
    throw new Error(`Inventory sync failed for all ${failed} listing(s)`);
  }
  return { message: `Synced inventory for ${updated} listing(s)${failed ? `, ${failed} failed` : ""}` };
}

function mapChannelOrderStatus(detail: ChannelOrderDetail): OrderStatus {
  if (detail.isShipped) return "shipped";
  if (detail.isPaid) return "processing";
  return "pending";
}

function toShippingAddress(raw: Record<string, unknown>): ShippingAddress {
  const line1 = typeof raw.line1 === "string" ? raw.line1 : "";
  const line2 = typeof raw.line2 === "string" ? raw.line2 : "";
  return {
    street: [line1, line2].filter(Boolean).join(", "),
    city: typeof raw.city === "string" ? raw.city : "",
    state: typeof raw.state === "string" ? raw.state : undefined,
    postalCode: typeof raw.zip === "string" ? raw.zip : "",
    country: typeof raw.countryIso === "string" ? raw.countryIso : "",
  };
}

async function importSingleOrder(
  storeId: string,
  connection: ChannelConnection,
  detail: ChannelOrderDetail
): Promise<void> {
  const externalListingIds = detail.lineItems
    .map((li) => li.externalListingId)
    .filter((id): id is string => Boolean(id));

  const mappedListings = externalListingIds.length
    ? await prisma.productChannelListing.findMany({
        where: {
          storeId,
          connectionId: connection.id,
          channel: connection.channel,
          externalProductId: { in: externalListingIds },
        },
        select: { externalProductId: true, productId: true },
      })
    : [];
  const productByExternalId = new Map(mappedListings.map((m) => [m.externalProductId, m.productId]));

  const unmatchedLines = detail.lineItems.filter(
    (li) => !li.externalListingId || !productByExternalId.get(li.externalListingId)
  );

  const orderItemsData = detail.lineItems
    .map((li) => {
      const productId = li.externalListingId
        ? productByExternalId.get(li.externalListingId)
        : undefined;
      if (!productId) return null;
      return {
        productId,
        quantity: li.quantity,
        price: li.unitPrice,
        ...(li.variantLabel
          ? { variant: { label: li.variantLabel } as Prisma.InputJsonValue }
          : {}),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const unmatchedCount = unmatchedLines.length;
  const missingBuyerEmail = !detail.customerEmail?.trim();
  const orderStatus = mapChannelOrderStatus(detail);
  const paymentStatus: OrderPaymentStatus = detail.isPaid ? "paid" : "unpaid";
  const customerEmail = detail.customerEmail?.trim() ||
    `etsy-buyer+${detail.externalOrderId}@ettajer.local`;
  const shippingAddress = toShippingAddress(detail.shippingAddress);

  const order = await prisma.$transaction(async (tx) => {
    const customer = await upsertOrderCustomer(
      storeId,
      {
        email: customerEmail,
        name: detail.customerName,
        phone: detail.customerPhone ?? undefined,
        address: shippingAddress,
      },
      tx
    );

    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: orderStatus,
        total: detail.total,
        subtotal: detail.subtotal,
        shipping: detail.shipping,
        tax: detail.tax,
        discount: detail.discount,
        paymentMethod: "other",
        paymentStatus,
        customerEmail,
        customerName: detail.customerName,
        customerPhone: detail.customerPhone ?? undefined,
        customerId: customer?.id,
        shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
        storeId,
        merchantNote: [
          missingBuyerEmail ? "Etsy did not share a buyer email" : null,
          unmatchedCount > 0
            ? `${unmatchedCount} Etsy line item(s) not linked to an Ettajer product — import/publish the listing first`
            : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
        ...(orderItemsData.length ? { items: { create: orderItemsData } } : {}),
        statusHistory: {
          create: {
            status: orderStatus,
            note: [
              `Imported from ${connection.channel} (order ${detail.externalOrderId})`,
              unmatchedCount > 0
                ? `${unmatchedCount} item(s) not linked to an Ettajer product`
                : null,
              missingBuyerEmail ? "Buyer email missing from Etsy receipt" : null,
            ]
              .filter(Boolean)
              .join(" · "),
          },
        },
      },
    });

    await tx.channelOrder.create({
      data: {
        storeId,
        orderId: created.id,
        channel: connection.channel,
        connectionId: connection.id,
        externalOrderId: detail.externalOrderId,
        externalStatus: detail.externalStatus,
        metadata: {
          total: detail.total,
          currencyCode: detail.currencyCode,
          missingBuyerEmail,
          unmatchedLineItems: unmatchedLines.map((li) => ({
            externalLineItemId: li.externalLineItemId,
            externalListingId: li.externalListingId,
            title: li.title,
            sku: li.sku,
            quantity: li.quantity,
          })),
        } as Prisma.InputJsonValue,
      },
    });

    for (const line of unmatchedLines) {
      await tx.channelConflict.create({
        data: {
          storeId,
          connectionId: connection.id,
          channel: connection.channel,
          kind: "listing_state",
          externalId: line.externalListingId ?? detail.externalOrderId,
          ettajerValue: {
            reason: "unmatched_order_line",
            externalOrderId: detail.externalOrderId,
          } as Prisma.InputJsonValue,
          externalValue: {
            externalLineItemId: line.externalLineItemId,
            title: line.title,
            sku: line.sku,
            quantity: line.quantity,
          } as Prisma.InputJsonValue,
        },
      });
    }

    return created;
  });

  void createStoreNotification({
    storeId,
    kind: "order",
    title: `New ${connection.channel} order`,
    body: `${detail.customerName} · ${detail.total.toLocaleString()} ${detail.currencyCode}`,
    href: `/dashboard/orders/${order.id}`,
    entityType: "channel_order",
    entityId: order.id,
  });
}

function parseTrackingFromShipNote(note: string): {
  trackingNumber: string;
  carrierName?: string;
} {
  const trimmed = note.trim();
  const carrierPrefixed = trimmed.match(
    /^(dhl|ups|fedex|usps|chronopost|colissimo|aramex|gls|dpd|ams|Poste Maroc)\s*[:#-]?\s*(.+)$/i
  );
  if (carrierPrefixed) {
    return {
      carrierName: carrierPrefixed[1],
      trackingNumber: carrierPrefixed[2].trim().slice(0, 64),
    };
  }
  const labeled = trimmed.match(
    /(?:tracking(?:\s*(?:number|code|no\.?))?|suivi)\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{4,})/i
  );
  if (labeled) {
    return { trackingNumber: labeled[1].slice(0, 64) };
  }
  return { trackingNumber: trimmed.slice(0, 64) };
}

async function syncTrackingOp(
  storeId: string,
  connectionId: string,
  payload: Record<string, unknown>
): Promise<OperationResult> {
  const { connection, tokens } = await loadConnection(connectionId);
  const adapter = buildAdapter(connection, tokens);
  const orderIdFilter =
    typeof payload.orderId === "string" && payload.orderId.trim()
      ? payload.orderId.trim()
      : undefined;

  const channelOrders = await prisma.channelOrder.findMany({
    where: {
      storeId,
      connectionId,
      ...(orderIdFilter ? { orderId: orderIdFilter } : {}),
      order: { status: "shipped" },
    },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          merchantNote: true,
          statusHistory: {
            where: { status: "shipped" },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { note: true, createdAt: true },
          },
        },
      },
    },
    take: 50,
  });

  let pushed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const channelOrder of channelOrders) {
    const meta = isRecord(channelOrder.metadata) ? channelOrder.metadata : {};
    if (meta.trackingPushed === true) {
      skipped += 1;
      continue;
    }

    const shipNote =
      channelOrder.order.statusHistory.find((h) => h.note?.trim())?.note?.trim() ||
      channelOrder.order.merchantNote?.trim() ||
      "";
    if (!shipNote) {
      skipped += 1;
      continue;
    }

    const { trackingNumber, carrierName } = parseTrackingFromShipNote(shipNote);
    if (!trackingNumber) {
      skipped += 1;
      continue;
    }

    try {
      await adapter.updateFulfillment(channelOrder.externalOrderId, {
        trackingNumber,
        carrierName: carrierName ?? null,
      });
      await prisma.channelOrder.update({
        where: { id: channelOrder.id },
        data: {
          externalStatus: "shipped",
          metadata: {
            ...meta,
            trackingPushed: true,
            trackingNumber,
            ...(carrierName ? { carrierName } : {}),
            trackingPushedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
      pushed += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message.slice(0, 200) : "Tracking push failed";
      errors.push(`${channelOrder.externalOrderId}: ${message}`);
      await prisma.channelOrder.update({
        where: { id: channelOrder.id },
        data: {
          metadata: {
            ...meta,
            trackingPushError: message,
          } as Prisma.InputJsonValue,
        },
      });
    }
  }

  if (pushed === 0 && errors.length > 0) {
    throw new Error(`Failed to push tracking: ${errors[0]}`);
  }

  return {
    message: `Pushed tracking for ${pushed} order(s)${skipped ? `, skipped ${skipped}` : ""}${
      errors.length ? `, ${errors.length} error(s)` : ""
    }`,
  };
}

async function syncOrdersOp(
  storeId: string,
  connectionId: string,
  payload: Record<string, unknown>
): Promise<OperationResult> {
  const { connection, tokens } = await loadConnection(connectionId);
  const adapter = buildAdapter(connection, tokens);
  const since =
    typeof payload.since === "string"
      ? payload.since
      : connection.lastSyncAt?.toISOString();

  let cursor: string | null | undefined = null;
  let imported = 0;
  let skipped = 0;
  let pages = 0;

  do {
    const page = await adapter.listOrders({ cursor, limit: 25, since });
    for (const summary of page.items) {
      const existing = await prisma.channelOrder.findUnique({
        where: {
          storeId_channel_connectionId_externalOrderId: {
            storeId,
            channel: connection.channel,
            connectionId,
            externalOrderId: summary.externalOrderId,
          },
        },
        select: { id: true },
      });
      if (existing) {
        skipped += 1;
        continue;
      }
      const detail = await adapter.getOrder(summary.externalOrderId);
      await importSingleOrder(storeId, connection, detail);
      imported += 1;
    }
    cursor = page.nextCursor;
    pages += 1;
  } while (cursor && pages < MAX_LIST_PAGES);

  return { message: `Imported ${imported} order(s); skipped ${skipped} already linked` };
}

async function unpublishListingOp(
  storeId: string,
  connectionId: string,
  payload: Record<string, unknown>
): Promise<OperationResult> {
  const productId = requireString(payload, "productId");
  const listing = await prisma.productChannelListing.findFirst({
    where: { storeId, connectionId, productId },
  });
  if (!listing) throw new Error("No Etsy listing is linked to this product");

  const { connection, tokens } = await loadConnection(connectionId);
  const adapter = buildAdapter(connection, tokens);

  let message: string;
  try {
    // Etsy's Update Listing endpoint accepts state transitions; not every shop/listing
    // combination allows programmatic deactivation, so this is best-effort.
    await adapter.updateProduct(listing.externalProductId, {
      channelAttributes: { state: "inactive" },
    });
    message = "Deactivated on Etsy";
  } catch (error) {
    message = `Could not deactivate on Etsy (${
      error instanceof Error ? error.message : "unknown error"
    }) — marked inactive locally only`;
  }

  await prisma.productChannelListing.update({
    where: { id: listing.id },
    data: { status: "inactive", lastSyncedAt: new Date() },
  });

  return { message };
}

async function executeOperation(
  storeId: string,
  connectionId: string,
  operation: string,
  payload: Record<string, unknown>
): Promise<OperationResult & { details?: unknown }> {
  switch (operation) {
    case "import_listings":
    case "sync_listings":
      return importListingsOp(storeId, connectionId, payload);
    case "import_listing":
      return importSpecificListingsOp(storeId, connectionId, payload);
    case "publish_listing":
      return publishListingOp(storeId, connectionId, payload);
    case "sync_inventory":
      return syncInventoryOp(storeId, connectionId, payload);
    case "sync_orders":
      return syncOrdersOp(storeId, connectionId, payload);
    case "sync_tracking":
      return syncTrackingOp(storeId, connectionId, payload);
    case "unpublish_listing":
      return unpublishListingOp(storeId, connectionId, payload);
    default:
      throw new Error(`Unsupported channel sync operation: ${operation}`);
  }
}

/** Shared wrapper: runs one operation, always logs the outcome + touches the connection's health. */
async function runChannelOperation(
  storeId: string,
  connectionId: string,
  operation: string,
  payload: Record<string, unknown>
): Promise<OperationResult & { details?: unknown }> {
  const startedAt = Date.now();
  try {
    const result = await executeOperation(storeId, connectionId, operation, payload);
    await touchConnectionSync(connectionId, { success: true });
    await appendChannelSyncLog({
      storeId,
      connectionId,
      channel: "etsy",
      operation,
      status: "success",
      durationMs: Date.now() - startedAt,
      message: result.message ?? null,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Channel operation failed";
    const isAuthError = error instanceof EtsyApiError && error.status === 401;
    if (isAuthError) {
      await markConnectionReauthRequired(connectionId, message);
    } else {
      await touchConnectionSync(connectionId, { success: false, error: message });
    }
    await appendChannelSyncLog({
      storeId,
      connectionId,
      channel: "etsy",
      operation,
      status: "failed",
      durationMs: Date.now() - startedAt,
      errorCode: isAuthError ? "reauth_required" : undefined,
      message,
    });
    throw error;
  }
}

/** Entry point used by merchant-triggered API routes for an immediate (synchronous) result. */
export async function runChannelOperationForStore(
  storeId: string,
  connectionId: string,
  operation: string,
  payload: Record<string, unknown> = {}
): Promise<OperationResult> {
  const result = await runChannelOperation(storeId, connectionId, operation, payload);
  return { message: result.message };
}

/** Entry point used by the cron worker (app/api/cron/channel-sync) for queued jobs. */
export async function processChannelJob(job: ChannelSyncJob): Promise<ProcessJobResult> {
  if (!job.connectionId) {
    const message = `Operation "${job.operation}" requires a connectionId`;
    await markJobFail(job.id, message);
    await appendChannelSyncLog({
      storeId: job.storeId,
      channel: "etsy",
      operation: job.operation,
      status: "failed",
      message,
    });
    return { status: "failed", message };
  }

  try {
    const result = await runChannelOperation(
      job.storeId,
      job.connectionId,
      job.operation,
      (job.payload ?? {}) as Record<string, unknown>
    );
    await markJobSuccess(job.id);
    return { status: "success", message: result.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Channel sync failed";
    const outcome = await markJobRetryOrFail(job.id, job.attempts, job.maxAttempts, message);
    return { status: outcome, message };
  }
}
