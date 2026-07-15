import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getLiveViewData, parseLiveMapRange } from "@/lib/live-view";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { LiveViewClient } from "@/components/analytics/live-view-client";

export const metadata = { title: "Live View" };

export default async function LiveViewPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const range = parseLiveMapRange(searchParams.range);
  const data = await getLiveViewData(store.id, store.currency, range);
  return (
    <DashboardLayout>
      <DashboardHeader
        title="Live view"
        description="Real-time visitors, orders, and global activity"
      />
      <DashboardPageContent>
        <LiveViewClient initial={data} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
