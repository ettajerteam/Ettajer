import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getReportsData, parseReportRange } from "@/lib/reports";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ReportsClient } from "@/components/analytics/reports-client";

export const metadata = { title: "Reports" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const range = parseReportRange(searchParams.range);
  const data = await getReportsData(store.id, store.currency, range);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Reports"
        description="Sales performance, products, and regional insights"
      />
      <DashboardPageContent>
        <ReportsClient data={data} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
