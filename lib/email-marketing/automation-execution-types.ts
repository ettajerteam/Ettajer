import type { EmailAutomationTrigger } from "@/lib/email-marketing/triggers";
import {
  getEmailAutomationTriggerDef,
  type AutomationEntityKind,
} from "@/lib/email-marketing/triggers";

export const AUTOMATION_EXECUTION_STATUSES = [
  "pending",
  "queued",
  "sent",
  "failed",
  "skipped",
  "cancelled",
] as const;

export type AutomationExecutionStatus =
  (typeof AUTOMATION_EXECUTION_STATUSES)[number];

/** Statuses that mean this event was already handled — do not re-run. */
export const AUTOMATION_EXECUTION_PROCESSED_STATUSES: readonly AutomationExecutionStatus[] =
  ["queued", "sent", "skipped", "cancelled"];

export interface AutomationRunContext {
  subscriberId?: string | null;
  orderId?: string | null;
  cartId?: string | null;
  customerId?: string | null;
  /**
   * Optional disambiguator for the same entity (e.g. signup vs reactivate).
   * Appended to the idempotency key when set — keeps runtime generic.
   */
  occurrenceId?: string | null;
}

/**
 * Build a stable unique key from the trigger's primary entity.
 * New triggers only need an `idempotencyEntity` on their def — no runtime fork.
 */
export function buildAutomationIdempotencyKey(
  automationId: string,
  entity: AutomationEntityKind,
  ctx: AutomationRunContext
): string | null {
  let base: string | null = null;
  switch (entity) {
    case "order":
      base = ctx.orderId ? `${automationId}:order:${ctx.orderId}` : null;
      break;
    case "cart":
      base = ctx.cartId ? `${automationId}:cart:${ctx.cartId}` : null;
      break;
    case "customer":
      base = ctx.customerId
        ? `${automationId}:customer:${ctx.customerId}`
        : null;
      break;
    case "subscriber":
      base = ctx.subscriberId
        ? `${automationId}:subscriber:${ctx.subscriberId}`
        : null;
      break;
    default:
      return null;
  }
  if (!base) return null;
  if (ctx.occurrenceId?.trim()) {
    return `${base}:occ:${ctx.occurrenceId.trim()}`;
  }
  return base;
}

export function buildAutomationIdempotencyKeyForTrigger(
  automationId: string,
  trigger: EmailAutomationTrigger,
  ctx: AutomationRunContext
): string | null {
  const def = getEmailAutomationTriggerDef(trigger);
  if (!def) return null;
  return buildAutomationIdempotencyKey(automationId, def.idempotencyEntity, ctx);
}

export function isAutomationExecutionProcessed(status: string): boolean {
  return (AUTOMATION_EXECUTION_PROCESSED_STATUSES as readonly string[]).includes(
    status
  );
}
