import { prisma } from "@/lib/db";
import {
  AUTOMATION_EXECUTION_PROCESSED_STATUSES,
  buildAutomationIdempotencyKeyForTrigger,
  isAutomationExecutionProcessed,
  type AutomationRunContext,
  type AutomationExecutionStatus,
} from "@/lib/email-marketing/automation-execution-types";
import type { EmailAutomationTrigger } from "@/lib/email-marketing/triggers";

export type {
  AutomationRunContext,
  AutomationExecutionStatus,
} from "@/lib/email-marketing/automation-execution-types";

export {
  buildAutomationIdempotencyKey,
  buildAutomationIdempotencyKeyForTrigger,
  isAutomationExecutionProcessed,
} from "@/lib/email-marketing/automation-execution-types";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

/**
 * Resolve optional entity IDs from email when callers omit them.
 * Does not invent order/cart IDs — those must come from the trigger event.
 */
export async function enrichAutomationContext(input: {
  storeId: string;
  to: string;
  context?: AutomationRunContext;
}): Promise<AutomationRunContext> {
  const ctx: AutomationRunContext = { ...(input.context ?? {}) };
  const email = input.to.trim().toLowerCase();
  if (!email) return ctx;

  if (!ctx.subscriberId || !ctx.customerId) {
    const [subscriber, customer] = await Promise.all([
      ctx.subscriberId
        ? Promise.resolve(null)
        : prisma.newsletterSubscriber.findUnique({
            where: {
              storeId_email: { storeId: input.storeId, email },
            },
            select: { id: true },
          }),
      ctx.customerId
        ? Promise.resolve(null)
        : prisma.customer.findUnique({
            where: {
              storeId_email: { storeId: input.storeId, email },
            },
            select: { id: true },
          }),
    ]);
    if (!ctx.subscriberId && subscriber) ctx.subscriberId = subscriber.id;
    if (!ctx.customerId && customer) ctx.customerId = customer.id;
  }

  return ctx;
}

export type ClaimAutomationExecutionResult =
  | {
      claimed: true;
      execution: {
        id: string;
        status: string;
        idempotencyKey: string;
      };
    }
  | {
      claimed: false;
      reason: "already_processed" | "missing_context";
      execution?: { id: string; status: string; idempotencyKey: string };
    };

/**
 * Atomically claim an automation execution.
 * If a processed row already exists for this event → skip.
 * Failed executions may be reclaimed for retry.
 */
export async function claimAutomationExecution(input: {
  storeId: string;
  automationId: string;
  trigger: EmailAutomationTrigger;
  context: AutomationRunContext;
}): Promise<ClaimAutomationExecutionResult> {
  const idempotencyKey = buildAutomationIdempotencyKeyForTrigger(
    input.automationId,
    input.trigger,
    input.context
  );
  if (!idempotencyKey) {
    return { claimed: false, reason: "missing_context" };
  }

  const existing = await prisma.automationExecution.findUnique({
    where: { idempotencyKey },
    select: { id: true, status: true, idempotencyKey: true },
  });

  if (existing) {
    if (existing.status === "failed" || existing.status === "pending") {
      const updated = await prisma.automationExecution.update({
        where: { id: existing.id },
        data: {
          status: "pending",
          lastError: null,
          sentAt: null,
          subscriberId: input.context.subscriberId ?? undefined,
          orderId: input.context.orderId ?? undefined,
          cartId: input.context.cartId ?? undefined,
          customerId: input.context.customerId ?? undefined,
        },
        select: { id: true, status: true, idempotencyKey: true },
      });
      return { claimed: true, execution: updated };
    }

    if (isAutomationExecutionProcessed(existing.status)) {
      return {
        claimed: false,
        reason: "already_processed",
        execution: existing,
      };
    }
  }

  try {
    const created = await prisma.automationExecution.create({
      data: {
        storeId: input.storeId,
        automationId: input.automationId,
        subscriberId: input.context.subscriberId ?? null,
        orderId: input.context.orderId ?? null,
        cartId: input.context.cartId ?? null,
        customerId: input.context.customerId ?? null,
        status: "pending",
        idempotencyKey,
      },
      select: { id: true, status: true, idempotencyKey: true },
    });
    return { claimed: true, execution: created };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;

    const raced = await prisma.automationExecution.findUnique({
      where: { idempotencyKey },
      select: { id: true, status: true, idempotencyKey: true },
    });
    if (!raced) throw error;

    if (raced.status === "failed" || raced.status === "pending") {
      const updated = await prisma.automationExecution.update({
        where: { id: raced.id },
        data: { status: "pending", lastError: null, sentAt: null },
        select: { id: true, status: true, idempotencyKey: true },
      });
      return { claimed: true, execution: updated };
    }

    return {
      claimed: false,
      reason: "already_processed",
      execution: raced,
    };
  }
}

export async function markAutomationExecutionStatus(
  executionId: string,
  status: AutomationExecutionStatus,
  extra?: { lastError?: string | null; sentAt?: Date | null }
) {
  return prisma.automationExecution.update({
    where: { id: executionId },
    data: {
      status,
      ...(extra?.lastError !== undefined ? { lastError: extra.lastError } : {}),
      ...(extra?.sentAt !== undefined ? { sentAt: extra.sentAt } : {}),
      ...(status === "sent" && extra?.sentAt === undefined
        ? { sentAt: new Date() }
        : {}),
    },
  });
}

export async function markAutomationExecutionQueued(executionId: string) {
  return markAutomationExecutionStatus(executionId, "queued");
}

export async function markAutomationExecutionSent(executionId: string) {
  return markAutomationExecutionStatus(executionId, "sent", {
    sentAt: new Date(),
    lastError: null,
  });
}

export async function markAutomationExecutionFailed(
  executionId: string,
  error: string
) {
  return markAutomationExecutionStatus(executionId, "failed", {
    lastError: error.slice(0, 2000),
  });
}

export async function markAutomationExecutionSkipped(
  executionId: string,
  reason: string
) {
  return markAutomationExecutionStatus(executionId, "skipped", {
    lastError: reason.slice(0, 2000),
  });
}

/** Used by worker / cancel paths */
export function isProcessedAutomationStatus(status: string): boolean {
  return (AUTOMATION_EXECUTION_PROCESSED_STATUSES as readonly string[]).includes(
    status
  );
}
