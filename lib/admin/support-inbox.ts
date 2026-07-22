import { prisma } from "@/lib/db";
import { SUPPORT_MESSAGE_DIRECTION } from "@/lib/admin/constants";
import type { SupportMessageRow } from "@/lib/admin/support-inbox-shared";

export type { SupportMessageRow, SupportConversation } from "@/lib/admin/support-inbox-shared";
export { groupSupportConversations } from "@/lib/admin/support-inbox-shared";

export async function getPlatformMessages(): Promise<SupportMessageRow[]> {
  const rows = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    ...row,
    direction: row.direction || SUPPORT_MESSAGE_DIRECTION.INBOUND,
  }));
}
