import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformUsers } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import {
  AdminPageHeader,
  adminLink,
  adminPage,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <AdminPageHeader
            title="Users"
            description="Every platform account — filter by status or role, then open a profile for stores, logins, and support."
          />
          <Link
            href="/admin/users/stats"
            className={cn(adminLink, "shrink-0 text-[12px] font-medium")}
          >
            User statistics →
          </Link>
        </div>
        <AdminUsersTable users={rows} />
      </div>
    </AdminLayout>
  );
}
