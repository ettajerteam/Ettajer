import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

interface PlatformErrorParams {
  source: string;
  message: string;
  stack?: string;
  path?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/** Next.js build/static analysis noise — not real runtime failures. */
function isBenignFrameworkNoise(message: string): boolean {
  return (
    /couldn't be rendered statically/i.test(message) ||
    /Dynamic server usage/i.test(message) ||
    /unexpected end of json input/i.test(message)
  );
}

export async function logPlatformError(params: PlatformErrorParams) {
  if (isBenignFrameworkNoise(params.message)) {
    return;
  }

  try {
    await prisma.platformError.create({
      data: {
        source: params.source,
        message: params.message.slice(0, 4000),
        stack: params.stack?.slice(0, 8000) ?? null,
        path: params.path ?? null,
        userId: params.userId ?? null,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("[platform-error] Failed to persist error:", err);
  }
}

export async function getPlatformAppErrors(limit = 50) {
  return prisma.platformError.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
