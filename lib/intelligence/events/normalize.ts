/**
 * Normalized platform intelligence events from overview live feed + state.
 * Does not invent events — only maps known platform facts.
 */

export type IntelligenceEventType =
  | "MerchantSignedUp"
  | "StoreCreated"
  | "OrderCreated"
  | "SupportOpened"
  | "DomainFailed"
  | "MerchantInactive"
  | "CODPending"
  | "Unknown";

export type IntelligenceEvent = {
  type: IntelligenceEventType;
  timestamp: Date;
  merchantId?: string;
  storeId?: string;
  value?: number;
  metadata: Record<string, string | number | boolean | null>;
};

export type LiveFeedItem = {
  id: string;
  category: string;
  title: string;
  detail: string;
  href: string;
  createdAt: Date | string;
};

export function normalizeLiveFeedEvents(
  feed: LiveFeedItem[]
): IntelligenceEvent[] {
  return feed.map((item) => {
    const timestamp =
      item.createdAt instanceof Date
        ? item.createdAt
        : new Date(item.createdAt);
    let type: IntelligenceEventType = "Unknown";
    if (item.category === "commerce" || item.id.startsWith("order-")) {
      type = "OrderCreated";
    } else if (item.category === "merchants" || item.id.startsWith("user-")) {
      type = "MerchantSignedUp";
    } else if (item.category === "stores" || item.id.startsWith("store-")) {
      type = "StoreCreated";
    } else if (item.category === "support" || item.id.startsWith("support-")) {
      type = "SupportOpened";
    }

    return {
      type,
      timestamp: Number.isNaN(timestamp.getTime()) ? new Date(0) : timestamp,
      merchantId: undefined,
      storeId: item.id.startsWith("store-")
        ? item.id.replace("store-", "")
        : undefined,
      value: undefined,
      metadata: {
        title: item.title,
        detail: item.detail,
        href: item.href,
        category: item.category,
        sourceId: item.id,
      },
    };
  });
}

export function synthesizeStateEvents(input: {
  pendingRealOrders: number;
  domainFailing: number;
  openSupport: number;
  now: Date;
}): IntelligenceEvent[] {
  const events: IntelligenceEvent[] = [];
  if (input.pendingRealOrders > 0) {
    events.push({
      type: "CODPending",
      timestamp: input.now,
      value: input.pendingRealOrders,
      metadata: { source: "platform.overview" },
    });
  }
  if (input.domainFailing > 0) {
    events.push({
      type: "DomainFailed",
      timestamp: input.now,
      value: input.domainFailing,
      metadata: { source: "domains.live" },
    });
  }
  if (input.openSupport > 0) {
    events.push({
      type: "SupportOpened",
      timestamp: input.now,
      value: input.openSupport,
      metadata: { source: "support.inbox", aggregate: true },
    });
  }
  return events;
}
