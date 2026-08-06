import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformOverview } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHomeDashboard } from "@/components/admin/admin-home-dashboard";
import { auth } from "@/lib/auth-session";

export const metadata = { title: "Platform Admin" };

export default async function AdminOverviewPage() {
  await requireAdminPage();
  const [data, session] = await Promise.all([
    getPlatformOverview(),
    auth(),
  ]);

  const firstName =
    session?.user?.name?.trim().split(/\s+/)[0] ||
    session?.user?.email?.split("@")[0] ||
    "Admin";

  return (
    <AdminLayout>
      <AdminHomeDashboard data={data} userName={firstName} />
    </AdminLayout>
  );
}
