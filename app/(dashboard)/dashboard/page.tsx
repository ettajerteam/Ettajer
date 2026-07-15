import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getExecutiveDashboardData } from "@/lib/dashboard-analytics";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { HomeDashboard } from "@/components/dashboard/home/home-dashboard";
import type { DashboardRange } from "@/types/dashboard";

export const metadata = { title: "Dashboard" };

function parseRange(value?: string): DashboardRange {
  if (value === "1") return 1;
  if (value === "7") return 7;
  if (value === "365") return 365;
  return 30;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const range = parseRange(searchParams.range);
  const dashboardData = await getExecutiveDashboardData(
    store.id,
    store.name,
    store.currency,
    range,
    store.theme
  );

  const firstName = session.user.name?.split(" ")[0];

  return (
    <DashboardLayout>
      <HomeDashboard data={dashboardData} userName={firstName} />
    </DashboardLayout>
  );
}
