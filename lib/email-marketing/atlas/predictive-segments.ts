import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  PREDICTIVE_LABELS,
  type PredictiveLabel,
} from "@/lib/email-marketing/atlas/types";
import { emptySegmentDefinition } from "@/lib/email-marketing/segment-types";

const LABEL_META: Record<
  PredictiveLabel,
  { name: string; description: string }
> = {
  likely_to_buy: {
    name: "Likely to buy",
    description: "High purchase propensity from Atlas scoring",
  },
  vip: {
    name: "VIP",
    description: "High LTV or frequent purchasers",
  },
  high_value: {
    name: "High value",
    description: "Customers with strong lifetime value",
  },
  frequent_buyers: {
    name: "Frequent buyers",
    description: "Three or more completed orders",
  },
  inactive: {
    name: "Inactive customers",
    description: "No purchase in 90+ days",
  },
  likely_to_churn: {
    name: "Likely to churn",
    description: "Elevated churn risk score",
  },
  holiday_buyers: {
    name: "Holiday buyers",
    description: "Seasonal / holiday purchase affinity",
  },
  coupon_lovers: {
    name: "Coupon lovers",
    description: "Repeatedly redeem discounts",
  },
  window_shoppers: {
    name: "Window shoppers",
    description: "Engaged but have not purchased yet",
  },
  new_customers: {
    name: "New customers",
    description: "Joined or first purchased recently",
  },
  returning_customers: {
    name: "Returning customers",
    description: "Two or more orders",
  },
};

/**
 * Ensure Atlas predictive audience segments exist for the store (idempotent).
 */
export async function ensurePredictiveSegments(
  storeId: string
): Promise<{ created: number; existing: number }> {
  let created = 0;
  let existing = 0;

  for (const label of PREDICTIVE_LABELS) {
    const meta = LABEL_META[label];
    const name = `Atlas · ${meta.name}`;
    const found = await prisma.audienceSegment.findFirst({
      where: { storeId, name },
      select: { id: true },
    });
    if (found) {
      existing += 1;
      continue;
    }
    const definition = {
      ...emptySegmentDefinition(),
      match: "all" as const,
      filters: [{ type: "predictive_label" as const, label }],
    };
    await prisma.audienceSegment.create({
      data: {
        storeId,
        name,
        description: meta.description,
        filters: definition as unknown as Prisma.InputJsonValue,
      },
    });
    created += 1;
  }

  return { created, existing };
}
