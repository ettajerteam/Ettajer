/**
 * Project Atlas — shared types for Email Marketing 3.0 (Revenue Intelligence).
 */

export const JOURNEY_KINDS = [
  "welcome",
  "cart_recovery",
  "win_back",
  "vip",
  "post_purchase",
  "cross_sell",
  "upsell",
  "reorder",
  "custom",
] as const;
export type JourneyKind = (typeof JOURNEY_KINDS)[number];

export const JOURNEY_STATUSES = [
  "draft",
  "active",
  "paused",
  "archived",
] as const;
export type JourneyStatus = (typeof JOURNEY_STATUSES)[number];

/** Channel-agnostic delivery — email implemented; others reserved. */
export const MESSAGE_CHANNELS = [
  "email",
  "sms",
  "push",
  "whatsapp",
  "messenger",
] as const;
export type MessageChannel = (typeof MESSAGE_CHANNELS)[number];

export const JOURNEY_NODE_TYPES = [
  "trigger",
  "email",
  "sms",
  "push",
  "whatsapp",
  "messenger",
  "delay",
  "wait_until",
  "condition",
  "split",
  "goal",
  "exit",
  "tag_customer",
  "remove_tag",
  "add_segment",
  "remove_segment",
] as const;
export type JourneyNodeType = (typeof JOURNEY_NODE_TYPES)[number];

export const JOURNEY_TRIGGERS = [
  "newsletter_signup",
  "customer_created",
  "first_purchase",
  "any_purchase",
  "order_paid",
  "order_fulfilled",
  "order_cancelled",
  "cart_abandoned",
  "product_viewed",
  "product_back_in_stock",
  "birthday",
  "manual_entry",
] as const;
export type JourneyTrigger = (typeof JOURNEY_TRIGGERS)[number];

export interface JourneyNodePosition {
  x: number;
  y: number;
}

export interface JourneyNode {
  id: string;
  type: JourneyNodeType;
  label: string;
  position: JourneyNodePosition;
  /** Channel for message nodes (default email) */
  channel?: MessageChannel;
  config: Record<string, unknown>;
}

export interface JourneyEdge {
  id: string;
  source: string;
  target: string;
  /** For condition/split: "yes" | "no" | variant key */
  label?: string | null;
}

export interface JourneySettings {
  goalType?: "purchase" | "click" | "open" | "custom";
  goalValue?: number;
  exitOnPurchase?: boolean;
  quietHours?: { start: number; end: number };
}

export const PREDICTIVE_LABELS = [
  "likely_to_buy",
  "vip",
  "high_value",
  "frequent_buyers",
  "inactive",
  "likely_to_churn",
  "holiday_buyers",
  "coupon_lovers",
  "window_shoppers",
  "new_customers",
  "returning_customers",
] as const;
export type PredictiveLabel = (typeof PREDICTIVE_LABELS)[number];

export const RECO_STRATEGIES = [
  "purchase_history",
  "browsing_history",
  "category_affinity",
  "collection_affinity",
  "best_sellers",
  "recently_viewed",
  "frequently_bought_together",
  "related_products",
  "new_arrivals",
] as const;
export type RecoStrategy = (typeof RECO_STRATEGIES)[number];

export const INCENTIVE_TYPES = [
  "percentage",
  "fixed",
  "free_shipping",
  "gift",
  "none",
] as const;
export type IncentiveType = (typeof INCENTIVE_TYPES)[number];

export const ATLAS_LOCALES = ["en", "fr", "ar", "es"] as const;
export type AtlasLocale = (typeof ATLAS_LOCALES)[number];

export function isJourneyTrigger(value: string): value is JourneyTrigger {
  return (JOURNEY_TRIGGERS as readonly string[]).includes(value);
}

export function isJourneyNodeType(value: string): value is JourneyNodeType {
  return (JOURNEY_NODE_TYPES as readonly string[]).includes(value);
}

export function isPredictiveLabel(value: string): value is PredictiveLabel {
  return (PREDICTIVE_LABELS as readonly string[]).includes(value);
}

export function isRecoStrategy(value: string): value is RecoStrategy {
  return (RECO_STRATEGIES as readonly string[]).includes(value);
}
