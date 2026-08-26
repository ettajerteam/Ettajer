import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformMessages } from "@/lib/admin/platform-stats";
import { groupSupportConversations } from "@/lib/admin/support-inbox-shared";
import { getSupportMerchantContexts } from "@/lib/admin/support-merchant-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSupportChat } from "@/components/admin/admin-support-chat";
import {
  AdminPageHeader,
  AdminStatCard,
  adminPage,
} from "@/components/admin/admin-ui";
import { SUPPORT_MESSAGE_STATUS } from "@/lib/admin/constants";

export const metadata = { title: "Support — Ettajer Console" };

export default async function AdminMessagesPage() {
  await requireAdminPage();
  const messages = await getPlatformMessages();
  const conversations = groupSupportConversations(messages);
  const unread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const reviewing = messages.filter(
    (m) => m.status === SUPPORT_MESSAGE_STATUS.REVIEWING
  ).length;
  const open = conversations.filter(
    (c) =>
      c.status === SUPPORT_MESSAGE_STATUS.NEW ||
      c.status === SUPPORT_MESSAGE_STATUS.REVIEWING ||
      c.unreadCount > 0
  ).length;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const resolvedToday = messages.filter(
    (m) =>
      m.status === SUPPORT_MESSAGE_STATUS.RESOLVED &&
      new Date(m.updatedAt) >= startOfToday
  ).length;

  const merchantContexts = await getSupportMerchantContexts(
    conversations.map((c) => c.email)
  );

  const serialized = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Support inbox"
          description="Operational threads with merchant context when the email matches a platform account."
        />

        <div className="mb-1 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Open" value={open} />
          <AdminStatCard
            label="Unanswered"
            value={unread}
            accent={unread > 0 ? "blue" : "default"}
            hint={unread > 0 ? "Needs attention" : "All caught up"}
          />
          <AdminStatCard
            label="Under review"
            value={reviewing}
            accent={reviewing > 0 ? "amber" : "default"}
            hint="Waiting on support / merchant"
          />
          <AdminStatCard
            label="Resolved today"
            value={resolvedToday}
            accent="emerald"
          />
        </div>

        <AdminSupportChat
          initialMessages={serialized}
          merchantContexts={merchantContexts}
        />
      </div>
    </AdminLayout>
  );
}
