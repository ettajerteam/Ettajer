import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformMessages } from "@/lib/admin/platform-stats";
import { groupSupportConversations } from "@/lib/admin/support-inbox-shared";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSupportChat } from "@/components/admin/admin-support-chat";
import {
  AdminPageHeader,
  AdminStatCard,
  adminPage,
} from "@/components/admin/admin-ui";
import { SUPPORT_MESSAGE_STATUS } from "@/lib/admin/constants";

export const metadata = { title: "Messages — Platform Admin" };

export default async function AdminMessagesPage() {
  await requireAdminPage();
  const messages = await getPlatformMessages();
  const conversations = groupSupportConversations(messages);
  const unread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const reviewing = messages.filter(
    (m) => m.status === SUPPORT_MESSAGE_STATUS.REVIEWING
  ).length;

  // Serialize dates for the client component
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
          description="Live chat-style threads for every support email — filter, reply, resolve."
        />

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <AdminStatCard label="Conversations" value={conversations.length} />
          <AdminStatCard
            label="Unread"
            value={unread}
            accent={unread > 0 ? "violet" : "default"}
            hint={unread > 0 ? "Needs attention" : "All caught up"}
          />
          <AdminStatCard
            label="Under review"
            value={reviewing}
            accent={reviewing > 0 ? "amber" : "default"}
          />
        </div>

        <AdminSupportChat initialMessages={serialized} />
      </div>
    </AdminLayout>
  );
}
