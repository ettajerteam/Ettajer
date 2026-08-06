import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Package,
  ShoppingBag,
  UserPlus,
} from "lucide-react";

export const EMAIL_AUTOMATION_TRIGGERS = [
  "newsletter_subscribe",
  "order_placed",
  "abandoned_cart",
  "customer_created",
] as const;

export type EmailAutomationTrigger =
  (typeof EMAIL_AUTOMATION_TRIGGERS)[number];

/** Primary entity that anchors at-most-once execution for a trigger. */
export type AutomationEntityKind =
  | "subscriber"
  | "order"
  | "cart"
  | "customer";

export interface EmailAutomationTriggerDef {
  id: EmailAutomationTrigger;
  name: string;
  description: string;
  /** Suggested gallery template when seeding */
  defaultGalleryId: string;
  /**
   * Which context field must be present for idempotent execution.
   * Add a new trigger = set this field; no runtime switch needed.
   */
  idempotencyEntity: AutomationEntityKind;
  icon: LucideIcon;
}

export const EMAIL_AUTOMATION_TRIGGER_DEFS: EmailAutomationTriggerDef[] = [
  {
    id: "newsletter_subscribe",
    name: "Newsletter signup",
    description: "When someone joins or reactivates on your list.",
    defaultGalleryId: "welcome",
    idempotencyEntity: "subscriber",
    icon: Heart,
  },
  {
    id: "order_placed",
    name: "Purchase",
    description:
      "After a customer places an order (separate from the order receipt).",
    defaultGalleryId: "thank_you",
    idempotencyEntity: "order",
    icon: ShoppingBag,
  },
  {
    id: "abandoned_cart",
    name: "Abandoned cart",
    description: "When a shopper leaves checkout with an email on the cart.",
    defaultGalleryId: "promo",
    idempotencyEntity: "cart",
    icon: Package,
  },
  {
    id: "customer_created",
    name: "New customer",
    description: "The first time a customer is created for your store.",
    defaultGalleryId: "welcome",
    idempotencyEntity: "customer",
    icon: UserPlus,
  },
];

export function isEmailAutomationTrigger(
  value: string
): value is EmailAutomationTrigger {
  return (EMAIL_AUTOMATION_TRIGGERS as readonly string[]).includes(value);
}

export function getEmailAutomationTriggerDef(
  id: string
): EmailAutomationTriggerDef | undefined {
  return EMAIL_AUTOMATION_TRIGGER_DEFS.find((t) => t.id === id);
}
