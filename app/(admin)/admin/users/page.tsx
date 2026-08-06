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
    image: user.image,
    status: user.status,
    role: user.role,
    founderNumber: user.founderNumber,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    lastLoginIp: user.lastLoginIp,
    failedLoginAttempts: user.failedLoginAttempts,
    lockedUntil: user.lockedUntil,
    createdAt: user.createdAt,
    storeCount: user._count.stores,
    productCount: user.stores.reduce((n, s) => n + s._count.products, 0),
    orderCount: user.stores.reduce((n, s) => n + s._count.orders, 0),
  }));

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Users"
          description="Every platform account — filter by status or role, then open a profile for stores, logins, and support."
        />
        <AdminUsersTable users={rows} />
      </div>
    </AdminLayout>
  );
}
