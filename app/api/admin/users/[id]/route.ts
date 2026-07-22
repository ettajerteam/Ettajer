import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { USER_ROLE } from "@/lib/admin/constants";
import { USER_STATUS } from "@/lib/founder/constants";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { error, session } = await requireAdminApi();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (user.role === USER_ROLE.ADMIN && session?.user?.id !== user.id) {
    return NextResponse.json({ message: "Cannot modify another admin" }, { status: 403 });
  }

  const data: { status?: string; role?: string } = {};

  if (body.status === USER_STATUS.ACTIVE || body.status === USER_STATUS.WAITING) {
    if (user.role === USER_ROLE.ADMIN && body.status === USER_STATUS.WAITING) {
      return NextResponse.json({ message: "Cannot set admin to waiting" }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.role === USER_ROLE.MERCHANT && user.role === USER_ROLE.ADMIN) {
    if (session?.user?.id === user.id) {
      return NextResponse.json({ message: "Cannot demote yourself" }, { status: 400 });
    }
    data.role = USER_ROLE.MERCHANT;
  }

  if (!data.status && !data.role) {
    return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, status: true, role: true, email: true },
  });

  await logAdminAction({
    actorId: session!.user!.id,
    actorEmail: session!.user!.email ?? "unknown",
    action: "user.update",
    targetType: "user",
    targetId: updated.id,
    metadata: { email: updated.email, changes: data },
  });

  return NextResponse.json({ user: updated });
}
