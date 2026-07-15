import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listCoupons, serializeCoupon, getCouponStats } from "@/lib/marketing";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { MarketingClient } from "@/components/marketing/marketing-client";

export const metadata = { title: "Discounts" };

export default async function MarketingDiscountsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const [coupons, stats] = await Promise.all([
    listCoupons(store.id),
    getCouponStats(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader title="Marketing" description="Discounts, promotions, and ad platform links" />
      <DashboardPageContent>
        <MarketingClient
          initial={coupons.map(serializeCoupon)}
          stats={stats}
          currency={store.currency}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
