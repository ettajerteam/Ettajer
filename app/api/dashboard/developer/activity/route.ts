import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const store = await getAuthenticatedStore();
  if (!session?.user?.id || !store) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.developerAuditLog.findMany({
    where: {
      OR: [{ storeId: store.id }, { userId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      application: { select: { name: true } },
    },
  });

  return NextResponse.json({
    activity: logs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      actorType: log.actorType,
      applicationName: log.application?.name ?? null,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
    })),
  });
}
