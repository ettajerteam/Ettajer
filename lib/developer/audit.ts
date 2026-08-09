import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type DeveloperActorType = "oauth" | "api_key" | "merchant";

export async function logDeveloperAction(input: {
  applicationId?: string | null;
  userId?: string | null;
  storeId?: string | null;
  actorType: DeveloperActorType;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    await prisma.developerAuditLog.create({
      data: {
        applicationId: input.applicationId ?? undefined,
        userId: input.userId ?? undefined,
        storeId: input.storeId ?? undefined,
        actorType: input.actorType,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        metadata: (input.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        ip: input.ip ?? undefined,
      },
    });
  } catch (err) {
    console.error("[developer-audit]", err);
  }
}
