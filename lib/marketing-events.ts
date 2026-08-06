import type { PublicMarketingIntegrations, PublicPlatformPixel } from "@/lib/marketing-integrations";
import { logMarketingEvent } from "@/lib/marketing-event-log";
import { createMarketingEventId, purchaseEventId } from "@/lib/marketing-event-id";
import { trackMetaEvent, trackMetaPageView } from "@/lib/meta-pixel";
import {
  matchingFromCheckoutContact,
  setMetaAdvancedMatching,
} from "@/lib/meta-advanced-matching";
import { sendStorefrontCapiEvent } from "@/lib/marketing-capi-client";

export type MarketingEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export interface ProductEventData {
  productId: string;
  title: string;
  price: number;
  currency: string;
  quantity?: number;
  eventId?: string;
  storeSlug?: string;
}

export interface CheckoutEventData {
  value: number;
  currency: string;
  itemCount: number;
  eventId?: string;
  storeSlug?: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  city?: string | null;
  country?: string | null;
  zip?: string | null;
  contentIds?: string[];
}

export interface PurchaseEventData {
  value: number;
  currency: string;
  orderNumber: string;
  contentIds?: string[];
  numItems?: number;
  eventId?: string;
  storeSlug?: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  city?: string | null;
  country?: string | null;
  zip?: string | null;
}

function splitCustomerName(name?: string | null): {
  firstName: string | null;
  lastName: string | null;
} {
  if (!name?.trim()) return { firstName: null, lastName: null };
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

async function applyMetaAdvancedMatching(
  marketing: PublicMarketingIntegrations,
  data: {
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    city?: string | null;
    country?: string | null;
    zip?: string | null;
  }
) {
  if (!marketing.meta?.pixelId) return;
  if (!data.email && !data.phone) return;
  await setMetaAdvancedMatching(
    marketing.meta.pixelId,
    matchingFromCheckoutContact(data)
  );
}

function shouldLog(config?: PublicPlatformPixel): boolean {
  return Boolean(config?.testMode);
}

function logIfTest(
  platform: string,
  event: string,
  config: PublicPlatformPixel | undefined,
  payload: Record<string, unknown>
) {
  if (shouldLog(config)) {
    logMarketingEvent(platform, event, payload);
  }
}

export function trackPageView(
  marketing: PublicMarketingIntegrations,
  options?: { storeSlug?: string; eventId?: string }
) {
  const eventId = options?.eventId ?? createMarketingEventId("page");
  const meta = marketing.meta;
  if (meta?.trackPageViews) {
    // Same eventID on Pixel + CAPI so Meta dedupes the pair
    trackMetaPageView({ eventID: eventId });
    logIfTest("meta", "PageView", meta, { eventId });
    if (options?.storeSlug) {
      sendStorefrontCapiEvent(marketing, {
        storeSlug: options.storeSlug,
        eventName: "PageView",
        eventId,
      });
    }
  }

  const tiktok = marketing.tiktok;
  if (tiktok?.trackPageViews && window.ttq) {
    window.ttq.page();
    logIfTest("tiktok", "PageView", tiktok, {});
  }

  const pinterest = marketing.pinterest;
  if (pinterest?.trackPageViews && window.pintrk) {
    window.pintrk("page", { event_id: eventId });
    logIfTest("pinterest", "PageView", pinterest, { eventId });
  }

  const snapchat = marketing.snapchat;
  if (snapchat?.trackPageViews && window.snaptr) {
    window.snaptr("track", "PAGE_VIEW");
    logIfTest("snapchat", "PAGE_VIEW", snapchat, {});
  }

  if (marketing.gtm?.trackPageViews) {
    pushGtmEvent("page_view", {});
    logIfTest("gtm", "page_view", marketing.gtm, {});
  }

  // Storefront CAPI for Meta and/or Pinterest when either tracks PageView
  if (
    options?.storeSlug &&
    (meta?.trackPageViews || pinterest?.trackPageViews) &&
    (marketing.meta?.capiEnabled || marketing.pinterest?.capiEnabled)
  ) {
    // Avoid double-send when Meta block already called sendStorefrontCapiEvent
    if (!meta?.trackPageViews) {
      sendStorefrontCapiEvent(marketing, {
        storeSlug: options.storeSlug,
        eventName: "PageView",
        eventId,
      });
    }
  }
}

export function trackViewContent(
  marketing: PublicMarketingIntegrations,
  data: ProductEventData
) {
  const eventId = data.eventId ?? createMarketingEventId("view");
  const meta = marketing.meta;
  if (meta?.trackViewContent) {
    trackMetaEvent(
      "ViewContent",
      {
        content_ids: [data.productId],
        content_name: data.title,
        content_type: "product",
        value: data.price,
        currency: data.currency,
        contents: [{ id: data.productId, quantity: 1, item_price: data.price }],
      },
      { eventID: eventId }
    );
    logIfTest("meta", "ViewContent", meta, { ...data, eventId } as unknown as Record<string, unknown>);
    if (data.storeSlug) {
      sendStorefrontCapiEvent(marketing, {
        storeSlug: data.storeSlug,
        eventName: "ViewContent",
        eventId,
        value: data.price,
        currency: data.currency,
        contentName: data.title,
        contentIds: [data.productId],
        contents: [{ id: data.productId, quantity: 1, itemPrice: data.price }],
      });
    }
  }

  const tiktok = marketing.tiktok;
  if (tiktok?.trackViewContent && window.ttq) {
    window.ttq.track("ViewContent", {
      content_id: data.productId,
      content_name: data.title,
      value: data.price,
      currency: data.currency,
    });
    logIfTest("tiktok", "ViewContent", tiktok, data as unknown as Record<string, unknown>);
  }

  const pinterest = marketing.pinterest;
  if (pinterest?.trackViewContent && window.pintrk) {
    window.pintrk("track", "pagevisit", {
      event_id: eventId,
      product_id: data.productId,
      product_name: data.title,
      value: data.price,
      currency: data.currency,
    });
    logIfTest("pinterest", "ViewContent", pinterest, {
      ...data,
      eventId,
    } as unknown as Record<string, unknown>);
    if (data.storeSlug && !meta?.trackViewContent) {
      sendStorefrontCapiEvent(marketing, {
        storeSlug: data.storeSlug,
        eventName: "ViewContent",
        eventId,
        value: data.price,
        currency: data.currency,
        contentName: data.title,
        contentIds: [data.productId],
        contents: [{ id: data.productId, quantity: 1, itemPrice: data.price }],
      });
    }
  }

  const google = marketing.google;
  if (google?.trackViewContent && window.gtag) {
    window.gtag("event", "view_item", {
      currency: data.currency,
      value: data.price,
      items: [{ item_id: data.productId, item_name: data.title, price: data.price }],
    });
    logIfTest("google", "view_item", google, data as unknown as Record<string, unknown>);
  }

  const snapchat = marketing.snapchat;
  if (snapchat?.trackViewContent && window.snaptr) {
    window.snaptr("track", "VIEW_CONTENT", {
      item_ids: [data.productId],
      description: data.title,
      price: data.price,
      currency: data.currency,
    });
    logIfTest("snapchat", "VIEW_CONTENT", snapchat, data as unknown as Record<string, unknown>);
  }

  if (marketing.gtm?.trackViewContent) {
    pushGtmEvent("view_item", {
      currency: data.currency,
      value: data.price,
      items: [{ item_id: data.productId, item_name: data.title, price: data.price }],
    });
    logIfTest("gtm", "view_item", marketing.gtm, data as unknown as Record<string, unknown>);
  }
}

export function trackAddToCart(
  marketing: PublicMarketingIntegrations,
  data: ProductEventData & { quantity: number }
): string {
  const eventId = data.eventId ?? createMarketingEventId("cart");
  const meta = marketing.meta;
  if (meta?.trackAddToCart) {
    trackMetaEvent(
      "AddToCart",
      {
        content_ids: [data.productId],
        content_name: data.title,
        content_type: "product",
        value: data.price * data.quantity,
        currency: data.currency,
        contents: [
          {
            id: data.productId,
            quantity: data.quantity,
            item_price: data.price,
          },
        ],
      },
      { eventID: eventId }
    );
    logIfTest("meta", "AddToCart", meta, { ...data, eventId } as unknown as Record<string, unknown>);
    // CAPI for AddToCart is sent from /api/cart with this same eventId — skip the
    // browser proxy here to avoid a redundant (already-deduped) server hop.
  }

  const tiktok = marketing.tiktok;
  if (tiktok?.trackAddToCart && window.ttq) {
    window.ttq.track("AddToCart", {
      content_id: data.productId,
      content_name: data.title,
      value: data.price * data.quantity,
      currency: data.currency,
      quantity: data.quantity,
    });
    logIfTest("tiktok", "AddToCart", tiktok, data as unknown as Record<string, unknown>);
  }

  const pinterest = marketing.pinterest;
  if (pinterest?.trackAddToCart && window.pintrk) {
    window.pintrk("track", "addtocart", {
      event_id: eventId,
      product_id: data.productId,
      product_name: data.title,
      value: data.price * data.quantity,
      currency: data.currency,
      order_quantity: data.quantity,
    });
    logIfTest("pinterest", "AddToCart", pinterest, {
      ...data,
      eventId,
    } as unknown as Record<string, unknown>);
  }

  const google = marketing.google;
  if (google?.trackAddToCart && window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: data.currency,
      value: data.price * data.quantity,
      items: [
        {
          item_id: data.productId,
          item_name: data.title,
          price: data.price,
          quantity: data.quantity,
        },
      ],
    });
    logIfTest("google", "add_to_cart", google, data as unknown as Record<string, unknown>);
  }

  const snapchat = marketing.snapchat;
  if (snapchat?.trackAddToCart && window.snaptr) {
    window.snaptr("track", "ADD_CART", {
      item_ids: [data.productId],
      description: data.title,
      price: data.price * data.quantity,
      currency: data.currency,
      number_items: data.quantity,
    });
    logIfTest("snapchat", "ADD_CART", snapchat, data as unknown as Record<string, unknown>);
  }

  if (marketing.gtm?.trackAddToCart) {
    pushGtmEvent("add_to_cart", {
      currency: data.currency,
      value: data.price * data.quantity,
      items: [
        {
          item_id: data.productId,
          item_name: data.title,
          price: data.price,
          quantity: data.quantity,
        },
      ],
    });
    logIfTest("gtm", "add_to_cart", marketing.gtm, data as unknown as Record<string, unknown>);
  }

  return eventId;
}

export async function trackInitiateCheckout(
  marketing: PublicMarketingIntegrations,
  data: CheckoutEventData
): Promise<string> {
  const eventId = data.eventId ?? createMarketingEventId("checkout");
  await applyMetaAdvancedMatching(marketing, data);
  const meta = marketing.meta;
  if (meta?.trackInitiateCheckout) {
    trackMetaEvent(
      "InitiateCheckout",
      {
        value: data.value,
        currency: data.currency,
        num_items: data.itemCount,
        content_type: "product",
        ...(data.contentIds?.length ? { content_ids: data.contentIds } : {}),
      },
      { eventID: eventId }
    );
    logIfTest("meta", "InitiateCheckout", meta, {
      ...data,
      eventId,
    } as unknown as Record<string, unknown>);
    if (data.storeSlug) {
      const { firstName, lastName } = splitCustomerName(data.name);
      sendStorefrontCapiEvent(marketing, {
        storeSlug: data.storeSlug,
        eventName: "InitiateCheckout",
        eventId,
        value: data.value,
        currency: data.currency,
        numItems: data.itemCount,
        contentIds: data.contentIds,
        email: data.email,
        phone: data.phone,
        firstName,
        lastName,
        city: data.city,
        country: data.country,
        zip: data.zip,
      });
    }
  }

  const tiktok = marketing.tiktok;
  if (tiktok?.trackInitiateCheckout && window.ttq) {
    window.ttq.track("InitiateCheckout", {
      value: data.value,
      currency: data.currency,
    });
    logIfTest("tiktok", "InitiateCheckout", tiktok, data as unknown as Record<string, unknown>);
  }

  const pinterest = marketing.pinterest;
  if (pinterest?.trackInitiateCheckout && window.pintrk) {
    window.pintrk("track", "initiatecheckout", {
      event_id: eventId,
      value: data.value,
      currency: data.currency,
      order_quantity: data.itemCount,
    });
    logIfTest("pinterest", "InitiateCheckout", pinterest, {
      ...data,
      eventId,
    } as unknown as Record<string, unknown>);
    if (data.storeSlug && !meta?.trackInitiateCheckout) {
      const { firstName, lastName } = splitCustomerName(data.name);
      sendStorefrontCapiEvent(marketing, {
        storeSlug: data.storeSlug,
        eventName: "InitiateCheckout",
        eventId,
        value: data.value,
        currency: data.currency,
        numItems: data.itemCount,
        contentIds: data.contentIds,
        email: data.email,
        phone: data.phone,
        firstName,
        lastName,
        city: data.city,
        country: data.country,
        zip: data.zip,
      });
    }
  }

  const google = marketing.google;
  if (google?.trackInitiateCheckout && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: data.currency,
      value: data.value,
    });
    logIfTest("google", "begin_checkout", google, data as unknown as Record<string, unknown>);
  }

  const snapchat = marketing.snapchat;
  if (snapchat?.trackInitiateCheckout && window.snaptr) {
    window.snaptr("track", "START_CHECKOUT", {
      price: data.value,
      currency: data.currency,
      number_items: data.itemCount,
    });
    logIfTest("snapchat", "START_CHECKOUT", snapchat, data as unknown as Record<string, unknown>);
  }

  if (marketing.gtm?.trackInitiateCheckout) {
    pushGtmEvent("begin_checkout", {
      currency: data.currency,
      value: data.value,
    });
    logIfTest("gtm", "begin_checkout", marketing.gtm, data as unknown as Record<string, unknown>);
  }

  return eventId;
}

export async function trackPurchase(
  marketing: PublicMarketingIntegrations,
  data: PurchaseEventData
): Promise<string> {
  // Stable id matches checkout-route CAPI (purchase_{orderNumber})
  const eventId = data.eventId ?? purchaseEventId(data.orderNumber);
  await applyMetaAdvancedMatching(marketing, data);
  const meta = marketing.meta;
  if (meta?.trackPurchases) {
    const ids = data.contentIds?.length ? data.contentIds : [data.orderNumber];
    trackMetaEvent(
      "Purchase",
      {
        value: data.value,
        currency: data.currency,
        content_type: "product",
        content_ids: ids,
        num_items: data.numItems ?? 1,
        order_id: data.orderNumber,
        contents: ids.map((id) => ({ id, quantity: 1 })),
      },
      { eventID: eventId }
    );
    logIfTest("meta", "Purchase", meta, { ...data, eventId } as unknown as Record<string, unknown>);
    // CAPI Purchase is sent from /api/checkout with purchaseEventId(orderNumber).
    // Do not also proxy CAPI from the thank-you page — same event_id would only
    // add noise; Pixel + server CAPI is the intended dual delivery pair.
  }

  const tiktok = marketing.tiktok;
  if (tiktok?.trackPurchases && window.ttq) {
    window.ttq.track("CompletePayment", {
      value: data.value,
      currency: data.currency,
      content_id: data.orderNumber,
    });
    logIfTest("tiktok", "CompletePayment", tiktok, data as unknown as Record<string, unknown>);
  }

  const pinterest = marketing.pinterest;
  if (pinterest?.trackPurchases && window.pintrk) {
    window.pintrk("track", "checkout", {
      event_id: eventId,
      value: data.value,
      order_quantity: data.numItems ?? 1,
      currency: data.currency,
      order_id: data.orderNumber,
      ...(data.contentIds?.length
        ? { product_ids: data.contentIds, line_items: data.contentIds.map((id) => ({ product_id: id })) }
        : {}),
    });
    logIfTest("pinterest", "checkout", pinterest, {
      ...data,
      eventId,
    } as unknown as Record<string, unknown>);
    // CAPI Purchase is sent from /api/checkout with purchaseEventId(orderNumber).
  }

  const google = marketing.google;
  if (google?.trackPurchases && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: data.orderNumber,
      value: data.value,
      currency: data.currency,
    });
    logIfTest("google", "purchase", google, data as unknown as Record<string, unknown>);
  }

  const snapchat = marketing.snapchat;
  if (snapchat?.trackPurchases && window.snaptr) {
    window.snaptr("track", "PURCHASE", {
      price: data.value,
      currency: data.currency,
      transaction_id: data.orderNumber,
    });
    logIfTest("snapchat", "PURCHASE", snapchat, data as unknown as Record<string, unknown>);
  }

  if (marketing.gtm?.trackPurchases) {
    pushGtmEvent("purchase", {
      transaction_id: data.orderNumber,
      value: data.value,
      currency: data.currency,
    });
    logIfTest("gtm", "purchase", marketing.gtm, data as unknown as Record<string, unknown>);
  }

  return eventId;
}

function pushGtmEvent(event: string, payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ecommerce: payload });
}
