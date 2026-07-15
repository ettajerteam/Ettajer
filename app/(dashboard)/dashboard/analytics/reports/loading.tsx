import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ReportsSkeleton } from "@/components/analytics/reports-skeleton";

export default function ReportsLoading() {
  return (
    <DashboardLayout>
      <ReportsSkeleton />
    </DashboardLayout>
  );
}
