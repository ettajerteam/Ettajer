import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { HomeDashboardSkeleton } from "@/components/dashboard/home/home-dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <HomeDashboardSkeleton />
    </DashboardLayout>
  );
}
