import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformUserStats } from "@/lib/admin/user-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminUserStatsTable } from "@/components/admin/admin-user-stats-table";
import {
  AdminPageHeader,
  AdminSectionTitle,
  AdminStatCard,
  adminPage,
  adminLink,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";
import { homeSubtitle } from "@/components/dashboard/home/home-ui";

export const metadata = { title: "User statistics — Platform Admin" };

export default async function AdminUserStatsPage() {
  await requireAdminPage();
  const data = await getPlatformUserStats();
  const { totals } = data;
  const cardPct =
    totals.users > 0
      ? Math.round((totals.withCard / totals.users) * 100)
      : 0;
  const trialEndedPct =
    totals.users > 0
      ? Math.round((totals.trialEnded / totals.users) * 100)
      : 0;

  // Serialize dates for the client table
  const trialRows = data.trialEndedUsers.map((u) => ({
    ...u,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
    trialEndedAt: u.trialEndedAt,
  }));

  return (
    <AdminLayout>
      <div className={adminPage}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <AdminPageHeader
            title="User statistics"
            description="Index of platform accounts — plan mix, founder-card coverage, and merchants whose first free trial month (30 days) has ended."
          />
          <Link
            href="/admin/users"
            className={cn(adminLink, "shrink-0 text-[12px] font-medium")}
          >
            ← All users
          </Link>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Total users"
            value={totals.users}
            hint={`+${totals.new7d} last 7 days`}
          />
          <AdminStatCard
            label="Active / waiting"
            value={`${totals.active} / ${totals.waiting}`}
            accent="blue"
          />
          <AdminStatCard
            label="Founder card"
            value={`${totals.withCard} / ${totals.withoutCard}`}
            hint={`${cardPct}% have a card · Yes / No`}
            accent="emerald"
          />
          <AdminStatCard
            label="Trial month ended"
            value={totals.trialEnded}
            hint={`${trialEndedPct}% of users · ${totals.trialActive} still in first month`}
            accent="amber"
          />
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Ended · has card"
            value={totals.trialEndedWithCard}
            accent="emerald"
          />
          <AdminStatCard
            label="Ended · no card"
            value={totals.trialEndedWithoutCard}
            accent="rose"
          />
          <AdminStatCard label="Free plan" value={totals.freePlan} />
          <AdminStatCard
            label="Paid plans"
            value={totals.paidPlan}
            hint={
              data.byPlan.length
                ? data.byPlan.map((p) => `${p.plan}: ${p.count}`).join(" · ")
                : undefined
            }
          />
        </div>

        <div>
          <AdminSectionTitle
            title={`First free month ended (${totals.trialEnded})`}
          />
          <p className={cn("mb-3", homeSubtitle)}>
            Users who signed up more than 30 days ago (promotional 0 DH first
            month). The Card column shows whether a founder card is assigned.
          </p>
          <AdminUserStatsTable users={trialRows} />
        </div>
      </div>
    </AdminLayout>
  );
}
