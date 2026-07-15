import type { PublicMarketingIntegrations, PublicPlatformPixel } from "@/lib/marketing-integrations";
import { logMarketingEvent } from "@/lib/marketing-event-log";

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
}

export interface CheckoutEventData {
  value: number;
  currency: string;
  itemCount: number;
}

export interface PurchaseEventData {
  value: number;
  currency: string;
  orderNumber: string;
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

export function trackViewContent(
  marketing: PublicMarketingIntegrations,
  data: ProductEventData
) {
  const meta = marketing.meta;
  if (meta?.trackViewContent && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [data.productId],
      content_name: data.title,
      value: data.price,
      currency: data.currency,
    });
    logIfTest("meta", "ViewContent", meta, data as unknown as Record<string, unknown>);
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
      product_id: data.productId,
      product_name: data.title,
      value: data.price,
      currency: data.currency,
    });
    logIfTest("pinterest", "ViewContent", pinterest, data as unknown as Record<string, unknown>);
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
) {
  const meta = marketing.meta;
  if (meta?.trackAddToCart && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [data.productId],
      content_name: data.title,
      value: data.price * data.quantity,
      currency: data.currency,
    });
    logIfTest("meta", "AddToCart", meta, data as unknown as Record<string, unknown>);
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
      product_id: data.productId,
      product_name: data.title,
      value: data.price * data.quantity,
      currency: data.currency,
      order_quantity: data.quantity,
    });
    logIfTest("pinterest", "AddToCart", pinterest, data as unknown as Record<string, unknown>);
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
}

export function trackInitiateCheckout(
  marketing: PublicMarketingIntegrations,
  data: CheckoutEventData
) {
  const meta = marketing.meta;
  if (meta?.trackInitiateCheckout && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: data.value,
      currency: data.currency,
      num_items: data.itemCount,
    });
    logIfTest("meta", "InitiateCheckout", meta, data as unknown as Record<string, unknown>);
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
      value: data.value,
      currency: data.currency,
      order_quantity: data.itemCount,
    });
    logIfTest("pinterest", "InitiateCheckout", pinterest, data as unknown as Record<string, unknown>);
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
}

export function trackPurchase(
  marketing: PublicMarketingIntegrations,
  data: PurchaseEventData
) {
  const meta = marketing.meta;
  if (meta?.trackPurchases && window.fbq) {
    window.fbq("track", "Purchase", {
      value: data.value,
      currency: data.currency,
      content_ids: [data.orderNumber],
    });
    logIfTest("meta", "Purchase", meta, data as unknown as Record<string, unknown>);
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
      value: data.value,
      order_quantity: 1,
      currency: data.currency,
      order_id: data.orderNumber,
    });
    logIfTest("pinterest", "checkout", pinterest, data as unknown as Record<string, unknown>);
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
}

function pushGtmEvent(event: string, payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ecommerce: payload });
}
