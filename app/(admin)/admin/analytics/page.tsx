import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformAnalytics } from "@/lib/admin/platform-stats";
import { parseAdminAnalyticsRange } from "@/lib/admin/platform-intelligence";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminIntelligenceDashboard } from "@/components/admin/admin-intelligence-dashboard";

export const metadata = { title: "Intelligence — Platform Admin" };

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  await requireAdminPage();
  const range = parseAdminAnalyticsRange(searchParams?.range);
  const data = await getPlatformAnalytics(range);

  return (
    <AdminLayout>
      <AdminIntelligenceDashboard data={data} />
    </AdminLayout>
  );
}
