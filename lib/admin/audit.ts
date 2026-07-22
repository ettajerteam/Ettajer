import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

interface AuditParams {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(params: AuditParams) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("[admin-audit] Failed to log action:", err);
  }
}

export async function getAdminAuditLog(limit = 50) {
  return prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
