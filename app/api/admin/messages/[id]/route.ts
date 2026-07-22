import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { SUPPORT_MESSAGE_STATUS } from "@/lib/admin/constants";

const VALID_STATUSES = new Set([
  SUPPORT_MESSAGE_STATUS.NEW,
  SUPPORT_MESSAGE_STATUS.REVIEWING,
  SUPPORT_MESSAGE_STATUS.READ,
  SUPPORT_MESSAGE_STATUS.ARCHIVED,
  SUPPORT_MESSAGE_STATUS.RESOLVED,
]);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { error, session } = await requireAdminApi();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  if (!VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  const message = await prisma.supportMessage.update({
    where: { id: params.id },
    data: { status: body.status },
  });

  await logAdminAction({
    actorId: session!.user!.id,
    actorEmail: session!.user!.email ?? "unknown",
    action: "message.update",
    targetType: "support_message",
    targetId: message.id,
    metadata: { status: body.status, from: message.email },
  });

  return NextResponse.json({ message });
}
