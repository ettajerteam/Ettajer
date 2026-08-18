import { prisma } from "@/lib/db";
import { SUPPORT_MESSAGE_DIRECTION } from "@/lib/admin/constants";
import type { SupportMessageRow } from "@/lib/admin/support-inbox-shared";

export type { SupportMessageRow, SupportConversation } from "@/lib/admin/support-inbox-shared";
export { groupSupportConversations } from "@/lib/admin/support-inbox-shared";

export async function getPlatformMessages(): Promise<SupportMessageRow[]> {
  const rows = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "asc" },
  });

  const emails = Array.from(
    new Set(rows.map((row) => row.email.trim().toLowerCase()).filter(Boolean))
  );

  const users =
    emails.length === 0
      ? []
      : await prisma.user.findMany({
          where: { email: { in: emails } },
          select: { email: true, name: true },
        });

  const nameByEmail = new Map(
    users.map((user) => [
      user.email.trim().toLowerCase(),
      user.name?.trim() || null,
    ])
  );

  return rows.map((row) => {
    const emailKey = row.email.trim().toLowerCase();
    return {
      ...row,
      direction: row.direction || SUPPORT_MESSAGE_DIRECTION.INBOUND,
      customerName: nameByEmail.get(emailKey) ?? null,
    };
  });
}
