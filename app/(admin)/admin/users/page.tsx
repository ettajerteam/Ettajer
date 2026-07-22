import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformUsers } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { AdminPageHeader, adminPage } from "@/components/admin/admin-ui";

export const metadata = { title: "Users — Platform Admin" };

export default async function AdminUsersPage() {
  await requireAdminPage();
  const users = await getPlatformUsers();

  const rows = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    role: user.role,
    founderNumber: user.founderNumber,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    storeCount: user._count.stores,
  }));

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Users"
          description="All platform accounts. Activate founders or review merchant activity."
        />
        <AdminUsersTable users={rows} />
      </div>
    </AdminLayout>
  );
}
