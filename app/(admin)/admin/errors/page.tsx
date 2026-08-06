import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformErrors } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminEmptyState,
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
import { homeCard, homeCardPad } from "@/components/dashboard/home/home-ui";

export const metadata = { title: "Errors — Platform Admin" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminErrorsPage() {
  await requireAdminPage();
  const { loginErrors, appErrors } = await getPlatformErrors();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Errors & security"
          description="Failed logins and application errors across the platform."
        />

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <AdminStatCard
            label="App errors"
            value={appErrors.length}
            accent={appErrors.length > 0 ? "rose" : "default"}
            hint="Recent recorded"
          />
          <AdminStatCard
            label="Failed logins"
            value={loginErrors.length}
            accent={loginErrors.length > 0 ? "amber" : "default"}
            hint="Latest attempts"
          />
          <AdminStatCard
            label="Status"
            value={appErrors.length + loginErrors.length === 0 ? "Clear" : "Needs review"}
            accent={
              appErrors.length + loginErrors.length === 0 ? "emerald" : "rose"
            }
          />
        </div>

        <section>
          <AdminSectionTitle title="Application errors" />
          {appErrors.length === 0 ? (
            <AdminEmptyState message="No application errors recorded." />
          ) : (
            <div className="space-y-2">
              {appErrors.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    homeCard,
                    homeCardPad,
                    "border-rose-200/70 dark:border-rose-500/20"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold text-rose-700 dark:text-rose-300">
                      {row.source}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {formatDate(row.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-[12px] text-neutral-700 dark:text-neutral-300">
                    {row.message}
                  </p>
                  {row.path ? (
                    <p className="mt-1 font-mono text-[10px] text-neutral-400">
                      {row.path}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <AdminSectionTitle title="Failed login attempts" />
          {loginErrors.length === 0 ? (
            <AdminEmptyState message="No failed login attempts recorded." />
          ) : (
            <AdminTableShell>
              <table className="w-full min-w-[920px] text-left text-[12px]">
                <thead className={adminThead}>
                  <tr>
                    <th className={adminTh}>Email</th>
                    <th className={adminTh}>Reason</th>
                    <th className={adminTh}>IP</th>
                    <th className={adminTh}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {loginErrors.map((row) => (
                    <tr key={row.id} className={adminTr}>
                      <td className={adminTd}>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {row.email}
                        </p>
                        {row.user?.name ? (
                          <p className="text-[11px] text-neutral-400">
                            {row.user.name}
                          </p>
                        ) : null}
                      </td>
                      <td className={cn(adminTd, "text-[11px] text-rose-600")}>
                        {row.reason ?? row.action}
                      </td>
                      <td className={cn(adminTd, "font-mono text-[11px]")}>
                        {row.ipAddress ?? "—"}
                      </td>
                      <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                        {formatDate(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableShell>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
