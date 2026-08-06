export const SEGMENT_FILTER_TYPES = [
  "customers",
  "subscribers",
  "never_purchased",
  "returning_customers",
  "vip_customers",
  "spent_gt",
  "orders_gt",
  "country",
  "language",
  "tag",
  "last_purchase",
  "signup_date",
  /** Atlas predictive */
  "predictive_label",
  "churn_risk_gte",
  "purchase_propensity_gte",
  "ltv_gte",
] as const;

export type SegmentFilterType = (typeof SEGMENT_FILTER_TYPES)[number];

export type SegmentMatchMode = "all" | "any";

export type SegmentFilter =
  | { type: "customers" }
  | { type: "subscribers" }
  | { type: "never_purchased" }
  | { type: "returning_customers" }
  | { type: "vip_customers"; minSpent?: number }
  | { type: "spent_gt"; value: number }
  | { type: "orders_gt"; value: number }
  | { type: "country"; values: string[] }
  | { type: "language"; values: string[] }
  | { type: "tag"; values: string[] }
  | {
      type: "last_purchase";
      after?: string | null;
      before?: string | null;
      withinDays?: number | null;
    }
  | {
      type: "signup_date";
      after?: string | null;
      before?: string | null;
      withinDays?: number | null;
    }
  | { type: "predictive_label"; label: string }
  | { type: "churn_risk_gte"; value: number }
  | { type: "purchase_propensity_gte"; value: number }
  | { type: "ltv_gte"; value: number };

export interface AudienceSegmentDefinition {
  match: SegmentMatchMode;
  filters: SegmentFilter[];
}

export interface AudienceSegmentRow {
  id: string;
  name: string;
  description: string | null;
  filters: AudienceSegmentDefinition;
  cachedCount: number;
  cachedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_VIP_MIN_SPENT = 2000;

export const SEGMENT_FILTER_DEFS: {
  type: SegmentFilterType;
  label: string;
  description: string;
  needsValue?: "number" | "strings" | "dates";
}[] = [
  {
    type: "subscribers",
    label: "Subscribers",
    description: "Everyone currently active on your email list",
  },
  {
    type: "customers",
    label: "Customers",
    description: "Active subscribers who have placed at least one order",
  },
  {
    type: "never_purchased",
    label: "Never purchased",
    description: "Subscribers with no orders yet",
  },
  {
    type: "returning_customers",
    label: "Returning customers",
    description: "Subscribers with 2 or more orders",
  },
  {
    type: "vip_customers",
    label: "VIP customers",
    description: "High spenders (default threshold configurable)",
    needsValue: "number",
  },
  {
    type: "spent_gt",
    label: "Spent > X",
    description: "Lifetime spend greater than a amount",
    needsValue: "number",
  },
  {
    type: "orders_gt",
    label: "Orders > X",
    description: "Order count greater than a number",
    needsValue: "number",
  },
  {
    type: "country",
    label: "Country",
    description: "Latest shipping country matches",
    needsValue: "strings",
  },
  {
    type: "language",
    label: "Language",
    description: "Preferred language on the contact",
    needsValue: "strings",
  },
  {
    type: "tag",
    label: "Tag",
    description: "Has one of the selected tags",
    needsValue: "strings",
  },
  {
    type: "last_purchase",
    label: "Last purchase",
    description: "Last order date window",
    needsValue: "dates",
  },
  {
    type: "signup_date",
    label: "Signup date",
    description: "Newsletter signup date window",
    needsValue: "dates",
  },
  {
    type: "predictive_label",
    label: "Predictive segment",
    description: "Atlas label (likely_to_buy, vip, churn…)",
    needsValue: "strings",
  },
  {
    type: "churn_risk_gte",
    label: "Churn risk ≥",
    description: "Customer intelligence churn score",
    needsValue: "number",
  },
  {
    type: "purchase_propensity_gte",
    label: "Purchase propensity ≥",
    description: "Likelihood to buy soon (0–100)",
    needsValue: "number",
  },
  {
    type: "ltv_gte",
    label: "Lifetime value ≥",
    description: "Observed LTV threshold",
    needsValue: "number",
  },
];

export function emptySegmentDefinition(): AudienceSegmentDefinition {
  return { match: "all", filters: [{ type: "subscribers" }] };
}

export function isSegmentFilterType(value: string): value is SegmentFilterType {
  return (SEGMENT_FILTER_TYPES as readonly string[]).includes(value);
}
