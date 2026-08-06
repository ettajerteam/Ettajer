import { requireAdminPage } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminSectionTitle,
  AdminStatCard,
  AdminTableShell,
  adminPage,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Email — Platform Admin" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminEmailPage() {
  await requireAdminPage();

  const since = new Date(Date.now() - 24 * 86_400_000);

  const [
    domainCount,
    providerCount,
    failedLogs,
    queuedJobs,
    bounceEvents,
    complaintEvents,
    dailyVolume,
    providers,
    recentFailed,
  ] = await Promise.all([
    prisma.emailSendingDomain.count(),
    prisma.storeEmailProvider.count({ where: { status: "active" } }),
    prisma.emailLog.count({
      where: { status: "failed", createdAt: { gte: since } },
    }),
    prisma.emailJob.count({
      where: { status: { in: ["pending", "scheduled", "sending"] } },
    }),
    prisma.emailEvent.count({
      where: { type: "bounced", occurredAt: { gte: since } },
    }),
    prisma.emailEvent.count({
      where: { type: "complained", occurredAt: { gte: since } },
    }),
    prisma.emailLog.count({ where: { createdAt: { gte: since } } }),
    prisma.storeEmailProvider.groupBy({
      by: ["kind"],
      _count: { _all: true },
      orderBy: { _count: { kind: "desc" } },
      take: 8,
    }),
    prisma.emailLog.findMany({
      where: { status: "failed" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        toEmail: true,
        subject: true,
        provider: true,
        error: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Email infrastructure"
          description="MailHub domains, providers, queue, and failures across stores."
        />

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Connected domains" value={domainCount} />
          <AdminStatCard label="Active providers" value={providerCount} />
          <AdminStatCard
            label="Failed (24h)"
            value={failedLogs}
            accent={failedLogs > 0 ? "rose" : "default"}
          />
          <AdminStatCard label="Queued jobs" value={queuedJobs} />
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          <AdminStatCard
            label="Bounces (24h)"
            value={bounceEvents}
            accent={bounceEvents > 0 ? "amber" : "default"}
          />
          <AdminStatCard
            label="Complaints (24h)"
            value={complaintEvents}
            accent={complaintEvents > 0 ? "rose" : "default"}
          />
          <AdminStatCard label="Daily volume" value={dailyVolume} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <AdminSectionTitle title="Top providers" />
            <AdminTableShell>
              <table className="w-full text-[12px]">
                <thead className={adminThead}>
                  <tr>
                    <th className={adminTh}>Kind</th>
                    <th className={adminTh}>Stores</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.kind} className={adminTr}>
                      <td className={cn(adminTd, "capitalize")}>
                        {p.kind.replace(/_/g, " ")}
                      </td>
                      <td className={cn(adminTd, "tabular-nums")}>
                        {p._count._all}
                      </td>
                    </tr>
                  ))}
                  {providers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-6 text-center text-neutral-400"
                      >
                        No providers yet
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </AdminTableShell>
          </div>

          <div>
            <AdminSectionTitle title="Recent failures" />
            <AdminTableShell>
              <table className="w-full text-[12px]">
                <thead className={adminThead}>
                  <tr>
                    <th className={adminTh}>Recipient</th>
                    <th className={adminTh}>Provider</th>
                    <th className={adminTh}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFailed.map((row) => (
                    <tr key={row.id} className={adminTr}>
                      <td className={adminTd}>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {row.toEmail}
                        </p>
                        <p className="truncate text-[10px] text-rose-500/90">
                          {row.error || row.subject}
                        </p>
                      </td>
                      <td className={cn(adminTd, "capitalize")}>
                        {row.provider}
                      </td>
                      <td className={cn(adminTd, "text-neutral-400")}>
                        <span suppressHydrationWarning>
                          {formatDate(row.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentFailed.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-neutral-400"
                      >
                        No recent failures
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </AdminTableShell>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
